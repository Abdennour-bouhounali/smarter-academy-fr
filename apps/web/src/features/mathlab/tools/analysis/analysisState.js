/**
 * L'ÉTAT du labo d’analyse — logique pure, sans React.
 *
 *     data = {
 *       lab:        'secant'|'tangent'|'derivative'|'limit'|'integral'|'study'|'transform',
 *       functions:  [{ id, source, color, visible }],   // f, et g pour §23/§26
 *       parameters: { a: number, b: number, c: number },// §24
 *       point:      number,          // l'abscisse de A (§6, §8, §10)
 *       secondPoint:number,          // celle de B (§7)
 *       limitPoint: number,          // le a de lim x→a (§11)
 *       bounds:     { a, b },        // les bornes de l'intégrale (§19)
 *       riemann:    { n, mode },     // §20
 *       constant:   number,          // le C de la primitive (§22)
 *       transform:  { id, value } | null,  // §25
 *       layers:     { …bascules… },  // ce qui est allumé sur le graphe
 *       view:       Viewport | null,
 *       practice:   { solved, seen },
 *       preset:     string | null,
 *     }
 *
 * ── La frontière de la PERSISTANCE (§42) ─────────────────────────────────
 * Ce qui mérite d'être retrouvé demain est ici et part au serveur ; ce qui ne
 * vit que le temps d'un geste — l'animation de la sécante vers la tangente,
 * la question d'entraînement courante, l'indice déjà lu, le panneau ouvert,
 * la prédiction en cours — vit dans le composant et n'a AUCUN champ ici.
 * « Do not persist transient animation state » est donc tenu par
 * CONSTRUCTION : l'animation n'a pas d'endroit où s'écrire.
 *
 * Les TERMES calculés (racines, extrema, aires, tables de limites) ne sont
 * jamais stockés non plus : ils se recalculent de la fonction et de la
 * fenêtre. Stocker ce qu'on sait refaire, c'est stocker un mensonge en
 * puissance — celui du jour où la fonction change et où le tableau reste.
 *
 * ANALYSIS_SCHEMA_VERSION est la version de CE format.
 */

import { DEFAULT_LAYERS, LAYER_KEYS } from './layers.js';
import { getPreset } from './presets.js';

export const ANALYSIS_SCHEMA_VERSION = 1;

/**
 * La fenêtre d'ouverture : elle encadre A(1 ; 3) et B(3 ; 7) sur f(x) = 2x + 1,
 * avec de l'air autour. Elle est ORTHONORMÉE à l'affichage (le plan élargit
 * l'axe le plus court), donc ses proportions ne sont qu'une intention.
 */
const DEFAULT_OPENING_VIEW = Object.freeze({ xMin: -2, xMax: 6, yMin: -2, yMax: 9 });

/** Les laboratoires de §4, dans l'ordre où l'instrument les présente. */
export const LABS = Object.freeze(['secant', 'tangent', 'derivative', 'limit', 'integral', 'study', 'transform']);

/** Les modes de somme de Riemann (§20). */
export const RIEMANN_MODES = Object.freeze(['left', 'right', 'midpoint', 'trapezoid']);

/** Deux fonctions au plus : f et g. §23 et §26 en demandent deux, pas six. */
export const MAX_FUNCTIONS = 2;

/** La longueur maximale d'une expression saisie — la même borne que le grapheur. */
export const MAX_SOURCE_LENGTH = 200;

/** Le nombre de rectangles de Riemann : de 1 à 200 (§20). Au-delà, le dessin ne dit plus rien. */
export const MIN_RIEMANN_N = 1;
export const MAX_RIEMANN_N = 200;

/** Les couleurs des courbes — celles du grapheur, pour qu'un élève les reconnaisse. */
const CURVE_COLORS = Object.freeze(['#2563eb', '#db2777']);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finiteOr = (value, fallback) => (Number.isFinite(value) ? value : fallback);

/**
 * L'état d'un document NEUF.
 *
 * ── Pourquoi il s'ouvre sur la SÉCANTE ───────────────────────────────────
 * Le programme du collège ne contient ni dérivée, ni limite, ni intégrale : le
 * calcul différentiel est matière de lycée. Son seul ancrage authentique est
 * la FONCTION AFFINE et son coefficient directeur — c'est-à-dire
 * exactement `(f(b) − f(a)) / (b − a)`, le taux d'accroissement moyen.
 *
 * L'instrument ouvre donc sur `f(x) = 2x + 1` avec deux points A et B posés
 * sur la droite et leur pente affichée : un élève de 3e y reconnaît le geste
 * de son manuel, et il peut jouer tout de suite (§53). Tout le reste — la
 * tangente, la dérivée, les limites, l'intégrale — est construit, complet, et
 * à un clic. C'est la règle déjà tenue par le produit scalaire (MATH_LAB
 * §5f.10), le cercle trigonométrique (§5g.1), les suites (§5h.1), le homothétie
 * (§5j.1) et les coniques (§5k.1).
 *
 * @param {object} [seed]  une amorce de leçon (openMathLab.js)
 */
