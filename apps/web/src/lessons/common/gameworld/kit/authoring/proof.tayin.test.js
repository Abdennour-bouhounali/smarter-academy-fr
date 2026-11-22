/**
 * PROOF of the authoring kit on a second real lesson — determining the PGCD (lesson 5 of unit 1, 4AM: three keys met on
 * four convoys with a purse, one of them a gap of 0 cells): the shared suites run on its world and pass, and its
 * `math.js` re-exports `numbers.js` (since 2026-11-20: the copies it held are gone). What its data does past the limits
 * lesson 6 proved is listed in `describeLimits` with the number ITS walks measured.
 */
import { describe, it, expect } from 'vitest';
import * as N from './numbers';
import {
  describeEvidence,
  describeForges,
  describeKnowledge,
  describeLimits,
  describeSitting,
  describeStory,
  describeTrainer,
} from './test/suites.js';
import * as M from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/math';
import {
  NUMBERS,
  STORY,
  TABLETS,
  roadOf,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/story';
import { FORGES } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/forges';
import { KEYS } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/journey';
import { KNOWLEDGE } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/knowledge';
import { PRACTICE_MAP } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/practice';
import {
  evidence,
  trainerEvidence,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/evidence';
import {
  PLAN_OF,
  answerLabel,
  check,
  solution,
  trainer,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/trainer';
import { lesson } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/index';
import {
  LEVELS,
  sittings,
} from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/world/sitting';
import { SCRIPT } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/board/script';
import { LESSON_CONFIG } from '../../../../moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/tayin-pgcd/lesson.config';

const ID = 'tayin-pgcd';
/**
 * Where this lesson's data goes past what lesson 6 measured — screens its OWN walks of 2026-11-19 played at the three
 * sizes (its commit e4dccdb2): forge ⚡'s rule of four clauses and its chips, forge 🎯's column heading and tile, the
 * tablet ⚡ with two notes.
 */
const LIMITS_OF_LESSON_5 = { ruleText: 184, slotHeading: 39, tile: 35, chip: 61, tabletNotes: 2 };
const S = STORY.text.say;
const O = STORY.text.objective;
const R = STORY.text.recall;

describeStory({
  id: ID,
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  tablet: { notes: LIMITS_OF_LESSON_5.tabletNotes },
  pairs: [NUMBERS.use.gaps, NUMBERS.against.gaps, NUMBERS.boss.piers],
  sentences: [S.headOk(32, 8, 15, S.next.lists), S.tailOk(44, 4, 0), O.make('lists'), O.tail(44, 8, 15), R.paid(4, 15)],
  before: {
    'hasr-wa-taqatu': {
      words: /قاسم|قواسم|مشترك|قائمة|القائمتين|PGCD|الأكبر|أطول/,
      lines: [STORY.text.subtitle, S.hello, S.b44, O.make('lists'), O.carry('lists', 8, 19), R.first(32, 8)],
    },
    'nataij-mubashira': {
      words: /PGCD|القاسم المشترك|نفسه[ .،]|دائمًا|أطول/,
      lines: [S.same, S.d27, S.e27, S.f0, O.make('same'), O.make('full'), O.standing],
    },
    'b-yaqsim-a': {
      words: /PGCD|القاسم المشترك|يقسم|أصغر|الأقصر|أطول/,
      lines: [S.nest, S.h76, S.headOk(19, 19, 4, S.next.nest), O.make('nest'), O.tail(76, 19, 4)],
    },
  },
});

const fired = (list) => list.map(([a, b]) => ({ a, b }));
const LISTS = fired([
  [32, 4],
  [44, 4],
]);
const ROADS = {
  AT_ONCE: {
    'hasr-wa-taqatu': LISTS,
    'nataij-mubashira': fired([[27, 27]]),
    'b-yaqsim-a': fired([
      [19, 19],
      [76, 19],
    ]),
  },
  WALKED: {
    'hasr-wa-taqatu': fired([[32, 8], [44, 8], [32, 2], [44, 2], ...LISTS.map((r) => [r.a, r.b])]),
    'nataij-mubashira': fired([
      [27, 9],
      [27, 27],
    ]),
    'b-yaqsim-a': fired([
      [19, 38],
      [19, 19],
      [76, 19],
    ]),
  },
};
const BEFORE = { 'nataij-mubashira': LISTS, 'b-yaqsim-a': [...LISTS, ...fired([[27, 27]])] };
const asSet = (prefix, xs) => Object.fromEntries(xs.map((d, i) => [`${prefix}${i + 1}`, d]));
describeForges({
  forges: FORGES,
  keys: KEYS,
  roads: ROADS,
  before: BEFORE,
  tiles: { 'hasr-wa-taqatu': 16, 'nataij-mubashira': 16, 'b-yaqsim-a': 9 },
  solve: {
    'hasr-wa-taqatu': (c) => ({
      ...asSet('a', [...N.divisorsOf(c.A)].reverse()),
      ...asSet('b', N.divisorsOf(c.B)),
      ...asSet('c', N.commonDivisors(c.A, c.B)),
      g: N.gcd(c.A, c.B),
    }),
    'nataij-mubashira': (c) => ({ s: c.same, z: c.zero, o: 1, t: N.gcd(...c.turn) }),
    'b-yaqsim-a': (c) => ({ q: c.A / c.B, g: N.gcd(c.A, c.B) }),
  },
  forbidden: {
    'hasr-wa-taqatu': /احصر|قاطع|قاسم|قواسم|مشترك|PGCD/,
    'nataij-mubashira': /مباشر|PGCD|قاسم/,
    'b-yaqsim-a': /يقسم|قاسم|PGCD|الأصغر الأكبر/,
  },
  bank: ID,
});

const CARDS = KNOWLEDGE.graph.nodes.map((n) => n.id);
describeEvidence({
  id: ID,
  keys: KEYS,
  evidence,
  trainerEvidence,
  trainer,
  check,
  solution,
  cards: CARDS,
  config: LESSON_CONFIG,
  // the boxes of a list question are as many as the divisors it lists
  boxes: (q) =>
    q.kind === 'hasr'
      ? [...Array.from({ length: q.na }, (_, i) => `x${i}`), ...Array.from({ length: q.nb }, (_, i) => `y${i}`), 'g']
      : q.kind === 'direct'
        ? ['s', 'z', 'o']
        : q.kind === 'yaqsim'
          ? ['k', 'g']
          : null,
  kinds: ['hasr', 'direct', 'yaqsim'],
  seeds: 10,
  minPerKind: 10,
  mistakes: (q, right) =>
    q.kind === 'direct'
      ? [
          { ...right, z: 0 },
          { ...right, o: q.a },
        ]
      : q.kind === 'yaqsim'
        ? [
            { k: q.k, g: q.k },
            { k: q.k, g: 1 },
          ]
        : [{ ...right, g: Math.min(q.a, q.b) }],
});
describeTrainer({
  trainer,
  check,
  solution,
  answerLabel,
  evidenceOf: trainerEvidence,
  planOf: PLAN_OF,
  cards: CARDS,
  kinds: ['direct', 'hasr', 'tap', 'tf', 'yaqsim'],
  seeds: 10,
});
// its map was laid out before lesson 6's walk raised the label's distance from a row to 8.5 % (journey.test.js: 7)
describeKnowledge({ knowledge: KNOWLEDGE, keys: KEYS, cards: lesson.cards, layout: { rowGap: 7 } });
describeLimits({
  forges: FORGES,
  keys: KEYS,
  tablets: TABLETS,
  objectives: [O.make('lists'), O.make('same'), O.make('full'), O.make('nest'), O.carry('lists', 8, 19), O.standing],
  knowledge: KNOWLEDGE,
  practiceMap: PRACTICE_MAP,
  script: SCRIPT,
  limits: LIMITS_OF_LESSON_5,
});
describeSitting({ id: ID, lesson, sittings, levels: LEVELS });

describe('the lesson’s math.js is numbers.js', () => {
  it('every helper it gives the lesson is the kit’s own, and so is the story’s road', () => {
    const shared = Object.keys(M).filter((name) => name !== 'NUMBERS');
    expect(shared.length).toBeGreaterThan(10);
    for (const name of shared) expect(M[name], name).toBe(N[name]);
    expect(roadOf).toBe(N.roadOf);
  });
});
