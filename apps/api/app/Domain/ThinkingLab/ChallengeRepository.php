<?php

namespace App\Domain\ThinkingLab;

use DomainException;

/**
 * Lit les défis du « مختبر التفكير » depuis content/thinking-lab/index.generated.json —
 * le SEUL fichier de contenu que lit le serveur (scripts/build-thinking-lab-index.mjs).
 * Même principe qu'ExerciseRepository : le contenu se relit en revue et se livre avec
 * le code ; `challenge_id` est une chaîne dans les tables, jamais une clé étrangère.
 *
 * L'index contient les RÉPONSES : il ne quitte jamais le serveur ; ce qui part au client
 * passe par ChallengePresenter.
 */
class ChallengeRepository
{
    /** @var array<string, array{list: list<array>, byId: array<string, array>, byNumber: array<int, string>}> */
    private array $memo = [];

    public function path(): string
    {
        return rtrim((string) config('thinking_lab.content_path'), '/').'/index.generated.json';
    }

    private function load(): array
    {
        $path = $this->path();
        if (isset($this->memo[$path])) {
            return $this->memo[$path];
        }
        if (! is_file($path)) {
            throw new DomainException('Contenu du مختبر التفكير introuvable : '.$path);
        }
        $index = json_decode((string) file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
        $list = array_values($index['challenges'] ?? []);
        usort($list, static fn ($a, $b) => $a['number'] <=> $b['number']);
        $byId = [];
        $byNumber = [];
        foreach ($list as $c) {
            $byId[$c['id']] = $c;
            $byNumber[(int) $c['number']] = $c['id'];
        }

        return $this->memo[$path] = ['list' => $list, 'byId' => $byId, 'byNumber' => $byNumber];
    }

    /** @return list<array> les défis publiés, dans l'ordre des numéros (l'échelle) */
    public function all(): array
    {
        return $this->load()['list'];
    }

    public function find(string $id): ?array
    {
        return $this->load()['byId'][$id] ?? null;
    }

    public function idForNumber(int $number): ?string
    {
        return $this->load()['byNumber'][$number] ?? null;
    }

    /** Le défi qui précède sur l'échelle (null pour le premier). */
    public function previous(string $id): ?array
    {
        $list = $this->all();
        foreach ($list as $i => $c) {
            if ($c['id'] === $id) {
                return $i > 0 ? $list[$i - 1] : null;
            }
        }

        return null;
    }

    /** Vide la mémoire de requête (tests qui changent de dossier de contenu). */
    public function forget(): void
    {
        $this->memo = [];
    }
}
