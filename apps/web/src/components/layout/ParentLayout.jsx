import { Suspense, useContext } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, ShieldCheck, Users } from 'lucide-react';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';
import { needsName } from '../../utils/personName';
import { getDisplayName } from '../../utils/userDisplay';

const LINKS = [
  { to: '/parent', end: true, icon: Users, key: 'nav.children' },
  { to: '/parent/protection', end: false, icon: ShieldCheck, key: 'nav.guide' },
];

/**
 * La coquille de « Espace parent » (docs/architecture/PARENT_SPACE.md) : une
 * barre en haut et une colonne de lecture — un parent LIT un rapport, il n'a
 * pas d'espace de travail (pas de barre latérale, pas de cahier, pas de leçon).
 *
 * TÉLÉPHONE D'ABORD (propriétaire, 2026-10-23) : le parent arrive du courriel
 * du dimanche, souvent sur son téléphone. À 390 px la barre garde la marque,
 * les deux liens et une icône de sortie ; le nom et les libellés longs
 * n'apparaissent qu'à partir de `sm` / `md`.
 *
 * Une garde, comme l'enseignant : « prénom et nom ». L'élève lit le nom de son
 * parent dans « Les parents liés à ton compte » ; un compte sans nom passe par
 * /parent/bienvenue. Le rôle est vérifié par ProtectedRoute ; la vraie porte
 * reste le serveur (can:parent + lien actif).
 */
export default function ParentLayout() {
  const { t } = useTranslation('family');
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  if (needsName(user)) {
    return <Navigate to="/parent/bienvenue" replace state={{ from: location.pathname + location.search }} />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
          <Link to="/parent" className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="hidden font-space text-sm font-bold text-nav-accent sm:inline">{t('nav.spaceName')}</span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1" aria-label={t('nav.spaceName')}>
            {LINKS.map(({ to, end, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 font-inter text-[13px] font-medium sm:gap-2 sm:px-3 sm:text-sm ${
                    isActive ? 'bg-nav-accent text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} aria-hidden="true" />
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <span className="hidden font-inter text-sm text-slate-600 md:inline">{getDisplayName(user)}</span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
            className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center gap-2 rounded-xl px-2 font-inter text-sm text-slate-600 hover:bg-slate-100 sm:px-3"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <Suspense fallback={<div className="h-64" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
