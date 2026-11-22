import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { divisorsOf, euclid, gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The boxes of each kind of trainer question whose first try is evidence. */
const BOXES = { hukm: ['g'], burhan: ['q', 'r', 'g'], nafi: ['q', 'r', 'g'], shahid: ['d'] };

/**
 * Answers a student can really write: the right one, every box off by a little, emptied, doubled, a decimal, a negative,
 * two boxes swapped — whole-wrong and HALF-wrong — and the mistakes of THIS lesson: 1 for the PGCD of two numbers that
 * share a plank, the verdict turned round or missing, the last remainder 0 for the PGCD, 1 as « a common divisor other
 * than 1 », a divisor of one number only, a common divisor that is not the greatest.
 */
function answersOf(q) {
  const right = solution(q);
  const out = [right];
  const boxes = BOXES[q.kind];
  for (const k of boxes)
    for (const v of [right[k] + 1, right[k] - 1, right[k] * 2, 0, '', undefined, '2.5', -right[k], ' '])
      out.push({ ...right, [k]: v });
  for (const k of boxes) for (const j of boxes) if (k !== j) out.push({ ...right, [k]: right[j], [j]: right[k] });
  const g = gcd(q.a, q.b);
  const [first] = euclid(q.a, q.b);
  if (q.kind === 'hukm')
    out.push(
      { ...right, verdict: right.verdict === 'yes' ? 'no' : 'yes' },
      { g: right.g },
      { ...right, verdict: 'maybe' },
      { g: 1, verdict: 'yes' },
      { g: q.a - q.b, verdict: 'no' },
    );
  if (q.kind === 'burhan' || q.kind === 'nafi') {
    out.push({ ...right, g: 0 }, { ...right, g: 1 }, { ...right, g: first.r }, { q: first.q - 1, r: first.r + q.b, g });
    out.push(...divisorsOf(g).map((d) => ({ ...right, g: d })));
  }
  if (q.kind === 'shahid') {
    out.push({ d: 1 }, { d: '1' }, { d: q.a }, { d: q.b }, { d: g }, ...[2, 3, 5, 7, 9, 10, 11].map((d) => ({ d })));
  }
  out.push({}, null);
  return out;
}

describe('the evidence of « العددان الأوّليّان فيما بينهما »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('awwaliyan-fima-baynahuma', key));
    expect(points).toEqual(['P1', 'P2', 'P3'].map((p) => `4am_awwaliyan-fima-baynahuma_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim of the WHOLE answer', () => {
    const p = { format: 'exam', kind: 'burhan', key: KEYS[1], a: 35, b: 26 };
    const ev = trainerEvidence(p, { q: 1, r: 9, g: 1 }, FIRST);
    expect(ev).toEqual({ key: KEYS[1], claim: { kind: 'pgcd', a: 35, b: 26, g: 1 } });
    expect(evidence.payloadOf('awwaliyan-fima-baynahuma', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_awwaliyan-fima-baynahuma_P2',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(trainerEvidence(p, { q: 1, r: 9, g: 1 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...p, format: 'game' }, { q: 1, r: 9, g: 1 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    // a wrong division: the division he wrote (false)
    expect(trainerEvidence(p, { q: 1, r: 8, g: 1 }, FIRST).claim).toEqual({
      kind: 'division',
      a: 35,
      b: 26,
      q: 1,
      r: 8,
      fits: false,
    });
    // P1: the PGCD, then the verdict as a `coprime` claim
    const h = { format: 'exam', kind: 'hukm', key: KEYS[0], a: 119, b: 85 };
    expect(trainerEvidence(h, { g: 17, verdict: 'no' }, FIRST).claim).toEqual({
      kind: 'coprime',
      a: 119,
      b: 85,
      says: false,
    });
    expect(verifyClaim(trainerEvidence(h, { g: 17, verdict: 'yes' }, FIRST).claim)).toBe(false);
    expect(trainerEvidence(h, { g: 1, verdict: 'yes' }, FIRST).claim).toEqual({ kind: 'pgcd', a: 119, b: 85, g: 1 });
    // P3: the witness as a `commonDivisor` claim OTHER THAN 1 (`notOne`): the answer 1 is sent, and is false
    const w = { format: 'exam', kind: 'shahid', key: KEYS[2], a: 645, b: 410 };
    expect(trainerEvidence(w, { d: 5 }, FIRST).claim).toEqual({
      kind: 'commonDivisor',
      a: 645,
      b: 410,
      d: 5,
      notOne: true,
    });
    expect(verifyClaim(trainerEvidence(w, { d: 3 }, FIRST).claim)).toBe(false);
    expect(trainerEvidence(w, { d: 1 }, FIRST).claim).toEqual({
      kind: 'commonDivisor',
      a: 645,
      b: 410,
      d: 1,
      notOne: true,
    });
    expect(verifyClaim(trainerEvidence(w, { d: 1 }, FIRST).claim)).toBe(false);
    expect(verifyClaim({ kind: 'commonDivisor', a: 645, b: 410, d: 1 })).toBe(true); // why the option: without it, TRUE
    expect(evidence.caseEvidence()).toBe(null);
    expect(guardEvidence({ key: KEYS[1], claim: { kind: 'pgcd', a: 35, b: 26, g: 1 } }, false)).toBe(null);
  });

  it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the whole answer', () => {
    const seen = { hukm: 0, burhan: 0, nafi: 0, shahid: 0 };
    const verdicts = { right: 0, wrong: 0 };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 30; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
          if (!BOXES[q.kind]) {
            // a tap, a true / false: never evidence, right or wrong
            expect(trainerEvidence(q, solution(q), FIRST), q.kind).toBe(null);
            expect(trainerEvidence(q, {}, FIRST), q.kind).toBe(null);
            continue;
          }
          expect(q.format).toBe('exam');
          seen[q.kind] += 1;
          for (const v of answersOf(q)) {
            const ok = check(q, v).ok;
            const ev = trainerEvidence(q, v, FIRST);
            // no silent answer: every exam answer, right or wrong, sends its claim
            expect(ev, `${q.kind} ← ${JSON.stringify(v)}`).not.toBe(null);
            expect(ev.key, q.kind).toBe(q.key);
            expect(verifyClaim(ev.claim), `${q.prompt} ← ${JSON.stringify(v)} claims ${JSON.stringify(ev.claim)}`).toBe(
              ok,
            );
            expect(guardEvidence(ev, ok)).toBe(ev);
            verdicts[ok ? 'right' : 'wrong'] += 1;
          }
        }
      }
    }
    for (const kind of Object.keys(seen)) expect(seen[kind], kind).toBeGreaterThan(50);
    expect(verdicts.wrong).toBeGreaterThan(3000);
    expect(verdicts.right).toBeGreaterThan(300);
  });
});
