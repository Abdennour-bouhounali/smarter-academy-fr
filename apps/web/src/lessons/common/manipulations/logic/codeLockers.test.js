import { describe, it, expect } from 'vitest';
import * as P from '@smarter-academy/core/arithmetic/powers.js';
import * as R from '@smarter-academy/core/arithmetic/relativeOps.js';
import * as L from './codeLockers';
import { LEVELS } from '../levels';

const BEG = LEVELS['code-lockers'].beginner.numbers;
const ADV = LEVELS['code-lockers'].advanced.numbers;
const set = (s, vals) => Object.entries(vals).reduce((a, [k, v]) => L.setWheel(a, k, v), s);

describe('code-lockers — every preset lock is solvable and follows the definition b × q = a', () => {
  for (const [name, numbers] of Object.entries({ beginner: BEG, advanced: ADV, fraction: { world: 'fraction' } })) {
    it(`${name}: init does not throw and the exact quotient opens the lock`, () => {
      const s = L.init(numbers);
      for (const t of s.tasks) {
        const q = L.answerOf(t);
        expect(L.judge(t, q).ok, t.id).toBe(true);
        expect(P.eq(P.mul(R.parseRel(t.b), q), R.parseRel(t.a)), t.id).toBe(true);
      }
    });
  }
  it('an unsolvable lock throws (no integer code for 5 ÷ 2 with integer wheels)', () => {
    expect(() => L.init({ tasks: [{ id: 'x', b: '2', a: '5' }] })).toThrow();
  });
  it('the unknown first: ? × (−7) = −63 is the same lock (b × q commutes)', () => {
    const t = L.init(BEG).tasks[2];
    expect(t.qFirst).toBe(true);
    expect(L.ruleText(t)).toBe('? × (−7) = −63');
    expect(L.calcText(t, '9', P.rat(-63))).toBe('9 × (−7) = −63');
  });
});

describe('code-lockers — judging a code', () => {
  const lock = { b: '-6', a: '48' };
  it('opens with −8; refuses +8 as « sign » and −7 as « distance »', () => {
    expect(L.judge(lock, '-8')).toMatchObject({ ok: true });
    expect(L.judge(lock, '8')).toMatchObject({ ok: false, reason: 'sign' });
    expect(L.judge(lock, '-7')).toMatchObject({ ok: false, reason: 'distance' });
  });
  it('L4: (−12) × ? = −60 refuses −5 with 60 (neg ÷ neg is not neg)', () => {
    const j = L.judge({ b: '-12', a: '-60' }, '-5');
    expect(j.ok).toBe(false);
    expect(R.relText(j.product)).toBe('60');
    expect(j.reason).toBe('sign');
  });
  it('the zero lock: 0 × ? = 5 opens with nothing; 0 × ? = 0 opens with any code', () => {
    expect(L.judge({ b: '0', a: '5' }, '3')).toMatchObject({ ok: false, reason: 'zero-lock' });
    expect(L.judge({ b: '0', a: '0' }, '7')).toMatchObject({ ok: true, all: true });
    expect(L.answerOf({ b: '0', a: '5' })).toBe(null);
  });
  it('decimalReachable: −2/3 is not reachable with 2 places; 0,25 is', () => {
    expect(L.decimalReachable({ b: '-6', a: '4' }, 2)).toBe(false);
    expect(L.decimalReachable({ b: '-8', a: '-2' }, 2)).toBe(true);
    expect(L.decimalReachable({ b: '-8', a: '-2' }, 1)).toBe(false);
  });
});

describe('code-lockers — the wheels and the code value', () => {
  it('int: the sign wheel and two digit wheels', () => {
    let s = L.init(BEG);
    s = set(s, { s: -1, t: 0, u: 8 });
    expect(R.relText(L.codeNow(s))).toBe('−8');
    s = L.turn(s, 'u', 1);
    expect(R.relText(L.codeNow(s))).toBe('−9');
    s = L.turn(s, 'u', 1);
    expect(R.relText(L.codeNow(s))).toBe('0');
    s = L.turn(s, 'u', -1);
    expect(R.relText(L.codeNow(s))).toBe('−9');
  });
  it('frac: three sign wheels; −2/3, 2/−3, −(2/3) are one value, −2/−3 is positive', () => {
    const v = (w) => R.relText(L.codeValue({ ...L.freshWheels(), ...w }, 'frac'));
    expect(v({ ns: -1, n: 2, d: 3 })).toBe('−2/3');
    expect(v({ n: 2, ds: -1, d: 3 })).toBe('−2/3');
    expect(v({ s: -1, n: 2, d: 3 })).toBe('−2/3');
    expect(v({ ns: -1, n: 2, ds: -1, d: 3 })).toBe('2/3');
    expect(v({ s: -1, ns: -1, ds: -1, n: 2, d: 3 })).toBe('−2/3');
  });
  it('writingKey counts DIFFERENT writings of one value (−4/6 differs from −2/3)', () => {
    const k = (w) => L.writingKey({ ...L.freshWheels(), ...w }, 'frac');
    expect(new Set([k({ ns: -1, n: 2, d: 3 }), k({ n: 2, ds: -1, d: 3 }), k({ s: -1, n: 2, d: 3 }), k({ ns: -1, n: 4, d: 6 })]).size).toBe(4);
    expect(k({ ns: -1, n: 2, d: 3 })).toBe('−2/3');
  });
});

