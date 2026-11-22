<?php

namespace App\Domain\Plans;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Plan;
use App\Models\PlanEntitlementOverride;
use App\Models\PlanVersion;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * L'AUTORITÉ sur les limites et fonctionnalités d'un compte — ce que
 * l'offre permet, résolu à partir des DONNÉES, jamais d'un nombre en dur.
 *
 *     abonnement en cours ?
 *        OUI → sa version d'offre (immuable), et sa CAPACITÉ ACHETÉE
 *              (student_seat_limit) qui l'emporte sur students_total.max
 *        NON → la version courante de l'offre PAR DÉFAUT du type
 *     puis  → les dérogations actives de ce compte, clé par clé
 *     =     → les valeurs effectives
 *
 * Le gratuit est donc automatique et sans ligne : un enseignant qui vient
 * de vérifier son adresse est sur l'offre par défaut, immédiatement. Un
 * abonnement suspendu, annulé ou expiré retombe tout seul sur cette offre —
 * rien n'est supprimé, seules les CRÉATIONS au-delà de la limite sont
 * refusées (overLimit).
 *
 * Singleton mémorisé par requête et vidé à la frontière de requête, comme
 * EntitlementService : une dérogation accordée à l'instant doit se voir
 * dans le résumé rendu par la même requête (forget), et une adhésion
 * créée doit se voir à la suivante.
 *
 * À ne pas confondre avec EntitlementService (Domain\Access), qui répond
 * « cet élève a-t-il le droit commercial d'ouvrir du contenu payant ? ».
 */
class PlanEntitlementResolver
{
    /** @var array<int, array<string, mixed>> */
    private array $cache = [];

    public function value(User $user, string $key): mixed
    {
        $values = $this->resolve($user)['values'];

        // array_key_exists et non `??` : null est une VALEUR (« illimité »),
        // pas une absence.
        return array_key_exists($key, $values) ? $values[$key] : EntitlementKeys::defaultOf($key);
    }

    /** Une fonctionnalité booléenne. */
    public function allows(User $user, string $key): bool
    {
        return (bool) $this->value($user, $key);
    }

    /** Une limite entière ; null = illimité. */
    public function limit(User $user, string $key): ?int
    {
        $value = $this->value($user, $key);

        return $value === null ? null : (int) $value;
    }

    /**
     * Ce qui est CONSOMMÉ aujourd'hui, pour comparer aux limites.
     *
     * @return array{classrooms: int, students: int}
     */
    public function usage(User $user): array
    {
        $classroomIds = Classroom::ownedBy($user)->countingTowardsLimit()->pluck('id');
        // Les élèves d'une classe couverte par la LICENCE de son établissement
        // occupent les sièges de l'établissement, pas ceux de l'enseignant
        // (SCHOOL_ADMIN_SPACE.md, D1).
        $seatClassroomIds = $classroomIds->isEmpty() ? $classroomIds
            : Classroom::whereIn('id', $classroomIds)->notCoveredBySchool()->pluck('id');

        return [
            'classrooms' => $classroomIds->count(),
            // Des SIÈGES : un élève présent dans deux classes n'en occupe qu'un.
            'students' => $seatClassroomIds->isEmpty() ? 0 : ClassroomMembership::whereIn('classroom_id', $seatClassroomIds)
                ->active()->distinct('student_id')->count('student_id'),
        ];
    }

    /**
     * Le résumé rendu au client — propre, sans vocabulaire interne.
     *
     * @return array<string, mixed>
     */
    public function summaryFor(User $user): array
    {
        $resolved = $this->resolve($user);
        $usage = $user->isTeacher() ? $this->usage($user) : ['classrooms' => 0, 'students' => 0];
        $values = $resolved['values'];

        $meter = function (string $key, int $current) use ($values): array {
            $max = $values[$key] ?? null;
            $max = $max === null ? null : (int) $max;

            return [
                'current' => $current,
                'maximum' => $max,
                'remaining' => $max === null ? null : max(0, $max - $current),
                'canAdd' => $max === null || $current < $max,
                'overLimit' => $max !== null && $current > $max,
            ];
        };

        $classes = $meter(EntitlementKeys::CLASSROOMS_MAX, $usage['classrooms']);
        $classes['canCreate'] = $classes['canAdd'];
        unset($classes['canAdd']);

        $features = [];
        foreach (EntitlementKeys::all() as $key => $meta) {
            if ($meta['type'] === EntitlementKeys::TYPE_FEATURE) {
                $features[$key] = (bool) ($values[$key] ?? false);
            }
        }

        $pending = SubscriptionRequest::where('user_id', $user->id)
            ->where('status', SubscriptionRequest::STATUS_PENDING)
            ->with('plan:id,name,slug')
            ->latest('id')
            ->first();

        return [
            'plan' => $resolved['plan'],
            'request' => $pending === null ? null : [
                'id' => $pending->id,
                'planSlug' => $pending->plan?->slug,
                'planName' => $pending->plan?->name,
                'status' => $pending->status,
                'requestedAt' => optional($pending->requested_at)->toIso8601String(),
            ],
            'classes' => $classes,
            'students' => $meter(EntitlementKeys::STUDENTS_TOTAL_MAX, $usage['students']),
            'studentsPerClass' => ['maximum' => isset($values[EntitlementKeys::STUDENTS_PER_CLASSROOM_MAX]) ? (int) $values[EntitlementKeys::STUDENTS_PER_CLASSROOM_MAX] : null],
            'features' => $features,
            'allowedGrades' => $values[EntitlementKeys::CONTENT_ALLOWED_GRADES] ?? [],
        ];
    }

