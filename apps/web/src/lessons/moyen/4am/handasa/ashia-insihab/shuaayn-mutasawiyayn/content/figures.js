/**
 * Les FIGURES du درس « الشعاعان المتساويان ومتوازي الأضلاع ومنتصف قطعة », redessinées en données GeoFigure
 * (common/components/geoFigure.js) d'après les figures du manuel (pp. 127–137, extraction › figure, et le scan rendu
 * page à page). Aucune image : des points, des segments, des flèches (vecteurs), des codages d'égalité.
 *
 * Les coordonnées sont celles de l'extraction (vérifiées par build-extraction.py : chaque milieu, chaque متوازي أضلاع
 * est un `assert`). Les cercles de l'exercice 12 sont des polygones de 48 côtés (points cachés) : GeoFigure n'a pas de
 * cercle, et un 48-gone se lit comme un cercle.
 */
const r3 = (x) => Math.round(x * 1000) / 1000;

/** Un cercle de centre `c` et de rayon `r` en `n` points cachés `prefix0…` + les segments qui les joignent. */
function circle(prefix, c, r, n = 48) {
  const points = {}; const segments = []; const hidden = [];
  for (let i = 0; i < n; i += 1) {
    const a = (2 * Math.PI * i) / n;
    points[`${prefix}${i}`] = [r3(c[0] + r * Math.cos(a)), r3(c[1] + r * Math.sin(a))];
    hidden.push(`${prefix}${i}`);
    segments.push({ from: `${prefix}${i}`, to: `${prefix}${(i + 1) % n}`, tone: 'slate' });
  }
  return { points, segments, hidden };
}

/* ── أستعدّ 3 : متوازي الأضلاع ABCD وقطراه في O ── */
export const FIG_PREP3 = {
  points: { A: [0, 3], B: [6, 3], C: [5, 0], D: [-1, 0], O: [2.5, 1.5] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  labels: { A: 'nw', B: 'ne', C: 'se', D: 'sw', O: 's' },
  ariaLabel: 'متوازي أضلاع ABCD قطراه [AC] و [BD] يتقاطعان في O',
  maxWidth: 440,
};

/* ── أستعدّ 4 : A، B، C، D على استقامة (B و C متقاربتان في الوسط) ── */
export const FIG_PREP4 = {
  points: { A: [0, 0], B: [4.9, 0], C: [6.3, 0], D: [11.2, 0] },
  segments: [{ from: 'A', to: 'D' }],
  labels: { A: 's', B: 's', C: 's', D: 's' },
  ariaLabel: 'أربع نقط على مستقيم بالترتيب A ثم B ثم C ثم D',
  maxWidth: 440,
};

/* ── نشاط 2 ب : المستقيم (d) عليه C، A، O، D، B ؛ CA = DB (/) و AO = OD (//) ── */
export const FIG_ACT2B = {
  points: { C: [-3, 0], A: [-1, 0], O: [0, 0], D: [1, 0], B: [3, 0], e1: [-3.8, 0], e2: [3.8, 0] },
  segments: [
    { from: 'e1', to: 'C' }, { from: 'C', to: 'A', ticks: 1 }, { from: 'A', to: 'O', ticks: 2 },
    { from: 'O', to: 'D', ticks: 2 }, { from: 'D', to: 'B', ticks: 1 }, { from: 'B', to: 'e2' },
  ],
  hidden: ['e1', 'e2'],
  labels: { C: 's', A: 's', O: 's', D: 's', B: 's' },
  ariaLabel: 'المستقيم (d) عليه بالترتيب من اليسار C ثم A ثم O ثم D ثم B، مع CA = DB و AO = OD',
  maxWidth: 440,
};

/* ── معارف 3 : I منتصف [AB] ؛ AI = IB ── */
export const FIG_KNOW3 = {
  points: { A: [0, 0], I: [3, 0], B: [6, 0] },
  segments: [{ from: 'A', to: 'I', ticks: 2 }, { from: 'I', to: 'B', ticks: 2 }],
  vectors: [{ from: 'A', to: 'I', tone: 'indigo' }, { from: 'I', to: 'B', tone: 'amber' }],
  labels: { A: 's', I: 's', B: 's' },
  ariaLabel: 'قطعة [AB] و I منتصفها، والشعاعان AI و IB متساويان',
  maxWidth: 440,
};

/* ── طرائق : إنشاء صورة نقطة — ACDB متوازي أضلاع، قطراه في I، و B منتصف [DE] ── */
export const FIG_METHOD_IMAGE = {
  points: { A: [0, 3], B: [1, 0], C: [4, 2], D: [5, -1], I: [2.5, 1], E: [-3, 1] },
  segments: [
    ['A', 'C'], ['B', 'D'], { from: 'A', to: 'D', dashed: true }, { from: 'B', to: 'C', dashed: true },
    { from: 'E', to: 'B', ticks: 1 }, { from: 'B', to: 'D', ticks: 1 },
  ],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'indigo' }],
  labels: { A: 'n', B: 'sw', C: 'ne', D: 'se', I: 'e', E: 'w' },
  ariaLabel: 'المثلث ABC، و D صورة C بالانسحاب الذي شعاعه AB: ACDB متوازي أضلاع قطراه [AD] و [BC] متقاطعان في I، و E على امتداد [DB] حيث BE = BD',
  maxWidth: 440,
};

