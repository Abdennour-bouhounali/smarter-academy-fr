/**
 * What the « fiche de connaissances » shows for lesson `triangles-semblables` (v2): the lesson's mind map (its cards and
 * their labelled links), the memo sheet of each of its two keys, and where each card sits on the map.
 *
 * Written with the platform's own figures (`math.js › FIGURES`, never the story's nor the bank's): the triangles ABC
 * (4 ; 5 ; 6) and DEF (6 ; 7,5 ; 9), k = 3/2 for the sides' cards; the angles 49° ; 58° ; 73° and the pair 25° ; 53° ; 102°
 * against 25° ; 74° ; 81° for the angles' cards. The map comes AFTER the forges: it may say « semblables », « homologues »,
 * « coefficient ». A card opens when its key is held (`requires` is always a key); a card with `notebook` shows the memo
 * sheet of its key. Card kinds: only those of `kit/text.js`. Every number a card states is computed from its figure, and
 * checked again in `journey.test.js`. The cards `coefficient` and `agrandir` are DZ's `muamil` and `takbir`, rebuilt on two
 * separate triangles (port map § 8bis).
 */
import { FIGURES, K, frAll, minus, over, plus, read, tex, times, write } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const fr = (a, b) => `\\dfrac{${a}}{${b}}`;
/** A ratio a / b as a formula over a real bar, reduced: « \\dfrac{3}{2} ». */
const k = (a, b) => {
  const { n, d } = read(write(over(a, b)));
  return d === 1n ? String(n) : `\\dfrac{${n}}{${d}}`;
};

/** The two triangles of the sides' cards: ABC = (a1 ; a2 ; a3) ascending, DEF = (b1 ; b2 ; b3), k = b ÷ a. */
const S = FIGURES.sides[0];
const [a1, a2, a3] = S.a;
const [b1, b2, b3] = S.b;
const KS = k(b1, a1);
/** The inverse coefficient, DEF to ABC. */
const KBACK = k(a1, b1);
/** EF from the side a2 and k: 5 × 3/2. */
const EF = write(times(a2, S.k));
/** The angles of the cards. */
const [d1, d2] = FIGURES.angles.similar[0];
const THIRD = write(minus(minus('180', d1), d2));
const [[o1, o2, o3], [, p2, p3]] = FIGURES.angles.other[0];

