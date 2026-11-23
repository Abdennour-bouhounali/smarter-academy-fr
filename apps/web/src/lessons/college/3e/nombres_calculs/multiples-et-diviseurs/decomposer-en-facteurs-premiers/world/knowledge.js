/**
 * What the « fiche de connaissances » shows for lesson `decomposer-en-facteurs-premiers` (v2): the lesson's mind map
 * (its cards and their labelled links), the memo sheet of each of its four keys, and where each card sits on the map.
 *
 * Written with the lesson's own numbers (`NUMBERS` of math.js, never retyped) and its decompositions (math.js). The memo
 * items carry the ids of the four KEYS, which is what `pack.coach` and the board's knowledge card name. A card is open
 * when its key is held (`requires` is always a key); a card with `notebook` shows the memo sheet of its key. Card kinds:
 * only those of `kit/text.js`. Every option of a memo quiz is computed by `journey.test.js`.
 */
import {
  NUMBERS,
  frAll,
  isPrime,
  nb,
  powTex,
  powersOf,
  primeFactors,
  productTex,
  stopOf,
  triedPrimes,
  tx,
} from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const { ladder: LD, stop: ST, tool: TL } = NUMBERS;
const [, R72, R1400, R91, R97] = NUMBERS.road;
const F72 = primeFactors(R72.a);
const P72 = powersOf(R72.a);
const P1400 = powersOf(R1400.a);
/** A decomposition of the « same primes » error, away from the last bridge: 2⁴ × 3 does not divide 2³ × 3² × 5. */
const SAME = { n: 360, d: 48 };
const P_SAME = powersOf(SAME.n);
const P_D = powersOf(SAME.d);
const [S7, S13] = primeFactors(R91.a);
const STOP97 = stopOf(R97.a);

