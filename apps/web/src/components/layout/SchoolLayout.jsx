import { Suspense, useContext } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, FileText, GraduationCap, LayoutDashboard, LogOut, School, Settings, Users } from 'lucide-react';
import ScrollToTop from '../common/ScrollToTop';
import { AuthContext } from '../../context/AuthContext';
import { getDisplayName } from '../../utils/userDisplay';

const LINKS = [
  { to: '/idara', end: true, icon: LayoutDashboard, key: 'nav.home' },
  { to: '/idara/aqsam', end: false, icon: School, key: 'nav.classes' },
  { to: '/idara/asatidha', end: false, icon: GraduationCap, key: 'nav.teachers' },
  { to: '/idara/talamidh', end: false, icon: Users, key: 'nav.students' },
  { to: '/idara/kafaat', end: false, icon: BarChart3, key: 'nav.learning' },
  { to: '/idara/taqarir', end: false, icon: FileText, key: 'nav.reports' },
  { to: '/idara/iidadat', end: false, icon: Settings, key: 'nav.settings' },
];

/**
 * La coquille de « فضاء الإدارة » (docs/architecture/SCHOOL_ADMIN_SPACE.md §6) :
 * une barre en haut et une colonne large — le directeur lit des tableaux et
 * des rapports, sur tablette et ordinateur (pas de téléphone, CLAUDE.md).
 *
 * Pas de garde « الاسم و اللقب » : le nom du directeur est saisi par
 * l'administration à sa nomination. Le rôle est vérifié par ProtectedRoute ;
 * la vraie porte reste le serveur (can:school + nomination active).
 */
export default function SchoolLayout() {
  const { t } = useTranslation('idara');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        {/* Huit entrées : libellés à partir de xl (1280 px), icônes seules en
            dessous (tablette 1024 px) avec le libellé en infobulle et en nom
            accessible ; le nom du directeur et « تسجيل الخروج » écrits à partir de 2xl. */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-6">
          <Link to="/idara" className="flex flex-shrink-0 items-center gap-3">
            <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-9 w-9" />
            <span className="font-space text-sm font-bold text-nav-accent">{t('nav.spaceName')}</span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1" aria-label={t('nav.spaceName')}>
            {LINKS.map(({ to, end, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={t(key)}
                aria-label={t(key)}
                className={({ isActive }) =>
                  `flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 font-inter text-sm font-medium ${
                    isActive ? 'bg-nav-accent text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span className="hidden xl:inline">{t(key)}</span>
              </NavLink>
            ))}
          </nav>
          <span className="hidden font-inter text-sm text-slate-600 2xl:inline">{getDisplayName(user)}</span>
          <button
            type="button"
            onClick={handleLogout}
            title={t('nav.logout')}
            aria-label={t('nav.logout')}
            className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center gap-2 rounded-xl px-3 font-inter text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden 2xl:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 print:max-w-none print:p-0">
        <Suspense fallback={<div className="h-64" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
