/**
 * THE STORY of lesson « Rendre une fraction irréductible » in the world « L’archipel des diviseurs » — what the world's
 * mechanic plays (`divisorIsles/Game.js`): its islands and bridges, the waves of its gate dash, its words, and what
 * happens on the way. The design is `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 3 (version 2).
 * Every bridge of the road is a BRIDGE WITH A MARKED STRETCH (`divisorIsles/mark.js`): its first cells are lit and a
 * lantern post stands where they end; the bridge IS the fraction « the lit stretch over the whole bridge », and its
 * sign writes it. A plank holds only when it fills the gap AND a joint falls on the post; the sign is then rewritten in
 * planks — the same stretch, another writing.
 *
 *   A → B   246 cases, 138 lit, planks 2, 3, 5, 7 on A. 2 holds (69/123) and 3 holds (46/82); 5 and 7 do not fill 246.
 *           THE MIRROR OF B (K1) OPENS ONLY WHEN THE SIGN HOLDS BOTH WRITINGS (`writings`): arriving without them, the
 *           instruction sends him back to A; rebuilding there opens the mirror as soon as the second plank holds.
 *   B → C   96 cases, 65 lit, planks 2, 3, 5, 13, 1 on B: only 1 holds, the sign stays 65/96. THE MIRROR OF C (K2) OPENS
 *           ONLY ONCE 2, 3, 5 AND 13 HAVE EACH BEEN FIRED (`fired`, read in the world's log).
 *   C → D   a marked CONVOY OF ONE: 1 786 cases, 722 lit, a purse of 93, C's workshop (1 … 1 786, typed) whose bench is
 *           lesson 2's notebook: only 38 is paid. D: the mirror of K3.
 *   D → E   78 cases lit in TWO strokes, 65 then 4 (5/6 + 2/39), planks 2, 3, 6, 13 on D: only 3 holds, 69/78 = 23/26.
 *           THE MIRROR OF E (K4) OPENS ONLY ONCE 13 AND 3 HAVE BOTH BEEN FIRED.
 *   E → F   the gate dash (its waves use the four keys).
 *   F → G   THE FINAL MISSION, the keeper's PLAQUE (`story.mission`, GAME_WORLD.md « The plaque »): the product
 *           3/34 × 85/87 to engrave in irreducible form, two blank plaques per run, then a walk back to the quay of E;
 *           the standing road `jetee` stays shut until the right plaque. G is the finale.
 * The keys are forged in order: no later mirror opens before the one before (`forgeAt`). The hooks receive the game and
 * use its commands; they hold no mechanic. The convoy's bench is the forges agent's spec (`inquiries.js › NOTEBOOK_BENCH`).
 */
import { NOTEBOOK_BENCH } from './inquiries';
import {
  CELLS,
  COINS,
  NUMBERS,
  coinsLeft,
  counted,
  fr,
  frAll,
  fracTex as F,
  gcd,
  markVerdict,
  nb,
  planksOf,
  signOf,
  tx,
} from './math';

const { strike: ST, stays: SY, pgcd: PG, result: RS, mission: MI } = NUMBERS;
const sum = (xs) => xs.reduce((n, x) => n + x, 0);
const RS_MARK = sum(RS.strokes);
const P = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;

/** The four keys, in the order of the road. */
export const K = {
  strike: 'simplifier-facteurs',
  stays: 'irreductible',
  pgcd: 'diviser-par-le-pgcd',
  result: 'resultat-irreductible',
};
const KEY_ORDER = [K.strike, K.stays, K.pgcd, K.result];

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and
 * the keys their learning points need — P2 ← K1, P1 ← K2, P4 ← K3, P3 ← K4; module 5 is the final mission.
 * `journey.test.js` checks this table against the config. Modules 0 and 6 teach no learning point.
 */
