<?php

namespace App\Domain\Practice;

use DomainException;
use Illuminate\Support\Facades\Cache;

/**
 * Lit le contenu d'exercices depuis les fichiers versionnés.
 *
 * Le contenu ne vit pas en base, par la même raison que la banque du
 * diagnostic et que coursesData.js : il se relit en revue, il se livre avec
 * le code, et il n'a pas besoin d'un back-office. `exercise_id` est donc une
 * chaîne dans les tables d'activité, jamais une clé étrangère.
 *
 * Ce dépôt sert ici l'INVENTAIRE (quels exercices, à quel niveau) et la
 * lecture d'un exercice. La correction, elle, se fait côté client dans cette
 * phase — même frontière de confiance que le test final, documentée dans
 * LEARNING_ARCHITECTURE.md : le contenu des questions vit hors du serveur,
 * qui valide les relations plutôt que de recalculer la justesse.
 */
class ExerciseRepository
{
    public function contentPath(): string
    {
        $path = config('practice.content_path');
        if (! is_string($path) || ! is_dir($path)) {
            // Un message explicite plutôt qu'un Hub vide et silencieux : sur un
            // déploiement où content/ n'a pas été synchronisé, c'est la seule
            // chose qui dise ce qui manque.
            throw new DomainException('Contenu de pratique introuvable : '.(string) $path);
        }

        return $path;
    }

    /**
     * Inventaire d'une leçon : niveau → liste d'identifiants, lu depuis
     * l'index généré par scripts/validate-exercises.mjs pour ne pas ouvrir
     * quinze fichiers à chaque affichage du Hub.
     *
     * @return array<int, string[]>
     */
    public function indexFor(string $lessonCode): array
    {
        $index = Cache::remember('practice:index', config('practice.cache_ttl', 3600), function () {
            $file = $this->contentPath().'/index.generated.json';

            return is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        });

        $levels = $index[$lessonCode] ?? [];
        $out = [];
        foreach ($levels as $level => $ids) {
            $out[(int) $level] = is_array($ids) ? $ids : [];
        }
        ksort($out);

        return $out;
    }

    /** Combien d'exercices par niveau, pour le Hub. */
    public function countsByLevel(string $lessonCode): array
    {
        return array_map('count', $this->indexFor($lessonCode));
    }

    /** Tous les identifiants d'exercice d'une leçon, tous niveaux confondus. */
    public function allIdsFor(string $lessonCode): array
    {
        return array_merge(...array_values($this->indexFor($lessonCode)) ?: [[]]);
    }

    /**
     * Un exercice, avec ses réponses attendues. Le serveur ne s'en sert pas
     * pour corriger dans cette phase, mais il en a besoin pour valider qu'un
     * identifiant soumis existe bien, et pour retrouver ses learning points.
     */
    public function find(string $lessonCode, string $exerciseId): ?array
    {
        return Cache::remember(
            "practice:exercise:{$lessonCode}:{$exerciseId}",
            config('practice.cache_ttl', 3600),
            function () use ($lessonCode, $exerciseId) {
                foreach ($this->indexFor($lessonCode) as $level => $ids) {
                    if (! in_array($exerciseId, $ids, true)) {
                        continue;
                    }
                    foreach (glob($this->contentPath()."/*/{$lessonCode}/level-{$level}/{$exerciseId}.json") ?: [] as $file) {
                        $decoded = json_decode((string) file_get_contents($file), true);
                        if (is_array($decoded)) {
                            return $decoded;
                        }
                    }
                }

                return null;
            }
        );
    }

    /** La question d'un exercice, ou null. */
    public function findQuestion(string $lessonCode, string $exerciseId, string $questionId): ?array
    {
        foreach ($this->find($lessonCode, $exerciseId)['questions'] ?? [] as $question) {
            if (($question['id'] ?? null) === $questionId) {
                return $question;
            }
        }

        return null;
    }
}
