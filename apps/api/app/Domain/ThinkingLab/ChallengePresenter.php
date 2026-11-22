<?php

namespace App\Domain\ThinkingLab;

use App\Domain\Practice\Support\Rational;
use App\Models\ThinkingLabAttempt;
use App\Models\ThinkingLabProgress;
use App\Models\User;
use Carbon\CarbonImmutable;

/**
 * Ce que le CLIENT reçoit d'un défi du « مختبر التفكير » — la seule frontière entre le
 * contenu (réponses comprises) et le navigateur, comme ChallengeQuestionPresenter pour le
 * défi quotidien. AVANT la porte, jamais :
 *   la réponse, ses tolérances ni son domaine ; les valeurs des erreurs déclarées ; le texte
 *   d'une clé non ouverte ; la relecture, les « keyMoves », la carte du mouvement ; les réponses
 *   du plafond et des suites ; la tranche, la famille, la note, la source, le titre.
 * ThinkingLabLeakTest balaie chaque réponse de l'API à la recherche de ces chaînes.
 */
class ChallengePresenter
{
    public function __construct(private GateService $gate, private LadderService $ladder, private ChallengeRepository $challenges) {}

    private static function iso(?CarbonImmutable $t): ?string
    {
        return $t?->toIso8601String();
    }

    /** Le format de saisie de la réponse, sans la réponse. */
    public static function answerFormat(array $spec): array
    {
        $out = ['check' => $spec['check']];
        if (! empty($spec['vars'])) {
            $out['vars'] = $spec['vars'];
        }
        if (! empty($spec['percent'])) {
            $out['percent'] = true;
        }
        if (isset($spec['choices'])) {
            $out['choices'] = array_map(static fn ($c) => ['id' => $c['id'], 'text' => $c['text']], $spec['choices']);
        }

        return $out;
    }

    /** Valeur d'un nombre écrit (rationnel, ou expression sans variable) ; null si illisible. */
    private static function numeric(string $s): ?float
    {
        $r = Rational::parse($s);
        if ($r !== null) {
            return $r->n / $r->d;
        }
        $parsed = ExpressionEvaluator::parse($s);
        if (! $parsed['ok']) {
            return null;
        }
        $v = ExpressionEvaluator::evaluate($parsed['ast']);

        return is_nan($v) ? null : $v;
    }

    /**
     * La réponse telle qu'on la MONTRE après la porte : la valeur exacte d'un integer/rational
     * (« 21 », pas le gabarit rempli « (7)*((7)-1)/2 »), la valeur calculée d'un number, l'expression
     * attendue d'une expression, l'id d'un choix.
     */
    public static function displayValue(array $spec): string
    {
        $raw = is_float($spec['value']) ? Rational::jsNumberToString($spec['value']) : (string) $spec['value'];

        return match ($spec['check']) {
            'integer', 'rational' => AnswerChecker::exactValue($raw)?->toString() ?? $raw,
            'number' => ($v = self::numeric($raw)) !== null ? Rational::jsNumberToString(round($v, 4)) : $raw,
            default => $raw,
        };
    }

    /** La réponse « ليس بعد » d'une tentative fausse : une erreur déclarée, un ordre de grandeur, ou une phrase générique. */
    public function reply(array $filled, ThinkingLabAttempt $a): ?array
    {
        if ($a->correct || $a->reason === 'syntax') {
            return null;
        }
        if ($a->mistake_index !== null && isset($filled['mistakes'][$a->mistake_index])) {
            return ['kind' => 'mistake', 'text' => $filled['mistakes'][$a->mistake_index]['reply']];
        }
        $spec = $filled['answer'];
        if (in_array($spec['check'], ['integer', 'number', 'rational'], true) && $a->answer_norm !== null) {
            $given = self::numeric($a->answer_norm);
            $expected = self::numeric((string) $spec['value']);
            if ($given !== null && $expected !== null && $expected != 0 && $given != 0 && ($given / $expected > 10 || $given / $expected < 0.1)) {
                return ['kind' => 'magnitude'];
            }
        }

        return ['kind' => 'generic'];
    }

    /** L'état du défi pour cet élève (aucune donnée de contenu). */
    public function state(User $user, array $challenge, ?ThinkingLabProgress $p): array
    {
        $unlockAt = $this->gate->unlockAt($p, $challenge);

        return [
            'status' => $p === null ? 'open' : ($p->isDone() ? $p->state : ($p->postponed_at ? 'postponed' : 'trying')),
            'outcome' => $p?->outcome,
            'attemptsCounted' => $p?->attempts_counted ?? 0,
            'attemptsToUnlock' => $this->gate->attemptsToUnlock(),
            'thinkHours' => $this->gate->thinkHours($challenge),
            'firstAttemptAt' => self::iso($p?->first_attempt_at),
            'unlockAt' => self::iso($unlockAt),
            'canReplay' => $this->gate->canReplay($p, $challenge),
            'keysUnlocked' => $this->gate->keysUnlocked($p, $challenge),
            'keysOpened' => $p?->keys_opened ?? 0,
            'nextCountedAt' => self::iso($this->gate->cooldownUntil($p)),
            'minDraftChars' => $p !== null && $p->attempts_counted >= 1 ? (int) config('thinking_lab.honest.min_draft_chars', 12) : 0,
        ];
    }

