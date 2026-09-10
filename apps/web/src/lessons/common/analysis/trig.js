/**
 * Noyau trigonométrique — EN RADIANS UNIQUEMENT.
 *
 * Fonctions PURES, sans JSX ni état, partagées par les leçons de Première qui
 * traitent les fonctions sinus et cosinus comme des OBJETS : leur parité, leur
 * périodicité, leurs variations, leur courbe.
 *
 * ─── POURQUOI CE FICHIER EXISTE ────────────────────────────────────────────
 * Les deux leçons de Seconde (`trigonometrie-cercle-2nde` et
 * `trigonometrie-equations-2nde`) portent chacune une copie IDENTIQUE de
 * `components/trigoUtils.js`. Elles sont livrées et auditées : on n'y touche
 * pas. Ce module est le socle PARTAGÉ de la Première, pour que les leçons de
 * 1ère n'ajoutent pas deux copies de plus. Il n'est ni un remplaçant ni un
 * refactoring des deux fichiers de 2de.
 *
 * ─── RÈGLE DE JUSTESSE, load-bearing ───────────────────────────────────────
 *   `Math.sin(Math.PI / 6)` rend 0.49999999999999994, et `Math.cos(Math.PI/2)`
 *   rend 6.12e-17. Une leçon qui AFFICHE ces nombres ment à l'élève, et une
 *   leçon qui COMPARE la saisie de l'élève à ces nombres déclare fausse une
 *   réponse juste.
 *   `sinExact` / `cosExact` rendent donc la valeur EXACTE (issue de la table
 *   REMARQUABLES, construite à la main en fractions et radicaux) dès que t est
 *   un point remarquable, et retombent sur Math.sin / Math.cos ailleurs — où
 *   l'affichage n'est de toute façon qu'approché.
 */

/** Un tour complet, en radians. */
export const TAU = 2 * Math.PI;

/**
 * Ramène un réel dans [0 ; 2π[ — c'est l'enroulement : deux réels qui
 * diffèrent d'un nombre entier de tours arrivent sur le MÊME point.
 * `principal(-π/2)` vaut 3π/2, `principal(5π/2)` vaut π/2.
 */
export function principal(t) {
  const r = t % TAU;
  return r < 0 ? r + TAU : r;
}

/**
 * Le nombre entier de tours à retrancher pour ramener t dans [0 ; 2π[.
 * `t = principal(t) + tours(t) × 2π`, exactement.
 */
export function tours(t) {
  return Math.floor(t / TAU);
}

const R2 = Math.SQRT2 / 2;          // √2 / 2, la meilleure valeur double
const R3 = Math.sqrt(3) / 2;        // √3 / 2

/**
 * Les VINGT-QUATRE points remarquables du premier tour, par pas de π/12.
 *
 * Pourquoi π/12 et pas π/6 : c'est le plus grand pas qui atteigne À LA FOIS
 * π/6, π/4, π/3, π/2 et π (π/8 lui échappe, mais π/8 n'est pas une valeur
 * remarquable du programme). Le cliquet de la manipulation signature se cale
 * dessus : chaque cible pédagogique tombe EXACTEMENT sur un cran.
 *
 * `cos` et `sin` sont les valeurs EXACTES (0, ±1/2, ±√2/2, ±√3/2, ±1), jamais
 * `Math.cos(t)` : c'est ce qui garantit que l'affichage rende 0,5 et non
 * 0,49999999999999994.
 * `label` est l'écriture française (« π/6 »), `tex` l'écriture KaTeX.
 */