export const KNOWLEDGE_GRAPH = frAll({
  root: 'forme',
  nodes: [
    {
      id: 'forme',
      kind: 'concept',
      lane: 'center',
      requires: K.cotes,
      title: 'Deux triangles de même forme',
      subtitle: 'des triangles semblables',
      context: {
        text: 'Deux triangles semblables ont la même forme : l’un est l’autre agrandi ou réduit, posé n’importe où, tourné ou retourné. Il n’a pas besoin de partager un sommet avec l’autre.',
      },
      reveals: ['cotes'],
    },
    {
      id: 'cotes',
      kind: 'definition',
      lane: 'center',
      requires: K.cotes,
      notebook: true,
      title: 'Les côtés proportionnels',
      subtitle: `$${fr('DE', 'AB')} = ${fr('EF', 'BC')} = ${fr('FD', 'CA')}$`,
      context: {
        text: `Les triangles de côtés ${a1} ; ${a2} ; ${a3} et ${b1} ; ${tex(b2)} ; ${b3} sont semblables : $${fr(b1, a1)} = ${fr(tex(b2), a2)} = ${fr(b3, a3)} = ${KS}$.`,
      },
      reveals: ['rang', 'coefficient', 'ordre-des-noms'],
    },
    {
      id: 'rang',
      kind: 'method',
      lane: 'start',
      requires: K.cotes,
      title: 'Ranger les côtés',
      subtitle: 'du plus petit au plus grand',
      context: {
        text: `On range les côtés de chaque triangle du plus petit au plus grand : $${a1} < ${a2} < ${a3}$ et $${b1} < ${tex(b2)} < ${b3}$. Le plus petit va avec le plus petit, le plus grand avec le plus grand.`,
      },
      reveals: ['exemple-cote'],
    },
    {
      id: 'coefficient',
      kind: 'definition',
      lane: 'center',
      requires: K.cotes,
      title: 'Le coefficient',
      subtitle: `$k = ${fr('DE', 'AB')}$`,
      context: {
        text: 'Le coefficient $k$ est le quotient de deux côtés homologues : tous les côtés du second triangle sont ceux du premier multipliés par le même nombre $k$.',
      },
      reveals: ['agrandir'],
    },
    {
      id: 'ordre-des-noms',
      kind: 'common_mistake',
      lane: 'end',
      requires: K.cotes,
      title: 'L’ordre des noms',
      subtitle: `$${fr('DE', 'AB')} = ${fr('EF', 'BC')}$`,
      context: {
        parts: [
          {
            role: 'wrong',
            text: `$${fr('DE', 'AB')} = ${fr('EF', 'BC')} = ${fr('FD', 'CA')}$ avec $AB = ${a3}$, $BC = ${a1}$, $CA = ${a2}$`,
          },
          {
            role: 'why',
            text: `$${fr(b1, a3)}$ vaut $1$, mais $${fr(b3, a2)}$ ne vaut pas $1$ : les noms ne rangent pas les côtés par taille. $DE$ est le plus petit côté de $DEF$, il va avec $BC$.`,
          },
          {
            role: 'right',
            text: `$${fr('DE', 'BC')} = ${fr('EF', 'CA')} = ${fr('FD', 'AB')} = ${KS}$ : $${fr(b1, a1)} = ${fr(tex(b2), a2)} = ${fr(b3, a3)}$.`,
          },
        ],
      },
      reveals: ['angles'],
    },
    {
      id: 'exemple-cote',
      kind: 'example',
      lane: 'start',
      requires: K.cotes,
      title: 'Calculer un côté',
      subtitle: `$${a2} \\times ${KS} = ${tex(EF)}$`,
      context: {
        text: `$k = ${fr(b1, a1)} = ${KS}$ : le côté moyen de $DEF$ mesure $${a2} \\times ${KS} = ${tex(EF)}$, car le côté moyen de $ABC$ mesure $${a2}$.`,
      },
      reveals: [],
    },
    {
      id: 'agrandir',
      kind: 'example',
      lane: 'center',
      requires: K.cotes,
      title: 'Agrandir ou réduire',
      subtitle: `$k = ${KS}$`,
      context: {
        list: [
          `De $ABC$ à $DEF$ : $${fr(b1, a1)} = ${KS}$, plus grand que $1$ : un agrandissement.`,
          `De $DEF$ à $ABC$ : $${fr(a1, b1)} = ${KBACK}$, plus petit que $1$ : une réduction.`,
        ],
      },
      reveals: [],
    },
    {
      id: 'angles',
      kind: 'definition',
      lane: 'end',
      requires: K.angles,
      notebook: true,
      title: 'Deux angles égaux',
      subtitle: '$\\widehat{A} = \\widehat{D}$ et $\\widehat{B} = \\widehat{E}$',
      context: {
        text: 'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, les deux triangles sont semblables : on n’a plus besoin de mesurer les côtés.',
      },
      reveals: ['homologues', 'troisieme', 'un-angle'],
    },
    {
      id: 'homologues',
      kind: 'method',
      lane: 'start',
      requires: K.angles,
      title: 'Les sommets homologues',
      subtitle: 'un angle égal, un sommet associé',
      context: {
        text: 'Deux sommets sont homologues quand leurs angles sont égaux. Le côté opposé à un angle est homologue du côté opposé à l’angle égal.',
      },
      reveals: [],
    },
    {
      id: 'troisieme',
      kind: 'prerequisite',
      lane: 'center',
      requires: K.angles,
      title: 'Le troisième angle',
      subtitle: '$180^\\circ - a - b$',
      context: {
        text: `La somme des angles d’un triangle vaut $180^\\circ$ : avec $${d1}^\\circ$ et $${d2}^\\circ$, le troisième angle est $180 - ${d1} - ${d2} = ${THIRD}$ degrés.`,
      },
      reveals: [],
    },
    {
      id: 'un-angle',
      kind: 'common_mistake',
      lane: 'end',
      requires: K.angles,
      title: 'Un seul angle ne suffit pas',
      subtitle: `$${o1}^\\circ$ en commun`,
      context: {
        parts: [
          { role: 'wrong', text: `Deux triangles ont un angle de $${o1}^\\circ$ : ils sont semblables.` },
          {
            role: 'why',
            text: `Leurs deux autres angles valent $${o2}^\\circ$ et $${o3}^\\circ$ d’un côté, $${p2}^\\circ$ et $${p3}^\\circ$ de l’autre : ils ne sont pas égaux, les triangles n’ont pas la même forme.`,
          },
          { role: 'right', text: 'Il faut deux angles égaux, pas un seul.' },
        ],
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'forme', to: 'cotes', label: 'Les côtés' },
    { from: 'cotes', to: 'rang', label: 'Comment ?' },
    { from: 'cotes', to: 'coefficient', label: 'Le nombre k' },
    { from: 'cotes', to: 'ordre-des-noms', label: 'Erreur fréquente' },
    { from: 'rang', to: 'exemple-cote', label: 'Exemple' },
    { from: 'coefficient', to: 'agrandir' },
    { from: 'ordre-des-noms', to: 'angles', label: 'Autre moyen' },
    { from: 'angles', to: 'homologues' },
    { from: 'angles', to: 'troisieme' },
    { from: 'angles', to: 'un-angle' },
  ],
});

export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: K.cotes,
        type: 'regles',
        title: 'Des triangles semblables : leurs côtés',
        summary:
          'Deux triangles sont semblables quand les longueurs de leurs côtés sont proportionnelles : on range les côtés de chacun du plus petit au plus grand, et les trois quotients sont égaux. Les côtés associés sont homologues.',
        memo: {
          rule: `\\dfrac{DE}{${R('AB')}} = \\dfrac{EF}{${R('BC')}} = \\dfrac{FD}{${R('CA')}}`,
          hook: 'On range les côtés du plus petit au plus grand, puis on divise',
          example: `${fr(b1, a1)} = ${fr(tex(b2), a2)} = ${fr(b3, a3)} = ${KS}`,
          trap: 'Associer les côtés dans l’ordre de leurs noms au lieu de l’ordre de leurs tailles',
          exam: 'Je range les côtés de chaque triangle, je vérifie que les trois quotients sont égaux, j’en déduis que les triangles sont semblables',
          chip: `${R('petit')} \\leftrightarrow ${R('petit')}`,
          quiz: [
            {
              q: `Les triangles $ABC$ et $DEF$ ont pour côtés ${a1} ; ${a2} ; ${a3} et ${b1} ; ${tex(b2)} ; ${b3}. Que vaut $k$, de $ABC$ à $DEF$ ?`,
              options: [`$${KS}$`, `$${KBACK}$`, `$${k(String(Number(b1) - Number(a1)), '1')}$`],
              correct: 0,
            },
            {
              q: `Le plus petit côté d’un triangle mesure $${a1}$ et celui d’un triangle semblable $${b1}$. Le plus grand côté du premier mesure $${a3}$ : combien mesure le plus grand du second ?`,
              options: [`$${b3}$`, `$${Number(a3) + Number(b1) - Number(a1)}$`, `$${a1}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: K.angles,
        type: 'methodes',
        title: 'Des triangles semblables : leurs angles',
        summary:
          'Si deux angles d’un triangle sont égaux à deux angles d’un autre triangle, alors les deux triangles sont semblables. Le troisième angle est égal aussi, car la somme des angles d’un triangle vaut 180°.',
        memo: {
          rule: `${R('\\widehat{A} = \\widehat{D}')} \\ \\text{et} \\ ${R('\\widehat{B} = \\widehat{E}')}`,
          hook: 'Deux angles égaux suffisent',
          example: `180^\\circ - ${d1}^\\circ - ${d2}^\\circ = ${THIRD}^\\circ`,
          trap: 'Croire qu’un seul angle égal suffit',
          exam: 'Je cherche deux angles égaux, je calcule le troisième avec 180°, puis je conclus : les deux triangles sont semblables',
          chip: `${R('\\widehat{A}')} = ${R('\\widehat{D}')}`,
          quiz: [
            {
              q: `Deux angles d’un triangle mesurent $${d1}^\\circ$ et $${d2}^\\circ$. Que mesure le troisième, en degrés ?`,
              options: [`$${THIRD}$`, `$${write(plus(d1, d2))}$`, `$${write(minus(d2, d1))}$`],
              correct: 0,
            },
            {
              q: `Deux triangles ont un angle égal de $${d1}^\\circ$. Que faut-il de plus pour qu’ils soient semblables ?`,
              options: ['un second angle égal', 'un côté de même longueur', 'rien de plus'],
              correct: 0,
            },
          ],
        },
      },
    ],
  }),
};

/**
 * Where each node sits on the MAP (percent of the map box): five rows (9, 26, 43, 65, 86), three cards a row at most, on
 * the columns 17 %, 50 %, 83 % (lesson 1's measured grid). Every link joins two NEIGHBOUR rows, so its label sits at least
 * 8,5 % from both rows; the labels of one row stand 137 px apart at least.
 */
const POSITIONS = {
  forme: [50, 9],
  cotes: [50, 26],
  rang: [17, 43],
  coefficient: [50, 43],
  'ordre-des-noms': [83, 43],
  'exemple-cote': [17, 65],
  agrandir: [50, 65],
  angles: [83, 65],
  homologues: [17, 86],
  troisieme: [50, 86],
  'un-angle': [83, 86],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed (`world/index.js › lesson.cards`): the KEY of each question
 * that lost points — each has its card in `ofKey` — then `ex:<id>` for the sheets; a sheet whose questions carry no key
 * opens `fallback`, the method most of the bank asks.
 */
export const CARDS = {
  ofKey: { [K.cotes]: 'cotes', [K.angles]: 'angles' },
  ofExercise: {},
  fallback: 'exemple-cote',
};
