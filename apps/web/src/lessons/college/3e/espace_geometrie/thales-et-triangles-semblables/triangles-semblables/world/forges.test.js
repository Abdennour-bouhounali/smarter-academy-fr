/**
 * THE FORGES of lesson `triangles-semblables`: the shared checks (`describeForges` — kit/authoring/test/suites.js; a case
 * here is two triangles apart, drawn by the world's mirror from its own scene), then what is this lesson's own — the false
 * rules its students really hold and the COMPUTED round where each one falls (UNIT_3E_THALES_DESIGN.md, « Lesson 1 » v4),
 * every case drawn, the last steps' values, and every screen's numbers against the bank and the other stories, pair by
 * pair.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { runOn, testsOf, ruleKey } from '../../../../../../common/gameworld/kit/forge';
import { allRules, describeForges, plain } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { Mirror, Line, UseFigure, sceneFigure } from '../../../../../../common/gameworld/nilePyramids/forgeParts';
import { angleArc, layoutGeoFigure } from '../../../../../../common/components/geoFigure';
import { initPair, pairReducer, pairResult, ranks } from '../../../../../../common/gameworld/nilePyramids/pair';
import {
  initAngles,
  anglesReducer,
  anglesResult,
  toMeasure,
  triOf,
} from '../../../../../../common/gameworld/nilePyramids/angles';
import { FORGES, F1_HARD, F2_HARD, F2_SIDE, USE1, USE2, readable } from './forges';
import { ANGLES_INQUIRY, PAIR_INQUIRY } from './inquiries';
import { KEYS } from './journey';
import { K, NUMBERS, equal, over, times, write } from './math';

// the experiments' screens expose their state to the walks on `window` (dev only)
globalThis.window = globalThis.window ?? {};

const K1 = K.cotes;
const K2 = K.angles;
const ID = 'triangles-semblables';

// ───────── what each experiment hands back: played through its own reducer, as the walk's outline (design v4) ─────────
const runP = (s, actions) => actions.reduce((acc, a) => pairReducer(PAIR_INQUIRY, acc, a), s);
const link = (t, s) => [
  { type: 'pick', side: 't', i: t },
  { type: 'pick', side: 's', i: s },
];
/** Links every template side to the stone side of the same rank (« by size »), the locked one apart. */
const bySize = (r, skip) => {
  const rt = ranks(PAIR_INQUIRY.template.sides);
  const rs = ranks(r.stone.sides);
  return rt.flatMap((t, n) => (t === skip ? [] : link(t, rs[n])));
};
/** SIM, RED « the shape », ONE, DIFF « not » by size; TURN laid as the mason linked it (by the names), then relinked. */
function playPair(said = ['shape', 'shape', 'not', 'not', 'shape']) {
  let s = initPair(PAIR_INQUIRY);
  PAIR_INQUIRY.rounds.forEach((r, i) => {
    s = runP(s, [{ type: 'say', v: said[i] }]);
    if (r.link === 'world-first') s = runP(s, [...bySize(r, s.locked), { type: 'lay' }]);
    else s = runP(s, [{ type: 'lay' }, ...bySize(r, null)]);
    s = runP(s, [{ type: 'next' }]);
  });
  expect(s.done).toBe(true);
  return pairResult(s);
}
const runA = (s, actions) => actions.reduce((acc, a) => anglesReducer(ANGLES_INQUIRY, acc, a), s);
/** Every round measured (two vertices of each triangle he measures), his prediction, the slide. */
function playAngles(said = ['same', 'other', 'other', 'other']) {
  let s = initAngles(ANGLES_INQUIRY);
  ANGLES_INQUIRY.rounds.forEach((r, i) => {
    for (const t of toMeasure(r))
      for (const v of [0, 1])
        s = runA(s, [
          { type: 'place', t, v },
          { type: 'needle', deg: Number(triOf(r, t).angles[v]) },
          { type: 'read' },
        ]);
    s = runA(s, [{ type: 'say', v: said[i] }, { type: 'slide' }, { type: 'next' }]);
  });
  expect(s.done).toBe(true);
  return anglesResult(s);
}
const PAIR_RESULT = playPair();
const ANGLES_RESULT = playAngles();

