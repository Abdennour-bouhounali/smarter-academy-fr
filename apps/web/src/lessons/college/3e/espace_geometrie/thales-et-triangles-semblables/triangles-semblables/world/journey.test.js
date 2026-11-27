// The road and the knowledge map of triangles-semblables: the shared checks of the map (authoring kit), then the lesson's
// own — ONE list of keys, the modules of the config against the keys that complete them, the memo quizzes and the cards'
// numbers computed from their figures. `../lesson.config` is the config the main session writes at assembly: the test
// of the modules fails with SCAFFOLD until then.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeKnowledge, plain, stringsIn } from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { sameRatio } from '../../../../../../common/gameworld/kit/authoring/test/ratios';
import { LESSON_CONFIG } from '../lesson.config';
import { CARDS, KNOWLEDGE } from './knowledge';
import { KEYS, journey } from './journey';
import { ladder } from './practice';
import { MODULE_KEYS, STORY } from './story';
import { PLAN_OF } from './trainer';
import { evidence, POINTS } from './evidence';
import { FIGURES, K, equal, minus, over, plus, read, times, write } from './math';

describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: CARDS });

const ID = 'triangles-semblables';
const here = dirname(fileURLToPath(import.meta.url));
const card = (id) => KNOWLEDGE.graph.nodes.find((n) => n.id === id);

describe(`${ID} — the road and its modules`, () => {
  it('ONE list of keys, in the order of the docks; math.js holds the same ids; the status script reads it', () => {
    expect(KEYS).toEqual([K.cotes, K.angles]);
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

  it('the modules need the keys of their docks: 1 → K1, 2 → K1 + K2, 3 (the mission) → K1 + K2', () => {
    expect(MODULE_KEYS).toEqual({ 1: [K.cotes], 2: [K.cotes, K.angles], 3: [K.cotes, K.angles] });
  });

  it('each module the world marks teaches what its keys prove; P3 and P4 by the answers that carry them (evidence.js)', () => {
    const byNumber = Object.fromEntries(LESSON_CONFIG.modules.map((m) => [String(m.number), m]));
    expect(POINTS).toEqual({ [K.cotes]: 'P1', [K.angles]: 'P2' });
    for (const [m, keys] of Object.entries(MODULE_KEYS)) {
      // a key proves its point; the answers of both keys prove P3 and P4
      const proved = new Set([...keys.map((k) => evidence.learningPointOf(ID, k)), `3e_${ID}_P3`, `3e_${ID}_P4`]);
      const taught = byNumber[m].teachesLearningPointIds ?? [];
      expect(taught.length, `module ${m}`).toBeGreaterThan(0);
      for (const p of taught) expect(proved.has(p), `module ${m} ${p}`).toBe(true);
    }
    expect(byNumber['0'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['4'].stage).toBe('evaluation');
    expect(byNumber['4'].teachesLearningPointIds).toBeUndefined();
    expect(byNumber['3'].track).toBe('problem');
    const taught = new Set(LESSON_CONFIG.modules.flatMap((m) => m.teachesLearningPointIds ?? []));
    expect([...taught].sort()).toEqual([1, 2, 3, 4].map((n) => `3e_${ID}_P${n}`));
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
  const S = FIGURES.sides[0];
  const [d1, d2] = FIGURES.angles.similar[0];
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
    // k, from the shortest sides: DEF's over ABC's
    expect(rightOf(m1[0], (o) => valueOf(o) != null && equal(valueOf(o), over(S.b[0], S.a[0])))).toEqual([
      m1[0].correct,
    ]);
    // the longest side of the second: the first's longest × k
    expect(rightOf(m1[1], (o) => valueOf(o) != null && equal(valueOf(o), times(S.a[2], over(S.b[0], S.a[0]))))).toEqual(
      [m1[1].correct],
    );
    // the third angle: 180 − the two
    expect(rightOf(m2[0], (o) => valueOf(o) != null && equal(valueOf(o), minus(minus('180', d1), d2)))).toEqual([
      m2[0].correct,
    ]);
    expect(m2[1].options[m2[1].correct]).toBe('un second angle égal');
  });

  it('the figures of the map are similar triangles, and the numbers the cards state are computed from them', () => {
    expect(sameRatio([S.b[0], S.a[0]], [S.b[1], S.a[1]])).toBe(true);
    expect(sameRatio([S.b[0], S.a[0]], [S.b[2], S.a[2]])).toBe(true);
    expect(card('cotes').context.text).toContain('\\dfrac{6}{4} = \\dfrac{7{,}5}{5} = \\dfrac{9}{6} = \\dfrac{3}{2}');
    expect(card('exemple-cote').subtitle).toBe(`$${S.a[1]} \\times \\dfrac{3}{2} = 7{,}5$`);
    expect(write(times(S.a[1], S.k))).toBe(S.b[1]);
    expect(card('troisieme').context.text).toContain(`180 - ${d1} - ${d2} = ${write(minus(minus('180', d1), d2))}`);
    // the inverse coefficient is the inverse
    expect(equal(over(S.a[0], S.b[0]), over('1', S.k))).toBe(true);
    expect(equal(plus('1', '1'), '2')).toBe(true);
  });

  it('a card title is plain text; the memo’s hook, trap and exam are plain; no sentence says « faux »', () => {
    for (const n of KNOWLEDGE.graph.nodes) if (!n.title.includes('$')) plain(n.title);
    for (const x of Object.values(KNOWLEDGE.modules).flat()) for (const f of ['hook', 'trap', 'exam']) plain(x.memo[f]);
    for (const s of stringsIn(KNOWLEDGE.graph.nodes.map((n) => ({ ...n, edges: null }))))
      expect(s).not.toMatch(/faux/i);
  });
});
