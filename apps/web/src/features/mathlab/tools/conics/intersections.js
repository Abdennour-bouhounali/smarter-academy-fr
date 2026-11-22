/**
 * LES INTERSECTIONS (§25, §26, §27) — logique PURE.
 *
 * Droite ∩ conique, cercle ∩ cercle : résolues ALGÉBRIQUEMENT à chaque fois
 * que c'est possible, jamais par balayage numérique. La raison est
 * pédagogique autant que technique : §26 fait naître les mots « sécante » et
 * « tangente » du NOMBRE de solutions, et ce nombre doit être 0, 1 ou 2 —
 * pas « deux points très proches » qu'un balayage rendrait parfois un, parfois
 * trois.
 *
 * Le discriminant est donc le héros de ce fichier, et `classify` rend son
 * verdict en mots : `'none' | 'tangent' | 'secant'`.
 *
 * ── La tangence, et pourquoi elle est RELATIVE ───────────────────────────
 * `Δ = 0` exactement n'arrive jamais quand l'élève tire une droite au doigt.
 * On compare donc `Δ` à l'échelle des coefficients qui l'ont produit : une
 * droite est tangente quand `|Δ| ≤ ε·max(1, a², b², c²)`. Sans cela §27 (voir
 * la transition sécante → tangente → rien) serait invisible : la droite
 * passerait de deux points à zéro point sans jamais en montrer un seul.
 */

import * as C from './conicMath.js';

/** La tolérance de la tangence, relative aux coefficients du trinôme (§52). */
const TANGENCY_EPSILON = 1e-7;

const finite = Number.isFinite;
const { abs, sqrt, max, hypot } = Math;

/**
 * Une DROITE du laboratoire : `y = mx + p`, ou `x = c` (verticale).
 *
 * La verticale n'est pas un cas particulier honteux qu'on éviterait : c'est
 * la droite que l'élève obtient en redressant la pente, et §26 doit
 * continuer de fonctionner quand il le fait.
 */
export function makeLine(slope, intercept) {
  return finite(slope) && finite(intercept) ? { vertical: false, slope, intercept } : null;
}

export function makeVerticalLine(x) {
  return finite(x) ? { vertical: true, x } : null;
}

export function isLine(line) {
  if (!line) return false;

  return line.vertical ? finite(line.x) : finite(line.slope) && finite(line.intercept);
}

/**
 * Les deux extrémités du segment visible d'une droite dans la fenêtre.
 *
 * Une droite est infinie ; un `<line>` SVG ne l'est pas. On la coupe donc à
 * la fenêtre — un peu au-delà, pour qu'aucune extrémité ne soit visible.
 */
export function lineSegmentIn(line, viewport) {
  if (!isLine(line) || !viewport) return null;
  const padX = (viewport.xMax - viewport.xMin) * 0.05;
  const padY = (viewport.yMax - viewport.yMin) * 0.05;
  if (line.vertical) {
    return [{ x: line.x, y: viewport.yMin - padY }, { x: line.x, y: viewport.yMax + padY }];
  }
  const x1 = viewport.xMin - padX;
  const x2 = viewport.xMax + padX;

  return [
    { x: x1, y: line.slope * x1 + line.intercept },
    { x: x2, y: line.slope * x2 + line.intercept },
  ];
}

/** La distance d'un point à une droite — §33, et le test de tangence d'un cercle. */
export function distancePointLine(point, line) {
  if (!C.isPoint(point) || !isLine(line)) return NaN;
  if (line.vertical) return abs(point.x - line.x);

  // |mx − y + p| / √(m² + 1)
  return abs(line.slope * point.x - point.y + line.intercept) / hypot(line.slope, 1);
}

/**
 * Les RACINES RÉELLES de `at² + bt + c = 0`, et le verdict.
 *
 * C'est le cœur de §25 – §27. On rend aussi `delta` et `classification`
 * parce que l'interface les MONTRE : le discriminant n'est pas un détail
 * d'implémentation, c'est ce que l'élève doit voir changer de signe.
 *
 * La formule est celle qui ÉVITE l'annulation catastrophique
 * (`q = −(b + sign(b)√Δ)/2`) : avec `b` grand devant `√Δ`, la formule
 * scolaire perd toute précision sur l'une des deux racines, et le point
 * d'intersection se mettrait à trembler sous le doigt (§52).
 */
