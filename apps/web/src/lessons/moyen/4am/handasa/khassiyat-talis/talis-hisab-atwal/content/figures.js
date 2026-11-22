/**
 * Les FIGURES du درس « خاصية طالس وحساب الأطوال », redessinées en données GeoFigure
 * (common/components/geoFigure.js) d'après les figures du manuel (pp. 103–112,
 * docs/sources/4am/unit9/extraction.json › figure). Aucune image : des points, des segments, des droites.
 *
 * Les coordonnées sont CALCULÉES pour que la figure dise vrai : un point « image » est k fois un point
 * (A, ou O, à l'origine), donc deux segments marqués parallèles le sont vraiment. Les longueurs portées
 * sont celles du manuel ; une figure « ليست حقيقية » (le manuel le dit) garde ses étiquettes.
 */
const r2 = (x) => Math.round(x * 1000) / 1000;
/** Le point à distance `len` de l'origine dans la direction `deg` (degrés, y vers le haut). */
const at = (deg, len) => [r2(len * Math.cos((deg * Math.PI) / 180)), r2(len * Math.sin((deg * Math.PI) / 180))];
const times = (p, f) => [r2(p[0] * f), r2(p[1] * f)];
const plus = (p, q) => [r2(p[0] + q[0]), r2(p[1] + q[1])];

/* ── نشاط 1 : la حالة الأولى (B′, C′ sur [AB], [AC]) et la حالة الثانية (de l'autre côté de A) ── */
const B1 = at(27.6, 6); const C1 = at(-27.6, 7);
export const FIG_ACT1_CASE1 = {
  points: { A: [0, 0], B: B1, C: C1, "B'": times(B1, 8 / 15), "C'": times(C1, 8 / 15) },
  lines: [{ through: ['A', 'B'], name: '(d)', extend: [0, 0.2] }, { through: ['A', 'C'], name: "(d')", extend: [0, 0.2] }],
  segments: [{ from: 'B', to: 'C', arrows: 1 }, { from: "B'", to: "C'", arrows: 1, tone: 'amber' }],
  labels: { A: 'w' },
  ariaLabel: 'الحالة الأولى: مستقيمان متقاطعان في A، النقطة B′ على [AB] و C′ على [AC]، و (B′C′) يوازي (BC)',
  maxWidth: 320,
};
const B2 = at(25, 3.2); const C2 = at(-30, 4.5);
export const FIG_ACT1_CASE2 = {
  points: { A: [0, 0], B: B2, C: C2, "B'": times(B2, -0.5), "C'": times(C2, -0.5) },
  segments: [['B', "B'"], ['C', "C'"], { from: 'B', to: 'C', arrows: 1 }, { from: "B'", to: "C'", arrows: 1, tone: 'amber' }],
  labels: { A: 'n' },
  ariaLabel: 'الحالة الثانية: B′ و C′ من الجهة الأخرى للنقطة A، و (B′C′) يوازي (BC)',
  maxWidth: 300,
};

/* ── Lecteur, module 1, étape 1 (conseil du 2026-11-11) : la configuration de la place RECONNUE ailleurs — tournée, les parallèles PENCHÉES,
 * d'autres lettres, ni sol ni angle droit : « elles sont debout » ne peut plus être la raison. K joue le rôle de O. Les chevrons sont donnés
 * (l'énoncé dit (LP) ∥ (NQ)) : ce qu'on reconnaît ici, c'est le sommet commun et les deux triangles. */
const N9 = at(160, 6); const Q9 = at(250, 4);
export const FIG_TRANSFER = {
  points: { K: [0, 0], N: N9, Q: Q9, L: times(N9, 0.45), P: times(Q9, 0.45) },
  segments: [['K', 'N'], ['K', 'Q'], { from: 'L', to: 'P', arrows: 1, tone: 'amber' }, { from: 'N', to: 'Q', arrows: 1 }],
  polygons: [{ points: ['K', 'L', 'P'], tone: 'amber' }],
  labels: { K: 'e' },
  ariaLabel: 'شكل مائل: النقطة K يخرج منها مستقيمان؛ L و N على الأول، P و Q على الثاني، و (LP) يوازي (NQ)',
  maxWidth: 210,
};

