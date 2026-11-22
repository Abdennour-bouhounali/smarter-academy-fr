<?php

namespace App\Domain\Compass;

/**
 * La bande d'une كفاءة d'après ses réponses, dans l'ordre — le PORT exact de
 * `itemProgress` (packages/core/compass/engine.js). Les deux sont tenus par la
 * MÊME fixture : packages/core/compass/fixtures/bands.json.
 *
 *   L1 ✓ → L2 ✓ → solid ; L1 ✓ → L2 ✗ → consolidate
 *   L1 ✗ → L1' ✗ → start ; L1 ✗ → L1' ✓ → L2 (✓ ou ✗) → consolidate
 * « غير متأكّد » (unsure) compte comme non réussi.
 */
final class ItemBand
{
    public const SOLID = 'solid';

    public const CONSOLIDATE = 'consolidate';

    public const START = 'start';

    /**
     * @param  array<int, array{correct: ?bool, unsure?: bool}>  $answers
     * @return array{done: bool, band: ?string, nextLevel: ?int}
     */
    public static function of(array $answers): array
    {
        $ok = fn (?array $a) => $a !== null && ($a['correct'] ?? false) === true && empty($a['unsure']);
        $a1 = $answers[0] ?? null;
        $a2 = $answers[1] ?? null;
        $a3 = $answers[2] ?? null;

        if ($a1 === null) {
            return ['done' => false, 'band' => null, 'nextLevel' => 1];
        }
        if ($ok($a1)) {
            if ($a2 === null) {
                return ['done' => false, 'band' => null, 'nextLevel' => 2];
            }

            return ['done' => true, 'band' => $ok($a2) ? self::SOLID : self::CONSOLIDATE, 'nextLevel' => null];
        }
        if ($a2 === null) {
            return ['done' => false, 'band' => null, 'nextLevel' => 1];
        }
        if (! $ok($a2)) {
            return ['done' => true, 'band' => self::START, 'nextLevel' => null];
        }
        if ($a3 === null) {
            return ['done' => false, 'band' => null, 'nextLevel' => 2];
        }

        return ['done' => true, 'band' => self::CONSOLIDATE, 'nextLevel' => null];
    }
}