export const MODULE_KEYS = {
  1: [K.strike],
  2: [K.stays],
  3: [K.pgcd],
  4: [K.result],
  5: [K.strike, K.stays, K.pgcd, K.result],
};
/** Module 5 is the lesson's problem: done when the right plaque is engraved. */
const PROBLEM_MODULE = '5';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (m !== PROBLEM_MODULE && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}
const missing = (game, key) => !game.state.keys.includes(key);
/** After a key: the planks of the island behind leave his hands, and the instruction says the step he is on now. */
function roadOn(game) {
  if (game.state.held != null) game.take(null);
  game.refreshObjective();
}

const ISLANDS = [
  { id: 'A', name: 'Le ponton des signaux', R: 9.5, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'L’île des hirondelles', R: 9, theme: 'meadow', turn: 0.35 },
  { id: 'C', name: 'L’île du forgeron', R: 9.5, theme: 'crystal', turn: -0.35, feature: 'anvil' },
  { id: 'D', name: 'L’île des roseaux', R: 9.5, theme: 'pine', turn: 0.3 },
  { id: 'E', name: 'L’île des cormorans', R: 10, theme: 'autumn', turn: -0.3 },
  { id: 'F', name: 'La jetée du gardien', R: 9.5, theme: 'stone', turn: 0.25 },
  { id: 'G', name: 'Le phare des brumes', R: 12, theme: 'snow', turn: 0 },
];
/** The island whose mirror forges each key (its index in ISLANDS). */
const ISLAND_OF = { [K.strike]: 1, [K.stays]: 2, [K.pgcd]: 3, [K.result]: 4 };

/** The workshop of C: he TYPES the plank's length (1 … the whole gap), open from the start; `bench` — the notebook. */
const workshop = (max, bench) => ({ min: 1, max, open: true, typed: true, ...(bench ? { bench } : {}) });

const SEGMENTS = [
  {
    id: `m${ST.gap}`,
    kind: 'bridge',
    a: ST.gap,
    mark: ST.mark,
    len: 13,
    moulds: ST.moulds,
    predict: false,
    holdsWith: ST.plank,
  },
  {
    id: `m${SY.gap}`,
    kind: 'bridge',
    a: SY.gap,
    mark: SY.mark,
    len: 12.5,
    moulds: SY.moulds,
    predict: false,
    holdsWith: SY.plank,
  },
  {
    id: `m${PG.gap}`,
    kind: 'bridge',
    a: PG.gap,
    mark: PG.mark,
    len: 22,
    moulds: [],
    predict: false,
    holdsWith: PG.plank,
    convoy: 'carnet',
    workshop: workshop(PG.gap, NOTEBOOK_BENCH),
  },
  {
    id: `m${RS.gap}`,
    kind: 'bridge',
    a: RS.gap,
    mark: RS_MARK,
    strokes: RS.strokes,
    len: 12.5,
    moulds: RS.moulds,
    predict: false,
    holdsWith: RS.plank,
  },
  { id: 'dash', kind: 'rail', len: 300 },
  // the road out of the plaque's island (F → G): a standing bridge (a gap of 0), shut until the plaque is engraved
  { id: 'jetee', kind: 'bridge', a: 0, len: 14, standing: true, moulds: [], predict: false, holdsWith: 1 },
];
/** The purse of the bridge that has one (a convoy of ONE bridge: how the world gives a bridge a purse). */
const CONVOYS = { carnet: { purse: PG.purse } };

const SEG = Object.fromEntries(['strike', 'stays', 'pgcd', 'result'].map((k, i) => [k, SEGMENTS[i]]));

