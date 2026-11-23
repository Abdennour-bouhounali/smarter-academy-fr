/**
 * THE STORY of lesson « Trouver le PGCD de deux nombres » in the world « L’archipel des diviseurs » — what the world's
 * mechanic plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens
 * on the way. The design is `docs/reports/UNIT_3E_MULTIPLES_ET_DIVISEURS_DESIGN.md`, lesson 2. FOUR CONVOYS (GAME_WORLD.md
 * §2ter-1): two gaps built with ONE plank length, made (typed) at the workshop of the convoy's first island, a coin per
 * plank laid, whatever its length; the next island holds no planks, so a refused plank sends him back. No rule is told on
 * the islands: the instruction states the constraint, the robot states facts, and each rule is forged in a mirror.
 *
 *   A → B → C   convoy « jumeaux »: 90 then 54 cases, A's workshop (no bench), 15 coins — only 18 builds both.
 *               C: the mirror of K1 `diviseurs-communs`, then its second forge K2 `lots-identiques` (the stall's
 *               experiment `deal`: 30 apples, 42 pears).
 *   C → D → E   convoy « grands »: 1 736 then 980 cases, C's workshop whose bench is lesson 1's spreadsheet (two rounds),
 *               193 coins — only 28 builds both. E: the mirror of K3 `pgcd-facteurs`.
 *   E → F → G   convoy « euclide »: 52 015 then 31 209 cases, E's workshop whose bench is the division notebook (the
 *               spreadsheet stops at 89: 10 403 = 101 × 103 is out of its reach), 807 coins — only 10 403 builds both.
 *               G: the mirror of K4 `euclide` (its experiment `nest` / `pair` stays IN the mirror).
 *   G → H       the gate dash (its waves use the four keys, all forged).
 *   H → I → J   THE FINAL MISSION, the lesson's problem: the jetty of the lighthouse, 1 462 then 946 cases, H's workshop
 *               with NO bench, 55 coins — he MAKES the plank (86), by the method he chooses. Arriving at J plays the
 *               finale (`Game.js › arrive` → `finale`); the story has no store (`bossSeg` is null).
 * The benches are the forges agent's specs (`inquiries.js › SHEET_BENCH`, `EUCLIDE_BENCH`). Every number is in `NUMBERS`
 * (math.js); the sentences and the tablets are written from it. The hooks receive the game and use its commands; they
 * hold no mechanic.
 */
import { EUCLIDE_BENCH, SHEET_BENCH } from './inquiries';
import {
  CELLS,
  COINS,
  NUMBERS,
  SHEET_LAST,
  coinsLeft,
  counted,
  euclid,
  frAll,
  fr,
  gcd,
  nb,
  planksOf,
  powTex,
  powersOf,
  roadOf,
  tx,
} from './math';

/** The four keys, in the order of the road. */
export const K = {
  common: 'diviseurs-communs',
  lots: 'lots-identiques',
  factors: 'pgcd-facteurs',
  euclide: 'euclide',
};

const { twins: TW, deal: DL, factors: FC, euclide: EU, mission: MI } = NUMBERS;

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 ← K1, P4 ← K2, P2 ← K3, P3 ← K4. `journey.test.js` checks this table against the
 * config. Modules 0 and 6 teach no learning point; module 5 is the final mission.
 */
export const MODULE_KEYS = {
  1: [K.common],
  2: [K.common, K.lots],
  3: [K.common, K.factors],
  4: [K.common, K.euclide],
  5: [K.common, K.factors, K.euclide],
};
/** Module 5 is the lesson's problem: done when the second bridge of the final mission holds. */
const PROBLEM_MODULE = '5';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (m !== PROBLEM_MODULE && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}

const missing = (game, key) => !game.state.keys.includes(key);
const bridge = (id, a, len, holdsWith, extra = {}) => ({
  id,
  kind: 'bridge',
  a,
  len,
  moulds: [],
  predict: false,
  holdsWith,
  ...extra,
});
/** The workshop of a convoy's first island: it works from the start, he TYPES the plank's length (1 … the longer gap). */
const workshop = (max, bench) => ({ min: 1, max, open: true, typed: true, ...(bench ? { bench } : {}) });

