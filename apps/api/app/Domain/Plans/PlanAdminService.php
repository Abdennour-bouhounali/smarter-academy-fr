<?php

namespace App\Domain\Plans;

use App\Domain\Admin\ActivityLogger;
use App\Models\Plan;
use App\Models\PlanEntitlement;
use App\Models\PlanEntitlementOverride;
use App\Models\PlanPrice;
use App\Models\PlanPricingTier;
use App\Models\PlanVersion;
use App\Models\Subscription;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * La configuration des OFFRES par l'administration — sans déploiement.
 *
 * Deux règles tiennent tout :
 *   — une version référencée par un abonnement (ou un lot de codes) est
 *     FIGÉE : on en crée une nouvelle, on ne la modifie pas ;
 *   — une offre archivée n'est jamais supprimée : les abonnements
 *     existants continuent de la lire.
 *
 * Les dérogations individuelles vivent aussi ici (plan_entitlement_overrides),
 * distinctes des dérogations d'ACCÈS (EntitlementAdminService) : l'une
 * relève une limite d'offre, l'autre ouvre du contenu payant.
 */
class PlanAdminService
{
    public function __construct(
        private PlanEntitlementResolver $resolver,
        private TeacherPricingService $pricing,
        private ActivityLogger $log,
    ) {}

