// Single source of truth for the visitor-facing primary navigation —
// consumed by Navbar, Footer, and CommandPalette so the IA can't drift
// between the three.
export const navLinks = [
  { label: 'Accueil', path: '/' },
  { label: 'Notre méthode', path: '/methode' },
  { label: 'Cours', path: '/courses' },
  { label: 'Tarifs', path: '/tarifs' },
  { label: 'À propos', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];
