/**
 * L'ÉTAT du مختبر المقاطع المخروطية — logique pure, sans React.
 *
 *     data = {
 *       scene:    { objects: [...], selectedId, probe, trace, locus },
 *       history:  [scene, scene, …],      // le CHEMIN, comme en algèbre, أشعة et تحويلات
 *       cursor:   number,                 // d'où viennent تراجع / إعادة
 *       viewport: {xMin, xMax, yMin, yMax} | null,
 *       reference: scene | null,          // §44 — l'état figé « avant »
 *       settings: { grid, snap, snapStep, showFoci, showDirectrix, showAsymptotes,
 *                   showAxes, showCenter, showVertices, showEquation, showGeneral,
 *                   showMeasures, showIntersections, labels, polar },
 *       mode:     'free' | 'practice',
 *       practice: { solved, attempts }
 *     }
 *
 * ── Ce qui est PERSISTÉ et ce qui ne l'est pas ───────────────────────────
 * La même séparation que les trois instruments qui précèdent :
 *
 *   | état MATHÉMATIQUE (data)       | état d'INTERFACE (local, jamais sérialisé) |
 *   |--------------------------------|---------------------------------------------|
 *   | les coniques et leurs droites  | le panneau ouvert, l'onglet                 |
 *   | le point sonde, la trace       | la question d'entraînement courante         |
 *   | la fenêtre, les réglages       | le texte en cours de saisie et son erreur   |
 *   | le mode, les scores            | l'objet en cours de GLISSEMENT              |
 *
 * Ce n'est pas une convention d'écriture : la question d'entraînement n'a
 * AUCUN champ dans `data` et ne peut donc pas y arriver par accident.
 *
 * ── Deux régimes de changement ───────────────────────────────────────────
 * Comme le مختبر الأشعة (§5f.5 de son cahier) : un GESTE (glisser un centre,
 * pousser un curseur) modifie la scène courante en continu sans rien
 * empiler ; c'est son RELÂCHEMENT qui pousse un pas dans l'historique. Sans
 * cela, « تراجع » reculerait d'un pixel et l'élève devrait l'actionner trois
 * cents fois pour défaire un glissement.
 */

import * as C from './conicMath.js';
import { normalizeViewport, isValidViewport } from '../functionGrapher/viewport.js';

export const CONICS_SCHEMA_VERSION = 1;

/**
 * La profondeur de l'historique. Chaque pas garde une COPIE de la scène
 * entière — le modèle déjà retenu pour l'algèbre, les أشعة et les تحويلات.
 * Le coût du document est `MAX_HISTORY × taille de la scène`, et c'est lui
 * qui décide du plafond d'octets côté serveur (MathLabTools.php) ;
 * `conicState.test.js` tient cette borne.
 */
export const MAX_HISTORY = 20;

/**
 * §24 — « plusieurs coniques, mais pas un nombre illimité qui détruirait la
 * performance ». Quatre coniques et deux droites : assez pour comparer un
 * cercle, une ellipse et leur sécante, borné pour que chaque image reste
 * un seul passage de dessin.
 */
export const MAX_CONICS = 4;
export const MAX_LINES = 2;

/** La fenêtre d'ouverture : le repère du manuel, centré sur l'origine. */
export const DEFAULT_CONICS_VIEWPORT = Object.freeze({ xMin: -8, xMax: 8, yMin: -6, yMax: 6 });

/** Les couleurs des objets — distinctes et lisibles sur la grille. */
export const CONIC_PALETTE = Object.freeze(['#2563eb', '#059669', '#b45309', '#7c3aed']);
const LINE_COLOR = '#db2777';

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const finite = Number.isFinite;

