/**
 * LA MATHÉMATIQUE des المقاطع المخروطية — logique PURE : pas de React, pas de
 * DOM, pas de pixels. Tout ce que le laboratoire affiche se calcule ICI et
 * nulle part ailleurs — la règle de tout le مختبر (rational.js pour l'algèbre,
 * vectorMath.js pour les أشعة, transformMath.js pour les تحويلات).
 *
 * Le vocabulaire est celui des manuels algériens :
 *
 *     الدائرة = cercle             القطع المكافئ = parabole
 *     القطع الناقص = ellipse        القطع الزائد = hyperbole
 *     المركز = centre               نصف القطر = rayon
 *     البؤرة = foyer                الدليل = directrice
 *     الرأس = sommet                المقارب = asymptote
 *
 * ── Une conique est une FORME CANONIQUE, pas une équation générale ───────
 * V1 travaille sur les quatre formes du programme, chacune décrite par ses
 * PARAMÈTRES GÉOMÉTRIQUES et non par les six coefficients de
 * `Ax² + Bxy + Cy² + Dx + Ey + F = 0` :
 *
 *     circle     {h, k, r}                 (x−h)² + (y−k)² = r²
 *     parabola   {h, k, a, orientation}    y = a(x−h)² + k   |   x = a(y−k)² + h
 *     ellipse    {h, k, a, b}              (x−h)²/a² + (y−k)²/b² = 1
 *     hyperbola  {h, k, a, b, orientation} (x−h)²/a² − (y−k)²/b² = 1   (ou l'inverse)
 *
 * C'est un CHOIX, et c'est celui qui rend le laboratoire possible : un élève
 * qui tire le centre modifie `h` et `k`, pas `D` et `E`. La forme développée
 * existe — `expandCircle`, `toGeneral` — mais comme une LECTURE de la forme
 * canonique, jamais comme la source de vérité. Le sens inverse (développée →
 * canonique) est fait par `parseConicEquation` (conicParser.js), et seulement
 * là où il est exact (§30 : « ne jamais simuler une simplification formelle »).
 *
 * L'axe de rotation (terme en `xy`) n'existe pas en V1 : il est hors
 * programme (§57) et l'admettre demanderait la diagonalisation d'une
 * quadratique. `rotateConic` le dit honnêtement en rendant `null`.
 *
 * Aucune fonction n'arrondit : l'arrondi est un fait d'AFFICHAGE, fait au
 * dernier moment par grapherFormat.formatValue.
 */

/** En deçà, deux flottants issus d'un glissement sont « le même ». */
export const EPSILON = 1e-9;

/**
 * La tolérance RELATIVE des jugements géométriques — « P est sur la courbe »,
 * « la droite est tangente ».
 *
 * Elle est relative à la TAILLE de l'objet : à 1e-9 près, aucun point posé au
 * doigt ne serait jamais « sur » un cercle de rayon 5, et l'élève verrait le
 * laboratoire lui mentir. C'est la même décision que `relativeTolerance` du
 * مختبر الأشعة.
 */
const GEOMETRIC_TOLERANCE = 1e-6;

/** Les quatre familles de V1. */
export const CONIC_KINDS = Object.freeze(['circle', 'parabola', 'ellipse', 'hyperbola']);

const finite = Number.isFinite;
const { abs, sqrt, min, max, hypot, PI } = Math;

export function isPoint(p) {
  return Boolean(p) && finite(p.x) && finite(p.y);
}

/**
 * `0.30000000000000004` → `0.3`, et `-0` → `0`.
 *
 * Douze chiffres significatifs : assez pour ne jamais perdre une valeur que
 * l'élève a saisie, assez peu pour effacer le bruit d'un `cos(90°)` ou d'une
 * division. §52 : ne jamais afficher un bruit de virgule flottante.
 */
export function cleanNumber(value) {
  if (!finite(value)) return value;
  const rounded = Number(value.toPrecision(12));

  return Object.is(rounded, -0) ? 0 : rounded;
}

export function cleanPoint(p) {
  return isPoint(p) ? { x: cleanNumber(p.x), y: cleanNumber(p.y) } : null;
}

/** Deux nombres « égaux » à la tolérance relative de leur grandeur. */
export function nearlyEqual(a, b, tolerance = GEOMETRIC_TOLERANCE) {
  if (!finite(a) || !finite(b)) return false;
  const scale = max(1, abs(a), abs(b));

  return abs(a - b) <= tolerance * scale;
}

export function distance(p, q) {
  if (!isPoint(p) || !isPoint(q)) return NaN;

  return hypot(q.x - p.x, q.y - p.y);
}

// ── La conique : lecture, validité ───────────────────────────────────────

