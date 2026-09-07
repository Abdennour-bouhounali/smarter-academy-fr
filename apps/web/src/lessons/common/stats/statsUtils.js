/**
 * Statistiques & probabilités — noyau de calcul partagé par les leçons de 2nde
 * (statistiques à une variable, séries en classes, boîtes à moustaches,
 * tableaux croisés, fréquences conditionnelles, loi des grands nombres,
 * probabilités conditionnelles, arbres, tests diagnostiques).
 *
 * Fonctions PURES, sans React ni stockage : elles sont testées unitairement
 * (statsUtils.test.js) et réutilisées par les manipulations comme par les
 * corrections des questions — une seule définition des quartiles, une seule
 * de la moyenne pondérée, jamais un calcul recopié dans un module.
 *
 * CONVENTION DE QUARTILES — celle du programme français (lycée) :
 *   rang de Q1 = ⌈n/4⌉, rang de Q3 = ⌈3n/4⌉ (valeurs de la série, jamais
 *   d'interpolation), la médiane étant la moyenne des deux valeurs centrales
 *   quand n est pair. C'est la définition attendue au baccalauréat ; elle
 *   diffère de celle des tableurs (QUARTILE) et de la « méthode des
 *   charnières » anglo-saxonne. Ne pas la remplacer sans revoir les leçons.
 */

/** Tri croissant d'une copie — jamais de mutation de l'entrée. */
export const sorted = (values) => [...values].sort((a, b) => a - b);

/** Somme. */
export const sum = (values) => values.reduce((acc, v) => acc + v, 0);

/** Moyenne arithmétique. `null` sur une série vide (jamais NaN). */
export function mean(values) {
  if (!values || values.length === 0) return null;
  return sum(values) / values.length;
}

/**
 * Moyenne pondérée par des effectifs : Σ nᵢxᵢ / Σ nᵢ.
 * `pairs` = [{ value, count }]. `null` si l'effectif total est nul.
 */
export function weightedMean(pairs) {
  const total = sum(pairs.map((p) => p.count));
  if (total === 0) return null;
  return sum(pairs.map((p) => p.value * p.count)) / total;
}

/**
 * Médiane, convention du programme : n impair → la valeur de rang (n+1)/2 ;
 * n pair → la demi-somme des valeurs de rangs n/2 et n/2 + 1.
 */
export function median(values) {
  if (!values || values.length === 0) return null;
  const s = sorted(values);
  const n = s.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Quartile d'ordre k/4 (k = 1 ou 3) : la valeur de rang ⌈kn/4⌉ dans la série
 * ordonnée. Renvoie une VALEUR DE LA SÉRIE, jamais une interpolation.
 */
export function quartile(values, k) {
  if (!values || values.length === 0) return null;
  const s = sorted(values);
  const rank = Math.ceil((k * s.length) / 4);
  // Un rang nul ne peut survenir que pour une série vide, déjà écartée ;
  // la borne haute protège d'un k hors de {1, 2, 3}.
  return s[Math.min(Math.max(rank, 1), s.length) - 1];
}

export const q1 = (values) => quartile(values, 1);
export const q3 = (values) => quartile(values, 3);

/** Étendue = max − min. */
export function range(values) {
  if (!values || values.length === 0) return null;
  const s = sorted(values);
  return s[s.length - 1] - s[0];
}

/** Écart interquartile Q3 − Q1. */
export function interquartileRange(values) {
  if (!values || values.length === 0) return null;
  return q3(values) - q1(values);
}

/**
 * Résumé des cinq nombres, dans l'ordre de lecture d'une boîte à moustaches.
 * `null` sur une série vide.
 */
export function fiveNumberSummary(values) {
  if (!values || values.length === 0) return null;
  const s = sorted(values);
  return {
    min: s[0],
    q1: q1(s),
    median: median(s),
    q3: q3(s),
    max: s[s.length - 1],
  };
}

/**
 * Variance de population (diviseur n — celle du programme de 2nde, pas la
 * variance corrigée en n − 1).
 */
export function variance(values) {
  if (!values || values.length === 0) return null;
  const m = mean(values);
  return sum(values.map((v) => (v - m) ** 2)) / values.length;
}

/** Écart type de population = √variance. */
export function standardDeviation(values) {
  const v = variance(values);
  return v === null ? null : Math.sqrt(v);
}

/** Variance pondérée par des effectifs (diviseur Σnᵢ). */
export function weightedVariance(pairs) {
  const total = sum(pairs.map((p) => p.count));
  if (total === 0) return null;
  const m = weightedMean(pairs);
  return sum(pairs.map((p) => p.count * (p.value - m) ** 2)) / total;
}

/** Écart type pondéré. */
export function weightedStandardDeviation(pairs) {
  const v = weightedVariance(pairs);
  return v === null ? null : Math.sqrt(v);
}

/**
 * Effectifs par valeur, triés par valeur croissante.
 * → [{ value, count }]
 */
export function frequencyTable(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({ value, count }));
}

