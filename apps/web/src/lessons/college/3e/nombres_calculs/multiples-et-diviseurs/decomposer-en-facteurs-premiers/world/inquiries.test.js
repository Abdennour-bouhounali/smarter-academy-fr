// THE EXPERIMENTS of decomposer-en-facteurs-premiers: the shared checks (authoring kit) — no two keys share a
// (kind, mode), no sentence names a key or states its rule — over EVERY sentence each experiment can say on its own
// numbers, then what is this lesson's own: the specs play on the world's logic, every sentence is French, and the
// numbers make the facts the forges refute with.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  describeExperiments,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { factorNow, initFactor, layPlank } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { lastNeeded, missedBy, tryPlank } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { MAX_LINES, sheetOf, zerosOf } from '../../../../../../common/gameworld/divisorIsles/sheet';
import { FORGES } from './forges';
import { LADDER_INQUIRY, SHEET_INQUIRY, STOP_INQUIRY } from './inquiries';
import { NUMBERS, primeFactors } from './math';
import { K } from './story';

/** Every gap a round of the ladder can show: n and every quotient by the planks of the rack. */
const gapsOf = (n, rack) => {
  const seen = new Set([n]);
  const todo = [n];
  while (todo.length) {
    const g = todo.pop();
    for (const d of rack)
      if (g % d === 0 && g / d > 1 && !seen.has(g / d)) {
        seen.add(g / d);
        todo.push(g / d);
      }
  }
  return [...seen];
};
/** Every number a sheet can show: n and its quotients by its primes. */
const sheetsOf = (n) => {
  const out = new Set([n]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const x of [...out])
      for (const p of primeFactors(x))
        if (x / p > 1 && !out.has(x / p)) {
          out.add(x / p);
          changed = true;
        }
  }
  return [...out];
};

function ladderLines(spec) {
  const T = spec.text;
  const out = [T.rackLabel, T.laidLabel, T.next, T.done, ...[1, 2, 3, 11].map(T.folded)];
  for (const { n } of spec.rounds) {
    out.push(T.lead(n), T.goal(n));
    for (const g of gapsOf(n, spec.rack)) {
      out.push(T.ask({ n, gap: g, laid: [] }));
      for (const d of spec.rack) {
        const a = layPlank(g, d);
        out.push(a.held ? T.held(a) : T.fell(a));
      }
    }
    const planks = primeFactors(n);
    for (const fell of [0, 1, 2]) {
      const attempts = [...planks.map((d) => ({ plank: d, held: true })), ...Array(fell).fill({ held: false })];
      out.push(T.end({ n, planks, attempts }), T.foundLine({ n, planks, attempts, fell }));
    }
  }
  return out;
}

function pairsLines(spec) {
  const T = spec.text;
  const out = [...stringsIn(T.cols), T.partner, T.askYes, T.askNo, T.afterSweep, T.next, T.done];
  spec.gaps.forEach((a, gi) => {
    const m = lastNeeded(a);
    out.push(T.stripLabel(a), T.lead(a, gi), T.guess(a, gi), T.ask(a, m + 2), T.pick(a), T.foundLine(a, m));
    for (const over of [false, true]) for (const n of [0, 1, 2, a - m - 2]) out.push(T.swept(n, a, over));
    for (const g of [null, m, m - 1, m + 1]) out.push(T.pickOk(a, m, g));
    for (let d = 1; d <= a; d += 1) {
      const t = tryPlank(a, d);
      out.push(T.plank(d), T.tryBtn(d), T.between(Math.floor(t.partner), Math.floor(t.partner) + 1));
      out.push(t.whole ? (t.crossed ? T.known(a, t) : T.held(a, t)) : t.crossed ? T.fellBehind(a, t) : T.fell(a, t));
      if (d < m) out.push(T.pickEarly(a, d, missedBy(a, d)));
      if (d > m && d <= m + 5) out.push(T.pickLate(a, d, t));
    }
  });
  return out;
}

function sheetLines(spec) {
  const T = spec.text;
  const out = [T.primeHead, T.prime, T.notebook, T.next, T.done];
  for (const { n } of spec.rounds) {
    out.push(T.lead(n), T.goal(n));
    const factors = primeFactors(n);
    out.push(T.end({ n, factors, attempts: [] }), T.foundLine({ n, factors, attempts: [] }));
    for (const x of sheetsOf(n)) {
      const lines = sheetOf(x, spec.stop);
      const zeros = zerosOf(lines);
      out.push(T.ask({ n: x, lines: lines.length }));
      if (zeros.length) out.push(T.notPrime({ n: x, zeros }), T.notPrime({ n: x, zeros: zeros.slice(0, 1) }));
      for (const l of lines) {
        const a = {
          type: 'line',
          before: x,
          p: l.p,
          r: l.r,
          held: l.r === 0,
          after: l.r ? x : x / l.p,
          lines: lines.length,
        };
        out.push(a.held ? T.held(a) : T.miss(a));
      }
    }
  }
  return out;
}

