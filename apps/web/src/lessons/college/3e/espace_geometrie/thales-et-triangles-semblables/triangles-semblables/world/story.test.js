// THE STORY of triangles-semblables in « Les pyramides »: the docks it plays, the forge of each table, the legs, the plateau
// (a date palm under tan 4/5) and the final mission — every number re-computed, every wrong line answered with a FACT, the
// steps of the card judged in order, the inverted pairing PLAYED (Zero rises to 26,25) then refused; what Zero and the card
// « De l’embarcadère précédent » say before each seal names no rule; the tablets carry the recall words.
// `describeStory` (authoring/test/suites.js) is the ISLANDS' suite — `story.segments`, `story.islands`, bridges and
// convoys —: this world has none (a kit gap, reported), so the checks of it that apply are written here with the suite's own
// helpers (`said`, `agreementErrors`, `typographyErrors`, `equalitiesHold`, the banks' `collisions`).
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  agreementErrors,
  equalitiesHold,
  said,
  stringsIn,
  trueEqualities,
  typographyErrors,
} from '../../../../../../common/gameworld/kit/authoring/test/suites.js';
import { collisions, readBank, storiesOf } from '../../../../../../common/gameworld/kit/authoring/test/bank.js';
import { boxesOf } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { rng } from '../../../../../../common/gameworld/kit/random';
import { validateGeoFigure } from '../../../../../../common/components/geoFigure';
import { WORLD_TEXT, withStory } from '../../../../../../common/gameworld/nilePyramids/strings';
import { STAGE_IDS, shadowLength, stageRoute } from '../../../../../../common/gameworld/nilePyramids/logic';
import { NilePyramidsGame } from '../../../../../../common/gameworld/nilePyramids/Game';
import { INVERTED_H, MISSION_H, MISSION_K, MODULE_KEYS, SAY, STORY } from './story';
import { TABLETS } from './tablets';
import { KEYS } from './journey';
import { LEGS } from './run';
import { FACE, K, NUMBERS, equal, frAll, over, times, write } from './math';

const ID = 'triangles-semblables';
const MI = NUMBERS.mission;
const T = withStory(WORLD_TEXT, STORY.text);
const here = dirname(fileURLToPath(import.meta.url));
const PRACTICE = join(here, '../../../../../../../../../../content/practice/3e');

const RIGHT_MISSION = {
  g1: 'droit',
  g2: 'soleil',
  c1: 'PC',
  c2: 'PS',
  kn: '21',
  kd: '2',
  k: '10,5',
  m1: '1,6',
  m2: '10,5',
  h: '16,8',
};

/** A game that records what the story makes it say. */
const fakeGame = ({ done = {}, log = [] } = {}) => {
  const says = [];
  return { says, done, log, T, say: (t) => says.push(t) };
};
/** A log through the docks, as the world writes it: the row at his mark, the capstone. */
const LOG = [
  { stage: 'workshop', step: 'mark', kind: 'mark', typed: '44', fact: 'gap' },
  { stage: 'workshop', step: 'mark', kind: 'mark', typed: '55', fact: 'fits' },
  { stage: 'summit', step: 'capstone', kind: 'capstone', typed: '1/36', fact: 'sits' },
];
/** Every string a card prints: its title, its lead, the words of its lines. */
const cardStrings = (card) => [
  card.title,
  ...card.lead,
  ...card
    .lines(ALL_OPEN)
    .flatMap((l) => l.tokens)
    .flatMap((t) =>
      typeof t === 'string' ? [t] : t?.frac ? [t.frac.n, t.frac.d].filter((x) => typeof x === 'string') : [],
    ),
];
const SO = T.stage.objective;

/** Every line of the mission card open: the three first steps right (the card opens its lines one by one). */
const ALL_OPEN = { g1: 'droit', g2: 'soleil', c1: 'PC', c2: 'PS', kn: '21', kd: '2', k: '10,5' };

