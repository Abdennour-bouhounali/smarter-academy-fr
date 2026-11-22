/**
 * LA MATHÉMATIQUE des متتاليات — pure, sans React, sans pixels (§46).
 *
 * Une متتالية n'est pas un tableau de nombres : c'est une DÉFINITION qui
 * engendre des nombres. Ce module tient la définition, l'engendrement, et
 * tout ce qu'on peut LIRE sur les termes engendrés (différences, rapports,
 * sommes, sous-suites, points fixes, tendance). Il ne tient aucune couleur,
 * aucun `<svg>`, aucune chaîne traduite : §46 demande « keep mathematical
 * logic out of presentation components », et la frontière est ici.
 *
 * ── Ce que ce module N'EST PAS (§55) ─────────────────────────────────────
 * Ni calcul formel, ni théorie des séries, ni preuve de convergence. Il
 * CALCULE des termes et DÉCRIT ce qu'il observe. La distinction est tenue
 * jusque dans le vocabulaire des retours : `trend` s'appelle une
 * « observation », jamais un théorème (§11), et l'interface l'annonce comme
 * telle (`observedOnly: true`).
 *
 * ── Le contrat de sûreté (§32, §47) ──────────────────────────────────────
 * Engendrer une متتالية, c'est itérer une fonction que l'ÉLÈVE a écrite.
 * `u(n+1) = u(n)^u(n)` diverge en quatre pas ; `u(n+1) = 1/(u(n)-2)` tombe
 * sur une division par zéro ; `n = 100000` gèlerait l'onglet. Aucune de ces
 * trois choses ne doit casser quoi que ce soit. D'où trois règles tenues
 * PAR CONSTRUCTION :
 *
 *   1. `generate()` ne lève JAMAIS. Tout accident devient un terme
 *      `{ ok: false, reason }` et l'engendrement s'arrête proprement là.
 *   2. Le nombre de termes est borné par `MAX_TERMS`, et le calcul d'un
 *      terme lointain (§12, `n = 10000`) par `MAX_ITERATIONS` — une borne
 *      sur le TRAVAIL, pas sur l'affichage.
 *   3. Tout terme non fini (NaN, ±Infinity) ou au-delà de `OVERFLOW_LIMIT`
 *      arrête l'engendrement : au-delà, les nombres flottants ne disent
 *      plus rien de la mathématique, seulement de l'IEEE 754.
 */

/** Le nombre de termes qu'on veut bien ENGENDRER et garder (§32). */
export const MAX_TERMS = 500;

/**
 * Le nombre d'itérations qu'on veut bien FAIRE pour atteindre un terme
 * lointain (§12 : n = 10000). C'est une borne sur le travail : on itère
 * jusque-là sans garder les termes intermédiaires.
 */
export const MAX_ITERATIONS = 100000;

/**
 * Au-delà de 1e12, on cesse d'engendrer (§47 « huge values »).
 *
 * Le choix n'est pas esthétique. `Number.MAX_VALUE` (1,8e308) laisserait
 * une suite géométrique de raison 2 courir 1024 termes avant de devenir
 * `Infinity`, en affichant en route des nombres dont plus aucun chiffre
 * n'est exact. 1e12 garde les entiers exacts (2^53 ≈ 9e15), reste lisible
 * (« 1 000 000 000 000 »), et suffit très largement à montrer qu'une suite
 * EXPLOSE — ce qui est la seule chose que la divergence doive enseigner.
 */
export const OVERFLOW_LIMIT = 1e12;

/** La tolérance par défaut d'une comparaison de termes (§46 « tolerance handling »). */
export const DEFAULT_TOLERANCE = 1e-9;

