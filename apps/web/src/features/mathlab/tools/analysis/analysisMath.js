/**
 * LA MATHÉMATIQUE du مختبر التحليل — pure, sans React, sans pixels.
 *
 * Ce module ne trace rien et n'arrondit rien pour l'affichage : il rend des
 * nombres et des verdicts. Tout ce qui se dessine (AnalysisPlane, les
 * couches) lit ce qu'il calcule ; tout ce qui s'écrit passe par
 * analysisFormat.js.
 *
 * ── La règle qui gouverne tout le fichier (§35) ──────────────────────────
 * « Never display misleading mathematical results. If a result is numerically
 * approximated, clearly distinguish it from an exact value. »
 *
 * Aucune fonction d'ici ne rend un nombre nu quand elle n'en est pas sûre.
 * Elle rend `{ ok: false, reason }`, ou marque sa valeur `approximate: true`.
 * Un `null` est une réponse — « je ne sais pas » — et l'interface l'affiche
 * comme telle, jamais comme un zéro.
 *
 * ── Ce que ce module N'EST PAS ───────────────────────────────────────────
 * Un moteur de calcul formel. Les racines, les extrema, les intégrales et
 * les limites sont trouvés NUMÉRIQUEMENT, par balayage puis raffinement. La
 * dérivée, elle, est symbolique quand elle peut l'être
 * (symbolicDerivative.js) — c'est la seule exactitude que l'instrument
 * revendique, et analysisFormat.js le DIT à l'élève.
 */

import { derivativeAt } from '../functionGrapher/numericalDerivative.js';
import { isContinuous } from '../functionGrapher/functionSampler.js';

const finite = Number.isFinite;

/** Le balayage par défaut : assez fin pour ne pas manquer une racine simple. */
const SCAN_SAMPLES = 900;
/** La précision d'une racine ou d'un extremum, en unités du plan. */
const REFINE_TOLERANCE = 1e-10;
/** Deux abscisses plus proches que cela sont LE MÊME point remarquable. */
const MERGE_EPSILON = 1e-6;

/* ══════════════════════════════════════════════════════════════════════════
   1. LE BALAYAGE — la base de tout le reste
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Échantillonne f sur [a, b] en gardant la trace des trous.
 *
 * @returns {{xs: number[], ys: number[]}}  ys porte NaN là où f n'est pas définie
 */
function scan(fn, a, b, samples = SCAN_SAMPLES) {
  const count = Math.max(2, Math.floor(samples));
  const xs = new Array(count + 1);
  const ys = new Array(count + 1);
  const step = (b - a) / count;
  for (let i = 0; i <= count; i += 1) {
    const x = i === count ? b : a + i * step;
    xs[i] = x;
    const y = fn(x);
    ys[i] = typeof y === 'number' ? y : NaN;
  }

  return { xs, ys };
}

/**
 * Le zéro de f dans [a, b] par dichotomie, quand f(a) et f(b) sont de signes
 * contraires. Bissection pure : elle converge TOUJOURS sous cette hypothèse,
 * là où Newton peut diverger — et un élève qui voit une racine à l'écran ne
 * doit pas dépendre de la chance d'un départ.
 */
function bisect(fn, a, b, tolerance = REFINE_TOLERANCE) {
  let low = a;
  let high = b;
  let fLow = fn(low);
  let fHigh = fn(high);
  if (!finite(fLow) || !finite(fHigh)) return null;
  if (fLow === 0) return low;
  if (fHigh === 0) return high;
  if (fLow * fHigh > 0) return null;

  for (let i = 0; i < 200 && high - low > tolerance; i += 1) {
    const mid = (low + high) / 2;
    const fMid = fn(mid);
    if (!finite(fMid)) return null;
    if (fMid === 0) return mid;
    if (fLow * fMid < 0) { high = mid; fHigh = fMid; } else { low = mid; fLow = fMid; }
  }

  return (low + high) / 2;
}

/** Fusionne les abscisses trop proches pour être deux points distincts. */
function mergeClose(values, epsilon = MERGE_EPSILON) {
  const sorted = [...values].sort((p, q) => p - q);
  const out = [];
  for (const value of sorted) {
    if (out.length === 0 || Math.abs(value - out[out.length - 1]) > epsilon) out.push(value);
  }

  return out;
}

/* ══════════════════════════════════════════════════════════════════════════
   2. LES RACINES (§27)
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Les zéros de f sur [a, b].
 *
 * Deux sources, et la distinction compte :
 *   - un CHANGEMENT DE SIGNE entre deux échantillons → une racine, trouvée
 *     par dichotomie, certaine (à la continuité près, qu'on sonde) ;
 *   - un échantillon qui VAUT zéro, ou un minimum de |f| qui frôle zéro sans
 *     changer de signe → une racine DOUBLE possible (x² en 0). On ne la
 *     déclare que si |f| y descend sous une tolérance liée à l'échelle.
 *
 * Un pôle n'est jamais une racine : `1/x` change de signe en 0 sans s'y
 * annuler. On vérifie donc que f est CONTINUE de part et d'autre avant de
 * conclure — la même sonde que l'échantillonneur du grapheur.
 *
 * @returns {Array<{x: number, kind: 'simple'|'touch'}>}
 */
