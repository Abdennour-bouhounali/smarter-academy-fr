import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { CLAIM_KINDS, verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
const EXAM_KINDS = ['division', 'bracket', 'exact', 'needed'];
const exam = (kind, a, b, key = KEYS[0]) => ({ format: 'exam', kind, key, a, b, form: { lines: [] } });
const claimOf = (q, v) => trainerEvidence(q, v, FIRST).claim;

/**
 * WRONG and HALF-WRONG answers of each kind of exam question, built from its right answer: one part right and the other
 * not, the two parts swapped, a neighbour, an empty box, a sentence that does not match the remainder.
 */
function answersOf(q) {
  const s = solution(q);
  const { a, b } = q;
  const quo = Math.floor(a / b);
  const r = a % b;
  switch (q.kind) {
    case 'division':
      return [
        s,
        { q: quo - 1, r: r + b }, // a true sum, a remainder too big
        { q: quo + 1, r: 0 },
        { q: quo, r: r + 1 },
        { q: r, r: quo },
        { q: '', r },
        { q: quo, r: '' },
        { q: '', r: '' },
        { q: 0, r: a },
      ];
    case 'exact':
      return [
        s,
        { ...s, ph: 'swap' }, // the right division, « a يقسم b »
        { ...s, ph: s.ph === 'yes' ? 'no' : 'yes' }, // the right division, the wrong sentence
        { ...s, ph: undefined }, // the right division, no sentence
        { q: quo - 1, r: r + b, ph: s.ph }, // the right sentence, a remainder too big
        { q: quo - 1, r: r + b, ph: 'no' },
        { q: quo, r: r + 1, ph: s.ph },
        { q: '', r: '', ph: s.ph },
        { q: quo, r: '', ph: 'yes' },
      ];
    case 'bracket':
      return [
        s,
        { lo: quo - 7, hi: quo + 1 }, // the right upper end alone
        { lo: quo, hi: quo + 2 }, // the right lower end alone
        { lo: quo - 1, hi: quo },
        { lo: quo + 1, hi: quo + 2 },
        { lo: quo + 1, hi: quo },
        { lo: quo, hi: quo },
        { lo: r, hi: r + 1 }, // the remainder taken for the quotient
        { lo: '', hi: quo + 1 },
        { lo: quo, hi: '' },
        { lo: 0, hi: 1 },
      ];
    case 'needed':
      return [
        s,
        { full: quo - 10, need: s.need }, // the right count needed alone
        { full: quo, need: quo }, // the full boxes taken for the boxes needed (right only when nothing is left)
        { full: quo, need: quo + 1 },
        { full: quo, need: quo + 2 },
        { full: quo + 1, need: quo + 1 },
        { full: s.need, need: quo },
        { full: '', need: s.need },
        { full: quo, need: '' },
      ];
    default:
      return [];
  }
}

describe('the evidence of « القسمة الإقليدية وحصر حاصل القسمة »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('qisma-iqlidiya-hasr', key));
    expect(points).toEqual(['P1', 'P2', 'P3'].map((p) => `2am_qisma-iqlidiya-hasr_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim the kit knows', () => {
    // 2367 = 47 × 50 + 17
    const q = exam('division', 2367, 47);
    const ev = trainerEvidence(q, { q: 50, r: 17 }, FIRST);
    expect(ev).toEqual({ key: KEYS[0], claim: { kind: 'division', a: 2367, b: 47, q: 50, r: 17, fits: false } });
    expect(evidence.payloadOf('qisma-iqlidiya-hasr', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '2am_qisma-iqlidiya-hasr_P1',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(evidence.verify(ev.claim)).toBe(true);
    expect(trainerEvidence(q, { q: 50, r: 17 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, { q: 50, r: 17 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
    // the kinds this lesson claims with exist on both sides (kit/claims.js is the server's rule too)
    for (const kind of ['division', 'phrase', 'bracket', 'fullNeeded']) expect(CLAIM_KINDS).toContain(kind);
  });

  it('a claim states the WHOLE answer, in the part that carries the الكفاءة of its key', () => {
    // the bracket: BOTH numbers (P2)
    const br = trainerEvidence(exam('bracket', 2367, 47, KEYS[1]), { lo: 50, hi: 51 }, FIRST);
    expect(br.claim).toEqual({ kind: 'bracket', a: 2367, b: 47, lo: 50, hi: 51 });
    expect(evidence.verify(br.claim)).toBe(true);
    // the situation: the boxes that are full AND the boxes needed (P2)
    const nd = trainerEvidence(exam('needed', 2367, 47, KEYS[1]), { full: 50, need: 51 }, FIRST);
    expect(nd.claim).toEqual({ kind: 'fullNeeded', a: 2367, b: 47, full: 50, need: 51 });
    expect(evidence.verify(nd.claim)).toBe(true);
    // the zero remainder: 2350 = 47 × 50, « يقبل القسمة » said rightly (P3)
    const ex = trainerEvidence(exam('exact', 2350, 47, KEYS[2]), { q: 50, r: 0, ph: 'yes' }, FIRST);
    expect(ex.claim).toEqual({ kind: 'division', a: 2350, b: 47, q: 50, r: 0, fits: true });
    expect(evidence.verify(ex.claim)).toBe(true);
    expect(evidence.payloadOf('qisma-iqlidiya-hasr', 'trainer', ex, 'att-2').learningPoint).toBe(
      '2am_qisma-iqlidiya-hasr_P3',
    );
    // « a يقسم b » is a claim about the SENTENCE: the number written first is not the divisor
    const sw = trainerEvidence(exam('exact', 2350, 47, KEYS[2]), { q: 50, r: 0, ph: 'swap' }, FIRST);
    expect(sw.claim).toEqual({ kind: 'phrase', phrase: 'yaqsim', a: 2350, b: 47, first: 2350 });
    expect(evidence.verify(sw.claim)).toBe(false);
  });

  it('the three answers the review caught — a wrong first try that used to verify TRUE — now make a FALSE claim', () => {
    // 1003 = 13 × 77 + 2
    const [a, b] = [1003, 13];
    expect([Math.floor(a / b), a % b]).toEqual([77, 2]);
    const cases = [
      [exam('exact', a, b, KEYS[2]), { q: 77, r: 2, ph: 'swap' }], // the right division, « 1003 يقسم 13 »
      [exam('bracket', a, b, KEYS[1]), { lo: 70, hi: 78 }], // the right upper end, a wrong lower end
      [exam('needed', a, b, KEYS[1]), { full: 60, need: 78 }], // the right boxes needed, the full ones miscounted
    ];
    for (const [q, v] of cases) {
      expect(check(q, v).ok, `${q.kind} ${JSON.stringify(v)}`).toBe(false);
      expect(verifyClaim(claimOf(q, v)), `${q.kind} ${JSON.stringify(v)}`).toBe(false);
    }
  });

  it('« check » false ⇒ the claim is false, « check » true ⇒ the claim is true — every exam kind, wrong and half-wrong answers', () => {
    const seen = Object.fromEntries(EXAM_KINDS.map((k) => [k, { right: 0, wrong: 0, zero: 0 }]));
    const judge = (q, v) => {
      const ok = check(q, v).ok;
      const claim = claimOf(q, v);
      expect(verifyClaim(claim), `${q.kind} ${q.a}/${q.b} ${JSON.stringify(v)} → ${JSON.stringify(claim)}`).toBe(ok);
      // the kit's safety net would never have to hold this evidence back
      expect(guardEvidence({ key: q.key, claim }, ok)).not.toBe(null);
      seen[q.kind][ok ? 'right' : 'wrong'] += 1;
    };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 40; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 104729 + 13), card)) {
          if (!EXAM_KINDS.includes(q.kind)) {
            expect(trainerEvidence(q, solution(q), FIRST)).toBe(null);
            continue;
          }
          expect(q.a, 'the dividend is greater than the divisor: « a يقسم b » is false').toBeGreaterThan(q.b);
          if (q.a % q.b === 0) seen[q.kind].zero += 1;
          const list = answersOf(q);
          expect(check(q, list[0]).ok).toBe(true);
          for (const v of list) judge(q, v);
          // and the same answers typed as text, as the form gives them
          for (const v of list)
            judge(q, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x == null ? x : String(x)])));
        }
    for (const k of EXAM_KINDS) {
      expect(seen[k].right, k).toBeGreaterThan(50);
      expect(seen[k].wrong, k).toBeGreaterThan(500);
    }
    // the remainder 0 is met where the lesson asks it: « هل يقبل القسمة؟ » and the boxes that are full AND needed
    expect(seen.exact.zero).toBeGreaterThan(20);
    expect(seen.needed.zero).toBeGreaterThan(5);
  });

  it('by hand, on the edges: nothing left, a dividend smaller than the divisor, the two equal', () => {
    // nothing left: 2350 = 47 × 50 — the full boxes ARE the boxes needed
    const nd = exam('needed', 2350, 47, KEYS[1]);
    expect(check(nd, { full: 50, need: 50 }).ok).toBe(true);
    expect(verifyClaim(claimOf(nd, { full: 50, need: 50 }))).toBe(true);
    expect(check(nd, { full: 50, need: 51 }).ok).toBe(false);
    expect(verifyClaim(claimOf(nd, { full: 50, need: 51 }))).toBe(false);
    // … and the bracket still takes 50 and 51: 47 × 50 ≤ 2350 < 47 × 51
    const br = exam('bracket', 2350, 47, KEYS[1]);
    expect(check(br, { lo: 50, hi: 51 }).ok).toBe(true);
    expect(verifyClaim(claimOf(br, { lo: 50, hi: 51 }))).toBe(true);
    expect(verifyClaim(claimOf(br, { lo: 49, hi: 50 }))).toBe(false);
    for (const [a, b] of [
      [30, 47],
      [47, 47],
    ]) {
      const q = Math.floor(a / b);
      const r = a % b;
      for (const [question, right, wrong] of [
        [exam('division', a, b), { q, r }, { q: q + 1, r: 0 }],
        [exam('bracket', a, b, KEYS[1]), { lo: q, hi: q + 1 }, { lo: q + 1, hi: q + 2 }],
        [exam('needed', a, b, KEYS[1]), { full: q, need: Math.ceil(a / b) }, { full: q, need: Math.ceil(a / b) + 1 }],
      ]) {
        expect(check(question, right).ok, `${question.kind} ${a}/${b}`).toBe(true);
        expect(verifyClaim(claimOf(question, right)), `${question.kind} ${a}/${b}`).toBe(true);
        expect(check(question, wrong).ok, `${question.kind} ${a}/${b}`).toBe(false);
        expect(verifyClaim(claimOf(question, wrong)), `${question.kind} ${a}/${b}`).toBe(false);
      }
    }
  });
});
