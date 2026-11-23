// « Entraîne-toi » of trouver-le-pgcd: the shared checks (authoring kit), then the lesson's own — every wrong reason of
// « Justifie » is FALSE, the questions hold the numbers they announce, the corrections chain at most three divisions,
// and no draw lands on a number of the road or of the mission.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeTrainer, valueOf } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { commonDivisors, euclid, gcd } from './math';
import { KNOWLEDGE } from './knowledge';
import { trainerEvidence } from './evidence';
import { PLAN_OF, RESERVED, answerLabel, check, solution, trainer } from './trainer';

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
  kinds: ['tap', 'tf', 'communs', 'lots', 'facteurs', 'euclide'],
});

/** Is a reason a TRUE equality « $x = y$ » (PGCDs and powers read by the kit's `valueOf`)? null when it is none. */
function holds(reason) {
  const eq = reason.match(/\$([^$]+)\$/);
  if (!eq) return null;
  const sides = eq[1].split('=').map((s) => valueOf(s));
  if (sides.length !== 2 || sides.some((v) => v == null)) return null;
  return sides[0] === sides[1];
}

describe('trouver-le-pgcd — its own trainer', () => {
  it('every wrong reason offered to « Justifie » is a FALSE equality; the verdicts are computed', () => {
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

  it('the exam questions hold what they announce, and no draw is a number of the road', () => {
    const seen = new Set();
    for (const q of all()) {
      seen.add(q.kind);
      // (a « facteurs » question's `a` is its PGCD, a small number: its A and B are the numbers it shows)
      for (const x of (q.kind === 'facteurs' ? [q.A, q.B] : [q.a, q.b]).filter((v) => v != null))
        expect(RESERVED.has(x), `${q.kind} ${x}`).toBe(false);
      if (q.kind === 'communs') {
        expect(q.list).toEqual(commonDivisors(q.a, q.b));
        expect(q.list).toHaveLength(6);
        expect(q.g).toBe(gcd(q.a, q.b));
        expect(q.a % q.b && q.b % q.a).toBeTruthy();
      }
      if (q.kind === 'lots') expect(q.g).toBe(gcd(q.a, q.b));
      if (q.kind === 'facteurs') {
        expect(q.a).toBe(gcd(q.A, q.B));
        expect(q.common.length).toBeLessThanOrEqual(3);
      }
      if (q.kind === 'euclide') {
        expect(q.g).toBe(gcd(q.a, q.b));
        // the correction chains three divisions (B26)
        expect(euclid(q.a, q.b)).toHaveLength(3);
      }
    }
    for (const k of ['communs', 'lots', 'facteurs', 'euclide']) expect(seen.has(k), k).toBe(true);
  });

  it('the misconceptions are refused with a hint that says what the answer gives', () => {
    for (const q of all(4)) {
      const right = solution(q);
      if (q.kind === 'communs') {
        // the difference of the two numbers for the PGCD
        const d = Math.abs(q.a - q.b);
        if (d !== q.g) expect(check(q, { ...right, g: d }).ok).toBe(false);
        expect(check(q, { ...right, c0: q.a }).hint).toMatch(/ne divise pas/);
      }
      if (q.kind === 'lots') {
        const small = commonDivisors(q.a, q.b).filter((n) => n > 1 && n < q.g)[0];
        if (small) expect(check(q, { n: small, x: q.a / small, y: q.b / small }).hint).toMatch(/davantage/);
      }
      if (q.kind === 'facteurs') {
        const [f] = q.common;
        expect(check(q, { ...right, [`e${f.p}`]: f.e + 1 }).hint).toMatch(/ne divise pas/);
      }
      if (q.kind === 'euclide') {
        const rows = euclid(q.a, q.b);
        expect(check(q, { ...right, g: rows.at(-1).q }).ok).toBe(false);
        expect(check(q, { ...right, r: right.r + q.b, q: right.q - 1 }).hint).toMatch(/pas plus petit/);
      }
    }
  });

  it('an exponent is typed RAISED after its printed prime: the kit’s power token, one answer of its line', () => {
    let n = 0;
    for (const q of all(5))
      if (q.kind === 'facteurs') {
        const [line] = q.form.lines;
        const pows = line.tokens.filter((t) => t?.pow);
        expect(pows.map((t) => Number(t.pow.base))).toEqual(q.primes);
        for (const t of pows) expect(t.pow.exp.num).toBe(`e${t.pow.base}`);
        expect(line.tokens.filter((t) => t?.num)).toEqual([]);
        n += 1;
      }
    expect(n).toBeGreaterThan(20);
  });
});
