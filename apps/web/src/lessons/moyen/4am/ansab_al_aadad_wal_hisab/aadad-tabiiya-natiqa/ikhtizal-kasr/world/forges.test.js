/**
 * THE FORGES of lesson `ikhtizal-kasr`: the shared checks (`describeForges`, kit/authoring/test/suites.js), then only
 * what is this lesson's own — the false rules its students really hold and where each one falls, every case drawn as a
 * fraction (its whole over its lit stretch), the last steps typed in their own shape (a fraction over a real bar), and
 * the numbers of the mirrors checked against the bank and the other stories.
 */
import { describe, it, expect } from 'vitest';
import { runOn } from '../../../../../../common/gameworld/kit/forge';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { boxesOf, pairKey } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { allRules, describeForges } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { bankPairs, collisions, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { BANK_PAIRS, FORGES } from './forges';
import { KEYS } from './journey';
import { NUMBERS, euclid, gcd, reduce } from './math';

const ID = 'ikhtizal-kasr';
const { marahil: MA, ghayr: GH, thuluth: TH, tusu: TS, natija: NA } = NUMBERS;
const NA_MARK = NA.strokes[0] + NA.strokes[1];

// ───────── what the WORLD logs while he plays (a plank fired on a marked bridge: the gap, then the lit stretch) ─────────
const on = (gap, mark, planks) =>
  planks.flatMap((b) => [
    { a: gap, b },
    { a: mark, b },
  ]);
const A = (...bs) => on(MA.gap, MA.mark, bs);
const B = (...bs) => on(GH.gap, GH.mark, bs);
const C = (...bs) => on(TH.gap, TH.mark, bs);
const D = (...bs) => on(TS.gap, TS.mark, bs);
const E = (...bs) => on(NA.gap, NA_MARK, bs);

/** The shortest road: the right plank at once (A needs its two planks that hold). */
const AT_ONCE = {
  'ikhtizal-marahil': A(2, 6),
  'ghayr-qabil': B(1),
  'ikhtizal-pgcd': [...C(33), ...D(27)],
  'natija-mukhtazala': E(13),
};
/** The story walk's road: a plank that falls first. */
const WALKED = {
  'ikhtizal-marahil': A(4, 2, 6),
  'ghayr-qabil': B(3, 1),
  'ikhtizal-pgcd': [...C(3, 33), ...D(81, 27)],
  'natija-mukhtazala': E(3, 13),
};
/** The longest road: every plank a student tries. */
const EVERY = {
  'ikhtizal-marahil': A(4, 9, 6, 2),
  'ghayr-qabil': B(3, 5, 7, 1),
  'ikhtizal-pgcd': [...C(9, 3, 11, 33), ...D(81, 243, 9, 27)],
  'natija-mukhtazala': E(1, 3, 39, 13),
};
/** The log of the road before each mirror. */
const BEFORE = {
  'ghayr-qabil': WALKED['ikhtizal-marahil'],
  'ikhtizal-pgcd': [...WALKED['ikhtizal-marahil'], ...WALKED['ghayr-qabil']],
  'natija-mukhtazala': [...WALKED['ikhtizal-marahil'], ...WALKED['ghayr-qabil'], ...WALKED['ikhtizal-pgcd']],
};
/** The smallest prime of n (n > 1). */
const spf = (x) => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43].find((p) => x % p === 0);
/** The right answer of each last step, computed from its case. */
const SOLVE = {
  'ikhtizal-marahil': (c) => {
    const k1 = spf(gcd(c.L, c.W));
    const [n1, d1] = [c.L / k1, c.W / k1];
    const k2 = spf(gcd(n1, d1));
    return { n1, d1, n2: n1 / k2, d2: d1 / k2 };
  },
  'ghayr-qabil': (c) => ({ g: gcd(c.L, c.W) }),
  'ikhtizal-pgcd': (c) => {
    const r = euclid(c.W, c.L);
    const row = (i) => ({ [`a${i}`]: r[i - 1].a, [`b${i}`]: r[i - 1].b, [`q${i}`]: r[i - 1].q, [`r${i}`]: r[i - 1].r });
    const [nn, dd] = reduce(c.L, c.W);
    return { q1: r[0].q, r1: r[0].r, ...row(2), ...row(3), g: gcd(c.L, c.W), n: nn, d: dd };
  },
  'natija-mukhtazala': (c) => {
    const [nn, dd] = reduce(...c.raw);
    return { s: c.raw[0], w: c.raw[1], n: nn, d: dd };
  },
};
/** The words of a key's name and of what it states: no sentence of its forge says them before the last step. */
const FORBIDDEN = {
  'ikhtizal-marahil': /اختزال|نختزل|اختزل|مراحل|قاسم/,
  'ghayr-qabil': /اختزال|نختزل|غير قابل/,
  'ikhtizal-pgcd': /اختزال|نختزل|غير قابل/,
  'natija-mukhtazala': /اختزال|نختزل|مختزل|غير قابل/,
};
const suite = describeForges({
  // the suite reads a typed fraction's boxes and hands a yes / no step its conclusion (kit/authoring/test/suites.js)
  forges: FORGES,
  keys: KEYS,
  roads: { AT_ONCE, WALKED, EVERY },
  before: BEFORE,
  solve: SOLVE,
  forbidden: FORBIDDEN,
  tiles: { 'ikhtizal-marahil': 18, 'ghayr-qabil': 8, 'ikhtizal-pgcd': 12, 'natija-mukhtazala': 6 },
  bankPairs: BANK_PAIRS,
});

