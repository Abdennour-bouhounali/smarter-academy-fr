/**
 * THE STORY of lesson `thales-configuration-papillon` in the world « Les pyramides » (`gameworld/nilePyramids/Game.js`
 * plays it; design: `docs/reports/UNIT_3E_THALES_DESIGN.md` § 2, § 6). The stages are the WORLD's data (its numbers:
 * `nilePyramids/logic.js`); the lesson gives what the world asks of it (the header of `Game.js`): the docks it plays,
 * the forge of each stage's table, the felucca's legs, the card of the final mission, the box at noon, its sentences.
 *
 *   La largeur du Nil              AS, SE, ER until S hides F; the ferry rope cut before crossing → forge K1 `papillon`
 *   Le pyramidion                  « chaque longueur × [k] » to the stone-cutter (his 4e reduction, no forge of its
 *                                  own): the register gives the pyramid's base 99 m and the platform 2,75 m itself —
 *                                  playable without the workshop, which is not on France's map (gate A, F2) → forge K2
 *   L’ombre de la grande pyramide  morning: the stick, the shadows, the card, Zero rises to his h (his 4e tool and K2's
 *                                  join); noon: Ibn al-Haytham's box — the sheet's height (K1's sentence and pairing, K2's
 *                                  OH from the vertex)
 *
 * No rule is told: nothing here names a key or states a rule before its forge (`story.test.js` reads every sentence a
 * stage plays before each seal). The box's distractors (design § 2): the half base forgotten (73/177 ≈ 0,41: the sheet
 * is too big), the ratio upside down (1: too big), the whole base (73/407 ≈ 0,18: the image overflows). The length
 * ACROSS the hole cannot be a fact of the box (0,4 mm short) — « across » is proven by the forges and the legs.
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  choiceBox,
  decimalBox,
  fractionBox,
  line,
  ratioChoice,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { WORLD_TEXT } from '../../../../../../common/gameworld/nilePyramids/strings';
import { LEGS } from './run';
import {
  FACE,
  K,
  NUMBERS,
  PLATEAU,
  RIVER,
  compare,
  equal,
  frAll,
  metres,
  over,
  plus,
  times,
  tx,
  typedFrac,
  typedNumber,
  typedWhole,
  write,
} from './math';

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys each needs: module 1 is dock 3 (K1), module 2 dock 4 (K2), module 3 the last dock (the mission, the problem of
 * the lesson). The world marks every module at the story's end (`kit/storyEnd.js`). `journey.test.js` checks this
 * table against the config.
 */
export const MODULE_KEYS = {
  1: [K.papillon],
  2: [K.papillon, K.calcul],
  3: [K.papillon, K.calcul],
};

/** The final mission's numbers (§ 2): the stick 2 casts 3; the shadow 104 from the middle of the base edge. */
const MI = NUMBERS.mission;
const BX = NUMBERS.box;
/** Half the base: the shadow starts under the APEX, at the centre of the base. */
export const HALF = write(over(PLATEAU.base, '2'));
/** AB = AH + HB, from the tip of the shadows to the point under the apex. */
export const MISSION_AB = write(plus(MI.shadow, HALF));
/** h from AM / AB = MN / BC: the height of the Great Pyramid. */
export const MISSION_H = write(over(times(MISSION_AB, MI.stick), MI.stickShadow));
/** Noon: OH = 177 + 115, from the hole O to the centre H of the base, under the apex. */
export const BOX_OH = write(plus(BX.fromEdge, HALF));
/** S′H′ = OH′ × SH / OH: the height of the sheet the image fills. */
export const BOX_IMAGE = write(over(times(BX.depth, MISSION_H), BOX_OH));

/** Zero's sentences of the story — facts and directions, never a rule (`story.test.js`). Plain text: no formula. */
export const SAY = frAll({
  river: 'Le bac a besoin d’une corde, coupée avant que quelqu’un traverse le fleuve.',
  summit: `Cette pyramide a une base de ${metres(FACE.base)}. Il ne manque que son pyramidion, une petite pyramide de la même forme.`,
  plateau: 'La grande pyramide : personne ne l’escalade, et son ombre s’étend sur le sable.',
  key1: 'On raconte que Thalès de Milet a mesuré la hauteur d’une pyramide avec l’ombre d’un bâton. Au dernier embarcadère, tu feras comme lui.',
  key2: 'Plus besoin de corde pour les longueurs que tu ne peux pas atteindre. La felouque t’attend.',
});
const ARRIVE = { river: SAY.river, summit: SAY.summit, plateau: SAY.plateau };