export function findRoots(fn, a, b, options = {}) {
  const samples = options.samples ?? SCAN_SAMPLES;
  const { xs, ys } = scan(fn, a, b, samples);
  const scale = magnitudeOf(ys);
  const touchTolerance = Math.max(1e-9, scale * 1e-7);
  const found = [];

  for (let i = 0; i < xs.length - 1; i += 1) {
    const y0 = ys[i];
    const y1 = ys[i + 1];
    if (!finite(y0) || !finite(y1)) continue;

    if (y0 === 0) { found.push({ x: xs[i], kind: 'simple' }); continue; }

    if (y0 * y1 < 0) {
      // Un PÔLE traversé (1/x en 0) change aussi de signe : on ne le prend
      // pour une racine que si f passe continûment de y0 à y1.
      if (!isContinuous(fn, xs[i], y0, xs[i + 1], y1)) continue;
      const root = bisect(fn, xs[i], xs[i + 1]);
      if (root !== null) found.push({ x: root, kind: 'simple' });
    }
  }

  /**
   * Les racines DOUBLES : |f| touche le fond sans changer de signe.
   *
   * La tolérance ne peut PAS se lire sur l'amplitude de la fenêtre. Pour
   * `x² − 4x + 3` sur [−10, 10], |f| monte à 143, et une tolérance
   * proportionnelle (143·1e−7) suffisait à faire passer la racine SIMPLE en 1
   * pour une racine double — la QA l'a vue classée « touch ». Ce qui
   * distingue une racine double n'est pas que f y soit petite : c'est que f
   * n'y CHANGE PAS DE SIGNE tout en s'y annulant.
   *
   * On exige donc les deux, et on vérifie le signe de part et d'autre du
   * minimum plutôt que la hauteur de la courbe ailleurs.
   */
  for (let i = 1; i < xs.length - 1; i += 1) {
    const previous = Math.abs(ys[i - 1]);
    const current = Math.abs(ys[i]);
    const next = Math.abs(ys[i + 1]);
    if (!finite(current) || !finite(previous) || !finite(next)) continue;
    if (current > touchTolerance) continue;
    if (current > previous || current > next) continue;

    const refined = refineExtremum((x) => Math.abs(fn(x)), xs[i - 1], xs[i + 1], 'min');
    const x = refined ?? xs[i];
    if (Math.abs(fn(x)) > touchTolerance) continue;
    // Le SIGNE de part et d'autre : s'il change, la courbe TRAVERSE l'axe et
    // la racine est simple — elle a déjà été trouvée par dichotomie.
    const gap = Math.max((b - a) / samples, 1e-9);
    const before = fn(x - gap);
    const after = fn(x + gap);
    if (!finite(before) || !finite(after) || before * after < 0) continue;
    found.push({ x, kind: 'touch' });
  }

  /**
   * Fusion, en gardant la NATURE la plus informative.
   *
   * Une racine double (x² en 0) est trouvée deux fois : une fois comme
   * échantillon nul (`simple`), une fois comme minimum de |f| (`touch`).
   * `find` rendait la première — donc « simple » — et l'élève perdait la
   * distinction que §27 demande de voir : la courbe TOUCHE l'axe sans le
   * traverser. On préfère donc `touch` quand les deux coexistent.
   */
  const merged = mergeClose(found.map((entry) => entry.x));

  return merged.map((x) => {
    const here = found.filter((entry) => Math.abs(entry.x - x) <= MERGE_EPSILON);
    const touch = here.find((entry) => entry.kind === 'touch');

    return touch ?? here[0] ?? { x, kind: 'simple' };
  });
}

/** L'ordre de grandeur des valeurs finies d'un balayage — pour dimensionner une tolérance. */
function magnitudeOf(ys) {
  let max = 0;
  for (const y of ys) {
    if (finite(y)) max = Math.max(max, Math.abs(y));
  }

  return max > 0 ? max : 1;
}

/* ══════════════════════════════════════════════════════════════════════════
   3. LES EXTREMA ET LA VARIATION (§16, §17)
   ═════════════════════════════════════════════════════════════════════════ */

/** Affine le sommet d'un extremum par section dorée sur [a, b]. */
function refineExtremum(fn, a, b, direction) {
  const invphi = (Math.sqrt(5) - 1) / 2;
  let low = a;
  let high = b;
  const better = direction === 'min' ? (p, q) => p < q : (p, q) => p > q;
  let c = high - invphi * (high - low);
  let d = low + invphi * (high - low);
  let fc = fn(c);
  let fd = fn(d);
  if (!finite(fc) || !finite(fd)) return null;

  for (let i = 0; i < 120 && high - low > REFINE_TOLERANCE; i += 1) {
    if (better(fc, fd)) {
      high = d; d = c; fd = fc;
      c = high - invphi * (high - low);
      fc = fn(c);
      if (!finite(fc)) return null;
    } else {
      low = c; c = d; fc = fd;
      d = low + invphi * (high - low);
      fd = fn(d);
      if (!finite(fd)) return null;
    }
  }

  return (low + high) / 2;
}

/**
 * Les points CRITIQUES de f sur [a, b] : là où f′ s'annule ou change de signe.
 *
 * §17 est explicite : « Do not imply that every f'(x)=0 point is
 * automatically an extremum. » On classe donc chaque point critique par le
 * signe de f′ DE PART ET D'AUTRE, jamais par le seul fait que f′ y vaut 0 :
 *
 *   f′ : − → +   minimum
 *   f′ : + → −   maximum
 *   f′ : + → +   ou  − → −   →  `inflection` (x³ en 0 : tangente horizontale,
 *                                 PAS un extremum)
 *
 * @param {(x:number)=>number} fn
 * @param {(x:number)=>number} derivative  f′ (symbolique si elle existe)
 * @returns {Array<{x: number, y: number, kind: 'min'|'max'|'stationary'}>}
 */
export function findCriticalPoints(fn, derivative, a, b, options = {}) {
  const samples = options.samples ?? Math.min(SCAN_SAMPLES, 600);
  const { xs, ys } = scan(derivative, a, b, samples);
  const candidates = [];

  for (let i = 0; i < xs.length - 1; i += 1) {
    const d0 = ys[i];
    const d1 = ys[i + 1];
    if (!finite(d0) || !finite(d1)) continue;
    if (d0 === 0) { candidates.push(xs[i]); continue; }
    if (d0 * d1 < 0) {
      if (!isContinuous(derivative, xs[i], d0, xs[i + 1], d1)) continue;
      const root = bisect(derivative, xs[i], xs[i + 1]);
      if (root !== null) candidates.push(root);
    }
  }

  /**
   * Les zéros de f′ SANS changement de signe — la tangente horizontale de x³.
   *
   * La dichotomie ne les trouve jamais : f′ = 3x² ne change pas de signe en 0,
   * elle y touche zéro. La QA navigateur l'a vu comme une absence — x³ n'avait
   * AUCUN point critique à l'écran, alors que §17 en fait son exemple
   * canonique (« tangente horizontale qui n'est pas un extremum »).
   *
   * On cherche donc aussi les MINIMA de |f′| qui frôlent zéro, exactement
   * comme `findRoots` cherche les racines doubles de f.
   */
  const step = (b - a) / samples;
  for (let i = 1; i < xs.length - 1; i += 1) {
    const previous = Math.abs(ys[i - 1]);
    const current = Math.abs(ys[i]);
    const next = Math.abs(ys[i + 1]);
    if (!finite(previous) || !finite(current) || !finite(next)) continue;
    if (current > previous || current > next) continue;

    /**
     * On RAFFINE d'abord, on juge ensuite.
     *
     * Aucun seuil appliqué aux ÉCHANTILLONS ne peut marcher : la grille ne
     * tombe pas sur le zéro. Pour x³ sur [−3,9 ; 7,9], l'échantillon le plus
     * proche de 0 vaut 1,4e−4 et ses voisins 2,1e−3 — un rapport de 7e−2, très
     * loin de zéro en apparence, alors que la vraie valeur EST zéro. La QA
     * navigateur a vu x³ sans aucun point critique, alors que §17 en fait son
     * exemple canonique.
     *
     * La section dorée trouve le fond du creux à 1e−10 près ; c'est LÀ qu'on
     * demande si f′ s'annule, en comparant sa valeur à la pente qu'elle a
     * autour — un vrai zéro descend de plusieurs ordres de grandeur sous ses
     * voisins, un simple minimum local non nul reste du même ordre.
     */
    const refined = refineExtremum((x) => Math.abs(derivative(x)), xs[i - 1], xs[i + 1], 'min');
    if (refined === null) continue;
    const value = Math.abs(derivative(refined));
    const around = Math.max(
      Math.abs(derivative(refined - step)),
      Math.abs(derivative(refined + step)),
    );
    if (!finite(value) || !finite(around)) continue;
    if (around > 0 ? value <= around * 1e-4 : value < 1e-12) candidates.push(refined);
  }

  const unique = mergeClose(candidates);

  return unique
    .map((x) => {
      const y = fn(x);
      if (!finite(y)) return null;
      // Le signe de f′ de part et d'autre, à une distance liée à la fenêtre.
      const gap = Math.max((b - a) / samples, 1e-7);
      const before = sampleSign(derivative, x - gap, x - gap / 8);
      const after = sampleSign(derivative, x + gap / 8, x + gap);
      let kind = 'stationary';
      if (before < 0 && after > 0) kind = 'min';
      else if (before > 0 && after < 0) kind = 'max';

      return { x, y, kind };
    })
    .filter(Boolean);
}

