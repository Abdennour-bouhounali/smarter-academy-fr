import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import StudentNavbar from '../student/StudentNavbar';
import BackgroundLayer from '../common/BackgroundLayer';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';

/**
 * The authenticated student area's shell — a workspace (sidebar + content),
 * not the visitor's marketing shell (MainLayout). No Footer, no
 * CommandPalette: those are visitor-site affordances the workspace doesn't
 * need since its own nav is always visible.
 *
 * Registration no longer collects a grade, so any student can reach this
 * shell with `user.grade === null` — not just right after signing up (e.g.
 * they closed the tab mid-onboarding). Every route nested under here
 * requires a grade to make sense, so this is the one place that guard lives
 * rather than repeating it per page.
 *
 * MODE COLONNE (« prior ») — la coquille RÉSERVE la place de la carte au lieu
 * de la laisser flotter par-dessus la leçon : la barre latérale se comprime
 * (w-64 → w-20, géré dans StudentNavbar) et le <main> gagne une gouttière à
 * droite. Le contenu rétrécit donc pour de bon, et `useLessonViewport`, qui lit
 * la boîte de padding de ce <main>, place la carte exactement dans la
 * gouttière ainsi ouverte (cf. WorkspaceLayoutContext).
 */
export default function StudentLayout() {
  const { user } = useContext(AuthContext);
  const { isPrior, contentGutter, sidebarWidth } = useWorkspaceLayout();

  if (user && !user.grade) {
    return <Navigate to="/espace/bienvenue" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      <BackgroundLayer />
      <StudentNavbar />
      <main
        // `lg:pl-64` devient une valeur calculée : c'est la MÊME réservation,
        // rendue variable pour que la compression de la barre s'anime au lieu
        // de sauter. En dessous de `lg`, la barre latérale n'existe pas et le
        // mode colonne est désactivé : les deux décalages valent alors 0.
        className="sa-workspace-main relative z-10 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen"
        style={{
          '--sa-sidebar-w': `${sidebarWidth}px`,
          '--sa-gutter-w': `${contentGutter}px`,
        }}
        data-workspace-prior={isPrior ? 'true' : undefined}
      >
        <Outlet />
      </main>
    </div>
  );
}
