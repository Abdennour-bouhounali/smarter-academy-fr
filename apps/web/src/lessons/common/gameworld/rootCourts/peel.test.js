import { describe, it, expect } from 'vitest';
import {
  PEEL_LAYOUT,
  OPS,
  plaqueOf,
  isAlone,
  loneOf,
  rodsOf,
  fewestOf,
  peelOnce,
  readAmount,
  roundPlaque,
  answerOk,
  judgeRods,
  initPeel,
  peelReducer,
  peelResult,
  plaqueArgs,
  piecesOf,
  fits,
} from './peel';
import { compare, equal, read, write, platform, rootOf } from './logic';

// ───────────── the test's OWN arithmetic (fractions of BigInt), never peel.js's ─────────────
const g = (a, b) => {
  let [x, y] = [a < 0n ? -a : a, b < 0n ? -b : b];
  while (y) [x, y] = [y, x % y];
  return x || 1n;
};
const F = (n, d = 1n) => {
  const k = g(n, d) * (d < 0n ? -1n : 1n);
  return [n / k, d / k];
};
const fr = (t) => {
  const r = read(t);
  return [r.n, r.d];
};
const txt = ([n, d]) => write({ n, d });
const fmul = ([a, b], [c, d]) => F(a * c, b * d);
const fadd = ([a, b], [c, d]) => F(a * d + c * b, b * d);

/** Every number of courts a round may give: 1 … 6, and p/q with q ≤ 4 and at most 6 pieces (1/4 … 5/4, 6/… none). */
const COURTS = [];
for (let q = 1n; q <= 4n; q += 1n) for (let p = 1n; p <= 6n; p += 1n) if (g(p, q) === 1n) COURTS.push([p, q]);
/** Lone areas of every end: negative, zero, squares, non-squares, fractions, a decimal. */
const AREAS = ['-9', '-4', '-1', '0', '1', '4', '6', '25', '30', '25/9', '2/3', '0,25'].map(fr);
/** Piles: none, added, taken, 1 … 20 tiles. */
const PILES = Array.from({ length: 41 }, (_, k) => [BigInt(k - 20), 1n]);

/** The plaque written for m courts of area a with a pile c: v = m·a + c (the test's own). */
const forward = (m, a, c) => ({ courts: txt(m), pile: txt(c), plaque: txt(fadd(fmul(m, a), c)) });

/** Peels a plaque by a road: 'pile' first (then the courts), or 'courts' first (share, multiply — then the pile). */
function road(pl, first) {
  const steps = [];
  const doOp = (op, n) => {
    const out = peelOnce(pl, op, n);
    expect(out.done, `${op} ${n} on ${JSON.stringify(pl)}`).toBe(true);
    // the lone court's area never changes: the world does each peel on the courts AND the plaque
    expect(equal(loneOf(out.after), loneOf(pl))).toBe(true);
    steps.push(op);
    pl = out.after;
  };
  const pile = () => {
    const c = read(pl.pile);
    if (c.n > 0n) doOp('take', pl.pile);
    else if (c.n < 0n) doOp('add', write({ n: -c.n, d: c.d }));
  };
  const courts = () => {
    const { p, q } = piecesOf(pl.courts);
    if (p > 1) doOp('share', String(p));
    if (q > 1) doOp('grow', String(q));
  };
  if (first === 'pile') {
    pile();
    courts();
  } else {
    courts();
    pile();
  }
  return { pl, steps };
}

