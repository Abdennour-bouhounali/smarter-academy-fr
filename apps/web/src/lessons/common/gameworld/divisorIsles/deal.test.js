import { describe, it, expect } from 'vitest';
import { gcd, commonPlanks } from './inquiry';
import { dealOf, dealsThatWork, mostLots, answerOf, initDeal, dealReducer, dealResult } from './deal';

const SPEC = { kind: 'deal', a: { n: 40, item: 'rose' }, b: { n: 56, item: 'lily' }, lot: 'vase' };
const run = (actions, from = initDeal(), spec = SPEC) => actions.reduce((s, a) => dealReducer(spec, s, a), from);
/** A try played through: choose k, say, and every tick of the deal. */
const tryK = (k, v, s, spec = SPEC) => {
  let t = run(
    [
      { type: 'choose', k },
      { type: 'say', v },
    ],
    s,
    spec,
  );
  while (t.stage === 'deal') t = dealReducer(spec, t, { type: 'tick' });
  return t;
};
const sweep = (fn) => {
  const bad = [];
  fn((ok, label) => {
    if (!ok && bad.length < 5) bad.push(label);
  });
  expect(bad).toEqual([]);
};

describe('deal — the logic of a sharing into identical lots', () => {
  it('k lots: each lot holds q of each kind, r stays on the table, and it shares everything exactly when k fills both', () => {
    sweep((check) => {
      for (let nA = 1; nA <= 60; nA += 1)
        for (let nB = 1; nB <= 60; nB += 1)
          for (let k = 1; k <= 13; k += 1) {
            const d = dealOf(nA, nB, k);
            const at = `${nA} ${nB} ${k}`;
            check(k * d.qA + d.rA === nA && d.rA < k && k * d.qB + d.rB === nB && d.rB < k, at);
            check(d.ok === (nA % k === 0 && nB % k === 0), `ok ${at}`);
            check(d.rounds === Math.max(d.qA, d.qB), `rounds ${at}`);
          }
    });
    expect(dealOf(40, 56, 6)).toEqual({ k: 6, qA: 6, rA: 4, qB: 9, rB: 2, ok: false, rounds: 9 });
    expect(() => dealOf(40, 56, 0)).toThrow(RangeError);
  });

  it('the ks that work are the common planks; the most is the gcd, with nA ÷ g and nB ÷ g in one lot', () => {
    sweep((check) => {
      for (let nA = 1; nA <= 80; nA += 1)
        for (let nB = 1; nB <= 80; nB += 1) {
          check(dealsThatWork(nA, nB).join() === commonPlanks(nA, nB).join(), `${nA} ${nB}`);
          const m = mostLots(nA, nB);
          check(m.k === gcd(nA, nB) && m.x * m.k === nA && m.y * m.k === nB, `most ${nA} ${nB}`);
        }
    });
    expect(mostLots(40, 56)).toEqual({ k: 8, x: 5, y: 7 });
  });

  it('an answer is met by a deal, a bigger row of HIS table, or « still open » — never by the answer', () => {
    const tries = [dealOf(40, 56, 2), dealOf(40, 56, 4), dealOf(40, 56, 6)];
    expect(answerOf(40, 56, tries, { k: 8, x: 5, y: 7 })).toEqual({ kind: 'ok' });
    expect(answerOf(40, 56, tries, { k: 6, x: 6, y: 9 })).toEqual({ kind: 'deal', k: 6 }); // 6 leaves some
    expect(answerOf(40, 56, tries, { k: 4, x: 10, y: 13 })).toEqual({ kind: 'deal', k: 4 }); // one lot holds 14
    expect(answerOf(40, 56, tries, { k: 2, x: 20, y: 28 })).toEqual({ kind: 'bigger', k: 4 });
    expect(answerOf(40, 56, tries, { k: 4, x: 10, y: 14 })).toEqual({ kind: 'open' });
    // the world never names the most: no answer but the right one returns k = 8
    sweep((check) => {
      for (let k = 1; k <= 12; k += 1)
        for (let x = 0; x <= 21; x += 1)
          for (const y of [7, 14, 28]) {
            const a = answerOf(40, 56, tries, { k, x, y });
            check(a.kind === 'ok' || a.k !== 8 || k === 8, `${k} ${x} ${y}`);
          }
    });
  });
});

