/**
 * Les FIGURES du درس « الكرة والجلة » — des données SpaceFigure (kind: 'space', z vers le haut, ce qui est vu en trait plein,
 * ce qui est caché en pointillés : la convention du manuel, طرائق p. 167) et, pour la figure PLANE de la طريقة p. 167, une
 * donnée GeoFigure. Chaque figure est analysée (guide §5 « Textbook figures ») :
 *   • معارف 1, الشكل 1 — le manuel dessine la sphère en « œuf » (plus large en bas) et entasse trois diamètres, M, P et Q sur une
 *     seule image : la plateforme la REDESSINE en deux figures (les trois diamètres ; les points M, P, Q), contour CIRCULAIRE,
 *     mêmes noms, mêmes données (écart de l'extraction « know-1 figure ») ;
 *   • معارف 1, الشكل 2 — sphère plus haute que large : redessinée (un grand cercle horizontal, un grand cercle méridien par N et
 *     S, un petit cercle de centre O₁) ;
 *   • طرائق « تمثيل كرة » — reproduite (le cercle, puis le cercle et l'ellipse, avant plein, arrière pointillé) ;
 *   • طرائق « تمثيل نقطة » — la figure donnée (plane) reproduite ; la solution reproduite en vraie perspective ;
 *   • دوري الآن ص 167 — le manuel n'a pas de figure (« أنجز شكلا ») : figure de la plateforme, vue de face sur le plan (OAB).
 * Les coordonnées sont celles de l'extraction (`figure.points3d`) ; √3 ≈ 1,732051.
 */
import { camera } from '../../../../../../common/components/spaceFigure.js';

const S3 = 1.732051;
const VIEW = { azimuth: -62, elevation: 18 };
/** Un point 3D qui se projette en (sx, sy) sur l'écran de la vue VIEW (pour tracer le « نطاق ملوّن » horizontal du الشكل 2). */
const screenPoint = (sx, sy) => { const { u, v } = camera(VIEW); return [0, 1, 2].map((i) => Number((sx * u[i] + sy * v[i]).toFixed(6))); };
const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات.';

/** معارف 1 — les trois diamètres [NS], [N′S′], [N₁S₁] de même milieu O. */
export const FIG_KNOW1_DIAMETERS = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], N: [0, 0, 2], S: [0, 0, -2], 'N′': [-1.414214, 0, 1.414214], 'S′': [1.414214, 0, -1.414214], 'N₁': [0, -2, 0], 'S₁': [0, 2, 0] },
  solids: [{ type: 'sphere', center: 'O', radius: 2, tone: 'rose' }],
  segments: [
    { from: 'N', to: 'S', dashed: true, tone: 'slate' },
    { from: 'N′', to: 'S′', dashed: true, tone: 'slate' },
    { from: 'N₁', to: 'S₁', dashed: true, tone: 'slate' },
  ],
  labels: { O: 'se', N: 'n', S: 's', 'N₁': 'sw', 'S₁': 'ne', 'N′': 'nw', 'S′': 'se' },
  ariaLabel: 'كرة مركزها O وثلاثة أقطار لها نفس المنتصف O: القطر الشاقولي [NS]، والقطر المائل [N′S′]، والقطر الأفقي [N₁S₁]',
  caption: REDRAWN,
  maxWidth: 480,
};

/** معارف 1 — l'exemple : M sur la كرة (δ), P dans la جلة (β), Q hors des deux. */
export const FIG_KNOW1_MPQ = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], M: [-2, 0, 0], P: [0.5, 0.75, 0], Q: [-2.5, 0, 2.5] },
  solids: [{ type: 'sphere', center: 'O', radius: 2, tone: 'rose' }],
  segments: [{ from: 'O', to: 'M', dashed: true, label: 'R', tone: 'slate' }],
  labels: { O: 'se', M: 'w', P: 'ne', Q: 'nw' },
  ariaLabel: 'كرة مركزها O ونصف قطرها R: النقطة M على الكرة، والنقطة P داخلها، والنقطة Q خارجها',
  caption: REDRAWN,
  maxWidth: 420,
};

/** معارف 1, الشكل 2 — des دوائر كبرى (l'équateur, un méridien par N et S) et une دائرة صغرى de centre O₁. */
export const FIG_KNOW1_CIRCLES = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], N: [0, 0, 2], S: [0, 0, -2], M: [2, 0, 0], 'O₁': [0, 0, -1.5] },
  solids: [{ type: 'sphere', center: 'O', radius: 2, tone: 'emerald' }],
  circles: [
    { center: 'O', radius: 2, normal: 'x', on: 0, tone: 'amber' },
    { center: 'O₁', radius: 1.322876, normal: 'z', on: 0, tone: 'rose' },
  ],
  segments: [{ from: 'N', to: 'S', dashed: true }, { from: 'O', to: 'M', dashed: true, label: 'R' }],
  labels: { O: 'nw', N: 'n', S: 's', M: 'e', 'O₁': 'w' },
  ariaLabel: 'كرة محورها [NS]: دائرتان كبريان مركزهما O (الأفقية والتي تمر بـ N و S)، ودائرة صغرى أفقية مركزها O₁ قرب S',
  caption: REDRAWN,
  maxWidth: 440,
};