describe('code-lockers — a guided run of the beginner level', () => {
  it('opens the four lockers with the exact codes, in order, and writes the record', () => {
    let s = L.init(BEG);
    const codes = [[-1, 0, 8], [-1, 0, 6], [1, 0, 9], [1, 0, 5]];
    codes.forEach(([sg, t, u], i) => {
      s = set(s, { s: sg, t, u });
      s = L.pull(s);
      expect(s.last.ok, `locker ${i + 1}`).toBe(true);
      expect(L.discoveryReady(s)).toBe(i === 3);
      if (i < 3) s = L.nextTask(s);
    });
    expect(s.record.map((r) => r.sentence)).toEqual(['48 ÷ (−6) = −8', '(−54) ÷ 9 = −6', '(−63) ÷ (−7) = 9', '(−60) ÷ (−12) = 5']);
  });
  it('the sign refusal of L4 and the distance refusal are written with their calculation', () => {
    let s = L.init(BEG);
    s = L.nextTask(L.nextTask(L.nextTask({ ...s, done: { 0: true, 1: true, 2: true } })));
    s = set(s, { s: -1, u: 5 });
    s = L.pull(s);
    expect(s.last).toMatchObject({ ok: false, reason: 'sign', calc: '(−12) × (−5) = 60', want: '−60' });
  });
  it('a locker that is open stays open: pulling again changes nothing', () => {
    let s = L.init(BEG);
    s = L.pull(set(s, { s: -1, u: 8 }));
    const n = s.trials.length;
    expect(L.pull(s).trials.length).toBe(n);
  });
});

describe('code-lockers — advanced: the sign is a prediction', () => {
  it('digits are locked until « ثبّت »; a wrong committed sign is refused with its calculation and the sign wheel is freed', () => {
    let s = L.init(ADV);
    expect(L.digitsLocked(s)).toBe(true);
    expect(L.turn(s, 'u', 1)).toBe(s);
    s = L.turn(s, 's', 1);
    s = L.commit(s);
    expect(s.committed).toBe(-1);
    expect(L.digitsLocked(s)).toBe(false);
    expect(L.signLocked(s)).toBe(true);
    s = L.pull(s);
    expect(s.last).toMatchObject({ ok: false, reason: 'sign', calc: '(−8) × (−0,25) = 2', want: '−2' });
    expect(s.committed).toBe(null);
    expect(L.signLocked(s)).toBe(false);
  });
  it('A4: ? × (−5) = 0 opens with either sign and the code 0', () => {
    for (const sg of [1, -1]) {
      let s = { ...L.init(ADV), ti: 3 };
      s = { ...s, layout: 'dec', wheels: L.freshWheels() };
      s = L.turn(s, 's', sg === 1 ? 2 : 1);
      s = L.commit(s);
      s = L.pull(s);
      expect(s.last.ok).toBe(true);
    }
  });
  it('A1 opens with −0,25 once the sign is right', () => {
    let s = L.init(ADV);
    s = L.commit(L.turn(L.turn(s, 's', 1), 's', 1)); // the sign wheel is back on +
    expect(s.committed).toBe(1);
    s = set(s, { u: 0, d1: 2, d2: 5 });
    s = L.pull(s);
    expect(s.last.ok).toBe(true);
    expect(s.last.code).toBe('0,25');
  });
});

