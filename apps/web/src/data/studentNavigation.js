import { House, BookOpen, Compass, TrendingUp, UserCircle } from 'lucide-react';

// The authenticated student area's own navigation — deliberately separate
// from data/navigation.js (the visitor IA). A student's workspace is a
// different kind of surface (LEARN → PRACTICE → PROGRESS → MASTER) with a
// different shape, not a filtered view of the marketing nav.
export const studentNavLinks = [
  { label: 'Accueil', path: '/espace', icon: House, end: true },
  { label: 'Mes cours', path: '/espace/cours', icon: BookOpen },
  { label: 'Explorer', path: '/espace/explorer', icon: Compass },
  { label: 'Ma progression', path: '/espace/progression', icon: TrendingUp },
  { label: 'Profil', path: '/espace/profil', icon: UserCircle },
];
