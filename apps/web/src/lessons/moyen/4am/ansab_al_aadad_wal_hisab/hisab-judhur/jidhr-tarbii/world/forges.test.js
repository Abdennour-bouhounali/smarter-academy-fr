/**
 * THE FORGES of lesson `jidhr-tarbii`: the shared checks (`describeForges`, `describeLimits` — kit/authoring/test/suites.js;
 * they read cases of any world, not only planks: a case here is a court and a rod), then what is this lesson's own —
 * no two rules the tiles can write agree on every case, the false rules its students really hold and where each one
 * falls, a case is drawn as what the world does (a claim never a negative rod), no word of a key before its forge,
 * and the numbers of the mirrors and of the last steps against the bank.
 */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ruleKey, runOn } from '../../../../../../common/gameworld/kit/forge';
import { boxesOf } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import {
  allRules,
  describeForges,
  describeLimits,
  plain,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { initCalc, calcReducer, calcResult } from '../../../../../../common/gameworld/rootCourts/calc';
import {
  initRoundtrip,
  roundtripReducer,
  roundtripResult,
} from '../../../../../../common/gameworld/rootCourts/roundtrip';
import { isWall, platform, rootOf, write } from '../../../../../../common/gameworld/rootCourts/logic';
import { Mirror, Line } from '../../../../../../common/gameworld/rootCourts/forgeParts';
import {
  FORGES,
  USE1,
  USE2,
  USE3,
  F1_HARD,
  F2_HARD,
  F3_HARD,
  buildCase,
  calcCase,
  calculator,
  cutTo2,
  numCase,
  takeCase,
  wallCase,
} from './forges';
import { CALC_INQUIRY, ROUNDTRIP_INQUIRY, steps } from './inquiries';
import { CALCULATOR, COURTS } from './story';
import { KEYS, TABLETS } from './tablets';

const [K1, K2, K3] = KEYS;
const len = (s) => [...String(s).replace(/[⁦⁩]/g, '')].length;

// ───────── what the WORLD logs while he plays: every platform he lowered, { a, s: rod, kind } ─────────
const row = (a, q) => ({ a: String(a), s: { q: String(q) } });
const on = (a, ...qs) => qs.map((q) => row(a, q));
const { first: C30, small: C16, palm: C36, wind: C100 } = COURTS;

/** The thinnest road: one band and one jam on 30 (that opens the court of 16), then each court ridden at once. */
const THIN = [...on(C30, 5, 6), ...on(C16, 4), ...on(C36, 6), ...on(C100, 10)];
/** The story walk's road: a few misses on every court. */
const WALKED = [...on(C30, 3, 5, 7, 6), ...on(C16, 3, 5, 4), ...on(C36, 5, 7, 6), ...on(C100, 9, 11, 10)];
/** Another thin road: other rods on 30. */
const OTHER = [...on(C30, 4, 7), ...on(C16, 4), ...on(C36, 6), ...on(C100, 10)];
/** A long road whose first rows left the world's log (24 rows): the ride of 16 is no longer in it. */
const LONG = [...on(C30, 1, 2, 3, 4, 5, 6), ...on(C16, 1, 2, 3, 5, 4), ...on(C36, 1, 2, 3, 4, 5, 7, 8, 9, 6)];
const CUT = [...LONG, ...on(C100, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 10)].slice(-24);

// ───────── what the two experiments hand back: played through their own reducers ─────────
const playCalc = (sayOf) => {
  let s = initCalc(CALC_INQUIRY);
  const R = (a) => (s = calcReducer(CALC_INQUIRY, s, a));
  while (!s.done) {
    if (s.stage === 'say') R({ type: 'say', v: sayOf(s) });
    else if (s.stage === 'build') R({ type: 'built' });
    else if (s.stage === 'zoom') R({ type: 'zoom' });
    else if (s.stage === 'seen') R({ type: 'next' });
    else if (s.stage === 'wall') R({ type: 'clamp' });
    else if (s.stage === 'clamping') R({ type: 'clamped' });
  }
  return calcResult(s);
};
const playRoundtrip = (answerOf) => {
  let s = initRoundtrip(ROUNDTRIP_INQUIRY);
  const R = (a) => (s = roundtripReducer(ROUNDTRIP_INQUIRY, s, a));
  while (!s.done) {
    if (s.stage === 'ask') {
      const r = ROUNDTRIP_INQUIRY.rounds[s.ri];
      R({ type: 'say', said: answerOf(r.path[s.si], s.chain[s.si + 1]) });
    } else if (s.stage === 'run') R({ type: 'ran' });
    else R({ type: 'next' });
  }
  return roundtripResult(s);
};
/** He predicts « rides » every time; he predicts it never rides. */
const CALC_YES = playCalc(() => true);
const CALC_NO = playCalc(() => false);
/** His answers: all right; the errors the forge fights (a × a for a plaque, the square for a side, the sign back). */
const RIGHT = (op, out) =>
  op === 'build' ? { area: out.court } : out.rod.root != null ? { root: out.rod.root } : { q: out.rod.q };
const WRONG = (op, out) =>
  op === 'build'
    ? { area: write(platform({ q: out.court })) }
    : out.rod.root != null
      ? { q: out.rod.root }
      : { q: `-${out.rod.q}` };
const RT_RIGHT = playRoundtrip(RIGHT);
const RT_WRONG = playRoundtrip(WRONG);

/** The right answer of each last step, computed from its case. */
const SOLVE = {
  [K1]: (c) => {
    const side = Math.round(Math.sqrt(c.area));
    return { x: side, y: side, side };
  },
  [K2]: (c) => {
    const cut = cutTo2(String(c.areas[0]));
    return { ...Object.fromEntries(c.order.map((at, k) => [`a${k}`, c.areas[at]])), i: cut.i, d: cut.d };
  },
  [K3]: (c) => ({ p: c.wall, s: c.rod, w: c.walk, n: c.frac[0], d: c.frac[1] }),
};

/**
 * The words of a key's NAME and of what it states: no sentence of its forge says them before its last step. Key 🔑 is
 * the first: the sign √ and the word « square of » appear in NOTHING before its tablet.
 */
const FORBIDDEN = {
  [K1]: /جذر|تربيع|مربّعه|مربعه|مربّع العدد|مربع العدد|مربّع المقياس|√|\\sqrt/,
  [K2]: /مضبوط|بالضبط|مقرّب|مقرب|تقريب|قيمة/,
  [K3]: /ذهاب|إياب|يلغي|تلغي|يُلغي|عكس|تعاكس|\^/,
};
const ROADS = { THIN, WALKED, OTHER, CUT };

const suite = describeForges({
  forges: FORGES,
  keys: KEYS,
  // the roads are the world's log before forge 🔑; forges ✍️ and 🔁 take their rows from their experiment, and the
  // world's log (`before`) must not leak into them
  roads: Object.fromEntries(Object.entries(ROADS).map(([k, log]) => [k, { [K1]: log, [K2]: [], [K3]: [] }])),
  before: { [K2]: WALKED, [K3]: [...WALKED, ...on(C30, '5,4', '5,5', '5,47')] },
  inquiry: { [K2]: CALC_YES, [K3]: RT_WRONG },
  solve: SOLVE,
  forbidden: FORBIDDEN,
  tiles: { [K1]: 16, [K2]: 9, [K3]: 16 },
});

describeLimits({ forges: FORGES, keys: KEYS, tablets: TABLETS });

// ───────── the lesson's own ─────────

const RIGHT_RULE = (F) => allRules(F).find(F.isTheRule);
/** Every case a forge can show, on every road and for every rule. */
const shown = (key) => suite.shownCases(FORGES[key]);
/** A wide pool of cases of each forge, to look for two rules that agree everywhere. */
const POOLS = {
  [K1]: () => {
    const areas = ['0,25', '9/16', '6,25', '12,25', '20,25', '2', '8', '12', '16', '24', '30', '36', '64', '100'];
    const rods = [
      '0,25',
      '0,5',
      '0,75',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '16',
      '25',
      '1,5',
      '2,5',
    ];
    return areas.flatMap((a) => rods.map((q) => numCase(a, q)));
  },
  [K2]: () =>
    ['30', '36', '41', '0,81', '6,25', '59'].flatMap((a) => [
      calcCase(a),
      wallCase(a),
      ...['1', '5', '6', '0,9', '2,5', '7'].map((q) => numCase(a, q)),
    ]),
  [K3]: () => [
    ...['23', '29', '86', '2/3', '0,25'].flatMap((R) =>
      ['23', '29', '86', '2/3', '0,25', '46', '172', '43', '529'].map((P) => buildCase(R, P)),
    ),
    ...[{ q: '14' }, { q: '-9' }, { q: '2/3' }, { q: '2,5' }, { root: '29' }].flatMap((t) =>
      [{ q: '14' }, { q: '9' }, { q: '196' }, { q: '7' }, { q: '2/3' }, { q: '4/9' }, { root: '29' }, { q: '29' }].map(
        (u) => takeCase(t, u, { walk: t.q === '-9' }),
      ),
    ),
  ],
};

describe('jidhr-tarbii — every rule the tiles can write is its own rule', () => {
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

describe('jidhr-tarbii 🔑 — the courts he rode are the evidence', () => {
  const F = FORGES[K1];
  it('opens on its tiles: no experiment, no prediction; the mirror writes no product (it would state the rule)', () => {
    expect(F.inquiry).toBeUndefined();
    expect(F.predictCases(F.evidence(THIN))).toEqual([]);
    for (const c of shown(K1)) expect(F.text.eq(c)).toBeNull();
  });
  it('his rides of 16, 36 and 100 are always there, even when the world’s log has let them go', () => {
    for (const log of Object.values(ROADS)) {
      const ids = F.evidence(log).map(F.caseId);
      for (const a of [C16, C36, C100]) expect(ids, a).toContain(`${a}|${rootOf(a)}`);
    }
    expect(CUT.some((r) => r.a === C16)).toBe(false);
  });
  it('« four times the rod is the area » survives the court of 16 (4 × 4 = 16) and falls on 36, on HIS rows', () => {
    const four = { calc: 'four', eq: 'area' };
    const run = runOn(F, four, F.evidence(THIN));
    const c16 = run.marks.find((m) => m.a === C16);
    expect([c16.says, c16.held]).toEqual([true, true]);
    expect(run.bad).toBeGreaterThanOrEqual(0);
    expect(run.marks[run.bad].a).toBe(C36);
  });
  it('the false rules students hold — twice the rod, four times the rod — fall on what he did, on every road', () => {
    for (const [name, log] of Object.entries(ROADS))
      for (const rule of allRules(F).filter((r) => !F.isTheRule(r)))
        expect(runOn(F, rule, F.evidence(log)).bad, `${name} ${ruleKey(F, rule)}`).toBeGreaterThanOrEqual(0);
  });
  it('the right rule meets a side LARGER than its area (0,25 → 0,5), a rod as long as the area, and a fraction', () => {
    const list = F.attacks(RIGHT_RULE(F), F.evidence(THIN));
    expect(list.map(F.caseId)).toEqual(['0,25|0,5', '0,25|0,25', '0,5625|0,75']);
    expect(list.map((c) => c.held)).toEqual([true, false, true]);
    // every « a part of the area » rule says no to 0,25 → 0,5: the side is larger than the area
    for (const eq of ['third', 'quarter', 'less'])
      for (const calc of ['self', 'twice', 'four', 'plus']) expect(F.says({ calc, eq }, list[0])).toBe(false);
  });
  it('a wall never stands in its evidence (it is drawn with √, named only on tablet 🔑)', () => {
    const rows = F.evidence([...WALKED, { a: C30, s: { root: C30 }, kind: 'ride' }]);
    expect(rows.some((c) => isWall(c.s))).toBe(false);
    for (const c of shown(K1)) expect(isWall(c.s)).toBe(false);
  });
});

/**
 * The sign √ is named on tablet 🔑: before it, NOTHING draws it — not a sentence (the shared suite's `forbidden`), and
 * not a drawing either. Forge 🔑's mirror (every stage), its log, its attacks and its experiments are RENDERED here on
 * every road, the world's log holding a clamped wall too: no « √ » glyph, no drawn radical (`data-court-radical`), no
 * KaTeX `sqrt`. (The experiments of ✍️ and 🔁 open after tablet 🔑 — `inquiries.test.js`.)
 */
describe('jidhr-tarbii 🔑 — no √ drawn before its tablet', () => {
  const F = FORGES[K1];
  const seenOf = (html) =>
    html
      .replace(/<annotation[^>]*>.*?<\/annotation>/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;|&#\d+;/g, ' ');
  const noSign = (html, what) => {
    expect(seenOf(html), what).not.toMatch(/√/);
    expect(html, what).not.toMatch(/data-court-radical|class="[^"]*sqrt/);
  };
  it('the mirror, the log, the attacks and the experiments of forge 🔑 draw no radical', () => {
    const withWall = [...WALKED, { a: C30, s: { root: C30 }, kind: 'ride' }];
    const cases = [...shown(K1), ...F.evidence(withWall)];
    for (const rule of allRules(F)) cases.push(...F.attacks(rule, F.evidence(withWall)));
    for (const k of [1, 2, 3]) cases.push(...F.nudge(k, F.evidence(withWall)).cases);
    expect(cases.length).toBeGreaterThan(20);
    for (const c of cases) {
      const id = F.caseId(c);
      for (const stage of ['ask', 'build', 'done']) noSign(renderToString(createElement(Mirror, { c, stage })), id);
      noSign(renderToString(createElement(Line, { c })), id);
      for (const x of [F.text.ask(c), F.text.attack(c), F.text.fact(c), F.text.eq(c) ?? ''])
        expect(x, id).not.toMatch(/√|\\sqrt/);
    }
  });
});

describe('jidhr-tarbii ✍️ — the calculator, the decimals and the wall', () => {
  const F = FORGES[K2];
  const rows = F.fromInquiry(CALC_YES).rows;
  it('his evidence is his four rods on the court of 30, whatever he predicted', () => {
    expect(rows.map(F.caseId)).toEqual([`${C30}|5`, `${C30}|5,5`, `calc|${C30}|${CALCULATOR}`, `${C30}|√${C30}`]);
    expect(rows.map((c) => c.kind)).toEqual(['band', 'jam', 'band', 'ride']);
    expect(F.fromInquiry(CALC_NO).rows).toEqual(rows);
  });
  it('the calculator of the story is a real one: ten digits of the side of 30, and it misses', () => {
    expect(calculator(C30)).toBe(CALCULATOR);
    expect(calculator(C36)).toBe('6');
    expect(calculator('41')).toBe('6,403124237');
  });
  it('« the calculator shows the length » falls on HIS calculator row; « no length at all » on his wall', () => {
    const shows = runOn(F, { side: 'square', shows: 'same' }, rows);
    expect(rows[shows.bad].calc).toBe(CALCULATOR);
    for (const shows2 of ['same', 'never', 'may']) {
      const none = runOn(F, { side: 'none', shows: shows2 }, rows);
      expect(none.bad).toBeGreaterThanOrEqual(0);
    }
    expect(runOn(F, { side: 'none', shows: 'never' }, rows).marks.at(-1).agrees).toBe(false);
    for (const s of ['same', 'never', 'may']) expect(runOn(F, { side: 'whole', shows: s }, rows).bad).toBe(0);
  });
  it('« the calculator is never the length » survives his rows and breaks on 36, where it shows 6 and 6 rides', () => {
    const never = { side: 'square', shows: 'never' };
    expect(runOn(F, never, rows).bad).toBe(-1);
    const [c] = F.attacks(never, rows);
    expect(F.caseId(c)).toBe(`calc|${C36}|6`);
    expect([F.says(never, c), c.held]).toEqual([false, true]);
  });
  it('no √ before its tablet: his clamped rod names itself in words, and the mirror builds no wall in this forge', () => {
    const wall = rows.find((c) => isWall(c.s));
    expect(wall.head).toBe(`ساحة ${C30} · مقياس الجدار`);
    for (const c of shown(K2)) {
      if (isWall(c.s)) expect(c.head, F.caseId(c)).toMatch(/^ساحة [0-9,]+ · مقياس الجدار$/);
      if (c.head != null) expect(len(c.head)).toBeLessThanOrEqual(25);
    }
    const built = [
      ...allRules(F).flatMap((r) => F.attacks(r, rows)),
      ...[1, 2, 3].flatMap((k) => F.nudge(k, rows).cases),
    ];
    for (const c of built) expect(isWall(c.s), F.caseId(c)).toBe(false);
  });
  it('the right rule is SHARPENED on 36, never broken: it said « comes close, and may be it » — here it is', () => {
    const right = RIGHT_RULE(F);
    expect(F.attacks(right, rows).map(F.caseId)).toEqual(F2_HARD.map(F.caseId));
    const c36 = F2_HARD[1];
    expect(F.says(right, c36)).toBe(true);
    expect(F.explain(right, c36)).toContain('6 \\times 6 = 36');
    expect(F.text.eq(c36)).toContain('6 \\times 6');
    expect(F.says(right, F2_HARD[0])).toBe(false);
  });
});

describe('jidhr-tarbii 🔁 — what comes out of the two stations', () => {
  const F = FORGES[K3];
  const rows = F.fromInquiry(RT_RIGHT).rows;
  it('his evidence is what the stations REALLY gave, whatever he typed — the chain’s second build counted once', () => {
    expect(rows.map(F.caseId)).toEqual(['build|23|23', 'take|14|14', 'take|-9|9', 'take|w29|w29', 'build|29|29']);
    expect(rows.every((c) => c.held)).toBe(true);
    expect(F.fromInquiry(RT_WRONG).rows).toEqual(rows);
  });
  const fallsAt = (rule) => rows[runOn(F, rule, rows).bad];
  it('(√23)² = 23 × 23 falls on the wall of 23; √(14²) = 14² on the rod 14; « the sign comes back » on the walk', () => {
    expect(F.caseId(fallsAt({ build: 'aa', take: 'a' }))).toBe('build|23|23');
    expect(F.caseId(fallsAt({ build: 'a', take: 'aa' }))).toBe('take|14|14');
    expect(F.caseId(fallsAt({ build: 'a', take: 'sign' }))).toBe('take|-9|9');
    expect(F.explain({ build: 'a', take: 'sign' }, fallsAt({ build: 'a', take: 'sign' }))).toContain('-9');
  });
  it('the right rule meets a new walk to the left and a rod that is a fraction (its side, and a × a)', () => {
    const list = F.attacks(RIGHT_RULE(F), rows);
    expect(list.map(F.caseId)).toEqual(F3_HARD.map(F.caseId));
    expect(list.map((c) => c.held)).toEqual([true, false, true]);
    expect(list[0].walk).toBe(true);
  });
});

describe('jidhr-tarbii — a case is drawn as what the world does', () => {
  it('every case shown rides exactly when it is true: the mirror never draws a platform that contradicts the case', () => {
    for (const key of KEYS) for (const c of shown(key)) expect(c.kind === 'ride', `${key} ${c.id ?? c.a}`).toBe(c.held);
  });
  it('a claim is never a negative rod (the court would draw it as its length, riding)', () => {
    for (const c of shown(K3)) if (!isWall(c.s)) expect(c.s.q.startsWith('-'), c.id).toBe(false);
  });
});

describe('jidhr-tarbii — the words and their limits', () => {
  it('tiles ≤ 28 characters, headings ≤ 35, every attack of every rule ≤ 155, every last-step question ≤ 146', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const s of F.slots) {
        expect(len(s.label), s.label).toBeLessThanOrEqual(35);
        for (const o of s.options) expect(len(o.label), o.label).toBeLessThanOrEqual(28);
      }
      for (const c of shown(key)) expect(len(F.text.attack(c)), F.text.attack(c)).toBeLessThanOrEqual(155);
      for (let i = 0; i < 12; i += 1) {
        const c = F.use.make(() => (i + 0.5) / 12);
        expect(len(F.text.tryKey(c)), F.text.tryKey(c)).toBeLessThanOrEqual(146);
      }
    }
  });
  it('a refutation and a broken rule are plain text: an equality or a number with a sign is isolated', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of shown(key))
        for (const says of [true, false]) {
          const t = F.text.refuted({ ...c, says });
          plain(t);
          expect(t, t).not.toMatch(/(?<!⁦[^⁩]*)-\d/);
        }
    }
  });
  it('no line of the experiments, the tiles or the mirror says « wrong »', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      const all = [
        ...F.slots.flatMap((s) => [s.label, ...s.options.map((o) => o.label)]),
        ...Object.values(F.text).filter((x) => typeof x === 'string'),
        ...shown(key).flatMap((c) => [F.text.attack(c), F.text.refuted({ ...c, says: true })]),
      ];
      for (const x of all) expect(x, x).not.toMatch(/خطأ|خاطئ|غلط/);
    }
  });
  it('steps of a walk agree with their number', () => {
    expect([1, 2, 9, 11, 18].map(steps)).toEqual(['خطوة واحدة', 'خطوتين', '9 خطوات', '11 خطوة', '18 خطوة']);
  });
  it('the last steps: a typed box holds the slip it exists to catch; no radical is faked with a string', () => {
    // 🔁: 37 × 37 = 1369 fits the plaque's box, 32 × 32 = 1024 the side's, 27 × 27 = 729 the walk's
    for (const c of USE3) {
      const boxes = Object.fromEntries(
        FORGES[K3].use
          .lines(c)
          .flatMap((l) => boxesOf(l.tokens))
          .map((b) => [b.slot, b.w]),
      );
      expect(String(c.wall ** 2).length).toBeLessThanOrEqual(boxes.p);
      expect(String(c.rod ** 2).length).toBeLessThanOrEqual(boxes.s);
      expect(String(c.walk ** 2).length).toBeLessThanOrEqual(boxes.w);
      expect(String(c.frac[1] ** 2).length).toBeLessThanOrEqual(boxes.d);
    }
    for (const key of KEYS)
      for (let i = 0; i < 6; i += 1) {
        const c = FORGES[key].use.make(() => (i + 0.5) / 6);
        for (const l of FORGES[key].use.lines(c))
          for (const t of l.tokens) if (typeof t === 'string') expect(t, t).not.toMatch(/√|\\sqrt/);
      }
  });
  it('🔑 refuses 1 × 484 (not a square), a side that is not the rod, and a product that misses', () => {
    const F = FORGES[K1];
    const c = { area: 484 };
    expect(F.use.check(c, { x: '22', y: '22', side: '22' })).toBe('ok');
    expect(F.use.check(c, { x: '11', y: '44', side: '22' })).toBe('square');
    expect(F.use.check(c, { x: '22', y: '22', side: '121' })).toBe('side');
    expect(F.use.check(c, { x: '21', y: '21', side: '21' })).toBe('product');
  });
  it('✍️ refuses the calculator rounded up (its platform jams), a shorter rod, one decimal, the wrong court', () => {
    const F = FORGES[K2];
    const c = { areas: [39, 58, 87], order: [1, 2, 0], shows: [58, 87, 39].map((a) => calculator(String(a))) };
    const right = SOLVE[K2](c);
    expect(F.use.check(c, right)).toBe('ok');
    expect(right).toMatchObject({ a0: 58, a1: 87, a2: 39, i: '6', d: '24' });
    expect(F.use.check(c, { ...right, d: '25' })).toBe('jam');
    expect(F.use.check(c, { ...right, d: '23' })).toBe('longer');
    expect(F.use.check(c, { ...right, d: '2' })).toBe('two');
    expect(F.use.check(c, { ...right, a0: '39' })).toBe('match');
  });
  /**
   * Nothing of a last step is drawn mirrored (screenshot review 2026-11-21: forge ✍️'s line, an Arabic word at each end,
   * was read from the right — « 11 , 9 » for 9,11). The kit lays a line's tokens as a flex row in the line's direction
   * (kit/RuleForge.jsx › UseLines: an `rtl` line puts its first token on the right) and has no left-to-right island
   * inside a right-to-left line; so, in the order the tokens are SEEN from the left:
   *   - a decimal typed in two boxes is whole part, comma, decimals;
   *   - every Arabic word stands to the right of every box: read from the right, the line opens on its words and closes
   *     on the formula, never meets a box, then a word, then a box again.
   */
  it('a last step is never mirrored: a typed decimal reads whole, comma, decimals; the words stand right of the boxes', () => {
    const arabic = (t) => typeof t === 'string' && /[؀-ۿ]/.test(t);
    const boxy = (t) => typeof t === 'object' && t !== null;
    const seenFromLeft = (l) => ((l.dir ?? 'ltr') === 'rtl' ? [...l.tokens].reverse() : l.tokens);
    let decimals = 0;
    for (const key of KEYS)
      for (let i = 0; i < 6; i += 1) {
        const c = FORGES[key].use.make(() => (i + 0.5) / 6);
        for (const l of FORGES[key].use.lines(c)) {
          const v = seenFromLeft(l);
          v.forEach((t, k) => {
            if (t !== ',' || !boxy(v[k - 1]) || !boxy(v[k + 1])) return;
            decimals += 1;
            expect([v[k - 1].label, v[k + 1].label], key).toEqual(['الوحدات', 'الجزء العشري']);
          });
          const lastBox = v.reduce((at, t, k) => (boxy(t) ? k : at), -1);
          const firstWord = v.findIndex(arabic);
          if (lastBox >= 0 && firstWord >= 0) expect(firstWord, `${key} ${JSON.stringify(v)}`).toBeGreaterThan(lastBox);
        }
      }
    expect(decimals).toBe(6); // forge ✍️: one typed decimal on each of its six cases
  });
  it('✍️ last step: three lines that NAME their box (the area of the court of a display), then one decimal for one court', () => {
    const c = { areas: [47, 67, 83], order: [2, 0, 1], shows: [83, 47, 67].map((a) => calculator(String(a))) };
    const lines = FORGES[K2].use.lines(c);
    expect(lines).toHaveLength(4);
    const words = (l) => l.tokens.map((t) => (typeof t === 'string' ? t : `[${t.label}]`));
    expect(lines[0].dir).toBe('rtl');
    expect(words(lines[0])).toEqual([`الحاسبة: ${calculator('83')}`, '←', 'ضلع الساحة', '[المساحة]']);
    expect(lines[3].dir).toBe('ltr');
    expect(words(lines[3])).toEqual(['[الوحدات]', ',', '[الجزء العشري]', ':', 'أطول مقياس للساحة 47']);
  });
  it('🔁 refuses a × a for a plaque or a side, and a fraction squared; it takes an equal fraction', () => {
    const F = FORGES[K3];
    const c = USE3[0];
    const right = { p: '37', s: '32', w: '27', n: '3', d: '8' };
    expect(F.use.check(c, right)).toBe('ok');
    expect(F.use.check(c, { ...right, n: '6', d: '16' })).toBe('ok');
    expect(F.use.check(c, { ...right, p: '1369' })).toBe('plaque');
    expect(F.use.check(c, { ...right, s: '1024' })).toBe('side');
    expect(F.use.check(c, { ...right, n: '9', d: '64' })).toBe('frac');
  });
});

