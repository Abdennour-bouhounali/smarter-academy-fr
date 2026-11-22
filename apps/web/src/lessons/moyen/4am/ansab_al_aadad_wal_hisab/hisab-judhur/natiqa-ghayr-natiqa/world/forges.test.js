/**
 * THE FORGES of lesson `natiqa-ghayr-natiqa`: the shared checks (`describeForges`, `describeLimits` —
 * kit/authoring/test/suites.js; a case here is a court and a rod), then what is this lesson's own — no two rules the
 * tiles can write agree on every case, the false rules its students really hold and where each one falls, a case is
 * drawn as what the world does, the forges' arithmetic agrees with math.js, and the numbers of the mirrors and of the
 * last steps against the bank and the other stories.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ruleKey, runOn } from '../../../../../../common/gameworld/kit/forge';
import {
  allRules,
  describeForges,
  describeLimits,
  plain,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { initChase, chaseReducer, chaseResult } from '../../../../../../common/gameworld/rootCourts/chase';
import { isWall, outcome, read, rootOf, square, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { Mirror, Line } from '../../../../../../common/gameworld/rootCourts/forgeParts';
import {
  FORGES,
  K1,
  K2,
  K3,
  USE1,
  USE3,
  F1_HARD,
  F2_HARD,
  F3_HARD,
  aboveAt,
  calcCase,
  calculator,
  closedCase,
  cutAt,
  k1Case,
  k3Case,
  middleAt,
  nearestAt,
  numCase,
  rodeCase,
  termsOf,
  wallCase,
} from './forges';
import { CHASE_INQUIRY } from './inquiries';
import * as story from './story';
import { KEYS } from './journey';
import { TABLETS } from './tablets';
import * as math from './math';

const { COURTS, CALCULATOR, MISSION } = story;
const len = (s) => [...String(s).replace(/[\u2066-\u2069]/g, '')].length;

// ───────── what the WORLD logs while he plays: every platform he lowered, { a, s: rod, kind } ─────────
const row = (a, q) => ({ a: String(a), s: { q: String(q) }, kind: outcome({ q: String(q) }, a).kind });
const on = (a, ...qs) => qs.map((q) => row(a, q));
const C = COURTS;

/** The thinnest road (the story agent's worst case): each court ridden at once, the two closed ones by a band and a jam. */
const THIN = [
  ...on(C.big, '1,6'),
  ...on(C.small, '0,8'),
  ...on(C.sortA, '1,4'),
  ...on(C.sortB, '1,2', '1,3'),
  ...on(C.sortC, '2,4'),
  ...on(C.sortD, '2,8', '2,9'),
  ...on(C.sortOut, '2,1'),
];
/** The story walk's road: misses on every court. */
const WALKED = [
  ...on(C.big, '1,2', '1,8', '1,6'),
  ...on(C.small, '0,5', '0,9', '0,8'),
  ...on(C.sortA, '1,3', '1,5', '1,4'),
  ...on(C.sortB, '1', '1,5', '1,3', '1,2'),
  ...on(C.sortC, '2', '2,5', '2,4'),
  ...on(C.sortD, '3', '2,5', '2,9', '2,8'),
  ...on(C.sortOut, '2', '2,2', '2,1'),
];
/** A long road whose first rows left the world's log (24 rows): the first terrace is no longer in it. */
const CUT = [
  ...on(C.big, '1', '1,1', '1,2', '1,3', '1,4', '1,5', '1,6'),
  ...on(C.small, '0,1', '0,2', '0,3', '0,4', '0,5', '0,6', '0,7', '0,8'),
  ...on(C.sortA, '1,1', '1,2', '1,3', '1,4'),
  ...on(C.sortB, '0,9', '1', '1,1', '1,2', '1,4', '1,3'),
  ...on(C.sortC, '2', '2,1', '2,2', '2,3', '2,4'),
  ...on(C.sortD, '2,5', '2,6', '2,7', '2,8', '3', '2,9'),
  ...on(C.sortOut, '1,8', '1,9', '2', '2,1'),
].slice(-24);
/** « سطح العلامات »: the court of 19 closed between 4,35 and 4,4, the court of 66 between 8,12 and 8,125. */
const MARKS = [...on(C.marksA, '4,3', '4,4', '4,35'), ...on(C.marksB, '8,1', '8,2', '8,12', '8,13', '8,125')];
const MARKS_THIN = [...on(C.marksA, '4,35', '4,4'), ...on(C.marksB, '8,12', '8,125')];
/** The court of two, before the mirror beside it: a band at 1,41 and a jam at 1,42. */
const TWO = on(C.two, '1,4', '1,5', '1,41', '1,42');

