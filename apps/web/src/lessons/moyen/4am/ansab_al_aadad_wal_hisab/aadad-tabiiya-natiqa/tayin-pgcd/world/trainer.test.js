import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF, thirdOf } from './trainer';
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
/** Every « $x = y \times z$ » or « $x = y \times z + r$ » of a line is true. */
const trueEqualities = (t) => {
  for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
};

describe('« تدرّب » — the trainer of « تعيين القاسم المشترك الأكبر »', () => {
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
      trueEqualities(res.fix);
      expect(res.fix).not.toMatch(/\d ،/); // lists joined with a no-break space before the comma
      const bad =
        q.kind === 'tap'
          ? q.wave.gates.find((n) => n !== right)
          : q.kind === 'tf'
            ? { truth: !q.truth, reason: 0 }
            : {};
      const no = check(q, bad);
      expect(no.ok, `${q.kind} wrong`).toBe(false);
      expect(no.hint, q.kind).toBeTruthy();
      const ev = trainerEvidence(q, right, FIRST);
      if (ev) expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
      if (['hasr', 'direct', 'yaqsim'].includes(q.kind)) expect(ev, q.kind).toBeTruthy();
      expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
    }
    expect([...kinds].sort()).toEqual(['direct', 'hasr', 'tap', 'tf', 'yaqsim']);
  });

  it('every exam question is computed: the solution IS the arithmetic of its numbers', () => {
    let swaps = 0;
    for (const q of all(20)) {
      if (q.kind === 'hasr') {
        expect(q.g).toBe(gcd(q.a, q.b));
        const s = solution(q);
        expect(Array.from({ length: q.na }, (_, i) => s[`x${i}`])).toEqual(divisorsOf(q.a));
        expect(Array.from({ length: q.nb }, (_, i) => s[`y${i}`])).toEqual(divisorsOf(q.b));
        // never the third key's case, never coprime: the lists are needed and the PGCD is neither 1 nor the smaller
        expect(q.g > 1 && Math.max(q.a, q.b) % Math.min(q.a, q.b) !== 0, `${q.a} ${q.b}`).toBe(true);
        expect(Math.max(q.na, q.nb)).toBeLessThanOrEqual(6);
      }
      if (q.kind === 'direct') {
        expect(solution(q)).toEqual({ s: q.a, z: q.a, o: thirdOf(q).g });
        expect(q.zero).toContain(0);
        if (q.third.kind === 'swap') {
          swaps += 1;
          expect(q.third.given).toBe(gcd(...q.third.pair));
        } else expect(q.third.pair).toContain(1);
      }
      if (q.kind === 'yaqsim') expect([q.b * q.k, solution(q).g]).toEqual([q.a, gcd(q.a, q.b)]);
    }
    expect(swaps).toBeGreaterThan(5);
  });

  it('refuses the usual mistakes with their own reason', () => {
    // 20 and 30: lists 1, 2, 4, 5, 10, 20 and 1, 2, 3, 5, 6, 10, 15, 30 — too many boxes for the plan: take 20 and 28
    const h = { kind: 'hasr', a: 20, b: 28, na: 6, nb: 6, g: 4 };
    const right = solution(h);
    expect(check(h, right).ok).toBe(true);
    expect(commonDivisors(20, 28)).toEqual([1, 2, 4]);
    expect(check(h, { ...right, g: 2 }).hint).toContain('2 قاسم مشترك فعلًا. هل هو الأكبر؟');
    expect(check(h, { ...right, g: 5 }).hint).toContain('$28 = 5 \\times 5 + 3$');
    expect(check(h, { ...right, x5: 3 }).hint).toContain('$20 = 3 \\times 6 + 2$');
    expect(check(h, { ...right, x5: 1 }).hint).toContain('مرّتين');
    expect(check(h, { ...right, y0: '' }).hint).toContain('املأ كلّ الخانات');
    // PGCD(a ; 0) = a, never 0
    const d = { kind: 'direct', a: 300, zero: [0, 300], third: { kind: 'one', pair: [300, 1] } };
    expect(check(d, { s: 300, z: 300, o: 1 }).ok).toBe(true);
    expect(check(d, { s: 300, z: 0, o: 1 }).hint).toContain('0 ليس قاسمًا لأيّ عدد');
    expect(check(d, { s: 300, z: 150, o: 1 }).hint).toContain('هل يوجد قاسم للعدد 300 أكبر من 150؟');
    expect(check(d, { s: 300, z: 300, o: 300 }).hint).toContain('ما قواسم العدد 1؟');
    expect(check(d, { s: 600, z: 300, o: 1 }).hint).toContain('600 أكبر من 300');
    // b divides a: k first, then the PGCD
    const y = { kind: 'yaqsim', a: 76, b: 19, k: 4 };
    expect(check(y, { k: 4, g: 19 }).ok).toBe(true);
    expect(check(y, { k: 3, g: 19 }).hint).toContain('$19 \\times 3 = 57$');
    expect(check(y, { k: 4, g: 4 }).hint).toContain('4 يقسم 76، لكن $19 = 4 \\times 4 + 3$');
    expect(check(y, { k: 4, g: 1 }).hint).toContain('1 قاسم مشترك فعلًا. هل هو الأكبر؟');
    expect(check(y, { k: 4, g: 76 }).hint).toContain('76 أكبر من 19');
    expect(answerLabel(y, { k: 4, g: 19 })).toBe('$76 = 19 \\times 4$\u00a0، $\\mathrm{PGCD}(76 ; 19) = 19$');
  });

  it('« صحيح أم خطأ؟ علّل »: the verdict is the arithmetic, the right reason is true, every other reason is FALSE', () => {
    /** The truth of a reason the trainer writes: its equalities, « n يقسم x », « n لا يقسم x ». */
    const truthOf = (t) => {
      const eq = [...t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g)];
      if (eq.length) return eq.every(([, x, n, k, r]) => Number(n) * Number(k) + Number(r ?? 0) === Number(x));
      let m = t.match(/^لأنّ (\d+) لا يقسم (\d+)$/);
      if (m) return Number(m[2]) % Number(m[1]) !== 0;
      m = t.match(/^لأنّ (\d+) يقسم (\d+)$/);
      if (m) return Number(m[2]) % Number(m[1]) === 0;
      return null;
    };
    let reasons = 0;
    for (const q of all(30)) {
      if (q.kind !== 'tf') continue;
      trueEqualities(q.why);
      // the verdict is the arithmetic of the statement
      const p = q.statement.match(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$$/);
      if (p) expect(gcd(Number(p[1]), Number(p[2])) === Number(p[3]), q.statement).toBe(q.truth);
      const s = q.statement.match(/PGCD\}\((\d+) ; (\d+)\) = \\mathrm\{PGCD\}\((\d+) ; (\d+)\)\$$/);
      if (s) expect(q.truth).toBe(true);
      if (!q.reasons) continue;
      expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      for (const r of q.reasons.filter((x) => !x.ok)) {
        expect(truthOf(r.t), `${q.statement} — ${r.t}`).toBe(false);
        reasons += 1;
      }
    }
    expect(reasons).toBeGreaterThan(150);
  });
});

describe('the exam sheet of a list question holds on its lines', () => {
  // 2026-11-19 (walks): the sheet beside the knowledge map holds three boxes a line at 1024 × 768 — a list of more is
  // written on two lines, and no box is left alone on a line the template did not draw
  it('no line of a « hasr » sheet holds more than three boxes, and every divisor has its box', () => {
    let seen = 0;
    for (const q of all(40)) {
      if (q.kind !== 'hasr') continue;
      seen += 1;
      const boxes = q.form.lines.map((l) => l.tokens.filter((t) => t && typeof t === 'object' && t.num).length);
      expect(Math.max(...boxes), `${q.a} ; ${q.b}`).toBeLessThanOrEqual(3);
      expect(boxes.reduce((s, n) => s + n, 0)).toBe(divisorsOf(q.a).length + divisorsOf(q.b).length + 1);
    }
    expect(seen).toBeGreaterThan(20);
  });
});
