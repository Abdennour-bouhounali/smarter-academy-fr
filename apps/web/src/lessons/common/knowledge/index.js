/**
 * Carte des connaissances — implémentation partagée (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * `KnowledgeMap.jsx`, `knowledgeState.js`, `knowledgeState.test.js` et
 * `KnowledgeSnapshot.jsx` sont les fichiers génériques des dix leçons de 2nde
 * (byte-identiques dans chacune) ; ils sont remontés ici, inchangés hormis les
 * chemins d'import, pour que les leçons construites à partir du 2026-09-06
 * (positions relatives, fonctions…) les IMPORTENT au lieu de les recopier.
 * `KnowledgeProvider.jsx` est la version paramétrée du provider (lessonId,
 * knowledge, titre d'impression). Les dix leçons antérieures gardent leurs
 * copies : elles ne sont pas touchées.
 */
export { default as KnowledgeMap, KnowledgeMapTrigger, CompleteView, CATEGORIES, CAT_THEME } from './KnowledgeMap';
export { LessonKnowledgeProvider, useLessonKnowledge } from './KnowledgeProvider';
export { default as KnowledgeSnapshot } from './KnowledgeSnapshot';
export * from './knowledgeState';
export * from './knowledgeVisuals';