// ───────── what the chase hands back: played through its own reducer ─────────
const playChase = (sayOf, tap = '0') => {
  let s = initChase(CHASE_INQUIRY);
  const R = (a) => (s = chaseReducer(CHASE_INQUIRY, s, a));
  while (!s.done) {
    if (s.stage === 'say') R({ type: 'say', v: sayOf(s) });
    else if (s.stage === 'build') R({ type: 'built' });
    else if (s.stage === 'count') R({ type: 'count', v: tap });
    else R({ type: 'next' });
  }
  return chaseResult(s);
};
/** He believes the fractions will ride; he says band every time. */
const CHASE_RIDE = playChase(() => 'ride', 'all');
const CHASE_BAND = playChase(() => 'band', '0');

/** The side of an area as a fraction p/q in lowest terms (25/64 → [5, 8]). */
const sideOf = (a) => {
  const { n, d } = read(a);
  const r = (v) => BigInt(Math.round(Math.sqrt(Number(v))));
  return [r(n), r(d)].map(String);
};
const parts = (x) => {
  const [i, d = '0'] = write(x).split(',');
  return { i, d };
};
/** The right answer of each last step, computed from its case. */
const SOLVE = {
  [K1]: (c) => {
    const { i, d } = parts(rootOf(c.dec));
    const [n1, d1] = sideOf(`${c.frac[0]}/${c.frac[1]}`);
    const [n2, d2] = sideOf(`${c.red[0]}/${c.red[1]}`);
    return { i, d, n1, d1, n2, d2, verdict: rootOf(c.fourth) != null };
  },
  [K2]: (c) => ({ ...parts(square(c.t)), verdict: rootOf(c.a) != null }),
  [K3]: (c) => {
    const [a, b, e] = [c.lo, c.hi, c.near].map(parts);
    return { i1: a.i, d1: a.d, i2: b.i, d2: b.d, i3: e.i, d3: e.d };
  },
};

/** The words of a key's NAME: no sentence of its forge says them before its last step. */
const FORBIDDEN = {
  [K1]: /ناطق/,
  [K2]: /ناطق/,
  [K3]: /مدوَّر|مدوّر|مدور|تدوير/,
};
const ROADS = { THIN, WALKED, CUT };

const suite = describeForges({
  forges: FORGES,
  keys: KEYS,
  // the roads are the world's log before forge 🧩 and before forge 🎯 (« سطح العلامات »); forge ♾️ takes its rows from its
  // experiment, and the world's log (`before`) must not leak into it
  roads: {
    THIN: { [K1]: THIN, [K2]: [], [K3]: MARKS_THIN },
    WALKED: { [K1]: WALKED, [K2]: [], [K3]: MARKS },
    CUT: { [K1]: CUT, [K2]: [], [K3]: MARKS },
  },
  before: { [K2]: [...WALKED, ...TWO], [K3]: [...WALKED, ...TWO] },
  inquiry: { [K2]: CHASE_RIDE },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  tiles: { [K1]: 8, [K2]: 12, [K3]: 8 },
});

describeLimits({ forges: FORGES, keys: KEYS, tablets: TABLETS });

// ───────── the lesson's own ─────────

const RIGHT_RULE = (F) => allRules(F).find(F.isTheRule);
/** Every case a forge can show, on every road and for every rule. */
const shown = (key) => suite.shownCases(FORGES[key]);
/** A wide pool of cases of each forge, to look for two rules that agree everywhere. */
const POOLS = {
  [K1]: () =>
    [
      ...[C.big, C.small, C.sortA, C.sortB, C.sortC, C.sortD, C.sortOut],
      ...['32/98', '9/12', '11/36', '75/147', '2,42', '27/192', '12,1', '28,9', '3,3', '0,0361', '50/98', '50/93'],
      ...['8/98', '8/99', '12', '0,25', '5/4', '16/10', '9/25', '18/50', '3,24'],
    ].map(k1Case),
  [K2]: () => [
    ...CHASE_FRACS_CASES(),
    ...['2', '82', '0,8', '13,5'].flatMap((a) => [calcCase(a), wallCase(a)]),
    numCase('2', '1393/985'),
    numCase('2', '1,414'),
    numCase('2', '1,41'),
    numCase('82', '163/18'),
    numCase('82', '9'),
    numCase('0,8', '17/19'),
  ],
  [K3]: () =>
    [
      [C.marksA, 1],
      [C.marksB, 2],
      ['18,924', 1],
      ['55', 1],
      ['21', 1],
      ['37', 2],
      ['89', 1],
      ['57', 2],
      ['71', 1],
      ['34', 2],
    ].flatMap(([a, k]) => [k3Case(a, k, 'lo'), k3Case(a, k, 'hi')]),
};
function CHASE_FRACS_CASES() {
  return FORGES[K2].fromInquiry(CHASE_BAND).rows;
}

