<?php

namespace App\Domain\School;

use App\Domain\Access\EntitlementService;
use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\StudyContextService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\School;
use App\Models\SchoolLicence;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * La licence d'un établissement, côté ADMINISTRATION de la plateforme
 * (SCHOOL_ADMIN_SPACE.md, D1, phase 7) : l'activer (manuellement — le
 * paiement se fait hors de la plateforme), la suspendre, la reprendre,
 * l'annuler. Au plus UNE licence active par établissement : en activer une
 * nouvelle annule la précédente (renouvellement, changement de sièges).
 *
 * Réduire les sièges sous l'usage est refusé (`seats_below_usage`), comme
 * pour une offre d'enseignant : aucun élève n'est retiré par une licence.
 */
class SchoolLicenceService
{
    public function __construct(
        private SchoolCapacityService $capacity,
        private EntitlementService $access,
        private PlanEntitlementResolver $entitlements,
        private StudyContextService $context,
        private ActivityLogger $logger,
    ) {}

    /** @throws SchoolException */
    public function grant(User $admin, School $school, int $seats, ?Carbon $endsAt, ?string $note): SchoolLicence
    {
        if ($seats < 1) {
            throw new SchoolException(SchoolException::INVALID_LICENCE, 'Au moins un siège.');
        }
        if ($endsAt !== null && $endsAt->lte(Carbon::now())) {
            throw new SchoolException(SchoolException::INVALID_LICENCE, 'La fin doit être dans le futur.');
        }
        if ($seats < $this->capacity->currentStudentCount($school)) {
            throw new SchoolException(SchoolException::SEATS_BELOW_USAGE, 'Moins de sièges que d\'élèves déjà dans l\'établissement.');
        }

        $licence = DB::transaction(function () use ($admin, $school, $seats, $endsAt, $note) {
            School::whereKey($school->id)->lockForUpdate()->first();
            SchoolLicence::where('school_id', $school->id)
                ->where('status', SchoolLicence::STATUS_ACTIVE)
                ->update(['status' => SchoolLicence::STATUS_CANCELLED]);

            $licence = new SchoolLicence([
                'student_seats' => $seats,
                'starts_at' => Carbon::now(),
                'ends_at' => $endsAt,
                'note' => $note,
            ]);
            $licence->school_id = $school->id;
            $licence->granted_by = $admin->id;
            $licence->save();

            $this->logger->log($admin, ActivityLogger::SCHOOL_LICENCE_GRANTED, 'school', $school->id, null, [
                'licenceId' => $licence->id, 'seats' => $seats, 'endsAt' => optional($endsAt)->toIso8601String(),
            ]);

            return $licence;
        });

        $this->afterChange();

        return $licence;
    }

    /** @throws SchoolException */
    public function setStatus(User $admin, School $school, string $status): SchoolLicence
    {
        $licence = SchoolLicence::where('school_id', $school->id)
            ->whereIn('status', [SchoolLicence::STATUS_ACTIVE, SchoolLicence::STATUS_SUSPENDED])
            ->orderByDesc('id')
            ->first();
        if ($licence === null) {
            throw new SchoolException(SchoolException::NO_LICENCE, 'Aucune licence à modifier.');
        }
        if (! in_array($status, SchoolLicence::STATUSES, true)) {
            throw new SchoolException(SchoolException::INVALID_LICENCE, 'Statut inconnu.');
        }

        $before = $licence->status;
        $licence->forceFill(['status' => $status])->save();
        $this->logger->log($admin, ActivityLogger::SCHOOL_LICENCE_STATUS, 'school', $school->id, ['status' => $before], ['status' => $status, 'licenceId' => $licence->id]);
        $this->afterChange();

        return $licence;
    }

    /**
     * La licence en vigueur ou en suspens, pour l'administration.
     *
     * @return array<string, mixed>|null
     */
    public function current(School $school): ?array
    {
        $licence = SchoolLicence::where('school_id', $school->id)
            ->whereIn('status', [SchoolLicence::STATUS_ACTIVE, SchoolLicence::STATUS_SUSPENDED])
            ->orderByDesc('id')
            ->first();
        if ($licence === null) {
            return null;
        }
        $current = $this->capacity->currentStudentCount($school);

        return [
            'id' => $licence->id,
            'status' => $licence->status,
            'running' => $licence->isRunning(),
            'seats' => $licence->student_seats,
            'current' => $current,
            'remaining' => max(0, $licence->student_seats - $current),
            'startsAt' => $licence->starts_at->toIso8601String(),
            'endsAt' => optional($licence->ends_at)->toIso8601String(),
            'note' => $licence->note,
        ];
    }

    /** L'accès, les sièges d'enseignant et les contextes changent : on oublie les mémoires de la requête. */
    private function afterChange(): void
    {
        $this->access->forget();
        $this->entitlements->forget();
        $this->context->forget();
    }
}
