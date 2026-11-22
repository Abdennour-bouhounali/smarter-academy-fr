<?php

namespace App\Domain\Plans;

use DomainException;

/**
 * Le VOCABULAIRE des limites et fonctionnalités d'une offre — clos, typé,
 * avec une valeur par défaut.
 *
 * C'est le seul endroit qui sait ce qu'est « classrooms.max ». L'éditeur
 * d'offres de l'administration lit cette liste pour se dessiner, le
 * résolveur (PlanEntitlementResolver) la lit pour typer ce qu'il rend, et
 * une clé absente d'ici est refusée en 422 : une faute de frappe dans une
 * offre ne doit pas devenir silencieusement « pas de limite ».
 *
 * Les VALEURS, elles, ne sont jamais ici : elles vivent en base, dans
 * plan_entitlements, et l'administration les change sans déploiement.
 * Les défauts ci-dessous ne servent qu'à une version d'offre qui ne
 * mentionnerait pas une clé.
 *
 * Deux familles de limites, à ne pas confondre :
 *   capacity  → students_total.max, la CAPACITÉ COMMERCIALE : combien
 *               d'élèves distincts l'enseignant peut encadrer. C'est
 *               l'unité de vente (sièges) ; son défaut est 0 — une
 *               capacité oubliée ferme, elle n'ouvre pas. Un abonnement
 *               porte sa propre valeur (student_seat_limit), qui l'emporte.
 *   technical → classes maximum, élèves par classe :
 *               des garde-fous TECHNIQUES, jamais l'unité de vente. Leur
 *               défaut est null = illimité : les classes sont des contenants
 *               et l'enseignant en crée autant qu'il veut.
 *
 *   limit    → un entier ; null = illimité
 *   feature  → un booléen
 *   content  → une liste de codes (classes autorisées)
 */
final class EntitlementKeys
{
    public const TYPE_LIMIT = 'limit';

    public const TYPE_FEATURE = 'feature';

    public const TYPE_LIST = 'list';

    public const CLASSROOMS_MAX = 'classrooms.max';

    public const STUDENTS_PER_CLASSROOM_MAX = 'students_per_classroom.max';

    public const STUDENTS_TOTAL_MAX = 'students_total.max';

    public const LESSONS_VISIBILITY = 'lessons.visibility';

    public const LESSONS_BULK_ACTIONS = 'lessons.bulk_actions';

    public const PROGRESS_CLASS = 'progress.class';

    public const PROGRESS_STUDENT = 'progress.student';

    public const ANALYTICS_ADVANCED = 'analytics.advanced';

    public const REPORTS_EXPORT = 'reports.export';

    /** Modèle B : les élèves des classes de ce professeur ont l'accès payant par lui. */
    public const STUDENTS_COVERED = 'students.covered';

    public const CONTENT_ALLOWED_GRADES = 'content.allowed_grades';

    /**
     * @return array<string, array{type: string, category: string, default: mixed, label: string}>
     */
    public static function all(): array
    {
        return [
            self::STUDENTS_TOTAL_MAX => ['type' => self::TYPE_LIMIT, 'category' => 'capacity', 'default' => 0, 'label' => 'Sièges élèves (capacité commerciale)'],
            self::CLASSROOMS_MAX => ['type' => self::TYPE_LIMIT, 'category' => 'technical', 'default' => null, 'label' => 'Classes maximum (technique, vide = illimité)'],
            self::STUDENTS_PER_CLASSROOM_MAX => ['type' => self::TYPE_LIMIT, 'category' => 'technical', 'default' => null, 'label' => 'Élèves maximum par classe (technique)'],
            self::LESSONS_VISIBILITY => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Afficher / masquer des leçons'],
            self::LESSONS_BULK_ACTIONS => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Actions groupées sur les leçons'],
            self::PROGRESS_CLASS => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Progression de la classe'],
            self::PROGRESS_STUDENT => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Progression individuelle'],
            self::ANALYTICS_ADVANCED => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Analyses avancées'],
            self::REPORTS_EXPORT => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Export des rapports'],
            self::STUDENTS_COVERED => ['type' => self::TYPE_FEATURE, 'category' => 'features', 'default' => false, 'label' => 'Accès payant des élèves couvert par l\'enseignant'],
            self::CONTENT_ALLOWED_GRADES => ['type' => self::TYPE_LIST, 'category' => 'content', 'default' => [], 'label' => 'Classes scolaires autorisées'],
        ];
    }

    /** @return string[] */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    public static function exists(string $key): bool
    {
        return isset(self::all()[$key]);
    }

    public static function typeOf(string $key): string
    {
        return self::all()[$key]['type'] ?? throw new DomainException("Clé d'offre inconnue : {$key}.");
    }

    public static function defaultOf(string $key): mixed
    {
        $all = self::all();
        if (! array_key_exists($key, $all)) {
            throw new DomainException("Clé d'offre inconnue : {$key}.");
        }

        // array_key_exists et non `??` : null est un défaut légitime (illimité).
        return $all[$key]['default'];
    }

    /**
     * Normalise une valeur venue de l'administration selon le type de la clé.
     *
     * @throws DomainException clé inconnue ou valeur du mauvais type
     */
    public static function normalize(string $key, mixed $value): mixed
    {
        return match (self::typeOf($key)) {
            self::TYPE_LIMIT => self::normalizeLimit($key, $value),
            self::TYPE_FEATURE => self::normalizeFeature($key, $value),
            self::TYPE_LIST => self::normalizeList($key, $value),
        };
    }

    private static function normalizeLimit(string $key, mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_bool($value) || (! is_int($value) && ! (is_string($value) && ctype_digit($value)))) {
            throw new DomainException("« {$key} » attend un entier positif, ou vide pour « illimité ».");
        }
        $int = (int) $value;
        if ($int < 0) {
            throw new DomainException("« {$key} » attend un entier positif.");
        }

        return $int;
    }

    private static function normalizeFeature(string $key, mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (in_array($value, [1, 0, '1', '0', 'true', 'false'], true)) {
            return in_array($value, [1, '1', 'true'], true);
        }

        throw new DomainException("« {$key} » attend oui ou non.");
    }

    /** @return string[] */
    private static function normalizeList(string $key, mixed $value): array
    {
        if ($value === null) {
            return [];
        }
        if (! is_array($value)) {
            throw new DomainException("« {$key} » attend une liste.");
        }
        $clean = [];
        foreach ($value as $item) {
            if (! is_string($item) || $item === '') {
                throw new DomainException("« {$key} » attend une liste de codes.");
            }
            $clean[] = $item;
        }

        return array_values(array_unique($clean));
    }
}