export function createAnalysisData(seed = undefined) {
  const preset = seed?.preset ? getPreset(seed.preset) : null;
  const source = normalizeSource(seed?.source ?? preset?.source ?? '2x+1');

  return {
    lab: LABS.includes(seed?.lab) ? seed.lab : 'secant',
    functions: [makeFunction('f', source, 0)],
    parameters: { a: 1, b: 0, c: 0 },
    point: finiteOr(seed?.point, 1),
    secondPoint: finiteOr(seed?.secondPoint, 3),
    limitPoint: finiteOr(seed?.limitPoint, 0),
    bounds: { a: 0, b: 2 },
    riemann: { n: 8, mode: 'left' },
    constant: 0,
    transform: null,
    layers: { ...DEFAULT_LAYERS },
    // La fenêtre d'OUVERTURE encadre l'expérience elle-même : A(1 ; 3) et
    // B(3 ; 7) doivent être VISIBLES tous les deux. La QA visuelle a montré
    // B hors cadre avec une fenêtre par défaut trop basse — l'élève voyait
    // une sécante partir vers le haut sans savoir d'où (§53).
    view: normalizeView(seed?.view ?? preset?.view ?? DEFAULT_OPENING_VIEW),
    practice: { solved: 0, seen: 0 },
    preset: preset?.id ?? null,
  };
}

function makeFunction(id, source, index) {
  return { id, source, color: CURVE_COLORS[index % CURVE_COLORS.length], visible: true };
}

/** Une expression saisie → une chaîne sûre et bornée. */
function normalizeSource(source) {
  return String(source ?? '').slice(0, MAX_SOURCE_LENGTH);
}

/** Une fenêtre enregistrée → une fenêtre valide, ou null (le composant choisira). */
function normalizeView(view) {
  if (!view || typeof view !== 'object') return null;
  const { xMin, xMax, yMin, yMax } = view;
  if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) return null;
  if (!(xMax > xMin) || !(yMax > yMin)) return null;

  return { xMin, xMax, yMin, yMax };
}

/**
 * Un état venu du SERVEUR → un état sûr.
 *
 * Il peut être plus ancien que l'instrument, tronqué, ou fabriqué à la main :
 * rien de ce qu'il contient n'est cru sur parole. Un champ absurde est
 * remplacé par son défaut, jamais propagé — c'est ce qui permet d'ouvrir un
 * document de la version 1 dans la version 3 sans migration.
 */
export function normalizeAnalysisData(data) {
  const base = createAnalysisData();
  if (!data || typeof data !== 'object') return base;

  const functions = Array.isArray(data.functions)
    ? data.functions
      .slice(0, MAX_FUNCTIONS)
      .map((entry, index) => normalizeFunction(entry, index))
      .filter(Boolean)
    : base.functions;

  return {
    lab: LABS.includes(data.lab) ? data.lab : base.lab,
    functions: functions.length > 0 ? functions : base.functions,
    parameters: normalizeParameters(data.parameters),
    point: finiteOr(data.point, base.point),
    secondPoint: finiteOr(data.secondPoint, base.secondPoint),
    limitPoint: finiteOr(data.limitPoint, base.limitPoint),
    bounds: normalizeBounds(data.bounds),
    riemann: normalizeRiemann(data.riemann),
    constant: finiteOr(data.constant, 0),
    transform: normalizeTransform(data.transform),
    layers: normalizeLayers(data.layers),
    view: normalizeView(data.view),
    practice: normalizePractice(data.practice),
    preset: typeof data.preset === 'string' && getPreset(data.preset) ? data.preset : null,
  };
}

function normalizeFunction(entry, index) {
  if (!entry || typeof entry !== 'object') return null;
  const source = normalizeSource(entry.source);
  if (!source) return null;

  return {
    id: entry.id === 'g' ? 'g' : index === 1 ? 'g' : 'f',
    source,
    color: typeof entry.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(entry.color)
      ? entry.color
      : CURVE_COLORS[index % CURVE_COLORS.length],
    visible: entry.visible !== false,
  };
}

function normalizeParameters(parameters) {
  const safe = parameters && typeof parameters === 'object' ? parameters : {};

  return {
    a: clamp(finiteOr(safe.a, 1), -50, 50),
    b: clamp(finiteOr(safe.b, 0), -50, 50),
    c: clamp(finiteOr(safe.c, 0), -50, 50),
  };
}

function normalizeBounds(bounds) {
  const safe = bounds && typeof bounds === 'object' ? bounds : {};

  return { a: finiteOr(safe.a, 0), b: finiteOr(safe.b, 2) };
}