export const KNOWLEDGE_GRAPH = frAll({
  root: 'nombre-premier',
  nodes: [
    {
      id: 'nombre-premier',
      kind: 'concept',
      lane: 'center',
      requires: 'plus-petit-premier',
      title: 'Casser un nombre',
      subtitle: 'jusqu’aux morceaux qui ne se cassent plus',
      context: {
        text: `Un nombre comme ${R72.a} se casse en un produit de nombres plus petits : $${R72.a} = 8 \\times 9$. On continue jusqu’à des nombres premiers, qui ne se cassent plus.`,
      },
      reveals: ['rappel', 'echelle'],
    },
    {
      id: 'rappel',
      kind: 'prerequisite',
      lane: 'start',
      requires: 'plus-petit-premier',
      title: 'Nombre premier',
      subtitle: 'exactement deux diviseurs',
      context: {
        text: 'Un nombre premier a exactement deux diviseurs : 1 et lui-même. Les premiers sont 2, 3, 5, 7, 11, 13, 17, 19… ; 1 n’est pas premier.',
      },
      reveals: [],
    },
    {
      id: 'echelle',
      kind: 'method',
      lane: 'center',
      requires: 'plus-petit-premier',
      notebook: true,
      title: 'Décomposer en facteurs premiers',
      subtitle: 'diviser par 2, 3, 5, 7… dans l’ordre',
      reveals: ['erreur-compose', 'puissances', 'exemple-72'],
    },
    {
      id: 'erreur-compose',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'plus-petit-premier',
      title: 'Un produit, mais pas fini',
      subtitle: `$${LD.rounds[0]} = 4 \\times 15$ ?`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${LD.rounds[0]} = 4 \\times 15$ est la décomposition de ${LD.rounds[0]} en facteurs premiers.`,
          },
          {
            role: 'why',
            text: '4 et 15 ne sont pas premiers : $4 = 2 \\times 2$ et $15 = 3 \\times 5$ se cassent encore.',
          },
          { role: 'right', text: `$${LD.rounds[0]} = ${productTex(primeFactors(LD.rounds[0]))}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-72',
      kind: 'example',
      lane: 'end',
      requires: 'plus-petit-premier',
      title: `L’échelle de ${R72.a}`,
      subtitle: `$${R72.a} = ${productTex(F72)}$`,
      context: {
        formula: `$${R72.a} \\div 2 = 36$, $36 \\div 2 = 18$, $18 \\div 2 = 9$, $9 \\div 3 = 3$, $3 \\div 3 = 1$`,
        text: 'On divise par 2 tant que c’est possible, puis par 3 : 4, 6 ou 9 n’ont plus rien à faire.',
      },
      reveals: ['arret'],
    },
    {
      id: 'puissances',
      kind: 'term',
      lane: 'center',
      requires: 'puissances',
      notebook: true,
      title: 'Écrire avec des puissances',
      subtitle: `$${R72.a} = ${powTex(P72)}$`,
      reveals: ['erreur-exposant', 'lire'],
    },
    {
      id: 'erreur-exposant',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'puissances',
      title: 'Lire l’exposant comme un facteur',
      subtitle: '$2^3$ n’est pas $2 \\times 3$',
      context: {
        parts: [
          { role: 'wrong', text: `$${powTex(P72)} = 6 \\times 6 = 36$.` },
          {
            role: 'why',
            text: 'L’exposant dit combien de fois le facteur revient : $2^3 = 2 \\times 2 \\times 2 = 8$.',
          },
          { role: 'right', text: `$${powTex(P72)} = 8 \\times 9 = ${R72.a}$.` },
        ],
      },
      reveals: [],
    },
    {
      id: 'lire',
      kind: 'method',
      lane: 'center',
      requires: 'puissances',
      title: 'Lire une décomposition',
      subtitle: 'qui la divise, et quel quotient',
      context: {
        text: `$d$ divise $N$ quand chaque facteur premier de $d$ est dans $N$ avec un exposant au moins aussi grand. Le quotient garde ce qui reste : $(${powTex(P1400)}) \\div (2 \\times 5) = ${powTex(
          [
            { p: 2, e: 2 },
            { p: 5, e: 1 },
            { p: 7, e: 1 },
          ],
        )} = 140$.`,
      },
      reveals: ['erreur-memes'],
    },
    {
      id: 'erreur-memes',
      kind: 'common_mistake',
      lane: 'start',
      requires: 'puissances',
      title: 'Les mêmes facteurs, donc il divise ?',
      subtitle: `$${powTex(P_D)}$ et $${powTex(P_SAME)}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `${SAME.d} divise ${SAME.n} : $${SAME.d} = ${powTex(P_D)}$ et $${SAME.n} = ${powTex(P_SAME)}$ ont les mêmes facteurs 2 et 3.`,
          },
          { role: 'why', text: `${SAME.d} demande 2 quatre fois, et $${powTex(P_SAME)}$ ne l’a que trois fois.` },
          {
            role: 'right',
            text: `$${SAME.n} = ${SAME.d} \\times ${Math.floor(SAME.n / SAME.d)} + ${SAME.n % SAME.d}$ : ${SAME.d} ne divise pas ${SAME.n}.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'arret',
      kind: 'relationship',
      lane: 'end',
      requires: 'arret',
      notebook: true,
      title: 'Savoir où s’arrêter',
      subtitle: 'tant que le carré ne dépasse pas',
      reveals: ['tableur', 'erreur-91'],
    },
    {
      id: 'erreur-91',
      kind: 'common_mistake',
      lane: 'end',
      requires: 'arret',
      title: `${R91.a} a l’air premier`,
      subtitle: `$${R91.a} = ${S7} \\times ${S13}$`,
      context: {
        parts: [
          { role: 'wrong', text: `2, 3 et 5 ne divisent pas ${R91.a}, donc ${R91.a} est premier.` },
          {
            role: 'why',
            text: `$${S7} \\times ${S7} = ${S7 * S7}$ ne dépasse pas ${R91.a} : il faut encore essayer ${S7}.`,
          },
          { role: 'right', text: `$${R91.a} = ${S7} \\times ${S13}$ : ${R91.a} n’est pas premier.` },
        ],
      },
      reveals: ['exemple-97'],
    },
    {
      id: 'exemple-97',
      kind: 'example',
      lane: 'end',
      requires: 'arret',
      title: `${R97.a} est premier`,
      subtitle: `on essaie ${triedPrimes(R97.a).join(', ')}`,
      context: {
        formula: `$${STOP97 + 1} \\times ${STOP97 + 1} = ${(STOP97 + 1) ** 2}$`,
        text: `${triedPrimes(R97.a).join(', ')} ne divisent pas ${R97.a}, et le carré du nombre premier suivant dépasse ${R97.a} : ${R97.a} est premier.`,
      },
      reveals: [],
    },
    {
      id: 'tableur',
      kind: 'method',
      lane: 'center',
      requires: 'tableur',
      notebook: true,
      title: 'Un tableur pour les grands nombres',
      subtitle: 'la ligne où le reste est 0',
      reveals: ['programme', 'synthese'],
    },
    {
      id: 'programme',
      kind: 'example',
      lane: 'start',
      requires: 'tableur',
      title: 'Un programme qui essaie',
      subtitle: 'd = 2, 3, 4… tant que d × d ⩽ N',
      context: {
        text: 'Le programme essaie d = 2, 3, 4… : si d divise N, il note d et remplace N par N ÷ d ; sinon il passe à d + 1. Il s’arrête quand d × d dépasse N, et note N s’il reste plus grand que 1.',
      },
      reveals: [],
    },
    {
      id: 'synthese',
      kind: 'takeaway',
      lane: 'end',
      requires: 'tableur',
      title: 'L’essentiel',
      subtitle: 'à la main ou avec un outil',
      context: {
        text: `On divise par les nombres premiers dans l’ordre, on écrit le résultat avec des puissances : $${tx(TL.use)} = ${productTex(primeFactors(TL.use))}$, $${tx(R1400.a)} = ${powTex(P1400)}$.`,
        note: `On s’arrête quand le carré du diviseur dépasse le quotient : ${nb(ST.use)} n’est pas premier, $${ST.use} = ${productTex(primeFactors(ST.use))}$.`,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'nombre-premier', to: 'rappel', label: 'Rappel' },
    { from: 'nombre-premier', to: 'echelle', label: 'Comment casser ?' },
    { from: 'echelle', to: 'erreur-compose' },
    { from: 'echelle', to: 'puissances', label: 'Écrire plus court' },
    { from: 'echelle', to: 'exemple-72', label: 'Exemple' },
    { from: 'puissances', to: 'erreur-exposant' },
    { from: 'puissances', to: 'lire', label: 'À quoi ça sert ?' },
    { from: 'exemple-72', to: 'arret', label: 'Et pour un premier ?' },
    { from: 'lire', to: 'erreur-memes' },
    { from: 'arret', to: 'tableur', label: 'Les grands nombres' },
    { from: 'arret', to: 'erreur-91' },
    { from: 'erreur-91', to: 'exemple-97', label: 'Un vrai premier' },
    { from: 'tableur', to: 'programme', label: 'Exemple' },
    { from: 'tableur', to: 'synthese', label: 'En résumé' },
  ],
});

/** The memo sheets of the four keys, by the module that teaches them (`lesson.config.js`). */
const P495 = powersOf(LD.rounds[2]);
export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: 'plus-petit-premier',
        type: 'methodes',
        title: 'Décomposer en facteurs premiers',
        summary:
          'On divise par le plus petit nombre premier qui divise le nombre, autant de fois qu’il le divise, puis par le suivant, jusqu’au quotient 1.',
        memo: {
          rule: `n \\div 2,\\ \\div 2,\\ \\ldots,\\ \\div 3,\\ \\ldots \\ \\to\\ ${R('1')}`,
          hook: 'Toujours le plus petit nombre premier qui tombe juste, et on recommence',
          example: `${LD.use} = ${productTex(primeFactors(LD.use))}`,
          trap: 'S’arrêter sur un facteur qui n’est pas premier, comme 4, 6 ou 15',
          exam: 'J’écris une colonne de divisions par 2, 3, 5, 7… jusqu’au quotient 1',
          chip: R('2, 3, 5, 7\\ldots'),
          quiz: [
            {
              q: `Quel est le premier nombre premier qui divise $${LD.rounds[2]}$ ?`,
              options: ['$2$', '$3$', '$5$'],
              correct: 1,
            },
            {
              q: `$${LD.rounds[0]} = 2 \\times 30$. Par quoi divise-t-on 30 ensuite ?`,
              options: ['$2$', '$3$', '$6$'],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: 'puissances',
        type: 'regles',
        title: 'Écrire avec des puissances',
        summary:
          'Un facteur premier qui revient plusieurs fois s’écrit une seule fois, avec en exposant le nombre de fois ; les facteurs sont rangés du plus petit au plus grand.',
        memo: {
          rule: `2 \\times 2 \\times 2 = 2^{${R('3')}}`,
          hook: 'L’exposant compte les fois',
          example: `${tx(R1400.a)} = ${powTex(P1400)}`,
          trap: 'Lire 2³ comme 2 × 3, ou poser l’exposant sur le mauvais facteur',
          exam: 'Je compte combien de fois chaque nombre premier revient dans ma colonne de divisions',
          chip: `p^{${R('k')}}`,
          quiz: [
            {
              q: `$${LD.rounds[2]} = ${productTex(primeFactors(LD.rounds[2]))}$ s’écrit :`,
              options: [`$${powTex(P495)}$`, '$3 \\times 2 \\times 5 \\times 11$', '$6 \\times 5 \\times 11$'],
              correct: 0,
            },
            {
              q: `Que vaut $${powTex(P72)}$ ?`,
              options: ['$36$', `$${R72.a}$`, '$30$'],
              correct: 1,
            },
          ],
        },
      },
    ],
    3: [
      {
        id: 'arret',
        type: 'regles',
        title: 'Savoir où s’arrêter',
        summary:
          'Pour savoir si n est premier, on essaie les nombres premiers 2, 3, 5, 7… tant que leur carré ne dépasse pas n ; si aucun ne divise n, n est premier.',
        memo: {
          rule: `p \\times p > n\\ \\Rightarrow\\ ${R('\\text{stop}')}`,
          hook: 'Après le carré, chaque diviseur aurait un partenaire déjà essayé',
          example: `${R91.a} = ${S7} \\times ${S13}`,
          trap: `Conclure trop tôt que ${R91.a} est premier, ou essayer jusqu’à n ÷ 2`,
          exam: 'Je note les nombres premiers dont le carré ne dépasse pas n, et j’essaie chacun',
          chip: `p \\times p \\leqslant ${R('n')}`,
          quiz: [
            {
              q: `Pour savoir si $${R97.a}$ est premier, on essaie les divisions par :`,
              options: ['$2, 3, 5, 7$', '$2, 3, 5, 7, 11$', 'tous les nombres jusqu’à $48$'],
              correct: 0,
            },
            {
              q: `$${ST.use}$ est-il premier ?`,
              options: isPrime(ST.use) ? ['oui', 'non'] : ['non', 'oui'],
              correct: 0,
            },
          ],
        },
      },
    ],
    4: [
      {
        id: 'tableur',
        type: 'methodes',
        title: 'Un outil pour les grands nombres',
        summary:
          'Un tableur ou un programme calcule les restes des divisions par 2, 3, 5, 7… : on lit la première ligne où le reste est 0, on divise, et on recommence sur le quotient.',
        memo: {
          rule: `\\text{reste de } n \\div p = ${R('0')}\\ \\Rightarrow\\ p \\text{ divise } n`,
          hook: 'Le tableur calcule, toi tu lis',
          example: `${tx(TL.rounds[0])} = ${productTex(primeFactors(TL.rounds[0]))}`,
          trap: 'Croire qu’un grand nombre qui finit par 1, 3, 7 ou 9 est premier',
          exam: 'Je recopie la ligne du reste 0, la division, puis je continue sur le quotient',
          chip: `\\texttt{MOD} = ${R('0')}`,
          quiz: [
            {
              q: `La cellule $\\texttt{=MOD(${TL.rounds[0]};11)}$ affiche :`,
              options: ['$0$', '$1$', '$221$'],
              correct: 0,
            },
            {
              q: `$${tx(TL.rounds[2])} = 53 \\times 59$. Le tableur s’arrête :`,
              options: ['à la ligne de 53', 'à la ligne de 59', `à la ligne de $${tx(TL.rounds[2])}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
  }),
};

/**
 * Where each node sits on the MAP (percent of the map box, drawn left to right): SIX rows (5, 23, 41, 59, 76, 93), three
 * cards a row at most, on the columns 17 %, 50 %, 83 % — the rows and columns the walks measured on the Algerian lessons
 * (a card is at most 15rem wide: at 17 % / 83 % it stays inside the box at 1366×768). Every link joins two NEIGHBOUR
 * rows, so its label sits at least 8.5 % from both rows, never under a card. French titles are longer than the Arabic
 * ones these rows were measured with: the walk looks at this map first (not verified).
 */
const POSITIONS = {
  'nombre-premier': [50, 5],
  rappel: [17, 23],
  echelle: [50, 23],
  'erreur-compose': [17, 41],
  puissances: [50, 41],
  'exemple-72': [83, 41],
  'erreur-exposant': [17, 59],
  lire: [50, 59],
  arret: [83, 59],
  'erreur-memes': [17, 76],
  tableur: [50, 76],
  'erreur-91': [83, 76],
  programme: [17, 93],
  synthese: [50, 93],
  'exemple-97': [83, 93],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed (for `world/index.js › lesson.cards`, wave 2): the KEY of
 * each question that lost points — each has its card in `ofKey` — then `ex:<id>` for the sheets, which name no kind of
 * exercise: `ofExercise` is empty, and a sheet whose questions carry no key opens `fallback` (the method of key 1, the
 * procedure most of the bank asks).
 */
export const CARDS = {
  ofKey: { 'plus-petit-premier': 'echelle', puissances: 'puissances', arret: 'arret', tableur: 'tableur' },
  ofExercise: {},
  fallback: 'echelle',
};
