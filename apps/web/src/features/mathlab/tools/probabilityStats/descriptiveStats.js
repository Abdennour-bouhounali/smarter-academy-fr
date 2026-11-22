/**
 * LA STATISTIQUE DESCRIPTIVE du laboratoire — ce que « الإحصاء الوصفي » lit
 * dans une série : les indicateurs, le tableau des effectifs et des effectifs
 * cumulés, les positions du tri, et quels graphiques sont HONNÊTES pour
 * cette série. Fonctions pures, sans React.
 *
 * Le calcul de fond n'est PAS réécrit : moyenne, médiane, quartiles
 * (rang ⌈kn/4⌉, jamais interpolé), variance de POPULATION et cinq nombres
 * viennent de `lessons/common/stats/statsUtils.js`. Ce module assemble et
 * décide ; il ne redéfinit rien.
 *
 *     values → describeDataset  → { n, min, max, range, mean, median, q1, q3, iqr, variance, sd, modes }
 *            → valueRows        → [{ value, count, frequency, cumulativeCount, cumulativeFrequency, angle }]
 *            → classRows        → [{ from, to, isLast, count, …cumulés }]
 *            → chartAvailability→ { bars, histogram, pie, box, cumulative } (disponible, ou la RAISON)
 */

import {
  fiveNumberSummary, frequencyTable, interquartileRange, mean, median, q1, q3, range,
  sorted, standardDeviation, variance,
} from '../../../../lessons/common/stats/statsUtils.js';
import { MAX_DISTINCT_BARS, distributionOf, histogramBins } from './datasetStatistics.js';

/** Au-delà de ce nombre de modalités, un secteur devient une aiguille : le diagramme circulaire ment par illisibilité. */
export const MAX_PIE_SECTORS = 8;

/** Les types de graphique du laboratoire, dans l'ordre du sélecteur. */
export const CHART_TYPES = Object.freeze(['bars', 'histogram', 'pie', 'box', 'cumulative']);

/** Jusqu'à cette taille, la substitution de la variance est écrite terme à terme. */
export const MAX_SUBSTITUTION_TERMS = 8;

/**
 * Le(s) MODE(S) d'une série — المنوال. Trois cas, et aucun n'est inventé :
 *   - une seule valeur distincte     → elle est le mode ;
 *   - toutes les valeurs distinctes ont le MÊME effectif (1, 2, 3 ; ou
 *     2, 2, 5, 5)                      → « لا يوجد منوال » ;
 *   - sinon                           → la ou les valeurs d'effectif maximal
 *                                       (une série peut être bimodale).
 */
export function modesOf(values) {
  if (!Array.isArray(values) || values.length === 0) return { kind: 'empty', values: [], count: 0 };
  const table = frequencyTable(values);
  const top = Math.max(...table.map((entry) => entry.count));
  if (table.length > 1 && table.every((entry) => entry.count === top)) {
    return { kind: 'none', values: [], count: top };
  }

  return { kind: 'values', values: table.filter((entry) => entry.count === top).map((entry) => entry.value), count: top };
}

/**
 * Tous les indicateurs d'une série. Une série vide rend `null` partout
 * (jamais NaN) ; une seule valeur rend une variance nulle, pas une erreur.
 */
export function describeDataset(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      n: 0, min: null, max: null, range: null, mean: null, median: null,
      q1: null, q3: null, iqr: null, variance: null, sd: null, modes: modesOf([]),
    };
  }
  const s = sorted(values);
  const v = variance(values);

  return {
    n: values.length,
    min: s[0],
    max: s[s.length - 1],
    range: range(values),
    mean: mean(values),
    median: median(values),
    q1: q1(values),
    q3: q3(values),
    iqr: interquartileRange(values),
    // Une variance calculée sur des flottants peut sortir à −1e−17 : c'est zéro.
    variance: v < 1e-12 ? 0 : v,
    sd: v < 1e-12 ? 0 : standardDeviation(values),
    modes: modesOf(values),
  };
}

