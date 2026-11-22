/**
 * L'ÉTAT du grapheur — logique pure, sans React ni DOM.
 *
 *     data = {
 *       functions: [{ id, name, expression, visible, color, domain }],
 *       points:    [{ id, name, functionId, x }],
 *       viewport:  { xMin, xMax, yMin, yMax } | null,
 *       settings:  { grid },
 *       tangent:   { enabled, functionId, x, showDerivative, showTriangle }
 *     }
 *
 * `expression` est la chaîne SAISIE (LaTeX de MathLive, ou ASCII d'une
 * leçon) — voir expressionParser.js pour le sous-ensemble accepté. Un
 * document garde une expression invalide telle quelle : l'élève la retrouve
 * et la corrige. `domain` (`{min, max}`, chaque borne facultative) restreint
 * le tracé ; l'interface V1 ne l'édite pas, une amorce de leçon peut le poser.
 *
 * `points` : les points d'inspection posés sur une courbe — une liste dès
 * aujourd'hui (V1 n'en pose qu'un). `viewport` null = la fenêtre par
 * défaut, ajustée à la boîte. `settings.grid` est la grille que la coquille
 * bascule. `tangent` est le mode « المماس » : UNE fonction étudiée
 * (`functionId`), le point A en `x`, la courbe de f′ et le triangle de
 * pente en option. Absent d'un document ancien → désactivé.
 *
 * FUNCTION_GRAPHER_SCHEMA_VERSION est la version de CE format.
 */

import { isValidViewport, normalizeViewport } from './viewport.js';

export const FUNCTION_GRAPHER_SCHEMA_VERSION = 1;

/** Le nombre maximal de dalles tracées en même temps — autant que de couleurs distinctes. */
export const MAX_FUNCTIONS = 6;

/**
 * La palette des courbes : six teintes de la charte (Tailwind 600), toutes
 * lisibles sur blanc, toutes distinctes entre elles. L'ordre est celui
 * d'attribution ; une couleur libérée est réutilisée.
 */
export const FUNCTION_PALETTE = Object.freeze([
  '#2563eb', // blue-600
  '#e11d48', // rose-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
]);

/**
 * Les couleurs que l'élève peut CHOISIR pour une courbe : la palette
 * automatique, plus trois teintes (indigo, rose vif, ardoise sombre — cette
 * dernière sert aussi de contraste pour un lecteur daltonien). Le choix est
 * libre : deux courbes peuvent porter la même couleur si l'élève le veut.
 */
export const FUNCTION_COLOR_CHOICES = Object.freeze([
  ...FUNCTION_PALETTE,
  '#4f46e5', // indigo-600
  '#db2777', // pink-600
  '#334155', // slate-700
]);

/** La couleur des constructions du mode tangente (tangente, triangle, guide) : neutre, distincte de toute courbe. */
export const CONSTRUCTION_COLOR = '#334155';

/** Le mode tangente d'un document neuf ou ancien : éteint, A en x = 1. */
const DEFAULT_TANGENT = Object.freeze({ enabled: false, functionId: null, x: 1, showDerivative: false, showTriangle: true });

/**
 * La couleur de f′ : la première de la palette que ne porte AUCUNE courbe
 * du plan (ni f, ni les autres fonctions) — f′ ne doit se confondre avec
 * rien. Si tout est pris, la première qui n'est pas celle de f.
 */
export function derivativeColorFor(color, usedColors = []) {
  const taken = new Set([color, ...usedColors].map((c) => String(c).toLowerCase()));
  const free = FUNCTION_PALETTE.find((candidate) => !taken.has(candidate));

  return free ?? FUNCTION_PALETTE.find((candidate) => candidate !== String(color).toLowerCase()) ?? FUNCTION_PALETTE[1];
}

/** Les noms des fonctions, dans l'ordre des manuels : f, g, h, puis k, l, m. */
const FUNCTION_NAMES = Object.freeze(['f', 'g', 'h', 'k', 'l', 'm']);

/** Les noms de points. */
const POINT_NAMES = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F']);

/** Les exemples proposés pour démarrer — des amorces d'exploration, pas un cours. */
export const FUNCTION_PRESETS = Object.freeze([
  { expression: 'x', latex: 'x' },
  { expression: 'x^2', latex: 'x^2' },
  { expression: '2x+1', latex: '2x+1' },
  { expression: '\\frac{1}{x}', latex: '\\frac{1}{x}' },
  { expression: '\\left|x\\right|', latex: '\\left|x\\right|' },
  { expression: '\\sqrt{x}', latex: '\\sqrt{x}' },
  { expression: '\\sin(x)', latex: '\\sin(x)' },
]);

/** L'exemple ouvert dans un document neuf : l'élève voit tout de suite un repère, une courbe, une expression. */
export const FIRST_RUN_EXPRESSION = 'x^2';