/**
 * Regroupement d'une série continue en classes [from ; to[ — la DERNIÈRE
 * classe est fermée à droite, sinon la valeur maximale ne serait comptée
 * nulle part. Chaque classe reçoit son effectif, sa fréquence, son centre,
 * son amplitude, et les cumuls croissants.
 *
 * `bounds` = [b0, b1, …, bk] (k classes), strictement croissantes.
 */
export function groupIntoClasses(values, bounds) {
  const classes = [];
  for (let i = 0; i < bounds.length - 1; i += 1) {
    const from = bounds[i];
    const to = bounds[i + 1];
    const isLast = i === bounds.length - 2;
    const count = values.filter((v) => (isLast ? v >= from && v <= to : v >= from && v < to)).length;
    classes.push({
      from, to, isLast, count,
      center: (from + to) / 2,
      width: to - from,
    });
  }
  const total = sum(classes.map((c) => c.count));
  let running = 0;
  return classes.map((c) => {
    running += c.count;
    return {
      ...c,
      frequency: total === 0 ? 0 : c.count / total,
      cumulativeCount: running,
      cumulativeFrequency: total === 0 ? 0 : running / total,
      // Hauteur d'histogramme = effectif / amplitude : c'est l'AIRE qui
      // représente l'effectif, ce qui n'a d'importance que si les classes
      // n'ont pas toutes la même amplitude.
      density: c.width === 0 ? 0 : c.count / c.width,
    };
  });
}

/**
 * Moyenne ESTIMÉE d'une série regroupée : chaque classe est représentée par
 * son centre. C'est une estimation — l'information individuelle est perdue.
 */
export function classMean(classes) {
  return weightedMean(classes.map((c) => ({ value: c.center, count: c.count })));
}

/**
 * Classe médiane : la première dont la fréquence cumulée atteint 0,5.
 * Renvoie `null` si la série est vide.
 */
export function medianClass(classes) {
  const total = sum(classes.map((c) => c.count));
  if (total === 0) return null;
  return classes.find((c) => c.cumulativeFrequency >= 0.5) ?? classes[classes.length - 1];
}

/**
 * Médiane estimée par interpolation linéaire dans la classe médiane —
 * la lecture du polygone des fréquences cumulées à la hauteur 0,5.
 */
export function interpolatedMedian(classes) {
  const total = sum(classes.map((c) => c.count));
  if (total === 0) return null;
  const target = total / 2;
  let before = 0;
  for (const c of classes) {
    if (before + c.count >= target) {
      if (c.count === 0) return c.from;
      return c.from + ((target - before) / c.count) * c.width;
    }
    before += c.count;
  }
  return classes[classes.length - 1].to;
}

/* ── Tableaux croisés & fréquences conditionnelles ───────────────── */

/**
 * Construit un tableau croisé d'effectifs à partir d'observations
 * individuelles. `rowsKey`/`colsKey` nomment les deux variables
 * qualitatives ; `rowOrder`/`colOrder` fixent l'ordre d'affichage
 * (une variable ordinale a un ordre qui a un sens).
 */
export function crossTable(observations, rowsKey, colsKey, rowOrder, colOrder) {
  const cells = {};
  for (const r of rowOrder) {
    cells[r] = {};
    for (const c of colOrder) cells[r][c] = 0;
  }
  for (const obs of observations) {
    const r = obs[rowsKey];
    const c = obs[colsKey];
    if (cells[r] && cells[r][c] !== undefined) cells[r][c] += 1;
  }
  const rowTotals = Object.fromEntries(rowOrder.map((r) => [r, sum(colOrder.map((c) => cells[r][c]))]));
  const colTotals = Object.fromEntries(colOrder.map((c) => [c, sum(rowOrder.map((r) => cells[r][c]))]));
  const grandTotal = sum(Object.values(rowTotals));
  return { cells, rowTotals, colTotals, grandTotal, rowOrder, colOrder };
}

