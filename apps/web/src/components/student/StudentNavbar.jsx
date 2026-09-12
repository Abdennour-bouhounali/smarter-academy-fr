import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Crown, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { studentNavLinks } from '../../data/studentNavigation';
import { getAllGrades } from '@smarter-academy/core';
import { getDisplayName, getInitials } from '../../utils/userDisplay';
import { useWorkspaceLayout } from '../../context/WorkspaceLayoutContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';

/**
 * The student workspace's own navigation shell — a left sidebar on desktop,
 * a bottom tab bar on mobile. Deliberately NOT the visitor's top nav +
 * hamburger-drawer pattern: this is a workspace to live in, not a page to
 * scroll through.
 *
 * L'ENCART DU BAS suit le DROIT D'ACCÈS, il ne le suppose plus. Il fut un
 * temps un lien d'achat inconditionnel vers /tarifs — un abonné se voyait donc
 * proposer, à chaque page de son espace, d'acheter ce qu'il venait de payer.
 * Il a maintenant deux formes, choisies par `usePremiumStatus` (donc par le
 * serveur) : un ÉTAT pour qui a déjà accès, une INVITATION pour qui ne l'a
 * pas. Et rien du tout tant que la réponse n'est pas arrivée.
 *
 * BARRE COMPRIMÉE (w-64 → w-20) — l'élève doit continuer à voir OÙ est la
 * navigation : les icônes restent, à leur taille et avec leur zone de clic ;
 * seuls les libellés et l'encart Premium s'effacent. Le nom de chaque
 * destination reste porté par `title` + `aria-label` sur le lien, donc lisible
 * au survol, au clavier et par un lecteur d'écran.
 *
 * DEUX RAISONS de se comprimer, UN seul état (`sidebarCollapsed`, dérivé dans
 * WorkspaceLayoutContext) :
 *
 *   le repli MANUEL   — l'élève veut plus de place, carte ou pas
 *   le mode COLONNE   — « Ma carte » a besoin de la place, et l'emporte
 *
 * D'où un bouton désactivé pendant le mode colonne : rouvrir la barre y
 * casserait la mise en page à trois colonnes. Il le DIT (libellé explicatif)
 * au lieu de proposer une action sans effet.
 */
