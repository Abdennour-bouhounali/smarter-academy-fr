<?php

namespace App\Domain\School;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\JoinLinkToken;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\School;
use App\Models\SchoolTeacher;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les ENSEIGNANTS d'un établissement (SCHOOL_ADMIN_SPACE.md §7, phase 3).
 *
 * Un enseignant rejoint par le lien de l'établissement, APRÈS avoir lu ce que
 * la direction verra de lui (TeacherActivityFacts) — le geste est le bouton,
 * comme pour un élève qui rejoint une classe. Un enseignant n'appartient qu'à
 * un établissement à la fois. Rejoindre rattache toutes ses classes actives,
 * et leurs élèves qui l'ont accepté entrent avec elles (2026-10-28).
 *
 * Partir (ou être détaché par le directeur) rend ses classes à lui seul :
 * `school_id` est effacé, et le consentement des élèves envers CET
 * établissement aussi — un autre établissement devra le redemander.
 */
class SchoolTeacherService
{
    public function __construct(private ActivityLogger $logger) {}

    /** L'établissement ACTIF de l'enseignant, s'il en a un. */
    public static function schoolOfTeacher(User $teacher): ?School
    {
        $row = SchoolTeacher::with('school')
            ->where('teacher_id', $teacher->id)
            ->where('status', SchoolTeacher::STATUS_ACTIVE)
            ->first();

        return $row?->school?->isActive() ? $row->school : null;
    }

    /** @throws SchoolException */
    public function schoolForLink(?string $token): School
    {
        $school = JoinLinkToken::isWellFormed($token) ? School::where('teacher_join_token', $token)->first() : null;
        if ($school === null || ! $school->isActive()) {
            throw new SchoolException(SchoolException::INVALID_LINK, 'Lien d\'établissement invalide.');
        }

        return $school;
    }

    /** @throws SchoolException */
    public function join(User $teacher, ?string $token, bool $consented): School
    {
        if (! $consented) {
            throw new SchoolException(SchoolException::CONSENT_REQUIRED, 'Le partage avec l\'établissement doit être accepté.');
        }
        $school = $this->schoolForLink($token);

        return DB::transaction(function () use ($teacher, $school) {
            User::whereKey($teacher->id)->lockForUpdate()->first();
            $current = self::schoolOfTeacher($teacher);
            if ($current !== null && $current->id === $school->id) {
                return $school;
            }
            if ($current !== null) {
                throw new SchoolException(SchoolException::ALREADY_IN_SCHOOL, 'Vous êtes déjà rattaché à un établissement.');
            }

            $row = SchoolTeacher::firstOrNew(['school_id' => $school->id, 'teacher_id' => $teacher->id]);
            $row->school_id = $school->id;
            $row->teacher_id = $teacher->id;
            $row->forceFill(['status' => SchoolTeacher::STATUS_ACTIVE, 'joined_at' => Carbon::now(), 'left_at' => null])->save();

            // Le lien fait entrer l'enseignant AVEC ses classes et leurs élèves
            // (owner, 2026-10-28). Résolu ici : SchoolClassroomService dépend
            // déjà de ce service, l'injecter ferait un cycle.
            $classIds = app(SchoolClassroomService::class)->attachAllOf($teacher, $school);

            $this->logger->log($teacher, ActivityLogger::SCHOOL_TEACHER_JOINED, 'school', $school->id, null, [
                'teacherId' => $teacher->id, 'classIds' => $classIds,
            ]);

            return $school;
        });
    }

    /** L'enseignant s'en va de lui-même. @throws SchoolException */
    public function leave(User $teacher): void
    {
        $school = self::schoolOfTeacher($teacher);
        if ($school === null) {
            throw new SchoolException(SchoolException::NOT_IN_SCHOOL, 'Vous n\'êtes rattaché à aucun établissement.');
        }
        $this->release($teacher, $teacher, $school);
    }

    /** Le directeur détache un enseignant. @throws SchoolException */
    public function detach(User $director, School $school, int $teacherId): void
    {
        $teacher = $this->activeTeacher($school, $teacherId);
        $this->release($director, $teacher, $school);
    }

    public function rotateJoinLink(User $director, School $school): School
    {
        $school->forceFill(['teacher_join_token' => JoinLinkToken::generate()])->save();
        $this->logger->log($director, ActivityLogger::SCHOOL_TEACHER_LINK_ROTATED, 'school', $school->id);

        return $school;
    }

    /**
     * L'enseignant, s'il est rattaché ACTIVEMENT à cet établissement.
     *
     * @throws SchoolException
     */
    public function activeTeacher(School $school, int $teacherId): User
    {
        $isMember = SchoolTeacher::where('school_id', $school->id)
            ->where('teacher_id', $teacherId)
            ->where('status', SchoolTeacher::STATUS_ACTIVE)
            ->exists();
        $teacher = $isMember ? User::find($teacherId) : null;
        if ($teacher === null || ! $teacher->isTeacher()) {
            throw new SchoolException(SchoolException::TEACHER_NOT_IN_SCHOOL, 'Cet enseignant n\'est pas dans l\'établissement.');
        }

        return $teacher;
    }

    /** @return array<int, array<string, mixed>> les enseignants actifs, avec leurs faits */
    public function list(School $school): array
    {
        return SchoolTeacher::with('teacher:id,first_name,last_name,last_activity_at')
            ->where('school_id', $school->id)
            ->where('status', SchoolTeacher::STATUS_ACTIVE)
            ->orderBy('joined_at')
            ->get()
            ->filter(fn (SchoolTeacher $row) => $row->teacher !== null)
            ->map(fn (SchoolTeacher $row) => [
                'id' => $row->teacher->id,
                'firstName' => $row->teacher->first_name,
                'lastName' => $row->teacher->last_name,
                'joinedAt' => optional($row->joined_at)->toIso8601String(),
                'facts' => TeacherActivityFacts::for($row->teacher, $school),
            ])
            ->values()
            ->all();
    }

    private function release(User $actor, User $teacher, School $school): void
    {
        DB::transaction(function () use ($actor, $teacher, $school) {
            SchoolTeacher::where('school_id', $school->id)
                ->where('teacher_id', $teacher->id)
                ->update(['status' => SchoolTeacher::STATUS_LEFT, 'left_at' => Carbon::now()]);

            $classIds = Classroom::where('teacher_id', $teacher->id)->where('school_id', $school->id)->pluck('id');
            ClassroomMembership::whereIn('classroom_id', $classIds)
                ->update(['school_consent_at' => null, 'school_consent_by' => null]);
            Classroom::whereIn('id', $classIds)->update(['school_id' => null]);

            $this->logger->log($actor, ActivityLogger::SCHOOL_TEACHER_LEFT, 'school', $school->id, null, [
                'teacherId' => $teacher->id, 'classIds' => $classIds->all(),
            ]);
        });
    }
}
