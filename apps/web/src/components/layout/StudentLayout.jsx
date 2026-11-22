import { Suspense, useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import StudentNavbar from '../student/StudentNavbar';
import { DoorTabs, RAIL_WIDTH } from '../common/WorkspaceNav';
import { studentDoors } from '../../data/studentNavigation';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';
import { getAllGradesSummary } from '../../utils/gradeSummary';
import { needsName } from '../../utils/personName';
import PageTourProvider from '../../features/tours/PageTourProvider';

/**
 * The authenticated student area's shell — a workspace (sidebar + content),
 * not the visitor's marketing shell (MainLayout). No Footer: a visitor-site
 * affordance the workspace doesn't need since its own nav is always visible.
 *
 * Registration no longer collects a grade, so any student can reach this
 * shell with `user.grade === null` — not just right after signing up (e.g.
 * they closed the tab mid-onboarding). Every route nested under here
 * requires a grade to make sense, so this is the one place that guard lives
 * rather than repeating it per page — except while no grade exists
 * at all (see the getAllGrades() check below), since gating on a choice
 * nobody can make would trap every student in a redirect loop.
 *
 * COLUMN MODE (« prior ») — the shell RESERVES the place of « Ma carte » instead of letting it float over the lesson: the
 * rail keeps its 80 px (`RAIL_WIDTH`, it does not fold) and <main> gains a gutter on the end side. The content really
 * shrinks, and `useLessonViewport`, which reads the padding box of this <main>, places the map exactly in that gutter
 * (see WorkspaceLayoutContext).
 */
export default function StudentLayout() {
  const { user } = useContext(AuthContext);
  const { isPrior, contentGutter } = useWorkspaceLayout();
  const location = useLocation();

  // « prénom et nom » AVANT la classe scolaire : un compte sans nom (créé
  // avant leur collecte) passe d'abord par l'étape qui les demande, puis
  // revient ici — `from` le ramène à la page qu'il visait.
  if (needsName(user)) {
    return <Navigate to="/espace/bienvenue/nom" replace state={{ from: location.pathname + location.search }} />;
  }

  // While no grade is active (packages/core/curriculum/activeGrades.js —
  // ACTIVE_GRADE_IDS empty), ChooseGrade.jsx has nothing to offer any
  // student. Gating on a
  // grade that cannot possibly be chosen would trap every student in a
  // redirect loop — so the gate only applies once there is at least one
  // grade to actually choose.
  if (user && !user.grade && getAllGradesSummary().length > 0) {
    return <Navigate to="/espace/bienvenue" replace />;
  }

  // « Visite guidée » : la visite guidée de la première visite de chaque page
  // (features/tours, docs/architecture/PAGE_TOURS.md).
  return (
    <PageTourProvider>
    <div className="relative min-h-screen bg-nav-page">
      <ScrollToTop />
      {/* No coloured halo behind the workspace (NAVIGATION_REBUILD_PLAN.md §6bis): one plain page colour. */}
      <StudentNavbar />
      <main
        // `lg:pl-64` devient une valeur calculée : c'est la MÊME réservation,
        // rendue variable pour que la compression de la barre s'anime au lieu
        // de sauter. En dessous de `lg`, la barre latérale n'existe pas et le
        // mode colonne est désactivé : les deux décalages valent alors 0.
        className="sa-workspace-main relative z-10 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen"
        style={{
          '--sa-sidebar-w': `${RAIL_WIDTH}px`,
          '--sa-gutter-w': `${contentGutter}px`,
        }}
        data-workspace-prior={isPrior ? 'true' : undefined}
        data-rail
      >
        {/* Les pages sont des lots paresseux (App.jsx) : cette frontière
            garde la coquille — barre, navigation — à l'écran pendant
            qu'une page arrive, au lieu du repli plein écran du routeur. */}
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <DoorTabs account="student" doors={studentDoors} />
          <Outlet />
        </Suspense>
      </main>
    </div>
    </PageTourProvider>
  );
}
