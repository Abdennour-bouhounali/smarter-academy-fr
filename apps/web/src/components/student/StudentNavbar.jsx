import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Crown } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { studentNavLinks } from '../../data/studentNavigation';
import { getAllGrades } from '@smarter-academy/core';
import { getDisplayName, getInitials } from '../../utils/userDisplay';

/**
 * The student workspace's own navigation shell — a left sidebar on desktop,
 * a bottom tab bar on mobile. Deliberately NOT the visitor's top nav +
 * hamburger-drawer pattern: this is a workspace to live in, not a page to
 * scroll through. No subscription system exists yet, so the "Premium" tag
 * here is a static upsell link to /tarifs, not an entitlement check.
 */
export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const grade = user?.grade ? getAllGrades().find((g) => g.id === user.grade) : null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = getInitials(user);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40">
        <Link to="/" className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-100 flex-shrink-0">
          <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-9 w-auto rounded-lg object-contain" />
          <div className="flex flex-col leading-none">
            <span className="font-space font-bold text-slate-900 text-sm">Smarter Academy</span>
            <span className="font-mono-jetbrains text-[10px] text-blue-500 font-semibold tracking-wider uppercase mt-0.5">Espace élève</span>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {studentNavLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-inter text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
              style={({ isActive }) => (isActive ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {})}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <Link
            to="/tarifs"
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 mb-3 hover:border-amber-300 transition-colors"
          >
            <Crown size={16} className="text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-space font-bold text-slate-800 text-xs">Passer Premium</p>
              <p className="font-inter text-slate-500 text-[11px] leading-tight">Débloque tout le programme</p>
            </div>
          </Link>
        </div>

        <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-space font-bold text-xs flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-space font-semibold text-slate-800 text-xs truncate">{getDisplayName(user)}</p>
            <p className="font-inter text-slate-400 text-[11px]">{grade ? grade.name : 'Classe non définie'}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Déconnexion"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
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
