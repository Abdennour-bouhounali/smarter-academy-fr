import { createContext, useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { usesWorkspaceShell } from '../../../components/layout/CourseLayout';
import { getLessonChromeLayout } from '../utils/lessonChrome';

/**
 * Source unique de vérité du bandeau de leçon, côté React.
 *
 * `useLessonChromeLayout()` lit le compte connecté et applique la règle de
 * CourseLayout (`usesStudentShell`) — la même décision qui choisit la
 * coquille — pour en dériver les décalages. `LessonChromeContext` permet ensuite à ModuleLayout de diffuser
 * CE calcul à ses enfants (StepProgressBar) : un enfant ne devine jamais tout
 * seul si un en-tête existe, il reçoit le contexte de son parent.
 */
export const LessonChromeContext = createContext(null);

export function useLessonChromeLayout() {
  const auth = useContext(AuthContext);
  // « authenticated » au sens du bandeau = « rendu dans un espace de travail »
  // (StudentLayout ou TeacherLayout, même en-tête mobile, même barre) : la
  // même décision que CourseLayout, prise au même endroit. Un administrateur
  // connecté lit la leçon sous la Navbar visiteur, et le module réserve donc
  // sa hauteur comme pour un visiteur.
  const authenticated = usesWorkspaceShell(auth?.user);
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
