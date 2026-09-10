import {
  LayoutDashboard, BarChart3, BookOpen, Flag, Users, CreditCard,
  UserCog, ScrollText,
} from 'lucide-react';

/**
 * L'arborescence du panneau d'administration (spec §4).
 *
 * Des DONNÉES, pas du balisage — même choix que data/studentNavigation.js :
 * la barre latérale, le fil d'Ariane et les titres de page se dérivent tous
 * d'ici, donc renommer une section se fait à un seul endroit.
 *
 * `end: true` sur un chemin qui est le préfixe d'un autre, sinon NavLink
 * l'allume en même temps que ses enfants.
 */
export const adminNavSections = [
  {
    label: null,
    links: [{ label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Statistiques',
    icon: BarChart3,
    links: [
      { label: 'Plateforme', path: '/admin/analytics/plateforme', icon: BarChart3 },
      { label: 'Apprentissage', path: '/admin/analytics/apprentissage', icon: BarChart3 },
      { label: 'Contenu', path: '/admin/analytics/contenu', icon: BarChart3 },
      { label: 'Points d’apprentissage', path: '/admin/analytics/points', icon: BarChart3 },
    ],
  },
  {
    label: 'Contenu',
    icon: BookOpen,
    links: [
      { label: 'Leçons', path: '/admin/contenu/lecons', icon: BookOpen },
      { label: 'Modules', path: '/admin/contenu/modules', icon: BookOpen },
      { label: 'Exercices', path: '/admin/contenu/exercices', icon: BookOpen },
    ],
  },
  {
    label: 'Signalements',
    icon: Flag,
    links: [
      { label: 'Tous', path: '/admin/signalements', icon: Flag, end: true },
      { label: 'Nouveaux', path: '/admin/signalements?status=new', icon: Flag, matchQuery: 'status=new' },
      { label: 'En cours', path: '/admin/signalements?status=in_review', icon: Flag, matchQuery: 'status=in_review' },
      { label: 'Résolus', path: '/admin/signalements?status=resolved', icon: Flag, matchQuery: 'status=resolved' },
    ],
  },
  {
    label: 'Élèves',
    icon: Users,
    links: [
      { label: 'Tous', path: '/admin/eleves', icon: Users, end: true },
      { label: 'Actifs', path: '/admin/eleves?status=active', icon: Users, matchQuery: 'status=active' },
      { label: 'Suspendus', path: '/admin/eleves?status=suspended', icon: Users, matchQuery: 'status=suspended' },
      { label: 'Désactivés', path: '/admin/eleves?status=disabled', icon: Users, matchQuery: 'status=disabled' },
    ],
  },
  {
    label: 'Abonnements',
    icon: CreditCard,
    links: [
      { label: 'Abonnements', path: '/admin/abonnements', icon: CreditCard, end: true },
      { label: 'Paiements', path: '/admin/abonnements/paiements', icon: CreditCard },
    ],
  },
  {
    label: 'Compte',
    icon: UserCog,
    links: [
      { label: 'Profil', path: '/admin/compte', icon: UserCog, end: true },
      { label: 'Sécurité', path: '/admin/compte/securite', icon: UserCog },
    ],
  },
  {
    label: 'Système',
    icon: ScrollText,
    links: [
      { label: 'Journal d’activité', path: '/admin/systeme/journal', icon: ScrollText },
      { label: 'Messages de contact', path: '/admin/systeme/messages', icon: ScrollText },
    ],
  },
];

/** Tous les liens à plat — utile pour dériver un titre de page depuis l'URL. */
export const adminNavLinks = adminNavSections.flatMap((section) => section.links);
