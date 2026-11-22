<?php

namespace App\Domain\Access\Features;

use App\Domain\MathLab\MathLabTools;

/**
 * Le VOCABULAIRE des fonctionnalités réglables par palier — clos, dans le
 * code. Les VALEURS (qui a accès, combien) sont en base
 * (feature_access_policies) et l'administration les change sans déploiement.
 *
 * Même partage que EntitlementKeys pour les offres : le code dit ce qu'une
 * clé VEUT DIRE, la base dit ce qu'elle VAUT. Une clé absente d'ici est
 * refusée par l'API d'administration (422).
 *
 * Trois familles :
 *
 *   math_lab_tool   math_lab.tool.<id> — un instrument du مختبر. Accès par
 *                   palier, SANS quota : ouvrir un instrument ne consomme
 *                   rien. La liste se DÉRIVE de MathLabTools : un instrument
 *                   ajouté au registre serveur a aussitôt sa ligne ici.
 *   notebook        le cahier (كرّاسي). Quota : `notebook_copy`.
 *   documents       les travaux enregistrés du مختبر. Quota :
 *                   `document_generation`.
 *   thinking_lab    « مختبر التفكير » : l'échelle des défis (`thinking_lab.ladder`).
 *                   Accès par palier, sans quota ; ouverte aux deux paliers tant
 *                   que l'administration ne la ferme pas (plan §17 n° 4, proposé).
 *
 * Deux TYPES DE CONSOMMATION, jamais additionnés :
 *
 *   document_generation   un NOUVEAU travail du مختبر enregistré sur le
 *                         serveur : la première sauvegarde d'un document
 *                         neuf (POST /math-lab/documents) ou une copie
 *                         (POST …/duplicate). La sauvegarde automatique
 *                         (PATCH), le renommage, les pièces jointes, l'export
 *                         PNG (dans le navigateur) ne comptent pas.
 *   notebook_copy         une NOUVELLE note du cahier (POST /practice/notes),
 *                         d'où qu'elle vienne : leçon, exercice, « أضف إلى
 *                         كرّاسي », مختبر. La modifier, la réviser,
 *                         l'archiver ou l'imprimer ne compte pas.
 *
 * Supprimer l'objet créé ne REMBOURSE pas : c'est une consommation, pas un
 * stock (docs/architecture/ACCESS_AND_LIMITS.md §4).
 *
 * Une fonctionnalité SANS ligne en base vaut `defaults()` : ouverte aux deux
 * paliers, sans limite. Même règle que le palier d'une leçon — rien ne se
 * ferme parce qu'une donnée manque ; se fermer est une décision.
 */
final class FeatureRegistry
{
    public const TOOL_PREFIX = 'math_lab.tool.';

    public const NOTEBOOK = 'notebook';

    public const MATH_LAB_DOCUMENTS = 'math_lab.documents';

    public const GROUP_MATH_LAB_TOOL = 'math_lab_tool';

    public const GROUP_NOTEBOOK = 'notebook';

    public const GROUP_DOCUMENTS = 'documents';

    /** « مختبر التفكير » : l'échelle des défis (THINKING_LAB.md). Accès par palier, sans quota. */
    public const THINKING_LAB_LADDER = 'thinking_lab.ladder';

    public const GROUP_THINKING_LAB = 'thinking_lab';

    public const USAGE_DOCUMENT_GENERATION = 'document_generation';

    public const USAGE_NOTEBOOK_COPY = 'notebook_copy';

    public const USAGE_TYPES = [self::USAGE_DOCUMENT_GENERATION, self::USAGE_NOTEBOOK_COPY];

    public const PERIOD_MONTH = 'month';

    public const PERIOD_LIFETIME = 'lifetime';

    public const PERIODS = [self::PERIOD_MONTH, self::PERIOD_LIFETIME];

    /**
     * @return array<string, array{group: string, usageType: ?string, toolId: ?string}>
     */
    public static function all(): array
    {
        $features = [];
        foreach (MathLabTools::ids() as $tool) {
            $features[self::toolKey($tool)] = ['group' => self::GROUP_MATH_LAB_TOOL, 'usageType' => null, 'toolId' => $tool];
        }
        $features[self::NOTEBOOK] = ['group' => self::GROUP_NOTEBOOK, 'usageType' => self::USAGE_NOTEBOOK_COPY, 'toolId' => null];
        $features[self::MATH_LAB_DOCUMENTS] = ['group' => self::GROUP_DOCUMENTS, 'usageType' => self::USAGE_DOCUMENT_GENERATION, 'toolId' => null];
        $features[self::THINKING_LAB_LADDER] = ['group' => self::GROUP_THINKING_LAB, 'usageType' => null, 'toolId' => null];

        return $features;
    }

    public static function exists(string $key): bool
    {
        return array_key_exists($key, self::all());
    }

    /** @return array{group: string, usageType: ?string, toolId: ?string}|null */
    public static function meta(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    public static function hasQuota(string $key): bool
    {
        return (self::meta($key)['usageType'] ?? null) !== null;
    }

    public static function toolKey(string $toolId): string
    {
        return self::TOOL_PREFIX.$toolId;
    }

    /**
     * La valeur d'une fonctionnalité que personne n'a encore réglée.
     *
     * @return array{is_enabled: bool, free_allowed: bool, premium_allowed: bool, free_quota: ?int, premium_quota: ?int, quota_period: string}
     */
    public static function defaults(): array
    {
        return [
            'is_enabled' => true,
            'free_allowed' => true,
            'premium_allowed' => true,
            'free_quota' => null,
            'premium_quota' => null,
            'quota_period' => self::PERIOD_MONTH,
        ];
    }
}