const H = 1 / 2;
export const REMARQUABLES = [
  { k: 0, t: 0, label: '0', tex: '0', cos: 1, sin: 0 },
  { k: 1, t: Math.PI / 12, label: 'π/12', tex: '\\dfrac{\\pi}{12}', cos: (Math.sqrt(6) + Math.sqrt(2)) / 4, sin: (Math.sqrt(6) - Math.sqrt(2)) / 4 },
  { k: 2, t: Math.PI / 6, label: 'π/6', tex: '\\dfrac{\\pi}{6}', cos: R3, sin: H },
  { k: 3, t: Math.PI / 4, label: 'π/4', tex: '\\dfrac{\\pi}{4}', cos: R2, sin: R2 },
  { k: 4, t: Math.PI / 3, label: 'π/3', tex: '\\dfrac{\\pi}{3}', cos: H, sin: R3 },
  { k: 5, t: (5 * Math.PI) / 12, label: '5π/12', tex: '\\dfrac{5\\pi}{12}', cos: (Math.sqrt(6) - Math.sqrt(2)) / 4, sin: (Math.sqrt(6) + Math.sqrt(2)) / 4 },
  { k: 6, t: Math.PI / 2, label: 'π/2', tex: '\\dfrac{\\pi}{2}', cos: 0, sin: 1 },
  { k: 7, t: (7 * Math.PI) / 12, label: '7π/12', tex: '\\dfrac{7\\pi}{12}', cos: -(Math.sqrt(6) - Math.sqrt(2)) / 4, sin: (Math.sqrt(6) + Math.sqrt(2)) / 4 },
  { k: 8, t: (2 * Math.PI) / 3, label: '2π/3', tex: '\\dfrac{2\\pi}{3}', cos: -H, sin: R3 },
  { k: 9, t: (3 * Math.PI) / 4, label: '3π/4', tex: '\\dfrac{3\\pi}{4}', cos: -R2, sin: R2 },
  { k: 10, t: (5 * Math.PI) / 6, label: '5π/6', tex: '\\dfrac{5\\pi}{6}', cos: -R3, sin: H },
  { k: 11, t: (11 * Math.PI) / 12, label: '11π/12', tex: '\\dfrac{11\\pi}{12}', cos: -(Math.sqrt(6) + Math.sqrt(2)) / 4, sin: (Math.sqrt(6) - Math.sqrt(2)) / 4 },
  { k: 12, t: Math.PI, label: 'π', tex: '\\pi', cos: -1, sin: 0 },
  { k: 13, t: (13 * Math.PI) / 12, label: '13π/12', tex: '\\dfrac{13\\pi}{12}', cos: -(Math.sqrt(6) + Math.sqrt(2)) / 4, sin: -(Math.sqrt(6) - Math.sqrt(2)) / 4 },
  { k: 14, t: (7 * Math.PI) / 6, label: '7π/6', tex: '\\dfrac{7\\pi}{6}', cos: -R3, sin: -H },
  { k: 15, t: (5 * Math.PI) / 4, label: '5π/4', tex: '\\dfrac{5\\pi}{4}', cos: -R2, sin: -R2 },
  { k: 16, t: (4 * Math.PI) / 3, label: '4π/3', tex: '\\dfrac{4\\pi}{3}', cos: -H, sin: -R3 },
  { k: 17, t: (17 * Math.PI) / 12, label: '17π/12', tex: '\\dfrac{17\\pi}{12}', cos: -(Math.sqrt(6) - Math.sqrt(2)) / 4, sin: -(Math.sqrt(6) + Math.sqrt(2)) / 4 },
  { k: 18, t: (3 * Math.PI) / 2, label: '3π/2', tex: '\\dfrac{3\\pi}{2}', cos: 0, sin: -1 },
  { k: 19, t: (19 * Math.PI) / 12, label: '19π/12', tex: '\\dfrac{19\\pi}{12}', cos: (Math.sqrt(6) - Math.sqrt(2)) / 4, sin: -(Math.sqrt(6) + Math.sqrt(2)) / 4 },
  { k: 20, t: (5 * Math.PI) / 3, label: '5π/3', tex: '\\dfrac{5\\pi}{3}', cos: H, sin: -R3 },
  { k: 21, t: (7 * Math.PI) / 4, label: '7π/4', tex: '\\dfrac{7\\pi}{4}', cos: R2, sin: -R2 },
  { k: 22, t: (11 * Math.PI) / 6, label: '11π/6', tex: '\\dfrac{11\\pi}{6}', cos: R3, sin: -H },
  { k: 23, t: (23 * Math.PI) / 12, label: '23π/12', tex: '\\dfrac{23\\pi}{12}', cos: (Math.sqrt(6) + Math.sqrt(2)) / 4, sin: -(Math.sqrt(6) - Math.sqrt(2)) / 4 },
];