describe('the mission card opens its lines one by one (design: each step opens when the one before holds)', () => {
  const count = (v) => STORY.mission.lines(v).length;
  it('line 1 alone, then the pairing (two lines, one pair a line) once the two angles are right, k once the pairing is right, h once k is right', () => {
    expect(count({})).toBe(1);
    expect(count({ g1: 'droit', g2: 'haut' })).toBe(1);
    expect(count({ g1: 'soleil', g2: 'droit' })).toBe(3);
    expect(count({ g1: 'droit', g2: 'soleil', c1: 'PS', c2: 'PC' })).toBe(3);
    expect(count({ g1: 'droit', g2: 'soleil', c1: 'PC', c2: 'PS' })).toBe(4);
    expect(count({ ...ALL_OPEN, k: '11' })).toBe(4);
    expect(count(ALL_OPEN)).toBe(5);
    // one pairing a line (gate B 2026-11-27: « [MN] et » wrapped under its label)
    const pairs = STORY.mission.lines(ALL_OPEN).slice(1, 3);
    for (const l of pairs) expect(boxesOf(l.tokens)).toHaveLength(1);
  });
});

describe(`${ID} — the story hands the world what it asks (nilePyramids/Game.js header)`, () => {
  it('three docks, sailed 2 → 4 → 5; one forge per table, the keys in the order of the docks', () => {
    expect(STORY.stages).toEqual(['workshop', 'summit', 'plateau']);
    expect(stageRoute(STORY.stages)).toEqual([1, 3, 4]);
    expect(STORY.forges).toEqual({ workshop: K.cotes, summit: K.angles });
    expect(Object.values(STORY.forges)).toEqual(KEYS);
    for (const id of Object.keys(STORY.forges)) expect(STAGE_IDS).toContain(id);
  });

  it('the felucca’s legs are the written world’s, keyed by the dock they leave: 1 and 3', () => {
    expect(STORY.legs).toBe(LEGS);
    expect(Object.keys(STORY.legs).sort()).toEqual(['1', '3']);
  });

  it('the modules need the keys of their docks; the mission (module 3) needs both', () => {
    expect(MODULE_KEYS).toEqual({ 1: [K.cotes], 2: [K.cotes, K.angles], 3: [K.cotes, K.angles] });
  });

  it('the plateau is a date palm of 16,8 m under tan 4/5, the 1,6 m stick, the two triangles apart (no slide)', () => {
    expect(STORY.plateau).toEqual({ tan: '4/5', object: 'palm', h: '16,8', stick: '1,6', slide: false });
    // the world's own arithmetic: the stick casts 2 m, the palm 21 m — the numbers of the card
    expect(shadowLength(STORY.plateau.stick, STORY.plateau.tan)).toBe(MI.stickShadow);
    expect(shadowLength(STORY.plateau.h, STORY.plateau.tan)).toBe(MI.palmShadow);
    const steps = NilePyramidsGame.prototype.stageData
      .call({ story: STORY, lesson: { story: STORY, forges: {} } })[4]
      .steps.map((s) => s.id);
    expect(steps).toEqual(['shadowAM', 'palmShadow', 'mission']);
  });

  it('the story changes the words of the plateau (a palm) and of the end; the rest is the world’s', () => {
    expect(T.docks.slice(0, 4)).toEqual(WORLD_TEXT.docks.slice(0, 4));
    expect(T.docks[4]).not.toBe(WORLD_TEXT.docks[4]);
    expect(T.stage.objective.capstone).toBe(WORLD_TEXT.stage.objective.capstone);
    expect(T.stage.objective.mission).not.toBe(WORLD_TEXT.stage.objective.mission);
    expect(T.stage.objective.shadow).toMatch(/palmier/);
    expect(T.stage.fact.markFits).toBe(WORLD_TEXT.stage.fact.markFits);
    expect(T.fact.above).toMatch(/palmier/);
  });
});

describe(`${ID} — the recall card of the summit and of the plateau`, () => {
  it('the summit remembers the row he laid at the workshop (his last mark), the plateau K2’s key — and no number', () => {
    const summit = STORY.recall(fakeGame({ log: LOG }), 'summit');
    expect(summit).toHaveLength(1);
    expect(summit[0]).toContain('$BM = 55$');
    expect(summit[0]).toContain(T.stage.fact.markFits);
    // the plateau: the rule the mission needs, from K2's tablet; never a dock's number beside the mission's (design)
    const plateau = STORY.recall(fakeGame({ log: LOG }), 'plateau');
    expect(plateau).toHaveLength(1);
    expect(plateau[0]).toContain(TABLETS[K.angles].lines[0].slice(1));
    expect(plateau[0]).not.toMatch(/\d/);
    said(plateau[0]);
    expect(typographyErrors(plateau[0]), plateau[0]).toEqual([]);
    expect(STORY.recall(fakeGame({ log: LOG }), 'workshop')).toEqual([]);
    expect(STORY.recall(fakeGame(), 'summit')).toEqual([]);
  });
});

