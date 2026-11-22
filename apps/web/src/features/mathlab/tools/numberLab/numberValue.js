/**
 * UNE VALEUR, PLUSIEURS REPRÉSENTATIONS — §46, §47.
 *
 * C'est l'identité du labo des nombres, et donc le module le plus important du
 * laboratoire. Tout ce qui s'affiche — une fraction, un décimal, un
 * pourcentage, un point sur la droite — est la MÊME valeur regardée sous un
 * angle différent, et tout ce qui se manipule met les autres à jour.
 *
 * D'où un choix d'architecture : le laboratoire ne stocke JAMAIS « 0,5 et
 * 1/2 et 50 % ». Il stocke UNE fraction exacte, et les représentations sont
 * DÉRIVÉES à chaque rendu (`representationsOf`). Trois champs séparés
 * dériveraient tôt ou tard — un arrondi ici, une saisie là — et l'écran
 * montrerait deux valeurs différentes en jurant que c'est la même. Ici c'est
 * impossible par construction : il n'y a qu'un nombre.
 *
 *     { n: 1, d: 2 }  →  1/2 · 0,5 · 50 % · un point à mi-chemin de 0 et 1
 *
 * §61 est tenu pour la même raison : la source est entière, donc
 * `1/3 + 1/3 + 1/3` fait `1`. Le décimal n'est qu'une VUE, jamais le support
 * du calcul.
 */

import {
  makeFrac, simplify, isSimplified, simplifyFactor, fracToNumber, fracToDecimal,
  fracToLatex, fracToText, toMixed, compareFrac, comparisonSign, parseNumberInput,
} from './fraction.js';
import { fracToPercent } from './proportion.js';
import { roundTo } from './numberTheory.js';

/**
 * Toutes les écritures d'une même valeur (§47).
 *
 * `exactDecimal` dit la VÉRITÉ sur le décimal : `1/3` n'a pas d'écriture
 * décimale finie, et l'afficher comme `0,333` sans le dire serait le premier
 * mensonge du laboratoire. L'interface écrit alors `0,(3)`.
 *
 * @param {{n: number, d: number}} frac
 */
export function representationsOf(frac) {
  if (!frac || frac.d === 0) return null;
  const reduced = simplify(frac);
  const decimal = fracToDecimal(frac);
  const value = fracToNumber(frac);
  const percent = fracToPercent(frac);

  return {
    frac,
    reduced,
    alreadySimplified: isSimplified(frac),
    simplifyFactor: simplifyFactor(frac),
    value,
    decimal,
    exactDecimal: decimal?.exact ?? false,
    // Le décimal AFFICHABLE : exact s'il tombe juste, la période sinon.
    decimalText: decimalTextOf(decimal),
    percent,
    percentExact: Number.isFinite(percent) && Number.isInteger(percent * 1e6) / 1 === percent * 1e6,
    mixed: toMixed(frac),
    latex: fracToLatex(frac),
    text: fracToText(frac),
  };
}

/** `0,75` · `0,(3)` · `−1,5` — le décimal tel qu'on l'ÉCRIT (§58 : virgule, vrai moins). */
export function decimalTextOf(decimal) {
  if (!decimal) return '';
  const sign = decimal.negative ? '−' : '';
  if (decimal.exact) {
    return decimal.digits ? `${sign}${decimal.integer},${decimal.digits}` : `${sign}${decimal.integer}`;
  }
  const head = decimal.digits ? `${decimal.integer},${decimal.digits}` : `${decimal.integer},`;

  return `${sign}${head}(${decimal.period})`;
}

/**
 * Un nombre pour l'affichage : virgule décimale, VRAI signe moins, chiffres
 * latins. C'est la règle de la plateforme
 * (`functionGrapher/grapherFormat.js`, §58) et le laboratoire ne s'en écarte
 * pas — sauf qu'ici on coupe aussi les zéros inutiles.
 */
export function formatNumber(value, decimals = 6) {
  if (!Number.isFinite(value)) return '—';
  const rounded = roundTo(value, decimals);
  const text = Number.isInteger(rounded) ? String(rounded) : String(rounded);

  return text.replace('.', ',').replace('-', '−');
}

/** Un pourcentage écrit : `35 %`, avec l'espace insécable qu'impose la typographie. */
export function formatPercent(percent, decimals = 4) {
  if (!Number.isFinite(percent)) return '—';

  return `${formatNumber(percent, decimals)} %`;
}

/**
 * Construire une valeur depuis n'importe quelle écriture — la porte d'entrée
 * de §46 (« switching representation must preserve the same value »).
 *
 * @returns {{frac, source} | null}
 */
export function valueFromInput(raw) {
  return parseNumberInput(raw);
}

/* ── §7, §43, §44, §45 : la droite graduée ─────────────────────────────── */

/**
 * La CORRESPONDANCE valeur ↔ position, la seule de tout le laboratoire.
 *
 * Toute droite graduée (§7, §32, §34, §36, §40, §44) passe par ces deux
 * fonctions : une seule mise en correspondance, donc un seul endroit où elle
 * peut être fausse — et `numberLine.test.js` le surveille.
 */
