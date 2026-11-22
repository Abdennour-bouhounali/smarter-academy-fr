/**
 * La SÉRIE STATISTIQUE saisie par l'élève : la lire, la juger, la résumer.
 * Fonctions pures, sans React.
 *
 * Le calcul lui-même n'est PAS réécrit ici : la moyenne, la médiane,
 * l'étendue et le tableau d'effectifs viennent de
 * `lessons/common/stats/statsUtils.js`, le noyau que les leçons utilisent
 * déjà. Une deuxième définition de la médiane dans le dépôt serait une
 * dette : le jour où la convention change, elle changerait à un seul
 * endroit. Ce module ne fait qu'AMENER la saisie jusqu'à ce noyau et
 * rapporter ce qu'il en dit.
 *
 *     texte → parseDataset → { values, invalid } → summarize → { n, min, max, range, mean, median }
 */

import { frequencyTable, mean, median, range, sorted } from '../../../../lessons/common/stats/statsUtils.js';

/**
 * Au-delà, la saisie n'est plus une série qu'on lit : c'est un fichier.
 * La borne protège aussi la taille du document enregistré.
 */
export const MAX_DATASET_VALUES = 500;

/** Ce qu'un nombre peut valoir sans rendre les graphiques absurdes. */
export const DATASET_VALUE_BOUND = 1e9;

/**
 * Un jeton de saisie → un nombre, ou NaN. On accepte ce qu'un élève écrit
 * vraiment : la virgule décimale (12,5), le vrai signe moins (−4), les
 * espaces AUTOUR. On n'accepte PAS ce qui ressemble à un nombre sans en
 * être un (« 12a », « 1.2.3 ») : JavaScript dirait 12 pour l'un et NaN pour
 * l'autre, et l'élève ne saurait jamais lequel a été pris.
 *
 * Une espace À L'INTÉRIEUR casse le jeton (« 5 14 » n'est pas 514) : c'est
 * ce refus qui permet à parseDataset de reconnaître qu'un découpage a coupé
 * au mauvais endroit.
 */
export function parseValue(token) {
  const text = String(token).trim().replace(',', '.').replace(/[−–—]/g, '-');
  if (text === '') return NaN;
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(text)) return NaN;
  const value = Number(text);

  return Number.isFinite(value) && Math.abs(value) <= DATASET_VALUE_BOUND ? value : NaN;
}

/**
 * La saisie brute → la série et ses REFUS.
 *
 * Un jeton illisible n'est jamais ignoré en silence : il ressort dans
 * `invalid`, avec son texte, pour que l'interface puisse le nommer. C'est la
 * règle du § 33 du cahier des charges, et c'est aussi la seule honnête —
 * une valeur avalée sans bruit fausse la moyenne sans que personne le voie.
 *
 * Séparateurs acceptés : virgule, point-virgule, espace, retour à la ligne,
 * tabulation. La virgule est donc à la fois séparateur ET virgule décimale,
 * et « 12,5 » ne peut pas être les deux. On tranche par deux règles, dans
 * cet ordre :
 *
 *   1. S'il y a un séparateur EXPLICITE (point-virgule, retour à la ligne,
 *      tabulation), la virgule est décimale : « 12 ; 15,5 ; -4 » est trois
 *      nombres, dont un décimal. C'est la forme que le laboratoire écrit
 *      lui-même (datasetToText), donc celle qu'il doit savoir relire.
 *   2. Sinon, la virgule sépare — le collier « 12, 15, 14 » est le cas
 *      courant — SAUF si couper aux virgules casse un jeton que couper aux
 *      seuls espaces garde entier : « 12,5 14,2 » est alors deux décimaux.
 *
 * @returns {{values: number[], invalid: {text: string, position: number}[], truncated: boolean}}
 */
export function parseDataset(text) {
  const tokens = tokenizeDataset(text);

  const values = [];
  const invalid = [];
  let truncated = false;
  tokens.forEach((token, position) => {
    const value = parseValue(token);
    if (Number.isNaN(value)) {
      invalid.push({ text: token.slice(0, 20), position });
    } else if (values.length < MAX_DATASET_VALUES) {
      values.push(value);
    } else {
      truncated = true;
    }
  });

  return { values, invalid, truncated };
}

/**
 * Les JETONS de la saisie, dans l'ordre, valides ou non — la lecture que
 * `parseDataset` juge ensuite (les deux règles de la virgule ci-dessus).
 * L'éditeur en pastilles travaille sur ces jetons : il peut ainsi retirer
 * ou corriger un jeton fautif sans jamais l'avaler en silence.
 */
export function tokenizeDataset(text) {
  const source = typeof text === 'string' ? text : '';
  const byComma = splitTokens(source, /[,;\n\r\t]+/);
  // L'autre lecture ne coupe PAS aux virgules : elles y sont décimales.
  const bySpace = splitTokens(source, /[;\s]+/);
  const hasExplicitSeparator = /[;\n\r\t]/.test(source);
  const commaBreaksAToken = byComma.some((token) => Number.isNaN(parseValue(token)))
    && bySpace.length > 0
    && bySpace.every((token) => !Number.isNaN(parseValue(token)));

  return hasExplicitSeparator || commaBreaksAToken ? bySpace : byComma;
}

