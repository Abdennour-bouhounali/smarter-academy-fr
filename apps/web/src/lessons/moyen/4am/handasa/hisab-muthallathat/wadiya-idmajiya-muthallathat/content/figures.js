/**
 * Les FIGURES du manuel que cette leçon redessine (GeoFigure — common/components/geoFigure.js) : la donnée
 * seulement, en unités libres, y vers le haut. Chaque figure suit la description de l'extraction
 * (docs/sources/4am/unit10/extraction.json › figure) et ne porte QUE les longueurs et les angles que le manuel
 * écrit — jamais une réponse. Les dessins respectent les rapports de l'énoncé (35°, 50° se voient). Le banc
 * d'exercices génère ses `statement.figure` depuis ces mêmes données.
 */

/** La MODÉLISATION de la وضعية (module 7) : A أريس, P–Q le poteau, M–S le مقام ; les deux triangles de sommet A. */
export const MODEL = {
  points: { M: [0, 0], S: [0, 5.2], P: [7.2, 0], Q: [7.2, 1.5], A: [10, 0] },
  segments: [
    { from: 'M', to: 'P', label: '95,65' }, { from: 'P', to: 'A', label: '2,45' },
    { from: 'P', to: 'Q', label: '2,30', bold: true, arrows: 1 }, { from: 'M', to: 'S', label: 'h', bold: true, arrows: 1 },
    { from: 'A', to: 'S', dashed: true, tone: 'amber' },
  ],
  polygons: [{ points: ['A', 'P', 'Q'], tone: 'sky' }, { points: ['A', 'M', 'S'], tone: 'amber' }],
  rightAngles: [['S', 'M', 'P'], ['Q', 'P', 'A']],
  angles: [{ at: 'A', from: 'P', to: 'Q', label: 'x' }],
  labels: { M: 's', S: 'n', P: 's', Q: 'n', A: 's' },
  ariaLabel: 'نموذج الوضعية: المقام [MS] ارتفاعه h والعمود [PQ] طوله 2,30 عموديان على الأرض؛ MP = 95,65 و PA = 2,45؛ خط النظر من A يمر بالقمة Q ويصل القمة S؛ x الزاوية بين الأرض وخط النظر في A',
  maxWidth: 360,
};

/**
 * Un pavé droit ABCDEFGH en perspective cavalière : face avant ABEF (A en bas à gauche,
 * B en bas à droite, E en haut à droite, F en haut à gauche), C derrière B, D au-dessus de C, H derrière A, G
 * au-dessus de H ; [AC] (diagonale du sol) et [AD] (diagonale du pavé), le triangle ACD rectangle en C.
 * `dims` = longueurs réelles (longueur AB, profondeur BC, hauteur CD) ; `labels` = ce que l'énoncé écrit.
 */
export function boxFigure({ AB, BC, CD, lab, ariaLabel, maxWidth = 340 }) {
  const k = 6 / AB; const w = AB * k; const h = Math.max(CD * k, 1.6); const dx = Math.max(BC * k * 0.75, 1.8); const dy = dx * 0.6;
  const r = (v) => Math.round(v * 1000) / 1000;
  return {
    points: {
      A: [0, 0], B: [r(w), 0], E: [r(w), r(h)], F: [0, r(h)],
      H: [r(dx), r(dy)], C: [r(w + dx), r(dy)], D: [r(w + dx), r(h + dy)], G: [r(dx), r(h + dy)],
    },
    segments: [
      { from: 'A', to: 'B', label: lab.AB }, { from: 'B', to: 'E' }, { from: 'E', to: 'F' }, { from: 'F', to: 'A', ...(lab.AF ? { label: lab.AF } : {}) },
      { from: 'B', to: 'C', ...(lab.BC ? { label: lab.BC } : {}) }, { from: 'C', to: 'D', ...(lab.CD ? { label: lab.CD } : {}) }, { from: 'E', to: 'D' }, { from: 'F', to: 'G', ...(lab.FG ? { label: lab.FG } : {}) }, { from: 'G', to: 'D' },
      { from: 'A', to: 'H', dashed: true }, { from: 'H', to: 'C', dashed: true }, { from: 'H', to: 'G', dashed: true },
      { from: 'A', to: 'C', dashed: true, tone: 'sky' }, { from: 'A', to: 'D', tone: 'rose', bold: true },
    ],
    rightAngles: [['A', 'C', 'D']],
    labels: { A: 'sw', B: 's', E: 'n', F: 'w', H: 'n', C: 'e', D: 'ne', G: 'nw' },
    ariaLabel,
    maxWidth,
  };
}

/** La transposition du test (module 8) : le conteneur 12 m × 2,4 m × 2,4 m — sans aucune diagonale chiffrée. */
export const CONTAINER = boxFigure({
  AB: 12, BC: 2.4, CD: 2.4, lab: { AB: '12 m', BC: '2,4 m', CD: '2,4 m' }, maxWidth: 340,
  ariaLabel: 'حاوية على شكل متوازي مستطيلات ABCDEFGH: AB = 12 m و BC = 2,4 m والحرف الشاقولي CD = 2,4 m؛ القطعتان [AC] و [AD] مرسومتان والمثلث ACD قائم في C',
});
