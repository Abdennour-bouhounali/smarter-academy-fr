// « Entraîne-toi » of decomposer-en-facteurs-premiers: the shared checks (authoring kit), then the lesson's own — every
// wrong reason of « Justifie » is FALSE, the trace of the program is the program's, the reading questions read a
// decomposition, and no draw lands on a number of the road or of the mission.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeTrainer, valueOf } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { isPrime, primeFactors } from './math';
import { KNOWLEDGE } from './knowledge';
import { trainerEvidence } from './evidence';
import { PLAN_OF, RESERVED, answerLabel, check, solution, traceOf, trainer } from './trainer';

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const all = function* (seeds = 25) {
  for (const card of CARDS)
    for (let seed = 1; seed <= seeds; seed += 1)
      for (const q of trainer.makeSession(rng(seed * 104729 + 1), card)) yield q;
};

describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['tap', 'tf', 'decompose', 'powers', 'quotient', 'prime', 'big', 'trace'],
});

/** The value of a formula side, powers included: « 2^{3} \times 3 » → 24. */
const value = (side) => valueOf(side.replace(/(\d+)\^\{?(\d+)\}?/g, (_, p, e) => String(Number(p) ** Number(e))));
/** Is a reason a TRUE statement? (an equality « $x = y$ », « n est un nombre premier ») — null when it is neither. */
function holds(reason) {
  const eq = reason.match(/\$([^$=]+)=([^$=]+)\$/);
  if (eq) return value(eq[1]) === value(eq[2]);
  const pr = reason.match(/(\d[\d ]*) est un nombre premier/);
  if (pr) return isPrime(Number(pr[1].replace(/ /g, '')));
  return null;
}

describe('decomposer-en-facteurs-premiers — its own trainer', () => {
  it('every wrong reason offered to « Justifie » is a FALSE statement; the verdicts are computed', () => {
    let n = 0;
    for (const q of all())
      if (q.kind === 'tf') {
        expect(q.lies).toHaveLength(2);
        for (const l of q.lies) {
          expect(holds(l), `${q.statement} — ${l}`).toBe(false);
          n += 1;
        }
        if (q.reasons) {
          expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
          expect(q.reasons).toHaveLength(3);
        }
      }
    expect(n).toBeGreaterThan(200);
  });

  it('the exam questions: three prime factors at most a line, the trace is the program’s, no reserved number', () => {
    const seen = new Set();
    for (const q of all()) {
      if (q.a != null) expect(RESERVED.has(q.a), `${q.kind} ${q.a}`).toBe(false);
      if (q.kind === 'decompose' || q.kind === 'big') {
        expect(primeFactors(q.a)).toEqual(q.list);
        expect(q.list).toHaveLength(q.count);
        seen.add(`${q.kind}:${q.count}`);
      }
      if (q.kind === 'big') expect(q.a).toBeGreaterThanOrEqual(1000);
      if (q.kind === 'quotient') {
        expect(q.A % q.d).toBe(0);
        expect(q.a).toBe(q.A / q.d);
        for (const f of q.qs) expect(f.e).toBeGreaterThanOrEqual(1);
      }
      if (q.kind === 'prime') {
        const f = primeFactors(q.a);
        expect(isPrime(q.a) || (f.length === 2 && f[0] >= 7), String(q.a)).toBe(true);
        seen.add(`prime:${isPrime(q.a)}`);
      }
    }
    for (const k of ['decompose:3', 'big:2', 'big:3', 'prime:true', 'prime:false']) expect(seen.has(k), k).toBe(true);
  });

  it('the program: it notes the prime factors, and its loop stops when d × d passes N', () => {
    for (let N = 4; N <= 3000; N += 1) {
      const t = traceOf(N);
      expect(t.noted, String(N)).toEqual(primeFactors(N));
      expect(t.first).toBe(primeFactors(N)[0]);
    }
    expect(traceOf(60)).toEqual({ first: 2, after: 30, stop: 3, noted: [2, 2, 3, 5] });
  });

  it('a factor line accepts the primes in any order, and refuses a composite or a wrong product with a hint', () => {
    const q = [...all(3)].find((x) => x.kind === 'decompose');
    const [a, b, c] = q.list;
    expect(check(q, { f1: c, f2: a, f3: b }).ok).toBe(true);
    const comp = check(q, { f1: a * b, f2: c, f3: 1 });
    expect(comp.ok).toBe(false);
    expect(comp.hint).toBeTruthy();
    expect(check(q, { f1: a, f2: b, f3: c + 2 }).ok).toBe(false);
  });

  it('an exponent is typed RAISED after its printed prime: the kit’s power token, one answer of its line', () => {
    let n = 0;
    for (const q of all(5))
      if (q.kind === 'powers' || q.kind === 'quotient') {
        const [line] = q.form.lines;
        const pows = line.tokens.filter((t) => t?.pow);
        expect(pows.map((t) => Number(t.pow.base))).toEqual(q.primes);
        for (const t of pows) {
          expect(t.pow.exp.num).toBe(`e${t.pow.base}`);
          expect(t.pow.exp.label).toBe(`exposant de ${t.pow.base}`);
        }
        // no box outside a power on these lines, and, after « n = », no prime printed loose
        expect(line.tokens.filter((t) => t?.num)).toEqual([]);
        expect(line.tokens[1]).toBe('=');
        expect(line.tokens.slice(2).filter((t) => typeof t === 'string' && /^\d+$/.test(t))).toEqual([]);
        n += 1;
      }
    expect(n).toBeGreaterThan(20);
  });

  it('a power question refuses an exponent read wrong, and says which way it is off', () => {
    const q = [...all(5)].find((x) => x.kind === 'powers');
    const right = solution(q);
    const [k] = Object.keys(right);
    expect(check(q, { ...right, [k]: right[k] + 1 }).hint).toMatch(/de trop/);
    expect(check(q, { ...right, [k]: right[k] - 1 }).ok).toBe(false);
  });
});
