/**
 * Les FIGURES du درس (GeoFigure, données pures) — tout le texte est en arabe, les noms des points sont cachés sauf les lettres A–D des
 * tubes. Analysées puis reproduites ou REDESSINÉES (guide §5 « Textbook figures ») : ex-1 et ex-2 reproduisent les figures du
 * manuel (p. 57) avec des quadrillages plus grands, ex-2 ③ remplace le disque par un rectangle à bandes inégales (même concept :
 * des parts NON égales), self-1 (p. 59, illisible au scan) est REDESSINÉ en quatre tubes gradués en 4, 5, 6, 8 parts.
 * Chaque fraction attendue est recalculée dans ./content.test.js à partir des cellules coloriées.
 */

/** Une grille de `cols` × `rows` cases (y vers le haut), des cases entières coloriées `[col, row]` (row 0 en BAS). */
function grid({ cols, rows, cells = [], halves = [], diag = false, ariaLabel, tone = 'sky', hideAll = true }) {
  const points = {};
  for (let i = 0; i <= cols; i += 1) for (let j = 0; j <= rows; j += 1) points[`p${i}_${j}`] = [i, j];
  const segments = [];
  for (let i = 0; i <= cols; i += 1) segments.push([`p${i}_0`, `p${i}_${rows}`]);
  for (let j = 0; j <= rows; j += 1) segments.push([`p0_${j}`, `p${cols}_${j}`]);
  const polygons = cells.map(([c, r]) => ({ points: [`p${c}_${r}`, `p${c + 1}_${r}`, `p${c + 1}_${r + 1}`, `p${c}_${r + 1}`], tone }));
  // une demi-case : la diagonale va du coin haut-gauche au coin bas-droit ; `up` = triangle haut-droit, sinon bas-gauche
  for (const [c, r, up] of halves) {
    polygons.push({ points: up ? [`p${c}_${r + 1}`, `p${c + 1}_${r + 1}`, `p${c + 1}_${r}`] : [`p${c}_${r + 1}`, `p${c}_${r}`, `p${c + 1}_${r}`], tone });
  }
  if (diag) for (let c = 0; c < cols; c += 1) for (let r = 0; r < rows; r += 1) segments.push([`p${c}_${r + 1}`, `p${c + 1}_${r}`]);
  return { points, hidden: hideAll ? Object.keys(points) : [], segments, polygons, ariaLabel };
}

