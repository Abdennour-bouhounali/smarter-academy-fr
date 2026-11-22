/**
 * Les FIGURES du درس « الخاصية العكسية لخاصية طالس » — redessinées en données GeoFigure (common/components/
 * geoFigure.js), jamais en image. Chaque figure suit la description de l'extraction (docs/sources/4am/unit9/
 * extraction.json › `figure`) et la page du manuel (pp. 105, 108, 109, 111, 112, 113) ; les coordonnées sont
 * CALCULÉES pour que les longueurs écrites soient vraies à l'échelle (les rapports aussi : une figure « parallèle »
 * l'est, une figure « non parallèle » ne l'est pas). Les noms de points portent le prime U+2032 (B′).
 *
 * Aucune réponse n'est écrite sur une figure : seules les DONNÉES du manuel (longueurs, codages).
 */

const P = '′';
const Bp = `B${P}`;
const Cp = `C${P}`;

/* ── نشاط 2 (p. 105) — (d) et (d′) sécantes en A, B ∈ (d), C ∈ (d′), graduées en trois parts égales ── */
const ACT2_BASE = { A: [0, 0], B: [-2.32, -5.53], C: [2.16, -7.18] };
const thirds = { g1: [-0.77, -1.84], g2: [-1.55, -3.69], h1: [0.72, -2.39], h2: [1.44, -4.79] };
const act2Lines = [
  { through: ['B', 'A'], name: '(d)', extend: [0.1, 0.55] },
  { through: ['C', 'A'], name: `(d${P})`, extend: [0.1, 0.5] },
];

export const FIG_ACT2 = {
  points: ACT2_BASE,
  lines: act2Lines,
  ariaLabel: 'مستقيمان (d) و (d′) متقاطعان في A، النقطة B من (d) والنقطة C من (d′)',
  maxWidth: 197,
};

/** Les trois figures des élèves : la graduation (trois parts égales) codée par des traits. */
export const FIG_ACT2_STUDENTS = {
  1: {
    points: { ...ACT2_BASE, ...thirds, [Bp]: [0.77, 1.84], [Cp]: [-0.72, 2.39] },
    lines: act2Lines,
    segments: [
      { from: 'A', to: Bp, ticks: 1 }, { from: 'A', to: 'g1', ticks: 1 }, { from: 'g1', to: 'g2', ticks: 1 }, { from: 'g2', to: 'B', ticks: 1 },
      { from: 'A', to: Cp, ticks: 2 }, { from: 'A', to: 'h1', ticks: 2 }, { from: 'h1', to: 'h2', ticks: 2 }, { from: 'h2', to: 'C', ticks: 2 },
    ],
    hidden: ['g1', 'g2', 'h1', 'h2'],
    ariaLabel: 'الشكل 1: B′ و C′ من الجهة الأخرى للنقطة A، و AB′ ثلث AB و AC′ ثلث AC',
    caption: 'الشكل 1',
    maxWidth: 197,
  },
  2: {
    points: { ...ACT2_BASE, [Bp]: thirds.g1, g2: thirds.g2, [Cp]: thirds.h1, h2: thirds.h2 },
    lines: act2Lines,
    segments: [
      { from: 'A', to: Bp, ticks: 1 }, { from: Bp, to: 'g2', ticks: 1 }, { from: 'g2', to: 'B', ticks: 1 },
      { from: 'A', to: Cp, ticks: 2 }, { from: Cp, to: 'h2', ticks: 2 }, { from: 'h2', to: 'C', ticks: 2 },
    ],
    hidden: ['g2', 'h2'],
    ariaLabel: 'الشكل 2: B′ بين A و B و C′ بين A و C، و AB′ ثلث AB و AC′ ثلث AC',
    caption: 'الشكل 2',
    maxWidth: 197,
  },
  3: {
    points: { ...ACT2_BASE, [Bp]: thirds.g1, g2: thirds.g2, h1: thirds.h1, h2: thirds.h2, [Cp]: [-0.72, 2.39] },
    lines: act2Lines,
    segments: [
      { from: 'A', to: Bp, ticks: 1 }, { from: Bp, to: 'g2', ticks: 1 }, { from: 'g2', to: 'B', ticks: 1 },
      { from: 'A', to: Cp, ticks: 2 }, { from: 'A', to: 'h1', ticks: 2 }, { from: 'h1', to: 'h2', ticks: 2 }, { from: 'h2', to: 'C', ticks: 2 },
    ],
    hidden: ['g2', 'h1', 'h2'],
    ariaLabel: 'الشكل 3: B′ بين A و B لكن C′ من الجهة الأخرى للنقطة A، و AB′ ثلث AB و AC′ ثلث AC',
    caption: 'الشكل 3',
    maxWidth: 197,
  },
};