/** A length of a formula line, then « m » after a no-break space. */
const m = (x) => `$${tx(x)}$ m`;
/** The newest entry of the log for a step. */
const lastOf = (game, step) => [...(game.log ?? [])].reverse().find((l) => l.step === step) ?? null;
/** A ratio he typed as a formula — or null when it is not one. */
const ratioTex = (x) => {
  try {
    return tx(x);
  } catch {
    return null;
  }
};

/** The card « De l’embarcadère précédent »: what the dock before gave — facts he saw, at most three lines. */
function recall(game, id) {
  const T = game.T;
  const out = [];
  if (id === 'summit') {
    out.push(`$AS = ${RIVER.AS}$ m, $SE = ${RIVER.SE}$ m et $ER = ${RIVER.ER}$ m.`);
    const ferry = lastOf(game, 'ferry');
    // the world's fact is a sentence of its own (a capital letter): after a full stop, never after « : »
    if (ferry) out.push(`La corde du bac : $AF = ${tx(ferry.typed)}$ m. ${T.fact[ferry.fact]}`);
  }
  if (id === 'plateau') {
    const cap = lastOf(game, 'capstone');
    const k = cap && ratioTex(cap.typed);
    if (k) out.push(`Le pyramidion : chaque longueur × $${k}$. ${T.stage.fact[cap.fact]}`);
  }
  return frAll(out.slice(-3));
}

/** The schematic figure of the mission card (not to scale — the card says so): the stick's triangle in the big one. */
const MISSION_FIGURE = {
  points: { A: [0, 0], M: [2.4, 0], N: [2.4, 1.6], H: [6.4, 0], B: [9.4, 0], C: [9.4, 6.2] },
  segments: [
    { from: 'A', to: 'M', label: MI.stickShadow },
    { from: 'M', to: 'H' },
    { from: 'H', to: 'B' },
    { from: 'A', to: 'C', tone: 'amber' },
    { from: 'M', to: 'N', label: MI.stick, tone: 'rose', bold: true },
    { from: 'B', to: 'C', label: 'h', tone: 'rose', bold: true },
  ],
  ariaLabel: 'Le bâton et son ombre, dans le triangle de la pyramide et de son ombre',
};
/** The box at noon (not to scale): the apex S and the centre H of the base, their images S′ and H′ through the hole O. */
const BOX_FIGURE = {
  points: { S: [-8, 4], H: [-8, 0], O: [0, 0], 'H′': [1.6, 0], 'S′': [1.6, -0.8] },
  segments: [
    { from: 'H', to: 'S', label: MISSION_H, tone: 'rose', bold: true },
    { from: 'S', to: 'S′', tone: 'amber' },
    { from: 'H', to: 'H′' },
    { from: 'H′', to: 'S′', label: '?', tone: 'rose', bold: true },
  ],
  ariaLabel: 'La pyramide et son image renversée par le trou de la chambre noire',
};

/** The two parts of a sum he typed, as a sorted key — or null. */
const partsOf = (a, b) => {
  const [x, y] = [typedWhole(a), typedWhole(b)];
  return x == null || y == null ? null : [x, y].sort((p, q) => p - q).join(';');
};
const sortedKey = (...xs) =>
  xs
    .map(Number)
    .sort((p, q) => p - q)
    .join(';');

const WHY = [
  { id: 'vertical', text: 'toutes deux verticales' },
  { id: 'length', text: 'de même longueur' },
  { id: 'shadow', text: 'chacune a une ombre' },
];

