/**
 * Les figures du درس 4 « حل مشكلات وإنجاز براهين بتوظيف الأشعة والانسحاب » en DONNÉES GeoFigure
 * (lessons/common/components/geoFigure.js) — redessinées d'après extraction › figure / l'énoncé, jamais une image du
 * manuel. Unités libres, y vers le HAUT ; les coordonnées sont celles que build-extraction.py ASSERTE (milieux,
 * parallélogrammes, images par translation recalculés là-bas). Aucune figure n'écrit la réponse demandée : un point
 * à construire n'apparaît que dans la figure « après construction » (suffixe _DONE), montrée une fois la question
 * répondue. Le banc de pratique génère ses `statement.figure` avec les mêmes formes.
 */

/** طرائق ص 133 — ABC مثلث، I منتصف [BC] و $\overrightarrow{AI} = \overrightarrow{ID}$ : ABDC متوازي أضلاع (A en haut à gauche). */
export const FIG_METHOD = {
  points: { A: [1, 3], C: [5, 3], B: [0, 0], D: [4, 0], I: [2.5, 1.5] },
  segments: [['A', 'C'], ['C', 'D'], ['D', 'B'], ['B', 'A'],
    { from: 'A', to: 'I', ticks: 1 }, { from: 'I', to: 'D', ticks: 1 }, { from: 'B', to: 'I', ticks: 2 }, { from: 'I', to: 'C', ticks: 2 }],
  labels: { A: 'nw', C: 'ne', B: 'sw', D: 'se', I: 's' },
  ariaLabel: 'رباعي ABDC قطراه [AD] و [BC] يتقاطعان في I، و I منتصف كل منهما',
  // le manuel dessine une bande 5 : 2 ; redessinée presque carrée (figureQuality), mêmes données
  caption: 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات',
  maxWidth: 380,
};

/** دوري الآن ص 133 (1) — ABDC متوازي أضلاع، E نظيرة A بالنسبة إلى C (A(0;0), B(4;0), C(1;3) : D = C + AB, E). */
export const FIG_NOW133 = {
  points: { A: [0, 0], B: [4, 0], C: [1, 3], D: [5, 3], E: [2, 6] },
  segments: [['A', 'B'], ['B', 'D'], ['D', 'C'], { from: 'A', to: 'C', ticks: 1 }, { from: 'C', to: 'E', ticks: 1 },
    { from: 'B', to: 'C', dashed: true, tone: 'indigo' }, { from: 'D', to: 'E', dashed: true, tone: 'indigo' }],
  labels: { A: 'sw', B: 'se', C: 'w', D: 'e', E: 'n' },
  ariaLabel: 'متوازي أضلاع ABDC، والنقطة E نظيرة A بالنسبة إلى C، والقطعتان [BC] و [DE] منقطتان',
  maxWidth: 380,
};

/** ex-17 — ABCD متوازي أضلاع مركزه J (A(0;0), B(6;0), C(8;4), D(2;4)). */
export const FIG_EX17 = {
  points: { A: [0, 0], B: [6, 0], C: [8, 4], D: [2, 4], J: [4, 2] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', dashed: true }, { from: 'B', to: 'D', dashed: true }],
  labels: { A: 'sw', B: 'se', C: 'ne', D: 'nw', J: 's' },
  ariaLabel: 'متوازي أضلاع ABCD قطراه يتقاطعان في J',
  maxWidth: 380,
};
/** ex-17 après construction : O = J + JA + JB, M = J + JC + JD. */
export const FIG_EX17_DONE = {
  ...FIG_EX17,
  points: { ...FIG_EX17.points, O: [2, -2], M: [6, 6] },
  vectors: [{ from: 'J', to: 'O', label: '', tone: 'rose' }, { from: 'J', to: 'M', label: '', tone: 'emerald' }],
  labels: { ...FIG_EX17.labels, O: 's', M: 'n' },
  ariaLabel: 'متوازي أضلاع ABCD مركزه J، والنقطتان O و M المنشأتان، و J منتصف [OM]',
};

/** ex-18 — la figure du manuel : ABCD متوازي أضلاع، القطر [AC] و O منتصفه (extraction › ex-18 › figure). */
export const FIG_EX18 = {
  points: { A: [0, 0], B: [6, 0], C: [2, 4], D: [-4, 4], O: [1, 2] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'O', ticks: 1 }, { from: 'O', to: 'C', ticks: 1 }],
  labels: { A: 'sw', B: 'se', C: 'ne', D: 'nw', O: 'w' },
  ariaLabel: 'متوازي أضلاع ABCD، والنقطة O منتصف القطر [AC]',
  maxWidth: 400,
};
/** ex-18 après construction : H (BH = AO), L (CL = OC), K (CK = AB + AO) — les points du laboratoire. */
export const FIG_EX18_DONE = {
  points: { A: [0, 0], B: [6, 0], C: [2, 4], D: [-4, 4], O: [1, 2], H: [7, 2], L: [3, 6], K: [9, 6] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'],
    { from: 'O', to: 'H', tone: 'indigo' }, { from: 'H', to: 'K', tone: 'indigo' }, { from: 'K', to: 'L', tone: 'indigo' }, { from: 'L', to: 'O', tone: 'indigo' }],
  labels: { A: 'sw', B: 'se', C: 'w', D: 'nw', O: 'w', H: 'e', L: 'n', K: 'ne' },
  ariaLabel: 'متوازي الأضلاع ABCD، و O منتصف [AC]، والنقط H و K و L المنشأة، والرباعي OHKL',
  maxWidth: 480,
};

