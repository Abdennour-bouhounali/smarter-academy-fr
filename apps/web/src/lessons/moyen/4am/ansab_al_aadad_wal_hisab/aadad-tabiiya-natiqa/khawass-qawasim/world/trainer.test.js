import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { trainer, solution, check, answerLabel, PLAN_OF, PROOFS } from './trainer';
import { trainerEvidence } from './evidence';
import { KNOWLEDGE } from './knowledge';

const FIRST = { firstTry: true, helped: false };
const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
const clean = (x) => expect(String(x)).not.toMatch(/undefined|NaN|\[object/);

describe('« تدرّب » — the trainer of « خواص قواسم عدد طبيعي »', () => {
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
          if (['sumDiff', 'multiple', 'rest'].includes(q.kind)) expect(ev, q.kind).toBeTruthy();
          expect(trainerEvidence(q, right, { firstTry: false, helped: false })).toBe(null);
        }
      }
    }
    expect([...kinds].sort()).toEqual(['multiple', 'proof', 'rest', 'sumDiff', 'tap', 'tf']);
  });

  it('every true / false is computed: its reason is an equality that holds, and its verdict is the arithmetic', () => {
    for (let seed = 1; seed <= 200; seed += 1) {
      for (const card of ['majmu', 'mudaaf', 'baqi', 'burhan']) {
        for (const q of trainer.makeSession(rng(seed * 31 + 7), card).filter((x) => x.kind === 'tf')) {
          // every « $x = y \times z + r$ » or « $x = y \times z$ » written in the reason is true
          for (const [, lhs, rhs] of q.why.matchAll(/\$(\d+) = ([\d\s\\a-z+]+)\$/g)) {
            if (/[a-z]/.test(rhs.replace(/\\times/g, ''))) continue; // « m = d × k »: a letter, not a computation
            const value = rhs
              .split('=')
              .at(-1)
              .replace(/\\times/g, '*')
              .split('+')
              .reduce((t, term) => t + term.split('*').reduce((p, x) => p * Number(x), 1), 0);
            expect(value, q.why).toBe(Number(lhs));
          }
          clean(q.statement);
          clean(q.why);
        }
      }
    }
  });

  it('refuses the usual mistakes with their own reason', () => {
    const sd = { kind: 'sumDiff', a: 84, b: 36, d: 12, p: 7, q: 3 };
    expect(check(sd, { s: 10, f: 4 }).ok).toBe(true);
    expect(check(sd, { s: 120, f: 48 }).ok).toBe(false); // the sum itself, not k
    const mul = { kind: 'multiple', a: 91, d: 7, p: 13, n: 20 };
    expect(check(mul, { k: 260 }).ok).toBe(true);
    expect(check(mul, { k: 1820 }).ok).toBe(false);
    // 7 divides 98 and 42: 98 = 42 × 2 + 14, 14 = 7 × 2
    const rest = { kind: 'rest', a: 98, b: 42, d: 7, quo: 2, r: 14 };
    expect(check(rest, { q: 2, r: 14, k: 2 }).ok).toBe(true);
    expect(check(rest, { q: 1, r: 56, k: 8 }).hint).toContain('ليس أصغر');
    expect(check(rest, { q: 2, r: 14, k: 14 }).ok).toBe(false);
    expect(
      verifyClaim(trainerEvidence({ ...rest, format: 'exam', key: 'k' }, { q: 1, r: 56, k: 8 }, FIRST).claim),
    ).toBe(false);
    const proof = { kind: 'proof', target: 'sum' };
    expect(check(proof, { start: 'goal', k: 'right', nat: 'nat' }).hint).toContain('الشرط');
    expect(check(proof, { start: 'cond', k: 'f1', nat: 'nat' }).ok).toBe(false);
    expect(check(proof, { start: 'cond', k: 'right', nat: 'big' }).ok).toBe(false);
    expect(trainerEvidence({ ...proof, format: 'exam', key: 'burhan' }, solution(proof), FIRST)).toBe(null);
  });

  it('each proof is true with letters: the right product equals the goal for any numbers; the foils do not', () => {
    // the letters of the proof: a = d × k, b = d × k′ (k′ is read before k)
    const value = (s, { d, p, q, n }) =>
      s
        .replace(/−/g, '-')
        .replace(/×/g, '*')
        .replace(/k′/g, q)
        .replace(/[dkn]/g, (x) => ({ d, k: p, n })[x]);
    const evaluate = (s) => {
      // a tiny evaluator for « 7 * (5 + 3) », « 7 + (5 - 3) », « 4 * 7 * 5 »
      const inner = s.replace(/\(([^()]+)\)/g, (_, e) => String(evaluate(e)));
      return inner
        .replace(/\s/g, '')
        .split(/(?=[+-])/)
        .reduce(
          (t, term) =>
            t +
            (term.startsWith('-') ? -1 : 1) *
              term
                .replace(/^[+-]/, '')
                .split('*')
                .reduce((x, y) => x * Number(y), 1),
          0,
        );
    };
    for (const [target, P] of Object.entries(PROOFS)) {
      for (const vals of [
        { d: 7, p: 5, q: 3, n: 4 },
        { d: 13, p: 11, q: 2, n: 9 },
      ]) {
        const { d, p, q, n } = vals;
        const goal = { sum: d * p + d * q, diff: d * p - d * q, mult: n * d * p }[target];
        expect(evaluate(value(P.right, vals)), `${target} ${P.right}`).toBe(goal);
        for (const f of P.foils) expect(evaluate(value(f, vals)), `${target} ${f}`).not.toBe(goal);
        // the natural number the last line names is the factor of the right product
        expect(P.right).toBe(`d × (${P.factor})`);
        expect(evaluate(value(P.factor, vals)) * d).toBe(goal);
      }
    }
  });

  it('writes its proofs with ONE pair of letters, k and k′ — never q, which is the quotient of a division', () => {
    for (const [target, P] of Object.entries(PROOFS)) {
      const visible = [P.cond, P.given, P.goal, P.factor, P.right, ...P.foils].join(' ');
      expect(visible, target).not.toMatch(/[pq]/);
      expect(P.given, target).toContain('a = d × k');
      const tex = [P.givenTex, P.goalTex, P.factorTex, P.rightTex].join(' ');
      expect(tex.replace(/\\(times|quad)/g, ''), target).not.toMatch(/[pq]/);
      // the same line in plain text and in LaTeX
      expect(
        P.rightTex
          .replace(/\\times/g, '×')
          .replace(/'/g, '′')
          .replace(/-/g, '−'),
      ).toBe(P.right);
      const fix = check({ kind: 'proof', target }, {}).fix;
      expect(fix).toContain(`$${P.factorTex}$ عدد طبيعي`);
      expect(fix).not.toMatch(/undefined/);
    }
    expect(PROOFS.sum.given).toBe('a = d × k ، b = d × k′');
    // the quotient keeps its letter q in the answer of a division (the label of its box)
    const rest = trainer.makeSession(rng(11), 'baqi').find((x) => x.kind === 'rest');
    expect(JSON.stringify(rest.form)).toContain('حاصل القسمة');
  });

  it('every reason of a « صحيح أم خطأ؟ علّل » is a sentence: « لأنّ » is followed by a formula or a noun', () => {
    let n = 0;
    for (let seed = 1; seed <= 120; seed += 1) {
      for (const card of ['majmu', 'mudaaf', 'baqi', 'burhan']) {
        for (const q of trainer.makeSession(rng(seed * 53 + 5), card).filter((x) => x.kind === 'tf' && x.reasons)) {
          expect(q.reasons.filter((r) => r.ok)).toHaveLength(1);
          for (const r of q.reasons) {
            expect(r.t, r.t).toMatch(/^لأنّ(ه)? /);
            // never a verb or a particle after « لأنّ »
            expect(r.t, r.t).not.toMatch(/^لأنّ (يجب|يكفي|يوجد|لا |قد |لم |ليس)/);
            n += 1;
          }
          // the right reason is the correction itself
          expect(q.reasons.find((r) => r.ok).t).toBe(`لأنّ ${q.why}`);
          expect(q.why, q.why).toMatch(/^(\$|كلّ |المطلوب )/);
        }
      }
    }
    expect(n).toBeGreaterThan(500);
  });
});
