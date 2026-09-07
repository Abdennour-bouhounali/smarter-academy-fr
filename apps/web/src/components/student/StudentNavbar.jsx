import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Crown } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { studentNavLinks } from '../../data/studentNavigation';
import { getAllGrades } from '@smarter-academy/core';
import { getDisplayName, getInitials } from '../../utils/userDisplay';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';

/**
 * The student workspace's own navigation shell — a left sidebar on desktop,
 * a bottom tab bar on mobile. Deliberately NOT the visitor's top nav +
 * hamburger-drawer pattern: this is a workspace to live in, not a page to
 * scroll through. No subscription system exists yet, so the "Premium" tag
 * here is a static upsell link to /tarifs, not an entitlement check.
 *
 * MODE COLONNE — quand « Ma carte » réclame sa colonne, la barre se comprime
 * (w-64 → w-20) au lieu de disparaître : l'élève doit continuer à voir OÙ est
 * la navigation. Les icônes restent, à leur taille et avec leur zone de clic ;
 * seuls les libellés et l'encart Premium s'effacent. Le nom de chaque
 * destination reste porté par `title` + `aria-label` sur le lien, donc lisible
 * au survol, au clavier et par un lecteur d'écran.
 */
export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isPrior } = useWorkspaceLayout();

  const grade = user?.grade ? getAllGrades().find((g) => g.id === user.grade) : null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = getInitials(user);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`sa-workspace-sidebar hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 z-40 ${isPrior ? 'w-20' : 'w-64'}`}
        data-sidebar-collapsed={isPrior ? 'true' : undefined}
      >
        <Link
          to="/"
          className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 ${isPrior ? 'justify-center px-0' : 'gap-2.5 px-6'}`}
          title="Smarter Academy — accueil"
        >
          <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-9 w-auto rounded-lg object-contain flex-shrink-0" />
          {!isPrior && (
            <div className="flex flex-col leading-none">
              <span className="font-space font-bold text-slate-900 text-sm">Smarter Academy</span>
              <span className="font-mono-jetbrains text-[10px] text-blue-500 font-semibold tracking-wider uppercase mt-0.5">Espace élève</span>
            </div>
          )}
        </Link>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {studentNavLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              title={link.label}
              aria-label={link.label}
              className={({ isActive }) =>
                // Comprimée, la pastille reste un carré de 44px : la zone de
                // clic ne rétrécit pas avec le libellé (min-h-[44px] + w-full).
                `flex items-center rounded-xl font-inter text-sm font-medium transition-all duration-150 min-h-[44px] ${
                  isPrior ? 'justify-center px-0' : 'gap-3 px-3.5'
                } py-2.5 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
              style={({ isActive }) => (isActive ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {})}
            >
              <link.icon size={18} className="flex-shrink-0" />
              {!isPrior && link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <Link
            to="/tarifs"
            title="Passer Premium — débloque tout le programme"
            aria-label="Passer Premium"
            className={`flex items-center rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 mb-3 hover:border-amber-300 transition-colors min-h-[44px] ${
              isPrior ? 'justify-center px-0 py-3' : 'gap-2.5 px-3.5 py-3'
            }`}
          >
            <Crown size={16} className="text-amber-500 flex-shrink-0" />
            {!isPrior && (
              <div className="min-w-0">
                <p className="font-space font-bold text-slate-800 text-xs">Passer Premium</p>
                <p className="font-inter text-slate-500 text-[11px] leading-tight">Débloque tout le programme</p>
              </div>
            )}
          </Link>
        </div>

        <div className={`py-4 border-t border-slate-100 flex flex-shrink-0 ${
          isPrior ? 'px-0 flex-col items-center gap-2' : 'px-4 items-center gap-3'
        }`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-space font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            title={isPrior ? `${getDisplayName(user)} — ${grade ? grade.name : 'Classe non définie'}` : undefined}
          >
            {initials}
          </div>
          {!isPrior && (
            <div className="min-w-0 flex-1">
              <p className="font-space font-semibold text-slate-800 text-xs truncate">{getDisplayName(user)}</p>
              <p className="font-inter text-slate-400 text-[11px]">{grade ? grade.name : 'Classe non définie'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            title="Déconnexion"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-8 w-auto rounded-md object-contain" />
          <span className="font-mono-jetbrains text-[10px] text-blue-500 font-semibold tracking-wider uppercase">Espace élève</span>
        </Link>
        <div className="flex items-center gap-2">
          {grade && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-space font-bold text-[11px]">{grade.name}</span>
          )}
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {studentNavLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 font-inter text-[10px] font-semibold transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`
            }
          >
            <link.icon size={19} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