/** The world's log at docks 2 and 4 (Thalès figures of the yard and the capstone, no `of`): never this forge's evidence. */
const worldRow = { kind: 'nested', names: { V: 'S' }, len: { VM: '10', VB: '20' }, held: true };
const ROADS = {
  AT_ONCE: { [K1]: [], [K2]: [] },
  WORLD: { [K1]: [worldRow], [K2]: [worldRow, { ...worldRow, held: false }] },
};

/** The right answer of each last step, computed from its case. */
const SOLVE = {
  [K1]: () => ({
    pair: 'BC',
    kn: NUMBERS.cotes.use.given,
    kd: NUMBERS.cotes.use.pairedWith,
    k: NUMBERS.cotes.use.k,
    np: NUMBERS.cotes.use.short,
    pm: NUMBERS.cotes.use.long,
  }),
  [K2]: (c) => ({ vA: c.vertex.A, vB: c.vertex.B, vC: c.vertex.C, side: [...c.side.AB].sort().join('') }),
};
/** The words of each key's NAME and of its tablet: no sentence of its forge says them before its last step. */
const FORBIDDEN = {
  [K1]: /semblabl|proportionn|homologu|réduction|agrandiss/i,
  [K2]: /homologu|angles égaux|somme des angles|180/i,
};

const suite = describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: ROADS,
  inquiry: { [K1]: PAIR_RESULT, [K2]: ANGLES_RESULT },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  bank: ID,
  tiles: { [K1]: 6, [K2]: 6 },
});

// ───────── the lesson's own ─────────