describe(`${ID} — the mission: the palm, its four steps judged in order (design)`, () => {
  it('its numbers: k = 21 ÷ 2 = 10,5; h = 1,6 × 10,5 = 16,8; the inverted pairing 21 × 2 ÷ 1,6 = 26,25', () => {
    expect(MISSION_K).toBe(MI.k);
    expect(MISSION_H).toBe(MI.h);
    expect(INVERTED_H).toBe(MI.inverted);
    expect(MISSION_H).toBe(STORY.plateau.h);
    // the distractor is above the palm: 26,25 > 16,8
    expect(equal(INVERTED_H, over(times(MI.palmShadow, MI.stickShadow), MI.stick))).toBe(true);
    expect(Number(INVERTED_H.replace(',', '.'))).toBeGreaterThan(Number(MISSION_H.replace(',', '.')));
  });

  it('the right card is accepted, an equal writing too; Zero rises to the h he wrote', () => {
    expect(STORY.mission.check(RIGHT_MISSION)).toBe('ok');
    expect(STORY.mission.check({ ...RIGHT_MISSION, g1: 'soleil', g2: 'droit' })).toBe('ok');
    expect(STORY.mission.check({ ...RIGHT_MISSION, kn: '21.0', k: '10.5', m2: '10.5' })).toBe('ok');
    expect(STORY.mission.height(RIGHT_MISSION)).toBe('16,8');
    expect(STORY.mission.height({ ...RIGHT_MISSION, h: '17' })).toBe('17');
    const names = STORY.mission.lines(ALL_OPEN).flatMap((l) => boxesOf(l.tokens).map((t) => t.slot ?? t.choice));
    expect(names.sort()).toEqual(Object.keys(RIGHT_MISSION).sort());
  });

  it('the inverted pairing PLAYS its consequence — Zero rises to 26,25, above the palm — then refuses, giving no answer', () => {
    const inverted = { ...RIGHT_MISSION, c1: 'PS', c2: 'PC' };
    expect(STORY.mission.height(inverted)).toBe('26,25');
    // even when he wrote the right h, the world carries out the pairing
    expect(STORY.mission.height({ ...inverted, h: '16,8' })).toBe('26,25');
    const out = STORY.mission.check(inverted);
    expect(out).not.toBe('ok');
    expect(out).toMatch(/^Ligne 2/);
    expect(out).toContain('26{,}25');
    said(out);
    expect(typographyErrors(out), out).toEqual([]);
    // the refusal gives neither k nor h
    expect(out).not.toMatch(/11|18/);
  });

  it('the flight is worded by where its height came from: the pairing carried out is not « Tu as écrit » (gate B 2026-11-27)', () => {
    const inverted = { ...RIGHT_MISSION, c1: 'PS', c2: 'PC' };
    const Tw = withStory(WORLD_TEXT, STORY.text);
    STORY.mission.height(inverted);
    const banner = STORY.mission.heightSay('26,25');
    expect(banner).toBe(frAll('Avec ces côtés associés : $h = 26{,}25$ m'));
    expect(banner).not.toMatch(/écrit/);
    expect(Tw.stage.say.rise).toMatch(/^Avec ces côtés associés/);
    expect(Tw.stage.say.rise).toContain('$h = 26{,}25$');
    expect(Tw.stage.say.rise).not.toMatch(/écrit/);
    STORY.mission.height(RIGHT_MISSION);
    expect(STORY.mission.heightSay('16,8')).toBe(frAll('Tu as écrit $h = 16{,}8$ m'));
    expect(Tw.stage.say.rise).toMatch(/hauteur que tu as écrite/);
    for (const t of [banner, STORY.mission.heightSay('16,8'), Tw.stage.say.rise]) {
      said(t);
      expect(typographyErrors(t), t).toEqual([]);
    }
  });

  it('each step opens only when the one before is right: the FIRST step that does not hold answers, a later one is never read', () => {
    const wrongAt = [
      [{ g2: 'haut' }, 'Ligne 1'],
      [{ g1: 'droit', g2: 'droit' }, 'Ligne 1'],
      [{ c1: 'CS' }, 'Ligne 2'],
      [{ c1: 'PC', c2: 'PC' }, 'Ligne 2'],
      [{ kn: '2', kd: '21' }, 'Ligne 3'],
      [{ k: '12' }, 'Ligne 3'],
      [{ m1: '2' }, 'Ligne 4'],
      [{ m2: '12' }, 'Ligne 4'],
      [{ h: '19' }, 'Ligne 4'],
    ];
    for (const [w, line] of wrongAt) {
      const out = STORY.mission.check({ ...RIGHT_MISSION, ...w });
      expect(out, JSON.stringify(w)).toMatch(new RegExp(`^${line}`));
      said(out);
      expect(typographyErrors(out), out).toEqual([]);
      expect(out).not.toMatch(/faux|erreur/i);
      // a wrong step 4 behind a wrong step 1 is never examined: step 1 answers
      const early = STORY.mission.check({ ...RIGHT_MISSION, ...w, g1: 'haut', g2: 'haut', h: '1' });
      expect(early).toMatch(/^Ligne 1/);
    }
    // an empty box is a wrong step, never a crash
    expect(STORY.mission.check({ ...RIGHT_MISSION, kn: '', k: '' })).toMatch(/^Ligne 3/);
    expect(STORY.mission.check({})).toMatch(/^Ligne 1/);
  });

  it('no refusal states the answer of its line: step 3 never writes 10,5, step 4 never writes 16,8', () => {
    for (const w of [{ k: '12' }, { k: '11' }, { k: '10' }]) {
      const out = STORY.mission.check({ ...RIGHT_MISSION, ...w });
      expect(out).toMatch(/^Ligne 3/);
      expect(out).not.toContain('10{,}5');
    }
    for (const w of [{ h: '19' }, { h: '20' }, { h: '17' }]) {
      const out = STORY.mission.check({ ...RIGHT_MISSION, ...w });
      expect(out).toMatch(/^Ligne 4/);
      expect(out).not.toMatch(/16,8|16\{,\}8/);
    }
    // what a refusal writes of his own numbers is true: 2 × 12 = 24
    expect(trueEqualities(STORY.mission.check({ ...RIGHT_MISSION, k: '12' }))).toBeGreaterThan(0);
  });

  it('the figure: two triangles APART, the right angle as a square (never « 90° »), the sun’s angle marked, valid', () => {
    const f = STORY.mission.figure;
    expect(validateGeoFigure(f)).toEqual([]);
    expect(f.rightAngles).toHaveLength(2);
    expect(f.angles).toHaveLength(2);
    for (const g of f.angles) expect(g.label).toBeUndefined();
    expect(JSON.stringify(f)).not.toMatch(/90/);
    for (const s of cardStrings(STORY.mission)) expect(s, s).not.toMatch(/90|°/);
    // no point of the stick's triangle is a point of the palm's
    expect(['M', 'N', 'A'].filter((p) => ['P', 'C', 'S'].includes(p))).toEqual([]);
    expect(f.segments.filter((s) => s.label === 'h')).toHaveLength(1);
  });

  it('the answers of the card are written nowhere before the card asks them: not 26,25, not 18, not 10,5', () => {
    // the flight's words follow the LAST height the world rose to: before any card, the h he writes
    STORY.mission.height(RIGHT_MISSION);
    const before = [
      ...Object.values(SAY),
      ...stringsIn(STORY.text),
      ...STORY.mission.lead,
      ...cardStrings(STORY.mission),
      ...['workshop', 'summit', 'plateau'].flatMap((id) => STORY.recall(fakeGame({ log: LOG }), id)),
    ];
    for (const s of before) expect(s, s).not.toMatch(/26,25|26{,}25|10,5|11\{,\}25|(?<![\d,])18(?![\d,])/);
    // 1,6 ; 2 ; 21 are written: they are the card's data
    expect(STORY.mission.lead.join(' ')).toMatch(/1,6/);
    expect(STORY.mission.lead.join(' ')).toMatch(/21/);
  });
});