/**
 * Efface le bruit de la virgule flottante d'une valeur CALCULÉE PAR FORMULE
 * (§47 « floating-point precision »).
 *
 * `b/(1−a)` avec b = 4 et a = 0,8 rend `20.000000000000004` : le point fixe
 * du modèle de refroidissement (la température de la pièce) s'afficherait
 * « 20,000000000000004 ». Or cette valeur n'est pas mesurée, elle est
 * ALGÉBRIQUEMENT exacte — 4/0,2 = 20 — et le bruit vient uniquement du fait
 * que 0,8 n'a pas d'écriture binaire finie.
 *
 * Quinze chiffres significatifs suffisent à distinguer tout ce qu'un collégien
 * calcule, et suppriment exactement ce bruit-là. On ne l'applique QUE là où
 * une formule fermée remplace une itération : jamais sur un terme engendré,
 * dont on ne veut rien arrondir en route.
 */
export function cleanFloat(value) {
  if (!Number.isFinite(value)) return value;

  return Number(value.toPrecision(15));
}

/** Les familles de متتاليات (§3). */
export const SEQUENCE_KINDS = Object.freeze([
  'arithmetic',   // u(n+1) = u(n) + r
  'geometric',    // u(n+1) = q·u(n)
  'affine',       // u(n+1) = a·u(n) + b
  'explicit',     // u(n) = f(n)
  'recurrence',   // u(n+1) = f(u(n), n)
  'secondOrder',  // u(n+2) = a·u(n+1) + b·u(n)  ·ou· f(u(n+1), u(n), n)
]);

/** Une famille est-elle définie par récurrence (donc itérable, donc en escalier) ? */
export function isRecursive(kind) {
  return kind !== 'explicit';
}

/** Une famille n'a qu'UN antécédent : le diagramme en toile d'araignée a un sens (§9). */
export function isFirstOrder(kind) {
  return kind === 'arithmetic' || kind === 'geometric' || kind === 'affine' || kind === 'recurrence';
}

const finite = Number.isFinite;

/** Un terme calculé est-il exploitable ? (§47) */
export function isUsable(value) {
  return finite(value) && Math.abs(value) <= OVERFLOW_LIMIT;
}

/**
 * Pourquoi un terme n'a pas pu être calculé. Ces codes sont des clés i18n
 * (`tools.sequences.errors.<code>`) : le module ne formule jamais de phrase.
 */
export const TERM_FAILURES = Object.freeze([
  'overflow',     // |u(n)| a dépassé OVERFLOW_LIMIT — la suite explose
  'undefined',    // NaN : division par zéro, √négatif, ln(0)…
  'invalidRule',  // la règle elle-même ne se lit pas
  'iterationCap', // on a atteint MAX_ITERATIONS avant d'arriver au terme demandé
]);

/**
 * ── LA DÉFINITION d'une متتالية ──────────────────────────────────────────
 *
 * @typedef {object} SequenceDefinition
 * @property {'arithmetic'|'geometric'|'affine'|'explicit'|'recurrence'|'secondOrder'} kind
 * @property {number} startIndex          l'indice du premier terme (0 ou 1 — §4)
 * @property {number[]} initial           u(startIndex), puis u(startIndex+1) au second ordre
 * @property {number} [difference]        r, famille arithmétique
 * @property {number} [ratio]             q, famille géométrique
 * @property {number} [a] @property {number} [b]   affine et second ordre
 * @property {(n: number) => number} [explicit]
 *   u(n) = f(n) — une fonction DÉJÀ compilée (sequenceExpression.js)
 * @property {(previous: number, n: number) => number} [step]
 *   u(n+1) = f(u(n), n) — `n` est l'indice de `previous`
 * @property {(previous: number, beforePrevious: number, n: number) => number} [step2]
 *   u(n+2) = f(u(n+1), u(n), n)
 */

/**
 * La règle « un terme → le suivant » d'une famille du premier ordre, sous
 * forme de FONCTION. C'est elle que le diagramme en toile d'araignée trace
 * (§9) et dont on cherche les points fixes (§10) : les trois familles
 * paramétriques et la récurrence libre passent par le même tuyau, donc la
 * toile et les points fixes n'ont qu'UNE implémentation.
 *
 * @returns {((previous: number, n: number) => number) | null}
 */