export default function StudentNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { sidebarCollapsed, sidebarToggleLocked, toggleSidebar } = useWorkspaceLayout();
  const { isPremium, hasSubscription, canSeeUpgrade } = usePremiumStatus();

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
        className={`sa-workspace-sidebar hidden lg:flex lg:flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200 z-40 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        data-sidebar-collapsed={sidebarCollapsed ? 'true' : undefined}
      >
        {/* ── Bascule ouvrir / réduire ───────────────────────────────────────
            Posée SUR le bord droit (moitié dehors, moitié dedans) : c'est la
            frontière qu'elle déplace, donc l'endroit où on la cherche. Discrète
            au repos, elle se colore au survol et au focus clavier.

            `lg:` uniquement — sous ce point de rupture la barre n'existe pas,
            la navigation est la barre d'onglets basse, et rien ici ne s'affiche
            (l'`aside` entier est `hidden lg:flex`). */}
        <button
          type="button"
          onClick={toggleSidebar}
          disabled={sidebarToggleLocked}
          aria-label={sidebarToggleLocked
            ? 'Barre latérale réduite par « Ma carte »'
            : sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Réduire la barre latérale'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarToggleLocked
            ? '« Ma carte » utilise cette place — ferme la carte pour rouvrir la barre'
            : sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Réduire la barre latérale'}
          data-sidebar-toggle="true"
          className={[
            'absolute top-20 -right-3 z-50 w-6 h-6 rounded-full',
            'flex items-center justify-center',
            'bg-white border border-slate-200 text-slate-400 shadow-sm',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
            sidebarToggleLocked
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:text-slate-700 hover:border-slate-300 cursor-pointer',
          ].join(' ')}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            : <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />}
        </button>

        {/* L'EN-TÊTE EST UNE MARQUE, PAS UNE PORTE.
            C'était un lien vers « / », c'est-à-dire vers le site vitrine :
            l'élève qui cliquait sur le logo de son espace de travail en
            sortait sans l'avoir demandé. Un espace de travail ne se quitte
            pas par son propre titre — la navigation, elle, est juste en
            dessous, et « Accueil » y mène à /espace, qui est l'accueil que
            cet élève attend. */}
        <div className={`flex items-center h-16 border-b border-slate-100 flex-shrink-0 ${sidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-6'}`}>
          <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-9 w-auto rounded-lg object-contain flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-space font-bold text-slate-900 text-sm">Smarter Academy</span>
              <span className="font-mono-jetbrains text-[10px] text-blue-500 font-semibold tracking-wider uppercase mt-0.5">Espace élève</span>
            </div>
          )}
        </div>

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
                  sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                } py-2.5 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
              style={({ isActive }) => (isActive ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {})}
            >
              <link.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && link.label}
            </NavLink>
          ))}
        </nav>

        {/* Trois sorties, et le silence en fait partie : tant que le serveur
            n'a pas répondu, ni état ni invitation — on ne vend rien dans le
            doute, et on n'annonce pas un abonnement qu'on n'a pas vérifié. */}
        {(isPremium || canSeeUpgrade) && (
          <div className="px-3 pb-3">
            {isPremium ? (
              // UN ÉTAT, PAS UN BOUTON. L'élève a payé : il n'y a rien à
              // obtenir ici. Le lien mène à la GESTION de son abonnement,
              // jamais à une seconde souscription. Un accès accordé par
              // l'administration n'est pas un abonnement — il le voit dit
              // autrement, et n'a pas de portail à ouvrir.
              hasSubscription ? (
                <Link
                  to="/abonnement"
                  title="Abonnement actif — gérer mon abonnement"
                  aria-label="Abonnement actif — gérer mon abonnement"
                  className={`flex items-center rounded-xl bg-violet-50 border border-violet-200 mb-3 hover:border-violet-300 transition-colors min-h-[44px] ${
                    sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3.5 py-3'
                  }`}
                >
                  <ShieldCheck size={16} className="text-violet-600 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="min-w-0">
                      <p className="font-space font-bold text-slate-800 text-xs">Abonnement actif</p>
                      <p className="font-inter text-slate-500 text-[11px] leading-tight">Gérer mon abonnement</p>
                    </div>
                  )}
                </Link>
              ) : (
                <div
                  title="Accès premium actif"
                  className={`flex items-center rounded-xl bg-violet-50 border border-violet-200 mb-3 min-h-[44px] ${
                    sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3.5 py-3'
                  }`}
                >
                  <ShieldCheck size={16} className="text-violet-600 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="min-w-0">
                      <p className="font-space font-bold text-slate-800 text-xs">Premium actif</p>
                      <p className="font-inter text-slate-500 text-[11px] leading-tight">Tout le programme</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              // L'INVITATION — intacte pour qui n'a pas encore accès : lui
              // retirer l'offre lui retirerait le moyen de la découvrir.
              <Link
                to="/tarifs"
                title="Passer Premium — débloque tout le programme"
                aria-label="Passer Premium"
                className={`flex items-center rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 mb-3 hover:border-amber-300 transition-colors min-h-[44px] ${
                  sidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-2.5 px-3.5 py-3'
                }`}
              >
                <Crown size={16} className="text-amber-500 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="font-space font-bold text-slate-800 text-xs">Passer Premium</p>
                    <p className="font-inter text-slate-500 text-[11px] leading-tight">Débloque tout le programme</p>
                  </div>
                )}
              </Link>
            )}
          </div>
        )}

        <div className={`py-4 border-t border-slate-100 flex flex-shrink-0 ${
          sidebarCollapsed ? 'px-0 flex-col items-center gap-2' : 'px-4 items-center gap-3'
        }`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-space font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
            title={sidebarCollapsed ? `${getDisplayName(user)} — ${grade ? grade.name : 'Classe non définie'}` : undefined}
          >
            {initials}
          </div>
          {!sidebarCollapsed && (
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
      <header id="app-header" className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        {/* Même règle que la barre latérale : marque, pas lien. */}
        <div className="flex items-center gap-2 min-w-0">
          <img src="/smarter-academy-logo.webp" alt="Smarter Academy" className="h-8 w-auto rounded-md object-contain flex-shrink-0" />
          <span className="font-mono-jetbrains text-[10px] text-blue-500 font-semibold tracking-wider uppercase whitespace-nowrap">Espace élève</span>
        </div>
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
