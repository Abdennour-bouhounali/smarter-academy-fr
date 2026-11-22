/**
 * LA MATHÉMATIQUE du labo de trigonométrie — pure, sans React, sans pixels, sans
 * arrondi d'affichage (§39 : « Do NOT put mathematical calculations directly
 * throughout React components »).
 *
 * Tout ce que l'instrument sait de la trigonométrie est ICI, et rien d'autre
 * n'en sait quoi que ce soit : les composants appellent, ils ne calculent
 * pas. C'est la même frontière que vectorMath.js tient pour les vecteurs.
 *
 * ── Le zéro qui n'en est pas un ──────────────────────────────────────────
 * `Math.cos(Math.PI / 2)` vaut 6,12e−17, pas 0. Un instrument qui affiche
 * « cos(90°) = 0,0000000000000001 » enseigne une fausseté (§40). Toutes les
 * fonctions de ce module passent donc par `clean()`, qui ramène à 0 ce qui
 * est sous EPSILON, et à ±1 ce qui le frôle. Ce n'est pas de la cosmétique :
 * c'est ce qui permet à `tanOf(90°)` de rendre HONNÊTEMENT `null` — indéfini —
 * au lieu d'un nombre gigantesque et arbitraire (§11, §23).
 *
 * Les angles y circulent en DEGRÉS pour l'interface et en RADIANS pour le
 * calcul ; la conversion est explicite à chaque frontière, jamais implicite.
 */

/** Sous ce seuil, un flottant est un zéro : l'erreur de Math.cos(π/2) est ~1e−16. */
export const EPSILON = 1e-10;

const TAU = Math.PI * 2;

/** Ramène à 0 ce qui n'en diffère que par l'erreur machine, et à ±1 ce qui le frôle. */
export function clean(value) {
  if (!Number.isFinite(value)) return NaN;
  if (Math.abs(value) < EPSILON) return 0;
  if (Math.abs(value - 1) < EPSILON) return 1;
  if (Math.abs(value + 1) < EPSILON) return -1;

  return value;
}

// ── Conversions (§4) ──────────────────────────────────────────────────────

export function degToRad(degrees) {
  if (!Number.isFinite(degrees)) return NaN;

  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians) {
  if (!Number.isFinite(radians)) return NaN;

  return (radians * 180) / Math.PI;
}

/**
 * L'angle ÉQUIVALENT dans [0, 360[ (§15).
 *
 * `normalizeDegrees(450)` rend 90, `normalizeDegrees(−90)` rend 270 : c'est
 * la périodicité elle-même, et l'instrument s'en sert pour montrer que
 * sin(450°) = sin(90°) sans que l'élève ait à le croire sur parole (§14).
 *
 * Le `% 360` de JavaScript garde le signe du dividende (−90 % 360 = −90) :
 * le `+ 360` puis le second modulo sont ce qui rend un représentant POSITIF.
 */
export function normalizeDegrees(degrees) {
  if (!Number.isFinite(degrees)) return NaN;
  const wrapped = ((degrees % 360) + 360) % 360;

  // 359,9999999999 après un aller-retour flottant est un 0, pas un 360.
  return Math.abs(wrapped - 360) < EPSILON ? 0 : wrapped;
}

/** Le même service en radians : un représentant dans [0, 2π[. */
export function normalizeRadians(radians) {
  if (!Number.isFinite(radians)) return NaN;
  const wrapped = ((radians % TAU) + TAU) % TAU;

  return Math.abs(wrapped - TAU) < EPSILON ? 0 : wrapped;
}

/** Combien de tours complets l'angle porte-t-il ? 450° → 1, −90° → −1 (§14). */
export function turnsIn(degrees) {
  if (!Number.isFinite(degrees)) return 0;

  return Math.floor(degrees / 360);
}

// ── Les trois rapports (§3) ───────────────────────────────────────────────

