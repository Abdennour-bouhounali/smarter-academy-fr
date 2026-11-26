// The road and the knowledge map of multiples-et-diviseurs-communs: the shared checks of the map (authoring kit), then the
// lesson's own — the modules of the config against the keys that complete them (this test reads `../lesson.config`:
// it fails until the config is written), the memo quizzes computed, and no card that names the final mission's numbers.
import { describe, it, expect } from 'vitest';
import { describeKnowledge, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { NUMBERS, lcm, lcmOf, lcmPowers, togetherDay, valueOfPowers } from './math';
import { CARDS, KNOWLEDGE } from './knowledge';
import { K, MODULE_KEYS, STORY } from './story';
import { KEYS, journey } from './journey';
import { PLAN_OF } from './trainer';
import { evidence } from './evidence';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'multiples-et-diviseurs-communs';

describe('multiples-et-diviseurs-communs — the road and its modules', () => {
  it('the keys are the story’s, and the journey counts its stages and cards', () => {
    expect(KEYS).toEqual(['pilier-commun', 'ppcm-facteurs', 'traduire-rendez-vous', 'cinq-equipes']);
    expect(KEYS).toEqual([K.pilier, K.facteurs, K.rendezvous, K.equipes]);
    expect(journey).toBeTruthy();
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(15);
    expect(Object.keys(PLAN_OF).sort()).toEqual(KNOWLEDGE.graph.nodes.map((n) => n.id).sort());
    expect(STORY.segments.length).toBe(STORY.islands.length - 1);
    expect(STORY.islands).toHaveLength(7);
  });

  it('each module the world marks teaches what its keys prove; module 0 and the evaluation teach nothing', () => {
    const byNumber = Object.fromEntries(LESSON_CONFIG.modules.map((m) => [String(m.number), m]));
    for (const [m, keys] of Object.entries(MODULE_KEYS)) {
      const proved = new Set(keys.map((k) => evidence.learningPointOf(ID, k)));
      const taught = byNumber[m].teachesLearningPointIds ?? [];
      expect(taught.length, `module ${m}`).toBeGreaterThan(0);
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    // each of modules 1–3 is completed by the key of its own point (module 3: K3 and K4, both P3)
    expect([1, 2, 3].map((m) => byNumber[m].teachesLearningPointIds)).toEqual([
      [`3e_${ID}_P1`],
      [`3e_${ID}_P2`],
      [`3e_${ID}_P3`],
    ]);
    expect(MODULE_KEYS[3]).toEqual([K.pilier, K.rendezvous, K.equipes]);
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['5'].stage).toBe('evaluation');
    expect(byNumber['5'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['4'].track).toBe('problem');
    expect(Object.keys(MODULE_KEYS).sort()).toEqual(['1', '2', '3', '4']);
    expect(LESSON_CONFIG.id).toBe(ID);
    for (const m of LESSON_CONFIG.modules)
      expect(m.path.startsWith(`/courses/college/3e/nombres_calculs/${ID}/`)).toBe(true);
  });

  it('the memo quizzes: each right option computed, each wrong one false', () => {
    const [m1, m2, m3, m4] = Object.values(KNOWLEDGE.modules).flat();
    const right = (q) => q.options[q.correct];
    // K1: the smallest common multiple of 14 and 35 is 70 (490 is the product, 35 is no multiple of 14); 12 is common to 4 and 6
    expect(right(m1.memo.quiz[0])).toBe(`$${lcm(14, 35)}$`);
    expect(lcm(14, 35)).toBe(70);
    expect(35 % 14).not.toBe(0);
    expect(m1.memo.quiz[0].options).toContain(`$${14 * 35}$`);
    expect(right(m1.memo.quiz[1])).toBe('$12$');
    expect([12, 10, 16].map((n) => n % 4 === 0 && n % 6 === 0)).toEqual([true, false, false]);
    // K2: 2 × 3² and 3 × 5 → 2 × 3² × 5 (90); 2³ and 5² have nothing in common → their product
    const big = lcmPowers(
      [
        { p: 2, e: 1 },
        { p: 3, e: 2 },
      ],
      [
        { p: 3, e: 1 },
        { p: 5, e: 1 },
      ],
    );
    expect(right(m2.memo.quiz[0])).toBe('$2 \\times 3^2 \\times 5$');
    expect(valueOfPowers(big)).toBe(90);
    expect(lcm(18, 15)).toBe(90);
    expect(right(m2.memo.quiz[1])).toBe('$2^3 \\times 5^2$');
    expect(lcm(8, 25)).toBe(200);
    // K3: wheels of 12 and 18 teeth → 36 teeth, 3 and 2 turns; buses every 12 and 15 min from 7 h 00 → 60 min → 8 h 00
    expect(right(m3.memo.quiz[0])).toBe(`$${lcm(12, 18) / 12}$ tours`);
    expect(lcm(12, 18) / 12).toBe(3);
    expect(m3.memo.quiz[0].options).toContain(`$${lcm(12, 18) / 18}$ tours`);
    expect(lcm(12, 15)).toBe(60);
    expect(7 * 60 + lcm(12, 15)).toBe(8 * 60);
    expect(right(m3.memo.quiz[1])).toBe('$8$ h $00$');
    // K4: rests of 3 and 5 days → cycles 4 and 6 → day 13 (day 16 is the rest days as the cycle); cycle = 1 + 7 = 8
    expect(togetherDay([4, 6])).toBe(13);
    expect(right(m4.memo.quiz[0])).toBe('$13$');
    expect(m4.memo.quiz[0].options).toContain(`$${1 + lcm(3, 5)}$`);
    expect(right(m4.memo.quiz[1])).toBe('$8$ jours');
    expect(lcmOf([4, 6])).toBe(12);
  });

  it('the map is the lesson’s own: no card names the final mission (the day 681, its 680, 2 129, 2 721)', () => {
    const { mission } = NUMBERS;
    const cycles = mission.rests.map((r) => r + 1);
    const taboo = [lcmOf(cycles), togetherDay(cycles), lcmOf(mission.rests) + 1, cycles.reduce((v, c) => v * c, 1) + 1];
    expect(taboo).toEqual([680, 681, 2129, 2721]);
    for (const s of stringsIn(KNOWLEDGE)) {
      for (const n of taboo) expect(s.replace(/\\,| | /g, ''), s).not.toMatch(new RegExp(`(?<![0-9])${n}(?![0-9])`));
      // the abbreviation is never WRITTEN (the key's id `ppcm-facteurs` is the design's locked id, never shown)
      expect(s.replace(K.facteurs, '')).not.toMatch(/PPCM|ppcm/);
    }
    expect(CARDS.ofKey).toEqual({
      [K.pilier]: 'pilier',
      [K.facteurs]: 'facteurs',
      [K.rendezvous]: 'rendez-vous',
      [K.equipes]: 'equipes',
    });
  });
});