/* ── معارف 3 (p. 108) — les deux traductions de la propriété, la ملاحظة, l'مثال ── */
export const FIG_KNOW3_BETWEEN = {
  points: { A: [0, 0], B: [-2, -5], C: [2.4, -5], [Bp]: [-0.8, -2], [Cp]: [0.96, -2] },
  lines: [{ through: ['B', 'A'], name: '(d)', extend: [0.1, 0.25] }, { through: ['C', 'A'], name: `(d${P})`, extend: [0.1, 0.25] }],
  segments: [{ from: 'B', to: 'C', tone: 'rose' }, { from: Bp, to: Cp, tone: 'rose' }],
  ariaLabel: 'B′ بين A و B و C′ بين A و C، و (B′C′) يوازي (BC)',
  maxWidth: 280,
};
export const FIG_KNOW3_BEYOND = {
  points: { A: [0, 0], B: [-2.2, -3.4], C: [2.2, -3.4], [Bp]: [1.76, 2.72], [Cp]: [-1.76, 2.72] },
  lines: [{ through: ['B', Bp], name: '(d)', extend: [0.05, 0.1] }, { through: ['C', Cp], name: `(d${P})`, extend: [0.05, 0.1] }],
  segments: [{ from: 'B', to: 'C', tone: 'rose' }, { from: Bp, to: Cp, tone: 'rose' }],
  ariaLabel: 'B′ و C′ من الجهة الأخرى للنقطة A، و (B′C′) يوازي (BC)',
  maxWidth: 272,
};
/** ملاحظة : AB′/AB = AC′/AC = 1/2, B′ de l'autre côté de A, C′ milieu de [AC] — pas le même ordre. */
export const FIG_KNOW3_REMARK = {
  points: { A: [0, 0], B: [-1.2, -2.4], C: [6, -2.4], [Bp]: [0.6, 1.2], m: [-0.6, -1.2], [Cp]: [3, -1.2] },
  segments: [
    { from: 'A', to: Bp, ticks: 2 }, { from: 'A', to: 'm', ticks: 2 }, { from: 'm', to: 'B', ticks: 2 },
    { from: 'A', to: Cp, ticks: 1 }, { from: Cp, to: 'C', ticks: 1 }, ['B', 'C'], [Bp, Cp],
  ],
  hidden: ['m'],
  ariaLabel: 'مثلث ABC؛ B′ على امتداد [BA] من جهة A مع AB′ نصف AB، و C′ منتصف [AC]',
  maxWidth: 300,
};
/** مثال : M, O, R et N, O, P alignés (O entre), OM = 3, OR = 2,4, ON = 5, OP = 4. */
export const FIG_KNOW3_EXAMPLE = {
  points: { O: [0, 0], M: [-1.8, 2.4], R: [1.44, -1.92], N: [4, 3], P: [-3.2, -2.4] },
  segments: [
    { from: 'O', to: 'M', label: '3' }, { from: 'O', to: 'R', label: '2,4' }, { from: 'O', to: 'N', label: '5' }, { from: 'O', to: 'P', label: '4' },
    ['M', 'N'], ['P', 'R'],
  ],
  ariaLabel: 'M و O و R على استقامة، N و O و P على استقامة، OM = 3 و OR = 2,4 و ON = 5 و OP = 4',
  maxWidth: 300,
};

/* ── معارف 1, ملاحظة 1 (p. 106, déclarée en double) — وضعية الفراشة ── */
export const FIG_KNOW1_REMARK1 = {
  points: { A: [0, 0], B: [-2.4, -1.8], C: [1.2, -1.6], M: [1.6, 1.2], N: [-0.6, 0.8] },
  segments: [
    { from: 'A', to: 'B', label: '3' }, { from: 'A', to: 'C', label: '2' }, { from: 'A', to: 'M', label: '2' }, { from: 'A', to: 'N', label: '1' },
    ['B', 'C'], ['M', 'N'],
  ],
  ariaLabel: 'وضعية الفراشة: M على امتداد [BA] و N على امتداد [CA]، AN = 1 و AM = 2 و AB = 3 و AC = 2',
  maxWidth: 300,
};

