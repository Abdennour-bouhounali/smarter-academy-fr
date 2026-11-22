<?php

namespace App\Domain\Access\Features;

use App\Domain\Access\AccessTier;
use App\Domain\Access\EntitlementService;
use App\Models\FeatureAccessPolicy;
use App\Models\UsageEvent;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * L'AUTORITÉ sur « cet utilisateur peut-il se servir de CETTE fonctionnalité,
 * et lui en reste-t-il ? » — instruments du مختبر, cahier, travaux.
 *
 *     utilisateur
 *        ↓  EntitlementService::decide(premium)   ← le palier, jamais recalculé ailleurs
 *     palier free | premium
 *        ↓  feature_access_policies               ← ce que l'administration a réglé
 *     permis ? (interrupteur global, puis palier)
 *        ↓  usage_events dans la période          ← compté sous verrou
 *     reste-t-il une unité ?
 *
 * Aucun composant, aucun contrôleur n'écrit `if ($user->plan === …)` : ils
 * posent la question ici. Le client lit le résumé (GET /me/feature-access)
 * pour DESSINER un état ; il n'autorise rien — chaque geste protégé repasse
 * par `ensure()` ou `consume()`.
 *
 * ── L'enseignant ─────────────────────────────────────────────────────────
 * Il n'a pas de règle à part : EntitlementService le range en premium (motif
 * `teacher_role`), et il reçoit donc exactement ce que le palier premium
 * reçoit — limites comprises si l'administration en pose. Un interrupteur
 * global coupé le coupe aussi.
 *
 * ── Singleton mémorisé par requête ──────────────────────────────────────
 * Les réglages sont relus une fois par requête (vidés à la
 * frontière, AppServiceProvider) ; la CONSOMMATION, elle, n'est jamais
 * mémorisée : elle est recomptée sous verrou à chaque `consume()`.
 */
class FeatureAccessService
{
    /** @var array<string, array<string, mixed>>|null */
    private ?array $policies = null;

    public function __construct(private EntitlementService $entitlements) {}

    /**
     * Le palier de l'utilisateur, et le motif qui l'explique. Pas de mémoire
     * ici : EntitlementService a la sienne (par requête), et une seconde
     * copie survivrait à son forget() après une activation.
     *
     * @return array{tier: string, reason: string}
     */
    public function tierFor(User $user): array
    {
        $decision = $this->entitlements->decide($user, AccessTier::PREMIUM);

        return [
            'tier' => $decision->allowed ? AccessTier::PREMIUM : AccessTier::FREE,
            'reason' => $decision->reason,
        ];
    }

    /**
     * Le réglage EFFECTIF d'une fonctionnalité (ligne en base, ou défaut).
     *
     * @return array{is_enabled: bool, free_allowed: bool, premium_allowed: bool, free_quota: ?int, premium_quota: ?int, quota_period: string, configured: bool, updated_at: ?string, updated_by: ?int}
     */
    public function policy(string $key): array
    {
        if (! FeatureRegistry::exists($key)) {
            throw new \InvalidArgumentException("Fonctionnalité inconnue : {$key}.");
        }

        return $this->policies()[$key] ?? FeatureRegistry::defaults() + ['configured' => false, 'updated_at' => null, 'updated_by' => null];
    }

    /** La décision, sans rien consommer. */
    public function decide(User $user, string $key): FeatureDecision
    {
        $policy = $this->policy($key);
        $tier = $this->tierFor($user)['tier'];

        $allowed = true;
        $reason = FeatureDecision::OK;
        if (! $policy['is_enabled']) {
            [$allowed, $reason] = [false, FeatureDecision::DISABLED];
        } elseif (! $policy[$tier.'_allowed']) {
            $premiumWouldOpen = $tier === AccessTier::FREE && $policy['premium_allowed'];
            [$allowed, $reason] = [false, $premiumWouldOpen ? FeatureDecision::PREMIUM_REQUIRED : FeatureDecision::NOT_AVAILABLE];
        }

        $quota = FeatureRegistry::hasQuota($key) ? $this->quota($user, $key, $policy, $tier) : null;
        if ($allowed && $quota !== null && ! $quota['unlimited'] && $quota['remaining'] <= 0) {
            $reason = FeatureDecision::QUOTA_EXCEEDED;
        }

        return new FeatureDecision($key, $allowed, $reason, $tier, $quota);
    }

    /**
     * Refuse (FeatureAccessDenied → 403) si la fonctionnalité est fermée à cet
     * utilisateur. Ne regarde PAS le quota : ouvrir, modifier ou relire ce
     * qu'on a déjà ne consomme rien.
     */
    public function ensure(User $user, string $key): FeatureDecision
    {
        $decision = $this->decide($user, $key);
        if (! $decision->allowed) {
            throw new FeatureAccessDenied($decision);
        }

        return $decision;
    }

