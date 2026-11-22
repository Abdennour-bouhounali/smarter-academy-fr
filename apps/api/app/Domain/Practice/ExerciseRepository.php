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
    /**
     * Mémoire de la REQUÊTE (l'instance est un singleton, AppServiceProvider).
     *
     * Le cache Laravel vit en base en production (CACHE_STORE=database) : chaque
     * `Cache::get` est une requête SQL, et l'index (≈ 180 Ko) se désérialise à
     * chaque fois. Le défi du jour appelait `find()` pour chaque candidat, puis
     * de nouveau pour le meilleur : 16 343 requêtes SQL et ≈ 7 s pour le premier
     * appel de la journée (mesuré le 2026-10-17). Les deux tableaux ci-dessous
     * ramènent cela à UNE lecture de l'index et une lecture par exercice.
     * Clés préfixées par le dossier de contenu : un test qui en change relit tout.
     */
    private array $indexMemo = [];

    private array $exerciseMemo = [];

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
        $index = $this->index();
        if ($index === null) {
            return [];
        }

        $levels = $index[$lessonCode] ?? [];
        $out = [];
        foreach ($levels as $level => $ids) {
            $out[(int) $level] = is_array($ids) ? $ids : [];
        }
        ksort($out);

        return $out;
    }

    /** L'index généré, une fois par requête ; null s'il n'existe pas encore. */
    private function index(): ?array
    {
        $path = (string) config('practice.content_path');
        if (array_key_exists($path, $this->indexMemo)) {
            return $this->indexMemo[$path];
        }

        $index = Cache::get('practice:index');
        if (! is_array($index)) {
            $file = $this->contentPath().'/index.generated.json';
            // Index absent : on ne met rien en cache (même raison que
            // PracticeCapability::activeLessons) — il sera relu dès qu'il existe.
            if (! is_file($file)) {
                return null;
            }
            $index = json_decode((string) file_get_contents($file), true) ?: [];
            Cache::put('practice:index', $index, config('practice.cache_ttl', 3600));
        }

        return $this->indexMemo[$path] = $index;
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
        return $this->lessonExercises($lessonCode)[$exerciseId] ?? null;
    }

    /**
     * Tous les exercices d'une leçon (identifiant → contenu), sous UNE clé de
     * cache par leçon et une fois par requête. Une clé par exercice coûtait
     * une requête SQL par exercice lu (cache en base) : le défi du jour en
     * lisait plus de trois mille au premier appel de la journée.
     *
     * @return array<string, array>
     */
    private function lessonExercises(string $lessonCode): array
    {
        $memoKey = config('practice.content_path')."|{$lessonCode}";
        if (array_key_exists($memoKey, $this->exerciseMemo)) {
            return $this->exerciseMemo[$memoKey];
        }

        $levels = $this->indexFor($lessonCode);
        if ($levels === []) {
            return $this->exerciseMemo[$memoKey] = [];
        }

        return $this->exerciseMemo[$memoKey] = Cache::remember(
            "practice:lesson:{$lessonCode}",
            config('practice.cache_ttl', 3600),
            function () use ($lessonCode, $levels) {
                $exercises = [];
                foreach ($levels as $level => $ids) {
                    $wanted = array_flip($ids);
                    foreach (glob($this->contentPath()."/*/{$lessonCode}/level-{$level}/*.json") ?: [] as $file) {
                        $id = basename($file, '.json');
                        if (! isset($wanted[$id]) || isset($exercises[$id])) {
                            continue;
                        }
                        $decoded = json_decode((string) file_get_contents($file), true);
                        if (is_array($decoded)) {
                            $exercises[$id] = $decoded;
                        }
                    }
                }

                return $exercises;
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
