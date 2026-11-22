<?php

namespace App\Domain\Compass;

use DomainException;

/**
 * La banque de questions de « بوصلتي » : كفاءة → niveau (1, 2) → références
 * « leçon/exercice/question » de la banque de pratique. Générée par
 * scripts/generate-compass-index.mjs ; aucune réponse dans ce fichier.
 * Contrat : docs/architecture/YEAR_COMPASS.md §4.1.
 */
final class CompassBank
{
    private ?array $index = null;

    private ?string $loadedFrom = null;

    /** @return array<string, array{grade: string, lessons: string[], 1: string[], 2: string[]}> */
    public function items(): array
    {
        $path = (string) config('compass.index_path');
        if ($this->index === null || $this->loadedFrom !== $path) {
            if (! is_file($path)) {
                throw new DomainException('Banque « بوصلتي » introuvable : '.$path);
            }
            $data = json_decode((string) file_get_contents($path), true);
            $this->index = is_array($data['items'] ?? null) ? $data['items'] : [];
            $this->loadedFrom = $path;
        }

        return $this->index;
    }

    public function has(string $itemId): bool
    {
        return isset($this->items()[$itemId]);
    }

    /** @return int[] les niveaux qui ont au moins une question */
    public function levels(string $itemId): array
    {
        $item = $this->items()[$itemId] ?? null;
        if ($item === null) {
            return [];
        }

        return array_values(array_filter([1, 2], fn (int $l) => ! empty($item[(string) $l] ?? [])));
    }

    /** @return array<string, int[]> tout l'inventaire, pour que le client sache où il y a des questions */
    public function availability(): array
    {
        $out = [];
        foreach (array_keys($this->items()) as $id) {
            $levels = $this->levels((string) $id);
            if ($levels !== []) {
                $out[$id] = $levels;
            }
        }

        return $out;
    }

    /**
     * Une question FRAÎCHE : jamais servie à cet élève si possible (une jauge
     * refaite tire d'autres questions), sinon n'importe laquelle du niveau.
     *
     * @param  array<string, true>  $alreadyServed  « leçon/exercice/question » déjà servies à l'élève
     * @return array{lesson: string, exercise: string, question: string}|null
     */
    public function pick(string $itemId, int $level, array $alreadyServed): ?array
    {
        $refs = $this->items()[$itemId][(string) $level] ?? [];
        if ($refs === []) {
            return null;
        }
        $fresh = array_values(array_filter($refs, fn (string $r) => ! isset($alreadyServed[$r])));
        $pool = $fresh !== [] ? $fresh : $refs;
        $ref = $pool[random_int(0, count($pool) - 1)];
        [$lesson, $exercise, $question] = explode('/', $ref, 3);

        return ['lesson' => $lesson, 'exercise' => $exercise, 'question' => $question];
    }
}
