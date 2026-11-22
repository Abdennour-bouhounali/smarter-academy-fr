/**
 * La signature de TEXTE de la مسألة de « ترييض مشكلة » (module 4, « عائلة مراد ») : ce qu'aucun texte montré à l'élève avant elle ne contient
 * (cartes de connaissance, carte des معارف, points d'étape, exercices). Lue par `_unit/missionStrings.test.js` et `content/mission.test.js`.
 * Climax : père 44 ans, enfants 5, 9, 16 ; x = 7 (père 51) ; « ثلاثة أضعاف » : x = −2 (année 2024) ; x > 7 (8, année 2034) ; année 2026.
 */
export const TEXT = [
  /مراد/,
  /(^|[^0-9.,{])(44|51|2026|2024|2034)(?![0-9])/,
  /x\s*=\s*7(?![0-9]|\s*\+)/, /x\s*=\s*[-−]\s*2(?![0-9])/, /x\s*>\s*7(?![0-9])/, /x\s*\\?geq?\s*8(?![0-9])/,
  /44\s*\+\s*x/, /3x\s*\+\s*30/, /48\s*\+\s*3x/, /16\s*\+\s*x/, /2x\s*=\s*14(?![0-9])/, /2x\s*=\s*[-−]\s*4(?![0-9])/,
  /5\s*\+\s*9\s*\+\s*16/,
];
