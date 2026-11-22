// Single source of truth for the visitor-facing primary navigation —
// consumed by Navbar and Footer so the IA can't drift between the two.
// No catalogue link: /courses requires an account (RequireAccount).
// `labelKey` resolves through i18n's `nav` namespace at render time
// (src/i18n/locales/fr/nav.json) — data files carry keys, never copy.
// `feature`: drawn only while that feature is on (config/features.js).
import { isFeatureOn } from '../config/features';

const ALL_LINKS = [
  { labelKey: 'home', path: '/' },
  { labelKey: 'method', path: '/methode' },
  { labelKey: 'about', path: '/about' },
  { labelKey: 'books', path: '/books', feature: 'books' },
  { labelKey: 'faq', path: '/faq' },
  { labelKey: 'contact', path: '/contact' },
];

export const navLinks = ALL_LINKS.filter((link) => !link.feature || isFeatureOn(link.feature));
