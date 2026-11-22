import { useContext, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PanelStartClose, PanelStartOpen } from '../common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { adminNavSectionsFor } from '../../data/adminNavigation';
import { getDisplayName, getInitials } from '../../utils/userDisplay';
import { ADMIN_GRADIENT } from '../../pages/admin/adminUi';

/**
 * La barre latérale de l'administration.
 *
 * ELLE ÉTAIT SOMBRE, ELLE NE L'EST PLUS. La livrée `slate-900` disait
 * « autre application » : un administrateur passant de « مساحة التلميذ » à
 * « لوحة الإدارة » changeait de produit, pas de rôle. Elle reprend donc
 * exactement la barre de StudentNavbar — fond blanc, bordure `slate-200`,
 * pastille active en dégradé, bloc d'identité en pied, barre d'onglets
 * mobile — et ne garde du rôle que son ACCENT (violet → bleu, là où l'élève
 * a bleu → violet et l'enseignant sarcelle → bleu).
 *
 * Le rôle se lit donc au sur-titre (« لوحة الإدارة ») et à la couleur de
 * l'accent, pas à un thème séparé. C'est la même règle que l'espace
 * enseignant applique déjà.
 *
 * DEUX DIFFÉRENCES ASSUMÉES avec la barre élève, parce que l'arborescence
 * d'administration est plus profonde :
 *
 *   — les liens sont GROUPÉS en sections titrées (dix sections, trente
 *     destinations : une liste plate serait illisible) ;
 *   — sur mobile, un tiroir plutôt qu'une barre d'onglets basse — cinq
 *     onglets ne peuvent pas porter trente destinations.
 *
 * Tout le reste — rayons, graisses, hauteurs de clic (44 px), transitions,
 * comportement du repli — vient de la barre élève.
 */