/** The planks that held a bridge (`game.markSigns`, saved with the world) — [] on a game that has none. */
const heldOn = (game, seg) => {
  const s = game.markSigns;
  const list = s && typeof s === 'object' ? s[seg.id] : null;
  return Array.isArray(list) ? list : [];
};
/** How many writings A's sign holds beyond its cells: both planks of A that hold (2 and 3) → 2. */
const writings = (game) => new Set(heldOn(game, SEG.strike)).size;
/** Has the plank p been fired on the bridge of a cells (a try of his, held or not, never the mirror's)? */
const fired = (game, a, p) => (game.log ?? []).some((x) => x.a === a && x.b === p && !x.mirror);
/** A key's mirror may open: K1 waits for both writings, K2 for 2, 3, 5 and 13, K4 for 13 and 3; the others for nothing. */
const ready = (game, key) => {
  if (key === K.strike) return writings(game) >= ST.holders.length;
  if (key === K.stays) return SY.tried.every((p) => fired(game, SY.gap, p));
  if (key === K.result) return RS.tried.every((p) => fired(game, RS.gap, p));
  return true;
};
/** The mirror to open on island k: the FIRST key he does not hold, if its island is k or behind him and it is ready. */
function forgeAt(game, k) {
  const key = KEY_ORDER.find((x) => missing(game, x));
  if (!key || ISLAND_OF[key] > k || !ready(game, key)) return null;
  return key;
}

/** « 246 cases, les 138 premières éclairées » — or, lit in two strokes, « 78 cases, éclairées en deux fois : 65 puis 4 ». */
const bridgeWords = (seg) =>
  seg.strokes
    ? `${counted(seg.a, CELLS)}, éclairées en deux fois : ${nb(seg.strokes[0])} puis ${nb(seg.strokes[1])}`
    : `${counted(seg.a, CELLS)}, les ${nb(seg.mark)} premières éclairées`;
/** The rule of a marked bridge, said as what the world does (never as a rule of fractions). */
const HOLDS = 'Il tient s’il est rempli et si le poteau tombe sur un joint.';
/** « Une pièce par planche : 93 pièces. » */
const purseWords = (n) => `Une pièce par planche : ${counted(n, COINS)}.`;

