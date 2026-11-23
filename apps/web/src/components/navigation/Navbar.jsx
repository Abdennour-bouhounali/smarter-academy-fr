import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, ShieldCheck, LayoutDashboard, MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../common/DirectionalIcons';
import { AuthContext } from '../../context/AuthContext';
import { navLinks } from '../../data/navigation';
import { needsEmailVerification } from '../../utils/emailVerification';

function AuthCluster({ compact = false, onNavigate }) {
  const { t } = useTranslation('nav');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const unverified = needsEmailVerification(user);

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate('/');
  };

  if (user?.role === 'admin') {
    return (
      <div className={compact ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-3'}>
        <Link
          to="/admin"
          onClick={onNavigate}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap transition-colors'}
        >
          <ShieldCheck size={15} />
          {t('adminSpace')}
        </Link>
        <button
          onClick={handleLogout}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-medium text-slate-500 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-medium text-slate-400 hover:text-slate-700 whitespace-nowrap transition-colors'}
        >
          <LogOut size={13} />
          {t('logout')}
        </button>
      </div>
    );
  }

  if (user?.role === 'teacher') {
    return (
      <div className={compact ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-3'}>
        <Link
          to={unverified ? '/verification-email' : '/enseignant'}
          onClick={onNavigate}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white'
            : 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5'}
          style={{ background: 'linear-gradient(135deg, #0F766E, #3B82F6)', boxShadow: '0 4px 14px rgba(15,118,110,0.3)' }}
        >
          {unverified ? <MailCheck size={14} /> : <LayoutDashboard size={14} />}
          {unverified ? t('verifyEmail') : t('teacherSpace')}
        </Link>
        <button
          onClick={handleLogout}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-medium text-slate-500 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-inter text-xs font-medium text-slate-400 hover:text-slate-700 whitespace-nowrap transition-colors'}
        >
          <LogOut size={13} />
          {compact ? t('logout') : ''}
        </button>
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className={compact ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-3'}>
        <Link
          to={unverified ? '/verification-email' : '/espace'}
          onClick={onNavigate}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white'
            : 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5'}
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
        >
          {unverified ? <MailCheck size={14} /> : <LayoutDashboard size={14} />}
          {unverified ? t('verifyEmail') : t('mySpace')}
        </Link>
        <button
          onClick={handleLogout}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-medium text-slate-500 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-inter text-xs font-medium text-slate-400 hover:text-slate-700 whitespace-nowrap transition-colors'}
        >
          <LogOut size={13} />
          {compact ? t('logout') : ''}
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-2 sm:gap-3'}>
      <Link
        to="/login"
        onClick={onNavigate}
        className={compact
          ? 'flex items-center justify-center px-4 py-3 rounded-xl font-inter text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50'
          : 'hidden sm:inline-flex px-3 py-1.5 rounded-lg font-inter text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 whitespace-nowrap transition-colors'}
      >
        {t('login')}
      </Link>
      <Link
        to="/register"
        onClick={onNavigate}
        className={compact
          ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white'
          : 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5'}
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
      >
        {t('startFree')}
        <ArrowForward size={14} />
      </Link>
    </div>
  );
}

export default function Navbar() {
  const { t } = useTranslation('nav');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <m.nav
        // `app-header` est l'ANCRE du viewport de leçon : useLessonViewport le
        // mesure pour poser le haut du tiroir « Ma carte », et un
        // ResizeObserver le suit (la barre change de hauteur au défilement).
        // Sans cet id, la mesure vaut 0 et le tiroir s'ouvre SOUS cette barre
        // fixe z-50 — son bouton « Fermer » devient inatteignable.
        // Contrat : docs/architecture/KNOWLEDGE_MAP.md § Header Integration.
        id="app-header"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        {/* `xl:max-w-none`: at 1366 px (the product's one screen size) the French labels need the whole width — the logo,
            five links and « Commencer gratuitement » overflowed the 1 280 px column by 117 px (2026-11-23). */}
        <div className="max-w-7xl xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8">
          {/* `h-16` FIXE, `flex-nowrap` : la hauteur de cette barre est mesurée
              par useLessonViewport pour poser le tiroir « Ma carte ». Un
              retour à la ligne d'un lien la ferait grandir, et le tiroir
              s'ouvrirait au mauvais endroit. Les trois grappes se partagent
              donc la largeur en se comprimant, jamais en se repliant. */}
          <div className="flex flex-nowrap items-center justify-between h-16 gap-3">
            {/* Logo — `min-w-0` + `shrink` : c'est LUI qui cède la place en
                premier quand la largeur manque (le nom disparaît déjà sous
                `sm`), pas la navigation. */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group flex-shrink-0 min-w-0"
            >
              <img src="/brand/mark-color.svg" width="200" height="200" decoding="async" alt="Smarter Academy" className="h-10 w-10 flex-shrink-0" />
              <div className="hidden sm:flex flex-col min-w-0">
                <span className="font-space font-bold text-slate-900 text-sm leading-none whitespace-nowrap">
                  Smarter Academy
                </span>
              </div>
            </Link>

            {/* Desktop Links — `flex-nowrap` sur la rangée ET `whitespace-nowrap`
                sur chaque libellé : le premier empêche les liens de passer à la
                ligne les uns sous les autres, le second empêche « Notre méthode »
                de se casser en deux à l'intérieur de sa propre pastille. Sous
                `lg`, cette rangée n'existe pas — c'est le tiroir mobile qui
                prend le relais, et lui a la place de s'empiler. */}
            <div className="hidden lg:flex flex-nowrap items-center gap-1 flex-shrink">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-2 2xl:px-3 py-1.5 rounded-lg font-inter text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              ))}
            </div>

            {/* Auth cluster + Mobile Toggle */}
            <div className="flex flex-nowrap items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center">
                <AuthCluster />
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={mobileOpen}
                id="mobile-menu-toggle"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </m.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xl lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <m.div
                  key={link.path}
                  // Enters from the reading-start side: the left, the page reads left to right.
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `block w-full text-start px-4 py-3 rounded-xl font-inter text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {t(link.labelKey)}
                  </NavLink>
                </m.div>
              ))}
              <div className="mt-2 pt-3 border-t border-slate-100">
                <AuthCluster compact onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
