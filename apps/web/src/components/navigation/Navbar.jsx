import { useState, useEffect, useContext } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import GradeSwitcher from '../auth/GradeSwitcher';
import { AuthContext } from '../../context/AuthContext';
import { navLinks } from '../../data/navigation';

function AuthCluster({ compact = false, onNavigate }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors'}
        >
          <ShieldCheck size={15} />
          Espace admin
        </Link>
        <button
          onClick={handleLogout}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-medium text-slate-500 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors'}
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    );
  }

  if (user?.role === 'student') {
    return (
      <div className={compact ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-3'}>
        <Link
          to="/espace"
          onClick={onNavigate}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white'
            : 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5'}
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
        >
          <LayoutDashboard size={14} />
          Mon espace
        </Link>
        <GradeSwitcher />
        <button
          onClick={handleLogout}
          className={compact
            ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-inter text-sm font-medium text-slate-500 hover:bg-slate-50'
            : 'inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-inter text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors'}
        >
          <LogOut size={13} />
          {compact ? 'Déconnexion' : ''}
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
          : 'hidden sm:inline-flex px-3 py-1.5 rounded-lg font-inter text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors'}
      >
        Se connecter
      </Link>
      <Link
        to="/register"
        onClick={onNavigate}
        className={compact
          ? 'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white'
          : 'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5'}
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
      >
        Commencer gratuitement
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function Navbar() {
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
      <motion.nav
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
            >
              <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-10 w-auto rounded-lg object-contain" />
              <div className="hidden sm:flex flex-col">
                <span className="font-space font-bold text-slate-900 text-sm leading-none">
                  Smarter Academy
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg font-inter text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Auth cluster + Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center">
                <AuthCluster />
              </div>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Ouvrir le menu"
                aria-expanded={mobileOpen}
                id="mobile-menu-toggle"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xl lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-3 rounded-xl font-inter text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-2 pt-3 border-t border-slate-100">
                <AuthCluster compact onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
