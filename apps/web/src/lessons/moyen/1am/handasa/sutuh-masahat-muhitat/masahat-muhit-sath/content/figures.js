/**
 * Les FIGURES du درس « مساحة سطح مستو ومحيطه » (GeoFigure, données pures) — des surfaces sur une feuille quadrillée : chaque
 * carreau est UNE unité d'aire (une dalle) et le côté d'un carreau est UNE unité de longueur (un élément de clôture). Tout est
 * dessiné par la plateforme avec SES formes (guide §4ter-bis : le manuel est la référence, jamais le modèle de dessin) ; le manuel
 * ne fournit que l'idée (quatre surfaces à comparer, une encoche, des bords en biais qui coupent des carreaux en deux).
 *
 * Une forme s'écrit en LIGNES de texte, ligne du haut d'abord : `#` carreau plein, `.` vide, et quatre DEMI-carreaux coupés par
 * une diagonale — `◤` (angle droit en haut à gauche), `◥` (en haut à droite), `◣` (en bas à gauche), `◢` (en bas à droite).
 * L'aire et le périmètre ne sont JAMAIS tapés ici : ./content.test.js les recalcule avec son propre code, indépendamment.
 */

/* ── Les formes (aire en carreaux · périmètre en côtés de carreau), recalculées par le test ───────────────────────────────────── */
export const SHAPES = {
  // module 2 — les trois énoncés : A et B (même aire, périmètres différents) ; A et C (même périmètre, aires différentes) ; A et E (les deux pareils)
  A: ['#####', '#####'], //                    10 · 14
  B: ['######', '####..'], //                   10 · 16
  C: ['####', '####', '####'], //               12 · 14
  E: ['###.', '####', '.###'], //               10 · 14
  // أتمرّن — le tableau : quatre surfaces
  W: ['###', '###', '###'], //                   9 · 12
  X: ['#####', '####.'], //                      9 · 14
  Y: ['####', '####'], //                        8 · 12
  Z: ['###.', '####', '.##.'], //                9 · 14
  // le fil qui entoure une surface
  T: ['###..', '#####', '..###'], //             11 · 16
  // l'encoche : même aire (14), périmètres 16 et 18
  N1: ['####.', '#####', '#####'], //             14 · 16
  N2: ['##.##', '#####', '#####'], //             14 · 18
  // demi-carreaux le long de bords en biais
  H1: ['◢##◣', '####'], //                        7
  H2: ['◢###', '####', '####'], //                11,5
  H3: ['◢##◣', '####', '####'], //                11
  // trois paires : mêmes périmètres / mêmes aires / les deux
  P1a: ['###', '###', '###'], //                   9 · 12
  P1b: ['####', '####'], //                        8 · 12
  P2a: ['#####', '#####'], //                      10 · 14
  P2b: ['######', '####..'], //                     10 · 16
  P3a: ['###', '###', '#..'], //                    7 · 12
  P3b: ['.##', '###', '##.'], //                    7 · 12
  // un polygone dont on cherche un rectangle et un carré de même aire
  Q: ['.###.', '#####', '#####', '.###.'], //       16 · 18
  // les مسائل
  PLAY: ['####.', '#####', '###..'], //             12 · 16
  PLAY2: ['####', '####', '####'], //               12 · 14
  BED: ['◢####◣', '######', '◥####◤'], //           16 (un hexagone : quatre demi-carreaux se complètent)
  WALL: ['#######', '#######', '#######'], //       21 (un mur de 21 petits carreaux)
  // إختبار أولي
  FS: ['##◣', '####'], //                           6,5
  Ga: ['####', '####'], //                           8 · 12
  Gb: ['#####', '###..'], //                         8 · 14
};

/** Un demi-carreau : le sommet de l'angle droit, puis les deux autres sommets (la diagonale les joint). */
const HALF = { '◤': ['tl', 'tr', 'bl'], '◥': ['tr', 'tl', 'br'], '◣': ['bl', 'tl', 'br'], '◢': ['br', 'tr', 'bl'] };
const corner = (r, c, name) => ({ tl: [c, r], tr: [c + 1, r], bl: [c, r + 1], br: [c + 1, r + 1] }[name]);
const vname = ([x, y]) => `v${x}_${y}`;

