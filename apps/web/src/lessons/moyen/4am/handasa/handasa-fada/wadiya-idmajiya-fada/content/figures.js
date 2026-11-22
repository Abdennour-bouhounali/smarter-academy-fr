/**
 * Les FIGURES que cette leçon dessine — la donnée seulement : SpaceFigure (`kind: 'space'`, repère 3D z en haut, cm) pour les
 * solides, GeoFigure (plan, y en haut) pour les coupes axiales. Une figure ne porte jamais la réponse de la question qui la montre.
 *
 * Analyse de la figure du manuel (guide §5) — le تحدّ p. 163 : un seau en perspective, Ø 40 en haut, Ø 30 en bas, deux cotes
 * verticales empilées 7 / 28 et le niveau d'eau en pointillés rouges. Le dessin est LISIBLE : il est REPRODUIT (CHALLENGE_FIGURE)
 * avec les cotes du manuel, le seau vu de face (les diamètres horizontaux), l'eau en bleu — sans aucun point nommé (le manuel n'en
 * nomme aucun) et sans le rayon de la surface (c'est la question).
 *
 * Les COUPES AXIALES (AXIAL) sont des figures planes de la plateforme : à l'échelle, le cône complété du seau serait
 * une bande 40 × 140 (rapport 3,5 : 1, refusée par figureQuality). On les dessine donc avec une échelle verticale réduite —
 * une affinité verticale garde le parallélisme et les rapports sur chaque droite, donc la configuration de Thalès et les angles
 * droits sur l'axe — et la légende le dit (« رسم غير مطابق للأبعاد »).
 */

/** Le تحدّ (p. 163) — le seau et son eau, les cotes du manuel ; pour la page d'unité (components/BucketFigure.jsx) et le module 7. */
export const CHALLENGE_FIGURE = {
  kind: 'space',
  view: { azimuth: -90, elevation: 14 },
  points: {
    O: [0, 0, 0], O1: [0, 0, 35], W: [0, 0, 28],
    T1: [-20, 0, 41], T2: [20, 0, 41], D1: [-15, 0, -6], D2: [15, 0, -6],
    V0: [-28, 0, 35], V1: [-28, 0, 28], V2: [-28, 0, 0],
    X0: [-37, 0, 17], // point caché : garde la place des cotes verticales dans le cadre
  },
  solids: [{ type: 'frustum', base: 'O', top: 'O1', radius: 15, topRadius: 20, tone: 'amber' }],
  circles: [{ center: 'W', radius: 19, tone: 'sky', bold: true }],
  segments: [
    { from: 'T1', to: 'T2', label: '40 cm' },
    { from: 'D1', to: 'D2', label: '30 cm' },
    { from: 'V0', to: 'V1', label: '7 cm', tone: 'rose', labelOffset: 24 },
    { from: 'V1', to: 'V2', label: '28 cm', labelOffset: 27 },
  ],
  hidden: ['O', 'O1', 'W', 'T1', 'T2', 'D1', 'D2', 'V0', 'V1', 'V2', 'X0'],
  ariaLabel: 'دلو على شكل مخروط مبتور فيه ماء: قطر الحافة العلوية 40 cm وقطر القاع 30 cm، ومن الحافة إلى سطح الماء 7 cm، ومن سطح الماء إلى القاع 28 cm',
  caption: 'شكل الكتاب (ص 163): الدلو والماء',
  maxWidth: 480,
};

/**
 * La COUPE AXIALE du seau complété (module 7, montrée APRÈS la question sur SO) : le cône de sommet S, le seau ABB′A′, l'eau
 * M′M ; y = z (cm) × 0,5 (échelle verticale réduite). Thalès dans SO₁B : (OA) ∥ (WM) ∥ (O₁B). Sans la cote WM = 19 : c'est la
 * question suivante.
 */
const Y = 0.5;
export const AXIAL = {
  points: {
    S: [0, 0], O: [0, 105 * Y], W: [0, 133 * Y], 'O₁': [0, 140 * Y],
    A: [15, 105 * Y], 'A′': [-15, 105 * Y], M: [19, 133 * Y], 'M′': [-19, 133 * Y], B: [20, 140 * Y], 'B′': [-20, 140 * Y],
  },
  segments: [
    { from: 'A′', to: 'A', bold: true }, { from: 'A', to: 'B', bold: true }, { from: 'B', to: 'B′', bold: true }, { from: 'B′', to: 'A′', bold: true },
    { from: 'M′', to: 'M', tone: 'sky', bold: true },
    { from: 'S', to: 'A', dashed: true }, { from: 'S', to: 'A′', dashed: true },
    { from: 'S', to: 'O', dashed: true, label: '105' },
    { from: 'O', to: 'A', label: '15' }, { from: 'O₁', to: 'B', label: '20' },
  ],
  rightAngles: [['S', 'O', 'A']],
  labels: { S: 's', O: 'w', W: 'sw', 'O₁': 'n', A: 'e', 'A′': 'w', M: 'e', 'M′': 'w', B: 'e', 'B′': 'w' },
  caption: 'المقطع المحوري للدلو بعد إكمال المخروط (رسم غير مطابق للأبعاد: السلّم الشاقولي مصغّر)',
  ariaLabel: 'المقطع المحوري: المثلث الذي رأسه S، والقطع [OA] و [WM] و [O₁B] متوازية؛ SO = 105 و OA = 15 و O₁B = 20',
  maxWidth: 420,
};

