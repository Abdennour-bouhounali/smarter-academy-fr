/**
 * L'ANALYSE de la scène — le pont PUR entre l'état et le dessin (§50, §53).
 *
 * Une seule fonction, `analyseScene`, calcule en un passage tout ce que
 * l'écran montre : les éléments remarquables de chaque conique, les rayons
 * focaux du point sondé, les intersections, le lieu, le point tracé. Le
 * composant n'appelle qu'elle, et il la mémorise — c'est ce qui tient §53
 * (« le graphe doit rester fluide pendant qu'on glisse ») sans qu'aucun
 * composant n'ait à savoir ce qu'est un foyer.
 *
 * Elle est PURE et ne jette jamais : une conique dégénérée est simplement
 * absente du résultat, et l'écran montre le reste.
 */

import * as C from './conicMath.js';
import * as I from './intersections.js';
import { isConicObject, isLineObject } from './conicState.js';

/**
 * @param {object} scene
 * @param {object} settings
 * @param {object} viewport
 * @returns {{
 *   viewport: object, byId: Record<string, object>, focalLinks: object[],
 *   intersections: object[], locus: ?object, tracePoint: ?object, probeReport: ?object
 * }}
 */
export function analyseScene(scene, settings, viewport) {
  const objects = Array.isArray(scene?.objects) ? scene.objects : [];
  const conics = objects.filter(isConicObject);
  const lines = objects.filter(isLineObject);

  // ── Les éléments remarquables, une fois par conique (§31) ─────────────
  const byId = {};
  for (const conic of conics) {
    const features = C.conicFeatures(conic);
    if (features) byId[conic.id] = features;
  }

  // ── §34 — le point tracé, reconstruit depuis son PARAMÈTRE ────────────
  let tracePoint = null;
  if (scene?.trace) {
    const target = conics.find((conic) => conic.id === scene.trace.targetId);
    if (target) {
      const point = C.pointAt(target, scene.trace.t, scene.trace.branch);
      if (point) tracePoint = { ...point, targetId: target.id, color: target.color };
    }
  }

  // ── §10, §16, §19, §28 — les rayons focaux du point interrogé ─────────
  //
  // Le point interrogé est celui de la TRACE s'il y en a une (il est sur la
  // courbe, donc la propriété focale y est exacte et c'est l'expérience de
  // §16), la SONDE sinon.
  const focalLinks = [];
  let probeReport = null;
  const queried = tracePoint ?? scene?.probe ?? null;
  const focusTarget = tracePoint
    ? conics.find((conic) => conic.id === tracePoint.targetId)
    : (conics.find((conic) => conic.id === scene?.selectedId) ?? conics[0]);

  if (queried && focusTarget && settings?.showFoci !== false) {
    const features = byId[focusTarget.id];
    const check = C.focalCheck(focusTarget, queried);
    if (features && check) {
      const anchors = focusTarget.kind === 'circle' ? [features.center] : features.foci;
      for (const anchor of anchors ?? []) {
        if (!C.isPoint(anchor)) continue;
        focalLinks.push({
          from: anchor, to: queried, length: C.distance(anchor, queried), color: focusTarget.color,
        });
      }
      // La parabole : la seconde « distance » est celle à la DIRECTRICE (§14).
      if (focusTarget.kind === 'parabola' && features.directrix) {
        const foot = features.directrix.kind === 'horizontal'
          ? { x: queried.x, y: features.directrix.value }
          : { x: features.directrix.value, y: queried.y };
        focalLinks.push({
          from: foot, to: queried, length: C.distance(foot, queried), color: focusTarget.color,
        });
      }

      probeReport = {
        targetId: focusTarget.id,
        kind: focusTarget.kind,
        point: queried,
        position: C.pointPosition(focusTarget, queried),
        substitution: C.substitute(focusTarget, queried),
        check,
        onCurve: Boolean(tracePoint),
      };
    }
  }

  // ── §25, §26 — les intersections de toutes les paires calculables ─────
  const intersections = [];
  if (settings?.showIntersections !== false) {
    // Droite × conique
    for (const line of lines) {
      if (line.visible === false) continue;
      for (const conic of conics) {
        if (conic.visible === false) continue;
        const result = I.lineConicIntersection(conic, line);
        if (result?.points) intersections.push(...result.points);
      }
    }
    // Cercle × cercle
    const circles = conics.filter((conic) => conic.kind === 'circle' && conic.visible !== false);
    for (let i = 0; i < circles.length; i += 1) {
      for (let j = i + 1; j < circles.length; j += 1) {
        const result = I.circleCircleIntersection(circles[i], circles[j]);
        if (result?.points) intersections.push(...result.points);
      }
    }
  }

  return {
    viewport,
    byId,
    focalLinks,
    intersections: dedupe(intersections),
    locus: I.locusOf(scene?.locus),
    tracePoint,
    probeReport,
  };
}

