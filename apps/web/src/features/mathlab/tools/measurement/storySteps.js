/**
 * « كيف ظهرت هذه القاعدة؟ » (§22) — LE CHEMIN DE LA DÉCOUVERTE, PAS À PAS (logique pure).
 *
 * Exigence de la propriétaire (2026-09-30) : un raisonnement ne s'affiche
 * jamais d'un bloc. Le récit était une liste de sept étapes posée d'un
 * coup ; il se DÉROULE maintenant avec le lecteur partagé (`useStepReveal`) :
 * chaque pas est une étape du chemin (mesurer, recommencer, comparer,
 * chercher ce qui ne change pas…) et le DERNIER est la règle.
 *
 * Ce que le dernier pas montre dépend de l'élève, jamais de la solution
 * cachée (§23) :
 *   — règle TROUVÉE : la règle qu'IL a écrite (`formatRule` de sa règle),
 *     en notation LTR ;
 *   — pas encore : « c'est à toi de l'écrire » — la formule n'est jamais
 *     donnée par le récit.
 *
 * Les textes restent des clés : `story.<id>.<n>`, avec repli sur
 * `story.generic.<n>` quand l'enquête n'a pas son propre récit.
 */

import { formatRule } from './ruleEngine.js';

/** Le nombre d'étapes d'un récit (les clés `story.*.1 … 7`). */
export const STORY_LENGTH = 7;

/**
 * @param {object} investigation   une enquête de `investigations.js`
 * @param {{ found?: boolean, rule?: object|null }} [state]
 *   `found` : la découverte est constatée (étape `found` ou `explained`) ;
 *   `rule`  : la règle de l'élève.
 * @returns {{ ok: boolean, steps: Array<{
 *   kind: 'stage'|'result', textKey: string, fallbackKey: string,
 *   rule?: string, noteKey?: string
 * }> }}
 */
export function buildStorySteps(investigation, { found = false, rule = null } = {}) {
  if (!investigation?.id) return { ok: false, steps: [] };

  const steps = Array.from({ length: STORY_LENGTH }, (unused, index) => ({
    kind: index === STORY_LENGTH - 1 ? 'result' : 'stage',
    textKey: `story.${investigation.id}.${index + 1}`,
    fallbackKey: `story.generic.${index + 1}`,
  }));

  const last = steps[STORY_LENGTH - 1];
  if (found && rule) {
    const symbolOf = (name) => investigation.quantities?.find((entry) => entry.key === name)?.symbol ?? name;
    last.rule = `${symbolOf(investigation.target)} = ${formatRule(rule, symbolOf)}`;
    last.noteKey = 'story.ruleFound';
  } else {
    last.noteKey = 'story.ruleAwaits';
  }

  return { ok: true, steps };
}
