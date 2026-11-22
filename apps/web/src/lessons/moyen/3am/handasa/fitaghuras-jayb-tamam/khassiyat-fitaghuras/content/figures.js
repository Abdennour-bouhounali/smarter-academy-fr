/**
 * Les FIGURES du درس « خاصية فيثاغورس » (GeoFigure, données pures). Tout est dessiné par la plateforme avec SES triangles et SES nombres
 * (guide §4ter-bis) ; chaque triangle rectangle est dessiné À L'ÉCHELLE (coordonnées = longueurs en cm), si bien que ./content.test.js
 * recalcule chaque longueur écrite à partir des coordonnées, et vérifie l'angle droit marqué par un produit scalaire nul.
 */

const seg = (from, to, label, tone) => ({ from, to, ...(label ? { label } : {}), ...(tone ? { tone } : {}) });

/** Le carré construit à l'extérieur d'un côté [PQ] du triangle (R est le troisième sommet) : les deux autres sommets. */
export function outerSquare(P, Q, R) {
  const d = [Q[0] - P[0], Q[1] - P[1]];
  let n = [-d[1], d[0]];
  if (n[0] * (R[0] - P[0]) + n[1] * (R[1] - P[1]) > 0) n = [-n[0], -n[1]];
  return [[Q[0] + n[0], Q[1] + n[1]], [P[0] + n[0], P[1] + n[1]]];
}

/** Les mesures que chaque figure ÉCRIT, pour le test (côté → longueur en cm, angle droit → sommet). */
export const MEASURES = {};

function triangle(id, { points, right, labels, ariaLabel, caption, maxWidth = 300, extra = {} }) {
  const segs = [];
  const names = Object.keys(points);
  const [a, b, c] = names;
  for (const [p, q] of [[a, b], [b, c], [c, a]]) {
    const key = `${p}${q}`;
    const rev = `${q}${p}`;
    segs.push(seg(p, q, labels?.[key] ?? labels?.[rev]));
  }
  MEASURES[id] = { points, right, labels };
  return {
    points: { ...points, ...(extra.points ?? {}) },
    segments: [...segs, ...(extra.segments ?? [])],
    ...(right ? { rightAngles: right } : {}),
    polygons: [{ points: [a, b, c], tone: 'sky' }],
    ...(extra.hidden ? { hidden: extra.hidden } : {}),
    ...(caption ? { caption } : {}),
    maxWidth,
    ariaLabel,
  };
}

/* ── act-1 (application) : un triangle 6 – 8 – 10 et les trois carrés sur ses côtés ─────────────────────────────────────── */
const A1 = { A: [0, 0], B: [8, 0], C: [0, 6] };
const [b1, b2] = outerSquare(A1.A, A1.B, A1.C);
const [c1, c2] = outerSquare(A1.A, A1.C, A1.B);
const [d1, d2] = outerSquare(A1.B, A1.C, A1.A);
const SQUARES = {
  points: { ...A1, P1: b1, P2: b2, Q1: c1, Q2: c2, R1: d1, R2: d2 },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['B', 'P1'], ['P1', 'P2'], ['P2', 'A'], ['C', 'Q1'], ['Q1', 'Q2'], ['Q2', 'A'], ['C', 'R1'], ['R1', 'R2'], ['R2', 'B']],
  polygons: [
    { points: ['A', 'B', 'P1', 'P2'], tone: 'amber' },
    { points: ['A', 'C', 'Q1', 'Q2'], tone: 'violet' },
    { points: ['B', 'C', 'R1', 'R2'], tone: 'sky' },
  ],
  rightAngles: [['B', 'A', 'C']],
  hidden: ['P1', 'P2', 'Q1', 'Q2', 'R1', 'R2'],
  maxWidth: 360,
  ariaLabel: 'مثلث ABC قائم في A، وعلى كل ضلع من أضلاعه مربع: مربع برتقالي على [AB]، مربع بنفسجي على [AC]، ومربع أزرق على الوتر [BC]',
};