/**
 * Le tableau par VALEUR : effectif, fréquence, effectifs cumulés croissants
 * (التكرار المجمّع الصاعد) et l'angle d'un secteur (360° × f).
 */
export function valueRows(values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const n = values.length;
  let running = 0;

  return frequencyTable(values).map((entry) => {
    running += entry.count;

    return {
      key: `v:${entry.value}`,
      value: entry.value,
      from: entry.value,
      to: entry.value,
      count: entry.count,
      frequency: entry.count / n,
      cumulativeCount: running,
      cumulativeFrequency: running / n,
      angle: (360 * entry.count) / n,
    };
  });
}

/** Le tableau par CLASSE — les classes de l'histogramme, avec leurs cumuls. */
export function classRows(values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const n = values.length;
  let running = 0;

  return histogramBins(values).map((bin, index) => {
    running += bin.count;

    return {
      key: `c:${index}`,
      index,
      value: null,
      from: bin.from,
      to: bin.to,
      isLast: Boolean(bin.isLast) || bin.from === bin.to,
      count: bin.count,
      frequency: bin.count / n,
      cumulativeCount: running,
      cumulativeFrequency: running / n,
      angle: (360 * bin.count) / n,
    };
  });
}

/** La ligne du tableau qui contient une valeur (pour relier le tri, le tableau et le dessin). */
export function rowKeyOfValue(rows, value) {
  if (!Number.isFinite(value)) return null;
  const row = rows.find((r) => (r.value !== null
    ? r.value === value
    : (r.isLast ? value >= r.from && value <= r.to : value >= r.from && value < r.to)));

  return row ? row.key : null;
}

/**
 * Quels graphiques cette série autorise — et, pour ceux qu'elle refuse, la
 * RAISON (une clé i18n), jamais un dessin silencieusement faux :
 *   - bars      : une barre par valeur ; au-delà de MAX_DISTINCT_BARS valeurs
 *                 distinctes, c'est une clôture → refusé (« utilise l'histogramme ») ;
 *   - histogram : il faut au moins deux valeurs distinctes pour découper des classes ;
 *   - pie       : série discrète d'au plus MAX_PIE_SECTORS modalités ;
 *   - box       : dès une valeur ;
 *   - cumulative: dès une valeur.
 */
export function chartAvailability(values) {
  const n = Array.isArray(values) ? values.length : 0;
  if (n === 0) {
    return Object.fromEntries(CHART_TYPES.map((type) => [type, { available: false, reason: 'empty' }]));
  }
  const distinct = new Set(values).size;

  return {
    bars: distinct <= MAX_DISTINCT_BARS ? { available: true } : { available: false, reason: 'tooManyForBars' },
    histogram: distinct >= 2 ? { available: true } : { available: false, reason: 'singleValue' },
    pie: distinct <= MAX_PIE_SECTORS ? { available: true } : { available: false, reason: 'tooManyForPie' },
    box: { available: true },
    cumulative: { available: true },
  };
}

/**
 * Le graphique à dessiner. `requested` est ce que l'élève a choisi (ou
 * `null` : le choix automatique d'avant, bâtons ≤ 15 valeurs distinctes,
 * histogramme au-delà). Un choix devenu impossible (la série a changé)
 * retombe sur l'automatique — et l'interface montre pourquoi.
 */
export function resolveChart(requested, values) {
  const availability = chartAvailability(values);
  const automatic = distributionOf(values).kind === 'classes' ? 'histogram' : 'bars';
  if (CHART_TYPES.includes(requested) && availability[requested].available) {
    return { chart: requested, fallback: false, automatic };
  }

  return { chart: automatic, fallback: CHART_TYPES.includes(requested) && requested !== automatic, automatic };
}

/** Le regroupement du TABLEAU : par valeur quand c'est lisible, par classe pour l'histogramme ou une série dispersée. */
export function tableGrouping(chart, values) {
  if (chart === 'histogram') return 'classes';
  const distinct = Array.isArray(values) ? new Set(values).size : 0;

  return distinct > MAX_DISTINCT_BARS ? 'classes' : 'values';
}

