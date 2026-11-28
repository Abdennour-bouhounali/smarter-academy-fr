// THE STORY of thales-configuration-papillon in « Les pyramides »: the docks it plays, the forge of each table, the legs,
// the final mission and the box at noon — every number re-computed, every wrong line answered with a FACT; what Zero
// and the card « De l’embarcadère précédent » say before each seal names no rule; the tablets carry the recall words.
// `describeStory` (authoring/test/suites.js) is the ISLANDS' suite — `story.segments`, `story.islands`, bridges and
// convoys —: this world has none (a kit gap, reported), so the checks of it that apply are written here with the
// suite's own helpers (`said`, `agreementErrors`, `typographyErrors`, `equalitiesHold`, the bank's `collisions`).
import { describe, it, expect } from 'vitest';
import {
  agreementErrors,
  equalitiesHold,
  said,
  stringsIn,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { boxesOf } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { WORLD_TEXT, withStory } from '../../../../../../common/gameworld/nilePyramids/strings';
import { STAGE_IDS, stageRoute } from '../../../../../../common/gameworld/nilePyramids/logic';
import { BOX_IMAGE, BOX_OH, HALF, MISSION_AB, MISSION_H, MODULE_KEYS, SAY, STORY } from './story';
import { TABLETS } from './tablets';
import { KEYS } from './journey';
import { LEGS } from './run';
import { FACE, K, NUMBERS, PLATEAU, RIVER, equal, over, times, write } from './math';

const ID = 'thales-configuration-papillon';
const MI = NUMBERS.mission;
const BX = NUMBERS.box;
const T = withStory(WORLD_TEXT, STORY.text);

const RIGHT_MISSION = {
  ah: MI.shadow,
  hb: HALF,
  ab: MISSION_AB,
  why: 'vertical',
  rn: '3',
  rd: '219',
  mn: '2',
  h: '146',
};
const RIGHT_BOX = {
  p1: 'H',
  p2: 'H′',
  why: 'vertical',
  r1n: 'OH′',
  r1d: 'OH',
  r2n: 'S′H′',
  r2d: 'SH',
  o1: BX.fromEdge,
  o2: HALF,
  oh: BOX_OH,
  a: BX.depth,
  b: MISSION_H,
  c: BOX_OH,
  img: BOX_IMAGE,
};

/** A game that records what the story makes it say. */
const fakeGame = ({ done = {}, log = [] } = {}) => {
  const says = [];
  return { says, done, log, T, say: (t) => says.push(t) };
};
/** A log through the three docks, as the world writes it (no workshop: dock 2 is not on France's map). */
const LOG = [
  { stage: 'river', step: 'ferry', kind: 'ferry', typed: '468', fact: 'slack' },
  { stage: 'river', step: 'ferry', kind: 'ferry', typed: '416', fact: 'ties' },
  { stage: 'summit', step: 'capstone', kind: 'capstone', typed: '1/36', fact: 'sits' },
];
/** Every string a card prints: its title, its lead, the words of its lines. */
const cardStrings = (card) => [
  card.title,
  ...card.lead,
  ...card
    .lines()
    .flatMap((l) => l.tokens)
    .flatMap((t) =>
      typeof t === 'string' ? [t] : t?.frac ? [t.frac.n, t.frac.d].filter((x) => typeof x === 'string') : [],
    ),
];
const SO = T.stage.objective;

describe(`${ID} — the story hands the world what it asks (nilePyramids/Game.js header)`, () => {
  it('three docks, sailed 3 → 4 → 5; one forge per table, the keys in the order of the docks', () => {
    expect(STORY.stages).toEqual(['river', 'summit', 'plateau']);
    expect(stageRoute(STORY.stages)).toEqual([2, 3, 4]);
    expect(STORY.forges).toEqual({ river: K.papillon, summit: K.calcul });
    expect(Object.values(STORY.forges)).toEqual(KEYS);
    for (const id of Object.keys(STORY.forges)) expect(STAGE_IDS).toContain(id);
  });

  it('the felucca’s legs are the written world’s, keyed by the dock they leave: 2 and 3', () => {
    expect(STORY.legs).toBe(LEGS);
    expect(Object.keys(STORY.legs).sort()).toEqual(['2', '3']);
  });

  it('the modules need the keys of their docks; the last dock needs both', () => {
    expect(MODULE_KEYS).toEqual({ 1: [K.papillon], 2: [K.papillon, K.calcul], 3: [K.papillon, K.calcul] });
  });

  it('the story changes only the words of the noon card and of the end; the rest is the world’s', () => {
    expect(T.docks).toEqual(WORLD_TEXT.docks);
    expect(T.stage.objective.capstone).toBe(WORLD_TEXT.stage.objective.capstone);
    expect(T.stage.objective.noon).not.toBe(WORLD_TEXT.stage.objective.noon);
    expect(T.stage.fact).toBe(WORLD_TEXT.stage.fact);
  });
});

describe(`${ID} — the summit is playable without the workshop (gate A, F2)`, () => {
  it('Zero states the pyramid’s base on arriving; the world’s register gives it too (FACE.base), and the platform', () => {
    const g = fakeGame();
    STORY.onArrive(g, 'summit');
    expect(g.says[0]).toContain(`${FACE.base} m`);
    // what the stone-cutter's order is made from: 99 × 1/36 = 2,75, the platform left at the summit's top
    expect(write(times(FACE.base, '1/36'))).toBe('2,75');
  });
  it('the recall card of the summit reads the river only — nothing of a workshop', () => {
    expect(STORY.recall(fakeGame(), 'summit')).toEqual([
      `$AS = ${RIVER.AS}$ m, $SE = ${RIVER.SE}$ m et $ER = ${RIVER.ER}$ m.`,
    ]);
    expect(STORY.recall(fakeGame({ log: LOG }), 'summit')).toHaveLength(2);
    expect(STORY.recall(fakeGame({ log: LOG }), 'summit')[1]).toContain(T.fact.ties);
  });
});

describe(`${ID} — the morning mission: his 4e tool and K2’s join (design § 2)`, () => {
  it('its numbers: AB = 104 + 115 = 219; 3/219 = 2/h gives h = 146 — the world’s pyramid', () => {
    expect(HALF).toBe(MI.half);
    expect(MISSION_AB).toBe(MI.AB);
    expect(MISSION_H).toBe(MI.h);
    expect(MISSION_H).toBe(PLATEAU.h);
    // the distractors: 104 alone gives 208/3; the ratio upside down 328,5
    expect(equal(over(times(MI.shadow, MI.stick), MI.stickShadow), '208/3')).toBe(true);
    expect(equal(over(times(MISSION_AB, MI.stickShadow), MI.stick), '328,5')).toBe(true);
  });

  it('the right card is accepted, an equal fraction too; Zero flies to the h he wrote; no line of k', () => {
    expect(STORY.mission.check(RIGHT_MISSION)).toBe('ok');
    expect(STORY.mission.check({ ...RIGHT_MISSION, rn: '1', rd: '73' })).toBe('ok');
    expect(STORY.mission.height({ ...RIGHT_MISSION, h: '328,5' })).toBe('328,5');
    const names = STORY.mission.lines().flatMap((l) => boxesOf(l.tokens).map((t) => t.slot ?? t.choice));
    expect(names.sort()).toEqual(Object.keys(RIGHT_MISSION).sort());
    expect(JSON.stringify(STORY.mission.lines())).not.toMatch(/k =|73/);
  });

  it('every wrong line is answered with a fact — the whole base for the half, a reason, the ratio upside down, h', () => {
    const wrong = [
      { hb: PLATEAU.base },
      { ah: '0', hb: MI.shadow },
      { ab: '220' },
      { why: 'length' },
      { why: 'shadow' },
      { rn: '219', rd: '3' },
      { rn: '3', rd: '104' },
      { mn: '3' },
      { h: '328,5' },
      { h: '69' },
    ];
    for (const w of wrong) {
      const out = STORY.mission.check({ ...RIGHT_MISSION, ...w });
      expect(out, JSON.stringify(w)).not.toBe('ok');
      said(out);
      expect(typographyErrors(out), out).toEqual([]);
      expect(out).not.toMatch(/faux|erreur/i);
    }
  });
});

describe(`${ID} — noon: Ibn al-Haytham’s box, the sheet the image fills (design § 2)`, () => {
  it('OH = 177 + 115 = 292; S′H′ = 0,5 × 146 / 292 = 0,25', () => {
    expect(BOX_OH).toBe(BX.OH);
    expect(BOX_IMAGE).toBe(BX.image);
    expect(STORY.box.check(RIGHT_BOX)).toBe('ok');
  });

  it('the sheet is the world’s fact: too big (half base forgotten, ratio upside down), the image overflows (whole base)', () => {
    const halfForgot = write(over(times(BX.depth, MISSION_H), BX.fromEdge));
    expect(halfForgot).toBe(BX.halfForgot);
    const wholeBase = write(over(times(BX.depth, MISSION_H), String(Number(BX.fromEdge) + Number(PLATEAU.base))));
    expect(wholeBase).toBe(BX.wholeBase);
    const inverted = write(over(times(BOX_OH, BX.depth), MISSION_H));
    expect(inverted).toBe('1');
    for (const img of ['0,41', inverted]) {
      const out = STORY.box.check({ ...RIGHT_BOX, img });
      expect(out, img).toMatch(/trop grande/);
      said(out);
    }
    const out = STORY.box.check({ ...RIGHT_BOX, img: '0,18' });
    expect(out).toMatch(/déborde/);
    // the length ACROSS the hole (OH + OH′ = 292,5) gives 0,2496…: the world answers it truthfully, « déborde »
    expect(STORY.box.check({ ...RIGHT_BOX, img: '0,2496' })).toMatch(/déborde/);
  });

  it('every true writing is accepted: the points in either order, any two ratios of the chain, all upside down', () => {
    expect(STORY.box.check({ ...RIGHT_BOX, p1: 'H′', p2: 'H' })).toBe('ok');
    expect(STORY.box.check({ ...RIGHT_BOX, r1n: 'OS′', r1d: 'OS' })).toBe('ok');
    expect(STORY.box.check({ ...RIGHT_BOX, r1n: 'OH', r1d: 'OH′', r2n: 'SH', r2d: 'S′H′' })).toBe('ok');
    expect(STORY.box.check({ ...RIGHT_BOX, o1: HALF, o2: BX.fromEdge })).toBe('ok');
  });

  it('a right sheet with a line that does not say why is answered with that line’s fact', () => {
    const wrong = [
      { p1: 'S′' },
      { why: 'shadow' },
      { r2n: 'SH', r2d: 'S′H′' },
      { r1n: 'OH', r1d: 'OH′' },
      { o2: PLATEAU.base },
      { oh: '291' },
      { b: '73' },
      { a: '0,25' },
    ];
    for (const w of wrong) {
      const out = STORY.box.check({ ...RIGHT_BOX, ...w });
      expect(out, JSON.stringify(w)).not.toBe('ok');
      said(out);
      expect(typographyErrors(out), out).toEqual([]);
    }
    expect(STORY.box.check({ ...RIGHT_BOX, img: '' })).toMatch(/Ligne 4/);
  });

  it('the image’s 0,25 m is written nowhere before the card asks it: not in the cards, Zero, the recall, the texts', () => {
    const before = [
      ...cardStrings(STORY.mission),
      ...cardStrings(STORY.box),
      ...Object.values(SAY),
      ...stringsIn(STORY.text),
      ...['river', 'summit', 'plateau'].flatMap((id) => STORY.recall(fakeGame({ log: LOG }), id)),
    ];
    for (const s of before) expect(s, s).not.toMatch(/0,25|0\{,\}25/);
  });
});

describe(`${ID} — the cards and the sentences are French and whole`, () => {
  it('the cards: at most four lines, four boxes a line; a schematic figure each', () => {
    for (const card of [STORY.mission, STORY.box]) {
      const lines = card.lines();
      expect(lines.length).toBeLessThanOrEqual(4);
      for (const l of lines) expect(l.tokens.filter((t) => typeof t === 'object').length).toBeLessThanOrEqual(4);
      expect(card.figure.points).toBeTruthy();
      expect(card.figure.ariaLabel).toBeTruthy();
    }
  });

  it('every sentence agrees with its numbers, and its typography is French', () => {
    const all = [
      ...cardStrings(STORY.mission),
      ...cardStrings(STORY.box),
      ...Object.values(SAY),
      ...stringsIn(STORY.text),
      ...stringsIn(TABLETS),
      ...['river', 'summit', 'plateau'].flatMap((id) => STORY.recall(fakeGame({ log: LOG }), id)),
    ];
    expect(all.length).toBeGreaterThan(20);
    for (const s of all) {
      said(s);
      expect(agreementErrors(s), s).toEqual([]);
      expect(typographyErrors(s), s).toEqual([]);
    }
    for (const s of Object.values(SAY)) expect(s).not.toMatch(/\$|\\/);
  });

  it('its numbers are the platform’s own: no pair of the mission and the box on one line of the bank or of a story', () => {
    const bank = readBank(ID);
    const stories = storiesOf({ exceptId: ID });
    const nums = ['104', '115', '219', '230', '146', '177', '292', '0,5'];
    for (let i = 0; i < nums.length; i += 1)
      for (let j = i + 1; j < nums.length; j += 1) {
        const c = collisions(bank, [nums[i], nums[j]], { stories });
        expect([c.named, c.bankLines, c.storyLines], `${nums[i]} ; ${nums[j]}`).toEqual([false, [], []]);
      }
  });
});

describe(`${ID} — no rule before its key: Zero, the recall card and the legs`, () => {
  /** The words of each key: no sentence played before its seal says them. */
  const WORDS = {
    [K.papillon]: /Thalès|papillon|demi-tour|parallèle|∥|\\parallel/i,
    [K.calcul]: /part du sommet|depuis le sommet|recoll|j’enlève/i,
  };
  const g = fakeGame({ log: LOG });
  const say = (id) => {
    const x = fakeGame({ log: LOG });
    STORY.onArrive(x, id);
    return x.says;
  };
  /** The sentences of the legs a student can meet, over many seeds. */
  const legLines = (i) =>
    Array.from({ length: 40 }, (_, n) => LEGS[i].round(1, rng(n * 31 + i + 1), n)).flatMap((r) => [r.ask, ...r.why]);
  const BEFORE = {
    [K.papillon]: [
      T.docks[2],
      ...say('river'),
      ...STORY.recall(g, 'river'),
      SO.bankStart,
      SO.plan,
      ...['place', 'hint', 'planted', 'rope', 'note'].map((k) => T.stage.riverPlan[k]),
      ...Object.values(T.stage.riverPlan.fact),
      SO.ferry,
      SO.forge,
    ],
    [K.calcul]: [
      T.docks[3],
      ...say('summit'),
      ...STORY.recall(g, 'summit'),
      SO.climb,
      SO.capstone,
      SO.forge,
      T.stage.order.capstone.ask(),
      ...legLines(2),
    ],
  };

  it('what is said before each forge names no key still missing', () => {
    for (const [key, lines] of Object.entries(BEFORE)) {
      expect(lines.length, key).toBeGreaterThan(3);
      for (const line of lines) {
        said(line);
        expect(line, `${key}: ${line}`).not.toMatch(WORDS[key]);
      }
    }
    // after K1's seal, Zero names K1 (the story of Thalès de Milet) — never K2
    const x = fakeGame();
    STORY.afterKey[K.papillon](x);
    expect(x.says[0]).toMatch(/Thalès de Milet/);
    expect(x.says[0]).not.toMatch(WORDS[K.calcul]);
  });

  it('Zero says a fact on arriving, the same twice; the recall card is at most three lines', () => {
    for (const id of STORY.stages) {
      const x = fakeGame({ log: LOG });
      STORY.onArrive(x, id);
      STORY.onArrive(x, id);
      expect(x.says).toHaveLength(2);
      expect(x.says[0]).toBe(x.says[1]);
      expect(STORY.recall(x, id).length).toBeLessThanOrEqual(3);
    }
    expect(STORY.recall(fakeGame({ log: LOG }), 'river')).toEqual([]);
    expect(STORY.recall(fakeGame({ log: LOG }), 'plateau')).toHaveLength(1);
  });
});

describe(`${ID} — the tablets: the recall words, true formulas`, () => {
  const RECALL = {
    [K.papillon]: ['théorème de Thalès', 'papillon', 'demi-tour'],
    [K.calcul]: ['part du sommet', 'depuis le sommet'],
  };
  it('one tablet per key: its recall words outside a formula; two lines, two formulas, one note at most', () => {
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    for (const key of KEYS) {
      const t = TABLETS[key];
      const words = `${t.title} ${t.lines.join(' ')}`.replace(/\$[^$]+\$/g, ' ');
      for (const w of RECALL[key]) expect(words, `${key}: ${w}`).toContain(w);
      expect(t.lines.length).toBeLessThanOrEqual(2);
      expect(t.math.length).toBeLessThanOrEqual(2);
      expect(t.notes.length).toBeLessThanOrEqual(1);
      for (const n of t.notes) expect(n).not.toMatch(/\$|\\/);
    }
  });
  it('their formulas of numbers are true: the river 9/72 = 52/416; K2’s round 3', () => {
    expect(equalitiesHold(TABLETS[K.papillon].math[1])).toBe(1);
    expect(equalitiesHold(TABLETS[K.calcul].math[0])).toBe(1);
    expect(equalitiesHold(TABLETS[K.calcul].math[1])).toBe(1);
    expect(equal(over(times(RIVER.ER, RIVER.AS), RIVER.SE), NUMBERS.papillon.river.AF)).toBe(true);
  });
});