describe('deal — the state machine plays a whole experiment', () => {
  it('a try: choose, say, the world deals round by round, the row joins the table; a k is never dealt twice', () => {
    let s = run([{ type: 'choose', k: 6 }]);
    expect([s.stage, s.k, s.dealt]).toEqual(['guess', 6, 0]);
    expect(dealReducer(SPEC, s, { type: 'tick' })).toBe(s); // nothing deals before he says
    s = dealReducer(SPEC, s, { type: 'say', v: true });
    expect(s.stage).toBe('deal');
    for (let j = 1; j < 9; j += 1) {
      s = dealReducer(SPEC, s, { type: 'tick' });
      expect([s.stage, s.dealt]).toEqual(['deal', j]);
    }
    s = dealReducer(SPEC, s, { type: 'tick' });
    expect(s.stage).toBe('pick');
    expect(s.tries).toEqual([{ k: 6, guess: true, restA: 4, restB: 2, ok: false, qA: 6, qB: 9 }]);
    expect(s.fact).toMatchObject({ type: 'dealt', row: { k: 6 } });
    const again = dealReducer(SPEC, s, { type: 'choose', k: 6 });
    expect([again.stage, again.tries.length, again.fact.type, again.dealt]).toEqual(['pick', 1, 'again', 9]);
  });

  it('a k bigger than both collections deals nothing: one tick ends it, everything stays on the table', () => {
    const spec = { ...SPEC, a: { n: 3, item: 'apple' }, b: { n: 5, item: 'pear' } };
    const s = tryK(12, false, initDeal(), spec);
    expect(s.tries[0]).toMatchObject({ k: 12, restA: 3, restB: 5, ok: false });
  });

  it('the answer opens after minTries; a miss is a fact; the right answer ends the experiment', () => {
    let s = initDeal();
    for (const [k, v] of [
      [2, true],
      [3, false],
      [4, true],
    ])
      s = tryK(k, v, s);
    expect(dealReducer(SPEC, s, { type: 'toAnswer' })).toBe(s); // three tries: not yet
    s = tryK(5, false, s);
    s = dealReducer(SPEC, s, { type: 'toAnswer' });
    expect(s.stage).toBe('answer');
    // an empty box, or more lots than the longest choice: the bound
    expect(dealReducer(SPEC, s, { type: 'answer', k: null, x: 1, y: 1 }).fact).toEqual({ type: 'bound', max: 12 });
    expect(dealReducer(SPEC, s, { type: 'answer', k: 40, x: 1, y: 1 }).fact).toEqual({ type: 'bound', max: 12 });
    // 2 lots, right per lot: his table has a bigger k that worked (4)
    let m = dealReducer(SPEC, s, { type: 'answer', k: 2, x: 20, y: 28 });
    expect([m.stage, m.k, m.fact.kind, m.fact.row.k]).toEqual(['pick', 4, 'bigger', 4]);
    // 4 lots, right per lot: no bigger k of his table worked — still open
    m = run([{ type: 'toAnswer' }, { type: 'answer', k: 4, x: 10, y: 14 }], m);
    expect([m.stage, m.fact.kind, m.fact.row]).toEqual(['pick', 'open', null]);
    // 6 lots, never tried: the world deals it, then says what is left; the row joins his table (guess null)
    m = run([{ type: 'toAnswer' }, { type: 'answer', k: 6, x: 6, y: 9 }], m);
    expect([m.stage, m.k, m.dealt]).toEqual(['deal', 6, 0]);
    while (m.stage === 'deal') m = dealReducer(SPEC, m, { type: 'tick' });
    expect([m.stage, m.fact.type, m.fact.kind, m.fact.row.k]).toEqual(['pick', 'miss', 'deal', 6]);
    expect(m.tries.at(-1)).toMatchObject({ k: 6, guess: null, ok: false });
    // the right answer
    m = run([{ type: 'toAnswer' }, { type: 'answer', k: 8, x: 5, y: 7 }], m);
    expect([m.stage, m.k, m.fact.type]).toEqual(['seen', 8, 'ok']);
    m = dealReducer(SPEC, m, { type: 'next' });
    expect(m.done).toBe(true);
    const r = dealResult(SPEC, m);
    expect(r.most).toBe(8);
    expect(r.perLot).toEqual([5, 7]);
    expect(r.tries.map((t) => t.k)).toEqual([2, 3, 4, 5, 6]);
    expect(r.tries[0]).toEqual({ k: 2, guess: true, restA: 0, restB: 0, ok: true });
    expect(r.answers.map((a) => a.kind)).toEqual(['bigger', 'open', 'deal', 'ok']);
  });
});