export function solveQuadratic(a, b, c) {
  if (!finite(a) || !finite(b) || !finite(c)) return { roots: [], delta: NaN, classification: 'none' };

  /**
   * « Le terme en t² a-t-il disparu ? » se juge sur `a` SEUL, et non contre
   * la taille des autres coefficients.
   *
   * Mesurer `a` contre `max(1, |a|, |b|, |c|)` paraît naturel et est FAUX :
   * pour `t² + 10⁸·t + 1 = 0` — un trinôme parfaitement ordinaire, que
   * produit une droite très inclinée — cette échelle vaut 10⁸, le test
   * déclare `a` négligeable, et l'équation perd l'une de ses deux racines.
   * La droite cessait alors d'être sécante à mi-course, sans que rien à
   * l'écran ne l'explique. (Défaut trouvé par `intersections.test.js`,
   * « reste PRÉCIS quand b est grand devant √Δ ».)
   *
   * Les `a` nuls de ce laboratoire sont des zéros EXACTS, pas des zéros
   * approchés : ils viennent d'un coefficient structurellement absent —
   * la droite verticale sur une parabole (`{a: 0, b: 1}` dans
   * `lineConicQuadratic`), ou la droite parallèle à l'axe. Un seuil
   * absolu minuscule les capture tous sans jamais mordre sur un vrai
   * trinôme, si mal conditionné soit-il.
   */
  if (abs(a) < 1e-300) {
    if (abs(b) < 1e-300) {
      return { roots: [], delta: NaN, classification: 'none', degenerate: true };
    }

    return { roots: [C.cleanNumber(-c / b)], delta: 0, classification: 'single', degenerate: true };
  }

  const delta = b * b - 4 * a * c;
  // L'échelle du discriminant est celle de b² et de 4ac, pas celle de Δ.
  const deltaScale = max(1, b * b, abs(4 * a * c));
  if (abs(delta) <= TANGENCY_EPSILON * deltaScale) {
    return { roots: [C.cleanNumber(-b / (2 * a))], delta: 0, classification: 'tangent' };
  }
  if (delta < 0) return { roots: [], delta, classification: 'none' };

  const root = sqrt(delta);
  const q = -(b + (b >= 0 ? root : -root)) / 2;
  const roots = [q / a, c / q].map(C.cleanNumber).sort((u, v) => u - v);

  return { roots, delta, classification: 'secant' };
}

/**
 * DROITE ∩ CONIQUE — §25, §26, §27.
 *
 * La méthode est la même pour les quatre familles : substituer la droite dans
 * l'équation de la conique, ce qui donne un trinôme en `x` (ou en `y` pour une
 * droite verticale), puis résoudre. Aucune famille n'a droit à un traitement
 * particulier, et c'est ce qui garantit que le VERDICT (0, 1, 2) est le même
 * objet mathématique partout.
 *
 * @returns {{points: object[], count: number, classification: string, delta: number} | null}
 */
export function lineConicIntersection(conic, line) {
  if (!C.isValidConic(conic) || !isLine(line)) return null;
  const quadratic = lineConicQuadratic(conic, line);
  if (!quadratic) return null;
  const { a, b, c, variable } = quadratic;
  const solved = solveQuadratic(a, b, c);

  const points = solved.roots
    .map((t) => (variable === 'x'
      ? { x: t, y: line.vertical ? NaN : line.slope * t + line.intercept }
      : { x: line.vertical ? line.x : NaN, y: t }))
    .map(C.cleanPoint)
    .filter(C.isPoint)
    // L'hyperbole : une racine du trinôme peut tomber sur la « fausse » branche
    // pour une orientation verticale — on revérifie donc l'appartenance.
    .filter((p) => abs(C.substitute(conic, p)) <= 1e-6 * max(1, abs(p.x), abs(p.y)));

  return {
    points,
    count: points.length,
    // Le verdict est celui du DISCRIMINANT, corrigé par le nombre de points
    // réellement retenus (une branche écartée change le compte).
    classification: points.length === 0 ? 'none' : points.length === 1 ? 'tangent' : 'secant',
    delta: solved.delta,
  };
}

/**
 * Le TRINÔME de l'intersection droite ∩ conique — exposé pour les tests et
 * pour §26, où l'interface montre le discriminant.
 *
 * `variable` dit en quoi il est écrit : `'x'` en général, `'y'` pour une
 * droite verticale (et pour une parabole horizontale, où `y` est la variable
 * naturelle).
 */
