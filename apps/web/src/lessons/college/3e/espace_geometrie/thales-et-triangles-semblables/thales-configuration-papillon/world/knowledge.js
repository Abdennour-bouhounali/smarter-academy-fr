/**
 * What the « fiche de connaissances » shows for lesson `thales-configuration-papillon` (v2): the lesson's mind map (its
 * cards and their labelled links), the memo sheet of each of its two keys, and where each card sits on the map.
 *
 * Written with the platform's own figures (`math.js › FIGURES`, never the story's nor the bank's): the butterfly
 * O A E / B F with OA = 30, OE = 40, OB = 21, OF = 28, AB = 19,5, EF = 26 (k = 3/4; AE = 70 across), the nested figure
 * A M B / N C with AM = 31, MB = 15,5, AB = 46,5 (k = 2/3). The map comes AFTER the forges: it may say « Thalès »,
 * « papillon », « depuis le sommet ». A card opens when its key is held (`requires` is always a key); a card with
 * `notebook` shows the memo sheet of its key. Card kinds: only those of `kit/text.js`. Every number a card states is
 * computed from its figure, and checked again in `knowledge.test.js`.
 */
import { FIGURES, K, frAll, minus, over, plus, tex, times, write } from './math';

/** What CHANGES in a rule of the memo sheet (red). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;
const fr = (a, b) => `\\dfrac{${a}}{${b}}`;
/** A ratio a / b as a formula over a real bar, reduced: « \\dfrac{3}{4} ». */
const k = (a, b) => tex(over(a, b));

/** The butterfly of the map, as O A E / B F: OA = VM, OE = VB, OB = VN, OF = VC, AB = MN, EF = BC. */
const B = FIGURES.butterfly[1];
const AE = write(plus(B.VM, B.VB));
/** The inverted ratio's OF: OB × OA / OE. */
const INVERTED = write(over(times(B.VN, B.VM), B.VB));
/** The additive slip: OB + OE − OA. */
const ADDED = write(minus(plus(B.VN, B.VB), B.VM));
/** The nested figure of the map, as A M B / N C. */
const N = FIGURES.nested[1];
const MB = write(minus(N.VB, N.VM));

