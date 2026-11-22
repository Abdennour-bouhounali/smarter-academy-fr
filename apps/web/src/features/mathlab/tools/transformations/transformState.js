/**
 * L'ÉTAT de l'atelier des transformations — logique pure, sans React.
 *
 *     data = {
 *       scene:   { figures: [...], steps: [...] },
 *       history: [scene, scene, …],      // le CHEMIN, comme en algèbre et en vecteurs
 *       cursor:  number,                 // d'où viennent Annuler / Rétablir
 *       viewport:{xMin, xMax, yMin, yMax} | null,
 *       selection:{ figureId, vertexIndex } | null,
 *       settings:{ grid, snap, snapStep, showOriginal, showIntermediate, trails,
 *                  showMeasures, showAngles, showMatrix, showInvariants, labels },
 *       mode:    'free' | 'practice' | 'puzzle',
 *       practice:{ solved, attempts },
 *       puzzle:  { id, solved } | null
 *     }
 *
 * ── Ce qui est PERSISTÉ et ce qui ne l'est pas ───────────────────────────
 * La même séparation que l'atelier de trigonométrie (§42 de son cahier) :
 *
 *   | état MATHÉMATIQUE (data)      | état d'INTERFACE (local, jamais sérialisé) |
 *   |-------------------------------|---------------------------------------------|
 *   | figures, pile de pas          | l'animation en cours, sa fraction           |
 *   | fenêtre, réglages, étiquettes | la vitesse, le sens, play/pause             |
 *   | le mode, les scores           | la question d'entraînement courante         |
 *   | le puzzle ouvert              | le panneau ouvert/fermé                     |
 *
 * Ce n'est pas une convention : l'animation n'a AUCUN champ dans `data`, et
 * ne peut donc pas y arriver par accident.
 */

import * as M from './transformMath.js';
import { TRANSFORM_KINDS, AXIS_TYPES, transformStages } from './transformModel.js';
import { normalizeViewport, isValidViewport } from '../functionGrapher/viewport.js';

export const TRANSFORMATIONS_SCHEMA_VERSION = 1;

/**
 * La profondeur de l'historique.
 *
 * Chaque pas garde une COPIE de la scène entière — c'est le modèle déjà
 * retenu pour l'atelier d'algèbre et l'atelier des vecteurs, et il a le même avantage :
 * « Annuler » recule le curseur, il ne défait rien, donc l'élève peut revenir
 * en avant tant qu'il n'a pas rejoué. Le coût du document est
 * `MAX_HISTORY × taille de la scène`, et c'est lui qui décide du plafond
 * d'octets côté serveur (MathLabTools.php) ; `transformState.test.js` tient
 * cette borne.
 */
export const MAX_HISTORY = 20;

/** Autant de figures que de couleurs distinctes lisibles sur le plan. */
export const MAX_FIGURES = 4;
const MAX_VERTICES = 12;
export const MAX_STEPS = 6;

/** La fenêtre d'ouverture : le repère du manuel, centré sur l'origine. */
export const DEFAULT_TRANSFORM_VIEWPORT = Object.freeze({ xMin: -8, xMax: 8, yMin: -6, yMax: 6 });

/** Les familles de figures que l'élève peut créer (§4). */
const FIGURE_KINDS = Object.freeze(['point', 'segment', 'triangle', 'rectangle', 'square', 'polygon']);

/** Les couleurs des figures : l'ORIGINALE. L'image en dérive (§46). */
const FIGURE_PALETTE = Object.freeze(['#2563eb', '#059669', '#b45309', '#7c3aed']);

/** Les noms de sommets, dans l'ordre du manuel. */
export const VERTEX_NAMES = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const finite = Number.isFinite;

