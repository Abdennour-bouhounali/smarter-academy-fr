<?php

namespace App\Domain\ThinkingLab;

use App\Domain\Practice\Support\AnswerEvaluator;
use App\Models\ThinkingLabAttempt;
use App\Models\ThinkingLabProgress;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * La PORTE du « مختبر التفكير » — l'autorité, côté serveur (THINKING_LAB.md §6).
 *
 *   trying ──juste──────────────────────────────▶ solved (alone | keys)
 *   trying ──N tentatives comptées ET ≥ H heures depuis la 1ʳᵉ──▶ relecture ouverte ──lue──▶ learned
 *   learned ──le jumeau résolu seul──▶ outcome « twin »
 *
 * Phase 1 : TOUS les élèves suivent la règle de l'élève indépendant (3 tentatives + 24 h ;
 * tranche primaire : 3 tentatives, sans attente). La demande au professeur arrive en phase 2 ;
 * le plan prévoit d'ailleurs qu'une demande sans réponse retombe sur cette même règle.
 *
 * La tentative HONNÊTE (§6.1) : seule une réponse fausse peut être refusée au décompte —
 *   syntax    illisible (jamais une erreur mathématique) ;
 *   repeat    la même réponse qu'une tentative déjà comptée ;
 *   too_soon  moins de `min_seconds_between` depuis la dernière tentative comptée ;
 *   no_draft  dès la 2ᵉ, sans une phrase dans « ماذا غيّرت هذه المرّة؟ ».
 * Une réponse juste est toujours acceptée.
 */
class GateService
{
    public function __construct(
        private ChallengeRepository $challenges,
        private LadderService $ladder,
        private AnswerChecker $checker,
    ) {}

    public function now(): CarbonImmutable
    {
        return CarbonImmutable::now();
    }

    public function challengeOrFail(string $id): array
    {
        return $this->challenges->find($id) ?? throw new ThinkingLabException(ThinkingLabException::NOT_FOUND);
    }

    public function edition(): int
    {
        return (int) config('thinking_lab.edition', 1);
    }

    /** Le défi tel que CET élève le voit : ses nombres (params) remplis. Serveur seulement. */
    public function filled(User $user, array $challenge, ?ThinkingLabProgress $progress = null): array
    {
        $index = $progress?->params_index ?? Params::pick($challenge['params'] ?? null, $user->id, $challenge['id'], $this->edition())['index'];

        return Params::fillChallenge($challenge, Params::tupleAt($challenge['params'] ?? null, $index));
    }

    public function progress(User $user, string $challengeId): ?ThinkingLabProgress
    {
        return ThinkingLabProgress::query()->where('user_id', $user->id)->where('challenge_id', $challengeId)->first();
    }

    public function thinkHours(array $challenge): int
    {
        return ($challenge['band'] ?? null) === 'primary'
            ? (int) config('thinking_lab.gate.primary_think_hours', 0)
            : (int) config('thinking_lab.gate.think_hours', 24);
    }

    public function attemptsToUnlock(): int
    {
        return (int) config('thinking_lab.gate.attempts_to_unlock', 3);
    }

    /** L'instant où la relecture s'ouvre (null tant que les N tentatives ne sont pas là). */
    public function unlockAt(?ThinkingLabProgress $p, array $challenge): ?CarbonImmutable
    {
        if ($p === null || $p->first_attempt_at === null || $p->attempts_counted < $this->attemptsToUnlock()) {
            return null;
        }

        return $p->first_attempt_at->addHours($this->thinkHours($challenge));
    }

    public function canReplay(?ThinkingLabProgress $p, array $challenge): bool
    {
        if ($p === null) {
            return false;
        }
        if ($p->isDone()) {
            return true;
        }
        $at = $this->unlockAt($p, $challenge);

        return $at !== null && $this->now()->greaterThanOrEqualTo($at);
    }

    /** Clés débloquées : une par tentative comptée, au plus le nombre de clés. */
    public function keysUnlocked(?ThinkingLabProgress $p, array $challenge): int
    {
        return min($p?->attempts_counted ?? 0, count($challenge['keys'] ?? []));
    }

    /** Les secondes à attendre avant qu'une nouvelle tentative fausse puisse compter. */
    public function cooldownUntil(?ThinkingLabProgress $p): ?CarbonImmutable
    {
        if ($p?->last_counted_at === null) {
            return null;
        }
        $at = $p->last_counted_at->addSeconds((int) config('thinking_lab.honest.min_seconds_between', 120));

        return $this->now()->lessThan($at) ? $at : null;
    }