const OF_KEY = { [K.ladder]: LADDER_INQUIRY, [K.stop]: STOP_INQUIRY, [K.tool]: SHEET_INQUIRY };
const LINES = { [K.ladder]: ladderLines, [K.stop]: pairsLines, [K.tool]: sheetLines };
/** The words of each key's name and of what it states: none of its experiment says them. */
const OWN = {
  [K.ladder]: /plus petit|la plus petite planche|tant qu’elle tient/i,
  [K.stop]: /s’arrêter|nombres? premiers?|carré ne dépasse/i,
  [K.tool]: /tableur|recommence|outil/i,
};

describeExperiments({
  ofKey: OF_KEY,
  linesOf: (key, spec) => LINES[key](spec),
  never: /facteurs? premiers?|décompos|puissance|exposant/i,
  own: OWN,
});

describe('the experiments of the lesson — its own checks', () => {
  it('each key with an experiment opens on it; key 2 (a writing convention) has none and opens on its tiles', () => {
    for (const [key, spec] of Object.entries(OF_KEY)) expect(FORGES[key].inquiry).toBe(spec);
    expect(FORGES[K.powers].inquiry).toBeUndefined();
    // after an experiment no prediction is asked: the experiment held them
    for (const key of Object.keys(OF_KEY)) expect(FORGES[key].predictCases([])).toEqual([]);
  });

  it('the specs are the design’s numbers and play on the world’s logic (every round reaches 1 on its rack)', () => {
    expect(LADDER_INQUIRY.rounds.map((r) => r.n)).toEqual(NUMBERS.ladder.rounds);
    expect(LADDER_INQUIRY.rack).toEqual(NUMBERS.ladder.rack);
    let s = initFactor(LADDER_INQUIRY);
    for (let ri = 0; ri < LADDER_INQUIRY.rounds.length; ri += 1) {
      s = { ...s, ri, gap: null };
      expect(() => factorNow(LADDER_INQUIRY, s)).not.toThrow();
    }
    expect(STOP_INQUIRY.gaps).toEqual(NUMBERS.stop.rounds);
    expect(SHEET_INQUIRY.rounds.map((r) => r.n)).toEqual(NUMBERS.tool.rounds);
    for (const { n } of SHEET_INQUIRY.rounds)
      for (const x of sheetsOf(n)) expect(sheetOf(x, SHEET_INQUIRY.stop).length).toBeLessThanOrEqual(MAX_LINES);
  });

  it('the facts the forges refute with are on the screens: 72 ÷ 2 = 36 still even, 4 falls on 9, 91 = 7 × 13, 53', () => {
    const T = LADDER_INQUIRY.text;
    expect(T.held(layPlank(72, 2))).toContain('72 \\div 2 = 36');
    expect(T.fell(layPlank(9, 4))).toMatch(/Une planche de 4, c’est 2.planches de 2 bout à bout/);
    expect(STOP_INQUIRY.text.held(91, tryPlank(91, 7))).toContain('91 = 7 \\times 13');
    // 97: past the crossing (9), every partner is behind — nothing new can appear
    expect(lastNeeded(97)).toBe(9);
    expect(STOP_INQUIRY.text.fellBehind(97, tryPlank(97, 11))).toMatch(/derrière elle/);
    // 3 127 = 53 × 59: the sheet stops at 53 and 53 shows the remainder 0
    expect(sheetOf(3127).at(-1)).toEqual({ p: 53, r: 0 });
    // 2 431 ends in 1 and none of 2, 3, 5, 7 fills it — the sheet's line 11 does
    expect(zerosOf(sheetOf(2431))).toEqual([11, 13, 17]);
  });

  it('every sentence of every experiment is French: typography and agreement', () => {
    for (const [key, spec] of Object.entries(OF_KEY))
      for (const line of LINES[key](spec)) {
        expect(typographyErrors(line), `${key}: ${line}`).toEqual([]);
        expect(agreementErrors(line), `${key}: ${line}`).toEqual([]);
      }
  });

  it('a plain string holds no formula: labels, the strip, the goal, the folded line, the sheet’s cells', () => {
    const plainOnes = [
      LADDER_INQUIRY.text.rackLabel,
      LADDER_INQUIRY.text.laidLabel,
      ...[1, 4].map(LADDER_INQUIRY.text.folded),
      ...NUMBERS.ladder.rounds.map(LADDER_INQUIRY.text.goal),
      ...STOP_INQUIRY.gaps.flatMap((a) => [STOP_INQUIRY.text.stripLabel(a), STOP_INQUIRY.text.plank(a)]),
      ...stringsIn(STOP_INQUIRY.text.cols),
      STOP_INQUIRY.text.between(45, 46),
      SHEET_INQUIRY.text.primeHead,
      SHEET_INQUIRY.text.notebook,
      SHEET_INQUIRY.text.prime,
      ...NUMBERS.tool.rounds.map(SHEET_INQUIRY.text.goal),
    ];
    for (const s of plainOnes) expect(s, s).not.toMatch(/\$|\\/);
  });
});