export function sinOf(degrees) {
  if (!Number.isFinite(degrees)) return NaN;

  return clean(Math.sin(degToRad(normalizeDegrees(degrees))));
}

export function cosOf(degrees) {
  if (!Number.isFinite(degrees)) return NaN;

  return clean(Math.cos(degToRad(normalizeDegrees(degrees))));
}

/**
 * La tangente, ou `null` (§11, §23).
 *
 * `tan(90°)` n'est pas « très grand » : il n'existe pas. Rendre 1,633e+16
 * serait mentir, et c'est exactement ce que fait `Math.tan(Math.PI / 2)`.
 * On passe donc par le quotient sin/cos APRÈS nettoyage : quand cos vaut
 * exactement 0, le quotient n'est pas calculé, et l'appelant reçoit `null`
 * — que l'interface écrit « non définie », jamais un nombre.
 */
export function tanOf(degrees) {
  if (!Number.isFinite(degrees)) return NaN;
  const cos = cosOf(degrees);
  if (cos === 0) return null;

  return clean(sinOf(degrees) / cos);
}

/** Le point du cercle trigonométrique : `(cos θ, sin θ)` sur un rayon `r` (§3). */
export function pointAt(degrees, radius = 1) {
  return { x: clean(cosOf(degrees) * radius), y: clean(sinOf(degrees) * radius) };
}

/**
 * L'angle que porte un point — l'inverse du précédent, ce dont le GLISSEMENT
 * a besoin (§3 : « The point must be draggable continuously »).
 *
 * `atan2` rend ]−π, π] ; on normalise pour que l'élève lise 350° et non
 * −10°, et le centre (0, 0) — un point sans direction — rend `NaN`.
 */
export function angleOfPoint(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return NaN;
  if (Math.abs(x) < EPSILON && Math.abs(y) < EPSILON) return NaN;

  return normalizeDegrees(radToDeg(Math.atan2(y, x)));
}

// ── Les quadrants et les signes (§5, §20) ─────────────────────────────────

/**
 * Le quadrant, ou l'axe.
 *
 * 90° n'est pas « dans le quadrant I » ni « dans le II » : il est SUR un axe,
 * et c'est là que cos s'annule. Confondre les deux, c'est perdre le cas
 * intéressant. La fonction rend donc `{quadrant: 0, axis: 'y+'}` pour ces
 * quatre positions, et l'interface les nomme au lieu d'inventer un quadrant.
 */
export function quadrantOf(degrees) {
  if (!Number.isFinite(degrees)) return { quadrant: 0, axis: null };
  const theta = normalizeDegrees(degrees);

  if (Math.abs(theta) < EPSILON) return { quadrant: 0, axis: 'x+' };
  if (Math.abs(theta - 90) < EPSILON) return { quadrant: 0, axis: 'y+' };
  if (Math.abs(theta - 180) < EPSILON) return { quadrant: 0, axis: 'x-' };
  if (Math.abs(theta - 270) < EPSILON) return { quadrant: 0, axis: 'y-' };

  if (theta < 90) return { quadrant: 1, axis: null };
  if (theta < 180) return { quadrant: 2, axis: null };
  if (theta < 270) return { quadrant: 3, axis: null };

  return { quadrant: 4, axis: null };
}

/** Le signe d'un rapport : `1`, `−1`, `0`, ou `null` quand il n'est pas défini. */
export function signOf(value) {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  if (value === 0) return 0;

  return value > 0 ? 1 : -1;
}

/** Les trois signes à l'angle donné — la table de §20, calculée et non écrite. */
export function signsAt(degrees) {
  return {
    sin: signOf(sinOf(degrees)),
    cos: signOf(cosOf(degrees)),
    tan: signOf(tanOf(degrees)),
  };
}

/**
 * Les signes d'un quadrant ENTIER (1 à 4) : ce que la table de §20 affiche
 * ligne par ligne, indépendamment de l'angle courant. Un quadrant est un
 * ouvert, donc aucun signe n'y est jamais nul.
 */
