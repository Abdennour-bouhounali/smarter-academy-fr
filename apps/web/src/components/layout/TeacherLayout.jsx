import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import TeacherNavbar from '../teacher/TeacherNavbar';
import { DoorTabs, RAIL_WIDTH } from '../common/WorkspaceNav';
import { teacherDoors } from '../../data/teacherNavigation';
import { useReviewCount } from '../../features/teacher/reviews/useReviewCount';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';
import { needsName } from '../../utils/personName';
import PageTourProvider from '../../features/tours/PageTourProvider';

/**
 * La coquille de l'espace ENSEIGNANT (« Espace professeur ») — le même espace de
 * travail que StudentLayout (barre latérale + contenu, pas de pied de page
 * visiteur), avec sa propre navigation.
 *
 * Pas de garde de classe scolaire : un enseignant n'a pas de `grade`, il
 * possède des classes qui ont chacune la leur. Le rôle est vérifié par
 * ProtectedRoute en amont ; la vraie porte reste le serveur (can:teacher).
 *
 * UNE garde, en revanche : « prénom et nom ». Les élèves d'un enseignant le
 * lisent sous ce nom ; un compte qui n'en a pas encore passe par l'étape
 * /enseignant/bienvenue, puis revient à la page qu'il visait.
 *
 * SAME WORKSPACE as the student's: <main> carries `.sa-workspace-main`, `data-rail` and the variables
 * `--sa-sidebar-w` (the fixed 80 px rail) / `--sa-gutter-w`, so a teacher reading a lesson gets the same « Ma carte »
 * column — the lesson makes room instead of being covered.
 */
export default function TeacherLayout() {
  const { user } = useContext(AuthContext);
  const { isPrior, contentGutter } = useWorkspaceLayout();
  // ONE count for the menu and for the line of pages: the answers waiting for his correction.
  const reviews = useReviewCount();
  const location = useLocation();

  if (needsName(user)) {
    return <Navigate to="/enseignant/bienvenue" replace state={{ from: location.pathname + location.search }} />;
  }

  // « Visite guidée » : la visite guidée de la première visite de chaque page
  // (features/tours, docs/architecture/PAGE_TOURS.md).
  return (
    <PageTourProvider>
    <div className="relative min-h-screen bg-nav-page">
      <ScrollToTop />
      {/* Pas de halos colorés dans l'espace ENSEIGNANT (propriétaire, 2026-11-18 : « not professional ») : un fond uni. */}
      <TeacherNavbar reviews={reviews} />
      <main
        className="sa-workspace-main relative z-10 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen"
        style={{
          '--sa-sidebar-w': `${RAIL_WIDTH}px`,
          '--sa-gutter-w': `${contentGutter}px`,
        }}
        data-workspace-prior={isPrior ? 'true' : undefined}
        data-rail
      >
        <DoorTabs account="teacher" doors={teacherDoors} counts={{ reviews }} />
        <Outlet />
      </main>
    </div>
    </PageTourProvider>
  );
}