describe('natiqa-ghayr-natiqa — the key ids are ONE list', () => {
  it('the forges, the story and the journey name the same three keys, in order', () => {
    expect([K1, K2, K3]).toEqual(KEYS);
    expect([story.K1, story.K2, story.K3]).toEqual(KEYS);
    expect([math.K1, math.K2, math.K3]).toEqual(KEYS);
    expect(Object.keys(FORGES)).toEqual(KEYS);
    const doors = story.STORY.terraces.filter((t) => t.feature).map((t) => t.feature.forge);
    expect(doors).toEqual(KEYS);
  });
});

describe('natiqa-ghayr-natiqa — every rule the tiles can write is its own rule', () => {
  it('no two rules agree on every case: each tile changes what the rule says somewhere', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      const rules = allRules(F);
      const pool = POOLS[key]();
      for (let i = 0; i < rules.length; i += 1)
        for (let j = i + 1; j < rules.length; j += 1) {
          const differ = pool.some((c) => F.says(rules[i], c) !== F.says(rules[j], c));
          expect(differ, `${key}: ${ruleKey(F, rules[i])} ≡ ${ruleKey(F, rules[j])}`).toBe(true);
        }
    }
  });
  it('on a wide pool, the right rule says of every case what the world does — and no other rule does', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      const pool = POOLS[key]();
      for (const rule of allRules(F)) {
        const bad = pool.filter((c) => F.says(rule, c) !== c.held).length;
        if (F.isTheRule(rule)) expect(bad, key).toBe(0);
        else expect(bad, `${key} ${ruleKey(F, rule)}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('natiqa-ghayr-natiqa 🧩 — the courts he sorted are the evidence', () => {
  const F = FORGES[K1];
  const rows = F.evidence(THIN);
  it('opens on its tiles: no experiment, no prediction; one line per court of the two terraces, in his order', () => {
    expect(F.inquiry).toBeUndefined();
    expect(F.predictCases(rows)).toEqual([]);
    expect(rows.map((c) => c.a)).toEqual([C.big, C.small, C.sortA, C.sortB, C.sortC, C.sortD, C.sortOut]);
    expect(rows.map((c) => c.held)).toEqual([true, true, true, false, true, false, true]);
  });
  it('a closed court names the two neighbouring marks he saw; a log that let them go keeps them all the same', () => {
    const b = rows.find((c) => c.a === C.sortB);
    expect([b.lo, b.hi, b.kind, b.tag]).toEqual(['1,2', '1,3', 'band', 'بلا علامة']);
    expect(F.evidence(WALKED).find((c) => c.a === C.sortD)).toMatchObject({ lo: '2,8', hi: '2,9' });
    expect(CUT.some((r) => r.a === C.big)).toBe(false);
    for (const log of [CUT, []])
      expect(F.evidence(log).map((c) => c.a)).toEqual(expect.arrayContaining(rows.map((c) => c.a)));
  });
  it('the false rules students hold fall on HIS courts: 1,6 = 16/10 (« the numerator »), 8,1 = 81/10, 1,6 a decimal', () => {
    const fallsOn = (rule) => runOn(F, rule, rows).marks[runOn(F, rule, rows).bad]?.a;
    expect(fallsOn({ form: 'asis', cond: 'top' })).toBe(C.sortB); // 16 over 10: 16 is a square
    expect(fallsOn({ form: 'irr', cond: 'top' })).toBe(C.sortD); // 81 over 10
    expect(fallsOn({ form: 'asis', cond: 'ten' })).toBe(C.sortB); // « a decimal area has a decimal side »
    expect(fallsOn({ form: 'irr', cond: 'ten' })).toBe(C.big); // 2,56 = 64/25: its side rides
    expect(termsOf(C.sortB, 'asis')).toEqual([16n, 10n]);
    expect(termsOf(C.sortB, 'irr')).toEqual([8n, 5n]);
  });
  it('« as it is written » survives every decimal court and falls on a REDUCIBLE fraction the mirror builds', () => {
    const asis = { form: 'asis', cond: 'both' };
    for (const log of Object.values(ROADS)) expect(runOn(F, asis, F.evidence(log)).bad).toBe(-1);
    const [c] = F.attacks(asis, rows);
    expect(c.a).toContain('/');
    expect([F.says(asis, c), c.held]).toEqual([false, true]);
    expect(F.explain(asis, c)).toContain('\\dfrac{32}{98}');
  });
  it('« the denominator a square » survives his courts and falls on a fraction whose numerator is not', () => {
    const r = { form: 'asis', cond: 'bottom' };
    expect(runOn(F, r, rows).bad).toBe(-1);
    const [c] = F.attacks(r, rows);
    expect([F.says(r, c), c.held]).toEqual([true, false]);
  });
  it('the right rule meets a reducible fraction that rides and a fraction that does not', () => {
    const list = F.attacks(RIGHT_RULE(F), rows);
    expect(list.map((c) => c.a)).toEqual(['32/98', '9/12']);
    expect(list.map((c) => c.held)).toEqual([true, false]);
    expect(list[0].s.q).toBe('4/7');
    expect(F.text.eq(list[0])).toContain('\\dfrac{16}{49}');
    expect(F.text.eq(list[1])).toBe('');
    expect(F1_HARD().map((c) => c.a)).toEqual(['32/98', '9/12']);
  });
  it('a closed court the mirror builds is a band at its mark of a hundredth, and says so', () => {
    const c = closedCase('9/12');
    expect([c.lo, c.hi, c.kind]).toEqual(['0,86', '0,87', 'band']);
    expect(F.text.fact(c)).toContain('0{,}86');
    expect(rodeCase('0,0361').s.q).toBe('0,19');
  });
});

describe('natiqa-ghayr-natiqa ♾️ — the chase on the court of two', () => {
  const F = FORGES[K2];
  const rows = F.fromInquiry(CHASE_RIDE).rows;
  it('his evidence is the five fractions on the court of two, whatever he predicted; the world’s log is not his here', () => {
    expect(CHASE_INQUIRY.a).toBe(C.two);
    expect(rows.map((c) => c.frac)).toEqual(['3/2', '7/5', '17/12', '41/29', '99/70']);
    expect(rows.map((c) => c.kind)).toEqual(['jam', 'band', 'jam', 'band', 'jam']);
    expect(F.fromInquiry(CHASE_BAND).rows).toEqual(rows);
    expect(F.evidence([...TWO, ...WALKED])).toEqual([]);
    // each one small tile off: p × p against 2 × q × q
    for (const r of CHASE_RIDE.rows) expect(r.gap).toBe('1');
  });
  it('a fraction is named in words on its line, never with a slash', () => {
    const bare = (t) => t.replace(/[\u2066-\u2069]/g, '');
    expect(bare(rows[2].head)).toBe('ساحة 2 · مقياس 17 على 12');
    expect(bare(rows[0].head)).toBe('ساحة 2 · مقياس 3 على 2');
    for (const c of shown(K2)) expect(`${c.head ?? ''}${c.tag}`, F.caseId(c)).not.toMatch(/\d\s*\/\s*\d/);
  });
  it('« near enough » and « a fraction, not a decimal » fall on HIS 17/12; the calculator and « no side » on the mirror', () => {
    for (const num of ['close', 'frac']) {
      const run = runOn(F, { num, calc: 'near', wall: 'rides' }, rows);
      expect(rows[run.bad].frac, num).toBe('17/12');
    }
    const same = { num: 'never', calc: 'same', wall: 'rides' };
    expect(runOn(F, same, rows).bad).toBe(-1);
    const [c] = F.attacks(same, rows);
    expect(c.calc).toBe(CALCULATOR);
    expect([F.says(same, c), c.held, c.kind]).toEqual([true, false, 'band']);
    const none = { num: 'never', calc: 'near', wall: 'none' };
    const [w] = F.attacks(none, rows);
    expect(isWall(w.s)).toBe(true);
    expect([F.says(none, w), w.held]).toEqual([false, true]);
  });
  it('the calculator of the story is a real one: ten digits of the side of two, and it misses', () => {
    expect(calculator(C.two)).toBe(CALCULATOR);
    expect(outcome({ q: CALCULATOR }, C.two).kind).toBe('band');
    expect(calculator('121/36')).toBe('1,833333333');
  });
  it('the right rule meets a new court with its fraction one small tile off, and that court’s wall', () => {
    const list = F.attacks(RIGHT_RULE(F), rows);
    expect(list.map(F.caseId)).toEqual(F2_HARD.map(F.caseId));
    expect(list.map((c) => c.held)).toEqual([false, true]);
    const [p, q] = [163n, 18n];
    expect(p * p - 82n * q * q).toBe(1n);
  });
});

describe('natiqa-ghayr-natiqa 🎯 — the middle mark on « سطح العلامات »', () => {
  const F = FORGES[K3];
  const rows = F.evidence(MARKS);
  it('opens on its tiles; his two courts, each the TRUE claim: 4,4 for 19, 8,12 for 66', () => {
    expect(F.inquiry).toBeUndefined();
    expect(F.predictCases(rows)).toEqual([]);
    expect(rows.map((c) => [c.a, c.M, c.mid, c.kind])).toEqual([
      [C.marksA, '4,4', '4,35', 'band'],
      [C.marksB, '8,12', '8,125', 'jam'],
    ]);
    expect(rows.every((c) => c.held)).toBe(true);
    expect(story.framing(MARKS, C.marksA)).toMatchObject({ lo: '4,35', hi: '4,4' });
    expect(story.framing(MARKS, C.marksB)).toMatchObject({ lo: '8,12', hi: '8,125' });
  });
  it('« always the lower » falls on 19; « always the upper » and « the last digit » on 66; « the middle jams: upper » on 19', () => {
    const fallsOn = (rule) => rows[runOn(F, rule, rows).bad]?.a;
    expect(fallsOn({ pick: 'lo', when: 'always' })).toBe(C.marksA);
    expect(fallsOn({ pick: 'hi', when: 'always' })).toBe(C.marksB);
    expect(fallsOn({ pick: 'hi', when: 'digit' })).toBe(C.marksB);
    expect(fallsOn({ pick: 'lo', when: 'mid' })).toBe(C.marksA);
  });
  it('« the square nearer the area » agrees with both his courts and falls on 18,924: a hair of a band at the middle', () => {
    const gaps = { pick: 'lo', when: 'gaps' };
    expect(runOn(F, gaps, rows).bad).toBe(-1);
    const [c] = F.attacks(gaps, rows);
    expect([c.a, c.claim, F.says(gaps, c), c.held]).toEqual(['18,924', 'lo', true, false]);
    // the lower mark's band is smaller than the upper's overhang — and yet the wall ends beyond the middle
    expect(write(square('4,35'))).toBe('18,9225');
    expect(F.explain(gaps, c)).toContain('0{,}434');
  });
  it('the right rule meets 18,924 (upper) and 55 (the middle jams, though the area ends in 5)', () => {
    const list = F.attacks(RIGHT_RULE(F), rows);
    expect(list.map(F.caseId)).toEqual(F3_HARD.map(F.caseId));
    expect(list.map((c) => c.held)).toEqual([true, false]);
  });
  it('a case is drawn as the platform of the MIDDLE mark, whatever it claims', () => {
    for (const c of shown(K3)) {
      expect(c.s.q, c.id).toBe(c.mid);
      expect(c.kind, c.id).toBe(outcome({ q: c.mid }, c.a).kind);
      expect(c.kind, c.id).not.toBe('ride');
    }
  });
});

describe('natiqa-ghayr-natiqa — a case is drawn as what the world does', () => {
  it('🧩 and ♾️: every case shown rides exactly when it is true', () => {
    for (const key of [K1, K2])
      for (const c of shown(key)) expect(c.kind === 'ride', `${key} ${c.id ?? c.a}`).toBe(c.held);
  });
  it('the mirror and the line render every case of every forge, at every stage', () => {
    for (const key of KEYS)
      for (const c of shown(key)) {
        for (const stage of ['ask', 'build', 'done'])
          expect(renderToString(createElement(Mirror, { c, stage }))).not.toMatch(/undefined|NaN/);
        expect(renderToString(createElement(Line, { c }))).not.toMatch(/undefined|NaN/);
      }
  });
});

describe('natiqa-ghayr-natiqa — the forges’ arithmetic is math.js’s', () => {
  it('forges.js imports the facts about a root from math.js and defines no copy of them (defects.md D8)', () => {
    const src = readFileSync(new URL('./forges.js', import.meta.url), 'utf8');
    expect(src).toMatch(/import \{[^}]*\bcut\b[^}]*\} from '\.\/math'/);
    for (const name of ['isqrt', 'marksBelow', 'calculator', 'decimalsOf'])
      expect(src, name).not.toMatch(new RegExp(`function ${name}\\b|const ${name} =`));
    for (const name of ['cutAt', 'aboveAt', 'middleAt', 'nearestAt'])
      expect(src, name).not.toMatch(new RegExp(`const ${name} = \\(`));
    expect([cutAt, aboveAt, middleAt, nearestAt, calculator]).toEqual([
      math.cut,
      math.above,
      math.middle,
      math.rounded,
      math.calculator,
    ]);
  });
  it('the marks of a tenth and of a hundredth, the middle, the nearer, the calculator', () => {
    const areas = ['19', '66', '31', '18,924', '55', '2', '8,1', '1,6', '57', '71', '34', '0,8', '1/36', '25/81'];
    for (const a of areas) {
      for (const k of [1, 2]) {
        expect(cutAt(a, k), a).toBe(math.cut(a, k));
        expect(aboveAt(a, k), a).toBe(math.above(a, k));
        expect(middleAt(a, k), a).toBe(math.middle(a, k));
        expect(nearestAt(a, k), a).toBe(math.rounded(a, k));
      }
      expect(calculator(a), a).toBe(math.calculator(a));
    }
  });
});

describe('natiqa-ghayr-natiqa — the words and their limits', () => {
  it('tiles ≤ 32 characters, headings ≤ 35, every attack ≤ 155, every last-step question ≤ 146, a line head ≤ 32', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const s of F.slots) {
        expect(len(s.label), s.label).toBeLessThanOrEqual(35);
        for (const o of s.options) expect(len(o.label), o.label).toBeLessThanOrEqual(32);
      }
      for (const c of shown(key)) {
        expect(len(F.text.attack(c)), F.text.attack(c)).toBeLessThanOrEqual(155);
        if (c.head) expect(len(c.head), c.head).toBeLessThanOrEqual(32);
      }
      for (let i = 0; i < 12; i += 1) {
        const c = F.use.make(() => (i + 0.5) / 12);
        expect(len(F.text.tryKey(c)), F.text.tryKey(c)).toBeLessThanOrEqual(146);
      }
    }
  });
  it('a refutation and a broken rule are plain text: no formula, no fraction with a slash, a sign isolated', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of shown(key))
        for (const says of [true, false]) {
          const t = F.text.refuted({ ...c, says });
          plain(t);
          expect(t, t).not.toMatch(/\d\s*\/\s*\d/);
          expect(t, t).not.toMatch(/(?<!⁦[^⁩]*)-\d/);
        }
    }
  });
  it('no line of the tiles or the mirror says « wrong »', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      const all = [
        ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
        ...Object.values(F.text).filter((x) => typeof x === 'string'),
        ...Object.values(F.text.use),
        ...shown(key).flatMap((c) => [F.text.attack(c), F.text.fact(c), F.text.refuted({ ...c, says: true })]),
      ];
      for (const x of all) expect(x, x).not.toMatch(/خطأ|خاطئ|غلط/);
    }
  });
  it('a sentence through MathText never writes a fraction with a slash', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of shown(key)) {
        const xs = [F.text.attack(c), F.text.fact(c), F.text.eq?.(c) ?? '', ...allRules(F).map((r) => F.explain(r, c))];
        for (const x of xs) expect(x.replace(/\$[^$]*\$/g, ''), x).not.toMatch(/\d\s*\/\s*\d/);
      }
      for (let i = 0; i < 6; i += 1) {
        const t = F.text.tryKey(F.use.make(() => (i + 0.5) / 6));
        expect(t.replace(/\$[^$]*\$/g, ''), t).not.toMatch(/\d\s*\/\s*\d/);
      }
    }
  });
  /**
   * Nothing of a last step is drawn mirrored (the ledger D22): in the order the tokens are SEEN from the left, a decimal
   * typed in two boxes is whole part, comma, decimals; every Arabic word stands to the right of every box.
   */
  it('a last step is never mirrored: a typed decimal reads whole, comma, decimals; the words stand right of the boxes', () => {
    const arabic = (t) => typeof t === 'string' && /[؀-ۿ]/.test(t);
    const boxy = (t) => typeof t === 'object' && t !== null;
    const seenFromLeft = (l) => ((l.dir ?? 'ltr') === 'rtl' ? [...l.tokens].reverse() : l.tokens);
    const count = {};
    for (const key of KEYS)
      for (let i = 0; i < 6; i += 1) {
        const c = FORGES[key].use.make(() => (i + 0.5) / 6);
        for (const l of FORGES[key].use.lines(c)) {
          const v = seenFromLeft(l);
          v.forEach((t, k) => {
            if (t !== ',' || !boxy(v[k - 1]) || !boxy(v[k + 1])) return;
            count[key] = (count[key] ?? 0) + 1;
            expect([v[k - 1].label, v[k + 1].label], key).toEqual(['الوحدات', 'الجزء العشري']);
          });
          const lastBox = v.reduce((at, t, k) => (boxy(t) || t?.frac ? k : at), -1);
          const firstWord = v.findIndex(arabic);
          if (lastBox >= 0 && firstWord >= 0) expect(firstWord, `${key} ${JSON.stringify(v)}`).toBeGreaterThan(lastBox);
        }
      }
    // 🧩: one typed decimal a case; ♾️: the square; 🎯: three a case
    expect(count).toEqual({ [K1]: 6, [K2]: 6, [K3]: 18 });
  });
  it('every box of a last step is named by the words beside it; four lines at most; a typed fraction is ONE answer', () => {
    for (const key of KEYS)
      for (let i = 0; i < 6; i += 1) {
        const lines = FORGES[key].use.lines(FORGES[key].use.make(() => (i + 0.5) / 6));
        expect(lines.length).toBeLessThanOrEqual(4);
        for (const l of lines) {
          expect(
            l.tokens.some((t) => typeof t === 'string' && t.trim().length > 1),
            JSON.stringify(l),
          ).toBe(true);
          expect(l.tokens.filter((t) => typeof t === 'object').length).toBeLessThanOrEqual(3);
          for (const t of l.tokens) if (typeof t === 'string') expect(t, t).not.toMatch(/√|\\sqrt|\//);
        }
      }
  });
});

describe('natiqa-ghayr-natiqa — the last steps accept the solution and refuse the near misses', () => {
  it('🧩 takes an equal fraction and a trailing zero; refuses the reducible fraction’s terms rooted as written', () => {
    const F = FORGES[K1];
    const c = USE1[0];
    const right = { i: '3', d: '1', n1: '5', d1: '8', n2: '2', d2: '7' };
    expect(F.use.check(c, right, false)).toBe('ok');
    expect(F.use.check(c, { ...right, d: '10' }, false)).toBe('ok');
    expect(F.use.check(c, { ...right, n1: '10', d1: '16' }, false)).toBe('ok');
    expect(F.use.check(c, { ...right, d: '2' }, false)).toBe('decJam');
    expect(F.use.check(c, { ...right, n1: '5', d1: '9' }, false)).toBe('f1band');
    // √12 / √147 is not a fraction: 3 over 12 (12 ÷ 4) — a slip of the « numerator alone » kind
    expect(F.use.check(c, { ...right, n2: '3', d2: '12' }, false)).toBe('f2band');
    expect(F.use.check(c, { ...right, d1: '0' }, false)).toBe('zero');
    expect(F.use.check(c, right, true)).toBe('fourth');
    expect(F.use.check(USE1[2], { i: '0', d: '53', n1: '3', d1: '8', n2: '4', d2: '5' }, true)).toBe('ok');
  });
  it('♾️ refuses a square with three decimals, and the verdict « a fraction rides » on 8,5', () => {
    const F = FORGES[K2];
    const c = F.use.make(() => 0.1);
    expect(c).toMatchObject({ a: '8,5', t: '2,91', sq: '8,4681' });
    expect(F.use.check(c, { i: '8', d: '4681' }, false)).toBe('ok');
    expect(F.use.check(c, { i: '8', d: '468' }, false)).toBe('square');
    expect(F.use.check(c, { i: '8', d: '4681' }, true)).toBe('verdict');
    const f = F.use.make(() => 0.3);
    expect(f.a).toBe('25/81');
    expect(F.use.check(f, { i: '0', d: '3025' }, true)).toBe('ok');
    expect(F.use.check(f, { i: '0', d: '3025' }, false)).toBe('verdict');
  });
  it('🎯 refuses the value by default given as the nearer when the middle leaves a band, and two marks swapped', () => {
    const F = FORGES[K3];
    const c = F.use.make(() => 0.3); // 57 to 0,01: 7,54 — 7,55, the middle 7,545 leaves a band
    expect([c.a, c.lo, c.hi, c.near]).toEqual(['57', '7,54', '7,55', '7,55']);
    const right = { i1: '7', d1: '54', i2: '7', d2: '55', i3: '7', d3: '55' };
    expect(F.use.check(c, right)).toBe('ok');
    expect(F.use.check(c, { ...right, d3: '54' })).toBe('near');
    expect(F.use.check(c, { ...right, d1: '55', d2: '54' })).toBe('lo');
    expect(F.use.check(c, { ...right, d2: '56' })).toBe('hi');
    const dirs = USE3.map(([a, k]) => (nearestAt(a, k) === cutAt(a, k) ? 'lo' : 'hi'));
    expect(dirs.sort()).toEqual(['hi', 'hi', 'lo', 'lo']);
  });
});

describe('natiqa-ghayr-natiqa — the numbers of the mirrors and of the last steps are not the bank’s', () => {
  const bank = readBank('natiqa-ghayr-natiqa');
  const sheets = bank.sheets.map((s) => s.text);
  /** A number as the bank may write it: « 6,25 », « 6.25 », « 6{,}25 »; « 3/8 », « \\dfrac{3}{8} ». */
  const named = (x) => {
    const t = String(x);
    const [p, q] = t.split('/');
    const re =
      q != null
        ? new RegExp(`(?<![0-9,.}])${p}/${q}(?![0-9])|\\{${p}\\}\\{${q}\\}`)
        : new RegExp(`(?<![0-9,.}])${t.replace(',', '(?:,|\\.|\\{,\\})')}(?![0-9]|[,.][0-9]|\\{,\\})`);
    return sheets.filter((l) => re.test(l));
  };
  /** Every number the forges show or expect, the story's own courts excepted. */
  const ownCourts = new Set(Object.values(COURTS));
  const MINE = () => {
    const out = new Set();
    const add = (x) => x != null && out.add(String(x));
    for (const key of KEYS)
      for (const c of shown(key)) {
        // a court of the story is the story's (story.test.js checks it): only what the mirror builds is the forges'
        if (ownCourts.has(c.a)) continue;
        add(c.a);
        if (!isWall(c.s)) add(c.frac ?? write(c.s.q));
        for (const m of [c.lo, c.hi, c.mid]) add(m);
      }
    for (const c of USE1) {
      [c.dec, rootOf(c.dec), `${c.frac[0]}/${c.frac[1]}`, `${c.red[0]}/${c.red[1]}`, c.fourth].forEach(add);
      add(sideOf(`${c.frac[0]}/${c.frac[1]}`).join('/'));
      add(sideOf(`${c.red[0]}/${c.red[1]}`).join('/'));
    }
    for (let i = 0; i < 8; i += 1) {
      const c = FORGES[K2].use.make(() => (i + 0.5) / 8);
      [c.a, c.shows, c.t, c.sq].forEach(add);
    }
    for (const [a, k] of USE3) [a, calculator(a), cutAt(a, k), aboveAt(a, k)].forEach(add);
    return [...out];
  };
  it('no number of the mirrors’ cases nor of the last steps is a number the bank’s sheets state or expect', () => {
    const mine = MINE();
    expect(mine.length).toBeGreaterThan(40);
    expect(mine.filter((x) => named(x).length)).toEqual([]);
  });
  it('(the check sees the bank: the brief’s 16/9, 8/18 and 49/36 are its numbers)', () => {
    for (const x of ['16/9', '0,49']) expect(named(x).length, x).toBeGreaterThan(0);
  });
  it('the numbers of 100 and more stand nowhere in the bank nor in another lesson’s story', () => {
    const stories = storiesOf({ exceptId: bank.id });
    // whole numbers and the terms of fractions (a decimal's digits are not a number of their own)
    const big = MINE()
      .filter((x) => !String(x).includes(','))
      .flatMap((x) => String(x).split('/'))
      .map(Number)
      .filter((v) => v >= 100);
    expect(big.length).toBeGreaterThan(2);
    const hits = [...new Set(big)].filter(
      (x) => !collisions(bank, [x], { stories }).numbers.every((h) => !h.sheets.length && !h.stories.length),
    );
    expect(hits).toEqual([]);
  });
  it('no number of the forges is the final mission’s', () => {
    const mission = [MISSION.exact, `${MISSION.fracN}/${MISSION.fracD}`, MISSION.none, rootOf(MISSION.exact)];
    for (const x of MINE()) expect(mission, String(x)).not.toContain(String(x));
  });
});
