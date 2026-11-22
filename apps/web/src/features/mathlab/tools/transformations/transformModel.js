/**
 * LE MODÈLE des transformations : ce qu'un PAS de la pile (§21) contient, et
 * comment il devient une matrice du moteur (transformMath.js).
 *
 * Un pas stocké ressemble à ceci :
 *
 *     { id, kind: 'translation', enabled: true, vx: 3, vy: -2 }
 *     { id, kind: 'rotation',    enabled: true, angle: 90, center: {x:0,y:0} }
 *     { id, kind: 'reflection',  enabled: true, axis: { type: 'xAxis' } }
 *     { id, kind: 'dilation',    enabled: true, k: 2, center: {x:0,y:0} }
 *
 * Il décrit la transformation comme l'ÉLÈVE la pense — « une rotation de 90°
 * autour de l'origine » — et jamais comme une matrice. La matrice est
 * DÉRIVÉE (`matrixFor`), elle n'est pas stockée : deux sources de vérité
 * pour la même transformation, c'est la garantie qu'un jour elles se
 * contrediront.
 *
 * Le centre et l'axe peuvent DÉSIGNER un objet de la scène (« le centre est
 * le sommet A ») ; la résolution se fait ici, contre la figure courante, à
 * chaque calcul — c'est ce qui fait que déplacer A déplace le centre de
 * rotation en même temps (§11).
 */

import * as M from './transformMath.js';

/** Les quatre familles. L'ordre est celui de la barre d'outils. */
export const TRANSFORM_KINDS = Object.freeze(['translation', 'rotation', 'reflection', 'dilation']);

/** Les axes de réflexion que l'élève peut choisir (§14). */
export const AXIS_TYPES = Object.freeze(['xAxis', 'yAxis', 'origin', 'horizontal', 'vertical', 'diagonal', 'antidiagonal', 'line', 'twoPoints']);

// ── La résolution d'un centre et d'un axe contre la figure ───────────────

/**
 * Le centre d'une rotation ou d'une homothétie, résolu.
 *
 * `{ type: 'vertex', index: 0 }` suit le sommet 0 de la figure : l'élève
 * tire le sommet, le centre suit, et l'image se recalcule — sans qu'aucun
 * code de l'interface ait à recopier des coordonnées.
 */
export function resolveCenter(center, vertices = []) {
  if (!center || center.type === 'origin') return M.ORIGIN;
  if (center.type === 'vertex') {
    const vertex = vertices[center.index];

    return M.isPoint(vertex) ? vertex : M.ORIGIN;
  }
  if (center.type === 'point' && M.isPoint(center.point)) return center.point;

  return M.ORIGIN;
}

/**
 * L'axe d'une réflexion, résolu en droite du moteur.
 *
 * `origin` n'est pas une droite : la « réflexion par rapport à l'origine »
 * est la symétrie CENTRALE, donc une homothétie de rapport −1. On rend
 * `null` ici, et `matrixFor` s'en charge — plutôt que d'inventer une droite
 * qui n'existe pas.
 */
export function resolveAxis(axis, vertices = []) {
  if (!axis) return null;
  switch (axis.type) {
    case 'xAxis': return M.horizontalLine(0);
    case 'yAxis': return M.verticalLine(0);
    case 'horizontal': return M.horizontalLine(Number(axis.value) || 0);
    case 'vertical': return M.verticalLine(Number(axis.value) || 0);
    case 'diagonal': return M.lineFromSlope(1, 0);          // y = x
    case 'antidiagonal': return M.lineFromSlope(-1, 0);     // y = −x
    case 'line': return M.lineFromSlope(Number(axis.slope) || 0, Number(axis.intercept) || 0);
    case 'twoPoints': {
      const a = M.isPoint(axis.a) ? axis.a : vertices[axis.aIndex];
      const b = M.isPoint(axis.b) ? axis.b : vertices[axis.bIndex];

      return M.lineFromPoints(a, b);
    }
    default: return null;
  }
}

/**
 * LA MATRICE d'un pas, résolue contre la figure.
 *
 * Rend `null` quand le pas ne décrit AUCUNE transformation — une réflexion
 * dont l'axe est défini par deux points confondus, par exemple. L'appelant
 * traite ce pas comme inopérant et le signale ; il ne le remplace pas par
 * l'identité en silence (§55).
 */
export function matrixFor(step, vertices = []) {
  if (!step || typeof step !== 'object') return null;
  switch (step.kind) {
    case 'translation':
      return M.translation(Number(step.vx), Number(step.vy));
    case 'rotation':
      return M.rotation(Number(step.angle), resolveCenter(step.center, vertices));
    case 'dilation':
      return M.dilation(Number(step.k), resolveCenter(step.center, vertices));
    case 'reflection': {
      // La symétrie centrale est une homothétie de rapport −1 (§36).
      if (step.axis?.type === 'origin') {
        return M.dilation(-1, resolveCenter(step.axis.center, vertices));
      }
      const line = resolveAxis(step.axis, vertices);

      return line ? M.reflection(line) : null;
    }
    default:
      return null;
  }
}