    private function ensureReachable(User $user, string $challengeId): void
    {
        if (! $this->ladder->isReachable($user, $challengeId)) {
            throw new ThinkingLabException(ThinkingLabException::LOCKED);
        }
    }

    /**
     * Une tentative. Rend la tentative enregistrée (comptée ou non) et le défi mis à jour.
     *
     * @return array{attempt: ThinkingLabAttempt, progress: ThinkingLabProgress, check: array}
     */
    public function attempt(User $user, string $challengeId, string $raw, ?string $draft): array
    {
        $challenge = $this->challengeOrFail($challengeId);
        $this->ensureReachable($user, $challengeId);

        return DB::transaction(function () use ($user, $challenge, $raw, $draft) {
            // Une tentative à la fois par compte : le verrou de la ligne `users` (même discipline que les quotas).
            User::query()->whereKey($user->id)->lockForUpdate()->first();
            $p = $this->progress($user, $challenge['id']);
            if ($p?->isDone()) {
                throw new ThinkingLabException(ThinkingLabException::CLOSED);
            }
            if (($p === null || $p->postponed_at !== null) && $this->ladder->openCount($user, $challenge['id']) >= $this->ladder->maxOpen()) {
                throw new ThinkingLabException(ThinkingLabException::TOO_MANY_OPEN, ['maxOpen' => $this->ladder->maxOpen()]);
            }
            if ($p === null) {
                $pick = Params::pick($challenge['params'] ?? null, $user->id, $challenge['id'], $this->edition());
                $p = ThinkingLabProgress::create([
                    'user_id' => $user->id,
                    'challenge_id' => $challenge['id'],
                    'state' => ThinkingLabProgress::TRYING,
                    'params_index' => $pick['index'],
                    'edition' => $this->edition(),
                ]);
            }
            $p->postponed_at = null;

            $f = $this->filled($user, $challenge, $p);
            $check = $this->checker->check($f['answer'], $raw, $f['mistakes'] ?? []);
            $now = $this->now();
            $draft = $draft !== null ? trim($draft) : null;

            $reason = null;
            $counted = false;
            if ($check['outcome'] === AnswerEvaluator::SYNTAX_ERROR) {
                $reason = 'syntax';
            } elseif ($check['correct']) {
                $counted = true;
            } elseif ($this->isRepeat($p, $f['answer'], $raw, $check['normalized'])) {
                $reason = 'repeat';
            } elseif ($this->cooldownUntil($p) !== null) {
                $reason = 'too_soon';
            } elseif ($p->attempts_counted >= 1 && mb_strlen((string) $draft) < (int) config('thinking_lab.honest.min_draft_chars', 12)) {
                $reason = 'no_draft';
            } else {
                $counted = true;
            }

            if ($counted) {
                $p->attempts_counted++;
                $p->first_attempt_at ??= $now;
                $p->last_counted_at = $now;
            }
            if ($check['correct']) {
                $p->state = ThinkingLabProgress::SOLVED;
                $p->solved_at = $now;
                $p->outcome = $p->keys_opened > 0 ? 'keys' : 'alone';
            }
            $p->save();

            $attempt = ThinkingLabAttempt::create([
                'progress_id' => $p->id,
                'answer_raw' => mb_substr($raw, 0, 400),
                'answer_norm' => $check['normalized'] !== '' ? mb_substr($check['normalized'], 0, 600) : null,
                'correct' => $check['correct'],
                'counted' => $counted,
                'reason' => $reason,
                'mistake_index' => $check['mistakeIndex'],
                'draft' => $draft !== '' ? $draft : null,
                'created_at' => $now,
            ]);

            if ($check['correct'] && $p->outcome === 'alone') {
                $this->creditTwin($user, $challenge['id']);
            }

            return ['attempt' => $attempt, 'progress' => $p->fresh(), 'check' => $check];
        });
    }

    /** La même réponse qu'une tentative déjà COMPTÉE (écriture canonique, ou expression équivalente). */
    private function isRepeat(ThinkingLabProgress $p, array $spec, string $raw, string $normalized): bool
    {
        foreach ($p->attempts()->where('counted', true)->get() as $previous) {
            if ($normalized !== '' && $previous->answer_norm === $normalized) {
                return true;
            }
            if (($spec['check'] ?? null) === 'expression') {
                $opts = AnswerChecker::expressionOptions($spec);
                if (ExpressionEvaluator::parse($previous->answer_raw, $opts['vars'])['ok']
                    && ExpressionEvaluator::equivalent($raw, $previous->answer_raw, $opts)['equivalent']) {
                    return true;
                }
            }
        }

        return false;
    }

