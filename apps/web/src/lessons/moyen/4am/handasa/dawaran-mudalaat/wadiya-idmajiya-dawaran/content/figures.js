import * as ROT from '@smarter-academy/core/arithmetic/rotation.js';

/**
 * Les FIGURES que cette leçon dessine (GeoFigure — common/components/geoFigure.js) : la donnée seulement, en unités libres,
 * y vers le haut. Les sommets d'un polygone régulier sont calculés par `rotation.regularVertices` (chaque sommet image du
 * précédent par le دوران de 360°/n), arrondis au millième pour le dessin. Chaque figure suit l'extraction
 * (docs/sources/4am/unit13/extraction.json) ; une figure ne porte jamais la réponse de la question qui la montre.
 *
 * Analyse des figures du manuel (guide §5) : la وضعية n'a pas de figure : les figures sont celles de la plateforme, déclarées par leur légende.
 */
const r3 = (v) => Math.round(v * 1000) / 1000;
// Les `names.length` premiers sommets seulement (le إختبار ne dessine que deux lampadaires sur huit).
const vertices = (O, r, n, start, names, dir = 'direct') => Object.fromEntries(ROT.regularVertices(O, r, n, start, dir).slice(0, names.length).map((p, k) => [names[k], [r3(p.x), r3(p.y)]]));

/** La وضعية (p. 160) — le PLAN, montré APRÈS l'étape d'exécution : le massif de 3 m (1 cm ↔ 1 m), six poteaux P₁ … P₆. */
const HEX = vertices({ x: 0, y: 0 }, 3, 6, 90, ['P₁', 'P₂', 'P₃', 'P₄', 'P₅', 'P₆']);
export const PLAN = {
  points: { O: [0, 0], ...HEX },
  circles: [{ center: 'O', radius: 3, tone: 'emerald' }],
  polygons: [{ points: ['P₁', 'P₂', 'P₃', 'P₄', 'P₅', 'P₆'], tone: 'amber' }],
  segments: [{ from: 'O', to: 'P₁', dashed: true, label: '3' }, { from: 'O', to: 'P₂', dashed: true }, { from: 'P₁', to: 'P₂', label: '3', bold: true }],
  angles: [{ at: 'O', from: 'P₁', to: 'P₂', label: '60°', arrow: true }],
  labels: { O: 's' },
  caption: 'مخطط من المنصّة (الكتاب لا يرسم الوضعية): السنتيمتر على المخطط يمثّل مترا في الحديقة',
  ariaLabel: 'مخطط الحوض: دائرة مركزها O ونصف قطرها 3، وعلى محيطها ستة أعمدة P₁ إلى P₆ رؤوس سداسي منتظم؛ الزاوية P₁OP₂ قيسها 60 درجة والمسافة P₁P₂ تساوي 3',
  maxWidth: 420,
};

/**
 * « وضعية الاختبار النهائي » — la وضعية TRANSPOSÉE : le rond-point d'Oran (rayon 5 m), deux lampadaires voisins P₁ et P₂ (sur huit), le
 * milieu H de [P₁P₂] et la hauteur [OH]. Les six autres lampadaires ne sont pas dessinés et aucun angle n'est écrit.
 */
const RP = vertices({ x: 0, y: 0 }, 5, 8, 112.5, ['P₁', 'P₂'], 'indirect');
export const TEST_FIGURE = {
  points: { O: [0, 0], ...RP, H: [0, r3(5 * Math.cos(Math.PI / 8))] },
  circles: [{ center: 'O', radius: 5, tone: 'slate' }],
  segments: [['O', 'P₁'], ['O', 'P₂'], { from: 'P₁', to: 'P₂', bold: true }, { from: 'O', to: 'H', dashed: true }],
  rightAngles: [['O', 'H', 'P₂']],
  labels: { O: 's', H: 's', 'P₁': 'nw', 'P₂': 'ne' },
  ariaLabel: 'دائرة الدوّار مركزها O ونصف قطرها 5 m، وعلى حافتها عمودان متتاليان P₁ و P₂، و H منتصف [P₁P₂] حيث [OH] عمودي على [P₁P₂]',
  maxWidth: 380,
};

/* ── Les figures des six « وضعيات تدريبية » (modules 1 à 6, content/problems.js) ─────────────────────────────────────────
 * Données de la plateforme, jamais du manuel. Chacune ne montre QUE les données de l'énoncé (rayon, cote donnée, angle donné) ;
 * aucune réponse n'y est écrite. Points sur un cercle : `onCircle` (degrés, sens direct, y vers le haut), arrondis au millième. */
const onCircle = (r, deg) => [r3(r * Math.cos((deg * Math.PI) / 180)), r3(r * Math.sin((deg * Math.PI) / 180))];

/** وضعية 1 — la turbine d'Adrar : trois pales de 40 m (1 unité = 10 m), leurs extrémités A, B, C. */
export const WADIYA_1 = {
  points: { O: [0, 0], A: onCircle(4, 90), B: onCircle(4, 210), C: onCircle(4, 330) },
  circles: [{ center: 'O', radius: 4, tone: 'slate' }],
  polygons: [{ points: ['A', 'B', 'C'], tone: 'indigo' }],
  segments: [{ from: 'O', to: 'A', dashed: true, label: '40 m' }, { from: 'O', to: 'B', dashed: true }, { from: 'O', to: 'C', dashed: true }],
  labels: { O: 'e', A: 'n', B: 'sw', C: 'se' },
  ariaLabel: 'دائرة مركزها O ونصف قطرها 40 m، وعليها أطراف ثلاث شفرات A و B و C متقايسة؛ المثلث ABC ونصفا القطر OA و OB و OC منقّطة',
  maxWidth: 400,
};