    /**
     * Pour l'administration : chaque clé, sa valeur, et D'OÙ elle vient.
     *
     * @return array<int, array{key: string, label: string, type: string, category: string, value: mixed, source: string, overrideId: ?int}>
     */
    public function explain(User $user): array
    {
        $resolved = $this->resolve($user);
        $rows = [];
        foreach (EntitlementKeys::all() as $key => $meta) {
            $rows[] = [
                'key' => $key,
                'label' => $meta['label'],
                'type' => $meta['type'],
                'category' => $meta['category'],
                'value' => $resolved['values'][$key] ?? $meta['default'],
                'source' => $resolved['sources'][$key]['source'] ?? 'default',
                'overrideId' => $resolved['sources'][$key]['overrideId'] ?? null,
            ];
        }

        return $rows;
    }

    /**
     * La version d'offre de BASE d'un compte, et d'où elle vient.
     *
     * @return array{version: ?PlanVersion, subscription: ?Subscription, source: string}
     */
    public function basePlanVersion(User $user): array
    {
        $subscription = $user->runningSubscription();
        if ($subscription !== null) {
            $version = $subscription->planVersion()->with(['plan', 'entitlements', 'pricingTiers'])->first();
            if ($version !== null) {
                return ['version' => $version, 'subscription' => $subscription, 'source' => 'subscription'];
            }
        }

        $default = Plan::ofType($this->planTypeFor($user))->where('is_default', true)->orderBy('id')->first();
        $version = $default?->currentVersion()->with(['plan', 'entitlements', 'pricingTiers'])->first();

        return ['version' => $version, 'subscription' => null, 'source' => 'default'];
    }

    /**
     * La valeur d'une clé sur l'offre PAR DÉFAUT d'un type — ce que le
     * gratuit accorde, indépendamment de l'abonnement du compte. Sert à
     * refuser une demande que le gratuit couvre déjà.
     */
    public function defaultValue(string $type, string $key): mixed
    {
        $default = Plan::ofType($type)->where('is_default', true)->orderBy('id')->first();
        $map = $default?->currentVersion?->entitlementMap() ?? [];

        return array_key_exists($key, $map) ? $map[$key] : EntitlementKeys::defaultOf($key);
    }

    public function forget(?User $user = null): void
    {
        if ($user === null) {
            $this->cache = [];

            return;
        }
        unset($this->cache[$user->id]);
    }

    /** @return array{values: array<string, mixed>, sources: array<string, array{source: string, overrideId: ?int}>, plan: array<string, mixed>} */
    private function resolve(User $user): array
    {
        if (isset($this->cache[$user->id])) {
            return $this->cache[$user->id];
        }

        $base = $this->basePlanVersion($user);
        $version = $base['version'];

        $values = [];
        $sources = [];
        foreach (EntitlementKeys::all() as $key => $meta) {
            $values[$key] = $meta['default'];
            $sources[$key] = ['source' => 'default', 'overrideId' => null];
        }

        if ($version !== null) {
            foreach ($version->entitlementMap() as $key => $value) {
                if (! EntitlementKeys::exists($key)) {
                    continue;
                }
                $values[$key] = $value;
                $sources[$key] = ['source' => $base['source'] === 'subscription' ? 'subscription' : 'plan', 'overrideId' => null];
            }
        }

        // La CAPACITÉ ACHETÉE : un abonnement par sièges porte son propre
        // nombre d'élèves, figé à l'activation. Il l'emporte sur la valeur
        // de la version — c'est lui qui a été payé.
        $subscription = $base['subscription'];
        if ($subscription !== null && $subscription->student_seat_limit !== null) {
            $values[EntitlementKeys::STUDENTS_TOTAL_MAX] = $subscription->student_seat_limit;
            $sources[EntitlementKeys::STUDENTS_TOTAL_MAX] = ['source' => 'subscription', 'overrideId' => null];
        }

        // Les dérogations : la plus récente l'emporte, clé par clé.
        $overrides = PlanEntitlementOverride::where('user_id', $user->id)
            ->activeNow(Carbon::now())
            ->orderBy('id')
            ->get();
        foreach ($overrides as $override) {
            if (! EntitlementKeys::exists($override->key)) {
                continue;
            }
            $values[$override->key] = $override->value;
            $sources[$override->key] = ['source' => 'override', 'overrideId' => $override->id];
        }

        return $this->cache[$user->id] = [
            'values' => $values,
            'sources' => $sources,
            'plan' => [
                'slug' => $version?->plan?->slug,
                'name' => $version?->plan?->name,
                'version' => $version?->version,
                'source' => $base['source'],
                'status' => $subscription?->status ?? ($version === null ? 'none' : 'default'),
                'startedAt' => optional($subscription?->started_at)->toIso8601String(),
                'endsAt' => optional($subscription?->ends_at)->toIso8601String(),
                'subscriptionId' => $subscription?->id,
                'seatBased' => $version?->isSeatBased() ?? false,
                'studentSeatLimit' => $subscription?->student_seat_limit,
                'seatUnitPriceCents' => $subscription?->seat_unit_price_cents,
                'seatTotalCents' => $subscription?->seat_total_cents,
                'seatCurrency' => $subscription?->seat_currency,
            ],
        ];
    }

    private function planTypeFor(User $user): string
    {
        return $user->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
    }
}
