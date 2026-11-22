<?php

namespace App\Domain\Classroom;

use App\Domain\Access\EntitlementService;
use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\School\SchoolCapacityService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * L'appartenance : rejoindre, quitter, retirer.
 *
 * Deux portes, UNE serrure : le code de classe (joinByCode) et le lien de
 * classe (joinByLink) aboutissent tous deux à `join()` — même consentement,
 * même capacité, même ligne unique (classe, élève). Il n'existe pas de
 * second système d'adhésion.
 *
 * La CAPACITÉ est vérifiée ICI, au moment de rejoindre, sous verrou de la
 * classe ET de l'enseignant — jamais dans un contrôleur, jamais avec un
 * nombre en dur. Deux limites de nature différente :
 *   — les sièges (TeacherCapacityService) : la capacité COMMERCIALE, comptée
 *     en élèves DISTINCTS chez cet enseignant, toutes classes confondues ;
 *   — les élèves par classe : un garde-fou technique, s'il est configuré.
 * Le verrou sur la ligne de l'enseignant sérialise les adhésions de toutes
 * ses classes : deux élèves qui rejoignent deux classes au même instant ne
 * franchissent pas la capacité ensemble.
 *
 * UNE classe par élève : un élève membre actif d'une classe active n'en
 * rejoint pas une seconde (`already_in_class`) — il quitte d'abord la
 * sienne. Vérifié ici, sous le verrou de la ligne de l'ÉLÈVE, pour que deux
 * adhésions simultanées dans deux classes ne passent pas ensemble.
 *
 * Retirer ou quitter ne touche à RIEN d'autre que la ligne d'adhésion :
 * progression, tentatives, maîtrise, cahier restent à l'élève.
 */