/**
 * Des jetons → le texte de la saisie. Le point-virgule est un séparateur
 * EXPLICITE : relu par `tokenizeDataset`, chaque jeton revient tel quel, et
 * une virgule qu'il contient reste décimale (« 12,5 »).
 */
export function tokensToText(tokens) {
  return tokens.map((token) => String(token).trim()).filter((token) => token !== '').join(' ; ');
}

function splitTokens(text, separator) {
  return text.split(separator).map((token) => token.trim()).filter((token) => token !== '');
}

/**
 * Le RÉSUMÉ court d'une série (n, min, max, étendue, moyenne, médiane) —
 * les indicateurs complets (quartiles, mode, variance, écart type) sont
 * dans `descriptiveStats.describeDataset`. Les valeurs viennent de statsUtils ;
 * une série vide rend `null` partout plutôt que NaN, pour que l'affichage
 * n'ait qu'un cas à traiter.
 */
export function summarize(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return { n: 0, min: null, max: null, range: null, mean: null, median: null };
  }
  const s = sorted(values);

  return {
    n: values.length,
    min: s[0],
    max: s[s.length - 1],
    range: range(values),
    mean: mean(values),
    median: median(values),
  };
}

/**
 * La série vue comme une DISTRIBUTION à représenter. Deux lectures, et le
 * choix entre elles n'est pas cosmétique (§ 10) :
 *
 *   - `bars`   : un bâton par valeur distincte. C'est la bonne lecture d'une
 *                série discrète (des notes, des âges, un dé) — chaque valeur
 *                a son effectif, et on les lit.
 *   - `classes`: des classes de même amplitude. C'est la bonne lecture quand
 *                les valeurs sont trop nombreuses ou trop dispersées pour
 *                qu'un bâton par valeur veuille encore dire quelque chose.
 *
 * On bascule quand il y a plus de `MAX_DISTINCT_BARS` valeurs distinctes :
 * au-delà, le diagramme en bâtons est une clôture, pas une information.
 */
export const MAX_DISTINCT_BARS = 15;

export function distributionOf(values) {
  if (!Array.isArray(values) || values.length === 0) return { kind: 'bars', bins: [] };
  const table = frequencyTable(values);
  if (table.length <= MAX_DISTINCT_BARS) {
    return {
      kind: 'bars',
      bins: table.map((entry) => ({
        label: entry.value,
        from: entry.value,
        to: entry.value,
        count: entry.count,
        frequency: entry.count / values.length,
      })),
    };
  }

  return { kind: 'classes', bins: histogramBins(values) };
}

/**
 * Les classes d'un histogramme : amplitude constante, bornes « rondes »,
 * dernière classe FERMÉE à droite (sinon la valeur maximale ne serait
 * comptée nulle part — la même convention que `groupIntoClasses`).
 *
 * Le nombre de classes suit la règle de Sturges bornée à [5 ; 12] : assez
 * pour voir une forme, assez peu pour que chaque barre porte un effectif.
 */
export function histogramBins(values) {
  const s = sorted(values);
  const min = s[0];
  const max = s[s.length - 1];
  if (min === max) {
    return [{ label: min, from: min, to: min, count: values.length, frequency: 1 }];
  }
  const target = Math.min(12, Math.max(5, Math.ceil(Math.log2(values.length) + 1)));
  const step = niceStep(max - min, target);
  const from = Math.floor(min / step) * step;
  const to = Math.ceil(max / step) * step;
  const count = Math.max(1, Math.round((to - from) / step));
  const bins = [];
  for (let i = 0; i < count; i += 1) {
    const binFrom = round(from + i * step);
    const binTo = round(from + (i + 1) * step);
    const isLast = i === count - 1;
    const n = values.filter((v) => (isLast ? v >= binFrom && v <= binTo : v >= binFrom && v < binTo)).length;
    bins.push({ label: binFrom, from: binFrom, to: binTo, isLast, count: n, frequency: n / values.length });
  }

  return bins;
}

/**
 * Un pas « rond » — 1, 2, 5 ou 10 fois une puissance de dix, comme les
 * graduations du grapheur — choisi pour que le NOMBRE de classes tombe au
 * plus près de la cible. Arrondir le pas vers le haut sans regarder ce
 * qu'il donne produisait quatre classes là où l'on en voulait neuf : c'est
 * le nombre de classes qui compte, le pas rond n'est qu'une commodité de
 * lecture.
 */
function niceStep(span, target) {
  if (!(span > 0) || !(target > 0)) return 1;
  const raw = span / target;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const candidates = [1, 2, 5, 10].map((factor) => factor * magnitude);
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const step of candidates) {
    const distance = Math.abs(Math.ceil(span / step) - target);
    if (distance < bestDistance) { best = step; bestDistance = distance; }
  }

  return best;
}

/** Les flottants d'un pas décimal ne doivent pas ressortir en 2,0000000000000004. */
function round(value) {
  return Math.round(value * 1e9) / 1e9;
}

/** Une série → le texte qui la représente dans le document (et dans le champ de saisie). */
export function datasetToText(values) {
  return values.map((v) => String(v).replace('.', ',')).join(' ; ');
}