// ───────── the lesson's own ─────────

const fallsOn = (key, r, road = WALKED) => suite.refutedBy(key, r, road);
const ROADS = [AT_ONCE, WALKED, EVERY];

describe('ikhtizal-kasr — the evidence is what his signs wrote', () => {
  it('🪜: the three equalities of A’s sign, whatever the order he built in; planks that fell write nothing', () => {
    for (const road of ROADS) {
      const rows = FORGES['ikhtizal-marahil'].evidence(road['ikhtizal-marahil']);
      expect(rows.map((c) => `${c.L}/${c.W}=${c.p}/${c.q}`).sort()).toEqual([
        '33/39=11/13',
        '66/78=11/13',
        '66/78=33/39',
      ]);
      expect(rows.every((c) => c.held)).toBe(true);
    }
  });
  it('🔒: his four fractions — 66/78, 33/39 and 11/13 shrink or stay as the planks show, 35/48 stays', () => {
    const rows = FORGES['ghayr-qabil'].evidence([...BEFORE['ghayr-qabil'], ...WALKED['ghayr-qabil']]);
    expect(rows.map((c) => [`${c.L}/${c.W}`, c.held, c.g])).toEqual([
      ['66/78', false, 6],
      ['35/48', true, 1],
      ['33/39', false, 3],
      ['11/13', true, 1],
    ]);
  });
  it('🎯: a plank that held the post gives a writing — the cheaper ones still shrink, 33 and 27 write 2/3 and 7/9', () => {
    const rows = FORGES['ikhtizal-pgcd'].evidence([...BEFORE['ikhtizal-pgcd'], ...EVERY['ikhtizal-pgcd']]);
    expect(rows.map((c) => [`${c.L}/${c.W}→${c.p}/${c.q}`, c.held])).toEqual([
      ['66/99→22/33', false],
      ['66/99→6/9', false],
      ['66/99→2/3', true],
      ['189/243→21/27', false],
      ['189/243→7/9', true],
    ]);
  });
  it('🧾: 5/39 + 8/39 written 1/3 (planks of 13); with planks of 1 it stays 13/39, which shrinks', () => {
    const rows = FORGES['natija-mukhtazala'].evidence(EVERY['natija-mukhtazala']);
    expect(rows.map((c) => [`${c.s1}+${c.s2}/${c.W}→${c.p}/${c.q}`, c.held])).toEqual([
      ['5+8/39→13/39', false],
      ['5+8/39→1/3', true],
    ]);
  });
});

