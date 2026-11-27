// The road and the knowledge map of thales-configuration-papillon: the shared checks of the map (authoring kit), then
// the lesson's own — ONE list of keys, the modules of the config against the keys that complete them, the memo quizzes
// and the cards' numbers computed from their figures.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeKnowledge, plain, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { chainHolds } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { LESSON_CONFIG } from '../lesson.config';
import { CARDS, KNOWLEDGE } from './knowledge';
import { KEYS, journey } from './journey';
import { ladder } from './practice';
import { MODULE_KEYS, STORY } from './story';
import { PLAN_OF } from './trainer';
import { evidence, POINTS } from './evidence';
import { FIGURES, K, equal, minus, over, plus, read, times, write } from './math';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'thales-configuration-papillon';
const here = dirname(fileURLToPath(import.meta.url));
const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);

describe(`${ID} — the road and its modules`, () => {
  it('ONE list of keys, in the order of the docks; math.js holds the same ids; the status script reads it', () => {
    expect(KEYS).toEqual([K.papillon, K.calcul]);
    const text = readFileSync(join(here, 'journey.js'), 'utf8');
    const found = [...(/KEYS\s*=\s*\[([^\]]*)\]/.exec(text)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(found).toEqual(KEYS);
    // forges.js (the forges agent's) quotes each one once it is written
    const forges = readFileSync(join(here, 'forges.js'), 'utf8');
    if (!forges.includes('SCAFFOLD')) for (const k of KEYS) expect(forges.includes(`'${k}'`), k).toBe(true);
    expect(existsSync(join(here, 'story.js'))).toBe(true);
  });

  it('the journey counts the docks the story plays and the cards of the map; every card has a plan', () => {
    expect(journey).toBeTruthy();
    expect(STORY.stages).toHaveLength(3);
    expect(KNOWLEDGE.graph.nodes.length).toBeLessThanOrEqual(15);
    expect(Object.keys(PLAN_OF).sort()).toEqual(KNOWLEDGE.graph.nodes.map((n) => n.id).sort());
    // « Espace brevet » is open from the start, with no key and no run (owner, 2026-11-26)
    expect(journey.examOpen([], {})).toBe(true);
    expect(journey.examOpen(KEYS, {})).toBe(true);
    const firstRuns = Object.fromEntries(ladder.nodes.map((n, i) => [ladder.levelId(i, 0), { stars: 1, best: 100 }]));
    expect(journey.examOpen(KEYS, firstRuns)).toBe(true);
    expect(journey.examOpen(KEYS.slice(0, 1), firstRuns)).toBe(true);
    // what « Ensuite » advises is unchanged: the game first, until the first run of each key is passed
    expect(journey.nextStep({ finished: true, openKeys: KEYS, practice: {} }).do).toBe('game');
    expect(journey.nextStep({ finished: true, openKeys: KEYS, practice: firstRuns }).do).not.toBe('game');
  });

  it('each module the world marks teaches what its keys prove; P2 by the answers that carry it (evidence.js)', () => {
    const byNumber = Object.fromEntries(LESSON_CONFIG.modules.map((m) => [String(m.number), m]));
    expect(POINTS).toEqual({ [K.papillon]: 'P1', [K.calcul]: 'P3' });
    for (const [m, keys] of Object.entries(MODULE_KEYS)) {
      // a key proves its point; both keys' answers prove P2 (the ratio across, the length from the vertex)
      const proved = new Set([...keys.map((k) => evidence.learningPointOf(ID, k)), `3e_${ID}_P2`]);
      const taught = byNumber[m].teachesLearningPointIds ?? [];
      expect(taught.length, `module ${m}`).toBeGreaterThan(0);
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['4'].stage).toBe('evaluation');
    expect(byNumber['4'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['3'].track).toBe('problem');
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    expect([...taught].sort()).toEqual([1, 2, 3].map((n) => `3e_${ID}_P${n}`));
    for (const m of LESSON_CONFIG.modules)
      expect(m.path.startsWith('/courses/college/3e/espace_geometrie/')).toBe(true);
  });
});

/** The value of a quiz option « $28$ », « $\\dfrac{3}{4}$ », or null for one that is not a number. */
const valueOf = (s) => {
  const t = s
    .replace(/\$/g, '')
    .replace('{,}', ',')
    .replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, '$1/$2');
  try {
    return write(read(t));
  } catch {
    return null;
  }
};
const rightOf = (quiz, test) =>
  quiz.options
    .map((o, i) => [i, test(o)])
    .filter(([, t]) => t)
    .map(([i]) => i);

describe(`${ID} — the knowledge map’s own`, () => {
  const B = FIGURES.butterfly[1];
  it('two memo sheets, one per key, each on its notebook card', () => {
    expect(
      Object.values(KNOWLEDGE.modules)
        .flat()
        .map((x) => x.id),
    ).toEqual(KEYS);
    for (const key of KEYS) expect(card(CARDS.ofKey[key])).toMatchObject({ notebook: true, requires: key });
    expect(card(CARDS.fallback)).toBeTruthy();
  });

  it('every quiz has ONE right option, computed here', () => {
    const [m1, m2] = Object.values(KNOWLEDGE.modules)
      .flat()
      .map((x) => x.memo.quiz);
    expect(m1[0].options[m1[0].correct]).toBe('$\\dfrac{OB}{OF}$');
    expect(rightOf(m1[1], (o) => valueOf(o) != null && equal(valueOf(o), over(B.VM, B.VB)))).toEqual([m1[1].correct]);
    const AE = plus(B.VM, B.VB);
    expect(rightOf(m2[0], (o) => valueOf(o) != null && equal(valueOf(o), minus(AE, B.VM)))).toEqual([m2[0].correct]);
    expect(rightOf(m2[1], (o) => valueOf(o) != null && equal(times(B.VM, valueOf(o)), times(B.VB, B.VN)))).toEqual([
      m2[1].correct,
    ]);
  });

  it('the figures of the map are Thalès figures, and the numbers the cards state are computed from them', () => {
    for (const f of [B, FIGURES.nested[1]]) expect(chainHolds([f.VM, f.VB], [f.VN, f.VC], [f.MN, f.BC])).toBe(true);
    expect(card('exemple-calcul').subtitle).toBe(`$OF = ${B.VC}$`);
    expect(card('a-travers').context.parts[1].text).toContain(`= ${write(plus(B.VM, B.VB))} - ${B.VM} = ${B.VB}$`);
    expect(card('emboites').context.text).toContain('= 31 + 15{,}5 = 46{,}5$');
  });

  it('a card title is plain text; the memo’s hook, trap and exam are plain; no sentence says « faux »', () => {
    for (const n of KNOWLEDGE.graph.nodes) plain(n.title);
    for (const x of Object.values(KNOWLEDGE.modules).flat()) for (const f of ['hook', 'trap', 'exam']) plain(x.memo[f]);
    for (const s of stringsIn(KNOWLEDGE.graph.nodes.map((n) => ({ ...n, edges: null }))))
      expect(s).not.toMatch(/faux/i);
  });
});