describe('peel — the law of a plaque', () => {
  it('reads a plaque and its lone court: 3 courts hold 75 → 25; a court less 6 tiles holds 0 → 6; plus 4 → −4', () => {
    expect(loneOf(plaqueOf({ courts: '3', plaque: '75' }))).toBe('25');
    expect(loneOf(plaqueOf({ courts: '1', pile: '-6', plaque: '0' }))).toBe('6');
    expect(loneOf(plaqueOf({ courts: '1', pile: '4', plaque: '0' }))).toBe('-4');
    expect(loneOf(plaqueOf({ courts: '2/3', plaque: '1350' }))).toBe('2025');
    expect(loneOf(plaqueOf({ courts: '3', pile: '-6', plaque: '69' }))).toBe('25');
    expect(isAlone(plaqueOf({ courts: '1', plaque: '49' }))).toBe(true);
    expect(isAlone(plaqueOf({ courts: '1', pile: '2', plaque: '49' }))).toBe(false);
    expect(piecesOf('2/3')).toEqual({ p: 2, q: 3 });
    expect(piecesOf('6/4')).toEqual({ p: 3, q: 2 });
  });

  it('the rods of a lone court: two (a number, or the wall), one (length 0), none', () => {
    expect(rodsOf('25')).toEqual({ n: 2, end: 'two', right: { q: '5' }, left: { q: '5', neg: true } });
    expect(rodsOf('30')).toEqual({ n: 2, end: 'two', right: { root: '30' }, left: { root: '30', neg: true } });
    expect(rodsOf('9/4').right).toEqual({ q: '1,5' });
    expect(rodsOf('25/9').right).toEqual({ q: '5/3' });
    expect(rodsOf('0,25').right).toEqual({ q: '0,5' });
    expect(rodsOf('2/3').right).toEqual({ root: '2/3' });
    expect(rodsOf('0')).toEqual({ n: 1, end: 'one', right: { q: '0' }, left: null });
    expect(rodsOf('-4')).toEqual({ n: 0, end: 'none', right: null, left: null });
    // every rod the world builds rides its court: its platform covers exactly the lone area
    for (const a of AREAS) {
      const w = rodsOf(txt(a));
      if (w.right) expect(equal(platform(w.right), txt(a))).toBe(true);
    }
  });

  it('EVERY chain of one or two operations (every drawable number of courts, every pile of −20 … 20, twelve lone areas): both roads reach ONE court, exactly its area, in the fewest peels', () => {
    let checked = 0;
    for (const m of COURTS)
      for (const c of PILES)
        for (const a of AREAS) {
          const given = forward(m, a, c);
          if (![given.pile, given.plaque, txt(a)].every(fits)) continue;
          expect(() => roundPlaque(given)).not.toThrow();
          expect(loneOf(given)).toBe(txt(a));
          if (isAlone(given)) continue;
          for (const first of ['pile', 'courts']) {
            const { pl, steps } = road(given, first);
            expect(isAlone(pl), `${JSON.stringify(given)} by ${first}`).toBe(true);
            expect(pl.plaque).toBe(txt(a));
            expect(steps.length).toBe(fewestOf(given));
          }
          // the end the world computes for it
          const end = compare(txt(a), '0');
          expect(rodsOf(loneOf(given)).end).toBe(end > 0 ? 'two' : end === 0 ? 'one' : 'none');
          checked += 1;
        }
    expect(checked).toBeGreaterThan(5000);
  });

  it('share by 2 … 6, add or take 1 … 20, p/q of a court (q ≤ 4): one operation each, its exact inverse', () => {
    for (const a of AREAS) {
      for (let k = 2n; k <= 6n; k += 1n) {
        const pl = forward([k, 1n], a, [0n, 1n]);
        const out = peelOnce(pl, 'share', String(k));
        expect(out.done).toBe(true);
        expect(isAlone(out.after)).toBe(true);
        expect(out.after.plaque).toBe(txt(a));
      }
      for (let t = 1n; t <= 20n; t += 1n) {
        const plus = forward([1n, 1n], a, [t, 1n]);
        expect(peelOnce(plus, 'take', String(t)).after.plaque).toBe(txt(a));
        const less = forward([1n, 1n], a, [-t, 1n]);
        expect(peelOnce(less, 'add', String(t)).after.plaque).toBe(txt(a));
        // the other way round makes the pile bigger: done, never alone, the lone area kept
        const away = peelOnce(plus, 'add', String(t));
        expect(away.done).toBe(true);
        expect(away.after.pile).toBe(String(2n * t));
        expect(isAlone(away.after)).toBe(false);
      }
      for (const [p, q] of COURTS.filter(([, q0]) => q0 > 1n)) {
        const pl = forward([p, q], a, [0n, 1n]);
        if (!fits(pl.plaque)) continue;
        // share the pieces then multiply, or multiply then share
        let x = pl;
        if (p > 1n) x = peelOnce(x, 'share', String(p)).after;
        x = peelOnce(x, 'grow', String(q)).after;
        expect(isAlone(x)).toBe(true);
        expect(x.plaque).toBe(txt(a));
        let y = peelOnce(pl, 'grow', String(q));
        if (!y.done) {
          expect(y.reason).toBe('room'); // p/q × q = p courts: more than six are not drawn
          expect(Number(p)).toBeGreaterThan(PEEL_LAYOUT.maxCourts);
          continue;
        }
        y = y.after;
        if (p > 1n) y = peelOnce(y, 'share', String(p)).after;
        expect(isAlone(y)).toBe(true);
        expect(y.plaque).toBe(txt(a));
      }
    }
  });

  it('a peel the world cannot do is answered by a fact: shares that do not split, too many courts, numbers too long', () => {
    const three = plaqueOf({ courts: '3', plaque: '75' });
    expect(peelOnce(three, 'share', '4')).toEqual({ done: false, reason: 'split', pieces: '3' });
    expect(peelOnce(three, 'share', '2')).toMatchObject({ done: false, reason: 'split' });
    expect(peelOnce(three, 'grow', '3')).toEqual({ done: false, reason: 'room' });
    expect(peelOnce(three, 'grow', '2')).toMatchObject({ done: true, after: { courts: '6', plaque: '150' } });
    const one = plaqueOf({ courts: '1', pile: '-6', plaque: '0' });
    expect(peelOnce(one, 'share', '2')).toMatchObject({ done: false, reason: 'split', pieces: '1' });
    // two thirds: share 3 does not split two pieces; share 2 does (one third of a court)
    const twoThirds = plaqueOf({ courts: '2/3', plaque: '1350' });
    expect(peelOnce(twoThirds, 'share', '3').reason).toBe('split');
    expect(peelOnce(twoThirds, 'share', '2').after).toEqual({ courts: '1/3', pile: '0', plaque: '675' });
    // a share splits the pile too (3 courts less 6 tiles → 1 court less 2 tiles): honest, the lone area is kept
    const chain = plaqueOf({ courts: '3', pile: '-6', plaque: '69' });
    expect(peelOnce(chain, 'share', '3').after).toEqual({ courts: '1', pile: '-2', plaque: '23' });
    expect(peelOnce(chain, 'add', '6').after).toEqual({ courts: '3', pile: '0', plaque: '75' });
    // a pile that is not a whole number after a share
    const odd = plaqueOf({ courts: '3', pile: '-5', plaque: '70' });
    expect(peelOnce(odd, 'share', '3').after).toEqual({ courts: '1', pile: '-5/3', plaque: '70/3' });
    expect(peelOnce(peelOnce(odd, 'share', '3').after, 'add', '5/3').after).toEqual({
      courts: '1',
      pile: '0',
      plaque: '25',
    });
    // numbers past the screen are not written
    const big = plaqueOf({ courts: '1', pile: '5', plaque: '99999990' });
    expect(peelOnce(big, 'add', '20').reason).toBe('big');
    expect(peelOnce(plaqueOf({ courts: '6', plaque: '6' }), 'grow', '2').reason).toBe('room');
  });

  it('reads what he types: a whole k from 2 to 12 for a share or a multiplication, a positive number of tiles', () => {
    for (const bad of ['', '1', '0', '13', '2,5', '-3', 'x', '3/2']) expect(readAmount('share', bad), bad).toBeNull();
    expect(readAmount('grow', '12')).toBe('12');
    expect(readAmount('share', ' 3 ')).toBe('3');
    for (const bad of ['', '0', '-4', 'x', '/', '123456789']) expect(readAmount('add', bad), bad).toBeNull();
    expect(readAmount('add', '2,5')).toBe('2,5');
    expect(readAmount('take', '5/3')).toBe('5/3');
    expect(readAmount('take', '6/3')).toBe('2');
  });

  it('refuses a round the screen cannot hold, and checks the end a spec says', () => {
    expect(() => roundPlaque({ courts: '7', plaque: '7' })).toThrow(/at most 6/);
    expect(() => roundPlaque({ courts: '2/5', plaque: '7' })).toThrow(/quarters/);
    expect(() => roundPlaque({ courts: '7/4', plaque: '7' })).toThrow(/6 pieces/);
    expect(() => roundPlaque({ courts: '5/4', plaque: '5' })).not.toThrow();
    expect(() => roundPlaque({ courts: '0', plaque: '7' })).toThrow();
    expect(() => roundPlaque({ courts: '-2', plaque: '7' })).toThrow();
    expect(() => roundPlaque({ courts: '3', plaque: 'x' })).toThrow(/three numbers/);
    expect(() => roundPlaque({ courts: '1', plaque: '123456789' })).toThrow(/8 characters/);
    expect(() => roundPlaque({ courts: '1', pile: '4', plaque: '0', end: 'none' })).not.toThrow();
    expect(() => roundPlaque({ courts: '1', pile: '4', plaque: '0', end: 'two' })).toThrow(/none/);
    expect(() => roundPlaque({ courts: '1', pile: '-6', plaque: '0', end: 'two' })).not.toThrow();
    const r = { courts: '3', plaque: '75' };
    expect(() => initPeel({ kind: 'peel', rounds: [], text: {} })).toThrow();
    expect(() => initPeel({ kind: 'peel', rounds: [r, r, r, r, r], text: {} })).toThrow(/4 rounds/);
    expect(() => initPeel({ kind: 'peel', rounds: [r], ops: ['share', 'fold'], text: {} })).toThrow();
    expect(() => initPeel({ kind: 'peel', rounds: [r, r, r, r], text: {} })).not.toThrow();
  });

  it('plaqueArgs: what a sentence of the lesson receives', () => {
    expect(plaqueArgs(plaqueOf({ courts: '2/3', pile: '-6', plaque: '1350' }))).toEqual({
      courts: '2/3',
      whole: false,
      num: '2',
      den: '3',
      pile: '-6',
      pileSign: -1,
      pileAbs: '6',
      plaque: '1350',
      alone: false,
      courtsTex: '\\dfrac{2}{3}',
      pileTex: '-6',
      pileAbsTex: '6',
      plaqueTex: '1350',
    });
    expect(plaqueArgs(plaqueOf({ courts: '1', plaque: '-4' })).alone).toBe(true);
  });
});

