/**
 * THE STORY of lesson `triangles-semblables` in the world « Les pyramides » (`gameworld/nilePyramids/Game.js` plays it;
 * design: `docs/reports/UNIT_3E_THALES_DESIGN.md`, « Lesson 1 », v4). The stages are the WORLD's data (its numbers:
 * `nilePyramids/logic.js`); the lesson gives what the world asks of it (the header of `Game.js`): the docks it plays, the
 * forge of each stage's table, the felucca's legs, the sun and the object of the plateau, the card of the final mission,
 * its sentences.
 *
 *   Le chantier des bâtisseurs   the masons trace triangles on the sand before cutting: the world's steps (the rope up an
 *                                edge, two courses, the row) play as scenery; the forge K1 `cotes-proportionnels` is a
 *                                2D experiment at the masons' table, the two triangles APART
 *   Le pyramidion                the capstone « chaque longueur × [k] » (his 4e reduction, no forge of its own); the forge
 *                                K2 `angles-egaux`, a protractor on two triangles apart
 *   Le palmier du plateau        `plateau: { tan: '4/5', object: 'palm', h: '16,8', stick: '1,6', slide: false }`: the stick
 *                                and a date palm APART, their shadows; the mission card, four steps — the angles, the
 *                                pairing, k, h —; Zero rises to his h (cime · dessous · dessus)
 *
 * No rule is told: nothing here names a key or states a rule before its forge (`story.test.js` reads every sentence a
 * stage plays before each seal: « semblable », « homologue », « proportionnel » never before K1's seal, K2's rule never
 * before K2's). The mission's distractor (design, gate A 4th reading, note 1): the pairing inverted PLAYS its consequence —
 * Zero rises to 26,25 m, above the palm — then refuses.
 *
 * THE MISSION CARD'S STEPS « open only when the one before is right » (design): the card reads `lines(vals)` at every
 * entry (`NilePyramids.jsx › StoryCard`, 2026-11-27), so a line appears only once the lines before it hold (`opened`);
 * `check` still judges the steps in order and answers the FIRST one that does not hold.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { choiceBox, decimalBox, line } from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { LEGS } from './run';
import { TABLETS } from './tablets';
import { FACE, K, NUMBERS, equal, frAll, metres, over, times, tx, typedNumber, write } from './math';

// the keys' ids: `K` of `./math`

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys each needs: module 1 is dock 2 (K1), module 2 dock 4 (K2, after K1), module 3 the last dock (the mission, the
 * problem of the lesson). The world marks every module at the story's end (`kit/storyEnd.js`). `journey.test.js` checks
 * this table against the config.
 */
export const MODULE_KEYS = {
  1: [K.cotes],
  2: [K.cotes, K.angles],
  3: [K.cotes, K.angles],
};

const MI = NUMBERS.mission;
/** k = 21 ÷ 2: the palm's shadow over the stick's, K1's quotient. */
export const MISSION_K = write(over(MI.palmShadow, MI.stickShadow));
/** h = 1,6 × 10,5: the palm's height. */
export const MISSION_H = write(times(MI.stick, MISSION_K));
/** The pairing inverted: 21 × 2 ÷ 1,6 — what Zero rises to. */
export const INVERTED_H = write(over(times(MI.palmShadow, MI.stickShadow), MI.stick));

/** The plateau's sun and the object measured (`Game.js › plateauOf`): the date palm of 16,8 m under tan 4/5, no slide. */
const PLATEAU = { tan: '4/5', object: 'palm', h: MI.h, stick: MI.stick, slide: false };

/** Zero's sentences of the story — facts and directions, never a rule (`story.test.js`). Plain text: no formula. */
export const SAY = frAll({
  workshop:
    'Les maçons tracent chaque triangle sur le sable avant de tailler. Un tracé doit avoir la même forme que le gabarit : la pierre ne se rattrape pas.',
  summit: `Cette pyramide a une base de ${metres(FACE.base)}. Les blocs du pyramidion se taillent un à un, et les maçons ont apporté un rapporteur.`,
  plateau:
    'Sur le plateau, un palmier se dresse seul. Personne ne le mesure à la corde : son ombre s’étend sur le sable.',
  key1: 'Tu reconnais maintenant des triangles semblables par leurs côtés. Un maçon n’a pas toujours un mètre sous la main : au pyramidion, il prend un rapporteur.',
  key2: 'Deux angles suffisent : plus besoin de mètre. Un palmier t’attend au dernier embarcadère, et la felouque aussi.',
});
const ARRIVE = { workshop: SAY.workshop, summit: SAY.summit, plateau: SAY.plateau };

