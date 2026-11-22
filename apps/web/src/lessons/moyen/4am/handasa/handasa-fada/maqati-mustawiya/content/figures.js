/**
 * Les FIGURES DE L'ESPACE du درس « المقاطع المستوية للمجسمات المألوفة » — des données SpaceFigure (lessons/common/components/
 * spaceFigure.js : points 3D z vers le haut, parties cachées en pointillés CALCULÉES). Chaque figure du manuel a été analysée
 * (guide §5 « Textbook figures ») :
 *   • نشاط 2, معارف 3 (sphères) : bien conçues — reproduites, le plan (P) translucide, le triangle OAM rectangle ;
 *   • نشاط 3 : les deux figures de chaque partie reproduites ; la partie 2 est redessinée sans l'étiquette « I » égarée
 *     (extraction › discrepancies) et vue plus haut pour que M, N, C, G ne se touchent pas ;
 *   • نشاط 4, 5, طرائق, دوري الآن : reproduits (H, pied de la perpendiculaire, nommé quand la réponse s'en sert).
 * Les dimensions que le manuel ne donne pas (R des figures de معارف 3, la hauteur de la pyramide, la position d'une coupe)
 * sont celles de l'extraction (`reading`) et n'influent sur aucune réponse. Tout est vérifié par content/figures.test.js
 * (validateSpaceFigure, spaceFigureQuality, et les longueurs que la leçon affirme recalculées sur les points dessinés).
 */
import { cuboidPoints, cuboidFaces } from '../../../../../../common/components/spaceFigure.js';

const r3 = (x) => Math.round(x * 1000) / 1000;
const S5 = Math.sqrt(5);
const S3 = Math.sqrt(3);
const CAP = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';
/** Un plan horizontal (P) : un carré de demi-côté c à la hauteur z (points cachés P1…P4). */
const hPlane = (c, z, cx = 0, cy = 0) => ({ P1: [cx - c, cy - c, z], P2: [cx + c, cy - c, z], P3: [cx + c, cy + c, z], P4: [cx - c, cy + c, z] });
const PLANE = { points: ['P1', 'P2', 'P3', 'P4'], tone: 'sky', label: '(P)' };
const HIDE = ['P1', 'P2', 'P3', 'P4'];
// le pavé du manuel : la face du haut D C B A (D devant à gauche), celle du bas H G F E (H sous D)
const CUBOID = 'DCBAHGFE';

/** نشاط 2 — la sphère (d) de rayon 3, le plan (P) perpendiculaire à [NS] en I (dessiné pour x = 2), le cercle de section et M. */
export const FIG_ACT2 = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { O: [0, 0, 0], N: [0, 0, 3], S: [0, 0, -3], I: [0, 0, 2], M: [r3(-S5 * 0.94), r3(-S5 * 0.342), 2], ...hPlane(3.6, 2) },
  solids: [{ type: 'sphere', center: 'O', radius: 3 }],
  circles: [{ center: 'I', radius: r3(S5), normal: 'z', on: 0, tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: 'N', to: 'S', dashed: true }, { from: 'I', to: 'M', tone: 'rose' }, { from: 'O', to: 'M', label: '3' }],
  rightAngles: [['O', 'I', 'M']],
  labels: { N: 'nw', I: 'ne', S: 'sw' },
  hidden: HIDE,
  ariaLabel: 'كرة (d) مركزها O ونصف قطرها 3، قطرها [NS] شاقولي، يقطعها المستوي (P) العمودي على (NS) في I وفق دائرة عليها النقطة M، والمثلث OIM قائم في I',
  maxWidth: 420,
};

const cub = (extra = {}) => ({ ...cuboidPoints(CUBOID, { length: 25, width: 20, height: 6 }), ...extra });
const CUBOID_SOLID = [{ type: 'polyhedron', faces: cuboidFaces(CUBOID) }];
const DIMS = [{ from: 'D', to: 'C', label: '25 cm' }, { from: 'A', to: 'D', label: '20 cm' }, { from: 'H', to: 'D', label: '6 cm' }];