/** ex-1 ① : un rectangle 4 × 6, ses deux diagonales et sa médiane horizontale ; coloriés : le triangle du haut et les deux triangles bas latéraux. */
const EX1_1 = {
  points: { a: [0, 0], b: [4, 0], c: [4, 6], d: [0, 6], o: [2, 3], l: [0, 3], r: [4, 3] },
  hidden: ['a', 'b', 'c', 'd', 'o', 'l', 'r'],
  segments: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a'], ['a', 'c'], ['b', 'd'], ['l', 'r']],
  polygons: [{ points: ['d', 'c', 'o'], tone: 'sky' }, { points: ['l', 'o', 'a'], tone: 'sky' }, { points: ['r', 'o', 'b'], tone: 'sky' }],
  ariaLabel: 'مستطيل مقسّم بقطريه وبخط أفقي في منتصفه إلى أربعة وعشرين جزءا متقايسا في المساحة: لُوّن المثلث العلوي والمثلثان الصغيران الجانبيان في النصف السفلي',
};
const EX1_2 = grid({
  cols: 2, rows: 3, diag: true, halves: [[0, 2, true], [1, 2, true], [1, 1, false], [0, 0, false], [1, 0, false]],
  ariaLabel: 'مستطيل من ست خانات مربعة، كل خانة مقسومة بقطرها إلى نصفين: لُوّنت خمسة أنصاف من اثني عشر نصفا',
});
const EX1_3 = grid({
  cols: 2, rows: 6, cells: [[0, 5], [1, 4], [0, 3], [1, 3], [0, 2], [1, 1], [1, 0]],
  ariaLabel: 'مستطيل مقسّم إلى اثنتي عشرة خانة (عمودان وستة أسطر): لُوّنت سبع خانات',
});
/** ex-2 ① : un ruban de SEPT cases (relu à 300 dpi), trois coloriées. */
const EX2_1 = grid({ cols: 7, rows: 1, cells: [[0, 0], [1, 0], [2, 0]], ariaLabel: 'شريط من سبع خانات متقايسة لُوّنت ثلاث منها' });
const EX2_2 = grid({
  cols: 4, rows: 4, cells: [[0, 3], [1, 3], [0, 2], [1, 2], [0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [1, 0], [2, 0], [3, 0]],
  tone: 'amber', ariaLabel: 'مربع من ست عشرة خانة: لُوّنت اثنتا عشرة خانة',
});
/** ex-2 ③ (redessiné) : un rectangle coupé par trois droites parallèles en QUATRE parts NON égales (hauteurs 4, 1, 1, 2) ; les trois du bas sont coloriées. */
const EX2_3 = {
  points: { a: [0, 0], b: [6, 0], c: [6, 8], d: [0, 8], p: [0, 4], q: [6, 4], r: [0, 3], s: [6, 3], t: [0, 2], u: [6, 2] },
  hidden: ['a', 'b', 'c', 'd', 'p', 'q', 'r', 's', 't', 'u'],
  segments: [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'a'], ['p', 'q'], ['r', 's'], ['t', 'u']],
  polygons: [{ points: ['p', 'q', 's', 'r'], tone: 'rose' }, { points: ['r', 's', 'u', 't'], tone: 'rose' }, { points: ['t', 'u', 'b', 'a'], tone: 'rose' }],
  ariaLabel: 'مستطيل مقسوم بثلاثة خطوط أفقية إلى أربعة أجزاء غير متقايسة: لُوّنت الأجزاء الثلاثة السفلية',
};
/** self-1 (redessiné) : quatre tubes A, B, C, D de six unités de haut, gradués en 4, 5, 6 et 8 parts, remplis de 3, 2, 6 et 5 parts. */
export const TUBES = [
  { name: 'A', parts: 4, filled: 3 },
  { name: 'B', parts: 5, filled: 2 },
  { name: 'C', parts: 6, filled: 6 },
  { name: 'D', parts: 8, filled: 5 },
];
function tubes() {
  const points = {};
  const segments = [];
  const polygons = [];
  TUBES.forEach((t, i) => {
    const x0 = i * 2.2;
    const x1 = x0 + 1;
    points[`${t.name}`] = [x0 + 0.5, -0.7];
    points[`${t.name}0`] = [x0, 0];
    points[`${t.name}1`] = [x1, 0];
    points[`${t.name}2`] = [x1, 6];
    points[`${t.name}3`] = [x0, 6];
    segments.push([`${t.name}0`, `${t.name}1`], [`${t.name}1`, `${t.name}2`], [`${t.name}2`, `${t.name}3`], [`${t.name}3`, `${t.name}0`]);
    for (let g = 1; g < t.parts; g += 1) {
      const y = (6 * g) / t.parts;
      points[`${t.name}g${g}`] = [x0, y];
      points[`${t.name}h${g}`] = [x0 + 0.35, y];
      segments.push([`${t.name}g${g}`, `${t.name}h${g}`]);
    }
    const top = (6 * t.filled) / t.parts;
    points[`${t.name}w0`] = [x0, top];
    points[`${t.name}w1`] = [x1, top];
    polygons.push({ points: [`${t.name}0`, `${t.name}1`, `${t.name}w1`, `${t.name}w0`], tone: 'sky' });
  });
  return {
    points, hidden: Object.keys(points).filter((n) => !/^[A-D]$/.test(n)), segments, polygons,
    ariaLabel: 'أربعة أنابيب اختبار A و B و C و D مدرّجة بأجزاء متساوية: الأنبوب A إلى 4 أجزاء، B إلى 5، C إلى 6، D إلى 8، وفيها ماء بمقدار 3 و 2 و 6 و 5 أجزاء على الترتيب',
  };
}

export const FIGURES = {
  'ex-1': [EX1_1, EX1_2, EX1_3],
  'ex-2': [EX2_1, EX2_2, EX2_3],
  'self-1': [tubes()],
};
/** Ce que chaque figure représente, recalculé dans le test à partir de la donnée (cellules / triangles) : [numérateur, dénominateur]. */
export const FIGURE_FRACTIONS = { 'ex-1': [[1, 2], [5, 12], [7, 12]], 'ex-2': [[3, 7], [12, 16], null] };
export const REDRAWN_NOTE = 'أعادت المنصّة رسم الشكل بوضوح أكبر، بنفس المعطيات';