/**
 * Deux points d'intersection « au même endroit » n'en font qu'un.
 *
 * Trois cercles concourants produisent la même intersection plusieurs fois,
 * et empiler trois anneaux au même pixel donne un gros point noir que
 * personne ne sait lire.
 */
function dedupe(points) {
  const kept = [];
  for (const point of points) {
    if (!C.isPoint(point)) continue;
    if (kept.some((other) => C.nearlyEqual(other.x, point.x, 1e-6) && C.nearlyEqual(other.y, point.y, 1e-6))) continue;
    kept.push(point);
  }

  return kept;
}

/**
 * §21 — LE TABLEAU COMPARATIF, rempli avec les valeurs de la conique
 * SÉLECTIONNÉE plutôt qu'avec un texte de manuel.
 *
 * Chaque ligne est une PROPRIÉTÉ, chaque colonne une famille ; la colonne de
 * la famille courante porte les vraies valeurs, les autres portent ce que la
 * famille dit en général. C'est ce que §21 demande : « ne pas en faire un
 * tableau de manuel statique ».
 *
 * Les valeurs sont rendues en CLÉS i18n plus paramètres, jamais en texte :
 * la traduction appartient au composant.
 */
export function comparisonRows(conic, features) {
  const kind = conic?.kind ?? null;
  const has = (family) => family === kind;

  return [
    {
      property: 'center',
      values: {
        circle: has('circle') && features ? point(features.center) : { key: 'generic.center' },
        parabola: has('parabola') && features ? point(features.vertex) : { key: 'generic.noCenter' },
        ellipse: has('ellipse') && features ? point(features.center) : { key: 'generic.center' },
        hyperbola: has('hyperbola') && features ? point(features.center) : { key: 'generic.center' },
      },
    },
    {
      property: 'focus',
      values: {
        circle: { key: 'generic.focusIsCenter' },
        parabola: has('parabola') && features ? point(features.foci?.[0]) : { key: 'generic.oneFocus' },
        ellipse: has('ellipse') && features ? { key: 'generic.twoFoci', params: { c: round(features.c) } } : { key: 'generic.twoFoci', params: {} },
        hyperbola: has('hyperbola') && features ? { key: 'generic.twoFoci', params: { c: round(features.c) } } : { key: 'generic.twoFoci', params: {} },
      },
    },
    {
      property: 'symmetry',
      values: {
        circle: { key: 'generic.infiniteAxes' },
        parabola: { key: 'generic.oneAxis' },
        ellipse: { key: 'generic.twoAxes' },
        hyperbola: { key: 'generic.twoAxes' },
      },
    },
    {
      property: 'eccentricity',
      values: {
        circle: { key: 'generic.value', params: { v: '0' } },
        parabola: { key: 'generic.value', params: { v: '1' } },
        ellipse: has('ellipse') && features
          ? { key: 'generic.value', params: { v: round(features.eccentricity) } }
          : { key: 'generic.between01' },
        hyperbola: has('hyperbola') && features
          ? { key: 'generic.value', params: { v: round(features.eccentricity) } }
          : { key: 'generic.above1' },
      },
    },
    {
      property: 'keyParameter',
      values: {
        circle: has('circle') ? { key: 'generic.value', params: { v: `r = ${round(conic.r)}` } } : { key: 'generic.radius' },
        parabola: has('parabola') ? { key: 'generic.value', params: { v: `a = ${round(conic.a)}` } } : { key: 'generic.coefficient' },
        ellipse: has('ellipse') ? { key: 'generic.value', params: { v: `a = ${round(conic.a)} · b = ${round(conic.b)}` } } : { key: 'generic.semiAxes' },
        hyperbola: has('hyperbola') ? { key: 'generic.value', params: { v: `a = ${round(conic.a)} · b = ${round(conic.b)}` } } : { key: 'generic.semiAxes' },
      },
    },
  ];
}

const round = (value) => (Number.isFinite(value) ? Math.round(value * 100) / 100 : '—');
const point = (p) => (C.isPoint(p)
  ? { key: 'generic.point', params: { x: round(p.x), y: round(p.y) } }
  : { key: 'generic.none' });