describe('ikhtizal-kasr — the false rules its students really hold fall in front of him', () => {
  it('🪜: « subtract the same number from both » falls on HIS sign; « divide each by its own number » on a new one', () => {
    for (const road of ROADS) {
      const sub = fallsOn('ikhtizal-marahil', { num: 'sub', den: 'sub', k: 'one' }, road);
      expect([sub.on, sub.c.held]).toEqual(['evidence', true]);
      const only = fallsOn('ikhtizal-marahil', { num: 'div', den: 'keep', k: 'one' }, road);
      expect(only.on).toBe('evidence');
    }
    const own = fallsOn('ikhtizal-marahil', { num: 'div', den: 'div', k: 'own' });
    expect([own.on, own.c.held]).toEqual(['attack', false]);
    // the mirror's writing: each term divided by a number of its own — and the lit planks are not its numerator
    expect(own.c.L % own.c.p).toBe(0);
    expect(own.c.L / own.c.p).not.toBe(own.c.W / own.c.q);
  });
  it('🔒: « both odd », « both prime », « the numerator does not divide the denominator » fall on HIS signs', () => {
    for (const road of ROADS) {
      // both odd: 35/48 stays although 48 is even; 33/39 (both odd) shrinks
      const odd = fallsOn('ghayr-qabil', { see: 'odd', then: 'stays' }, road);
      expect([odd.on, odd.c.L, odd.c.W]).toEqual(['evidence', GH.mark, GH.gap]);
      const oddOnly = fallsOn('ghayr-qabil', { see: 'odd', then: 'shrinks' }, road);
      expect([oddOnly.on, oddOnly.c.L, oddOnly.c.W]).toEqual(['evidence', MA.mark, MA.gap]);
      const prime = fallsOn('ghayr-qabil', { see: 'prime', then: 'stays' }, road);
      expect([prime.on, prime.c.L, prime.c.W]).toEqual(['evidence', GH.mark, GH.gap]);
      const nodiv = fallsOn('ghayr-qabil', { see: 'nodiv', then: 'stays' }, road);
      expect([nodiv.on, nodiv.c.L, nodiv.c.W]).toEqual(['evidence', MA.mark, MA.gap]);
    }
  });
  it('🎯: « the difference » falls on 189/243; « any common divisor » meets a writing that still shrinks', () => {
    for (const road of ROADS) {
      const diff = fallsOn('ikhtizal-pgcd', { by: 'diff', how: 'both' }, road);
      expect([diff.on, diff.c.L, diff.c.W]).toEqual(['evidence', TS.mark, TS.gap]);
      expect(fallsOn('ikhtizal-pgcd', { by: 'small', how: 'both' }, road).on).toBe('evidence');
    }
    const any = fallsOn('ikhtizal-pgcd', { by: 'any', how: 'both' }, AT_ONCE);
    expect([any.on, any.c.held, any.c.L * any.c.q === any.c.p * any.c.W]).toEqual(['attack', false, true]);
    // he tried a cheaper plank: his own 22/33 refutes it
    expect(fallsOn('ikhtizal-pgcd', { by: 'any', how: 'both' }).on).toBe('evidence');
  });
  it('🧾: « add the denominators too » and « leave it » fall on HIS sum; « the smallest divisor » on a new one', () => {
    for (const road of ROADS) {
      for (const then of ['pgcd', 'keep', 'small'])
        expect(fallsOn('natija-mukhtazala', { first: 'both', then }, road).on).toBe('evidence');
      expect(fallsOn('natija-mukhtazala', { first: 'same', then: 'keep' }, road).on).toBe('evidence');
    }
    const small = fallsOn('natija-mukhtazala', { first: 'same', then: 'small' }, AT_ONCE);
    expect([small.on, small.c.held]).toEqual(['attack', false]);
    expect(gcd(small.c.p, small.c.q)).toBeGreaterThan(1);
  });
});

describe('ikhtizal-kasr — every case is a FRACTION, drawn and named as one', () => {
  it('two bars — the whole over its lit stretch — named by the fraction, never by a gap and a plank', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of suite.shownCases(F)) {
        expect(c.pair, F.caseId(c)).toEqual({ a: c.W, b: c.L, d: c.d });
        expect(c.head, F.caseId(c)).toMatch(/^\u2066.*\u2069$/);
        expect(c.head).toContain(c.s1 ? `${c.s1}/${c.W} + ${c.s2}/${c.W}` : `${c.L}/${c.W}`);
        expect(`${c.head} ${c.tag}`).not.toMatch(/لوح|هوّة/);
      }
    }
  });
  it('🪜 lays the planks of the claimed writing; 🔒 🎯 🧾 the longest plank that holds the bridge', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const c of suite.shownCases(F)) expect(c.d, F.caseId(c)).toBe(key === 'ikhtizal-marahil' ? c.W / c.q : c.g);
    }
  });
});

