/**
 * L'ÉTAT de la géométrie dans l'espace (الهندسة ثلاثية الأبعاد) — logique
 * pure, sans React ni three.js.
 *
 *     data = {
 *       shape:            'cube' | 'cuboid' | 'sphere' | 'cylinder' | 'cone',
 *       dimensions:       { side } | { length, width, height } | { radius } | { radius, height },
 *       showAxes:         boolean,
 *       showGrid:         boolean,
 *       showMeasurements: boolean,
 *       camera:           { position: [x, y, z], target: [x, y, z] } | null   // null = la vue par défaut
 *     }
 *
 * `dimensions` ne porte que les paramètres du solide courant, chacun dans
 * [DIMENSION_MIN, DIMENSION_MAX] : un document ne peut pas décrire un rayon
 * négatif ni un cube de mille unités qui écraserait la vue. `camera` est
 * l'état d'OrbitControls (position et cible, dans le repère de three.js) ;
 * absent ou incohérent → la vue par défaut, cadrée sur le solide.
 *
 * GEOMETRY3D_SCHEMA_VERSION est la version de CE format.
 */

export const GEOMETRY3D_SCHEMA_VERSION = 1;

/** Les bornes d'une dimension : assez large pour explorer, assez serrée pour rester lisible. */
export const DIMENSION_MIN = 0.5;
export const DIMENSION_MAX = 10;
export const DIMENSION_STEP = 0.1;

/**
 * Les solides de la V1, dans l'ordre du sélecteur. `params` sont les
 * dimensions dans l'ordre d'affichage ; `defaults` celles d'un solide qui
 * vient d'être choisi. Le cube par défaut mesure 2 : l'élève voit tout de
 * suite un solide reconnaissable, ni minuscule ni écrasant.
 */
export const SHAPES = Object.freeze([
  Object.freeze({ id: 'cube', params: Object.freeze(['side']), defaults: Object.freeze({ side: 2 }) }),
  Object.freeze({ id: 'cuboid', params: Object.freeze(['length', 'width', 'height']), defaults: Object.freeze({ length: 4, width: 2, height: 3 }) }),
  Object.freeze({ id: 'sphere', params: Object.freeze(['radius']), defaults: Object.freeze({ radius: 2 }) }),
  Object.freeze({ id: 'cylinder', params: Object.freeze(['radius', 'height']), defaults: Object.freeze({ radius: 1.5, height: 3 }) }),
  Object.freeze({ id: 'cone', params: Object.freeze(['radius', 'height']), defaults: Object.freeze({ radius: 1.5, height: 3 }) }),
]);

export const SHAPE_IDS = Object.freeze(SHAPES.map((shape) => shape.id));

const DEFAULT_SHAPE = 'cube';

/** La lettre de chaque dimension dans les formules et sur le solide — celle des manuels. */
export const PARAM_SYMBOLS = Object.freeze({ side: 'a', length: 'L', width: 'l', height: 'h', radius: 'r' });

/** @returns {{id: string, params: readonly string[], defaults: Readonly<Record<string, number>>}} */
export function getShape(id) {
  return SHAPES.find((shape) => shape.id === id) ?? SHAPES[0];
}

export function isShapeId(id) {
  return SHAPE_IDS.includes(id);
}

/** Une valeur saisie ou stockée → une dimension sûre : finie, arrondie au pas, dans les bornes. */
export function clampDimension(value, fallback = DIMENSION_MIN) {
  const number = typeof value === 'string' ? Number(value.replace(',', '.').replace('−', '-')) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) return fallback;
  const bounded = Math.min(DIMENSION_MAX, Math.max(DIMENSION_MIN, number));

  return Math.round(bounded * 1000) / 1000;
}

/** Une dimension est-elle acceptable telle quelle (sans la corriger) ? */
export function isValidDimension(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= DIMENSION_MIN && value <= DIMENSION_MAX;
}

/** Les dimensions d'un solide, complètes et sûres : les paramètres connus seulement, chacun borné ou par défaut. */
export function normalizeDimensions(shapeId, raw) {
  const shape = getShape(shapeId);
  const source = raw && typeof raw === 'object' ? raw : {};
  const dimensions = {};
  for (const param of shape.params) {
    dimensions[param] = clampDimension(source[param], shape.defaults[param]);
  }

  return dimensions;
}

/**
 * Les dimensions à donner à un solide qu'on vient de CHOISIR, à partir de
 * celles du précédent : ce qui porte le même nom est conservé (le rayon et
 * la hauteur passent du cylindre au cône), un cube devient un pavé de mêmes
 * arêtes, un pavé devient un cube de côté sa longueur. Le reste prend les
 * valeurs par défaut.
 */
export function dimensionsForShape(nextShapeId, previousShapeId = null, previousDimensions = {}) {
  const next = getShape(nextShapeId);
  const previous = previousShapeId ? getShape(previousShapeId) : null;
  const carried = {};
  for (const param of next.params) {
    if (previous && previous.params.includes(param) && isValidDimension(previousDimensions[param])) {
      carried[param] = previousDimensions[param];
    }
  }
  if (next.id === 'cuboid' && previous?.id === 'cube' && isValidDimension(previousDimensions.side)) {
    carried.length = carried.width = carried.height = previousDimensions.side;
  }
  if (next.id === 'cube' && previous?.id === 'cuboid' && isValidDimension(previousDimensions.length)) {
    carried.side = previousDimensions.length;
  }

  return normalizeDimensions(next.id, { ...next.defaults, ...carried });
}

function isVector3(value) {
  return Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

/** L'état de caméra d'un document → sûr, ou null (la vue par défaut). */
export function normalizeCamera(raw) {
  if (!raw || typeof raw !== 'object' || !isVector3(raw.position) || !isVector3(raw.target)) return null;
  const distance = Math.hypot(raw.position[0] - raw.target[0], raw.position[1] - raw.target[1], raw.position[2] - raw.target[2]);
  if (!(distance > 1e-6) || distance > 1e4) return null;

  return {
    position: raw.position.map((n) => Math.round(n * 1000) / 1000),
    target: raw.target.map((n) => Math.round(n * 1000) / 1000),
  };
}

/** N'importe quel `data` (document, amorce, version antérieure) → l'état V1 complet et sûr. */
export function normalizeGeometry3DData(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const shape = isShapeId(source.shape) ? source.shape : DEFAULT_SHAPE;

  return {
    shape,
    dimensions: normalizeDimensions(shape, source.dimensions),
    showAxes: source.showAxes !== false,
    showGrid: source.showGrid !== false,
    showMeasurements: source.showMeasurements !== false,
    camera: normalizeCamera(source.camera),
  };
}

/**
 * L'état d'un document neuf : un cube d'arête 2, axes, grille et mesures
 * visibles, la vue par défaut. Une amorce de leçon (openMathLab.js) peut
 * fixer `{ shape, dimensions?, showAxes?, showGrid?, showMeasurements? }`.
 */
export function createGeometry3DData(seed = undefined) {
  if (seed && typeof seed === 'object' && isShapeId(seed.shape)) {
    return normalizeGeometry3DData({ ...seed, camera: null });
  }

  return normalizeGeometry3DData({ shape: DEFAULT_SHAPE });
}

/** Deux états de caméra décrivent-ils la même vue (au millième près) ? */
export function sameCamera(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;

  return [0, 1, 2].every((i) => Math.abs(a.position[i] - b.position[i]) < 1e-3 && Math.abs(a.target[i] - b.target[i]) < 1e-3);
}
