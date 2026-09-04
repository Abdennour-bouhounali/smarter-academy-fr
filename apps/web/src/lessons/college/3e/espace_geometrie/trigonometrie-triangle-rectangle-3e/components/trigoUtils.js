/**
 * Modèle mathématique de « Trigonométrie dans le triangle rectangle » (3e).
 *
 * ─── L'IDÉE QUE TOUT LE FICHIER SERT ───────────────────────────────────
 * Un rapport de longueurs dans un triangle rectangle ne dépend QUE de l'angle,
 * pas de la taille du triangle. C'est pourquoi `ratiosFor(alpha)` ne prend
 * aucune longueur en paramètre : agrandir le triangle ne change rien, et le
 * module signature le fait constater en superposant plusieurs tailles.
 *
 * ─── CONVENTION D'ANGLE (locale à cette leçon) ─────────────────────────
 * `geometry2d.js` ne porte aucune convention d'angle, et les helpers polaires
 * des autres leçons divergent volontairement. Ici :
 *   - les angles sont en DEGRÉS ;
 *   - l'angle étudié α est celui du sommet A ;
 *   - le triangle est construit avec l'angle droit en B, [AB] horizontal vers
 *     la droite et [BC] vertical vers le HAUT de l'écran (donc y décroissant,
 *     puisque le repère SVG a son y vers le bas).
 * Cette convention est appliquée dans `trianglePoints` et nulle part ailleurs.
 *
 * ─── LES TROIS CÔTÉS, RELATIVEMENT À α ─────────────────────────────────
 * hypoténuse : toujours [AC], face à l'angle droit — elle ne change jamais.
 * opposé     : le côté qui ne touche pas α.
 * adjacent   : le côté qui touche α sans être l'hypoténuse.
 * Changer d'angle de référence ÉCHANGE opposé et adjacent : c'est la source
 * d'erreur numéro un, et `sidesFor` la rend explicite.
 */

export const DEG = Math.PI / 180;

export const deg = (rad) => (rad * 180) / Math.PI;
export const rad = (d) => d * DEG;

/* ── Fonctions trigonométriques en degrés ─────────────────────────────── */

export const sinDeg = (a) => Math.sin(a * DEG);
export const cosDeg = (a) => Math.cos(a * DEG);
export const tanDeg = (a) => Math.tan(a * DEG);

export const asinDeg = (x) => deg(Math.asin(x));
export const acosDeg = (x) => deg(Math.acos(x));
export const atanDeg = (x) => deg(Math.atan(x));

/* ── Les trois rapports ───────────────────────────────────────────────── */

/**
 * Les trois rapports pour un angle donné. AUCUNE longueur en paramètre :
 * c'est l'énoncé même de l'invariance que la leçon fait découvrir.
 */
export function ratiosFor(alphaDeg) {
  return {
    sin: sinDeg(alphaDeg),
    cos: cosDeg(alphaDeg),
    tan: tanDeg(alphaDeg),
  };
}

/** Les mêmes rapports, calculés à partir de longueurs MESURÉES. */
export function ratiosFromSides({ opp, adj, hyp }) {
  return {
    sin: hyp === 0 ? null : opp / hyp,
    cos: hyp === 0 ? null : adj / hyp,
    tan: adj === 0 ? null : opp / adj,
  };
}

/**
 * Les longueurs des trois côtés pour un angle α et une hypoténuse donnée.
 * L'échelle multiplie tout : c'est exactement ce que le module 3 fait varier.
 */
export function sidesFor(alphaDeg, hyp) {
  return {
    hyp,
    opp: hyp * sinDeg(alphaDeg),
    adj: hyp * cosDeg(alphaDeg),
  };
}

/* ── Le triangle dessiné ──────────────────────────────────────────────── */

/**
 * Les trois sommets, dans la convention décrite en tête de fichier.
 * A est l'angle étudié, B l'angle droit, C le sommet restant.
 */
export function trianglePoints(alphaDeg, hyp, origin = { x: 60, y: 220 }) {
  const { opp, adj } = sidesFor(alphaDeg, hyp);
  const A = { x: origin.x, y: origin.y };
  const B = { x: origin.x + adj, y: origin.y };
  const C = { x: origin.x + adj, y: origin.y - opp };
  return { A, B, C };
}

/* ── Nommer les côtés relativement à l'angle étudié ───────────────────── */

export const SIDE_NAMES = {
  opp: 'côté opposé',
  adj: 'côté adjacent',
  hyp: 'hypoténuse',
};

