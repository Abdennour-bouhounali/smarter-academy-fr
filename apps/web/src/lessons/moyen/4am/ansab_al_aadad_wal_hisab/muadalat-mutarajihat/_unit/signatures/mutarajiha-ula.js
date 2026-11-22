/**
 * Signature de la مسألة de `mutarajiha-ula` (module 6, « رصيد رياض ») pour les textes montrés avant elle (points d'étape, ouverture, « أستعدّ »,
 * ورقة زميل, cartes et carte des معارف, lignes d'exercices, sources des modules 0 à 5). Lue par `_unit/missionStrings.test.js` et par
 * `mutarajiha-ula/content/mission.test.js`. La règle PAR RÔLE (valeurs de l'écran du labo) est dans `content/forbidden.js`.
 *
 *   La مسألة : crédit 600 دج, باقة 120 دج, 3 دج par message (le coefficient), plancher 200 دج « على الأقل » ; 600 − 120 − 3x ≥ 200 ;
 *   480, −3x ≥ −280, la division par −3, x ≤ 280/3, 93 messages, 201 دج, 94 → 198 ; bruit : 18500 دج, 45 amis.
 */
export const TEXT = [
  /600\s*[−-]\s*120/, /(^|[^0-9a-z^{.,])[-−]?\s*3x(?![0-9^])/, /\\div\s*\(?\s*[-−]\s*3\s*\)?(?![0-9])/, /[÷]\s*\(?\s*[-−]\s*3\s*\)?(?![0-9])/,
  /على\s*[-−]\s*3(?![0-9])/, /280\s*\/\s*3|\\dfrac\{280\}\{3\}/, /على الأقل/,
  /(?<![0-9.,{]|[a-z]-)(480|280|93|94|201|198|210|195|18500|600|120)(?![0-9])/,
];