    /** Le défi à résoudre (écran 2). */
    public function challenge(User $user, array $challenge): array
    {
        $p = $this->gate->progress($user, $challenge['id']);
        $f = $this->gate->filled($user, $challenge, $p);
        $state = $this->state($user, $challenge, $p);
        $keys = [];
        foreach ($f['keys'] as $i => $key) {
            $k = $i + 1;
            $open = $k <= $state['keysOpened'];
            $keys[] = [
                'k' => $k,
                'phase' => $key['phase'],
                'state' => $open ? 'open' : ($k <= $state['keysUnlocked'] ? 'available' : 'locked'),
                'text' => $open ? $key['text'] : null,
            ];
        }
        $attempts = $p === null ? [] : $p->attempts()->get()->map(fn (ThinkingLabAttempt $a) => [
            'answer' => $a->answer_raw,
            'counted' => $a->counted,
            'correct' => $a->correct,
            'reason' => $a->reason,
            'reply' => $this->reply($f, $a),
            'at' => self::iso($a->created_at),
        ])->all();

        return [
            'id' => $challenge['id'],
            'number' => $challenge['number'],
            'summit' => (bool) ($challenge['summit'] ?? false),
            'examTag' => $challenge['examTag'] ?? null,
            'statement' => $f['statement'],
            'figure' => $f['figure'] ?? null,
            'example' => $f['example'] ?? null,
            'answer' => self::answerFormat($f['answer']),
            'keys' => $keys,
            'state' => $state,
            'attempts' => $attempts,
            'openCount' => $this->ladder->openCount($user),
            'maxOpen' => $this->ladder->maxOpen(),
        ];
    }

    /** La relecture (écran 3) — servie seulement porte ouverte (GateService::openReplay). */
    public function replay(User $user, array $challenge, ThinkingLabProgress $p): array
    {
        $f = $this->gate->filled($user, $challenge, $p);
        $statuses = $this->ladder->statuses($user);
        $twin = ($challenge['twin'] ?? null) ? $this->challenges->find($challenge['twin']) : null;
        $extras = $p->extras ?? [];

        return [
            'id' => $challenge['id'],
            'number' => $challenge['number'],
            'outcome' => $p->outcome,
            'solvedAlone' => $p->outcome === 'alone',
            'statement' => $f['statement'],
            'figure' => $f['figure'] ?? null,
            'answer' => ['check' => $f['answer']['check'], 'value' => self::displayValue($f['answer']), 'choices' => $f['answer']['choices'] ?? null],
            'replay' => $f['replay'],
            'keyMoves' => $f['keyMoves'] ?? [],
            'move' => $f['move'] ?? null,
            'keys' => array_map(static fn ($k) => ['phase' => $k['phase'], 'text' => $k['text']], $f['keys']),
            'parts' => array_map(static fn ($part, $i) => [
                'index' => $i,
                'prompt' => $part['prompt'],
                'answer' => self::answerFormat($part['answer']),
                'solved' => in_array($i, $extras['parts'] ?? [], true),
            ], $f['parts'] ?? [], array_keys($f['parts'] ?? [])),
            'ceiling' => isset($f['ceiling']) ? [
                'statement' => $f['ceiling']['statement'],
                'answer' => self::answerFormat($f['ceiling']['answer']),
                'solved' => (bool) ($extras['ceiling'] ?? false),
            ] : null,
            'twin' => $twin ? ['id' => $twin['id'], 'number' => $twin['number'], 'status' => $statuses[$twin['id']] ?? 'open'] : null,
        ];
    }

    /** L'échelle (écran 1). */
    public function home(User $user): array
    {
        $progress = $this->ladder->progressOf($user);
        $statuses = $this->ladder->statuses($user, $progress);
        $trail = [];
        $open = [];
        $next = null;
        foreach ($this->challenges->all() as $c) {
            $status = $statuses[$c['id']];
            $trail[] = ['id' => $c['id'], 'number' => $c['number'], 'summit' => (bool) ($c['summit'] ?? false), 'status' => $status];
            $p = $progress->get($c['id']);
            if ($p !== null && in_array($status, ['trying', 'postponed'], true)) {
                $open[] = ['id' => $c['id'], 'number' => $c['number'], 'summit' => (bool) ($c['summit'] ?? false), 'state' => $this->state($user, $c, $p)];
            }
            if ($next === null && $status === 'open') {
                $next = ['id' => $c['id'], 'number' => $c['number'], 'summit' => (bool) ($c['summit'] ?? false)];
            }
        }
        $done = $progress->filter(fn ($p) => $p->isDone());

        return [
            'trail' => $trail,
            'open' => $open,
            'next' => $next,
            'openCount' => $this->ladder->openCount($user),
            'maxOpen' => $this->ladder->maxOpen(),
            'totals' => [
                'solved' => $done->where('state', ThinkingLabProgress::SOLVED)->count(),
                'solvedAlone' => $done->where('outcome', 'alone')->count(),
                'learned' => $done->where('state', ThinkingLabProgress::LEARNED)->count(),
                'challenges' => count($trail),
            ],
        ];
    }
}