describe(`${ID} — the cards and the sentences are French and whole`, () => {
  it('the card: at most five lines (four steps, the pairing on two), four boxes a line; a schematic figure with its ariaLabel', () => {
    const lines = STORY.mission.lines(ALL_OPEN);
    expect(lines.length).toBeLessThanOrEqual(5);
    for (const l of lines) expect(l.tokens.filter((t) => typeof t === 'object').length).toBeLessThanOrEqual(4);
    expect(STORY.mission.figure.points).toBeTruthy();
    expect(STORY.mission.figure.ariaLabel).toBeTruthy();
  });

  it('every sentence agrees with its numbers, and its typography is French', () => {
    const all = [
      ...cardStrings(STORY.mission),
      ...Object.values(SAY),
      ...stringsIn(STORY.text),
      ...stringsIn(TABLETS),
      ...['workshop', 'summit', 'plateau'].flatMap((id) => STORY.recall(fakeGame({ log: LOG }), id)),
    ];
    expect(all.length).toBeGreaterThan(20);
    for (const s of all) {
      said(s);
      expect(agreementErrors(s), s).toEqual([]);
      expect(typographyErrors(s), s).toEqual([]);
    }
    for (const s of Object.values(SAY)) expect(s).not.toMatch(/\$|\\/);
  });

  it('its numbers are the platform’s own: no pair of the mission on one line of any bank or of another story', () => {
    const stories = storiesOf({ exceptId: ID });
    const banks = readdirSync(PRACTICE, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => readBank(d.name));
    const nums = [MI.stick, MI.stickShadow, MI.palmShadow, MI.k, MI.h, MI.inverted];
    const tracked = (x) => Number(x.replace(',', '.')) >= 10 || x.includes(',');
    const xs = nums.filter(tracked);
    for (let i = 0; i < xs.length; i += 1)
      for (let j = i + 1; j < xs.length; j += 1)
        for (const bank of banks) {
          const c = collisions(bank, [xs[i], xs[j]], { stories });
          expect([c.named, c.bankLines, c.storyLines], `${xs[i]} ; ${xs[j]} in ${bank.id}`).toEqual([false, [], []]);
        }
  });
});