/**
 * Une conique est-elle MATHÉMATIQUEMENT vivante ?
 *
 * Un cercle de rayon 0 est un point, une ellipse de demi-axe 0 est un
 * segment, une parabole de coefficient 0 est une droite : ce sont des cas
 * DÉGÉNÉRÉS (§52). Ils ne font pas planter le laboratoire — ils sont
 * refusés ici, et l'interface le dit en arabe plutôt que de dessiner un
 * objet qui n'existe pas.
 */
export function isValidConic(conic) {
  if (!conic || !CONIC_KINDS.includes(conic.kind)) return false;
  if (!finite(conic.h) || !finite(conic.k)) return false;
  switch (conic.kind) {
    case 'circle':
      return finite(conic.r) && conic.r > EPSILON;
    case 'parabola':
      return finite(conic.a) && abs(conic.a) > EPSILON;
    case 'ellipse':
    case 'hyperbola':
      return finite(conic.a) && finite(conic.b) && conic.a > EPSILON && conic.b > EPSILON;
    default:
      return false;
  }
}

/**
 * POURQUOI une conique est dégénérée — la clé i18n du message, ou `null`.
 *
 * Le laboratoire ne dit jamais « erreur » : il dit ce qui manque, en
 * mathématiques (§51). « نصف القطر يجب أن يكون موجبًا » enseigne ;
 * « invalid conic » n'enseigne rien.
 */
export function degeneracyOf(conic) {
  if (!conic || !CONIC_KINDS.includes(conic.kind)) return 'unknown';
  if (!finite(conic.h) || !finite(conic.k)) return 'center';
  switch (conic.kind) {
    case 'circle':
      return finite(conic.r) && conic.r > EPSILON ? null : 'radius';
    case 'parabola':
      return finite(conic.a) && abs(conic.a) > EPSILON ? null : 'coefficient';
    case 'ellipse':
    case 'hyperbola':
      if (!finite(conic.a) || !finite(conic.b)) return 'axes';

      return conic.a > EPSILON && conic.b > EPSILON ? null : 'axes';
    default:
      return 'unknown';
  }
}

/** L'orientation, normalisée : les familles qui n'en ont pas rendent `horizontal`. */
export function orientationOf(conic) {
  if (conic?.kind === 'parabola' || conic?.kind === 'hyperbola') {
    return conic.orientation === 'vertical' ? 'vertical' : 'horizontal';
  }

  return 'horizontal';
}

// ── LE CERCLE (§8, §9) ───────────────────────────────────────────────────

/**
 * Les mesures du cercle : `d = 2r`, `C = 2πr`, `A = πr²`.
 *
 * Elles sont rendues ENSEMBLE parce que l'expérience de §9 est précisément
 * de les voir bouger ensemble : quand `r` double, `C` double et `A`
 * quadruple. Le laboratoire ne le dit pas — il le montre, et §9 laisse
 * l'élève le constater.
 */
export function circleMeasures(conic) {
  if (!isValidConic(conic) || conic.kind !== 'circle') return null;
  const r = conic.r;

  return {
    radius: r,
    diameter: 2 * r,
    circumference: 2 * PI * r,
    area: PI * r * r,
  };
}

/**
 * Où se trouve P par rapport à la conique : `'inside' | 'on' | 'outside'`.
 *
 * C'est §10 et §32 — et c'est la LECTURE GÉOMÉTRIQUE de l'équation : pour un
 * cercle, comparer `PC` à `r`, c'est exactement comparer `(x−h)²+(y−k)²` à
 * `r²`. L'« intérieur » d'une hyperbole est la région qui contient les
 * foyers ; celui d'une parabole, la région vers laquelle elle s'ouvre.
 */
export function pointPosition(conic, point) {
  if (!isValidConic(conic) || !isPoint(point)) return null;
  const value = substitute(conic, point);
  if (!finite(value)) return null;
  // `substitute` rend une quantité NULLE sur la courbe, négative « dedans ».
  if (abs(value) <= GEOMETRIC_TOLERANCE * substitutionScale(conic)) return 'on';

  return value < 0 ? 'inside' : 'outside';
}

/**
 * La quantité substituée : `0` sur la courbe, `< 0` dedans, `> 0` dehors.
 *
 * C'est le CALCUL que §32 demande de montrer à l'élève — « remplace P dans
 * l'équation » — et c'est aussi ce dont `pointPosition` a besoin. Une seule
 * fonction pour les deux : l'affichage et le jugement ne peuvent pas diverger.
 */
