<?php

namespace App\Domain\Classroom;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les classes d'un enseignant : créer, régler, archiver.
 *
 * Trois couches d'autorisation se rencontrent ici, et aucune ne remplace
 * l'autre :
 *   1. le RÔLE     — la route exige can:teacher ;
 *   2. la PROPRIÉTÉ — ClassroomPolicy, avant d'arriver ici ;
 *   3. l'OFFRE     — la classe scolaire autorisée, et — s'il est configuré —
 *                    le garde-fou TECHNIQUE classrooms.max. Les classes ne
 *                    sont PAS l'unité de vente : l'offre se compte en sièges
 *                    élèves (TeacherCapacityService), et un enseignant crée
 *                    autant de classes qu'il veut sauf limite technique.
 *
 * Archiver ne supprime RIEN : ni les adhésions, ni la configuration, ni
 * surtout l'historique d'apprentissage des élèves, qui ne lui a jamais
 * appartenu. Une classe archivée cesse simplement de compter dans la
 * limite et de servir sa visibilité.
 */
class ClassroomService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private ActivityLogger $log,
    ) {}

    /**
     * @param  array{name: string, description?: ?string, grade: string, academicYear?: ?string}  $attrs
     *
     * @throws ClassroomException limite atteinte, classe non autorisée
     */
    public function create(User $teacher, array $attrs): Classroom
    {
        $this->assertGradeAllowed($teacher, $attrs['grade']);

        return DB::transaction(function () use ($teacher, $attrs) {
            // Le compte se fait SOUS VERROU : deux créations simultanées ne
            // doivent pas passer toutes deux sous la limite.
            $current = Classroom::ownedBy($teacher)->countingTowardsLimit()->lockForUpdate()->count();
            $this->assertBelowLimit($teacher, $current);

            $classroom = new Classroom([
                'name' => $attrs['name'],
                'description' => $attrs['description'] ?? null,
                'grade' => $attrs['grade'],
                'academic_year' => $attrs['academicYear'] ?? null,
                'status' => Classroom::STATUS_ACTIVE,
                'join_code' => JoinCode::unique(),
                'join_code_enabled' => true,
            ]);
            $classroom->teacher_id = $teacher->id;
            $classroom->save();

            $this->log->log($teacher, ActivityLogger::CLASSROOM_CREATED, 'classroom', $classroom->id, null, [
                'name' => $classroom->name, 'grade' => $classroom->grade,
            ]);

            $this->entitlements->forget($teacher);

            return $classroom;
        });
    }

    /** @param array<string, mixed> $attrs */
    public function update(User $teacher, Classroom $classroom, array $attrs): Classroom
    {
        $before = $classroom->only(['name', 'description', 'academic_year', 'join_code_enabled']);

        // Seuls les champs ENVOYÉS changent : un PATCH qui ne porte que
        // `joinCodeEnabled` (fermer les adhésions) ne doit pas effacer le nom.
        $classroom->fill([
            'name' => $attrs['name'] ?? $classroom->name,
            'description' => array_key_exists('description', $attrs) ? $attrs['description'] : $classroom->description,
            'academic_year' => array_key_exists('academicYear', $attrs) ? $attrs['academicYear'] : $classroom->academic_year,
        ]);

        if (array_key_exists('joinCodeEnabled', $attrs)) {
            $classroom->join_code_enabled = (bool) $attrs['joinCodeEnabled'];
        }

        $classroom->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_UPDATED, 'classroom', $classroom->id, $before,
            $classroom->only(['name', 'description', 'academic_year', 'join_code_enabled']));

        return $classroom;
    }

    public function archive(User $teacher, Classroom $classroom): Classroom
    {
        if ($classroom->status === Classroom::STATUS_ARCHIVED) {
            return $classroom;
        }

        $before = $classroom->status;
        $classroom->forceFill(['status' => Classroom::STATUS_ARCHIVED, 'archived_at' => Carbon::now()])->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_ARCHIVED, 'classroom', $classroom->id,
            ['status' => $before], ['status' => Classroom::STATUS_ARCHIVED]);

        $this->entitlements->forget($teacher);

        return $classroom;
    }

    /**
     * Ressusciter une classe archivée — elle recompte dans la limite, donc
     * la limite est revérifiée : un enseignant repassé à l'offre gratuite ne
     * peut pas ranimer ses cinq classes une à une.
     */
    public function restore(User $teacher, Classroom $classroom): Classroom
    {
        if ($classroom->status !== Classroom::STATUS_ARCHIVED) {
            return $classroom;
        }

        return DB::transaction(function () use ($teacher, $classroom) {
            $current = Classroom::ownedBy($teacher)->countingTowardsLimit()->lockForUpdate()->count();
            $this->assertBelowLimit($teacher, $current);
            $this->assertGradeAllowed($teacher, $classroom->grade);

            $classroom->forceFill(['status' => Classroom::STATUS_ACTIVE, 'archived_at' => null])->save();

            $this->log->log($teacher, ActivityLogger::CLASSROOM_RESTORED, 'classroom', $classroom->id,
                ['status' => Classroom::STATUS_ARCHIVED], ['status' => Classroom::STATUS_ACTIVE]);

            $this->entitlements->forget($teacher);

            return $classroom;
        });
    }

    public function rotateJoinCode(User $teacher, Classroom $classroom): Classroom
    {
        $classroom->forceFill(['join_code' => JoinCode::unique(), 'join_code_enabled' => true])->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_JOIN_CODE_ROTATED, 'classroom', $classroom->id);

        return $classroom;
    }

    /**
     * Un nouveau lien de classe : l'ancien cesse aussitôt d'ouvrir quoi que
     * ce soit (il répond `invalid`). Les membres restent membres. Contrairement
     * au code, renouveler le lien ne ROUVRE PAS les adhésions fermées : c'est
     * un geste de sécurité (« le lien a fuité »), pas d'ouverture.
     */
    public function rotateJoinLink(User $teacher, Classroom $classroom): Classroom
    {
        $classroom->forceFill(['join_link_token' => JoinLinkToken::unique()])->save();

        $this->log->log($teacher, ActivityLogger::CLASSROOM_JOIN_LINK_ROTATED, 'classroom', $classroom->id);

        return $classroom;
    }

    /** @return Collection<int, Classroom> */
    public function listFor(User $teacher): Collection
    {
        return Classroom::ownedBy($teacher)
            ->withCount(['activeMemberships as students_count'])
            ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'suspended' THEN 1 ELSE 2 END")
            ->orderByDesc('id')
            ->get();
    }

    private function assertBelowLimit(User $teacher, int $current): void
    {
        $max = $this->entitlements->limit($teacher, EntitlementKeys::CLASSROOMS_MAX);

        if ($max !== null && $current >= $max) {
            throw new ClassroomException(
                ClassroomException::LIMIT_REACHED,
                'Votre offre ne permet pas de créer une classe de plus.'
            );
        }
    }

    private function assertGradeAllowed(User $teacher, string $grade): void
    {
        $exists = Grade::where('code', $grade)
            ->when(config('curriculum.enforce_active_grades', true), fn ($q) => $q->where('is_active', true))
            ->exists();

        if (! $exists) {
            throw new ClassroomException(ClassroomException::GRADE_NOT_ALLOWED, 'Cette classe scolaire n\'existe pas.');
        }

        // Une liste VIDE = aucune restriction (voir EntitlementKeys) ; une
        // liste renseignée est une liste blanche.
        $allowed = $this->entitlements->value($teacher, EntitlementKeys::CONTENT_ALLOWED_GRADES);
        if (is_array($allowed) && $allowed !== [] && ! in_array($grade, $allowed, true)) {
            throw new ClassroomException(ClassroomException::GRADE_NOT_ALLOWED, 'Votre offre ne couvre pas cette classe scolaire.');
        }
    }
}
