/**
 * Les FIGURES du درس « حساب مركبتي شعاع وتساوي شعاعين في معلم », en données GeoFigure (common/components/geoFigure.js :
 * `grid` = la ورقة مرصوفة, `axes` = le معلم gradué, `vectors` = les flèches nommées). Aucune image.
 *
 * Analyse (règle du propriétaire, 2026-10-04) :
 *   - نشاط 2 (p. 140) : le dessin du manuel est lisible (C au-dessus de l'axe, D loin dessous) mais tient dans une bande
 *     haute et étroite ; REPRODUIT sur un cadre quasi carré (x de −1 à 6, comme le manuel) avec ses pointillés vers
 *     les axes. La figure-réponse (E, F, les deux flèches égales, DEFC) est une addition de la plateforme.
 *   - طرائق (p. 143) : A est posé SUR la graduation « 1 » et sur le nom I, collés au nom O — REDESSINÉ : les mêmes
 *     points, I et J non nommés (les graduations suffisent), chaque nom libre ; la réponse ne change pas.
 *   - معارف جـ, exemple 2 (p. 144, sans figure dans le manuel) : dessiné par la plateforme pour voir ABDC.
 * Chaque figure passe `figureQuality` (content/figures.test.js).
 */

/* ── نشاط 2 : C(3 ; 1) et D(2 ; −5), leurs pointillés vers les axes ── */
export const FIG_ACT2 = {
  points: {
    O: [0, 0], C: [3, 1], D: [2, -5],
    cx: [3, 0], cy: [0, 1], dx: [2, 0], dy: [0, -5], w: [-1, 0], e: [6, 0],
  },
  hidden: ['cx', 'cy', 'dx', 'dy', 'w', 'e'],
  segments: [
    { from: 'C', to: 'cx', dashed: true }, { from: 'C', to: 'cy', dashed: true },
    { from: 'D', to: 'dx', dashed: true }, { from: 'D', to: 'dy', dashed: true },
  ],
  grid: true,
  axes: true,
  labels: { O: 'sw', C: 'ne', D: 'se' },
  ariaLabel: 'معلم مبدؤه O على ورقة مرصوفة: النقطة C فوق محور الفواصل على اليمين، والنقطة D بعيدة تحت محور الفواصل، مع خطوط متقطعة نحو المحورين',
};

/* ── نشاط 2، الأجوبة : E(5 ; −1), F(6 ; 5), DE = CF, DEFC متوازي أضلاع ── */
export const FIG_ACT2_SOLVED = {
  points: { O: [0, 0], C: [3, 1], D: [2, -5], E: [5, -1], F: [6, 5] },
  polygons: [{ points: ['D', 'E', 'F', 'C'], tone: 'emerald' }],
  vectors: [
    { from: 'C', to: 'D', tone: 'indigo' },
    { from: 'D', to: 'E', tone: 'emerald' },
    { from: 'C', to: 'F', tone: 'emerald' },
  ],
  segments: [{ from: 'E', to: 'F', dashed: true }],
  grid: true,
  axes: true,
  labels: { O: 'sw', C: 'w', D: 's', E: 'e', F: 'e' },
  ariaLabel: 'النقط C و D و E و F في معلم: الشعاعان DE و CF متساويان (نفس المركبتين 3 و 4)، فالرباعي DEFC متوازي أضلاع',
  caption: 'إضافة من المنصّة: الشكل بعد الإجابة عن الأسئلة.',
};

/* ── طرائق : A(1 ; 0), B(0 ; 3), C(−3 ; 0), D(−2 ; −3) — AB = DC ── */
export const FIG_METHOD_EQUAL = {
  points: { O: [0, 0], A: [1, 0], B: [0, 3], C: [-3, 0], D: [-2, -3] },
  segments: [{ from: 'B', to: 'C', tone: 'amber' }, { from: 'A', to: 'D', tone: 'amber' }],
  vectors: [{ from: 'A', to: 'B', tone: 'rose' }, { from: 'D', to: 'C', tone: 'rose' }],
  grid: true,
  axes: true,
  labels: { O: 'sw', A: 'se', B: 'ne', C: 'nw', D: 'sw' },
  ariaLabel: 'متوازي الأضلاع ABCD في معلم: A على محور الفواصل يمين O، و B على محور التراتيب، و C على محور الفواصل يسار O، و D في الأسفل يسارا؛ الشعاعان AB و DC متساويان',
  caption: 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات',
};

/* ── معارف جـ، المثال 2 : A(−4 ; −1), B(3 ; −1), C(−3 ; 2), D(4 ; 2) — AB = CD, ABDC ── */
export const FIG_KNOW_EQUAL = {
  points: { O: [0, 0], A: [-4, -1], B: [3, -1], C: [-3, 2], D: [4, 2], lo: [0, -3], hi: [0, 4] },
  hidden: ['lo', 'hi'],
  polygons: [{ points: ['A', 'B', 'D', 'C'], tone: 'sky' }],
  vectors: [{ from: 'A', to: 'B', tone: 'indigo' }, { from: 'C', to: 'D', tone: 'indigo' }],
  grid: true,
  axes: true,
  labels: { O: 'se', A: 'sw', B: 'se', C: 'nw', D: 'ne' },
  ariaLabel: 'أربع نقط في معلم: A و B على نفس الارتفاع تحت محور الفواصل، و C و D على نفس الارتفاع فوقه؛ الشعاعان AB و CD متساويان والرباعي ABDC متوازي أضلاع',
  caption: 'إضافة من المنصّة: المثال مرسوما.',
};
