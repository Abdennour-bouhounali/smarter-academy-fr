// The road and the knowledge map of decomposer-en-facteurs-premiers: the shared checks of the map (authoring kit), then
// the lesson's own — the modules of the config against the keys that complete them, the memo quizzes computed, and no
// card that names the last bridge's decomposition.
import { describe, it, expect } from 'vitest';
import { describeKnowledge, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { LESSON_CONFIG } from '../lesson.config';
import { BOSS_A, isPrime, powTex, powersOf, primeFactors } from './math';
import { CARDS, KNOWLEDGE } from './knowledge';
import { K, MODULE_KEYS, STORY } from './story';
import { KEYS, journey } from './journey';
import { PLAN_OF } from './trainer';
import { evidence } from './evidence';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'decomposer-en-facteurs-premiers';

describe('decomposer-en-facteurs-premiers — the road and its modules', () => {
  it('the keys are the story’s, and the journey counts its stages and cards', () => {
    expect(KEYS).toEqual([K.ladder, K.powers, K.stop, K.tool]);
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
      // what a module teaches is proved by one of the keys it needs — or by the key it is completed with (P3 ← key 4)
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['6'].stage).toBe('evaluation');
    expect(byNumber['6'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['5'].track).toBe('problem');
    for (const m of LESSON_CONFIG.modules) expect(m.path.startsWith('/courses/college/3e/nombres_calculs/')).toBe(true);
  });

  it('the memo quizzes: each right option computed, each wrong one false', () => {
    const items = Object.values(KNOWLEDGE.modules).flat();
    const [m1, m2, m3, m4] = items;
    // key 1: the first prime dividing 495 is 3; after 60 = 2 × 30, 30 is divided by 2 again
    expect(m1.memo.quiz[0].options[m1.memo.quiz[0].correct]).toBe(`$${primeFactors(495)[0]}$`);
    expect(m1.memo.quiz[1].options[m1.memo.quiz[1].correct]).toBe(`$${primeFactors(30)[0]}$`);
    // key 2: 495 = 3² × 5 × 11; 2³ × 3² = 72 (36 is the misreading 6 × 6, 30 neither)
    expect(m2.memo.quiz[0].options[m2.memo.quiz[0].correct]).toBe(`$${powTex(powersOf(495))}$`);
    expect(m2.memo.quiz[1].options[m2.memo.quiz[1].correct]).toBe('$72$');
    // key 3: for 97, the primes whose square does not pass 97; 143 = 11 × 13 is not prime
    expect(m3.memo.quiz[0].options[0]).toBe('$2, 3, 5, 7$');
    expect(11 * 11).toBeGreaterThan(97);
    expect(isPrime(143)).toBe(false);
    expect(m3.memo.quiz[1].options[m3.memo.quiz[1].correct]).toBe('non');
    // key 4: 2 431 = 11 × 221; 3 127 = 53 × 59 — the sheet stops on 53
    expect(2431 % 11).toBe(0);
    expect(m4.memo.quiz[0].options[m4.memo.quiz[0].correct]).toBe('$0$');
    expect(primeFactors(3127)).toEqual([53, 59]);
  });

  it('the map is the lesson’s own: no card names the last bridge’s decomposition (the mission stays the mission’s)', () => {
    const boss = powTex(powersOf(BOSS_A));
    for (const s of stringsIn(KNOWLEDGE)) {
      expect(s.includes(boss), s).toBe(false);
      expect(s, s).not.toMatch(/(?<![0-9])504(?![0-9])/);
    }
    expect(CARDS.ofKey).toEqual({
      [K.ladder]: 'echelle',
      [K.powers]: 'puissances',
      [K.stop]: 'arret',
      [K.tool]: 'tableur',
    });
  });
});