/** Le signe DOMINANT de g sur [a, b] : +1, −1, ou 0 si indécis. */
function sampleSign(g, a, b) {
  let positive = 0;
  let negative = 0;
  for (let i = 0; i <= 4; i += 1) {
    const value = g(a + ((b - a) * i) / 4);
    if (!finite(value)) continue;
    if (value > 0) positive += 1;
    else if (value < 0) negative += 1;
  }
  if (positive > 0 && negative === 0) return 1;
  if (negative > 0 && positive === 0) return -1;

  return 0;
}

/**
 * Les INTERVALLES de variation : où f croît, où elle décroît.
 *
 * Découpés aux points critiques ET aux discontinuités — `1/x` décroît sur
 * ]−∞, 0[ et sur ]0, +∞[, jamais « sur ℝ∗ » d'un seul tenant.
 *
 * @returns {Array<{from: number, to: number, direction: 'increasing'|'decreasing'|'constant'}>}
 */
export function findVariationIntervals(fn, derivative, a, b, options = {}) {
  const critical = (options.critical ?? findCriticalPoints(fn, derivative, a, b, options)).map((p) => p.x);
  const breaks = (options.breaks ?? findDiscontinuities(fn, a, b, options)).map((d) => d.x);
  const cuts = mergeClose([a, ...critical, ...breaks, b]).filter((x) => x >= a - MERGE_EPSILON && x <= b + MERGE_EPSILON);
  const intervals = [];

  for (let i = 0; i < cuts.length - 1; i += 1) {
    const from = cuts[i];
    const to = cuts[i + 1];
    if (to - from < MERGE_EPSILON) continue;
    const sign = dominantSign(derivative, from, to);
    if (sign === null) continue;
    const direction = sign > 0 ? 'increasing' : sign < 0 ? 'decreasing' : 'constant';
    const previous = intervals[intervals.length - 1];
    // Deux intervalles de même sens séparés par un point stationnaire
    // (x³ en 0) n'en font qu'un : f y croît sans s'arrêter.
    if (previous && previous.direction === direction && Math.abs(previous.to - from) < MERGE_EPSILON
      && !breaks.some((x) => Math.abs(x - from) < MERGE_EPSILON)) {
      previous.to = to;
      continue;
    }
    intervals.push({ from, to, direction });
  }

  return intervals;
}

/** Le signe de g sur ]a, b[, échantillonné à l'intérieur (les bords sont les points critiques). */
function dominantSign(g, a, b) {
  const count = 12;
  let positive = 0;
  let negative = 0;
  for (let i = 1; i < count; i += 1) {
    const value = g(a + ((b - a) * i) / count);
    if (!finite(value)) continue;
    if (value > 1e-12) positive += 1;
    else if (value < -1e-12) negative += 1;
  }
  if (positive === 0 && negative === 0) return 0;
  if (negative === 0) return 1;
  if (positive === 0) return -1;

  // Les deux signes sur un même intervalle : le découpage a raté quelque
  // chose (une oscillation plus fine que le balayage). On ne tranche pas.
  return null;
}

/**
 * Les intervalles de SIGNE de f (§16 « Sign ») — même découpage, mais sur f.
 * @returns {Array<{from: number, to: number, sign: 1|-1|0}>}
 */
export function findSignIntervals(fn, a, b, options = {}) {
  const roots = (options.roots ?? findRoots(fn, a, b, options)).map((r) => r.x);
  const breaks = (options.breaks ?? findDiscontinuities(fn, a, b, options)).map((d) => d.x);
  const cuts = mergeClose([a, ...roots, ...breaks, b]);
  const intervals = [];

  for (let i = 0; i < cuts.length - 1; i += 1) {
    const from = cuts[i];
    const to = cuts[i + 1];
    if (to - from < MERGE_EPSILON) continue;
    const sign = dominantSign(fn, from, to);
    if (sign === null) continue;
    intervals.push({ from, to, sign });
  }

  return intervals;
}

/* ══════════════════════════════════════════════════════════════════════════
   4. LES DISCONTINUITÉS ET LES ASYMPTOTES (§13, §15, §16)
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Les points où f cesse d'être définie ou continue, sur [a, b].
 *
 * §15 demande de distinguer trois espèces, et c'est la limite de part et
 * d'autre qui les sépare :
 *
 *   - `infinite`   : |f| explose d'au moins un côté → asymptote verticale ;
 *   - `jump`       : les deux limites existent, finies, et DIFFÈRENT ;
 *   - `removable`  : les deux limites existent, finies, et COÏNCIDENT, mais
 *                    f n'y est pas définie (le trou de (x²−1)/(x−1) en 1).
 *
 * @returns {Array<{x: number, kind: 'infinite'|'jump'|'removable', left: number|null, right: number|null}>}
 */
