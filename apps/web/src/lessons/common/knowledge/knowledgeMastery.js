/**
 * SURCOUCHE DE MAÎTRISE de la carte des connaissances (Mastery V2, phase 8c).
 *
 * La carte reste pilotée par la COMPLÉTION pour ce qu'elle MONTRE (un item
 * apparaît quand son module est parcouru — knowledgeState.js). Cette
 * surcouche ne fait qu'AJOUTER, à côté de chaque module du fil « بطاقتك »,
 * l'état des points d'apprentissage que ce module enseigne
 * (`teachesLearningPointIds`, lesson.config.js). Un point en lacune dans un
 * module déjà parcouru propose « راجع » vers ce module.
 *
 * Pur : le profil, les chemins et la complétion sont passés par l'appelant.
 *
 * @param {{
 *   moduleNumbers: number[],                       modules du fil, dans l'ordre
 *   modules?: object[],                             LESSON_CONFIG.modules
 *   rowsByCode?: Map<string, object>,               lignes du profil (code → ligne)
 *   completedModules?: Set<number>,                 modules parcourus
 *   modulePath?: (number: number) => string|null,
 * }} input
 * @returns {Map<number, {dots: Array<{code: string, state: string, row: object|undefined}>, reviewPath: string|null}>}
 */
export function moduleMasteryOverlay({
  moduleNumbers = [], modules = [], rowsByCode = new Map(), completedModules = new Set(), modulePath = () => null,
} = {}) {
  const out = new Map();
  for (const n of moduleNumbers) {
    const mod = (modules ?? []).find((m) => Number(m?.number) === Number(n));
    const codes = mod?.teachesLearningPointIds ?? [];
    if (codes.length === 0) continue;
    const dots = codes.map((code) => {
      const row = rowsByCode.get(code);
      return { code, state: stateOf(row), row };
    });
    const hasGap = dots.some((d) => d.state === 'gap');
    const reviewPath = hasGap && completedModules.has(Number(n)) ? (modulePath(Number(n)) ?? null) : null;
    out.set(Number(n), { dots, reviewPath });
  }
  return out;
}

// Même règle que resolveMasteryState (LearningPointMastery.jsx), sans React.
const STATES = ['unassessed', 'gap', 'reinforce', 'mastered'];
function stateOf(row) {
  return row && STATES.includes(row.status) ? row.status : 'unassessed';
}