describe('peel — his rods against the world', () => {
  it('an answer is complete: how many, and that many readable rods (never negative: the left sign is printed)', () => {
    expect(answerOk({ n: 0 })).toBe(true);
    expect(answerOk({ n: 1, right: { q: '0' } })).toBe(true);
    expect(answerOk({ n: 1, right: null })).toBe(false);
    expect(answerOk({ n: 2, right: { q: '5' }, left: null })).toBe(false);
    expect(answerOk({ n: 2, right: { q: '5' }, left: { q: '-5' } })).toBe(false);
    expect(answerOk({ n: 2, right: { root: '30' }, left: { q: '5,47' } })).toBe(true);
    expect(answerOk({ n: 3 })).toBe(false);
    expect(answerOk(null)).toBe(false);
  });

  it('judges the count and each rod by its LENGTH: 5 or « the side of 25 » both ride the court of 25', () => {
    expect(judgeRods({ n: 2, right: { q: '5' }, left: { root: '25' } }, '25')).toMatchObject({
      countRight: true,
      right: true,
    });
    expect(judgeRods({ n: 1, right: { q: '5' } }, '25')).toMatchObject({ countRight: false, right: false });
    expect(judgeRods({ n: 2, right: { q: '5,47' }, left: { q: '5,47' } }, '30')).toMatchObject({
      countRight: true,
      right: false,
    });
    expect(judgeRods({ n: 2, right: { root: '30' }, left: { root: '30' } }, '30').right).toBe(true);
    expect(judgeRods({ n: 1, right: { q: '0' } }, '0').right).toBe(true);
    expect(judgeRods({ n: 0 }, '-4')).toEqual({ countRight: true, rods: [], right: true });
    expect(judgeRods({ n: 2, right: { q: '2' }, left: { q: '2' } }, '-4')).toMatchObject({
      countRight: false,
      right: false,
    });
    expect(judgeRods({ n: 2, right: { q: '3/2' }, left: { root: '9/4' } }, '9/4').right).toBe(true);
    // the world's own rods are always right
    for (const a of AREAS) {
      const w = rodsOf(txt(a));
      const said = { n: w.n, right: w.right, left: w.left ? { ...w.left, neg: undefined } : null };
      expect(judgeRods(said, txt(a)).right).toBe(true);
    }
    expect(rootOf('30')).toBeNull();
  });
});

