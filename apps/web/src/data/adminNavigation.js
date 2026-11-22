import {
  LayoutDashboard, BarChart3, BookOpen, Flag, Users, KeyRound, Package,
  UserCog, ScrollText, Library, ShoppingBag, MessageSquare, UserCheck, GraduationCap, School, Building2, BadgeCheck, Inbox, CreditCard, SlidersHorizontal, Flame,
} from 'lucide-react';
import { isFeatureOn } from '../config/features';

/**
 * L'arborescence du panneau d'administration (spec §4).
 *
 * Des DONNÉES, pas du balisage — même choix que data/studentNavigation.js et
 * data/teacherNavigation.js : la barre latérale, le fil d'Ariane et les titres
 * de page se dérivent tous d'ici, donc renommer une section se fait à un seul
 * endroit.
 *
 * `labelKey` → catalogue `admin` (src/i18n/locales/fr/admin.json, renommé
 * `locales/fr/` à la fin de la traduction), et non un libellé en dur : le panneau parle la langue du produit,
 * comme l'espace élève et l'espace enseignant. Une entrée de navigation ne
 * porte donc plus de texte — seulement la clé qui le désigne.
 *
 * `end: true` sur un chemin qui est le préfixe d'un autre, sinon NavLink
 * l'allume en même temps que ses enfants.
 *
 * `roles` (section ou lien) : qui la voit. Absent = l'administrateur seul.
 * Le gestionnaire de la librairie (`book_manager`, BOOKS_STORE.md §6ter) ne voit
 * que « Livres » et son compte — la vraie porte reste serveur (`can:books`).
 */
const BOOKS_ROLES = ['admin', 'book_manager'];

