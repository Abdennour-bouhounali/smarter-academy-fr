// THE STORY of trouver-le-pgcd: the shared checks (authoring kit), then what is this road's own — four convoys whose
// purses pay the PGCD and not the next common plank, the WHOLE instruction of every step, the card on the right, the
// forges on their islands, the final mission as a convoy that ends the story, and no default of the pilot's store.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  buildersOf,
  describeStory,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { T as WORLD } from '../../../../../../common/gameworld/divisorIsles/strings';
import { isPrime, primeFactors } from '../../../../../../common/gameworld/divisorIsles/factorLadder';
import { NUMBERS, SHEET_LAST, commonDivisors, euclid, gcd } from './math';
import { K, MODULE_KEYS, STORY, TABLETS } from './story';
import { KEYS } from './journey';

const ID = 'trouver-le-pgcd';
const T = STORY.text;
const { twins: TW, factors: FC, euclide: EU, mission: MI } = NUMBERS;
const CONVOYS = ['jumeaux', 'grands', 'euclide', 'jetee'];
const GAPS = [TW.gaps, FC.gaps, EU.gaps, MI.gaps];
/** The island where each key's forge opens (the design page's road) — what the hooks of story.js must do. */
const FORGE_ISLAND = { [K.common]: 2, [K.lots]: 2, [K.factors]: 4, [K.euclide]: 6 };

/**
 * A game the story's hooks read: the segments, the keys held, the plank in hand, the purse of each convoy (the coins its
 * standing bridges took), and the world's commands — what `Game.js` gives them (`convoyOf`, `convoyTail`, `purseOf`).
 */
function fake({ stage = 0, keys = [], held = null, log = [] } = {}) {
  const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
  const opened = [];
  const said = [];
  const modules = [];
  const convoyOf = (seg) => (seg?.convoy ? segs.filter((s) => s.convoy === seg.convoy) : null);
  return {
    T,
    state: { stage, keys: [...keys], held },
    segs,
    isl: STORY.islands,
    flags: {},
    log,
    opened,
    said,
    modules,
    convoyOf,
    convoyTail: (seg) => Boolean(convoyOf(seg)) && convoyOf(seg)[0] !== seg,
    purseOf(seg) {
      const of = STORY.convoys[seg?.convoy]?.purse;
      if (of == null) return null;
      const paid = convoyOf(seg)
        .filter((s) => s.complete)
        .reduce((n, s) => n + s.a / s.builtWith, 0);
      return { of, left: of - paid, n: 2 };
    },
    openForge: (k) => opened.push(k),
    say: (s) => said.push(s),
    onModule: (m) => modules.push(m),
    refreshObjective() {},
    save() {},
  };
}

/** Sentences the story's functions build, with the arguments the road gives them (0, 1, 2 and 11+ where they count). */
const BUILT = [
  ...CONVOYS.map((c) => T.objective.make(c)),
  ...CONVOYS.flatMap((c, i) => [
    T.objective.carry(c, 1, 0),
    T.objective.carry(c, 18, 1),
    T.objective.carry(c, 2, GAPS[i][0]),
  ]),
  T.objective.tail(TW.gaps[1], TW.plank, 7),
  T.objective.tail(EU.gaps[1], EU.plank, 802),
  T.objective.convoyBack(STORY.islands[0].name),
  ...GAPS.map(([, b]) => T.say.tailAsk(b)),
  T.say.headOk(TW.gaps[0], TW.plank, 10, TW.gaps[1]),
  T.say.headOk(EU.gaps[0], EU.plank, 802, EU.gaps[1]),
  T.say.tailOk(TW.gaps[1], TW.plank, 7),
  T.say.tailOk(MI.gaps[1], MI.plank, 27),
  T.say.tailOk(FC.gaps[1], 1, 0),
  T.say.gap(1),
  T.say.gap(36),
  T.say.gapShort(9),
  T.say.convoyBack(STORY.islands[2].name, 1),
  T.say.convoyBack(STORY.islands[4].name, 10403),
  T.say.convoyReset(52015),
  T.say.crafted(10403),
  T.recall.bridge(1736, 28, 62),
  T.recall.first(EU.gaps[0], EU.plank),
  T.recall.paid(1, 14),
  T.recall.paid(5, 0),
  T.recall.plank(9, [
    { a: 90, did: 'fills' },
    { a: 54, did: 'coins' },
  ]),
  T.recall.plank(27, [{ a: 90, did: 'open' }]),
];