/**
 * La FRACTION d'un pas, pour l'animation (§12).
 *
 * `t = 0` rend l'identité, `t = 1` le pas entier, et entre les deux un état
 * intermédiaire qui a un SENS géométrique — pas une interpolation de
 * matrices, qui donnerait des formes impossibles :
 *
 *   - une rotation de 90° à t = 0,5 est une rotation de 45° (la figure
 *     TOURNE, elle ne se déforme pas) ;
 *   - une homothétie de rapport 3 à t = 0,5 est une homothétie de rapport 2
 *     (interpolation du RAPPORT, pas du log) ;
 *   - une translation avance sur son vecteur ;
 *   - une réflexion est la seule qui n'a pas d'état intermédiaire honnête :
 *     on la joue comme une rotation d'un demi-tour AUTOUR de son axe, vue en
 *     projection — ce qui donne une figure qui « s'écrase » puis se
 *     redéploie de l'autre côté, exactement ce que fait une feuille qu'on
 *     retourne. C'est la seule animation de l'instrument qui montre un état
 *     non euclidien, et elle le fait parce que c'est la vérité du geste.
 */
export function matrixAtFraction(step, vertices, t) {
  const clamped = Math.min(1, Math.max(0, Number(t) || 0));
  if (clamped >= 1) return matrixFor(step, vertices);
  if (clamped <= 0) return M.IDENTITY;

  switch (step.kind) {
    case 'translation':
      return M.translation(Number(step.vx) * clamped, Number(step.vy) * clamped);
    case 'rotation':
      return M.rotation(Number(step.angle) * clamped, resolveCenter(step.center, vertices));
    case 'dilation': {
      const k = Number(step.k);

      return M.dilation(1 + (k - 1) * clamped, resolveCenter(step.center, vertices));
    }
    case 'reflection': {
      if (step.axis?.type === 'origin') {
        const center = resolveCenter(step.axis.center, vertices);

        return M.rotation(180 * clamped, center);
      }
      const line = M.normalizeLine(resolveAxis(step.axis, vertices));
      if (!line) return M.IDENTITY;

      // Le « retournement » : on écrase la composante perpendiculaire de 1 à −1.
      const scale = 1 - 2 * clamped;
      const { point, dx, dy } = line;
      // Dans le repère (u, n) de la droite : (1, scale) — puis retour au repère du plan.
      const a = dx * dx + scale * dy * dy;
      const b = dx * dy - scale * dx * dy;
      const c = dx * dy - scale * dx * dy;
      const d = dy * dy + scale * dx * dx;

      return {
        a, b, c, d,
        e: point.x - a * point.x - c * point.y,
        f: point.y - b * point.x - d * point.y,
      };
    }
    default:
      return M.IDENTITY;
  }
}

// ── La pile : les états successifs de la figure (§20, §21, §22) ──────────

/**
 * Les ÉTAPES d'une composition : la figure d'origine, puis son image après
 * chaque pas ACTIF, dans l'ordre.
 *
 * Rend un tableau de `{ step, matrix, vertices, cumulative, skipped }` — un
 * par pas — précédé de rien : la figure d'origine est `figure` elle-même, et
 * `stages[i].vertices` est son image après les i+1 premiers pas. C'est ce
 * que §22 affiche (les intermédiaires) et ce que §21 recalcule en entier dès
 * qu'un pas change.
 *
 * Un pas désactivé (§21) est TRAVERSÉ : il apparaît dans le résultat avec
 * `skipped: true` et les sommets inchangés, pour que la pile affichée garde
 * ses lignes à leur place pendant que l'élève éteint et rallume.
 *
 * Les centres et axes sont résolus contre la figure D'ORIGINE, pas contre
 * l'image courante : « le centre est le sommet A » désigne le A que l'élève
 * voit et tire, pas le A' que le pas précédent vient de produire. C'est ce
 * qu'il attend, et c'est ce qui rend une pile stable quand on réordonne.
 */
export function transformStages(figure, steps) {
  const source = Array.isArray(figure) ? figure : [];
  const list = Array.isArray(steps) ? steps : [];
  const stages = [];
  let currentVertices = source;
  let cumulative = M.IDENTITY;

  for (const step of list) {
    if (step?.enabled === false) {
      stages.push({ step, matrix: M.IDENTITY, vertices: currentVertices, cumulative, skipped: true, invalid: false });
      continue;
    }
    const matrix = matrixFor(step, source);
    if (!matrix) {
      // Un pas qui ne décrit rien (axe dégénéré) : la figure ne bouge pas, et on le DIT.
      stages.push({ step, matrix: M.IDENTITY, vertices: currentVertices, cumulative, skipped: false, invalid: true });
      continue;
    }
    cumulative = M.compose(matrix, cumulative);
    currentVertices = currentVertices.map((vertex) => M.cleanPoint(M.applyMatrix(matrix, vertex)));
    stages.push({ step, matrix, vertices: currentVertices, cumulative, skipped: false, invalid: false });
  }

  return stages;
}