/* ── نشاط 1 (ساحة الحيّ) : la minaret et le bâton, leurs ombres, le rayon — les deux triangles en situation de Thalès ──
 * A pied de la minaret, M sa cime ; B pied du bâton, E sa cime ; O la fin commune des deux ombres. Rien n'est chiffré :
 * les hauteurs de la figure (5 et 1) et les ombres (8 et 1,6) respectent k = 1,6 pour que (AM) // (BE) et le rayon soit droit. */
export const FIG_SHADOW = {
  points: { A: [0, 0], M: [0, 5], B: [6.4, 0], E: [6.4, 1], O: [8, 0] },
  segments: [{ from: 'A', to: 'M', arrows: 1 }, { from: 'B', to: 'E', arrows: 1, tone: 'amber' }, ['A', 'O'], ['M', 'O']],
  polygons: [{ points: ['O', 'B', 'E'], tone: 'amber' }],
  rightAngles: [['M', 'A', 'O'], ['E', 'B', 'O']],
  labels: { A: 'sw', M: 'nw', B: 'sw', E: 'ne', O: 'se' },
  ariaLabel: 'مئذنة [AM] وعصا [BE] شاقوليتان على الأرض، وشعاع الشمس (MO) يمرّ بقمّتيهما وينتهي ظلّاهما في O: المثلثان OBE و OAM لهما الرأس O و (BE) يوازي (AM)',
  maxWidth: 340,
};

/* ── معارف 1 : la propriété dans ses trois positions ── */
const pos = (k, aria) => {
  const B = at(28, 4); const C = at(-26, 4.6);
  return {
    points: { A: [0, 0], B, C, M: times(B, k), N: times(C, k) },
    segments: [
      ...(k > 0 ? [['A', k > 1 ? 'M' : 'B'], ['A', k > 1 ? 'N' : 'C']] : [['B', 'M'], ['C', 'N']]),
      { from: 'B', to: 'C', arrows: 1 }, { from: 'M', to: 'N', arrows: 1, tone: 'indigo' },
    ],
    labels: { A: k > 0 ? 'w' : 'n' },
    ariaLabel: aria,
    maxWidth: 220,
  };
};
export const FIG_KNOW1 = [
  pos(0.55, 'M على [AB] و N على [AC] و (MN) يوازي (BC)'),
  pos(1.5, 'M و N على امتداد [AB] و [AC] بعد B و C، و (MN) يوازي (BC)'),
  pos(-0.6, 'M و N من الجهة الأخرى للنقطة A، و (MN) يوازي (BC)'),
];

/* معارف 1 — ملاحظة 1 : AN = 1, AM = 2, AB = 3, AC = 2 (وضعية الفراشة), (MN) et (BC) NON parallèles. */
const uR = at(30, 1); const vR = at(-35, 1);
export const FIG_REMARK1 = {
  points: { A: [0, 0], B: times(uR, 3), C: times(vR, 2), M: times(uR, -2), N: times(vR, -1) },
  segments: [
    { from: 'A', to: 'B', label: '3' }, { from: 'A', to: 'C', label: '2' }, { from: 'A', to: 'M', label: '2' }, { from: 'A', to: 'N', label: '1' },
    ['B', 'C'], ['M', 'N'],
  ],
  labels: { A: 'n' },
  ariaLabel: 'وضعية الفراشة: AB = 3 و AC = 2 و AM = 2 و AN = 1، والمستقيمان (MN) و (BC) غير متوازيين',
  maxWidth: 280,
};

