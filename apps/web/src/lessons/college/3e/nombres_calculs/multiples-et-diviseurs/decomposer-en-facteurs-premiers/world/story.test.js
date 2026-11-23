// THE STORY of decomposer-en-facteurs-premiers: the shared checks (authoring kit), then what is this road's own — its
// numbers against the bank, the instruction of every step, the last bridge given only by its decomposition, and no
// default of the pilot's store (756, 32, « 21 planches de 36 ») left on screen.
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  describeStory,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { alone, readBank } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { T as WORLD } from '../../../../../../common/gameworld/divisorIsles/strings';
import { checkCount, gapSign } from '../../../../../../common/gameworld/divisorIsles/logic';
import { BOSS_A, NUMBERS, powText, powTex, powersOf, primeFactors, tx } from './math';
import { K, MODULE_KEYS, STORY, TABLETS } from './story';
import { KEYS } from './journey';

// The island where each key's forge opens (the design page's road) — what the hooks of story.js must do.
const FORGE_ISLAND = { [K.ladder]: 2, [K.powers]: 3, [K.stop]: 4, [K.tool]: 5 };

const T = STORY.text;
const [R60, R72, R1400, R91, R97, R2431] = NUMBERS.road;
/** Sentences the story's functions build, with the arguments the road gives them (0, 1, 2 and 11+ where they count). */
const BUILT = [
  T.objective.pick(R60.a, R60.moulds),
  T.objective.pick(R72.a, R72.moulds),
  T.objective.carry(R60.a, 2),
  T.objective.carry(R72.a, 9),
  T.objective.long(R1400.moulds),
  T.objective.carryMade(R91.a, 7),
  T.objective.carryMade(R2431.a, 11),
  T.say.held(R60.a, 2, 30),
  T.say.held(R60.a, 4, 15),
  T.say.held(R72.a, 72, 1),
  T.say.held(R2431.a, 11, 221),
  T.say.held1400(8, 175),
  T.say.held91(7, 13),
  T.say.held91(13, 7),
  T.say.held91(1, 91),
  T.say.held97(97),
  T.say.bossFail(48, 24),
  T.workshop.tooLong(91, 90),
  T.workshop.tooLong(2431, 2430),
  T.recall.bridge(R1400.a, 8, 175),
  T.boss.divide(36),
  T.boss.costAsk(36, 14),
  T.boss.err.long(48, 11),
  T.boss.err.sum(36, 13, 0),
  T.boss.err.short(36, 13),
  T.boss.err.count,
];
const KEY1 = /décompos|facteurs? premiers?|puissance|exposant|tableur/i;
const KEY2 = /puissance|exposant|tableur/i;
const KEY3 = /carré|racine|tableur/i;
const KEY4 = /tableur|programme|MOD/;
const opening = [
  T.title,
  T.subtitle,
  T.say.hello,
  T.say.b72,
  T.objective.pick(R60.a, R60.moulds),
  T.objective.carry(R60.a, 2),
  T.objective.pick(R72.a, R72.moulds),
  T.say.held(R60.a, 2, 30),
  T.say.held(R72.a, 3, 24),
  T.recall.bridge(R60.a, 2, 30),
];
const toKey2 = [...opening, T.say.afterLadder, T.objective.long(R1400.moulds), T.say.held1400(8, 175), T.recall.eight];
const toKey3 = [
  ...toKey2,
  T.say.afterPowers,
  T.objective.make91,
  T.objective.carryMade(R91.a, 7),
  T.say.held91(7, 13),
  T.say.held91(1, 91),
];
const toKey4 = [...toKey3, T.say.afterStop, T.objective.make97, T.say.held97(97), T.objective.wait2431];

describeStory({
  id: 'decomposer-en-facteurs-premiers',
  story: STORY,
  tablets: TABLETS,
  keys: KEYS,
  sentences: BUILT,
  before: {
    [K.ladder]: { words: KEY1, lines: opening },
    [K.powers]: { words: KEY2, lines: toKey2 },
    [K.stop]: { words: KEY3, lines: toKey3 },
    [K.tool]: { words: KEY4, lines: toKey4 },
  },
});

/** A game the story's hooks read: the segments, the keys held, the plank in hand. */
function fake({ stage = 0, keys = [], held = null } = {}) {
  const segs = STORY.segments.map((s, index) => ({ ...s, index, complete: false, builtWith: null }));
  return { T, state: { stage, keys, held }, segs, flags: {} };
}

