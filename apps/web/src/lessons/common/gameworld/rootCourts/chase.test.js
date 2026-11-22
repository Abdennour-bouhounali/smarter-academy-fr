import { describe, it, expect } from 'vitest';
import {
  CHASE_LAYOUT,
  KINDS,
  COUNTS,
  fracOf,
  chaseFact,
  rodOfFrac,
  lensPower,
  lineEm,
  initChase,
  chaseReducer,
  chaseResult,
  rowNow,
  relation,
} from './chase';
import { compare, outcome, read } from './logic';

/** The whole square root of a BigInt, rounded down (the test's own). */
function isqrt(v) {
  if (v < 2n) return v;
  let x = BigInt(Math.floor(Math.sqrt(Number(v))));
  while (x * x > v) x -= 1n;
  while ((x + 1n) * (x + 1n) <= v) x += 1n;
  return x;
}
const isSquare = (a) => isqrt(BigInt(a)) ** 2n === BigInt(a);

/**
 * Five fractions p/q « better and better » for √a, the kind of list a lesson gives (the kind itself checks nothing about
 * how they were found): for q = 2, 3, 4 … the nearest p, kept each time it comes closer than every fraction before it.
 * (The convergents of a continued fraction grow too fast for some courts — √17: 143649/34840 — the screen holds numbers
 * of eight digits at most; √2's convergents are SPEC2.)
 */
function chaseList(a, n = 5) {
  const A = BigInt(a);
  const out = [];
  let best = null; // |p² − a q²| / q², as a fraction [num, den]
  for (let q = 2n; out.length < n; q += 1n) {
    const below = isqrt(A * q * q);
    for (const p of [below, below + 1n]) {
      const num = p * p > A * q * q ? p * p - A * q * q : A * q * q - p * p;
      // closer = a smaller gap between the platform's side and the court's: compare |p − q√a| through (num/q²)/(p/q + √a)
      const far = Number(num) / Number(q * q) / (Number(p) / Number(q) + Math.sqrt(a));
      if (p >= 1n && (best == null || far < best)) {
        best = far;
        out.push(`${p}/${q}`);
        break;
      }
    }
  }
  return out;
}

const NON_SQUARES = Array.from({ length: 19 }, (_, k) => k + 2).filter((a) => !isSquare(a));
const SPEC2 = { kind: 'chase', a: '2', fracs: ['3/2', '7/5', '17/12', '41/29', '99/70'], text: {} };
const play = (actions, spec = SPEC2, from = initChase(spec)) =>
  actions.reduce((s, a) => chaseReducer(spec, s, a), from);

