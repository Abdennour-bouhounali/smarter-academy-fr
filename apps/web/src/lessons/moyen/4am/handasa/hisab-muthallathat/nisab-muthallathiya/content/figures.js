/**
 * Les FIGURES du درس « النسب المثلثية لزاوية حادة في مثلث قائم », redessinées en données GeoFigure
 * (common/components/geoFigure.js) d'après les figures du manuel (pp. 115–124, docs/sources/4am/unit10/extraction.json ›
 * figure, et le scan rendu page à page). Aucune image : des points, des segments, des angles.
 *
 * Les coordonnées sont CALCULÉES pour que la figure dise vrai : l'angle marqué 25° mesure 25°, l'angle droit est droit
 * (le troisième sommet est placé par cos / sin de l'angle donné). Les longueurs portées sont celles du manuel.
 * Le banc d'exercices dessine ses `statement.figure` avec les mêmes conventions.
 */
const r3 = (x) => Math.round(x * 1000) / 1000;
const rad = (d) => (d * Math.PI) / 180;
/** Le point à distance `len` de `o` dans la direction `deg` (degrés, y vers le haut). */
const at = (o, deg, len) => [r3(o[0] + len * Math.cos(rad(deg))), r3(o[1] + len * Math.sin(rad(deg)))];

/* ── أستعدّ 4 : ABC قائم في A (A en bas à gauche, B au-dessus, C à droite) ── */
export const FIG_PREP4 = {
  points: { A: [0, 0], B: [0, 3], C: [4.5, 0] },
  segments: [['A', 'B'], ['A', 'C'], ['B', 'C']],
  rightAngles: [['B', 'A', 'C']],
  ariaLabel: 'مثلث ABC قائم في A: الرأس B فوق A والرأس C على يمينه',
  maxWidth: 300,
};

/* ── أستعدّ 6 : ABC قائم في C, ABC = 59° ── */
export const FIG_PREP6 = {
  points: { C: [0, 0], B: [3, 0], A: [0, r3(3 * Math.tan(rad(59)))] },
  segments: [['A', 'C'], ['C', 'B'], ['A', 'B']],
  rightAngles: [['A', 'C', 'B']],
  angles: [{ at: 'B', from: 'C', to: 'A', label: '59°' }],
  ariaLabel: 'مثلث ABC قائم في C، والزاوية ABC قيسها 59 درجة',
  maxWidth: 300,
};

/* ── نشاط 1 : ABC قائم في A, A en bas à droite, B au-dessus, C loin à gauche ; Ĉ = 25° ── */
export const FIG_ACT1 = {
  points: { A: [0, 0], C: [-6, 0], B: [0, r3(6 * Math.tan(rad(25)))] },
  segments: [['A', 'B'], ['A', 'C'], ['B', 'C']],
  rightAngles: [['B', 'A', 'C']],
  angles: [{ at: 'C', from: 'A', to: 'B', label: '25°', radius: 34 }],
  ariaLabel: 'مثلث ABC قائم في A، والزاوية C قيسها 25 درجة',
  maxWidth: 340,
};

/* ── نشاط 2 (من التخمين إلى البرهان) : [Bx) et [By), (AC) et (A′C′) perpendiculaires à [Bx) ── */
const TAN_Y = Math.tan(rad(28));
export const FIG_ACT2 = {
  points: {
    B: [0, 0], A: [3, 0], "A'": [5.2, 0], x: [6.4, 0],
    C: [3, r3(3 * TAN_Y)], "C'": [5.2, r3(5.2 * TAN_Y)], y: [6.4, r3(6.4 * TAN_Y)],
  },
  segments: [['B', 'x'], ['B', 'y'], ['A', 'C'], ["A'", "C'"]],
  rightAngles: [['B', 'A', 'C'], ['B', "A'", "C'"]],
  labels: { A: 's', "A'": 's', x: 'e', y: 'e' },
  ariaLabel: 'نصفا مستقيمين [Bx) و [By) من B، النقطتان A و A′ على [Bx) والنقطتان C و C′ على [By)، والمستقيمان (AC) و (A′C′) عموديان على [Bx)',
  maxWidth: 340,
};

/* ── نشاط 3 : ABC قائم في A (A en bas à gauche, B en bas à droite, C au-dessus de A) ── */
export const FIG_ACT3 = {
  points: { A: [0, 0], B: [5, 0], C: [0, 3.5] },
  segments: [{ from: 'B', to: 'C', tone: 'amber', bold: true }, { from: 'A', to: 'C', tone: 'rose' }, { from: 'A', to: 'B', tone: 'sky' }],
  rightAngles: [['B', 'A', 'C']],
  angles: [{ at: 'B', from: 'A', to: 'C' }],
  ariaLabel: 'مثلث ABC قائم في A، والزاوية الحادة B: الوتر [BC]، الضلع المقابل [AC]، الضلع المجاور [AB]',
  maxWidth: 320,
};

