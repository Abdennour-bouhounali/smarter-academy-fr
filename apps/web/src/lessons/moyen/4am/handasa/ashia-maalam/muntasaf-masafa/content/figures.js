/**
 * Les FIGURES du درس « إحداثيتا منتصف قطعة مستقيم والمسافة بين نقطتين في معلم », en données GeoFigure
 * (common/components/geoFigure.js : points, segments, `vectors`, `grid`) d'après les figures du manuel (pp. 139–148,
 * docs/sources/4am/unit12/extraction.json › figure, et le scan rendu page à page). Aucune image.
 *
 * LE REPÈRE : les axes gradués de GeoFigure (`axes: true`), l'origine O nommée. Chaque point du manuel est sur un nœud ;
 * chaque réponse est RECALCULÉE avec vectors.js (content/figures.test.js).
 *
 * Analyse (règle du propriétaire, 2026-10-04) : le manuel dessine le نشاط 4 sur un petit quadrillage (≈ 4 cm) et le
 * QCM 4 dans une case de tableau ; ils sont REDESSINÉS en grand, sur un bloc presque carré, avec les mêmes points ; la
 * figure générale de la partie ب (C au pied des projections) est reproduite. Le نشاط 3 n'a pas de figure : K, L et J sont
 * dessinés pour la correction.
 */
export const REDRAWN = 'أعادت المنصّة رسم شكل الكتاب بوضوح أكبر، بنفس المعطيات';

/**
 * Un معلم quadrillé autour de points nommés : les axes et leurs graduations de GeoFigure (`axes: true`, unité 12), O nommé ;
 * deux points CACHÉS aux coins fixent le cadre (les axes et leurs flèches débordent les points du manuel).
 */
export function repere(points, { x: [x0, x1], y: [y0, y1] }, extra = {}) {
  const { hidden = [], ...rest } = extra;
  return {
    points: { ...points, O: [0, 0], Z0: [x0, y0], Z1: [x1, y1] },
    grid: true,
    axes: true,
    hidden: ['Z0', 'Z1', ...hidden],
    ...rest,
  };
}

/* ── تحدّ (p. 139) : A(2/3 ; −2) et B(−4 ; 7/3), hors des nœuds — SANS la réponse ── */
export const FIG_CHALLENGE = repere({ A: [2 / 3, -2], B: [-4, 7 / 3] }, { x: [-5, 3], y: [-3, 3] }, {
  labels: { A: 'e', B: 'w', O: 'sw' },
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: النقطة B في الأعلى على يسار المبدأ O، والنقطة A في الأسفل على يمينه، وكلتاهما ليست على عقدة',
  maxWidth: 520,
});

/* ── نشاط 3 (p. 141, pas de figure dans le manuel) : K, L et le milieu J, les flèches KJ et JL ── */
export const FIG_ACT3_KL = repere({ K: [5, 3], L: [-3, 1] }, { x: [-4, 6], y: [-1, 4] }, {
  labels: { K: 'e', L: 'w', O: 'sw' },
  ariaLabel: 'معلم متعامد ومتجانس: النقطة K في الأعلى على اليمين والنقطة L على يسار محور التراتيب',
  maxWidth: 540,
});
export const FIG_ACT3 = repere({ K: [5, 3], L: [-3, 1], J: [1, 2] }, { x: [-4, 6], y: [-1, 4] }, {
  vectors: [{ from: 'K', to: 'J', tone: 'indigo' }, { from: 'J', to: 'L', tone: 'amber' }],
  labels: { K: 'e', L: 'w', J: 'n', O: 'sw' },
  ariaLabel: 'معلم: الشعاع من K نحو J والشعاع من J نحو L متساويان، أربعة مربعات نحو اليسار ومربع نحو الأسفل لكل منهما',
  maxWidth: 540,
});

/* ── نشاط 4 أ (p. 141) : K, L, M — REDESSINÉ en grand (même lecture) ── */
export const FIG_ACT4 = repere({ K: [5, 1], L: [1, -2], M: [5, -2] }, { x: [-2, 6], y: [-3, 3] }, {
  labels: { K: 'e', L: 'w', M: 'se', O: 'sw' },
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: K فوق محور الفواصل على اليمين، M تحت K على نفس الشاقول، و L على يسار M على نفس الأفقي',
  caption: REDRAWN,
  maxWidth: 540,
});
export const FIG_ACT4_TRI = repere({ K: [5, 1], L: [1, -2], M: [5, -2] }, { x: [-2, 6], y: [-3, 3] }, {
  segments: [{ from: 'K', to: 'M', label: '3', tone: 'indigo', bold: true }, { from: 'L', to: 'M', label: '4', tone: 'amber', bold: true }, { from: 'K', to: 'L', label: '5', tone: 'emerald', bold: true }],
  rightAngles: [['K', 'M', 'L']],
  labels: { K: 'e', L: 'w', M: 'se', O: 'sw' },
  ariaLabel: 'المثلث KLM قائم في M: الضلع KM طوله 3 والضلع LM طوله 4 والوتر KL طوله 5',
  maxWidth: 540,
});

