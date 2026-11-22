<?php

namespace App\Domain\Plans;

use App\Domain\Access\EntitlementService;
use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Domain\Admin\ActivityLogger;
use App\Models\ActivationCode;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * L'ACTIVATION MANUELLE d'une offre — le seul chemin d'écriture des
 * abonnements du produit algérien.
 *
 * Aucun paiement en ligne n'existe. L'argent est reçu hors plateforme, puis :
 *
 *   activate()         l'administrateur active l'offre sur le compte
 *   activateFromCode() l'utilisateur saisit un code lié à l'offre
 *
 * Dans les deux cas naît un abonnement rattaché à une version IMMUABLE, et
 * la synchronisation existante (SubscriptionEntitlementSynchronizer) en tire
 * le droit d'accès payant. Suspendre, reprendre, annuler, prolonger, changer
 * d'offre passent aussi par ici — jamais par le pilote de fournisseur
 * (SubscriptionManager), qui reste réservé aux lignes venues d'un fournisseur
 * et n'est pas monté pour l'Algérie.
 *
 * Une offre enseignant se vend PAR SIÈGES : l'activation porte le nombre
 * d'élèves choisi (student_seat_limit) et le prix que la version figée en
 * donne, recopiés sur l'abonnement. Une grille modifiée ensuite ne change
 * ni ce prix ni cette capacité. Le nombre de classes n'entre nulle part.
 *
 * Ce service ne touche pas users.account_status : le statut de compte et le
 * statut d'abonnement sont deux choses.
 */
class SubscriptionActivationService
{
    public function __construct(
        private SubscriptionEntitlementSynchronizer $sync,
        private EntitlementService $access,
        private PlanEntitlementResolver $resolver,
        private TeacherPricingService $pricing,
        private ActivityLogger $log,
    ) {}