    /** @param array<string, mixed> $filters */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Plan::query()->with(['currentVersion.activePrice', 'currentVersion.pricingTiers'])->withCount([
            'versions',
        ]);

        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }
        if ($status = ($filters['status'] ?? null)) {
            $query->where('status', $status);
        }
        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%"));
        }

        return $query->orderBy('type')->orderBy('display_order')->orderBy('id')
            ->paginate(min((int) ($filters['perPage'] ?? 50), 100));
    }

    public function find(int $id): Plan
    {
        $plan = Plan::with(['versions.entitlements', 'versions.prices', 'versions.pricingTiers', 'versions.createdBy:id,first_name,last_name'])->find($id);
        if ($plan === null) {
            throw new DomainException('Offre introuvable.');
        }

        return $plan;
    }

    /**
     * Crée une offre avec une première version en BROUILLON, prête à être
     * réglée puis publiée.
     *
     * @param  array<string, mixed>  $attrs
     */
    public function create(User $admin, array $attrs): Plan
    {
        return DB::transaction(function () use ($admin, $attrs) {
            $slug = $this->uniqueSlug($attrs['slug'] ?? Str::slug($attrs['name']));

            $plan = Plan::create([
                'slug' => $slug,
                'name' => $attrs['name'],
                'description' => $attrs['description'] ?? null,
                'type' => $attrs['type'],
                'status' => Plan::STATUS_DRAFT,
                'display_order' => (int) ($attrs['displayOrder'] ?? 0),
                'is_public' => (bool) ($attrs['isPublic'] ?? false),
                'is_default' => false,
                'allows_requests' => (bool) ($attrs['allowsRequests'] ?? true),
            ]);

            $version = PlanVersion::create([
                'plan_id' => $plan->id,
                'version' => 1,
                'status' => PlanVersion::STATUS_DRAFT,
                'created_by' => $admin->id,
            ]);
            $this->writeVersionContent($version, $attrs['entitlements'] ?? [], $attrs['price'] ?? null);
            if (isset($attrs['pricingTiers']) && is_array($attrs['pricingTiers'])) {
                $this->writeTiers($version, $attrs['pricingTiers']);
            }

            if (! empty($attrs['isDefault'])) {
                $this->makeDefault($plan);
            }

            $this->log->log($admin, ActivityLogger::PLAN_CREATED, 'plan', $plan->id, null, ['slug' => $slug, 'type' => $plan->type]);

            return $plan->fresh(['versions.entitlements', 'versions.prices']);
        });
    }

    /** @param array<string, mixed> $attrs */
    public function update(User $admin, Plan $plan, array $attrs): Plan
    {
        $before = $plan->only(['name', 'description', 'display_order', 'is_public', 'is_default', 'allows_requests']);

        return DB::transaction(function () use ($admin, $plan, $attrs, $before) {
            foreach ([
                'name' => 'name', 'description' => 'description', 'displayOrder' => 'display_order',
                'isPublic' => 'is_public', 'allowsRequests' => 'allows_requests',
            ] as $in => $column) {
                if (array_key_exists($in, $attrs)) {
                    $plan->{$column} = $attrs[$in];
                }
            }
            $plan->save();

            if (array_key_exists('isDefault', $attrs)) {
                if ($attrs['isDefault']) {
                    $this->makeDefault($plan);
                } elseif ($plan->is_default) {
                    $plan->forceFill(['is_default' => false])->save();
                }
            }

            $this->log->log($admin, ActivityLogger::PLAN_UPDATED, 'plan', $plan->id, $before,
                $plan->only(['name', 'description', 'display_order', 'is_public', 'is_default', 'allows_requests']));

            $this->resolver->forget();

            return $plan->fresh(['versions.entitlements', 'versions.prices']);
        });
    }

    public function changeStatus(User $admin, Plan $plan, string $status): Plan
    {
        if (! in_array($status, Plan::STATUSES, true)) {
            throw new DomainException('État d\'offre inconnu.');
        }
        if ($status === Plan::STATUS_ACTIVE && $plan->currentVersion === null) {
            throw new DomainException('Publiez une version avant d\'activer l\'offre.');
        }
        if ($status === Plan::STATUS_ARCHIVED && $plan->is_default) {
            throw new DomainException('L\'offre par défaut ne peut pas être archivée : désignez-en une autre d\'abord.');
        }

        $before = $plan->status;
        $plan->forceFill(['status' => $status])->save();

        $this->log->log($admin, ActivityLogger::PLAN_STATUS_CHANGED, 'plan', $plan->id, ['status' => $before], ['status' => $status]);
        $this->resolver->forget();

        return $plan;
    }

    /** Une copie en brouillon, avec le contenu de la version courante (ou de la dernière). */
    public function duplicate(User $admin, Plan $plan, ?string $name = null): Plan
    {
        return DB::transaction(function () use ($admin, $plan, $name) {
            $source = $plan->currentVersion ?? $plan->versions()->orderByDesc('version')->first();

            $copy = Plan::create([
                'slug' => $this->uniqueSlug($plan->slug.'-copie'),
                'name' => $name ?? ($plan->name.' (copie)'),
                'description' => $plan->description,
                'type' => $plan->type,
                'status' => Plan::STATUS_DRAFT,
                'display_order' => $plan->display_order,
                'is_public' => false,
                'is_default' => false,
                'allows_requests' => $plan->allows_requests,
            ]);

            $version = PlanVersion::create([
                'plan_id' => $copy->id,
                'version' => 1,
                'status' => PlanVersion::STATUS_DRAFT,
                'created_by' => $admin->id,
                'notes' => 'Copie de '.$plan->slug.($source ? ' v'.$source->version : ''),
            ]);
            if ($source !== null) {
                $this->copyContent($source, $version);
            }

            $this->log->log($admin, ActivityLogger::PLAN_DUPLICATED, 'plan', $copy->id, null, ['from' => $plan->slug, 'slug' => $copy->slug]);

            return $copy->fresh(['versions.entitlements', 'versions.prices']);
        });
    }

    /** Une nouvelle version en BROUILLON, copiée de la courante. */
    public function createVersion(User $admin, Plan $plan, ?string $notes = null): PlanVersion
    {
        return DB::transaction(function () use ($admin, $plan, $notes) {
            if ($plan->versions()->where('status', PlanVersion::STATUS_DRAFT)->exists()) {
                throw new DomainException('Une version en brouillon existe déjà : modifiez-la ou publiez-la.');
            }

            $source = $plan->currentVersion ?? $plan->versions()->orderByDesc('version')->first();
            $number = (int) $plan->versions()->max('version') + 1;

            $version = PlanVersion::create([
                'plan_id' => $plan->id,
                'version' => $number,
                'status' => PlanVersion::STATUS_DRAFT,
                'created_by' => $admin->id,
                'notes' => $notes,
            ]);
            if ($source !== null) {
                $this->copyContent($source, $version);
            }

            $this->log->log($admin, ActivityLogger::PLAN_VERSION_CREATED, 'plan', $plan->id, null, ['version' => $number]);

            return $version->fresh(['entitlements', 'prices']);
        });
    }

    /**
     * Régler limites, fonctionnalités et prix d'une version — en BROUILLON
     * seulement. Une version figée renvoie vers « Nouvelle version ».
     *
     * @param  array<string, mixed>|null  $entitlements
     * @param  array<string, mixed>|null  $price
     */
    public function updateVersion(User $admin, PlanVersion $version, ?array $entitlements, ?array $price, ?string $notes = null, ?array $pricingTiers = null): PlanVersion
    {
        if ($version->status !== PlanVersion::STATUS_DRAFT || $version->isFrozen()) {
            throw new DomainException('Cette version est figée : créez une nouvelle version pour la modifier.');
        }

        return DB::transaction(function () use ($admin, $version, $entitlements, $price, $notes, $pricingTiers) {
            if ($notes !== null) {
                $version->forceFill(['notes' => $notes])->save();
            }
            $this->writeVersionContent($version, $entitlements, $price);

            $this->log->log($admin, ActivityLogger::PLAN_VERSION_UPDATED, 'plan', $version->plan_id, null, [
                'version' => $version->version, 'entitlements' => $entitlements, 'price' => $price,
            ]);

            if ($pricingTiers !== null) {
                $before = $version->pricingTiers()->get()->map(fn (PlanPricingTier $t) => TeacherPricingService::serializeTier($t))->all();
                $this->writeTiers($version, $pricingTiers);
                $after = $version->pricingTiers()->get()->map(fn (PlanPricingTier $t) => TeacherPricingService::serializeTier($t))->all();

                $this->log->log($admin, ActivityLogger::PLAN_PRICING_TIERS_UPDATED, 'plan', $version->plan_id,
                    ['version' => $version->version, 'tiers' => $before],
                    ['version' => $version->version, 'tiers' => $after]);
            }

            $this->resolver->forget();

            return $version->fresh(['entitlements', 'prices', 'pricingTiers']);
        });
    }

    /**
     * La grille de prix par élève d'une version en BROUILLON — remplacée
     * d'un bloc, après validation (continuité, bornes, prix).
     *
     * @param  array<int, array<string, mixed>>  $rows
     *
     * @throws DomainException
     */
    public function replacePricingTiers(User $admin, PlanVersion $version, array $rows): PlanVersion
    {
        return $this->updateVersion($admin, $version, null, null, null, $rows);
    }

    /**
     * Le devis d'une version pour N élèves — l'aperçu de l'administration,
     * par le même calcul que la demande et l'activation.
     *
     * @return array<string, mixed>
     */
    public function quote(PlanVersion $version, int $students): array
    {
        return $this->pricing->quote($version, $students);
    }

    /** @param array<int, array<string, mixed>> $rows */
    private function writeTiers(PlanVersion $version, array $rows): void
    {
        $tiers = $this->pricing->validateTiers($rows);

        $version->pricingTiers()->delete();
        foreach ($tiers as $tier) {
            PlanPricingTier::create(['plan_version_id' => $version->id] + $tier);
        }
        $version->unsetRelation('pricingTiers');
    }

    /** Publier : elle devient courante, la précédente est remplacée. */
    public function publishVersion(User $admin, PlanVersion $version): PlanVersion
    {
        if ($version->status !== PlanVersion::STATUS_DRAFT) {
            throw new DomainException('Seule une version en brouillon peut être publiée.');
        }

        return DB::transaction(function () use ($admin, $version) {
            PlanVersion::where('plan_id', $version->plan_id)
                ->where('status', PlanVersion::STATUS_CURRENT)
                ->update(['status' => PlanVersion::STATUS_SUPERSEDED]);

            $version->forceFill(['status' => PlanVersion::STATUS_CURRENT, 'published_at' => Carbon::now()])->save();

            $this->log->log($admin, ActivityLogger::PLAN_VERSION_PUBLISHED, 'plan', $version->plan_id, null, ['version' => $version->version]);
            $this->resolver->forget();

            return $version->fresh(['entitlements', 'prices']);
        });
    }

    /** @return array<int, array<string, mixed>> */
    public function subscribers(Plan $plan): array
    {
        return Subscription::whereIn('plan_version_id', $plan->versions()->select('id'))
            ->with(['user:id,first_name,last_name,email,role', 'planVersion:id,version'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Subscription $s) => [
                'id' => $s->id,
                'userId' => $s->user_id,
                'userEmail' => $s->user?->email,
                'userName' => trim(($s->user?->first_name ?? '').' '.($s->user?->last_name ?? '')),
                'userRole' => $s->user?->role,
                'planVersion' => $s->planVersion?->version,
                'status' => $s->status,
                'running' => $s->isRunning(),
                'startedAt' => optional($s->started_at)->toIso8601String(),
                'endsAt' => optional($s->ends_at)->toIso8601String(),
                'acquisitionSource' => $s->acquisition_source,
                'studentSeatLimit' => $s->student_seat_limit,
                'seatTotalCents' => $s->seat_total_cents,
            ])
            ->all();
    }

    /** Relever (ou abaisser) UNE clé pour UN compte, avec motif et terme. */
    public function grantOverride(User $admin, User $user, string $key, mixed $value, ?string $reason, ?Carbon $endsAt): PlanEntitlementOverride
    {
        if (! EntitlementKeys::exists($key)) {
            throw new DomainException('Clé d\'offre inconnue.');
        }
        if ($endsAt !== null && $endsAt->lessThanOrEqualTo(Carbon::now())) {
            throw new DomainException('La date de fin doit être dans le futur.');
        }
        if ($user->isAdmin()) {
            throw new DomainException('Un administrateur n\'a pas d\'offre.');
        }

        return DB::transaction(function () use ($admin, $user, $key, $value, $reason, $endsAt) {
            // Une seule dérogation active par clé : la nouvelle remplace.
            PlanEntitlementOverride::where('user_id', $user->id)->where('key', $key)->whereNull('revoked_at')
                ->update(['revoked_at' => Carbon::now(), 'revoked_by' => $admin->id]);

            $override = PlanEntitlementOverride::create([
                'user_id' => $user->id,
                'key' => $key,
                'value' => EntitlementKeys::normalize($key, $value),
                'reason' => $reason,
                'starts_at' => Carbon::now(),
                'ends_at' => $endsAt,
                'created_by' => $admin->id,
            ]);

            $this->log->log($admin, ActivityLogger::PLAN_OVERRIDE_GRANTED, 'user', $user->id, null, [
                'override_id' => $override->id, 'key' => $key, 'value' => $override->value,
                'reason' => $reason, 'ends_at' => optional($endsAt)->toIso8601String(),
            ]);
            $this->resolver->forget($user);

            return $override;
        });
    }

    public function revokeOverride(User $admin, User $user, int $overrideId, ?string $reason = null): PlanEntitlementOverride
    {
        $override = PlanEntitlementOverride::where('user_id', $user->id)->whereKey($overrideId)->first();
        if ($override === null) {
            throw new DomainException('Dérogation introuvable.');
        }
        if ($override->revoked_at !== null) {
            throw new DomainException('Cette dérogation est déjà retirée.');
        }

        $override->forceFill(['revoked_at' => Carbon::now(), 'revoked_by' => $admin->id])->save();

        $this->log->log($admin, ActivityLogger::PLAN_OVERRIDE_REVOKED, 'user', $user->id, null, [
            'override_id' => $override->id, 'key' => $override->key, 'reason' => $reason,
        ]);
        $this->resolver->forget($user);

        return $override;
    }

    /** @return array<int, array<string, mixed>> */
    public function overridesOf(User $user): array
    {
        return PlanEntitlementOverride::where('user_id', $user->id)
            ->with(['createdBy:id,first_name,last_name', 'revokedBy:id,first_name,last_name'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (PlanEntitlementOverride $o) => [
                'id' => $o->id,
                'key' => $o->key,
                'label' => EntitlementKeys::all()[$o->key]['label'] ?? $o->key,
                'value' => $o->value,
                'reason' => $o->reason,
                'active' => $o->isActive(),
                'startsAt' => optional($o->starts_at)->toIso8601String(),
                'endsAt' => optional($o->ends_at)->toIso8601String(),
                'createdBy' => $o->createdBy === null ? null : trim($o->createdBy->first_name.' '.$o->createdBy->last_name),
                'revokedAt' => optional($o->revoked_at)->toIso8601String(),
                'revokedBy' => $o->revokedBy === null ? null : trim($o->revokedBy->first_name.' '.$o->revokedBy->last_name),
            ])
            ->all();
    }

    /** @return array<string, mixed> */
    public static function serializePlan(Plan $plan, bool $withVersions = false): array
    {
        $current = $plan->relationLoaded('currentVersion') ? $plan->currentVersion : $plan->currentVersion()->with('activePrice')->first();

        $data = [
            'id' => $plan->id,
            'slug' => $plan->slug,
            'name' => $plan->name,
            'description' => $plan->description,
            'type' => $plan->type,
            'status' => $plan->status,
            'displayOrder' => $plan->display_order,
            'isPublic' => $plan->is_public,
            'isDefault' => $plan->is_default,
            'allowsRequests' => $plan->allows_requests,
            'currentVersion' => $current?->version,
            'currentVersionId' => $current?->id,
            'price' => self::serializePrice($current?->activePrice),
            // Par sièges : la grille de la version courante, pour les sélecteurs.
            'seatBased' => $current?->isSeatBased() ?? false,
            'pricingTiers' => $current === null ? [] : app(TeacherPricingService::class)->tiersFor($current)->map(fn (PlanPricingTier $t) => TeacherPricingService::serializeTier($t))->values()->all(),
            'versionsCount' => $plan->versions_count ?? null,
            'createdAt' => optional($plan->created_at)->toIso8601String(),
            'updatedAt' => optional($plan->updated_at)->toIso8601String(),
        ];

        if ($withVersions) {
            $data['versions'] = $plan->versions->map(fn (PlanVersion $v) => self::serializeVersion($v))->values()->all();
        }

        return $data;
    }

    /** @return array<string, mixed> */
    public static function serializeVersion(PlanVersion $v): array
    {
        $v->loadMissing(['entitlements', 'prices', 'pricingTiers', 'createdBy:id,first_name,last_name']);
        $price = $v->prices->firstWhere('status', PlanPrice::STATUS_ACTIVE) ?? $v->prices->first();

        return [
            'id' => $v->id,
            'version' => $v->version,
            'status' => $v->status,
            'frozen' => $v->isFrozen(),
            'notes' => $v->notes,
            'entitlements' => $v->entitlementMap(),
            'price' => self::serializePrice($price),
            'seatBased' => $v->isSeatBased(),
            'pricingTiers' => app(TeacherPricingService::class)->tiersFor($v, activeOnly: false)->map(fn (PlanPricingTier $t) => TeacherPricingService::serializeTier($t))->values()->all(),
            'createdBy' => $v->createdBy === null ? null : trim($v->createdBy->first_name.' '.$v->createdBy->last_name),
            'publishedAt' => optional($v->published_at)->toIso8601String(),
            'createdAt' => optional($v->created_at)->toIso8601String(),
            'subscriptionsCount' => $v->subscriptions()->count(),
        ];
    }

    /** @return array<string, mixed>|null */
    public static function serializePrice(?PlanPrice $price): ?array
    {
        if ($price === null) {
            return null;
        }

        return [
            'id' => $price->id,
            'currency' => $price->currency,
            'amountCents' => $price->amount_cents,
            'billingInterval' => $price->billing_interval,
            'intervalCount' => $price->interval_count,
            'durationDays' => $price->durationDays(),
            'trialDays' => $price->trial_days,
            'status' => $price->status,
        ];
    }

    /**
     * @param  array<string, mixed>|null  $entitlements
     * @param  array<string, mixed>|null  $price
     */
    private function writeVersionContent(PlanVersion $version, ?array $entitlements, ?array $price): void
    {
        if ($entitlements !== null) {
            foreach ($entitlements as $key => $value) {
                if (! EntitlementKeys::exists($key)) {
                    throw new DomainException("Clé d'offre inconnue : {$key}.");
                }
                PlanEntitlement::updateOrCreate(
                    ['plan_version_id' => $version->id, 'key' => $key],
                    ['value' => EntitlementKeys::normalize($key, $value)],
                );
            }
        }

        if ($price !== null) {
            if (isset($price['billingInterval']) && ! in_array($price['billingInterval'], PlanPrice::INTERVALS, true)) {
                throw new DomainException('Périodicité inconnue.');
            }
            $attributes = array_filter([
                'currency' => isset($price['currency']) ? strtoupper((string) $price['currency']) : null,
                'amount_cents' => isset($price['amountCents']) ? (int) $price['amountCents'] : null,
                'billing_interval' => $price['billingInterval'] ?? null,
                'interval_count' => isset($price['intervalCount']) ? max(1, (int) $price['intervalCount']) : null,
                'trial_days' => isset($price['trialDays']) ? (int) $price['trialDays'] : null,
            ], fn ($v) => $v !== null);
            if (array_key_exists('durationDays', $price)) {
                $attributes['duration_days'] = $price['durationDays'] === null ? null : (int) $price['durationDays'];
            }

            $existing = $version->prices()->where('status', PlanPrice::STATUS_ACTIVE)->first();
            if ($existing !== null) {
                $existing->fill($attributes)->save();
            } else {
                PlanPrice::create(['plan_version_id' => $version->id] + $attributes);
            }
        }
    }

    private function copyContent(PlanVersion $from, PlanVersion $to): void
    {
        foreach ($from->entitlements as $row) {
            PlanEntitlement::create(['plan_version_id' => $to->id, 'key' => $row->key, 'value' => $row->value]);
        }
        foreach ($from->prices as $price) {
            PlanPrice::create(['plan_version_id' => $to->id] + $price->only([
                'currency', 'amount_cents', 'billing_interval', 'interval_count', 'duration_days', 'trial_days', 'status',
            ]));
        }
        foreach ($from->pricingTiers()->get() as $tier) {
            PlanPricingTier::create(['plan_version_id' => $to->id] + $tier->only([
                'min_students', 'max_students', 'price_per_student_cents', 'currency', 'sort_order', 'is_active',
            ]));
        }
    }

    /** Une seule offre par défaut par type. */
    private function makeDefault(Plan $plan): void
    {
        Plan::where('type', $plan->type)->where('id', '!=', $plan->id)->update(['is_default' => false]);
        $plan->forceFill(['is_default' => true])->save();
    }

    private function uniqueSlug(string $base): string
    {
        $base = Str::slug($base) ?: 'offre';
        $slug = $base;
        $i = 2;
        while (Plan::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