    /**
     * Crée ET consomme, atomiquement.
     *
     * Dans UNE transaction ouverte par le verrou de la ligne `users` : deux
     * requêtes simultanées du même compte passent l'une après l'autre, la
     * seconde recompte après que la première a écrit. Le contrôle, la
     * création ($create) et l'écriture de la consommation réussissent ou
     * échouent ensemble — un refus de quota ne laisse aucun objet créé, un
     * échec de création ne consomme rien.
     *
     * Même verrou que MathLabFileService (quotas de fichiers) : une seule
     * discipline de verrouillage par compte.
     *
     * @template T
     *
     * @param  callable(): T  $create  doit rendre l'objet créé (son `id` est gardé pour l'audit)
     * @param  string|null  $context  l'instrument du مختبر, pour un travail
     * @return T
     *
     * @throws FeatureAccessDenied
     */
    public function consume(User $user, string $key, callable $create, ?string $context = null): mixed
    {
        $meta = FeatureRegistry::meta($key);
        if ($meta === null || $meta['usageType'] === null) {
            throw new \InvalidArgumentException("« {$key} » n'a pas de quota.");
        }

        return DB::transaction(function () use ($user, $key, $create, $context, $meta) {
            User::query()->whereKey($user->id)->lockForUpdate()->first();

            // Recompté ICI, sous le verrou — jamais une valeur lue avant.
            $decision = $this->decide($user, $key);
            if (! $decision->canConsume()) {
                throw new FeatureAccessDenied($decision);
            }

            $created = $create();

            UsageEvent::create([
                'user_id' => $user->id,
                'usage_type' => $meta['usageType'],
                'feature_key' => $key,
                'context' => $context,
                'subject_id' => is_object($created) && isset($created->id) ? (int) $created->id : null,
                'tier' => $decision->tier,
            ]);

            return $created;
        });
    }

    /**
     * Tout ce que le client doit savoir pour DESSINER : le palier, et chaque
     * fonctionnalité avec sa décision et son quota.
     *
     * @return array{tier: string, tierReason: string, features: array<string, array<string, mixed>>}
     */
    public function summaryFor(User $user): array
    {
        $tier = $this->tierFor($user);
        $features = [];
        foreach (FeatureRegistry::all() as $key => $meta) {
            $decision = $this->decide($user, $key);
            $features[$key] = [
                'group' => $meta['group'],
                'toolId' => $meta['toolId'],
                'enabled' => $this->policy($key)['is_enabled'],
                'allowed' => $decision->allowed,
                'reason' => $decision->reason,
                'quota' => $decision->quota,
            ];
        }

        return ['tier' => $tier['tier'], 'tierReason' => $tier['reason'], 'features' => $features];
    }

    /**
     * Le début de la période en cours (null = depuis toujours) et la date de
     * remise à zéro. Le mois est le mois CIVIL dans le fuseau de
     * l'application (config app.timezone).
     *
     * @return array{start: ?Carbon, resetsAt: ?Carbon}
     */
    public static function window(string $period, ?Carbon $now = null): array
    {
        $now ??= Carbon::now();

        return match ($period) {
            FeatureRegistry::PERIOD_LIFETIME => ['start' => null, 'resetsAt' => null],
            default => ['start' => $now->copy()->startOfMonth(), 'resetsAt' => $now->copy()->startOfMonth()->addMonth()],
        };
    }

    /** Oublie les réglages mémorisés (après une modification, ou à la frontière de requête). */
    public function forget(): void
    {
        $this->policies = null;
    }

    /**
     * @param  array<string, mixed>  $policy
     * @return array{usageType: string, used: int, limit: ?int, remaining: ?int, unlimited: bool, period: string, resetsAt: ?string}
     */
    private function quota(User $user, string $key, array $policy, string $tier): array
    {
        $usageType = FeatureRegistry::meta($key)['usageType'];
        $limit = $policy[$tier.'_quota'];
        $window = self::window($policy['quota_period']);

        $used = UsageEvent::query()
            ->where('user_id', $user->id)
            ->where('usage_type', $usageType)
            ->when($window['start'], fn ($q, $start) => $q->where('created_at', '>=', $start))
            ->count();

        return [
            'usageType' => $usageType,
            'used' => $used,
            'limit' => $limit,
            'remaining' => $limit === null ? null : max(0, $limit - $used),
            'unlimited' => $limit === null,
            'period' => $policy['quota_period'],
            'resetsAt' => $window['resetsAt']?->toIso8601String(),
        ];
    }

    /** @return array<string, array<string, mixed>> */
    private function policies(): array
    {
        if ($this->policies === null) {
            $this->policies = FeatureAccessPolicy::query()->get()->mapWithKeys(fn (FeatureAccessPolicy $p) => [
                $p->feature_key => [
                    'is_enabled' => (bool) $p->is_enabled,
                    'free_allowed' => (bool) $p->free_allowed,
                    'premium_allowed' => (bool) $p->premium_allowed,
                    'free_quota' => $p->free_quota,
                    'premium_quota' => $p->premium_quota,
                    'quota_period' => in_array($p->quota_period, FeatureRegistry::PERIODS, true) ? $p->quota_period : FeatureRegistry::PERIOD_MONTH,
                    'configured' => true,
                    'updated_at' => $p->updated_at?->toIso8601String(),
                    'updated_by' => $p->updated_by,
                ],
            ])->all();
        }

        return $this->policies;
    }
}