export const adminNavSections = [
  {
    labelKey: null,
    links: [{ labelKey: 'nav.dashboard', path: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    labelKey: 'nav.analytics',
    icon: BarChart3,
    links: [
      { labelKey: 'nav.analyticsPlatform', path: '/admin/analytics/plateforme', icon: BarChart3 },
      { labelKey: 'nav.analyticsLearning', path: '/admin/analytics/apprentissage', icon: BarChart3 },
      { labelKey: 'nav.analyticsContent', path: '/admin/analytics/contenu', icon: BarChart3 },
      { labelKey: 'nav.analyticsPoints', path: '/admin/analytics/points', icon: BarChart3 },
    ],
  },
  {
    labelKey: 'nav.content',
    icon: BookOpen,
    links: [
      { labelKey: 'nav.lessons', path: '/admin/contenu/lecons', icon: BookOpen },
      { labelKey: 'nav.exercises', path: '/admin/contenu/exercices', icon: BookOpen },
    ],
  },
  {
    labelKey: 'nav.reports',
    icon: Flag,
    links: [
      { labelKey: 'nav.reportsAll', path: '/admin/signalements', icon: Flag, end: true },
      { labelKey: 'nav.reportsNew', path: '/admin/signalements?status=new', icon: Flag, matchQuery: 'status=new' },
      { labelKey: 'nav.reportsInReview', path: '/admin/signalements?status=in_review', icon: Flag, matchQuery: 'status=in_review' },
      { labelKey: 'nav.reportsResolved', path: '/admin/signalements?status=resolved', icon: Flag, matchQuery: 'status=resolved' },
    ],
  },
  {
    labelKey: 'nav.students',
    icon: Users,
    links: [
      { labelKey: 'nav.studentsAll', path: '/admin/eleves', icon: Users, end: true },
      { labelKey: 'nav.studentsActive', path: '/admin/eleves?status=active', icon: Users, matchQuery: 'status=active' },
      { labelKey: 'nav.studentsSuspended', path: '/admin/eleves?status=suspended', icon: Users, matchQuery: 'status=suspended' },
      { labelKey: 'nav.studentsDisabled', path: '/admin/eleves?status=disabled', icon: Users, matchQuery: 'status=disabled' },
    ],
  },
  {
    // Les ENSEIGNANTS et leurs CLASSES. La fiche d'un enseignant est la
    // surface de contrôle commerciale : offre, activation, demandes,
    // abonnements, dérogations.
    labelKey: 'nav.teachers',
    icon: GraduationCap,
    links: [
      { labelKey: 'nav.teachersAll', path: '/admin/enseignants', icon: GraduationCap, end: true },
      { labelKey: 'nav.teachersPendingRequests', path: '/admin/enseignants?requests=pending', icon: GraduationCap, matchQuery: 'requests=pending' },
      { labelKey: 'nav.classrooms', path: '/admin/classes', icon: School },
      // « Espace établissement » : les établissements et leur directeur (SCHOOL_ADMIN_SPACE.md §5).
      { labelKey: 'nav.schools', path: '/admin/etablissements', icon: Building2 },
    ],
  },
  {
    // Le MODÈLE COMMERCIAL, configuré ici sans déploiement : offres,
    // versions, limites, fonctionnalités, prix informatifs. AUCUN paiement
    // en ligne — l'activation est manuelle (fiche du compte) ou par code.
    labelKey: 'nav.plans',
    icon: BadgeCheck,
    links: [
      { labelKey: 'nav.plansAll', path: '/admin/offres', icon: BadgeCheck, end: true },
      { labelKey: 'nav.plansRequests', path: '/admin/offres/demandes', icon: Inbox },
      { labelKey: 'nav.plansSubscriptions', path: '/admin/offres/abonnements', icon: CreditCard },
      // « Accès et limites » : outils de l'atelier, cahier et travaux, par palier.
      { labelKey: 'nav.accessLimits', path: '/admin/offres/acces', icon: SlidersHorizontal },
      // « Défi du jour » : barème et défauts (DAILY_CHALLENGE.md).
      { labelKey: 'nav.dailyChallenge', path: '/admin/offres/defi-quotidien', icon: Flame, feature: 'dailyChallenge' },
    ],
  },
  {
    // L'ACCÈS PAR CODE : des codes d'activation, liés ou non à une formule.
    labelKey: 'nav.access',
    icon: KeyRound,
    links: [
      { labelKey: 'nav.activationCodes', path: '/admin/codes-activation', icon: KeyRound, end: true },
      { labelKey: 'nav.activationBatches', path: '/admin/codes-activation/lots', icon: Package },
    ],
  },
  {
    // La LIBRAIRIE : livres papier vendus sans paiement en ligne — commandes,
    // livraison, encaissements, messages. docs/architecture/BOOKS_STORE.md.
    labelKey: 'nav.books',
    icon: Library,
    roles: BOOKS_ROLES,
    feature: 'books',
    links: [
      { labelKey: 'nav.booksOrders', path: '/admin/livres/commandes', icon: ShoppingBag, roles: BOOKS_ROLES },
      { labelKey: 'nav.booksCatalog', path: '/admin/livres', icon: Library, end: true, roles: BOOKS_ROLES },
      { labelKey: 'nav.booksMessages', path: '/admin/livres/messages', icon: MessageSquare, roles: BOOKS_ROLES },
      // « Gestionnaires de la librairie » : l'administrateur seul les crée.
      { labelKey: 'nav.booksManagers', path: '/admin/livres/gestionnaires', icon: UserCheck },
    ],
  },
  {
    labelKey: 'nav.account',
    icon: UserCog,
    roles: BOOKS_ROLES,
    links: [
      { labelKey: 'nav.accountProfile', path: '/admin/compte', icon: UserCog, end: true, roles: BOOKS_ROLES },
      { labelKey: 'nav.accountSecurity', path: '/admin/compte/securite', icon: UserCog, roles: BOOKS_ROLES },
    ],
  },
  {
    labelKey: 'nav.system',
    icon: ScrollText,
    links: [
      { labelKey: 'nav.activityLog', path: '/admin/systeme/journal', icon: ScrollText },
      { labelKey: 'nav.registryHealth', path: '/admin/systeme/coherence', icon: ScrollText },
      { labelKey: 'nav.contactMessages', path: '/admin/systeme/messages', icon: ScrollText },
    ],
  },
];

/** Tous les liens à plat — utile pour dériver un titre de page depuis l'URL. */
export const adminNavLinks = adminNavSections.flatMap((section) => section.links);

// `feature`: shown only while that feature is on (config/features.js). The admin's commercial pages (plans,
// subscriptions, codes) have none: he sees them whether payments are open or closed.
const visibleTo = (item, role) => (item.roles ?? ['admin']).includes(role) && (!item.feature || isFeatureOn(item.feature));

/** Les sections que voit un rôle : l'administrateur tout, le gestionnaire de la librairie « Livres » et son compte. */
export function adminNavSectionsFor(role) {
  return adminNavSections
    .filter((section) => visibleTo(section, role))
    .map((section) => ({ ...section, links: section.links.filter((link) => visibleTo(link, role)) }))
    .filter((section) => section.links.length > 0);
}

