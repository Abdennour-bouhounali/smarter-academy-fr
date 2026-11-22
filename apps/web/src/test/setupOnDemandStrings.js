// Les tests de rendu lisent les textes À LA DEMANDE comme la page qui les affiche. En production ils arrivent
// avec leur espace : `admin` et `teacher` avec leur cadre (i18n/index.js › ON_DEMAND_NAMESPACES). Ici ils sont posés dès qu'un test charge
// i18n, pour que « aucune clé brute » reste vérifiable et qu'aucun rendu ne suspende
// (BUNDLE_BOUNDARIES.md §3, « admin / teacher »).
// Un test qui ne charge pas i18n n'en reçoit pas : rien n'est initialisé à sa place.
import { vi } from 'vitest';

vi.mock('../i18n/index.js', async (importOriginal) => {
  const mod = await importOriginal();
  const { LOCALE } = await import('../locale.js');
  const { default: admin } = await import('../i18n/locales/ar/admin.json');
  mod.default.addResourceBundle(LOCALE, 'admin', admin, true, true);
  const { default: teacher } = await import('../i18n/locales/ar/teacher.json');
  mod.default.addResourceBundle(LOCALE, 'teacher', teacher, true, true);
  return mod;
});