/* ── طرائق : إثبات تساوي شعاعين — A منتصف [OC] و [BD] ── */
export const FIG_METHOD_EQUAL = {
  points: { O: [0, 0], A: [4, 0], C: [8, 0], B: [2, 3], D: [6, -3] },
  segments: [
    ['O', 'B'], { from: 'O', to: 'A', ticks: 3 }, { from: 'A', to: 'C', ticks: 3 },
    { from: 'B', to: 'A', ticks: 2 }, { from: 'A', to: 'D', ticks: 2 },
    { from: 'O', to: 'D', tone: 'amber', bold: true }, { from: 'B', to: 'C', tone: 'amber', bold: true },
  ],
  labels: { O: 'w', A: 's', C: 'e', B: 'n', D: 's' },
  ariaLabel: 'O و A و C على استقامة مع OA = AC، و B و A و D على استقامة مع BA = AD، والقطعتان [OD] و [BC]',
  maxWidth: 440,
};

/* ── تمرين 7 : المثلث ABD ── */
export const FIG_EX7 = {
  points: { A: [0, 3], B: [5, 3], D: [3, 0] },
  segments: [['A', 'B'], ['B', 'D'], ['D', 'A']],
  labels: { A: 'nw', B: 'ne', D: 's' },
  ariaLabel: 'مثلث ABD: A في أعلى اليسار، B في أعلى اليمين، و D في الأسفل',
  maxWidth: 440,
};

/* ── تمرين 9 : المستطيل ABCD والمتوازي الأضلاع CDEF ── */
export const FIG_EX9 = {
  points: { A: [0, 4], B: [6, 4], C: [6, 0], D: [0, 0], E: [-2, -3], F: [4, -3] },
  polygons: [{ points: ['A', 'B', 'C', 'D'], tone: 'rose' }],
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['D', 'E'], ['E', 'F'], ['F', 'C']],
  rightAngles: [['B', 'A', 'D'], ['A', 'B', 'C'], ['B', 'C', 'D'], ['C', 'D', 'A']],
  labels: { A: 'nw', B: 'ne', C: 'e', D: 'w', E: 'sw', F: 'se' },
  ariaLabel: 'مستطيل ABCD، وتحته متوازي الأضلاع CDEF',
  maxWidth: 440,
};

/* ── تمرين 12 : دائرتان متقايستان مركزاهما O و O′ متماستان في B ؛ OM = O′N ── */
const c1 = circle('p', [0, 0], 2);
const c2 = circle('q', [4, 0], 2);
export const FIG_EX12 = {
  points: { ...c1.points, ...c2.points, O: [0, 0], "O'": [4, 0], B: [2, 0], M: [1.2, 1.6], N: [2.8, -1.6] },
  segments: [
    ...c1.segments, ...c2.segments,
    { from: 'O', to: "O'" }, { from: 'O', to: 'M', ticks: 2 }, { from: "O'", to: 'N', ticks: 2 },
  ],
  angles: [{ at: 'O', from: 'B', to: 'M', radius: 16 }, { at: "O'", from: 'B', to: 'N', radius: 16 }],
  hidden: [...c1.hidden, ...c2.hidden],
  labels: { O: 'w', "O'": 'e', B: 's', M: 'n', N: 's' },
  ariaLabel: 'دائرتان متقايستان مركزاهما O و O′ متماستان في B، و M على الأولى و N على الثانية حيث OM = O′N والزاويتان MOB و NO′B متقايستان',
  maxWidth: 440,
};

/* ── إختبار أولي : المثلث ABC و D صورة C بالانسحاب الذي شعاعه AB (لا يُرسم D) ── */
export const FIG_TEST_IMAGE = {
  points: { A: [0, 3], B: [1, 0], C: [4, 2] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }],
  labels: { A: 'n', B: 'sw', C: 'e' },
  ariaLabel: 'مثلث ABC والشعاع AB',
  maxWidth: 440,
};
