import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { commonDivisors, divisorsOf, gcd } from './math';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
const all = function* (seeds) {
  for (const card of CARDS)
    for (let seed = 1; seed <= seeds; seed += 1) for (const q of trainer.makeSession(rng(seed * 104729), card)) yield q;
};

describe('« تدرّب » — the trainer of « القاسم المشترك الأكبر »', () => {
  it('every card of the mind map has a plan', () => {
    expect(Object.keys(PLAN_OF).sort()).toEqual([...CARDS].sort());
  });

  it('every question accepts its own solution and refuses a wrong answer with a hint that is not the answer', () => {
    const kinds = new Set();
    for (const q of all(25)) {
      kinds.add(q.kind);
      const right = solution(q);
      const res = check(q, right);
      expect(res.ok, `${q.kind} ${q.prompt}`).toBe(true);
      expect(res.fix, q.kind).toBeTruthy();
      clean(`${q.prompt} ${res.fix} ${answerLabel(q, right)}`);
      const bad =
        q.kind === 'tap'
          ? q.wave.gates.find((n) => n !== right)
          : q.kind === 'tf'
            ? { truth: !q.truth, reason: 0 }
            : {};
      const no = check(q, bad);
      expect(no.ok, `${q.kind} wrong`).toBe(false);
      expect(no.hint, q.kind).toBeTruthy();
      // an exam answer that counts is a claim the server can re-compute, with the same verdict
      const ev = trainerEvidence(q, right, FIRST);
      if (ev) expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
      if (['commonList', 'nestList', 'pgcd', 'bouquets'].includes(q.kind)) expect(ev, q.kind).toBeTruthy();
      expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
    }
    expect([...kinds].sort()).toEqual(['bouquets', 'commonList', 'nestList', 'pgcd', 'tap', 'tf']);
  });

  it('every exam question is computed: the solution IS the arithmetic of its numbers', () => {
    for (const q of all(20)) {
      if (q.kind === 'commonList' || q.kind === 'nestList') {
        expect(q.g).toBe(gcd(q.a, q.b));
        expect(Object.values(solution(q))).toEqual(commonDivisors(q.a, q.b));
        expect(divisorsOf(q.g)).toHaveLength(6); // six boxes, no more, no less
      }
      if (q.kind === 'pgcd') expect(solution(q).g).toBe(gcd(q.a, q.b));
      if (q.kind === 'bouquets') {
        const { n, x, y } = solution(q);
        expect([n, n * x, n * y, gcd(x, y)]).toEqual([gcd(q.a, q.b), q.a, q.b, 1]);
      }
      if (q.kind === 'tf') {
        clean(q.statement);
        clean(q.why);
        // every « $x = y \times z$ » or « $x = y \times z + r$ » of the reason is true
        for (const [, lhs, rhs] of q.why.matchAll(/\$(\d+) = ([\d\s\\a-z+]+)\$/g)) {
          const v = rhs
            .replace(/\\times/g, '*')
            .split('+')
            .reduce((t, term) => t + term.split('*').reduce((p, s) => p * Number(s), 1), 0);
          expect(v, q.why).toBe(Number(lhs));
        }
        // the verdict is the arithmetic of the statement
        const m = q.statement.match(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$$/);
        if (m) expect(gcd(Number(m[1]), Number(m[2])) === Number(m[3]), q.statement).toBe(q.truth);
        const c = q.statement.match(/^(\d+) قاسم مشترك للعددين (\d+) و (\d+)$/);
        if (c) expect(Number(c[2]) % Number(c[1]) === 0 && Number(c[3]) % Number(c[1]) === 0).toBe(q.truth);
      }
    }
  });

  it('refuses the usual mistakes with their own reason', () => {
    // PGCD(198 ; 234) = 18: 6 is common but not the greatest
    const p = { kind: 'pgcd', a: 198, b: 234, g: 18 };
    expect(check(p, { g: 18 }).ok).toBe(true);
    // the hint says that 33 and 39 still share a divisor — never which one (3 would give 6 × 3 = 18 away)
    expect(check(p, { g: 6 }).hint).toContain('يشتركان بعد في قاسم غير 1');
    expect(check(p, { g: 6 }).hint).not.toMatch(/القاسم 3|\b18\b/);
    expect(check(p, { g: 11 }).hint).toContain('234 = 11 \\times 21 + 3');
    // 40 roses and 56 lilies: 8 bouquets of 5 and 7
    const b = { kind: 'bouquets', a: 40, b: 56, g: 8, p: 5, q: 7 };
    expect(check(b, { n: 8, x: 5, y: 7 }).ok).toBe(true);
    expect(check(b, { n: 4, x: 10, y: 14 }).hint).toContain('أكبر عدد');
    expect(check(b, { n: 5, x: 8, y: 7 }).hint).toContain('تبقى زنابق');
    expect(check(b, { n: 8, x: 7, y: 5 }).ok).toBe(false);
    // the common divisors of 204 and 228 = the divisors of 12
    const l = { kind: 'nestList', a: 204, b: 228, g: 12 };
    const list = (xs) => Object.fromEntries(xs.map((x, i) => [`c${i}`, x]));
    expect(check(l, list([12, 6, 4, 3, 2, 1])).ok).toBe(true);
    expect(check(l, list([1, 2, 3, 4, 6, 17])).hint).toContain('17 يقسم 204');
    expect(check(l, list([1, 2, 3, 4, 6])).hint).toContain('ينقص 1');
    expect(check(l, list([1, 2, 2, 4, 6, 12])).hint).toContain('مرّتين');
    expect(
      verifyClaim(trainerEvidence({ ...l, format: 'exam', key: 'k' }, list([1, 2, 3, 4, 6, 17]), FIRST).claim),
    ).toBe(false);
    expect(trainerEvidence({ ...p, format: 'exam', key: 'al-akbar' }, { g: 18 }, FIRST).claim).toEqual({
      kind: 'pgcd',
      a: 198,
      b: 234,
      g: 18,
    });
    // a sharing that works but is not the most: « 4 يصلح », with no « باقتان ممكنة » agreement to get wrong
    expect(check(b, { n: 2, x: 20, y: 28 }).hint).toContain('2 يصلح عددًا للباقات');
    expect(answerLabel(b, { n: 8, x: 5, y: 7 })).toBe('عدد الباقات 8، في كلّ باقة 5 من الورود و 7 من الزنابق');
  });
  it('« صحيح أم خطأ؟ علّل »: the verdict is the arithmetic, the right reason is true, every other reason is FALSE', () => {
    /** The truth of a reason the trainer writes: its equalities, « n يقسم x », « n لا يقسم x », « n يقسم x و y معًا ». */
    const truthOf = (t) => {
      const eq = [...t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g)];
      if (eq.length) return eq.every(([, x, n, k, r]) => Number(n) * Number(k) + Number(r ?? 0) === Number(x));
      let m = t.match(/^لأنّ (\d+) يقسم (\d+) ولا يقسم (\d+)$/);
      if (m) return Number(m[2]) % Number(m[1]) === 0 && Number(m[3]) % Number(m[1]) !== 0;
      m = t.match(/^لأنّ (\d+) يقسم (\d+) و (\d+) معًا$/);
      if (m) return Number(m[2]) % Number(m[1]) === 0 && Number(m[3]) % Number(m[1]) === 0;
      m = t.match(/^لأنّ (\d+) لا يقسم (\d+)$/);
      if (m) return Number(m[2]) % Number(m[1]) !== 0;
      m = t.match(/^لأنّ (\d+) يقسم (\d+)$/);
      if (m) return Number(m[2]) % Number(m[1]) === 0;
      m = t.match(/^لأنّ (\d+) أصغر قاسم مشترك للعددين (\d+) و (\d+)$/);
      if (m) return Number(m[1]) === 1;
      return null;
    };
    let reasons = 0;
    for (const q of all(30)) {
      if (q.kind !== 'tf' || !q.reasons) continue;
      expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      for (const r of q.reasons.filter((x) => !x.ok)) {
        expect(truthOf(r.t), `${q.statement} — ${r.t}`).toBe(false);
        reasons += 1;
      }
      // the statement of a bouquet sharing never puts a counted noun after a number it does not agree with
      expect(q.statement).not.toMatch(/باقتان|(?:^|\s)([3-9]|10) (?:وردة|زنبقة|باقة)/);
    }
    expect(reasons).toBeGreaterThan(200);
  });
});
