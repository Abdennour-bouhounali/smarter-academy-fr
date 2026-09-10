/**
 * Le modèle mathématique de « Second degré : résoudre ».
 *
 * Tout ce que les modules affichent en est DÉRIVÉ : aucun discriminant, aucune
 * racine, aucune forme factorisée n'est écrite à la main dans un module sans
 * qu'un test la recalcule. Le noyau partagé (common/analysis/quadratic.js)
 * fournit les fonctions ; ce fichier fixe LES DONNÉES de cette leçon — les
 * crans du laboratoire, le cadre du repère, les trinômes travaillés.
 */
import {
  discriminant, roots, factoredForm, vertex, trinomialSign, rootCount, evalTrinome,
} from '../../../../../common/analysis/quadratic';
import { formatDec, parseDec } from '@smarter-academy/core';

export { discriminant, roots, factoredForm, vertex, trinomialSign, rootCount, evalTrinome };

/** Format français des nombres de la leçon : virgule, VRAI signe moins. */
export const fr = (n, opts) => formatDec(n, opts).replace('-', '−');

/**
 * Lecture d'une saisie élève SIGNÉE.
 *
 * `parseDec` du noyau n'accepte que le tiret ASCII : la leçon AFFICHE « −4 »
 * avec le vrai signe moins U+2212, et un élève qui recopie ce qu'il voit —
 * ou qui utilise le clavier mathématique — verrait sa réponse juste refusée.
 * On normalise donc les trois traits qui traînent dans les copies avant de
 * déléguer au noyau. `parseFr` serait doublement faux ici : entier-seulement
 * ET sans signe.
 */
export const parseSigned = (str) =>
  typeof str === 'string' ? parseDec(str.replace(/[−–—]/g, '-')) : parseDec(str);

/**
 * ─── LE LABORATOIRE SIGNATURE : la parabole qui remonte ────────────────────
 *
 * y = x² − 4x + c. L'élève fait GLISSER la parabole verticalement par un
 * cliquet sur c ; les deux points d'intersection avec l'axe des abscisses
 * glissent l'un vers l'autre, FUSIONNENT, puis DISPARAISSENT.
 *
 * a = 1 et b = −4 sont FIXÉS : Δ = 16 − 4c s'annule donc exactement en c = 4.
 * CIBLE ATTEIGNABLE (§17bis) : 4 doit tomber EXACTEMENT sur un cran. Avec un
 * départ à 0 et un pas de 0,5, le huitième cran vaut 4 — vérifié par un test,
 * pas supposé.
 */
export const LAB = {
  a: 1,
  b: -4,
  cMin: 0,
  cMax: 6,
  cStep: 0.5,
  cStart: 0,
  /** Le cran où Δ s'annule : la fusion des deux points. */
  cFusion: 4,
  // Cadre CALCULÉ, pas constaté : sur toute la plage de c, les racines vivent
  // dans [0 ; 4] et le sommet entre −4 et 2. Un cadre x ∈ [−1 ; 5],
  // y ∈ [−5 ; 4] les contient tous, avec une marge d'une unité de chaque côté.
  // Le test `le cadre contient TOUT ce que le laboratoire montre` le balaye.
  range: { xMin: -1, xMax: 5, yMin: -5, yMax: 4 },
  unit: 46,
  unitY: 30,
};

/** Les crans de c, du plus bas au plus haut. */
export const C_STEPS = (() => {
  const out = [];
  for (let c = LAB.cMin; c <= LAB.cMax + 1e-9; c += LAB.cStep) {
    out.push(Math.round(c * 100) / 100);
  }
  return out;
})();

/** L'état complet du laboratoire pour une valeur de c — tout en est dérivé. */
export function labState(c) {
  const { a, b } = LAB;
  return {
    a, b, c,
    delta: discriminant(a, b, c),
    racines: roots(a, b, c),
    nombre: rootCount(a, b, c),
    sommet: vertex(a, b, c),
  };
}

/**
 * Les trois régimes du laboratoire, avec le cran le plus bas de chacun.
 * C'est la table que le module 1 cite ; elle est CALCULÉE, jamais saisie.
 */
export function regimes() {
  const out = { 2: [], 1: [], 0: [] };
  for (const c of C_STEPS) out[rootCount(LAB.a, LAB.b, c)].push(c);
  return out;
}

/** A-t-il vu les trois régimes ? C'est l'objectif de l'étape de manipulation. */
export const aVuLesTroisRegimes = (visites) => {
  const vus = new Set(visites.map((c) => rootCount(LAB.a, LAB.b, c)));
  return vus.has(2) && vus.has(1) && vus.has(0);
};

/**
 * ─── LES TRINÔMES TRAVAILLÉS (modules 4 à 6) ──────────────────────────────
 *
 * Chacun déclare ses coefficients, RIEN d'autre : Δ, racines, forme factorisée
 * et sommet sont recalculés à la demande. Un module qui citerait « Δ = 25 »
 * sans que le test le recalcule serait une affirmation non vérifiée.
 */