describe('chase — the facts on one common denominator', () => {
  it('reads a rod p/q as given, and refuses what is not one', () => {
    expect(fracOf('7/5')).toEqual({ p: '7', q: '5' });
    expect(fracOf(' 6 / 4 ')).toEqual({ p: '6', q: '4' });
    for (const bad of ['7', '7,5', '0/5', '7/1', '7/0', '-7/5', '7/5/2', 'x/5', ''])
      expect(() => fracOf(bad), bad).toThrow();
    expect(rodOfFrac('6/4')).toEqual({ q: '3/2' });
    expect(rodOfFrac('7/5')).toEqual({ q: '7/5' });
  });

  it('√2: 3/2, 7/5, 17/12, 41/29, 99/70 — two whole numbers each, one small tile apart, never riding', () => {
    const want = [
      ['3/2', '9', '8', 'jam'],
      ['7/5', '49', '50', 'band'],
      ['17/12', '289', '288', 'jam'],
      ['41/29', '1681', '1682', 'band'],
      ['99/70', '9801', '9800', 'jam'],
    ];
    for (const [f, platform, court, kind] of want) {
      const o = chaseFact('2', f);
      expect(o).toMatchObject({ platform, court, kind, gap: '1', a: '2' });
    }
    expect(chaseFact('2', '7/5')).toMatchObject({ covers: '1,96', diff: '0,04' });
    expect(chaseFact('2', '99/70')).toMatchObject({ covers: '9801/4900', diff: '1/4900' });
  });

  it('every a from 2 to 20 that is not a square, five fractions each: exact numbers, the same fact as the world, never a ride', () => {
    let checked = 0;
    for (const a of NON_SQUARES) {
      const fracs = chaseList(a);
      expect(fracs).toHaveLength(5);
      // the list is a spec the kind accepts (it fits the table and the card)
      expect(() => initChase({ kind: 'chase', a: String(a), fracs, text: {} }), `a = ${a}`).not.toThrow();
      for (const f of fracs) {
        const o = chaseFact(String(a), f);
        const [P, Q] = [BigInt(o.p), BigInt(o.q)];
        expect(o.platform).toBe(String(P * P));
        expect(o.court).toBe(String(BigInt(a) * Q * Q));
        expect(o.kind).not.toBe('ride');
        expect(BigInt(o.gap)).toBeGreaterThan(0n);
        expect(BigInt(o.gap)).toBe(P * P > BigInt(a) * Q * Q ? P * P - BigInt(a) * Q * Q : BigInt(a) * Q * Q - P * P);
        // the same verdict as the rest of the world (logic.js › outcome on the reduced rod)
        const w = outcome(rodOfFrac(f), String(a));
        expect(o.kind).toBe(w.kind);
        expect(compare(o.covers, w.covers)).toBe(0);
        expect(compare(o.diff, w.diff)).toBe(0);
        // the relation sign the card writes
        expect(relation(o)).toBe(o.kind === 'band' ? -1 : 1);
        checked += 1;
      }
    }
    expect(checked).toBe(NON_SQUARES.length * 5);
  });

  it('no fraction rides a court whose area is not a square: every q up to 400, the two nearest p of every q', () => {
    for (const a of NON_SQUARES) {
      const A = BigInt(a);
      for (let q = 2n; q <= 400n; q += 1n) {
        const below = isqrt(A * q * q);
        for (const p of [below, below + 1n]) {
          if (p < 1n) continue;
          const o = chaseFact(String(a), `${p}/${q}`);
          expect(o.kind).not.toBe('ride');
          expect(o.kind).toBe(p === below ? 'band' : 'jam');
        }
      }
    }
  });

  it('the logic is not hard-wired: on a court that IS a square, the right fraction rides', () => {
    expect(chaseFact('4', '4/2')).toMatchObject({ kind: 'ride', platform: '16', court: '16', gap: '0' });
    expect(chaseFact('9', '6/2').kind).toBe('ride');
    expect(chaseFact('16', '12/3').kind).toBe('ride');
    expect(chaseFact('9', '5/2')).toMatchObject({ kind: 'band', platform: '25', court: '36', gap: '11' });
    expect(chaseFact('9', '13/4')).toMatchObject({ kind: 'jam', platform: '169', court: '144', gap: '25' });
    for (let r = 1n; r <= 20n; r += 1n)
      for (let q = 2n; q <= 30n; q += 1n) expect(chaseFact(String(r * r), `${r * q}/${q}`).kind).toBe('ride');
  });

  it('the magnifier opens exactly when the gap is too thin, and makes it at least 8 units', () => {
    const u = 172 / Math.sqrt(2);
    expect(lensPower(chaseFact('2', '3/2'), u)).toBe(0);
    expect(lensPower(chaseFact('4', '4/2'), u)).toBe(0);
    let most = 0;
    for (const a of NON_SQUARES)
      for (const f of chaseList(a)) {
        const o = chaseFact(String(a), f);
        const ua = 172 / Math.max(Math.sqrt(a), Number(o.p) / Number(o.q));
        const k = lensPower(o, ua);
        const t = (Number(o.gap) / Number(o.q) ** 2 / (Math.sqrt(a) + Number(o.p) / Number(o.q))) * ua;
        if (k === 0) expect(t).toBeGreaterThanOrEqual(4);
        else {
          expect(t).toBeLessThan(4);
          expect(t * 10 ** k).toBeGreaterThanOrEqual(8);
          expect(t * 10 ** (k - 1)).toBeLessThan(8);
          // the band drawn in the lens stays inside it (radius 52)
          expect(t * 10 ** k).toBeLessThan(104);
        }
        most = Math.max(most, k);
      }
    expect(most).toBeLessThanOrEqual(12);
    expect(lensPower(chaseFact('2', '99/70'), u)).toBeGreaterThanOrEqual(2);
  });

  it('refuses a spec the screen cannot hold', () => {
    const spec = (a, fracs) => ({ kind: 'chase', a, fracs, text: {} });
    expect(() => initChase(spec('2', []))).toThrow();
    expect(() => initChase(spec('2', ['3/2', '7/5', '17/12', '41/29', '99/70', '239/169', '577/408']))).toThrow(
      /6 fractions/,
    );
    expect(() => initChase(spec('2', ['3/2', '7/5', '17/12', '41/29', '99/70', '239/169']))).not.toThrow();
    expect(() => initChase(spec('2,5', ['3/2']))).toThrow();
    expect(() => initChase(spec('0', ['3/2']))).toThrow();
    expect(() => initChase(spec('401', ['20/1']))).toThrow();
    expect(() => initChase(spec('2', ['3,5/2']))).toThrow();
    // 99999 × 99999 has ten digits
    expect(() => initChase(spec('2', ['99999/70711']))).toThrow(/digits/);
    // eight digits each, but the card's formula would run past its column
    expect(lineEm(chaseFact('400', '5001/250'))).toBeGreaterThan(CHASE_LAYOUT.card.em);
    expect(() => initChase(spec('400', ['5001/250']))).toThrow(/card/);
  });
});