describe('decomposer-en-facteurs-premiers — its own road', () => {
  it('its numbers are the design’s, each in no sheet of the bank (written plain or with a LaTeX thin space)', () => {
    const bank = readBank('decomposer-en-facteurs-premiers');
    const reserved = [
      ...NUMBERS.road.map((r) => r.a).filter((a) => a > 72),
      ...NUMBERS.ladder.rounds.slice(1),
      NUMBERS.ladder.use,
      NUMBERS.powers.use,
      ...NUMBERS.stop.rounds,
      NUMBERS.stop.use,
      ...NUMBERS.tool.rounds,
      BOSS_A,
    ];
    for (const n of reserved)
      for (const s of bank.sheets) {
        expect(alone(n).test(s.text), `${n} in ${s.file}`).toBe(false);
        // « 2\,431 » in a statement is written « 2\\,431 » in the JSON file
        if (n >= 1000) expect(s.text.includes(tx(n).replace(/\\/g, '\\\\')), `${tx(n)} in ${s.file}`).toBe(false);
      }
    expect(BOSS_A).toBe(504);
    expect(primeFactors(BOSS_A)).toEqual(NUMBERS.boss.factors);
  });

  it('each bridge holds with its plank, and the moulds and workshops give what the design says', () => {
    expect(STORY.segments.map((s) => s.a)).toEqual([60, 72, 1400, 91, 97, 2431, undefined, 504]);
    // 60 and 72: composite planks hold too; one mould falls
    expect(R60.moulds.filter((b) => R60.a % b === 0)).toEqual([4, 2]);
    expect(R72.moulds.filter((b) => R72.a % b === 0)).toEqual([9, 3]);
    // 1 400: only 8 holds, and 8 = 2 × 2 × 2
    expect(R1400.moulds.filter((b) => R1400.a % b === 0)).toEqual([8]);
    expect(primeFactors(8)).toEqual([2, 2, 2]);
    // 91: the workshop makes up to 90 — 1, 7 and 13 hold; 97: up to 96 — only 1
    const holding = (r) => Array.from({ length: r.workshop }, (_, i) => i + 1).filter((b) => r.a % b === 0);
    expect(holding(R91)).toEqual([1, 7, 13]);
    expect(holding(R97)).toEqual([1]);
    expect(holding(R2431)).toEqual([1, 11, 13, 17, 143, 187, 221]);
    for (const s of STORY.segments.filter((x) => x.workshop))
      expect(STORY.islands[STORY.segments.indexOf(s)].feature, s.id).toBe('anvil');
    // the store: 36 fills the gap, 48 does not — though it has the same primes
    expect(BOSS_A % 36).toBe(0);
    expect(BOSS_A % 48).toBe(24);
    expect(new Set(primeFactors(48))).toEqual(new Set([2, 3]));
  });

  it('the WHOLE instruction of every bridge, from the hooks, short enough for the card (212)', () => {
    const seen = [];
    STORY.segments.forEach((seg, i) => {
      for (const keys of [KEYS.slice(0, FORGE_ISLAND[K.tool]), KEYS])
        for (const held of [null, seg.holdsWith]) {
          const game = fake({ stage: i, keys, held });
          const o = STORY.objective(game, game.segs[i]);
          if (seg.kind !== 'bridge' || seg.boss) expect(o, seg.id).toBe(null);
          else {
            expect(o, `${seg.id} ${held}`).toBeTruthy();
            seen.push(o);
          }
        }
    });
    for (const o of [...seen, T.objective.bossGo, T.objective.board]) {
      expect([...o].length, o).toBeLessThanOrEqual(212);
      expect(typographyErrors(o), o).toEqual([]);
      expect(agreementErrors(o), o).toEqual([]);
    }
    // before key 4 the gap of 2 431 only says the mirror opens; with it, the workshop and the plank to find
    const at = STORY.segments.findIndex((s) => s.a === R2431.a);
    expect(STORY.objective(fake({ stage: at, keys: KEYS.slice(0, 3) }), fake().segs[at])).toBe(T.objective.wait2431);
    expect(STORY.objective(fake({ stage: at, keys: KEYS }), fake().segs[at])).toBe(T.objective.make2431);
  });

  it('the card on the right: the bridge just crossed as an equality, and 8 = 2 × 2 × 2 after 1 400', () => {
    const game = fake();
    game.segs[2].complete = true;
    game.segs[2].builtWith = 8;
    expect(STORY.recall(game, 3)).toEqual([T.recall.bridge(1400, 8, 175), T.recall.eight]);
    game.segs[0].complete = true;
    game.segs[0].builtWith = 4;
    expect(STORY.recall(game, 1)).toEqual([T.recall.bridge(60, 4, 15)]);
    expect(STORY.recall(fake(), 1)).toBe(null);
  });

  it('each forge opens on its island, once the bridges before it are crossed', () => {
    for (const [key, k] of Object.entries(FORGE_ISLAND)) {
      const opened = [];
      const game = {
        ...fake({ stage: k, keys: KEYS.filter((x) => x !== key) }),
        openForge: (f) => opened.push(f),
        say() {},
      };
      STORY.onArrive(game, k);
      expect(opened, key).toEqual([key]);
      expect(STORY.pendingForge(game)).toBe(key);
    }
    // the store opens with the last key
    const game = { ...fake({ keys: KEYS.slice(0, 3) }), onModule() {}, refreshObjective() {}, say() {}, save() {} };
    STORY.afterKey[K.tool](game);
    expect(game.flags.key4).toBe(true);
  });

  it('the modules a key completes: each needs only keys held by then; the problem waits for the store', () => {
    const marked = [];
    const game = { ...fake(), onModule: (m) => marked.push(m), refreshObjective() {}, say() {}, save() {} };
    for (const key of KEYS) {
      STORY.afterKey[key](game);
      game.state.keys = [...game.state.keys, key];
    }
    expect(marked).toEqual(['1', '2', '3', '4']);
    expect(Object.keys(MODULE_KEYS)).toEqual(['1', '2', '3', '4', '5']);
    STORY.onBossPaid(game);
    expect(marked.at(-1)).toBe('5');
  });

  it('the last bridge is announced ONLY by its decomposition; no default of the pilot’s store is left', () => {
    const store = [
      T.objective.bossGo,
      T.say.boss,
      T.boss.mission,
      T.boss.choose,
      T.boss.price,
      T.boss.divide(36),
      T.boss.divide(48),
      T.boss.costAsk(36, 14),
      T.boss.err.long(48, 11),
      T.boss.err.sum(48, 10, 23),
      T.boss.err.short(36, 13),
      T.boss.err.long(36, 15),
      T.boss.err.count,
      T.say.bossFail(48, 24),
      T.say.bossOk,
    ];
    for (const s of store) expect(alone(BOSS_A).test(s), s).toBe(false);
    for (const s of [T.objective.bossGo, T.say.boss, T.boss.mission, T.boss.choose, T.boss.err.sum(48, 10, 23)])
      expect(s, s).toMatch(/2\^\{?3\}? \\times 3\^\{?2\}? \\times 7|2³ × 3² × 7/);
    // the world's defaults that name the pilot's store (756, 32, « 21 planches de 36 », « cristaux ») are all replaced
    const shown = stringsIn({ objective: T.objective, say: T.say, boss: T.boss });
    for (const s of shown) expect(s, s).not.toMatch(/756|cristaux|\b32\b|21 planches/);
    for (const k of ['bossGo']) expect(T.objective[k]).not.toBe(WORLD.objective[k]);
    for (const k of ['boss', 'bossOk', 'hello', 'anvilOpen', 'end']) expect(T.say[k]).not.toBe(WORLD.say[k]);
    expect(T.objective.board).not.toBe(WORLD.objective.board);
    expect(T.workshop.tooLong(91, 90)).not.toBe(WORLD.workshop.tooLong(91, 90, 1));
    expect(T.say.bossFail(48, 24)).not.toBe(WORLD.say.bossFail(48, 24));
    for (const k of ['mission', 'choose', 'price']) expect(T.boss[k]).not.toBe(WORLD.boss[k]);
    expect(T.boss.divide(36)).not.toBe(WORLD.boss.divide(36));
    expect(T.boss.costAsk(36, 14)).not.toBe(WORLD.boss.costAsk(36, 14));
    expect(T.boss.err.long(48, 11)).not.toBe(WORLD.boss.err.long(48, 11));
    expect(T.boss.err.sum(48, 10, 23)).not.toBe(WORLD.boss.err.sum(48, 10, 23));
    // the price: plausible euros, written the French way
    expect(T.boss.price).toBe('Prix d’une planche : 3 €');
    expect(NUMBERS.boss.price * (BOSS_A / NUMBERS.boss.plank)).toBe(42);
  });

  it('the world reads the gap from the story’s LABEL: the sign over it, the store’s one box, never 504 before he crosses', () => {
    const seg = STORY.segments.find((s) => s.boss);
    // the label is the decomposition of the gap, written plain and in LaTeX
    expect(seg.boss.label).toEqual({ text: powText(powersOf(BOSS_A)), tex: powTex(powersOf(BOSS_A)) });
    expect(seg.boss.label.text).toBe('2³ × 3² × 7');
    // the sign over the gap (Game.js › buildBridge reads logic.js › gapSign)
    expect(gapSign(seg)).toBe('2³ × 3² × 7\u00a0cases');
    expect(alone(BOSS_A).test(gapSign(seg))).toBe(false);
    // the store asks the number of planks only: 36 fills with 14, 48 is built whatever he types (24 cells stay open)
    expect(checkCount(seg.a, 36, BOSS_A / 36)).toBe('ok');
    expect(checkCount(seg.a, 36, 15)).toBe('long');
    expect(checkCount(seg.a, 36, 13)).toBe('short');
    expect(checkCount(seg.a, 48, 10)).toBe('open');
    // its step asks for the planks, not the cells left (the division of 504 would need 504)
    expect(T.boss.divide(36)).not.toMatch(/restent|reste/);
    expect(T.boss.err.short(36, 13)).toBe(
      `13\u00a0planches de 36, cela fait 468\u00a0cases\u00a0: le pont n’est pas rempli.`,
    );
  });
});