let idCounter = 0;
/** Un identifiant court, stable le temps d'une session. */
function newId(prefix) {
  idCounter += 1;

  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/** Une coordonnée bornée : le plan est grand, mais pas infini (§52). */
export const COORD_LIMIT = 1e4;
/** Un demi-axe ou un rayon : strictement positif, et borné de même. */
export const SIZE_LIMIT = 1e4;

function clampCoord(value) {
  if (!finite(value)) return 0;

  return C.cleanNumber(Math.min(COORD_LIMIT, Math.max(-COORD_LIMIT, value)));
}

function clampSize(value, fallback = 1) {
  if (!finite(value) || value <= 0) return fallback;

  return C.cleanNumber(Math.min(SIZE_LIMIT, Math.max(1e-3, value)));
}

/** Le coefficient d'une parabole : non nul, borné, de signe libre. */
export function clampCoefficient(value, fallback = 1) {
  if (!finite(value) || Math.abs(value) < 1e-3) {
    // On ne laisse pas `a` traverser zéro : une parabole de coefficient nul
    // est une droite (§52). On s'arrête au plus petit coefficient qui reste
    // une parabole, du côté d'où l'on vient.
    if (!finite(value) || value === 0) return fallback;

    return C.cleanNumber(value < 0 ? -1e-3 : 1e-3);
  }

  return C.cleanNumber(Math.min(100, Math.max(-100, value)));
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
 * `{x: 'a', y: 2}` n'est PAS le point (0, 2) : c'est une donnée cassée, et
 * la coercer en zéro poserait un point là où l'élève n'a jamais rien mis.
 */
function readPoint(raw) {
  if (!isPlainObject(raw)) return null;
  const x = Number(raw.x);
  const y = Number(raw.y);
  if (!finite(x) || !finite(y)) return null;

  return { x: clampCoord(x), y: clampCoord(y) };
}

/**
 * Une CONIQUE relue, ramenée à une forme que le moteur accepte — ou `null`.
 *
 * C'est ici, et seulement ici, qu'un document venu du serveur devient de la
 * mathématique. Tout ce qui sort des bornes est ramené dedans plutôt que
 * rejeté : un rayon de 10⁹ enregistré par une version future doit rouvrir
 * en un cercle visible, pas en un document vide.
 */
function normalizeConicObject(raw, index = 0) {
  if (!isPlainObject(raw)) return null;
  if (!C.CONIC_KINDS.includes(raw.kind)) return null;
  const h = clampCoord(Number(raw.h));
  const k = clampCoord(Number(raw.k));
  const color = readColor(raw.color, CONIC_PALETTE[index % CONIC_PALETTE.length]);
  const base = {
    id: readId(raw.id) ?? newId('conic'),
    kind: raw.kind,
    h,
    k,
    color,
    visible: raw.visible !== false,
    label: typeof raw.label === 'string' && raw.label.length <= 8 ? raw.label : '',
  };

  switch (raw.kind) {
    case 'circle':
      return { ...base, r: clampSize(Number(raw.r), 3) };
    case 'parabola':
      return {
        ...base,
        a: clampCoefficient(Number(raw.a), 1),
        orientation: raw.orientation === 'vertical' ? 'vertical' : 'horizontal',
      };
    case 'ellipse':
      return { ...base, a: clampSize(Number(raw.a), 4), b: clampSize(Number(raw.b), 2) };
    case 'hyperbola':
      return {
        ...base,
        a: clampSize(Number(raw.a), 3),
        b: clampSize(Number(raw.b), 2),
        orientation: raw.orientation === 'vertical' ? 'vertical' : 'horizontal',
      };
    default:
      return null;
  }
}

/** Une DROITE relue (§26) — `y = mx + p`, ou verticale. */
function normalizeLineObject(raw) {
  if (!isPlainObject(raw)) return null;
  const base = {
    id: readId(raw.id) ?? newId('line'),
    kind: 'line',
    color: readColor(raw.color, LINE_COLOR),
    visible: raw.visible !== false,
  };
  /**
   * Les DEUX formes sont toujours portées, et `vertical` ne fait que dire
   * laquelle vaut.
   *
   * Ne garder que la forme active paraît plus propre et coûte cher à
   * l'élève : basculer `y = mx + p` → `x = c` puis revenir effaçait sa pente
   * et son ordonnée à l'origine, et la droite ressuscitait en `y = x`. Une
   * bascule d'AFFICHAGE ne doit rien détruire.
   */
  const slope = Number(raw.slope);
  const intercept = Number(raw.intercept);

  return {
    ...base,
    vertical: raw.vertical === true,
    slope: finite(slope) ? C.cleanNumber(Math.min(100, Math.max(-100, slope))) : 1,
    intercept: finite(intercept) ? clampCoord(intercept) : 0,
    x: finite(Number(raw.x)) ? clampCoord(Number(raw.x)) : 0,
  };
}

/** Un objet quelconque de la scène : conique ou droite. */
function normalizeObject(raw, index) {
  if (raw?.kind === 'line') return normalizeLineObject(raw);

  return normalizeConicObject(raw, index);
}

export const isConicObject = (object) => Boolean(object) && C.CONIC_KINDS.includes(object.kind);
export const isLineObject = (object) => object?.kind === 'line';

/**
 * La SONDE (§10, §32) : le point que l'élève déplace pour interroger la
 * conique — dedans/dessus/dehors, distances aux foyers, substitution.
 */
function normalizeProbe(raw) {
  const point = readPoint(raw);
  if (!point) return null;

  return point;
}

/**
 * La TRACE (§34) : un point CONTRAINT à une conique, décrit par son
 * paramètre et non par ses coordonnées.
 *
 * Enregistrer `t` plutôt que `(x, y)` est ce qui garantit qu'à la
 * réouverture le point est encore exactement sur la courbe — même si la
 * conique a changé entre-temps. Un couple de coordonnées, lui, se
 * retrouverait à côté.
 */
function normalizeTrace(raw) {
  if (!isPlainObject(raw)) return null;
  const targetId = readId(raw.targetId);
  const t = Number(raw.t);
  if (!targetId || !finite(t)) return null;

  return { targetId, t: C.cleanNumber(t), branch: raw.branch === -1 ? -1 : 1 };
}

/** Le LIEU (§35) : la construction, jamais le nuage de points qu'elle donne. */
function normalizeLocus(raw) {
  if (!isPlainObject(raw)) return null;
  if (raw.kind === 'fixedDistance') {
    const focus = readPoint(raw.focus);
    const d = Number(raw.distance);
    if (!focus || !finite(d) || d <= 0) return null;

    return { kind: 'fixedDistance', focus, distance: clampSize(d, 3) };
  }
  if (raw.kind === 'equidistant') {
    const focus = readPoint(raw.focus);
    if (!focus) return null;
    const value = Number(raw.directrix?.value);
    const directrixKind = raw.directrix?.kind === 'vertical' ? 'vertical' : 'horizontal';
    if (!finite(value)) return null;

    return { kind: 'equidistant', focus, directrix: { kind: directrixKind, value: clampCoord(value) } };
  }

  return null;
}

/** Une SCÈNE relue : des objets, une sélection, une sonde, une trace, un lieu. */
export function normalizeScene(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const objects = (Array.isArray(source.objects) ? source.objects : [])
    .map(normalizeObject)
    .filter(Boolean);

  // Les bornes de §24, appliquées par FAMILLE.
  const conics = objects.filter(isConicObject).slice(0, MAX_CONICS);
  const lines = objects.filter(isLineObject).slice(0, MAX_LINES);
  const kept = [...conics, ...lines];

  const selectedId = readId(source.selectedId);
  const trace = normalizeTrace(source.trace);

  return {
    objects: kept,
    selectedId: kept.some((o) => o.id === selectedId) ? selectedId : (kept[0]?.id ?? null),
    probe: normalizeProbe(source.probe),
    // Une trace dont la cible a disparu n'est plus une trace.
    trace: trace && kept.some((o) => o.id === trace.targetId && isConicObject(o)) ? trace : null,
    locus: normalizeLocus(source.locus),
  };
}

const DEFAULT_SETTINGS = Object.freeze({
  grid: true,
  snap: true,
  snapStep: 1,
  /** Les éléments remarquables (§31) — montrés d'emblée, ils SONT la leçon. */
  showCenter: true,
  showVertices: true,
  showFoci: true,
  showDirectrix: true,
  showAsymptotes: true,
  showAxes: true,
  /** L'équation, toujours ; sa forme développée, sur demande (§30). */
  showEquation: true,
  showGeneral: false,
  showMeasures: true,
  showIntersections: true,
  labels: true,
  /** §29 — la lecture polaire, volontairement optionnelle et discrète. */
  polar: false,
});

function normalizeSettings(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const out = {};
  for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
    out[key] = typeof fallback === 'boolean'
      ? (typeof source[key] === 'boolean' ? source[key] : fallback)
      : fallback;
  }
  const step = Number(source.snapStep);
  out.snapStep = [0.25, 0.5, 1].includes(step) ? step : DEFAULT_SETTINGS.snapStep;

  return out;
}

function normalizePractice(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const count = (value) => (Number.isInteger(value) && value >= 0 && value <= 9999 ? value : 0);

  return { solved: count(source.solved), attempts: count(source.attempts) };
}

// ── Le document ──────────────────────────────────────────────────────────

/**
 * La scène d'OUVERTURE : un CERCLE.
 *
 * C'est le choix de programme du laboratoire, et il est délibéré. Les
 * coniques appartiennent au lycée ; ce que le programme de 4AM demande, et
 * la seule de ces quatre courbes que l'élève a déjà rencontrée, c'est la
 * DAIRA — le cercle, son centre, son rayon, et la distance au centre. Le
 * laboratoire ouvre donc sur `x² + y² = 9` et sa sonde, et la parabole,
 * l'ellipse et l'hyperbole sont complètes mais à un clic. C'est la règle
 * déjà tenue par le produit scalaire du مختبر الأشعة (MATH_LAB §5f.10), le
 * cercle trigonométrique (§5g.1), les suites (§5h) et le تحاكي (§5j).
 */
export function createConicsData(seed) {
  const base = {
    scene: normalizeScene({
      objects: [{
        id: newId('conic'), kind: 'circle', h: 0, k: 0, r: 3, color: CONIC_PALETTE[0],
      }],
      probe: { x: 4, y: 2 },
    }),
    viewport: null,
    reference: null,
    settings: { ...DEFAULT_SETTINGS },
    mode: 'free',
    practice: { solved: 0, attempts: 0 },
  };

  // Une amorce de leçon (openMathLab.js) remplace la scène, jamais les réglages.
  const scene = isPlainObject(seed) ? normalizeScene(seed.scene ?? seed) : base.scene;
  const start = scene.objects.length > 0 ? scene : base.scene;

  return {
    ...base,
    scene: start,
    history: [start],
    cursor: 0,
    viewport: isPlainObject(seed) && isValidViewport(seed.viewport) ? normalizeViewport(seed.viewport) : null,
  };
}

/** Un document relu, quelle que soit sa provenance — jamais une exception. */
export function normalizeConicsData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const history = (Array.isArray(source.history) ? source.history : [])
    .map(normalizeScene)
    .filter((scene) => scene.objects.length > 0)
    .slice(-MAX_HISTORY);
  const scene = normalizeScene(source.scene);
  const resolved = scene.objects.length > 0 ? scene : (history[history.length - 1] ?? createConicsData().scene);
  const past = history.length > 0 ? history : [resolved];
  const cursor = Number.isInteger(source.cursor)
    ? Math.max(0, Math.min(past.length - 1, source.cursor))
    : past.length - 1;

  return {
    scene: resolved,
    history: past,
    cursor,
    viewport: isValidViewport(source.viewport) ? normalizeViewport(source.viewport) : null,
    reference: source.reference ? normalizeScene(source.reference) : null,
    settings: normalizeSettings(source.settings),
    mode: source.mode === 'practice' ? 'practice' : 'free',
    practice: normalizePractice(source.practice),
  };
}