/**
 * Fréquence MARGINALE d'une modalité : son effectif rapporté à l'effectif
 * TOTAL. Le dénominateur est le grand total, toujours.
 */
export function marginalFrequency(table, axis, key) {
  if (table.grandTotal === 0) return null;
  const n = axis === 'row' ? table.rowTotals[key] : table.colTotals[key];
  return n / table.grandTotal;
}

/**
 * Fréquence CONDITIONNELLE — « parmi les X, la proportion de Y ».
 * Le dénominateur est l'effectif de la population de RÉFÉRENCE (la
 * condition), jamais le grand total : c'est exactement le point que la
 * leçon « Fréquences conditionnelles » fait manipuler.
 *
 * `given` = { axis: 'row' | 'col', key } — la condition.
 * `of`    = la modalité de l'autre variable dont on veut la fréquence.
 */
export function conditionalFrequency(table, given, of) {
  const denominator = given.axis === 'row' ? table.rowTotals[given.key] : table.colTotals[given.key];
  if (!denominator) return null;
  const numerator = given.axis === 'row' ? table.cells[given.key][of] : table.cells[of][given.key];
  return numerator / denominator;
}

/**
 * Fréquence d'une cellule rapportée au TOTAL (fréquence conjointe) —
 * à ne pas confondre avec la conditionnelle : même numérateur,
 * dénominateur différent.
 */
export function jointFrequency(table, row, col) {
  if (table.grandTotal === 0) return null;
  return table.cells[row][col] / table.grandTotal;
}

/* ── Probabilités ────────────────────────────────────────────────── */

/**
 * Probabilité conditionnelle P_B(A) = P(A ∩ B) / P(B), calculée sur des
 * EFFECTIFS (nAndB, nB) : c'est la même division que la fréquence
 * conditionnelle, ce que les leçons relient explicitement.
 */
export function conditionalProbability(nAndB, nB) {
  if (!nB) return null;
  return nAndB / nB;
}

/**
 * Indicateurs d'un test diagnostique, à partir des quatre effectifs.
 * Vocabulaire : sensibilité = P(test + | atteint), spécificité =
 * P(test − | sain), VPP = P(atteint | test +), VPN = P(sain | test −).
 * Le contraste VPP ≠ sensibilité est TOUT l'objet de la leçon.
 */
export function diagnosticIndicators({ truePositive, falseNegative, falsePositive, trueNegative }) {
  const ill = truePositive + falseNegative;
  const healthy = falsePositive + trueNegative;
  const positive = truePositive + falsePositive;
  const negative = falseNegative + trueNegative;
  const total = ill + healthy;
  return {
    ill, healthy, positive, negative, total,
    prevalence: total ? ill / total : null,
    sensitivity: ill ? truePositive / ill : null,
    specificity: healthy ? trueNegative / healthy : null,
    ppv: positive ? truePositive / positive : null,
    npv: negative ? trueNegative / negative : null,
  };
}

/**
 * Effectifs des quatre catégories d'un test, à partir de la prévalence, de
 * la sensibilité et de la spécificité sur une population donnée.
 * Les effectifs sont ARRONDIS pour rester des individus entiers, et le
 * complément est calculé par différence pour que les totaux tombent juste.
 */
export function diagnosticCounts({ population, prevalence, sensitivity, specificity }) {
  const ill = Math.round(population * prevalence);
  const healthy = population - ill;
  const truePositive = Math.round(ill * sensitivity);
  const falseNegative = ill - truePositive;
  const trueNegative = Math.round(healthy * specificity);
  const falsePositive = healthy - trueNegative;
  return { truePositive, falseNegative, falsePositive, trueNegative };
}

/* ── Formatage français ──────────────────────────────────────────── */

/** Nombre décimal à la française : séparateur virgule, sans zéros inutiles. */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const rounded = Number(value.toFixed(decimals));
  return String(rounded).replace('.', ',').replace('-', '−');
}

/** Une fréquence en pourcentage : 0,375 → « 37,5 % ». */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${formatNumber(value * 100, decimals)} %`;
}

/** Intervalle de classe tel qu'il s'écrit : [10 ; 20[ (dernière fermée). */
export function formatClass(c) {
  return `[${formatNumber(c.from, 2)} ; ${formatNumber(c.to, 2)}${c.isLast ? ']' : '['}`;
}
