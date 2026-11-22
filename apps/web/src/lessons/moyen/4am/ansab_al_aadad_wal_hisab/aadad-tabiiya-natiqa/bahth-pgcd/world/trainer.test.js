import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { differences, euclid, gcd } from './math';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM = ['farq', 'furuq', 'baqi', 'iqlidis', 'sura'];
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
const all = function* (seeds) {
  for (const card of CARDS)
    for (let seed = 1; seed <= seeds; seed += 1) for (const q of trainer.makeSession(rng(seed * 104729), card)) yield q;
};
/** Every « $x = y × z (+ r)$ », « $x - y = d$ », « $PGCD(x ; y) = g$ » and « $q + q + … = s$ » of a line is true. */
const trueEqualities = (t) => {
  for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
  for (const [, x, y, d] of t.matchAll(/\$(\d+) - (\d+) = (\d+)\$/g)) expect(Number(x) - Number(y), t).toBe(Number(d));
  for (const [, x, y, g] of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$/g))
    expect(gcd(Number(x), Number(y)), t).toBe(Number(g));
  for (const [, x, y, u, v] of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = \\mathrm\{PGCD\}\((\d+) ; (\d+)\)/g))
    expect(gcd(Number(x), Number(y)), t).toBe(gcd(Number(u), Number(v)));
  for (const [, sum, s] of t.matchAll(/\$((?:\d+ \+ )+\d+) = (\d+)\$/g))
    expect(
      sum.split(' + ').reduce((n, x) => n + Number(x), 0),
      t,
    ).toBe(Number(s));
};

