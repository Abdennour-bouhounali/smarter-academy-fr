/**
 * Les figures du درس 4 en DONNÉES GeoFigure (lessons/common/components/geoFigure.js) — redessinées d'après
 * extraction › figure / l'énoncé, jamais une image du manuel. Unités libres, y vers le HAUT. Les longueurs sont
 * celles de l'énoncé ; aucune figure n'écrit la réponse demandée (le côté cherché porte « ? » ou rien).
 * Le banc de pratique génère ses `statement.figure` avec les mêmes formes (un seul langage de dessin).
 */
const deg = (d) => (d * Math.PI) / 180;
const r3 = (x) => Math.round(x * 1000) / 1000;

/** ex-26 : ABC rectangle en A, B = 18°, BC = 6 cm (AC et AB à calculer). */
const AB26 = 6 * Math.cos(deg(18)); const AC26 = 6 * Math.sin(deg(18));
export const FIG_EX26 = {
  points: { A: [0, 0], B: [r3(AB26), 0], C: [0, r3(AC26)] },
  segments: [{ from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'B', to: 'C', label: '6cm' }],
  rightAngles: [['B', 'A', 'C']],
  angles: [{ at: 'B', from: 'C', to: 'A', label: '18°' }],
  labels: { A: 'sw', B: 'se', C: 'nw' },
  ariaLabel: 'مثلث ABC قائم في A، قيس الزاوية B يساوي 18 درجة، والوتر BC طوله 6cm',
  maxWidth: 320,
};

/** ex-27 : MSF rectangle en M, S = 32°, MF = 9 cm. */
const MS27 = 9 / Math.tan(deg(32));
export const FIG_EX27 = {
  points: { M: [0, 0], S: [r3(MS27), 0], F: [0, 9] },
  segments: [{ from: 'M', to: 'S' }, { from: 'M', to: 'F', label: '9cm' }, { from: 'S', to: 'F' }],
  rightAngles: [['S', 'M', 'F']],
  angles: [{ at: 'S', from: 'F', to: 'M', label: '32°' }],
  labels: { M: 'sw', S: 'se', F: 'nw' },
  ariaLabel: 'مثلث MSF قائم في M، قيس الزاوية S يساوي 32 درجة، والضلع MF طوله 9cm',
  maxWidth: 320,
};

/** ex-29 : le palmier vu de 10 m sous 36° (la hauteur h est la question). */
const H29 = 10 * Math.tan(deg(36));
export const FIG_EX29 = {
  points: { P: [0, 0], T: [0, r3(H29)], O: [10, 0] },
  segments: [{ from: 'P', to: 'O', label: '10m' }, { from: 'P', to: 'T', label: 'h', tone: 'emerald', bold: true }, { from: 'O', to: 'T', dashed: true }],
  rightAngles: [['O', 'P', 'T']],
  angles: [{ at: 'O', from: 'T', to: 'P', label: '36°' }],
  labels: { P: 'sw', T: 'nw', O: 'se' },
  ariaLabel: 'نخلة شاقولية PT ارتفاعها h، ومن النقطة O على الأرض على بعد 10m من قاعدتها يُرى رأسها بزاوية 36 درجة مع الأرض',
  maxWidth: 300,
};

/** ex-25 : ABCD rectangle, diagonales 10 cm, O leur point d'intersection, AOD = 30° (lecture de l'extraction). */
const AB25 = 10 * Math.cos(deg(15)); const AD25 = 10 * Math.sin(deg(15));
export const FIG_EX25 = {
  points: { A: [0, r3(AD25)], B: [r3(AB25), r3(AD25)], C: [r3(AB25), 0], D: [0, 0], O: [r3(AB25 / 2), r3(AD25 / 2)] },
  segments: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], { from: 'A', to: 'C', tone: 'indigo' }, { from: 'B', to: 'D', tone: 'indigo' }],
  angles: [{ at: 'O', from: 'A', to: 'D', label: '30°' }],
  labels: { A: 'nw', B: 'ne', C: 'se', D: 'sw', O: 's' },
  ariaLabel: 'مستطيل ABCD قطراه [AC] و [BD] يتقاطعان في O، والزاوية AOD قيسها 30 درجة',
  maxWidth: 340,
};

/** ex-28 : ABCD parallélogramme, CD = 4,5 ; BC = 2,7 ; [AH] la hauteur relative à [CD] (AH = 2,3 à calculer). */
const D28 = Math.asin(2.3 / 2.7);
export const FIG_EX28 = {
  points: { D: [0, 0], C: [4.5, 0], A: [r3(2.7 * Math.cos(D28)), 2.3], B: [r3(4.5 + 2.7 * Math.cos(D28)), 2.3], H: [r3(2.7 * Math.cos(D28)), 0] },
  segments: [['A', 'B'], { from: 'B', to: 'C', label: '2,7cm' }, { from: 'D', to: 'C', label: '4,5cm', labelSide: -1 }, ['D', 'A'], { from: 'A', to: 'H', dashed: true, tone: 'rose' }],
  rightAngles: [['A', 'H', 'C']],
  labels: { A: 'nw', B: 'ne', C: 'se', D: 'sw', H: 's' },
  ariaLabel: 'متوازي أضلاع ABCD فيه CD = 4,5cm و BC = 2,7cm، و [AH] الارتفاع المتعلق بالضلع [CD]',
  maxWidth: 320,
};

/** ex-13 : la figure « أنجزت باليد الحرة » — AUCUN angle droit marqué (on le PROUVE). */
const B13 = [3.4 - 3.4 * (3 / 4.25), 2.55 * (3 / 4.25)];
export const FIG_EX13 = {
  points: { A: [3.4, 0], C: [0, 2.55], D: [0, 0], B: [r3(B13[0]), r3(B13[1])], E: [1, 0] },
  segments: [
    { from: 'C', to: 'B', label: '1,25cm' }, { from: 'B', to: 'A', label: '3cm' },
    { from: 'A', to: 'E', label: '2,4cm', labelSide: -1 }, { from: 'E', to: 'D', label: '1cm', labelSide: -1 },
    { from: 'C', to: 'D', label: '2,55cm' }, { from: 'B', to: 'E', tone: 'indigo' },
  ],
  labels: { A: 'e', C: 'nw', D: 'sw', B: 'n', E: 's' },
  ariaLabel: 'شكل منجز باليد الحرة: B على [AC] و E على [AD]، CB = 1,25cm و BA = 3cm و AE = 2,4cm و ED = 1cm و CD = 2,55cm',
  maxWidth: 340,
};