/* ── طرائق (p. 109) ── A, B, E alignés (B entre) ; A, D, F (D entre) ; B, D, C (D entre). */
export const FIG_METHOD = {
  points: { A: [2.68, 2.25], B: [4.16, -0.59], C: [-1.78, 0.25], D: [0, 0], E: [4.8, -1.83], F: [-1.15, -0.96] },
  segments: [['A', 'E'], ['A', 'F'], ['B', 'C'], ['C', 'F'], ['E', 'F']],
  ariaLabel: 'A و B و E على استقامة، A و D و F على استقامة، B و D و C على استقامة',
  maxWidth: 300,
};

/* ── أوظّف تعلّماتي (pp. 111, 113) ── */
// maxWidth 230 (était 265–300) : chaque page d'exercice tient dans l'écran du lecteur de mission à 1024 × 768 (rollout 2026-11-10)
export const FIG_EX = {
  10: {
    points: { C: [0, 0], A: [-1.8, 0.88], E: [2.7, -1.32], B: [1.99, 3.47], F: [-2.99, -5.2] },
    segments: [
      { from: 'C', to: 'A', label: '2' }, { from: 'C', to: 'E', label: '3' }, { from: 'C', to: 'B', label: '4' }, { from: 'C', to: 'F', label: '6' },
      ['A', 'B'], ['E', 'F'],
    ],
    ariaLabel: 'A و C و E على استقامة، B و C و F على استقامة، CA = 2 و CE = 3 و CB = 4 و CF = 6',
    maxWidth: 230,
  },
  11: {
    points: { A: [0, 0], B: [-18, -31.18], C: [15.75, -42.16], M: [-8, -13.86], N: [7, -18.74] },
    segments: [
      { from: 'A', to: 'B', label: '36', labelSide: 1 }, { from: 'M', to: 'B', label: '20' },
      { from: 'A', to: 'N', label: '20' }, { from: 'A', to: 'C', label: '45' },
      ['B', 'C'], ['M', 'N'],
    ],
    labels: { M: 'e', N: 'w' },
    ariaLabel: 'مثلث ABC، M من [AB] و N من [AC]، AB = 36 و MB = 20 و AN = 20 و AC = 45',
    maxWidth: 190,
  },
  12: {
    points: { E: [0, 0], A: [-0.6, 1.04], C: [0.9, -1.56], D: [-3.09, -0.83], B: [4.64, 1.24] },
    segments: [
      { from: 'E', to: 'A', label: '1,2' }, { from: 'E', to: 'C', label: '1,8' }, { from: 'E', to: 'D', label: '3,2' }, { from: 'E', to: 'B', label: '4,8' },
      ['A', 'D'], ['B', 'C'],
    ],
    ariaLabel: 'A و E و C على استقامة، D و E و B على استقامة، EA = 1,2 و EC = 1,8 و ED = 3,2 و EB = 4,8',
    maxWidth: 230,
  },
  13: {
    points: { A: [0, 0], B: [-6.4, -4.8], D: [3.6, -4.8], E: [-4.48, -3.36], F: [0.72, -0.96] },
    segments: [
      { from: 'A', to: 'B', label: '8' }, { from: 'E', to: 'B', label: '2,4' },
      { from: 'A', to: 'D', label: '6' }, { from: 'A', to: 'F', label: '1,2' },
      ['B', 'D'], ['E', 'F'],
    ],
    rightAngles: [['B', 'A', 'D']],
    ariaLabel: 'مثلث ABD قائم في A، E من [AB] و F من [AD]، AB = 8 و EB = 2,4 و AD = 6 و AF = 1,2',
    maxWidth: 230,
  },
  14: {
    points: { O: [0, 0], A: [-2, 0], C: [4, 0], D: [0, 3], B: [0, -1.5] },
    lines: [{ through: ['A', 'C'], extend: [0.12, 0.08] }, { through: ['B', 'D'], extend: [0.1, 0.1] }],
    segments: [
      { from: 'O', to: 'C', label: '4' }, { from: 'D', to: 'C', label: '5' }, { from: 'O', to: 'B', label: '1,5' }, { from: 'A', to: 'B', label: '2,5' },
    ],
    rightAngles: [['C', 'O', 'D']],
    ariaLabel: 'مستقيمان متعامدان في O: A و C على الأول من جهتي O، D و B على الثاني من جهتي O؛ OC = 4 و DC = 5 و OB = 1,5 و AB = 2,5',
    maxWidth: 230,
  },
  15: {
    points: { A: [0, 10], B: [0, 0], C: [15, 0], D: [15, 10], M: [0, 8], N: [3, 10] },
    segments: [
      { from: 'A', to: 'M', label: '2' }, { from: 'A', to: 'N', label: '3' }, { from: 'D', to: 'C', label: '10' }, { from: 'B', to: 'C', label: '15' },
      ['M', 'B'], ['N', 'D'], ['M', 'N'], ['B', 'D'],
    ],
    ariaLabel: 'مستطيل ABCD، M من [AB] و N من [AD]، AM = 2 و AN = 3 و DC = 10 و BC = 15',
    maxWidth: 230,
  },
  16: {
    points: { O: [0, 0], M: [-3.14, 8.43], A: [1.88, -5.06], N: [3, 4], P: [-1.8, -2.4] },
    segments: [
      { from: 'O', to: 'M', label: '9cm' }, { from: 'O', to: 'A', label: '5,4cm' }, { from: 'O', to: 'N', label: '5cm' }, { from: 'O', to: 'P', label: '3cm' },
      ['M', 'N'], ['A', 'P'],
    ],
    ariaLabel: 'M و O و A على استقامة، N و O و P على استقامة، OM = 9cm و ON = 5cm و OP = 3cm و OA = 5,4cm',
    maxWidth: 205,
  },
  23: {
    points: { A: [0, 0], K: [30, 0], B: [50, 0], C: [27.11, 19.39], L: [16.27, 11.63], D: [5.97, 20.36] },
    segments: [
      { from: 'A', to: 'K', label: '30', ticks: 3 }, { from: 'K', to: 'B', label: '20', ticks: 2 }, { from: 'A', to: 'L', ticks: 2 }, ['L', 'C'],
      { from: 'C', to: 'B', ticks: 3 }, { from: 'L', to: 'D', label: '13,5' }, ['L', 'K'], ['C', 'K'], { from: 'D', to: 'A', dashed: true },
    ],
    ariaLabel: 'A و K و B على استقامة، L تقاطع (AC) و (DK)؛ AK = 30 و KB = 20 و LD = 13,5؛ AL = KB و AK = CB حسب الترميز',
    maxWidth: 230,
  },
  24: {
    points: { A: [-1, 4.5], B: [-6, 0], C: [6, 0], D: [1, -3.6], O: [0, 0], J: [-0.33, 1.5], K: [0.33, -1.2] },
    segments: [['A', 'B'], ['A', 'C'], ['D', 'B'], ['D', 'C'], ['B', 'C'], ['A', 'O'], ['D', 'O'], { from: 'J', to: 'K', dashed: true }],
    ariaLabel: 'مثلثان ABC و DBC، O منتصف [BC]، J مركز ثقل ABC على [AO] و K مركز ثقل DBC على [DO]',
    maxWidth: 230,
  },
  25: {
    points: { A: [1, 6], B: [-4, 0], C: [6, 0], D: [1, 0], M: [1, 2.4], E: [3, 0], F: [-1, 0] },
    segments: [['A', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'D'], { from: 'M', to: 'E', dashed: true }, { from: 'M', to: 'F', dashed: true }],
    ariaLabel: 'مثلث ABC و (AD) متوسط، M من [AD]، الموازي لـ (AC) المار بـ M يقطع [BC] في E، والموازي لـ (AB) المار بـ M يقطع [BC] في F',
    maxWidth: 230,
  },
};

/* ── أؤكّد تعلّماتي 3 (p. 112) ── A, B, E alignés ; A, C, F alignés. */
export const FIG_QCM3 = {
  points: { A: [0, 0], B: [8.8, 6.6], E: [26.4, 19.8], C: [15, 0], F: [60, 0] },
  segments: [
    { from: 'A', to: 'B', label: '11' }, { from: 'B', to: 'E', label: '22' }, { from: 'A', to: 'C', label: '15' }, { from: 'C', to: 'F', label: '45' },
    ['B', 'C'], ['E', 'F'],
  ],
  ariaLabel: 'A و B و E على استقامة، A و C و F على استقامة، AB = 11 و BE = 22 و AC = 15 و CF = 45',
  maxWidth: 300,
};