class ClassroomMembershipService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private TeacherCapacityService $capacity,
        private EntitlementService $access,
        private StudyContextService $context,
        private ActivityLogger $log,
        private SchoolCapacityService $schoolCapacity,
    ) {}

    /** @throws ClassroomException */
    public function joinByCode(User $student, ?string $rawCode, bool $consented = false): ClassroomMembership
    {
        $code = JoinCode::normalize($rawCode);
        if ($code === null) {
            throw new ClassroomException(ClassroomException::INVALID, 'Code de classe invalide.');
        }

        $classroom = Classroom::where('join_code', $code)->first();
        if ($classroom === null || ! $classroom->join_code_enabled) {
            throw new ClassroomException(ClassroomException::INVALID, 'Code de classe invalide.');
        }

        return $this->join($student, $classroom, ClassroomMembership::VIA_JOIN_CODE, $consented);
    }

    /**
     * La classe ACTIVE dont l'élève est déjà membre actif, hors `$except` —
     * celle qui l'empêche d'en rejoindre une autre. Une adhésion dans une
     * classe archivée ou suspendue ne compte pas : l'élève ne la voit plus
     * dans « قسمي » et ne pourrait pas la quitter.
     */
    public function currentClassroomOf(User $student, ?int $except = null): ?Classroom
    {
        return Classroom::where('status', Classroom::STATUS_ACTIVE)
            ->when($except !== null, fn ($q) => $q->whereKeyNot($except))
            ->whereHas('memberships', fn ($q) => $q->where('student_id', $student->id)->active())
            ->orderByDesc('id')
            ->first();
    }

    /**
     * La classe que désigne un lien, ou un refus. Rien sur la classe ne fuit
     * d'un jeton inconnu : mal formé et inexistant répondent pareil.
     *
     * @throws ClassroomException
     */
    public function classroomForLink(?string $token): Classroom
    {
        if (! JoinLinkToken::isWellFormed($token)) {
            throw new ClassroomException(ClassroomException::INVALID, 'Lien de classe invalide.');
        }

        $classroom = Classroom::where('join_link_token', $token)->with('teacher:id,first_name,last_name')->first();
        if ($classroom === null) {
            throw new ClassroomException(ClassroomException::INVALID, 'Lien de classe invalide.');
        }

        return $classroom;
    }

    /**
     * Rejoindre par le LIEN de classe — IDEMPOTENT.
     *
     * Un élève déjà membre actif reçoit sa ligne telle quelle
     * (`alreadyMember: true`) : rouvrir le lien n'est ni une erreur ni une
     * seconde adhésion, et ne redemande pas le consentement — rien de
     * nouveau n'est partagé. L'ordre compte : un membre garde l'accès à sa
     * classe même si l'enseignant a fermé les adhésions depuis.
     *
     * @return array{membership: ClassroomMembership, alreadyMember: bool}
     *
     * @throws ClassroomException
     */
    public function joinByLink(User $student, ?string $token, bool $consented = false): array
    {
        $classroom = $this->classroomForLink($token);

        if (! $student->isStudent()) {
            throw new ClassroomException(ClassroomException::NOT_A_STUDENT, 'Seul un compte élève peut rejoindre une classe.');
        }

        $existing = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->active()
            ->first();
        if ($existing !== null) {
            return ['membership' => $existing, 'alreadyMember' => true];
        }

        if (! $classroom->acceptsNewMembers()) {
            throw new ClassroomException(ClassroomException::JOINING_CLOSED, 'Cette classe n\'accepte plus de nouvel élève.');
        }

        try {
            $membership = $this->join($student, $classroom, ClassroomMembership::VIA_JOIN_LINK, $consented);
        } catch (ClassroomException $e) {
            // Deux onglets, deux clics : le second arrive après le premier
            // sous le verrou. Même réponse que ci-dessus, pas une erreur.
            if ($e->reason !== ClassroomException::ALREADY_MEMBER) {
                throw $e;
            }
            $membership = ClassroomMembership::where('classroom_id', $classroom->id)->where('student_id', $student->id)->firstOrFail();

            return ['membership' => $membership, 'alreadyMember' => true];
        }

        return ['membership' => $membership, 'alreadyMember' => false];
    }

    /**
     * Rejoindre — le geste commun au code et au lien.
     *
     * `$consented` : l'élève a accepté, par un geste explicite, le texte de
     * partage (ce que son enseignant lira). Sans lui, on ne rejoint pas : le
     * partage n'est jamais un effet de bord d'un lien ouvert.
     *
     * @throws ClassroomException
     */
    public function join(User $student, Classroom $classroom, string $via, bool $consented = false): ClassroomMembership
    {
        if (! $student->isStudent()) {
            throw new ClassroomException(ClassroomException::NOT_A_STUDENT, 'Seul un compte élève peut rejoindre une classe.');
        }
        if (! $consented) {
            throw new ClassroomException(ClassroomException::CONSENT_REQUIRED, 'Le partage avec l\'enseignant doit être accepté.');
        }

        return $this->admit($student, $classroom, $via, studentConsented: true);
    }

    /**
     * La DIRECTION inscrit un élève dans une classe de son établissement
     * (SCHOOL_ADMIN_SPACE.md, décision D2). Même porte que `join()` — une classe
     * par élève, capacité, ligne unique — sans le geste de l'élève : le
     * consentement de l'ÉTABLISSEMENT est enregistré (`school`), et celui du
     * texte de partage reste à donner (« قسمي » le demandera, sans bloquer).
     *
     * @throws ClassroomException
     */
    public function enrolBySchool(User $student, Classroom $classroom): ClassroomMembership
    {
        if ($classroom->school_id === null) {
            throw new ClassroomException(ClassroomException::INVALID, 'Cette classe n\'appartient à aucun établissement.');
        }

        return $this->admit($student, $classroom, ClassroomMembership::VIA_SCHOOL_ENROLMENT, studentConsented: false);
    }

    /**
     * L'élève confirme que l'ÉTABLISSEMENT de sa classe peut lire son
     * apprentissage (classe rattachée après son adhésion, ou inscrit par la
     * direction).
     *
     * @throws ClassroomException
     */
    public function confirmSchoolConsent(User $student, Classroom $classroom): ClassroomMembership
    {
        $membership = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', ClassroomMembership::STATUS_ACTIVE)
            ->first();

        if ($membership === null || $classroom->school_id === null) {
            throw new ClassroomException(ClassroomException::NOT_MEMBER, 'Vous n\'êtes pas dans une classe d\'établissement.');
        }

        if ($membership->school_consent_by !== ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT) {
            $membership->forceFill([
                'school_consent_at' => Carbon::now(),
                'school_consent_by' => ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT,
            ])->save();

            $this->log->log($student, ActivityLogger::CLASSROOM_MEMBER_SCHOOL_CONSENTED, 'classroom', $classroom->id, null, [
                'student_id' => $student->id, 'school_id' => $classroom->school_id,
            ]);
            $this->context->forget($student);
        }

        return $membership;
    }

    /**
     * La seule écriture d'une adhésion. `$studentConsented` : l'élève a fait
     * le geste (`join`), ou c'est la direction qui inscrit (`enrolBySchool`).
     *
     * @throws ClassroomException
     */
    private function admit(User $student, Classroom $classroom, string $via, bool $studentConsented): ClassroomMembership
    {
        if (! $student->isStudent()) {
            throw new ClassroomException(ClassroomException::NOT_A_STUDENT, 'Seul un compte élève peut rejoindre une classe.');
        }

        return DB::transaction(function () use ($student, $classroom, $via, $studentConsented) {
            // Verrou sur la classe, puis sur l'ENSEIGNANT : la capacité se
            // compte sur toutes ses classes, donc deux adhésions simultanées
            // dans deux classes différentes doivent aussi se sérialiser.
            $classroom = Classroom::whereKey($classroom->id)->lockForUpdate()->firstOrFail();
            User::whereKey($classroom->teacher_id)->lockForUpdate()->first();

            if (! $classroom->isActive()) {
                throw new ClassroomException(ClassroomException::CLASS_INACTIVE, 'Cette classe n\'accepte plus d\'élèves.');
            }

            $existing = ClassroomMembership::where('classroom_id', $classroom->id)
                ->where('student_id', $student->id)
                ->first();

            if ($existing !== null && $existing->isActive()) {
                throw new ClassroomException(ClassroomException::ALREADY_MEMBER, 'Vous êtes déjà dans cette classe.');
            }

            // Une classe à la fois. Le verrou sur l'élève sérialise ses
            // adhésions : deux onglets, deux classes, une seule passe.
            User::whereKey($student->id)->lockForUpdate()->first();
            if ($this->currentClassroomOf($student, except: $classroom->id) !== null) {
                throw new ClassroomException(ClassroomException::ALREADY_IN_CLASS, 'Vous êtes déjà dans une autre classe.');
            }

            $teacher = $classroom->teacher;
            $this->assertCapacity($teacher, $classroom, $student);

            $now = Carbon::now();

            // Le partage avec l'enseignant : le geste de l'élève, sinon rien
            // (inscription par la direction — « قسمي » le redemandera).
            // Le partage avec l'ÉTABLISSEMENT, si la classe en a un : le geste
            // de l'élève — la page du LIEN nomme l'établissement, et depuis le
            // 2026-10-28 le texte partagé (lien ET code) annonce le rattachement
            // automatique (`school_auto_consent_since`) ; ou l'inscription par
            // la direction (`school`). Un consentement sur un texte plus ancien
            // par le CODE n'enregistre rien : « قسمي » le demande ensuite.
            $schoolConsentBy = match (true) {
                $classroom->school_id === null => null,
                ! $studentConsented => ClassroomMembership::SCHOOL_CONSENT_BY_SCHOOL,
                $via === ClassroomMembership::VIA_JOIN_LINK => ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT,
                strcmp((string) config('classroom.consent_version'), (string) config('classroom.school_auto_consent_since')) >= 0 => ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT,
                default => null,
            };
            $consent = [
                'consented_at' => $studentConsented ? $now : null,
                'consent_version' => $studentConsented ? (string) config('classroom.consent_version') : null,
                'school_consent_at' => $schoolConsentBy !== null ? $now : null,
                'school_consent_by' => $schoolConsentBy,
            ];

            if ($existing !== null) {
                // Revenir réactive la ligne : l'histoire « parti en mars,
                // revenu en avril » reste lisible, sans doublon.
                $existing->forceFill([
                    'status' => ClassroomMembership::STATUS_ACTIVE,
                    'joined_at' => $now,
                    'left_at' => null,
                    'joined_via' => $via,
                    'invitation_id' => null,
                    'removed_by' => null,
                    ...$consent,
                ])->save();
                $membership = $existing;
            } else {
                $membership = new ClassroomMembership([
                    'status' => ClassroomMembership::STATUS_ACTIVE,
                    'joined_at' => $now,
                    'joined_via' => $via,
                ]);
                $membership->classroom_id = $classroom->id;
                $membership->student_id = $student->id;
                $membership->forceFill($consent);
                $membership->save();
            }

            // Un élève qui n'a pas encore choisi sa classe scolaire (arrivé
            // par le lien, compte tout neuf) prend celle du قسم qu'il rejoint :
            // c'est la réponse que l'accueil lui demanderait, et il la change
            // depuis son profil. Une classe déjà choisie n'est jamais touchée.
            if ($student->grade === null || $student->grade === '') {
                $student->forceFill(['grade' => $classroom->grade])->save();
            }

            $this->log->log($student, ActivityLogger::CLASSROOM_MEMBER_JOINED, 'classroom', $classroom->id, null, [
                'student_id' => $student->id, 'via' => $via,
            ]);

            $this->afterChange($student, $teacher);

            return $membership;
        });
    }

    /**
     * L'élève confirme le texte de partage ACTUEL pour une classe dont il est
     * déjà membre (adhésion antérieure au texte, ou texte changé depuis).
     *
     * @throws ClassroomException
     */
    public function confirmConsent(User $student, Classroom $classroom): ClassroomMembership
    {
        $membership = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', ClassroomMembership::STATUS_ACTIVE)
            ->first();

        if ($membership === null) {
            throw new ClassroomException(ClassroomException::NOT_MEMBER, 'Vous n\'êtes pas dans cette classe.');
        }

        if (! $membership->hasCurrentConsent()) {
            $membership->forceFill([
                'consented_at' => Carbon::now(),
                'consent_version' => (string) config('classroom.consent_version'),
            ]);
            // Le texte accepté annonce l'établissement (2026-10-28) : une classe
            // déjà rattachée le reçoit avec.
            if ($classroom->school_id !== null && $membership->school_consent_at === null && $membership->coversFutureSchool()) {
                $membership->forceFill([
                    'school_consent_at' => Carbon::now(),
                    'school_consent_by' => ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT,
                ]);
            }
            $membership->save();

            $this->log->log($student, ActivityLogger::CLASSROOM_MEMBER_CONSENTED, 'classroom', $classroom->id, null, [
                'student_id' => $student->id, 'version' => $membership->consent_version,
            ]);
            $this->context->forget($student);
        }

        return $membership;
    }

    /** L'élève s'en va de lui-même. Son historique reste. */
    public function leave(User $student, Classroom $classroom): ClassroomMembership
    {
        $membership = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $student->id)
            ->where('status', ClassroomMembership::STATUS_ACTIVE)
            ->first();

        if ($membership === null) {
            throw new ClassroomException(ClassroomException::NOT_MEMBER, 'Vous n\'êtes pas dans cette classe.');
        }

        $membership->forceFill(['status' => ClassroomMembership::STATUS_LEFT, 'left_at' => Carbon::now()])->save();

        $this->log->log($student, ActivityLogger::CLASSROOM_MEMBER_LEFT, 'classroom', $classroom->id, null, ['student_id' => $student->id]);

        $this->afterChange($student, $classroom->teacher);

        return $membership;
    }

    /** L'enseignant retire un élève. Son historique reste. */
    public function remove(User $teacher, Classroom $classroom, int $studentId): ClassroomMembership
    {
        $membership = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $studentId)
            ->where('status', ClassroomMembership::STATUS_ACTIVE)
            ->first();

        if ($membership === null) {
            throw new ClassroomException(ClassroomException::NOT_MEMBER, 'Cet élève n\'est pas dans la classe.');
        }

        $membership->forceFill([
            'status' => ClassroomMembership::STATUS_REMOVED,
            'left_at' => Carbon::now(),
            'removed_by' => $teacher->id,
        ])->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_MEMBER_REMOVED, 'classroom', $classroom->id, null, ['student_id' => $studentId]);

        $this->afterChange($membership->student, $teacher);

        return $membership;
    }

    /**
     * La classe (technique, si configuré) puis les sièges (commercial).
     *
     * @throws ClassroomException
     */
    private function assertCapacity(User $teacher, Classroom $classroom, User $student): void
    {
        $perClass = $this->entitlements->limit($teacher, EntitlementKeys::STUDENTS_PER_CLASSROOM_MAX);
        if ($perClass !== null) {
            $inClass = ClassroomMembership::where('classroom_id', $classroom->id)->active()->count();
            if ($inClass >= $perClass) {
                throw new ClassroomException(ClassroomException::CLASS_FULL, 'Cette classe est complète.');
            }
        }

        // Une classe couverte par la LICENCE de son établissement : ce sont les
        // sièges de l'établissement qui comptent (SCHOOL_ADMIN_SPACE.md, D1).
        if ($classroom->school_id !== null && ($licence = $this->schoolCapacity->runningLicence($classroom->school_id)) !== null) {
            $this->schoolCapacity->assertCanSeat($licence, $student);

            return;
        }

        // Un élève déjà assis chez cet enseignant (une autre de ses classes)
        // n'occupe pas un second siège : les sièges se comptent par élève.
        $this->entitlements->forget($teacher);
        $this->capacity->assertCanSeat($teacher, $student);
    }

    /**
     * Ce qu'un changement d'adhésion PÉRIME dans les caches de requête :
     * l'usage de l'enseignant, le contexte d'étude de l'élève, et son droit
     * d'accès (couverture par l'enseignant, modèle B).
     */
    private function afterChange(?User $student, ?User $teacher): void
    {
        if ($teacher !== null) {
            $this->entitlements->forget($teacher);
        }
        if ($student !== null) {
            $this->context->forget($student);
            $this->access->forget($student);
        }
    }
}
