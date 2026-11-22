import { isMasteryGateSatisfied, recommendModulesForLearningPoints } from '@smarter-academy/core';

/**
 * PORTE DE MAÎTRISE DOUCE (Mastery V2, phase 8b).
 *
 * Un module peut déclarer `requiresLearningPointIds` (lesson.config.js).
 * `packages/core` sait dire si ces points sont acquis
 * (`isMasteryGateSatisfied`) — et `getModuleStatus` en ferait un VERROU.
 * Côté élève, ce verrou n'est jamais appliqué : la progression est non
 * bloquante (LESSON_CONTRACT.md). La porte devient un CONSEIL : la carte
 * reste ouverte, une petite ligne ambre nomme le point à revoir et renvoie
 * vers le(s) module(s) qui l'enseignent. `resolveModuleStatus`
 * (moduleGate.js) ne transmet donc jamais `masteryStatusById` au cœur.
 */

/**
 * `code → status` depuis un profil `useLearningProfile(...)` (currentMastery
 * imbriqué classe → leçon → points). Vide sans profil — jamais inventé.
 *
 * @param {{currentMastery?: object[]}|null|undefined} profile
 * @returns {Record<string, string>}
 */
export function masteryStatusByIdFromProfile(profile) {
  const out = {};
  for (const grade of profile?.currentMastery ?? []) {
    for (const lesson of grade?.lessons ?? []) {
      for (const row of lesson?.learningPoints ?? []) {
        const code = row?.code ?? row?.learningPointCode ?? row?.learning_point_code;
        if (code && typeof row.status === 'string') out[code] = row.status;
      }
    }
  }
  return out;
}

/**
 * Le conseil d'un module : faut-il l'afficher, pour quels points, vers quels
 * modules. Ne renvoie JAMAIS d'état de verrouillage.
 *
 * @param {{number?: number, requiresLearningPointIds?: string[]}} module
 * @param {Record<string, string>|null|undefined} masteryStatusById
 * @param {object[]} [lessonModules] LESSON_CONFIG.modules
 * @returns {{show: boolean, learningPointIds: string[], recommendedModules: object[]}}
 */
export function softGateHint(module, masteryStatusById, lessonModules = []) {
  const none = { show: false, learningPointIds: [], recommendedModules: [] };
  const required = module?.requiresLearningPointIds;
  if (!required?.length || !masteryStatusById) return none;
  if (isMasteryGateSatisfied(required, masteryStatusById)) return none;

  const learningPointIds = required.filter((id) => masteryStatusById[id] === 'gap');
  if (learningPointIds.length === 0) return none;

  // Le module lui-même n'est pas une recommandation : on renvoie vers ceux
  // qui ENSEIGNENT les points requis.
  const others = (lessonModules ?? []).filter((m) => m !== module && Number(m?.number) !== Number(module?.number));
  const recommendedModules = recommendModulesForLearningPoints(others, learningPointIds).map((r) => r.module);

  return { show: true, learningPointIds, recommendedModules };
}