/* ── معارف 1 : EFG قائم في G, FG = 3, GE = 2, EF = √13 ── */
export const FIG_KNOW1_EFG = {
  points: { G: [0, 0], E: [2, 0], F: [0, 3] },
  segments: [{ from: 'F', to: 'G', label: '3' }, { from: 'G', to: 'E', label: '2' }, { from: 'E', to: 'F', label: '√13' }],
  rightAngles: [['F', 'G', 'E']],
  angles: [{ at: 'E', from: 'G', to: 'F' }],
  ariaLabel: 'مثلث EFG قائم في G حيث FG = 3 و GE = 2 و EF = جذر 13',
  maxWidth: 260,
};

/* ── معارف 2 : EFG قائم في F, FG = 3, EG = 6, EF = 3√3, Ê = 30°, Ĝ = 60° ── */
export const FIG_KNOW2_EFG = {
  points: { F: [0, 0], E: [r3(3 * Math.sqrt(3)), 0], G: [0, 3] },
  segments: [{ from: 'F', to: 'G', label: '3' }, { from: 'E', to: 'G', label: '6' }, { from: 'F', to: 'E', label: '3√3' }],
  rightAngles: [['G', 'F', 'E']],
  angles: [{ at: 'E', from: 'F', to: 'G', label: '30°', radius: 30 }, { at: 'G', from: 'F', to: 'E', label: '60°' }],
  ariaLabel: 'مثلث EFG قائم في F حيث FG = 3 و EG = 6 و EF = 3 جذر 3، والزاوية E قيسها 30 درجة والزاوية G قيسها 60 درجة',
  maxWidth: 320,
};

/* ── معارف — مثلث المنصة PQR قائم في Q (PQ = 5, QR = 12, PR = 13) ── */
export const FIG_PQR = {
  points: { Q: [0, 0], P: [5, 0], R: [0, 12] },
  segments: [{ from: 'P', to: 'Q', label: '5' }, { from: 'Q', to: 'R', label: '12' }, { from: 'P', to: 'R', label: '13' }],
  rightAngles: [['P', 'Q', 'R']],
  ariaLabel: 'مثلث PQR قائم في Q حيث PQ = 5 و QR = 12 و PR = 13',
  maxWidth: 220,
};

/* ── طرائق : les trois figures ── */
export const FIG_METHOD_SIN = {
  points: { A: [0, 0], C: [2.5, 0], B: [0, r3(2.5 / Math.tan(rad(25)))] },
  segments: [['A', 'B'], { from: 'A', to: 'C', label: '2,5 cm' }, ['B', 'C']],
  rightAngles: [['B', 'A', 'C']],
  angles: [{ at: 'B', from: 'A', to: 'C', label: '25°', radius: 30 }],
  ariaLabel: 'مثلث ABC قائم في A حيث AC = 2,5 سنتيمتر والزاوية B قيسها 25 درجة',
  maxWidth: 220,
};
const S_COS = at([0, 0], 15, 3.5 * Math.cos(rad(37)));
export const FIG_METHOD_COS = {
  points: { R: [0, 0], S: S_COS, T: at([0, 0], -22, 3.5) },
  segments: [['R', 'S'], ['S', 'T'], { from: 'R', to: 'T', label: '3,5 cm' }],
  rightAngles: [['R', 'S', 'T']],
  angles: [{ at: 'R', from: 'T', to: 'S', label: '37°', radius: 34 }],
  ariaLabel: 'مثلث RST قائم في S حيث RT = 3,5 سنتيمتر والزاوية R قيسها 37 درجة',
  maxWidth: 300,
};
export const FIG_METHOD_TAN = {
  points: { E: [0, 0], F: at([0, 0], 30, 4.5), G: at([0, 0], -23, 4.5 / Math.cos(rad(53))) },
  segments: [{ from: 'E', to: 'F', label: '4,5 cm' }, ['F', 'G'], ['E', 'G']],
  rightAngles: [['E', 'F', 'G']],
  angles: [{ at: 'E', from: 'G', to: 'F', label: '53°', radius: 30 }],
  ariaLabel: 'مثلث EFG قائم في F حيث EF = 4,5 سنتيمتر والزاوية E قيسها 53 درجة',
  maxWidth: 320,
};

