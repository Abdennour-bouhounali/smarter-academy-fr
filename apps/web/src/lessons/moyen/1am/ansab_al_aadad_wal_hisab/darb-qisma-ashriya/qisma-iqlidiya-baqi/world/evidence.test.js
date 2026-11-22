import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { trainer, check, solution } from './trainer';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The kinds of trainer question whose answer is evidence (« صحيح أم خطأ؟ » and the taps are not). */
const EVIDENCE_KINDS = ['division', 'fix', 'dividend', 'problem'];

/**
 * Wrong and HALF-WRONG answers of a question: each part of the right answer changed alone, the classic slips (one group
 * too few with its true equality, the quotient for the boxes needed, the remainder for the quotient…), a wrong verdict
 * beside a right division, and boxes left empty.
 */
function wrongAnswers(q) {
  const right = solution(q);
  const out = [];
  for (const k of Object.keys(right)) {
    if (typeof right[k] !== 'number') continue;
    for (const d of [1, -1, 10]) if (right[k] + d >= 0) out.push({ ...right, [k]: right[k] + d });
    out.push({ ...right, [k]: '' });
    out.push({ ...right, [k]: String(right[k] + 1) });
  }
  if ('q' in right && 'r' in right && right.q > 0) out.push({ ...right, q: right.q - 1, r: right.r + q.b });
  if (q.kind === 'fix') {
    for (const verdict of ['yes', 'calc', undefined]) out.push({ ...right, verdict });
    out.push({ verdict: 'no', q: q.shown.q, r: q.shown.r });
  }
  if (q.kind === 'dividend') {
    out.push({ a: q.a, m: q.b }, { a: q.a, m: q.r }, { a: q.b * q.quo, m: q.b - 1 }, { a: q.a, m: 0 });
  }
  if (q.kind === 'problem') {
    for (const n of [q.quo, q.quo + 1, q.r, q.quo + q.r, q.b - q.r, 0]) out.push({ ...right, n });
    out.push({ q: q.quo - 1, r: q.r + q.b, n: right.n });
  }
  return out;
}

