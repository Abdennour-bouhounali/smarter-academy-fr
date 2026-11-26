// « Espace jeu » of fraction-irreductible: every wave of every level is fair (exactly one right gate), mental arithmetic
// (every number printed at most 100), guided after a wrong gate by a true sentence, no wrong gate makes a TRUE equality,
// and the hub tells no rule.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { SUMMARY, waveBack } from '../../../../../../common/gameworld/kit/ladder';
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
import { STORY, TABLETS } from './story';
import { LESSON_KNOWLEDGE } from './knowledge';

const waves = function* (runs = 40) {
  for (const [i, node] of PRACTICE_NODES.entries())
    for (const [l] of node.levels.entries())
      for (let seed = 1; seed <= runs; seed += 1)
        for (const w of ladder.makeRun(rng(seed * 31 + i * 7 + l), i, l)) yield { w, i, l };
};
/** The numbers a sentence prints, its LaTeX commands left out (`\\square`, `\\times`, `\\mathrm`). */
const numbersIn = (s) => (s.replace(/\\[a-z]+/g, ' ').match(/\d+/g) ?? []).map(Number);

describe('fraction-irreductible — the practice ladder', () => {
  it('the nodes are the four keys in the order of the road, then the summary', () => {
    expect(PRACTICE_NODES.map((n) => n.id)).toEqual([...KEYS, SUMMARY]);
    expect(PRACTICE_NODES.map((n) => n.levels.length)).toEqual([1, 1, 2, 2, 2]);
    for (const n of PRACTICE_NODES) expect(TEXT.levels[n.id], n.id).toHaveLength(n.levels.length);
  });

  it('a run fits the rail (one gate per story wave), and a wrong gate never asks for a gate the rail lacks', () => {
    // the rail's gates are the story dash's waves (divisorIsles/Game.js › seg.gates): 6 here. 2026-11-26 walk: a wrong
    // gate pushed a 7th wave onto 6 gates — « reading 'arches' », the run crashed
    const gates = STORY.dashWaves.length;
    for (const [i, node] of PRACTICE_NODES.entries())
      for (const [l, level] of node.levels.entries()) {
        if (level.game) continue;
        let n = ladder.makeRun(rng(i * 7 + l + 1), i, l).length;
        expect(n, `${node.id}:${l + 1}`).toBeLessThanOrEqual(gates);
        // every mistake the run allows: a wave comes back only onto a free gate
        while (waveBack(n, gates)) n += 1;
        expect(n).toBeLessThanOrEqual(gates);
      }
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
    expect([...kinds].sort()).toEqual(['barrer', 'calcul', 'pgcdW', 'stays'].sort());
  });

  it('the right gates are what the arithmetic says; no wrong gate makes a true equality', () => {
    for (const { w } of waves(20)) {
      const g = w.gates[w.good];
      if (w.type === 'barrer') {
        // the common part struck leaves a denominator coprime with the numerator's left
        expect(gcd(w.a, w.b) * g).toBe(w.b);
      }
      if (w.type === 'stays') expect(gcd(g, w.n)).toBe(1);
      if (w.type === 'stays')
        for (const n of w.gates.filter((x) => x !== g)) expect(gcd(n, w.n), w.say).toBeGreaterThan(1);
      if (w.type === 'pgcdW') {
        expect(g * gcd(w.a, w.b)).toBe(w.side === 'd' ? w.b : w.a);
        for (const n of w.gates.filter((x) => x !== g))
          expect(gcd(w.a, w.b) * n === (w.side === 'd' ? w.b : w.a)).toBe(false);
      }
      if (w.type === 'calcul') {
        expect(g * gcd(w.A, w.B)).toBe(w.B);
        expect(gcd(w.A / gcd(w.A, w.B), g)).toBe(1);
        // a wrong gate leaves a common factor (the result simplified once, or not at all)
        for (const n of w.gates.filter((x) => x !== g))
          expect(gcd(w.A / (w.B / n), n) > 1 || (w.B / n) % 1 !== 0, w.say).toBe(true);
      }
    }
  });

  it('the hub, shown before any key: its level names and link labels name no rule and no key', () => {
    const words = /facteur|barr|irréductible|PGCD|plus grand|décompos|résultat|simplifi|commun/i;
    for (const names of Object.values(TEXT.levels)) for (const n of names) expect(n, n).not.toMatch(words);
    for (const [, , label] of PRACTICE_MAP.edges) if (label) expect(label).not.toMatch(words);
    expect(PRACTICE_MAP.root).not.toMatch(words);
    for (const s of [...Object.values(TEXT.levels).flat(), TEXT.summary.title, TEXT.summary.text])
      expect(typographyErrors(s), s).toEqual([]);
    expect(Object.keys(PRACTICE_MAP.positions).sort()).toEqual(['root', ...KEYS, SUMMARY].sort());
  });

  it('the map’s names are short: a node’s name (its tablet’s title) holds on two lines of the kit’s 17rem at most', () => {
    // 2026-11-26 walk, hub: the names of 48 to 54 characters ran over each other and out of the map. At 0.86rem bold a
    // line of 17rem holds about 33 characters; the names of the four keys are those of the lesson's knowledge map
    for (const k of KEYS) {
      expect(TABLETS[k].title.length, TABLETS[k].title).toBeLessThanOrEqual(40);
      const sheet = Object.values(LESSON_KNOWLEDGE.modules)
        .flat()
        .find((m) => m.id === k);
      expect(TABLETS[k].title, k).toBe(sheet.title);
    }
    // only the first key's name is long enough to wrap: it sits left of the centre, the second key below it
    const [ax, ay] = PRACTICE_MAP.positions[KEYS[0]];
    const [bx, by] = PRACTICE_MAP.positions[KEYS[1]];
    expect(ax).toBeLessThan(50);
    expect(by - ay).toBeGreaterThanOrEqual(10);
    expect(bx).toBeGreaterThanOrEqual(84);
  });
});
