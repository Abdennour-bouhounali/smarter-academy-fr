/**
 * Les figures du درس 4 « توظيف الحساب الشعاعي والإحداثيات لإثبات الخواص الهندسية » en DONNÉES GeoFigure
 * (lessons/common/components/geoFigure.js : grille, axes du معلم, cercles) — redessinées d'après extraction › figure ou
 * l'énoncé, jamais une image du manuel. Les coordonnées sont celles de l'énoncé (assertées par build-extraction.py et
 * recalculées dans figures.test.js avec vectors.js). Une figure ne montre JAMAIS la réponse demandée : un point à
 * calculer (C de la طريقة, D des ex-26 / 27, I du دوري الآن) n'apparaît que dans la figure « après » (suffixe _DONE),
 * montrée une fois la question répondue.
 *
 * ANALYSE (règle du propriétaire, guide §5 « Textbook figures ») :
 *   • طرائق « إنجاز برهان » : le manuel dessine A, B, C sur une ورقة مرصوفة — lisible : REPRODUITE (axes ajoutés).
 *   • طرائق « حساب مسافات » : le manuel dessine la perpendiculaire en B (« تقع C على هذا المستقيم ») — elle DONNE la
 *     réponse avant le calcul. REDESSINÉE : la droite (d) des points d'abscisse −2 (la donnée « C(−2 ; y) »), C seulement
 *     dans la figure _DONE, avec l'angle droit.
 *   • دوري الآن et les exercices n'ont pas de figure au manuel (« علّم النقط ») : la plateforme place les points donnés
 *     sur une grille avec les axes — le « تعليم » fait, rien de plus.
 */
const AX = { grid: true, axes: true };

/** طرائق ص 145 « إنجاز برهان » — A(6 ; −1), B(2 ; 3), C(2 ; −5), le triangle ABC (extraction › method-proof › figure). */
export const FIG_METHOD_PROOF = {
  ...AX,
  points: { A: [6, -1], B: [2, 3], C: [2, -5], O: [0, 0] },
  segments: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'A', to: 'C', tone: 'rose' }, ['B', 'C']],
  labels: { A: 'e', B: 'n', C: 's', O: 'sw' },
  ariaLabel: 'معلم متعامد ومتجانس على مرصوفة، والنقط A و B و C ، والمثلث ABC',
  maxWidth: 480,
};

/** طرائق ص 145 « حساب مسافات » — A(0 ; 2), B(−4 ; 0) et la droite (d) des points d'abscisse −2 qui porte C (redessinée). */
export const FIG_METHOD_UNKNOWN = {
  ...AX,
  points: { A: [0, 2], B: [-4, 0], O: [0, 0], d1: [-2, 4], d2: [-2, -5] },
  hidden: ['d1', 'd2'],
  segments: [['A', 'B']],
  lines: [{ through: ['d1', 'd2'], name: '(d)', tone: 'amber', extend: 0 }],
  labels: { A: 'ne', B: 'sw', O: 'se' },
  ariaLabel: 'معلم متعامد ومتجانس: النقطتان A و B ، والمستقيم (d) الذي تقع عليه النقطة C ، كل نقطه فاصلتها −2',
  caption: 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات',
  maxWidth: 480,
};
/** … après le calcul : C(−2 ; −4), l'angle droit en B. */
export const FIG_METHOD_UNKNOWN_DONE = {
  ...FIG_METHOD_UNKNOWN,
  points: { ...FIG_METHOD_UNKNOWN.points, C: [-2, -4] },
  segments: [['A', 'B'], { from: 'B', to: 'C', tone: 'emerald' }, { from: 'A', to: 'C', dashed: true }],
  rightAngles: [['A', 'B', 'C']],
  labels: { ...FIG_METHOD_UNKNOWN.labels, C: 'se' },
  ariaLabel: 'المثلث ABC قائم في B ، و C على المستقيم (d)',
  caption: undefined,
};