export function stepFunctionOf(definition) {
  if (!definition || !isFirstOrder(definition.kind)) return null;
  switch (definition.kind) {
    case 'arithmetic': {
      const r = definition.difference;

      return finite(r) ? (previous) => previous + r : null;
    }
    case 'geometric': {
      const q = definition.ratio;

      return finite(q) ? (previous) => previous * q : null;
    }
    case 'affine': {
      const { a, b } = definition;

      return finite(a) && finite(b) ? (previous) => a * previous + b : null;
    }
    default:
      return typeof definition.step === 'function' ? definition.step : null;
  }
}

/**
 * ── L'ENGENDREMENT ───────────────────────────────────────────────────────
 *
 * @typedef {object} SequenceTerm
 * @property {number} n
 * @property {number} value
 *
 * @typedef {object} SequenceRun
 * @property {SequenceTerm[]} terms        les termes effectivement calculés
 * @property {number} startIndex
 * @property {{ n: number, reason: string } | null} stopped
 *   pourquoi l'engendrement s'est arrêté avant `count` — `null` s'il est allé au bout
 *
 * Aucune exception ne sort d'ici (§32) : une règle qui lève est une règle
 * qui rend `undefined`, c'est-à-dire un arrêt propre à ce terme-là.
 */
export function generate(definition, count) {
  const startIndex = readIndex(definition?.startIndex);
  const wanted = Math.max(0, Math.min(MAX_TERMS, Math.floor(finite(count) ? count : 0)));
  const terms = [];
  if (!definition || wanted === 0) return { terms, startIndex, stopped: null };

  const stop = (n, reason) => ({ terms, startIndex, stopped: { n, reason } });

  // ── Les explicites : chaque terme est indépendant. Un trou n'arrête
  // rien — u(n) = 1/n n'existe pas en 0 mais existe partout ailleurs, et
  // une suite pleine de trous reste une suite à regarder (§32).
  if (definition.kind === 'explicit') {
    const f = definition.explicit;
    if (typeof f !== 'function') return stop(startIndex, 'invalidRule');
    for (let i = 0; i < wanted; i += 1) {
      const n = startIndex + i;
      const value = safeCall(() => f(n));
      if (isUsable(value)) terms.push({ n, value });
    }

    return { terms, startIndex, stopped: null };
  }

  // ── Les récurrences : chaque terme dépend du précédent, donc un accident
  // ARRÊTE la suite — il n'y a rien à calculer après un terme qui n'existe pas.
  const order = definition.kind === 'secondOrder' ? 2 : 1;
  const initial = Array.isArray(definition.initial) ? definition.initial : [];
  for (let i = 0; i < order; i += 1) {
    const value = initial[i];
    if (!isUsable(value)) return stop(startIndex + i, finite(value) ? 'overflow' : 'undefined');
    if (terms.length < wanted) terms.push({ n: startIndex + i, value });
  }
  if (terms.length >= wanted) return { terms, startIndex, stopped: null };

  const step = order === 1 ? stepFunctionOf(definition) : null;
  const step2 = order === 2 ? definition.step2 ?? secondOrderStep(definition) : null;
  if (order === 1 ? !step : !step2) return stop(startIndex + order, 'invalidRule');

  while (terms.length < wanted) {
    const last = terms[terms.length - 1];
    const value = order === 1
      ? safeCall(() => step(last.value, last.n))
      : safeCall(() => step2(last.value, terms[terms.length - 2].value, last.n - 1));
    const n = last.n + 1;
    if (!finite(value)) return stop(n, 'undefined');
    if (Math.abs(value) > OVERFLOW_LIMIT) return stop(n, 'overflow');
    terms.push({ n, value });
  }

  return { terms, startIndex, stopped: null };
}