/** The newest entry of the log for a step. */
const lastOf = (game, step) => [...(game.log ?? [])].reverse().find((l) => l.step === step) ?? null;
/** The world's three facts of a row laid at his mark, by the key `orders.js` logs. */
const MARK_FACT = { fits: 'markFits', gap: 'markGap', overhang: 'markOver' };
/** A sentence carried after « : » (its first letter lowered). */
const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);

/** The card « De l’embarcadère précédent »: what the dock before gave — facts he saw, at most three lines. */
function recall(game, id) {
  const T = game.T;
  const out = [];
  if (id === 'summit') {
    const mark = lastOf(game, 'mark');
    const fact = mark && T.stage.fact[MARK_FACT[mark.fact]];
    // the world's fact is a sentence of its own (a capital letter): after a full stop, never after « : »
    if (mark?.typed && fact) out.push(`La rangée de ${metres(FACE.row)} : $BM = ${tx(mark.typed)}$ m. ${fact}`);
  }
  // the plateau: K2's key, the rule of its tablet — what the mission needs (its two angles) — and NO number of the
  // pyramidion's: a dock's world number beside the mission's 1,6 ; 2 ; 21 is forbidden (design, gate B 2026-11-27)
  if (id === 'plateau') out.push(`Ta clé du pyramidion : ${lowerFirst(TABLETS[K.angles].lines[0])}`);
  return frAll(out.slice(-3));
}

/**
 * The schematic figure of the mission card (not to scale — the card says so): the stick's triangle M N A and the palm's
 * P C S APART, each with its right angle (the square, never a number) and the sun's angle at the tip of its shadow.
 */
const MISSION_FIGURE = {
  points: { N: [0, 1.9], M: [0, 0], A: [2.4, 0], C: [5, 7.2], P: [5, 0], S: [14, 0] },
  segments: [
    { from: 'M', to: 'N', label: metres(MI.stick), tone: 'rose', bold: true },
    { from: 'M', to: 'A', label: metres(MI.stickShadow), tone: 'indigo' },
    { from: 'N', to: 'A', tone: 'indigo' },
    { from: 'P', to: 'C', label: 'h', tone: 'rose', bold: true },
    { from: 'P', to: 'S', label: metres(MI.palmShadow), tone: 'indigo' },
    { from: 'C', to: 'S', tone: 'indigo' },
  ],
  rightAngles: [
    ['N', 'M', 'A'],
    ['C', 'P', 'S'],
  ],
  angles: [
    { at: 'A', from: 'M', to: 'N', tone: 'amber' },
    { at: 'S', from: 'P', to: 'C', tone: 'amber' },
  ],
  ariaLabel: 'Le bâton vertical et son ombre, le palmier et son ombre : deux triangles séparés',
};

/** Step 1: the two angles the two triangles are KNOWN to share. */
const ANGLES = [
  { id: 'droit', text: 'l’angle droit' },
  { id: 'soleil', text: 'l’angle du soleil' },
  { id: 'haut', text: 'l’angle du haut' },
];
/** Step 2: the palm's side that goes with a side of the stick's triangle. */
const SIDES = [
  { id: 'PC', text: '[PC]' },
  { id: 'PS', text: '[PS]' },
  { id: 'CS', text: '[CS]' },
];

/** The pairing he wrote: right (the height with the height, the shadow with the shadow), inverted, or neither. */
const pairing = (v) =>
  v.c1 === 'PC' && v.c2 === 'PS' ? 'right' : v.c1 === 'PS' && v.c2 === 'PC' ? 'inverted' : 'other';