/* معارف 2 — المثال : [AB] et [AC] partagés en trois, M et N les premiers points. */
const B3 = at(22, 6); const C3 = at(-30, 6.6);
export const FIG_KNOW2 = {
  points: { A: [0, 0], B: B3, C: C3, M: times(B3, 1 / 3), N: times(C3, 1 / 3), P: times(B3, 2 / 3), Q: times(C3, 2 / 3) },
  segments: [
    { from: 'A', to: 'M', ticks: 1 }, { from: 'M', to: 'P', ticks: 1 }, { from: 'P', to: 'B', ticks: 1 },
    { from: 'A', to: 'N', ticks: 2 }, { from: 'N', to: 'Q', ticks: 2 }, { from: 'Q', to: 'C', ticks: 2 },
    { from: 'B', to: 'C', arrows: 1 }, { from: 'M', to: 'N', arrows: 1, tone: 'indigo' },
  ],
  hidden: ['P', 'Q'],
  labels: { A: 'w' },
  ariaLabel: 'القطعة [AB] مقسمة إلى ثلاث قطع متقايسة و M أولى نقاط التقسيم، و [AC] كذلك و N أولى نقاطها',
  maxWidth: 300,
};

/* ── طرائق : متوازي الأضلاع ABCD, M sur [AD] (AM = 2), (BM) coupe (DC) en N ; puis دوري الآن ── */
const D4 = [1.2, 2.75];
export const FIG_METHOD = {
  points: { A: [0, 0], B: [5, 0], C: plus([5, 0], D4), D: D4, M: times(D4, 2 / 3), N: plus(D4, [-2.5, 0]) },
  segments: [
    { from: 'A', to: 'B', label: '5' }, { from: 'B', to: 'C', label: '3' }, ['C', 'D'], ['D', 'A'], ['B', 'N'], ['N', 'D'],
  ],
  labels: { N: 'n', D: 'n', M: 'w' },
  ariaLabel: 'متوازي الأضلاع ABCD حيث AB = 5 و BC = 3، M من [AD]، والمستقيم (BM) يقطع المستقيم (DC) في N',
  maxWidth: 320,
};
const a5 = at(62, 1); const b5 = at(-12, 1);
export const FIG_NOW107 = {
  points: { E: [0, 0], U: times(a5, -3.75), T: times(a5, 5.25), V: times(b5, -2.25), W: times(b5, 3.15) },
  segments: [
    { from: 'E', to: 'U', label: '3,75' }, { from: 'E', to: 'T', label: '5,25' }, { from: 'E', to: 'V', label: '2,25' }, ['E', 'W'],
    { from: 'U', to: 'V', arrows: 1 }, { from: 'W', to: 'T', arrows: 1 },
  ],
  ariaLabel: 'المستقيمان (UT) و (VW) متقاطعان في E، و (UV) يوازي (WT)؛ EU = 3,75 و ET = 5,25 و EV = 2,25',
  maxWidth: 280,
};