// ── L'HISTORIQUE (§45) ───────────────────────────────────────────────────

/**
 * Pousse une scène dans l'historique — un PAS, pas un pixel.
 *
 * Appelée au RELÂCHEMENT d'un geste, jamais pendant. Comme en algèbre et en
 * أشعة, « تراجع » recule le curseur sans rien détruire : tant que l'élève ne
 * rejoue pas, il peut revenir en avant.
 */
export function pushScene(data, scene) {
  const next = normalizeScene(scene);
  if (next.objects.length === 0) return data;

  /**
   * « Ce pas change-t-il quelque chose ? » se juge contre le dernier pas
   * COMMITTÉ, et surtout pas contre `data.scene`.
   *
   * `data.scene` est la scène VIVANTE : pendant un glissement, `replaceScene`
   * l'a déjà amenée à sa valeur finale. La comparer au relâchement revient à
   * comparer la scène à elle-même — le pas est jugé « sans changement », rien
   * n'est empilé, et le glissement tout entier devient impossible à défaire.
   * (Défaut trouvé par `conicState.test.js`, « un GESTE ne pousse rien ; son
   * relâchement pousse un pas ».)
   */
  const committed = data.history?.[data.cursor] ?? null;
  if (committed && sameScene(next, committed)) return { ...data, scene: next };
  const kept = data.history.slice(0, data.cursor + 1);
  kept.push(next);
  const trimmed = kept.slice(-MAX_HISTORY);

  return { ...data, scene: next, history: trimmed, cursor: trimmed.length - 1 };
}