let idCounter = 0;
/** Un identifiant court, stable le temps d'une session. */
function newId(prefix) {
  idCounter += 1;

  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/** Une coordonnée bornée : le plan est grand, mais pas infini (§55). */
export const COORD_LIMIT = 1e4;
export function clampCoord(value) {
  if (!finite(value)) return 0;

  return M.cleanNumber(Math.min(COORD_LIMIT, Math.max(-COORD_LIMIT, value)));
}

// ── La relecture d'un document (la frontière avec le JSON stocké) ────────

function readId(raw) {
  return typeof raw === 'string' && raw.length > 0 && raw.length <= 64 ? raw : null;
}

function readColor(raw, fallback) {
  return typeof raw === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

/**
 * Un point relu, ou `null`.
 *
 * `{x: 'a', y: 2}` n'est PAS le point (0, 2) : c'est une donnée cassée, et la
 * coercer en zéro poserait un sommet là où l'élève n'a jamais rien mis. On le
 * rejette, et `normalizeFigure` le jette avec le reste.
 */
function readPoint(raw) {
  if (!isPlainObject(raw)) return null;
  const x = Number(raw.x);
  const y = Number(raw.y);
  if (!finite(x) || !finite(y)) return null;

  return { x: clampCoord(x), y: clampCoord(y) };
}

function normalizeFigure(raw, index) {
  if (!isPlainObject(raw)) return null;
  const vertices = (Array.isArray(raw.vertices) ? raw.vertices : [])
    .map(readPoint)
    .filter(Boolean)
    .slice(0, MAX_VERTICES);
  if (vertices.length === 0) return null;
  const kind = FIGURE_KINDS.includes(raw.kind) ? raw.kind : inferKind(vertices.length);

  return {
    id: readId(raw.id) ?? newId('fig'),
    kind,
    vertices,
    color: readColor(raw.color, FIGURE_PALETTE[index % FIGURE_PALETTE.length]),
    label: typeof raw.label === 'string' && raw.label.length <= 8 ? raw.label : '',
    visible: raw.visible !== false,
  };
}

function inferKind(count) {
  if (count === 1) return 'point';
  if (count === 2) return 'segment';
  if (count === 3) return 'triangle';
  if (count === 4) return 'rectangle';

  return 'polygon';
}

function normalizeCenter(raw) {
  if (!isPlainObject(raw)) return { type: 'origin' };
  if (raw.type === 'vertex') {
    const index = Number(raw.index);

    return { type: 'vertex', index: Number.isInteger(index) && index >= 0 && index < MAX_VERTICES ? index : 0 };
  }
  if (raw.type === 'point') {
    const point = readPoint(raw.point);

    return point ? { type: 'point', point } : { type: 'origin' };
  }

  return { type: 'origin' };
}

function normalizeAxis(raw) {
  if (!isPlainObject(raw)) return { type: 'xAxis' };
  const type = AXIS_TYPES.includes(raw.type) ? raw.type : 'xAxis';
  switch (type) {
    case 'horizontal':
    case 'vertical':
      return { type, value: clampCoord(Number(raw.value)) };
    case 'line':
      return { type, slope: clampCoord(Number(raw.slope)), intercept: clampCoord(Number(raw.intercept)) };
    case 'twoPoints': {
      const a = readPoint(raw.a) ?? { x: -3, y: -3 };
      const b = readPoint(raw.b) ?? { x: 3, y: 3 };

      return { type, a, b };
    }
    case 'origin':
      return { type, center: normalizeCenter(raw.center) };
    default:
      return { type };
  }
}

function normalizeStep(raw) {
  if (!isPlainObject(raw) || !TRANSFORM_KINDS.includes(raw.kind)) return null;
  const base = { id: readId(raw.id) ?? newId('st'), kind: raw.kind, enabled: raw.enabled !== false };
  switch (raw.kind) {
    case 'translation':
      return { ...base, vx: clampCoord(Number(raw.vx)), vy: clampCoord(Number(raw.vy)) };
    case 'rotation': {
      const angle = Number(raw.angle);

      return { ...base, angle: finite(angle) ? M.cleanNumber(((angle % 360) + 360) % 360) : 90, center: normalizeCenter(raw.center) };
    }
    case 'reflection':
      return { ...base, axis: normalizeAxis(raw.axis) };
    case 'dilation': {
      const k = Number(raw.k);

      return { ...base, k: finite(k) ? M.cleanNumber(Math.min(10, Math.max(-10, k))) : 2, center: normalizeCenter(raw.center) };
    }
    default:
      return null;
  }
}

/** Une scène relue : des figures et une pile, bornées et sûres. */
export function normalizeScene(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const figures = (Array.isArray(source.figures) ? source.figures : [])
    .map(normalizeFigure)
    .filter(Boolean)
    .slice(0, MAX_FIGURES);
  const steps = (Array.isArray(source.steps) ? source.steps : [])
    .map(normalizeStep)
    .filter(Boolean)
    .slice(0, MAX_STEPS);

  return { figures, steps };
}

const DEFAULT_SETTINGS = Object.freeze({
  grid: true,
  snap: true,
  snapStep: 1,
  showOriginal: true,
  showIntermediate: false,
  trails: false,
  showMeasures: true,
  showAngles: false,
  showMatrix: false,
  showInvariants: true,
  labels: true,
});

function normalizeSettings(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const step = Number(source.snapStep);

  return {
    ...DEFAULT_SETTINGS,
    ...Object.fromEntries(Object.keys(DEFAULT_SETTINGS)
      .filter((key) => key !== 'snapStep')
      .map((key) => [key, typeof source[key] === 'boolean' ? source[key] : DEFAULT_SETTINGS[key]])),
    snapStep: [0.25, 0.5, 1].includes(step) ? step : 1,
  };
}

function normalizeSelection(raw) {
  if (!isPlainObject(raw)) return null;
  const figureId = readId(raw.figureId);
  if (!figureId) return null;
  const vertexIndex = Number(raw.vertexIndex);

  return { figureId, vertexIndex: Number.isInteger(vertexIndex) && vertexIndex >= 0 ? vertexIndex : null };
}

/** Un document relu, quelle qu'en soit l'origine (serveur, amorce, rien). */
export function normalizeTransformationsData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const historySource = Array.isArray(source.history) && source.history.length > 0
    ? source.history
    : [source.scene ?? emptyScene()];
  const history = historySource
    .slice(-MAX_HISTORY)
    .map(normalizeScene);
  const cursor = Number.isInteger(source.cursor)
    ? Math.max(0, Math.min(history.length - 1, source.cursor))
    : history.length - 1;
  const viewport = isValidViewport(source.viewport) ? normalizeViewport(source.viewport) : null;

  return {
    history,
    cursor,
    viewport,
    selection: normalizeSelection(source.selection),
    settings: normalizeSettings(source.settings),
    mode: ['free', 'practice', 'puzzle'].includes(source.mode) ? source.mode : 'free',
    practice: {
      solved: clampCount(source.practice?.solved),
      attempts: clampCount(source.practice?.attempts),
    },
    puzzle: isPlainObject(source.puzzle) && readId(source.puzzle.id)
      ? { id: source.puzzle.id, solved: source.puzzle.solved === true }
      : null,
  };
}

function clampCount(value) {
  const n = Number(value);

  return Number.isInteger(n) && n >= 0 && n <= 99999 ? n : 0;
}

/** Ce qui part au serveur : exactement ce que `normalize` sait relire. */
export function serializeTransformationsData(data) {
  return {
    history: data.history,
    cursor: data.cursor,
    viewport: data.viewport,
    selection: data.selection,
    settings: data.settings,
    mode: data.mode,
    practice: data.practice,
    puzzle: data.puzzle,
  };
}

// ── L'historique : reculer le curseur, ne rien défaire ───────────────────

export function currentScene(data) {
  return data.history[data.cursor] ?? emptyScene();
}

/**
 * Un NOUVEAU pas dans le chemin : tout ce qui suivait le curseur est
 * abandonné (l'élève a rejoué), et l'historique oublie ses plus anciens
 * états au-delà de MAX_HISTORY.
 */
export function pushScene(data, scene) {
  const kept = data.history.slice(0, data.cursor + 1);
  kept.push(scene);
  const trimmed = kept.length > MAX_HISTORY ? kept.slice(kept.length - MAX_HISTORY) : kept;

  return { ...data, history: trimmed, cursor: trimmed.length - 1 };
}

/**
 * La scène courante REMPLACÉE sans nouveau pas d'historique.
 *
 * C'est ce qu'utilise un GLISSEMENT : tirer un sommet sur vingt pixels ne
 * doit pas remplir l'historique de vingt états quasi identiques. Le pas est
 * poussé une seule fois, à la fin du geste (`pushScene`), et pendant le
 * geste on remplace.
 */
export function replaceScene(data, scene) {
  const history = [...data.history];
  history[data.cursor] = scene;

  return { ...data, history };
}

export const canUndo = (data) => data.cursor > 0;
export const canRedo = (data) => data.cursor < data.history.length - 1;

export function undo(data) {
  return canUndo(data) ? { ...data, cursor: data.cursor - 1 } : data;
}

export function redo(data) {
  return canRedo(data) ? { ...data, cursor: data.cursor + 1 } : data;
}

// ── Les gestes sur la scène : chacun rend une NOUVELLE scène ─────────────

export function emptyScene() {
  return { figures: [], steps: [] };
}

/** La figure d'ouverture : un triangle posé sur la grille, prêt à être tiré. */
export function defaultScene() {
  return {
    figures: [{
      id: newId('fig'),
      kind: 'triangle',
      vertices: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }],
      color: FIGURE_PALETTE[0],
      label: '',
      visible: true,
    }],
    steps: [{ id: newId('st'), kind: 'translation', enabled: true, vx: 3, vy: 2 }],
  };
}