export function findDiscontinuities(fn, a, b, options = {}) {
  const samples = options.samples ?? Math.min(SCAN_SAMPLES, 600);
  const { xs, ys } = scan(fn, a, b, samples);
  const suspects = [];
  // L'amplitude de f sur la fenêtre : l'échelle à laquelle un saut se juge.
  const magnitude = magnitudeOf(ys);

  /**
   * Les abscisses à SONDER en plus du balayage.
   *
   * Un trou est de mesure nulle : aucun balayage ne peut garantir de tomber
   * dessus. Pour `(x² − 1)/(x − 1)` sur [−3,92 ; 7,92], le pas vaut 0,0247 et
   * la grille enjambe x = 1 — tous les échantillons sont finis, et le trou
   * était INVISIBLE. La QA navigateur l'a trouvé ainsi : les deux tables
   * d'approche montraient bien 2 et 2, mais aucune discontinuité n'était
   * signalée.
   *
   * Quand l'élève a DÉSIGNÉ un point (le a de lim x→a), on l'examine
   * directement : c'est le point dont il parle, et c'est gratuit.
   */
  const probes = Array.isArray(options.probe) ? options.probe : options.probe != null ? [options.probe] : [];

  for (let i = 0; i < xs.length - 1; i += 1) {
    const y0 = ys[i];
    const y1 = ys[i + 1];
    /**
     * Ce qui rend un intervalle SUSPECT.
     *
     * Soit f cesse d'être définie entre les deux échantillons (`definedGap`),
     * soit elle saute vraiment — et « vraiment » se décide par la SONDE de
     * continuité, jamais par la taille de l'écart.
     *
     * Le seuil relatif seul se trompait deux fois : près d'un pôle, `1/x`
     * varie de 83 entre deux échantillons voisins tout en étant parfaitement
     * continue, et la QA visuelle a vu apparaître une seconde double barre à
     * x = 0,012 sur le tableau de variations de 1/x. Une pente raide n'est pas
     * une rupture — c'est précisément ce que `isContinuous` sait distinguer,
     * et l'échelle de référence doit être la FENÊTRE, pas la valeur locale.
     */
    const definedGap = finite(y0) !== finite(y1);
    const scale = Math.max(1e-12, magnitude);
    const jumpGap = finite(y0) && finite(y1)
      && Math.abs(y1 - y0) > scale * 1e-3
      && !isContinuous(fn, xs[i], y0, xs[i + 1], y1);
    if (definedGap || jumpGap) suspects.push([xs[i], xs[i + 1]]);
  }

  // Un point désigné qui n'est pas défini EST une rupture, quoi qu'en dise la grille.
  for (const probe of probes) {
    if (!finite(probe) || probe < a || probe > b) continue;
    if (finite(fn(probe))) continue;
    suspects.push([probe, probe]);
  }

  const found = [];
  for (const [low, high] of suspects) {
    const located = low === high ? low : locateBreak(fn, low, high);
    if (located === null) continue;
    const x = low === high ? low : snapBreak(fn, located);
    if (found.some((entry) => Math.abs(entry.x - x) < MERGE_EPSILON)) continue;
    const left = oneSidedLimit(fn, x, 'left');
    const right = oneSidedLimit(fn, x, 'right');
    const classified = classifyBreak(fn, x, left, right);
    // Une rupture finalement jugée continue n'en est pas une : c'est un pas
    // de balayage qui a sonné dans le vide. Un BORD de domaine non plus :
    // la courbe y commence, elle ne s'y interrompt pas.
    if (classified.kind === 'continuous' || classified.kind === 'edge') continue;
    found.push({ x, ...classified, left: limitValue(left), right: limitValue(right) });
  }

  return found.sort((p, q) => p.x - q.x);
}

function classifyBreak(fn, x, left, right) {
  const infinite = left.kind === 'infinite' || right.kind === 'infinite';
  if (infinite) return { kind: 'infinite' };
  if (left.kind === 'finite' && right.kind === 'finite') {
    /**
     * Tout ce qui suit se juge à une TOLÉRANCE qui dépend de la confiance
     * qu'on a dans les deux lectures.
     *
     * `oneSidedLimit` marque `uncertain` une limite dont les valeurs ne se
     * sont pas encore stabilisées. Près d'un pôle c'est le cas courant : la
     * table de `1/x` lue en x = 0,012 rend 83,34 d'un côté et 83,33 de
     * l'autre, et f y vaut 83,3333 — trois nombres qui ne diffèrent que par
     * le bruit de l'échantillonnage. Comparés au seuil serré de 1e−6, ils
     * « diffèrent », et le point passait tour à tour pour un saut puis pour
     * un trou : la QA visuelle a vu une double barre de trop sur le tableau
     * de variations de 1/x, à une abscisse où la fonction est continue.
     *
     * On exige donc, quand une lecture est incertaine, un écart RÉELLEMENT
     * visible — un pour mille. Le trou de (x²−1)/(x−1), lui, a ses deux
     * limites qui s'accordent bien mieux que cela, et il passe.
     *
     * Cette règle vit dans `limitsAgree`, partagée avec `twoSidedLimit` :
     * le tableau de variations et l'inspecteur jugent de la même façon.
     */
    if (!limitsAgree(left, right)) return { kind: 'jump' };

    /**
     * Les deux limites coïncident. Reste à savoir si f est DÉFINIE là.
     *
     * `(x² − 1)/(x − 1)` en 1 vaut NaN (0/0 : l'évaluateur rend NaN pour une
     * division par zéro) alors que ses deux limites valent 2 : c'est le TROU
     * de §15. La QA l'a d'abord vu classé `continuous` parce que ce test
     * lisait `fn(x)` sans vérifier qu'il était fini — un trou déclaré
     * continu, c'est-à-dire invisible.
     *
     * Et une valeur qui COÏNCIDE avec la limite, à la même tolérance, dit
     * simplement que la fonction est continue ici : c'est le cas de la pente
     * raide, qu'il ne faut surtout pas déclarer « trou ».
     */
    const here = fn(x);
    if (!finite(here)) return { kind: 'removable' };

    const valueHere = { kind: 'finite', value: here, error: 0, uncertain: left.uncertain || right.uncertain };

    return { kind: limitsAgree(left, valueHere) && limitsAgree(right, valueHere) ? 'continuous' : 'removable' };
  }

  /**
   * Un seul côté existe : ce n'est pas une RUPTURE, c'est le BORD DU DOMAINE.
   *
   * `√x` en 0 n'a pas de limite à gauche parce que la fonction n'y est pas
   * définie du tout : la courbe commence là, elle ne s'y interrompt pas. La
   * QA l'a vu annoncé « saut », ce qui aurait mis une double barre au début
   * de la courbe dans le tableau de variations — et fait croire à un élève
   * que √ saute en 0.
   */
  const oneSided = (left.kind === 'undefined') !== (right.kind === 'undefined');
  if (oneSided) return { kind: 'edge' };

  /**
   * AUCUNE des deux limites ne se lit : on n'affirme rien.
   *
   * Juste à côté d'un pôle, les valeurs de `1/x` varient si vite que la table
   * d'approche ne se stabilise d'aucun côté — `oneSidedLimit` rend `none`
   * deux fois. Retomber sur « saut » y plaçait une SECONDE double barre à
   * x = 0,00095, à un cheveu du vrai pôle : la QA navigateur l'a vue sur le
   * tableau de variations de 1/x, mais seulement sur certaines fenêtres,
   * parce qu'elle dépend de l'endroit où la grille tombe.
   *
   * Un saut se PROUVE par deux limites qui existent et diffèrent. Sans
   * elles, on ne met rien : le pôle voisin, lui, est déjà signalé.
   */
  if (left.kind === 'none' && right.kind === 'none') return { kind: 'continuous' };

  return { kind: 'jump' };
}


/**
 * La dichotomie s'arrête à 1e−12 du trou, pas DANS le trou : pour
 * `(x² − 1)/(x − 1)` elle rend 0,9999999999995, où f vaut 2 — et le trou
 * passait alors pour un point ordinaire. Si un point remarquable (un rond,
 * un demi, un dixième) tout près n'est PAS défini alors que ses voisins le
 * sont, c'est LUI la rupture.
 */