/** ex-20 — ABEF متوازي أضلاع مركزه D، و ABCD متوازي أضلاع (extraction › ex-20 › figure, asserté). */
export const FIG_EX20 = {
  points: { A: [0, 6], B: [0, 0], C: [2, -3], D: [2, 3], E: [4, 0], F: [4, 6] },
  segments: [['A', 'B'], ['B', 'E'], ['E', 'F'], ['F', 'A'], ['A', 'E'], { from: 'B', to: 'F', dashed: true }, ['D', 'C'], ['B', 'C']],
  labels: { A: 'nw', B: 'w', C: 's', D: 'n', E: 'e', F: 'ne' },
  ariaLabel: 'متوازي أضلاع ABEF قطراه [AE] و [BF] يتقاطعان في D، والنقطة C حيث ABCD متوازي أضلاع',
  maxWidth: 260,
};

/** ex-21 (corrigé) — A, B, K non alignés, L منتصف [AB], BLKD متوازي أضلاع, LE = LA + LK (figure de la plateforme). */
export const FIG_EX21 = {
  points: { A: [0, 0], B: [6, 0], K: [2, 4], L: [3, 0], D: [5, 4], E: [-1, 4] },
  segments: [['A', 'B'], ['L', 'K'], ['K', 'D'], ['D', 'B'], { from: 'L', to: 'A', tone: 'amber' }, { from: 'A', to: 'E', dashed: true }, { from: 'E', to: 'K', dashed: true },
    { from: 'E', to: 'D', tone: 'indigo' }],
  labels: { A: 'sw', B: 'se', K: 'n', L: 's', D: 'ne', E: 'nw' },
  ariaLabel: 'النقط A و B و K، و L منتصف [AB]، و BLKD متوازي أضلاع، و LAEK متوازي أضلاع، والقطعة [ED]',
  maxWidth: 380,
};

/** ex-23 — مثلث ABC و M خارجه (extraction › ex-23 › figure). */
export const FIG_EX23 = {
  points: { A: [2, 5], B: [0, 0], C: [6, 0], M: [5, 5] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A']],
  labels: { A: 'n', B: 'sw', C: 'se', M: 'ne' },
  ariaLabel: 'مثلث ABC، والنقطة M خارجه',
  maxWidth: 380,
};
/** ex-23 après construction : K = M + MA + BC, L = M + MB + CA ; A منتصف [KL]. */
export const FIG_EX23_DONE = {
  points: { A: [2, 5], B: [0, 0], C: [6, 0], M: [5, 5], K: [8, 5], L: [-4, 5] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'A'], { from: 'L', to: 'A', ticks: 1, tone: 'indigo' }, { from: 'A', to: 'K', ticks: 1, tone: 'indigo' }],
  vectors: [{ from: 'A', to: 'K', label: '', tone: 'rose' }, { from: 'B', to: 'C', label: '', tone: 'rose' }],
  labels: { A: 'n', B: 'sw', C: 'se', M: 'ne', K: 'e', L: 'w' },
  ariaLabel: 'مثلث ABC، والنقطتان K و L المنشأتان، و A منتصف [KL]',
  maxWidth: 400,
};

/** ex-24 — KLM متساوي الساقين رأسه L (KM = 6, KL = 5), I منتصف [KM], J منتصف [KL], J′ = J + MJ. */
export const FIG_EX24 = {
  points: { K: [0, 0], M: [6, 0], L: [3, 4], I: [3, 0], J: [1.5, 2], "J′": [-3, 4] },
  segments: [{ from: 'K', to: 'M', label: '6cm' }, { from: 'K', to: 'L', label: '5cm' }, ['L', 'M'], { from: 'M', to: 'J', dashed: true }],
  vectors: [{ from: 'J', to: "J′", label: '', tone: 'rose' }],
  labels: { K: 'sw', M: 'se', L: 'n', I: 's', J: 'w', "J′": 'nw' },
  ariaLabel: 'مثلث KLM متساوي الساقين رأسه L، و I منتصف [KM]، و J منتصف [KL]، و J′ صورة J بالانسحاب الذي شعاعه MJ',
  maxWidth: 380,
};
