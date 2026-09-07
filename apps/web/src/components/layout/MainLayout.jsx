import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Footer from '../navigation/Footer';
import BackgroundLayer from '../common/BackgroundLayer';
import CommandPalette from '../common/CommandPalette';
import ScrollToTop from '../common/ScrollToTop';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';

export default function MainLayout() {
  // La coquille visiteur n'a pas de barre latérale, mais elle rend AUSSI les
  // leçons (CourseLayout choisit MainLayout quand personne n'est connecté) :
  // le mode colonne doit donc y réserver la même gouttière. Seule la moitié
  // « barre latérale » du contrat ne s'applique pas ici — `--sa-sidebar-w`
  // reste absente, la règle CSS retombe alors sur 0px.
  const { isPrior, contentGutter } = useWorkspaceLayout();

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      <ScrollToTop />

      {/* Fixed background layer — z-0 */}
      <BackgroundLayer />

      {/* Fixed Top Navigation — z-50 */}
      <Navbar />

      {/* Floating Command Palette — z-50 */}
      <CommandPalette />

      {/* Page Content — z-10 */}
      <main
        className="sa-workspace-main relative z-10 flex-1"
        style={{ '--sa-gutter-w': `${contentGutter}px` }}
        data-workspace-prior={isPrior ? 'true' : undefined}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
