/**
 * LES EXPÉRIENCES (§27) — des montages, pas des exercices.
 *
 * « These are not traditional exercises. They are interactive experiments. »
 * Chacune n'est donc qu'une SCÈNE de départ et un réglage : aucune question,
 * aucune réponse attendue, aucune correction. L'élève arrive dans un plan
 * déjà gréé et il tire dessus — c'est le geste du مختبر tout entier
 * (INTERACTION_PEDAGOGY : manipuler → observer → représenter → formuler).
 *
 * Une expérience ne verrouille rien : tout y reste glissable, et « استكشاف
 * حرّ » (§28) est le mode par défaut, pas une expérience parmi d'autres.
 */

import {
  emptyScene, addFreePoint, addFreeVector, addPointsVector, addCombination,
  addScaled, addMidpoint, addImagePoint, addPolygon, translatePolygon,
} from './vectorState.js';

/**
 * @typedef {object} VectorExperiment
 * @property {string} id                 son identifiant, enregistré dans le document
 * @property {string} labelKey           sa clé i18n (namespace mathlab)
 * @property {() => object} build        la scène de départ
 * @property {object} [settings]         les réglages qu'elle allume (angles, longueurs, analyse)
 * @property {(scene: object) => object} [select]  ce qu'elle sélectionne à l'ouverture
 */

const lastVector = (scene) => scene.vectors[scene.vectors.length - 1];
const lastPoint = (scene) => scene.points[scene.points.length - 1];