export const TRINOMES = {
  /** Δ = 25 > 0, racines −1 et 3/2 : deux racines dont une non entière. */
  deuxRacines: { id: 'deux', a: 2, b: -1, c: -3, label: '2x² − x − 3' },
  /** Δ = 0, racine double 3 : le cas de la fusion, sur d'autres coefficients. */
  racineDouble: { id: 'double', a: 1, b: -6, c: 9, label: 'x² − 6x + 9' },
  /** Δ = −8 < 0 : aucune solution réelle, et pourtant le trinôme existe. */
  sansRacine: { id: 'aucune', a: 1, b: 2, c: 3, label: 'x² + 2x + 3' },
  /** a < 0 : la parabole est tournée vers le bas, les racines restent triées. */
  aNegatif: { id: 'aneg', a: -1, b: 2, c: 3, label: '−x² + 2x + 3' },
  /** Racines IRRATIONNELLES : Δ = 8, x = 1 ± √2. Le cas que l'élève doit oser. */
  irrationnel: { id: 'irr', a: 1, b: -2, c: -1, label: 'x² − 2x − 1' },
};

/** Le cadre de dessin d'un trinôme : CALCULÉ pour contenir sommet et racines. */
export function cadreDe(t, marge = 1.5) {
  const v = vertex(t.a, t.b, t.c);
  const rs = roots(t.a, t.b, t.c);
  const xs = [v.x, ...rs];
  const xMin = Math.floor(Math.min(...xs) - marge);
  const xMax = Math.ceil(Math.max(...xs) + marge);
  // Le sommet et les valeurs aux bords décident de l'étendue verticale.
  const ys = [v.y, evalTrinome(t.a, t.b, t.c, xMin), evalTrinome(t.a, t.b, t.c, xMax)];
  return {
    xMin, xMax,
    yMin: Math.floor(Math.min(...ys, 0) - 1),
    yMax: Math.ceil(Math.max(...ys, 0) + 1),
  };
}

/** Écriture française d'un trinôme ax² + bx + c, signes compris. */
export function trinomeText(a, b, c) {
  const terme = (coef, suffixe, premier) => {
    if (coef === 0) return '';
    const signe = coef < 0 ? (premier ? '−' : ' − ') : premier ? '' : ' + ';
    const abs = Math.abs(coef);
    const nombre = abs === 1 && suffixe ? '' : fr(abs);
    return `${signe}${nombre}${suffixe}`;
  };
  return `${terme(a, 'x²', true)}${terme(b, 'x', false)}${terme(c, '', false)}` || '0';
}

/** Écriture française de la forme factorisée a(x − x₁)(x − x₂). */
export function factoriseeText(a, b, c) {
  const { roots: rs, factorable } = factoredForm(a, b, c);
  if (!factorable) return null;
  // (x − 3) et (x + 1) : le signe se FOND dans la parenthèse, il ne s'empile
  // pas en « (x − −1) ». C'est l'écriture du tableau, et un test la verrouille.
  const bloc = (r) => (r < 0 ? `(x + ${fr(-r)})` : `(x − ${fr(r)})`);
  const tete = a === 1 ? '' : a === -1 ? '−' : fr(a);
  return rs.length === 1 ? `${tete}${bloc(rs[0])}²` : `${tete}${bloc(rs[0])}${bloc(rs[1])}`;
}

/** L'ensemble des solutions, écrit comme au tableau. */
export function solutionsText(a, b, c) {
  const rs = roots(a, b, c);
  if (rs.length === 0) return '∅';
  return `{ ${rs.map((r) => fr(r, { maxDecimals: 3 })).join(' ; ')} }`;
}

/**
 * LE GLISSER DE LA PARABOLE — l'aimantation sur le cran de c le plus proche.
 *
 * L'élève attrape la courbe et la tire VERTICALEMENT. Ce qui se règle est sa
 * hauteur c ; l'ordonnée sous le doigt est donc convertie en c par la valeur
 * du trinôme au SOMMET, seul point dont la hauteur ne dépende que de c :
 *
 *     y_sommet = c − b²/(4a)   ⇒   c = y_sommet + b²/(4a)
 *
 * Le résultat est aimanté sur `C_STEPS`, puis SERRÉ à la plage. La valeur
 * rendue est donc toujours un cran existant — en particulier `cFusion = 4`,
 * l'état où les deux racines se confondent, reste EXACTEMENT atteignable au
 * doigt comme il l'était au bouton. Verrouillé par un test.
 */
export function cAimante(ySommet, crans = C_STEPS) {
  const brut = ySommet + (LAB.b * LAB.b) / (4 * LAB.a);
  let best = crans[0];
  let dist = Math.abs(brut - best);
  for (const c of crans) {
    const d = Math.abs(brut - c);
    if (d < dist) { dist = d; best = c; }
  }
  return best;
}
