import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The kinds of trainer question whose first try is evidence, and the boxes of each. */
const BOXES = { sumDiff: ['s', 'f'], multiple: ['k'], rest: ['q', 'r', 'k'] };

/**
 * Answers a student can really write for a question: the right one, every box off by a little, emptied, doubled, the
 * number itself instead of its factor, two boxes swapped, a division one bridge short — whole-wrong and HALF-wrong.
 */
function answersOf(q) {
  const right = solution(q);
  const out = [right];
  const boxes = BOXES[q.kind];
  for (const k of boxes) {
    for (const v of [right[k] + 1, right[k] - 1, right[k] * 2, right[k] * q.d, 0, '', undefined, '2.5', -right[k]])
      out.push({ ...right, [k]: v });
  }
  for (const k of boxes) for (const j of boxes) if (k !== j) out.push({ ...right, [k]: right[j], [j]: right[k] });
  if (q.kind === 'sumDiff') {
    out.push({ s: q.a + q.b, f: q.a - q.b }); // the sum itself, not its factor
    out.push({ s: right.s, f: right.s }); // the same factor twice
    out.push({ s: right.f, f: right.f });
  }
  if (q.kind === 'rest') {
    out.push({ q: right.q - 1, r: right.r + q.b, k: (right.r + q.b) / q.d }); // one bridge short: r ≥ b
    out.push({ q: right.q, r: right.r, k: right.r }); // the remainder itself, not its factor
    out.push({ q: right.q + 1, r: 0, k: 0 });
    out.push({ q: right.q, r: right.r - q.d, k: right.k - 1 }); // a wrong division whose « remainder » IS d × k
  }
  out.push({}, null);
  return out;
}