/* ── نشاط 4 ب (p. 141) : la figure générale (A, B, C, les projections sur les axes) ── */
export const FIG_ACT4_MODEL = {
  points: { O: [0, 0], B: [1.5, 4], A: [5, 1.5], C: [1.5, 1.5], xB: [1.5, 0], xA: [5, 0], yA: [0, 1.5], yB: [0, 4], X1: [6, 0], Y1: [0, 5] },
  hidden: ['X1', 'Y1'],
  vectors: [{ from: 'O', to: 'X1', tone: 'slate' }, { from: 'O', to: 'Y1', tone: 'slate' }],
  segments: [
    { from: 'A', to: 'C', label: 'xA − xB', tone: 'indigo', bold: true }, { from: 'B', to: 'C', label: 'yB − yA', tone: 'amber', bold: true },
    { from: 'A', to: 'B', tone: 'emerald', dashed: true },
    { from: 'C', to: 'xB', dashed: true }, { from: 'A', to: 'xA', dashed: true }, { from: 'C', to: 'yA', dashed: true }, { from: 'B', to: 'yB', dashed: true },
  ],
  rightAngles: [['B', 'C', 'A']],
  labels: { O: 'sw', B: 'n', A: 'e', C: 'sw', xB: 's', xA: 's', yA: 'w', yB: 'w' },
  ariaLabel: 'معلم مبدؤه O: النقطة B في الأعلى والنقطة A على اليمين أخفض، و C عند تقاطع الشاقول المار بـ B والأفقي المار بـ A، والمثلث ABC قائم في C',
  maxWidth: 480,
};

/* ── أؤكّد تعلّماتي 4 (p. 148) : A(3 ; 3), B(−3 ; −3) — REDESSINÉ hors de la case du tableau ── */
export const FIG_QCM4 = repere({ A: [3, 3], B: [-3, -3] }, { x: [-4, 4], y: [-4, 4] }, {
  labels: { A: 'ne', B: 'sw', O: 'se' },
  ariaLabel: 'معلم متعامد ومتجانس على ورقة مرصوفة: النقطة A في الأعلى على اليمين والنقطة B في الأسفل على اليسار',
  caption: REDRAWN,
  maxWidth: 480,
});

/* ── تمرين 20 (p. 147) : A, B, C, puis M, N, K (la figure de la correction, dessinée après les réponses) ── */
export const FIG_EX20 = repere({ A: [2, 1], B: [3, -1], C: [-1, 1], M: [5, 1], N: [7, -3], K: [6, -1] }, { x: [-2, 8], y: [-4, 3] }, {
  segments: [{ from: 'C', to: 'M', tone: 'indigo' }, { from: 'C', to: 'N', tone: 'amber' }, { from: 'M', to: 'N', tone: 'emerald', bold: true }],
  vectors: [{ from: 'C', to: 'A', tone: 'rose' }, { from: 'B', to: 'K', tone: 'rose' }],
  labels: { A: 'n', B: 's', C: 'w', M: 'n', N: 'e', K: 'e', O: 'sw' },
  ariaLabel: 'معلم: A منتصف [CM] و B منتصف [CN]، و K صورة B بالانسحاب الذي شعاعه CA، وهي منتصف [MN]',
  maxWidth: 560,
});

/* ── معارف هـ (p. 144) : l'exemple A(2 ; 5), B(−1 ; 1) et son escalier (figure de la plateforme) ── */
export const FIG_KNOW_DIST = repere({ A: [2, 5], B: [-1, 1], C: [2, 1] }, { x: [-2, 4], y: [-1, 6] }, {
  segments: [{ from: 'A', to: 'C', label: '4', tone: 'amber', bold: true }, { from: 'B', to: 'C', label: '3', tone: 'indigo', bold: true }, { from: 'A', to: 'B', label: '5', tone: 'emerald', bold: true }],
  rightAngles: [['A', 'C', 'B']],
  labels: { A: 'ne', B: 'w', C: 'se', O: 'sw' },
  ariaLabel: 'معلم: النقطتان A و B والزاوية C حيث المثلث ABC قائم في C، ضلعاه 3 و 4 ووتره AB طوله 5',
  maxWidth: 440,
});
