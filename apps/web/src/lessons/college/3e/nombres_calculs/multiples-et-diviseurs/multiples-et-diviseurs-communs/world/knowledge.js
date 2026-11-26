/**
 * What the « fiche de connaissances » shows for lesson `multiples-et-diviseurs-communs` (v2): the lesson's mind map (its
 * cards and their labelled links), the memo sheet of each of its four keys, and where each card sits on the map.
 *
 * Written with the lesson's own numbers (`NUMBERS` of math.js, never retyped) and its decompositions (math.js). The memo
 * items carry the ids of the four KEYS, which is what `pack.coach` and the board's knowledge card name. A card is open
 * when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds:
 * only those of `kit/text.js`. No card names the final mission's numbers (8, 17, 20, 681): the mission stays the
 * mission's. Every option of a memo quiz is computed by `journey.test.js`. « plus petit multiple commun » is written in
 * full (open question 2, decided by default): the abbreviation of the design's version A is never used.
 */
import { NUMBERS, frAll, gcd, lcm, lcmOf, lcmPowers, powTex, powersOf, tx, valueOfPowers } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { pillar: PI, story: ST } = NUMBERS;
const [P1, P2] = PI.crews;
const M1 = lcm(P1, P2);

/** A worked example of K1 away from the road and the bank: planks of 21 and 35 cases, first pillar 105. */
const EX1 = [21, 35];
const M_EX1 = lcm(...EX1);
/** K2's error, away from the road: 364 = 2² × 7 × 13 and 98 = 2 × 7², the smaller exponents give 182. */
const EX2 = [364, 98];
const POW_EX2 = EX2.map(powersOf);
const BIG_EX2 = lcmPowers(...POW_EX2);
const SMALL_EX2 = lcmPowers(
  POW_EX2[0].map(({ p }) => ({ p, e: 1 })),
  POW_EX2[1].map(({ p }) => ({ p, e: 1 })),
);
/** K2's coprime example: 25 = 5² and 36 = 2² × 3². */
const CO = [25, 36];
/** K3's error, away from the road: wheels of 22 and 30 teeth (330 teeth: 15 and 11 turns). */
const WH = [22, 30];
const M_WH = lcm(...WH);
/** K4's error: rests of 3 and 5 days (cycles 4 and 6); its example: rests of 5 and 8 days (cycles 6 and 9). */
const RE = [3, 5];
const RE_CYCLES = RE.map((r) => r + 1);
const RE_L = lcmOf(RE_CYCLES);
const EQ = [5, 8];
const EQ_CYCLES = EQ.map((r) => r + 1);
const EQ_L = lcmOf(EQ_CYCLES);
const [GA, GB] = ST.gears;
const G_L = lcm(GA, GB);