let counter = 0;
/** Un identifiant local au document : court, unique dans le document, stable une fois enregistré. */
export function newId(prefix = 'fn') {
  counter += 1;

  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** Le premier nom libre parmi f, g, h… ; au-delà, f2, g2… */
export function nextFunctionName(functions) {
  const used = new Set(functions.map((f) => f.name));
  const free = FUNCTION_NAMES.find((name) => !used.has(name));
  if (free) return free;
  for (let round = 2; ; round += 1) {
    const name = FUNCTION_NAMES.find((candidate) => !used.has(`${candidate}${round}`));
    if (name) return `${name}${round}`;
  }
}

/** La première couleur libre de la palette, sinon la suivante dans l'ordre. */
export function nextFunctionColor(functions) {
  const used = new Set(functions.map((f) => f.color));
  const free = FUNCTION_PALETTE.find((color) => !used.has(color));

  return free ?? FUNCTION_PALETTE[functions.length % FUNCTION_PALETTE.length];
}

export function nextPointName(points) {
  const used = new Set(points.map((p) => p.name));

  return POINT_NAMES.find((name) => !used.has(name)) ?? `P${points.length + 1}`;
}

function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'object') return null;
  const min = Number.isFinite(domain.min) ? domain.min : null;
  const max = Number.isFinite(domain.max) ? domain.max : null;
  if (min === null && max === null) return null;
  if (min !== null && max !== null && min >= max) return null;

  return { min, max };
}

/**
 * Une fonction telle qu'elle vient d'un document, d'une amorce ou de
 * l'interface → une fonction sûre. Les champs absents reçoivent leur valeur
 * par défaut ; les champs inconnus sont ignorés.
 */
export function normalizeFunction(raw, existing = []) {
  const source = raw && typeof raw === 'object' ? raw : {};

  return {
    id: typeof source.id === 'string' && source.id ? source.id : newId('fn'),
    name: typeof source.name === 'string' && source.name ? source.name : nextFunctionName(existing),
    expression: typeof source.expression === 'string' ? source.expression : '',
    visible: source.visible !== false,
    color: typeof source.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(source.color) ? source.color : nextFunctionColor(existing),
    domain: normalizeDomain(source.domain),
  };
}

function normalizePoint(raw, functions, existing = []) {
  const source = raw && typeof raw === 'object' ? raw : {};
  if (!functions.some((f) => f.id === source.functionId) || !Number.isFinite(source.x)) return null;

  return {
    id: typeof source.id === 'string' && source.id ? source.id : newId('pt'),
    name: typeof source.name === 'string' && source.name ? source.name : nextPointName(existing),
    functionId: source.functionId,
    x: source.x,
  };
}

/** N'importe quel `data` (document, amorce, version antérieure) → l'état V1 complet et sûr. */
export function normalizeGrapherData(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const functions = [];
  for (const entry of Array.isArray(source.functions) ? source.functions.slice(0, MAX_FUNCTIONS) : []) {
    functions.push(normalizeFunction(entry, functions));
  }
  const points = [];
  for (const entry of Array.isArray(source.points) ? source.points : []) {
    const point = normalizePoint(entry, functions, points);
    if (point) points.push(point);
  }

  return {
    functions,
    points,
    viewport: isValidViewport(source.viewport) ? normalizeViewport(source.viewport) : null,
    settings: { grid: source.settings?.grid !== false },
    tangent: normalizeTangent(source.tangent, functions),
  };
}

/** Le mode tangente, sûr : une fonction étudiée qui existe (sinon la première), une abscisse finie. */
export function normalizeTangent(raw, functions) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const known = functions.some((f) => f.id === source.functionId);

  return {
    enabled: source.enabled === true,
    functionId: known ? source.functionId : (functions[0]?.id ?? null),
    x: Number.isFinite(source.x) ? source.x : DEFAULT_TANGENT.x,
    showDerivative: source.showDerivative === true,
    showTriangle: source.showTriangle !== false,
  };
}

/**
 * L'état d'un document neuf.
 *
 * Sans amorce : l'exemple de première visite (`f(x) = x²` ; `2x + 1` dans
 * مخبر المتوسط — `context.capabilities.firstExpression`, voir scope.js). Avec une amorce
 * de leçon (openMathLab.js) : `{ functions: [{ expression, name?, color?, visible?, domain? }],
 * viewport?, points?: [{ functionId | functionIndex, x }],
 * tangent?: { enabled, functionId | functionIndex, x, showDerivative?, showTriangle? } }`.
 */
export function createFunctionGrapherData(seed = undefined, context = {}) {
  if (seed && typeof seed === 'object' && Array.isArray(seed.functions)) {
    const data = normalizeGrapherData({ ...seed, points: [] });
    // Une amorce peut désigner une fonction par son rang plutôt que par un identifiant.
    for (const entry of Array.isArray(seed.points) ? seed.points : []) {
      const target = typeof entry?.functionIndex === 'number' ? data.functions[entry.functionIndex] : data.functions.find((f) => f.id === entry?.functionId);
      const point = target ? normalizePoint({ ...entry, functionId: target.id }, data.functions, data.points) : null;
      if (point) data.points.push(point);
    }
    // Le mode tangente d'une amorce peut aussi désigner sa fonction par son rang.
    if (seed.tangent && typeof seed.tangent === 'object') {
      const byIndex = typeof seed.tangent.functionIndex === 'number' ? data.functions[seed.tangent.functionIndex] : null;
      data.tangent = normalizeTangent({ ...seed.tangent, functionId: byIndex ? byIndex.id : seed.tangent.functionId }, data.functions);
    }

    return data;
  }

  // Le مخبر choisit l'exemple d'ouverture : une droite au collège (scope.js).
  const firstExpression = context?.capabilities?.firstExpression ?? FIRST_RUN_EXPRESSION;

  return normalizeGrapherData({
    functions: [{ expression: firstExpression }],
    viewport: null,
    settings: { grid: true },
  });
}

/** Un grapheur sans rien à tracer. */
export function isGrapherEmpty(data) {
  return !Array.isArray(data?.functions) || data.functions.length === 0;
}