function normalizeRiemann(riemann) {
  const safe = riemann && typeof riemann === 'object' ? riemann : {};
  const n = Math.round(finiteOr(safe.n, 8));

  return {
    n: clamp(Number.isFinite(n) ? n : 8, MIN_RIEMANN_N, MAX_RIEMANN_N),
    mode: RIEMANN_MODES.includes(safe.mode) ? safe.mode : 'left',
  };
}

function normalizeTransform(transform) {
  if (!transform || typeof transform !== 'object') return null;
  if (typeof transform.id !== 'string') return null;

  return { id: transform.id, value: clamp(finiteOr(transform.value, 1), -20, 20) };
}

function normalizeLayers(layers) {
  const safe = layers && typeof layers === 'object' ? layers : {};
  const out = {};
  for (const key of LAYER_KEYS) {
    out[key] = typeof safe[key] === 'boolean' ? safe[key] : DEFAULT_LAYERS[key];
  }

  return out;
}

function normalizePractice(practice) {
  const safe = practice && typeof practice === 'object' ? practice : {};
  const solved = Math.round(finiteOr(safe.solved, 0));
  const seen = Math.round(finiteOr(safe.seen, 0));

  return {
    solved: clamp(Number.isFinite(solved) ? solved : 0, 0, 100000),
    seen: clamp(Number.isFinite(seen) ? seen : 0, 0, 100000),
  };
}

/* ── Les transitions : des fonctions PURES état → état ────────────────── */

export function setLab(data, lab) {
  if (!LABS.includes(lab) || data.lab === lab) return data;

  return { ...data, lab };
}

export function setSource(data, id, source) {
  const next = normalizeSource(source);

  return {
    ...data,
    preset: null,
    functions: data.functions.map((entry) => (entry.id === id ? { ...entry, source: next } : entry)),
  };
}

/** Ajoute g (§23, §26) — jamais plus d'une seconde fonction. */
export function addSecondFunction(data, source = 'x+2') {
  if (data.functions.length >= MAX_FUNCTIONS) return data;

  return { ...data, functions: [...data.functions, makeFunction('g', normalizeSource(source), 1)] };
}

export function removeSecondFunction(data) {
  if (data.functions.length < 2) return data;

  return { ...data, functions: data.functions.slice(0, 1) };
}

export function toggleLayer(data, key) {
  if (!LAYER_KEYS.includes(key)) return data;

  return { ...data, layers: { ...data.layers, [key]: !data.layers[key] } };
}

export function setPoint(data, x) {
  if (!Number.isFinite(x)) return data;

  return { ...data, point: x };
}

export function setSecondPoint(data, x) {
  if (!Number.isFinite(x)) return data;

  return { ...data, secondPoint: x };
}

export function setLimitPoint(data, x) {
  if (!Number.isFinite(x)) return data;

  return { ...data, limitPoint: x };
}

export function setBounds(data, a, b) {
  return {
    ...data,
    bounds: { a: finiteOr(a, data.bounds.a), b: finiteOr(b, data.bounds.b) },
  };
}

export function setRiemann(data, patch) {
  return { ...data, riemann: normalizeRiemann({ ...data.riemann, ...patch }) };
}

export function setParameter(data, name, value) {
  if (!['a', 'b', 'c'].includes(name) || !Number.isFinite(value)) return data;

  return { ...data, parameters: { ...data.parameters, [name]: clamp(value, -50, 50) } };
}

export function setConstant(data, value) {
  if (!Number.isFinite(value)) return data;

  return { ...data, constant: clamp(value, -20, 20) };
}

export function setTransform(data, transform) {
  return { ...data, transform: normalizeTransform(transform) };
}

export function setView(data, view) {
  return { ...data, view: normalizeView(view) };
}

/** Applique un préréglage : la fonction ET la fenêtre qui la montre bien. */
export function applyPreset(data, id) {
  const preset = getPreset(id);
  if (!preset) return data;

  return {
    ...data,
    preset: preset.id,
    functions: [{ ...data.functions[0], source: preset.source }, ...data.functions.slice(1)],
    view: normalizeView(preset.view),
    // Un préréglage propose SON laboratoire : c'est le geste qui lui va.
    lab: LABS.includes(preset.focus) ? preset.focus : data.lab,
  };
}

/** L'entraînement ne garde qu'un score — ni série, ni médaille (§43). */
export function recordPractice(data, solved) {
  return {
    ...data,
    practice: {
      solved: data.practice.solved + (solved ? 1 : 0),
      seen: data.practice.seen + 1,
    },
  };
}

/** Le document remis à neuf, en gardant ce qui n'est pas du contenu. */
export function clearAnalysisData() {
  return createAnalysisData();
}

