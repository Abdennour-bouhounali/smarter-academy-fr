/**
 * LA GÉOMÉTRIE DU DESSIN — des mathématiques aux pixels, et rien d'autre.
 *
 * Ce module fait la seule chose que `trigMath.js` refuse de faire : parler de
 * pixels. Il ne calcule aucune valeur trigonométrique ; il TRADUIT celles
 * qu'on lui donne en chemins SVG. La séparation compte (§39) : la
 * mathématique reste testable sans écran, et le dessin reste testable sans
 * navigateur.
 *
 * ── Le repère du SVG est retourné ────────────────────────────────────────
 * En SVG, `y` croît vers le BAS. En mathématiques, vers le HAUT. Toute la
 * conversion tient dans `project()`, et c'est la raison pour laquelle aucun
 * composant n'a le droit de calculer un `cy` lui-même : un signe oublié et
 * sin(30°) se dessine sous l'axe alors que le panneau affiche `+1/2`.
 */

import { degToRad, sinOf, cosOf } from './trigMath.js';

/**
 * Math → pixels. `unit` est le nombre de pixels d'une unité du plan.
 * L'origine est donnée en pixels.
 */
export function project(point, origin, unit) {
  return {
    x: origin.x + point.x * unit,
    y: origin.y - point.y * unit,   // ← le retournement, à un seul endroit
  };
}

/** Pixels → math : ce dont le GLISSEMENT a besoin (§3). */
export function unproject(pixel, origin, unit) {
  if (!(unit > 0)) return { x: 0, y: 0 };

  return {
    x: (pixel.x - origin.x) / unit,
    y: (origin.y - pixel.y) / unit,
  };
}

/**
 * L'ARC de l'angle (§30) — le chemin qui dit « voici θ ».
 *
 * Il porte trois exigences à la fois :
 *   — il part de l'axe des abscisses et tourne dans le SENS DIRECT ;
 *   — au-delà d'un tour (§14) il s'ENROULE en spirale, sinon 450° et 90°
 *     dessineraient exactement le même arc et la périodicité resterait
 *     invisible ;
 *   — un angle NÉGATIF tourne dans l'autre sens, sans jamais devenir positif
 *     en route.
 *
 * Le chemin est échantillonné plutôt que tracé en `A` (arc elliptique) :
 * un `A` ne sait pas faire plus d'un demi-tour, et la spirale a besoin d'un
 * rayon qui varie.
 */
export function arcPath(degrees, origin, unit, baseRadius = 0.28, turnGrowth = 0.12) {
  if (!Number.isFinite(degrees) || Math.abs(degrees) < 0.01) return '';
  const steps = Math.max(8, Math.min(720, Math.ceil(Math.abs(degrees) / 2)));
  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * degrees;
    // Le rayon grandit avec le nombre de tours PARCOURUS : la spirale.
    const radius = baseRadius + (Math.abs(t) / 360) * turnGrowth;
    const radians = degToRad(t);
    const point = project(
      { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius },
      origin,
      unit,
    );
    points.push(`${i === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`);
  }

  return points.join(' ');
}

/** Le secteur plein d'un quadrant (§5) — pour teinter celui où l'on est. */
export function quadrantPath(quadrant, origin, unit, radius) {
  if (!(quadrant >= 1 && quadrant <= 4)) return '';
  const start = (quadrant - 1) * 90;
  const from = project({ x: Math.cos(degToRad(start)) * radius, y: Math.sin(degToRad(start)) * radius }, origin, unit);
  const to = project({ x: Math.cos(degToRad(start + 90)) * radius, y: Math.sin(degToRad(start + 90)) * radius }, origin, unit);
  const r = radius * unit;

  // `sweep-flag = 0` parce que le sens direct des mathématiques est le sens
  // horaire une fois l'axe des y retourné.
  return `M${origin.x},${origin.y} L${from.x.toFixed(2)},${from.y.toFixed(2)} A${r},${r} 0 0 0 ${to.x.toFixed(2)},${to.y.toFixed(2)} Z`;
}

/**
 * LA COURBE d'une fonction trigonométrique (§12), échantillonnée.
 *
 * L'abscisse est l'ANGLE (en degrés) et non un x quelconque : c'est ce qui
 * permet au marqueur du graphe et au point du cercle d'être le même objet
 * sous deux vues (§12, §32).
 */
