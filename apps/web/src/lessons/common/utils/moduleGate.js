import { isModuleUnlocked, getModuleStatus } from '@smarter-academy/core';

/**
 * LA PORTE d'un module, en un seul endroit — pour ModuleLayout (la page) et
 * LessonIndex (le sommaire), qui doivent répondre la même chose.
 *
 * Le verrou séquentiel (lessonAccess.js) est un guide de progression de
 * l'ÉLÈVE. Deux situations le suspendent, sans jamais le modifier :
 *   — présenter (وضع القسم) : on projette le module 3 sans avoir « fini »
 *     les précédents ;
 *   — la NAVIGATION LIBRE du lecteur (learningViewer.freeNavigation) : un
 *     enseignant ouvre n'importe quel module, dans n'importe quel ordre.
 * Un module RETIRÉ par l'administration reste fermé pour tout le monde :
 * la publication n'est pas une progression.
 */
export function resolveModuleUnlock({
  presenting = false,
  freeNavigation = false,
  alreadyDone = false,
  sequentialUnlock = false,
  isModuleCompleted,
  moduleNumber,
  stage,
  firstModuleNumber,
  previousStage,
}) {
  if (presenting || freeNavigation || alreadyDone || !sequentialUnlock) return true;

  return isModuleUnlocked(isModuleCompleted, moduleNumber, { stage, firstModuleNumber, previousStage });
}

/**
 * L'état d'une carte de module du sommaire : `locked` | `unlocked` |
 * `current` | `mastered` (le vocabulaire de getModuleStatus).
 *
 * `masteryStatusById` est ACCEPTÉ mais volontairement NON transmis au cœur :
 * `getModuleStatus` ferait d'une porte `requiresLearningPointIds` un verrou,
 * et une lacune ne doit jamais fermer un module (progression non bloquante).
 * La porte de maîtrise est un conseil — voir softGate.js (`softGateHint`).
 */
export function resolveModuleStatus({
  closed = false,
  freeNavigation = false,
  sequentialUnlock = false,
  isDone = false,
  isModuleCompleted,
  moduleNumber,
  currentModule,
  module,
  masteryStatusById,
  firstModuleNumber,
  previousStage,
}) {
  if (closed) return 'locked';
  if (freeNavigation) return isDone ? 'mastered' : 'unlocked';
  if (!sequentialUnlock) return isDone ? 'mastered' : 'unlocked';

  // Porte douce : jamais de `masteryStatusById` ici (voir ci-dessus).
  void masteryStatusById;
  return getModuleStatus({ isModuleCompleted, moduleNumber, currentModule, module, masteryStatusById: undefined, firstModuleNumber, previousStage });
}