const ISLANDS = [
  { id: 'A', name: 'Le quai des menuisiers', R: 9, theme: 'meadow', turn: 0, feature: 'anvil' },
  { id: 'B', name: 'L’île des hérons', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'L’île du marché', R: 9.5, theme: 'crystal', turn: -0.42, feature: 'anvil' },
  { id: 'D', name: 'L’île des dunes', R: 8, theme: 'crystal', turn: 0.4 },
  { id: 'E', name: 'L’île des horloges', R: 9.5, theme: 'pine', turn: -0.35, feature: 'anvil' },
  { id: 'F', name: 'L’île des fougères', R: 8, theme: 'pine', turn: 0.3 },
  { id: 'G', name: 'L’île des cascades', R: 10.5, theme: 'autumn', turn: -0.3 },
  { id: 'H', name: 'L’île des balises', R: 9.5, theme: 'stone', turn: 0.25, feature: 'anvil' },
  { id: 'I', name: 'L’île des rochers', R: 8, theme: 'stone', turn: -0.2 },
  { id: 'J', name: 'La jetée du phare', R: 12, theme: 'snow', turn: 0 },
];
/** The four convoys: each pays a coin per plank, whatever its length. */
const CONVOYS = {
  jumeaux: { purse: TW.purse },
  grands: { purse: FC.purse },
  euclide: { purse: EU.purse },
  jetee: { purse: MI.purse },
};
const GAPS = { jumeaux: TW.gaps, grands: FC.gaps, euclide: EU.gaps, jetee: MI.gaps };
const [T1, T2] = TW.gaps;
const [F1, F2] = FC.gaps;
const [E1, E2] = EU.gaps;
const [M1, M2] = MI.gaps;
const SEGMENTS = [
  bridge(`g${T1}`, T1, 15, TW.plank, { convoy: 'jumeaux', workshop: workshop(Math.max(T1, T2)) }),
  bridge(`g${T2}`, T2, 13, TW.plank, { convoy: 'jumeaux' }),
  // the long gaps are drawn as a strip of light (no tick per cell past 200 cells: Game.js › buildBridge)
  bridge(`g${F1}`, F1, 22, FC.plank, { convoy: 'grands', workshop: workshop(Math.max(F1, F2), SHEET_BENCH) }),
  bridge(`g${F2}`, F2, 19, FC.plank, { convoy: 'grands' }),
  bridge(`g${E1}`, E1, 26, EU.plank, { convoy: 'euclide', workshop: workshop(Math.max(E1, E2), EUCLIDE_BENCH) }),
  bridge(`g${E2}`, E2, 23, EU.plank, { convoy: 'euclide' }),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(`g${M1}`, M1, 22, MI.plank, { convoy: 'jetee', workshop: workshop(Math.max(M1, M2)) }),
  bridge(`g${M2}`, M2, 19, MI.plank, { convoy: 'jetee' }),
];

const P = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/**
 * The gate dash (after island G: the four keys are forged): one sentence, three gates, exactly one right, each with its
 * guidance (`why`, read by the world's `explain`). Mental arithmetic — every number at most 100 — and every wrong gate a
 * belief a student holds (a smaller common divisor, a quotient, one decomposition copied).
 */