const F = FORGES;
const rule = (key, r) => allRules(F[key]).find((x) => ruleKey(F[key], x) === ruleKey(F[key], r));
/** Where a rule falls on a road: a round of his evidence, or the mirror's attack. */
const fallOf = (key, r, road = ROADS.AT_ONCE) => suite.refutedBy(key, rule(key, r), road);
const textOf = (html) => html.replace(/<annotation[^>]*>.*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');

describe('the forges’ ids are the lesson’s', () => {
  it('one forge per key, in the order of the docks; each id quoted in forges.js (the status script)', () => {
    expect(Object.keys(F)).toEqual(KEYS);
    expect(KEYS).toEqual([K1, K2]);
    const src = readFileSync(new URL('./forges.js', import.meta.url), 'utf8');
    for (const k of KEYS) expect(src.includes(`'${k}'`), k).toBe(true);
  });
  it('no title, heading or tile names a key before its seal (gate A 4th, note 6)', () => {
    for (const key of KEYS) {
      const T = F[key].text;
      const shown = [
        T.title,
        T.log,
        T.frame,
        ...F[key].slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
      ];
      for (const x of shown)
        expect(x).not.toMatch(/côtés proportionnels|angles égaux|cotes-proportionnels|angles-egaux/i);
    }
  });
});

describe('cotes-proportionnels — the five tracés, and where each false rule falls (design v4)', () => {
  const rows = suite.rowsOf(K1, ROADS.AT_ONCE);
  const byRound = Object.fromEntries(rows.map((c) => [c.round, c]));

  it('his evidence is the five rounds, in the order he laid them; the world says SIM, RED, TURN have the shape', () => {
    expect(rows.map((c) => c.round)).toEqual(['sim', 'red', 'one', 'diff', 'turn']);
    expect(rows.map((c) => c.held)).toEqual([true, true, false, false, true]);
    expect(rows.map((c) => c.stone.sides)).toEqual(NUMBERS.cotes.rounds.map((r) => r.sides));
    // the world's k (template ÷ tracé, both shortest) is the design's for the rounds with the shape
    for (const id of ['sim', 'red', 'turn'])
      expect(
        equal(
          over(byRound[id].stone.sides[ranks(byRound[id].stone.sides)[0]], '2'),
          NUMBERS.cotes.rounds.find((r) => r.id === id).k,
        ),
        id,
      ).toBe(true);
  });

  it('the mirror reads ONE, DIFF, TURN first (`tests`)', () => {
    const right = allRules(F[K1]).find(F[K1].isTheRule);
    expect(testsOf(F[K1], right, rows).map((c) => c.round)).toEqual(['one', 'diff', 'turn', 'sim', 'red']);
  });

  it.each([
    [{ pair: 'rang', test: 'deux' }, 'one', true],
    [{ pair: 'rang', test: 'diff' }, 'diff', true],
    [{ pair: 'noms', test: 'trois' }, 'turn', false],
    [{ pair: 'noms', test: 'deux' }, 'one', true],
    [{ pair: 'noms', test: 'diff' }, 'diff', true],
  ])('%o falls on %s (it says « the shape »: %s)', (r, round, says) => {
    const f = fallOf(K1, r);
    expect(f.on).toBe('evidence');
    expect(f.c.round).toBe(round);
    expect(F[K1].says(rule(K1, r), f.c)).toBe(says);
    plain(F[K1].text.refuted({ ...f.c, says }));
  });

  it('the computed values: ONE 3 ÷ 2 = 4,5 ÷ 3 ≠ 5,1 ÷ 3,8; DIFF 3 − 2 = 4 − 3 = 4,8 − 3,8; TURN by the names 4,5 ÷ 2 ≠ 5,7 ÷ 3 ≠ 3 ÷ 3,8', () => {
    const ex = (r, id) => F[K1].explain(rule(K1, r), byRound[id]);
    expect(ex({ pair: 'rang', test: 'deux' }, 'one')).toContain(
      '$3 \\div 2 = 4{,}5 \\div 3$ et $4{,}5 \\div 3 \\neq 5{,}1 \\div 3{,}8$',
    );
    expect(ex({ pair: 'rang', test: 'diff' }, 'diff')).toContain('3 - 2 = 4 - 3 = 4{,}8 - 3{,}8');
    expect(ex({ pair: 'noms', test: 'trois' }, 'turn')).toContain(
      '$4{,}5 \\div 2 \\neq 5{,}7 \\div 3$ et $5{,}7 \\div 3 \\neq 3 \\div 3{,}8$',
    );
    expect(ex({ pair: 'rang', test: 'trois' }, 'turn')).toContain('3 \\div 2 = 4{,}5 \\div 3 = 5{,}7 \\div 3{,}8');
    // no quotient is evaluated: only the screen's lengths (gate A 3rd, D2)
    for (const c of rows) for (const r of allRules(F[K1])) expect(F[K1].explain(r, c)).not.toMatch(/\\dfrac|\\approx/);
  });

  it('the right rule meets a reduction it has not seen (yes) and DIFF’s sides renamed (no)', () => {
    const right = allRules(F[K1]).find(F[K1].isTheRule);
    const list = F[K1].attacks(right, rows);
    expect(list.map((c) => c.id)).toEqual(F1_HARD.map((c) => c.id));
    expect(list.map((c) => c.held)).toEqual([true, false]);
  });
});

describe('angles-egaux — the four rounds, and where each false rule falls (design v4)', () => {
  const rows = suite.rowsOf(K2, ROADS.AT_ONCE);
  const byRound = Object.fromEntries(rows.map((c) => [c.round, c]));

  it('his evidence: R1 the same shape, R2 another, R3 does not close (225°), R4 another (no third side)', () => {
    expect(rows.map((c) => [c.round, c.held, c.open])).toEqual([
      ['r1', true, false],
      ['r2', false, false],
      ['r3', false, true],
      ['r4', false, false],
    ]);
    expect(byRound.r1.angles).toEqual([NUMBERS.angles.face, ['41', '27', '112']]);
    expect(byRound.r3.angles[1]).toEqual(NUMBERS.angles.r3.block);
    expect(byRound.r4.sides).toEqual(NUMBERS.angles.r4.sides);
  });

  it('a rule reads only the cases that write what it compares; the mirror reads R2, R3, R4, then R1', () => {
    const at = (r) => testsOf(F[K2], rule(K2, r), rows).map((c) => c.round);
    expect(at({ what: 'deux', how: 'egaux' })).toEqual(['r2', 'r3', 'r1']);
    expect(at({ what: 'un', how: 'egaux' })).toEqual(['r2', 'r3', 'r4', 'r1']);
    expect(at({ what: 'cotes', how: 'fois' })).toEqual(['r4']);
    // the right rule agrees with every case, those it cannot read included (they are not the same shape)
    const right = allRules(F[K2]).find(F[K2].isTheRule);
    expect(runOn(F[K2], right, rows).bad).toBe(-1);
    expect(readable(right, byRound.r4)).toBe(false);
  });

  it.each([
    [{ what: 'un', how: 'egaux' }, 'r2'],
    [{ what: 'deux', how: 'fois' }, 'r3'],
    [{ what: 'un', how: 'fois' }, 'r2'],
    [{ what: 'cotes', how: 'fois' }, 'r4'],
  ])('%o falls on %s, saying « the same shape »', (r, round) => {
    const f = fallOf(K2, r);
    expect(f.on).toBe('evidence');
    expect(f.c.round).toBe(round);
    expect(F[K2].says(rule(K2, r), f.c)).toBe(true);
    plain(F[K2].text.refuted({ ...f.c, says: true }));
  });

  it('« deux côtés égaux » reads only R4 (4 ; 6 against 6 ; 9: not equal) — the mirror breaks it with 4 ; 6 at 27° and at 41°', () => {
    const f = fallOf(K2, { what: 'cotes', how: 'egaux' });
    expect(f.on).toBe('attack');
    expect(f.c.id).toBe(F2_SIDE.id);
    expect(f.c.held).toBe(false);
  });

  it('the computed values: R2 27° alone; R3 × 1,25 (33,75° and 51,25°); R4 9 ÷ 6 = 6 ÷ 4', () => {
    expect(F[K2].explain(rule(K2, { what: 'un', how: 'egaux' }), byRound.r2)).toContain('égaux\u00a0: $27^\\circ$');
    const r3 = F[K2].explain(rule(K2, { what: 'deux', how: 'fois' }), byRound.r3);
    expect(r3).toContain('33{,}75^\\circ = 27^\\circ \\times 1{,}25');
    expect(r3).toContain('51{,}25^\\circ = 41^\\circ \\times 1{,}25');
    expect(F[K2].explain(rule(K2, { what: 'cotes', how: 'fois' }), byRound.r4)).toContain('6 \\div 4 = 9 \\div 6');
    // R3's sum, the world's: 225°
    expect(write(times(NUMBERS.angles.r3.factor, '180'))).toBe(NUMBERS.angles.r3.sum);
  });

  it('the right rule meets R1’s numbers renamed (yes) and R2’s renamed (no)', () => {
    const right = allRules(F[K2]).find(F[K2].isTheRule);
    const list = F[K2].attacks(right, rows);
    expect(list.map((c) => c.id)).toEqual(F2_HARD.map((c) => c.id));
    expect(list.map((c) => c.held)).toEqual([true, false]);
  });
});

describe('the last steps', () => {
  it('K1: [MN] → [BC], k = 12/3 = 4, NP = 8, PM = 15,2 — any equal fraction; the inverse and the shortest answered', () => {
    const U = NUMBERS.cotes.use;
    expect(write(over(U.given, U.pairedWith))).toBe(U.k);
    expect(write(times('2', U.k))).toBe(U.short);
    expect(write(times('3,8', U.k))).toBe(U.long);
    const ok = SOLVE[K1]();
    expect(F[K1].use.check(USE1, ok)).toBe('ok');
    expect(F[K1].use.check(USE1, { ...ok, kn: '4', kd: '1' })).toBe('ok');
    expect(F[K1].use.check(USE1, { ...ok, kn: '3', kd: '12' })).toBe('inverse');
    expect(F[K1].use.check(USE1, { ...ok, pair: 'AB' })).toBe('short');
    expect(F[K1].use.check(USE1, { ...ok, kn: '0' })).toBe('frac');
  });
  it('K2: A ↔ Z, B ↔ X, C ↔ Y (by their angles), [AB] ↔ [XZ]; the order of the names is answered', () => {
    expect(USE2.vertex).toEqual({ A: 'Z', B: 'X', C: 'Y' });
    const ok = SOLVE[K2](USE2);
    expect(ok.side).toBe('XZ');
    expect(F[K2].use.check(USE2, ok)).toBe('ok');
    expect(F[K2].use.check(USE2, { ...ok, vA: 'X' })).toBe('byNames');
    expect(F[K2].use.check(USE2, { ...ok, vA: 'Y' })).toBe('vertex');
  });
  it('each figure fits beside its lines at its 12 px floor; it writes what the question gives and « ? » for what it asks', () => {
    for (const c of [USE1, USE2]) {
      const f = sceneFigure(c);
      expect(f.fits, `${c.id} ${f.width}×${f.height}`).toBe(true);
    }
    const one = textOf(renderToString(createElement(UseFigure, { c: USE1 })));
    for (const x of ['2', '3', '3,8', '12', 'moyen', 'court ?', 'long ?']) expect(one).toContain(x);
    expect(one).not.toMatch(/15,2|(?<![\d,])8(?![\d,])/);
    const two = textOf(renderToString(createElement(UseFigure, { c: USE2 })));
    for (const x of ['27°', '41°', '112°']) expect(two).toContain(x);
  });
});

describe('every case the mirror draws: its own scene, one round per screen', () => {
  it('the mirror and a line of evidence render each case of each forge; a line writes no number (note 3)', () => {
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        const m = renderToString(createElement(Mirror, { c, stage: 'done' }));
        expect(m, c.id).toContain('data-np-scene');
        expect(m).not.toMatch(/undefined|NaN/);
        const l = textOf(renderToString(createElement(Line, { c })));
        expect(l, c.id).not.toMatch(/\d/);
      }
  });
  it('the mirror writes only the numbers of the case’s own screen', () => {
    const SCREENS = [
      ['2', '3', '3,8', '4,5', '5,7'],
      ['2', '3', '3,8', '1', '1,5', '1,9'],
      ['2', '3', '3,8', '4,5', '5,1'],
      ['2', '3', '3,8', '4', '4,8'],
      ['27', '41', '112', '6', '8'],
      ['27', '41', '112', '55', '98', '6', '8'],
      ['27', '41', '4', '6', '9'],
    ];
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        if (c.open) continue;
        const nums = [
          ...textOf(renderToString(createElement(Mirror, { c, stage: 'done' }))).matchAll(/\d+(,\d+)?/g),
        ].map((m) => m[0]);
        expect(
          SCREENS.some((s) => nums.every((x) => s.includes(x))),
          `${c.id}: ${nums}`,
        ).toBe(true);
      }
  });
  it('each mirror drawing is at most 380 px wide at its 12 px label floor', () => {
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) expect(sceneFigure(c).width, c.id).toBeLessThanOrEqual(380);
  });
  it('under attack the drawing never shrinks below its 12 px floor: not shrinkable, its width the floor × k (walk 2026-11-27)', () => {
    // a shrinkable flex item is sized by its content, and an SVG with a viewBox alone counts 300 px: lengths read 11.3 px
    for (const key of KEYS)
      for (const c of suite.shownCases(F[key])) {
        const html = renderToString(createElement(Mirror, { c, stage: 'attack' }));
        const style = html.match(/class="np-mirror__fig" style="([^"]*)"/)?.[1] ?? '';
        expect(style, c.id).toMatch(/flex:\s*0 0 auto/);
        const [, k, spare] =
          style.match(/width:\s*calc\(var\(--di-min-font, 12px\) \* ([\d.]+) \* ([\d.]+) \+ 0\.6rem\)/) ?? [];
        // the drawing's width at the floor: its smallest label (12 an angle, 13 a length, in viewBox units) at the floor
        const vw = layoutGeoFigure(c.scene).viewBox[2];
        const smallest = c.scene.angles.some((a) => a.label) ? 12 : 13;
        expect(Number(k) * smallest, c.id).toBeGreaterThanOrEqual(vw);
        expect(Number(spare), c.id).toBeGreaterThan(1);
        expect(html, c.id).toContain('max-width:100%');
      }
  });
});

