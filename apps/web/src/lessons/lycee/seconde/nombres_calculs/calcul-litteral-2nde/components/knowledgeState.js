/**
 * État cumulatif de la carte des connaissances — réducteur PUR, PARTAGÉ.
 *
 * L'implémentation vit dans common/knowledge/knowledgeState.js : une seule
 * copie pour tout le dépôt, y compris `findKnowledgeItem` et le déblocage par
 * item dont se sert <KnowledgeBrick>. Ce fichier n'est qu'un point d'entrée
 * local, conservé pour les imports existants de la leçon.
 */
export * from '../../../../../common/knowledge/knowledgeState';