/** طرائق « تمثيل كرة » (R = 2,5 cm) — الشكل 1 : la دائرة كبرى de centre O (le contour). */
export const FIG_DRAW_1 = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], A: [0, 0, 2.5] },
  solids: [{ type: 'sphere', center: 'O', radius: 2.5, tone: 'slate', equator: false, fill: false }],
  segments: [{ from: 'O', to: 'A', label: '2,5 cm', dashed: true }],
  hidden: ['A'],
  labels: { O: 'sw' },
  ariaLabel: 'الشكل 1: دائرة مركزها O ونصف قطرها 2,5 cm مرسومة بالمدور',
  maxWidth: 300,
};
/** الشكل 2 : le « نطاق ملوّن » (deux droites horizontales de l'écran) où l'on trace à main levée l'ellipse de la دائرة كبرى. */
export const FIG_DRAW_2 = {
  kind: 'space',
  view: VIEW,
  points: { O: [0, 0, 0], b1: screenPoint(-2.9, 0.95), b2: screenPoint(2.9, 0.95), b3: screenPoint(-2.9, -0.95), b4: screenPoint(2.9, -0.95) },
  solids: [{ type: 'sphere', center: 'O', radius: 2.5, tone: 'slate', fill: false }],
  segments: [{ from: 'b1', to: 'b2', dashed: true, tone: 'rose' }, { from: 'b3', to: 'b4', dashed: true, tone: 'rose' }],
  hidden: ['b1', 'b2', 'b3', 'b4'],
  labels: { O: 'n' },
  ariaLabel: 'الشكل 2: نفس الدائرة، ونطاق محدود بخطين أفقيين متقطعين فوق O وتحتها نرسم داخله باليد الحرة دائرة كبرى بيضوية الشكل: جزؤها الأمامي مستمر والخلفي متقطع',
  maxWidth: 320,
};
/** الشكل 3 : la représentation — le contour, et la دائرة كبرى horizontale en ellipse, avant plein, arrière pointillé. */
export const FIG_DRAW_3 = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0] },
  solids: [{ type: 'sphere', center: 'O', radius: 2.5, tone: 'indigo' }],
  labels: { O: 'n' },
  ariaLabel: 'الشكل 3: تمثيل الكرة: الدائرة الكفاف، والدائرة الكبرى الأفقية بشكل بيضوي جزؤها الأمامي بخط مستمر والخلفي بخط متقطع',
  maxWidth: 320,
};

/** طرائق « تمثيل نقطة » — la figure DONNÉE (plane) : le contour et trois points qu'on ne distingue pas. */
export const FIG_POINT_GIVEN = {
  points: { O: [0, 0], A: [0.6, 0.9], B: [-0.4, -0.9] },
  circles: [{ center: 'O', radius: 2 }],
  labels: { O: 'e', A: 'e', B: 'w' },
  ariaLabel: 'دائرة مركزها O وبداخلها النقطتان A و B: على الرسم المستوي لا نميّز النقطة التي على الكرة من التي داخلها',
  maxWidth: 300,
};
/** La solution : A sur la دائرة كبرى horizontale (arrière), B sur le rayon [OM] d'une دائرة كبرى méridienne. */
export const FIG_POINT_SOLUTION = {
  kind: 'space',
  view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], A: [1.2, 1.6, 0], M: [-1, -1, -1.414214], B: [-0.5, -0.5, -0.707107] },
  solids: [{ type: 'sphere', center: 'O', radius: 2, tone: 'slate' }],
  circles: [{ center: 'O', radius: 2, normal: [1, -1, 0], on: 0, tone: 'rose' }],
  segments: [{ from: 'O', to: 'A', dashed: true, label: 'R' }, { from: 'O', to: 'M', dashed: true, tone: 'rose' }],
  labels: { O: 'n', A: 'n', M: 'sw', B: 'w' },
  ariaLabel: 'تمثيل النقطتين: A على الدائرة الكبرى الأفقية التي نصف قطرها [OA]، و B على نصف القطر [OM] لدائرة كبرى أخرى تمر بـ M',
  maxWidth: 360,
};

/** دوري الآن ص 167 — figure de la plateforme : la دائرة كبرى du plan (OAB), la corde [AB] de (d), I milieu de [AB]. */
export const FIG_NOW167 = {
  kind: 'space',
  view: { azimuth: -86, elevation: 14 },
  points: { O: [0, 0, 0], A: [-1, 0, S3], B: [1, 0, S3], I: [0, 0, S3], d1: [-2.6, 0, S3], d2: [3.3, 0, S3] },
  solids: [{ type: 'sphere', center: 'O', radius: 2, tone: 'sky' }],
  circles: [{ center: 'O', radius: 2, normal: 'y', on: 0, tone: 'indigo' }],
  segments: [
    { from: 'd1', to: 'd2', tone: 'rose' }, { from: 'B', to: 'd2', label: '(d)', tone: 'rose' },
    { from: 'O', to: 'A', label: '2' }, { from: 'O', to: 'B' }, { from: 'O', to: 'I', dashed: true },
  ],
  rightAngles: [['O', 'I', 'B']],
  hidden: ['d1', 'd2'],
  labels: { O: 's', A: 'nw', B: 'ne', I: 'n' },
  ariaLabel: 'كرة مركزها O ونصف قطرها 2 cm؛ المستقيم (d) يقطعها في A و B حيث AB = 2 cm، و I منتصف [AB]، والمستوي (OAB) يقطع الكرة وفق دائرة كبرى',
  maxWidth: 380,
};