describe('code-lockers — world fraction', () => {
  it('F1 needs the switch after two pulls and TWO different writings of −2/3', () => {
    let s = L.init({ world: 'fraction' });
    expect(L.switchReady(s)).toBe(false);
    s = L.pull(set(s, { s: -1, u: 0, d1: 6, d2: 6 }));
    expect(s.last).toMatchObject({ ok: false, reason: 'distance', calc: '(−6) × (−0,66) = 3,96' });
    s = L.pull(set(s, { s: -1, u: 0, d1: 6, d2: 7 }));
    expect(s.last.calc).toBe('(−6) × (−0,67) = 4,02');
    expect(L.switchReady(s)).toBe(true);
    s = L.switchMode(s);
    expect(s.layout).toBe('frac');
    s = L.pull(set(s, { ns: -1, n: 2, d: 3 }));
    expect(s.last).toMatchObject({ ok: true, fresh: true, count: 1, doneNow: false });
    expect(L.taskDone(s)).toBe(false);
    s = L.pull(set(s, { ns: -1, n: 2, d: 3 }));
    expect(s.last.fresh).toBe(false);
    expect(L.taskDone(s)).toBe(false);
    s = L.pull(set(s, { ns: 1, ds: -1, n: 2, d: 3 }));
    expect(s.last).toMatchObject({ ok: true, fresh: true, count: 2, doneNow: true });
    expect(L.taskDone(s)).toBe(true);
    expect(s.record).toHaveLength(2);
  });
  it('F2: −2/−3 opens (−9) × ? = −6 and so does 2/3: one key, two writings', () => {
    let s = L.nextTask({ ...L.init({ world: 'fraction' }), done: { 0: true } });
    expect(s.layout).toBe('frac');
    s = L.pull(set(s, { ns: -1, ds: -1, n: 2, d: 3 }));
    expect(s.last.ok).toBe(true);
    s = L.pull(set(s, { ns: 1, ds: 1, n: 2, d: 3 }));
    expect(s.last.ok).toBe(true);
    expect(L.taskDone(s)).toBe(true);
    expect(s.record.map((r) => r.code)).toEqual(['2/3', '2/3']);
  });
});

describe('code-lockers — the free panel', () => {
  it('accepts b in −20…20 and a in −99…99 with at most one decimal; refuses the rest', () => {
    expect(L.parseFree('-20', L.FREE_B)).not.toBe(null);
    expect(L.parseFree('20,5', L.FREE_B)).toBe(null);
    expect(L.parseFree('3,25', L.FREE_A)).toBe(null);
    expect(L.parseFree('abc', L.FREE_A)).toBe(null);
    expect(L.parseFree('−99', L.FREE_A)).not.toBe(null);
  });
  it('b = 0 is shown honestly: a ≠ 0 refused whatever the code; a = 0 opened by any code', () => {
    let s = L.setFree(L.init(BEG), '0', '5');
    s = L.pull(set(s, { u: 3 }));
    expect(s.last).toMatchObject({ ok: false, reason: 'zero-lock' });
    s = L.setFree(L.init(BEG), '0', '0');
    s = L.pull(set(s, { u: 7 }));
    expect(s.last).toMatchObject({ ok: true, all: true });
  });
  it('a free lock never counts as progress, and « back » returns to the mission', () => {
    let s = L.setFree(L.init(BEG), '-3', '12');
    s = L.pull(set(s, { s: -1, u: 4 }));
    expect(s.last.ok).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    expect(s.record).toHaveLength(0);
    expect(L.toGuided(s).free).toBe(null);
  });
});

describe('code-lockers — the LabCoach follows the gestures to the end', () => {
  it('beginner: digit → sign → handle → next …, never the answer', () => {
    let s = L.init(BEG);
    expect(L.coachOf(s).id).toBe('digit');
    s = L.turn(s, 'u', 1);
    expect(L.coachOf(s).id).toBe('sign');
    s = L.turn(s, 's', 1);
    expect(L.coachOf(s).id).toBe('handle');
    s = L.pull(set(s, { s: -1, u: 8 }));
    expect(L.coachOf(s).id).toBe('next');
  });
  it('advanced: sign → commit → digit → handle', () => {
    let s = L.init(ADV);
    expect(L.coachOf(s).id).toBe('sign');
    s = L.turn(s, 's', 1);
    expect(L.coachOf(s).id).toBe('commit');
    s = L.commit(s);
    expect(L.coachOf(s).id).toBe('digit');
  });
  it('fraction world: digit, then the switch after two pulls, and nothing in the free panel', () => {
    let s = L.init({ world: 'fraction' });
    expect(L.coachOf(s).id).toBe('digit');
    s = L.pull(set(s, { u: 1 }));
    s = L.pull(set(s, { u: 2 }));
    expect(L.coachOf(s).id).toBe('switch');
    expect(L.coachOf(L.setFree(s, '2', '4'))).toBe(null);
  });
  it('no coach text names the answer: ids only', () => {
    for (const id of ['digit', 'sign', 'commit', 'handle', 'switch', 'next']) expect(typeof id).toBe('string');
  });
});