describe('chase — the state machine, played through', () => {
  it('predictions that do not match the fact: the fact is kept with « right: false », never anything else', () => {
    let s = initChase(SPEC2);
    expect(s).toMatchObject({ i: 0, stage: 'say', rows: [], done: false });
    expect(rowNow(s)).toBeNull();
    // moves that do not belong to the stage change nothing
    for (const a of [{ type: 'built' }, { type: 'next' }, { type: 'count', v: '0' }, { type: 'say', v: 'maybe' }])
      expect(chaseReducer(SPEC2, s, a)).toBe(s);
    // 3/2: he says « a band »; it jams
    s = play([{ type: 'say', v: 'band' }], SPEC2, s);
    expect(s.stage).toBe('build');
    expect(chaseReducer(SPEC2, s, { type: 'say', v: 'jam' })).toBe(s);
    s = play([{ type: 'built' }], SPEC2, s);
    expect(s.stage).toBe('seen');
    expect(rowNow(s)).toMatchObject({
      i: 0,
      frac: '3/2',
      a: '2',
      s: { q: '3/2' },
      kind: 'jam',
      platform: '9',
      court: '8',
      gap: '1',
      predicted: 'band',
      right: false,
    });
    // 7/5: he says « it rides »; a band. 17/12: right. 41/29: right. 99/70: « it rides » — it jams.
    s = play(
      [
        { type: 'next' },
        { type: 'say', v: 'ride' },
        { type: 'built' },
        { type: 'next' },
        { type: 'say', v: 'jam' },
        { type: 'built' },
        { type: 'next' },
        { type: 'say', v: 'band' },
        { type: 'built' },
        { type: 'next' },
        { type: 'say', v: 'ride' },
        { type: 'built' },
      ],
      SPEC2,
      s,
    );
    expect(s.rows.map((r) => [r.kind, r.predicted, r.right])).toEqual([
      ['jam', 'band', false],
      ['band', 'ride', false],
      ['jam', 'jam', true],
      ['band', 'band', true],
      ['jam', 'ride', false],
    ]);
    // after the last fraction: the closing question
    s = play([{ type: 'next' }], SPEC2, s);
    expect(s.stage).toBe('count');
    expect(rowNow(s)).toBeNull();
    expect(chaseReducer(SPEC2, s, { type: 'count', v: '2' })).toBe(s);
    expect(chaseReducer(SPEC2, s, { type: 'next' })).toBe(s);
    // he taps « one »: none rode
    s = play([{ type: 'count', v: '1' }], SPEC2, s);
    expect(s.stage).toBe('counted');
    expect(s.count).toEqual({ said: 1, tapped: '1', rides: 0, n: 5, right: false });
    expect(chaseReducer(SPEC2, s, { type: 'count', v: '0' })).toBe(s);
    s = play([{ type: 'next' }], SPEC2, s);
    expect(s.done).toBe(true);
    const result = chaseResult(s);
    expect(result.rows).toHaveLength(5);
    expect(result.count.right).toBe(false);
    // every row is a case of this world: its court, its rod (logic.js), what it did
    for (const r of result.rows) expect(outcome(r.s, r.a).kind).toBe(r.kind);
  });

  it('the count is judged against what the world did: « none » on √2, « one » and « all » on a square court', () => {
    const toCount = (spec, said) => {
      let s = initChase(spec);
      while (s.stage !== 'count')
        s = chaseReducer(
          spec,
          s,
          s.stage === 'say' ? { type: 'say', v: said } : { type: s.stage === 'build' ? 'built' : 'next' },
        );
      return s;
    };
    expect(chaseReducer(SPEC2, toCount(SPEC2, 'band'), { type: 'count', v: '0' }).count).toMatchObject({
      rides: 0,
      right: true,
    });
    const one = { kind: 'chase', a: '4', fracs: ['3/2', '4/2', '5/2'], text: {} };
    expect(chaseReducer(one, toCount(one, 'ride'), { type: 'count', v: '1' }).count).toMatchObject({
      said: 1,
      rides: 1,
      right: true,
    });
    const all = { kind: 'chase', a: '9', fracs: ['6/2', '9/3'], text: {} };
    const s = toCount(all, 'ride');
    expect(s.rows.every((r) => r.right)).toBe(true);
    expect(chaseReducer(all, s, { type: 'count', v: 'all' }).count).toMatchObject({ said: 2, rides: 2, right: true });
    expect(chaseReducer(all, s, { type: 'count', v: '0' }).count.right).toBe(false);
  });

  it('every road through the reducer ends: every prediction on every fraction, every tap', () => {
    for (const a of NON_SQUARES) {
      const spec = { kind: 'chase', a: String(a), fracs: chaseList(a), text: {} };
      for (const said of KINDS)
        for (const tap of COUNTS) {
          let s = initChase(spec);
          for (let k = 0; k < 40 && !s.done; k += 1) {
            const type = { say: 'say', build: 'built', seen: 'next', count: 'count', counted: 'next' }[s.stage];
            s = chaseReducer(
              spec,
              s,
              type === 'say' ? { type, v: said } : type === 'count' ? { type, v: tap } : { type },
            );
          }
          expect(s.done).toBe(true);
          expect(s.rows.every((r) => r.right === (r.kind === said))).toBe(true);
          expect(s.count.right).toBe(tap === '0');
          expect(read(s.rows[0].a).n).toBe(BigInt(a));
        }
    }
  });
});