/** L'image finale d'une figure par une pile. */
export function finalFigure(figure, steps) {
  const stages = transformStages(figure, steps);

  return stages.length > 0 ? stages[stages.length - 1].vertices : (Array.isArray(figure) ? figure : []);
}

/** La matrice cumulée de toute la pile (§27). */
export function cumulativeMatrix(figure, steps) {
  const stages = transformStages(figure, steps);

  return stages.length > 0 ? stages[stages.length - 1].cumulative : M.IDENTITY;
}

// ── Les invariants (§24) : ce qui ne change pas ──────────────────────────

/**
 * Ce qu'une transformation CONSERVE, mesuré sur la figure — jamais récité.
 *
 * C'est le cœur pédagogique de l'instrument, et c'est pourquoi rien ici
 * n'est écrit en dur. On ne dit pas « une rotation conserve les longueurs » :
 * on MESURE les longueurs avant, on les mesure après, et on compare. Si
 * l'élève invente une transformation à laquelle personne n'a pensé, le
 * tableau des invariants reste juste.
 *
 * Chaque entrée rend `{ preserved, before, after }` pour que §25 puisse
 * afficher les deux colonnes et le verdict depuis la même source.
 *
 * La tolérance est RELATIVE : comparer des longueurs de 1e−4 et des
 * longueurs de 1e4 avec le même seuil absolu déclarerait l'une conservée et
 * l'autre non, pour le même calcul. C'est la règle déjà tenue par l'atelier
 * des vecteurs (analysis.js).
 */
export function analyzeInvariants(before, after) {
  const sourceVertices = Array.isArray(before) ? before : [];
  const imageVertices = Array.isArray(after) ? after : [];
  if (sourceVertices.length < 2 || sourceVertices.length !== imageVertices.length) return null;

  const lengthsBefore = M.sideLengths(sourceVertices);
  const lengthsAfter = M.sideLengths(imageVertices);
  const isPolygon = sourceVertices.length >= 3;
  const anglesBefore = isPolygon ? M.interiorAngles(sourceVertices) : [];
  const anglesAfter = isPolygon ? M.interiorAngles(imageVertices) : [];
  const areaBefore = isPolygon ? M.area(sourceVertices) : 0;
  const areaAfter = isPolygon ? M.area(imageVertices) : 0;
  const perimeterBefore = M.perimeter(sourceVertices);
  const perimeterAfter = M.perimeter(imageVertices);
  const orientationBefore = isPolygon ? M.orientation(sourceVertices) : 0;
  const orientationAfter = isPolygon ? M.orientation(imageVertices) : 0;

  return {
    distances: {
      preserved: listsClose(lengthsBefore, lengthsAfter),
      before: lengthsBefore,
      after: lengthsAfter,
    },
    angles: isPolygon ? {
      preserved: listsClose(anglesBefore, anglesAfter, 1e-6),
      before: anglesBefore,
      after: anglesAfter,
    } : null,
    area: isPolygon ? {
      preserved: close(areaBefore, areaAfter),
      before: areaBefore,
      after: areaAfter,
      ratio: areaBefore > M.EPSILON ? areaAfter / areaBefore : Number.NaN,
    } : null,
    perimeter: {
      preserved: close(perimeterBefore, perimeterAfter),
      before: perimeterBefore,
      after: perimeterAfter,
      ratio: perimeterBefore > M.EPSILON ? perimeterAfter / perimeterBefore : Number.NaN,
    },
    parallelism: {
      // Une transformation affine conserve TOUJOURS le parallélisme : ce n'est
      // pas une hypothèse, c'est mesuré sur les côtés de la figure.
      preserved: isPolygon ? parallelismPreserved(sourceVertices, imageVertices) : true,
      before: null,
      after: null,
    },
    orientation: isPolygon ? {
      preserved: orientationBefore === orientationAfter,
      before: orientationBefore,
      after: orientationAfter,
    } : null,
    coordinates: {
      // Les coordonnées ne sont conservées que si RIEN n'a bougé.
      preserved: sourceVertices.every((vertex, i) => M.samePoint(vertex, imageVertices[i])),
      before: sourceVertices,
      after: imageVertices,
    },
  };
}

