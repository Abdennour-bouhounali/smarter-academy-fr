/**
 * Les FIGURES du درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية », redessinées en données GeoFigure
 * (common/components/geoFigure.js) d'après le manuel (pp. 122–123, docs/sources/4am/unit10/extraction.json › figure).
 * Aucune image : des points, des segments, des angles droits, des arcs d'angle.
 *
 * Les coordonnées sont CALCULÉES pour que la figure dise vrai : chaque triangle a les longueurs du manuel (le côté
 * manquant par Pythagore) et son angle droit au bon sommet. Une seule source de dessin pour la leçon ET son banc
 * (le générateur du banc lit ce fichier : `statement.figure`). Module pur, sans import.
 */
const r3 = (x) => Math.round(x * 1000) / 1000;

/** Un triangle rectangle en `right`, d'hypoténuse `hyp`, de côté horizontal `base` (depuis `start`) — y vers le haut. */
function rightTriangle({ names: [start, right, top], base, hyp, flip = false }) {
  const h = r3(Math.sqrt(hyp * hyp - base * base));
  const x = flip ? -base : base;
  return { [start]: [0, 0], [right]: [x, 0], [top]: [x, h] };
}

/* ── تمرين 7 (p. 122) : ABC قائم في B ; C à gauche, B à droite, A au-dessus de B ; CB = 4, CA = 4,4 (الوتر). ── */
export const FIG_EX7 = {
  points: rightTriangle({ names: ['C', 'B', 'A'], base: 4, hyp: 4.4 }),
  segments: [{ from: 'C', to: 'A', label: '4,4 cm' }, { from: 'C', to: 'B', label: '4 cm' }, ['B', 'A']],
  rightAngles: [['C', 'B', 'A']],
  angles: [{ at: 'C', from: 'B', to: 'A', label: '?' }],
  ariaLabel: 'المثلث ABC قائم في B، الوتر CA طوله 4,4 سم والضلع CB طوله 4 سم، والزاوية المطلوبة عند C',
  maxWidth: 320,
};

/* ── تمرين 8 (p. 123) : FDE قائم في D ; E à gauche, F à droite, D au-dessus ; DF = 4,2, EF = 7 (الوتر). ── */
export const FIG_EX8 = {
  // E à l'origine, F sur l'axe ; D tel que ED = 5,6 et DF = 4,2 (projection de D sur [EF] : ED² / EF)
  points: { E: [0, 0], F: [7, 0], D: [r3((5.6 * 5.6) / 7), r3((5.6 * 4.2) / 7)] },
  segments: [{ from: 'E', to: 'F', label: '7 cm' }, { from: 'D', to: 'F', label: '4,2 cm' }, ['E', 'D']],
  rightAngles: [['E', 'D', 'F']],
  angles: [{ at: 'E', from: 'F', to: 'D', label: '?' }],
  labels: { D: 'n' },
  ariaLabel: 'المثلث FDE قائم في D، الوتر EF طوله 7 سم والضلع DF طوله 4,2 سم، والزاوية المطلوبة عند E',
  maxWidth: 320,
};

/* ── تمرين 11 (p. 123) : TRI قائم في I ; IT = 2, IR = 5 (la figure à main levée que l'exercice demande). ── */
export const FIG_EX11 = {
  points: { I: [0, 0], R: [5, 0], T: [0, 2] },
  segments: [{ from: 'I', to: 'R', label: '5 cm' }, { from: 'I', to: 'T', label: '2 cm' }, ['T', 'R']],
  rightAngles: [['R', 'I', 'T']],
  angles: [{ at: 'R', from: 'I', to: 'T', label: '?' }],
  ariaLabel: 'المثلث TRI قائم في I، الضلع IT طوله 2 سم والضلع IR طوله 5 سم، والزاوية المطلوبة عند R',
  maxWidth: 320,
};

/* ── تمرين 23 (p. 123) : KLM قائم في K ; M en bas à gauche, K en bas à droite, L au-dessus de K ; MK = 5, ML = 9. ── */
export const FIG_EX23 = {
  points: rightTriangle({ names: ['M', 'K', 'L'], base: 5, hyp: 9 }),
  segments: [{ from: 'M', to: 'L', label: '9 cm' }, { from: 'M', to: 'K', label: '5 cm' }, ['K', 'L']],
  rightAngles: [['M', 'K', 'L']],
  angles: [{ at: 'M', from: 'K', to: 'L', label: '?' }],
  ariaLabel: 'المثلث KLM قائم في K، الوتر ML طوله 9 سم والضلع MK طوله 5 سم، والزاوية المطلوبة عند M',
  maxWidth: 300,
};

/* ── تمرين 3 (p. 122), plateforme : le triangle construit par un élève (40° en A, droit en C), ses mesures au mm. ── */
const C3 = [r3(8 * Math.cos((40 * Math.PI) / 180)), 0];
export const FIG_EX3 = {
  points: { A: [0, 0], C: C3, B: [C3[0], r3(8 * Math.sin((40 * Math.PI) / 180))] },
  segments: [{ from: 'A', to: 'B', label: '8 cm' }, { from: 'A', to: 'C', label: '6,1 cm' }, { from: 'C', to: 'B', label: '5,1 cm' }],
  rightAngles: [['A', 'C', 'B']],
  angles: [{ at: 'A', from: 'C', to: 'B', label: '40°' }],
  ariaLabel: 'مثلث ABC قائم في C أنشأه تلميذ: الزاوية عند A قيسها 40 درجة، وأطوال الأضلاع المقيسة 8 سم و 6,1 سم و 5,1 سم',
  maxWidth: 320,
};

/** Un triangle rectangle générique pour le banc (sommets nommés, longueurs étiquetées, l'angle marqué). */
export function bankTriangle({ names, base, height, labels = {}, angleAt, angleLabel = '?', aria }) {
  const [P, Q, R] = names; // P l'angle aigu marqué (en bas à gauche), Q l'angle droit (en bas à droite), R au-dessus de Q
  const pts = { [P]: [0, 0], [Q]: [base, 0], [R]: [base, height] };
  const seg = (a, b) => (labels[`${a}${b}`] ? { from: a, to: b, label: labels[`${a}${b}`] } : [a, b]);
  return {
    points: pts,
    segments: [seg(P, Q), seg(Q, R), seg(P, R)],
    rightAngles: [[P, Q, R]],
    angles: angleAt ? [{ at: angleAt, from: angleAt === P ? Q : Q, to: angleAt === P ? R : P, label: angleLabel }] : [],
    ariaLabel: aria,
    maxWidth: 300,
  };
}
