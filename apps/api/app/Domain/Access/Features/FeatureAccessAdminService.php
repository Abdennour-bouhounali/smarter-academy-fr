<?php

namespace App\Domain\Access\Features;

use App\Domain\Access\AccessTier;
use App\Domain\Admin\ActivityLogger;
use App\Models\FeatureAccessPolicy;
use App\Models\UsageEvent;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * « الوصول والحدود » côté administration : lire la configuration, la
 * modifier (validée, journalisée), et lire la consommation.
 *
 * La SEULE écriture de feature_access_policies. Une modification prend effet
 * à la requête suivante de chaque utilisateur — aucun cache ne survit à la
 * requête, aucun déploiement, aucune reconstruction du client.
 */
class FeatureAccessAdminService
{
    public function __construct(
        private FeatureAccessService $access,
        private ActivityLogger $log,
    ) {}

    /** @return array<int, array<string, mixed>> */
    public function list(): array
    {
        $rows = [];
        foreach (FeatureRegistry::all() as $key => $meta) {
            $rows[] = $this->present($key, $meta, $this->access->policy($key));
        }

        return $rows;
    }

    /**
     * Remplace le réglage d'UNE fonctionnalité.
     *
     * Forme attendue (camelCase, comme le reste de l'API) :
     *   { enabled: bool,
     *     free:    { allowed: bool, unlimited?: bool, limit?: int },
     *     premium: { allowed: bool, unlimited?: bool, limit?: int },
     *     period?: 'month' | 'lifetime' }
     *
     * `unlimited` est EXPLICITE : une limite absente n'est pas « illimité »,
     * c'est une erreur. Les limites ne s'acceptent que pour une
     * fonctionnalité qui a un quota.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     *
     * @throws DomainException message lisible, rendu en 422
     */
    public function update(User $admin, string $key, array $input): array
    {
        $meta = FeatureRegistry::meta($key) ?? throw new DomainException("Fonctionnalité inconnue : {$key}.");
        $hasQuota = $meta['usageType'] !== null;

        if (! array_key_exists('enabled', $input) || ! is_bool($input['enabled'])) {
            throw new DomainException('« enabled » doit être oui ou non.');
        }

        $values = ['is_enabled' => $input['enabled']];
        foreach (AccessTier::TIERS as $tier) {
            $block = $input[$tier] ?? null;
            if (! is_array($block) || ! array_key_exists('allowed', $block) || ! is_bool($block['allowed'])) {
                throw new DomainException("Le palier « {$tier} » doit être configuré (allowed : oui ou non).");
            }
            $values["{$tier}_allowed"] = $block['allowed'];

            if (! $hasQuota) {
                if (array_key_exists('limit', $block) && $block['limit'] !== null) {
                    throw new DomainException('Cette fonctionnalité n\'a pas de quota.');
                }
                $values["{$tier}_quota"] = null;

                continue;
            }

            $unlimited = $block['unlimited'] ?? null;
            if (! is_bool($unlimited)) {
                throw new DomainException("Palier « {$tier} » : précisez « illimité » ou une limite.");
            }
            if ($unlimited) {
                $values["{$tier}_quota"] = null;

                continue;
            }
            $limit = $block['limit'] ?? null;
            if (! is_int($limit) || $limit < 0 || $limit > 1_000_000) {
                throw new DomainException("Palier « {$tier} » : la limite doit être un entier entre 0 et 1 000 000.");
            }
            $values["{$tier}_quota"] = $limit;
        }

        $period = $input['period'] ?? null;
        if ($period !== null && ! in_array($period, FeatureRegistry::PERIODS, true)) {
            throw new DomainException('Période inconnue.');
        }
        $values['quota_period'] = $hasQuota ? ($period ?? $this->access->policy($key)['quota_period']) : FeatureRegistry::PERIOD_MONTH;

        $before = $this->snapshot($this->access->policy($key));

        DB::transaction(function () use ($key, $values, $admin) {
            FeatureAccessPolicy::query()->updateOrCreate(['feature_key' => $key], $values + ['updated_by' => $admin->id]);
        });
        $this->access->forget();

        $policy = $this->access->policy($key);
        $this->log->log($admin, ActivityLogger::ACCESS_POLICY_UPDATED, 'feature_access_policy', $key, $before, $this->snapshot($policy));

        return $this->present($key, $meta, $policy);
    }