/** نشاط 3، 1) الشكل (1) : un plan parallèle à CBFG coupe selon IJKL (le bon). */
export const FIG_ACT3_FACE_1 = {
  kind: 'space', view: { azimuth: -58, elevation: 28 },
  points: cub({ I: [10, 0, 6], J: [10, 20, 6], K: [10, 20, 0], L: [10, 0, 0] }),
  solids: CUBOID_SOLID,
  sections: [{ points: ['I', 'J', 'K', 'L'], tone: 'emerald', label: '(P)' }],
  segments: DIMS,
  ariaLabel: 'الشكل (1): بلاطة قائمة ABCDEFGH يقطعها مستو موازٍ للوجه CBFG وفق الرباعي IJKL',
  caption: 'الشكل (1)', maxWidth: 480,
};
/** نشاط 3، 1) الشكل (2) : le plan contient l'arête [GF] — il coupe selon IJFG (le mauvais). */
export const FIG_ACT3_FACE_2 = {
  kind: 'space', view: { azimuth: -58, elevation: 28 },
  points: cub({ I: [10, 0, 6], J: [10, 20, 6] }),
  solids: CUBOID_SOLID,
  sections: [{ points: ['I', 'J', 'F', 'G'], tone: 'amber', label: '(P)' }],
  segments: DIMS,
  ariaLabel: 'الشكل (2): نفس البلاطة يقطعها مستو مائل يشمل الحرف [GF] وفق الرباعي IJFG',
  caption: 'الشكل (2)', maxWidth: 480,
};
/** نشاط 3، 2) الشكل (1) : le plan passe par M, N et le sommet G — le triangle MNG (le mauvais). Redessiné sans le « I » égaré. */
export const FIG_ACT3_EDGE_1 = {
  kind: 'space', view: { azimuth: -40, elevation: 34 },
  points: cub({ M: [21, 0, 6], N: [25, 3, 6] }),
  solids: CUBOID_SOLID,
  sections: [{ points: ['M', 'N', 'G'], tone: 'amber' }],
  labels: { M: 'n', N: 'e', C: 'ne' },
  ariaLabel: 'الشكل (1): بلاطة قائمة يقطعها مستو يشمل M من [DC] و N من [CB] والرأس G وفق المثلث MNG',
  caption: `الشكل (1) — ${CAP}`, maxWidth: 480,
};
/** نشاط 3، 2) الشكل (2) : le plan vertical par M et N coupe selon le rectangle MNPO (le bon). */
export const FIG_ACT3_EDGE_2 = {
  kind: 'space', view: { azimuth: -40, elevation: 34 },
  points: cub({ M: [21, 0, 6], N: [25, 3, 6], P: [25, 3, 0], O: [21, 0, 0] }),
  solids: CUBOID_SOLID,
  sections: [{ points: ['M', 'N', 'P', 'O'], tone: 'emerald' }],
  labels: { M: 'n', N: 'e', C: 'ne', O: 's', P: 'se' },
  ariaLabel: 'الشكل (2): نفس البلاطة يقطعها مستو شاقولي يشمل M و N ويوازي الحرف [CG] وفق المستطيل MNPO',
  caption: `الشكل (2) — ${CAP}`, maxWidth: 480,
};

const CYL = { type: 'cylinder', base: "O'", top: 'O', radius: 1.7 };
/** نشاط 4، الشكل (1) : un plan parallèle à l'axe, à OH = 0,8 de l'axe, coupe selon le rectangle KILJ. */
export const FIG_ACT4_AXIS = {
  kind: 'space', view: { azimuth: -40, elevation: 22 },
  points: { "O'": [0, 0, 0], O: [0, 0, 6], H: [-0.8, 0, 6], K: [-0.8, 1.5, 6], I: [-0.8, -1.5, 6], L: [-0.8, -1.5, 0], J: [-0.8, 1.5, 0] },
  solids: [CYL],
  sections: [{ points: ['K', 'I', 'L', 'J'], tone: 'emerald' }],
  segments: [{ from: "O'", to: 'O', dashed: true }, { from: 'O', to: 'H', dashed: true, tone: 'rose' }],
  rightAngles: [['O', 'H', 'I']],
  labels: { H: 'n', O: 'ne', K: 'nw', I: 'se' },
  ariaLabel: 'الشكل (1): أسطوانة دوران محورها (OO′) يقطعها مستو موازٍ لمحورها وفق المستطيل KILJ، و H المسقط العمودي لـ O على [KI]',
  caption: 'الشكل (1)', maxWidth: 480,
};
/** نشاط 4، الشكل (2) : un plan parallèle à la base coupe selon un cercle de centre B. */
export const FIG_ACT4_BASE = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { "O'": [0, 0, 0], O: [0, 0, 6], B: [0, 0, 3.5], R1: [1.7, 0, 3.5], ...hPlane(2.6, 3.5) },
  solids: [CYL],
  circles: [{ center: 'B', radius: 1.7, normal: 'z', tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: "O'", to: 'O', dashed: true }, { from: 'B', to: 'R1', tone: 'rose' }],
  hidden: [...HIDE, 'R1'],
  labels: { B: 'nw' },
  ariaLabel: 'الشكل (2): نفس الأسطوانة يقطعها مستو موازٍ لقاعدتها وفق دائرة مركزها B على المحور',
  caption: 'الشكل (2)', maxWidth: 420,
};