/**
 * Quel côté joue quel rôle, selon le sommet étudié.
 *
 * `vertex` vaut 'A' ou 'C' (les deux angles aigus). L'hypoténuse est toujours
 * [AC] ; opposé et adjacent s'ÉCHANGENT quand on passe de A à C. C'est le
 * point que le module 2 fait manipuler.
 */
export function roleOfSides(vertex) {
  if (vertex === 'A') {
    return { opp: 'BC', adj: 'AB', hyp: 'AC' };
  }
  if (vertex === 'C') {
    return { opp: 'AB', adj: 'BC', hyp: 'AC' };
  }
  throw new Error(`roleOfSides: sommet « ${vertex} » invalide (attendu : A ou C, les deux angles aigus).`);
}

/** Le rôle d'un côté donné, relativement au sommet étudié. */
export function roleOf(side, vertex) {
  const roles = roleOfSides(vertex);
  return Object.keys(roles).find((k) => roles[k] === side) ?? null;
}

/* ── Choisir le bon rapport ───────────────────────────────────────────── */

export const RATIO_DEF = {
  sin: { nom: 'sinus', formule: 'opposé / hypoténuse', paire: ['opp', 'hyp'] },
  cos: { nom: 'cosinus', formule: 'adjacent / hypoténuse', paire: ['adj', 'hyp'] },
  tan: { nom: 'tangente', formule: 'opposé / adjacent', paire: ['opp', 'adj'] },
};

/**
 * LE cœur méthodologique de la leçon : connaissant un côté et cherchant un
 * autre, quel rapport utiliser ? Il y en a toujours exactement un.
 * Renvoie 'sin', 'cos', 'tan', ou null si les deux côtés sont les mêmes.
 */
export function chooseRatio(known, wanted) {
  if (known === wanted) return null;
  const paire = new Set([known, wanted]);
  return Object.keys(RATIO_DEF).find((k) => {
    const [a, b] = RATIO_DEF[k].paire;
    return paire.has(a) && paire.has(b);
  }) ?? null;
}

/**
 * Calcule la longueur cherchée à partir de l'angle, d'un côté connu et du
 * rapport adapté.
 */
export function solveSide({ alphaDeg, known, knownValue, wanted }) {
  const ratio = chooseRatio(known, wanted);
  if (!ratio) return null;
  const v = ratiosFor(alphaDeg)[ratio];
  const [num, den] = RATIO_DEF[ratio].paire;   // rapport = num / den
  if (wanted === num) return knownValue * v;   // num = den × rapport
  return knownValue / v;                       // den = num ÷ rapport
}

/**
 * L'angle, à partir d'un rapport de deux longueurs. C'est l'opération inverse,
 * celle des touches arccos / arcsin / arctan de la calculatrice.
 */
export function solveAngle({ ratio, value }) {
  if (value === null || value === undefined) return null;
  if (ratio === 'sin') return value > 1 ? null : asinDeg(value);
  if (ratio === 'cos') return value > 1 ? null : acosDeg(value);
  if (ratio === 'tan') return atanDeg(value);
  return null;
}

/** Arrondi au dixième, comme les énoncés le demandent. */
export function roundTenth(v) {
  return Math.round(v * 10) / 10;
}

/**
 * Un sinus et un cosinus valent toujours au plus 1, puisque l'hypoténuse est
 * le plus grand côté. Un élève qui trouve sin α = 1,4 s'est trompé de rapport.
 */
export function isPlausibleRatio(ratio, value) {
  if (ratio === 'tan') return value > 0;
  return value > 0 && value <= 1;
}

/* ── Les scènes de la leçon (constantes littérales) ──────────────────── */

export const BOX = { xMin: 0, yMin: 0, xMax: 340, yMax: 260 };

/**
 * Les deux rampes du déclencheur : même angle, tailles différentes.
 *
 * L'angle est celui du triangle 3-4-5 (≈ 36,87°) et les hypoténuses sont des
 * multiples de 5. Les côtés tombent donc sur des ENTIERS exacts (45 et 60,
 * puis 75 et 100), et les deux quotients affichent rigoureusement 0,75. Avec
 * un angle quelconque, l'arrondi des longueurs donnait deux quotients
 * légèrement différents (0,365 contre 0,362) — ce qui aurait contredit le
 * message même du module.
 */
const ANGLE_345 = Math.round(Math.atan(3 / 4) * (180 / Math.PI) * 100) / 100;

export const RAMPES = [
  { id: 'petite', label: 'Rampe A', alpha: ANGLE_345, hyp: 75 },
  { id: 'grande', label: 'Rampe B', alpha: ANGLE_345, hyp: 125 },
];

/** L'angle et les tailles du module signature. */
export const SIGNATURE = { alpha: 35, echelles: [70, 100, 130, 160] };