/** « إختبار أولي » — le verre de frappé (Ø 8 au fond, Ø 12 en haut, 12 cm de haut, boisson sur 9 cm), sans aucune réponse. */
export const TEST_FIGURE = {
  kind: 'space',
  view: { azimuth: -90, elevation: 14 },
  points: {
    O: [0, 0, 0], O1: [0, 0, 12], W: [0, 0, 9],
    T1: [-6, 0, 14], T2: [6, 0, 14], D1: [-4, 0, -2], D2: [4, 0, -2],
    L0: [-8.5, 0, 12], L1: [-8.5, 0, 0], R0: [8, 0, 9], R1: [8, 0, 0],
    X0: [-11.5, 0, 6], X1: [11, 0, 4.5], // points cachés : la place des cotes verticales
  },
  solids: [{ type: 'frustum', base: 'O', top: 'O1', radius: 4, topRadius: 6, tone: 'violet' }],
  circles: [{ center: 'W', radius: 5.5, tone: 'amber', bold: true }],
  segments: [
    { from: 'T1', to: 'T2', label: '12 cm' },
    { from: 'D1', to: 'D2', label: '8 cm' },
    { from: 'L0', to: 'L1', label: '12 cm', labelOffset: 27 },
    { from: 'R0', to: 'R1', label: '9 cm', tone: 'amber', labelOffset: 23 },
  ],
  hidden: ['O', 'O1', 'W', 'T1', 'T2', 'D1', 'D2', 'L0', 'L1', 'R0', 'R1', 'X0', 'X1'],
  ariaLabel: 'كأس على شكل مخروط مبتور: قطر الفتحة 12 cm وقطر القاع 8 cm وارتفاعه 12 cm، والمشروب حتى عمق 9 cm',
  maxWidth: 420,
};

/**
 * LES SIX « وضعيات تدريبية » (modules 1 à 6, content/problems.js) — un support dessiné pour chacune, donnée seulement ; chaque
 * figure ne porte que des cotes de l'ÉNONCÉ, jamais une réponse (le rayon d'une section, une aire, un volume, la valeur de k).
 * Les nombres sont ceux de l'énoncé (unités de l'énoncé, ou dizaines de cm quand la figure serait une bande étroite) et sont
 * recalculés sur les points dessinés par content/problems.test.js.
 */

/** وضعية 1 — la mappemonde : sphère de rayon 9 ; A sur la sphère (OA = 9), B dedans (OB = 7), C dehors (OC = 11). */
export const TRAIN_1_FIGURE = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], A: [1, 4, 8], B: [2, 3, 6], C: [-6, -6, 7] },
  solids: [{ type: 'sphere', center: 'O', radius: 9, tone: 'sky', equator: false }],
  segments: [
    { from: 'O', to: 'A', label: '9 cm', dashed: true },
    { from: 'O', to: 'B', label: '7 cm', dashed: true, tone: 'rose' },
    { from: 'O', to: 'C', label: '11 cm', dashed: true, tone: 'amber' },
  ],
  labels: { O: 'sw', A: 'ne', B: 'nw', C: 'w' },
  ariaLabel: 'كرة أرضية مركزها O ونصف قطرها 9 cm، والنقطة A بعدها عن O يساوي 9 cm، والنقطة B بعدها 7 cm، والنقطة C بعدها 11 cm',
  maxWidth: 380,
};

/** وضعية 2 — la sphère de pierre (R = 25) coupée par (P) à 15 cm du centre : H centre de la section, M sur son bord (HM = 20, non coté). */
export const TRAIN_2_FIGURE = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], H: [0, 0, -15], M: [20, 0, -15] },
  solids: [{ type: 'sphere', center: 'O', radius: 25, tone: 'slate', equator: false }],
  circles: [{ center: 'H', radius: 20, normal: 'z', on: 0, tone: 'rose', bold: true }],
  segments: [
    { from: 'O', to: 'H', label: '15 cm', dashed: true },
    { from: 'O', to: 'M', label: '25 cm', dashed: true },
    { from: 'H', to: 'M', dashed: true, tone: 'rose' },
  ],
  rightAngles: [['O', 'H', 'M']],
  labels: { O: 'nw', H: 'sw', M: 'e' },
  ariaLabel: 'كرة من الحجر مركزها O ونصف قطرها 25 cm، يقطعها مستو يبعد عن O بـ 15 cm وفق دائرة مركزها H، و M نقطة من هذه الدائرة، والمثلث OHM قائم في H',
  maxWidth: 400,
};