export const KNOWLEDGE_GRAPH = frAll({
  root: 'multiples',
  nodes: [
    {
      id: 'multiples',
      kind: 'concept',
      lane: 'center',
      requires: 'pilier-commun',
      title: 'Les multiples communs',
      subtitle: 'où deux rythmes se retrouvent',
      context: {
        text: `Deux équipes posent des planches de ${P1} et de ${P2} cases : elles finissent pile aux piliers ${M1}, ${2 * M1}, ${3 * M1}… Le premier qui n’est pas 0, ${M1}, est le plus petit multiple commun.`,
      },
      reveals: ['pilier'],
    },
    {
      id: 'pilier',
      kind: 'method',
      lane: 'center',
      requires: 'pilier-commun',
      notebook: true,
      title: 'Multiples communs et plus petit',
      subtitle: 'le plus petit multiple commun non nul',
      reveals: ['erreur-produit', 'exemple-pilier', 'facteurs'],
    },
    {
      id: 'erreur-produit',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'pilier-commun',
      title: 'Le produit des deux longueurs',
      subtitle: `$${P1} \\times ${P2} = ${P1 * P2}$ ?`,
      context: {
        parts: [
          { role: 'wrong', text: `Le premier pilier est à $${P1} \\times ${P2} = ${P1 * P2}$ cases.` },
          {
            role: 'why',
            text: `$${M1} = ${P1} \\times ${M1 / P1} = ${P2} \\times ${M1 / P2}$ : un pilier plus proche tient déjà, avec ${M1 / P1 + M1 / P2} planches au lieu de ${(P1 * P2) / P1 + (P1 * P2) / P2}.`,
          },
          { role: 'right', text: `Le plus petit multiple commun de ${P1} et de ${P2} est ${M1}.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-pilier',
      kind: 'example',
      lane: 'end',
      requires: 'pilier-commun',
      title: `Les planches de ${EX1[0]} et de ${EX1[1]}`,
      subtitle: `premier pilier : ${M_EX1}`,
      context: {
        formula: `$${M_EX1} = ${EX1[0]} \\times ${M_EX1 / EX1[0]} = ${EX1[1]} \\times ${M_EX1 / EX1[1]}$`,
        text: `Les multiples communs de ${EX1[0]} et de ${EX1[1]} sont ${M_EX1}, ${2 * M_EX1}, ${3 * M_EX1}… : le plus petit qui n’est pas 0 est ${M_EX1}.`,
      },
      reveals: [],
    },
    {
      id: 'facteurs',
      kind: 'method',
      lane: 'center',
      requires: 'ppcm-facteurs',
      notebook: true,
      // two lines, as every card of the centre lane: the rule's full name (3 lines) put the card under the labels of
      // the links above and below it (walk 2026-11-26: « De grands nombres », « Exemple », « Une histoire »)
      title: 'Par les facteurs premiers',
      subtitle: 'tous les facteurs, le plus grand exposant',
      reveals: ['erreur-exposant', 'exemple-facteurs', 'rendez-vous'],
    },
    {
      id: 'erreur-exposant',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'ppcm-facteurs',
      title: 'Le plus petit exposant',
      subtitle: `$${powTex(SMALL_EX2)}$ ?`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${EX2[0]} = ${powTex(POW_EX2[0])}$ et $${EX2[1]} = ${powTex(POW_EX2[1])}$ : on garde $${powTex(SMALL_EX2)} = ${valueOfPowers(SMALL_EX2)}$.`,
          },
          {
            role: 'why',
            text: `$${valueOfPowers(SMALL_EX2)} = ${EX2[0]} \\times 0 + ${valueOfPowers(SMALL_EX2)}$ : ${valueOfPowers(SMALL_EX2)} est plus petit que ${EX2[0]}, ce n’est pas un multiple de ${EX2[0]}.`,
          },
          {
            role: 'right',
            text: `$${powTex(BIG_EX2)} = ${tx(valueOfPowers(BIG_EX2))}$, et $${tx(valueOfPowers(BIG_EX2))} = ${EX2[0]} \\times ${valueOfPowers(BIG_EX2) / EX2[0]} = ${EX2[1]} \\times ${valueOfPowers(BIG_EX2) / EX2[1]}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-facteurs',
      kind: 'example',
      lane: 'end',
      requires: 'ppcm-facteurs',
      title: 'Deux nombres sans facteur commun',
      subtitle: `$${CO[0]} \\times ${CO[1]} = ${CO[0] * CO[1]}$`,
      context: {
        formula: `$${CO[0]} = ${powTex(powersOf(CO[0]))}$, $${CO[1]} = ${powTex(powersOf(CO[1]))}$`,
        text: `Aucun nombre premier n’est dans les deux : le plus petit multiple commun est leur produit, ${CO[0] * CO[1]}.`,
      },
      reveals: [],
    },
    {
      id: 'rendez-vous',
      kind: 'method',
      lane: 'center',
      requires: 'traduire-rendez-vous',
      notebook: true,
      title: 'Rendez-vous : traduire, puis revenir',
      subtitle: 'des tours, ou une heure',
      reveals: ['erreur-tours', 'choisir', 'equipes'],
    },
    {
      id: 'erreur-tours',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'traduire-rendez-vous',
      title: 'Les tours échangés',
      subtitle: `roues de ${WH[0]} et de ${WH[1]} dents`,
      context: {
        parts: [
          { role: 'wrong', text: `La roue de ${WH[0]} dents fait ${M_WH / WH[0]} tours.` },
          {
            role: 'why',
            text: `$${M_WH / WH[0]} \\times ${WH[0]} = ${(M_WH / WH[0]) * WH[0]}$ dents… mais ${M_WH / WH[0]} est le nombre de tours de la roue de ${WH[1]} dents : $${M_WH} = ${WH[1]} \\times ${M_WH / WH[1]}$.`,
          },
          {
            role: 'right',
            text: `$${M_WH} = ${WH[0]} \\times ${M_WH / WH[0]} = ${WH[1]} \\times ${M_WH / WH[1]}$ : ${M_WH / WH[0]} tours pour la roue de ${WH[0]} dents, ${M_WH / WH[1]} pour celle de ${WH[1]}.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'choisir',
      kind: 'takeaway',
      lane: 'end',
      requires: 'traduire-rendez-vous',
      title: 'Quel outil ?',
      subtitle: 'un diviseur ou un multiple',
      context: {
        text: `Couper ou partager en morceaux égaux : on cherche un diviseur commun, le plus grand. Faire se retrouver des rythmes : on cherche un multiple commun, le plus petit qui n’est pas 0.`,
        note: `Baguettes de ${GA} cm et de ${GB} cm : des morceaux de ${gcd(GA, GB)} cm. Roues de ${GA} et de ${GB} dents : ${G_L} dents.`,
      },
      reveals: [],
    },
    {
      id: 'equipes',
      kind: 'method',
      lane: 'center',
      requires: 'cinq-equipes',
      notebook: true,
      title: 'Plusieurs rythmes : les jours',
      subtitle: '1 + le plus petit multiple commun',
      reveals: ['erreur-sommeil', 'exemple-equipes'],
    },
    {
      id: 'erreur-sommeil',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'cinq-equipes',
      title: 'Les jours de repos pour cycle',
      subtitle: `repos de ${RE[0]} et de ${RE[1]} jours`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `Le plus petit multiple commun de ${RE[0]} et de ${RE[1]} est ${lcm(...RE)}, donc le jour ${1 + lcm(...RE)}.`,
          },
          {
            role: 'why',
            text: `$${lcm(...RE)} = ${RE_CYCLES[0]} \\times ${Math.floor(lcm(...RE) / RE_CYCLES[0])} + ${lcm(...RE) % RE_CYCLES[0]}$ : le jour ${1 + lcm(...RE)}, la première équipe se repose encore.`,
          },
          {
            role: 'right',
            text: `Les cycles sont ${RE_CYCLES[0]} et ${RE_CYCLES[1]} jours : $${RE_L} = ${RE_CYCLES[0]} \\times ${RE_L / RE_CYCLES[0]} = ${RE_CYCLES[1]} \\times ${RE_L / RE_CYCLES[1]}$, donc le jour ${1 + RE_L}.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-equipes',
      kind: 'example',
      lane: 'end',
      requires: 'cinq-equipes',
      title: `Des équipes qui se reposent ${EQ[0]} et ${EQ[1]} jours`,
      subtitle: `le jour ${1 + EQ_L}`,
      context: {
        formula: `$${EQ_L} = ${EQ_CYCLES[0]} \\times ${EQ_L / EQ_CYCLES[0]} = ${EQ_CYCLES[1]} \\times ${EQ_L / EQ_CYCLES[1]}$`,
        text: `Les cycles sont ${EQ_CYCLES[0]} et ${EQ_CYCLES[1]} jours : elles retravaillent ensemble le jour $1 + ${EQ_L} = ${1 + EQ_L}$.`,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'multiples', to: 'pilier', label: 'Comment le trouver ?' },
    { from: 'pilier', to: 'erreur-produit' },
    { from: 'pilier', to: 'exemple-pilier', label: 'Exemple' },
    { from: 'pilier', to: 'facteurs', label: 'De grands nombres' },
    { from: 'facteurs', to: 'erreur-exposant' },
    { from: 'facteurs', to: 'exemple-facteurs', label: 'Exemple' },
    { from: 'facteurs', to: 'rendez-vous', label: 'Une histoire' },
    { from: 'rendez-vous', to: 'erreur-tours' },
    { from: 'rendez-vous', to: 'choisir', label: 'Quel outil ?' },
    { from: 'rendez-vous', to: 'equipes', label: 'Le calendrier' },
    { from: 'equipes', to: 'erreur-sommeil' },
    { from: 'equipes', to: 'exemple-equipes', label: 'Exemple' },
  ],
});

/** The memo sheets of the four keys, by the module that teaches them (`lesson.config.js`). */
export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: 'pilier-commun',
        type: 'methodes',
        title: 'Multiples communs et plus petit',
        summary:
          'Un multiple commun de deux nombres est un multiple de l’un et de l’autre ; le plus petit qui n’est pas 0 est leur plus petit multiple commun.',
        memo: {
          rule: `m = a \\times k = b \\times l,\\ ${R('m \\neq 0')}\\ \\text{le plus petit}`,
          hook: 'Le premier pilier où les deux équipes finissent pile',
          example: `${M1} = ${P1} \\times ${M1 / P1} = ${P2} \\times ${M1 / P2}`,
          trap: 'Prendre 0, le produit des deux nombres, ou un multiple de l’un seulement',
          exam: 'J’écris les multiples de chaque nombre, j’entoure ceux des deux listes, je garde le plus petit qui n’est pas 0',
          chip: R('m \\neq 0'),
          quiz: [
            {
              q: 'Le plus petit multiple commun non nul de $14$ et de $35$ est :',
              options: [`$${lcm(14, 35)}$`, `$${14 * 35}$`, '$35$'],
              correct: 0,
            },
            { q: 'Un multiple commun de $4$ et de $6$ est :', options: ['$12$', '$10$', '$16$'], correct: 0 },
          ],
        },
      },
    ],
    2: [
      {
        id: 'ppcm-facteurs',
        type: 'regles',
        title: 'Le plus petit multiple commun par les facteurs premiers',
        summary:
          'On décompose les deux nombres ; le plus petit multiple commun est le produit de tous les facteurs premiers vus, chacun avec son plus grand exposant.',
        memo: {
          rule: `p^{e} \\text{ et } p^{f}\\ \\to\\ p^{${R('\\max(e ; f)')}}`,
          hook: 'Tous les facteurs, le plus grand exposant',
          example: `${powTex(POW_EX2[0])}\\ \\text{et}\\ ${powTex(POW_EX2[1])}\\ \\to\\ ${powTex(BIG_EX2)}`,
          trap: 'Ne garder que les facteurs communs, ou le plus petit exposant : c’est la règle du plus grand diviseur commun',
          exam: 'Je décompose, puis je recopie chaque facteur premier vu, avec son plus grand exposant',
          chip: `p^{${R('\\max')}}`,
          quiz: [
            {
              q: 'Le plus petit multiple commun non nul de $2 \\times 3^2$ et de $3 \\times 5$ est :',
              options: ['$2 \\times 3^2 \\times 5$', '$3$', '$2 \\times 3^3 \\times 5^2$'],
              correct: 0,
            },
            {
              q: '$2^3$ et $5^2$ n’ont aucun facteur commun : leur plus petit multiple commun non nul est :',
              options: ['$2^3 \\times 5^2$', '$1$', '$2^3$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'traduire-rendez-vous',
        type: 'methodes',
        title: 'Rendez-vous : traduire, puis revenir à l’histoire',
        summary:
          'Deux rythmes partis ensemble se retrouvent après leur plus petit multiple commun ; chacun s’est alors répété ce nombre divisé par sa propre période.',
        memo: {
          rule: `${R('m')} \\div a \\text{ tours,}\\ ${R('m')} \\div b \\text{ tours}`,
          hook: 'Traduire, résoudre, revenir à l’histoire',
          example: `${G_L} = ${GA} \\times ${G_L / GA} = ${GB} \\times ${G_L / GB}`,
          trap: 'Échanger les tours des deux roues, ou donner une durée quand on demande une heure',
          exam: 'Je cherche le plus petit multiple commun des périodes, je le divise par chaque période, j’ajoute la durée à l’heure de départ',
          chip: `${R('m')} \\div a`,
          quiz: [
            {
              q: 'Deux roues de $12$ et de $18$ dents : quand les marques se retrouvent, la roue de $12$ dents a fait :',
              options: [`$${lcm(12, 18) / 12}$ tours`, `$${lcm(12, 18) / 18}$ tours`, `$${lcm(12, 18)}$ tours`],
              correct: 0,
            },
            {
              q: 'Deux bus partent à $7$ h $00$, toutes les $12$ min et toutes les $15$ min. Ils repartent ensemble à :',
              options: ['$8$ h $00$', '$7$ h $03$', '$7$ h $27$'],
              correct: 0,
            },
          ],
        },
      },
      {
        id: 'cinq-equipes',
        type: 'regles',
        title: 'Plusieurs rythmes : compter les jours',
        summary:
          'Une équipe qui travaille 1 jour puis se repose a un cycle de 1 jour plus ses jours de repos ; toutes travaillent de nouveau le jour 1 plus le plus petit multiple commun des cycles.',
        memo: {
          rule: `\\text{jour} = 1 + ${R('\\text{plus petit multiple commun des cycles}')}`,
          hook: 'Le jour 1, c’est 0 jour écoulé',
          example: `${lcmOf(NUMBERS.days.sleeps.map((s) => s + 1))} = 2^{2} \\times 3 \\times 5`,
          trap: 'Prendre les jours de repos pour le cycle, ou oublier le + 1',
          exam: 'Je calcule le cycle de chaque équipe, leur plus petit multiple commun, puis j’ajoute 1 au jour de départ',
          chip: `1 + ${R('m')}`,
          quiz: [
            {
              q: 'Une équipe travaille $1$ jour puis dort $3$ jours, une autre $1$ jour puis dort $5$ jours. Elles travaillent le jour $1$ : elles retravaillent ensemble le jour :',
              options: [`$${1 + RE_L}$`, `$${1 + lcm(...RE)}$`, `$${RE_L}$`],
              correct: 0,
            },
            {
              q: 'Une équipe qui travaille $1$ jour puis dort $7$ jours a un cycle de :',
              options: ['$8$ jours', '$7$ jours', '$9$ jours'],
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
 * cards a row at most, on the columns 17 %, 50 %, 83 %. Every link joins two consecutive rows going down, so its label sits
 * 8,5 % from both rows, never under a card.
 */
const POSITIONS = {
  multiples: [50, 7],
  pilier: [50, 24],
  'erreur-produit': [17, 41],
  facteurs: [50, 41],
  'exemple-pilier': [83, 41],
  'erreur-exposant': [17, 59],
  'rendez-vous': [50, 59],
  'exemple-facteurs': [83, 59],
  'erreur-tours': [17, 76],
  equipes: [50, 76],
  choisir: [83, 76],
  'erreur-sommeil': [17, 93],
  'exemple-equipes': [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed: the KEY of each question that lost points — each has its
 * card in `ofKey` — then `ex:<id>` for the sheets, which name no kind of exercise: `ofExercise` is empty, and a sheet
 * whose questions carry no key opens `fallback` (the method of K1, the first pillar).
 */
export const CARDS = {
  ofKey: {
    'pilier-commun': 'pilier',
    'ppcm-facteurs': 'facteurs',
    'traduire-rendez-vous': 'rendez-vous',
    'cinq-equipes': 'equipes',
  },
  ofExercise: {},
  fallback: 'pilier',
};
