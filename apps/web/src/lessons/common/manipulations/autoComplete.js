import { AUTO_COMPLETE_UNLOCKS } from '@smarter-academy/core/curriculum/manipulationTypes.js';

/**
 * « COMPLÉTER AUTOMATIQUEMENT » — les décisions PURES du bouton élève
 * (MANIPULATION_CONTRACT §6bis). Aucun React ici : le composant
 * `ManipulationAutoComplete` lit ces fonctions, les tests aussi.
 *
 * Le principe. L'élève fait le PREMIER exemple à la main — c'est là qu'il
 * comprend ce que « répartir en parts égales » ou « couper le petit ruban
 * dans le grand » veut dire. Quand le même geste ne ferait plus que se
 * répéter, il peut demander à la manipulation de le finir pour lui. Le
 * geste manuel reste toujours là ; le bouton ne se déclenche jamais seul.
 *
 * Trois sources, trois responsabilités :
 *   - le REGISTRE (`MANIPULATION_TYPES[type].controls.autoComplete`) décide
 *     si le type y a droit et quand il se déverrouille ;
 *   - le TYPE (`controller.autoComplete`) dit si sa configuration est valide,
 *     ce qui reste à faire, et fournit `step` / `finish` — construits sur SA
 *     logique pure, jamais sur une seconde définition du « juste » ;
 *   - ce fichier décide de l'ÉTAT du bouton et du RYTHME de l'animation.
 */

/** Durée totale visée : assez pour voir le geste, trop courte pour attendre. */
export const AUTO_COMPLETE_BUDGET_MS = 900;
/** Au-delà, on regroupe plusieurs gestes par pas au lieu d'allonger. */
export const AUTO_COMPLETE_MAX_TICKS = 18;

/** Le registre déclare-t-il la capacité, sous une forme connue ? */
export function isAutoCompleteCapability(capability) {
  return !!capability && typeof capability === 'object' && AUTO_COMPLETE_UNLOCKS.includes(capability.unlock);
}

/**
 * L'ÉTAT du bouton.
 *
 *   hidden   le registre ne l'accorde pas, ou le type ne fournit pas la mécanique
 *   locked   `unlock: 'first-gesture'` et aucun geste manuel encore
 *   invalid  configuration incomplète ou invalide — rien d'automatique n'est proposé
 *   ready    le bouton est actif
 *   running  l'animation est en cours
 *   done     plus rien à compléter (la scène est déjà dans son état final)
 *
 * `ready` vient du type et veut dire « configuration valide » — pas « il y a
 * une saisie ». `remaining` est le nombre de gestes canoniques restants.
 */
export function autoCompleteStatus({ capability, auto, running = false }) {
  if (!isAutoCompleteCapability(capability) || !auto || typeof auto.finish !== 'function') return 'hidden';
  if (running) return 'running';
  if (!auto.ready) return 'invalid';
  if (!(auto.remaining > 0)) return 'done';
  if (capability.unlock === 'first-gesture' && !auto.manualDone) return 'locked';
  return 'ready';
}

/**
 * Le RYTHME. `remaining` gestes, jouées en `ticks` pas de `perTick` gestes,
 * espacés de `intervalMs`. Peu d'objets : un par pas, on les voit arriver.
 * Beaucoup d'objets : on les groupe, la durée reste bornée. Mouvement réduit
 * (ou pas de `step`) : aucun pas, l'état final directement.
 */
export function autoCompletePlan(remaining, { reducedMotion = false, canStep = true, maxTicks = AUTO_COMPLETE_MAX_TICKS, intervalMs: fixedInterval } = {}) {
  const n = Math.max(0, Math.floor(remaining || 0));
  if (n === 0 || reducedMotion || !canStep) return { ticks: 0, perTick: 0, intervalMs: 0 };
  const ticks = Math.min(n, maxTicks);
  const perTick = Math.ceil(n / ticks);
  // Un type qui MONTRE chaque essai (factor-pairs : « جرّب كل الإمكانيات »)
  // fixe son rythme : un essai par pas, court mais lisible.
  if (fixedInterval) return { ticks, perTick, intervalMs: fixedInterval };
  const intervalMs = Math.round(Math.min(140, Math.max(45, AUTO_COMPLETE_BUDGET_MS / ticks)));
  return { ticks, perTick, intervalMs };
}
