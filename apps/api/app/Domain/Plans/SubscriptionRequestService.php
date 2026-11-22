<?php

namespace App\Domain\Plans;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Push\AdminPush;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Models\SubscriptionRequest;
use App\Models\User;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les DEMANDES d'offre — un geste administratif, jamais un paiement.
 *
 * request() n'active RIEN, quel que soit le plan. La seule activation
 * automatique du produit est l'offre par défaut (gratuite). Une demande
 * dit à l'administration « contactez-moi » ; l'activation viendra de
 * SubscriptionActivationService, qui marquera la demande `fulfilled`.
 */
class SubscriptionRequestService
{
    public function __construct(
        private ActivityLogger $log,
        private TeacherPricingService $pricing,
        private PlanEntitlementResolver $resolver,
    ) {}

    /**
     * Pour une offre PAR SIÈGES, la demande porte un nombre d'élèves et le
     * prix que le serveur en calcule à cet instant (le client n'envoie
     * jamais de montant). Trois refus propres à cette forme : sans nombre,
     * un nombre que le gratuit couvre déjà, un nombre inférieur aux élèves
     * déjà encadrés.
     *
     * @throws DomainException
     */
    public function request(User $user, Plan $plan, ?string $note = null, ?int $studentSeats = null): SubscriptionRequest
    {
        if ($user->isAdmin()) {
            throw new DomainException('Un administrateur n\'a pas d\'offre.');
        }
        $type = $user->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
        if ($plan->type !== $type || ! $plan->isRequestable()) {
            throw new SubscriptionRequestException(SubscriptionRequestException::NOT_REQUESTABLE, 'Cette offre ne peut pas être demandée.');
        }

        $version = $plan->currentVersion;
        $seat = $this->seatTerms($user, $type, $version, $studentSeats);

        return DB::transaction(function () use ($user, $plan, $version, $note, $seat) {
            $pending = SubscriptionRequest::where('user_id', $user->id)
                ->where('status', SubscriptionRequest::STATUS_PENDING)
                ->lockForUpdate()
                ->exists();
            if ($pending) {
                throw new SubscriptionRequestException(SubscriptionRequestException::ALREADY_PENDING, 'Une demande est déjà en cours.');
            }

            $request = SubscriptionRequest::create([
                'user_id' => $user->id,
                'requested_plan_id' => $plan->id,
                'requested_plan_version_id' => $version?->id,
                ...$seat,
                'status' => SubscriptionRequest::STATUS_PENDING,
                'requested_at' => Carbon::now(),
                'user_note' => $note,
            ]);

            $this->log->log($user, ActivityLogger::SUBSCRIPTION_REQUEST_CREATED, 'user', $user->id, null, [
                'request_id' => $request->id, 'plan' => $plan->slug,
                'student_seats' => $request->requested_student_seats,
                'calculated_total_cents' => $request->calculated_total_cents,
            ]);
            AdminPush::later('subscription_request', $request->id);

            return $request;
        });
    }

    /**
     * @return array{requested_student_seats: ?int, unit_price_cents: ?int, calculated_total_cents: ?int, currency: ?string}
     *
     * @throws SubscriptionRequestException
     */
    private function seatTerms(User $user, string $type, ?PlanVersion $version, ?int $seats): array
    {
        $none = ['requested_student_seats' => null, 'unit_price_cents' => null, 'calculated_total_cents' => null, 'currency' => null];

        if ($version === null || ! $version->isSeatBased()) {
            return $none;
        }
        if ($seats === null) {
            throw new SubscriptionRequestException(SubscriptionRequestException::SEATS_REQUIRED, 'Indiquez le nombre d\'élèves à couvrir.');
        }

        try {
            $quote = $this->pricing->quote($version, $seats);
        } catch (DomainException $e) {
            throw new SubscriptionRequestException(SubscriptionRequestException::SEATS_NOT_COVERED, $e->getMessage());
        }

        // Ce que le gratuit accorde déjà ne se demande pas.
        $free = $this->resolver->defaultValue($type, EntitlementKeys::STUDENTS_TOTAL_MAX);
        if ($free !== null && $seats <= (int) $free) {
            throw new SubscriptionRequestException(SubscriptionRequestException::COVERED_BY_DEFAULT, "Jusqu'à {$free} élèves, l'offre gratuite suffit : rien à demander.");
        }

        if ($user->isTeacher()) {
            $current = $this->resolver->usage($user)['students'];
            if ($seats < $current) {
                throw new SubscriptionRequestException(SubscriptionRequestException::SEATS_BELOW_USAGE, "Vous encadrez déjà {$current} élèves : la capacité demandée ne peut pas être inférieure.");
            }
        }

        return [
            'requested_student_seats' => $seats,
            'unit_price_cents' => $quote['unitPriceCents'],
            'calculated_total_cents' => $quote['totalCents'],
            'currency' => $quote['currency'],
        ];
    }

