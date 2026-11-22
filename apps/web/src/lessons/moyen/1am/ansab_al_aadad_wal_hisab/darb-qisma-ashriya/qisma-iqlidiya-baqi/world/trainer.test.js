import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
/** « 45 = 6 × 7 + 3 », « 6 × 8 = 48 »: every equality between numbers written in a sentence is true. */
function equalitiesHold(text) {
  let n = 0;
  for (const [, m] of String(text).matchAll(/\$([^$]+)\$/g)) {
    const e = m.replace(/\\times/g, '*');
    if (!/^[\d\s+\-*=]+$/.test(e) || !e.includes('=')) continue;
    const values = e.split('=').map((side) =>
      side
        .replace(/\s/g, '')
        .split(/(?=[+-])/)
        .reduce(
          (t, term) =>
            t +
            (term.startsWith('-') ? -1 : 1) *
              term
                .replace(/^[+-]/, '')
                .split('*')
                .reduce((p, x) => p * Number(x), 1),
          0,
        ),
    );
    expect(new Set(values).size, m).toBe(1);
    n += 1;
  }
  return n;
}

describe('« تدرّب » — the trainer of « القسمة الإقليدية »', () => {
  it('every card of the mind map has a plan', () => {
    expect(Object.keys(PLAN_OF).sort()).toEqual([...CARDS].sort());
  });

  it('every question accepts its own solution and refuses a wrong answer with a hint that is not the answer', () => {
    const kinds = new Set();
    for (const card of CARDS) {
      for (let seed = 1; seed <= 25; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 104729), card)) {
          kinds.add(q.kind);
          const right = solution(q);
          const res = check(q, right);
          expect(res.ok, `${card} ${q.kind} ${q.prompt}`).toBe(true);
          expect(res.fix, q.kind).toBeTruthy();
          clean(`${q.prompt} ${res.fix} ${answerLabel(q, right)}`);
          equalitiesHold(res.fix);
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
          if (['division', 'fix', 'dividend', 'problem'].includes(q.kind)) expect(ev, q.kind).toBeTruthy();
          expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
          // the dividends of the exam stop at three digits
          if (q.format === 'exam' && q.a != null) expect(q.a, q.prompt).toBeLessThanOrEqual(999);
        }
      }
    }
    expect([...kinds].sort()).toEqual(['dividend', 'division', 'fix', 'problem', 'tap', 'tf']);
  });

  it('every true / false is computed: its reason is an equality that holds, and its verdict is the arithmetic', () => {
    let checked = 0;
    let masala = 0;
    const exact = new Set();
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const card of ['kamila', 'asghar', 'musawat', 'taqdir', 'masala']) {
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card).filter((x) => x.kind === 'tf')) {
          checked += equalitiesHold(q.why);
          // the statement's own numbers decide its truth
          const nums = (q.statement.match(/\d+/g) ?? []).map(Number);
          if (/تلزم \d+ عربات ليعبر الجميع$/.test(q.statement)) {
            // « 52 مسافرًا في المحطّة، وكلّ عربة تحمل 8: تلزم 7 عربات ليعبر الجميع »
            const [a, b, said] = nums;
            expect(Math.ceil(a / b) === said, q.statement).toBe(q.truth);
            exact.add(a % b === 0);
            masala += 1;
          }
          // a wrong verdict is answered by what to compute for THIS statement — never « the remainder » for a bracketing
          expect(q.hint, q.statement).toBeTruthy();
          if (/محصور بين/.test(q.statement)) expect(q.hint).not.toMatch(/الباقي/);
          expect(check(q, { truth: !q.truth, reason: 0 }).hint).toBe(q.hint);
          if (q.reasons) {
            expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
            expect(new Set(q.reasons.map((r) => r.t)).size).toBe(3);
          }
          if (/^حاصل القسمة الإقليدية للعدد \d+ على \d+ هو \d+$/.test(q.statement)) {
            const [a, b, said] = nums;
            expect(Math.floor(a / b) === said, q.statement).toBe(q.truth);
          }
          if (/^المساواة/.test(q.statement)) {
            const [a, b, qq, r] = nums;
            expect(b * qq + r).toBe(a);
            expect(r < b, q.statement).toBe(q.truth);
          }
          if (/محصور بين/.test(q.statement)) {
            const [a, b, lo, hi] = nums;
            const quo = Math.floor(a / b);
            expect(quo >= lo && quo < hi, q.statement).toBe(q.truth);
          }
          if (/^في قسمة إقليدية/.test(q.statement)) {
            const [b, qq, r, a] = nums;
            expect(b * qq + r === a, q.statement).toBe(q.truth);
          }
          clean(q.statement);
          clean(q.why);
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
    // the station was asked with somebody left (one more cabin) AND with nobody left (the quotient itself)
    expect(masala).toBeGreaterThan(100);
    expect([...exact].sort()).toEqual([false, true]);
  });

  it('a problem asks ONE of three questions of the same division, with and without a leftover, on believable sizes', () => {
    const seen = new Set();
    const sizes = {};
    for (let seed = 1; seed <= 400; seed += 1)
      for (const q of trainer.makeSession(rng(seed * 613 + 5), 'masala').filter((x) => x.kind === 'problem')) {
        expect(q.key).toBe('baqi-fi-masala');
        expect(q.b * q.quo + q.r, q.prompt).toBe(q.a);
        expect(q.r >= 0 && q.r < q.b, q.prompt).toBe(true);
        expect(q.a >= 100 && q.a <= 999, q.prompt).toBe(true);
        seen.add(`${q.ask}:${q.r === 0 ? 'exact' : 'left'}`);
        // the answer is the number of the division its question reads
        const want = { full: q.quo, need: q.quo + (q.r > 0 ? 1 : 0), left: q.r }[q.ask];
        expect(solution(q).n, q.prompt).toBe(want);
        expect(q.prompt).toContain(q.words[q.ask]);
        expect(q.form.lines[1].tokens[0].text).toBe(q.words[q.ask]);
        // the same division, the two other questions: each a different answer of `check`
        for (const n of [q.quo, q.quo + 1, q.r])
          expect(check(q, { q: q.quo, r: q.r, n }).ok, q.prompt).toBe(n === want);
        clean(`${check(q, { q: q.quo, r: q.r, n: want + 1 }).hint} ${check(q, solution(q)).fix}`);
        equalitiesHold(check(q, solution(q)).fix);
        const kind = q.words.full;
        sizes[kind] ??= { b: [Infinity, 0], q: [Infinity, 0] };
        sizes[kind].b = [Math.min(sizes[kind].b[0], q.b), Math.max(sizes[kind].b[1], q.b)];
        sizes[kind].q = [Math.min(sizes[kind].q[0], q.quo), Math.max(sizes[kind].q[1], q.quo)];
      }
    expect([...seen].sort()).toEqual(['full:exact', 'full:left', 'left:left', 'need:exact', 'need:left']);
    // a bus has 28 to 52 seats and a trip 3 to 9 buses — never hundreds of pupils in buses of 12
    expect(Object.keys(sizes)).toHaveLength(5);
    const bus = sizes['عدد الحافلات الممتلئة'];
    expect(bus.b[0]).toBeGreaterThanOrEqual(28);
    expect(bus.b[1]).toBeLessThanOrEqual(52);
    expect(bus.q[1]).toBeLessThanOrEqual(9);
    for (const s of Object.values(sizes)) {
      expect(s.b[0]).toBeGreaterThanOrEqual(12); // a divisor of two digits: the quotient is estimated first
      expect(s.q[1]).toBeLessThanOrEqual(38);
    }
  });

  it('refuses the usual mistakes with their own reason', () => {
    // 347 = 8 × 43 + 3
    const div = { kind: 'division', a: 347, b: 8, quo: 43, r: 3 };
    expect(check(div, { q: 43, r: 3 }).ok).toBe(true);
    expect(check(div, { q: 42, r: 11 }).hint).toContain('ليس أصغر');
    expect(check(div, { q: 43, r: 5 }).hint).toContain('تحقّق');
    expect(verifyClaim(trainerEvidence({ ...div, format: 'exam', key: 'k' }, { q: 42, r: 11 }, FIRST).claim)).toBe(
      false,
    );
    // a written 94 = 8 × 10 + 14: true arithmetic, not the Euclidean division
    const fix = {
      kind: 'fix',
      a: 94,
      b: 8,
      quo: 11,
      r: 6,
      shown: { q: 10, r: 14 },
      form: { lines: [{ tokens: ['', { options: [] }] }] },
    };
    expect(8 * 10 + 14).toBe(94);
    expect(check(fix, { verdict: 'no', q: 11, r: 6 }).ok).toBe(true);
    expect(check(fix, { verdict: 'yes', q: 11, r: 6 }).ok).toBe(false);
    expect(check(fix, { verdict: 'calc', q: 11, r: 6 }).hint).toContain('الحساب صحيح');
    // the dividend: 12 × 25 + 9 = 309; the biggest remainder of a division by 12 is 11
    const dv = { kind: 'dividend', a: 309, b: 12, quo: 25, r: 9 };
    expect(check(dv, { a: 309, m: 11 }).ok).toBe(true);
    expect(check(dv, { a: 300, m: 11 }).hint).toContain('أضف الباقي');
    expect(check(dv, { a: 309, m: 12 }).ok).toBe(false);
    // 287 pupils, 45 seats a bus: 287 = 45 × 6 + 17 — 6 full buses, 7 needed, 17 pupils the full buses do not take
    const words = {
      full: 'عدد الحافلات الممتلئة',
      need: 'عدد الحافلات اللازمة لنقل كلّ التلاميذ',
      left: 'عدد التلاميذ الذين لا تسعهم الحافلات الممتلئة',
      another: 'حافلة أخرى',
    };
    const pb = { kind: 'problem', a: 287, b: 45, quo: 6, r: 17, ask: 'need', words };
    expect(45 * 6 + 17).toBe(287);
    expect(check(pb, { q: 6, r: 17, n: 7 }).ok).toBe(true);
    expect(check(pb, { q: 6, r: 17, n: 6 }).hint).toContain('17');
    expect(check(pb, { q: 6, r: 17, n: 6 }).hint).not.toContain('7 ');
    expect(check(pb, { q: 6, r: 17, n: 7 }).fix).toContain('$6 + 1 = 7$');
    const ev = trainerEvidence({ ...pb, format: 'exam', key: 'baqi-fi-masala' }, { q: 6, r: 17, n: 6 }, FIRST);
    expect(ev.claim).toEqual({ kind: 'fullNeeded', a: 287, b: 45, full: 6, need: 6 });
    expect(verifyClaim(ev.claim)).toBe(false);
    // nobody left: 270 = 45 × 6 + 0 — the quotient itself; one more bus would leave empty
    const exactPb = { ...pb, a: 270, r: 0 };
    expect(check(exactPb, { q: 6, r: 0, n: 6 }).ok).toBe(true);
    expect(check(exactPb, { q: 6, r: 0, n: 7 }).ok).toBe(false);
    expect(check(exactPb, { q: 6, r: 0, n: 7 }).hint).toContain('حافلة أخرى');
    expect(check(exactPb, { q: 6, r: 0, n: 6 }).fix).not.toContain('+ 1');
    // the same division, « how many are full » and « how many are left out »
    expect(check({ ...pb, ask: 'full' }, { q: 6, r: 17, n: 6 }).ok).toBe(true);
    expect(check({ ...pb, ask: 'full' }, { q: 6, r: 17, n: 7 }).ok).toBe(false);
    expect(check({ ...pb, ask: 'left' }, { q: 6, r: 17, n: 17 }).ok).toBe(true);
    expect(check({ ...pb, ask: 'left' }, { q: 6, r: 17, n: 6 }).ok).toBe(false);
    // the estimate's own exam question: a division by a number of two digits
    const big = trainer.makeSession(rng(77), 'taqdir').filter((x) => x.kind === 'division');
    expect(big).toHaveLength(2);
    for (const q of big) {
      expect(q.key).toBe('taqdir-hasil');
      expect(q.b).toBeGreaterThanOrEqual(12);
    }
  });
});