export function wavePath(fn, fromDegrees, toDegrees, box, samples = 240, axis = null) {
  if (!(box.width > 0) || !(box.height > 0)) return '';
  const span = toDegrees - fromDegrees;
  if (Math.abs(span) < 1e-9) return '';
  /**
   * L'ÉCHELLE des abscisses est celle du CADRE, pas celle de l'échantillon.
   *
   * §13 veut que l'onde se dessine au fur et à mesure : on échantillonne
   * alors de `from` jusqu'à l'ANGLE COURANT, et non jusqu'au bout du cadre.
   * Sans `axis`, `waveX` rapporterait ce morceau à la largeur entière — la
   * courbe partielle serait COMPRIMÉE horizontalement et son extrémité ne
   * tomberait pas sous le marqueur. L'axe est donc passé à part : on
   * échantillonne un sous-intervalle, on le place à l'échelle du tour.
   */
  const scale = axis ?? { from: fromDegrees, to: toDegrees };
  const points = [];

  for (let i = 0; i <= samples; i += 1) {
    const degrees = fromDegrees + (i / samples) * span;
    const value = fn(degrees);
    if (!Number.isFinite(value)) continue;
    points.push(`${points.length === 0 ? 'M' : 'L'}${waveX(degrees, scale.from, scale.to, box).toFixed(2)},${waveY(value, box).toFixed(2)}`);
  }

  return points.join(' ');
}

/** L'abscisse d'un angle dans le cadre d'un graphe. */
export function waveX(degrees, fromDegrees, toDegrees, box) {
  const span = toDegrees - fromDegrees;

  return box.x + ((degrees - fromDegrees) / span) * box.width;
}

/** L'ordonnée d'une valeur de [−1, 1] dans le cadre d'un graphe. */
export function waveY(value, box) {
  const clamped = Math.max(-1, Math.min(1, value));

  return box.y + box.height / 2 - (clamped * box.height) / 2;
}

/** L'inverse : de l'abscisse d'un graphe à l'angle — le glissement de §32. */
export function angleFromWaveX(pixelX, fromDegrees, toDegrees, box) {
  if (!(box.width > 0)) return fromDegrees;
  const ratio = (pixelX - box.x) / box.width;

  return fromDegrees + Math.max(0, Math.min(1, ratio)) * (toDegrees - fromDegrees);
}

/**
 * LA TANGENTE GÉOMÉTRIQUE (§11).
 *
 * `tan θ` se lit sur la droite verticale d'abscisse 1 : le prolongement du
 * rayon la coupe à la hauteur `tan θ`. C'est CELA qu'il faut montrer, et
 * c'est aussi ce qui rend l'explosion en 90° évidente — la droite et le
 * rayon deviennent parallèles, l'intersection part à l'infini.
 *
 * Le segment est ÉCRÊTÉ à `maxHeight` : sans cela, à 89,99°, le SVG
 * recevrait un `y` de plusieurs millions et le navigateur cesserait de
 * rendre correctement (§11 : « avoid visual instability or infinite
 * rendering bugs »). L'écrêtage est SIGNALÉ pour que l'interface dessine la
 * flèche « ça continue » plutôt que de laisser croire à une fin.
 *
 * @returns {{defined: boolean, value: number|null, clipped: boolean, y: number, side: 1|-1} | null}
 */
export function tangentGeometry(degrees, maxHeight = 4) {
  const cos = cosOf(degrees);
  const sin = sinOf(degrees);
  if (cos === 0) return { defined: false, value: null, clipped: true, y: maxHeight, side: sin >= 0 ? 1 : -1 };

  const value = sin / cos;
  const clipped = Math.abs(value) > maxHeight;
  // La droite tangente est tracée en x = 1 ; quand cos < 0, le rayon la
  // coupe de l'autre côté — on garde le point de lecture du côté du rayon.
  const side = cos >= 0 ? 1 : -1;

  return {
    defined: true,
    value,
    clipped,
    y: clipped ? Math.sign(value) * maxHeight : value,
    side,
  };
}