/**
 * Une surface quadrillée → une figure GeoFigure : un polygone par carreau (un triangle par demi-carreau), le contour en trait
 * plein (les côtés qui n'appartiennent qu'à UN carreau, et les diagonales), la feuille quadrillée dessous. Aucun nom de point.
 * `paper` : { cols, rows } agrandit la feuille au-delà de la forme.
 */
export function cellFigure(rows, { tone = 'sky', paper, caption, ariaLabel, maxWidth = 220 } = {}) {
  const lines = rows.map((row) => [...row]);
  const H = lines.length;
  const W = Math.max(...lines.map((l) => l.length));
  const points = {};
  const put = ([x, y]) => { points[vname([x, y])] = [x, H - y]; return vname([x, y]); };
  const polygons = [];
  const segments = [];
  const sides = new Map(); // un côté de carreau → [nombre de carreaux qui le contiennent entièrement, ses deux bouts]
  const side = (p, q) => {
    const key = [p, q].sort((m, n) => m[0] - n[0] || m[1] - n[1]).map((v) => v.join(',')).join('|');
    sides.set(key, [(sides.get(key)?.[0] ?? 0) + 1, [p, q]]);
  };
  lines.forEach((line, r) => line.forEach((ch, c) => {
    if (ch === '#') {
      const quad = ['tl', 'tr', 'br', 'bl'].map((n) => corner(r, c, n));
      polygons.push({ points: quad.map(put), tone });
      quad.forEach((p, i) => side(p, quad[(i + 1) % 4]));
    } else if (HALF[ch]) {
      const [right, o1, o2] = HALF[ch].map((n) => corner(r, c, n));
      polygons.push({ points: [right, o1, o2].map(put), tone });
      side(right, o1); side(right, o2);
      segments.push({ from: put(o1), to: put(o2) }); // la diagonale borde toujours la surface
    }
  }));
  for (const [count, [p, q]] of sides.values()) if (count === 1) segments.push({ from: put(p), to: put(q) });
  const sheet = paper ?? { cols: W, rows: H };
  points.sheetA = [0, 0];
  points.sheetB = [Math.max(W, sheet.cols), Math.max(H, sheet.rows)];
  return {
    points, hidden: Object.keys(points), segments, polygons, grid: true, maxWidth,
    ...(caption ? { caption } : {}),
    ariaLabel: ariaLabel ?? 'سطح على ورقة مرصوفة',
  };
}

/** Lecture arabe d'une forme pour `aria-label` : « سطح من N بلاطة على ورقة مرصوفة ». */
const fig = (id, label, opts = {}) => cellFigure(SHAPES[id], { ariaLabel: label, ...opts });

