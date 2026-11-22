/**
 * Les FIGURES que cette leçon redessine (GeoFigure — common/components/geoFigure.js) : la donnée seulement, en unités du
 * معلم (un carreau = 1), y vers le haut. Chaque figure suit l'extraction (docs/sources/4am/unit12/extraction.json › figure)
 * et ne porte QUE ce que le manuel dessine — jamais une réponse. Les demi-cercles sont des `arcs` (diamètre [from, to],
 * sens vu sur la figure), les cercles en pointillé du manuel des `circles` dont le centre est un point CACHÉ.
 *
 * ANALYSE (règle du propriétaire, guide §5 « Textbook figures ») :
 *   — la وضعية p. 148 : quadrillage presque carré (8 × 7), mais les deux parcours sont du MÊME rouge, les deux sommets
 *     intermédiaires de (2) et le point (2 ; 0) ne sont pas nommés, l'étiquette « (2) » est posée sur un sommet :
 *     REDESSINÉE avec le même concept et les mêmes coordonnées — un ton par parcours (rose, bleu ciel), les noms E, P, Q
 *     de la plateforme, les cercles en pointillé gardés (ce sont eux qui disent « نصف دائرة ») ;
 *   — le إختبار أولي : figure de la plateforme sur le même modèle que la وضعية.
 */

/** La وضعية (p. 148) : les deux parcours des coureurs. */
export const SITUATION_FIGURE = {
  points: {
    A: [-2, 0], O: [0, 0], E: [2, 0], B: [4, 0],
    M: [-2, 3], P: [1, 1], Q: [3, 2], N: [4, -2],
    I: [-1, 0], J: [1, 0], K: [3, 0],
  },
  hidden: ['I', 'J', 'K'],
  circles: [{ center: 'I', through: 'A', dashed: true }, { center: 'J', through: 'O', dashed: true }, { center: 'K', through: 'E', dashed: true }],
  arcs: [{ from: 'A', to: 'O', sweep: 'cw', tone: 'rose', bold: true }, { from: 'O', to: 'E', sweep: 'ccw', tone: 'rose', bold: true }, { from: 'E', to: 'B', sweep: 'cw', tone: 'rose', bold: true }],
  segments: [{ from: 'M', to: 'P', tone: 'sky', bold: true }, { from: 'P', to: 'Q', tone: 'sky', bold: true }, { from: 'Q', to: 'N', tone: 'sky', bold: true }],
  labels: { A: 'nw', O: 'nw', E: 'se', B: 'ne', M: 'n', P: 'sw', Q: 'ne', N: 'e' },
  grid: true,
  axes: true,
  caption: 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات — المسار (1) بالوردي والمسار (2) بالأزرق',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: المسار (1) من A(−2 ; 0) إلى B(4 ; 0) ثلاثة أنصاف دوائر متتابعة أطرافها O(0 ; 0) و E(2 ; 0) على محور الفواصل (الأول والثالث فوق المحور والثاني تحته، والدوائر الكاملة بخط متقطع)، والمسار (2) خط منكسر من M(−2 ; 3) إلى P(1 ; 1) ثم Q(3 ; 2) ثم N(4 ; −2)',
};

/**
 * « إختبار أولي » — la وضعية TRANSPOSÉE : deux pistes de VTT à جبل الوحش (Constantine). Piste (1) : deux demi-cercles de
 * diamètres [CK] et [KD] (le premier au-dessus de l'axe, le second au-dessous) ; piste (2) : la ligne brisée E → F → G → H, au-dessus (aucun croisement avec les arcs).
 * Les centres ne sont PAS dessinés (c'est la question E1), aucune longueur n'est écrite.
 */
export const TEST_FIGURE = {
  points: {
    C: [-3, 0], K: [1, 0], D: [5, 0],
    E: [-3, 7], F: [0, 3], G: [3, 6], H: [5, 4],
  },
  arcs: [{ from: 'C', to: 'K', sweep: 'cw', tone: 'rose', bold: true }, { from: 'K', to: 'D', sweep: 'ccw', tone: 'rose', bold: true }],
  segments: [{ from: 'E', to: 'F', tone: 'sky', bold: true }, { from: 'F', to: 'G', tone: 'sky', bold: true }, { from: 'G', to: 'H', tone: 'sky', bold: true }],
  labels: { C: 'sw', K: 'se', D: 'se', E: 'w', F: 's', G: 'n', H: 'e' },
  grid: true,
  axes: true,
  caption: 'المسلك (1) بالوردي والمسلك (2) بالأزرق',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: المسلك (1) من C(−3 ; 0) إلى D(5 ; 0) نصفا دائرتين يلتقيان في K(1 ; 0)، الأول فوق محور الفواصل والثاني تحته، والمسلك (2) فوقه خط منكسر من E(−3 ; 7) إلى F(0 ; 3) ثم G(3 ; 6) ثم H(5 ; 4)',
};