/**
 * Les marqueurs des angles remarquables sur le cercle (§6, §30) — les
 * positions seulement ; les étiquettes sont du texte DOM, jamais du chemin.
 */
export function specialMarkers(degreesList, origin, unit, radius) {
  return degreesList
    .filter((degrees) => degrees < 360)
    .map((degrees) => ({
      degrees,
      point: project({ x: cosOf(degrees) * radius, y: sinOf(degrees) * radius }, origin, unit),
    }));
}

/**
 * Le triangle rectangle INSCRIT dans le cercle (§8) : origine, point P, et
 * la projection de P sur l'axe des abscisses. Les trois sommets en pixels,
 * plus le petit carré de l'angle droit — le marqueur du manuel.
 */
export function inscribedTriangle(degrees, origin, unit, radius) {
  const cos = cosOf(degrees);
  const sin = sinOf(degrees);
  const p = project({ x: cos * radius, y: sin * radius }, origin, unit);
  const foot = project({ x: cos * radius, y: 0 }, origin, unit);
  // Le carré de l'angle droit pointe VERS l'intérieur du triangle : son
  // orientation dépend donc des deux signes.
  const size = 9;
  const dx = cos >= 0 ? -size : size;
  const dy = sin >= 0 ? size : -size;

  return {
    origin,
    point: p,
    foot,
    rightAngle: `M${foot.x + dx},${foot.y} L${foot.x + dx},${foot.y - dy} L${foot.x},${foot.y - dy}`,
    degenerate: Math.abs(sin) < 1e-6 || Math.abs(cos) < 1e-6,
  };
}

/**
 * Le triangle du MODE TRIANGLE (§9) : celui qu'on dimensionne librement.
 *
 * Il est mis à l'échelle pour remplir la boîte quelle que soit la taille des
 * côtés — un triangle 3-4-5 et un triangle 30-40-50 se DESSINENT pareil,
 * parce que les rapports sont les mêmes ; c'est précisément la leçon (§9).
 */
export function freeTriangle({ opposite, adjacent }, box, padding = 56) {
  if (!(opposite > 0) || !(adjacent > 0)) return null;
  /**
   * La gouttière, plus large à DROITE qu'ailleurs.
   *
   * Le sommet qu'on tire est le coin haut-droit ; avec une gouttière
   * uniforme, un triangle très plat le collait au bord du panneau et la
   * poignée devenait difficile à saisir — ce que la QA visuelle a montré là
   * où aucune assertion ne regardait. On réserve donc de quoi poser la
   * poignée ET l'étiquette du côté opposé.
   */
  const right = padding + 28;
  const width = box.width - padding - right;
  const height = box.height - padding * 2;
  if (!(width > 0) || !(height > 0)) return null;

  const scale = Math.min(width / adjacent, height / opposite);
  const w = adjacent * scale;
  const h = opposite * scale;
  // Centré dans la boîte, angle droit en bas à droite : l'angle θ est alors
  // en bas à GAUCHE, là où le manuel le place.
  const left = box.x + (box.width - w) / 2;
  const bottom = box.y + (box.height + h) / 2;

  return {
    scale,
    vertexAngle: { x: left, y: bottom },                 // θ
    vertexRight: { x: left + w, y: bottom },             // l'angle droit
    vertexTop: { x: left + w, y: bottom - h },           // le sommet opposé
    rightAngle: `M${left + w - 12},${bottom} L${left + w - 12},${bottom - 12} L${left + w},${bottom - 12}`,
  };
}

/**
 * L'ARC d'un angle quelconque entre deux directions — utilisé par la
 * comparaison de deux angles (§34 : « Visually display the angular movement
 * between them »).
 */
export function betweenArc(fromDegrees, toDegrees, origin, unit, radius) {
  const delta = toDegrees - fromDegrees;
  if (Math.abs(delta) < 0.01) return '';
  const steps = Math.max(8, Math.min(360, Math.ceil(Math.abs(delta) / 2)));
  const points = [];

  for (let i = 0; i <= steps; i += 1) {
    const degrees = fromDegrees + (i / steps) * delta;
    const radians = degToRad(degrees);
    const point = project({ x: Math.cos(radians) * radius, y: Math.sin(radians) * radius }, origin, unit);
    points.push(`${i === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`);
  }

  return points.join(' ');
}