describe('ikhtizal-kasr — the last steps, typed in their own shape', () => {
  const fracs = (lines) => lines.flatMap((l) => l.tokens.filter((t) => t?.frac));
  it('every fraction of a last step is a fraction token — printed or typed — never « a/b » as text', () => {
    for (const key of KEYS) {
      const F = FORGES[key];
      for (let i = 0; i < 12; i += 1) {
        const c = F.use.make(() => (i + 0.5) / 12);
        const lines = F.use.lines(c);
        for (const l of lines) for (const t of l.tokens) if (typeof t === 'string') expect(t).not.toMatch(/\d\/\d/);
        expect(fracs(lines).length, key).toBe(
          { 'ikhtizal-marahil': 3, 'ghayr-qabil': 0, 'ikhtizal-pgcd': 2 }[key] ?? 4,
        );
        // a line holds at most four boxes, a fraction's two included
        for (const l of lines) expect(boxesOf(l.tokens).length).toBeLessThanOrEqual(4);
      }
    }
  });
  it('🪜: ANY chain of two divisions of both terms by a common number is accepted — not a subtraction, not one term', () => {
    const F = FORGES['ikhtizal-marahil'];
    const c = { L: 60, W: 84 };
    const ok = (n1, d1, n2, d2) => F.use.check(c, { n1, d1, n2, d2 });
    expect(ok(30, 42, 5, 7)).toBe('ok');
    expect(ok(20, 28, 5, 7)).toBe('ok');
    expect(ok(15, 21, 5, 7)).toBe('ok');
    expect(ok(5, 7, 5, 7)).toBe('second');
    expect(ok(50, 74, 25, 37)).toBe('first');
    expect(ok(30, 84, 15, 42)).toBe('first');
  });
  it('🔒: the PGCD then the conclusion; the draws hold fractions that stay and fractions that do not', () => {
    const F = FORGES['ghayr-qabil'];
    const seen = new Set();
    for (let seed = 1; seed <= 40; seed += 1) {
      const c = F.use.make(rng(seed * 7919));
      seen.add(c.held);
      expect(F.use.check(c, { g: String(c.g) }, c.held)).toBe('ok');
      expect(F.use.check(c, { g: String(c.g) }, !c.held)).toBe('verdict');
    }
    expect([...seen].sort()).toEqual([false, true]);
  });
  it('🎯: three divisions, the PGCD, then the fraction — an equal one that still shrinks is refused with its words', () => {
    const F = FORGES['ikhtizal-pgcd'];
    for (let i = 0; i < 5; i += 1) {
      const c = F.use.make(() => (i + 0.5) / 5);
      expect(c.rows).toHaveLength(3);
      for (const r of c.rows) expect(r.q).toBeLessThan(10);
      const right = Object.fromEntries(Object.entries(SOLVE['ikhtizal-pgcd'](c)).map(([k, v]) => [k, String(v)]));
      expect(F.use.check(c, right)).toBe('ok');
      const k = [2, 3, 5, 7].find((p) => c.g % p === 0 && p < c.g) ?? null;
      if (k) expect(F.use.check(c, { ...right, n: String(c.L / k), d: String(c.W / k) })).toBe('short');
    }
  });
  it('🧾: the result as it comes, then at its shortest — sums, a difference and a product', () => {
    const F = FORGES['natija-mukhtazala'];
    const ops = new Set();
    for (let i = 0; i < 6; i += 1) {
      const c = F.use.make(() => (i + 0.5) / 6);
      ops.add(c.op);
      const right = Object.fromEntries(Object.entries(SOLVE['natija-mukhtazala'](c)).map(([k, v]) => [k, String(v)]));
      expect(F.use.check(c, right)).toBe('ok');
      expect(F.use.check(c, { ...right, s: right.n, w: right.d })).toBe(gcd(...c.raw) > 1 ? 'calc' : 'ok');
      expect(F.use.check(c, { ...right, n: right.s, d: right.w })).toBe(gcd(...c.raw) > 1 ? 'short' : 'ok');
    }
    expect([...ops].sort()).toEqual(['+', '×', '−']);
  });
});

describe('ikhtizal-kasr — the numbers the mirrors write are the lesson’s own', () => {
  const bank = readBank(ID);
  it('the list pasted in forges.js is the bank’s', () => {
    expect([...BANK_PAIRS].sort()).toEqual([...bankPairs(bank)].sort());
  });
  it('every fraction the forges draw (hard cases, the robot’s, the last steps): in no line of the bank or of another story', () => {
    const fixed = [];
    for (const key of KEYS) {
      const F = FORGES[key];
      const right = allRules(F).find(F.isTheRule);
      for (const c of F.attacks(right, [])) fixed.push([c.W, c.L]);
      for (const k of [1, 2, 3]) for (const c of F.nudge(k, []).cases) fixed.push([c.W, c.L]);
      for (let i = 0; i < 12; i += 1) {
        const c = F.use.make(() => (i + 0.5) / 12);
        fixed.push([c.A, c.B]);
        if (c.a) fixed.push(c.a, c.b);
      }
    }
    // a pair of one-digit numbers sits on many lines of every story (gates, planks): the suite checks it against the bank
    const keys = [...new Set(fixed.filter(([x, y]) => x && y && Math.max(x, y) >= 10).map(([x, y]) => pairKey(x, y)))];
    expect(keys.length).toBeGreaterThan(40);
    for (const k of keys) {
      const r = collisions(bank, k.split(';').map(Number));
      expect(r.clear, `${k}: ${JSON.stringify(r)}`).toBe(true);
    }
  });
  it('the attacks a student meets on the three roads: no pair of another story either', () => {
    const met = new Set();
    for (const key of KEYS) {
      const F = FORGES[key];
      for (const road of ROADS)
        for (const rule of allRules(F)) {
          const rows = suite.rowsOf(key, road);
          if (runOn(F, rule, rows).bad < 0)
            for (const c of F.attacks(rule, rows)) if (Math.max(c.W, c.L) >= 10) met.add(pairKey(c.W, c.L));
        }
    }
    for (const k of met) expect(collisions(bank, k.split(';').map(Number)).clear, k).toBe(true);
  });
});