describe('the evidence of « خواص قواسم عدد طبيعي »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('khawass-qawasim', key));
    expect(points).toEqual(['P1', 'P2', 'P3', 'P4'].map((p) => `4am_khawass-qawasim_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim', () => {
    // 7 divides 98 and 42: 98 = 42 × 2 + 14, and the remainder is 14 = 7 × 2 — the part that is THIS lesson
    const q = { format: 'exam', kind: 'rest', key: KEYS[2], a: 98, b: 42, d: 7, quo: 2, r: 14 };
    const ev = trainerEvidence(q, { q: 2, r: 14, k: 2 }, FIRST);
    expect(ev).toEqual({ key: KEYS[2], claim: { kind: 'pair', a: 14, b: 7, e: 2 } });
    expect(evidence.payloadOf('khawass-qawasim', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_khawass-qawasim_P3',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(evidence.verify(ev.claim)).toBe(true);
    expect(trainerEvidence(q, { q: 2, r: 14, k: 2 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence(q, { q: 2, r: 14, k: 2 }, { firstTry: false, helped: false })).toBe(null);
    expect(trainerEvidence({ ...q, format: 'game' }, { q: 2, r: 14, k: 2 }, FIRST)).toBe(null);
    // 12 divides 84 and 36: 84 + 36 = 12 × 10 is right, so the claim is the difference, 84 − 36 = 12 × 4
    const sd = trainerEvidence(
      { format: 'exam', kind: 'sumDiff', key: KEYS[0], a: 84, b: 36, d: 12, p: 7, q: 3 },
      { s: 10, f: 4 },
      FIRST,
    );
    expect(sd.claim).toEqual({ kind: 'pair', a: 48, b: 12, e: 4 });
    expect(evidence.verify(sd.claim)).toBe(true);
    // 7 divides 91: 91 × 20 = 7 × 260
    const mu = trainerEvidence(
      { format: 'exam', kind: 'multiple', key: KEYS[1], a: 91, d: 7, p: 13, n: 20 },
      { k: 260 },
      FIRST,
    );
    expect(mu.claim).toEqual({ kind: 'pair', a: 1820, b: 7, e: 260 });
    expect(evidence.verify(mu.claim)).toBe(true);
    expect(evidence.caseEvidence()).toBe(null);
  });

  it('a HALF-right answer earns nothing: the two answers that had credited P1 and P3', () => {
    // « 9 يقسم 216 و 72 »: the sum is right (288 = 9 × 32), the difference is not (144 = 9 × 16, he wrote 17)
    const sd = { format: 'exam', kind: 'sumDiff', key: KEYS[0], a: 216, b: 72, d: 9, p: 24, q: 8 };
    expect(check(sd, { s: 32, f: 17 }).ok).toBe(false);
    const half = trainerEvidence(sd, { s: 32, f: 17 }, FIRST);
    expect(half.claim).toEqual({ kind: 'pair', a: 144, b: 9, e: 17 });
    expect(verifyClaim(half.claim)).toBe(false);
    // …and the other half: a wrong sum is claimed as he wrote it, whatever the difference
    const other = trainerEvidence(sd, { s: 31, f: 16 }, FIRST);
    expect(other.claim).toEqual({ kind: 'pair', a: 288, b: 9, e: 31 });
    expect(verifyClaim(other.claim)).toBe(false);
    expect(verifyClaim(trainerEvidence(sd, { s: 32, f: 16 }, FIRST).claim)).toBe(true);

    // « 6 يقسم 192 و 30 »: the division is right (192 = 30 × 6 + 12), the remainder is NOT 6 × 3
    const rest = { format: 'exam', kind: 'rest', key: KEYS[2], a: 192, b: 30, d: 6, quo: 6, r: 12 };
    expect(check(rest, { q: 6, r: 12, k: 3 }).ok).toBe(false);
    const bare = trainerEvidence(rest, { q: 6, r: 12, k: 3 }, FIRST);
    expect(bare.claim).toEqual({ kind: 'pair', a: 12, b: 6, e: 3 });
    expect(verifyClaim(bare.claim)).toBe(false);
    // a wrong division is claimed as a division — false — even when his « remainder » is d × k (42 = 6 × 7)
    expect(check(rest, { q: 5, r: 42, k: 7 }).ok).toBe(false);
    const short = trainerEvidence(rest, { q: 5, r: 42, k: 7 }, FIRST);
    expect(short.claim).toEqual({ kind: 'division', a: 192, b: 30, q: 5, r: 42, fits: false });
    expect(verifyClaim(short.claim)).toBe(false);
    expect(verifyClaim(trainerEvidence(rest, { q: 6, r: 12, k: 2 }, FIRST).claim)).toBe(true);
  });

  it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the whole answer', () => {
    const seen = { sumDiff: 0, multiple: 0, rest: 0 };
    const verdicts = { right: 0, wrong: 0 };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 40; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
          if (!BOXES[q.kind]) {
            // a tap, a true / false, a proof with letters: never evidence, right or wrong
            expect(trainerEvidence(q, solution(q), FIRST), q.kind).toBe(null);
            expect(trainerEvidence(q, {}, FIRST), q.kind).toBe(null);
            continue;
          }
          expect(q.format).toBe('exam');
          seen[q.kind] += 1;
          for (const v of answersOf(q)) {
            const ok = check(q, v).ok;
            const ev = trainerEvidence(q, v, FIRST);
            expect(ev?.key, q.kind).toBe(q.key);
            expect(verifyClaim(ev.claim), `${q.prompt} ← ${JSON.stringify(v)} claims ${JSON.stringify(ev.claim)}`).toBe(
              ok,
            );
            verdicts[ok ? 'right' : 'wrong'] += 1;
          }
          expect(check(q, solution(q)).ok).toBe(true);
        }
      }
    }
    for (const kind of Object.keys(BOXES)) expect(seen[kind], kind).toBeGreaterThan(100);
    // the family of answers is not vacuous: wrong and half-wrong answers by the thousand, right ones too
    expect(verdicts.wrong).toBeGreaterThan(5000);
    expect(verdicts.right).toBeGreaterThan(300);
  });
});