/** The story's own words, laid over the world's (`divisorIsles/strings.js`); every sentence takes French typography. */
const TEXT = frAll({
  title: 'L’archipel des diviseurs : la jetée du gardien',
  subtitle:
    'Chaque pont a des cases éclairées, un poteau de lanterne et une pancarte qui écrit la part éclairée. Avec le robot Zéro, construis les ponts du gardien et lis leurs pancartes.',
  objective: {
    // island A: nothing in hand; planks in hand; the bridge standing with ONE writing; with both
    pickA: `Prends des planches ici pour le pont : ${bridgeWords(SEG.strike)}. ${HOLDS} Longueurs : ${ST.moulds.join(', ')}.`,
    pickB: `Prends des planches pour le pont : ${bridgeWords(SEG.stays)}. ${HOLDS} Longueurs : ${SY.moulds.join(', ')}.`,
    pickD: `Prends des planches pour le pont : ${bridgeWords(SEG.result)}. ${HOLDS} Longueurs : ${RS.moulds.join(', ')}.`,
    carry: (seg, b, left) =>
      `Planches de ${nb(b)} en main : construis le pont (${bridgeWords(seg)}) à la plateforme de lumière. ${HOLDS}${left == null ? '' : ` ${purseWords(left)}`}`,
    // after the first hold on A: the writing again with the other plank that holds
    other: (tex) =>
      `La pancarte écrit $${tex}$. Une autre planche de cette île tient aussi : prends-la, reconstruis le pont, puis compare.`,
    crossA: (tex) =>
      `La pancarte écrit $${tex}$ : la même part éclairée, de trois façons. Traverse vers « ${ISLANDS[1].name} ».`,
    backA: `Retourne à la plateforme de « ${ISLANDS[0].name} » : reconstruis son pont avec une autre planche qui tient aussi.`,
    backB: `Retourne à la plateforme de « ${ISLANDS[1].name} » : essaie aussi les planches que tu n’as pas posées.`,
    backD: `Retourne à la plateforme de « ${ISLANDS[3].name} » : essaie aussi les planches que tu n’as pas posées.`,
    // C's workshop, nothing in hand
    make: (seg, left) =>
      `Fabrique à l’atelier une planche pour le pont : ${bridgeWords(seg)}. ${HOLDS} ${purseWords(left)} Un carnet t’y aide.`,
    board: `Monte sur le glisseur de lumière jusqu’à « ${ISLANDS[5].name} »`,
    // the plaque: the WHOLE instruction (it stays on screen)
    plaque: `Grave sur la plaque du gardien la part des lanternes rouges, $${F(MI.calc.x, MI.calc.y)} \\times ${F(MI.calc.z, MI.calc.w)}$, sous forme irréductible. Deux plaques vierges.`,
    plaqueBack: `Plus de plaque vierge. Retourne au quai de « ${ISLANDS[4].name} » : le gardien t’en donne deux nouvelles.`,
    plaqueCross: `La plaque est gravée, la jetée s’allume. Traverse vers « ${ISLANDS[6].name} ».`,
    end: 'Rallume le phare des brumes',
  },
  say: {
    hello: `Je suis Zéro ! Un pont de ${counted(ST.gap, CELLS)}, les ${nb(ST.mark)} premières éclairées, un poteau de lanterne au bout. Choisis des planches, puis lis la pancarte du pont.`,
    // a bridge of A held: what its sign writes now
    firstWriting: (tex) => `Le pont tient, le poteau est sur un joint ! La pancarte écrit $${tex}$.`,
    twoWritings: (tex) =>
      `La pancarte écrit maintenant $${tex}$ : la part éclairée n’a pas changé, seulement son écriture.`,
    backA: `Avant le miroir : retourne à « ${ISLANDS[0].name} » et reconstruis son pont avec une autre planche qui tient aussi.`,
    backB: `Avant le miroir : retourne à « ${ISLANDS[1].name} » et essaie aussi les planches que tu n’as pas posées.`,
    backD: `Avant le miroir : retourne à « ${ISLANDS[3].name} » et essaie aussi les planches que tu n’as pas posées.`,
    // what waits on the next island (said once the tablet before is closed, or on arrival)
    stays: `Nouveau pont : ${counted(SY.gap, CELLS)}, les ${nb(SY.mark)} premières éclairées. Essaie les planches de l’île, toutes, et lis la pancarte.`,
    holdB: (tex) => `La planche ${SY.plank} tient le pont, et la pancarte reste $${tex}$.`,
    pgcd: `Un pont long : ${counted(PG.gap, CELLS)}, les ${nb(PG.mark)} premières éclairées, et ${counted(PG.purse, COINS)} dans la bourse. Fabrique ta planche à l’atelier de l’île.`,
    result: `Un pont éclairé en deux fois : ${counted(RS.gap, CELLS)}, ${nb(RS.strokes[0])} d’abord, ${nb(RS.strokes[1])} ensuite. Les équipes de Léa et de Hugo ont chacune éclairé leur part.`,
    // C's bridge held: how many planks, the coins left, the sign
    holdShop: (a, b, left, tex) =>
      `${planksOf(a / b, nb(b))} : ${nb(a)} cases, le poteau est sur un joint, ${coinsLeft(left)}. La pancarte : $${tex}$.`,
    holdD: (b, tex) => `La planche ${b} tient le pont : la pancarte écrit $${tex}$.`,
    f: 'Le glisseur de lumière est prêt. Lis la phrase, et passe par la porte qui la vérifie.',
    plaque: `Le gardien du phare te tend deux plaques vierges. Grave sur l’une la part des lanternes rouges, sous forme irréductible.`,
    plaqueOk: `La plaque est gravée : la jetée s’allume. Le phare des brumes t’attend.`,
    end: 'Le phare des brumes brille de nouveau. Merci !',
  },
  /** The workshop's bench: the notebook of C. */
  workshop: {
    bench: 'Le carnet de l’atelier',
    benchSub: 'Il calcule pour toi ; la longueur de la planche, c’est toi qui la choisis',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    sign: (tex) => `Pancarte du pont : $${tex}$`,
    // what a plank did on a marked bridge (`didOf`)
    plank: (b, did) =>
      did === 'holds'
        ? `Planche ${nb(b)} : le pont tient`
        : did === 'post'
          ? `Planche ${nb(b)} : le pont est rempli, le poteau est au milieu d’une planche`
          : did === 'coins'
            ? `Planche ${nb(b)} : pas assez de pièces`
            : `Planche ${nb(b)} : le pont n’est pas rempli`,
  },
  end: { text: 'Tu as rallumé le phare des brumes, et forgé toi-même les quatre clés de la leçon.' },
});

