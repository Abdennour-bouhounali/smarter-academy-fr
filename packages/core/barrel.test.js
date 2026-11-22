import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Le baril est dans le LOT D'ENTRÉE de l'application web (StudentLayout, la navigation…) : ce qu'il réexporte
 * et que Rollup ne peut pas élaguer part chez chaque visiteur. Depuis le 2026-10-14, les mathématiques des
 * unités, les registres des manipulations et le moteur de pratique s'importent PAR LEUR CHEMIN
 * (docs/architecture/BUNDLE_BOUNDARIES.md §4, règle 9) — ce test empêche qu'ils y reviennent.
 */
const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
const exportLines = source.split('\n').filter((l) => /^export\b/.test(l));

describe('core barrel — only what eager code needs', () => {
  it.each([
    ['arithmetic/', 'unit maths (import * as x from \'@smarter-academy/core/arithmetic/x.js\')'],
    ['practice/', 'the practice engine (import * as practice from \'@smarter-academy/core/practice/index.js\')'],
    ['curriculum/manipulationTypes.js', 'the manipulation type registry'],
    ['curriculum/manipulationLevels.js', 'the manipulation level registry'],
    ['curriculum/learningNet', 'the learning-net resolver (LEARNING_NET.md §2)'],
    ['mathComparison.js', 'the symbolic engine'],
  ])('does not re-export %s', (path, what) => {
    expect(exportLines.filter((l) => l.includes(`'./${path}`)), `${what} is imported by path, never through the barrel`).toEqual([]);
  });
});