describe('« تدرّب » — the trainer of « البحث عن القاسم المشترك الأكبر »', () => {
  it('a reason of « علّل » writes at most three divisions: the exam panel then keeps 12 px at 1024 × 768', () => {
    // 2026-11-19, this lesson's trainer walk: a reason that chained FIVE divisions (177 ; 135) took three lines, and the
    // panel shrank its text to 11.1 px to fit (defects.md B3)
    let most = 0;
    for (const q of all(40))
      for (const r of q.reasons ?? []) {
        const n = (r.t.match(/\\times/g) ?? []).length;
        most = Math.max(most, n);
        expect(n, r.t).toBeLessThanOrEqual(3);
      }
    expect(most).toBeGreaterThan(0);
  });

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
      if (['farq', 'furuq', 'baqi', 'iqlidis'].includes(q.kind)) expect(ev, q.kind).toBeTruthy();
      expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
    }
    expect([...kinds].sort()).toEqual([...EXAM, 'tap', 'tf'].sort());
  });

  it('every exam question is computed: the solution IS the arithmetic of its numbers, the pair fits its question', () => {
    const seen = {};
    for (const q of all(20)) {
      if (!EXAM.includes(q.kind)) continue;
      seen[q.kind] = (seen[q.kind] ?? 0) + 1;
      const { a, b } = q;
      const g = gcd(a, b);
      const s = solution(q);
      // never a pair where b divides a, never coprime: the algorithm has work to do and the PGCD is not 1
      expect(a % b !== 0 && g > 1 && b < a, `${a} ${b}`).toBe(true);
      const [first] = euclid(a, b);
      if (q.kind === 'farq') {
        expect(s).toEqual({ e: a - b, g });
        // b < a < 2b, and PGCD(b ; a − b) within reach: a − b is g or 2g
        expect(a - b < b && (a - b) / g <= 2, `${a} ${b}`).toBe(true);
      }
      if (q.kind === 'furuq') {
        expect(s).toEqual({ d: a - b, g });
        expect(a - b < b && differences(a, b).length <= 7, `${a} ${b}`).toBe(true);
      }
      if (q.kind === 'baqi') {
        expect(s).toEqual({ q: first.q, r: first.r, e: first.r });
        expect(first.q).toBeGreaterThanOrEqual(2); // the remainder is not the difference
        expect(gcd(b, first.r)).toBe(g);
      }
      if (q.kind === 'iqlidis') {
        expect(s).toEqual({ q: first.q, r: first.r, g });
        expect(euclid(a, b).length).toBeGreaterThanOrEqual(3);
      }
      if (q.kind === 'sura') {
        const [e, n] = [euclid(a, b).length, differences(a, b).length];
        expect(s).toEqual({ e, s: n, fast: 'euclid' });
        expect(n).toBe(euclid(a, b).reduce((t, x) => t + x.q, 0));
        expect(n).toBeGreaterThan(e);
      }
      // a line of the sheet holds at most three boxes (defects.md B17)
      for (const line of q.form.lines)
        expect(line.tokens.filter((t) => t && typeof t === 'object' && (t.num || t.choice)).length).toBeLessThanOrEqual(
          3,
        );
    }
    for (const k of EXAM) expect(seen[k], k).toBeGreaterThan(20);
  });

  it('refuses the usual mistakes with their own reason — and never calls a TRUE equality false', () => {
    // 152 and 95: PGCD(152 ; 95) = PGCD(95 ; 57) = 19
    const f = { kind: 'farq', format: 'exam', a: 152, b: 95 };
    expect(check(f, { e: 57, g: 19 }).ok).toBe(true);
    expect(check(f, { e: 56, g: 19 }).hint).toContain('$95 + 56 = 151$');
    // 247 = 152 + 95 makes a TRUE equality: it is told so, and asked for the difference
    expect(check(f, { e: 247, g: 19 }).hint).toContain('صحيحة، لكنّ المطلوب هنا الفرق');
    expect(check(f, { e: 19, g: 19 }).hint).toContain('صحيحة');
    // the difference itself is not the PGCD
    expect(check(f, { e: 57, g: 57 }).hint).toContain('$152 = 57 \\times 2 + 38$: 57 لا يقسم 152');
    expect(check(f, { e: 57, g: 0 }).hint).toContain('0 ليس قاسمًا');
    expect(check(f, { e: 57, g: 1 }).hint).toContain('1 قاسم مشترك فعلًا. هل هو الأكبر؟');
    expect(check(f, { e: 57, g: 152 }).hint).toContain('152 أكبر من 95');
    // the remainder, not the quotient; a remainder too big
    const r = { kind: 'baqi', format: 'exam', a: 962, b: 296 };
    expect(check(r, { q: 3, r: 74, e: 74 }).ok).toBe(true);
    expect(check(r, { q: 3, r: 74, e: 3 }).hint).toContain('لا تُكمَل بالعدد 3');
    expect(check(r, { q: 3, r: 74, e: 666 }).hint).toContain('صحيحة، لكنّ المطلوب هنا الباقي');
    expect(check(r, { q: 2, r: 370, e: 370 }).hint).toContain('الباقي 370 ليس أصغر من 296');
    expect(check(r, { q: 3, r: 70, e: 70 }).hint).toContain('$296 \\times 3 + 70 = 958$');
    // Euclid: the last quotient is not the PGCD
    const e = { kind: 'iqlidis', format: 'exam', a: 1833, b: 546 };
    expect(check(e, { q: 3, r: 195, g: 39 }).ok).toBe(true);
    expect(check(e, { q: 3, r: 195, g: 4 }).hint).toContain('$1833 = 4 \\times 458 + 1$');
    expect(check(e, { q: 3, r: 195, g: 13 }).hint).toContain('13 قاسم مشترك فعلًا');
    expect(answerLabel(e, { q: 3, r: 195, g: 39 })).toBe(
      '$1833 = 546 \\times 3 + 195$\u00a0، $\\mathrm{PGCD}(1833 ; 546) = 39$',
    );
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
    const flavours = new Set();
    for (const q of all(30)) {
      if (q.kind !== 'tf') continue;
      flavours.add(q.key);
      trueEqualities(q.why);
      // the verdict is the arithmetic of the statement
      const p = q.statement.match(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$$/);
      if (p) expect(gcd(Number(p[1]), Number(p[2])) === Number(p[3]), q.statement).toBe(q.truth);
      const s = q.statement.match(/PGCD\}\((\d+) ; (\d+)\) = \\mathrm\{PGCD\}\((\d+) ; (\d+)\)\$$/);
      if (s) expect(gcd(Number(s[1]), Number(s[2])) === gcd(Number(s[3]), Number(s[4])), q.statement).toBe(q.truth);
      const c = q.statement.match(/الفروق (\d+)، وعدد القسمات بخوارزمية إقليدس (\d+)/);
      if (c) {
        const [a, b] = q.statement
          .match(/PGCD\}\((\d+) ; (\d+)\)/)
          .slice(1)
          .map(Number);
        expect(Number(c[1]) === differences(a, b).length && Number(c[2]) === euclid(a, b).length, q.statement).toBe(
          q.truth,
        );
      }
      expect(Boolean(p || s || c), q.statement).toBe(true);
      if (!q.reasons) continue;
      expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      for (const r of q.reasons.filter((x) => !x.ok)) {
        expect(truthOf(r.t), `${q.statement} — ${r.t}`).toBe(false);
        reasons += 1;
      }
    }
    expect(reasons).toBeGreaterThan(150);
    expect(flavours.size).toBe(5);
  });
});