    /**
     * La consommation de la période EN COURS (mois civil), par palier —
     * le palier enregistré au moment de chaque consommation.
     *
     * @return array<string, mixed>
     */
    public function usageReport(): array
    {
        $window = FeatureAccessService::window(FeatureRegistry::PERIOD_MONTH);
        $events = UsageEvent::query()->where('created_at', '>=', $window['start']);

        $byType = (clone $events)
            ->select('usage_type', 'tier', DB::raw('COUNT(*) as total'), DB::raw('COUNT(DISTINCT user_id) as users'))
            ->groupBy('usage_type', 'tier')
            ->get();

        $totals = [];
        foreach (AccessTier::TIERS as $tier) {
            foreach (FeatureRegistry::USAGE_TYPES as $type) {
                $row = $byType->first(fn ($r) => $r->tier === $tier && $r->usage_type === $type);
                $totals[$tier][$type] = ['total' => (int) ($row->total ?? 0), 'users' => (int) ($row->users ?? 0)];
            }
        }

        // L'usage du مختبر PAR INSTRUMENT : les travaux créés, par palier.
        $byTool = (clone $events)
            ->where('usage_type', FeatureRegistry::USAGE_DOCUMENT_GENERATION)
            ->select('context', 'tier', DB::raw('COUNT(*) as total'))
            ->groupBy('context', 'tier')
            ->get();
        $tools = [];
        foreach ($byTool as $row) {
            $tools[$row->context ?? 'unknown'][$row->tier] = (int) $row->total;
        }

        return [
            'periodStart' => $window['start']->toIso8601String(),
            'resetsAt' => $window['resetsAt']->toIso8601String(),
            'totals' => $totals,
            'documentsByTool' => $tools,
        ];
    }

    /**
     * La consommation d'UN compte : palier, et used / limit / remaining par
     * ressource — ce que la fiche élève ou enseignant affiche.
     *
     * @return array<string, mixed>
     */
    public function usageFor(User $user): array
    {
        $summary = $this->access->summaryFor($user);
        $quotas = [];
        foreach ([FeatureRegistry::NOTEBOOK, FeatureRegistry::MATH_LAB_DOCUMENTS] as $key) {
            $feature = $summary['features'][$key];
            $quotas[$key] = ['allowed' => $feature['allowed'], 'reason' => $feature['reason'], 'quota' => $feature['quota']];
        }

        $byTool = UsageEvent::query()
            ->where('user_id', $user->id)
            ->where('usage_type', FeatureRegistry::USAGE_DOCUMENT_GENERATION)
            ->select('context', DB::raw('COUNT(*) as total'))
            ->groupBy('context')
            ->pluck('total', 'context')
            ->map(fn ($n) => (int) $n)
            ->all();

        $lockedTools = [];
        foreach ($summary['features'] as $key => $feature) {
            if ($feature['group'] === FeatureRegistry::GROUP_MATH_LAB_TOOL && ! $feature['allowed']) {
                $lockedTools[] = $feature['toolId'];
            }
        }

        return [
            'tier' => $summary['tier'],
            'tierReason' => $summary['tierReason'],
            'quotas' => $quotas,
            'documentsByToolAllTime' => $byTool,
            'lockedTools' => $lockedTools,
        ];
    }

    /**
     * @param  array{group: string, usageType: ?string, toolId: ?string}  $meta
     * @param  array<string, mixed>  $policy
     * @return array<string, mixed>
     */
    private function present(string $key, array $meta, array $policy): array
    {
        $tier = fn (string $t) => [
            'allowed' => $policy["{$t}_allowed"],
            'unlimited' => $meta['usageType'] === null ? null : $policy["{$t}_quota"] === null,
            'limit' => $policy["{$t}_quota"],
        ];

        return [
            'key' => $key,
            'group' => $meta['group'],
            'toolId' => $meta['toolId'],
            'usageType' => $meta['usageType'],
            'hasQuota' => $meta['usageType'] !== null,
            'enabled' => $policy['is_enabled'],
            'free' => $tier(AccessTier::FREE),
            'premium' => $tier(AccessTier::PREMIUM),
            'period' => $policy['quota_period'],
            'configured' => $policy['configured'],
            'updatedAt' => $policy['updated_at'],
        ];
    }

    /** @param  array<string, mixed>  $policy */
    private function snapshot(array $policy): array
    {
        return [
            'enabled' => $policy['is_enabled'],
            'free_allowed' => $policy['free_allowed'],
            'premium_allowed' => $policy['premium_allowed'],
            'free_quota' => $policy['free_quota'],
            'premium_quota' => $policy['premium_quota'],
            'period' => $policy['quota_period'],
        ];
    }
}
