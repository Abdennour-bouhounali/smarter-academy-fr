import { getMathLabTool } from './toolRegistry.js';
import { mathLabToolPath } from './mathLabDocument.js';

/**
 * LE POINT D'INTÉGRATION leçon → مختبر (architecture seulement, aucune leçon
 * ne l'appelle encore — docs/architecture/MATH_LAB.md §« Depuis une leçon »).
 *
 * Le geste futur :
 *
 *     Leçon → « استكشف في المختبر » → l'instrument s'ouvre → état initial fourni par la leçon
 *
 * La leçon ne construit pas l'état de l'outil elle-même : elle passe une
 * AMORCE (`seed`) que `tool.createInitialData(seed)` sait lire — chaque
 * instrument documente la sienne (pour la سبّورة : des éléments-squelettes,
 * voir tools/whiteboard/whiteboardState.js). Le tout voyage dans l'état de
 * navigation du routeur, jamais dans l'URL : une amorce peut être longue.
 *
 *     const launch = buildMathLabLaunch({ tool: 'whiteboard', seed, title, origin: { lessonCode } });
 *     navigate(launch.to, { state: launch.state });        // ou <Link to={launch.to} state={launch.state}>
 *
 * @param {{tool: string, seed?: unknown, title?: string, origin?: object}} options
 * @returns {{to: string, state: {mathLab: object}}}
 */
export function buildMathLabLaunch({ tool, seed = undefined, title = undefined, origin = undefined }) {
  const definition = getMathLabTool(tool);
  if (!definition) {
    throw new Error(`[mathlab] instrument inconnu « ${tool} »`);
  }

  return {
    to: mathLabToolPath(definition),
    state: { mathLab: { tool, seed, title, origin } },
  };
}

/**
 * Ce que la page d'un instrument relit dans `location.state` : l'amorce, si
 * elle est bien destinée à CET instrument. Un état d'un autre outil, ou
 * d'un autre âge (retour arrière), est ignoré.
 *
 * @returns {{tool: string, seed?: unknown, title?: string, origin?: object} | null}
 */
export function readMathLabLaunch(locationState, toolId) {
  const launch = locationState?.mathLab;
  if (!launch || typeof launch !== 'object' || launch.tool !== toolId) return null;

  return launch;
}
