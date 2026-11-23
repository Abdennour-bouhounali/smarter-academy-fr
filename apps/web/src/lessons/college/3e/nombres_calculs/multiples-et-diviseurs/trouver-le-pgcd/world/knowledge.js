/**
 * What the « fiche de connaissances » shows for lesson `trouver-le-pgcd` (v2): the lesson's mind map (its cards and their
 * labelled links), the memo sheet of each of its four keys, and where each card sits on the map.
 *
 * Written with the lesson's own numbers (`NUMBERS` of math.js, never retyped) and its decompositions (math.js). The memo
 * items carry the ids of the four KEYS, which is what `pack.coach` and the board's knowledge card name. A card is open
 * when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds:
 * only those of `kit/text.js`. No card names the final mission's numbers (1 462, 946, 86): the mission stays the
 * mission's. Every option of a memo quiz is computed by `journey.test.js`.
 */
import { NUMBERS, commonDivisors, commonPowers, euclid, frAll, gcd, listFr, nb, powTex, powersOf, tx } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const P = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
const { twins: TW, deal: DL, factors: FC, euclide: EU } = NUMBERS;
const [T1, T2] = TW.gaps;
const [F1, F2] = FC.gaps;
const [E1, E2] = EU.gaps;
const G_TW = gcd(T1, T2);
const G_DL = gcd(DL.apples, DL.pears);
const POW_F = FC.gaps.map(powersOf);
/** « the largest exponents »: the error of K3 — 2³ × 7² on 1 736 and 980. */
const LARGEST_F = POW_F[0]
  .filter((x) => POW_F[1].some((y) => y.p === x.p))
  .map((x) => ({ p: x.p, e: Math.max(x.e, POW_F[1].find((y) => y.p === x.p).e) }));
const V_LARGEST_F = LARGEST_F.reduce((v, { p, e }) => v * p ** e, 1);
/** A worked example of K3 away from the road and the bank: 1 800 = 2³ × 3² × 5² and 1 350 = 2 × 3³ × 5². */
const EX = [1800, 1350];
const POW_EX = EX.map(powersOf);
/** The division notebook of K4's road: 52 015 and 31 209. */
const EU_ROWS = euclid(E1, E2);
const row = (s) => `${tx(s.a)} = ${tx(s.b)} \\times ${s.q} + ${tx(s.r)}`;
/** The « last quotient » error of K4, away from the road: 406 and 290 (PGCD 58, last quotient 2). */
const QX = [406, 290];
const QX_ROWS = euclid(...QX);

