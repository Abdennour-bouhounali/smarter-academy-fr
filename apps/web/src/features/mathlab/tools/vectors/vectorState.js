/**
 * L'ÉTAT du labo des vecteurs — logique pure, sans React.
 *
 *     data = {
 *       scene:    { points: [...], vectors: [...], polygons: [...] },
 *       history:  [scene, scene, …],   // le CHEMIN, comme en algèbre
 *       cursor:   number,              // d'où viennent Annuler / Rétablir
 *       viewport: {xMin, xMax, yMin, yMax} | null,
 *       selection:{ points: [id…], vectors: [id…] },
 *       settings: { grid, snap, showAngles, showLengths, analysis },
 *       experiment: string | null,     // l'expérience ouverte (§27)
 *       explorer: { vectorId, a, b } | null   // le mode paramétré (§26)
 *     }
 *
 * L'historique (§30) est le même objet que la scène : un tableau d'états, un
 * curseur. « Annuler » recule le curseur, il ne défait rien — c'est le modèle
 * déjà retenu pour le labo d'algèbre (algebraState.js), et il a le même
 * avantage : l'élève peut revenir en avant tant qu'il n'a pas rejoué.
 *
 * VECTORS_SCHEMA_VERSION est la version de CE format.
 */

import {
  POINT_KINDS, VECTOR_KINDS, MAX_POINTS, MAX_VECTORS, MAX_POLYGONS, MAX_POLYGON_VERTICES,
  VECTOR_PALETTE, CONSTRUCTION_COLOR, clampCoord, newId, nextName, nextColor,
  POINT_NAMES, VECTOR_NAMES,
} from './vectorScene.js';
import { normalizeViewport, isValidViewport } from '../functionGrapher/viewport.js';

export const VECTORS_SCHEMA_VERSION = 1;

/**
 * La profondeur de l'historique.
 *
 * Chaque pas garde une COPIE de la scène entière : le coût du document est
 * donc `MAX_HISTORY × taille de la scène`, et c'est lui qui décide du
 * plafond d'octets côté serveur (MathLabTools.php). Vingt pas couvrent
 * largement une séance — au pire absolu (26 points, 12 vecteurs, vingt pas)
 * le document pèse ~65 Ko, très en deçà des 120 Ko accordés ; au-delà, on
 * oublie les plus anciens. `vectorState.test.js` tient cette borne.
 */
export const MAX_HISTORY = 20;

/** La fenêtre d'ouverture : le repère du manuel, centré sur l'origine. */
export const DEFAULT_VECTORS_VIEWPORT = Object.freeze({ xMin: -8, xMax: 8, yMin: -6, yMax: 6 });

export const ANALYSIS_KINDS = Object.freeze(['none', 'parallel', 'perpendicular', 'collinear', 'dot']);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function readName(raw, fallback) {
  return typeof raw === 'string' && raw.trim() && raw.length <= 8 ? raw.trim() : fallback;
}