const wave = (say, gates, test, why) => ({ say: fr(say), gates, test, why: frAll(why) });
const DASH_WAVES = [
  wave('Un diviseur commun de 21 et 35', [3, 5, 7], (n) => 21 % n === 0 && 35 % n === 0, {
    right: '$21 = 7 \\times 3$ et $35 = 7 \\times 5$ : 7 divise les deux nombres.',
    wrong: { 3: '$35 = 3 \\times 11 + 2$ : 3 ne divise pas 35.', 5: '$21 = 5 \\times 4 + 1$ : 5 ne divise pas 21.' },
  }),
  wave(`$${P(18, 30)} = \\square$`, [3, 6, 90], (n) => n === gcd(18, 30), {
    right: '$18 = 6 \\times 3$ et $30 = 6 \\times 5$ : aucun diviseur commun ne dépasse 6.',
    wrong: {
      3: '3 divise 18 et 30, mais 6 aussi, et 6 est plus grand.',
      90: '90 est un multiple de 18 et de 30, pas un diviseur.',
    },
  }),
  wave('Le plus de sachets identiques avec 28 billes rouges et 35 billes bleues', [4, 5, 7], (n) => n === gcd(28, 35), {
    right: '$28 = 7 \\times 4$ et $35 = 7 \\times 5$ : 7 sachets de 4 billes rouges et 5 billes bleues.',
    wrong: {
      4: '$35 = 4 \\times 8 + 3$ : il resterait 3 billes bleues.',
      5: '$28 = 5 \\times 5 + 3$ : il resterait 3 billes rouges.',
    },
  }),
  wave(`$${P('2^3 \\times 5', '2 \\times 5^2')} = \\square$`, [10, 40, 50], (n) => n === gcd(40, 50), {
    right: 'Les facteurs 2 et 5 sont dans les deux, chacun au plus une fois dans l’un : $2 \\times 5 = 10$.',
    wrong: {
      40: '$2^3 \\times 5 = 40$, et $50 = 40 \\times 1 + 10$ : 40 ne divise pas 50.',
      50: '$2 \\times 5^2 = 50$, et 50 ne divise pas 40.',
    },
  }),
  wave(`$${P(57, 15)} = ${P(15, '\\square')}$`, [2, 12, 15], (n) => gcd(15, n) === gcd(57, 15), {
    right: '$57 = 15 \\times 3 + 12$ : on continue avec 15 et le reste 12.',
    wrong: {
      2: `$${P(15, 2)} = 1$, alors que 3 divise 57 et 15.`,
      15: `$${P(15, 15)} = 15$, alors que 15 ne divise pas 57.`,
    },
  }),
  wave(
    `$27 = 12 \\times 2 + 3$ et $12 = 3 \\times 4 + 0$ : $${P(27, 12)} = \\square$`,
    [2, 3, 4],
    (n) => n === gcd(27, 12),
    {
      right: 'La division suivante tombe juste : le reste 3 divise 12, donc 27 aussi.',
      wrong: {
        2: '2 est le premier quotient : $27 = 2 \\times 13 + 1$.',
        4: '4 est le dernier quotient : $27 = 4 \\times 6 + 3$.',
      },
    },
  ),
  wave(
    `$${P('2^2 \\times 3 \\times 7', '2 \\times 3^2 \\times 5')} = \\square$`,
    [6, 12, 42],
    (n) => n === gcd(84, 90),
    {
      right: '2 et 3 sont dans les deux, chacun au moins une fois : $2 \\times 3 = 6$.',
      wrong: {
        12: '$12 = 2^2 \\times 3$, et 2 n’est qu’une fois dans $2 \\times 3^2 \\times 5$.',
        42: '$42 = 2 \\times 3 \\times 7$, et 7 n’est pas dans $2 \\times 3^2 \\times 5$.',
      },
    },
  ),
  wave(`$${P(45, 60)} = \\square$`, [5, 15, 30], (n) => n === gcd(45, 60), {
    right: '$45 = 15 \\times 3$ et $60 = 15 \\times 4$ : aucun diviseur commun ne dépasse 15.',
    wrong: {
      5: '5 divise 45 et 60, mais 15 aussi, et 15 est plus grand.',
      30: '$45 = 30 \\times 1 + 15$ : 30 ne divise pas 45.',
    },
  }),
];

/**
 * The tablet of each rule: its name comes AFTER the student forged it. `lines` go through MathText; `math` are formulas
 * whose equality the story suite re-computes; `notes` are plain text (no `$`). No tablet tells a later key's way, and none
 * says that the common divisors are the divisors of the PGCD (cut: no French point).
 */