export const KNOWLEDGE_GRAPH = frAll({
  root: 'pgcd',
  nodes: [
    {
      id: 'pgcd',
      kind: 'concept',
      lane: 'center',
      requires: 'diviseurs-communs',
      title: 'Le PGCD de deux nombres',
      subtitle: 'une planche pour deux fossés',
      context: {
        text: `Une seule longueur de planche doit remplir deux fossés : elle divise les deux nombres. La plus longue, $${P(T1, T2)} = ${G_TW}$, construit les deux ponts avec le moins de planches.`,
      },
      reveals: ['rappel', 'diviseurs-communs'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'diviseurs-communs',
      title: 'Diviseur',
      subtitle: '$b$ divise $a$ quand le reste est 0',
      context: {
        text: `$b$ divise $a$ quand la division euclidienne de $a$ par $b$ tombe juste : $${T1} = ${G_TW} \\times ${T1 / G_TW}$, donc ${G_TW} divise ${T1}.`,
      },
      reveals: [],
    },
    {
      id: 'diviseurs-communs',
      kind: 'method',
      lane: 'center',
      requires: 'diviseurs-communs',
      notebook: true,
      title: 'Diviseurs communs et PGCD',
      subtitle: 'le plus grand des diviseurs communs',
      reveals: ['erreur-difference', 'exemple-90-54', 'lots'],
    },
    {
      id: 'erreur-difference',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'diviseurs-communs',
      title: 'La différence des deux nombres',
      subtitle: `$${T1} - ${T2} = ${T1 - T2}$ ?`,
      context: {
        parts: [
          { role: 'wrong', text: `$${P(T1, T2)} = ${T1} - ${T2} = ${T1 - T2}$.` },
          {
            role: 'why',
            text: `$${T1} = ${T1 - T2} \\times ${Math.floor(T1 / (T1 - T2))} + ${T1 % (T1 - T2)}$ : ${T1 - T2} ne divise pas ${T1}.`,
          },
          { role: 'right', text: `$${P(T1, T2)} = ${G_TW}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-90-54',
      kind: 'example',
      lane: 'end',
      requires: 'diviseurs-communs',
      title: `Les fossés de ${T1} et ${T2}`,
      subtitle: `$${P(T1, T2)} = ${G_TW}$`,
      context: {
        formula: `$${T1} = ${G_TW} \\times ${T1 / G_TW}$, $${T2} = ${G_TW} \\times ${T2 / G_TW}$`,
        text: `Les diviseurs communs de ${T1} et ${T2} sont ${listFr(commonDivisors(T1, T2))} : le plus grand est ${G_TW}.`,
      },
      reveals: [],
    },
    {
      id: 'lots',
      kind: 'method',
      lane: 'center',
      requires: 'lots-identiques',
      notebook: true,
      title: 'Partager en lots identiques',
      subtitle: 'le plus de lots, c’est le PGCD',
      reveals: ['erreur-lots', 'facteurs'],
    },
    {
      id: 'erreur-lots',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'lots-identiques',
      title: 'Un diviseur d’un seul nombre',
      subtitle: `5 paniers pour ${DL.apples} pommes et ${DL.pears} poires ?`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `5 divise ${DL.apples} : on fait 5 paniers avec ${DL.apples} pommes et ${DL.pears} poires.`,
          },
          {
            role: 'why',
            text: `$${DL.pears} = 5 \\times ${Math.floor(DL.pears / 5)} + ${DL.pears % 5}$ : il resterait ${DL.pears % 5} poires.`,
          },
          {
            role: 'right',
            text: `$${P(DL.apples, DL.pears)} = ${G_DL}$ : ${G_DL} paniers de ${DL.apples / G_DL} pommes et ${DL.pears / G_DL} poires.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'facteurs',
      kind: 'method',
      lane: 'center',
      requires: 'pgcd-facteurs',
      notebook: true,
      title: 'Le PGCD par les facteurs premiers',
      subtitle: 'les facteurs communs, le plus petit exposant',
      reveals: ['erreur-exposant', 'exemple-facteurs', 'euclide'],
    },
    {
      id: 'erreur-exposant',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'pgcd-facteurs',
      title: 'Le plus grand exposant',
      subtitle: `$${powTex(LARGEST_F)}$ ?`,
      context: {
        parts: [
          { role: 'wrong', text: `$${P(tx(F1), F2)} = ${powTex(LARGEST_F)} = ${V_LARGEST_F}$.` },
          {
            role: 'why',
            text: `$${tx(F1)} = ${V_LARGEST_F} \\times ${Math.floor(F1 / V_LARGEST_F)} + ${F1 % V_LARGEST_F}$ : ${V_LARGEST_F} ne divise pas ${nb(F1)}.`,
          },
          { role: 'right', text: `$${P(tx(F1), F2)} = ${powTex(commonPowers(...POW_F))} = ${gcd(F1, F2)}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-facteurs',
      kind: 'example',
      lane: 'end',
      requires: 'pgcd-facteurs',
      title: `${nb(EX[0])} et ${nb(EX[1])}`,
      subtitle: `$${P(tx(EX[0]), tx(EX[1]))} = ${gcd(...EX)}$`,
      context: {
        formula: `$${tx(EX[0])} = ${powTex(POW_EX[0])}$, $${tx(EX[1])} = ${powTex(POW_EX[1])}$`,
        text: `Les facteurs 2, 3 et 5 sont dans les deux : $${P(tx(EX[0]), tx(EX[1]))} = ${powTex(commonPowers(...POW_EX))} = ${gcd(...EX)}$.`,
      },
      reveals: [],
    },
    {
      id: 'euclide',
      kind: 'method',
      lane: 'center',
      requires: 'euclide',
      notebook: true,
      title: 'L’algorithme d’Euclide',
      subtitle: 'le dernier reste qui n’est pas 0',
      reveals: ['erreur-quotient', 'choisir', 'exemple-euclide'],
    },
    {
      id: 'erreur-quotient',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'euclide',
      title: 'Le dernier quotient',
      subtitle: `$${P(QX[0], QX[1])}$ : le quotient ${QX_ROWS.at(-1).q} ?`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${row(QX_ROWS.at(-1))}$ : le PGCD est le dernier quotient, ${QX_ROWS.at(-1).q}.`,
          },
          {
            role: 'why',
            text: `Le quotient compte combien de fois le reste entre : c’est le reste qui garde les diviseurs communs.`,
          },
          { role: 'right', text: `$${P(QX[0], QX[1])} = ${gcd(...QX)}$, le dernier reste qui n’est pas 0.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-euclide',
      kind: 'example',
      lane: 'end',
      requires: 'euclide',
      title: `Les fossés de ${nb(E1)} et ${nb(E2)}`,
      subtitle: `${EU_ROWS.length} divisions`,
      context: {
        formula: EU_ROWS.map((s) => `$${row(s)}$`).join(', '),
        text: `Le dernier reste qui n’est pas 0 est ${nb(gcd(E1, E2))} : $${P(tx(E1), tx(E2))} = ${tx(gcd(E1, E2))}$.`,
      },
      reveals: [],
    },
    {
      id: 'choisir',
      kind: 'takeaway',
      lane: 'center',
      requires: 'euclide',
      title: 'L’essentiel',
      subtitle: 'trois façons de trouver le PGCD',
      context: {
        text: `Petits nombres : on liste les diviseurs communs. Nombres décomposés : les facteurs communs, le plus petit exposant. Grands nombres : les divisions d’Euclide.`,
        note: `Pour partager en lots identiques, le plus de lots est le PGCD : $${P(DL.apples, DL.pears)} = ${G_DL}$.`,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'pgcd', to: 'rappel', label: 'Rappel' },
    { from: 'pgcd', to: 'diviseurs-communs', label: 'Comment le trouver ?' },
    { from: 'diviseurs-communs', to: 'erreur-difference' },
    { from: 'diviseurs-communs', to: 'exemple-90-54', label: 'Exemple' },
    { from: 'diviseurs-communs', to: 'lots', label: 'Un partage' },
    { from: 'lots', to: 'erreur-lots' },
    { from: 'lots', to: 'facteurs', label: 'De grands nombres' },
    { from: 'facteurs', to: 'erreur-exposant' },
    { from: 'facteurs', to: 'exemple-facteurs' },
    { from: 'facteurs', to: 'euclide', label: 'Plus grands encore' },
    { from: 'euclide', to: 'erreur-quotient' },
    { from: 'euclide', to: 'choisir', label: 'En résumé' },
    { from: 'euclide', to: 'exemple-euclide', label: 'Exemple' },
  ],
});

/** The memo sheets of the four keys, by the module that teaches them (`lesson.config.js`). */
export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: 'diviseurs-communs',
        type: 'methodes',
        title: 'Diviseurs communs et PGCD',
        summary:
          'Un diviseur commun de deux nombres divise l’un et l’autre ; le plus grand des diviseurs communs est leur PGCD.',
        memo: {
          rule: `d \\text{ divise } a \\text{ et } b\\ \\Rightarrow\\ d \\leqslant ${R('\\mathrm{PGCD}(a ; b)')}`,
          hook: 'La plus longue planche qui remplit les deux fossés',
          example: `${P(T1, T2)} = ${G_TW}`,
          trap: 'Prendre la différence des deux nombres, ou un diviseur commun qui n’est pas le plus grand',
          exam: 'J’écris les diviseurs de chaque nombre, j’entoure ceux qui sont dans les deux listes, je garde le plus grand',
          chip: R('\\mathrm{PGCD}'),
          quiz: [
            {
              q: 'Les diviseurs communs de $16$ et $24$ sont :',
              options: [listFr(commonDivisors(16, 24)), '1, 2, 4, 6 et 8', '2 et 4'],
              correct: 0,
            },
            { q: `$${P(24, 40)}$ vaut :`, options: [`$${gcd(24, 40)}$`, '$16$', '$4$'], correct: 0 },
          ],
        },
      },
    ],
    2: [
      {
        id: 'lots-identiques',
        type: 'regles',
        title: 'Partager en lots identiques',
        summary:
          'Partager deux quantités en lots identiques sans reste, c’est choisir un diviseur commun ; le plus de lots possible est leur PGCD.',
        memo: {
          rule: `\\text{le plus de lots} = ${R('\\mathrm{PGCD}(a ; b)')}`,
          hook: 'Chaque lot reçoit la même part de chaque sorte',
          example: `${P(DL.apples, DL.pears)} = ${G_DL}`,
          trap: 'Choisir un nombre qui ne divise qu’une des deux quantités : il reste des objets',
          exam: 'Je calcule le PGCD des deux quantités, puis je divise chaque quantité par ce nombre',
          chip: R('\\text{lots}'),
          quiz: [
            {
              q: 'Avec $24$ crayons et $36$ gommes, le plus de trousses identiques est :',
              options: [`$${gcd(24, 36)}$`, '$6$', '$4$'],
              correct: 0,
            },
            {
              q: `Dans chacune de ces $${gcd(24, 36)}$ trousses, il y a :`,
              options: [
                `$${24 / gcd(24, 36)}$ crayons et $${36 / gcd(24, 36)}$ gommes`,
                `$${36 / gcd(24, 36)}$ crayons et $${24 / gcd(24, 36)}$ gommes`,
                '$12$ crayons et $12$ gommes',
              ],
              correct: 0,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'pgcd-facteurs',
        type: 'regles',
        title: 'Le PGCD par les facteurs premiers',
        summary:
          'On décompose les deux nombres ; le PGCD est le produit des facteurs premiers communs, chacun avec son plus petit exposant.',
        memo: {
          rule: `p^{e} \\text{ et } p^{f}\\ \\to\\ p^{${R('\\min(e ; f)')}}`,
          hook: 'Les facteurs communs, le plus petit exposant',
          example: `${P(powTex(POW_F[0]), powTex(POW_F[1]))} = ${powTex(commonPowers(...POW_F))}`,
          trap: 'Garder le plus grand exposant, ou un facteur qui n’est que dans un des deux nombres',
          exam: 'Je décompose les deux nombres, j’entoure les facteurs communs et je garde le plus petit exposant de chacun',
          chip: `p^{${R('\\min')}}`,
          quiz: [
            {
              q: '$\\mathrm{PGCD}(2^3 \\times 5 ; 2^2 \\times 5^2)$ vaut :',
              options: ['$2^2 \\times 5$', '$2^3 \\times 5^2$', '$2 \\times 5$'],
              correct: 0,
            },
            {
              q: '$\\mathrm{PGCD}(2 \\times 3^2 ; 5 \\times 7)$ vaut :',
              options: ['$1$', '$2 \\times 3^2 \\times 5 \\times 7$', '$0$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: 'euclide',
        type: 'methodes',
        title: 'L’algorithme d’Euclide',
        summary:
          'On divise le plus grand nombre par le plus petit, puis le plus petit par le reste, jusqu’au reste 0 : le PGCD est le dernier reste qui n’est pas 0.',
        memo: {
          rule: `\\mathrm{PGCD}(a ; b) = ${R('\\mathrm{PGCD}(b ; r)')}`,
          hook: 'Le dernier reste qui n’est pas 0',
          example: `${P(tx(E1), tx(E2))} = ${tx(gcd(E1, E2))}`,
          trap: 'Donner le dernier quotient, ou s’arrêter avant le reste 0',
          exam: 'J’écris les divisions l’une sous l’autre jusqu’au reste 0, et j’entoure le dernier reste qui n’est pas 0',
          chip: `r \\neq ${R('0')}`,
          quiz: [
            {
              q: `$84 = 36 \\times 2 + 12$ et $36 = 12 \\times 3 + 0$. $${P(84, 36)}$ vaut :`,
              options: [`$${gcd(84, 36)}$`, '$3$', '$2$'],
              correct: 0,
            },
            {
              q: 'Après la division $76 = 28 \\times 2 + 20$, on divise ensuite :',
              options: ['$28$ par $20$', '$76$ par $20$', '$2$ par $20$'],
              correct: 0,
            },
          ],
        },
      },
    ],
  }),
};

/**
 * Where each node sits on the MAP (percent of the map box, drawn left to right): SIX rows (7, 24, 41, 59, 76, 93), three
 * cards a row at most, on the columns 17 %, 50 %, 83 %. The top row is at 7 %, not lesson 1's 5 %: « Le PGCD de deux
 * nombres » takes two lines and was cut by the map's top edge at 5 % (walk, 2026-11-23). Every link joins two rows going
 * down, so its label sits at least 8.5 % from both rows, never under a card.
 */
const POSITIONS = {
  pgcd: [50, 7],
  rappel: [17, 24],
  'diviseurs-communs': [50, 24],
  'erreur-difference': [17, 41],
  lots: [50, 41],
  'exemple-90-54': [83, 41],
  'erreur-lots': [17, 59],
  facteurs: [50, 59],
  'erreur-exposant': [17, 76],
  euclide: [50, 76],
  'exemple-facteurs': [83, 76],
  'erreur-quotient': [17, 93],
  choisir: [50, 93],
  'exemple-euclide': [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed: the KEY of each question that lost points — each has its
 * card in `ofKey` — then `ex:<id>` for the sheets, which name no kind of exercise: `ofExercise` is empty, and a sheet
 * whose questions carry no key opens `fallback` (the method of K1, the PGCD itself).
 */
export const CARDS = {
  ofKey: {
    'diviseurs-communs': 'diviseurs-communs',
    'lots-identiques': 'lots',
    'pgcd-facteurs': 'facteurs',
    euclide: 'euclide',
  },
  ofExercise: {},
  fallback: 'diviseurs-communs',
};