/** Le pas du cliquet : π/12. Un douzième de demi-tour, 24 crans par tour. */
export const PAS = Math.PI / 12;

/**
 * L'entrée de REMARQUABLES pour un réel t, ou null si t n'est pas un point
 * remarquable. La comparaison porte sur l'INDICE de cran, pas sur une
 * distance : t = 25π/12 doit rendre l'entrée de π/12, un tour plus loin.
 */
export function remarquableDe(t, eps = 1e-9) {
  const p = principal(t);
  const k = Math.round(p / PAS);
  const kk = k % 24;
  const cible = REMARQUABLES[kk];
  // `k === 24` arrive quand p est juste sous 2π : c'est le cran 0 du tour suivant.
  const tCible = kk === 0 && k === 24 ? TAU : cible.t;
  return Math.abs(p - tCible) < eps ? cible : null;
}

/**
 * sin t, EXACT aux points remarquables.
 * Aux 24 crans du cliquet, la valeur vient de la table ; ailleurs Math.sin
 * fait l'affaire — l'affichage y est de toute façon approché.
 */
export function sinExact(t) {
  const r = remarquableDe(t);
  return r ? r.sin : Math.sin(t);
}

/** cos t, EXACT aux points remarquables. Même contrat que `sinExact`. */
export function cosExact(t) {
  const r = remarquableDe(t);
  return r ? r.cos : Math.cos(t);
}

/** Le point du cercle associé au réel t, avec des coordonnées exactes aux crans. */
export function pointOf(t) {
  return { x: cosExact(t), y: sinExact(t) };
}

/**
 * Découpe [a ; b] en intervalles de MONOTONIE de la fonction sinus.
 *
 * sin change de sens exactement aux réels π/2 + kπ : c'est là que le point du
 * cercle cesse de monter pour redescendre. On liste donc les bornes internes
 * de cette forme dans ]a ; b[, et l'on qualifie chaque morceau par le SIGNE de
 * la variation entre ses deux bouts — jamais par une règle recopiée à la main.
 *
 * @returns {{from:number,to:number,sens:'croissante'|'decroissante'}[]}
 */
export function variationsSin(a, b) {
  return decoupe(a, b, Math.PI / 2, sinExact);
}

/**
 * Découpe [a ; b] en intervalles de monotonie de la fonction cosinus.
 * cos change de sens aux réels kπ.
 */
export function variationsCos(a, b) {
  return decoupe(a, b, 0, cosExact);
}

/**
 * Le moteur commun : `premier` est un point de changement de sens, et ils se
 * répètent de π en π. Le SENS de chaque morceau est mesuré, pas supposé.
 */
function decoupe(a, b, premier, f) {
  if (!(b > a)) return [];
  const bornes = [a];
  // Le premier changement de sens strictement après a.
  const k0 = Math.ceil((a - premier) / Math.PI + 1e-12);
  for (let k = k0; ; k += 1) {
    const c = premier + k * Math.PI;
    if (c >= b - 1e-12) break;
    if (c > a + 1e-12) bornes.push(c);
  }
  bornes.push(b);
  const out = [];
  for (let i = 0; i < bornes.length - 1; i += 1) {
    const from = bornes[i];
    const to = bornes[i + 1];
    // Le milieu évite les bornes, où la variation est nulle au premier ordre.
    const g = f(from + (to - from) * 0.25);
    const d = f(from + (to - from) * 0.75);
    out.push({ from, to, sens: d > g ? 'croissante' : 'decroissante' });
  }
  return out;
}