/** دوري الآن ص 145 (1) — A(2 ; 2), B(2 ; −2), C(−2 ; −2), D(−2 ; 2). */
export const FIG_NOW145_1 = {
  ...AX,
  points: { A: [2, 2], B: [2, -2], C: [-2, -2], D: [-2, 2], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
  labels: { A: 'ne', B: 'se', C: 'sw', D: 'nw', O: 'se' },
  ariaLabel: 'الرباعي ABCD في معلم متعامد ومتجانس، مبدؤه O',
  maxWidth: 420,
};

/** دوري الآن ص 145 (2) — A(−2 ; 0), B(0 ; −2) et l'origine O. */
export const FIG_NOW145_2 = {
  ...AX,
  points: { A: [-2, 0], B: [0, -2], O: [0, 0] },
  segments: [{ from: 'A', to: 'B', dashed: true }],
  labels: { A: 'n', B: 'e', O: 'ne' },
  ariaLabel: 'النقطتان A و B على المحورين، والمبدأ O',
  maxWidth: 420,
};
/** … après : I(−1 ; −1) et le cercle de diamètre [AB], qui passe par O. */
export const FIG_NOW145_2_DONE = {
  ...FIG_NOW145_2,
  points: { ...FIG_NOW145_2.points, I: [-1, -1] },
  circles: [{ center: 'I', through: 'A', tone: 'indigo' }],
  labels: { ...FIG_NOW145_2.labels, I: 'sw' },
  ariaLabel: 'الدائرة التي قطرها [AB] ومركزها I تمر بالمبدأ O',
};

/** ex-13 — A(3 ; 0), B(0 ; 2), C(2 ; 5), D(5 ; 3). */
export const FIG_EX13 = {
  ...AX,
  points: { A: [3, 0], B: [0, 2], C: [2, 5], D: [5, 3] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  labels: { A: 's', B: 'w', C: 'n', D: 'e' },
  ariaLabel: 'الرباعي ABCD وقطراه [AC] و [BD] في معلم متعامد ومتجانس',
  maxWidth: 420,
};

/** ex-18 — A(1 ; 0), B(0 ; 3), C(3 ; 4). */
export const FIG_EX18 = {
  ...AX,
  points: { A: [1, 0], B: [0, 3], C: [3, 4] },
  segments: [['A', 'B'], ['B', 'C'], ['A', 'C']],
  labels: { A: 's', B: 'w', C: 'n' },
  ariaLabel: 'المثلث ABC في معلم متعامد ومتجانس',
  maxWidth: 420,
};
/** … après : I(2 ; 2) milieu de [AC], le cercle (𝒞) de diamètre [AC] passe par B ; (BI) ⊥ (AC). */
export const FIG_EX18_DONE = {
  ...FIG_EX18,
  points: { ...FIG_EX18.points, I: [2, 2] },
  segments: [['A', 'B'], ['B', 'C'], ['A', 'C'], { from: 'B', to: 'I', tone: 'emerald' }],
  circles: [{ center: 'I', through: 'A', tone: 'indigo' }],
  rightAngles: [['B', 'I', 'C']],
  labels: { ...FIG_EX18.labels, I: 'e' },
  ariaLabel: 'الدائرة (𝒞) التي قطرها [AC] ومركزها I تمر بالنقطة B ، و (BI) عمودي على (AC)',
  maxWidth: 440,
};

/** ex-19 — A(1 ; 0), B(−1/2 ; √3/2), C(−1/2 ; −√3/2) et O : la grille au demi (les coordonnées ne sont pas entières). */
const R3 = Math.sqrt(3) / 2;
export const FIG_EX19 = {
  grid: { step: 0.5 }, axes: { every: 1 },
  points: { A: [1, 0], B: [-0.5, R3], C: [-0.5, -R3], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  labels: { A: 'e', B: 'nw', C: 'sw', O: 'nw' },
  ariaLabel: 'المثلث ABC والمبدأ O في معلم متعامد ومتجانس',
  maxWidth: 420,
};
/** … après : la dalle circulaire de centre O passe par A, B et C. */
export const FIG_EX19_DONE = { ...FIG_EX19, circles: [{ center: 'O', through: 'A', tone: 'indigo' }], ariaLabel: 'الدائرة التي مركزها O ونصف قطرها 1 تمر بالرؤوس A و B و C' };

/** ex-21 (corrigé : trois points) — A(1 ; 2), B(4 ; 3), C(6 ; −3). */
export const FIG_EX21 = {
  ...AX,
  points: { A: [1, 2], B: [4, 3], C: [6, -3], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['A', 'C']],
  labels: { A: 'nw', B: 'n', C: 's', O: 'sw' },
  ariaLabel: 'المثلث ABC في معلم متعامد ومتجانس، مبدؤه O',
  maxWidth: 440,
};

/** ex-24 — A(1 ; 2), B(3 ; 4), C(5 ; 2), D(3 ; 0). */
export const FIG_EX24 = {
  ...AX,
  points: { A: [1, 2], B: [3, 4], C: [5, 2], D: [3, 0], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  labels: { A: 'w', B: 'n', C: 'e', D: 'se', O: 'sw' },
  ariaLabel: 'الرباعي ABCD وقطراه في معلم متعامد ومتجانس، مبدؤه O',
  maxWidth: 420,
};

/** ex-26 — A(2 ; −2), B(−3 ; 3), C(−4 ; −3) ; D(3 ; 4) seulement après la question 3. */
export const FIG_EX26 = {
  ...AX,
  points: { A: [2, -2], B: [-3, 3], C: [-4, -3], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  labels: { A: 'se', B: 'nw', C: 'sw', O: 'ne' },
  ariaLabel: 'المثلث ABC في معلم متعامد ومتجانس، مبدؤه O',
  maxWidth: 440,
};
export const FIG_EX26_DONE = {
  ...FIG_EX26,
  points: { ...FIG_EX26.points, D: [3, 4] },
  segments: [['C', 'A'], ['A', 'D'], ['D', 'B'], ['B', 'C'], { from: 'A', to: 'B', dashed: true, tone: 'emerald' }, { from: 'C', to: 'D', dashed: true, tone: 'emerald' }],
  labels: { ...FIG_EX26.labels, D: 'ne' },
  ariaLabel: 'المعيّن ACBD وقطراه [AB] و [CD] متعامدان',
};

/** ex-27 — A(−3 ; 1), B(1 ; 4), C(4 ; 0) ; D(0 ; −3) seulement après la question 2 أ. */
export const FIG_EX27 = {
  ...AX,
  points: { A: [-3, 1], B: [1, 4], C: [4, 0], O: [0, 0] },
  segments: [['A', 'B'], ['B', 'C'], ['A', 'C']],
  labels: { A: 'w', B: 'n', C: 'e', O: 'ne' },
  ariaLabel: 'المثلث ABC في معلم متعامد ومتجانس، مبدؤه O',
  maxWidth: 440,
};
export const FIG_EX27_DONE = {
  ...FIG_EX27,
  points: { ...FIG_EX27.points, D: [0, -3] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']],
  vectors: [{ from: 'B', to: 'C', tone: 'rose' }, { from: 'A', to: 'D', tone: 'rose' }],
  labels: { ...FIG_EX27.labels, D: 's' },
  ariaLabel: 'المربّع ABCD ، و D صورة A بالانسحاب الذي شعاعه BC',
};
