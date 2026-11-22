import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';
import { RULES, euclid, gcd } from './math';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const EXAM = ['hukm', 'burhan', 'shahid', 'nafi'];
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
const all = function* (seeds) {
  for (const card of CARDS)
    for (let seed = 1; seed <= seeds; seed += 1) for (const q of trainer.makeSession(rng(seed * 104729), card)) yield q;
};
/** Every « $x = y × z (+ r)$ » and « $PGCD(x ; y) = g$ » of a line is true. */
const trueEqualities = (t) => {
  for (const [, x, y, z, r] of t.matchAll(/\$(\d+) = (\d+) \\times (\d+)(?: \+ (\d+))?\$/g))
    expect(Number(y) * Number(z) + Number(r ?? 0), t).toBe(Number(x));
  for (const [, x, y, g] of t.matchAll(/PGCD\}\((\d+) ; (\d+)\) = (\d+)\$/g))
    expect(gcd(Number(x), Number(y)), t).toBe(Number(g));
};
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

describe('« تدرّب » — the trainer of « العددان الأوّليّان فيما بينهما »', () => {
  it('every generated sentence is bounded: a reason or a correction chains at most five divisions, a reason three', () => {
    let most = 0;
    for (const q of all(40)) {
      for (const r of q.reasons ?? []) {
        const n = (r.t.match(/\\times/g) ?? []).length;
        most = Math.max(most, n);
        expect(n, r.t).toBeLessThanOrEqual(3);
      }
      const fix = check(q, solution(q)).fix;
      expect((fix.match(/\\times/g) ?? []).length, fix).toBeLessThanOrEqual(5);
      expect([...fix].length, fix).toBeLessThanOrEqual(260);
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
      if (EXAM.includes(q.kind)) expect(ev, q.kind).toBeTruthy();
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
      expect(a % b !== 0 && b < a, `${a} ${b}`).toBe(true);
      const steps = euclid(a, b);
      if (q.kind === 'hukm') {
        expect(s).toEqual({ g, verdict: g === 1 ? 'yes' : 'no' });
        expect(a).toBeLessThanOrEqual(99);
      }
      if (q.kind === 'burhan') {
        expect(g, `${a} ${b}`).toBe(1);
        expect(s).toEqual({ q: steps[0].q, r: steps[0].r, g: 1 });
        expect(steps.length).toBeGreaterThanOrEqual(3);
      }
      if (q.kind === 'nafi') {
        expect(g, `${a} ${b}`).toBeGreaterThan(1);
        // the witness hides: no plank of the rules divides both — only the PGCD shows it
        expect(
          RULES.some((r) => a % r === 0 && b % r === 0),
          `${a} ${b}`,
        ).toBe(false);
        expect(s).toEqual({ q: steps[0].q, r: steps[0].r, g });
      }
      if (q.kind === 'shahid') {
        expect(g, `${a} ${b}`).toBeGreaterThan(1);
        // a witness among the rules' planks: provable « دون حساب »
        expect(
          RULES.some((r) => a % r === 0 && b % r === 0),
          `${a} ${b}`,
        ).toBe(true);
        expect([a % s.d, b % s.d, s.d > 1]).toEqual([0, 0, true]);
      }
      // a line of the sheet holds at most three boxes (defects.md B17)
      for (const line of q.form.lines)
        expect(line.tokens.filter((t) => t && typeof t === 'object' && (t.num || t.choice)).length).toBeLessThanOrEqual(
          3,
        );
    }
    for (const k of EXAM) expect(seen[k], k).toBeGreaterThan(20);
    // both verdicts are asked by « hukm »
    const verdicts = new Set([...all(20)].filter((q) => q.kind === 'hukm').map((q) => gcd(q.a, q.b) === 1));
    expect(verdicts.size).toBe(2);
  });

  it('refuses the usual mistakes with their own reason', () => {
    // 85 and 119: no rule's plank, but 17
    const h = { kind: 'hukm', format: 'exam', a: 119, b: 85 };
    expect(check(h, { g: 17, verdict: 'no' }).ok).toBe(true);
    expect(check(h, { g: 1, verdict: 'yes' }).hint).toContain('1 قاسم مشترك فعلًا. هل هو الأكبر؟');
    expect(check(h, { g: 17, verdict: 'yes' }).hint).toContain('قارن القاسم المشترك الأكبر الذي وجدته، 17، بالعدد 1');
    expect(check(h, { g: 17 }).hint).toContain('اختر الحكم');
    // the witness: 1 proves nothing, a number that divides one only
    const w = { kind: 'shahid', format: 'exam', a: 645, b: 410 };
    expect(check(w, { d: 5 }).ok).toBe(true);
    expect(check(w, { d: 5 }).fix).toContain('$645 = 5 \\times 129$ و $410 = 5 \\times 82$');
    expect(check(w, { d: 1 }).hint).toContain('1 يقسم كلّ عدد طبيعي: لا يثبت شيئًا');
    expect(check(w, { d: 3 }).hint).toContain('3 يقسم 645، لكن $410 = 3 \\times 136 + 2$');
    expect(check(w, { d: 2 }).hint).toContain('$645 = 2 \\times 322 + 1$: 2 لا يقسم 645');
    expect(check(w, { d: 0 }).hint).toContain('0 ليس قاسمًا');
    // the proof: the last remainder 0 is not the PGCD
    const p = { kind: 'burhan', format: 'exam', a: 35, b: 26 };
    expect(check(p, { q: 1, r: 9, g: 1 }).ok).toBe(true);
    expect(check(p, { q: 1, r: 9, g: 0 }).hint).toContain('0 ليس قاسمًا');
    expect(check(p, { q: 1, r: 8, g: 1 }).hint).toContain('$26 \\times 1 + 8 = 34$');
    expect(check(p, { q: 1, r: 9, g: 1 }).fix).toContain('العددان 35 و 26 أوّليّان فيما بينهما');
    expect(answerLabel(w, { d: 5 })).toBe('قاسم مشترك يختلف عن 1: 5');
  });

  it('« صحيح أم خطأ؟ علّل »: the verdict is the arithmetic, the right reason is true, every other reason is FALSE', () => {
    let reasons = 0;
    const flavours = new Set();
    let trap = 0;
    for (const q of all(30)) {
      if (q.kind !== 'tf') continue;
      flavours.add(q.key);
      trueEqualities(q.why);
      // the verdict is the arithmetic of what the statement says
      expect(q.truth, q.statement).toBe(q.says === 'coprime' ? gcd(q.a, q.b) === 1 : gcd(q.a, q.b) !== 1);
      expect(q.statement).toContain(String(q.a));
      expect(q.statement).toContain(String(q.b));
      if (/لا يقسم أيّ من/.test(q.statement)) {
        trap += 1;
        expect(q.truth, q.statement).toBe(false);
        expect(
          RULES.some((r) => q.a % r === 0 && q.b % r === 0),
          q.statement,
        ).toBe(false);
      }
      if (!q.reasons) continue;
      expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
      for (const r of q.reasons.filter((x) => !x.ok)) {
        expect(truthOf(r.t), `${q.statement} — ${r.t}`).toBe(false);
        reasons += 1;
      }
    }
    expect(reasons).toBeGreaterThan(150);
    expect(flavours.size).toBe(3);
    expect(trap).toBeGreaterThan(10);
  });
});
