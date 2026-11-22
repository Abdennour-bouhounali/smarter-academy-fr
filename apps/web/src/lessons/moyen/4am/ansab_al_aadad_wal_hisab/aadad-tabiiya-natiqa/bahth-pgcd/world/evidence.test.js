import { describe, it, expect } from 'vitest';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { verifyClaim } from '../../../../../../common/gameworld/kit/claims';
import { guardEvidence } from '../../../../../../common/gameworld/kit/evidence';
import { evidence, trainerEvidence } from './evidence';
import { KEYS } from './journey';
import { KNOWLEDGE } from './knowledge';
import { check, solution, trainer } from './trainer';
import { euclid, gcd } from './math';
import { LESSON_CONFIG } from '../lesson.config';

const FIRST = { firstTry: true, helped: false };
/** The boxes of each kind of trainer question whose first try is evidence. */
const BOXES = { farq: ['e', 'g'], furuq: ['d', 'g'], baqi: ['q', 'r', 'e'], iqlidis: ['q', 'r', 'g'] };

/**
 * Answers a student can really write: the right one, every box off by a little, emptied, doubled, a decimal, a negative,
 * two boxes swapped — whole-wrong and HALF-wrong — and the mistakes of THIS lesson: the difference taken for the PGCD,
 * the sum or another number that makes a TRUE equality where the difference or the remainder is asked, the quotient
 * put in the place of the remainder, a remainder too big, the last quotient or a common divisor that is not the
 * greatest given for the PGCD, 0 for the PGCD.
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
  const steps = euclid(q.a, q.b);
  const [first] = steps;
  if (q.kind === 'farq') out.push({ ...right, e: q.a + q.b }, { ...right, e: g }, { ...right, g: q.a - q.b });
  if (q.kind === 'furuq') out.push({ ...right, g: q.a - q.b }, { ...right, g: 0 }, { ...right, d: q.a + q.b });
  if (q.kind === 'baqi')
    out.push(
      { ...right, e: first.q },
      { ...right, e: q.a - q.b },
      { q: first.q - 1, r: first.r + q.b, e: first.r + q.b },
      { q: first.r, r: first.q, e: first.q },
    );
  if (q.kind === 'iqlidis') {
    const smaller = [1, 2, 3, 5, 7].filter((d) => g % d === 0 && d < g);
    out.push({ ...right, g: steps.at(-1).q }, { ...right, g: 0 }, ...smaller.map((d) => ({ ...right, g: d })));
    out.push({ q: first.q - 1, r: first.r + q.b, g });
  }
  out.push({}, null);
  return out;
}

describe('the evidence of « البحث عن القاسم المشترك الأكبر »', () => {
  it('each key proves one الكفاءة of the lesson, by its catalogue id, and a module of the lesson teaches it', () => {
    const points = KEYS.map((key) => evidence.learningPointOf('bahth-pgcd', key));
    expect(points).toEqual(['P1', 'P2', 'P3', 'P4', 'P5'].map((p) => `4am_bahth-pgcd_${p}`));
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    for (const p of points) expect(taught.has(p), p).toBe(true);
  });

  it('only an exam answer given at the first try without help is sent, as a claim of the WHOLE answer', () => {
    const e = { format: 'exam', kind: 'iqlidis', key: KEYS[3], a: 1833, b: 546 };
    const ev = trainerEvidence(e, { q: 3, r: 195, g: 39 }, FIRST);
    expect(ev).toEqual({ key: KEYS[3], claim: { kind: 'pgcd', a: 1833, b: 546, g: 39 } });
    expect(evidence.payloadOf('bahth-pgcd', 'trainer', ev, 'att-1')).toEqual({
      attemptId: 'att-1',
      learningPoint: '4am_bahth-pgcd_P4',
      context: 'trainer',
      claim: ev.claim,
    });
    expect(trainerEvidence(e, { q: 3, r: 195, g: 39 }, { firstTry: true, helped: true })).toBe(null);
    expect(trainerEvidence({ ...e, format: 'game' }, { q: 3, r: 195, g: 39 }, FIRST)).toBe(null);
    expect(trainerEvidence({ format: 'exam', kind: 'tf', key: KEYS[0] }, { truth: true, reason: 0 }, FIRST)).toBe(null);
    // the right division, a wrong PGCD: the draft claimed the division (true) — now the PGCD he wrote (false)
    expect(trainerEvidence(e, { q: 3, r: 195, g: 4 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 1833, b: 546, g: 4 });
    expect(trainerEvidence(e, { q: 3, r: 190, g: 39 }, FIRST).claim).toEqual({
      kind: 'division',
      a: 1833,
      b: 546,
      q: 3,
      r: 190,
      fits: false,
    });
    // P1: the difference, then the PGCD
    const f = { format: 'exam', kind: 'farq', key: KEYS[0], a: 152, b: 95 };
    expect(trainerEvidence(f, { e: 57, g: 19 }, FIRST).claim).toEqual({ kind: 'pgcd', a: 152, b: 95, g: 19 });
    // 247 makes a TRUE equality but is not the difference asked: no evidence can be true
    expect(verifyClaim(trainerEvidence(f, { e: 247, g: 19 }, FIRST).claim)).toBe(false);
    // P3: the division, then the remainder in the equality — the whole answer is the division with the remainder
    const r = { format: 'exam', kind: 'baqi', key: KEYS[2], a: 962, b: 296 };
    expect(trainerEvidence(r, { q: 3, r: 74, e: 74 }, FIRST).claim).toEqual({
      kind: 'division',
      a: 962,
      b: 296,
      q: 3,
      r: 74,
      fits: false,
    });
    expect(verifyClaim(trainerEvidence(r, { q: 3, r: 74, e: 3 }, FIRST).claim)).toBe(false);
    // P5: no claim kind states the counts of steps — reported, not worked around
    expect(trainerEvidence({ format: 'exam', kind: 'sura', key: KEYS[4], a: 1003, b: 34 }, {}, FIRST)).toBe(null);
    expect(evidence.caseEvidence()).toBe(null);
    expect(guardEvidence({ key: KEYS[3], claim: { kind: 'pgcd', a: 1833, b: 546, g: 39 } }, false)).toBe(null);
  });

  it('for EVERY question of the trainer: the claim is true exactly when `check` accepts the whole answer', () => {
    const seen = { farq: 0, furuq: 0, baqi: 0, iqlidis: 0 };
    const verdicts = { right: 0, wrong: 0 };
    for (const card of KNOWLEDGE.graph.nodes.map((n) => n.id)) {
      for (let seed = 1; seed <= 30; seed += 1) {
        for (const q of trainer.makeSession(rng(seed * 7919 + 13), card)) {
          if (!BOXES[q.kind]) {
            // a tap, a true / false, the counts of « sura »: never evidence, right or wrong
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