export function substitute(conic, point) {
  if (!isValidConic(conic) || !isPoint(point)) return NaN;
  const dx = point.x - conic.h;
  const dy = point.y - conic.k;
  switch (conic.kind) {
    case 'circle':
      return dx * dx + dy * dy - conic.r * conic.r;
    case 'ellipse':
      return (dx * dx) / (conic.a * conic.a) + (dy * dy) / (conic.b * conic.b) - 1;
    case 'hyperbola':
      return orientationOf(conic) === 'horizontal'
        ? (dx * dx) / (conic.a * conic.a) - (dy * dy) / (conic.b * conic.b) - 1
        : (dy * dy) / (conic.a * conic.a) - (dx * dx) / (conic.b * conic.b) - 1;
    case 'parabola': {
      // y = a(x−h)² + k  →  a(x−h)² − (y−k) : négatif « au-dessus » quand a > 0,
      // c'est-à-dire du côté où la parabole s'ouvre, comme pour les autres.
      const signed = orientationOf(conic) === 'horizontal'
        ? conic.a * dx * dx - dy
        : conic.a * dy * dy - dx;

      return conic.a > 0 ? signed : -signed;
    }
    default:
      return NaN;
  }
}

/** L'échelle de `substitute` — ce à quoi comparer, pour une tolérance honnête. */
function substitutionScale(conic) {
  switch (conic.kind) {
    case 'circle':
      return max(1, conic.r * conic.r);
    case 'parabola':
      return max(1, abs(conic.a));
    default:
      return 1;
  }
}

// ── LA PARABOLE (§11, §12, §13, §14) ─────────────────────────────────────

/**
 * Le FOYER et la DIRECTRICE d'une parabole.
 *
 *     y = a(x−h)² + k     →  p = 1/(4a),  F = (h, k + p),  directrice : y = k − p
 *
 * `p` est la distance focale SIGNÉE : son signe dit de quel côté la parabole
 * s'ouvre, et c'est ce qui fait que la même formule vaut pour `a < 0` sans
 * un seul `if`. La propriété de §14 — « équidistant du foyer et de la
 * directrice » — est alors une conséquence, pas une décoration : c'est
 * `focalCheck` qui la mesure.
 */
export function parabolaFeatures(conic) {
  if (!isValidConic(conic) || conic.kind !== 'parabola') return null;
  const p = 1 / (4 * conic.a);
  const vertical = orientationOf(conic) === 'vertical';
  const focus = vertical
    ? { x: conic.h + p, y: conic.k }
    : { x: conic.h, y: conic.k + p };
  const directrix = vertical
    ? { kind: 'vertical', value: conic.h - p }
    : { kind: 'horizontal', value: conic.k - p };

  return {
    vertex: { x: conic.h, y: conic.k },
    focus,
    directrix,
    focalDistance: abs(p),
    // L'axe de symétrie : x = h (parabole verticale au sens scolaire), ou y = k.
    axis: vertical ? { kind: 'horizontal', value: conic.k } : { kind: 'vertical', value: conic.h },
    /**
     * Le sens d'ouverture, en mots — parce que « a > 0 » ne dit rien à un
     * élève tant qu'il ne l'a pas relié à « vers le haut ».
     */
    opening: vertical
      ? (conic.a > 0 ? 'right' : 'left')
      : (conic.a > 0 ? 'up' : 'down'),
    /** Le LATUS RECTUM : la largeur de la parabole à hauteur du foyer. */
    latusRectum: abs(1 / conic.a),
  };
}

/**
 * La VÉRIFICATION de la propriété focale, MESURÉE sur le point que l'élève a
 * choisi (§14, §28).
 *
 * On ne récite pas le théorème : on rend les deux distances et leur écart.
 * L'interface affiche les deux nombres, l'élève constate qu'ils sont égaux —
 * et le fait qu'ils le restent quand il déplace P est la découverte.
 */
export function parabolaFocalCheck(conic, point) {
  const features = parabolaFeatures(conic);
  if (!features || !isPoint(point)) return null;
  const toFocus = distance(point, features.focus);
  const toDirectrix = features.directrix.kind === 'horizontal'
    ? abs(point.y - features.directrix.value)
    : abs(point.x - features.directrix.value);

  return {
    toFocus,
    toDirectrix,
    difference: toFocus - toDirectrix,
    equal: nearlyEqual(toFocus, toDirectrix, 1e-6),
  };
}

// ── L'ELLIPSE (§15, §16, §17) ────────────────────────────────────────────

/**
 * Les éléments de l'ellipse.
 *
 * `a` et `b` sont les demi-axes en x et en y — PAS « le grand » et « le
 * petit ». C'est un choix délibéré : si `a` était toujours le grand axe,
 * alors tirer `b` au-delà de `a` ferait SAUTER les deux étiquettes et les
 * foyers d'un axe à l'autre, et l'élève de §17 qui pousse `b` vers `a` pour
 * voir l'ellipse devenir un cercle verrait un clignotement au lieu d'une
 * transition continue. Le grand axe est donc DÉDUIT (`major`), et c'est lui
 * qui décide de l'axe focal.
 *
 *     c² = |a² − b²|,  e = c / max(a,b),  et e = 0 ⟺ cercle.
 */