    /** « learned » puis le jumeau résolu SEUL : le défi d'origine passe à l'issue « twin » (plan §6). */
    private function creditTwin(User $user, string $solvedId): void
    {
        $learned = ThinkingLabProgress::query()->where('user_id', $user->id)->where('state', ThinkingLabProgress::LEARNED)
            ->where('outcome', 'learned')->get();
        foreach ($learned as $p) {
            if (($this->challenges->find($p->challenge_id)['twin'] ?? null) === $solvedId) {
                $p->update(['outcome' => 'twin']);
            }
        }
    }

    /** Ouvre la clé k (dans l'ordre, une fois débloquée). Rend la progression. */
    public function openKey(User $user, string $challengeId, int $k): ThinkingLabProgress
    {
        $challenge = $this->challengeOrFail($challengeId);
        $p = $this->progress($user, $challengeId) ?? throw new ThinkingLabException(ThinkingLabException::KEY_LOCKED);
        if ($p->isDone()) {
            throw new ThinkingLabException(ThinkingLabException::CLOSED);
        }
        if ($k < 1 || $k > $this->keysUnlocked($p, $challenge) || $k > $p->keys_opened + 1) {
            throw new ThinkingLabException(ThinkingLabException::KEY_LOCKED);
        }
        if ($k > $p->keys_opened) {
            $p->update(['keys_opened' => $k]);
        }

        return $p;
    }

    /** « أرجئه » : le défi garde son état et libère sa place ouverte. */
    public function postpone(User $user, string $challengeId): ThinkingLabProgress
    {
        $this->challengeOrFail($challengeId);
        $p = $this->progress($user, $challengeId) ?? throw new ThinkingLabException(ThinkingLabException::NOT_STARTED);
        if ($p->isDone()) {
            throw new ThinkingLabException(ThinkingLabException::CLOSED);
        }
        $p->update(['postponed_at' => $this->now()]);

        return $p;
    }

    /** Ouvre la relecture : refusée tant que la porte est fermée ; la première lecture fait « learned ». */
    public function openReplay(User $user, string $challengeId): array
    {
        $challenge = $this->challengeOrFail($challengeId);
        $p = $this->progress($user, $challengeId);
        if (! $this->canReplay($p, $challenge)) {
            throw new ThinkingLabException(ThinkingLabException::GATE_CLOSED);
        }
        if ($p->state === ThinkingLabProgress::TRYING) {
            $p->update(['state' => ThinkingLabProgress::LEARNED, 'learned_at' => $this->now(), 'outcome' => 'learned', 'postponed_at' => null]);
        }

        return [$challenge, $p];
    }

    /**
     * « ارفع السقف » et les suites d'un sommet : vérifiables une fois la porte franchie, sans limite
     * de tentatives (ce n'est plus la course : c'est l'entraînement). Rien n'est révélé.
     *
     * @return array{correct: bool, outcome: string, mistakeIndex: ?int}
     */
    public function checkExtra(User $user, string $challengeId, string $kind, int $index, string $raw): array
    {
        $challenge = $this->challengeOrFail($challengeId);
        $p = $this->progress($user, $challengeId);
        if ($p === null || ! $p->isDone()) {
            throw new ThinkingLabException(ThinkingLabException::GATE_CLOSED);
        }
        $f = $this->filled($user, $challenge, $p);
        $spec = $kind === 'ceiling' ? ($f['ceiling']['answer'] ?? null) : ($f['parts'][$index]['answer'] ?? null);
        if ($spec === null) {
            throw new ThinkingLabException(ThinkingLabException::NOT_FOUND);
        }
        $check = $this->checker->check($spec, $raw);
        if ($check['correct']) {
            $extras = $p->extras ?? [];
            if ($kind === 'ceiling') {
                $extras['ceiling'] = true;
            } else {
                $extras['parts'] = array_values(array_unique([...($extras['parts'] ?? []), $index]));
            }
            $p->update(['extras' => $extras]);
        }

        return ['correct' => $check['correct'], 'outcome' => $check['outcome']];
    }
}