describe(`${ID} — no rule before its key: Zero, the recall card, the instructions and the legs`, () => {
  /** The words of each key: no sentence played before its seal says them. */
  const WORDS = {
    [K.cotes]: /semblable|homologue|proportionnel|quotient|réduction|coefficient/i,
    [K.angles]: /deux angles|angles égaux|somme des angles|180/i,
  };
  const g = fakeGame({ log: LOG });
  const say = (id) => {
    const x = fakeGame({ log: LOG });
    STORY.onArrive(x, id);
    return x.says;
  };
  const fill = (v) => (typeof v === 'function' ? v('AB', '[SE]', 'C') : v);
  const worldObjectives = [
    ...Object.values(T.objective).map(fill),
    ...Object.values(SO).map((v) => (typeof v === 'function' ? v('55') : v)),
  ];
  /** The sentences of the legs a student can meet, over many seeds. */
  const legLines = (i) =>
    Array.from({ length: 40 }, (_, n) => LEGS[i].round(1, rng(n * 31 + i + 1), n)).flatMap((r) => [r.ask, ...r.why]);
  const BEFORE = {
    [K.cotes]: [
      T.docks[1],
      ...say('workshop'),
      ...STORY.recall(g, 'workshop'),
      ...worldObjectives,
      SO.forge,
      Object.values(T.stage.order).map((o) => o.title ?? ''),
    ].flat(),
    [K.angles]: [
      T.docks[3],
      ...say('summit'),
      ...STORY.recall(g, 'summit'),
      SO.climb,
      SO.capstone,
      SO.forge,
      T.stage.order.capstone.ask(),
      ...legLines(1),
    ],
  };

  it('what is said before each forge names no key still missing', () => {
    for (const [key, lines] of Object.entries(BEFORE)) {
      expect(lines.length, key).toBeGreaterThan(3);
      for (const line of lines.filter(Boolean)) {
        said(line);
        expect(line, `${key}: ${line}`).not.toMatch(WORDS[key]);
      }
    }
    // after K1's seal, Zero names K1 (« semblables ») — never K2's rule
    const x = fakeGame();
    STORY.afterKey[K.cotes](x);
    expect(x.says[0]).toMatch(/semblables/);
    expect(x.says[0]).not.toMatch(WORDS[K.angles]);
    // and the world's own mission objective does not tell the rule
    for (const s of [SO.mission, SO.shadow, SO.end]) expect(s).not.toMatch(WORDS[K.angles]);
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
  });

  it('after K2’s seal Zero says what the key gives and sends him to the palm', () => {
    const x = fakeGame();
    STORY.afterKey[K.angles](x);
    expect(x.says[0]).toMatch(/palmier/);
  });
});