export function ellipseFeatures(conic) {
  if (!isValidConic(conic) || conic.kind !== 'ellipse') return null;
  const { h, k, a, b } = conic;
  const horizontal = a >= b;
  const semiMajor = max(a, b);
  const semiMinor = min(a, b);
  const c = sqrt(max(0, semiMajor * semiMajor - semiMinor * semiMinor));
  const center = { x: h, y: k };
  const foci = horizontal
    ? [{ x: h - c, y: k }, { x: h + c, y: k }]
    : [{ x: h, y: k - c }, { x: h, y: k + c }];

  return {
    center,
    semiMajor,
    semiMinor,
    c,
    /** L'excentricité : 0 pour un cercle, → 1 pour une ellipse très allongée. */
    eccentricity: semiMajor > EPSILON ? c / semiMajor : 0,
    majorAxis: horizontal ? 'horizontal' : 'vertical',
    /** Les SOMMETS : les extrémités du grand axe. */
    vertices: horizontal
      ? [{ x: h - a, y: k }, { x: h + a, y: k }]
      : [{ x: h, y: k - b }, { x: h, y: k + b }],
    /** Les CO-SOMMETS : les extrémités du petit axe. */
    coVertices: horizontal
      ? [{ x: h, y: k - b }, { x: h, y: k + b }]
      : [{ x: h - a, y: k }, { x: h + a, y: k }],
    foci,
    /** La constante de §16 : la somme des distances aux foyers. */
    focalSum: 2 * semiMajor,
    /** Un cercle est une ellipse dont les deux demi-axes sont égaux. */
    isCircle: nearlyEqual(a, b),
    area: PI * a * b,
  };
}

/**
 * §16 : `PF₁ + PF₂`, MESURÉ sur le point de l'élève.
 *
 * La somme est rendue avec la constante attendue (`2a`) et leur écart — pour
 * que l'interface puisse montrer que l'égalité tient, et de combien elle
 * s'écarte quand P n'est pas exactement sur la courbe.
 */
export function ellipseFocalCheck(conic, point) {
  const features = ellipseFeatures(conic);
  if (!features || !isPoint(point)) return null;
  const d1 = distance(point, features.foci[0]);
  const d2 = distance(point, features.foci[1]);
  const sum = d1 + d2;

  return {
    d1,
    d2,
    sum,
    constant: features.focalSum,
    difference: sum - features.focalSum,
    equal: nearlyEqual(sum, features.focalSum, 1e-6),
  };
}

// ── L'HYPERBOLE (§18, §19, §20) ──────────────────────────────────────────

/**
 * Les éléments de l'hyperbole, y compris ses ASYMPTOTES (§20).
 *
 *     (x−h)²/a² − (y−k)²/b² = 1   →  c² = a² + b²,  asymptotes : y − k = ±(b/a)(x − h)
 *
 * Contrairement à l'ellipse, `a` est ici toujours le demi-axe TRANSVERSE
 * (celui qui porte les sommets) : c'est l'orientation, pas la comparaison de
 * `a` et `b`, qui décide de l'axe — et cela ne peut donc pas sauter.
 */
export function hyperbolaFeatures(conic) {
  if (!isValidConic(conic) || conic.kind !== 'hyperbola') return null;
  const { h, k, a, b } = conic;
  const horizontal = orientationOf(conic) === 'horizontal';
  const c = hypot(a, b);
  const center = { x: h, y: k };

  return {
    center,
    a,
    b,
    c,
    eccentricity: a > EPSILON ? c / a : Infinity,
    transverse: horizontal ? 'horizontal' : 'vertical',
    vertices: horizontal
      ? [{ x: h - a, y: k }, { x: h + a, y: k }]
      : [{ x: h, y: k - a }, { x: h, y: k + a }],
    foci: horizontal
      ? [{ x: h - c, y: k }, { x: h + c, y: k }]
      : [{ x: h, y: k - c }, { x: h, y: k + c }],
    /**
     * Les deux asymptotes, comme DROITES `y = mx + p` — la forme que le reste
     * du laboratoire sait déjà intersecter et dessiner (§25, §26).
     * Pour une hyperbole verticale la pente est a/b, pour une horizontale b/a.
     */
    asymptotes: horizontal
      ? [lineThrough(center, b / a), lineThrough(center, -b / a)]
      : [lineThrough(center, a / b), lineThrough(center, -a / b)],
    /** La constante de §19 : la différence des distances aux foyers. */
    focalDifference: 2 * a,
  };
}

/** La droite de pente `m` passant par `p`, en forme `y = mx + p`. */
function lineThrough(point, slope) {
  return { slope, intercept: point.y - slope * point.x, vertical: false };
}