function snapBreak(fn, x) {
  if (!finite(fn(x))) return x;
  for (const grain of [1, 2, 4, 10, 100, 1000]) {
    const candidate = Math.round(x * grain) / grain;
    if (Math.abs(candidate - x) > 1e-6) continue;
    if (!finite(fn(candidate))) return candidate;
  }

  return x;
}

/** Resserre par dichotomie l'abscisse exacte d'une rupture entre deux échantillons. */
function locateBreak(fn, low, high) {
  let a = low;
  let b = high;
  const defined = (x) => finite(fn(x));
  const aDefined = defined(a);
  for (let i = 0; i < 60 && b - a > 1e-12; i += 1) {
    const mid = (a + b) / 2;
    if (defined(mid) === aDefined) a = mid; else b = mid;
  }

  return (a + b) / 2;
}

/* ══════════════════════════════════════════════════════════════════════════
   5. LES LIMITES (§11 – §14)
   ═════════════════════════════════════════════════════════════════════════ */

/** La suite d'approche de §11 : a ± 1, ±0,1, ±0,01… — ce que l'élève VOIT converger. */
export const APPROACH_STEPS = Object.freeze([1, 0.5, 0.1, 0.05, 0.01, 0.001, 1e-4, 1e-5, 1e-6]);

/**
 * La table d'approche : x → a par la gauche ou par la droite, et f(x) en face.
 *
 * C'est le cœur pédagogique de §11 — « the student should observe the
 * function value approaching a number ». On ne calcule pas une limite : on
 * MONTRE une suite de valeurs.
 *
 * @returns {Array<{x: number, y: number|null}>}
 */
export function approachTable(fn, a, side, steps = APPROACH_STEPS) {
  const sign = side === 'left' ? -1 : 1;

  return steps.map((delta) => {
    const x = a + sign * delta;
    const y = fn(x);

    return { x, y: finite(y) ? y : null };
  });
}

/**
 * La limite à GAUCHE ou à DROITE en a, décidée sur la table d'approche.
 *
 * Trois verdicts, et jamais un quatrième déguisé :
 *   `{kind: 'finite', value, approximate: true}`  les valeurs se stabilisent ;
 *   `{kind: 'infinite', sign}`                    elles s'échappent, de signe constant ;
 *   `{kind: 'none'}`                              ni l'un ni l'autre (sin(1/x) en 0).
 *
 * `approximate` est TOUJOURS vrai pour une limite finie : elle est lue sur
 * une table, pas démontrée. §35 exige que l'interface le dise, et
 * analysisFormat.js s'en charge.
 */
export function oneSidedLimit(fn, a, side, options = {}) {
  const steps = options.steps ?? APPROACH_STEPS;
  const table = approachTable(fn, a, side, steps);
  const values = table.map((row) => row.y).filter((y) => y !== null);
  if (values.length < 3) return { kind: 'undefined' };

  const tail = values.slice(-4);
  const last = tail[tail.length - 1];

  /**
   * Une EXPLOSION : les dernières valeurs grandissent sans mesure, de signe
   * constant (§13).
   *
   * Le seuil se lit sur la table, il n'est pas absolu. `1/x` approché
   * jusqu'à 1e−6 atteint tout juste 1e6 : un test `> 1e6` le manquait d'un
   * cheveu et rendait « aucune limite » là où il fallait lire −∞ et +∞.
   * Ce qui caractérise une explosion n'est pas d'avoir passé un seuil, c'est
   * de CROÎTRE À CHAQUE PAS sans se stabiliser — et de finir grand.
   */
  const growing = tail.every((value, index) => index === 0 || Math.abs(value) > Math.abs(tail[index - 1]) * 1.2);
  if (growing && Math.abs(last) > 1e4) {
    const signs = new Set(tail.map((value) => Math.sign(value)));

    return signs.size === 1 ? { kind: 'infinite', sign: Math.sign(last) } : { kind: 'none' };
  }

  /**
   * La VALEUR lue n'est pas le dernier échantillon : c'est son extrapolation
   * à δ = 0.
   *
   * Le dernier échantillon est pris à δ = 1e−6 de a, pas EN a : pour une
   * fonction de pente m, il est décalé de m·1e−6, et de signe opposé de
   * chaque côté. `2x + 1` en 0 rendait 0,999998 à gauche et 1,000002 à
   * droite — un écart de 4e−6 que la comparaison à 1e−6 déclarait
   * « deux limites différentes » : l'état par défaut du laboratoire des
   * limites annonçait qu'une droite n'a pas de limite en 0.
   *
   * Voir `extrapolateToPoint`. La correction appliquée est aussi la BARRE
   * D'ERREUR qu'on rend (`error`) : l'ordre de grandeur de ce que
   * l'échantillonnage ne sait pas trancher, dont `limitsAgree` tient compte.
   */
  const reading = extrapolateToPoint(table, steps, last, tail);

  /**
   * Une divergence LENTE est une divergence.
   *
   * `ln|x|` en 0 : −6,9 ; −9,2 ; −11,5 ; −13,8 — chaque décade retranche la
   * même quantité. Le test d'explosion ci-dessus ne la voit pas (la suite ne
   * grandit que de 20 % par pas, et reste loin de 1e4), et la lecture
   * annonçait « ≈ −14,07 », une limite finie qui n'existe pas. Une suite qui
   * converge a des écarts qui TENDENT VERS 0 ; des écarts de même signe qui
   * ne décroissent pas (rapport ≥ 0,9 à chaque décade) disent l'inverse.
   */
  const steps4 = tail.slice(1).map((value, index) => value - tail[index]);
  const steady = steps4.length >= 2
    && steps4.every((step) => step !== 0 && Math.sign(step) === Math.sign(steps4[0]))
    && steps4.every((step, index) => index === 0 || Math.abs(step) >= 0.9 * Math.abs(steps4[index - 1]));
  if (steady) return { kind: 'infinite', sign: Math.sign(steps4[0]) };

  // Une stabilisation : les dernières valeurs se resserrent.
  const spread = Math.max(...tail) - Math.min(...tail);
  const scale = 1 + Math.abs(last);
  if (spread < 1e-4 * scale) return { kind: 'finite', approximate: true, ...reading };

  /**
   * Une convergence RÉGULIÈRE est une convergence, même raide.
   *
   * `1000x + 1` en 0 : la table va de 0 à 0,999999, un écart de 1 — au-delà
   * du seuil ci-dessus, et même du seuil « aucune limite » plus bas. Mais
   * chaque pas divise l'écart au précédent par 10 : la suite se resserre
   * géométriquement, et une suite dont les écarts décroissent d'un facteur
   * ≤ ½ a un reste plus petit que son dernier écart. C'est la même règle que
   * `limitAtInfinity` (« ce qui caractérise la convergence, c'est que l'écart
   * DÉCROISSE »). `sin(1/x)` n'y passe pas : ses écarts ne décroissent pas.
   */
  const gaps = tail.slice(1).map((value, index) => Math.abs(value - tail[index]));
  const shrinking = gaps.length >= 2 && gaps.every((gap, index) => index === 0 || gap <= 0.5 * gaps[index - 1]);
  if (shrinking && gaps[gaps.length - 1] < 1e-2 * scale) return { kind: 'finite', approximate: true, ...reading };

  // Ni l'un ni l'autre : on ne tranche pas.
  if (spread > 0.5 * scale) return { kind: 'none' };

  return { kind: 'finite', approximate: true, uncertain: true, ...reading };
}