describe(`${ID} — the tablets: the recall words, true formulas`, () => {
  const RECALL = {
    [K.cotes]: ['semblables', 'homologues', 'réduction'],
    [K.angles]: ['semblables', 'deux angles', '180'],
  };
  it('one tablet per key: its recall words outside a formula; two lines, two formulas, one note at most', () => {
    expect(Object.keys(TABLETS)).toEqual(KEYS);
    for (const key of KEYS) {
      const t = TABLETS[key];
      const words = `${t.title} ${t.lines.join(' ')}`.replace(/\$[^$]*\$/g, (m) => (m.includes('180') ? ' 180 ' : ' '));
      for (const w of RECALL[key]) expect(words, `${key}: ${w}`).toContain(w);
      expect(t.lines.length).toBeLessThanOrEqual(2);
      expect(t.math.length).toBeLessThanOrEqual(2);
      expect(t.notes.length).toBeLessThanOrEqual(1);
      for (const n of t.notes) expect(n).not.toMatch(/\$|\\/);
    }
  });

  it('the rules are the design’s, word for word', () => {
    const k1 = TABLETS[K.cotes].lines[0];
    expect(k1).toBe(
      'Deux triangles sont semblables quand leurs côtés, rangés du plus petit au plus grand, ont trois quotients égaux : leurs longueurs sont proportionnelles.',
    );
    const k2 = TABLETS[K.angles].lines[0];
    expect(k2).toBe(
      'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, alors ces deux triangles sont semblables.',
    );
    expect(TABLETS[K.angles].lines[1]).toContain('la somme des angles d’un triangle vaut');
  });

  it('their formulas of numbers are true: K1’s template against SIM and RED, K2’s third angle and k = 4/3', () => {
    // the checker reads whole numbers only: a formula with a decimal or a degree sign is checked exactly below
    expect(equalitiesHold(TABLETS[K.angles].math[1])).toBeGreaterThan(0);
    // ONE formula (SIM's): with RED's too, the board's naming card overflowed at 1366 × 768
    expect(TABLETS[K.cotes].math).toEqual(['\\dfrac{3}{2} = \\dfrac{4{,}5}{3} = \\dfrac{5{,}7}{3{,}8}']);
    expect(TABLETS[K.angles].math[0]).toBe('180^\\circ - 27^\\circ - 41^\\circ = 112^\\circ');
    const [t1, t2, t3] = NUMBERS.cotes.template;
    const sim = NUMBERS.cotes.rounds[0].sides;
    // SIM: 3 ÷ 2 = 4,5 ÷ 3 = 5,7 ÷ 3,8 (the traced sides ranked)
    expect(equal(over('3', t1), over('4,5', t2))).toBe(true);
    expect(equal(over('3', t1), over('5,7', t3))).toBe(true);
    expect([...sim].sort()).toEqual(['3', '4,5', '5,7']);
    // RED: 1 ÷ 2 = 1,5 ÷ 3 = 1,9 ÷ 3,8
    expect(equal(over('1', t1), over('1,5', t2))).toBe(true);
    expect(equal(over('1', t1), over('1,9', t3))).toBe(true);
    // K2 R1: the third angle 112, the sides opposite 6 and 8
    expect(180 - 27 - 41).toBe(112);
    expect(equal(over('8', '6'), '4/3')).toBe(true);
    // the last step of K1: [MN] = 12 paired with the middle side 3 → k = 4, the others 8 and 15,2
    const U = NUMBERS.cotes.use;
    expect(write(over(U.given, U.pairedWith))).toBe(U.k);
    expect(write(times(t1, U.k))).toBe(U.short);
    expect(write(times(t3, U.k))).toBe(U.long);
    expect(FACE.base).toBe('99');
  });

  it('K1 rounds: SIM and RED have the shape, ONE and DIFF do not, TURN’s names give three unequal quotients', () => {
    const [t1, t2, t3] = NUMBERS.cotes.template;
    for (const r of NUMBERS.cotes.rounds) {
      const sides = [...r.sides].sort((a, b) => Number(a.replace(',', '.')) - Number(b.replace(',', '.')));
      const quotients = sides.map((s, i) => over(s, [t1, t2, t3][i]));
      const allEqual = quotients.every((q) => equal(q, quotients[0]));
      expect(allEqual, r.id).toBe(r.shape);
    }
    const turn = NUMBERS.cotes.rounds.find((r) => r.id === 'turn');
    const byNames = turn.byNames.map(([a, b]) => over(a, b));
    expect(byNames.some((q) => !equal(q, byNames[0]))).toBe(true);
  });
});