/** §19 : `|PF₁ − PF₂|`, MESURÉ sur le point de l'élève. */
export function hyperbolaFocalCheck(conic, point) {
  const features = hyperbolaFeatures(conic);
  if (!features || !isPoint(point)) return null;
  const d1 = distance(point, features.foci[0]);
  const d2 = distance(point, features.foci[1]);
  const gap = abs(d1 - d2);

  return {
    d1,
    d2,
    difference: gap,
    constant: features.focalDifference,
    equal: nearlyEqual(gap, features.focalDifference, 1e-6),
  };
}

// ── L'EXTRACTION UNIFIÉE (§31) ───────────────────────────────────────────

/**
 * TOUS les éléments remarquables d'une conique, quelle que soit sa famille.
 *
 * C'est l'unique porte d'entrée de l'interface : le panneau, le dessin et le
 * tableau comparatif de §21 lisent cet objet et rien d'autre. Ajouter une
 * famille en V2 (la conique tournée, par exemple) ne demandera donc aucun
 * `if` de plus dans les composants.
 *
 * @returns {{kind: string, center: ?object, foci: object[], vertices: object[], …} | null}
 */
export function conicFeatures(conic) {
  if (!isValidConic(conic)) return null;
  switch (conic.kind) {
    case 'circle': {
      const center = { x: conic.h, y: conic.k };

      return {
        kind: 'circle',
        center,
        foci: [center], // le foyer d'un cercle EST son centre — e = 0.
        vertices: [
          { x: conic.h - conic.r, y: conic.k }, { x: conic.h + conic.r, y: conic.k },
          { x: conic.h, y: conic.k - conic.r }, { x: conic.h, y: conic.k + conic.r },
        ],
        eccentricity: 0,
        asymptotes: [],
        directrix: null,
        measures: circleMeasures(conic),
        /** La SYMÉTRIE, pour le tableau de §21 — un cercle en a une infinité. */
        symmetry: 'infinite',
      };
    }
    case 'parabola': {
      const f = parabolaFeatures(conic);

      return {
        kind: 'parabola',
        center: null,
        vertex: f.vertex,
        foci: [f.focus],
        vertices: [f.vertex],
        eccentricity: 1,
        asymptotes: [],
        directrix: f.directrix,
        axis: f.axis,
        opening: f.opening,
        latusRectum: f.latusRectum,
        focalDistance: f.focalDistance,
        symmetry: 'axis',
      };
    }
    case 'ellipse': {
      const f = ellipseFeatures(conic);

      return {
        kind: 'ellipse',
        center: f.center,
        foci: f.foci,
        vertices: f.vertices,
        coVertices: f.coVertices,
        eccentricity: f.eccentricity,
        asymptotes: [],
        directrix: null,
        semiMajor: f.semiMajor,
        semiMinor: f.semiMinor,
        c: f.c,
        focalSum: f.focalSum,
        majorAxis: f.majorAxis,
        isCircle: f.isCircle,
        area: f.area,
        symmetry: 'two-axes',
      };
    }
    case 'hyperbola': {
      const f = hyperbolaFeatures(conic);

      return {
        kind: 'hyperbola',
        center: f.center,
        foci: f.foci,
        vertices: f.vertices,
        eccentricity: f.eccentricity,
        asymptotes: f.asymptotes,
        directrix: null,
        c: f.c,
        focalDifference: f.focalDifference,
        transverse: f.transverse,
        symmetry: 'two-axes',
      };
    }
    default:
      return null;
  }
}

/**
 * La vérification de la propriété focale DE LA FAMILLE — §28, une seule porte.
 *
 * @returns {{property: string, values: number[], constant: ?number, equal: boolean} | null}
 */
export function focalCheck(conic, point) {
  if (!isValidConic(conic) || !isPoint(point)) return null;
  switch (conic.kind) {
    case 'parabola': {
      const c = parabolaFocalCheck(conic, point);

      return c && {
        property: 'equidistant', values: [c.toFocus, c.toDirectrix], constant: null, equal: c.equal, ...c,
      };
    }
    case 'ellipse': {
      const c = ellipseFocalCheck(conic, point);

      return c && {
        property: 'sum', values: [c.d1, c.d2], constant: c.constant, equal: c.equal, ...c,
      };
    }
    case 'hyperbola': {
      const c = hyperbolaFocalCheck(conic, point);

      return c && {
        property: 'difference', values: [c.d1, c.d2], constant: c.constant, equal: c.equal, ...c,
      };
    }
    case 'circle': {
      // La propriété du cercle : la distance au centre est CONSTANTE (§10).
      const d = distance(point, { x: conic.h, y: conic.k });

      return {
        property: 'constant',
        values: [d],
        constant: conic.r,
        d1: d,
        difference: d - conic.r,
        equal: nearlyEqual(d, conic.r, 1e-6),
      };
    }
    default:
      return null;
  }
}

