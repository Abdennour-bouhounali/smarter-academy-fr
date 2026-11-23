// « Espace jeu » of decomposer-en-facteurs-premiers: every wave of every level is fair (exactly one right gate), mental
// arithmetic (every number printed at most 100), guided after a wrong gate by a true sentence, and the hub tells no rule.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY } from '../../../../../../common/gameworld/kit/ladder';
import {
  agreementErrors,
  said,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { BOSS_A, isPrime, valueOfPowers } from './math';
import { K } from './story';
import { KEYS } from './journey';
import { TEXT } from './text';
import { PRACTICE_MAP, PRACTICE_NODES, isRight, ladder, lastPrimeOf } from './practice';

const waves = function* (runs = 40) {
  for (const [i, node] of PRACTICE_NODES.entries())
    for (const [l] of node.levels.entries())
      for (let seed = 1; seed <= runs; seed += 1)
        for (const w of ladder.makeRun(rng(seed * 31 + i * 7 + l), i, l)) yield { w, i, l };
};
/** The numbers a sentence prints, its LaTeX commands left out (`\\square`, `\\times`). */
const numbersIn = (s) => (s.replace(/\\[a-z]+/g, ' ').match(/\d+/g) ?? []).map(Number);

describe('decomposer-en-facteurs-premiers — the practice ladder', () => {
  it('the nodes are the four keys in the order of the road, then the summary', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    // the weight of the bank: the procedure and « is it prime » (P1) two levels each, the powers (P2) two, the tool one
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([2, 2, 2, 1, 2]);
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
    expect([...kinds].sort()).toEqual(
      [
        'divisorOfPow',
        'exponent',
        'lastPrime',
        'missingFactor',
        'modCell',
        'powerValue',
        'primeAmong',
        'programStop',
        'smallestPrime',
      ].sort(),
    );
  });

  it('the right gates are what the arithmetic says', () => {
    for (const { w } of waves(20)) {
      const g = w.gates[w.good];
      if (w.type === 'smallestPrime') expect(w.a % g === 0 && isPrime(g)).toBe(true);
      if (w.type === 'lastPrime') expect(g * g <= w.a && isPrime(g) && g === lastPrimeOf(w.a)).toBe(true);
      if (w.type === 'primeAmong') expect(w.gates.filter(isPrime)).toEqual([g]);
      if (w.type === 'divisorOfPow') {
        expect(w.a % g).toBe(0);
        // the last bridge's decomposition stays the mission's
        expect(w.a).not.toBe(BOSS_A);
      }
      if (w.type === 'powerValue') expect(g).toBe(w.a);
      if (w.type === 'missingFactor') expect(isPrime(g) && g * w.known === w.a).toBe(true);
    }
    expect(valueOfPowers([{ p: 2, e: 3 }])).toBe(8);
  });

  it('from the THIRD level of the ladder on, every level reads a decomposition as a tool', () => {
    const order = ladder.LEVEL_ORDER;
    order.forEach((x, k) => {
      const kinds = PRACTICE_NODES[x.node].levels[x.level].mix.map(([kind]) => kind);
      expect(kinds.includes('divisorOfPow'), x.id).toBe(k >= 2);
    });
    // key 4's level holds the trace of the program that tests the divisors
    expect(PRACTICE_NODES[3].levels[0].mix.map(([k]) => k)).toContain('programStop');
  });

  it('the hub, shown before any key: its level names and link labels name no rule and no key', () => {
    const words = /facteurs? premiers?|décompos|puissance|exposant|s’arrêter|carré|tableur|programme|MOD/i;
    for (const names of Object.values(TEXT.levels)) for (const n of names) expect(n, n).not.toMatch(words);
    for (const [, , label] of PRACTICE_MAP.edges) if (label) expect(label).not.toMatch(words);
    for (const s of [...Object.values(TEXT.levels).flat(), TEXT.summary.title, TEXT.summary.text])
      expect(typographyErrors(s), s).toEqual([]);
    expect(Object.keys(PRACTICE_MAP.positions).sort()).toEqual(['root', ...KEYS, SUMMARY].sort());
    expect(K.ladder).toBe(KEYS[0]);
  });
});