export function lineConicQuadratic(conic, line) {
  if (!C.isValidConic(conic) || !isLine(line)) return null;
  const { h, k } = conic;

  // ── Droite VERTICALE : x est connu, le trinôme est en y ────────────────
  if (line.vertical) {
    const dx = line.x - h;
    switch (conic.kind) {
      case 'circle':
        // (y−k)² = r² − dx²
        return { a: 1, b: -2 * k, c: k * k + dx * dx - conic.r * conic.r, variable: 'y' };
      case 'ellipse': {
        const A = conic.a * conic.a;
        const B = conic.b * conic.b;

        // dx²/A + (y−k)²/B = 1  →  (y−k)² = B(1 − dx²/A)
        return { a: 1, b: -2 * k, c: k * k - B * (1 - (dx * dx) / A), variable: 'y' };
      }
      case 'hyperbola': {
        const horizontal = C.orientationOf(conic) === 'horizontal';
        const A = conic.a * conic.a;
        const B = conic.b * conic.b;
        if (horizontal) {
          // dx²/A − (y−k)²/B = 1  →  (y−k)² = B(dx²/A − 1)
          return { a: 1, b: -2 * k, c: k * k - B * ((dx * dx) / A - 1), variable: 'y' };
        }

        // (y−k)²/A − dx²/B = 1  →  (y−k)² = A(1 + dx²/B)
        return { a: 1, b: -2 * k, c: k * k - A * (1 + (dx * dx) / B), variable: 'y' };
      }
      case 'parabola': {
        if (C.orientationOf(conic) === 'vertical') {
          // x = a(y−k)² + h  →  a(y−k)² = dx
          return { a: conic.a, b: -2 * conic.a * k, c: conic.a * k * k - dx, variable: 'y' };
        }

        // y = a(x−h)² + k : une seule solution, la droite verticale coupe toujours une fois.
        return { a: 0, b: 1, c: -(conic.a * dx * dx + k), variable: 'y' };
      }
      default:
        return null;
    }
  }

  // ── Droite « y = mx + p » : le trinôme est en x ────────────────────────
  const m = line.slope;
  const p = line.intercept;
  // y − k = m·x + (p − k) = m·x + q
  const q = p - k;

  switch (conic.kind) {
    case 'circle': {
      // (x−h)² + (mx+q)² = r²
      return {
        a: 1 + m * m,
        b: -2 * h + 2 * m * q,
        c: h * h + q * q - conic.r * conic.r,
        variable: 'x',
      };
    }
    case 'ellipse': {
      const A = conic.a * conic.a;
      const B = conic.b * conic.b;

      // B(x−h)² + A(mx+q)² = AB
      return {
        a: B + A * m * m,
        b: -2 * B * h + 2 * A * m * q,
        c: B * h * h + A * q * q - A * B,
        variable: 'x',
      };
    }
    case 'hyperbola': {
      const horizontal = C.orientationOf(conic) === 'horizontal';
      const A = conic.a * conic.a;
      const B = conic.b * conic.b;
      if (horizontal) {
        // B(x−h)² − A(mx+q)² = AB
        return {
          a: B - A * m * m,
          b: -2 * B * h - 2 * A * m * q,
          c: B * h * h - A * q * q - A * B,
          variable: 'x',
        };
      }

      // A(mx+q)² − B(x−h)² = AB
      return {
        a: A * m * m - B,
        b: 2 * A * m * q + 2 * B * h,
        c: A * q * q - B * h * h - A * B,
        variable: 'x',
      };
    }
    case 'parabola': {
      if (C.orientationOf(conic) === 'vertical') {
        // x = a(y−k)² + h, avec y = mx + p. En x : a(mx+q)² + h − x = 0
        return {
          a: conic.a * m * m,
          b: 2 * conic.a * m * q - 1,
          c: conic.a * q * q + h,
          variable: 'x',
        };
      }

      // y = a(x−h)² + k, avec y = mx + p : a(x−h)² − mx − q = 0
      return {
        a: conic.a,
        b: -2 * conic.a * h - m,
        c: conic.a * h * h - q,
        variable: 'x',
      };
    }
    default:
      return null;
  }
}

/**
 * CERCLE ∩ CERCLE — §25.
 *
 * Résolu par l'axe radical : soustraire les deux équations développées
 * élimine `x²` et `y²` et laisse une DROITE, qu'on intersecte ensuite avec
 * l'un des cercles. C'est la méthode du manuel, et elle traite les cas
 * limites (tangence extérieure, tangence intérieure, cercles concentriques)
 * sans aucun cas particulier écrit à la main.
 */