/** « جمع شعاعين » : deux أشعة et leur somme, bout à bout (§11). */
function buildAddition() {
  let scene = addFreeVector(emptyScene(), { x: 3, y: 2, origin: { x: -4, y: -2 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addFreeVector(scene, { x: 1, y: 4, origin: { x: -4, y: -2 }, name: 'v' });
  const v = lastVector(scene).id;
  scene = addCombination(scene, 'sum', u, v, 'tipToTail');

  return { scene, select: { vectors: [u, v] } };
}

/** « قاعدة متوازي الأضلاع » : la même somme, vue par le parallélogramme (§12). */
function buildParallelogram() {
  let scene = addFreeVector(emptyScene(), { x: 4, y: 1, origin: { x: -3, y: -2 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addFreeVector(scene, { x: 1, y: 3, origin: { x: -3, y: -2 }, name: 'v' });
  const v = lastVector(scene).id;
  scene = addCombination(scene, 'sum', u, v, 'parallelogram');

  return { scene, select: { vectors: [u, v] } };
}

/** « طرح شعاعين » : u − v montré comme u + (−v) (§13). */
function buildSubtraction() {
  let scene = addFreeVector(emptyScene(), { x: 4, y: 3, origin: { x: -2, y: -1 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addFreeVector(scene, { x: 1, y: 4, origin: { x: -2, y: -1 }, name: 'v' });
  const v = lastVector(scene).id;
  scene = addCombination(scene, 'difference', u, v, 'tipToTail');

  return { scene, select: { vectors: [u, v] } };
}

/**
 * « ضرب شعاع في عدد » : u et k·u, curseur en main (§14, §15).
 * C'est l'expérience « wow » du cahier des charges : elle ouvre donc sur un
 * k déjà différent de 1, pour que l'élève VOIE d'emblée les deux أشعة.
 */
function buildScalar() {
  let scene = addFreeVector(emptyScene(), { x: 2, y: 1, origin: { x: 0, y: 0 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addScaled(scene, u, 2);
  const scaled = lastVector(scene).id;

  return { scene, select: { vectors: [scaled] } };
}

/** « الانسحاب » : un point, un شعاع, l'image (§16). */
function buildTranslation() {
  let scene = addFreePoint(emptyScene(), { x: -3, y: 1, name: 'A' });
  const a = lastPoint(scene).id;
  scene = addFreeVector(scene, { x: 4, y: -1, origin: { x: -3, y: 1 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addImagePoint(scene, a, u);

  return { scene, select: { points: [a], vectors: [u] } };
}

/** « انسحاب مثلث » : le triangle et son image (§17). */
function buildShapeTranslation() {
  let scene = emptyScene();
  scene = addFreePoint(scene, { x: -5, y: -2, name: 'A' });
  scene = addFreePoint(scene, { x: -2, y: -2, name: 'B' });
  scene = addFreePoint(scene, { x: -4, y: 1, name: 'C' });
  const vertices = scene.points.map((p) => p.id);
  scene = addFreeVector(scene, { x: 6, y: 2, origin: { x: -5, y: -2 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addPolygon(scene, vertices, 'ABC');
  scene = translatePolygon(scene, scene.polygons[0].id, u);

  return { scene, select: { vectors: [u] } };
}

/** « التوازي » : deux أشعة colinéaires, à comparer (§21). */
function buildParallel() {
  let scene = addFreeVector(emptyScene(), { x: 2, y: 4, origin: { x: -5, y: -3 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addFreeVector(scene, { x: 1, y: 2, origin: { x: 1, y: -3 }, name: 'v' });
  const v = lastVector(scene).id;

  return { scene, select: { vectors: [u, v] }, settings: { analysis: 'parallel' } };
}

/**
 * « التعامد » : deux أشعة à ajuster jusqu'à ce que le produit scalaire
 * s'annule (§27). Hors programme de 4AM, donc jamais ouverte par défaut —
 * mais disponible pour qui veut chercher.
 */
function buildPerpendicular() {
  let scene = addFreeVector(emptyScene(), { x: 4, y: 1, origin: { x: 0, y: 0 }, name: 'u' });
  const u = lastVector(scene).id;
  scene = addFreeVector(scene, { x: -1, y: 3, origin: { x: 0, y: 0 }, name: 'v' });
  const v = lastVector(scene).id;

  return { scene, select: { vectors: [u, v] }, settings: { analysis: 'perpendicular' } };
}

/** « المنتصف والمسافة » : deux points, leur milieu, leur distance (§18, §19). */
function buildMidpoint() {
  let scene = addFreePoint(emptyScene(), { x: -4, y: -2, name: 'A' });
  const a = lastPoint(scene).id;
  scene = addFreePoint(scene, { x: 4, y: 3, name: 'B' });
  const b = lastPoint(scene).id;
  scene = addPointsVector(scene, a, b);
  scene = addMidpoint(scene, a, b);

  return { scene, select: { points: [a, b] }, settings: { showLengths: true } };
}

/** « الاستقامية » : trois points à aligner (§22). */
function buildCollinear() {
  let scene = addFreePoint(emptyScene(), { x: -4, y: -2, name: 'A' });
  const a = lastPoint(scene).id;
  scene = addFreePoint(scene, { x: 0, y: 1, name: 'B' });
  const b = lastPoint(scene).id;
  scene = addFreePoint(scene, { x: 4, y: 3, name: 'C' });
  const c = lastPoint(scene).id;

  return { scene, select: { points: [a, b, c] }, settings: { analysis: 'collinear' } };
}

/** @type {ReadonlyArray<VectorExperiment>} */
export const EXPERIMENTS = Object.freeze([
  { id: 'addition', labelKey: 'tools.vectors.experiments.addition', build: buildAddition },
  { id: 'parallelogram', labelKey: 'tools.vectors.experiments.parallelogram', build: buildParallelogram },
  { id: 'subtraction', labelKey: 'tools.vectors.experiments.subtraction', build: buildSubtraction },
  { id: 'scalar', labelKey: 'tools.vectors.experiments.scalar', build: buildScalar },
  { id: 'translation', labelKey: 'tools.vectors.experiments.translation', build: buildTranslation },
  { id: 'shape', labelKey: 'tools.vectors.experiments.shape', build: buildShapeTranslation },
  { id: 'midpoint', labelKey: 'tools.vectors.experiments.midpoint', build: buildMidpoint },
  { id: 'parallel', labelKey: 'tools.vectors.experiments.parallel', build: buildParallel },
  { id: 'collinear', labelKey: 'tools.vectors.experiments.collinear', build: buildCollinear },
  { id: 'perpendicular', labelKey: 'tools.vectors.experiments.perpendicular', build: buildPerpendicular },
]);

export function getExperiment(id) {
  return EXPERIMENTS.find((experiment) => experiment.id === id) ?? null;
}
