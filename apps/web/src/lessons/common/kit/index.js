/**
 * Lesson kit — système de composants réutilisables pour générer des leçons.
 *
 * Extrait de la leçon de référence « Nombres entiers » (6e), validée. Voir
 * docs/architecture/LESSON_INTEGRATION_GUIDE.md pour les politiques que ces
 * composants appliquent par construction.
 *
 *  - ContentModule / useKit : shell d'un module de contenu formatif
 *    (progression, verrouillage, effets, auto-scroll, auto-avance).
 *  - TapQuestion / BatchChoiceQuestion / NumericQuestion : les trois formes
 *    de question formative — jamais bloquantes, correction toujours montrée.
 *  - BossFinal : moteur du test final évaluatif (silencieux → submit unique
 *    → correction → profil → synthèse, evidence + persistance).
 *  - PrerequisiteDiagnostic : moteur du module 0 « Mission de départ ».
 *
 * Les briques plus bas niveau restent dans components/LessonUI.jsx et les
 * manipulations spécifiques (blocs base 10, droites graduées, récipients…)
 * restent des composants de leçon — le kit orchestre, il ne remplace pas le
 * contenu pédagogique.
 */
export { default as ContentModule, useKit } from './ContentModule';
export { TapQuestion, BatchChoiceQuestion, NumericQuestion } from './questions';
export { default as BossFinal } from './BossFinal';
export { default as PrerequisiteDiagnostic } from './PrerequisiteDiagnostic';