const PYR_FACES = [['A', 'B', 'C', 'D'], ['S', 'A', 'B'], ['S', 'B', 'C'], ['S', 'C', 'D'], ['S', 'D', 'A']];
/** نشاط 5 — le هرم منتظم SABCD (AB = 4, hauteur 6 choisie), le plan (P) parallèle à la base par E (SE = 3/4 SA). */
export const FIG_ACT5 = {
  kind: 'space', view: { azimuth: -64, elevation: 16 },
  points: {
    S: [0, 0, 6], A: [-2, -2, 0], B: [2, -2, 0], C: [2, 2, 0], D: [-2, 2, 0],
    E: [-1.5, -1.5, 1.5], F: [1.5, -1.5, 1.5], G: [1.5, 1.5, 1.5], H: [-1.5, 1.5, 1.5], ...hPlane(2.7, 1.5),
  },
  solids: [{ type: 'polyhedron', faces: PYR_FACES }],
  sections: [{ points: ['E', 'F', 'G', 'H'], tone: 'rose' }],
  planes: [PLANE],
  hidden: HIDE,
  labels: { E: 'w', F: 'e', G: 'ne', H: 'nw' },
  ariaLabel: 'هرم منتظم SABCD قاعدته المربع ABCD، يقطعه المستوي (P) الموازي للقاعدة والذي يشمل E من [SA] وفق الرباعي EFGH',
  maxWidth: 480,
};

const SPH2 = [{ type: 'sphere', center: 'O', radius: 2 }];
/** معارف 3 أ) — 0 < h < R : R = 2, h = 1,2 (choisis), AM = 1,6. */
export const FIG_KNOW3_IN = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { O: [0, 0, 0], N: [0, 0, 2], S: [0, 0, -2], A: [0, 0, 1.2], M: [r3(-1.6 * 0.94), r3(-1.6 * 0.342), 1.2], ...hPlane(2.5, 1.2) },
  solids: SPH2,
  circles: [{ center: 'A', radius: 1.6, normal: 'z', on: 0, tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: 'O', to: 'A', dashed: true }, { from: 'A', to: 'M', tone: 'rose' }, { from: 'O', to: 'M' }, { from: 'A', to: 'S', dashed: true }],
  rightAngles: [['O', 'A', 'M']],
  labels: { N: 'nw', A: 'ne' },
  hidden: HIDE,
  ariaLabel: 'إذا كان 0 < h < R: المستوي (P) يقطع الكرة (S) وفق دائرة مركزها A، والمثلث OAM قائم في A',
  caption: '\u20660 < h < R\u2069', maxWidth: 300,
};
/** معارف 3 أ) — h = 0 : le plan passe par O, دائرة كبرى. */
export const FIG_KNOW3_ZERO = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { O: [0, 0, 0], N: [0, 0, 2], S: [0, 0, -2], M: [r3(-2 * 0.94), r3(-2 * 0.342), 0], ...hPlane(2.6, 0) },
  solids: [{ type: 'sphere', center: 'O', radius: 2, equator: false }],
  circles: [{ center: 'O', radius: 2, normal: 'z', on: 0, tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: 'O', to: 'M', tone: 'rose', label: 'R' }, { from: 'N', to: 'S', dashed: true }],
  labels: { N: 'nw' },
  hidden: HIDE,
  ariaLabel: 'إذا كان h = 0: المستوي (P) يشمل المركز O، والمقطع دائرة كبرى مركزها O ونصف قطرها R',
  caption: '\u2066h = 0\u2069', maxWidth: 300,
};
/** معارف 3 أ) — h = R : le plan touche la sphère en S. */
export const FIG_KNOW3_TANGENT = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { O: [0, 0, 0], N: [0, 0, 2], S: [0, 0, -2], M: [r3(-2 * 0.94), r3(-2 * 0.342), 0], ...hPlane(2.4, -2) },
  solids: SPH2,
  planes: [PLANE],
  segments: [{ from: 'O', to: 'M', label: 'R' }, { from: 'N', to: 'S', dashed: true }],
  labels: { S: 'se', N: 'nw' },
  hidden: HIDE,
  ariaLabel: 'إذا كان h = R: المستوي (P) مماس للكرة في النقطة S',
  caption: '\u2066h = R\u2069', maxWidth: 300,
};