// ── LE PARAMÉTRAGE : dessiner, et contraindre un point sur la courbe (§34) ──

/**
 * Le point de PARAMÈTRE `t` sur la conique.
 *
 * Chaque famille a son paramétrage naturel, et c'est lui qui rend §34 (le
 * mode trace) possible sans résoudre une équation à chaque image : un point
 * contraint à la courbe n'est pas « le point le plus proche recalculé », c'est
 * une VALEUR DE `t`, et glisser le point ne fait que changer `t`.
 *
 *   circle     (h + r·cos t,  k + r·sin t)            t ∈ [0, 2π)
 *   ellipse    (h + a·cos t,  k + b·sin t)            t ∈ [0, 2π)
 *   parabola   (h + t,  k + a·t²)                     t ∈ ℝ
 *   hyperbola  (h ± a·cosh t,  k + b·sinh t)          t ∈ ℝ, branche ±
 *
 * @param {number} t
 * @param {number} branch  −1 ou +1, pour l'hyperbole seulement
 */
export function pointAt(conic, t, branch = 1) {
  if (!isValidConic(conic) || !finite(t)) return null;
  const { h, k } = conic;
  switch (conic.kind) {
    case 'circle':
      return cleanPoint({ x: h + conic.r * Math.cos(t), y: k + conic.r * Math.sin(t) });
    case 'ellipse':
      return cleanPoint({ x: h + conic.a * Math.cos(t), y: k + conic.b * Math.sin(t) });
    case 'parabola':
      return orientationOf(conic) === 'vertical'
        ? cleanPoint({ x: h + conic.a * t * t, y: k + t })
        : cleanPoint({ x: h + t, y: k + conic.a * t * t });
    case 'hyperbola': {
      const side = branch < 0 ? -1 : 1;
      const ch = Math.cosh(t);
      const sh = Math.sinh(t);

      return orientationOf(conic) === 'horizontal'
        ? cleanPoint({ x: h + side * conic.a * ch, y: k + conic.b * sh })
        : cleanPoint({ x: h + conic.b * sh, y: k + side * conic.a * ch });
    }
    default:
      return null;
  }
}

/**
 * Le paramètre `t` du point de la courbe le PLUS PROCHE de `point`.
 *
 * C'est ce qui contraint un point à la conique quand l'élève le traîne
 * (§34) : le doigt part n'importe où, la fonction rend le `t` correspondant,
 * et `pointAt` le ramène sur la courbe. Exact pour le cercle, l'ellipse (au
 * paramètre près, pas au pied de perpendiculaire près) et l'hyperbole ;
 * exact aussi pour la parabole, dont le paramétrage est simplement `x`.
 *
 * Pour l'ellipse, `atan2(y/b, x/a)` n'est PAS l'angle du pied de la
 * perpendiculaire — mais c'est un paramétrage continu et monotone autour de
 * la courbe, et c'est tout ce dont un glissement a besoin : le point suit le
 * doigt sans jamais sauter, ce qu'un vrai « point le plus proche » (racine
 * d'un polynôme de degré 4) ferait aux quatre sommets.
 */
export function parameterNear(conic, point) {
  if (!isValidConic(conic) || !isPoint(point)) return null;
  const dx = point.x - conic.h;
  const dy = point.y - conic.k;
  switch (conic.kind) {
    case 'circle':
      return Math.atan2(dy, dx);
    case 'ellipse':
      return Math.atan2(dy / conic.b, dx / conic.a);
    case 'parabola':
      return orientationOf(conic) === 'vertical' ? dy : dx;
    case 'hyperbola': {
      const horizontal = orientationOf(conic) === 'horizontal';
      const along = horizontal ? dx : dy; // le long de l'axe transverse
      const across = horizontal ? dy : dx;
      const branch = along < 0 ? -1 : 1;
      // sinh t = across / b  →  t = asinh(across / b)
      const t = Math.asinh(across / conic.b);

      return { t, branch };
    }
    default:
      return null;
  }
}

// ── LE TRACÉ : la conique comme polylignes (§4, §53) ─────────────────────

/**
 * La conique découpée en POLYLIGNES prêtes à dessiner, bornées à la fenêtre.
 *
 * Rendre des polylignes — et non un `<path>` de courbes de Bézier — est ce
 * qui permet au même code de servir le tracé ET les intersections
 * numériques ET l'aperçu de « أعمالي ». Une hyperbole rend DEUX polylignes
 * (ses deux branches) : les relier serait dessiner un trait qui n'existe pas.
 *
 * L'échantillonnage suit la RÉSOLUTION demandée, pas une constante : au
 * zoom, un cercle de 64 segments devient un polygone visible.
 *
 * @returns {Array<Array<{x: number, y: number}>>}
 */