export function quadrantSigns(quadrant) {
  const table = {
    1: { sin: 1, cos: 1, tan: 1 },
    2: { sin: 1, cos: -1, tan: -1 },
    3: { sin: -1, cos: -1, tan: 1 },
    4: { sin: -1, cos: 1, tan: -1 },
  };

  return table[quadrant] ?? null;
}

// ── Le triangle rectangle (§8, §9) — LE cœur du programme du collège ──────────

/**
 * Résout un triangle rectangle à partir de DEUX données (§9).
 *
 * C'est la trigonométrie du collège — cosinus, sinus et tangente d'un angle
 * aigu dans un triangle rectangle — et donc le cœur de cet instrument, pas
 * un supplément. L'angle y est AIGU : un triangle rectangle n'en a pas
 * d'autre, et la fonction refuse ce qui n'en est pas un.
 *
 * `given` dit ce qui est connu ; tout le reste est déduit :
 *   'angle-hyp'      θ et l'hypoténuse   → opp = h·sin θ, adj = h·cos θ
 *   'angle-opp'      θ et le côté opposé → h = opp/sin θ, adj = opp/tan θ
 *   'angle-adj'      θ et le côté adjacent
 *   'opp-adj'        les deux côtés      → θ = arctan(opp/adj)  (Pythagore pour h)
 *   'opp-hyp'        opposé et hypoténuse → θ = arcsin(opp/h)
 *   'adj-hyp'        adjacent et hypoténuse → θ = arccos(adj/h)
 *
 * @returns {{ok: true, angle, opposite, adjacent, hypotenuse, otherAngle}
 *          | {ok: false, reason: string}}
 */
export function solveRightTriangle(given, values) {
  const num = (key) => (Number.isFinite(values?.[key]) ? values[key] : NaN);
  const positive = (v) => Number.isFinite(v) && v > EPSILON;
  const acute = (a) => Number.isFinite(a) && a > EPSILON && a < 90 - EPSILON;

  let angle = NaN;
  let opposite = NaN;
  let adjacent = NaN;
  let hypotenuse = NaN;

  switch (given) {
    case 'angle-hyp': {
      angle = num('angle');
      hypotenuse = num('hypotenuse');
      if (!acute(angle)) return { ok: false, reason: 'angle' };
      if (!positive(hypotenuse)) return { ok: false, reason: 'side' };
      opposite = hypotenuse * sinOf(angle);
      adjacent = hypotenuse * cosOf(angle);
      break;
    }
    case 'angle-opp': {
      angle = num('angle');
      opposite = num('opposite');
      if (!acute(angle)) return { ok: false, reason: 'angle' };
      if (!positive(opposite)) return { ok: false, reason: 'side' };
      hypotenuse = opposite / sinOf(angle);
      adjacent = opposite / tanOf(angle);
      break;
    }
    case 'angle-adj': {
      angle = num('angle');
      adjacent = num('adjacent');
      if (!acute(angle)) return { ok: false, reason: 'angle' };
      if (!positive(adjacent)) return { ok: false, reason: 'side' };
      opposite = adjacent * tanOf(angle);
      hypotenuse = adjacent / cosOf(angle);
      break;
    }
    case 'opp-adj': {
      opposite = num('opposite');
      adjacent = num('adjacent');
      if (!positive(opposite) || !positive(adjacent)) return { ok: false, reason: 'side' };
      hypotenuse = Math.hypot(opposite, adjacent);
      angle = radToDeg(Math.atan2(opposite, adjacent));
      break;
    }
    case 'opp-hyp': {
      opposite = num('opposite');
      hypotenuse = num('hypotenuse');
      if (!positive(opposite) || !positive(hypotenuse)) return { ok: false, reason: 'side' };
      // L'hypoténuse est le PLUS GRAND côté : sans cela le triangle n'existe pas.
      if (opposite >= hypotenuse - EPSILON) return { ok: false, reason: 'hypotenuse' };
      angle = radToDeg(Math.asin(opposite / hypotenuse));
      adjacent = Math.sqrt(hypotenuse * hypotenuse - opposite * opposite);
      break;
    }
    case 'adj-hyp': {
      adjacent = num('adjacent');
      hypotenuse = num('hypotenuse');
      if (!positive(adjacent) || !positive(hypotenuse)) return { ok: false, reason: 'side' };
      if (adjacent >= hypotenuse - EPSILON) return { ok: false, reason: 'hypotenuse' };
      angle = radToDeg(Math.acos(adjacent / hypotenuse));
      opposite = Math.sqrt(hypotenuse * hypotenuse - adjacent * adjacent);
      break;
    }
    default:
      return { ok: false, reason: 'given' };
  }

  if (![angle, opposite, adjacent, hypotenuse].every(Number.isFinite)) {
    return { ok: false, reason: 'side' };
  }

  return {
    ok: true,
    angle: clean(angle),
    opposite: clean(opposite),
    adjacent: clean(adjacent),
    hypotenuse: clean(hypotenuse),
    otherAngle: clean(90 - angle),
  };
}