const tablet = (t) => ({ ...t, lines: t.lines.map(fr), notes: (t.notes ?? []).map(fr) });
const F_POW = FC.gaps.map(powersOf);
const EU_ROWS = euclid(E1, E2);
export const TABLETS = {
  [K.common]: tablet({
    icon: '🤝',
    title: 'Diviseurs communs et PGCD',
    lines: [
      'Un diviseur commun de $a$ et $b$ divise $a$ et divise $b$. Le plus grand d’entre eux est leur PGCD, noté $\\mathrm{PGCD}(a ; b)$.',
      `La plus longue planche qui remplit les deux fossés construit les deux ponts avec le moins de planches : $${P(T1, T2)} = ${gcd(T1, T2)}$.`,
    ],
    // (a PGCD written in `math` would put a plain space before its « ; »: it stands in the lines)
    math: [`${T1} = ${TW.plank} \\times ${T1 / TW.plank}`, `${T2} = ${TW.plank} \\times ${T2 / TW.plank}`],
    notes: [
      `9 remplit aussi les deux fossés, mais il faut ${T1 / 9} + ${T2 / 9} = ${(T1 + T2) / 9} planches : la bourse n’en paie que ${TW.purse}`,
    ],
  }),
  [K.lots]: tablet({
    icon: '🧺',
    title: 'Partager en lots identiques',
    lines: [
      'Partager tout $a$ et tout $b$ en lots identiques, sans reste : le nombre de lots est un diviseur commun de $a$ et $b$.',
      `Le plus grand nombre de lots possible est $\\mathrm{PGCD}(a ; b)$ : $${P(DL.apples, DL.pears)} = ${gcd(DL.apples, DL.pears)}$.`,
    ],
    math: [`${DL.apples} = 6 \\times ${DL.apples / 6}`, `${DL.pears} = 6 \\times ${DL.pears / 6}`],
    notes: [`6 paniers au plus : ${DL.apples / 6} pommes et ${DL.pears / 6} poires dans chacun`],
  }),
  [K.factors]: tablet({
    icon: '🧮',
    title: 'Le PGCD par les facteurs premiers',
    lines: [
      'On décompose $a$ et $b$ en facteurs premiers. Le PGCD est le produit des facteurs premiers communs, chacun avec son plus petit exposant.',
      `$${tx(F1)} = ${powTex(F_POW[0])}$ et $${F2} = ${powTex(F_POW[1])}$, donc $${P(tx(F1), F2)} = 2^{2} \\times 7 = ${FC.plank}$.`,
    ],
    math: [`${tx(F1)} = ${powTex(F_POW[0])}`, `${F2} = ${powTex(F_POW[1])}`],
    notes: ['2³ et 2² : on garde 2² ; 5 et 31 ne sont que dans un des deux nombres'],
  }),
  [K.euclide]: tablet({
    icon: '🔁',
    title: 'L’algorithme d’Euclide',
    lines: [
      // four lines on the board's card (owner: a card is four lines at most; five left it on the walk of 2026-11-23)
      'On divise le plus grand par le plus petit, puis le plus petit par le reste, et ainsi de suite jusqu’au reste 0.',
      'Le PGCD est le dernier reste qui n’est pas 0, car si $a = b \\times q + r$, alors $\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; r)$.',
    ],
    // the notebook's last two rows (a PGCD written in `math` would put a plain space before its « ; »)
    math: EU_ROWS.slice(-2).map((s) => `${tx(s.a)} = ${tx(s.b)} \\times ${s.q} + ${tx(s.r)}`),
    notes: [
      `${EU_ROWS.length} divisions suffisent (voici les deux dernières), là où le tableur, qui s’arrête à ${SHEET_LAST}, ne finit pas.`,
    ],
  }),
};

const NAME = Object.fromEntries(ISLANDS.map((x) => [x.id, x.name]));
/** What the plank he makes at a convoy's workshop must build, said BEFORE he makes it. */
const ROAD = {
  jumeaux: `Deux ponts, ${counted(T1, CELLS)} puis ${nb(T2)}`,
  grands: `Deux ponts, ${counted(F1, CELLS)} puis ${nb(F2)}`,
  euclide: `Deux ponts, ${counted(E1, CELLS)} puis ${nb(E2)}`,
  jetee: `La jetée, ${counted(M1, CELLS)} puis ${nb(M2)}`,
};
/** What the convoy's workshop holds besides its lengths: nothing, the spreadsheet, the division notebook. */
const TOOL = {
  jumeaux: '',
  grands: ' (il a un tableur)',
  euclide: ` (carnet de divisions : le tableur s’arrête à ${SHEET_LAST})`,
  jetee: '',
};
/** « Planches de 18 : remplissent 90 et 54 » — what a plank did on the road of a convoy (`on`: the kit's `roadOf`). */
const didOn = ({ a, did }) =>
  did === 'fills'
    ? `remplissent ${nb(a)}`
    : did === 'open'
      ? `ne remplissent pas ${nb(a)}`
      : `pas assez de pièces pour ${nb(a)}`;

