// The road and the knowledge map of trouver-le-pgcd: the shared checks of the map (authoring kit), then the lesson's own —
// the modules of the config against the keys that complete them, the memo quizzes computed, and no card that names the
// final mission's numbers.
import { describe, it, expect } from 'vitest';
import { describeKnowledge, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { NUMBERS, commonDivisors, euclid, gcd } from './math';
import { CARDS, KNOWLEDGE } from './knowledge';
import { K, MODULE_KEYS, STORY } from './story';
import { KEYS, journey } from './journey';
import { PLAN_OF } from './trainer';
import { evidence } from './evidence';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'trouver-le-pgcd';

describe('trouver-le-pgcd — the road and its modules', () => {
  it('the keys are the story’s, and the journey counts its stages and cards', () => {
    expect(KEYS).toEqual(['diviseurs-communs', 'lots-identiques', 'pgcd-facteurs', 'euclide']);
    expect(KEYS).toEqual([K.common, K.lots, K.factors, K.euclide]);
    expect(journey).toBeTruthy();
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(15);
    expect(Object.keys(PLAN_OF).sort()).toEqual(KNOWLEDGE.graph.nodes.map((n) => n.id).sort());
    expect(STORY.segments.length).toBe(STORY.islands.length - 1);
  });

  it('each module the world marks teaches what its keys prove; module 0 and the evaluation teach nothing', () => {
    const byNumber = Object.fromEntries(LESSON_CONFIG.modules.map((m) => [String(m.number), m]));
    for (const [m, keys] of Object.entries(MODULE_KEYS)) {
      const proved = new Set(keys.map((k) => evidence.learningPointOf(ID, k)));
      const taught = byNumber[m].teachesLearningPointIds ?? [];
      expect(taught.length, `module ${m}`).toBeGreaterThan(0);
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    // each of modules 1–4 is completed by the key of its own point
    expect([1, 2, 3, 4].map((m) => byNumber[m].teachesLearningPointIds)).toEqual([
      [`3e_${ID}_P1`],
      [`3e_${ID}_P4`],
      [`3e_${ID}_P2`],
      [`3e_${ID}_P3`],
    ]);
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['6'].stage).toBe('evaluation');
    expect(byNumber['6'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['5'].track).toBe('problem');
    expect(LESSON_CONFIG.id).toBe(ID);
    for (const m of LESSON_CONFIG.modules)
      expect(m.path.startsWith(`/courses/college/3e/nombres_calculs/${ID}/`)).toBe(true);
  });

  it('the memo quizzes: each right option computed, each wrong one false', () => {
    const [m1, m2, m3, m4] = Object.values(KNOWLEDGE.modules).flat();
    const right = (q) => q.options[q.correct];
    // K1: the common divisors of 16 and 24 (6 does not divide 16); PGCD(24 ; 40) = 8 (16 is the difference)
    expect(right(m1.memo.quiz[0])).toBe('1, 2, 4 et 8');
    expect(commonDivisors(16, 24)).toEqual([1, 2, 4, 8]);
    expect(right(m1.memo.quiz[1])).toBe(`$${gcd(24, 40)}$`);
    expect(40 - 24).toBe(16);
    // K2: 24 pencils, 36 rubbers: 12 cases of 2 and 3
    expect(right(m2.memo.quiz[0])).toBe('$12$');
    expect(right(m2.memo.quiz[1])).toBe('$2$ crayons et $3$ gommes');
    // K3: PGCD(2³ × 5 ; 2² × 5²) = 2² × 5 = 20; PGCD(2 × 3² ; 5 × 7) = 1
    expect(gcd(40, 100)).toBe(20);
    expect(right(m3.memo.quiz[0])).toBe('$2^2 \\times 5$');
    expect(gcd(18, 35)).toBe(1);
    // K4: 84 = 36 × 2 + 12, 36 = 12 × 3 + 0
    expect(euclid(84, 36).map((s) => s.r)).toEqual([12, 0]);
    expect(right(m4.memo.quiz[0])).toBe(`$${gcd(84, 36)}$`);
    expect(euclid(76, 28)[0]).toEqual({ a: 76, b: 28, q: 2, r: 20 });
    expect(right(m4.memo.quiz[1])).toBe('$28$ par $20$');
  });

  it('the map is the lesson’s own: no card names the final mission (1 462, 946, 86)', () => {
    const [m1, m2] = NUMBERS.mission.gaps;
    for (const s of stringsIn(KNOWLEDGE)) {
      for (const n of [m1, m2, NUMBERS.mission.plank])
        expect(s.replace(/\\,| /g, ''), s).not.toMatch(new RegExp(`(?<![0-9])${n}(?![0-9])`));
    }
    expect(CARDS.ofKey).toEqual({
      [K.common]: 'diviseurs-communs',
      [K.lots]: 'lots',
      [K.factors]: 'facteurs',
      [K.euclide]: 'euclide',
    });
  });
});