export function conicPolylines(conic, viewport, resolution = 240) {
  if (!isValidConic(conic)) return [];
  const steps = max(24, min(2000, Math.round(resolution)));
  switch (conic.kind) {
    case 'circle':
    case 'ellipse': {
      const points = [];
      for (let i = 0; i <= steps; i += 1) {
        points.push(pointAt(conic, (i / steps) * 2 * PI));
      }

      return [points.filter(Boolean)];
    }
    case 'parabola': {
      const range = visibleParabolaRange(conic, viewport);
      if (!range) return [];
      const points = [];
      for (let i = 0; i <= steps; i += 1) {
        points.push(pointAt(conic, range.min + ((range.max - range.min) * i) / steps));
      }

      return [points.filter(Boolean)];
    }
    case 'hyperbola': {
      const tMax = hyperbolaParameterBound(conic, viewport);
      const branches = [];
      for (const branch of [1, -1]) {
        const points = [];
        for (let i = 0; i <= steps; i += 1) {
          points.push(pointAt(conic, -tMax + ((2 * tMax) * i) / steps, branch));
        }
        branches.push(points.filter(Boolean));
      }

      return branches;
    }
    default:
      return [];
  }
}

/**
 * L'intervalle de `t` d'une parabole qui couvre la fenêtre, un peu au-delà.
 *
 * Sans cela, une parabole très ouverte serait tracée sur un domaine fixe et
 * s'arrêterait NET au milieu de l'écran — un trait qui s'interrompt sans
 * raison mathématique.
 */
function visibleParabolaRange(conic, viewport) {
  const vertical = orientationOf(conic) === 'vertical';
  if (!viewport) return { min: -20, max: 20 };
  // Le paramètre est x − h (parabole « y = … ») ou y − k (parabole « x = … »).
  const lo = vertical ? viewport.yMin - conic.k : viewport.xMin - conic.h;
  const hi = vertical ? viewport.yMax - conic.k : viewport.xMax - conic.h;
  const pad = (hi - lo) * 0.05;

  return { min: lo - pad, max: hi + pad };
}

/** Le `t` au-delà duquel une branche d'hyperbole est hors de la fenêtre. */
function hyperbolaParameterBound(conic, viewport) {
  if (!viewport) return 3;
  const horizontal = orientationOf(conic) === 'horizontal';
  const acrossSpan = horizontal
    ? max(abs(viewport.yMax - conic.k), abs(viewport.yMin - conic.k))
    : max(abs(viewport.xMax - conic.h), abs(viewport.xMin - conic.h));
  const alongSpan = horizontal
    ? max(abs(viewport.xMax - conic.h), abs(viewport.xMin - conic.h))
    : max(abs(viewport.yMax - conic.k), abs(viewport.yMin - conic.k));
  // On prend le plus contraignant des deux axes, borné : cosh explose vite.
  const byAcross = Math.asinh(acrossSpan / max(EPSILON, conic.b));
  const byAlong = Math.acosh(max(1, alongSpan / max(EPSILON, conic.a)));

  return min(6, max(0.5, max(byAcross, byAlong) * 1.05));
}

// ── LES TRANSFORMATIONS (§22) ────────────────────────────────────────────

/**
 * §22 — TRANSLATER une conique de `(dx, dy)`.
 *
 * C'est la connexion explicite avec le مختبر التحويلات : translater
 * `x² + y² = r²` de `(h, k)` DONNE `(x−h)² + (y−k)² = r²`, et ici cela se
 * voit dans le code — la translation n'agit que sur `h` et `k`. Un élève qui
 * a compris ceci a compris pourquoi la forme canonique s'écrit avec des
 * « moins ».
 */
export function translateConic(conic, dx, dy) {
  if (!isValidConic(conic) || !finite(dx) || !finite(dy)) return null;

  return { ...conic, h: cleanNumber(conic.h + dx), k: cleanNumber(conic.k + dy) };
}

/**
 * §22 — RÉFLÉCHIR une conique sur un axe du repère ou sur l'origine.
 *
 * Les familles de V1 sont toutes symétriques par rapport à leurs propres
 * axes, donc une réflexion ne change que le CENTRE — sauf pour la parabole,
 * dont elle retourne aussi le coefficient quand le miroir est perpendiculaire
 * à son axe.
 */
