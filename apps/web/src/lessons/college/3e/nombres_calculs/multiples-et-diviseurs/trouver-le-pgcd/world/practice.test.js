// « Espace jeu » of trouver-le-pgcd: every wave of every level is fair (exactly one right gate), mental arithmetic (every
// number printed at most 100), guided after a wrong gate by a true sentence, no wrong gate makes a TRUE equality, and
// the hub tells no rule.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import {
  agreementErrors,
  said,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { gcd } from './math';
import { KEYS } from './journey';
import { TEXT } from './text';
import { PRACTICE_MAP, PRACTICE_NODES, isRight, ladder } from './practice';

const waves = function* (runs = 40) {
  for (const [i, node] of PRACTICE_NODES.entries())
    for (const [l] of node.levels.entries())
      for (let seed = 1; seed <= runs; seed += 1)
        for (const w of ladder.makeRun(rng(seed * 31 + i * 7 + l), i, l)) yield { w, i, l };
};
/** The numbers a sentence prints, its LaTeX commands left out (`\\square`, `\\times`, `\\mathrm`). */
const numbersIn = (s) => (s.replace(/\\[a-z]+/g, ' ').match(/\d+/g) ?? []).map(Number);

describe('trouver-le-pgcd — the practice ladder', () => {
  it('the nodes are the four keys in the order of the road, then the summary', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([2, 1, 2, 2, 2]);
    for (const n of PRACTICE_NODES) expect(TEXT.levels[n.id], n.id).toHaveLength(n.levels.length);
  });

  it('every wave is fair, its numbers at most 100, its guidance a true sentence for each gate', () => {
    const kinds = new Set();
    for (const { w } of waves()) {
      kinds.add(w.type);
      expect(
        w.gates.filter((n) => isRight(w, n)),
        JSON.stringify(w),
      ).toHaveLength(1);
      expect(new Set(w.gates).size).toBe(3);
      for (const n of [...w.gates, ...numbersIn(w.say)]) expect(n, w.say).toBeLessThanOrEqual(100);
      said(w.say);
      expect(typographyErrors(w.say), w.say).toEqual([]);
      trueEqualities(w.why.right);
      for (const g of w.gates.filter((n) => !isRight(w, n))) {
        const line = w.why.wrong[g];
        expect(line, `${w.say} ← ${g}`).toBeTruthy();
        said(line);
        trueEqualities(line);
        expect(typographyErrors(line), line).toEqual([]);
        expect(agreementErrors(line), line).toEqual([]);
      }
    }
    expect([...kinds].sort()).toEqual(['common', 'euclidLast', 'euclidRest', 'lots', 'pgcd', 'pgcdPow'].sort());
  });

  it('the right gates are what the arithmetic says; no wrong gate makes a true equality', () => {
    for (const { w } of waves(20)) {
      const g = w.gates[w.good];
      if (w.type === 'common') expect(w.a % g === 0 && w.b % g === 0).toBe(true);
      if (['pgcd', 'lots', 'pgcdPow', 'euclidLast'].includes(w.type)) expect(g).toBe(gcd(w.a, w.b));
      if (w.type === 'euclidRest') {
        expect(g).toBe(w.a % w.b);
        for (const n of w.gates.filter((x) => x !== g)) expect(gcd(w.b, n), w.say).not.toBe(gcd(w.a, w.b));
      }
    }
  });

  it('the hub, shown before any key: its level names and link labels name no rule and no key', () => {
    const words = /commun|PGCD|plus grand|identique|partag|exposant|facteurs? premiers?|Euclide|algorithme|reste/i;
    for (const names of Object.values(TEXT.levels)) for (const n of names) expect(n, n).not.toMatch(words);
    for (const [, , label] of PRACTICE_MAP.edges) if (label) expect(label).not.toMatch(words);
    expect(PRACTICE_MAP.root).not.toMatch(words);
    for (const s of [...Object.values(TEXT.levels).flat(), TEXT.summary.title, TEXT.summary.text])
      expect(typographyErrors(s), s).toEqual([]);
    expect(Object.keys(PRACTICE_MAP.positions).sort()).toEqual(['root', ...KEYS, SUMMARY].sort());
  });
});
