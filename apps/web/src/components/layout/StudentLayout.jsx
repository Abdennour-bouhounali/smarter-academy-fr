import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import StudentNavbar from '../student/StudentNavbar';
import BackgroundLayer from '../common/BackgroundLayer';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';

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
 */
export default function StudentLayout() {
  const { user } = useContext(AuthContext);

  if (user && !user.grade) {
    return <Navigate to="/espace/bienvenue" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      <BackgroundLayer />
      <StudentNavbar />
      <main className="relative z-10 lg:pl-64 pt-14 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