/** Les figures de chaque exercice (GeoFigure), dessinées au-dessus de l'énoncé par le module 4. */
export const FIGURES = {
  'act-1': [
    fig('W', 'السطح ①: تسعة مربعات في ثلاثة صفوف', { caption: '①' }),
    fig('X', 'السطح ②: صفّ من خمسة مربعات فوقه صفّ من أربعة', { caption: '②', tone: 'amber' }),
    fig('Y', 'السطح ③: صفّان من أربعة مربعات', { caption: '③', tone: 'emerald' }),
    fig('Z', 'السطح ④: سطح من تسعة مربعات في ثلاثة صفوف بشكل مختلف', { caption: '④', tone: 'violet' }),
  ],
  'act-1-compare': [
    fig('W', 'السطح ①', { caption: '①' }), fig('X', 'السطح ②', { caption: '②', tone: 'amber' }),
    fig('Y', 'السطح ③', { caption: '③', tone: 'emerald' }), fig('Z', 'السطح ④', { caption: '④', tone: 'violet' }),
  ],
  // معارف : les couples dont on parle (les trois énoncés)
  'maarif-2': [fig('A', 'الحوش (أ): صفّان من خمس بلاطات', { caption: '(أ)' }), fig('B', 'الحوش (ب): صفّ من ست بلاطات تحته صفّ من أربع', { caption: '(ب)', tone: 'amber' })],
  'maarif-3': [fig('A', 'الحوش (أ): صفّان من خمس بلاطات', { caption: '(أ)' }), fig('C', 'الحوش (ج): ثلاثة صفوف من أربع بلاطات', { caption: '(ج)', tone: 'emerald' })],
  'maarif-4': [fig('A', 'الحوش (أ): صفّان من خمس بلاطات', { caption: '(أ)' }), fig('E', 'الحوش (د): ثلاثة صفوف بزوايا مقطوعة', { caption: '(د)', tone: 'violet' })],
  'ex-1': [fig('T', 'سطح من إحدى عشرة بلاطة محاط بخيط', { caption: 'الشكل الذي يحيط به الخيط' })],
  'ex-2': [
    fig('N1', 'الحوش (أ): مستطيل من ثلاثة صفوف فُقدت منه بلاطة من الزاوية', { caption: '(أ)' }),
    fig('N2', 'الحوش (ب): مستطيل من ثلاثة صفوف فُقدت منه بلاطة من وسط ضلعه الأعلى', { caption: '(ب)', tone: 'amber' }),
  ],
  'ex-3': [
    fig('H1', 'السطح ①: بلاطات كاملة ونصفا بلاطة', { caption: '①' }),
    fig('H2', 'السطح ②', { caption: '②', tone: 'amber' }), fig('H3', 'السطح ③', { caption: '③', tone: 'emerald' }),
  ],
  'ex-4': [
    fig('P1a', 'الشكل (أ)', { caption: '(أ)' }), fig('P1b', 'الشكل (ب)', { caption: '(ب)', tone: 'amber' }),
    fig('P2a', 'الشكل (ج)', { caption: '(ج)', tone: 'emerald' }), fig('P2b', 'الشكل (د)', { caption: '(د)', tone: 'violet' }),
    fig('P3a', 'الشكل (هـ)', { caption: '(هـ)', tone: 'rose' }), fig('P3b', 'الشكل (و)', { caption: '(و)', tone: 'sky' }),
  ],
  'self-2': [fig('Q', 'سطح من ستة عشر مربعا بزوايا مقطوعة', { caption: 'السطح', maxWidth: 200 })],
};

/** Les figures du إختبار أولي (module 8), posées dans l'énoncé (`<GeoFigure inline …>` : l'énoncé d'une épreuve est un <p>). */
export const FINAL_FIGURES = {
  E2: cellFigure(SHAPES.FS, { ariaLabel: 'سطح على ورقة مرصوفة: صفّ علوي من بلاطتين ونصف بلاطة وتحته صفّ من أربع بلاطات', maxWidth: 200 }),
  E4: [
    cellFigure(SHAPES.Ga, { ariaLabel: 'الحوش (أ): صفّان من أربع بلاطات', caption: '(أ)', maxWidth: 170 }),
    cellFigure(SHAPES.Gb, { ariaLabel: 'الحوش (ب): صفّ من خمس بلاطات تحته صفّ من ثلاث', caption: '(ب)', tone: 'amber', maxWidth: 190 }),
  ],
};

/** Les figures des مسائل (modules 6 et 7) — importées par problems.js. `PLAY` est aussi écrite EN LITTÉRAL dans lesson.config.js (lessonProblem). */
export const PROBLEM_FIGURES = {
  'masala-2': fig('BED', 'حوض أزهار سداسي: صفّ علوي وصفّ سفلي بنهايتين مائلتين وصفّ أوسط كامل', { maxWidth: 280 }),
  'masala-3': fig('WALL', 'جدار من ثلاثة صفوف في كل صفّ سبعة مربعات', { maxWidth: 280 }),
};