/**
 * L'extrapolation à δ = 0 des dernières lignes de la table.
 *
 * Près de a, f(a ± δ) ≈ L + c·δ^p : p = 1 pour une fonction dérivable,
 * p = ½ au bord de √. Les trois derniers pas (1e−4, 1e−5, 1e−6) forment une
 * suite GÉOMÉTRIQUE, donc les écarts successifs aussi, de raison ρ = 10^−p —
 * et l'accélération d'Aitken (Δ²) rend L exactement, quel que soit p :
 * L = y₃ + d₂·ρ/(1 − ρ), avec d₂ = y₃ − y₂ et ρ = d₂/d₁. Pour p = 1, c'est
 * l'extrapolation de Richardson (L ≈ y₃ + d₂/9).
 *
 * On ne l'applique que si les écarts se resserrent vraiment (0 < ρ < 0,9) ;
 * sinon Richardson d'ordre 1 sur les deux dernières lignes, et à défaut le
 * dernier échantillon, avec l'écart de la queue pour barre d'erreur.
 */
function extrapolateToPoint(table, steps, last, tail) {
  const n = table.length;
  const fallback = { value: last, error: Math.max(...tail) - Math.min(...tail) };
  const read = (index) => (index >= 0 ? table[index].y : null);
  const [y1, y2, y3] = [read(n - 3), read(n - 2), read(n - 1)];
  if (y2 === null || y3 === null) return fallback;

  const d2 = y3 - y2;
  if (d2 === 0) return { value: y3, error: 0 };
  if (y1 !== null) {
    const d1 = y2 - y1;
    const ratio = d1 === 0 ? NaN : d2 / d1;
    if (ratio > 0 && ratio < 0.9) {
      const correction = d2 * ratio / (1 - ratio);
      if (finite(correction)) return { value: y3 + correction, error: Math.abs(correction) };
    }
  }

  const far = steps[n - 2];
  const near = steps[n - 1];
  if (!(far > near) || near <= 0) return fallback;
  const correction = d2 * near / (far - near);

  return finite(correction) ? { value: y3 + correction, error: Math.abs(correction) } : fallback;
}

/**
 * Deux limites FINIES sont-elles la même ?
 *
 * Une seule règle, pour le verdict du laboratoire (`twoSidedLimit`) comme
 * pour le classement des ruptures (`classifyBreak`) — deux règles
 * divergeaient, et la même droite était « continue » sur le tableau de
 * variations mais « sans limite » dans l'inspecteur.
 *
 * La tolérance est celle de l'échantillonnage, pas un epsilon fixe :
 *   · un plancher relatif, 1e−6, ou 1e−3 quand une lecture est `uncertain`
 *     (voir `classifyBreak`) ;
 *   · plus les deux barres d'erreur de l'extrapolation.
 * Un vrai saut (sign, partie entière, |x|/x) a des côtés CONSTANTS : barres
 * d'erreur nulles, et un écart de 2 ou de 1 reste un écart.
 */
function limitsAgree(left, right) {
  if (left?.kind !== 'finite' || right?.kind !== 'finite') return false;
  const uncertain = left.uncertain || right.uncertain;
  const scale = 1 + Math.max(Math.abs(left.value), Math.abs(right.value));
  const tolerance = (uncertain ? 1e-3 : 1e-6) * scale + (left.error ?? 0) + (right.error ?? 0);

  return Math.abs(left.value - right.value) <= tolerance;
}

/**
 * La limite en a, des DEUX côtés (§12).
 *
 * Quand les deux côtés diffèrent, on ne dit pas « la limite n'existe pas » et
 * on s'arrête : on rend les deux, et l'interface les MONTRE l'une en face de
 * l'autre. §12 : « Make the reason visible. »
 */
export function twoSidedLimit(fn, a, options = {}) {
  const left = oneSidedLimit(fn, a, 'left', options);
  const right = oneSidedLimit(fn, a, 'right', options);
  /**
   * Deux lectures ne « coïncident » que si elles EXISTENT : deux côtés
   * `none` (sin(1/x) en 0) ou `undefined` ne font pas une limite, et
   * l'inspecteur disait pourtant « les deux limites sont égales ».
   */
  const agree = (left.kind === 'finite' && limitsAgree(left, right))
    || (left.kind === 'infinite' && right.kind === 'infinite' && left.sign === right.sign);

  return { left, right, agree, value: agree ? left : null };
}

/** Une limite → son nombre, ou null. */
function limitValue(limit) {
  return limit?.kind === 'finite' ? limit.value : null;
}

/**
 * La limite en ±∞ (§14) : on s'éloigne par puissances de 10 et on regarde.
 *
 * @param {'+'|'-'} direction
 */
export function limitAtInfinity(fn, direction, options = {}) {
  const sign = direction === '-' ? -1 : 1;
  const magnitudes = options.magnitudes ?? [10, 100, 1e3, 1e4, 1e5, 1e6, 1e7];
  const table = magnitudes.map((magnitude) => {
    const x = sign * magnitude;
    const y = fn(x);

    return { x, y: finite(y) ? y : null };
  });
  const values = table.map((row) => row.y).filter((y) => y !== null);
  if (values.length < 3) return { kind: 'undefined', table };

  const tail = values.slice(-3);
  const last = tail[tail.length - 1];
  const spread = Math.max(...tail) - Math.min(...tail);
  const scale = 1 + Math.abs(last);

  // Croissance sans mesure : c'est la CROISSANCE qui la caractérise, pas un
  // seuil absolu. `(x² + 1)/x` ne vaut que 1e7 au bout de la table, et un
  // test `> 1e8` le déclarait « sans limite » — donc son asymptote oblique
  // n'était jamais cherchée.
  if (Math.abs(last) > 1e5 && tail.every((v, i) => i === 0 || Math.abs(v) > Math.abs(tail[i - 1]) * 1.5)) {
    const signs = new Set(tail.map((value) => Math.sign(value)));

    return signs.size === 1 ? { kind: 'infinite', sign: Math.sign(last), table } : { kind: 'none', table };
  }
  if (spread < 1e-4 * scale) return { kind: 'finite', value: last, approximate: true, table };

  /**
   * Une convergence LENTE est une convergence.
   *
   * L'asymptote oblique de `(x² + 1)/x` se lit sur f(x)/x → 1 et f(x) − x → 0.
   * Les deux convergent proprement, mais par pas de 10 : l'écart des trois
   * dernières valeurs reste ~1e−3 relatif, au-dessus du seuil ci-dessus. La
   * QA a vu l'asymptote `y = x` manquée pour cette seule raison. Ce qui
   * caractérise la convergence n'est pas que l'écart soit petit, c'est qu'il
   * DÉCROISSE : si chaque pas divise l'écart au dernier terme, la suite se
   * stabilise, et on lit sa limite.
   */
  const gaps = tail.slice(0, -1).map((value) => Math.abs(value - last));
  const shrinking = gaps.length >= 2 && gaps.every((gap, index) => index === 0 || gap < gaps[index - 1]);
  if (shrinking && gaps[gaps.length - 1] < 1e-2 * scale) {
    return { kind: 'finite', value: last, approximate: true, table };
  }

  if (spread > 0.5 * scale) return { kind: 'none', table };

  return { kind: 'finite', value: last, approximate: true, uncertain: true, table };
}

