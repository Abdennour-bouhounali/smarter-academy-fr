<?php

namespace App\Domain\Practice;

use DomainException;
use Illuminate\Support\Facades\Cache;

/**
 * Quelles leçons ont la pratique activée.
 *
 * Un seul endroit, pour que l'activation ne se disperse pas en `if ($lessonId
 * === 'fonction-affine-2nde')` à travers l'application. Même patron que
 * DiagnosticEngine::PROVIDERS, qui règle déjà le même problème : un niveau a
 * un diagnostic, sept n'en ont pas.
 *
 * La source est content/practice/active.json, partagée avec le frontend et le
 * validateur de contenu — trois copies d'une même liste dériveraient.
 */
class PracticeCapability
{
    private const CACHE_KEY = 'practice:active-lessons';

    /** @return string[] */
    public static function activeLessons(): array
    {
        $cached = Cache::get(self::CACHE_KEY);
        if (is_array($cached)) {
            return $cached;
        }

        $path = self::path();
        // Fichier ABSENT : une panne de déploiement, pas un choix éditorial.
        // On ne la met PAS en cache — sinon l'arrivée du fichier resterait
        // invisible une heure, pendant laquelle chaque aperçu de pratique
        // répondrait 422 (constaté en production le 2026-09-25 : le pipeline
        // ne livrait pas content/practice/). `smarter:practice:check` la
        // refuse au déploiement.
        if ($path === null) {
            return [];
        }
        $decoded = json_decode((string) file_get_contents($path), true);
        $lessons = is_array($decoded) ? array_values(array_filter($decoded, 'is_string')) : [];
        Cache::put(self::CACHE_KEY, $lessons, config('practice.cache_ttl', 3600));

        return $lessons;
    }

    /** Le chemin de active.json s'il existe, sinon null. */
    public static function path(): ?string
    {
        $path = config('practice.active_lessons_path');

        return is_string($path) && is_file($path) ? $path : null;
    }

    public static function isActive(string $lessonCode): bool
    {
        return in_array($lessonCode, self::activeLessons(), true);
    }

    /**
     * Appelée en tête des deux seuls points d'entrée qui créent quelque chose
     * (ouvrir une séance, lire l'aperçu). Tout le reste exige une séance, donc
     * hérite du contrôle.
     */
    public static function assertActive(string $lessonCode): void
    {
        if (! self::isActive($lessonCode)) {
            throw new DomainException("La pratique n'est pas encore disponible pour cette leçon.");
        }
    }

    /** Pour les tests, qui changent la liste entre deux cas. */
    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