/** وضعية 3 — la poubelle : cylindre de rayon 17 et de hauteur 60, dessiné en dizaines de cm (1,7 × 6) ; (P) parallèle à l'axe à 8 cm (0,8). */
export const TRAIN_3_FIGURE = {
  kind: 'space',
  view: { azimuth: -58, elevation: 20 },
  points: {
    O: [0, 0, 0], O1: [0, 0, 6], R: [1.7, 0, 6],
    Q1: [0.8, -1.5, 0], Q2: [0.8, 1.5, 0], Q3: [0.8, 1.5, 6], Q4: [0.8, -1.5, 6],
  },
  solids: [{ type: 'cylinder', base: 'O', top: 'O1', radius: 1.7, tone: 'amber' }],
  sections: [{ points: ['Q1', 'Q2', 'Q3', 'Q4'], tone: 'emerald' }],
  segments: [
    { from: 'O1', to: 'R', label: '17 cm', dashed: true },
    { from: 'O', to: 'O1', label: '60 cm', dashed: true },
  ],
  hidden: ['Q1', 'Q2', 'Q3', 'Q4', 'R'],
  labels: { O: 'sw', O1: 'nw' },
  ariaLabel: 'حاوية نفايات على شكل أسطوانة دوران قاعدتها قرص نصف قطره 17 cm وارتفاعها 60 cm، ومستو موازٍ لمحورها يقطعها وفق سطح مظلّل',
  maxWidth: 360,
};

/** وضعية 4 — le château d'eau sphérique : rayon 6 m (unités : mètres). */
export const TRAIN_4_FIGURE = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], M: [6, 0, 0] },
  solids: [{ type: 'sphere', center: 'O', radius: 6, tone: 'emerald', equator: true }],
  segments: [{ from: 'O', to: 'M', label: '6 m', dashed: true }],
  labels: { O: 'nw', M: 'e' },
  ariaLabel: 'خزان ماء كروي مركزه O ونصف قطره 6 m، و M نقطة من سطحه',
  maxWidth: 340,
};

/** وضعية 5 — le قمع : coupe axiale du cône (S en bas, SI = 15, IB = 9) ; l'huile jusqu'à W (SW = 10, énoncé) — WM n'est pas coté. */
export const TRAIN_5_FIGURE = {
  points: { S: [0, 0], I: [0, 15], A: [-9, 15], B: [9, 15], W: [0, 10], M: [-6, 10], N: [6, 10] },
  segments: [
    { from: 'S', to: 'A', bold: true }, { from: 'S', to: 'B', bold: true }, { from: 'A', to: 'B', bold: true },
    { from: 'M', to: 'N', tone: 'sky', bold: true },
    { from: 'S', to: 'I', dashed: true, label: '15 cm' },
    { from: 'I', to: 'B', label: '9 cm' },
  ],
  rightAngles: [['S', 'I', 'B']],
  labels: { S: 's', I: 'ne', A: 'w', B: 'e', W: 'se', M: 'w', N: 'e' },
  caption: 'المقطع المحوري للقمع (SW = 10 cm)',
  ariaLabel: 'المقطع المحوري لقمع: المثلث SAB رأسه S إلى الأسفل، SI = 15 cm و IB = 9 cm، وسطح الزيت [MN] عمودي على المحور في W حيث SW = 10 cm',
  maxWidth: 340,
};

/** وضعية 6 — la boîte de 2 balles : coupe axiale, rectangle 6 × 12, deux disques de rayon 3 (centres C1, C2). */
export const TRAIN_6_FIGURE = {
  points: { A: [-3, 0], B: [3, 0], C: [3, 12], D: [-3, 12], C1: [0, 3], C2: [0, 9], E1: [3, 3] },
  segments: [
    { from: 'A', to: 'B', bold: true }, { from: 'B', to: 'C', bold: true, label: '12 cm' }, { from: 'C', to: 'D', bold: true }, { from: 'D', to: 'A', bold: true },
    { from: 'C1', to: 'E1', label: '3 cm', tone: 'rose' },
  ],
  circles: [{ center: 'C1', radius: 3, tone: 'rose' }, { center: 'C2', radius: 3, tone: 'rose' }],
  labels: { A: 'sw', B: 'se', C: 'ne', D: 'nw', C1: 'w', C2: 'w', E1: 'e' },
  caption: 'مقطع العلبة بمستو يشمل محورها',
  ariaLabel: 'مقطع علبة أسطوانية بمستو يشمل محورها: مستطيل ارتفاعه 12 cm وعرضه ضعف نصف قطر كرة، وفيه كرتان متماثلتان نصف قطر كل منهما 3 cm تمسّان القاعدة والغطاء وجدار العلبة',
  maxWidth: 260,
};