function readColor(raw, fallback) {
  return typeof raw === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

function readId(raw) {
  return typeof raw === 'string' && raw.length > 0 && raw.length <= 64 ? raw : null;
}

// ── La relecture d'un document (la frontière avec le JSON stocké) ─────────

function normalizePoint(raw, index) {
  if (!isPlainObject(raw)) return null;
  const id = readId(raw.id) ?? newId('pt');
  const kind = POINT_KINDS.includes(raw.kind) ? raw.kind : 'free';
  const name = readName(raw.name, POINT_NAMES[index % POINT_NAMES.length]);
  const base = { id, kind, name, color: readColor(raw.color, null) };

  if (kind === 'free') {
    return { ...base, x: clampCoord(Number(raw.x)), y: clampCoord(Number(raw.y)) };
  }
  if (kind === 'midpoint') {
    const of = Array.isArray(raw.of) ? raw.of.map(readId) : [];
    if (of.length !== 2 || of.some((v) => !v)) return null;

    return { ...base, of };
  }
  // image
  const of = readId(raw.of);
  const by = readId(raw.by);
  if (!of || !by) return null;

  return { ...base, of, by };
}

function normalizeVector(raw, index) {
  if (!isPlainObject(raw)) return null;
  const id = readId(raw.id) ?? newId('vec');
  const kind = VECTOR_KINDS.includes(raw.kind) ? raw.kind : 'free';
  const name = readName(raw.name, VECTOR_NAMES[index % VECTOR_NAMES.length]);
  const base = {
    id,
    kind,
    name,
    color: readColor(raw.color, VECTOR_PALETTE[index % VECTOR_PALETTE.length]),
  };

  if (kind === 'free') {
    const origin = isPlainObject(raw.origin) ? raw.origin : {};

    return {
      ...base,
      x: clampCoord(Number(raw.x)),
      y: clampCoord(Number(raw.y)),
      origin: { x: clampCoord(Number(origin.x)), y: clampCoord(Number(origin.y)) },
    };
  }
  if (kind === 'points') {
    const from = readId(raw.from);
    const to = readId(raw.to);
    if (!from || !to) return null;

    return { ...base, from, to };
  }
  if (kind === 'sum' || kind === 'difference') {
    const of = Array.isArray(raw.of) ? raw.of.map(readId) : [];
    if (of.length !== 2 || of.some((v) => !v)) return null;

    return { ...base, of, method: raw.method === 'parallelogram' ? 'parallelogram' : 'tipToTail' };
  }
  // scaled
  const of = readId(raw.of);
  if (!of) return null;
  const k = Number.isFinite(raw.k) ? Math.max(-10, Math.min(10, Math.round(raw.k * 100) / 100)) : 2;

  return { ...base, of, k };
}

function normalizePolygon(raw, index) {
  if (!isPlainObject(raw)) return null;
  const id = readId(raw.id) ?? newId('poly');
  const vertices = (Array.isArray(raw.vertices) ? raw.vertices : []).map(readId).filter(Boolean);
  if (vertices.length < 3 || vertices.length > MAX_POLYGON_VERTICES) return null;

  return {
    id,
    name: readName(raw.name, `P${index + 1}`),
    vertices,
    color: readColor(raw.color, CONSTRUCTION_COLOR),
  };
}

/**
 * Une scène stockée → une scène SÛRE et COHÉRENTE : bornée, sans doublon
 * d'identifiant, et surtout sans référence morte — un objet qui désignait un
 * point disparu est écarté, jamais gardé « au cas où ». C'est la garantie
 * que `resolveScene` n'a à traiter que des cas réels.
 */
export function normalizeScene(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const seenIds = new Set();

  const points = [];
  for (const [index, entry] of (Array.isArray(source.points) ? source.points : []).entries()) {
    if (points.length >= MAX_POINTS) break;
    const point = normalizePoint(entry, index);
    if (!point || seenIds.has(point.id)) continue;
    seenIds.add(point.id);
    points.push(point);
  }

  const vectors = [];
  for (const [index, entry] of (Array.isArray(source.vectors) ? source.vectors : []).entries()) {
    if (vectors.length >= MAX_VECTORS) break;
    const vector = normalizeVector(entry, index);
    if (!vector || seenIds.has(vector.id)) continue;
    seenIds.add(vector.id);
    vectors.push(vector);
  }

  const polygons = [];
  for (const [index, entry] of (Array.isArray(source.polygons) ? source.polygons : []).entries()) {
    if (polygons.length >= MAX_POLYGONS) break;
    const polygon = normalizePolygon(entry, index);
    if (!polygon || seenIds.has(polygon.id)) continue;
    seenIds.add(polygon.id);
    polygons.push(polygon);
  }

  return pruneDanglingReferences({ points, vectors, polygons });
}

/**
 * Écarte tout objet qui désigne un identifiant absent, en boucle : ⃗AB perd
 * A, donc la somme perd ⃗AB, donc l'image perd la somme.
 */
function pruneDanglingReferences(scene) {
  let points = scene.points;
  let vectors = scene.vectors;
  let changed = true;

  while (changed) {
    changed = false;
    const pointIds = new Set(points.map((p) => p.id));
    const vectorIds = new Set(vectors.map((v) => v.id));

    const keptPoints = points.filter((p) => {
      if (p.kind === 'midpoint') return p.of.every((id) => pointIds.has(id));
      if (p.kind === 'image') return pointIds.has(p.of) && vectorIds.has(p.by);

      return true;
    });
    const keptVectors = vectors.filter((v) => {
      if (v.kind === 'points') return pointIds.has(v.from) && pointIds.has(v.to);
      if (v.kind === 'sum' || v.kind === 'difference') return v.of.every((id) => vectorIds.has(id));
      if (v.kind === 'scaled') return vectorIds.has(v.of);

      return true;
    });
    if (keptPoints.length !== points.length || keptVectors.length !== vectors.length) {
      changed = true;
      points = keptPoints;
      vectors = keptVectors;
    }
  }

  const pointIds = new Set(points.map((p) => p.id));

  return {
    points,
    vectors,
    polygons: scene.polygons.filter((poly) => poly.vertices.every((id) => pointIds.has(id))),
  };
}

function normalizeSettings(raw) {
  const source = isPlainObject(raw) ? raw : {};

  return {
    grid: source.grid !== false,
    snap: source.snap !== false,
    showLengths: source.showLengths === true,
    showAngles: source.showAngles === true,
    analysis: ANALYSIS_KINDS.includes(source.analysis) ? source.analysis : 'none',
  };
}

function normalizeSelection(raw, scene) {
  const source = isPlainObject(raw) ? raw : {};
  const pointIds = new Set(scene.points.map((p) => p.id));
  const vectorIds = new Set(scene.vectors.map((v) => v.id));
  const read = (list, allowed) => (Array.isArray(list) ? list.map(readId).filter((id) => id && allowed.has(id)) : []).slice(0, 3);

  return { points: read(source.points, pointIds), vectors: read(source.vectors, vectorIds) };
}

function normalizeExplorer(raw, scene) {
  if (!isPlainObject(raw)) return null;
  const vectorId = readId(raw.vectorId);
  if (!vectorId || !scene.vectors.some((v) => v.id === vectorId && v.kind === 'free')) return null;

  return { vectorId };
}

/** N'importe quel `data` → l'état V1 complet et sûr. */
export function normalizeVectorsData(raw) {
  const source = isPlainObject(raw) ? raw : {};

  const historySource = Array.isArray(source.history) && source.history.length > 0
    ? source.history
    : [source.scene];
  const history = historySource
    .slice(-MAX_HISTORY)
    .map(normalizeScene);
  if (history.length === 0) history.push(normalizeScene(null));

  const cursor = Number.isInteger(source.cursor)
    ? Math.max(0, Math.min(history.length - 1, source.cursor))
    : history.length - 1;

  const scene = history[cursor];

  return {
    history,
    cursor,
    viewport: isValidViewport(source.viewport) ? normalizeViewport(source.viewport) : null,
    selection: normalizeSelection(source.selection, scene),
    settings: normalizeSettings(source.settings),
    experiment: typeof source.experiment === 'string' && source.experiment.length <= 40 ? source.experiment : null,
    explorer: normalizeExplorer(source.explorer, scene),
  };
}

/** Ce qui part au serveur : l'historique n'emporte que ce qu'il faut pour Annuler / Rétablir. */
export function serializeVectorsData(data) {
  return {
    history: data.history,
    cursor: data.cursor,
    viewport: data.viewport,
    selection: data.selection,
    settings: data.settings,
    experiment: data.experiment,
    explorer: data.explorer,
  };
}

/** La scène AFFICHÉE — celle du curseur. */
export function currentScene(data) {
  return data.history[data.cursor];
}

// ── L'historique (§30) ────────────────────────────────────────────────────

/**
 * Empile une nouvelle scène. Rejouer après un retour en arrière COUPE la
 * branche abandonnée : c'est la règle de tout l'atelier, et celle que
 * l'élève attend de n'importe quel éditeur.
 */
export function pushScene(data, scene) {
  const next = pruneDanglingReferences(scene);
  const kept = data.history.slice(0, data.cursor + 1);
  kept.push(next);
  const trimmed = kept.length > MAX_HISTORY ? kept.slice(kept.length - MAX_HISTORY) : kept;

  return {
    ...data,
    history: trimmed,
    cursor: trimmed.length - 1,
    // Une sélection qui désignait un objet disparu n'a plus de sens.
    selection: normalizeSelection(data.selection, next),
    explorer: normalizeExplorer(data.explorer, next),
  };
}

/**
 * Un changement CONTINU (un glissement, un curseur k) : il remplace la scène
 * courante au lieu d'en empiler une. Sans cela, traverser le plan avec un
 * point produirait deux cents pas d'historique et « Annuler » ne reculerait
 * que d'un pixel — l'annulation doit défaire un GESTE, pas une image.
 */
export function replaceScene(data, scene) {
  const next = pruneDanglingReferences(scene);
  const history = [...data.history];
  history[data.cursor] = next;

  return { ...data, history };
}

export const canUndo = (data) => data.cursor > 0;
export const canRedo = (data) => data.cursor < data.history.length - 1;

export function undo(data) {
  if (!canUndo(data)) return data;
  const cursor = data.cursor - 1;

  return { ...data, cursor, selection: normalizeSelection(data.selection, data.history[cursor]), explorer: normalizeExplorer(data.explorer, data.history[cursor]) };
}

export function redo(data) {
  if (!canRedo(data)) return data;
  const cursor = data.cursor + 1;

  return { ...data, cursor, selection: normalizeSelection(data.selection, data.history[cursor]), explorer: normalizeExplorer(data.explorer, data.history[cursor]) };
}

// ── Les gestes de construction ────────────────────────────────────────────

const usedPointNames = (scene) => scene.points.map((p) => p.name);
const usedVectorNames = (scene) => scene.vectors.map((v) => v.name);

/** Un point libre. */
export function addFreePoint(scene, { x, y, name = null }) {
  if (scene.points.length >= MAX_POINTS) return scene;
  const point = {
    id: newId('pt'),
    kind: 'free',
    name: name ?? nextName(usedPointNames(scene), POINT_NAMES),
    x: clampCoord(x),
    y: clampCoord(y),
    color: null,
  };

  return { ...scene, points: [...scene.points, point] };
}

/** ⃗AB, tenu par ses deux points (§5). */
export function addPointsVector(scene, fromId, toId) {
  if (scene.vectors.length >= MAX_VECTORS) return scene;
  if (fromId === toId) return scene;
  if (!scene.points.some((p) => p.id === fromId) || !scene.points.some((p) => p.id === toId)) return scene;
  const vector = {
    id: newId('vec'),
    kind: 'points',
    name: nextName(usedVectorNames(scene), VECTOR_NAMES),
    from: fromId,
    to: toId,
    color: nextColor(scene.vectors.map((v) => v.color)),
  };

  return { ...scene, vectors: [...scene.vectors, vector] };
}

/** Un vecteur LIBRE, posé où on veut (§6). */
export function addFreeVector(scene, { x, y, origin = { x: 0, y: 0 }, name = null }) {
  if (scene.vectors.length >= MAX_VECTORS) return scene;
  const vector = {
    id: newId('vec'),
    kind: 'free',
    name: name ?? nextName(usedVectorNames(scene), VECTOR_NAMES),
    x: clampCoord(x),
    y: clampCoord(y),
    origin: { x: clampCoord(origin.x), y: clampCoord(origin.y) },
    color: nextColor(scene.vectors.map((v) => v.color)),
  };

  return { ...scene, vectors: [...scene.vectors, vector] };
}

/** u + v (§11) ou u − v (§13). */
export function addCombination(scene, kind, uId, vId, method = 'tipToTail') {
  if (scene.vectors.length >= MAX_VECTORS) return scene;
  if (!['sum', 'difference'].includes(kind)) return scene;
  const ids = [uId, vId];
  if (!ids.every((id) => scene.vectors.some((v) => v.id === id))) return scene;
  const vector = {
    id: newId('vec'),
    kind,
    name: nextName(usedVectorNames(scene), VECTOR_NAMES),
    of: ids,
    method,
    color: CONSTRUCTION_COLOR,
  };

  return { ...scene, vectors: [...scene.vectors, vector] };
}

/** k·u (§14). */
export function addScaled(scene, uId, k = 2) {
  if (scene.vectors.length >= MAX_VECTORS) return scene;
  if (!scene.vectors.some((v) => v.id === uId)) return scene;
  const vector = {
    id: newId('vec'),
    kind: 'scaled',
    name: nextName(usedVectorNames(scene), VECTOR_NAMES),
    of: uId,
    k,
    color: CONSTRUCTION_COLOR,
  };

  return { ...scene, vectors: [...scene.vectors, vector] };
}

/** Le milieu de [AB] (§18). */
export function addMidpoint(scene, aId, bId) {
  if (scene.points.length >= MAX_POINTS) return scene;
  if (aId === bId) return scene;
  if (![aId, bId].every((id) => scene.points.some((p) => p.id === id))) return scene;
  const point = {
    id: newId('pt'),
    kind: 'midpoint',
    name: nextName(usedPointNames(scene), ['M', 'N', 'I', 'J', ...POINT_NAMES]),
    of: [aId, bId],
    color: CONSTRUCTION_COLOR,
  };

  return { ...scene, points: [...scene.points, point] };
}

/** L'image d'un point par une translation (§16) : A′ = A + u. */
export function addImagePoint(scene, pointId, vectorId) {
  if (scene.points.length >= MAX_POINTS) return scene;
  const parent = scene.points.find((p) => p.id === pointId);
  if (!parent || !scene.vectors.some((v) => v.id === vectorId)) return scene;
  const point = {
    id: newId('pt'),
    kind: 'image',
    // A′ : le nom du manuel pour une image.
    name: nextName(usedPointNames(scene), [`${parent.name}′`, ...POINT_NAMES]),
    of: pointId,
    by: vectorId,
    color: CONSTRUCTION_COLOR,
  };

  return { ...scene, points: [...scene.points, point] };
}

/** Un polygone (§17), et son image par une translation. */
export function addPolygon(scene, vertexIds, name = null) {
  if (scene.polygons.length >= MAX_POLYGONS) return scene;
  const vertices = vertexIds.filter((id) => scene.points.some((p) => p.id === id));
  if (vertices.length < 3 || vertices.length > MAX_POLYGON_VERTICES) return scene;
  const polygon = {
    id: newId('poly'),
    name: name ?? `P${scene.polygons.length + 1}`,
    vertices,
    color: VECTOR_PALETTE[scene.polygons.length % VECTOR_PALETTE.length],
  };

  return { ...scene, polygons: [...scene.polygons, polygon] };
}

/**
 * Le polygone translaté (§17) : chaque sommet devient une IMAGE, et le
 * polygone image est fait de ces images. Rien n'est copié — la forme
 * translatée suit, et elle conserve longueurs, angles, orientation parce
 * qu'elle est calculée, pas dessinée.
 */
export function translatePolygon(scene, polygonId, vectorId) {
  const polygon = scene.polygons.find((p) => p.id === polygonId);
  if (!polygon || !scene.vectors.some((v) => v.id === vectorId)) return scene;
  if (scene.polygons.length >= MAX_POLYGONS) return scene;
  if (scene.points.length + polygon.vertices.length > MAX_POINTS) return scene;

  let next = scene;
  const imageIds = [];
  for (const vertexId of polygon.vertices) {
    const before = next.points.length;
    next = addImagePoint(next, vertexId, vectorId);
    if (next.points.length === before) return scene;
    imageIds.push(next.points[next.points.length - 1].id);
  }

  return addPolygon(next, imageIds, `${polygon.name}′`);
}

/** Déplacer un point libre (le glissement de §4). */
export function movePoint(scene, pointId, x, y) {
  return {
    ...scene,
    points: scene.points.map((p) => (p.id === pointId && p.kind === 'free' ? { ...p, x: clampCoord(x), y: clampCoord(y) } : p)),
  };
}

/** Déplacer l'extrémité d'un vecteur libre : ses composantes changent (§7). */
export function moveVectorTip(scene, vectorId, x, y) {
  return {
    ...scene,
    vectors: scene.vectors.map((v) => (v.id === vectorId && v.kind === 'free'
      ? { ...v, x: clampCoord(x - v.origin.x), y: clampCoord(y - v.origin.y) }
      : v)),
  };
}

/** Déplacer l'ORIGINE d'un vecteur libre : ses composantes ne changent PAS (§6). */
export function moveVectorOrigin(scene, vectorId, x, y) {
  return {
    ...scene,
    vectors: scene.vectors.map((v) => (v.id === vectorId && v.kind === 'free'
      ? { ...v, origin: { x: clampCoord(x), y: clampCoord(y) } }
      : v)),
  };
}

/** Poser les composantes d'un vecteur libre (le mode paramétré de §26). */
export function setVectorComponents(scene, vectorId, x, y) {
  return {
    ...scene,
    vectors: scene.vectors.map((v) => (v.id === vectorId && v.kind === 'free'
      ? { ...v, x: clampCoord(x), y: clampCoord(y) }
      : v)),
  };
}

/** Le curseur k (§15). */
export function setScalar(scene, vectorId, k) {
  const value = Number.isFinite(k) ? Math.max(-10, Math.min(10, Math.round(k * 100) / 100)) : 1;

  return {
    ...scene,
    vectors: scene.vectors.map((v) => (v.id === vectorId && v.kind === 'scaled' ? { ...v, k: value } : v)),
  };
}

// ── L'ouverture ───────────────────────────────────────────────────────────

/** Une scène vide. */
export function emptyScene() {
  return { points: [], vectors: [], polygons: [] };
}

/**
 * Le document NEUF (§28, « Explorer librement ») : deux points et le vecteur
 * qu'ils portent. Pas un plan vide — l'élève doit voir tout de suite ce
 * qu'est un vecteur et pouvoir le tirer ; et pas une leçon non plus : deux
 * points, un vecteur, rien d'autre.
 */
export function createVectorsData(seed = undefined) {
  if (seed && typeof seed === 'object') {
    const seeded = normalizeVectorsData(seed);
    if (seeded.history.some((scene) => scene.points.length || scene.vectors.length)) return seeded;
  }

  let scene = emptyScene();
  scene = addFreePoint(scene, { x: -2, y: -1, name: 'A' });
  scene = addFreePoint(scene, { x: 2, y: 2, name: 'B' });
  scene = addPointsVector(scene, scene.points[0].id, scene.points[1].id);

  return {
    history: [scene],
    cursor: 0,
    viewport: null,
    selection: { points: [], vectors: [scene.vectors[0].id] },
    settings: { grid: true, snap: true, showLengths: false, showAngles: false, analysis: 'none' },
    experiment: null,
    explorer: null,
  };
}