/** La règle du second ordre paramétrique : u(n+2) = a·u(n+1) + b·u(n). */
function secondOrderStep(definition) {
  const { a, b } = definition;
  if (!finite(a) || !finite(b)) return null;

  return (previous, beforePrevious) => a * previous + b * beforePrevious;
}

/**
 * UN terme lointain, sans garder les 9 999 d'avant (§12).
 *
 * Pour une explicite, c'est un appel. Pour une récurrence, c'est une
 * itération bornée par MAX_ITERATIONS : au-delà on rend honnêtement
 * `iterationCap` plutôt qu'un nombre faux ou un onglet gelé (§47).
 *
 * @returns {{ ok: true, n: number, value: number } | { ok: false, n: number, reason: string }}
 */
export function termAt(definition, n) {
  const startIndex = readIndex(definition?.startIndex);
  const target = Math.floor(finite(n) ? n : startIndex);
  if (!definition || target < startIndex) return { ok: false, n: target, reason: 'invalidRule' };

  if (definition.kind === 'explicit') {
    const f = definition.explicit;
    if (typeof f !== 'function') return { ok: false, n: target, reason: 'invalidRule' };
    const value = safeCall(() => f(target));
    if (!finite(value)) return { ok: false, n: target, reason: 'undefined' };
    if (Math.abs(value) > OVERFLOW_LIMIT) return { ok: false, n: target, reason: 'overflow' };

    return { ok: true, n: target, value };
  }

  const steps = target - startIndex;
  if (steps > MAX_ITERATIONS) return { ok: false, n: target, reason: 'iterationCap' };

  const order = definition.kind === 'secondOrder' ? 2 : 1;
  const initial = Array.isArray(definition.initial) ? definition.initial : [];
  if (steps < order) {
    const value = initial[steps];

    return isUsable(value)
      ? { ok: true, n: target, value }
      : { ok: false, n: target, reason: finite(value) ? 'overflow' : 'undefined' };
  }
  for (let i = 0; i < order; i += 1) {
    if (!isUsable(initial[i])) return { ok: false, n: startIndex + i, reason: 'undefined' };
  }

  const step = order === 1 ? stepFunctionOf(definition) : (definition.step2 ?? secondOrderStep(definition));
  if (!step) return { ok: false, n: target, reason: 'invalidRule' };

  let previous = initial[0];
  let current = order === 2 ? initial[1] : 0;
  for (let index = startIndex; index < target - order + 1; index += 1) {
    const value = order === 1
      ? safeCall(() => step(previous, index))
      : safeCall(() => step(current, previous, index));
    if (!finite(value)) return { ok: false, n: index + order, reason: 'undefined' };
    if (Math.abs(value) > OVERFLOW_LIMIT) return { ok: false, n: index + order, reason: 'overflow' };
    if (order === 1) previous = value;
    else { previous = current; current = value; }
  }

  return { ok: true, n: target, value: order === 1 ? previous : current };
}

/**
 * Un appel qui ne lève pas. Une expression compilée est censée rendre NaN
 * hors domaine plutôt que lever, mais « censée » n'est pas une garantie
 * quand la règle vient d'un élève : on referme le couvercle ici (§32).
 */
function safeCall(fn) {
  try {
    const value = fn();

    return typeof value === 'number' ? value : NaN;
  } catch {
    return NaN;
  }
}

/** L'indice de départ : 0 ou 1 — ce que les manuels écrivent (§4). */
function readIndex(raw) {
  const value = Math.floor(finite(raw) ? raw : 0);

  return value === 1 ? 1 : 0;
}

// ── LES LECTURES sur les termes engendrés ─────────────────────────────────

/**
 * Les différences Δu(n) = u(n+1) − u(n) (§34).
 *
 * Constante ⟺ arithmétique : c'est LE geste du programme de 4AM
 * (« الفروق المتتالية », LP 2.1), et la raison pour laquelle cette lecture
 * est allumée par défaut là où les autres attendent.
 */