/* ── أوظّف : تمرين 5, 6, 14, 15 ── */
export const FIG_EX5 = {
  points: { B: [0, 0], K: at([0, 0], 200, 14), C: at([0, 0], -70, 17) },
  segments: [{ from: 'K', to: 'B', label: '14 cm' }, { from: 'B', to: 'C', label: '17 cm' }, ['K', 'C']],
  rightAngles: [['K', 'B', 'C']],
  angles: [{ at: 'K', from: 'B', to: 'C' }],
  ariaLabel: 'مثلث KBC قائم في B حيث KB = 14 سنتيمتر و BC = 17 سنتيمتر',
  maxWidth: 300,
};
export const FIG_EX6 = {
  points: { S: [0, 0], J: [r3(-10 * Math.sin(rad(55))), 0], K: [0, r3(-10 * Math.cos(rad(55)))] },
  segments: [['J', 'S'], ['S', 'K'], { from: 'J', to: 'K', label: '10 cm' }],
  rightAngles: [['J', 'S', 'K']],
  angles: [{ at: 'K', from: 'S', to: 'J', label: '55°', radius: 28 }],
  ariaLabel: 'مثلث JSK قائم في S حيث JK = 10 سنتيمتر والزاوية K قيسها 55 درجة',
  maxWidth: 320,
};
export const FIG_EX14 = {
  points: { O: [0, 0], A: [-3, 0], F: [-6, 0], B: [-3, 1.6], E: [-6, 3.2] },
  segments: [['O', 'F'], ['O', 'E'], ['A', 'B'], ['F', 'E']],
  rightAngles: [['O', 'A', 'B'], ['O', 'F', 'E']],
  angles: [{ at: 'O', from: 'A', to: 'B' }],
  ariaLabel: 'النقطتان A و F على نصف مستقيم أفقي من O، والنقطتان B و E على نصف مستقيم مائل من O، والمثلثان OAB و OFE قائمان في A و F',
  maxWidth: 340,
};
export const FIG_EX15 = {
  points: { B: [0, 0], A: [6.3, 0], C: [0, -8.4] },
  segments: [['B', 'A'], { from: 'B', to: 'C', label: '8,4 cm' }, { from: 'A', to: 'C', label: '10,5 cm' }],
  rightAngles: [['A', 'B', 'C']],
  angles: [{ at: 'A', from: 'B', to: 'C' }],
  ariaLabel: 'مثلث ABC قائم في B حيث BC = 8,4 سنتيمتر و AC = 10,5 سنتيمتر',
  maxWidth: 260,
};

/* ── أؤكّد تعلّماتي 1, 2, 3, 5 (p. 124) ── */
export const FIG_QCM1 = {
  points: { M: [0, 0], O: [5, 0], B: [5, 2.5] },
  segments: [['M', 'O'], ['O', 'B'], ['M', 'B']],
  rightAngles: [['M', 'O', 'B']],
  angles: [{ at: 'M', from: 'O', to: 'B' }],
  ariaLabel: 'مثلث MOB قائم في O',
  maxWidth: 300,
};
export const FIG_QCM2 = {
  points: { M: [0, 0], L: [0, 2.5], N: [6, 0] },
  segments: [['L', 'M'], ['M', 'N'], ['L', 'N']],
  rightAngles: [['L', 'M', 'N']],
  angles: [{ at: 'L', from: 'M', to: 'N' }],
  ariaLabel: 'مثلث LMN قائم في M',
  maxWidth: 300,
};
export const FIG_QCM3 = {
  points: { B: [0, 0], A: [0, 7], C: [r3(7 / Math.tan(rad(35))), 0] },
  segments: [{ from: 'A', to: 'B', label: '7' }, ['B', 'C'], ['A', 'C']],
  rightAngles: [['A', 'B', 'C']],
  angles: [{ at: 'C', from: 'B', to: 'A', label: '35°', radius: 30 }],
  ariaLabel: 'مثلث ABC قائم في B حيث AB = 7 والزاوية C قيسها 35 درجة',
  maxWidth: 300,
};
export const FIG_QCM5 = {
  points: { I: [0, 0], L: [0, 6], E: [r3(6 * Math.tan(rad(50))), 0] },
  segments: [{ from: 'L', to: 'I', label: '6 cm' }, ['I', 'E'], ['L', 'E']],
  rightAngles: [['L', 'I', 'E']],
  angles: [{ at: 'L', from: 'I', to: 'E', label: '50°', radius: 26 }],
  ariaLabel: 'مثلث LIE قائم في I حيث IL = 6 سنتيمتر والزاوية L قيسها 50 درجة',
  maxWidth: 300,
};
