/**
 * Les figures du درس « تعليم نقطة في المستوي » — des `GeoFigure` déclaratives (quadrillage + axes + points), dessinées en SVG par le composant commun
 * (jamais d'image). Une seule source pour les exercices, les مسائل et les tests (figureQuality). Unités libres, y vers le haut.
 */
const base = { grid: true, axes: true, maxWidth: 320 };

export const FIGURES = {
  // act-1 : cinq points dont les segments dessinent un chiffre
  digit: {
    ...base,
    points: { A: [-2, 3], B: [-2, 0], C: [2, 0], D: [1, 3], E: [1, -3] },
    segments: [['A', 'B'], ['B', 'C'], ['D', 'E']],
    labels: { A: 'nw', B: 'sw', C: 'se', D: 'ne', E: 'se' },
    ariaLabel: 'معلم متعامد ومتجانس وعليه النقط A وB وC وD وE وثلاثة قطع مستقيمة ترسم رقمًا',
  },
  // ex-21 / ex-22 : cinq points à lire
  read5: {
    ...base,
    points: { A: [3, 2], B: [-4, 1], C: [-2, -3], D: [0, -1.5], E: [2.5, 0] },
    labels: { A: 'ne', B: 'nw', C: 'sw', D: 'se', E: 'ne' },
    ariaLabel: 'معلم متعامد ومتجانس وعليه خمس نقط A وB وC وD وE',
  },
  // ex-24 : trois points à égale distance du centre
  circle: {
    ...base,
    points: { O: [0, 0], A: [3, 4], B: [-5, 0], C: [-4, -3] },
    circles: [{ center: 'O', radius: 5 }],
    labels: { O: 'se', A: 'ne', B: 'nw', C: 'sw' },
    ariaLabel: 'معلم متعامد ومتجانس ودائرة مركزها المبدأ O ونصف قطرها خمس وحدات وعليها النقط A وB وC',
  },
  // deep-55 : un côté vertical, le troisième sommet à trouver
  right: {
    ...base,
    points: { A: [-3, 2], B: [-3, -3] },
    segments: [['A', 'B']],
    labels: { A: 'nw', B: 'sw' },
    ariaLabel: 'معلم متعامد ومتجانس وعليه القطعة [AB] عموديّة',
  },
  // مسألة 2 : la carte du quartier
  map: {
    ...base,
    points: { O: [0, 0], L: [3, -2], B: [-2, 4], P: [-3, 0], Q: [0, 2.5] },
    labels: { O: 'se', L: 'se', B: 'nw', P: 'sw', Q: 'ne' },
    ariaLabel: 'خريطة الحيّ في معلم متعامد ومتجانس مبدؤه المتوسطة O، وعليها المكتبة L والمخبزة B والصيدلية P والبريد Q',
  },
  // مسألة 3 : les températures de quatre jours
  temps: {
    ...base,
    points: { A: [1, -2], B: [2, 1.5], C: [3, -0.5], D: [4, 3] },
    labels: { A: 'sw', B: 'ne', C: 'se', D: 'ne' },
    ariaLabel: 'معلم متعامد ومتجانس تمثّل نقطه A وB وC وD درجات حرارة أربعة أيام',
  },
};