export function differences(terms) {
  const out = [];
  for (let i = 0; i + 1 < terms.length; i += 1) {
    const [current, next] = [terms[i], terms[i + 1]];
    if (next.n !== current.n + 1) continue;   // un trou : pas de différence à lire
    out.push({ n: current.n, value: next.value - current.value });
  }

  return out;
}

/** Les différences des différences (§41) : constantes ⟺ suite quadratique. */
export function secondDifferences(terms) {
  return differences(differences(terms).map(({ n, value }) => ({ n, value })));
}

/**
 * Les rapports u(n+1)/u(n) (§35).
 *
 * Un terme nul n'a pas de rapport : on ne rend PAS `Infinity`, on rend
 * `defined: false`. « Handle zero terms correctly » (§35) veut dire le dire,
 * pas le déguiser en très grand nombre.
 */
export function ratios(terms) {
  const out = [];
  for (let i = 0; i + 1 < terms.length; i += 1) {
    const [current, next] = [terms[i], terms[i + 1]];
    if (next.n !== current.n + 1) continue;
    if (current.value === 0) {
      out.push({ n: current.n, value: null, defined: false });
      continue;
    }
    const value = next.value / current.value;
    out.push({ n: current.n, value: finite(value) ? value : null, defined: finite(value) });
  }

  return out;
}

/** Les sommes partielles S(n) = u(start) + … + u(n) (§36). */
export function partialSums(terms) {
  let total = 0;

  return terms.map(({ n, value }) => {
    total += value;

    return { n, value: total };
  });
}

/** Les termes d'indice pair, ou impair (§23). La parité est celle de `n`. */
export function subsequence(terms, parity) {
  const wanted = parity === 'odd' ? 1 : 0;

  return terms.filter(({ n }) => Math.abs(n % 2) === wanted);
}

/** Le minimum et le maximum OBSERVÉS — jamais « la » borne de la suite (§22). */
export function observedRange(terms) {
  if (!terms.length) return null;
  let min = terms[0];
  let max = terms[0];
  for (const term of terms) {
    if (term.value < min.value) min = term;
    if (term.value > max.value) max = term;
  }

  return { min: min.value, max: max.value, minAt: min.n, maxAt: max.n };
}

/**
 * ── LES POINTS FIXES (§10) ───────────────────────────────────────────────
 *
 * f(x) = x. Deux voies, et le choix entre elles est mathématique, pas
 * technique :
 *
 *  - **affine** (et arithmétique, et géométrique, qui en sont des cas) :
 *    a·x + b = x donne x = b/(1−a) EXACTEMENT, quand a ≠ 1. C'est la
 *    formule que §15 demande d'afficher, et on l'affiche comme une identité.
 *  - **récurrence libre** : on ne résout pas symboliquement une expression
 *    d'élève. On cherche les changements de signe de g(x) = f(x) − x sur la
 *    fenêtre, puis on affine par dichotomie. Le résultat est donc marqué
 *    `exact: false` — une valeur APPROCHÉE, et l'interface le dit (§11).
 *
 * @returns {{ points: number[], exact: boolean, everyPoint?: boolean }}
 *   `everyPoint` : le cas a = 1, b = 0 — tout réel est point fixe (u constante).
 */