/**
 * Remplace la scène courante SANS toucher à l'historique — le régime du
 * geste en cours (§5f.5). C'est ce qui rend un glissement fluide et
 * « تراجع » utile.
 */
export function replaceScene(data, scene) {
  const next = normalizeScene(scene);
  if (next.objects.length === 0) return data;

  return { ...data, scene: next };
}

export function canUndo(data) {
  return Boolean(data) && data.cursor > 0;
}

export function canRedo(data) {
  return Boolean(data) && data.cursor < (data.history?.length ?? 0) - 1;
}

export function undo(data) {
  if (!canUndo(data)) return data;
  const cursor = data.cursor - 1;

  return { ...data, cursor, scene: data.history[cursor] };
}

export function redo(data) {
  if (!canRedo(data)) return data;
  const cursor = data.cursor + 1;

  return { ...data, cursor, scene: data.history[cursor] };
}

/** Deux scènes « les mêmes » — la comparaison qui évite d'empiler du vide. */
function sameScene(a, b) {
  if (!a || !b) return a === b;
  if (a.objects.length !== b.objects.length) return false;
  if (a.selectedId !== b.selectedId) return false;
  if (!samePoint(a.probe, b.probe)) return false;
  if (JSON.stringify(a.trace) !== JSON.stringify(b.trace)) return false;
  if (JSON.stringify(a.locus) !== JSON.stringify(b.locus)) return false;
  for (let i = 0; i < a.objects.length; i += 1) {
    if (JSON.stringify(a.objects[i]) !== JSON.stringify(b.objects[i])) return false;
  }

  return true;
}