export function addFigure(scene, kind, vertices) {
  if (scene.figures.length >= MAX_FIGURES) return scene;
  const clean = (Array.isArray(vertices) ? vertices : []).map((v) => M.cleanPoint(v)).filter(M.isPoint).slice(0, MAX_VERTICES);
  if (clean.length === 0) return scene;

  return {
    ...scene,
    figures: [...scene.figures, {
      id: newId('fig'),
      kind: FIGURE_KINDS.includes(kind) ? kind : inferKind(clean.length),
      vertices: clean,
      color: FIGURE_PALETTE[scene.figures.length % FIGURE_PALETTE.length],
      label: '',
      visible: true,
    }],
  };
}

export function removeFigure(scene, figureId) {
  return { ...scene, figures: scene.figures.filter((figure) => figure.id !== figureId) };
}

export function moveVertex(scene, figureId, index, x, y) {
  return {
    ...scene,
    figures: scene.figures.map((figure) => {
      if (figure.id !== figureId) return figure;
      const vertices = [...figure.vertices];
      if (!vertices[index]) return figure;
      vertices[index] = { x: clampCoord(x), y: clampCoord(y) };

      return { ...figure, vertices };
    }),
  };
}

/** Déplacer une figure ENTIÈRE (§5) — tous ses sommets du même vecteur. */
export function moveFigure(scene, figureId, dx, dy) {
  if (!finite(dx) || !finite(dy)) return scene;

  return {
    ...scene,
    figures: scene.figures.map((figure) => (figure.id === figureId
      ? { ...figure, vertices: figure.vertices.map((v) => ({ x: clampCoord(v.x + dx), y: clampCoord(v.y + dy) })) }
      : figure)),
  };
}

