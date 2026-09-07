import { createContext, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { getLessonChromeLayout } from '../utils/lessonChrome';

/**
 * Source unique de vérité du bandeau de leçon, côté React.
 *
 * `useLessonChromeLayout()` lit l'état d'authentification — le même que celui
 * dont CourseLayout se sert pour choisir la coquille — et en dérive les
 * décalages. `LessonChromeContext` permet ensuite à ModuleLayout de diffuser
 * CE calcul à ses enfants (StepProgressBar) : un enfant ne devine jamais tout
 * seul si un en-tête existe, il reçoit le contexte de son parent.
 */
export const LessonChromeContext = createContext(null);

export function useLessonChromeLayout() {
  const auth = useContext(AuthContext);
  const authenticated = Boolean(auth?.user);
  return useMemo(() => getLessonChromeLayout({ authenticated }), [authenticated]);
}

/**
 * Le contrat diffusé par ModuleLayout. Retombe sur le calcul direct quand le
 * composant est rendu hors d'un ModuleLayout (tests unitaires, Storybook),
 * pour qu'un bandeau ne se retrouve jamais sans décalage du tout.
 */
export function useLessonChrome() {
  const fromParent = useContext(LessonChromeContext);
  const fallback = useLessonChromeLayout();
  return fromParent ?? fallback;
}