/** The card's lines, in order (design's four steps: angles, pairing — two lines —, k, h). */
const LINES = frAll([
  line([
    'Les deux triangles ont deux angles égaux :',
    choiceBox('g1', 'un angle', ANGLES),
    'et',
    choiceBox('g2', 'un angle', ANGLES),
  ]),
  // the pairing, one pair a line: both on one line wrapped « [MN] et » under its label (the walk of 2026-11-27)
  line(['Côtés homologues : $[MN]$ et', choiceBox('c1', 'un côté', SIDES)]),
  line(['Côtés homologues : $[MA]$ et', choiceBox('c2', 'un côté', SIDES)]),
  line([
    '$k =$',
    decimalBox('kn', 'une longueur', 5),
    '÷',
    slot('kd', 'une longueur', 3),
    '=',
    decimalBox('k', 'k', 6),
  ]),
  line([
    '$h =$',
    decimalBox('m1', 'une longueur', 4),
    '×',
    decimalBox('m2', 'k', 6),
    '=',
    decimalBox('h', 'h', 5),
    'm',
  ]),
]);

/**
 * How many lines are open: the first, then each next step once the one before holds (the same tests as `check`). The
 * pairing (step 2) is two lines, one pair a line: steps 1–4 open 1, 3, 4, 5 lines.
 */
function opened(v) {
  const known = [v.g1, v.g2].sort().join() === ['droit', 'soleil'].sort().join();
  if (!known) return 1;
  if (pairing(v) !== 'right') return 3;
  const [kn, kd, k] = [typedNumber(v.kn), typedNumber(v.kd), typedNumber(v.k)];
  const kOk =
    kn != null &&
    kd != null &&
    k != null &&
    equal(kn, MI.palmShadow) &&
    equal(kd, MI.stickShadow) &&
    equal(k, MISSION_K);
  return kOk ? 5 : 4;
}

/**
 * Where the height Zero last rose to came from: 'pairing' (the inverted pairing — he wrote NO height, the world carries
 * out his sides) or 'typed' (the h of line 4). `height(vals)` sets it just before the world flies (`Game.js ›
 * checkMission` reads `height` first, then says `stage.say.rise`, then shows the fact `heightSay` words).
 */
const FLIGHT = { from: 'typed' };
/** The banner over the flight and Zero's bubble: the h of his card's sides, or the h he wrote — with its unit. */
const heightSay = (typed) =>
  FLIGHT.from === 'pairing'
    ? frAll(`Avec ces côtés associés : $h = ${tx(typed)}$ m`)
    : frAll(`Tu as écrit $h = ${tx(typed)}$ m`);
const RISE = frAll({
  typed: 'Zéro monte le long du palmier, jusqu’à la hauteur que tu as écrite.',
  pairing: `Avec ces côtés associés : $h = ${tx(INVERTED_H)}$ m. Zéro monte le long du palmier jusqu’à cette hauteur.`,
});

/** THE MISSION (design, « The mission ») — P2 + P3 + P4 on two triangles APART, four steps judged in order. */
const MISSION = frAll({
  title: 'Carte de mission — le palmier du plateau',
  lead: [
    `Un bâton vertical de ${metres(MI.stick)} porte une ombre de ${metres(MI.stickShadow)}. Au même moment, l’ombre du palmier mesure ${metres(MI.palmShadow)}. Quelle est sa hauteur ?`,
  ],
  figure: MISSION_FIGURE,
  lines: (v = {}) => LINES.slice(0, opened(v)),
  /** 'ok', or a FACT about the first step that does not hold yet — a later step is never examined. */
  check(v) {
    // 1 — the angles he KNOWS: the right angle (the square) and the sun's
    const known = [v.g1, v.g2].sort().join();
    if (known !== ['droit', 'soleil'].sort().join()) {
      if (v.g1 === v.g2) return 'Ligne 1 : choisis deux angles différents.';
      return 'Ligne 1 : l’angle du haut est égal dans les deux triangles, mais on ne le connaît qu’après les deux autres.';
    }
    // 2 — the pairing of the sides: the height with the height, the shadow with the shadow
    const p = pairing(v);
    if (p === 'inverted')
      return `Ligne 2 : avec ces côtés associés, le palmier mesurerait $${tx(INVERTED_H)}$ m. Regarde où Zéro s’arrête.`;
    if (p !== 'right') {
      if (v.c1 === v.c2) return 'Ligne 2 : choisis deux côtés différents du palmier.';
      return 'Ligne 2 : $[CS]$ est en face de l’angle droit du palmier, comme $[NA]$ dans le triangle du bâton, pas comme $[MN]$ ni $[MA]$.';
    }
    // 3 — k, from the shadow of the stick to the shadow of the palm
    const [kn, kd, k] = [typedNumber(v.kn), typedNumber(v.kd), typedNumber(v.k)];
    if (kn == null || kd == null || !equal(kn, MI.palmShadow) || !equal(kd, MI.stickShadow))
      return 'Ligne 3 : l’ombre du bâton devient l’ombre du palmier : $k$ est le nombre qui multiplie l’une pour donner l’autre.';
    if (k == null || !equal(k, MISSION_K))
      return `Ligne 3 : $${tx(kd)} \\times ${tx(k ?? '0')} = ${tx(times(kd, k ?? '0'))}$ et non $${tx(kn)}$.`;
    // 4 — h = the stick × k
    const [m1, m2, h] = [typedNumber(v.m1), typedNumber(v.m2), typedNumber(v.h)];
    if (m1 == null || !equal(m1, MI.stick))
      return 'Ligne 4 : la hauteur du palmier vient de la hauteur du bâton multipliée par $k$.';
    if (m2 == null || !equal(m2, MISSION_K)) return 'Ligne 4 : le nombre qui multiplie la hauteur du bâton est $k$.';
    if (h == null || !equal(h, MISSION_H))
      return `Ligne 4 : le produit $${tx(m1)} \\times ${tx(m2)}$ ne vaut pas $${tx(h ?? '0')}$.`;
    return 'ok';
  },
});
/** What Zero rises to: the h his pairing gives when it is inverted (the world carries it out), else the h he wrote. */
MISSION.height = (v) => {
  FLIGHT.from = pairing(v) === 'inverted' ? 'pairing' : 'typed';
  return FLIGHT.from === 'pairing' ? INVERTED_H : v.h;
};
/** The words of the flight's banner (`NilePyramids.jsx › Fact`): never « Tu as écrit » a height he did not write. */
MISSION.heightSay = heightSay;

