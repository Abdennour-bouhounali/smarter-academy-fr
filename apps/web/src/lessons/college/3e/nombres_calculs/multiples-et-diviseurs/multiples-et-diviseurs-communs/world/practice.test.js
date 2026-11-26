// « Espace jeu » of multiples-et-diviseurs-communs: every wave of every level is fair (exactly one right gate), mental
// arithmetic (every number printed or offered at most 100), guided after a wrong gate by a true sentence, no wrong gate is
// right, and the hub tells no rule.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import {
  agreementErrors,
  said,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { lcm, lcmOf, togetherDay } from './math';
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

describe('multiples-et-diviseurs-communs — the practice ladder', () => {
  it('the nodes are the four keys in the order of the road, then the summary', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([2, 2, 2, 2, 2]);
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
      expect(w.why.right, w.say).toBeTruthy();
      said(w.why.right);
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
    expect([...kinds].sort()).toEqual(['common', 'powers', 'smallest', 'together', 'turns'].sort());
  });

  it('the right gates are what the arithmetic says; no wrong gate is right', () => {
    for (const { w } of waves(20)) {
      const g = w.gates[w.good];
      if (w.type === 'common') expect(g % w.a === 0 && g % w.b === 0 && g > 0).toBe(true);
      if (w.type === 'smallest') expect(g).toBe(lcm(w.a, w.b));
      if (w.type === 'powers') expect(g).toBe(lcm(w.a, w.b));
      if (w.type === 'turns') expect(g * w.a).toBe(lcm(w.a, w.b));
      if (w.type === 'together') expect(g).toBe(togetherDay([w.a, w.b]));
      if (w.type === 'together') expect(lcmOf([w.a, w.b])).toBe(w.m);
      for (const n of w.gates.filter((x) => x !== g)) {
        expect(isRight(w, n), `${w.say} ← ${n}`).toBe(false);
        // « the smallest »: a wrong gate may be a common multiple, but never the smallest, and never 0
        if (w.type === 'smallest') expect(n).not.toBe(w.m);
      }
    }
  });

  it('a decomposed wave prints its primes and exponents as formulas, never the numbers they make', () => {
    let seen = 0;
    for (const { w } of waves(20))
      if (w.type === 'powers') {
        expect(w.say.match(/\$[^$]+\$/g), w.say).toHaveLength(2);
        seen += 1;
      }
    expect(seen).toBeGreaterThan(20);
  });

  it('the hub, shown before any key: its level names and link labels name no rule and no key', () => {
    const words =
      /commun|multiple|plus petit|exposant|facteurs? premiers?|rendez-vous|cycle|cinq|traduire|PGCD|diviseur/i;
    for (const names of Object.values(TEXT.levels)) for (const n of names) expect(n, n).not.toMatch(words);
    for (const [, , label] of PRACTICE_MAP.edges) if (label) expect(label).not.toMatch(words);
    expect(PRACTICE_MAP.root).not.toMatch(words);
    for (const s of [...Object.values(TEXT.levels).flat(), TEXT.summary.title, TEXT.summary.text, PRACTICE_MAP.root])
      expect(typographyErrors(s), s).toEqual([]);
    expect(Object.keys(PRACTICE_MAP.positions).sort()).toEqual(['root', ...KEYS, SUMMARY].sort());
    expect(PRACTICE_MAP.edges).toHaveLength(Object.keys(PRACTICE_MAP.positions).length - 1);
  });
});