/* ── أوظّف تعلّماتي (p. 110) ── */
const a1 = at(115, 1); const b1 = at(62, 1);
export const FIG_EX1 = {
  points: { O: [0, 0], A: times(a1, 2.6), B: times(b1, 2.4), E: times(a1, -3.12), F: times(b1, -2.88) },
  segments: [['A', 'E'], ['B', 'F'], { from: 'A', to: 'B', arrows: 1 }, { from: 'E', to: 'F', arrows: 1 }],
  ariaLabel: 'المستقيمان (AE) و (BF) يتقاطعان في O، A و B من جهة و E و F من الجهة الأخرى، و (AB) يوازي (EF)',
  maxWidth: 220,
};
const a2 = at(-62, 1); const b2 = at(-118, 1);
export const FIG_EX2 = {
  points: { A: [0, 0], B: times(a2, 3), E: times(a2, 6), C: times(b2, 4.5), F: times(b2, 9) },
  segments: [
    { from: 'A', to: 'B', label: '3' }, { from: 'B', to: 'E', label: '3' }, { from: 'A', to: 'C', label: '4,5' }, ['C', 'F'],
    { from: 'B', to: 'C', arrows: 1 }, { from: 'E', to: 'F', arrows: 1, label: '10' },
  ],
  ariaLabel: 'A و C و F على استقامة و A و B و E على استقامة؛ AC = 4,5 و AF = 9 و AB = 3 و BE = 3 و FE = 10، و (EF) يوازي (BC)',
  maxWidth: 240,
};
/* تمرين 3 : les quatre figures */
const c3a = at(160, 1); const c3b = at(195, 1);
export const FIG_EX3 = [
  {
    points: { C: [0, 0], A: times(c3a, 3), D: times(c3b, -2.4), B: times(c3a, -2.2), E: times(c3b, 1.76) },
    lines: [{ through: ['A', 'B'], extend: 0.1 }, { through: ['D', 'E'], extend: 0.1 }],
    segments: [{ from: 'A', to: 'D', arrows: 1 }, { from: 'E', to: 'B', arrows: 1 }],
    ariaLabel: 'الشكل 1: (AB) و (ED) يتقاطعان في C، و (AD) يوازي (EB)',
    caption: '(1)', maxWidth: 220,
  },
  {
    points: { I: [0, 4], H: [0, 2], F: [0, 0], J: [3, 2], G: [6, 0] },
    segments: [['I', 'F'], ['I', 'G'], ['H', 'J'], ['F', 'G']],
    rightAngles: [['I', 'H', 'J'], ['I', 'F', 'G']],
    ariaLabel: 'الشكل 2: I و H و F على استقامة، (HJ) و (FG) عموديان على (IF) في H و F، و I و J و G على استقامة',
    caption: '(2)', maxWidth: 220,
  },
  {
    points: { K: [0, 0], L: [2.6, 0], M: [4.4, 0], "K'": [1.3, 2.2], S: [2.2, 3.723] },
    segments: [['K', 'S'], ['K', 'M'], ["K'", 'L'], ['S', 'M']],
    angles: [{ at: 'L', from: 'M', to: "K'", label: '' }, { at: 'M', from: 'K', to: 'S', label: '' }],
    ariaLabel: 'الشكل 3: S و K′ و K على استقامة، K و L و M على استقامة، والزاويتان المعلّمتان في L و M متقايستان',
    caption: '(3)', maxWidth: 220,
  },
  {
    points: { O: [0, 0], N: at(180, 2.2), R: at(0, 3.3), P: at(-140, 2.6), Q: at(40, 3.9) },
    segments: [['N', 'R'], ['P', 'Q'], ['N', 'P'], ['R', 'Q']],
    angles: [{ at: 'P', from: 'N', to: 'O', label: '40°' }, { at: 'O', from: 'N', to: 'P', label: '35°' }, { at: 'R', from: 'O', to: 'Q', label: '105°' }],
    ariaLabel: 'الشكل 4: N و O و R على استقامة، P و O و Q على استقامة، الزاوية NPO = 40° و NOP = 35° و ORQ = 105°',
    caption: '(4)', maxWidth: 240,
  },
];
const a4 = at(200, 1); const b4 = at(155, 1);
export const FIG_EX4 = {
  points: { O: [0, 0], A: times(b4, 3), B: times(a4, -2), C: times(b4, -5), D: times(a4, 10 / 3) },
  segments: [{ from: 'A', to: 'B', label: '4', arrows: 1 }, { from: 'D', to: 'C', arrows: 1 }, ['A', 'D'], ['B', 'C'],
    { from: 'O', to: 'A', label: '3' }, { from: 'O', to: 'B', label: '2' }, { from: 'O', to: 'C', label: '5' }, ['O', 'D']],
  ariaLabel: 'الرباعي ABCD حيث (AB) يوازي (CD) و (AC) و (BD) يتقاطعان في O؛ AB = 4 و OA = 3 و OB = 2 و OC = 5',
  maxWidth: 300,
};
/* تمرين 5 : longueurs « غير حقيقية » : la figure garde les étiquettes du manuel */
const a6 = at(-62, 1); const b6 = at(-118, 1);
export const FIG_EX5 = {
  points: { O: [0, 0], E: times(a6, -1.3), H: times(a6, 3.9), F: times(b6, -4 / 3), G: times(b6, 4) },
  segments: [{ from: 'E', to: 'F', arrows: 1, label: '2' }, { from: 'G', to: 'H', arrows: 1 },
    { from: 'O', to: 'E', label: '1,3' }, { from: 'O', to: 'H', label: '3,9' }, { from: 'O', to: 'G', label: '4' }, ['O', 'F']],
  ariaLabel: 'المستقيمان (GF) و (EH) متقاطعان في O، و (EF) يوازي (GH)؛ EF = 2 و OE = 1,3 و OG = 4 و OH = 3,9',
  maxWidth: 220,
};
const a8 = at(78, 1); const b8 = at(35, 1);
export const FIG_EX8 = {
  points: { A: [0, 0], M: times(a8, 9 / 2), N: times(a8, 15 / 2), L: times(b8, 3), P: times(b8, 5) },
  segments: [['A', 'N'], ['A', 'P'], { from: 'M', to: 'L', arrows: 1 }, { from: 'N', to: 'P', arrows: 1 }],
  labels: { A: 's' },
  ariaLabel: 'A و M و N على استقامة (M بين A و N) و A و L و P على استقامة (L بين A و P)؛ AN = 15 و AM = 9 و AL = 6، و (NP) يوازي (ML)',
  caption: 'AN = 15 ، AM = 9 ، AL = 6',
  maxWidth: 220,
};
/* تمرين 9 : B ⟂ en apparence seulement — aucun carré en B (le manuel n'en met pas) */
export const FIG_EX9 = {
  points: { A: [0, 4.5], B: [2.8, 4.5], D: [2.8, 0], E: [1.743, 1.698], F: [0, -2.925] },
  segments: [{ from: 'A', to: 'B', label: '2,8' }, { from: 'B', to: 'D', label: '4,5' }, { from: 'A', to: 'E', label: '3,3' }, { from: 'E', to: 'D', label: '2' },
    ['A', 'F'], ['B', 'F']],
  rightAngles: [['F', 'A', 'B']],
  ariaLabel: '(AF) عمودي على (AB) في A؛ A و E و D على استقامة و B و E و F على استقامة؛ AB = 2,8 و AE = 3,3 و ED = 2 و BD = 4,5',
  caption: 'الأطوال على الشكل ليست حقيقية',
  maxWidth: 220,
};