    public function cancel(User $user, SubscriptionRequest $request): SubscriptionRequest
    {
        if ($request->user_id !== $user->id || ! $request->isPending()) {
            throw new DomainException('Cette demande ne peut pas être annulée.');
        }

        $request->forceFill(['status' => SubscriptionRequest::STATUS_CANCELLED, 'reviewed_at' => Carbon::now()])->save();

        $this->log->log($user, ActivityLogger::SUBSCRIPTION_REQUEST_CANCELLED, 'user', $user->id, null, ['request_id' => $request->id]);

        return $request;
    }

    public function reject(User $admin, SubscriptionRequest $request, string $reason, ?string $note = null): SubscriptionRequest
    {
        if (! $request->isPending()) {
            throw new DomainException('Cette demande n\'est plus en attente.');
        }

        $request->forceFill([
            'status' => SubscriptionRequest::STATUS_REJECTED,
            'reviewed_at' => Carbon::now(),
            'reviewed_by' => $admin->id,
            'rejection_reason' => $reason,
            'admin_note' => $note,
        ])->save();

        $this->log->log($admin, ActivityLogger::SUBSCRIPTION_REQUEST_REJECTED, 'user', $request->user_id, null, [
            'request_id' => $request->id, 'reason' => $reason,
        ]);

        return $request;
    }

    /** @return array<string, mixed> */
    public static function serialize(SubscriptionRequest $r): array
    {
        $r->loadMissing(['plan:id,slug,name,type', 'planVersion.pricingTiers', 'reviewedBy:id,first_name,last_name', 'user:id,first_name,last_name,email,role']);

        return [
            'id' => $r->id,
            'userId' => $r->user_id,
            'userEmail' => $r->user?->email,
            'userName' => trim(($r->user?->first_name ?? '').' '.($r->user?->last_name ?? '')),
            'userRole' => $r->user?->role,
            'planId' => $r->requested_plan_id,
            'planSlug' => $r->plan?->slug,
            'planName' => $r->plan?->name,
            'planType' => $r->plan?->type,
            'planVersion' => $r->planVersion?->version,
            'planVersionId' => $r->requested_plan_version_id,
            // Les sièges demandés et le prix calculé PAR LE SERVEUR à la demande.
            'requestedStudentSeats' => $r->requested_student_seats,
            'unitPriceCents' => $r->unit_price_cents,
            'calculatedTotalCents' => $r->calculated_total_cents,
            'currency' => $r->currency,
            'seatTierLabel' => ($r->requested_student_seats !== null && $r->planVersion !== null)
                ? app(TeacherPricingService::class)->applicableTier($r->planVersion, $r->requested_student_seats)?->label()
                : null,
            'status' => $r->status,
            'requestedAt' => optional($r->requested_at)->toIso8601String(),
            'userNote' => $r->user_note,
            'reviewedAt' => optional($r->reviewed_at)->toIso8601String(),
            'reviewedBy' => $r->reviewedBy === null ? null : trim($r->reviewedBy->first_name.' '.$r->reviewedBy->last_name),
            'rejectionReason' => $r->rejection_reason,
            'adminNote' => $r->admin_note,
            'subscriptionId' => $r->subscription_id,
        ];
    }
}