/** وضعية 2 — le théâtre antique : scène [AB], spectateurs M et N sur le grand arc ; l'angle donné en M (35°). */
export const WADIYA_2 = {
  points: { O: [0, 0], A: onCircle(4, 235), B: onCircle(4, 305), M: onCircle(4, 90), N: onCircle(4, 150) },
  circles: [{ center: 'O', radius: 4, tone: 'slate' }],
  segments: [['M', 'A'], ['M', 'B'], ['N', 'A'], ['N', 'B'], { from: 'A', to: 'B', bold: true, tone: 'sky' }, { from: 'O', to: 'A', dashed: true, label: '20 m' }, { from: 'O', to: 'B', dashed: true }],
  angles: [{ at: 'M', from: 'A', to: 'B', label: '35°' }],
  labels: { O: 'n', A: 'sw', B: 'se', M: 'n', N: 'nw' },
  ariaLabel: 'دائرة مركزها O ونصف قطرها 20 m؛ على الدائرة النقطتان A و B (طرفا الخشبة) والمتفرجان M و N على القوس الكبير؛ الزاوية AMB قيسها 35 درجة',
  maxWidth: 420,
};

/** وضعية 3 — le bassin décagonal ABCDEFGHIJ, rayon 20 m (1 unité = 5 m) : [AB] en bas. */
const DECA = Object.fromEntries('ABCDEFGHIJ'.split('').map((n, k) => [n, onCircle(4, 252 + 36 * k)]));
export const WADIYA_3 = {
  points: { O: [0, 0], ...DECA },
  circles: [{ center: 'O', radius: 4, tone: 'slate' }],
  polygons: [{ points: 'ABCDEFGHIJ'.split(''), tone: 'amber' }],
  segments: [{ from: 'O', to: 'A', dashed: true, label: '20 m' }, { from: 'O', to: 'B', dashed: true }],
  labels: { O: 'n' },
  ariaLabel: 'حوض نافورة على شكل عشري منتظم ABCDEFGHIJ مركزه O، رؤوسه على دائرة نصف قطرها 20 m؛ نصفا القطرين OA و OB منقّطان',
  maxWidth: 480,
};

/** وضعية 4 — le robot de la bibliothèque : معلم متعامد, station O(0 ; 0), robot en A(3 ; 4). Les coins cachés ouvrent les quatre quadrants. */
export const WADIYA_4 = {
  points: { O: [0, 0], A: [3, 4], Z1: [-5, -5], Z2: [5, 5] },
  hidden: ['Z1', 'Z2'],
  grid: true,
  axes: true,
  segments: [{ from: 'O', to: 'A', dashed: true }],
  labels: { O: 'sw', A: 'ne' },
  caption: 'وحدة الطول في المعلم: 1 m',
  ariaLabel: 'معلم متعامد مبدؤه O محطة الشحن، والروبوت عند النقطة A التي فاصلتها 3 وترتيبها 4؛ القطعة OA منقّطة',
  maxWidth: 400,
};

/** وضعية 5 — la cour circulaire : [AB] diamètre de 10 m, C sur le cercle avec BC = 6 m, E sur [AB] (AE = 4 m), F sur [AC] avec (EF) ∥ (BC). */
export const WADIYA_5 = {
  points: { O: [0, 0], A: [-5, 0], B: [5, 0], C: [1.4, 4.8], E: [-1, 0], F: [-2.44, 1.92] },
  circles: [{ center: 'O', radius: 5, tone: 'slate' }],
  segments: [{ from: 'A', to: 'B', label: '10 m' }, { from: 'B', to: 'C', label: '6 m' }, ['A', 'C'], { from: 'E', to: 'F', tone: 'violet', arrows: 1 }, { from: 'A', to: 'E', tone: 'violet', bold: true, label: '4 m' }],
  labels: { O: 's', A: 'sw', B: 'se', C: 'ne', E: 's', F: 'nw' },
  ariaLabel: 'دائرة مركزها O وقطرها [AB] طوله 10 m؛ النقطة C على الدائرة حيث BC = 6 m؛ E على [AB] حيث AE = 4 m، و F على [AC] والمستقيم (EF) يوازي (BC)',
  maxWidth: 440,
};

/** وضعية 6 — le cadran : douze repères (1 … 12) sur un cercle de 50 cm (1 unité = 12,5 cm) ; le 12 en haut, rangés dans le sens des aiguilles. */
const CLOCK = Object.fromEntries(Array.from({ length: 12 }, (_, k) => [String((k === 0 ? 12 : k)), onCircle(4, 90 - 30 * k)]));
export const WADIYA_6 = {
  points: { O: [0, 0], ...CLOCK },
  circles: [{ center: 'O', radius: 4, tone: 'slate' }],
  polygons: [{ points: Array.from({ length: 12 }, (_, k) => String(k === 0 ? 12 : k)), tone: 'emerald' }],
  segments: [{ from: 'O', to: '12', dashed: true, label: '50 cm' }, { from: 'O', to: '3', dashed: true }, { from: 'O', to: '5', dashed: true }],
  labels: { O: 'sw' },
  ariaLabel: 'ساعة جدارية: اثنا عشر تدريجا من 1 إلى 12 على دائرة مركزها O ونصف قطرها 50 cm، التدريج 12 في الأعلى؛ القطع من O إلى التدريجات 12 و 3 و 5 منقّطة',
  maxWidth: 440,
};
