<?php

namespace App\Domain\Diagnostic\Support;

/**
 * Decides which skill to probe next and which question best does it —
 * the actual "adaptive" part of the adaptive diagnostic. Pure: takes plain
 * arrays describing current evidence, returns a decision, touches no
 * database — so the algorithm itself is unit-testable without Eloquent or
 * HTTP (see tests/Unit/AdaptiveSelectorTest.php).
 *
 * Strategy, in order:
 *   1. Hard-stop at MAX_QUESTIONS regardless of anything else (§30 — a
 *      bounded diagnostic, never an endless one).
 *   2. Work tier by tier (skills() tiers are a DAG by construction — see
 *      SixiemeDiagnosticProvider's header comment): a skill only becomes
 *      eligible once none of its prerequisites is a *confirmed gap*. This
 *      is what lets a foundational gap short-circuit everything downstream
 *      of it instead of spending the student's remaining budget re-proving
 *      the same missing prerequisite indirectly (§5, §31 Student C).
 *   3. Within the eligible set, prefer lower tier, then higher importance,
 *      so foundations are confirmed before anything that depends on them.
 *   4. For the chosen skill: if the previous answer on it revealed a
 *      misconception with an unasked verification question, ask that next
 *      (§5, §7). Otherwise pick the question closest to a target
 *      difficulty derived from a simple staircase (see MasteryModel).
 */
class AdaptiveSelector
{
    public const MAX_QUESTIONS = 24;

    /**
     * @param  array<string, array{tier:int, importance:string, prerequisites:string[]}>  $skills
     * @param  array<string, array{skillId:string, difficulty:int, verifies?:string}>  $questions
     * @param  array<string, array{status:string, confidence:float, attempts:int, lastDifficulty:?int, lastCorrect:?bool, lastMisconceptionId:?string}>  $assessments
     *                                                                                                                                                                 Every skill id in $skills MUST have an entry here (callers seed defaults for untested skills).
     * @param  string[]  $askedQuestionIds
     * @return array{skillId: string, questionId: string}|null Null means: stop, the diagnostic is ready to complete.
     */
    public static function selectNext(array $skills, array $questions, array $assessments, array $askedQuestionIds, int $totalAsked): ?array
    {
        if ($totalAsked >= self::MAX_QUESTIONS) {
            return null;
        }

        // A just-detected misconception is investigated right away, ahead
        // of strict tier order — otherwise the engine could wander off to
        // an unrelated skill for several questions before ever following
        // up, which defeats the point of catching it in the first place.
        $pendingVerification = self::skillWithPendingVerification($skills, $questions, $assessments, $askedQuestionIds);
        if ($pendingVerification !== null) {
            return $pendingVerification;
        }

        foreach (self::eligibleSkillsInOrder($skills, $assessments) as $skillId) {
            $questionId = self::pickQuestionForSkill($skillId, $skills, $questions, $assessments, $askedQuestionIds);
            if ($questionId !== null) {
                return ['skillId' => $skillId, 'questionId' => $questionId];
            }
            // This skill's question bank is exhausted before evidence was
            // conclusive — treat it as resolved-by-exhaustion and let the
            // next eligible skill take over rather than getting stuck.
        }

        return null;
    }

    /**
     * @return array{skillId: string, questionId: string}|null
     */
    private static function skillWithPendingVerification(array $skills, array $questions, array $assessments, array $askedQuestionIds): ?array
    {
        foreach ($assessments as $skillId => $assessment) {
            if (empty($assessment['lastMisconceptionId']) || ! isset($skills[$skillId])) {
                continue;
            }
            if (MasteryModel::hasSufficientEvidence($assessment['confidence'], $assessment['attempts'])) {
                continue; // already wrapped up — don't reopen a resolved skill
            }
            if (self::isBlockedByGapPrerequisite($skills[$skillId]['prerequisites'], $skills, $assessments)) {
                continue;
            }

            foreach ($questions as $questionId => $question) {
                $matchesSkill = $question['skillId'] === $skillId && ! in_array($questionId, $askedQuestionIds, true);
                if ($matchesSkill && ($question['verifies'] ?? null) === $assessment['lastMisconceptionId']) {
                    return ['skillId' => $skillId, 'questionId' => $questionId];
                }
            }
        }

        return null;
    }