/** The words of each key's name and of what it states: none in a sentence played before its forge, nor in a name. */
const KEY1 = /commun|PGCD|plus grand|plus long|diviseur(?!s\s*:)/i;
const KEY2 = /identique|panier|partag/i;
const KEY3 = /exposant|plus petit|commun/i;
const KEY4 = /dernier reste|n’est pas 0|non nul|algorithme|Euclide/i;
const opening = [
  T.title,
  T.subtitle,
  T.say.hello,
  T.objective.make('jumeaux'),
  T.objective.carry('jumeaux', 27, 15),
  T.objective.carry('jumeaux', 9, 5),
  T.objective.tail(54, 9, 5),
  T.objective.convoyBack(STORY.islands[0].name),
  T.say.tailAsk(54),
  T.say.headOk(90, 9, 5, 54),
  T.say.headOk(90, 18, 10, 54),
  T.say.tailOk(54, 18, 7),
  T.say.gap(9),
  T.say.convoyBack(STORY.islands[0].name, 0),
  T.say.crafted(18),
  T.recall.first(90, 18),
  T.recall.paid(5, 10),
  T.recall.plank(18, [
    { a: 90, did: 'fills' },
    { a: 54, did: 'fills' },
  ]),
];
const toKey3 = [
  T.say.grands,
  T.objective.make('grands'),
  T.objective.carry('grands', 14, 193),
  T.objective.tail(980, 28, 131),
  T.say.tailAsk(980),
  T.say.headOk(1736, 14, 69, 980),
  T.say.tailOk(980, 28, 96),
  T.recall.first(1736, 28),
  T.recall.plank(14, [
    { a: 1736, did: 'fills' },
    { a: 980, did: 'coins' },
  ]),
];
const toKey4 = [
  T.say.euclide,
  T.objective.make('euclide'),
  T.objective.carry('euclide', 20806, 807),
  T.objective.tail(31209, 10403, 802),
  T.say.tailAsk(31209),
  T.say.headOk(52015, 10403, 802, 31209),
  T.say.tailOk(31209, 10403, 799),
  T.recall.plank(20806, [{ a: 52015, did: 'open' }]),
];

describeStory({
  id: ID,
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  sentences: BUILT,
  before: {
    [K.common]: { words: KEY1, lines: opening },
    [K.lots]: { words: KEY2, lines: opening },
    [K.factors]: { words: KEY3, lines: toKey3 },
    [K.euclide]: { words: KEY4, lines: [...opening, ...toKey3, ...toKey4] },
  },
});