export function reflectConic(conic, axis) {
  if (!isValidConic(conic)) return null;
  const vertical = orientationOf(conic) === 'vertical';
  switch (axis) {
    case 'xAxis': {
      const flipped = conic.kind === 'parabola' && !vertical ? -conic.a : conic.a;

      return { ...conic, k: cleanNumber(-conic.k), a: conic.kind === 'circle' ? conic.a : flipped };
    }
    case 'yAxis': {
      const flipped = conic.kind === 'parabola' && vertical ? -conic.a : conic.a;

      return { ...conic, h: cleanNumber(-conic.h), a: conic.kind === 'circle' ? conic.a : flipped };
    }
    case 'origin': {
      const flipped = conic.kind === 'parabola' ? -conic.a : conic.a;

      return {
        ...conic, h: cleanNumber(-conic.h), k: cleanNumber(-conic.k), a: conic.kind === 'circle' ? conic.a : flipped,
      };
    }
    default:
      return null;
  }
}

/**
 * §22 — la ROTATION d'un quart de tour, et seulement celle-là.
 *
 * Un quart de tour ÉCHANGE les rôles des deux axes : une conique de V1 reste
 * donc une conique de V1, en changeant d'orientation. Une rotation d'un angle
 * quelconque produirait un terme en `xy` que la forme canonique ne sait pas
 * porter — et plutôt que de dessiner approximativement une conique tournée,
 * `rotateConic` rend `null` pour tout autre angle. §51 : ne jamais simuler.
 *
 * @param {number} quarterTurns  un entier : le nombre de quarts de tour (+ = sens direct)
 */
export function rotateConic(conic, quarterTurns) {
  if (!isValidConic(conic) || !Number.isInteger(quarterTurns)) return null;
  const turns = ((quarterTurns % 4) + 4) % 4;
  let current = conic;
  for (let i = 0; i < turns; i += 1) {
    current = quarterTurn(current);
    if (!current) return null;
  }

  return current;
}

/** Un quart de tour direct autour de l'origine : `(x, y) ↦ (−y, x)`. */
function quarterTurn(conic) {
  const h = cleanNumber(-conic.k);
  const k = cleanNumber(conic.h);
  switch (conic.kind) {
    case 'circle':
      return { ...conic, h, k };
    case 'ellipse':
      // Les demi-axes en x et en y s'échangent.
      return { ...conic, h, k, a: conic.b, b: conic.a };
    case 'hyperbola':
      return {
        ...conic, h, k, orientation: orientationOf(conic) === 'horizontal' ? 'vertical' : 'horizontal',
      };
    case 'parabola': {
      const vertical = orientationOf(conic) === 'vertical';

      // y = a(x−h)²  ↦  x = −a(y−k)²  : l'orientation bascule, le signe aussi.
      return {
        ...conic, h, k, orientation: vertical ? 'horizontal' : 'vertical', a: vertical ? conic.a : -conic.a,
      };
    }
    default:
      return null;
  }
}

// ── LA FORME DÉVELOPPÉE (§30) ────────────────────────────────────────────

/**
 * La conique en forme GÉNÉRALE `Ax² + Cy² + Dx + Ey + F = 0` (B = 0 en V1).
 *
 * C'est la LECTURE développée de la forme canonique — le sens que l'on sait
 * faire exactement. Le sens inverse appartient à `conicParser.js`, et n'est
 * proposé que là où il est exact.
 */
export function toGeneral(conic) {
  if (!isValidConic(conic)) return null;
  const { h, k } = conic;
  switch (conic.kind) {
    case 'circle':
      // (x−h)² + (y−k)² − r² = 0
      return general(1, 1, -2 * h, -2 * k, h * h + k * k - conic.r * conic.r);
    case 'ellipse': {
      // b²(x−h)² + a²(y−k)² − a²b² = 0
      const A = conic.b * conic.b;
      const C = conic.a * conic.a;

      return general(A, C, -2 * A * h, -2 * C * k, A * h * h + C * k * k - A * C);
    }
    case 'hyperbola': {
      const horizontal = orientationOf(conic) === 'horizontal';
      const A = horizontal ? conic.b * conic.b : -(conic.b * conic.b);
      const C = horizontal ? -(conic.a * conic.a) : conic.a * conic.a;
      const scale = conic.a * conic.a * conic.b * conic.b;

      return general(A, C, -2 * A * h, -2 * C * k, A * h * h + C * k * k - scale);
    }
    case 'parabola': {
      if (orientationOf(conic) === 'vertical') {
        // x = a(y−k)² + h  →  a·y² − x − 2ak·y + (ak² + h) = 0
        return general(0, conic.a, -1, -2 * conic.a * k, conic.a * k * k + h);
      }

      // y = a(x−h)² + k  →  a·x² − y − 2ah·x + (ah² + k) = 0
      return general(conic.a, 0, -2 * conic.a * h, -1, conic.a * h * h + k);
    }
    default:
      return null;
  }
}

function general(A, C, D, E, F) {
  return {
    A: cleanNumber(A), B: 0, C: cleanNumber(C), D: cleanNumber(D), E: cleanNumber(E), F: cleanNumber(F),
  };
}
