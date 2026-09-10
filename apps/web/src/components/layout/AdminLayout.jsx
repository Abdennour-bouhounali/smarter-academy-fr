import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar, { AdminMobileBar } from '../admin/AdminSidebar';

/**
 * Le cadre du panneau d'administration.
 *
 * Volontairement PAS StudentLayout : pas de halos animés (BackgroundLayer),
 * pas de barre élève. Un fond opaque et calme, parce que ce qu'on met dessus
 * est dense — des tableaux, des filtres, des graphiques — et qu'un dégradé
 * animé derrière un tableau est exactement le défaut que `.sa-surface-plain`
 * avait déjà corrigé pour le moteur d'exercices.
 *
 * La gouttière reste celle du produit (`.sa-page` : 20/40/60 px), mesurée
 * DANS le <main>, qui réserve déjà la largeur de la barre latérale.
 */
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <AdminMobileBar />

      <main
        className={`min-h-screen pt-14 transition-[padding] duration-300 lg:pt-0 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
