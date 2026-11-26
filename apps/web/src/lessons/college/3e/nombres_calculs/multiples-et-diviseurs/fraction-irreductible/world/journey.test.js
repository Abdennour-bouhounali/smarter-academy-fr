// The road and the knowledge map of fraction-irreductible: the shared checks of the map (authoring kit), then the lesson's
// own — the modules of the config against the keys that complete them (they fail until `lesson.config.js` is written),
// the memo quizzes computed, and no card that names the final mission's numbers.
import { describe, it, expect } from 'vitest';
import { describeKnowledge, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { NUMBERS, gcd } from './math';
import { CARDS, KNOWLEDGE } from './knowledge';
import { K, MODULE_KEYS, STORY } from './story';
import { KEYS, journey } from './journey';
import { PLAN_OF } from './trainer';
import { evidence } from './evidence';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'fraction-irreductible';
const { strike: ST, stays: SY, pgcd: PG, result: RS } = NUMBERS;

describe('fraction-irreductible — the road and its modules', () => {
  it('the keys are the story’s, and the journey counts its stages and cards', () => {
    expect(KEYS).toEqual(['simplifier-facteurs', 'irreductible', 'diviser-par-le-pgcd', 'resultat-irreductible']);
    expect(KEYS).toEqual([K.strike, K.stays, K.pgcd, K.result]);
    expect(journey).toBeTruthy();
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(15);
    expect(Object.keys(PLAN_OF).sort()).toEqual(KNOWLEDGE.graph.nodes.map((n) => n.id).sort());
    expect(STORY.segments.length).toBe(STORY.islands.length - 1);
  });

  it('each key proves the point of its own learning: P2 ← K1, P1 ← K2, P4 ← K3, P3 ← K4', () => {
    expect(KEYS.map((k) => evidence.learningPointOf(ID, k))).toEqual([
      `3e_${ID}_P2`,
      `3e_${ID}_P1`,
      `3e_${ID}_P4`,
      `3e_${ID}_P3`,
    ]);
  });

  it('each module the world marks teaches what its keys prove (config)', () => {
    const byNumber = Object.fromEntries(LESSON_CONFIG.modules.map((m) => [String(m.number), m]));
    for (const [m, keys] of Object.entries(MODULE_KEYS)) {
      const proved = new Set(keys.map((k) => evidence.learningPointOf(ID, k)));
      const taught = byNumber[m].teachesLearningPointIds ?? [];
      expect(taught.length, `module ${m}`).toBeGreaterThan(0);
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    // each of modules 1–4 is completed by the key of its own point
    expect([1, 2, 3, 4].map((m) => byNumber[m].teachesLearningPointIds)).toEqual([
      [`3e_${ID}_P2`],
      [`3e_${ID}_P1`],
      [`3e_${ID}_P4`],
      [`3e_${ID}_P3`],
    ]);
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['6'].stage).toBe('evaluation');
    expect(byNumber['5'].track).toBe('problem');
    expect(LESSON_CONFIG.id).toBe(ID);
  });

  it('the memo quizzes: each right option computed, each wrong one false', () => {
    const [m1, m2, m3, m4] = Object.values(KNOWLEDGE.modules).flat();
    const right = (q) => q.options[q.correct];
    const frac = (n, d) => `$\\dfrac{${n}}{${d}}$`;
    const red = (n, d) => frac(...[n, d].map((x) => x / gcd(n, d)));
    // K1: 138/246 = 23/41; 2² × 13 over 2² × 19 = 13/19
    expect(right(m1.memo.quiz[0])).toBe(red(138, 246));
    expect(red(138, 246)).toBe(frac(23, 41));
    expect(right(m1.memo.quiz[1])).toBe(red(52, 76));
    expect(m1.memo.quiz[1].options.map((o) => o.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2'))).toContain('$26/38$');
    // K2: 65/96 is irreducible, the others are not; PGCD(65 ; 96) = 1
    expect(gcd(SY.mark, SY.gap)).toBe(1);
    expect(gcd(138, 246)).toBeGreaterThan(1);
    expect(gcd(238, 287)).toBe(7);
    expect(right(m2.memo.quiz[0])).toBe(frac(SY.mark, SY.gap));
    expect(right(m2.memo.quiz[1])).toBe('$1$');
    // K3: PGCD(722 ; 1 786) = 38, so 19/47; 361/893 stops early (19 is still common)
    expect(gcd(PG.mark, PG.gap)).toBe(PG.plank);
    expect(right(m3.memo.quiz[0])).toBe(frac(19, 47));
    expect(gcd(361, 893)).toBe(19);
    expect(right(m3.memo.quiz[1])).toBe('leur PGCD');
    // K4: 5/6 + 2/39 = 69/78 = 23/26 (the sum of the numerators over the sum of the denominators is the slip)
    expect(gcd(69, 78)).toBe(3);
    expect(right(m4.memo.quiz[0])).toBe(frac(23, 26));
    expect(RS.crews[0][0] * 13 + RS.crews[1][0] * 2).toBe(69);
    expect(m4.memo.quiz[0].options).toContain(frac(7, 45));
    expect(ST.gap).toBe(246);
  });

  it('the map is the lesson’s own: no card names the final mission (3/34, 85/87, 255, 2 958, 5/58)', () => {
    for (const s of stringsIn(KNOWLEDGE)) {
      const flat = s.replace(/\\,| | /g, '');
      for (const n of [255, 2958, 85, 87, 986, 174]) expect(flat, s).not.toMatch(new RegExp(`(?<![0-9])${n}(?![0-9])`));
      expect(flat, s).not.toMatch(/dfrac\{3\}\{34\}|dfrac\{5\}\{58\}/);
    }
    expect(CARDS.ofKey).toEqual({
      [K.strike]: 'facteurs',
      [K.stays]: 'irreductible',
      [K.pgcd]: 'pgcd',
      [K.result]: 'resultat',
    });
  });
});