/**
 * Une valeur que la dichotomie a laissée à 4,8·10⁻¹³ de zéro EST zéro.
 *
 * §35 interdit d'afficher un résultat trompeur : une asymptote annoncée
 * « y = 0,0000001 » ou « x = −0,00000000000048 » est fausse pour l'élève,
 * alors que la mathématique dit 0. On ne rabote que le bruit — au-delà de
 * 1e−7 relatif la valeur est gardée telle quelle.
 */
function snapToZero(value, epsilon = 1e-6) {
  return Math.abs(value) < epsilon ? 0 : value;
}

/**
 * Une mesure à 1e−6 d'un demi-entier EST ce demi-entier.
 *
 * Réservé aux pentes et ordonnées d'asymptotes, où la valeur scolaire est
 * toujours simple et où l'erreur de quadrature est bien plus petite que
 * l'écart entre deux candidats. Au-delà de la tolérance, on garde la mesure.
 */
function snapToNice(value, epsilon = 1e-6) {
  const half = Math.round(value * 2) / 2;

  return Math.abs(value - half) < epsilon ? half : value;
}

/**
 * Les ASYMPTOTES de f sur la fenêtre (§16).
 *
 * Verticales : les discontinuités `infinite`.
 * Horizontales : les limites finies en ±∞.
 * Obliques : y = mx + p quand f(x)/x tend vers m ≠ 0 et f(x) − mx vers p.
 */
export function findAsymptotes(fn, a, b, options = {}) {
  const breaks = options.breaks ?? findDiscontinuities(fn, a, b, options);
  const vertical = breaks.filter((entry) => entry.kind === 'infinite').map((entry) => ({ x: snapToZero(entry.x) }));
  const horizontal = [];
  const oblique = [];

  for (const direction of ['+', '-']) {
    const limit = limitAtInfinity(fn, direction, options);
    if (limit.kind === 'finite' && !limit.uncertain) {
      horizontal.push({ y: snapToNice(snapToZero(limit.value)), direction });
      continue;
    }
    // f ne part pas à l'infini : pas d'asymptote oblique de ce côté.
    if (limit.kind !== 'infinite') continue;
    const slope = limitAtInfinity((x) => fn(x) / x, direction, options);
    if (slope.kind !== 'finite' || Math.abs(slope.value) < 1e-9 || slope.uncertain) continue;

    /**
     * La pente est ARRONDIE avant de servir à chercher l'ordonnée.
     *
     * f(x)/x pour `x²/(x − 1)` converge vers 1 en laissant 1,0000001 : une
     * erreur de 1e−7. Reportée telle quelle dans `f(x) − m·x` à x = 10⁷, elle
     * retranche 1e−7 × 10⁷ = 1 — soit exactement l'ordonnée cherchée. La
     * table divergeait, et l'asymptote `y = x + 1` était perdue par
     * ANNULATION CATASTROPHIQUE, le piège classique de ce calcul.
     *
     * Une asymptote oblique de pente entière (ou demi-entière) est le cas
     * scolaire ; quand la pente mesurée est à 1e−6 d'un tel nombre, c'est ce
     * nombre qu'il faut reporter.
     */
    const m = snapToNice(slope.value);
    const intercept = limitAtInfinity((x) => fn(x) - m * x, direction, options);
    if (intercept.kind !== 'finite' || intercept.uncertain) continue;
    oblique.push({ slope: snapToZero(m), intercept: snapToZero(intercept.value), direction });
  }

  return { vertical, horizontal, oblique };
}

/* ══════════════════════════════════════════════════════════════════════════
   6. LE TAUX DE VARIATION, LA SÉCANTE, LA TANGENTE (§7, §8, §10)
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Le taux d'accroissement moyen entre a et b — LA pente de la sécante.
 *
 * C'est le seul objet de cet instrument qui appartienne vraiment au
 * programme de 4AM : `(f(b) − f(a)) / (b − a)` est le coefficient directeur
 * d'une droite passant par deux points (LP 3.7, 3.8). C'est pourquoi
 * l'instrument OUVRE dessus (MATH_LAB §5m.1).
 *
 * @returns {{ok: true, slope: number, fa: number, fb: number} | {ok: false, reason: string}}
 */
export function averageRate(fn, a, b) {
  if (Math.abs(b - a) < 1e-15) return { ok: false, reason: 'samePoint' };
  const fa = fn(a);
  const fb = fn(b);
  if (!finite(fa) || !finite(fb)) return { ok: false, reason: 'undefined' };

  return { ok: true, slope: (fb - fa) / (b - a), fa, fb };
}

/**
 * La tangente en a : symbolique si f′ est connue, mesurée sinon.
 *
 * `exact: true` ne signifie pas « sans erreur d'arrondi » mais « issue de la
 * règle de dérivation, pas d'une mesure » — c'est cette distinction que §35
 * demande d'afficher.
 *
 * @param {(x:number)=>number} fn
 * @param {number} a
 * @param {((x:number)=>number)|null} symbolic  f′ symbolique si elle existe
 */
export function tangentInfo(fn, a, symbolic = null) {
  const y = fn(a);
  if (!finite(y)) return { ok: false, reason: 'undefined' };

  if (symbolic) {
    const slope = symbolic(a);
    if (finite(slope)) return { ok: true, x: a, y, slope, exact: true };
  }

  const measured = derivativeAt(fn, a);
  if (!measured.ok) return { ok: false, reason: measured.reason };

  return { ok: true, x: a, y, slope: measured.value, exact: false };
}

/* ══════════════════════════════════════════════════════════════════════════
   7. L'INTÉGRALE ET LES SOMMES DE RIEMANN (§19 – §23)
   ═════════════════════════════════════════════════════════════════════════ */

