/**
 * What the « fiche de connaissances » shows for lesson `fraction-irreductible` (v2): the lesson's mind map (its cards and
 * their labelled links), the memo sheet of each of its four keys, and where each card sits on the map.
 *
 * Written with the lesson's own numbers (`NUMBERS` of math.js, never retyped). The memo items carry the ids of the four
 * KEYS, which is what `pack.coach` and the board's knowledge card name. A card is open when its key is held (`requires`
 * is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds: only those of `kit/text.js`. No
 * card names the final mission's numbers (3/34, 85/87, 255/2 958, 5/58). Every option of a memo quiz is computed by
 * `journey.test.js`.
 */
import { NUMBERS, frAll, fracTex as F, gcd, nb, pgcdTex as P, powTex, powersOf, tx } from './math';
import { K } from './story';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { strike: ST, stays: SY, pgcd: PG, result: RS } = NUMBERS;
const RS_MARK = RS.strokes[0] + RS.strokes[1];
const G_RS = gcd(RS_MARK, RS.gap);
const dec = (xs) => powTex(powersOf(xs));
/** 138/246 = (2 × 3 × 23)/(2 × 3 × 41) = 23/41 */
const [N1, D1] = [ST.mark, ST.gap];
const EARLY = 2;
/** 722/1 786 divided by 2 only: 361/893 — still reducible (by 19). */
const PG_EARLY = [PG.mark / EARLY, PG.gap / EARLY];