const samePoint = (p, q) => {
  if (!p || !q) return p === q;

  return C.nearlyEqual(p.x, q.x, 1e-12) && C.nearlyEqual(p.y, q.y, 1e-12);
};

// ── Les gestes sur la scène (pures, scène → scène) ───────────────────────

export function selectedObject(scene) {
  return scene?.objects?.find((o) => o.id === scene.selectedId) ?? null;
}

export function selectedConic(scene) {
  const object = selectedObject(scene);

  return isConicObject(object) ? object : (scene?.objects?.find(isConicObject) ?? null);
}

export function updateObject(scene, id, patch) {
  const objects = scene.objects.map((object) => {
    if (object.id !== id) return object;
    const merged = { ...object, ...patch };

    return isLineObject(object) ? normalizeLineObject(merged) : normalizeConicObject(merged);
  }).filter(Boolean);

  return { ...scene, objects };
}

export function addConic(scene, conic) {
  if (scene.objects.filter(isConicObject).length >= MAX_CONICS) return scene;
  const index = scene.objects.filter(isConicObject).length;
  const next = normalizeConicObject({ ...conic, id: conic.id ?? newId('conic') }, index);
  if (!next) return scene;

  return { ...scene, objects: [...scene.objects, next], selectedId: next.id };
}

export function addLine(scene, line) {
  if (scene.objects.filter(isLineObject).length >= MAX_LINES) return scene;
  const next = normalizeLineObject({ ...line, id: line?.id ?? newId('line') });
  if (!next) return scene;

  return { ...scene, objects: [...scene.objects, next], selectedId: next.id };
}