/** Deux longueurs (ou deux aires) sont-elles la même, à la tolérance relative près ? */
function close(a, b, tolerance = 1e-9) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const scale = Math.max(1, Math.abs(a), Math.abs(b));

  return Math.abs(a - b) <= tolerance * scale;
}

function listsClose(first, second, tolerance = 1e-9) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) return false;

  return first.every((value, i) => close(value, second[i], tolerance));
}

/**
 * Le parallélisme, mesuré : chaque paire de côtés parallèles AVANT l'est-elle
 * encore APRÈS ? (et réciproquement — une transformation qui rendrait
 * parallèles deux côtés qui ne l'étaient pas ne conserverait pas davantage.)
 */
function parallelismPreserved(before, after) {
  const edgesBefore = edgesOf(before);
  const edgesAfter = edgesOf(after);
  if (edgesBefore.length !== edgesAfter.length) return false;

  for (let i = 0; i < edgesBefore.length; i += 1) {
    for (let j = i + 1; j < edgesBefore.length; j += 1) {
      if (parallel(edgesBefore[i], edgesBefore[j]) !== parallel(edgesAfter[i], edgesAfter[j])) return false;
    }
  }

  return true;
}

function edgesOf(vertices) {
  return vertices.map((vertex, i) => {
    const next = vertices[(i + 1) % vertices.length];

    return { x: next.x - vertex.x, y: next.y - vertex.y };
  });
}

function parallel(u, v) {
  const cross = u.x * v.y - u.y * v.x;
  const scale = Math.max(1, Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));

  return Math.abs(cross) <= 1e-9 * scale;
}

// ── La formule en coordonnées (§26) ──────────────────────────────────────

/**
 * La description d'un pas en COORDONNÉES, avec ses paramètres réels.
 *
 * On ne rend pas une chaîne traduite — la traduction appartient à l'interface
 * — mais une STRUCTURE : la clé i18n et ses valeurs. Le composant l'habille
 * en français, le test la lit en JavaScript, et la formule reste juste dans les
 * deux cas.
 */
export function coordinateFormula(step, vertices = []) {
  if (!step) return null;
  switch (step.kind) {
    case 'translation':
      return { key: 'translation', params: { a: Number(step.vx), b: Number(step.vy) } };
    case 'dilation': {
      const center = resolveCenter(step.center, vertices);

      return { key: center.x === 0 && center.y === 0 ? 'dilationOrigin' : 'dilationCenter', params: { k: Number(step.k), cx: center.x, cy: center.y } };
    }
    case 'rotation': {
      const center = resolveCenter(step.center, vertices);
      const angle = M.normalizeAngle(Number(step.angle));
      const atOrigin = center.x === 0 && center.y === 0;
      // Les quarts de tour ont une formule EXACTE et mémorable : on la donne.
      if (atOrigin && Math.abs(angle % 90) < M.EPSILON) {
        const quarter = ((Math.round(angle / 90) % 4) + 4) % 4;

        return { key: ['rotation0', 'rotation90', 'rotation180', 'rotation270'][quarter], params: {} };
      }

      return { key: atOrigin ? 'rotationOrigin' : 'rotationCenter', params: { angle, cx: center.x, cy: center.y } };
    }
    case 'reflection': {
      const axis = step.axis ?? {};
      switch (axis.type) {
        case 'xAxis': return { key: 'reflectX', params: {} };
        case 'yAxis': return { key: 'reflectY', params: {} };
        case 'origin': return { key: 'reflectOrigin', params: {} };
        case 'diagonal': return { key: 'reflectDiagonal', params: {} };
        case 'antidiagonal': return { key: 'reflectAntidiagonal', params: {} };
        case 'horizontal': return { key: 'reflectHorizontal', params: { c: Number(axis.value) || 0 } };
        case 'vertical': return { key: 'reflectVertical', params: { c: Number(axis.value) || 0 } };
        default: return { key: 'reflectLine', params: {} };
      }
    }
    default:
      return null;
  }
}

/** Le libellé structuré d'un pas, pour la pile et l'historique (§21). */
export function describeStep(step, vertices = []) {
  if (!step) return null;
  switch (step.kind) {
    case 'translation':
      return { key: 'translation', params: { a: Number(step.vx), b: Number(step.vy) } };
    case 'rotation': {
      const center = resolveCenter(step.center, vertices);

      return { key: 'rotation', params: { angle: Number(step.angle), cx: center.x, cy: center.y, atOrigin: center.x === 0 && center.y === 0 } };
    }
    case 'dilation': {
      const center = resolveCenter(step.center, vertices);

      return { key: 'dilation', params: { k: Number(step.k), cx: center.x, cy: center.y, atOrigin: center.x === 0 && center.y === 0 } };
    }
    case 'reflection':
      return { key: 'reflection', params: { axis: step.axis?.type ?? 'xAxis', value: Number(step.axis?.value) || 0 } };
    default:
      return null;
  }
}
