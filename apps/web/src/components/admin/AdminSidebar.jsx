import React, { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, PanelLeftClose, PanelLeftOpen, ExternalLink } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { adminNavSections } from '../../data/adminNavigation';

/**
 * La barre latérale de l'administration.
 *
 * Bâtie sur le même patron que StudentNavbar — liens issus d'un fichier de
 * DONNÉES (data/adminNavigation.js), pastille active, repli — mais dans une
 * livrée sombre. C'est délibéré : on doit voir d'un coup d'œil qu'on est dans
 * l'outil d'administration et non dans l'espace élève, sans pour autant
 * quitter la typographie et les rayons du produit.
 */
export default function AdminSidebar({ collapsed, onToggle }) {
  const { user, logout } = useContext(AuthContext);
  const { pathname, search } = useLocation();

  // Un lien qui porte une query (« Nouveaux », « Suspendus ») n'est actif que
  // si la query correspond aussi — sinon les quatre onglets d'une section
  // s'allumeraient ensemble.
  const isActive = (link) => {
    if (link.matchQuery) return pathname === link.path.split('?')[0] && search.includes(link.matchQuery);
    if (link.end) return pathname === link.path && !search;
    return pathname.startsWith(link.path);
  };

  return (
    <aside
      className={`hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 z-40 bg-slate-900 text-slate-300 transition-[width] duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-4">
        <ShieldCheck size={22} className="shrink-0 text-blue-400" />
        {!collapsed && (
          <span className="font-space text-sm font-bold tracking-wide text-white">
            Smarter <span className="text-blue-400">Admin</span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        className="absolute top-20 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:text-white"
      >
        {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNavSections.map((section, index) => (
          <div key={section.label ?? `section-${index}`} className="mb-4">
            {section.label && !collapsed && (
              <p className="px-3 pb-1.5 font-inter text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link);

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    title={collapsed ? link.label : undefined}
                    className={`flex min-h-[38px] items-center gap-2.5 rounded-lg px-3 font-inter text-xs transition-colors ${
                      active
                        ? 'bg-blue-600 font-semibold text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="truncate">{link.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        {!collapsed && (
          <p className="truncate px-2 pb-2 font-inter text-xs text-slate-400" title={user?.email}>
            {user?.email}
          </p>
        )}
        <NavLink
          to="/"
          className="mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 font-inter text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          title="Voir le site"
        >
          <ExternalLink size={15} className="shrink-0" />
          {!collapsed && <span>Voir le site</span>}
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-inter text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-300"
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

/** Barre mobile : la même navigation, dépliable, parce que la latérale est masquée sous lg. */
export function AdminMobileBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="lg:hidden">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-slate-900 px-4 text-white">
        <span className="flex items-center gap-2 font-space text-sm font-bold">
          <ShieldCheck size={18} className="text-blue-400" /> Smarter Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="rounded-lg border border-slate-700 px-3 py-1 font-inter text-xs"
        >
          {open ? 'Fermer' : 'Menu'}
        </button>
      </header>

      {open && (
        <nav className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-slate-900 px-4 py-4">
          {adminNavSections.map((section, index) => (
            <div key={section.label ?? `m-${index}`} className="mb-3">
              {section.label && (
                <p className="pb-1 font-inter text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section.label}
                </p>
              )}
              {section.links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 font-inter text-sm ${
                    pathname === link.path ? 'bg-blue-600 text-white' : 'text-slate-300'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