export const KNOWLEDGE_GRAPH = frAll({
  root: 'papillon',
  nodes: [
    {
      id: 'papillon',
      kind: 'concept',
      lane: 'center',
      requires: K.papillon,
      title: 'La configuration du papillon',
      subtitle: '$(AB) \\parallel (EF)$',
      context: {
        text: 'Les droites $(AE)$ et $(BF)$ se coupent en $O$, et $(AB) \\parallel (EF)$ : les triangles $OAB$ et $OEF$ sont opposés par le sommet $O$, comme les deux ailes d’un papillon.',
      },
      reveals: ['demi-tour', 'trois-rapports', 'produit-en-croix'],
    },
    {
      id: 'demi-tour',
      kind: 'relationship',
      lane: 'start',
      requires: K.papillon,
      title: 'Le demi-tour',
      subtitle: 'autour du point d’intersection',
      context: {
        text: 'Un demi-tour autour de $O$ envoie $A$ sur la droite $(OE)$ et $B$ sur la droite $(OF)$ : le petit triangle se pose dans le grand, et on retrouve les triangles emboîtés de la 4e.',
      },
      reveals: [],
    },
    {
      id: 'trois-rapports',
      kind: 'definition',
      lane: 'center',
      requires: K.papillon,
      notebook: true,
      title: 'Les trois rapports égaux',
      subtitle: `$${fr('OA', 'OE')} = ${fr('OB', 'OF')} = ${fr('AB', 'EF')}$`,
      reveals: ['partenaire', 'redaction', 'exemple-papillon'],
    },
    {
      id: 'produit-en-croix',
      kind: 'prerequisite',
      lane: 'end',
      requires: K.papillon,
      title: 'Les produits en croix',
      subtitle: '$\\dfrac{a}{b} = \\dfrac{c}{d}$',
      context: {
        text: `$\\dfrac{a}{b} = \\dfrac{c}{d}$ veut dire $a \\times d = b \\times c$ : $${fr(B.VM, B.VB)} = ${fr(B.VN, B.VC)}$ car $${B.VM} \\times ${B.VC} = ${B.VB} \\times ${B.VN}$.`,
      },
      reveals: [],
    },
    {
      id: 'partenaire',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.papillon,
      title: 'Le partenaire d’en face',
      subtitle: '$\\dfrac{OA}{OE} = \\dfrac{OF}{OB}$',
      context: {
        parts: [
          { role: 'wrong', text: '$\\dfrac{OA}{OE} = \\dfrac{OF}{OB}$' },
          {
            role: 'why',
            text: `$${fr(B.VM, B.VB)} = ${k(B.VM, B.VB)}$ mais $${fr(B.VC, B.VN)} = ${k(B.VC, B.VN)}$ : chaque longueur va avec celle de la même droite, $OA$ avec $OE$ et $OB$ avec $OF$.`,
          },
          // the corrected writing, the part the knowledge card shows last (the walk waits for it, `is-right`)
          {
            role: 'right',
            text: `$\\dfrac{OA}{OE} = \\dfrac{OB}{OF}$ : $${fr(B.VM, B.VB)} = ${fr(B.VN, B.VC)} = ${k(B.VM, B.VB)}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'redaction',
      kind: 'method',
      lane: 'center',
      requires: K.papillon,
      title: 'La rédaction au brevet',
      subtitle: 'alignés, parallèles, puis Thalès',
      context: {
        text: 'Les points $A$, $O$, $E$ sont alignés, ainsi que les points $B$, $O$, $F$ ; les droites $(AB)$ et $(EF)$ sont parallèles. D’après le théorème de Thalès : $\\dfrac{OA}{OE} = \\dfrac{OB}{OF} = \\dfrac{AB}{EF}$.',
      },
      reveals: ['depuis-le-sommet'],
    },
    {
      id: 'exemple-papillon',
      kind: 'example',
      lane: 'end',
      requires: K.papillon,
      title: 'Un rapport dans le papillon',
      subtitle: `$\\dfrac{OB}{OF} = ${k(B.VM, B.VB)}$`,
      context: {
        text: `$OA = ${B.VM}$ et $OE = ${B.VB}$ : $\\dfrac{OB}{OF} = \\dfrac{OA}{OE} = ${fr(B.VM, B.VB)} = ${k(B.VM, B.VB)}$.`,
      },
      reveals: [],
    },
    {
      id: 'depuis-le-sommet',
      kind: 'method',
      lane: 'center',
      requires: K.calcul,
      notebook: true,
      title: 'Calculer une longueur dans le papillon',
      subtitle: 'chaque longueur part du sommet',
      reveals: ['a-travers', 'exemple-calcul', 'emboites'],
    },
    {
      id: 'a-travers',
      kind: 'common_mistake',
      lane: 'start',
      requires: K.calcul,
      title: 'La longueur qui traverse',
      subtitle: '$\\dfrac{OA}{AE}$',
      context: {
        parts: [
          { role: 'wrong', text: '$\\dfrac{OA}{AE} = \\dfrac{AB}{EF}$' },
          {
            role: 'why',
            text: `$${fr(B.VM, AE)} = ${k(B.VM, AE)}$ mais $${fr(tex(B.MN), B.BC)} = ${k(B.MN, B.BC)}$ : $AE$ traverse $O$. Depuis $O$ : $OE = AE - OA = ${AE} - ${B.VM} = ${B.VB}$.`,
          },
          {
            role: 'right',
            text: `$\\dfrac{OA}{OE} = \\dfrac{AB}{EF}$ : $${fr(B.VM, B.VB)} = ${fr(tex(B.MN), B.BC)} = ${k(B.VM, B.VB)}$.`,
          },
        ],
      },
      reveals: [],
    },
    {
      id: 'exemple-calcul',
      kind: 'example',
      lane: 'center',
      requires: K.calcul,
      title: 'Calculer OF',
      subtitle: `$OF = ${B.VC}$`,
      context: {
        text: `$OA = ${B.VM}$, $OE = ${B.VB}$ et $OB = ${B.VN}$ : $${fr(B.VM, B.VB)} = ${fr(B.VN, 'OF')}$, donc $OF = ${fr(`${B.VB} \\times ${B.VN}`, B.VM)} = ${B.VC}$.`,
      },
      reveals: [],
    },
    {
      id: 'emboites',
      kind: 'prerequisite',
      lane: 'end',
      requires: K.calcul,
      title: 'Dans les triangles emboîtés',
      subtitle: '$AB = AM + MB$',
      context: {
        text: `Dans les triangles emboîtés, le grand côté part aussi du sommet : $AB = AM + MB = ${N.VM} + ${tex(MB)} = ${tex(N.VB)}$, et $\\dfrac{AM}{AB} = ${fr(N.VM, tex(N.VB))} = ${k(N.VM, N.VB)}$.`,
      },
      reveals: [],
    },
  ],
  edges: [
    { from: 'papillon', to: 'demi-tour', label: 'Pourquoi ?' },
    { from: 'papillon', to: 'trois-rapports', label: 'Les rapports' },
    { from: 'papillon', to: 'produit-en-croix', label: 'Rappel' },
    { from: 'trois-rapports', to: 'partenaire' },
    { from: 'trois-rapports', to: 'redaction', label: 'Au brevet' },
    { from: 'trois-rapports', to: 'exemple-papillon', label: 'Exemple' },
    { from: 'redaction', to: 'depuis-le-sommet', label: 'Calculer' },
    { from: 'depuis-le-sommet', to: 'a-travers' },
    { from: 'depuis-le-sommet', to: 'exemple-calcul', label: 'Exemple' },
    { from: 'depuis-le-sommet', to: 'emboites', label: 'En 4e' },
  ],
});

export const LESSON_KNOWLEDGE = {
  modules: frAll({
    1: [
      {
        id: K.papillon,
        type: 'regles',
        title: 'Le théorème de Thalès dans le papillon',
        summary:
          'Si les droites (AE) et (BF) se coupent en un point et si (AB) et (EF) sont parallèles, alors les trois rapports OA sur OE, OB sur OF et AB sur EF sont égaux : chaque longueur va avec celle de la même droite, de l’autre côté du point d’intersection.',
        memo: {
          rule: `\\dfrac{OA}{${R('OE')}} = \\dfrac{OB}{${R('OF')}} = \\dfrac{AB}{EF}`,
          hook: 'Chaque longueur avec celle de la même droite, de l’autre côté du point d’intersection',
          example: `${fr(B.VM, B.VB)} = ${fr(B.VN, B.VC)} = ${fr(tex(B.MN), B.BC)}`,
          trap: 'Associer une longueur à celle qui lui fait face sur la figure, ou prendre une longueur qui traverse le point d’intersection',
          exam: 'J’écris que les points sont alignés et que les droites sont parallèles, puis : d’après le théorème de Thalès…',
          chip: `${R('OA')} \\leftrightarrow ${R('OE')}`,
          quiz: [
            {
              q: 'Dans le papillon de sommet $O$, à quel rapport $\\dfrac{OA}{OE}$ est-il égal ?',
              options: ['$\\dfrac{OB}{OF}$', '$\\dfrac{OF}{OB}$', '$\\dfrac{OA}{AE}$'],
              correct: 0,
            },
            {
              q: `$OA = ${B.VM}$ et $OE = ${B.VB}$. Que vaut $\\dfrac{OB}{OF}$ ?`,
              options: [`$${k(B.VM, B.VB)}$`, `$${k(B.VB, B.VM)}$`, `$${k(B.VM, AE)}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
    2: [
      {
        id: K.calcul,
        type: 'methodes',
        title: 'Calculer une longueur dans le papillon',
        summary:
          'Chaque longueur part du sommet : on recolle les morceaux ou on enlève celui d’en face, puis on garde deux rapports avec l’inconnue et on fait les produits en croix.',
        memo: {
          rule: `${R('OE')} = AE - OA \\quad \\dfrac{OA}{${R('OE')}} = \\dfrac{OB}{OF}`,
          hook: 'Chaque longueur part du sommet',
          example: `OF = ${fr(`${B.VB} \\times ${B.VN}`, B.VM)} = ${B.VC}`,
          trap: 'Mettre dans un rapport la longueur qui traverse le sommet, comme AE au lieu de OE',
          exam: 'Je calcule d’abord la longueur depuis le sommet, puis j’écris deux rapports avec l’inconnue et je fais les produits en croix',
          chip: `${R('OE')} = AE - OA`,
          quiz: [
            {
              q: `$OA = ${B.VM}$ et $AE = ${AE}$, avec $O$ sur $[AE]$. Que vaut $OE$ ?`,
              options: [`$${B.VB}$`, `$${AE}$`, `$${write(plus(AE, B.VM))}$`],
              correct: 0,
            },
            {
              q: `$OA = ${B.VM}$, $OE = ${B.VB}$ et $OB = ${B.VN}$. Que vaut $OF$ ?`,
              options: [`$${B.VC}$`, `$${tex(INVERTED)}$`, `$${tex(ADDED)}$`],
              correct: 0,
            },
          ],
        },
      },
    ],
  }),
};

/**
 * Where each node sits on the MAP (percent of the map box): five rows (9, 26, 43, 65, 86), three cards a row at most,
 * on the columns 17 %, 50 %, 83 % (lesson 1's measured grid). Every link joins two NEIGHBOUR rows, so its label sits at
 * least 8,5 % from both rows. Walked 2026-11-24: at 5 the root's card left the map's top, and the three-line card of the
 * method (« Calculer une longueur dans le papillon ») at 59 stood over the labels of its links; the gaps around it are
 * wider.
 */
const POSITIONS = {
  papillon: [50, 9],
  'demi-tour': [17, 26],
  'trois-rapports': [50, 26],
  'produit-en-croix': [83, 26],
  partenaire: [17, 43],
  redaction: [50, 43],
  'exemple-papillon': [83, 43],
  'depuis-le-sommet': [50, 65],
  'a-travers': [17, 86],
  'exemple-calcul': [50, 86],
  emboites: [83, 86],
};

export const KNOWLEDGE = { graph: KNOWLEDGE_GRAPH, modules: LESSON_KNOWLEDGE.modules, positions: POSITIONS };

/**
 * Which card of the knowledge map trains what a sitting missed (`world/index.js › lesson.cards`): the KEY of each
 * question that lost points — each has its card in `ofKey` — then `ex:<id>` for the sheets; a sheet whose questions
 * carry no key (P2's: no key is read as P2, `evidence.js`) opens `fallback`, the method most of the bank asks.
 */
export const CARDS = {
  ofKey: { [K.papillon]: 'trois-rapports', [K.calcul]: 'depuis-le-sommet' },
  ofExercise: {},
  fallback: 'depuis-le-sommet',
};