/** THE FINAL MISSION, morning — « L’ombre de la grande pyramide » (§ 2): his 4e tool and K2's join; Zero rises. */
const MISSION = frAll({
  title: 'Carte de mission — l’ombre de la grande pyramide',
  lead: [
    `Le bâton $[MN]$ mesure ${m(MI.stick)} et son ombre $AM = ${MI.stickShadow}$ m. L’ombre de la pyramide mesure $AH = ${MI.shadow}$ m depuis le milieu $H$ du bord de la base, et le côté de la base mesure ${m(PLATEAU.base)}. Le point $B$ est sous le sommet $C$, au centre de la base.`,
  ],
  figure: MISSION_FIGURE,
  lines: () => [
    line(['$AB = AH + HB =$', slot('ah', 'AH', 3), '+', slot('hb', 'HB', 3), '=', slot('ab', 'AB', 3)]),
    line(['$(MN)$ et $(BC)$ sont parallèles car', choiceBox('why', 'la raison', WHY)]),
    line([
      fractionBox('rn', 'rd', { w: 3 }),
      '=',
      { frac: { n: slot('mn', 'MN', 1), d: '$h$' } },
      '$\\Rightarrow h =$',
      decimalBox('h', 'h', 5),
    ]),
  ],
  /** 'ok', or a FACT about the first line that does not hold yet. */
  check(v) {
    const parts = partsOf(v.ah, v.hb);
    if (parts !== sortedKey(MI.shadow, HALF)) {
      if (parts === sortedKey(MI.shadow, PLATEAU.base))
        return `Ligne 1 : $HB$ va du milieu du bord de la base jusqu’au centre de la base, pas tout le côté de ${m(PLATEAU.base)}.`;
      return `Ligne 1 : $AH = ${MI.shadow}$ m, et $HB$ va du milieu du bord de la base jusqu’au point $B$, sous le sommet.`;
    }
    const ab = typedWhole(v.ab);
    if (ab == null || !equal(String(ab), MISSION_AB))
      return `Ligne 1 : $${MI.shadow} + ${HALF}$ ne fait pas $${ab ?? '?'}$.`;
    if (v.why !== 'vertical')
      return 'Ligne 2 : cela ne rend pas deux droites parallèles. Comment le bâton et la hauteur se tiennent-ils sur le sol ?';
    const r = typedFrac(v.rn, v.rd);
    if (r == null || !equal(r, over(MI.stickShadow, MISSION_AB))) {
      if (r != null && equal(r, over(MISSION_AB, MI.stickShadow)))
        return 'Ligne 3 : le rapport est une longueur depuis le sommet $A$ sur le côté entier, comme $\\dfrac{MN}{BC}$.';
      if (r != null && equal(r, over(MI.stickShadow, MI.shadow)))
        return `Ligne 3 : $AB = ${MISSION_AB}$ m, comme à la ligne 1.`;
      return 'Ligne 3 : le rapport $\\dfrac{AM}{AB}$, avec les longueurs.';
    }
    if (typedWhole(v.mn) == null || !equal(String(typedWhole(v.mn)), MI.stick))
      return 'Ligne 3 : $MN$ est la longueur du bâton.';
    const h = typedNumber(v.h);
    if (h == null || !equal(h, MISSION_H)) {
      const shown = h ?? '0';
      return `Ligne 3 : $${MI.stickShadow} \\times ${tx(shown)} = ${tx(times(MI.stickShadow, shown))}$ et $${MISSION_AB} \\times ${MI.stick} = ${tx(times(MISSION_AB, MI.stick))}$.`;
    }
    return 'ok';
  },
  /** The h he wrote: Zero rises to it, whatever it is (the world carries out a misreading). */
  height: (v) => v.h,
});

const POINT = ['H', 'H′', 'S′'];
/** The chain of the box, image over object; and the same upside down. */
const CHAIN = ['OH′/OH', 'OS′/OS', 'S′H′/SH'];
const UPSIDE = CHAIN.map((r) => r.split('/').reverse().join('/'));