/**
 * Retirer un objet — en gardant la scène VIVANTE.
 *
 * On ne descend jamais sous une conique : un laboratoire de coniques sans
 * conique n'est pas un état que l'élève puisse comprendre, et le bouton est
 * d'ailleurs désactivé dans ce cas.
 */
export function removeObject(scene, id) {
  const target = scene.objects.find((o) => o.id === id);
  if (!target) return scene;
  if (isConicObject(target) && scene.objects.filter(isConicObject).length <= 1) return scene;
  const objects = scene.objects.filter((o) => o.id !== id);
  const trace = scene.trace?.targetId === id ? null : scene.trace;

  return {
    ...scene,
    objects,
    selectedId: scene.selectedId === id ? (objects[0]?.id ?? null) : scene.selectedId,
    trace,
  };
}

/**
 * CHANGER LA FAMILLE de l'objet sélectionné (§21), en gardant son centre.
 *
 * Le centre est ce que l'élève vient de placer ; le reste est reconstruit
 * avec des valeurs franches. Comparer un cercle et une ellipse « au même
 * endroit » est exactement ce que §21 demande.
 */
export function changeKind(scene, id, kind) {
  if (!C.CONIC_KINDS.includes(kind)) return scene;
  const object = scene.objects.find((o) => o.id === id);
  if (!object || !isConicObject(object)) return scene;
  const { h, k, color, label } = object;
  const common = { id, h, k, color, label, visible: object.visible };
  const rebuilt = {
    circle: { ...common, kind: 'circle', r: 3 },
    parabola: { ...common, kind: 'parabola', a: 0.5, orientation: 'horizontal' },
    ellipse: { ...common, kind: 'ellipse', a: 4, b: 2 },
    hyperbola: { ...common, kind: 'hyperbola', a: 3, b: 2, orientation: 'horizontal' },
  }[kind];

  return updateObject(scene, id, rebuilt);
}

/** L'aimant de la grille (§5) : arrondi au pas, ou rien si l'aimant est éteint. */
export function snapValue(value, settings) {
  if (!settings?.snap || !finite(value)) return C.cleanNumber(value);
  const step = settings.snapStep || 1;

  return C.cleanNumber(Math.round(value / step) * step);
}

export function snapPoint(point, settings) {
  if (!C.isPoint(point)) return null;

  return { x: snapValue(point.x, settings), y: snapValue(point.y, settings) };
}

// ── §44 — l'état de RÉFÉRENCE (« avant » / « après ») ────────────────────

/** Fige la scène courante comme référence — ce à quoi on comparera. */
export function freezeReference(data) {
  return { ...data, reference: data.scene };
}

export function clearReference(data) {
  return { ...data, reference: null };
}

// ── Le sérialisé ─────────────────────────────────────────────────────────

/**
 * Ce qui part au serveur. On n'y met QUE de la donnée mathématique : ni
 * question d'entraînement, ni panneau, ni objet en cours de glissement.
 */
export function serializeConicsData(data) {
  return {
    scene: data.scene,
    history: data.history,
    cursor: data.cursor,
    viewport: data.viewport,
    reference: data.reference,
    settings: data.settings,
    mode: data.mode,
    practice: data.practice,
  };
}