export function fixedPoints(definition, window = { min: -50, max: 50 }) {
  if (!definition || !isFirstOrder(definition.kind)) return { points: [], exact: true };

  const affine = affineCoefficients(definition);
  if (affine) {
    const { a, b } = affine;
    if (a === 1) {
      return b === 0
        ? { points: [], exact: true, everyPoint: true }   // u(n+1) = u(n) : tout est fixe
        : { points: [], exact: true };                    // u(n+1) = u(n) + b, b ≠ 0 : aucun
    }
    const point = cleanFloat(b / (1 - a));

    return { points: finite(point) ? [point] : [], exact: true };
  }

  const step = stepFunctionOf(definition);
  if (!step) return { points: [], exact: true };

  const g = (x) => {
    const value = safeCall(() => step(x, 0));

    return finite(value) ? value - x : NaN;
  };

  const points = [];
  const samples = 400;
  const span = window.max - window.min;
  if (!(span > 0)) return { points: [], exact: false };
  let previousX = window.min;
  let previousG = g(previousX);
  if (previousG === 0) points.push(previousX);

  for (let i = 1; i <= samples; i += 1) {
    const x = window.min + (span * i) / samples;
    const value = g(x);
    if (value === 0) {
      points.push(x);
    } else if (finite(value) && finite(previousG) && Math.sign(value) !== Math.sign(previousG)) {
      points.push(bisect(g, previousX, x));
    }
    previousX = x;
    previousG = value;
  }

  // Deux échantillons voisins peuvent désigner la même racine : on déduplique.
  const unique = [];
  for (const point of points.sort((l, r) => l - r)) {
    if (!unique.length || Math.abs(point - unique[unique.length - 1]) > span / samples / 2) unique.push(point);
  }

  return { points: unique, exact: false };
}

/** Les coefficients (a, b) quand la famille EST affine — sinon `null`. */
export function affineCoefficients(definition) {
  switch (definition?.kind) {
    case 'arithmetic': return finite(definition.difference) ? { a: 1, b: definition.difference } : null;
    case 'geometric': return finite(definition.ratio) ? { a: definition.ratio, b: 0 } : null;
    case 'affine': return finite(definition.a) && finite(definition.b) ? { a: definition.a, b: definition.b } : null;
    default: return null;
  }
}

/** Dichotomie sur un changement de signe. Quarante passes : bien au-delà du pixel. */
function bisect(g, low, high) {
  let left = low;
  let right = high;
  let leftValue = g(left);
  for (let i = 0; i < 40; i += 1) {
    const middle = (left + right) / 2;
    const value = g(middle);
    if (!finite(value)) break;
    if (value === 0) return middle;
    if (Math.sign(value) === Math.sign(leftValue)) { left = middle; leftValue = value; } else { right = middle; }
  }

  return (left + right) / 2;
}

/**
 * ── LA TENDANCE OBSERVÉE (§11, §21) ─────────────────────────────────────
 *
 * Le point le plus délicat du module, et le plus facile à rendre malhonnête.
 * §11 l'écrit noir sur blanc : « Do not pretend the application can
 * mathematically prove convergence for arbitrary user-defined recurrences »,
 * et §51 « Always distinguish numerical observation from mathematical proof ».
 *
 * Ce que cette fonction rend est donc une DESCRIPTION des termes calculés,
 * et son champ le plus important est `observedOnly: true`. Le vocabulaire
 * suit : `approachingValue` ne veut pas dire « la suite converge », il veut
 * dire « les termes calculés se resserrent autour de cette valeur ».
 *
 * Une seule exception, et elle est signée : quand la famille est affine avec
 * |a| < 1, la convergence vers b/(1−a) est un THÉORÈME de cours, pas une
 * observation — `proven: true`, et l'interface peut alors parler franchement.
 *
 * @returns {{
 *   status: 'increasing'|'decreasing'|'constant'|'alternating'|'oscillating'|'diverging'|'approaching'|'mixed'|'unknown',
 *   observedOnly: boolean, proven: boolean,
 *   approachingValue: number|null, monotonic: 'up'|'down'|'none',
 *   alternatingSign: boolean, amplitudeShrinking: boolean|null,
 * }}
 */