/** IBN AL-HAYTHAM'S BOX at noon (§ 2): the sheet the image of the pyramid fills — K1's sentence, K1's pairing, K2's OH. */
const BOX = frAll({
  title: 'La chambre noire d’Ibn al-Haytham',
  lead: [
    `La chambre noire est posée à ${m(BX.fromEdge)} du bord de la pyramide ; son trou $O$ est à ${m(BX.depth)} du fond. Quelle hauteur de feuille faut-il au fond pour que l’image de la pyramide la remplisse exactement ?`,
  ],
  figure: BOX_FIGURE,
  lines: () => [
    line([
      "Les points $S$, $O$, $S'$ sont alignés, ainsi que",
      choiceBox('p1', 'un point', POINT),
      ', $O$ et',
      choiceBox('p2', 'un point', POINT),
      " ; $(SH) \\parallel (S'H')$ car",
      choiceBox('why', 'la raison', WHY),
    ]),
    line([
      'D’après le théorème de Thalès :',
      ratioChoice('r1n', 'r1d', ['OH′', 'OH', 'OS′', 'OS']),
      '=',
      ratioChoice('r2n', 'r2d', ['S′H′', 'SH', 'OH′', 'OH']),
    ]),
    line(['$OH =$', slot('o1', 'une longueur', 3), '+', slot('o2', 'une longueur', 3), '=', slot('oh', 'OH', 3)]),
    line([
      "$S'H' =$",
      decimalBox('a', 'une longueur', 4),
      '×',
      slot('b', 'une longueur', 3),
      '÷',
      slot('c', 'une longueur', 3),
      '=',
      decimalBox('img', 'la feuille', 5),
      'm',
    ]),
  ],
  /** The sheet he cut against the image first (the world's fact), then each line that does not say why yet. */
  check(v) {
    const img = typedNumber(v.img);
    if (img == null) return 'Ligne 4 : écris la hauteur de la feuille, en mètres, avec une virgule s’il le faut.';
    const against = compare(img, BOX_IMAGE);
    if (against > 0)
      return `Tu découpes une feuille de ${metres(img)} : elle est trop grande, l’image de la pyramide n’en couvre qu’une partie.`;
    if (against < 0) return `Tu découpes une feuille de ${metres(img)} : l’image de la pyramide déborde de la feuille.`;
    if ([v.p1, v.p2].sort().join() !== ['H', 'H′'].sort().join())
      return 'Ligne 1 : le second rayon passe par le centre $H$ de la base et par son image.';
    if (v.why !== 'vertical')
      return 'Ligne 1 : cela ne rend pas deux droites parallèles. Comment la hauteur de la pyramide et son image se tiennent-elles ?';
    const r1 = `${v.r1n}/${v.r1d}`;
    const r2 = `${v.r2n}/${v.r2d}`;
    const inChain = (list) => r1 !== r2 && list.includes(r1) && list.includes(r2);
    if (!inChain(CHAIN) && !inChain(UPSIDE))
      return 'Ligne 2 : chaque longueur va avec celle de la même droite, de l’autre côté du trou $O$.';
    if (partsOf(v.o1, v.o2) !== sortedKey(BX.fromEdge, HALF))
      return `Ligne 3 : de $O$ au bord de la base, ${m(BX.fromEdge)} ; puis du bord jusqu’au centre $H$, sous le sommet.`;
    const oh = typedWhole(v.oh);
    if (oh == null || !equal(String(oh), BOX_OH))
      return `Ligne 3 : $${BX.fromEdge} + ${HALF}$ ne fait pas $${oh ?? '?'}$.`;
    const a = typedNumber(v.a);
    const [b, c] = [typedWhole(v.b), typedWhole(v.c)];
    if (
      a == null ||
      !equal(a, BX.depth) ||
      b == null ||
      !equal(String(b), MISSION_H) ||
      c == null ||
      !equal(String(c), BOX_OH)
    )
      return `Ligne 4 : $OH' = ${tx(BX.depth)}$, $SH = ${MISSION_H}$ et $OH = ${BOX_OH}$, en mètres.`;
    return 'ok';
  },
});

/** The words of the world this story changes (`withStory` merges one level deep): the noon card asks a sheet, not h. */
const TEXT = {
  end: {
    ...WORLD_TEXT.end,
    text: frAll(
      'Tu as mesuré la largeur du Nil sans le traverser, posé le pyramidion et mesuré la grande pyramide sans l’escalader.',
    ),
  },
  stage: {
    ...WORLD_TEXT.stage,
    objective: {
      ...WORLD_TEXT.stage.objective,
      ...frAll({
        noon: 'À midi, l’ombre ne sort plus de la base. Prépare la feuille du fond de la chambre noire d’Ibn al-Haytham : appuie sur E près de la chambre.',
        end: 'Tu as mesuré la grande pyramide sans l’escalader, et préparé la feuille que son image remplit.',
      }),
    },
  },
};

export const STORY = {
  /** The docks this story plays, downstream (`logic.js › STAGE_IDS`): docks 1 and 2 are not on France's map (W2). */
  stages: ['river', 'summit', 'plateau'],
  text: TEXT,
  /** The felucca's legs (`run.js`), by the place of the dock they leave: 2 (river → summit), 3 (summit → plateau). */
  legs: LEGS,
  /** The forge played at each stage's table (`forges.js`). */
  forges: { river: K.papillon, summit: K.calcul },
  mission: MISSION,
  box: BOX,
  recall,
  /** On arriving at a stage: one sentence of Zero (a fact of the place). Run twice, it says it twice — nothing more. */
  onArrive(game, id) {
    if (ARRIVE[id]) game.say(ARRIVE[id], 6);
  },
  afterKey: {
    [K.papillon]: (game) => game.say(SAY.key1, 8),
    [K.calcul]: (game) => game.say(SAY.key2, 6),
  },
};
