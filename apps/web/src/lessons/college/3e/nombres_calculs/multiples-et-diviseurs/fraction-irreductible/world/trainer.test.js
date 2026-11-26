// « Entraîne-toi » of fraction-irreductible: the shared checks (authoring kit), then the lesson's own — the questions hold
// the numbers they announce, the fractions given are irreducible where the lesson says so, the hints refuse the
// misconceptions without giving the answer, and no draw lands on a number of the road or of the mission.
import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { describeTrainer } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { gcd } from './math';
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
  kinds: ['tap', 'barrer', 'verdict', 'diviser', 'calcul'],
});

describe('fraction-irreductible — its own trainer', () => {
  it('the exam questions hold what they announce, and no draw is a number of the road', () => {
    const seen = new Set();
    for (const q of all()) {
      seen.add(q.kind);
      for (const x of [q.a, q.b, q.A, q.B].filter((v) => v != null))
        expect(RESERVED.has(x), `${q.kind} ${x}`).toBe(false);
      if (q.kind === 'barrer') {
        expect(gcd(q.a, q.b)).toBeGreaterThan(1);
        expect(q.prompt).toContain('\\times');
        // the decompositions printed hold the values
        const [da, db] = [...q.prompt.matchAll(/\$([^$]+) = ([^$]+)\$/g)].map((m) => m[2]);
        const value = (t) =>
          t
            .replace(/\\,/g, '')
            .split('\\times')
            .reduce(
              (v, f) => v * (f.includes('^') ? Number(f.split('^')[0]) ** Number(f.match(/\{(\d+)\}/)[1]) : Number(f)),
              1,
            );
        expect([value(da), value(db)]).toEqual([q.a, q.b]);
      }
      if (q.kind === 'verdict') expect([1, 7, 11, 13, 17, 19]).toContain(gcd(q.a, q.b));
      if (q.kind === 'diviser') expect(gcd(q.a, q.b)).toBeGreaterThanOrEqual(12);
      if (q.kind === 'calcul') {
        expect(gcd(q.x, q.y)).toBe(1);
        expect(gcd(q.z, q.w)).toBe(1);
        expect(gcd(q.A, q.B)).toBeGreaterThan(1);
        expect(q.A).toBeLessThan(q.B);
        if (q.op === '+') expect(q.y).not.toBe(q.w);
        expect(q.op === '+' ? q.x * q.w + q.z * q.y : q.x * q.z).toBe(q.A);
        expect(q.y * q.w).toBe(q.B);
      }
    }
    for (const k of ['barrer', 'verdict', 'diviser', 'calcul']) expect(seen.has(k), k).toBe(true);
  });

  it('the misconceptions are refused with a hint that says what the answer gives', () => {
    for (const q of all(4)) {
      const right = solution(q);
      if (q.kind === 'barrer') {
        // one common prime struck only: equal, but not finished
        const p = [2, 3, 5, 7, 11, 13, 17, 19].find((d) =>
          right.p % d === 0 ? false : q.a % d === 0 && q.b % d === 0,
        );
        if (p) {
          const res = check(q, { p: q.a / p, q: q.b / p });
          if (gcd(q.a / p, q.b / p) > 1) expect(res.hint).toMatch(/encore avec des nombres plus petits/);
        }
        expect(check(q, { p: right.p, q: q.b }).hint).toMatch(/n’est pas égal/);
      }
      if (q.kind === 'verdict') {
        const wrong = { ...right, verdict: right.verdict === 'irr' ? 'red' : 'irr' };
        expect(check(q, wrong).hint).toMatch(/Compare/);
        expect(check(q, { ...right, g: right.g + 1 }).ok).toBe(false);
      }
      if (q.kind === 'diviser') {
        // the term not divided
        expect(check(q, { ...right, q: q.b }).ok).toBe(false);
        expect(check(q, { ...right, g: right.g + 1 }).hint).toBeTruthy();
      }
      if (q.kind === 'calcul') {
        // the denominators added, the numerators added across, the result left as it is
        expect(check(q, { ...right, t: q.y + q.w }).ok).toBe(false);
        expect(check(q, { ...right, p: right.s, q: right.t }).hint).toMatch(/encore avec des nombres plus petits/);
      }
    }
  });

  it('a wrong verdict is never « Bravo »: refused with a hint, whatever order its two options are drawn in', () => {
    // 2026-11-26 walk, question 5 (176/297, PGCD 11): a « wrong » verdict was accepted. The cause was the walk (it picked
    // « another option » by words against ids, and drew the right one); this pins the trainer's side for every draw.
    const orders = new Set();
    let n = 0;
    for (const q of all(30)) {
      if (q.kind !== 'verdict') continue;
      const right = solution(q);
      const choice = q.form.lines.flatMap((l) => l.tokens).find((t) => t?.choice === 'verdict');
      orders.add(choice.options.map((o) => o.value).join());
      // the words on screen name the verdict the solution gives
      expect(choice.options.map((o) => o.text).sort()).toEqual(['irréductible', 'réductible']);
      expect(choice.options.find((o) => o.value === right.verdict).text).toBe(
        gcd(q.a, q.b) === 1 ? 'irréductible' : 'réductible',
      );
      expect(check(q, right).ok).toBe(true);
      for (const o of choice.options.filter((x) => x.value !== right.verdict)) {
        const res = check(q, { ...right, verdict: o.value });
        expect(res.ok, `${q.a}/${q.b} judged « ${o.text} »`).toBe(false);
        expect(res.hint).toBeTruthy();
        expect(res.hint).not.toMatch(/Bravo|faux|Faux/);
      }
      n += 1;
    }
    expect(n).toBeGreaterThan(20);
    expect(orders.size).toBe(2);
  });

  it('a typed fraction is ONE answer of its line: the fraction template, never two loose boxes', () => {
    let n = 0;
    for (const q of all(5))
      for (const l of q.form?.lines ?? [])
        for (const t of l.tokens.filter((x) => x?.frac)) {
          expect(typeof t.frac.n === typeof t.frac.d).toBe(true);
          n += 1;
        }
    expect(n).toBeGreaterThan(50);
  });
});