describe('the evidence of « القسمة الإقليدية »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, a module teaches it, and all three are covered', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('qisma-iqlidiya-baqi', key));
    expect(points).toEqual(['P1', 'P2', 'P2', 'P1', 'P3'].map((p) => `1am_qisma-iqlidiya-baqi_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
    expect(new Set(points).size).toBe(3);
  });

  it('only an exam answer given at the first try without help is sent, as a claim', () => {
    // 347 = 8 × 43 + 3
    const q = { format: 'exam', kind: 'division', key: KEYS[0], a: 347, b: 8, quo: 43, r: 3 };
    const ev = trainerEvidence(q, { q: 43, r: 3 }, FIRST);
    expect(ev).toEqual({ key: KEYS[0], claim: { kind: 'division', a: 347, b: 8, q: 43, r: 3, fits: false } });
    expect(evidence.payloadOf('qisma-iqlidiya-baqi', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '1am_qisma-iqlidiya-baqi_P1',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(evidence.verify(ev.claim)).toBe(true);
    expect(trainerEvidence(q, { q: 43, r: 3 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, { q: 43, r: 3 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
  });

  it('a problem is the الكفاءة of the distribution problems, and each of its three questions is its own claim', () => {
    // 287 pupils, buses of 45: 287 = 45 × 6 + 17 — 6 full buses, 7 needed, 17 pupils left out
    const base = { format: 'exam', kind: 'problem', key: KEYS[4], a: 287, b: 45, quo: 6, r: 17 };
    const need = trainerEvidence({ ...base, ask: 'need' }, { q: 6, r: 17, n: 7 }, FIRST);
    expect(evidence.payloadOf('qisma-iqlidiya-baqi', 'trainer', need, 'att-2').learningPoint).toBe(
      '1am_qisma-iqlidiya-baqi_P3',
    );
    expect(need.claim).toEqual({ kind: 'fullNeeded', a: 287, b: 45, full: 6, need: 7 });
    expect(verifyClaim(need.claim)).toBe(true);
    // the classic: the quotient itself — 17 pupils have no seat
    expect(verifyClaim(trainerEvidence({ ...base, ask: 'need' }, { q: 6, r: 17, n: 6 }, FIRST).claim)).toBe(false);
    const full = trainerEvidence({ ...base, ask: 'full' }, { q: 6, r: 17, n: 6 }, FIRST);
    expect(full.claim).toEqual({ kind: 'bracket', a: 287, b: 45, lo: 6, hi: 7 });
    expect(verifyClaim(full.claim)).toBe(true);
    expect(verifyClaim(trainerEvidence({ ...base, ask: 'full' }, { q: 6, r: 17, n: 7 }, FIRST).claim)).toBe(false);
    const left = trainerEvidence({ ...base, ask: 'left' }, { q: 6, r: 17, n: 17 }, FIRST);
    expect(left.claim).toEqual({ kind: 'division', a: 287, b: 45, q: 6, r: 17, fits: false });
    expect(verifyClaim(trainerEvidence({ ...base, ask: 'left' }, { q: 6, r: 17, n: 6 }, FIRST).claim)).toBe(false);
    // nobody left: 270 = 45 × 6 + 0 — 6 buses are needed, a seventh would leave empty
    const exact = { ...base, a: 270, r: 0, ask: 'need' };
    expect(verifyClaim(trainerEvidence(exact, { q: 6, r: 0, n: 6 }, FIRST).claim)).toBe(true);
    expect(verifyClaim(trainerEvidence(exact, { q: 6, r: 0, n: 7 }, FIRST).claim)).toBe(false);
  });

  it('a half-right answer never earns the الكفاءة: the examples the review found', () => {
    // « fix »: the right division typed beside a WRONG verdict
    const fix = { format: 'exam', kind: 'fix', key: KEYS[1], a: 94, b: 8, quo: 11, r: 6, shown: { q: 10, r: 14 } };
    for (const verdict of ['yes', 'calc']) {
      expect(check(fix, { verdict, q: 11, r: 6 }).ok).toBe(false);
      expect(verifyClaim(trainerEvidence(fix, { verdict, q: 11, r: 6 }, FIRST).claim), verdict).toBe(false);
    }
    expect(verifyClaim(trainerEvidence(fix, { verdict: 'no', q: 11, r: 6 }, FIRST).claim)).toBe(true);
    // « dividend »: the right dividend beside a WRONG biggest remainder
    const dv = { format: 'exam', kind: 'dividend', key: KEYS[2], b: 12, quo: 25, r: 9, a: 309 };
    for (const m of [12, 9, 10, 0]) {
      expect(check(dv, { a: 309, m }).ok).toBe(false);
      expect(verifyClaim(trainerEvidence(dv, { a: 309, m }, FIRST).claim), `m = ${m}`).toBe(false);
    }
    const ok = trainerEvidence(dv, { a: 309, m: 11 }, FIRST);
    expect(ok.claim).toEqual({ kind: 'division', a: 309, b: 12, q: 25, r: 9, fits: false });
    expect(verifyClaim(ok.claim)).toBe(true);
    expect(verifyClaim(trainerEvidence(dv, { a: 300, m: 11 }, FIRST).claim)).toBe(false);
  });

  it('THE RULE, for every question that yields evidence: the claim is true exactly when `check` accepts the answer', () => {
    const seen = Object.fromEntries(EVIDENCE_KINDS.map((k) => [k, { right: 0, wrong: 0 }]));
    const asks = new Set();
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id))
      for (let seed = 1; seed <= 40; seed += 1)
        for (const q of trainer.makeSession(rng(seed * 7919 + 11), card)) {
          if (!EVIDENCE_KINDS.includes(q.kind)) {
            expect(trainerEvidence(q, solution(q), FIRST), q.kind).toBe(null);
            continue;
          }
          if (q.kind === 'problem') asks.add(`${q.ask}:${q.r === 0 ? 'exact' : 'left'}`);
          const right = solution(q);
          expect(check(q, right).ok).toBe(true);
          expect(verifyClaim(trainerEvidence(q, right, FIRST).claim), `${q.kind} right`).toBe(true);
          seen[q.kind].right += 1;
          for (const v of wrongAnswers(q)) {
            const ok = check(q, v).ok;
            const ev = trainerEvidence(q, v, FIRST);
            expect(ev, q.kind).toBeTruthy();
            // `check` false ⇒ the claim is false (and a variant that happens to be right is a true claim)
            expect(verifyClaim(ev.claim), `${q.kind} ${JSON.stringify(v)} on ${q.prompt}`).toBe(ok);
            expect(evidence.verify(ev.claim)).toBe(ok);
            if (!ok) seen[q.kind].wrong += 1;
          }
        }
    for (const k of EVIDENCE_KINDS) {
      expect(seen[k].right, k).toBeGreaterThan(20);
      expect(seen[k].wrong, k).toBeGreaterThan(200);
    }
    // the problems asked every question, with and without a leftover
    expect([...asks].sort()).toEqual(['full:exact', 'full:left', 'left:left', 'need:exact', 'need:left']);
  });
});
