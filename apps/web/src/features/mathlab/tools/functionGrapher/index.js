import { LineChart } from 'lucide-react';
import { defineMathLabTool } from '../../toolContract.js';
import { FUNCTION_GRAPHER_SCHEMA_VERSION, createFunctionGrapherData } from './grapherState.js';
import { GRAPHER_CAPABILITIES, GRAPHER_SCOPES } from './scope.js';
import { summarizeFunctionGrapher } from './summarize.js';

/**
 * Le grapheur (راسم الدوال) — le deuxième instrument du مختبر الرياضيات.
 *
 * Écrire une fonction, voir sa courbe tout de suite, la toucher : zoomer,
 * glisser, poser un point et lire f(x). Le plan est dessiné par mafs (MIT,
 * déjà dans le projet) ; la saisie par MathLive ; l'analyse et l'évaluation
 * par notre propre petit analyseur (expressionParser.js) — pas de système de
 * calcul formel. Chargé PARESSEUSEMENT par `load`. Le choix des moteurs est
 * documenté dans docs/architecture/MATH_LAB.md.
 */
export const functionGrapherTool = defineMathLabTool({
  id: 'functionGrapher',
  slug: 'grapheur',
  labelKey: 'tools.functionGrapher.name',
  descriptionKey: 'tools.functionGrapher.description',
  newLabelKey: 'tools.functionGrapher.new',
  defaultTitleKey: 'tools.functionGrapher.defaultTitle',
  icon: LineChart,
  schemaVersion: FUNCTION_GRAPHER_SCHEMA_VERSION,
  // Les deux مخابر — sans المماس ni fonctions transcendantes au collège (scope.js).
  scopes: GRAPHER_SCOPES,
  capabilities: GRAPHER_CAPABILITIES,
  createInitialData: createFunctionGrapherData,
  summarize: summarizeFunctionGrapher,
  load: () => import('./FunctionGrapherTool.jsx'),
});