/**
 * Test NUMÉRIQUE de parité sur un échantillon : f(−x) = f(x) pour tout x testé.
 * C'est un CONSTAT, pas une démonstration — et c'est exactement ce que la
 * leçon fait faire à l'élève : il compare deux colonnes de nombres.
 */
export function estPaire(f, echantillon = ECHANTILLON, eps = 1e-12) {
  return echantillon.every((x) => Math.abs(f(-x) - f(x)) < eps);
}

/** Test numérique d'imparité : f(−x) = −f(x) pour tout x testé. */
export function estImpaire(f, echantillon = ECHANTILLON, eps = 1e-12) {
  return echantillon.every((x) => Math.abs(f(-x) + f(x)) < eps);
}

/**
 * L'échantillon par défaut des deux tests de parité : les crans du cliquet sur
 * un tour et demi, plus quelques réels quelconques — pour qu'une fonction ne
 * puisse pas « passer » le test en n'étant juste qu'aux points remarquables.
 */
export const ECHANTILLON = [
  ...Array.from({ length: 37 }, (_, i) => i * PAS),
  0.37, 1.13, 2.71, 4.02, 5.55, 7.31,
];

/**
 * Test numérique de périodicité : f(x + p) = f(x) pour tout x de l'échantillon.
 * Sert au test unitaire ET au module qui fait constater le retour à l'identique.
 */
export function estPeriodique(f, p, echantillon = ECHANTILLON, eps = 1e-9) {
  return echantillon.every((x) => Math.abs(f(x + p) - f(x)) < eps);
}

/**
 * La courbe échantillonnée d'une fonction sur [a ; b], sous la forme attendue
 * par `CoordPlane.curves` : [{ x, y }]. Le pas est FIXE et le nombre de points
 * est calculé, pour qu'une courbe longue ne soit pas moins lisse qu'une courte.
 */
export function echantillonner(f, a, b, n = 240) {
  const pts = [];
  for (let i = 0; i <= n; i += 1) {
    const x = a + ((b - a) * i) / n;
    pts.push({ x, y: f(x) });
  }
  return pts;
}

/**
 * Écriture française d'un multiple de π/12 : « 0 », « π/6 », « −5π/4 », « 2π ».
 * Elle DÉRIVE du nombre, elle n'est pas saisie à la main — un texte et une
 * figure ne peuvent donc pas se contredire.
 */
export function labelPi(t, eps = 1e-9) {
  const k = Math.round(t / PAS);
  if (Math.abs(t - k * PAS) > eps) return null;
  if (k === 0) return '0';
  const signe = k < 0 ? '−' : '';
  const [num, den] = reduire(Math.abs(k), 12);
  const tete = num === 1 ? 'π' : `${num}π`;
  return den === 1 ? `${signe}${tete}` : `${signe}${tete}/${den}`;
}

/** L'écriture KaTeX du même multiple de π/12. */
export function texPi(t, eps = 1e-9) {
  const k = Math.round(t / PAS);
  if (Math.abs(t - k * PAS) > eps) return null;
  if (k === 0) return '0';
  const signe = k < 0 ? '-' : '';
  const [num, den] = reduire(Math.abs(k), 12);
  const tete = num === 1 ? '\\pi' : `${num}\\pi`;
  return den === 1 ? `${signe}${tete}` : `${signe}\\dfrac{${num === 1 ? '\\pi' : `${num}\\pi`}}{${den}}`.replace('-\\dfrac', '-\\dfrac');
}

function reduire(num, den) {
  const g = pgcd(num, den);
  return [num / g, den / g];
}

function pgcd(a, b) {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Formatage français d'un réel approché : virgule, vrai signe moins U+2212. */
export const fr = (v, dp = 2) => {
  const s = v.toFixed(dp);
  // −0,00 n'existe pas : c'est zéro.
  const z = Number(s) === 0 ? (0).toFixed(dp) : s;
  return z.replace('.', ',').replace('-', '−');
};
