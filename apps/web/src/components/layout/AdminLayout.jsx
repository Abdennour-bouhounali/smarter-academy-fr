import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar, { AdminMobileBar } from '../admin/AdminSidebar';
import ScrollToTop from '../common/ScrollToTop';

/**
 * Le cadre du panneau d'administration.
 *
 * C'EST LA COQUILLE DE L'ESPACE ÉLÈVE, au fond près. Elle en diffère sur un
 * seul point, et ce point est un choix de LISIBILITÉ, pas d'identité : pas de
 * `BackgroundLayer` (les halos animés de l'espace élève), parce que ce qu'on
 * pose dessus est dense — tableaux, filtres, graphiques — et qu'un dégradé
 * animé derrière un tableau est exactement le défaut que `.sa-surface-plain`
 * avait déjà corrigé pour le moteur d'exercices.
 *
 * Le fond reste EXACTEMENT celui du produit : `#FAFAFA`, le même que
 * StudentLayout et TeacherLayout (et que `body` dans index.css). Il était
 * `bg-slate-50` — une nuance voisine, mais une nuance AUTRE, et c'est
 * précisément ce genre d'écart qui faisait du panneau une seconde
 * application.
 *
 * `.sa-workspace-main` : la même réservation animée que la barre élève, pour
 * que la compression de la barre latérale glisse au lieu de sauter. La
 * gouttière, elle, reste celle du produit (`.sa-page` : 20/40/60 px), mesurée
 * DANS ce <main>, qui réserve déjà la largeur de la barre.
 */
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <AdminMobileBar />

      <main
        // RTL (ar-DZ, le défaut de la plateforme — src/locale.js) : la barre
        // s'ancre sur le bord de DÉBUT, et `--sa-sidebar-w` est appliqué par
        // `.sa-workspace-main` du bon côté selon la direction. Aucune bascule
        // gauche/droite à écrire ici.
        className="sa-workspace-main relative z-10 min-h-screen pt-14 lg:pt-0"
        style={{ '--sa-sidebar-w': collapsed ? '80px' : '256px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