/** The story's own words, laid over the world's (`divisorIsles/strings.js`); every sentence takes French typography. */
const TEXT = frAll({
  title: 'L’archipel des diviseurs : la jetée du phare',
  subtitle:
    'La tempête a cassé les ponts jusqu’à la jetée du phare. Avec le robot Zéro, construis-les deux par deux : une seule longueur de planche pour deux fossés, et une pièce par planche posée.',
  objective: {
    // the first island of a convoy, nothing in hand: the two gaps, no planks on the next island, the workshop, the purse
    // (the WHOLE instruction: it stays on screen)
    make: (convoy) =>
      `${ROAD[convoy]}, sans planches sur l’île suivante : fabrique à l’atelier une seule longueur pour les deux${TOOL[convoy]}. Une pièce par planche : ${counted(CONVOYS[convoy].purse, COINS)}.`,
    // …once he holds planks there
    carry: (convoy, b, left) =>
      `Planches de ${nb(b)} en main : construis le pont de ${nb(GAPS[convoy][0])} cases au socle lumineux, puis celui de ${nb(GAPS[convoy][1])}. Une pièce par planche, ${counted(left, COINS)} dans la bourse. Une autre longueur ? Fabrique-la à l’atelier.`,
    // the second gap of a convoy, with the planks he carries
    tail: (a, b, left) =>
      `Le fossé de ${counted(a, CELLS)} : construis son pont avec tes planches de ${nb(b)}, cette île n’en a pas. Une pièce par planche, ${counted(left, COINS)} dans la bourse.`,
    convoyBack: (name) =>
      `Pas de planches sur cette île. Retourne à « ${name} » et fabrique à son atelier une autre longueur, pour les deux ponts.`,
    board: `Monte sur le glisseur de lumière jusqu’à « ${NAME.H} »`,
    end: 'Rallume le phare de la jetée',
  },
  say: {
    hello: `Je suis Zéro ! La tempête a cassé les ponts jusqu’au phare. Deux fossés nous attendent, ${T1} cases puis ${T2}, et l’île du milieu n’a pas de planches. Viens à l’atelier.`,
    // arriving on the second island of a convoy: the gap, and the question of the coins
    tailAsk: (a) =>
      `Pas de planches sur cette île. Le fossé de ${counted(a, CELLS)} : tes planches le remplissent-elles, avec les pièces qui restent ?`,
    // a bridge of a convoy held: its equality, the coins left, what waits next
    headOk: (a, b, left, next) =>
      `$${tx(a)} = ${tx(b)} \\times ${tx(a / b)}$ : ${planksOf(a / b, nb(b))}, ${coinsLeft(left)}. Traverse : le fossé de ${nb(next)} attend les mêmes planches.`,
    tailOk: (a, b, left) =>
      `$${tx(a)} = ${tx(b)} \\times ${tx(a / b)}$ : ${planksOf(a / b, nb(b))}. Les deux ponts tiennent, ${coinsLeft(left)}.`,
    // what waits after each forge (the road goes on from the island of its mirror)
    grands: `Deux longs fossés maintenant : ${counted(F1, CELLS)}, puis ${counted(F2, CELLS)}. L’atelier de l’île a un tableur, et la bourse ${counted(FC.purse, COINS)}.`,
    euclide: `Deux fossés immenses : ${counted(E1, CELLS)}, puis ${counted(E2, CELLS)}. Le tableur s’arrête à ${SHEET_LAST} : l’atelier de l’île a un carnet de divisions.`,
    f: 'Le glisseur de lumière est prêt. Lis la phrase, et passe par la porte qui la vérifie.',
    jetty: `La jetée du phare : ${counted(M1, CELLS)}, puis ${counted(M2, CELLS)}, et ${counted(MI.purse, COINS)}. À toi de trouver la longueur, sur ton cahier.`,
    end: 'Le phare de la jetée brille de nouveau. Merci !',
    // the world's sentences of a refused plank, in this story's words: the workshop makes another length
    gap: (r) =>
      `Il reste ${counted(r, ['case vide', 'cases vides'])} : le pont s’est effondré. Fabrique une autre longueur à l’atelier.`,
    gapShort: (r) =>
      `Il reste ${counted(r, ['case vide', 'cases vides'])} : le pont ne tient que s’il est rempli exactement.`,
    convoyBack: (name, r) =>
      `Il reste ${counted(r, ['case vide', 'cases vides'])} : le deuxième pont s’est effondré. Pas de planches ici : retourne à « ${name} » et fabrique une autre longueur.`,
    convoyReset: (b) => `Planches de ${nb(b)} en main : les ponts construits avec d’autres planches sont défaits.`,
    convoyOnly: 'Les deux ponts se construisent avec les mêmes planches : celles de l’atelier de l’île précédente.',
    crafted: (b) => `Tes planches de ${nb(b)} sont prêtes. Au socle lumineux !`,
  },
  /** The workshop's bench: one name for the two benches (the spreadsheet of C, the division notebook of E). */
  workshop: {
    bench: 'Le carnet de l’atelier',
    benchSub: 'Il calcule pour toi ; la longueur de la planche, c’est toi qui la choisis',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    bridge: (a, b, q) => `Le fossé précédent : $${tx(a)} = ${tx(b)} \\times ${tx(q)}$`,
    first: (a, b) => `Le premier pont : $${tx(a)} = ${tx(b)} \\times ${tx(a / b)}$`,
    paid: (q, left) => `Tu as payé ${counted(q, COINS)}, ${coinsLeft(left)}`,
    plank: (b, on) => `Planches de ${nb(b)} : ${on.map(didOn).join(', ')}`,
  },
  end: { text: 'Tu as rallumé le phare de la jetée, et forgé toi-même les quatre clés de la leçon.' },
});

