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
        return Cache::remember(self::CACHE_KEY, config('practice.cache_ttl', 3600), function () {
            $path = config('practice.active_lessons_path');
            if (! is_string($path) || ! is_file($path)) {
                return [];
            }
            $decoded = json_decode((string) file_get_contents($path), true);

            return is_array($decoded) ? array_values(array_filter($decoded, 'is_string')) : [];
        });
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
