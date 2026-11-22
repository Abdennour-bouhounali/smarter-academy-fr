/**
 * Les FIGURES du درس « التكبير والتصغير وأثره على المقادير الفضائية » — des DONNÉES, dessinées par SpaceFigure (les solides,
 * `kind: 'space'`) et GeoFigure (la figure plane du أستعدّ 3). Aucune n'est une image. Les coordonnées viennent de
 * l'extraction (docs/sources/4am/unit14/extraction.json) ; content/figures.test.js vérifie, SUR CES POINTS, chaque longueur que
 * la leçon affirme (space.js) et la qualité de chaque figure (spaceFigureQuality / figureQuality = []).
 *
 * Analyse (guide §5 « Textbook figures ») :
 *   - أستعدّ 3 : le triangle du manuel est lisible (A en haut, D et B sur [AB], E sur [AC]) — REPRODUIT, cotes 3, 5, 6 ;
 *   - نشاط 5 : la pyramide du manuel est lisible ; (P) y est un parallélogramme vert — REPRODUITE (hauteur 6 cm choisie par
 *     l'extraction, sans effet sur les réponses) ;
 *   - نشاط 6 : le manuel n'a PAS de figure ; la plateforme dessine le pavé (question) puis le pavé et sa réduction CÔTE À CÔTE
 *     (solution) — l'extraction les superposait en E (même origine), illisible : décalés de 7 cm ici.
 */
import { cuboidPoints, cuboidFaces } from '../../../../../../common/components/spaceFigure.js';

const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';

/* ── أستعدّ 3 (p. 163) : ABC rectangle en B, D ∈ [AB], E ∈ [AC], (DE) ⊥ (AB) ── */
export const FIG_PREP3 = {
  points: { A: [0, 5], B: [0, 0], C: [6, 0], D: [0, 2], E: [3.6, 2] },
  segments: [{ from: 'A', to: 'D', label: '3' }, ['D', 'B'], { from: 'B', to: 'C', label: '6' }, ['C', 'A'], ['D', 'E']],
  rightAngles: [['A', 'B', 'C'], ['A', 'D', 'E']],
  labels: { A: 'n', B: 's', C: 's', D: 'w', E: 'ne' },
  ariaLabel: 'مثلث ABC قائم في B، و D نقطة من [AB] و E نقطة من [AC] حيث (DE) عمودي على (AB)؛ AD = 3 و AB = 5 و BC = 6',
  maxWidth: 320,
};

/* ── نشاط 6 (p. 165) : le pavé ABCDEFGH (ABCD en haut, EFGH en bas, A au-dessus de E), AB = 5, BC = 4, AE = 3 ── */
const ACT6 = cuboidPoints('ABCDEFGH', { length: 5, width: 4, height: 3 });
export const FIG_ACT6 = {
  kind: 'space',
  view: { azimuth: -58, elevation: 22 },
  points: ACT6,
  solids: [{ type: 'polyhedron', faces: cuboidFaces('ABCDEFGH'), tone: 'amber' }],
  segments: [{ from: 'E', to: 'F', label: '5', tone: 'amber' }, { from: 'F', to: 'G', label: '4', tone: 'amber' }, { from: 'B', to: 'F', label: '3', tone: 'amber' }],
  labels: { A: 'nw', B: 'n', C: 'ne', D: 'n', E: 'sw', F: 's', G: 'se', H: 'nw' },
  ariaLabel: 'متوازي مستطيلات ABCDEFGH: الوجه ABCD في الأعلى والوجه EFGH في الأسفل، AB = 5 و BC = 4 و AE = 3 بالسنتيمتر',
  caption: 'شكل من المنصّة: الكتاب لا يرسم متوازي المستطيلات في النشاط 6',
  maxWidth: 480,
};

/** نشاط 6, solution : le pavé et sa réduction de rapport 3/5 côte à côte (A′B′ = 3, B′C′ = 2,4, A′E′ = 1,8). */
const ACT6_IMG = cuboidPoints('ABCDEFGH', { length: 3, width: 2.4, height: 1.8, origin: [7, 0, 0] });
const PRIMED = Object.fromEntries(Object.entries(ACT6_IMG).map(([n, p]) => [`${n}′`, p]));
export const FIG_ACT6_SOL = {
  kind: 'space',
  view: { azimuth: -62, elevation: 22 },
  points: { ...ACT6, ...PRIMED },
  solids: [
    { type: 'polyhedron', faces: cuboidFaces('ABCDEFGH'), tone: 'amber' },
    { type: 'polyhedron', faces: cuboidFaces('ABCDEFGH').map((f) => f.map((n) => `${n}′`)), tone: 'indigo' },
  ],
  segments: [
    { from: 'E', to: 'F', label: '5', tone: 'amber' }, { from: 'B', to: 'F', label: '3', tone: 'amber' },
    { from: 'E′', to: 'F′', label: '3', tone: 'indigo' }, { from: 'B′', to: 'F′', label: '1,8', tone: 'indigo' },
  ],
  hidden: ['C', 'D', 'G', 'H', 'C′', 'D′', 'G′', 'H′'],
  labels: { A: 'nw', B: 'n', E: 'sw', F: 's', 'A′': 'nw', 'B′': 'n', 'E′': 'sw', 'F′': 's' },
  ariaLabel: 'متوازي المستطيلات ABCDEFGH (5 و 4 و 3) وعلى يمينه تصغيره A′B′C′D′E′F′G′H′ بالنسبة ثلاثة أخماس (3 و 2,4 و 1,8)',
  caption: 'متوازي المستطيلات وتصغيره بالنسبة 3/5 جنبا إلى جنب (شكل من المنصّة)',
  maxWidth: 520,
};

