import React from 'react';
import { LessonKnowledgeProvider as SharedProvider } from '../../../../../common/knowledge';
import { LESSON_CONFIG } from '../lesson.config';
import { LESSON_KNOWLEDGE } from '../knowledge';

/**
 * LessonKnowledgeProvider — la carte des connaissances de cette leçon.
 *
 * L'implémentation est PARTAGÉE (common/knowledge/KnowledgeProvider.jsx) :
 * état cumulatif des modules validés, déblocage « live » de fin de module
 * (`unlockModule`) ET déblocage par item au moment où un <KnowledgeBrick>
 * pose la connaissance (`unlockItem` / `getItem`, contrat
 * docs/architecture/KNOWLEDGE_DEPENDENCY.md). Ce fichier ne fait que
 * l'alimenter avec l'id et les connaissances de la leçon, et lui donner son
 * en-tête d'impression.
 *
 * Il n'y a donc plus qu'UNE logique de carte dans le dépôt : la copie locale
 * qui vivait ici ignorait `unlockItem` (les briques y étaient muettes) et,
 * depuis le mode colonne, ne publiait pas non plus l'ouverture de la carte à
 * la coquille — « Ma carte » n'y aurait jamais obtenu sa colonne.
 */
export function LessonKnowledgeProvider({ children }) {
  return (
    <SharedProvider
      lessonId={LESSON_CONFIG.id}
      knowledge={LESSON_KNOWLEDGE}
      printTitle="ARITHMÉTIQUE"
      printSubject="Mathématiques · 2nde"
    >
      {children}
    </SharedProvider>
  );
}

export { useLessonKnowledge } from '../../../../../common/knowledge';