/**
 * Les RECTANGLES d'une somme de Riemann — les objets que §20 fait dessiner.
 *
 * On rend les rectangles eux-mêmes (pas seulement leur somme) parce que
 * l'interface doit les TRACER : c'est le dessin qui enseigne, pas le nombre.
 * Un rectangle dont la hauteur n'est pas définie est marqué `defined: false`
 * et l'interface le laisse en blanc plutôt que de mentir par un zéro.
 *
 * @returns {{rectangles: Array<{x0:number,x1:number,height:number,defined:boolean}>, sum: number, defined: boolean}}
 */
export function riemannSum(fn, a, b, n, mode = 'left') {
  const count = Math.max(1, Math.min(2000, Math.floor(n)));
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const width = (high - low) / count;
  const rectangles = [];
  let sum = 0;
  let allDefined = true;

  for (let i = 0; i < count; i += 1) {
    const x0 = low + i * width;
    const x1 = x0 + width;
    let height;
    if (mode === 'trapezoid') {
      const yLeft = fn(x0);
      const yRight = fn(x1);
      height = finite(yLeft) && finite(yRight) ? (yLeft + yRight) / 2 : NaN;
    } else {
      const sampleX = mode === 'right' ? x1 : mode === 'midpoint' ? (x0 + x1) / 2 : x0;
      height = fn(sampleX);
    }
    const defined = finite(height);
    if (!defined) allDefined = false;
    else sum += height * width;
    rectangles.push({ x0, x1, height: defined ? height : 0, defined });
  }

  // L'orientation compte : ∫ᵇₐ = −∫ₐᵇ.
  const oriented = b < a ? -sum : sum;

  return { rectangles, sum: oriented, defined: allDefined, width };
}

/**
 * L'intégrale définie par Simpson composite — la valeur de référence que les
 * sommes de Riemann approchent (§20 : « as n increases, approximation
 * becomes better » suppose qu'on sache vers QUOI).
 *
 * Toujours `approximate: true` : c'est une quadrature numérique, pas une
 * primitive. §35 l'exige, et l'interface l'affiche « ≈ ».
 *
 * @returns {{ok: true, value: number, approximate: true} | {ok: false, reason: string}}
 */
export function definiteIntegral(fn, a, b, options = {}) {
  if (Math.abs(b - a) < 1e-15) return { ok: true, value: 0, approximate: true };
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  // Une singularité DANS l'intervalle rend l'intégrale impropre : on refuse
  // plutôt que de rendre un nombre qui ne veut rien dire.
  const breaks = findDiscontinuities(fn, low, high, { samples: 400 });
  if (breaks.some((entry) => entry.kind === 'infinite' && entry.x > low + 1e-9 && entry.x < high - 1e-9)) {
    return { ok: false, reason: 'singularity' };
  }

  const n = Math.max(2, Math.floor((options.intervals ?? 2000) / 2) * 2);
  const h = (high - low) / n;
  let total = 0;
  for (let i = 0; i <= n; i += 1) {
    const x = low + i * h;
    const y = fn(x);
    if (!finite(y)) return { ok: false, reason: 'undefined' };
    const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    total += weight * y;
  }
  const value = (total * h) / 3;
  if (!finite(value)) return { ok: false, reason: 'unstable' };

  return { ok: true, value: b < a ? -value : value, approximate: true };
}

/**
 * L'aire GÉOMÉTRIQUE (∫|f|) en face de l'intégrale SIGNÉE (§21).
 *
 * Les deux sont rendues ensemble, parce que leur DIFFÉRENCE est la leçon :
 * pour une fonction qui traverse l'axe, elles ne coïncident pas, et §21
 * interdit de faire passer l'une pour l'autre.
 */
export function signedAndGeometricArea(fn, a, b, options = {}) {
  const signed = definiteIntegral(fn, a, b, options);
  const geometric = definiteIntegral((x) => Math.abs(fn(x)), a, b, options);

  return {
    signed,
    geometric: geometric.ok ? { ...geometric, value: Math.abs(geometric.value) } : geometric,
    differ: signed.ok && geometric.ok && Math.abs(Math.abs(signed.value) - Math.abs(geometric.value)) > 1e-6 * (1 + Math.abs(signed.value)),
  };
}

/**
 * Les INTERSECTIONS de f et g sur [a, b] (§26) : les racines de f − g.
 * @returns {Array<{x: number, y: number}>}
 */
export function findIntersections(f, g, a, b, options = {}) {
  const difference = (x) => f(x) - g(x);

  return findRoots(difference, a, b, options)
    .map(({ x }) => {
      const y = f(x);

      return finite(y) ? { x, y } : null;
    })
    .filter(Boolean);
}

/**
 * L'aire ENTRE deux courbes (§23) : ∫|f − g|, plus les bornes d'intégration
 * et les intersections qui la découpent.
 */
export function areaBetween(f, g, a, b, options = {}) {
  const integral = definiteIntegral((x) => Math.abs(f(x) - g(x)), a, b, options);

  return {
    area: integral.ok ? { ...integral, value: Math.abs(integral.value) } : integral,
    crossings: findIntersections(f, g, a, b, options),
  };
}

/**
 * Une PRIMITIVE de f, construite par quadrature depuis une borne (§22) :
 * F(x) = ∫ₓ₀ˣ f(t) dt + C.
 *
 * Elle est numérique — donc `approximate`. Ce qu'elle montre est juste :
 * changer C translate F verticalement SANS changer sa pente, ce que §22
 * demande de faire voir.
 */
export function antiderivativeSampler(fn, origin, constant = 0, options = {}) {
  const cache = new Map();

  return (x) => {
    if (!finite(x)) return NaN;
    const key = Math.round(x * 1e6);
    if (cache.has(key)) return cache.get(key);
    const integral = definiteIntegral(fn, origin, x, { intervals: options.intervals ?? 200 });
    const value = integral.ok ? integral.value + constant : NaN;
    cache.set(key, value);

    return value;
  };
}

/**
 * Le DOMAINE de définition observé sur [a, b] (§16) : les morceaux où f existe.
 *
 * « Observé » est le mot juste — on ne résout pas d'inéquation, on balaye.
 * L'interface ne présente donc jamais cela comme LE domaine de f sur ℝ, mais
 * comme ce qui est défini dans la fenêtre.
 *
 * @returns {Array<{from: number, to: number}>}
 */
export function observedDomain(fn, a, b, options = {}) {
  const samples = options.samples ?? Math.min(SCAN_SAMPLES, 600);
  const { xs, ys } = scan(fn, a, b, samples);
  const pieces = [];
  let start = null;

  for (let i = 0; i < xs.length; i += 1) {
    const defined = finite(ys[i]);
    if (defined && start === null) start = xs[i];
    if (!defined && start !== null) {
      pieces.push({ from: start, to: xs[i - 1] });
      start = null;
    }
  }
  if (start !== null) pieces.push({ from: start, to: xs[xs.length - 1] });

  return pieces.filter((piece) => piece.to - piece.from > MERGE_EPSILON);
}