/* ── نشاط 5 (p. 165) : la pyramide régulière SABCD (AB = 4), (P) // base par E, SE = 3/4 SA ── */
export const FIG_ACT5 = {
  kind: 'space',
  view: { azimuth: -40, elevation: 26 },
  points: {
    S: [0, 0, 6], A: [-2, -2, 0], B: [2, -2, 0], C: [2, 2, 0], D: [-2, 2, 0],
    E: [-1.5, -1.5, 1.5], F: [1.5, -1.5, 1.5], G: [1.5, 1.5, 1.5], H: [-1.5, 1.5, 1.5],
    P1: [-3.4, -3.1, 1.5], P2: [3.4, -3.1, 1.5], P3: [3.4, 3.1, 1.5], P4: [-3.4, 3.1, 1.5],
  },
  solids: [{ type: 'polyhedron', faces: [['A', 'B', 'C', 'D'], ['S', 'A', 'B'], ['S', 'B', 'C'], ['S', 'C', 'D'], ['S', 'D', 'A']], tone: 'slate' }],
  planes: [{ points: ['P1', 'P2', 'P3', 'P4'], tone: 'sky', label: '(P)' }],
  sections: [{ points: ['E', 'F', 'G', 'H'], tone: 'rose' }],
  hidden: ['P1', 'P2', 'P3', 'P4'],
  labels: { S: 'n', A: 'sw', B: 's', C: 'e', D: 'nw', E: 'w', F: 'se', G: 'e', H: 'nw' },
  ariaLabel: 'هرم منتظم SABCD قاعدته المربع ABCD، والمستوي (P) الموازي للقاعدة يقطع الأحرف [SA] و [SB] و [SC] و [SD] في E و F و G و H',
  caption: REDRAWN,
  maxWidth: 480,
};

/* ── معارف (plateforme) : le cône de révolution et sa section parallèle à la base ── */
export const FIG_KNOW_CONE = {
  kind: 'space',
  view: { azimuth: -60, elevation: 14 },
  points: { S: [0, 0, 6], O: [0, 0, 0], M: [3, 0, 0], 'O′': [0, 0, 2], 'M′': [2, 0, 2] },
  solids: [{ type: 'cone', base: 'O', apex: 'S', radius: 3, tone: 'slate' }],
  circles: [{ center: 'O′', radius: 2, normal: 'z', tone: 'rose' }],
  segments: [{ from: 'S', to: 'O', dashed: true }, { from: 'O', to: 'M', dashed: true }, { from: "O′", to: 'M′', tone: 'rose' }],
  labels: { S: 'n', O: 'sw', M: 'se', 'O′': 'w', 'M′': 'e' },
  ariaLabel: 'مخروط دوران رأسه S وقاعدته الدائرة التي مركزها O ونصف قطرها OM، ومستو يوازي القاعدة يقطعه في الدائرة التي مركزها O′ ونصف قطرها O′M′',
  maxWidth: 340,
};

/* ── إختبار أولي (plateforme) : une pyramide de hauteur 9 coupée à 3 cm du sommet (k = 1/3) — sans la réponse ── */
export const FIG_TEST_PYRAMID = {
  kind: 'space',
  view: { azimuth: -64, elevation: 14 },
  points: {
    S: [0, 0, 9], A: [-3, -3, 0], B: [3, -3, 0], C: [3, 3, 0], D: [-3, 3, 0], O: [0, 0, 0], "O′": [0, 0, 6],
    E: [-1, -1, 6], F: [1, -1, 6], G: [1, 1, 6], H: [-1, 1, 6],
  },
  solids: [{ type: 'polyhedron', faces: [['A', 'B', 'C', 'D'], ['S', 'A', 'B'], ['S', 'B', 'C'], ['S', 'C', 'D'], ['S', 'D', 'A']], tone: 'slate' }],
  sections: [{ points: ['E', 'F', 'G', 'H'], tone: 'rose' }],
  segments: [{ from: 'S', to: "O′", label: '3', dashed: true, tone: 'rose' }, { from: "O′", to: 'O', label: '6', dashed: true }],
  hidden: ['E', 'F', 'G', 'H', 'C', 'D'],
  labels: { S: 'n', A: 'sw', B: 's', O: 'e', "O′": 'e' },
  ariaLabel: 'هرم رأسه S وارتفاعه SO يساوي 9، يقطعه مستو يوازي القاعدة في النقطة O′ حيث SO′ = 3',
  maxWidth: 300,
  inline: true,
};
