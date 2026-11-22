import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { divisorsOf } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The boxes of each kind of trainer question whose first try is evidence. */
const boxesOf = (q) =>
  q.kind === 'hasr'
    ? [...Array.from({ length: q.na }, (_, i) => `x${i}`), ...Array.from({ length: q.nb }, (_, i) => `y${i}`), 'g']
    : q.kind === 'direct'
      ? ['s', 'z', 'o']
      : q.kind === 'yaqsim'
        ? ['k', 'g']
        : null;

/**
 * Answers a student can really write: the right one, every box off by a little, emptied, doubled, a decimal, a negative,
 * two boxes swapped — whole-wrong and HALF-wrong — and the mistakes of THIS lesson: a common divisor that is not the
 * greatest, a divisor of one number only, the smaller number when it does not divide, 0 for PGCD(a ; 0), a for PGCD(a ; 1),
 * a list in another order, a list with a divisor twice.
 */
function answersOf(q) {
  const right = solution(q);
  const out = [right];
  const boxes = boxesOf(q);
  for (const k of boxes)
    for (const v of [right[k] + 1, right[k] - 1, right[k] * 2, 0, '', undefined, '2.5', -right[k], ' '])
      out.push({ ...right, [k]: v });
  for (const k of boxes) for (const j of boxes) if (k !== j) out.push({ ...right, [k]: right[j], [j]: right[k] });
  if (q.kind === 'hasr') {
    const [m] = divisorsOf(q.g).filter((d) => d < q.g);
    out.push({ ...right, g: m }, { ...right, g: Math.min(q.a, q.b) }, { ...right, g: q.a * q.b });
    const lone = [2, 3, 5, 7].find((d) => (q.a % d === 0) !== (q.b % d === 0));
    if (lone) out.push({ ...right, g: lone });
    const xs = divisorsOf(q.a).reverse();
    out.push({ ...right, ...Object.fromEntries(xs.map((d, i) => [`x${i}`, d])) }); // another order: right
    out.push({ ...right, x1: right.x0 }); // a divisor twice
  }
  if (q.kind === 'direct') out.push({ ...right, z: 0 }, { ...right, o: q.a }, { s: 1, z: 1, o: 1 });
  if (q.kind === 'yaqsim') out.push({ k: q.k, g: q.k }, { k: q.k, g: q.a }, { k: q.k, g: 1 });
  out.push({}, null);
  return out;
}

describe('the evidence of « تعيين القاسم المشترك الأكبر »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('tayin-pgcd', key));
    expect(points).toEqual(['P1', 'P2', 'P3'].map((p) => `4am_tayin-pgcd_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim of the WHOLE answer', () => {
    const y = { format: 'exam', kind: 'yaqsim', key: KEYS[2], a: 76, b: 19, k: 4 };
    const ev = trainerEvidence(y, { k: 4, g: 19 }, FIRST);
    expect(ev).toEqual({ key: KEYS[2], claim: { kind: 'pgcd', a: 76, b: 19, g: 19 } });
    expect(evidence.payloadOf('tayin-pgcd', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_tayin-pgcd_P3',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(trainerEvidence(y, { k: 4, g: 19 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...y, format: 'game' }, { k: 4, g: 19 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    // the right product, a wrong PGCD: the draft claimed « 76 = 19 × 4 » (true) — now the PGCD he wrote (false)
    expect(trainerEvidence(y, { k: 4, g: 4 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 76, b: 19, g: 4 });
    expect(trainerEvidence(y, { k: 3, g: 19 }, FIRST).claim).toEqual({ kind: 'pair', a: 76, b: 19, e: 3 });
    // PGCD(300 ; 0) = 300: the claim the server re-computes
    const d = {
      format: 'exam',
      kind: 'direct',
      key: KEYS[1],
      a: 300,
      zero: [300, 0],
      third: { kind: 'one', pair: [1, 300] },
    };
    expect(trainerEvidence(d, { s: 300, z: 300, o: 1 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 300, b: 0, g: 300 });
    expect(trainerEvidence(d, { s: 300, z: 0, o: 1 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 300, b: 0, g: 0 });
    expect(trainerEvidence(d, { s: 300, z: 300, o: 300 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 1, b: 300, g: 300 });
    // the lists right, the PGCD a common divisor that is not the greatest: the draft claimed the first list (true)
    const h = { format: 'exam', kind: 'hasr', key: KEYS[0], a: 20, b: 28, na: 6, nb: 6, g: 4 };
    const right = solution(h);
    expect(verifyClaim(trainerEvidence(h, right, FIRST).claim)).toBe(true);
    expect(trainerEvidence(h, { ...right, g: 2 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 20, b: 28, g: 2 });
    expect(verifyClaim(trainerEvidence(h, { ...right, y5: 14 }, FIRST).claim)).toBe(false);
    expect(evidence.caseEvidence()).toBe(null);
    expect(guardEvidence({ key: KEYS[0], claim: { kind: 'pgcd', a: 20, b: 28, g: 4 } }, false)).toBe(null);
  });

  it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the whole answer', () => {
    const seen = { hasr: 0, direct: 0, yaqsim: 0 };
    const verdicts = { right: 0, wrong: 0 };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 30; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
          if (!boxesOf(q)) {
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
            expect(ev?.key, q.kind).toBe(q.key);
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
    expect(verdicts.wrong).toBeGreaterThan(5000);
    expect(verdicts.right).toBeGreaterThan(300);
  });
});