const SMALL = 'DCBAHGFE';
const smallCub = (extra) => ({ ...cuboidPoints(SMALL, { length: 6, width: 4, height: 3 }), ...extra });
/** معارف 3 ب) — parallèle à une face (ADHE) : le rectangle IJKL. */
export const FIG_KNOW3_CUBOID_FACE = {
  kind: 'space', view: { azimuth: -58, elevation: 26 },
  points: smallCub({ I: [2, 4, 3], J: [2, 0, 3], K: [2, 0, 0], L: [2, 4, 0] }),
  solids: [{ type: 'polyhedron', faces: cuboidFaces(SMALL) }],
  sections: [{ points: ['I', 'J', 'K', 'L'], tone: 'emerald' }],
  ariaLabel: 'بلاطة قائمة يقطعها مستو موازٍ للوجه ADHE وفق المستطيل IJKL',
  caption: 'مستو موازٍ لوجه', maxWidth: 480,
};
/** معارف 3 ب) — parallèle à une arête ([AE]) : le rectangle IJKL, IL = AE. */
export const FIG_KNOW3_CUBOID_EDGE = {
  kind: 'space', view: { azimuth: -58, elevation: 26 },
  points: smallCub({ I: [1, 4, 3], J: [5, 0, 3], K: [5, 0, 0], L: [1, 4, 0] }),
  solids: [{ type: 'polyhedron', faces: cuboidFaces(SMALL) }],
  sections: [{ points: ['I', 'J', 'K', 'L'], tone: 'emerald' }],
  ariaLabel: 'بلاطة قائمة يقطعها مستو موازٍ للحرف [AE] وفق المستطيل IJKL',
  caption: 'مستو موازٍ لحرف', maxWidth: 480,
};
/** معارف 3 جـ) — parallèle à la base : un cercle de rayon R (R = 2, h = 4 choisis). */
export const FIG_KNOW3_CYL_BASE = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { "O'": [0, 0, 0], O: [0, 0, 4], B: [0, 0, 2.5], R1: [2, 0, 2.5], ...hPlane(3, 2.5) },
  solids: [{ type: 'cylinder', base: "O'", top: 'O', radius: 2 }],
  circles: [{ center: 'B', radius: 2, normal: 'z', tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: "O'", to: 'O', dashed: true }, { from: 'B', to: 'R1', tone: 'rose', label: 'R' }],
  hidden: [...HIDE, 'R1'],
  labels: { B: 'nw' },
  ariaLabel: 'أسطوانة دوران يقطعها مستو موازٍ لقاعدتها وفق دائرة نصف قطرها R ومركزها B على المحور',
  caption: 'مستو موازٍ للقاعدة', maxWidth: 360,
};
/** معارف 3 جـ) — parallèle à l'axe : le rectangle ABCD, BC = h. */
export const FIG_KNOW3_CYL_AXIS = {
  kind: 'space', view: { azimuth: -40, elevation: 22 },
  points: { "O'": [0, 0, 0], O: [0, 0, 4], A: [1, r3(-S3), 4], B: [1, r3(S3), 4], C: [1, r3(S3), 0], D: [1, r3(-S3), 0] },
  solids: [{ type: 'cylinder', base: "O'", top: 'O', radius: 2 }],
  sections: [{ points: ['A', 'B', 'C', 'D'], tone: 'emerald' }],
  segments: [{ from: "O'", to: 'O', dashed: true }],
  ariaLabel: 'أسطوانة دوران يقطعها مستو موازٍ لمحورها وفق المستطيل ABCD',
  caption: 'مستو موازٍ للمحور', maxWidth: 360,
};
/** د) (ajout déclaré) — un cône de rayon 3 et de hauteur 6 coupé parallèlement à la base à SO′ = 2 : un cercle de rayon 1. */
export const FIG_KNOW_CONE = {
  kind: 'space', view: { azimuth: -62, elevation: 18 },
  points: { O: [0, 0, 0], S: [0, 0, 6], "O'": [0, 0, 4], R0: [3, 0, 0], R1: [1, 0, 4], ...hPlane(2.2, 4) },
  solids: [{ type: 'cone', base: 'O', apex: 'S', radius: 3 }],
  circles: [{ center: "O'", radius: 1, normal: 'z', tone: 'rose', bold: true }],
  planes: [PLANE],
  segments: [{ from: 'O', to: 'S', dashed: true }, { from: 'O', to: 'R0', label: 'R' }, { from: "O'", to: 'R1', tone: 'rose', label: 'r' }],
  hidden: [...HIDE, 'R0', 'R1'],
  labels: { "O'": 'nw', O: 'sw' },
  ariaLabel: 'مخروط دوران رأسه S وقاعدته دائرة مركزها O، يقطعه مستو موازٍ للقاعدة وفق دائرة مركزها O′ على المحور',
  caption: 'مستو موازٍ لقاعدة مخروط', maxWidth: 340,
};