/** The planks he fired on the gaps of a convoy, in the order he first tried them (the last three: a card is four lines). */
function triedOn(game, gaps) {
  const order = [];
  for (const x of game.log) if (gaps.includes(x.a) && !x.mirror && !order.includes(x.b)) order.push(x.b);
  return order.slice(-3);
}
const laidOn = (game, b) => (a) => game.log.some((x) => x.a === a && x.b === b && !x.mirror);

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  convoys: CONVOYS,

  /**
   * The instruction of the moment — the WHOLE instruction (it stays on screen): on a convoy's first island, the two gaps
   * its plank builds, that the next island has none, the workshop, the purse (and the workshop's tool); on the second,
   * the plank he carries and the coins left. null: the world's own (a bridge built, the rail).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.complete || !seg.convoy) return null;
    const b = game.state.held;
    const left = game.purseOf(seg)?.left ?? CONVOYS[seg.convoy].purse;
    if (!game.convoyTail(seg)) return b == null ? o.make(seg.convoy) : o.carry(seg.convoy, b, left);
    // nothing in hand on an island without planks (a page opened again there), or refused: back to the workshop
    if (game.flags.convoyStuck || b == null) return o.convoyBack(game.isl[game.convoyOf(seg)[0].index].name);
    return o.tail(seg.a, b, left);
  },
  /**
   * The card on the right: on a convoy's second island, the first bridge's equality and the coins it cost; after a
   * convoy, what each plank he tried did on its two gaps (facts, never the rule). Elsewhere the world's.
   */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.convoy) return null;
    const group = game.convoyOf(before);
    const gaps = group.map((s) => s.a);
    if (group.indexOf(before) === group.length - 1) {
      const purse = CONVOYS[before.convoy].purse;
      return triedOn(game, gaps).map((b) => R.plank(b, roadOf(gaps, purse, b, laidOn(game, b))));
    }
    if (!before.complete) return null;
    const b = before.builtWith ?? before.holdsWith;
    return [R.first(before.a, b), R.paid(before.a / b, game.purseOf(before)?.left ?? 0)];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1 || k === 3 || k === 5 || k === 8) game.say(say.tailAsk(game.segs[k].a), 8);
    if (k === 2) {
      if (missing(game, K.common)) game.openForge(K.common);
      else if (missing(game, K.lots)) game.openForge(K.lots);
    }
    if (k === 4 && missing(game, K.factors)) game.openForge(K.factors);
    if (k === 6 && missing(game, K.euclide)) game.openForge(K.euclide);
    if (k === 7) game.say(say.jetty, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    // island C holds two mirrors: the second opens as soon as the first tablet is closed
    [K.common]: (game) => {
      completeModules(game, K.common);
      if (missing(game, K.lots)) game.openForge(K.lots);
    },
    [K.lots]: (game) => {
      completeModules(game, K.lots);
      game.refreshObjective();
      game.say(game.T.say.grands, 9);
    },
    [K.factors]: (game) => {
      completeModules(game, K.factors);
      game.refreshObjective();
      game.say(game.T.say.euclide, 9);
    },
    [K.euclide]: (game) => {
      completeModules(game, K.euclide);
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    const { stage } = game.state;
    if (stage === 2 && missing(game, K.common)) return K.common;
    if (stage === 2 && missing(game, K.lots)) return K.lots;
    if (stage === 4 && missing(game, K.factors)) return K.factors;
    if (stage === 6 && missing(game, K.euclide)) return K.euclide;
    return null;
  },
  /**
   * A bridge of a convoy held: its equality, the coins left and what waits next. The second bridge of the final mission
   * is the lesson's problem (module 5): the plank he made builds the jetty.
   */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (!seg.convoy) return false;
    const left = game.purseOf(seg)?.left ?? 0;
    if (game.convoyTail(seg)) {
      game.say(say.tailOk(seg.a, b, left), 9);
      if (seg.convoy === 'jetee') game.onModule(PROBLEM_MODULE);
    } else game.say(say.headOk(seg.a, b, left, game.convoyOf(seg)[1].a), 8);
    return true;
  },
};