/** What a plank b did on a marked bridge (with its purse): it held, it missed the post, the coins, or it did not fill. */
export function didOf(seg, b, purse = Infinity) {
  const v = markVerdict(seg.a, seg.mark, b);
  if (v.q > purse) return 'coins';
  if (!v.fills) return 'open';
  return v.joint ? 'holds' : 'post';
}
/** The planks he fired on a bridge, in the order he first tried them (the last two): never the mirror's. */
function triedOn(game, a) {
  const order = [];
  for (const x of game.log ?? []) if (x.a === a && !x.mirror && !order.includes(x.b)) order.push(x.b);
  return order.slice(-2);
}

/**
 * The gate dash (after island E: the four keys are forged): one sentence, three gates, exactly one right, each with its
 * guidance (`why`). Each gate is a NUMBER (the missing term of a fraction), and every wrong one a belief a student
 * holds: a factor struck once, a term not divided, a result simplified once, a fraction judged by 2, 3 and 5.
 */
const wave = (say, gates, test, why) => ({ say: fr(say), gates, test, why: frAll(why) });
const DASH_WAVES = [
  wave(
    `$\\dfrac{2 \\times 41 \\times 3}{2^{2} \\times 3 \\times 23} = \\dfrac{41}{\\square}$`,
    [46, 92, 23],
    (n) => n === 46,
    {
      right: '2 et 3 sont dans les deux termes : $2^{2} \\times 3 \\times 23 \\div (2 \\times 3) = 2 \\times 23 = 46$.',
      wrong: {
        92: 'Le dénominateur $2^{2} \\times 3 \\times 23 = 276$ perd 2 et 3 : $276 \\div 6 = 46$, et non 92.',
        23: 'Le 2 n’est qu’une fois dans le numérateur : on ne barre pas $2^{2}$, mais un seul 2.',
      },
    },
  ),
  wave(`$\\dfrac{39}{\\square}$ est irréductible`, [50, 52, 65], (n) => gcd(39, n) === 1, {
    right: '$39 = 3 \\times 13$ et $50 = 2 \\times 5^{2}$ : aucun facteur premier commun.',
    wrong: {
      52: '$39 = 13 \\times 3$ et $52 = 13 \\times 4$ : 13 est commun.',
      65: '$39 = 13 \\times 3$ et $65 = 13 \\times 5$ : 13 est commun.',
    },
  }),
  wave(`Le numérateur de $\\dfrac{289}{663}$ rendu irréductible`, [17, 289, 39], (n) => n === 17, {
    right: '$289 \\div 17 = 17$ et $663 \\div 17 = 39$ : $\\dfrac{289}{663} = \\dfrac{17}{39}$.',
    wrong: {
      289: 'On divise aussi le numérateur : $289 \\div 17 = 17$.',
      39: '39 est le nouveau dénominateur : $663 \\div 17 = 39$.',
    },
  }),
  wave(
    `$\\dfrac{2^{2} \\times 13 \\times 19}{2^{3} \\times 13^{2}} = \\dfrac{19}{\\square}$`,
    [26, 52, 104],
    (n) => n === 26,
    {
      right:
        '2 deux fois et 13 une fois sont communs : $2^{3} \\times 13^{2} \\div (2^{2} \\times 13) = 2 \\times 13 = 26$.',
      wrong: {
        52: 'Avec 52, on n’a barré que $2 \\times 13$ : il reste un 2 commun, $\\dfrac{38}{52}$ se simplifie encore.',
        104: 'Avec 104, on n’a barré que 13 : $\\dfrac{76}{104}$ se simplifie encore par 4.',
      },
    },
  ),
  wave(`$\\dfrac{10}{23} \\times \\dfrac{17}{20} = \\dfrac{17}{\\square}$`, [46, 230, 92], (n) => n === 46, {
    right: '$\\dfrac{10 \\times 17}{23 \\times 20} = \\dfrac{170}{460}$, et 10 est commun : $\\dfrac{17}{46}$.',
    wrong: {
      230: '230 est le dénominateur de $\\dfrac{85}{230}$ : une seule simplification, par 2, et 5 reste commun.',
      92: '92 est le dénominateur de $\\dfrac{34}{92}$ : une seule simplification, par 5, et 2 reste commun.',
    },
  }),
  wave(`Le numérateur de $\\dfrac{319}{551}$ rendu irréductible`, [11, 319, 29], (n) => n === 11, {
    right: '$319 = 11 \\times 29$ et $551 = 19 \\times 29$ : on barre 29, il reste $\\dfrac{11}{19}$.',
    wrong: {
      319: 'Aucune règle de 2, 3 ou 5 ne s’applique, mais 29 divise 319 et 551.',
      29: '29 est le facteur barré : il reste 11 au numérateur.',
    },
  }),
];

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
const tablet = (t) => ({ ...t, title: fr(t.title), lines: t.lines.map(fr), notes: (t.notes ?? []).map(fr) });
const dec = (n, d) => `\\dfrac{${n}}{${d}}`;
export const TABLETS = {
  [K.strike]: tablet({
    icon: '🪜',
    title: 'Simplifier avec les facteurs premiers',
    lines: [
      'On décompose le numérateur et le dénominateur en facteurs premiers, puis on barre chaque facteur premier commun, autant de fois qu’il est dans les deux.',
      'Ce qui reste écrit la même fraction avec des nombres plus petits.',
    ],
    math: [
      `${F(ST.mark, ST.gap)} = ${dec('2 \\times 3 \\times 23', '2 \\times 3 \\times 41')}`,
      `${dec('2 \\times 3 \\times 23', '2 \\times 3 \\times 41')} = ${F(23, 41)}`,
    ],
    notes: ['Deux 2 dans 52 et deux 2 dans 76 : on barre 2 deux fois, et il reste 13 sur 19'],
  }),
  [K.stays]: tablet({
    icon: '🔒',
    title: 'La fraction irréductible',
    lines: [
      'Une fraction est irréductible quand son numérateur et son dénominateur n’ont aucun facteur premier commun, c’est-à-dire quand leur PGCD est 1.',
      `Sur le pont, seule la planche de 1 tenait : $${P(SY.mark, SY.gap)} = 1$.`,
    ],
    math: [`${SY.mark} = 5 \\times 13`, `${SY.gap} = 2^{5} \\times 3`],
    notes: ['Ni 2, ni 3, ni 5 ne divisent 238 et 287, et pourtant 7 les divise tous les deux'],
  }),
  [K.pgcd]: tablet({
    icon: '🎯',
    title: 'Diviser par le PGCD',
    lines: [
      'On divise le numérateur et le dénominateur par leur PGCD : on obtient tout de suite la fraction irréductible.',
      `$${P(tx(PG.mark), tx(PG.gap))} = ${PG.plank}$, donc $${F(PG.mark, PG.gap)} = ${dec(`${tx(PG.mark)} \\div ${PG.plank}`, `${tx(PG.gap)} \\div ${PG.plank}`)} = ${F(PG.mark / PG.plank, PG.gap / PG.plank)}$.`,
    ],
    math: [
      `${PG.mark} = ${PG.plank} \\times ${PG.mark / PG.plank}`,
      `${tx(PG.gap)} = ${PG.plank} \\times ${PG.gap / PG.plank}`,
    ],
    notes: ['Diviser par 2 ou par 19 ne suffit pas : il reste un facteur commun, une seule étape ne finit pas'],
  }),
  [K.result]: tablet({
    icon: '🧾',
    title: 'Le résultat d’un calcul',
    lines: [
      'Même avec des fractions irréductibles, le résultat peut ne pas l’être : on cherche un facteur premier commun à ses deux termes et on simplifie.',
      'Dans un produit, on peut barrer avant de multiplier.',
    ],
    math: [
      `${F(...RS.crews[0])} + ${F(...RS.crews[1])} = ${F(RS_MARK, RS.gap)} = ${F(RS_MARK / RS.plank, RS.gap / RS.plank)}`,
      `${dec('3 \\times 3', 23)} \\times ${dec('2 \\times 23', '3 \\times 3 \\times 7')} = ${F(2, 7)}`,
    ],
    notes: ['Les deux fractions de départ sont irréductibles, mais leur somme se simplifie par 3'],
  }),
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  /** The purse of the convoy of one bridge: a coin per plank, whatever its length. */
  convoys: CONVOYS,

  /**
   * The WHOLE instruction of the moment (it stays on screen): the bridge — its cells, its lit stretch, when it holds —
   * the planks of the island or the workshop, the purse; on A, after a hold, what the sign wrote and what to do next; on
   * B, C, E and the rail, the way back while a mirror's planks were not all fired. null: the world's own.
   */
  objective(game, seg) {
    const o = game.T.objective;
    const i = game.segs.indexOf(seg);
    const b = game.state.held;
    if (seg.id === 'jetee')
      return game.flags.mission ? o.plaqueCross : game.missionWalkBack() ? o.plaqueBack : o.plaque;
    if (seg.kind === 'rail') return missing(game, K.result) && !ready(game, K.result) ? o.backD : null;
    if (seg.kind !== 'bridge') return null;
    if (i === 0) {
      if (!seg.complete) return b == null ? o.pickA : o.carry(seg, b, null);
      const held = heldOn(game, seg);
      const tex = signOf(seg, held);
      if (writings(game) >= ST.holders.length) return o.crossA(tex);
      return o.other(tex);
    }
    // the way back: A's sign holds one writing; B's planks were not all fired; D's likewise
    if (i === 1 && !seg.complete && (!game.segs[0].complete || !ready(game, K.strike))) return o.backA;
    if (i === 2 && missing(game, K.stays) && !ready(game, K.stays)) return o.backB;
    if (seg.complete) return null;
    if (i === 1) return b == null ? o.pickB : o.carry(seg, b, null);
    if (i === 3) return b == null ? o.pickD : o.carry(seg, b, null);
    const left = game.purseOf?.(seg)?.left ?? CONVOYS[seg.convoy]?.purse ?? null;
    return b == null ? o.make(seg, left) : o.carry(seg, b, left);
  },
  /** The card on the right: the sign of the bridge just crossed, and what his last planks did there. */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.mark) return null;
    const purse = CONVOYS[before.convoy]?.purse ?? Infinity;
    return [
      R.sign(signOf(before, heldOn(game, before))),
      ...triedOn(game, before.a).map((b) => R.plank(b, didOf(before, b, purse))),
    ];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    const key = forgeAt(game, k);
    if (key) {
      game.openForge(key);
      return;
    }
    // a mirror still waits for its planks: back to the bridge before
    const first = KEY_ORDER.find((x) => missing(game, x));
    if (first && ISLAND_OF[first] <= k) {
      game.say(first === K.strike ? say.backA : first === K.stays ? say.backB : say.backD, 9);
      return;
    }
    if (k === 5) game.say(say.plaque, 10);
  },
  /**
   * What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on.
   * A mirror opened behind him (K1, K2, K4: on the island before, by a hold or a miss) leaves him there with that
   * island's planks in hand, his stage already the next island — so no `arrive` will drop them or say the step:
   * `roadOn` drops them and writes the instruction again (2026-11-26: on C he still held B's 5 and read « Retourne à
   * B »; the workshop then saw a plank in hand).
   */
  afterKey: {
    [K.strike]: (game) => {
      completeModules(game, K.strike);
      roadOn(game);
      game.say(game.T.say.stays, 9);
    },
    [K.stays]: (game) => {
      completeModules(game, K.stays);
      roadOn(game);
      game.say(game.T.say.pgcd, 9);
    },
    [K.pgcd]: (game) => {
      completeModules(game, K.pgcd);
      roadOn(game);
      game.say(game.T.say.result, 9);
    },
    [K.result]: (game) => {
      game.flags.key4 = true;
      completeModules(game, K.result);
      roadOn(game);
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    return forgeAt(game, game.state.stage);
  },
  /** A bridge held: the story's own sentence — what its sign writes now; a mirror waiting behind him opens at once. */
  onHold(game, seg, b) {
    const { say } = game.T;
    const i = game.segs.indexOf(seg);
    const tex = signOf(seg, heldOn(game, seg));
    const reopen = (key) => {
      if (game.state.stage > i && missing(game, key) && forgeAt(game, game.state.stage) === key) game.openForge(key);
    };
    if (i === 0) {
      if (writings(game) < ST.holders.length) {
        game.say(say.firstWriting(tex), 9);
        return true;
      }
      game.say(say.twoWritings(tex), 9);
      reopen(K.strike);
      return true;
    }
    if (i === 1) {
      game.say(say.holdB(tex), 9);
      reopen(K.stays);
      return true;
    }
    if (i === 2) {
      game.say(say.holdShop(seg.a, b, game.purseOf?.(seg)?.left ?? 0, tex), 10);
      return true;
    }
    if (i === 3) {
      game.say(say.holdD(b, tex), 9);
      reopen(K.result);
      return true;
    }
    return false;
  },
  /**
   * A try that did NOT hold (`Game.js › missed`): the mirror of C (K2) or of E (K4) that waits behind him for the planks
   * of B or D opens as soon as the last of them is fired — a plank that fails is in the log as well as one that holds.
   */
  onMiss(game, seg) {
    const i = game.segs.indexOf(seg);
    const key = i === 1 ? K.stays : i === 3 ? K.result : null;
    if (key && game.state.stage > i && missing(game, key) && forgeAt(game, game.state.stage) === key)
      game.openForge(key);
  },
  /**
   * THE PLAQUE (kit: `story.mission`, a variant — GAME_WORLD.md « The plaque »): the board stands on F and opens the
   * standing road F → G once the right plaque is engraved; two blank plaques a run, then the walk back to E's quay.
   */
  mission: {
    prompt: 'Lire la plaque du gardien',
    title: 'La plaque du gardien',
    // two lines (gate B, 2026-11-26: three lines pushed the panel over the mission card and cut its fraction)
    lead: [
      `Les $${F(MI.calc.z, MI.calc.w)}$ des lanternes sont allumées, et les $${F(MI.calc.x, MI.calc.y)}$ des allumées sont rouges.`,
      `Grave la part des rouges, $${F(MI.calc.x, MI.calc.y)} \\times ${F(MI.calc.z, MI.calc.w)}$, sous forme irréductible.`,
    ].map(fr),
    at: 5,
    opens: 'jetee',
    plaques: MI.plaques,
    refill: { at: 4 },
    write: { calc: MI.calc, p: MI.answer[0], q: MI.answer[1] },
    jetty: MI.jetty,
    objective: (game) => (game.missionWalkBack() ? game.T.objective.plaqueBack : game.T.objective.plaque),
    // the refusals: never a number, never a plank, never a count
    check: (values, writing) =>
      writing.kind === 'ok'
        ? 'ok'
        : fr(
            writing.kind === 'empty' || writing.kind === 'nan'
              ? 'Écris une fraction : un numérateur et un dénominateur.'
              : writing.kind === 'other'
                ? 'Ce n’est pas la part des lanternes rouges.'
                : 'Le gardien refuse : cette fraction s’écrit encore avec des nombres plus petits.',
          ),
    text: {
      check: fr('Graver la plaque'),
      later: fr('Plus tard'),
      plaques: (left, of) => fr(`Plaques vierges : ${left} sur ${of}`),
      spent: fr(`Le gardien n’a plus de plaque vierge. Retourne au quai de « ${ISLANDS[4].name} », puis reviens.`),
    },
    onSolved: (game) => game.onModule(PROBLEM_MODULE),
  },
};