/**
 * Les RANGS marquants de la série ordonnée (1-indexés), pour la bande triée :
 *   Q1 : ⌈n/4⌉ ; Q3 : ⌈3n/4⌉ ; Me : (n+1)/2 si n impair, n/2 et n/2 + 1 sinon.
 * C'est la convention de statsUtils — la bande montre d'où viennent les nombres.
 */
export function sortedMarks(n) {
  if (!Number.isInteger(n) || n <= 0) return { q1: null, q3: null, median: [] };
  const median = n % 2 === 1 ? [(n + 1) / 2] : [n / 2, n / 2 + 1];

  return { q1: Math.ceil(n / 4), q3: Math.ceil((3 * n) / 4), median };
}

/** Les cinq nombres de la boîte à moustaches (min, Q1, Me, Q3, max), ou `null`. */
export function boxPlotNumbers(values) {
  return fiveNumberSummary(values);
}

/**
 * Les points du graphique des effectifs cumulés croissants.
 *   - par classes : un POLYGONE — (borne inférieure de la 1re classe ; 0),
 *     puis (borne supérieure de chaque classe ; effectif cumulé) ;
 *   - par valeurs : un ESCALIER — l'effectif cumulé saute à chaque valeur.
 * Ce n'est pas un choix de style : une série discrète n'a pas de valeurs
 * « entre deux », la joindre par des segments inventerait des individus.
 */
export function cumulativeSeries(values, grouping) {
  if (!Array.isArray(values) || values.length === 0) return { kind: grouping === 'classes' ? 'polygon' : 'steps', points: [], n: 0 };
  if (grouping === 'classes') {
    const rows = classRows(values);
    const points = [{ x: rows[0].from, y: 0 }, ...rows.map((row) => ({ x: row.to, y: row.cumulativeCount, key: row.key }))];

    return { kind: 'polygon', points, n: values.length };
  }
  const rows = valueRows(values);

  return { kind: 'steps', points: rows.map((row) => ({ x: row.value, y: row.cumulativeCount, key: row.key })), n: values.length };
}

/**
 * Les SECTEURS d'un diagramme circulaire : angle de départ et de fin en
 * degrés, sens horaire depuis midi. La somme vaut 360° exactement (le
 * dernier secteur ferme le cercle, pas un flottant qui s'en approche).
 */
export function pieSectors(rows) {
  let start = 0;

  return rows.map((row, index) => {
    const end = index === rows.length - 1 ? 360 : start + row.angle;
    const sector = { key: row.key, row, start, end };
    start = end;

    return sector;
  });
}

/**
 * La SUBSTITUTION de la variance, terme à terme, pour une petite série :
 *   V = (1/n)[(x₁ − x̄)² + … ] — chaque terme avec sa valeur.
 * Au-delà de MAX_SUBSTITUTION_TERMS valeurs, `null` : l'écriture
 * deviendrait un mur, la formule suffit.
 */
export function varianceTerms(values) {
  if (!Array.isArray(values) || values.length === 0 || values.length > MAX_SUBSTITUTION_TERMS) return null;
  const m = mean(values);

  return values.map((value) => ({ value, deviation: value - m, square: (value - m) ** 2 }));
}

/**
 * Où le POLYGONE des effectifs cumulés atteint un niveau (n/2 → la médiane
 * ESTIMÉE par lecture graphique) : interpolation linéaire sur le segment
 * qui franchit le niveau. `null` pour un escalier (série discrète : la
 * lecture graphique n'y a pas ce sens) ou si le niveau n'est pas atteint.
 */
export function cumulativeCrossing(series, level) {
  if (!series || series.kind !== 'polygon' || series.points.length < 2) return null;
  for (let i = 1; i < series.points.length; i += 1) {
    const a = series.points[i - 1];
    const b = series.points[i];
    if (b.y >= level && a.y <= level) {
      if (b.y === a.y) return a.x;

      return a.x + ((level - a.y) / (b.y - a.y)) * (b.x - a.x);
    }
  }

  return null;
}