// ── La pile (§21) ────────────────────────────────────────────────────────

/** Les paramètres d'ouverture d'un pas, par famille. */
function defaultStep(kind) {
  switch (kind) {
    case 'rotation': return { id: newId('st'), kind, enabled: true, angle: 90, center: { type: 'origin' } };
    case 'reflection': return { id: newId('st'), kind, enabled: true, axis: { type: 'xAxis' } };
    case 'dilation': return { id: newId('st'), kind, enabled: true, k: 2, center: { type: 'origin' } };
    case 'translation':
    default: return { id: newId('st'), kind: 'translation', enabled: true, vx: 3, vy: 2 };
  }
}

export function addStep(scene, kind, overrides = {}) {
  if (scene.steps.length >= MAX_STEPS) return scene;
  const step = normalizeStep({ ...defaultStep(kind), ...overrides, kind });
  if (!step) return scene;

  return { ...scene, steps: [...scene.steps, step] };
}

export function updateStep(scene, stepId, patch) {
  return {
    ...scene,
    steps: scene.steps.map((step) => {
      if (step.id !== stepId) return step;
      const merged = normalizeStep({ ...step, ...patch, id: step.id, kind: step.kind });

      return merged ?? step;
    }),
  };
}

export function removeStep(scene, stepId) {
  return { ...scene, steps: scene.steps.filter((step) => step.id !== stepId) };
}