/* ── أستعدّ 4 et 5 (revisités au module 4) ── */
export const FIG_PREP4 = {
  points: { C: [0, 0], A: [-3.2, 4.5], B: [4.2, 3.6], D: [-2.133, 3], E: [2.8, 2.4] },
  segments: [{ from: 'A', to: 'D', label: '3' }, { from: 'D', to: 'C', label: '6' }, { from: 'C', to: 'E', label: '8' }, ['E', 'B'],
    { from: 'A', to: 'B', label: '7', arrows: 1 }, { from: 'D', to: 'E', arrows: 1 }],
  ariaLabel: 'المثلث ABC، D من [AC] و E من [BC]، و (AB) يوازي (DE)؛ AD = 3 و DC = 6 و CE = 8 و AB = 7',
  maxWidth: 240,
};
const a7 = at(18, 1); const b7 = at(-24, 1);
export const FIG_PREP5 = {
  points: { A: [0, 0], C: times(a7, 2.5), D: times(a7, 5), E: times(b7, 2.2), F: times(b7, 4.4) },
  segments: [['A', 'D'], ['A', 'F'], { from: 'C', to: 'E', arrows: 1 }, { from: 'D', to: 'F', arrows: 1 }],
  labels: { A: 'w' },
  ariaLabel: 'مستقيمان متقاطعان في A: A و C و D على استقامة و A و E و F على استقامة، و (CE) يوازي (DF)',
  maxWidth: 260,
};