describe('jidhr-tarbii — the numbers of the mirrors and of the last steps are not the bank’s', () => {
  const bank = readBank('jidhr-tarbii');
  /** What the bank's sheets STATE and EXPECT: the exercise's statement, each question, each expected answer. */
  const told = bank.sheets.flatMap((s) => {
    const j = JSON.parse(s.text);
    return [
      j.statement?.content ?? '',
      ...(j.questions ?? []).flatMap((q) => [q.statement ?? '', String(q.expectedAnswer ?? '')]),
    ];
  });
  /** A number as the bank may write it: « 6,25 », « 6.25 », « 6{,}25 »; « 3/8 », « \\dfrac{3}{8} ». */
  const named = (x) => {
    const t = String(x);
    const [p, q] = t.split('/');
    // never the end of a longer number (« 841 » in « 1841 », « 25 » in « 6{,}25 »), never its beginning (« 6,25 »)
    const re =
      q != null
        ? new RegExp(`(?<![0-9,.}])${p}/${q}(?![0-9])|\\{${p}\\}\\{${q}\\}`)
        : new RegExp(`(?<![0-9,.}])${t.replace(',', '(?:,|\\.|\\{,\\})')}(?![0-9]|[,.][0-9]|\\{,\\})`);
    return told.filter((l) => re.test(l));
  };
  const MINE = [
    ...USE1,
    ...USE1.map((a) => Math.sqrt(a)),
    ...USE2.flat(),
    ...USE3.flatMap((c) => [c.wall, c.rod, c.walk, `${c.frac[0]}/${c.frac[1]}`]),
    ...F1_HARD.map((c) => c.a),
    '41',
    '59',
    '73',
    '7,29',
    '2,7',
    '0,81',
    '0,9',
    '86',
    '172',
    '46',
    '18',
    '2/3',
    '6,25',
    '12,25',
    '20,25',
  ];
  it('no number of the last steps nor of the mirror’s own cases is a number the bank’s sheets state or expect', () => {
    for (const x of MINE) expect(named(x), String(x)).toEqual([]);
  });
  it('(the check sees the bank: 49/64, 0,49 and 196 are its numbers — the brief’s 49/64 was replaced by 9/16)', () => {
    for (const x of ['49/64', '0,49', '196', '7/8']) expect(named(x).length, x).toBeGreaterThan(0);
  });
  it('the numbers of 100 and more stand nowhere in the bank nor in another lesson’s story', () => {
    const stories = storiesOf({ exceptId: bank.id });
    for (const x of [...USE1, 172, 1369, 1444, 3721, 2116, 324]) {
      const hit = collisions(bank, [x], { stories });
      expect(
        hit.numbers.flatMap((h) => [...h.sheets, ...h.stories]),
        String(x),
      ).toEqual([]);
    }
  });
});