/** The four rounds of the lesson's design: 3 courts of 75; a court less 6; a court and 4 more; two thirds of 1350. */
const SPEC = {
  kind: 'peel',
  rounds: [
    { courts: '3', plaque: '75', tex: '3x^2 = 75' },
    { courts: '1', pile: '-6', plaque: '0', tex: 'x^2 - 6 = 0' },
    { courts: '1', pile: '4', plaque: '0', tex: 'x^2 + 4 = 0' },
    { courts: '2/3', plaque: '1350', tex: '\\dfrac{2}{3}x^2 = 1350' },
  ],
  text: {},
};
const play = (actions, spec = SPEC, from = initPeel(spec)) => actions.reduce((s, a) => peelReducer(spec, s, a), from);
const peel = (op, n) => [{ type: 'peel', op, n }, { type: 'ran' }];

describe('peel — the state machine, played through', () => {
  it('moves that do not belong to the stage change nothing; an unreadable number is a notice, nothing logged', () => {
    const s = initPeel(SPEC);
    expect(s).toMatchObject({ ri: 0, stage: 'peel', peels: [], rows: [], done: false });
    for (const a of [{ type: 'ran' }, { type: 'built' }, { type: 'next' }, { type: 'answer', said: { n: 0 } }])
      expect(peelReducer(SPEC, s, a)).toBe(s);
    expect(peelReducer(SPEC, s, { type: 'restart' })).toBe(s); // nothing to start again
    expect(peelReducer(SPEC, s, { type: 'peel', op: 'fold', n: '2' })).toBe(s);
    const u = peelReducer(SPEC, s, { type: 'peel', op: 'share', n: '1' });
    expect(u.notice).toBe('unread');
    expect(u.peels).toHaveLength(0);
    // with spec.ops, an operation not offered does nothing
    const only = { ...SPEC, ops: ['share', 'take'] };
    expect(peelReducer(only, initPeel(only), { type: 'peel', op: 'grow', n: '2' }).stage).toBe('peel');
    expect(peelReducer(only, initPeel(only), { type: 'peel', op: 'grow', n: '2' }).peels).toHaveLength(0);
  });

  it('the four rounds, with wrong peels and wrong rods: every peel is kept in his order, the facts are the world’s', () => {
    // round 1 — 3 courts, 75: he shares by 4 (not done), by 3 (done: alone, 25); says two rods 5 and 5
    let s = play([{ type: 'peel', op: 'share', n: '4' }]);
    expect(s.stage).toBe('peel');
    expect(s.last).toMatchObject({ op: 'share', n: '4', done: false, reason: 'split', pieces: '3' });
    expect(s.now).toEqual(s.given);
    s = play([{ type: 'peel', op: 'share', n: '3' }], SPEC, s);
    expect(s.stage).toBe('run');
    expect(peelReducer(SPEC, s, { type: 'peel', op: 'share', n: '3' })).toBe(s);
    s = play([{ type: 'ran' }], SPEC, s);
    expect(s.stage).toBe('alone');
    expect(s.now).toEqual({ courts: '1', pile: '0', plaque: '25' });
    expect(peelReducer(SPEC, s, { type: 'answer', said: { n: 2, right: { q: '5' } } }).notice).toBe('unread');
    s = play([{ type: 'answer', said: { n: 2, right: { q: '5' }, left: { q: '5' } } }, { type: 'built' }], SPEC, s);
    expect(s.stage).toBe('seen');
    expect(s.rows[0]).toMatchObject({
      i: 0,
      lone: '25',
      end: 'two',
      done: 1,
      fewest: 1,
      countRight: true,
      right: true,
      world: { n: 2, right: { q: '5' } },
    });
    expect(s.rows[0].peels.map((p) => [p.op, p.n, p.done])).toEqual([
      ['share', '4', false],
      ['share', '3', true],
    ]);
    // round 2 — a court less 6 tiles, 0: he TAKES 6 first (the pile grows: −12, −6), starts again, adds 6
    s = play([{ type: 'next' }], SPEC, s);
    expect(s).toMatchObject({ ri: 1, stage: 'peel', peels: [] });
    s = play(peel('take', '6'), SPEC, s);
    expect(s.now).toEqual({ courts: '1', pile: '-12', plaque: '-6' });
    expect(s.stage).toBe('peel');
    s = play([{ type: 'restart' }], SPEC, s);
    expect(s.now).toEqual(s.given);
    s = play(peel('add', '6'), SPEC, s);
    expect(s.stage).toBe('alone');
    expect(s.now.plaque).toBe('6');
    // he says ONE rod: the world builds two walls
    s = play([{ type: 'answer', said: { n: 1, right: { root: '6' } } }, { type: 'built' }], SPEC, s);
    expect(s.rows[1]).toMatchObject({
      lone: '6',
      end: 'two',
      countRight: false,
      right: false,
      done: 2,
      fewest: 1,
      world: { right: { root: '6' }, left: { root: '6', neg: true } },
    });
    expect(s.rows[1].rods).toEqual([{ side: 'one', said: { root: '6' }, ok: true }]);
    expect(s.rows[1].peels.map((p) => p.op)).toEqual(['take', 'restart', 'add']);
    // round 3 — a court and 4 tiles more, 0: take 4 → −4, no court; he says two rods 2 and 2
    s = play([{ type: 'next' }, ...peel('take', '4')], SPEC, s);
    expect(s.stage).toBe('alone');
    expect(s.now.plaque).toBe('-4');
    s = play([{ type: 'answer', said: { n: 2, right: { q: '2' }, left: { q: '2' } } }, { type: 'built' }], SPEC, s);
    expect(s.rows[2]).toMatchObject({ lone: '-4', end: 'none', countRight: false, right: false });
    expect(s.rows[2].world).toEqual({ n: 0, end: 'none', right: null, left: null });
    // round 4 — two thirds of a court, 1350: multiply by 3 (2 courts, 4050), share by 2 → 2025; rods 45 and 45
    s = play([{ type: 'next' }, ...peel('grow', '3')], SPEC, s);
    expect(s.now).toEqual({ courts: '2', pile: '0', plaque: '4050' });
    s = play(peel('share', '2'), SPEC, s);
    expect(s.now.plaque).toBe('2025');
    s = play([{ type: 'answer', said: { n: 2, right: { q: '45' }, left: { q: '45' } } }, { type: 'built' }], SPEC, s);
    expect(s.rows[3]).toMatchObject({ lone: '2025', end: 'two', right: true, done: 2, fewest: 2 });
    expect(peelReducer(SPEC, s, { type: 'peel', op: 'share', n: '2' })).toBe(s);
    s = play([{ type: 'next' }], SPEC, s);
    expect(s.done).toBe(true);
    const result = peelResult(s);
    expect(result.rows).toHaveLength(4);
    expect(result.rows.map((r) => r.end)).toEqual(['two', 'two', 'none', 'two']);
    // the result is plain data (a save, a forge's evidence)
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it('a round already one court starts at « alone »; zero ends with one rod of length 0', () => {
    const spec = {
      kind: 'peel',
      rounds: [
        { courts: '1', plaque: '49' },
        { courts: '4', plaque: '0' },
      ],
      text: {},
    };
    let s = initPeel(spec);
    expect(s.stage).toBe('alone');
    s = play([{ type: 'answer', said: { n: 2, right: { q: '7' }, left: { q: '7' } } }, { type: 'built' }], spec, s);
    expect(s.rows[0]).toMatchObject({ end: 'two', right: true, done: 0, fewest: 0 });
    s = play([{ type: 'next' }, ...peel('share', '4')], spec, s);
    expect(s.now.plaque).toBe('0');
    s = play([{ type: 'answer', said: { n: 1, right: { q: '0' } } }, { type: 'built' }], spec, s);
    expect(s.rows[1]).toMatchObject({ end: 'one', right: true, world: { n: 1, right: { q: '0' } } });
  });

  it('every road ends: random peels (done or not) then the right peels, on every chain of the exhaustive set', () => {
    let rnd = 7;
    const next = () => {
      rnd = (rnd * 1103515245 + 12345) % 2147483648;
      return rnd;
    };
    let played = 0;
    for (const m of COURTS)
      for (const c of [-7n, 0n, 5n])
        for (const a of AREAS.slice(0, 8)) {
          const given = forward(m, a, [c, 1n]);
          if (![given.pile, given.plaque].every(fits)) continue;
          const spec = { kind: 'peel', rounds: [given], text: {} };
          let s = initPeel(spec);
          // three random peels first (any operation, any small number)
          for (let k = 0; k < 3 && s.stage === 'peel'; k += 1) {
            const op = OPS[next() % 4];
            const n = String(2 + (next() % 5));
            s = play([{ type: 'peel', op, n }], spec, s);
            if (s.stage === 'run') s = play([{ type: 'ran' }], spec, s);
            expect(equal(loneOf(s.now), txt(a))).toBe(true);
          }
          if (s.stage === 'peel') s = play([{ type: 'restart' }], spec, s);
          if (s.stage === 'peel') {
            const { steps, pl } = road(s.now, 'pile');
            expect(isAlone(pl)).toBe(true);
            // replay the road through the reducer
            let x = s.now;
            for (const op of steps) {
              const amount =
                op === 'share'
                  ? String(piecesOf(x.courts).p)
                  : op === 'grow'
                    ? String(piecesOf(x.courts).q)
                    : write({ n: read(x.pile).n < 0n ? -read(x.pile).n : read(x.pile).n, d: read(x.pile).d });
              s = play(peel(op, amount), spec, s);
              x = s.now;
            }
          }
          expect(s.stage).toBe('alone');
          const w = rodsOf(s.now.plaque);
          s = play([{ type: 'answer', said: { n: w.n, right: w.right, left: w.right } }, { type: 'built' }], spec, s);
          expect(s.rows[0].right).toBe(true);
          expect(s.rows[0].lone).toBe(txt(a));
          s = play([{ type: 'next' }], spec, s);
          expect(s.done).toBe(true);
          played += 1;
        }
    expect(played).toBe(384);
  });
});
