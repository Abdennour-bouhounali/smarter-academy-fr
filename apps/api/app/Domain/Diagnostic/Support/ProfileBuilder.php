<?php

namespace App\Domain\Diagnostic\Support;

use App\Domain\Diagnostic\Contracts\GradeDiagnosticProvider;

/**
 * Turns final per-skill assessments into the learning profile the result
 * screen shows: strengths / to-reinforce / gaps, plus one recommended
 * starting point. Pure — no persistence, no HTTP — so it's independently
 * testable against the three student journeys the brief names (strong /
 * mixed / foundational-gaps, see tests/Unit/ProfileBuilderTest.php).
 */
class ProfileBuilder
{
    /**
     * @param  array<string, array{label:string, tier:int, importance:string, prerequisites:string[]}>  $skills
     * @param  array<string, array{status:string, confidence:float, attempts:int}>  $assessments  Only directly-tested skills need appear here.
     */
    public static function build(array $skills, array $assessments, GradeDiagnosticProvider $provider): array
    {
        $statuses = [];
        foreach (array_keys($skills) as $skillId) {
            $statuses[$skillId] = self::resolveStatus($skillId, $skills, $assessments, $statuses);
        }

        $strengths = [];
        $reinforce = [];
        $gaps = [];

        foreach ($skills as $skillId => $def) {
            $entry = [
                'skillId' => $skillId,
                'label' => $def['label'],
                'wasDirectlyAssessed' => isset($assessments[$skillId]) && $assessments[$skillId]['attempts'] > 0,
            ];

            match ($statuses[$skillId]) {
                'mastered' => $strengths[] = $entry,
                'reinforce' => $reinforce[] = $entry,
                'gap' => $gaps[] = $entry,
                default => null, // never assessed and not inferable — excluded from the profile, not a claim either way
            };
        }

        return [
            'strengths' => $strengths,
            'reinforce' => $reinforce,
            'gaps' => $gaps,
            'recommendation' => self::recommend($skills, $statuses, $provider),
        ];
    }

    /**
     * A skill directly tested keeps its measured status. A skill never
     * tested is inferred 'gap' only if a prerequisite is a confirmed gap
     * (mirrors AdaptiveSelector's skip rule, so the profile is consistent
     * with why the engine stopped asking about it) — otherwise it's simply
     * not part of the profile at all, rather than guessed at.
     */
    private static function resolveStatus(string $skillId, array $skills, array $assessments, array &$memo): string
    {
        if (isset($memo[$skillId])) {
            return $memo[$skillId];
        }

        $assessment = $assessments[$skillId] ?? null;
        if ($assessment && $assessment['attempts'] > 0) {
            return $memo[$skillId] = $assessment['status'];
        }

        foreach ($skills[$skillId]['prerequisites'] as $prereqId) {
            if (self::resolveStatus($prereqId, $skills, $assessments, $memo) === 'gap') {
                return $memo[$skillId] = 'gap';
            }
        }

        return $memo[$skillId] = 'unassessed';
    }

    private static function recommend(array $skills, array $statuses, GradeDiagnosticProvider $provider): array
    {
        $pick = self::lowestPriorityMatch($skills, $statuses, 'gap')
            ?? self::lowestPriorityMatch($skills, $statuses, 'reinforce');

        if ($pick === null) {
            return [
                'skillId' => null,
                'reason' => "Tu maîtrises les compétences évaluées aujourd'hui — direction le défi intégrateur pour aller plus loin.",
                'startingPoint' => [
                    'lessonId' => 'resolution-problemes',
                    'lessonPath' => '/courses/college/6e/nombres_calculs/resolution-problemes',
                    'moduleNumber' => 1,
                    'moduleTitle' => 'Mission : Le problème mystère',
                ],
            ];
        }

        $verb = $statuses[$pick] === 'gap' ? 'consolider' : 'renforcer';

        return [
            'skillId' => $pick,
            'reason' => sprintf('Le meilleur point de départ pour toi : %s « %s ».', $verb, $skills[$pick]['label']),
            'startingPoint' => $provider->startingPointFor($pick),
        ];
    }

    private static function lowestPriorityMatch(array $skills, array $statuses, string $status): ?string
    {
        $matches = array_keys(array_filter($statuses, fn ($s) => $s === $status));
        if ($matches === []) {
            return null;
        }

        usort($matches, function ($a, $b) use ($skills) {
            if ($skills[$a]['tier'] !== $skills[$b]['tier']) {
                return $skills[$a]['tier'] <=> $skills[$b]['tier'];
            }
            $impA = $skills[$a]['importance'] === 'critical' ? 0 : 1;
            $impB = $skills[$b]['importance'] === 'critical' ? 0 : 1;
            if ($impA !== $impB) {
                return $impA <=> $impB;
            }

            return $a <=> $b;
        });

        return $matches[0];
    }
}