export function circleCircleIntersection(first, second) {
  if (!C.isValidConic(first) || first.kind !== 'circle') return null;
  if (!C.isValidConic(second) || second.kind !== 'circle') return null;
  const dx = second.h - first.h;
  const dy = second.k - first.k;
  const d = hypot(dx, dy);
  const scale = max(1, first.r, second.r, d);

  // Concentriques : aucun point commun (ou le même cercle — jamais « deux points »).
  if (d <= TANGENCY_EPSILON * scale) {
    return {
      points: [], count: 0, classification: C.nearlyEqual(first.r, second.r) ? 'identical' : 'none', distance: d,
    };
  }

  const sum = first.r + second.r;
  const gap = abs(first.r - second.r);
  if (d > sum + TANGENCY_EPSILON * scale || d < gap - TANGENCY_EPSILON * scale) {
    return { points: [], count: 0, classification: 'none', distance: d };
  }

  // a : la distance du centre 1 au pied de l'axe radical.
  const a = (first.r * first.r - second.r * second.r + d * d) / (2 * d);
  const hSq = first.r * first.r - a * a;
  const foot = { x: first.h + (a * dx) / d, y: first.k + (a * dy) / d };

  if (hSq <= TANGENCY_EPSILON * scale * scale) {
    return {
      points: [C.cleanPoint(foot)], count: 1, classification: 'tangent', distance: d,
    };
  }

  const height = sqrt(hSq);
  const points = [
    { x: foot.x + (height * dy) / d, y: foot.y - (height * dx) / d },
    { x: foot.x - (height * dy) / d, y: foot.y + (height * dx) / d },
  ].map(C.cleanPoint);

  return { points, count: 2, classification: 'secant', distance: d };
}

/**
 * L'intersection de DEUX objets quelconques du laboratoire — la porte unique.
 *
 * V1 sait faire : droite ∩ conique (les quatre familles) et cercle ∩ cercle.
 * Tout le reste rend `{supported: false}` — honnêtement, plutôt qu'un résultat
 * approximatif (§25 : « là où c'est calculable »).
 */
export function intersect(first, second) {
  if (isLine(first) && C.isValidConic(second)) {
    return { supported: true, ...lineConicIntersection(second, first) };
  }
  if (C.isValidConic(first) && isLine(second)) {
    return { supported: true, ...lineConicIntersection(first, second) };
  }
  if (first?.kind === 'circle' && second?.kind === 'circle') {
    return { supported: true, ...circleCircleIntersection(first, second) };
  }

  return { supported: false, points: [], count: 0, classification: 'unsupported' };
}

/**
 * §35 — le LIEU GÉOMÉTRIQUE, pour les deux constructions que V1 tient.
 *
 * On n'expose que ce qui est EXACT et démontrable au niveau visé :
 *
 *   `fixedDistance`   distance constante à un point  → un cercle
 *   `equidistant`     équidistant d'un point et d'une droite → une parabole
 *
 * Chacune rend la conique qui EST le lieu — pas un nuage de points. Un nuage
 * dirait « voilà des points qui marchent » ; la conique dit « voilà la
 * courbe, et c'en est une que tu connais ». C'est toute la valeur de §35.
 */
export function locusOf(construction) {
  if (!construction) return null;
  switch (construction.kind) {
    case 'fixedDistance': {
      const { focus, distance: d } = construction;
      if (!C.isPoint(focus) || !finite(d) || d <= C.EPSILON) return null;

      return { kind: 'circle', h: focus.x, k: focus.y, r: d };
    }
    case 'equidistant': {
      // Équidistant de F(fx, fy) et de la droite y = c  →  parabole d'axe vertical.
      const { focus, directrix } = construction;
      if (!C.isPoint(focus) || !directrix) return null;
      if (directrix.kind === 'horizontal') {
        const c = directrix.value;
        const p = (focus.y - c) / 2; // distance focale signée
        if (abs(p) <= C.EPSILON) return null; // le foyer est SUR la directrice : pas de parabole

        return {
          kind: 'parabola', orientation: 'horizontal', h: focus.x, k: (focus.y + c) / 2, a: 1 / (4 * p),
        };
      }
      if (directrix.kind === 'vertical') {
        const c = directrix.value;
        const p = (focus.x - c) / 2;
        if (abs(p) <= C.EPSILON) return null;

        return {
          kind: 'parabola', orientation: 'vertical', h: (focus.x + c) / 2, k: focus.y, a: 1 / (4 * p),
        };
      }

      return null;
    }
    default:
      return null;
  }
}