/**
 * Les trois rapports LUS SUR LE TRIANGLE (§10 — SOH-CAH-TOA).
 *
 * La valeur n'est pas recalculée depuis l'angle : elle est le QUOTIENT des
 * côtés que l'élève voit. C'est toute la différence entre « la machine dit
 * 0,5 » et « le côté opposé fait la moitié de l'hypoténuse ».
 */
export function ratiosFromTriangle({ opposite, adjacent, hypotenuse }) {
  const ratio = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && Math.abs(b) > EPSILON ? clean(a / b) : null);

  return {
    sin: ratio(opposite, hypotenuse),
    cos: ratio(adjacent, hypotenuse),
    tan: ratio(opposite, adjacent),
  };
}

// ── Les fonctions réciproques (§24) ───────────────────────────────────────

/**
 * arcsin, et les angles de [0, 360[ qui partagent ce sinus (§24).
 *
 * La valeur principale seule laisserait croire que sin(θ) = 0,5 n'a qu'une
 * solution. Il y en a deux par tour — c'est ce que l'instrument montre sur
 * le cercle, en dessinant les deux points.
 *
 * @returns {{principal: number, solutions: number[]} | null}
 */
export function arcsinOf(value) {
  if (!Number.isFinite(value) || value < -1 - EPSILON || value > 1 + EPSILON) return null;
  const clamped = Math.max(-1, Math.min(1, value));
  const principal = clean(radToDeg(Math.asin(clamped)));
  const solutions = uniqueAngles([normalizeDegrees(principal), normalizeDegrees(180 - principal)]);

  return { principal, solutions };
}

/** arccos : principale dans [0, 180], et son symétrique par rapport à l'axe des abscisses. */
export function arccosOf(value) {
  if (!Number.isFinite(value) || value < -1 - EPSILON || value > 1 + EPSILON) return null;
  const clamped = Math.max(-1, Math.min(1, value));
  const principal = clean(radToDeg(Math.acos(clamped)));
  const solutions = uniqueAngles([normalizeDegrees(principal), normalizeDegrees(-principal)]);

  return { principal, solutions };
}

/**
 * arctan : défini sur TOUT ℝ — c'est ce qui le distingue des deux autres
 * (§24), et la raison pour laquelle l'instrument ne borne pas son curseur.
 * Deux solutions par tour, distantes de 180°.
 */
export function arctanOf(value) {
  if (!Number.isFinite(value)) return null;
  const principal = clean(radToDeg(Math.atan(value)));
  const solutions = uniqueAngles([normalizeDegrees(principal), normalizeDegrees(principal + 180)]);

  return { principal, solutions };
}

