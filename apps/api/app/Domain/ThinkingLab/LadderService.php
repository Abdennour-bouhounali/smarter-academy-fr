<?php

namespace App\Domain\ThinkingLab;

use App\Models\ThinkingLabProgress;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * « سُلَّم التحدّيات » — qui peut ouvrir quel numéro (THINKING_LAB.md §5).
 *
 *   - le premier numéro est toujours atteint ;
 *   - le numéro suivant s'ouvre après UNE tentative honnête sur le précédent (ou s'il est résolu/appris) :
 *     l'élève n'est jamais bloqué derrière un défi ;
 *   - le JUMEAU d'un défi franchi est atteint aussitôt (on le propose après la relecture) ;
 *   - au plus `max_open` défis ouverts (en cours, non reportés) à la fois.
 *
 * Rien n'est caché que le contenu : le client reçoit des numéros et des états, jamais une tranche.
 */
class LadderService
{
    public function __construct(private ChallengeRepository $challenges) {}

    /** @return Collection<string, ThinkingLabProgress> par challenge_id */
    public function progressOf(User $user): Collection
    {
        return ThinkingLabProgress::query()->where('user_id', $user->id)->get()->keyBy('challenge_id');
    }

    /** @return array<string, string> challenge_id → solved|learned|trying|postponed|open|locked */
    public function statuses(User $user, ?Collection $progress = null): array
    {
        $progress ??= $this->progressOf($user);
        $twinsOfDone = [];
        foreach ($progress as $p) {
            if ($p->isDone()) {
                $twin = $this->challenges->find($p->challenge_id)['twin'] ?? null;
                if ($twin) {
                    $twinsOfDone[$twin] = true;
                }
            }
        }

        $out = [];
        $previousMoved = true; // le premier numéro est atteint
        foreach ($this->challenges->all() as $c) {
            $p = $progress->get($c['id']);
            $out[$c['id']] = match (true) {
                $p !== null && $p->state === ThinkingLabProgress::SOLVED => 'solved',
                $p !== null && $p->state === ThinkingLabProgress::LEARNED => 'learned',
                $p !== null && $p->postponed_at !== null => 'postponed',
                $p !== null => 'trying',
                $previousMoved || isset($twinsOfDone[$c['id']]) => 'open',
                default => 'locked',
            };
            $previousMoved = $p !== null && ($p->isDone() || $p->attempts_counted > 0);
        }

        return $out;
    }

    public function isReachable(User $user, string $challengeId): bool
    {
        return ($this->statuses($user)[$challengeId] ?? 'locked') !== 'locked';
    }

    /** Les défis ouverts (en cours, non reportés) — ceux qui occupent une place. */
    public function openCount(User $user, ?string $except = null): int
    {
        return ThinkingLabProgress::query()
            ->where('user_id', $user->id)
            ->where('state', ThinkingLabProgress::TRYING)
            ->whereNull('postponed_at')
            ->when($except, fn ($q) => $q->where('challenge_id', '!=', $except))
            ->count();
    }

    public function maxOpen(): int
    {
        return (int) config('thinking_lab.max_open', 3);
    }
}