export function toggleStep(scene, stepId) {
  return {
    ...scene,
    steps: scene.steps.map((step) => (step.id === stepId ? { ...step, enabled: !step.enabled } : step)),
  };
}

/**
 * Déplacer un pas dans la pile (§21, « reorder steps »).
 *
 * Aucun garde-fou « where mathematically safe » : réordonner est PRÉCISÉMENT
 * l'expérience de §23. Interdire l'échange qui change le résultat reviendrait
 * à cacher à l'élève la seule chose qu'on veut qu'il découvre. L'instrument
 * recalcule, et la figure lui dit elle-même si l'ordre comptait.
 */
export function moveStep(scene, stepId, direction) {
  const index = scene.steps.findIndex((step) => step.id === stepId);
  const target = index + (direction < 0 ? -1 : 1);
  if (index < 0 || target < 0 || target >= scene.steps.length) return scene;
  const steps = [...scene.steps];
  [steps[index], steps[target]] = [steps[target], steps[index]];

  return { ...scene, steps };
}

export function clearSteps(scene) {
  return { ...scene, steps: [] };
}

/** Remplacer TOUTE la pile — ce que fait un préréglage (§35) ou un puzzle. */
export function setSteps(scene, steps) {
  const normalized = (Array.isArray(steps) ? steps : []).map(normalizeStep).filter(Boolean).slice(0, MAX_STEPS);

  return { ...scene, steps: normalized };
}

// ── Le document neuf ─────────────────────────────────────────────────────

/**
 * Un document neuf.
 *
 * L'amorce (`seed`) est celle d'une leçon (openMathLab.js) : elle peut poser
 * une figure et une pile, et l'instrument s'ouvre dessus.
 */
export function createTransformationsData(seed = undefined) {
  const scene = isPlainObject(seed) && (Array.isArray(seed.figures) || Array.isArray(seed.steps))
    ? normalizeScene(seed)
    : defaultScene();
  const base = {
    history: [scene],
    cursor: 0,
    viewport: isValidViewport(seed?.viewport) ? normalizeViewport(seed.viewport) : null,
    selection: null,
    settings: { ...DEFAULT_SETTINGS, ...(isPlainObject(seed?.settings) ? normalizeSettings(seed.settings) : {}) },
    mode: 'free',
    practice: { solved: 0, attempts: 0 },
    puzzle: null,
  };

  return normalizeTransformationsData(base);
}

// ── Ce que l'instrument DÉRIVE de l'état, en un seul endroit ─────────────

/**
 * Tout ce que l'écran a besoin de savoir, calculé UNE fois par rendu.
 *
 * Le composant ne calcule rien : il lit. C'est la règle de séparation du
 * l'atelier (aucune mathématique dans le JSX), et c'est aussi ce qui rend §56
 * tenable — un glissement recalcule cette fonction et rien d'autre.
 */
export function resolveData(data) {
  const scene = currentScene(data);
  const figures = scene.figures.map((figure) => {
    const stages = transformStages(figure.vertices, scene.steps);
    const image = stages.length > 0 ? stages[stages.length - 1].vertices : figure.vertices;

    return { figure, stages, image };
  });

  return { scene, figures };
}