export function valueToX(value, view, width, margin = 0) {
  const { min, max } = viewBounds(view);
  if (max === min) return margin;

  return margin + ((value - min) / (max - min)) * (width - margin * 2);
}

export function xToValue(x, view, width, margin = 0) {
  const { min, max } = viewBounds(view);
  const usable = width - margin * 2;
  if (usable <= 0) return min;

  return min + ((x - margin) / usable) * (max - min);
}

/** La fenêtre `{center, span}` → ses bornes. Une portée nulle n'existe pas. */
export function viewBounds(view) {
  const center = Number.isFinite(view?.center) ? view.center : 0;
  const span = Number.isFinite(view?.span) && view.span > 0 ? view.span : 10;

  return { min: center - span / 2, max: center + span / 2, center, span };
}

/**
 * Le pas de graduation « rond » (1, 2, 5, 10, 20, 50…) pour cette portée.
 *
 * Même règle que la droite du labo d'algèbre (`algebra/NumberLine.jsx`) et que
 * le grapheur : les instruments de l'atelier doivent graduer pareil.
 */
export function tickStepFor(span, target = 10) {
  if (!Number.isFinite(span) || span <= 0) return 1;
  const rough = span / Math.max(2, target);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = normalized >= 5 ? 5 : (normalized >= 2 ? 2 : 1);

  return nice * magnitude;
}

/** Les graduations visibles, bornées — une droite ne dessine jamais mille traits. */
export function ticksFor(view, { target = 10, max = 80 } = {}) {
  const { min, max: high } = viewBounds(view);
  const step = tickStepFor(high - min, target);
  const out = [];
  const first = Math.ceil(min / step) * step;
  for (let tick = first; tick <= high + step * 1e-6 && out.length < max; tick += step) {
    // Le zéro doit être EXACTEMENT zéro : sinon l'étiquette affiche « −0 ».
    out.push(Math.abs(tick) < step * 1e-6 ? 0 : roundTo(tick, 10));
  }

  return { step, ticks: out };
}

/**
 * ACCROCHER une valeur glissée à la graduation la plus proche (§7).
 *
 * `snapDenominator` permet d'accrocher aux tiers ou aux quarts quand on
 * travaille en fractions : `1/3` doit être atteignable au doigt, et il ne
 * tombe sur aucune graduation décimale.
 */
export function snapValue(value, { step = null, snapDenominator = null, tolerance = 0.5 } = {}) {
  if (!Number.isFinite(value)) return value;
  if (Number.isFinite(snapDenominator) && snapDenominator > 0) {
    const scaled = value * snapDenominator;
    const nearest = Math.round(scaled);
    if (Math.abs(scaled - nearest) <= tolerance) return roundTo(nearest / snapDenominator, 10);

    return value;
  }
  if (Number.isFinite(step) && step > 0) {
    const nearest = Math.round(value / step) * step;
    if (Math.abs(value - nearest) <= step * tolerance) return roundTo(nearest, 10);
  }

  return value;
}

/** La valeur accrochée rendue en FRACTION exacte quand on travaille en fractions. */
export function snapToFraction(value, denominator) {
  if (!Number.isFinite(value) || !Number.isInteger(denominator) || denominator <= 0) return null;

  return makeFrac(Math.round(value * denominator), denominator);
}

/**
 * COMPARER deux valeurs (§45) : l'ordre, le signe, et la DISTANCE.
 *
 * La comparaison est faite sur les fractions (exacte) ; la distance est
 * rendue en fraction ET en décimal, parce que §45 veut la montrer sur la
 * droite et l'écrire.
 */
export function compareValues(a, b) {
  const order = compareFrac(a, b);
  if (order === null) return null;
  const difference = makeFrac(a.n * b.d - b.n * a.d, a.d * b.d);

  return {
    order,
    sign: comparisonSign(order),
    difference: difference ? simplify(difference) : null,
    distance: Math.abs(fracToNumber(a) - fracToNumber(b)),
    equal: order === 0,
  };
}

/** La VALEUR ABSOLUE (§44) : la distance à zéro, dite comme telle. */
export function absoluteValue(frac) {
  if (!frac) return null;

  return { frac: makeFrac(Math.abs(frac.n), frac.d), distance: Math.abs(fracToNumber(frac)) };
}

/**
 * Une fenêtre qui CONTIENT les valeurs qu'on lui donne, avec de la marge.
 *
 * Sert au recadrage (§7) et à chaque fois qu'un mode change de nombres : on
 * ne laisse jamais l'élève devant une droite où son point est hors champ —
 * c'est le défaut que le QA visuel de l'atelier a déjà attrapé ailleurs
 * (`mathlab-visual-qa-traps`).
 */
export function frameValues(values, { padding = 0.25, minSpan = 1 } = {}) {
  const finite = (Array.isArray(values) ? values : []).filter(Number.isFinite);
  if (finite.length === 0) return { center: 0, span: 10 };
  const low = Math.min(...finite);
  const high = Math.max(...finite);
  const raw = high - low;
  const span = Math.max(minSpan, raw === 0 ? Math.max(minSpan, Math.abs(low) || minSpan) : raw * (1 + padding * 2));

  return { center: roundTo((low + high) / 2, 10), span: roundTo(span, 10) };
}