export default function AdminSidebar({ collapsed, onToggle }) {
  const { t } = useTranslation('admin');
  const { t: tNav } = useTranslation('nav');
  const { user, logout } = useContext(AuthContext);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Un lien qui porte une query (« جديدة », « موقوفون ») n'est actif que si la
  // query correspond aussi — sinon les quatre onglets d'une section
  // s'allumeraient ensemble.
  const isActive = (link) => {
    if (link.matchQuery) return pathname === link.path.split('?')[0] && search.includes(link.matchQuery);
    if (link.end) return pathname === link.path && !search;
    return pathname.startsWith(link.path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    // Ancrée sur le bord de DÉBUT (`start-0`, `border-e`) : la droite visuelle
    // sous le RTL de la plateforme. Utilitaires logiques, donc aucune bascule
    // par direction à écrire.
    <aside
      className={`sa-workspace-sidebar hidden lg:flex lg:flex-col fixed top-0 start-0 bottom-0 z-40 bg-white border-e border-slate-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      data-sidebar-collapsed={collapsed ? 'true' : undefined}
    >
      {/* L'en-tête est une MARQUE, pas une porte — même règle que la barre
          élève : on ne quitte pas un espace de travail par son propre titre.
          « عرض الموقع » est plus bas, explicite, avec son icône de lien
          sortant. */}
      <div className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-6'}`}>
        <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-9 w-9 flex-shrink-0" />
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="font-space font-bold text-slate-900 text-sm">Smarter Academy</span>
            <span className="font-mono-jetbrains text-[10px] text-violet-600 font-semibold tracking-wider uppercase mt-0.5">
              {tNav('adminSpace')}
            </span>
          </div>
        )}
      </div>

      {/* La bascule, posée SUR le bord : c'est la frontière qu'elle déplace. */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? tNav('sidebarExpand') : tNav('sidebarCollapse')}
        aria-expanded={!collapsed}
        title={collapsed ? tNav('sidebarExpand') : tNav('sidebarCollapse')}
        className="absolute top-20 -end-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        {/* Le rail est sur le bord de DÉBUT ; ces glyphes nomment ce bord et
            se retournent donc avec la direction de la plateforme. */}
        {collapsed ? <PanelStartOpen size={13} /> : <PanelStartClose size={13} />}
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {adminNavSectionsFor(user?.role).map((section, index) => (
          <div key={section.labelKey ?? `section-${index}`} className="mb-4 last:mb-0">
            {section.labelKey && !collapsed && (
              <p className="px-3 pb-1.5 font-inter text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t(section.labelKey)}
              </p>
            )}
            <div className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link);
                const label = t(link.labelKey);

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    title={label}
                    aria-label={label}
                    aria-current={active ? 'page' : undefined}
                    // Comprimée, la pastille reste un carré de 44 px : la zone
                    // de clic ne rétrécit pas avec le libellé.
                    className={`flex items-center rounded-xl font-inter text-sm font-medium transition-all duration-150 min-h-[44px] ${
                      collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } py-2.5 ${
                      active ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    style={active ? { background: ADMIN_GRADIENT } : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Le bloc d'identité est la porte du profil — le patron exact de la
          barre élève : avatar + nom + rôle en un seul lien, la déconnexion
          en bouton séparé à côté. */}
      <div className={`py-3 border-t border-slate-100 flex flex-shrink-0 ${
        collapsed ? 'px-0 flex-col items-center gap-2' : 'px-3 items-center gap-1'
      }`}>
        <NavLink
          to="/admin/compte"
          end
          title={collapsed ? `${getDisplayName(user)} — ${tNav('adminSpace')}` : t('nav.accountProfile')}
          aria-label={t('nav.accountProfile')}
          className={({ isActive: onProfile }) =>
            `flex items-center rounded-xl transition-colors min-h-[44px] ${
              collapsed ? 'justify-center w-11' : 'flex-1 min-w-0 gap-3 px-2 py-1.5'
            } ${onProfile ? 'bg-slate-100' : 'hover:bg-slate-50'}`
          }
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-space font-bold text-xs flex-shrink-0"
            style={{ background: ADMIN_GRADIENT }}
          >
            {getInitials(user)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-start">
              <p className="font-space font-semibold text-slate-800 text-xs truncate">{getDisplayName(user)}</p>
              {/* Le courriel est une identité TECHNIQUE : LTR, toujours. */}
              <p className="font-inter text-slate-400 text-[11px] truncate" dir="ltr">{user?.email}</p>
            </div>
          )}
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          aria-label={tNav('logout')}
          title={tNav('logout')}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <LogOut size={15} />
        </button>
      </div>

      {!collapsed && (
        <NavLink
          to="/"
          className="mx-3 mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 font-inter text-xs text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          {/* Icône SÉMANTIQUE (« lien sortant »), pas directionnelle : elle ne
              se retourne pas en RTL. */}
          <ExternalLink size={14} className="shrink-0" />
          <span>{t('common.seeSite')}</span>
        </NavLink>
      )}
    </aside>
  );
}

/**
 * La navigation mobile : un tiroir, parce qu'une barre d'onglets basse (le
 * patron élève) ne peut pas porter trente destinations réparties en dix
 * sections. Même chrome que la barre haute de l'espace élève : blanc,
 * `h-14`, logo + sur-titre du rôle.
 */
export function AdminMobileBar() {
  const { t } = useTranslation('admin');
  const { t: tNav } = useTranslation('nav');
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (link) => {
    if (link.matchQuery) return pathname === link.path.split('?')[0] && search.includes(link.matchQuery);
    if (link.end) return pathname === link.path && !search;
    return pathname.startsWith(link.path);
  };

  return (
    <div className="lg:hidden">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-8 w-8 flex-shrink-0" />
          <span className="whitespace-nowrap font-mono-jetbrains text-[10px] font-semibold uppercase tracking-wider text-violet-600">
            {tNav('adminSpace')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? t('common.closeMenu') : t('common.openMenu')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
        >
          {/* Icônes SÉMANTIQUES (menu / fermer) : jamais mises en miroir. */}
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {open && (
        <nav className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-white px-4 py-4">
          {adminNavSectionsFor(user?.role).map((section, index) => (
            <div key={section.labelKey ?? `m-${index}`} className="mb-4 last:mb-0">
              {section.labelKey && (
                <p className="px-2 pb-1.5 font-inter text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t(section.labelKey)}
                </p>
              )}
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link);

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 font-inter text-sm font-medium ${
                        active ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      style={active ? { background: ADMIN_GRADIENT } : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="truncate">{t(link.labelKey)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}