    /**
     * @return string[] skill ids, ordered tier ascending then importance then id.
     */
    private static function eligibleSkillsInOrder(array $skills, array $assessments): array
    {
        $eligible = [];
        foreach ($skills as $skillId => $def) {
            $assessment = $assessments[$skillId] ?? null;
            $resolved = $assessment && MasteryModel::hasSufficientEvidence($assessment['confidence'], $assessment['attempts']);
            if ($resolved) {
                continue;
            }
            if (self::isBlockedByGapPrerequisite($def['prerequisites'], $skills, $assessments)) {
                continue;
            }
            $eligible[$skillId] = $def;
        }

        uksort($eligible, function ($a, $b) use ($eligible) {
            if ($eligible[$a]['tier'] !== $eligible[$b]['tier']) {
                return $eligible[$a]['tier'] <=> $eligible[$b]['tier'];
            }
            $impA = $eligible[$a]['importance'] === 'critical' ? 0 : 1;
            $impB = $eligible[$b]['importance'] === 'critical' ? 0 : 1;
            if ($impA !== $impB) {
                return $impA <=> $impB;
            }

            return $a <=> $b;
        });

        return array_keys($eligible);
    }

    /**
     * Transitive: a skill is blocked not only when its DIRECT prerequisite
     * is a confirmed gap, but also when that prerequisite was itself never
     * tested because IT was blocked further up the chain. Without this, a
     * skill two tiers below a foundational gap (whose immediate, one-level
     * prerequisite therefore has no assessment row at all) would slip
     * through as "eligible" and get tested anyway — silently defeating the
     * whole point of skipping downstream skills for a struggling student.
     * Safe to recurse: the graph is a DAG by construction (see
     * SixiemeDiagnosticProvider), so this always terminates.
     */
    private static function isBlockedByGapPrerequisite(array $prerequisites, array $skills, array $assessments): bool
    {
        foreach ($prerequisites as $prereqId) {
            $assessment = $assessments[$prereqId] ?? null;

            if ($assessment) {
                $resolved = MasteryModel::hasSufficientEvidence($assessment['confidence'], $assessment['attempts']);
                if ($resolved && $assessment['status'] === 'gap') {
                    return true;
                }
                if ($resolved) {
                    continue; // resolved as mastered/reinforce — that branch is fine, no need to look further up it
                }
            }

            if (isset($skills[$prereqId]) && self::isBlockedByGapPrerequisite($skills[$prereqId]['prerequisites'], $skills, $assessments)) {
                return true;
            }
        }

        return false;
    }

    private static function pickQuestionForSkill(string $skillId, array $skills, array $questions, array $assessments, array $askedQuestionIds): ?string
    {
        $pool = [];
        foreach ($questions as $questionId => $question) {
            if ($question['skillId'] === $skillId && ! in_array($questionId, $askedQuestionIds, true)) {
                $pool[$questionId] = $question;
            }
        }
        if ($pool === []) {
            return null;
        }

        // Misconception-verification priority is handled up front by
        // skillWithPendingVerification() — by the time we're here, either
        // there was none, or it was already returned.
        $targetDifficulty = self::targetDifficulty($skillId, $skills, $assessments);

        $best = null;
        $bestDelta = null;
        foreach ($pool as $questionId => $question) {
            $delta = abs($question['difficulty'] - $targetDifficulty);
            if ($bestDelta === null || $delta < $bestDelta || ($delta === $bestDelta && $questionId < $best)) {
                $best = $questionId;
                $bestDelta = $delta;
            }
        }

        return $best;
    }

    private static function targetDifficulty(string $skillId, array $skills, array $assessments): int
    {
        $assessment = $assessments[$skillId] ?? null;

        if (! $assessment || $assessment['attempts'] === 0) {
            $prereqAssessments = [];
            foreach ($skills[$skillId]['prerequisites'] as $prereqId) {
                if (isset($assessments[$prereqId])) {
                    $prereqAssessments[] = $assessments[$prereqId];
                }
            }
            $seed = MasteryModel::startingConfidence($prereqAssessments);

            // Boosted skills start one step harder than default (3, not
            // 2) — enough: a correct answer at difficulty 3 from the 0.6
            // boosted seed lands at ≈0.7815, already past
            // MasteryModel::DECISIVE_CONFIDENCE (0.78). Every skill in the
            // bank has a difficulty-3 question, unlike difficulty 4 (only
            // a few do) — targeting 3 is what makes the single-attempt
            // resolution actually reachable across the whole graph, not
            // just the skills that happen to have hard content.
            return $seed >= MasteryModel::BOOSTED_STARTING_CONFIDENCE ? 3 : 2;
        }

        return MasteryModel::nextDifficulty(
            $assessment['lastDifficulty'] ?? 2,
            (bool) ($assessment['lastCorrect'] ?? false),
            $assessment['confidence']
        );
    }
}
