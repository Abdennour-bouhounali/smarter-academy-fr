import { whiteboardTool } from './tools/whiteboard/index.js';
import { functionGrapherTool } from './tools/functionGrapher/index.js';
import { geometry3dTool } from './tools/geometry3d/index.js';
import { probabilityStatsTool } from './tools/probabilityStats/index.js';
import { algebraTool } from './tools/algebra/index.js';
import { vectorsTool } from './tools/vectors/index.js';
import { trigonometryTool } from './tools/trigonometry/index.js';
import { sequencesTool } from './tools/sequences/index.js';
import { transformationsTool } from './tools/transformations/index.js';
import { conicsTool } from './tools/conics/index.js';
import { numberLabTool } from './tools/numberLab/index.js';
import { analysisTool } from './tools/analysis/index.js';
import { logicTool } from './tools/logic/index.js';
import { measurementTool } from './tools/measurement/index.js';

/**
 * Le REGISTRE des instruments du مختبر الرياضيات (Math Lab).
 *
 * Ajouter un instrument = un dossier `tools/<nom>/` qui exporte une
 * définition (`defineMathLabTool`), une ligne dans `MATH_LAB_TOOLS`, et son
 * identifiant dans le registre serveur (App\Domain\MathLab\MathLabTools).
 * Rien d'autre : ni route, ni coquille, ni persistance à toucher — c'est
 * la promesse de docs/architecture/MATH_LAB.md.
 *
 * L'ordre est celui de l'accueil.
 *
 * @type {ReadonlyArray<import('./toolContract.js').MathLabTool>}
 */
export const MATH_LAB_TOOLS = Object.freeze([
  whiteboardTool,
  functionGrapherTool,
  geometry3dTool,
  probabilityStatsTool,
  algebraTool,
  vectorsTool,
  trigonometryTool,
  sequencesTool,
  transformationsTool,
  conicsTool,
  numberLabTool,
  analysisTool,
  logicTool,
  measurementTool,
]);

/**
 * Les instruments ANNONCÉS, pas encore construits : un nom et une icône,
 * rien d'autre — ni route, ni composant, ni faux écran. L'accueil les montre
 * désactivés, marqués « قريبًا », comme le catalogue montre une leçon à venir.
 * Un instrument passe d'ici à MATH_LAB_TOOLS le jour où il existe.
 */
export const PLANNED_MATH_LAB_TOOLS = Object.freeze([]);

/** @returns {import('./toolContract.js').MathLabTool | null} */
export function getMathLabTool(id) {
  return MATH_LAB_TOOLS.find((tool) => tool.id === id) ?? null;
}

/**
 * L'instrument derrière un segment d'URL (/espace/atelier/<slug>) — son
 * segment canonique ou l'un de ses alias (`nombres-calcul` ouvre `nombres`).
 */
export function getMathLabToolBySlug(slug) {
  return MATH_LAB_TOOLS.find((tool) => tool.slug === slug || tool.aliases?.includes(slug)) ?? null;
}
