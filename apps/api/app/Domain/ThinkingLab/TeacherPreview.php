<?php

namespace App\Domain\ThinkingLab;

/**
 * « معاينة الأستاذ » — le « مختبر التفكير » vu par un enseignant, en LECTURE SEULE
 * (THINKING_LAB.md §8bis, décision du propriétaire du 2026-10-31).
 *
 * Même principe que les leçons et la pratique côté enseignant : tout est ouvert, rien n'est
 * écrit. L'enseignant voit chaque défi sans porte — réponse, clés, erreurs déclarées, relecture,
 * suites, plafond, jumeau — et peut TESTER une réponse (le même juge que l'élève). Aucune ligne
 * de `thinking_lab_progress` ni de `thinking_lab_attempts` n'est créée ; aucun quota ne bouge.
 *
 * C'est la seule place où la réponse quitte le serveur AVANT une porte, et elle est derrière
 * `can:teacher` : l'élève n'y entre pas (TeacherThinkingLabTest).
 */
class TeacherPreview
{
    public function __construct(private ChallengeRepository $challenges, private AnswerChecker $checker) {}

    /** Les numéros de l'échelle, avec ce qu'un enseignant a le droit de savoir (tranche, famille, titre). */
    public function list(): array
    {
        return array_map(static fn (array $c) => [
            'id' => $c['id'],
            'number' => $c['number'],
            'title' => $c['title'],
            'band' => $c['band'],
            'family' => $c['family'],
            'summit' => (bool) ($c['summit'] ?? false),
            'examTag' => $c['examTag'] ?? null,
            'hasParams' => ! empty($c['params']),
            'hasFigure' => ! empty($c['figure']),
        ], $this->challenges->all());
    }

    private function tupleIndex(array $challenge, int $requested): int
    {
        return max(0, min($requested, Params::tupleCount($challenge['params'] ?? null) - 1));
    }

    /**
     * Le défi complet pour un des tuples de nombres possibles (l'enseignant peut les parcourir tous).
     *
     * @return array<string, mixed>
     */
    public function show(array $challenge, int $tuple = 0): array
    {
        $index = $this->tupleIndex($challenge, $tuple);
        $values = Params::tupleAt($challenge['params'] ?? null, $index);
        $f = Params::fillChallenge($challenge, $values);

        return [
            'id' => $f['id'],
            'number' => $f['number'],
            'title' => $f['title'],
            'band' => $f['band'],
            'family' => $f['family'],
            'summit' => (bool) ($f['summit'] ?? false),
            'licence' => $f['licence'],
            'source' => $f['source'],
            'examTag' => $f['examTag'] ?? null,
            'rating' => $f['rating'],
            'statement' => $f['statement'],
            'figure' => $f['figure'] ?? null,
            'example' => $f['example'] ?? null,
            'tuple' => ['index' => $index, 'count' => Params::tupleCount($challenge['params'] ?? null), 'values' => $values],
            'answer' => ChallengePresenter::answerFormat($f['answer']) + ['value' => ChallengePresenter::displayValue($f['answer'])],
            'mistakes' => array_map(static fn (array $m) => [
                'value' => isset($m['outside']) ? null : ChallengePresenter::displayValue(['check' => 'expression', 'value' => AnswerChecker::mistakeExpression($m)]),
                'outside' => $m['outside'] ?? null,
                'reply' => $m['reply'],
            ], $f['mistakes'] ?? []),
            'keys' => array_map(static fn (array $k) => ['phase' => $k['phase'], 'text' => $k['text']], $f['keys']),
            'replay' => $f['replay'],
            'keyMoves' => $f['keyMoves'] ?? [],
            'move' => $f['move'] ?? null,
            'parts' => array_map(static fn ($p, $i) => [
                'index' => $i,
                'prompt' => $p['prompt'],
                'answer' => ChallengePresenter::answerFormat($p['answer']) + ['value' => ChallengePresenter::displayValue($p['answer'])],
            ], $f['parts'] ?? [], array_keys($f['parts'] ?? [])),
            'ceiling' => isset($f['ceiling']) ? [
                'statement' => $f['ceiling']['statement'],
                'answer' => ChallengePresenter::answerFormat($f['ceiling']['answer']) + ['value' => ChallengePresenter::displayValue($f['ceiling']['answer'])],
            ] : null,
            'twin' => ($twin = ($f['twin'] ?? null) ? $this->challenges->find($f['twin']) : null) ? ['id' => $twin['id'], 'number' => $twin['number']] : null,
        ];
    }

    /**
     * Teste une réponse avec le MÊME juge que l'élève (`AnswerChecker`, mêmes erreurs déclarées) —
     * sans rien écrire. `kind` : la réponse principale (`answer`), une suite (`part`) ou le plafond.
     *
     * @return array{outcome: string, correct: bool, normalized: string, reply: ?string}
     */
    public function check(array $challenge, int $tuple, string $kind, int $index, string $raw): array
    {
        $f = Params::fillChallenge($challenge, Params::tupleAt($challenge['params'] ?? null, $this->tupleIndex($challenge, $tuple)));
        $spec = match ($kind) {
            'ceiling' => $f['ceiling']['answer'] ?? null,
            'part' => $f['parts'][$index]['answer'] ?? null,
            default => $f['answer'],
        };
        if ($spec === null) {
            throw new ThinkingLabException(ThinkingLabException::NOT_FOUND);
        }
        $mistakes = $kind === 'answer' ? ($f['mistakes'] ?? []) : [];
        $r = $this->checker->check($spec, $raw, $mistakes);

        return [
            'outcome' => $r['outcome'],
            'correct' => $r['correct'],
            'normalized' => $r['normalized'],
            'reply' => $r['mistakeIndex'] !== null ? ($mistakes[$r['mistakeIndex']]['reply'] ?? null) : null,
        ];
    }
}