    /**
     * Activation directe par l'administration.
     *
     * @throws DomainException offre non activable, type ≠ rôle, offre par défaut
     */
    public function activate(User $admin, User $user, Plan $plan, ?PlanVersion $version = null, ?Carbon $endsAt = null, ?string $note = null, ?int $studentSeats = null): Subscription
    {
        $version = $this->resolveVersion($plan, $version);
        $this->assertActivatable($user, $plan);

        if ($endsAt !== null && $endsAt->lessThanOrEqualTo(Carbon::now())) {
            throw new DomainException('La date de fin doit être dans le futur.');
        }

        // Le prix et la capacité se calculent ICI, de la version choisie —
        // jamais d'un montant envoyé par un client.
        $seats = $this->seatTerms($version, $user, $studentSeats, enforceUsage: true);

        return DB::transaction(function () use ($admin, $user, $plan, $version, $endsAt, $note, $seats) {
            $now = Carbon::now();
            $this->closeRunningManual($user, $now, 'Remplacé par une nouvelle activation');

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan' => $plan->slug,
                'plan_version_id' => $version->id,
                ...$seats,
                'acquisition_source' => Subscription::SOURCE_MANUAL_ADMIN_ACTIVATION,
                'granted_by' => $admin->id,
                'activation_note' => $note,
                'status' => Subscription::STATUS_ACTIVE,
                'started_at' => $now,
                'ends_at' => $endsAt ?? $this->defaultEnd($version, $now),
                'provider' => Subscription::PROVIDER_MANUAL,
            ]);

            $this->sync->sync($subscription);
            $this->fulfilPendingRequest($user, $plan, $subscription, $admin);

            $this->log->log($admin, ActivityLogger::SUBSCRIPTION_ACTIVATED, 'user', $user->id, null, [
                'subscription_id' => $subscription->id,
                'plan' => $plan->slug,
                'plan_version' => $version->version,
                'ends_at' => optional($subscription->ends_at)->toIso8601String(),
                'note' => $note,
                'student_seat_limit' => $subscription->student_seat_limit,
                'seat_unit_price_cents' => $subscription->seat_unit_price_cents,
                'seat_total_cents' => $subscription->seat_total_cents,
            ]);

            $this->afterChange($user);

            return $subscription;
        });
    }

    /**
     * Activation par CODE — appelée par ActivationCodeRedemptionService, dans
     * SA transaction. Le code est déjà marqué activé ; il reste à faire naître
     * l'abonnement et son droit.
     *
     * @throws DomainException le lot n'active aucune offre, ou pas pour ce rôle
     */
    public function activateFromCode(ActivationCode $code, User $user, Carbon $now): Subscription
    {
        $batch = $code->batch;
        $version = $batch?->planVersion()->with('plan')->first();

        if ($version === null) {
            throw new DomainException('Ce code n\'active aucune offre.');
        }

        $plan = $version->plan;
        if ($plan->type !== $this->planTypeFor($user)) {
            throw new DomainException('Ce code ne correspond pas à votre type de compte.');
        }

        // La capacité vient du LOT (ce que l'école a payé), le prix de la
        // version FIGÉE du lot — jamais de la grille du jour.
        $seats = $this->seatTerms($version, $user, $batch->student_seat_limit, enforceUsage: false);

        $this->closeRunningManual($user, $now, 'Remplacé par un code d\'activation');

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan->slug,
            'plan_version_id' => $version->id,
            ...$seats,
            'acquisition_source' => Subscription::SOURCE_ACTIVATION_CODE,
            'activation_note' => $batch->label,
            'status' => Subscription::STATUS_ACTIVE,
            'started_at' => $now,
            'ends_at' => $batch->accessExpiryFrom($now) ?? $this->defaultEnd($version, $now),
            'provider' => Subscription::PROVIDER_ACTIVATION_CODE,
            'external_reference' => 'activation_code:'.$code->id,
        ]);

        $this->sync->sync($subscription);
        $this->fulfilPendingRequest($user, $plan, $subscription, null);

        $this->log->log($user, ActivityLogger::SUBSCRIPTION_CREATED_FROM_CODE, 'user', $user->id, null, [
            'subscription_id' => $subscription->id,
            'plan' => $plan->slug,
            'plan_version' => $version->version,
            'batch_id' => $batch->id,
            'student_seat_limit' => $subscription->student_seat_limit,
        ]);

        $this->afterChange($user);

        return $subscription;
    }

    public function suspend(User $admin, Subscription $subscription, ?string $reason = null): Subscription
    {
        $this->assertManual($subscription);
        if (! in_array($subscription->status, [Subscription::STATUS_ACTIVE, Subscription::STATUS_TRIALING], true)) {
            throw new DomainException('Seul un abonnement actif peut être suspendu.');
        }

        return $this->transition($admin, $subscription, ActivityLogger::SUBSCRIPTION_SUSPENDED, [
            'status' => Subscription::STATUS_SUSPENDED, 'suspended_at' => Carbon::now(),
        ], $reason);
    }

    public function resume(User $admin, Subscription $subscription, ?string $reason = null): Subscription
    {
        $this->assertManual($subscription);
        if ($subscription->status !== Subscription::STATUS_SUSPENDED) {
            throw new DomainException('Cet abonnement n\'est pas suspendu.');
        }
        if ($subscription->ends_at !== null && $subscription->ends_at->isPast()) {
            throw new DomainException('Cet abonnement est arrivé à échéance : prolongez-le plutôt.');
        }

        return $this->transition($admin, $subscription, ActivityLogger::SUBSCRIPTION_RESUMED, [
            'status' => Subscription::STATUS_ACTIVE, 'suspended_at' => null,
        ], $reason);
    }

    /** Annuler = fermer MAINTENANT. La ligne reste. */
    public function cancel(User $admin, Subscription $subscription, ?string $reason = null): Subscription
    {
        $this->assertManual($subscription);
        if (in_array($subscription->status, [Subscription::STATUS_CANCELLED, Subscription::STATUS_EXPIRED], true)) {
            throw new DomainException('Cet abonnement est déjà terminé.');
        }

        $now = Carbon::now();

        return $this->transition($admin, $subscription, ActivityLogger::SUBSCRIPTION_CANCELLED, [
            'status' => Subscription::STATUS_CANCELLED, 'cancelled_at' => $now, 'ends_at' => $now,
        ], $reason);
    }

    /** Prolonger : une nouvelle fin, dans le futur. Un abonnement terminé redevient actif. */
    public function extend(User $admin, Subscription $subscription, ?Carbon $endsAt, ?string $reason = null): Subscription
    {
        $this->assertManual($subscription);
        if ($endsAt !== null && $endsAt->lessThanOrEqualTo(Carbon::now())) {
            throw new DomainException('La nouvelle date de fin doit être dans le futur.');
        }

        $attributes = ['ends_at' => $endsAt];
        if (in_array($subscription->status, [Subscription::STATUS_CANCELLED, Subscription::STATUS_EXPIRED], true)) {
            $attributes['status'] = Subscription::STATUS_ACTIVE;
            $attributes['cancelled_at'] = null;
        }

        return $this->transition($admin, $subscription, ActivityLogger::SUBSCRIPTION_EXTENDED, $attributes, $reason);
    }

    /** Changer d'offre : l'actuel est fermé maintenant, un nouveau naît sur la version choisie. */
    public function changePlan(User $admin, Subscription $subscription, Plan $plan, ?PlanVersion $version = null, ?Carbon $endsAt = null, ?string $note = null, ?int $studentSeats = null): Subscription
    {
        $this->assertManual($subscription);
        $user = $subscription->user;

        return DB::transaction(function () use ($admin, $subscription, $user, $plan, $version, $endsAt, $note, $studentSeats) {
            $replacement = $this->activate($admin, $user, $plan, $version, $endsAt, $note, $studentSeats);

            $this->log->log($admin, ActivityLogger::SUBSCRIPTION_PLAN_CHANGED, 'user', $user->id,
                ['subscription_id' => $subscription->id, 'plan' => $subscription->plan, 'student_seat_limit' => $subscription->student_seat_limit],
                ['subscription_id' => $replacement->id, 'plan' => $plan->slug, 'student_seat_limit' => $replacement->student_seat_limit]);

            return $replacement;
        });
    }

    /**
     * L'historique, pour la fiche d'administration et pour l'utilisateur.
     *
     * @return array<int, array<string, mixed>>
     */
    public function history(User $user): array
    {
        return $user->subscriptions()
            ->with(['planVersion.plan:id,slug,name', 'grantedBy:id,first_name,last_name'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Subscription $s) => self::serialize($s))
            ->all();
    }

    /** @return array<string, mixed> */
    public static function serialize(Subscription $s): array
    {
        $s->loadMissing(['planVersion.plan:id,slug,name', 'grantedBy:id,first_name,last_name']);

        return [
            'id' => $s->id,
            'plan' => $s->plan,
            'planName' => $s->planVersion?->plan?->name ?? $s->plan,
            'planVersion' => $s->planVersion?->version,
            'status' => $s->status,
            'running' => $s->isRunning(),
            'startedAt' => optional($s->started_at)->toIso8601String(),
            'endsAt' => optional($s->ends_at)->toIso8601String(),
            'cancelledAt' => optional($s->cancelled_at)->toIso8601String(),
            'suspendedAt' => optional($s->suspended_at)->toIso8601String(),
            'acquisitionSource' => $s->acquisition_source,
            'provider' => $s->provider,
            'manual' => $s->isManual(),
            'grantedBy' => $s->grantedBy === null ? null : trim($s->grantedBy->first_name.' '.$s->grantedBy->last_name),
            'activationNote' => $s->activation_note,
            // La capacité achetée et son prix, tels que figés à l'activation.
            'studentSeatLimit' => $s->student_seat_limit,
            'seatUnitPriceCents' => $s->seat_unit_price_cents,
            'seatTotalCents' => $s->seat_total_cents,
            'seatCurrency' => $s->seat_currency,
            'seatTierLabel' => self::tierLabelOf($s),
        ];
    }

    /** Le palier de la version figée qui couvrait les sièges achetés — pour l'audit. */
    private static function tierLabelOf(Subscription $s): ?string
    {
        if ($s->student_seat_limit === null || $s->planVersion === null) {
            return null;
        }

        return app(TeacherPricingService::class)->applicableTier($s->planVersion, $s->student_seat_limit)?->label();
    }

    /**
     * Les termes de sièges d'un abonnement : capacité, prix unitaire, total.
     *
     * Une version PAR SIÈGES exige un nombre d'élèves et le tarife par sa
     * grille. Une version classique accepte un nombre facultatif (capacité
     * sans grille, prix null). `enforceUsage` refuse une capacité inférieure
     * aux élèves déjà encadrés — pour une activation manuelle ; un code payé
     * s'accepte toujours, quitte à laisser l'enseignant en dépassement.
     *
     * @return array{student_seat_limit: ?int, seat_unit_price_cents: ?int, seat_total_cents: ?int, seat_currency: ?string}
     *
     * @throws DomainException
     */
    private function seatTerms(PlanVersion $version, User $user, ?int $seats, bool $enforceUsage): array
    {
        $none = ['student_seat_limit' => null, 'seat_unit_price_cents' => null, 'seat_total_cents' => null, 'seat_currency' => null];

        if ($version->isSeatBased()) {
            if ($seats === null) {
                throw new DomainException('Cette offre se vend par sièges : indiquez le nombre d\'élèves à couvrir.');
            }
            $quote = $this->pricing->quote($version, $seats);
            if ($enforceUsage) {
                $this->assertSeatsCoverUsage($user, $seats);
            }

            return [
                'student_seat_limit' => $seats,
                'seat_unit_price_cents' => $quote['unitPriceCents'],
                'seat_total_cents' => $quote['totalCents'],
                'seat_currency' => $quote['currency'],
            ];
        }

        if ($seats === null) {
            return $none;
        }
        if ($seats < 1) {
            throw new DomainException('Le nombre d\'élèves doit être d\'au moins 1.');
        }
        if ($enforceUsage) {
            $this->assertSeatsCoverUsage($user, $seats);
        }

        return ['student_seat_limit' => $seats] + $none;
    }

    /** Réduire la capacité sous l'usage ne se fait pas d'un clic : rien n'est supprimé, donc rien ne rentre. */
    private function assertSeatsCoverUsage(User $user, int $seats): void
    {
        if (! $user->isTeacher()) {
            return;
        }
        $current = $this->resolver->usage($user)['students'];
        if ($seats < $current) {
            throw new DomainException("Impossible d'activer {$seats} siège(s) : l'enseignant encadre déjà {$current} élève(s). Réduisez d'abord les élèves couverts, ou choisissez une capacité supérieure.");
        }
    }

    /** @param array<string, mixed> $attributes */
    private function transition(User $admin, Subscription $subscription, string $action, array $attributes, ?string $reason): Subscription
    {
        return DB::transaction(function () use ($admin, $subscription, $action, $attributes, $reason) {
            $before = $subscription->only(['status', 'ends_at']);
            $subscription->forceFill($attributes)->save();

            $this->sync->sync($subscription);

            $this->log->log($admin, $action, 'user', $subscription->user_id,
                ['subscription_id' => $subscription->id, ...$before],
                ['subscription_id' => $subscription->id, 'status' => $subscription->status,
                    'ends_at' => optional($subscription->ends_at)->toIso8601String(), 'reason' => $reason]);

            $this->afterChange($subscription->user);

            return $subscription->refresh();
        });
    }

    private function resolveVersion(Plan $plan, ?PlanVersion $version): PlanVersion
    {
        if ($version === null) {
            $version = $plan->currentVersion;
            if ($version === null) {
                throw new DomainException('Cette offre n\'a pas de version publiée.');
            }

            return $version;
        }

        if ($version->plan_id !== $plan->id) {
            throw new DomainException('Cette version n\'appartient pas à cette offre.');
        }
        if ($version->status === PlanVersion::STATUS_DRAFT) {
            throw new DomainException('Une version en brouillon ne peut pas être activée.');
        }

        return $version;
    }

    private function assertActivatable(User $user, Plan $plan): void
    {
        if (! $plan->isActivatable()) {
            throw new DomainException('Cette offre n\'est plus activable.');
        }
        if ($plan->is_default) {
            throw new DomainException('L\'offre par défaut est déjà effective : rien à activer.');
        }
        if ($plan->type !== $this->planTypeFor($user)) {
            throw new DomainException('Cette offre ne correspond pas au type de ce compte.');
        }
        if ($user->isAdmin()) {
            throw new DomainException('Un administrateur n\'a pas d\'offre.');
        }
    }

    private function assertManual(Subscription $subscription): void
    {
        if (! $subscription->isManual()) {
            throw new DomainException('Cet abonnement est piloté par un fournisseur : il ne se modifie pas ici.');
        }
    }

    /** Un seul abonnement manuel qui court à la fois : l'ancien est fermé, jamais supprimé. */
    private function closeRunningManual(User $user, Carbon $now, string $reason): void
    {
        $running = $user->subscriptions()->manual()->get()->filter(fn (Subscription $s) => $s->isRunning($now) || $s->status === Subscription::STATUS_SUSPENDED);
        foreach ($running as $previous) {
            $previous->forceFill([
                'status' => Subscription::STATUS_CANCELLED,
                'cancelled_at' => $now,
                'ends_at' => $now,
                'activation_note' => trim(($previous->activation_note ?? '').' — '.$reason, ' —'),
            ])->save();
            $this->sync->sync($previous);
        }
    }

    private function defaultEnd(PlanVersion $version, Carbon $now): ?Carbon
    {
        $days = $version->activePrice?->durationDays();

        return $days === null ? null : $now->copy()->addDays($days);
    }

    private function fulfilPendingRequest(User $user, Plan $plan, Subscription $subscription, ?User $admin): void
    {
        $request = SubscriptionRequest::where('user_id', $user->id)
            ->where('status', SubscriptionRequest::STATUS_PENDING)
            ->where('requested_plan_id', $plan->id)
            ->first();

        if ($request === null) {
            return;
        }

        $request->forceFill([
            'status' => SubscriptionRequest::STATUS_FULFILLED,
            'reviewed_at' => Carbon::now(),
            'reviewed_by' => $admin?->id,
            'subscription_id' => $subscription->id,
        ])->save();

        $this->log->log($admin ?? $user, ActivityLogger::SUBSCRIPTION_REQUEST_FULFILLED, 'user', $user->id, null, [
            'request_id' => $request->id, 'subscription_id' => $subscription->id,
        ]);
    }

    private function afterChange(User $user): void
    {
        $this->resolver->forget($user);
        $this->access->forget($user);
    }

    private function planTypeFor(User $user): string
    {
        return $user->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
    }
}