export const KNOWLEDGE_GRAPH = frAll({
  root: 'fraction',
  nodes: [
    {
      id: 'fraction',
      kind: 'concept',
      lane: 'center',
      requires: K.strike,
      title: 'La part éclairée du pont',
      subtitle: 'une fraction, plusieurs écritures',
      context: {
        text: `Un pont de ${tx(ST.gap)} cases, les ${tx(ST.mark)} premières éclairées : la pancarte écrit $${F(N1, D1)}$. Chaque planche qui tient écrit la même part avec des nombres plus petits.`,
      },
      reveals: ['rappel', 'facteurs'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: K.strike,
      title: 'Fractions égales',
      subtitle: 'même division des deux termes',
      context: {
        text: `Diviser le numérateur et le dénominateur par le même nombre (non nul) donne une fraction égale : $${F(N1, D1)} = ${F(N1 / 2, D1 / 2)}$.`,
      },
      reveals: [],
    },
    {
      id: 'facteurs',
      kind: 'method',
      lane: 'center',
      requires: K.strike,
      notebook: true,
      title: 'Simplifier avec les facteurs premiers',
      subtitle: 'on barre les facteurs communs',
      reveals: ['erreur-une-fois', 'irreductible', 'exemple-246'],
    },
    {
      id: 'erreur-une-fois',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.strike,
      title: 'Barrer un facteur une seule fois',
      subtitle: 'est-ce fini ?',
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${F('2^{2} \\times 13', '2^{2} \\times 19')} = ${F('2 \\times 13', '2 \\times 19')}$, c’est fini.`,
          },
          { role: 'why', text: 'Le 2 est deux fois dans chaque terme : il faut le barrer deux fois.' },
          { role: 'right', text: `$${F('2^{2} \\times 13', '2^{2} \\times 19')} = ${F(13, 19)}$` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-246',
      kind: 'example',
      lane: 'end',
      requires: K.strike,
      title: `${tx(N1)} sur ${tx(D1)}`,
      subtitle: 'les planches 2 et 3 tiennent',
      context: {
        formula: `$${F(N1, D1)} = ${F(dec(N1), dec(D1))} = ${F(23, 41)}$`,
        text: `Les facteurs premiers communs sont 2 et 3, une fois chacun : il reste $${F(23, 41)}$.`,
      },
      reveals: [],
    },
    {
      id: 'irreductible',
      kind: 'relationship',
      lane: 'center',
      requires: K.stays,
      notebook: true,
      title: 'La fraction irréductible',
      subtitle: 'aucun facteur premier commun',
      reveals: ['erreur-235', 'pgcd', 'exemple-96'],
    },
    {
      id: 'erreur-235',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.stays,
      title: 'Ne regarder que 2, 3 et 5',
      subtitle: 'est-ce irréductible ?',
      context: {
        parts: [
          {
            role: 'wrong',
            text: `Ni 2, ni 3, ni 5 ne divisent ${SY.use.fractions[1].join(' et ')} : $${F(...SY.use.fractions[1])}$ est irréductible.`,
          },
          {
            role: 'why',
            text: '7 est un facteur premier que ces règles ne montrent pas, et il divise les deux termes.',
          },
          { role: 'right', text: `$${F(...SY.use.fractions[1])} = ${F(34, 41)}$` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-96',
      kind: 'example',
      lane: 'end',
      requires: K.stays,
      title: `${SY.mark} sur ${SY.gap}`,
      subtitle: `$${P(SY.mark, SY.gap)} = 1$`,
      context: {
        formula: `$${SY.mark} = 5 \\times 13$ et $${SY.gap} = 2^{5} \\times 3$`,
        text: 'Aucune planche sauf 1 ne tenait le pont : la pancarte est restée la même.',
      },
      reveals: [],
    },
    {
      id: 'pgcd',
      kind: 'method',
      lane: 'center',
      requires: K.pgcd,
      notebook: true,
      title: 'Diviser par le PGCD',
      subtitle: 'une seule division',
      reveals: ['erreur-tot', 'resultat', 'exemple-pont-long'],
    },
    {
      id: 'erreur-tot',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.pgcd,
      title: 'S’arrêter trop tôt',
      subtitle: 'est-ce fini ?',
      context: {
        parts: [
          { role: 'wrong', text: `$${F(PG.mark, PG.gap)} = ${F(...PG_EARLY)}$, et c’est fini.` },
          { role: 'why', text: `$${P(PG_EARLY[0], PG_EARLY[1])} = ${gcd(...PG_EARLY)}$ : il reste un facteur commun.` },
          {
            role: 'right',
            text: `$${P(tx(PG.mark), tx(PG.gap))} = ${PG.plank}$, donc $${F(PG.mark, PG.gap)} = ${F(PG.mark / PG.plank, PG.gap / PG.plank)}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-pont-long',
      kind: 'example',
      lane: 'end',
      requires: K.pgcd,
      title: `${nb(PG.mark)} sur ${nb(PG.gap)}`,
      subtitle: `$${P(tx(PG.mark), tx(PG.gap))} = ${PG.plank}$`,
      context: {
        formula: `$${F(PG.mark, PG.gap)} = ${F(PG.mark / PG.plank, PG.gap / PG.plank)}$`,
        text: `La bourse ne payait que les planches de ${PG.plank} : une division, et la pancarte est irréductible.`,
      },
      reveals: [],
    },
    {
      id: 'resultat',
      kind: 'method',
      lane: 'center',
      requires: K.result,
      notebook: true,
      title: 'Le résultat d’un calcul',
      subtitle: 'on calcule, puis on vérifie',
      reveals: ['erreur-tel-quel', 'choisir', 'exemple-78'],
    },
    {
      id: 'erreur-tel-quel',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.result,
      title: 'Laisser le résultat tel quel',
      subtitle: 'les fractions étaient irréductibles',
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${F(...RS.crews[0])} + ${F(...RS.crews[1])} = ${F(RS_MARK, RS.gap)}$, les deux fractions sont irréductibles, donc le résultat aussi.`,
          },
          { role: 'why', text: `$${P(RS_MARK, RS.gap)} = ${G_RS}$ : la somme se simplifie.` },
          { role: 'right', text: `$${F(RS_MARK, RS.gap)} = ${F(RS_MARK / G_RS, RS.gap / G_RS)}$` },
        ],
      },
      reveals: [],
    },
    {
      id: 'choisir',
      kind: 'takeaway',
      lane: 'center',
      requires: K.result,
      title: 'Comment rendre irréductible ?',
      subtitle: 'facteurs premiers · PGCD · vérifier',
      context: {
        text: 'Je barre les facteurs premiers communs, ou je divise par le PGCD. Puis je vérifie : aucun facteur commun ne reste.',
        note: 'Après un calcul, je vérifie toujours le résultat.',
      },
      reveals: [],
    },
    {
      id: 'exemple-78',
      kind: 'example',
      lane: 'end',
      requires: K.result,
      title: `${RS.strokes[0]} puis ${RS.strokes[1]} sur ${RS.gap}`,
      subtitle: `$= ${F(RS_MARK / G_RS, RS.gap / G_RS)}$`,
      context: {
        formula: `$${F(...RS.crews[0])} + ${F(...RS.crews[1])} = ${F(RS_MARK, RS.gap)} = ${F(RS_MARK / G_RS, RS.gap / G_RS)}$`,
        text: `Les deux équipes ont éclairé ${RS_MARK} cases sur ${RS.gap} : la planche ${G_RS} tient le pont.`,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'fraction', to: 'rappel', label: 'Je rappelle' },
    { from: 'fraction', to: 'facteurs', label: 'Je simplifie' },
    { from: 'facteurs', to: 'erreur-une-fois', label: 'Erreur fréquente' },
    { from: 'facteurs', to: 'irreductible', label: 'Jusqu’où ?' },
    { from: 'facteurs', to: 'exemple-246', label: 'Exemple' },
    { from: 'irreductible', to: 'erreur-235', label: 'Erreur fréquente' },
    { from: 'irreductible', to: 'pgcd', label: 'Plus vite' },
    { from: 'irreductible', to: 'exemple-96', label: 'Exemple' },
    { from: 'pgcd', to: 'erreur-tot', label: 'Erreur fréquente' },
    { from: 'pgcd', to: 'resultat', label: 'Ensuite' },
    { from: 'pgcd', to: 'exemple-pont-long', label: 'Exemple' },
    { from: 'resultat', to: 'erreur-tel-quel', label: 'Erreur fréquente' },
    { from: 'resultat', to: 'choisir', label: 'Je retiens' },
    { from: 'resultat', to: 'exemple-78', label: 'Exemple' },
  ],
});

/** The memo sheets of the four keys, in the order of the keys (1: K1, 2: K2, 3: K3, 4: K4). */
export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: K.strike,
        type: 'methodes',
        title: 'Simplifier avec les facteurs premiers',
        summary:
          'On décompose les deux termes en facteurs premiers, puis on barre chaque facteur premier commun, autant de fois qu’il est dans les deux.',
        memo: {
          rule: `${F(`${R('c')} \\times u`, `${R('c')} \\times v`)} = ${F('u', 'v')}`,
          hook: 'Les facteurs communs, barrés ensemble',
          example: `${F(N1, D1)} = ${F(dec(N1), dec(D1))} = ${F(23, 41)}`,
          trap: 'Barrer un facteur une seule fois alors qu’il est deux fois dans chaque terme',
          exam: 'Je décompose le numérateur et le dénominateur, je barre les facteurs communs et je réécris ce qui reste',
          chip: `${R('\\times')}`,
          quiz: [
            {
              q: `$${F(N1, D1)}$ sous forme irréductible :`,
              options: [`$${F(23, 41)}$`, `$${F(N1 / 2, D1 / 2)}$`, `$${F(N1 / 3, D1 / 3)}$`],
              correct: 0,
            },
            {
              q: `$${F('2^{2} \\times 13', '2^{2} \\times 19')}$ s’écrit :`,
              options: [`$${F(13, 19)}$`, `$${F(26, 38)}$`, `$${F(4, 19)}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: K.stays,
        type: 'regles',
        title: 'La fraction irréductible',
        summary:
          'Une fraction est irréductible quand son numérateur et son dénominateur n’ont aucun facteur premier commun : leur PGCD est 1.',
        memo: {
          rule: `\\mathrm{PGCD}(a ; b) = ${R('1')}`,
          hook: 'Aucun facteur premier commun',
          example: `\\mathrm{PGCD}(${SY.mark} ; ${SY.gap}) = ${R('1')}`,
          trap: 'Croire qu’une fraction est finie parce que 2, 3 et 5 ne divisent pas ses deux termes',
          exam: 'Je cherche un facteur premier commun, par les décompositions : s’il n’y en a aucun, la fraction est irréductible',
          chip: `\\mathrm{PGCD} = ${R('1')}`,
          quiz: [
            {
              q: 'Quelle fraction est irréductible ?',
              options: [`$${F(SY.mark, SY.gap)}$`, `$${F(N1, D1)}$`, `$${F(...SY.use.fractions[1])}$`],
              correct: 0,
            },
            {
              q: `$${P(SY.mark, SY.gap)} =$`,
              options: ['$1$', '$5$', '$13$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: K.pgcd,
        type: 'methodes',
        title: 'Diviser par le PGCD',
        summary:
          'On divise le numérateur et le dénominateur par leur PGCD : on obtient en une seule étape la fraction irréductible.',
        memo: {
          rule: `${F('a', 'b')} = ${F(`a \\div ${R('g')}`, `b \\div ${R('g')}`)}`,
          hook: 'Une seule division, par le PGCD',
          example: `${F(PG.mark, PG.gap)} = ${F(`${tx(PG.mark)} \\div ${PG.plank}`, `${tx(PG.gap)} \\div ${PG.plank}`)} = ${F(PG.mark / PG.plank, PG.gap / PG.plank)}`,
          trap: 'Diviser par un diviseur commun qui n’est pas le plus grand : il reste un facteur commun',
          exam: 'Je calcule le PGCD, puis je divise le numérateur et le dénominateur par ce nombre',
          chip: `\\div ${R('g')}`,
          quiz: [
            {
              q: `$${P(tx(PG.mark), tx(PG.gap))} = ${PG.plank}$, donc $${F(PG.mark, PG.gap)} =$`,
              options: [
                `$${F(PG.mark / PG.plank, PG.gap / PG.plank)}$`,
                `$${F(...PG_EARLY)}$`,
                `$${F(PG.mark, PG.gap / PG.plank)}$`,
              ],
              correct: 0,
            },
            {
              q: 'En une seule étape, on divise les deux termes par :',
              options: ['leur PGCD', 'leur différence', 'un de leurs diviseurs communs'],
              correct: 0,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: K.result,
        type: 'methodes',
        title: 'Le résultat d’un calcul',
        summary:
          'On calcule, puis on cherche un facteur premier commun aux deux termes du résultat : on le simplifie, même si les fractions de départ étaient irréductibles.',
        memo: {
          rule: `${F('a', 'n')} + ${F('b', 'n')} = ${F('a + b', R('n'))}`,
          hook: 'Un résultat se vérifie toujours',
          example: `${F(...RS.crews[0])} + ${F(...RS.crews[1])} = ${F(RS_MARK, RS.gap)} = ${F(RS_MARK / G_RS, RS.gap / G_RS)}`,
          trap: 'Laisser le résultat tel quel parce que les fractions de départ étaient irréductibles',
          exam: 'J’écris le calcul, puis le résultat, puis le résultat sous forme irréductible',
          chip: `${F('a + b', R('n'))}`,
          quiz: [
            {
              q: `$${F(...RS.crews[0])} + ${F(...RS.crews[1])}$ sous forme irréductible :`,
              options: [
                `$${F(RS_MARK / G_RS, RS.gap / G_RS)}$`,
                `$${F(RS_MARK, RS.gap)}$`,
                `$${F(RS.crews[0][0] + RS.crews[1][0], RS.crews[0][1] + RS.crews[1][1])}$`,
              ],
              correct: 0,
            },
            {
              q: 'Le produit de deux fractions irréductibles est-il toujours irréductible ?',
              options: ['Non : on vérifie et on simplifie', 'Oui, toujours', 'Oui, si elles ont le même dénominateur'],
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
 * cards a row at most, on the columns 17 %, 50 %, 83 % — lesson 2's walked layout. Every link joins two rows going down,
 * so its label sits at least 8.5 % from both rows, never under a card.
 */
const POSITIONS = {
  fraction: [50, 7],
  rappel: [17, 24],
  facteurs: [50, 24],
  'erreur-une-fois': [17, 41],
  irreductible: [50, 41],
  'exemple-246': [83, 41],
  'erreur-235': [17, 59],
  pgcd: [50, 59],
  'exemple-96': [83, 59],
  'erreur-tot': [17, 76],
  resultat: [50, 76],
  'exemple-pont-long': [83, 76],
  'erreur-tel-quel': [17, 93],
  choisir: [50, 93],
  'exemple-78': [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed: the KEY of each question that lost points — each has its
 * card in `ofKey` — then `ex:<id>` for the sheets, which name no kind of exercise: `ofExercise` is empty, and a sheet
 * whose questions carry no key opens `fallback` (the method of K1, the striking of the common factors).
 */
export const CARDS = {
  ofKey: {
    [K.strike]: 'facteurs',
    [K.stays]: 'irreductible',
    [K.pgcd]: 'pgcd',
    [K.result]: 'resultat',
  },
  ofExercise: {},
  fallback: 'facteurs',
};