describe('trouver-le-pgcd — its own road', () => {
  it('four convoys, the design’s numbers: each purse pays the PGCD and not the next common plank', () => {
    expect(STORY.segments.map((s) => s.a)).toEqual([90, 54, 1736, 980, 52015, 31209, undefined, 1462, 946]);
    expect(STORY.segments.map((s) => s.convoy ?? null)).toEqual([
      'jumeaux',
      'jumeaux',
      'grands',
      'grands',
      'euclide',
      'euclide',
      null,
      'jetee',
      'jetee',
    ]);
    for (const [i, gaps] of GAPS.entries()) {
      const purse = STORY.convoys[CONVOYS[i]].purse;
      const g = gcd(...gaps);
      expect(STORY.segments.find((s) => s.convoy === CONVOYS[i]).holdsWith).toBe(g);
      // the PGCD builds both within the purse; the next common plank (the longest below it) needs more coins
      expect(buildersOf(gaps, purse)).toEqual([g]);
      const next = commonDivisors(...gaps)
        .filter((d) => d < g)
        .at(-1);
      expect(
        gaps.reduce((n, a) => n + a / next, 0),
        CONVOYS[i],
      ).toBeGreaterThan(purse);
      // no purse is exact: (a + b) ÷ coins is not a plank that builds
      const sum = gaps[0] + gaps[1];
      expect(sum % purse === 0 && buildersOf(gaps, purse).includes(sum / purse), CONVOYS[i]).toBe(false);
    }
    // the purses' window: 18 needs 8 coins of 15, 9 needs 16; 28 needs 97 of 193, 14 needs 194; 10 403 needs 8 of 807,
    // 103 needs 808; 86 needs 28 of 55, 43 needs 56
    expect([90 / 18 + 54 / 18, 90 / 9 + 54 / 9]).toEqual([8, 16]);
    expect([1736 / 28 + 980 / 28, 1736 / 14 + 980 / 14]).toEqual([97, 194]);
    expect([52015 / 10403 + 31209 / 10403, 52015 / 103 + 31209 / 103]).toEqual([8, 808]);
    expect([1462 / 86 + 946 / 86, 1462 / 43 + 946 / 43]).toEqual([28, 56]);
  });

  it('the decompositions and the notebook the benches write; the spreadsheet cannot reach 10 403', () => {
    expect(primeFactors(1736)).toEqual([2, 2, 2, 7, 31]);
    expect(primeFactors(980)).toEqual([2, 2, 5, 7, 7]);
    expect(primeFactors(52015)).toEqual([5, 101, 103]);
    expect(primeFactors(31209)).toEqual([3, 101, 103]);
    expect(primeFactors(1462)).toEqual([2, 17, 43]);
    expect(primeFactors(946)).toEqual([2, 11, 43]);
    expect(euclid(52015, 31209).map((s) => [s.a, s.b, s.q, s.r])).toEqual([
      [52015, 31209, 1, 20806],
      [31209, 20806, 1, 10403],
      [20806, 10403, 2, 0],
    ]);
    expect(SHEET_LAST).toBe(89);
    expect(isPrime(101) && 101 > SHEET_LAST).toBe(true);
    // the final mission: every error of the lesson is refused by the world
    for (const b of [516, 430, 5, 946]) expect(1462 % b, String(b)).not.toBe(0);
    expect(1462 % 43 === 0 && 946 % 43 === 0).toBe(true);
  });

  it('the workshops: on the first island of each convoy (an anvil), typed, up to the longer gap — no store', () => {
    const heads = STORY.segments.filter((s) => s.workshop);
    expect(heads.map((s) => s.a)).toEqual([90, 1736, 52015, 1462]);
    for (const s of heads) {
      expect(s.workshop).toMatchObject({ min: 1, max: Math.max(...GAPS[CONVOYS.indexOf(s.convoy)]), typed: true });
      expect(STORY.islands[STORY.segments.indexOf(s)].feature, s.id).toBe('anvil');
    }
    // K1 and the final mission have NO bench (the lists are his, on paper); K3 and K4 get the forges agent's benches
    expect(heads[0].workshop.bench).toBeUndefined();
    expect(heads[3].workshop.bench).toBeUndefined();
    expect(STORY.segments.some((s) => s.boss)).toBe(false);
    expect(STORY.islands).toHaveLength(10);
  });

  it('the WHOLE instruction of every bridge, from the hooks, short enough for the card (212)', () => {
    const seen = [];
    STORY.segments.forEach((seg, i) => {
      for (const held of [null, seg.holdsWith, 1]) {
        const game = fake({ stage: i, keys: KEYS, held });
        const o = STORY.objective(game, game.segs[i]);
        if (seg.kind !== 'bridge') expect(o, seg.id).toBe(null);
        else {
          expect(o, `${seg.id} ${held}`).toBeTruthy();
          seen.push(o);
        }
      }
    });
    // a refused second bridge: back to the workshop
    const stuck = fake({ stage: 1, held: 27 });
    stuck.flags.convoyStuck = 'g54';
    expect(STORY.objective(stuck, stuck.segs[1])).toBe(T.objective.convoyBack(STORY.islands[0].name));
    for (const o of [...seen, T.objective.board, T.objective.end]) {
      expect([...o].length, o).toBeLessThanOrEqual(212);
      expect(typographyErrors(o), o).toEqual([]);
      expect(agreementErrors(o), o).toEqual([]);
    }
    // the instruction states the constraint: the two gaps, the purse — and, at E, why the spreadsheet is not enough
    expect(T.objective.make('jumeaux')).toMatch(/90 cases puis 54.*15 pièces/);
    expect(T.objective.make('euclide')).toContain(`${SHEET_LAST}`);
  });

  it('the card on the right: the first bridge and its coins, then what each plank did on the convoy', () => {
    const game = fake({
      log: [
        { a: 90, b: 27 },
        { a: 90, b: 9 },
        { a: 54, b: 9 },
        { a: 90, b: 18 },
        { a: 54, b: 18 },
        { a: 90, b: 6, mirror: true },
      ],
    });
    game.segs[0].complete = true;
    game.segs[0].builtWith = 18;
    expect(STORY.recall(game, 1)).toEqual([T.recall.first(90, 18), T.recall.paid(5, 10)]);
    expect(STORY.recall(game, 2)).toEqual([
      T.recall.plank(27, [{ a: 90, did: 'open' }]),
      T.recall.plank(9, [
        { a: 90, did: 'fills' },
        { a: 54, did: 'coins' },
      ]),
      T.recall.plank(18, [
        { a: 90, did: 'fills' },
        { a: 54, did: 'fills' },
      ]),
    ]);
    expect(STORY.recall(game, 7)).toBe(null);
    expect(STORY.recall(fake(), 1)).toBe(null);
  });

  it('each forge opens on its island; island C holds two mirrors, the second after the first tablet', () => {
    for (const [key, k] of Object.entries(FORGE_ISLAND)) {
      const before = KEYS.slice(0, KEYS.indexOf(key));
      const game = fake({ stage: k, keys: before });
      STORY.onArrive(game, k);
      expect(game.opened, key).toEqual([key]);
      expect(STORY.pendingForge(game)).toBe(key);
    }
    const game = fake({ stage: 2, keys: [] });
    STORY.afterKey[K.common](game);
    expect(game.opened).toEqual([K.lots]);
  });

  it('the modules a key completes; the problem is marked when the jetty’s second bridge holds', () => {
    const game = fake();
    for (const key of KEYS) {
      STORY.afterKey[key](game);
      game.state.keys = [...game.state.keys, key];
    }
    expect(game.modules).toEqual(['1', '2', '3', '4']);
    expect(Object.keys(MODULE_KEYS)).toEqual(['1', '2', '3', '4', '5']);
    const [head, tail] = [7, 8];
    game.segs[head].complete = true;
    game.segs[head].builtWith = 86;
    expect(STORY.onHold(game, game.segs[head], 86)).toBe(true);
    expect(game.modules).not.toContain('5');
    game.segs[tail].complete = true;
    game.segs[tail].builtWith = 86;
    expect(STORY.onHold(game, game.segs[tail], 86)).toBe(true);
    expect(game.modules.at(-1)).toBe('5');
    expect(game.said.at(-1)).toBe(T.say.tailOk(946, 86, 55 - 17 - 11));
  });

  it('no default of the pilot’s world is left on screen: its store, its moulds of 756, its four guardians', () => {
    const shown = stringsIn({ objective: T.objective, say: T.say, recall: T.recall, workshop: T.workshop });
    for (const s of shown) expect(s, s).not.toMatch(/756|cristaux|gardien|stèle/);
    for (const k of ['hello', 'end', 'gap', 'convoyBack', 'convoyReset', 'convoyOnly'])
      expect(T.say[k]).not.toBe(WORLD.say[k]);
    for (const k of ['board', 'end', 'convoyBack']) expect(T.objective[k]).not.toBe(WORLD.objective[k]);
    expect(T.workshop.bench).not.toBe(WORLD.workshop.bench);
    // the final mission names no method and no « PGCD »: the constraint only
    expect(T.say.jetty).not.toMatch(/PGCD|commun|Euclide|exposant/);
    expect(T.objective.make('jetee')).not.toMatch(/PGCD|commun|Euclide|exposant/);
  });
});