/* ── إختبار أولي : QCM 1 et 2 (p. 112), puis des figures de la plateforme ── */
const aQ = at(-58, 1); const bQ = at(-122, 1);
export const FIG_QCM1 = {
  points: { A: [0, 0], I: times(aQ, 3), B: times(aQ, 5), J: times(bQ, 4.5), C: times(bQ, 7.5) },
  segments: [{ from: 'A', to: 'I', label: '3' }, { from: 'I', to: 'B', label: '2' }, { from: 'A', to: 'J', label: 'y' }, { from: 'J', to: 'C', label: '3' },
    { from: 'I', to: 'J', arrows: 1, label: 'x' }, { from: 'B', to: 'C', arrows: 1, label: '10' }],
  ariaLabel: 'I من [AB] و J من [AC] و (IJ) يوازي (BC)؛ AI = 3 و IB = 2 و JC = 3 و BC = 10 و IJ = x و AJ = y',
  maxWidth: 240,
};
const aQ2 = at(20, 1); const bQ2 = at(-30, 1);
export const FIG_QCM2 = {
  points: { A: [0, 0], B: times(aQ2, 4), C: times(bQ2, 6), L: times(aQ2, -2), M: times(bQ2, -3) },
  segments: [{ from: 'A', to: 'B', label: 'x' }, { from: 'A', to: 'C', label: 'y' }, { from: 'A', to: 'L', label: '2' }, { from: 'A', to: 'M', label: '3' },
    { from: 'B', to: 'C', arrows: 1, label: '4' }, { from: 'L', to: 'M', arrows: 1, label: '2' }],
  labels: { A: 'n' },
  ariaLabel: 'B و A و L على استقامة و C و A و M على استقامة (A بين النقطتين)؛ (LM) يوازي (BC)؛ BC = 4 و AM = 3 و ML = 2 و AL = 2 و AB = x و AC = y',
  maxWidth: 280,
};
const aE = at(30, 1); const bE = at(-20, 1);
/** E3 : (ST) // (UV), lignes (SU) et (TV) sécantes en R (vérification de la correspondance des sommets). */
export const FIG_E3 = {
  points: { R: [0, 0], S: times(aE, 2), T: times(bE, 2.5), U: times(aE, 5), V: times(bE, 6.25) },
  segments: [['R', 'U'], ['R', 'V'], { from: 'S', to: 'T', arrows: 1 }, { from: 'U', to: 'V', arrows: 1 }],
  labels: { R: 'w' },
  ariaLabel: 'المستقيمان (SU) و (TV) متقاطعان في R، S بين R و U و T بين R و V، و (ST) يوازي (UV)',
  maxWidth: 260,
};
const aF = at(115, 1); const bF = at(70, 1);
/** E4 : la فراشة, (KL) // (PQ), sécantes en O. */
export const FIG_E4 = {
  points: { O: [0, 0], K: times(aF, 2), L: times(bF, 2.4), P: times(aF, -3), Q: times(bF, -3.6) },
  segments: [['K', 'P'], ['L', 'Q'], { from: 'K', to: 'L', arrows: 1 }, { from: 'P', to: 'Q', arrows: 1 }],
  ariaLabel: 'المستقيمان (KP) و (LQ) متقاطعان في O، K و L من جهة و P و Q من الجهة الأخرى، و (KL) يوازي (PQ)',
  // une figure haute et étroite : à 220 elle poussait le 4e choix de la question hors de l'écran du lecteur (1024 et 1366, rollout 2026-11-10)
  maxWidth: 140,
};
/** معارف 1 — question : (RS) et (TU) sécantes en O, M sur [OR]… — la figure de la question de l'étape 1. */
const aG = at(35, 1); const bG = at(-25, 1);
export const FIG_M2Q1 = {
  points: { O: [0, 0], E: times(aG, 4), F: times(bG, 5), G: times(aG, -2), H: times(bG, -2.5) },
  segments: [['E', 'G'], ['F', 'H'], { from: 'E', to: 'F', arrows: 1 }, { from: 'G', to: 'H', arrows: 1 }],
  labels: { O: 'n' },
  ariaLabel: 'المستقيمان (EG) و (FH) متقاطعان في O، G و H من الجهة الأخرى للنقطة O، و (EF) يوازي (GH)',
  maxWidth: 260,
};
