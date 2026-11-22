import { useContext, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { usesWorkspaceShell } from '../../../components/layout/CourseLayout';
import { getLessonChromeLayout } from '../utils/lessonChrome';

/**
 * Source unique de vérité du bandeau de leçon, côté React : `useLessonChromeLayout()` lit le compte connecté et
 * applique la règle de CourseLayout — la même décision qui choisit la coquille — pour en dériver les décalages.
 */
export function useLessonChromeLayout() {
  const auth = useContext(AuthContext);
  // « authenticated » au sens du bandeau = « rendu dans un espace de travail »
  // (StudentLayout ou TeacherLayout, même en-tête mobile, même barre) : la
  // même décision que CourseLayout, prise au même endroit. Un administrateur
  // connecté lit la leçon sous la Navbar visiteur, et réserve donc sa hauteur
  // comme pour un visiteur.
  const authenticated = usesWorkspaceShell(auth?.user);
  return useMemo(() => getLessonChromeLayout({ authenticated }), [authenticated]);
}