function uniqueAngles(list) {
  const out = [];
  for (const angle of list) {
    if (!Number.isFinite(angle)) continue;
    if (!out.some((kept) => Math.abs(kept - angle) < 1e-6)) out.push(angle);
  }

  return out.sort((a, b) => a - b);
}

// ── L'identité et l'arc (§16, §17, §22) ───────────────────────────────────

/**
 * sin²θ + cos²θ (§22).
 *
 * On rend les trois nombres plutôt que le seul verdict : l'élève doit VOIR
 * les deux parts se compenser, pas lire « vrai ». `sum` vaut exactement 1
 * après nettoyage — la somme flottante dérive de ~1e−16, ce qui afficherait
 * « 0,9999999999999999 » et ruinerait l'identité qu'on veut faire découvrir.
 */
export function pythagoreanIdentity(degrees) {
  const sin = sinOf(degrees);
  const cos = cosOf(degrees);
  if (!Number.isFinite(sin) || !Number.isFinite(cos)) return null;
  const sinSquared = clean(sin * sin);
  const cosSquared = clean(cos * cos);

  return {
    sin,
    cos,
    sinSquared,
    cosSquared,
    sum: clean(sinSquared + cosSquared),
    holds: Math.abs(sinSquared + cosSquared - 1) < 1e-9,
  };
}

/**
 * La longueur d'un arc : `ℓ = r·θ` avec θ en RADIANS (§17).
 *
 * Sur le cercle unité (r = 1) la longueur EST la mesure en radians — c'est
 * la définition même du radian, et ce que §16 demande de rendre visible au
 * lieu de le réciter.
 */
export function arcLength(radius, degrees) {
  if (!Number.isFinite(radius) || radius < 0 || !Number.isFinite(degrees)) return NaN;

  return clean(radius * Math.abs(degToRad(degrees)));
}

// ── Les symétries (§21) ───────────────────────────────────────────────────

/**
 * L'angle associé par une symétrie, et ce que deviennent les trois rapports.
 *
 * Les relations ne sont pas écrites en dur : elles sont CALCULÉES à partir
 * de l'angle image. Une table de signes recopiée se démoderait au premier
 * cas oublié ; ici, `sin(π − θ) = sin θ` se lit sur les deux valeurs.
 */
export const SYMMETRIES = Object.freeze(['negate', 'supplement', 'opposite', 'complement']);

export function symmetryOf(degrees, kind) {
  if (!Number.isFinite(degrees)) return null;
  const map = {
    negate: -degrees,
    supplement: 180 - degrees,
    opposite: 180 + degrees,
    complement: 90 - degrees,
  };
  const image = map[kind];
  if (image === undefined) return null;

  return {
    kind,
    source: degrees,
    image: normalizeDegrees(image),
    values: { sin: sinOf(image), cos: cosOf(image), tan: tanOf(image) },
    origin: { sin: sinOf(degrees), cos: cosOf(degrees), tan: tanOf(degrees) },
  };
}

// ── Tout ce que l'interface lit à un angle donné ──────────────────────────

/**
 * L'état mathématique COMPLET d'un angle (§31) : le seul appel dont
 * l'inspecteur a besoin, mémoïsable en un point. Tout ce que l'interface
 * affiche en sort — elle n'en dérive rien elle-même.
 */
export function stateAt(degrees, radius = 1) {
  const normalized = normalizeDegrees(degrees);

  return {
    degrees,
    normalized,
    radians: degToRad(degrees),
    normalizedRadians: normalizeRadians(degToRad(degrees)),
    turns: turnsIn(degrees),
    isNormalized: Math.abs(normalized - degrees) < EPSILON,
    point: pointAt(degrees, radius),
    unitPoint: pointAt(degrees, 1),
    sin: sinOf(degrees),
    cos: cosOf(degrees),
    tan: tanOf(degrees),
    ...quadrantOf(degrees),
    signs: signsAt(degrees),
    identity: pythagoreanIdentity(degrees),
    arc: arcLength(radius, degrees),
  };
}
