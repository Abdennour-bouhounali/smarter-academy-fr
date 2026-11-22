import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import Footer from '../navigation/Footer';
import BackgroundLayer from '../common/BackgroundLayer';
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

      {/* Page Content — z-10 */}
      <main
        className="sa-workspace-main relative z-10 flex-1"
        style={{ '--sa-gutter-w': `${contentGutter}px` }}
        data-workspace-prior={isPrior ? 'true' : undefined}
      >
        {/* Les pages sont des lots paresseux (App.jsx) : cette frontière
            garde la coquille — barre, navigation — à l'écran pendant
            qu'une page arrive, au lieu du repli plein écran du routeur. */}
        {/* min-h-screen : pendant l'arrivée du lot de la page, le pied de page reste
            SOUS le pli. À 60vh il se peignait à mi-écran puis était chassé par la
            page — le plus gros décalage de mise en page des pages visiteur
            (CLS 0,40 sur la fiche d'un livre, mesuré le 2026-10-17). */}
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