const TWO_TRIANGLES = {
  points: { A: [0, 0], B: [4, 0], C: [4, 3], D: [2.2, 5.4] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D'], ['D', 'A']],
  polygons: [{ points: ['A', 'B', 'C'], tone: 'sky' }, { points: ['A', 'C', 'D'], tone: 'violet' }],
  rightAngles: [['A', 'B', 'C'], ['A', 'C', 'D']],
  maxWidth: 300,
  ariaLabel: 'شكل من مثلثين: ABC قائم في B، و ACD قائم في C، والضلع [AC] مشترك بينهما',
};

export const FIGURES = {
  // معارف
  'maarif-1': triangle('maarif-1', { points: { D: [0, 3], E: [0, 0], F: [4, 0] }, right: [['D', 'E', 'F']], ariaLabel: 'مثلث DEF قائم في E' }),
  'maarif-3': TWO_TRIANGLES,
  // أتمرّن
  'act-1': [SQUARES],
  'ex-1': [triangle('ex-1', { points: { G: [0, 0], H: [5, 0], I: [5, 3] }, right: [['G', 'H', 'I']], ariaLabel: 'مثلث GHI قائم في H', maxWidth: 240 }), { ...TWO_TRIANGLES, maxWidth: 240 }],
  'ex-3': [
    triangle('ex-3a', { points: { H: [0, 2.1], E: [0, 0], F: [2.8, 0] }, right: [['H', 'E', 'F']], labels: { EH: '2,1 cm', EF: '2,8 cm' }, ariaLabel: 'مثلث HEF قائم في E، فيه EH = 2,1 cm و EF = 2,8 cm', caption: '①', maxWidth: 220 }),
    triangle('ex-3b', { points: { A: [0, 2.5], C: [0, 0], B: [6, 0] }, right: [['A', 'C', 'B']], labels: { AB: '6,5 cm', AC: '2,5 cm' }, ariaLabel: 'مثلث ABC قائم في C، فيه AB = 6,5 cm و AC = 2,5 cm', caption: '②', maxWidth: 260 }),
  ],
  'ex-9': [triangle('ex-9', { points: { F: [0, 9], E: [0, 0], G: [12, 0] }, right: [['F', 'E', 'G']], labels: { EF: '9 cm', FG: '15 cm' }, ariaLabel: 'مثلث EFG قائم في E، فيه EF = 9 cm و FG = 15 cm' })],
  'ex-11': [{
    points: { A: [0, 0], B: [6, 0], C: [6, 4.5], D: [0, 4.5] },
    segments: [seg('A', 'B', '6 cm'), seg('B', 'C', '4,5 cm'), ['C', 'D'], ['D', 'A'], seg('A', 'C', null, 'rose')],
    polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'amber' }],
    rightAngles: [['A', 'B', 'C']],
    maxWidth: 300,
    ariaLabel: 'مستطيل ABCD طوله 6 cm وعرضه 4,5 cm وقطره [AC]',
  }],
  'ex-13': [{
    points: { J: [0, 0], L: [6, 0], K: [3, 4], H: [3, 0] },
    segments: [seg('J', 'L', '6 cm'), seg('L', 'K', '5 cm'), seg('K', 'J', '5 cm'), seg('K', 'H', null, 'rose')],
    polygons: [{ points: ['J', 'L', 'K'], tone: 'sky' }],
    rightAngles: [['K', 'H', 'L']],
    maxWidth: 300,
    ariaLabel: 'مثلث KJL متساوي الساقين رأسه K، فيه KJ = KL = 5 cm و JL = 6 cm، والارتفاع [KH]',
  }],
  'ex-17': [{
    points: { J: [0, 0], L: [7.2, 0], K: [1.93 / 14.4, Math.sqrt(6.5 ** 2 - (1.93 / 14.4) ** 2)] },
    segments: [seg('J', 'L', '7,2 cm'), seg('L', 'K', '9,6 cm'), seg('K', 'J', '6,5 cm')],
    polygons: [{ points: ['J', 'L', 'K'], tone: 'amber' }],
    maxWidth: 280,
    ariaLabel: 'مثلث KJL أطوال أضلاعه KJ = 6,5 cm و JL = 7,2 cm و KL = 9,6 cm، يبدو قائما في J',
  }],
};

/** Les figures du إختبار أولي (posées dans l'énoncé : `<GeoFigure inline …>`). */
export const FINAL_FIGURES = {
  E2: triangle('E2', { points: { C: [0, 6], A: [0, 0], B: [8, 0] }, right: [['C', 'A', 'B']], labels: { AB: '8 cm', AC: '6 cm' }, ariaLabel: 'مثلث ABC قائم في A، فيه AB = 8 cm و AC = 6 cm', maxWidth: 220 }),
};

/** Les figures des مسائل (modules 6 et 7) — importées par problems.js. La figure de la مسألة 1 est écrite EN LITTÉRAL dans lesson.config.js. */
export const PROBLEM_FIGURES = {
  'masala-2': {
    points: { P: [0, -20], Q: [-15, 0], R: [0, 20], S: [15, 0], O: [0, 0] },
    segments: [seg('P', 'Q', '25 cm'), seg('Q', 'R', '25 cm'), seg('R', 'S'), seg('S', 'P'), seg('Q', 'S', null, 'rose'), seg('P', 'R', null, 'emerald')],
    polygons: [{ points: ['P', 'Q', 'R', 'S'], tone: 'amber' }],
    rightAngles: [['R', 'O', 'S']],
    maxWidth: 260,
    ariaLabel: 'رافعة سيارة على شكل معيّن PQRS طول كل ذراع 25 cm، ومحورها الأفقي [QS] وارتفاعها [PR] يتقاطعان في O',
  },
  'masala-3': {
    points: { A: [0, 0], B: [7, 0], C: [7, 13], D: [0, 13] },
    segments: [seg('A', 'B', '7 cm'), seg('B', 'C', '13 cm'), ['C', 'D'], ['D', 'A'], seg('A', 'C', null, 'rose')],
    polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'slate' }],
    rightAngles: [['A', 'B', 'C']],
    maxWidth: 200,
    ariaLabel: 'شاشة هاتف مستطيلة ABCD عرضها 7 cm وطولها 13 cm وقطرها [AC]',
  },
};