/** The words of the world this story changes (`withStory` merges one level deep): a palm, not the Great Pyramid. */
const TEXT = {
  docks: [...WORLD_TEXT.docks.slice(0, 4), 'Le palmier du plateau'],
  end: {
    ...WORLD_TEXT.end,
    text: frAll(
      'Tu as reconnu des triangles semblables par leurs côtés et par leurs angles, et mesuré un palmier sans le toucher.',
    ),
  },
  fact: {
    ...WORLD_TEXT.fact,
    ...frAll({
      apex: 'Zéro est à la cime du palmier.',
      below: 'Zéro est sous la cime du palmier.',
      above: 'Zéro est au-dessus de la cime du palmier.',
    }),
  },
  stage: {
    ...WORLD_TEXT.stage,
    objective: {
      ...WORLD_TEXT.stage.objective,
      ...frAll({
        shadow:
          'Mesure à la corde l’ombre du palmier, de son pied $P$ jusqu’au bout $S$ de son ombre : appuie sur E en $P$.',
        mission:
          'Le bâton et le palmier sont séparés, chacun avec son ombre. Ouvre la carte de mission : quelle est la hauteur du palmier ?',
        end: 'Tu as mesuré le palmier sans le toucher.',
      }),
    },
    // `rise`: read when the world flies, after `mission.height` — the words of where the height came from
    say: Object.defineProperty({ ...WORLD_TEXT.stage.say }, 'rise', {
      enumerable: true,
      get: () => RISE[FLIGHT.from],
    }),
  },
};

export const STORY = {
  /** The docks this story plays, downstream (`logic.js › STAGE_IDS`): the workshop (2), the summit (4), the plateau (5). */
  stages: ['workshop', 'summit', 'plateau'],
  text: TEXT,
  /** The felucca's legs (`run.js`), by the place of the dock they leave: 1 (workshop → summit), 3 (summit → plateau). */
  legs: LEGS,
  /** The forge played at each stage's table (`forges.js`). */
  forges: { workshop: K.cotes, summit: K.angles },
  /** The plateau: a date palm of 16,8 m under the sun tan 4/5, the stick 1,6 m, the two triangles apart (T3). */
  plateau: PLATEAU,
  mission: MISSION,
  recall,
  /** On arriving at a stage: one sentence of Zero (a fact of the place). Run twice, it says it twice — nothing more. */
  onArrive(game, id) {
    if (ARRIVE[id]) game.say(ARRIVE[id], 6);
  },
  afterKey: {
    [K.cotes]: (game) => game.say(SAY.key1, 8),
    [K.angles]: (game) => game.say(SAY.key2, 6),
  },
};
