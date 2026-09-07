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
 * qui vivait ici ignorait `unlockItem`, et les briques y étaient muettes.
 */
export function LessonKnowledgeProvider({ children }) {
  return (
    <SharedProvider
      lessonId={LESSON_CONFIG.id}
      knowledge={LESSON_KNOWLEDGE}
      printTitle="CALCUL LITTÉRAL"
      printSubject="Mathématiques · 2nde"
    >
      {children}
    </SharedProvider>
  );
}

export { useLessonKnowledge } from '../../../../../common/knowledge';