describe('the forges’ numbers are the platform’s own — pair by pair (design « Numbers (v4) »)', () => {
  const bank = readBank(ID);
  const stories = storiesOf({ exceptId: ID });
  const tracked = (x) => !/^\d+$/.test(x) || Number(x) >= 10;
  const groups = {
    'K1 SIM / TURN': ['2', '3', '3,8', '4,5', '5,7'],
    'K1 RED': ['2', '3', '3,8', '1', '1,5', '1,9'],
    'K1 ONE': ['2', '3', '3,8', '4,5', '5,1', '5,7'],
    'K1 DIFF': ['2', '3', '3,8', '4', '4,8', '4,5', '5,7'],
    'K1 last step': ['2', '3', '3,8', '12', '4', '8', '15,2'],
    'K2 R1': ['27', '41', '112', '6', '8'],
    'K2 R2': ['27', '41', '112', '55', '98', '6', '8'],
    'K2 R3': ['27', '41', '112', '1,25', '33,75', '51,25', '140', '225'],
    'K2 R4': ['27', '41', '4', '6', '9'],
    'K2 last step': ['27', '41', '112'],
  };
  it.each(Object.entries(groups))('%s: no pair on a line of the bank or of another story', (_, nums) => {
    const uniq = [...new Set(nums)].filter(tracked);
    const hits = [];
    for (let i = 0; i < uniq.length; i += 1)
      for (let j = i + 1; j < uniq.length; j += 1) {
        const r = collisions(bank, [uniq[i], uniq[j]], { stories });
        if (!r.clear) hits.push(`${uniq[i]} ; ${uniq[j]}: ${JSON.stringify([r.bankLines, r.storyLines, r.numbers])}`);
      }
    expect(hits).toEqual([]);
  });
});