/** طرائق ص 169 — la sphère de rayon 2,5, O′ à 1,5 de O, M sur le cercle : le triangle OO′M rectangle en O′. */
export const FIG_METHOD = {
  kind: 'space', view: { azimuth: -62, elevation: 20 },
  points: { O: [0, 0, 0], "O'": [0, 0, 1.5], M: [r3(-2 * 0.94), r3(-2 * 0.342), 1.5], ...hPlane(3, 1.5) },
  solids: [{ type: 'sphere', center: 'O', radius: 2.5 }],
  circles: [{ center: "O'", radius: 2, normal: 'z', on: 0, tone: 'rose', bold: true }],
  planes: [{ ...PLANE, tone: 'amber' }],
  segments: [{ from: 'O', to: "O'", label: '1,5' }, { from: "O'", to: 'M', tone: 'rose' }, { from: 'O', to: 'M', dashed: true, label: '2,5' }],
  rightAngles: [['O', "O'", 'M']],
  labels: { "O'": 'ne' },
  hidden: HIDE,
  ariaLabel: 'كرة مركزها O ونصف قطرها 2,5 يقطعها المستوي (P) وفق دائرة مركزها O′ حيث OO′ = 1,5، و M نقطة من الدائرة',
  maxWidth: 400,
};

/** دوري الآن ص 169 — la أسطوانة h = 3, r = 2 ; le plan à 1 de l'axe coupe selon ABCD ; H pied de la perpendiculaire (nom de la plateforme). */
export const FIG_NOW169 = {
  kind: 'space', view: { azimuth: -62, elevation: 22 },
  points: { "O'": [0, 0, 0], O: [0, 0, 3], H: [0, -1, 3], A: [r3(-S3), -1, 3], B: [r3(S3), -1, 3], C: [r3(S3), -1, 0], D: [r3(-S3), -1, 0] },
  solids: [{ type: 'cylinder', base: "O'", top: 'O', radius: 2 }],
  sections: [{ points: ['A', 'B', 'C', 'D'], tone: 'emerald' }],
  segments: [{ from: "O'", to: 'O', dashed: true }, { from: 'O', to: 'H', tone: 'rose', dashed: true }],
  rightAngles: [['O', 'H', 'B']],
  hidden: ["O'"],
  labels: { H: 'sw', O: 'n' },
  ariaLabel: 'أسطوانة دوران ارتفاعها 3 ونصف قطر قاعدتها 2 يقطعها مستو موازٍ لمحورها وفق الرباعي ABCD، و H المسقط العمودي لـ O على (AB)',
  maxWidth: 380,
};

/** إختبار أولي E5 — un هرم منتظم de base 10 (hauteur 12 choisie) coupé par le plan parallèle à la base par E (SE = 2/5 SA). Sans aucune longueur de la section. */
export const FIG_TEST_PYRAMID = {
  kind: 'space', view: { azimuth: -64, elevation: 16 },
  points: {
    S: [0, 0, 12], A: [-5, -5, 0], B: [5, -5, 0], C: [5, 5, 0], D: [-5, 5, 0],
    E: [-2, -2, 7.2], F: [2, -2, 7.2], G: [2, 2, 7.2], H: [-2, 2, 7.2], ...hPlane(4.2, 7.2),
  },
  solids: [{ type: 'polyhedron', faces: PYR_FACES }],
  sections: [{ points: ['E', 'F', 'G', 'H'], tone: 'rose' }],
  planes: [PLANE],
  hidden: HIDE,
  labels: { E: 'w', F: 'e', G: 'ne', H: 'nw' },
  ariaLabel: 'هرم منتظم SABCD قاعدته مربع، يقطعه مستو موازٍ للقاعدة وفق الرباعي EFGH حيث E من [SA]',
  maxWidth: 480,
};