/**
 * Les SIX « وضعيات تدريبية » (modules 1 à 6, content/problems.js) : un support dessiné chacune, sur les seules données de
 * l'énoncé — jamais le point cherché, jamais une longueur calculée. Un carreau = l'unité écrite dans l'énoncé. Les
 * situations sont des ajouts de la plateforme (`exam_style_problem`) ; aucune ne reprend les nombres du manuel (p. 148),
 * du إختبار أولي (Constantine) ni du lab.
 */

/** وضعية 1 — la tournée de la bibliothèque itinérante : trois stations, la quatrième D est à trouver (absente). */
export const TRAIN1 = {
  points: { A: [-4, 1], B: [-1, 3], C: [1, -2] },
  segments: [{ from: 'A', to: 'B', tone: 'sky', bold: true }, { from: 'B', to: 'C', tone: 'sky', bold: true }],
  labels: { A: 'w', B: 'n', C: 's' },
  grid: true,
  axes: true,
  caption: 'المحطات الثلاث A و B و C : المحطة D غير معلَّمة',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: ثلاث محطات A(−4 ; 1) و B(−1 ; 3) و C(1 ; −2)، يصل بينها المقطعان [AB] و [BC]',
};

/** وضعية 2 — deux villages et l'école : le puits (milieu) n'est pas marqué. */
export const TRAIN2 = {
  points: { A: [-4, -1], B: [4, 3], C: [2, -3] },
  segments: [{ from: 'A', to: 'B', tone: 'sky', bold: true }],
  labels: { A: 'w', B: 'e', C: 's' },
  grid: true,
  axes: true,
  caption: 'القريتان A و B والمدرسة C',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: القريتان A(−4 ; −1) و B(4 ; 3) يصل بينهما المقطع [AB]، والمدرسة C(2 ; −3) تحت المقطع',
};

/** وضعية 3 — la cour : le demi-cercle (diamètre [AB], au-dessus) contre la ligne brisée ACB. */
export const TRAIN3 = {
  points: { A: [-3, 1], B: [3, 1], C: [1, 5] },
  arcs: [{ from: 'A', to: 'B', sweep: 'cw', tone: 'rose', bold: true }],
  segments: [{ from: 'A', to: 'C', tone: 'sky', bold: true }, { from: 'C', to: 'B', tone: 'sky', bold: true }],
  labels: { A: 'w', B: 'e', C: 'n' },
  grid: true,
  axes: true,
  caption: 'المسار (1) بالوردي والمسار (2) بالأزرق',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: البابان A(−3 ; 1) و B(3 ; 1)، المسار (1) نصف دائرة قطرها [AB] فوق القطر، والمسار (2) خط منكسر من A إلى C(1 ; 5) ثم إلى B',
};

/** وضعية 4 — la fresque : le quadrilatère ABCD (que l'on prouvera rectangle). */
export const TRAIN4 = {
  points: { A: [-3, 0], B: [1, -2], C: [2, 0], D: [-2, 2] },
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'emerald' }],
  labels: { A: 'w', B: 's', C: 'e', D: 'n' },
  grid: true,
  axes: true,
  caption: 'الرباعي ABCD',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: الرباعي ABCD رؤوسه A(−3 ; 0) و B(1 ; −2) و C(2 ; 0) و D(−2 ; 2)',
};

/** وضعية 5 — le phare F (portée en pointillé) et les deux barques P et T. */
export const TRAIN5 = {
  points: { F: [1, 2], P: [4, 6], T: [6, 5] },
  circles: [{ center: 'F', radius: 5, dashed: true, tone: 'sky' }],
  labels: { F: 'w', P: 'n', T: 'e' },
  grid: true,
  axes: true,
  caption: 'الفنار F والدائرة المتقطعة هي حدّ مدى ضوئه',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: الفنار F(1 ; 2) محاط بدائرة متقطعة نصف قطرها 5 هي حدّ مداه، وقاربان P(4 ; 6) و T(6 ; 5)',
};

/** وضعية 6 — le champ d'oliviers ABCD (que l'on prouvera losange). */
export const TRAIN6 = {
  points: { A: [-2, -1], B: [1, 3], C: [4, -1], D: [1, -5] },
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'violet' }],
  labels: { A: 'w', B: 'n', C: 'e', D: 's' },
  grid: true,
  axes: true,
  caption: 'الحقل ABCD',
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: الحقل ABCD رؤوسه A(−2 ; −1) و B(1 ; 3) و C(4 ; −1) و D(1 ; −5)',
};
