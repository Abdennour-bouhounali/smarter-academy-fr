import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);
const EXAM_KINDS = ['division', 'bracket', 'exact', 'needed'];

describe('« تدرّب » — the trainer of « القسمة الإقليدية وحصر حاصل القسمة »', () => {
  it('every card of the mind map has a plan, among four families', () => {
    expect(Object.keys(PLAN_OF).sort()).toEqual([...CARDS].sort());
    expect(new Set(Object.values(PLAN_OF))).toEqual(new Set(['ay', 'hasr', 'zero', 'mix']));
  });

  it('every question accepts its own solution and refuses a wrong answer with a hint that is not the answer', () => {
    const kinds = new Set();
    const divisors = { two: 0, three: 0 };
    let digits = 0;
    for (const card of CARDS) {
      for (let seed = 1; seed <= 25; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 104729), card)) {
          kinds.add(q.kind);
          const right = solution(q);
          const res = check(q, right);
          expect(res.ok, `${card} ${q.kind} ${q.prompt}`).toBe(true);
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
          if (EXAM_KINDS.includes(q.kind)) expect(verifyClaim(ev.claim), `${q.kind} claim`).toBe(true);
          else expect(ev).toBe(null);
          expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
          // the numbers of a paper question: a dividend of four digits, a divisor of two digits or THREE
          if (EXAM_KINDS.includes(q.kind) && q.kind !== 'needed') {
            expect(String(q.a)).toHaveLength(4);
            expect(q.b).toBeGreaterThanOrEqual(13);
            expect(q.b).toBeLessThanOrEqual(399);
            divisors[q.b >= 100 ? 'three' : 'two'] += 1;
          }
          // « one digit with a divisor of three digits »: the estimate of the first key, standing still
          if (q.kind === 'tap' && q.wave.long) {
            digits += 1;
            expect(String(q.wave.b)).toHaveLength(3);
            expect(q.wave.q).toBeLessThanOrEqual(9);
            expect([...q.wave.gates].sort((x, y) => x - y)).toEqual([q.wave.q - 1, q.wave.q, q.wave.q + 1]);
          }
        }
      }
    }
    expect([...kinds].sort()).toEqual(['bracket', 'division', 'exact', 'needed', 'tap', 'tf']);
    // what the lesson adds to the first year is asked about as often as what it recalls
    expect(divisors.three).toBeGreaterThan(200);
    expect(divisors.two).toBeGreaterThan(200);
    expect(digits).toBeGreaterThan(100);
  });

  it('every true / false is computed: the equalities of its reason hold, and its verdict is the arithmetic', () => {
    const value = (rhs) =>
      rhs
        .replace(/\\times/g, '*')
        .split('+')
        .reduce((t, term) => t + term.split('*').reduce((p, x) => p * Number(x), 1), 0);
    let equalities = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const card of ['taqdir', 'hasr', 'inidam']) {
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card).filter((x) => x.kind === 'tf')) {
          for (const [, lhs, rhs] of `${q.statement} ${q.why}`.matchAll(/\$(\d+) = ([\d\s\\a-z+]+)\$/g)) {
            expect(value(rhs), q.why).toBe(Number(lhs));
            equalities += 1;
          }
          // « q < a ÷ b < q + 1 » said true only when it is
          const m = q.statement.match(/^\$(\d+) < (\d+) \\div (\d+) < (\d+)\$$/);
          if (m) {
            const [lo, a, b, hi] = m.slice(1).map(Number);
            expect(lo < a / b && a / b < hi, q.statement).toBe(q.truth);
          }
          clean(q.statement);
          clean(q.why);
        }
      }
    }
    expect(equalities).toBeGreaterThan(100);
  });

  it('« علّل »: three reasons made for the statement, ONE proves it, and it is not recognisable by its form', () => {
    const wrongSeen = new Set();
    let shown = 0;
    let rightWithFormula = 0;
    let rightWithout = 0;
    for (let seed = 1; seed <= 300; seed += 1) {
      for (const card of ['taqdir', 'hasr', 'inidam']) {
        for (const q of trainer.makeSession(rng(seed * 53 + 11), card).filter((x) => x.kind === 'tf' && x.reasons)) {
          shown += 1;
          expect(q.reasons).toHaveLength(3);
          expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
          expect(new Set(q.reasons.map((r) => r.t)).size).toBe(3);
          const right = q.reasons.find((r) => r.ok);
          const wrong = q.reasons.filter((r) => !r.ok);
          for (const r of q.reasons) {
            expect(r.t.startsWith('لأنّ ')).toBe(true);
            clean(r.t);
          }
          // the right reason is never the only one that carries a calculation — nor the only one without
          const has = (r) => r.t.includes('$');
          if (has(right)) {
            rightWithFormula += 1;
            expect(wrong.some(has), `${q.statement} | ${q.reasons.map((r) => r.t).join(' | ')}`).toBe(true);
          } else {
            rightWithout += 1;
            expect(
              wrong.some((r) => !has(r)),
              q.statement,
            ).toBe(true);
          }
          // the numbers of the wrong reasons are the statement's own: they are made for it
          for (const r of wrong) wrongSeen.add(r.t.replace(/\d+/g, 'N'));
          // only the right reason is accepted with the right verdict
          const k = q.reasons.indexOf(right);
          expect(check(q, { truth: q.truth, reason: k }).ok).toBe(true);
          for (const j of [0, 1, 2].filter((x) => x !== k)) {
            const res = check(q, { truth: q.truth, reason: j });
            expect(res.ok).toBe(false);
            expect(res.hint).not.toMatch(/المساواة التي تبرهن/); // never « pick the one with a formula »
          }
        }
      }
    }
    expect(shown).toBeGreaterThan(500);
    expect(rightWithFormula).toBeGreaterThan(50);
    expect(rightWithout).toBeGreaterThan(50);
    // the wrong reasons are not the same two sentences in every question: seven statements, each with its own two
    // (once the numbers are taken out, twelve different sentences — the old trainer had two for everything)
    expect(wrongSeen.size).toBeGreaterThanOrEqual(12);
  });

  it('a wrong reason is a false fact, a true fact that proves nothing, or a rule that does not exist — never the proof', () => {
    // by hand on one draw of each statement: 87 = 7 × 12 + 3
    const [a, b, q, r] = [87, 7, 12, 3];
    expect(b * q + r).toBe(a);
    expect(b * q > a).toBe(false); // « 7 × 12 = 84 أكبر من 87 »: a false fact
    expect(b * (q - 1) + (r + b)).toBe(a); // « 7 × 11 + 10 لا يساوي 87 »: a false fact (it does)
    expect(r > q && r < q + 1).toBe(false); // « الباقي 3 يقع بين 12 و 13 »: a false fact
    expect(a / b === q).toBe(false); // « 87 ÷ 7 = 12 بالضبط »: a false fact
    expect(Math.ceil(a / b)).toBe(q + 1); // « يلزم 14 على الأقلّ »: a false fact (13 are enough)
    // 84 = 7 × 12: « 12 لا يقسم 84 » is false, « 84 = 7 × 11 + 7 » is a true writing that is not the Euclidean division
    expect([84 % 12, 7 * 11 + 7, 7 < 7]).toEqual([0, 84, false]);
  });

  it('refuses the usual mistakes with their own reason', () => {
    // 2350 = 47 × 50 + 0 ; 2367 = 47 × 50 + 17
    const division = { kind: 'division', a: 2367, b: 47 };
    expect(check(division, { q: 50, r: 17 }).ok).toBe(true);
    expect(check(division, { q: 49, r: 64 }).hint).toContain('ليس أصغر');
    expect(check(division, { q: 50, r: 7 }).hint).toContain('تحقّق');
    // 49 × 47 + 64 = 2367: true arithmetic, wrong division — and a false claim
    expect(verifyClaim(trainerEvidence({ ...division, format: 'exam', key: 'k' }, { q: 49, r: 64 }, FIRST).claim)).toBe(
      false,
    );
    const bracket = { kind: 'bracket', a: 2367, b: 47 };
    expect(check(bracket, { lo: 50, hi: 51 }).ok).toBe(true);
    expect(check(bracket, { lo: 17, hi: 18 }).ok).toBe(false); // the remainder taken for the quotient
    expect(check(bracket, { lo: 50, hi: 52 }).hint).toContain('متتاليين');
    expect(check(bracket, { lo: 50, hi: 51 }).fix).toContain('$50 < 2367 \\div 47 < 51$');
    // nothing left: the correction does not write a strict bracket that would be false
    expect(check({ kind: 'bracket', a: 2350, b: 47 }, { lo: 50, hi: 51 }).fix).toContain(
      '$50 \\leq 2350 \\div 47 < 51$',
    );
    const exact = { kind: 'exact', a: 2350, b: 47, form: { lines: [] } };
    expect(check(exact, { q: 50, r: 0, ph: 'yes' }).ok).toBe(true);
    expect(check(exact, { q: 50, r: 0, ph: 'swap' }).hint).toContain('الأكبر');
    expect(check(exact, { q: 50, r: 0, ph: 'no' }).ok).toBe(false);
    expect(
      verifyClaim(trainerEvidence({ ...exact, format: 'exam', key: 'k' }, { q: 50, r: 0, ph: 'no' }, FIRST).claim),
    ).toBe(false);
    const needed = { kind: 'needed', a: 2367, b: 47 };
    expect(check(needed, { full: 50, need: 51 }).ok).toBe(true);
    expect(check(needed, { full: 50, need: 50 }).hint).toContain('الباقي 17 قطعة بلا مكان');
    expect(check(needed, { full: 50, need: 53 }).hint).toContain('أكثر ممّا يلزم');
    expect(
      verifyClaim(trainerEvidence({ ...needed, format: 'exam', key: 'k' }, { full: 50, need: 50 }, FIRST).claim),
    ).toBe(false);
    // nothing left: the boxes that are full are the boxes needed
    const flat = { kind: 'needed', a: 2350, b: 47 };
    expect(solution(flat)).toEqual({ full: 50, need: 50 });
    expect(check(flat, { full: 50, need: 50 }).ok).toBe(true);
    expect(check(flat, { full: 50, need: 51 }).ok).toBe(false);
    expect(check(flat, { full: 50, need: 50 }).fix).toContain('ولا يبقى شيء');
  });

  it('a situation speaks of its own goods and asks « كم » with the noun of its box; one time in four nothing is left', () => {
    let zero = 0;
    let all = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const q of trainer.makeSession(rng(seed * 977), 'khata-lazim').filter((x) => x.kind === 'needed')) {
        all += 1;
        expect(q.prompt).toMatch(
          /^نوضّب \d+ (قارورة|قارورات|علبة|علب|كتاب|كتابًا|كتب|برتقالة|برتقالات) في (صناديق|كراتين)، /,
        );
        expect(q.prompt).toMatch(/كم (صندوقًا|كرتونة) نملأ تمامًا؟ وكم (صندوقًا|كرتونة) يلزمنا/);
        expect(q.prompt).not.toMatch(/ةًا|ًاًا/);
        if (q.a % q.b === 0) zero += 1;
        expect(check(q, solution(q)).ok).toBe(true);
      }
    }
    expect(all).toBe(200);
    expect(zero).toBeGreaterThan(25);
    expect(zero).toBeLessThan(80);
  });

  it('b is never called « القاسم » in a division: no question, hint, reason or correction of the first two keys says it', () => {
    for (const card of CARDS)
      for (let seed = 1; seed <= 30; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 613), card)) {
          // « قاسم » belongs to the third key (« b يقسم a »): the world's own sentences may say it there
          if (q.key === 'inidam-baqi') continue;
          const s = solution(q);
          const said = [q.prompt, q.statement, q.why, ...(q.reasons ?? []).map((r) => r.t), check(q, s).fix];
          said.push(check(q, q.kind === 'tap' ? q.wave.gates.find((n) => n !== s) : {}).hint);
          expect(said.join(' ')).not.toMatch(/القاسم|قاسم/);
        }
  });
});