describe('K2’s last step: ABC as large as XYZ, each angle’s measure inside its own angle (gate B, 2026-11-27)', () => {
  it('the two triangles have one size; no measure crosses a side or another measure', () => {
    const spec = USE2.scene;
    const L = layoutGeoFigure(spec);
    const w = (ns) => Math.max(...ns.map((n) => L.P[n][0])) - Math.min(...ns.map((n) => L.P[n][0]));
    expect(w(['A', 'B', 'C']) / w(['X', 'Y', 'Z'])).toBeGreaterThan(0.9);
    expect(w(['A', 'B', 'C'])).toBeGreaterThan(150);
    const boxes = spec.angles.map((g) => {
      const [x, y] = angleArc(L.P[g.from], L.P[g.at], L.P[g.to], g.radius ?? 20).label;
      const half = (g.label.length * 6.7) / 2;
      return { g, x0: x - half, x1: x + half, y0: y - 10, y1: y + 1, c: [x, y - 4.5] };
    });
    const inTri = (p, [a, b, c]) => {
      const s = (u, v) => Math.sign((v[0] - u[0]) * (p[1] - u[1]) - (v[1] - u[1]) * (p[0] - u[0]));
      return new Set([s(a, b), s(b, c), s(c, a)]).size === 1;
    };
    for (const b of boxes) {
      expect(inTri(b.c, [L.P[b.g.at], L.P[b.g.from], L.P[b.g.to]]), b.g.at).toBe(true);
      for (const o of boxes)
        if (o !== b)
          expect(b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1, `${b.g.at}/${o.g.at}`).toBe(false);
    }
    expect(sceneFigure(USE2).fits).toBe(true);
  });
});