export function analyseTrend(definition, terms, options = {}) {
  const tolerance = finite(options.tolerance) ? options.tolerance : 1e-7;
  const base = {
    status: 'unknown', observedOnly: true, proven: false,
    approachingValue: null, monotonic: 'none', alternatingSign: false, amplitudeShrinking: null,
  };
  if (terms.length < 2) return base;

  const values = terms.map((term) => term.value);
  const deltas = [];
  for (let i = 0; i + 1 < values.length; i += 1) deltas.push(values[i + 1] - values[i]);

  const scale = Math.max(1, ...values.map(Math.abs));
  const near = (value) => Math.abs(value) <= tolerance * scale;

  const allUp = deltas.every((d) => d > 0 && !near(d));
  const allDown = deltas.every((d) => d < 0 && !near(d));
  const allFlat = deltas.every(near);

  // Le signe alterne-t-il d'un terme au suivant ? (§20, §24)
  const signs = values.filter((v) => !near(v)).map(Math.sign);
  const alternatingSign = signs.length >= 3 && signs.every((s, i) => i === 0 || s === -signs[i - 1]);

  // L'amplitude : décroît-elle ? C'est ce qui sépare « oscille » de
  // « converge en oscillant » (§24) — la question que §24 pose exactement.
  const magnitudes = values.map(Math.abs);
  const amplitudeShrinking = magnitudes.length >= 4
    ? magnitudes[magnitudes.length - 1] < magnitudes[Math.floor(magnitudes.length / 2)] * 0.9
    : null;

  const monotonic = allUp ? 'up' : allDown ? 'down' : 'none';
  const result = { ...base, monotonic, alternatingSign, amplitudeShrinking };

  if (allFlat) return { ...result, status: 'constant', approachingValue: values[values.length - 1] };

  // Le théorème, quand il s'applique (et LUI SEUL est `proven`).
  const affine = affineCoefficients(definition);
  if (affine && Math.abs(affine.a) < 1 && affine.a !== 1) {
    const limit = cleanFloat(affine.b / (1 - affine.a));

    return {
      ...result,
      status: 'approaching', approachingValue: limit,
      observedOnly: false, proven: true,
    };
  }

  const last = values[values.length - 1];
  const tail = values.slice(Math.max(0, values.length - 5));
  const tailSpread = Math.max(...tail) - Math.min(...tail);
  const settling = tail.length >= 3 && tailSpread <= tolerance * 1e3 * Math.max(1, Math.abs(last));

  // Ça explose ? Le dernier terme est grand ET les pas grandissent.
  const growing = deltas.length >= 2
    && Math.abs(deltas[deltas.length - 1]) > Math.abs(deltas[0]) * 2
    && Math.abs(last) > scale * 0.5;
  if (growing && !settling) return { ...result, status: 'diverging' };

  if (settling) return { ...result, status: 'approaching', approachingValue: last };
  if (alternatingSign) {
    return amplitudeShrinking
      ? { ...result, status: 'approaching', approachingValue: 0 }
      : { ...result, status: 'alternating' };
  }
  if (allUp) return { ...result, status: 'increasing' };
  if (allDown) return { ...result, status: 'decreasing' };

  // Ni monotone, ni alternée, ni stabilisée : elle va et vient.
  const changes = deltas.filter((d, i) => i > 0 && Math.sign(d) !== Math.sign(deltas[i - 1])).length;

  return { ...result, status: changes >= 2 ? 'oscillating' : 'mixed' };
}

/**
 * La TOILE D'ARAIGNÉE (§9) : le chemin u(0) → u(1) → u(2) … lu sur y = f(x)
 * et y = x.
 *
 * Le chemin est une polyligne : de (u(n), u(n)) on monte à (u(n), u(n+1)) —
 * on applique la règle — puis on va horizontalement à (u(n+1), u(n+1)) — on
 * reporte sur la diagonale. C'est cette lecture en deux temps qui rend la
 * convergence VISIBLE, et c'est pourquoi le module rend les points et non un
 * `<path>` : la géométrie ici, les pixels ailleurs (§46).
 *
 * @returns {Array<{x: number, y: number}>}
 */
export function cobwebPath(definition, terms, maxSteps = 60) {
  if (!isFirstOrder(definition?.kind) || terms.length < 1) return [];
  const points = [{ x: terms[0].value, y: terms[0].value }];
  const limit = Math.min(maxSteps, terms.length - 1);
  for (let i = 0; i < limit; i += 1) {
    const current = terms[i].value;
    const next = terms[i + 1].value;
    points.push({ x: current, y: next });   // vertical : on applique f
    points.push({ x: next, y: next });      // horizontal : on reporte sur y = x
  }

  return points;
}

/**
 * Deux متتاليات comparées (§33) : les indices COMMUNS, et sur chacun la
 * différence et le rapport. Comparer sur des indices qui n'existent pas dans
 * les deux ne dirait rien.
 */
export function compareRuns(left, right) {
  const rightByIndex = new Map(right.map((term) => [term.n, term.value]));
  const rows = [];
  for (const term of left) {
    if (!rightByIndex.has(term.n)) continue;
    const other = rightByIndex.get(term.n);
    rows.push({
      n: term.n, left: term.value, right: other,
      difference: term.value - other,
      ratio: other === 0 ? null : term.value / other,
    });
  }

  return rows;
}

/** Le premier indice où les deux suites se croisent — où la différence change de signe (§33). */
export function crossingIndex(rows) {
  for (let i = 1; i < rows.length; i += 1) {
    const before = rows[i - 1].difference;
    const after = rows[i].difference;
    if (after === 0) return rows[i].n;
    if (before !== 0 && Math.sign(before) !== Math.sign(after)) return rows[i].n;
  }

  return null;
}

/**
 * ── LA FORME EXPLICITE, quand elle est connue (§16) ──────────────────────
 *
 * §16 demande de montrer côte à côte la définition récursive et la formule
 * directe, pour faire sentir la différence entre « calculer de proche en
 * proche » et « calculer tout de suite ». On ne l'invente que là où le cours
 * la donne :
 *
 *   arithmétique   u(n) = u₀ + (n − n₀)·r
 *   géométrique    u(n) = u₀ · q^(n − n₀)
 *   affine         u(n) = L + (u₀ − L)·a^(n − n₀),  L = b/(1−a),  a ≠ 1
 *
 * Pour une récurrence libre, il n'y a PAS de formule — on rend `null`, et
 * l'interface n'affiche pas une colonne vide en promettant l'inverse (§16).
 *
 * @returns {{ kind: string, params: object, closed: (n: number) => number } | null}
 */
export function closedForm(definition) {
  if (!definition) return null;
  const startIndex = readIndex(definition.startIndex);
  const u0 = definition.initial?.[0];
  if (!finite(u0)) return null;

  switch (definition.kind) {
    case 'arithmetic': {
      const r = definition.difference;
      if (!finite(r)) return null;

      return { kind: 'arithmetic', params: { u0, r, startIndex }, closed: (n) => u0 + (n - startIndex) * r };
    }
    case 'geometric': {
      const q = definition.ratio;
      if (!finite(q)) return null;

      return { kind: 'geometric', params: { u0, q, startIndex }, closed: (n) => u0 * q ** (n - startIndex) };
    }
    case 'affine': {
      const { a, b } = definition;
      if (!finite(a) || !finite(b)) return null;
      if (a === 1) {
        return { kind: 'arithmetic', params: { u0, r: b, startIndex }, closed: (n) => u0 + (n - startIndex) * b };
      }
      const limit = cleanFloat(b / (1 - a));

      return {
        kind: 'affine', params: { u0, a, b, limit, startIndex },
        closed: (n) => limit + (u0 - limit) * a ** (n - startIndex),
      };
    }
    default:
      return null;
  }
}

/** Deux nombres égaux « à la tolérance près » — la comparaison de §46. */
export function nearlyEqual(left, right, tolerance = DEFAULT_TOLERANCE) {
  if (!finite(left) || !finite(right)) return false;

  return Math.abs(left - right) <= tolerance * Math.max(1, Math.abs(left), Math.abs(right));
}
