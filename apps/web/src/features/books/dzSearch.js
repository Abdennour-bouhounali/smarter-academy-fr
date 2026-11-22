/**
 * Recherche tolérante pour les listes du formulaire de commande (wilayas, communes).
 * Un client tape « 16 », « ١٦ », « جزاير », « الجزائر » ou « alger » : tous trouvent
 * la wilaya 16. La normalisation de base (hamza/alif, tā' marbūṭa, alif maqṣūra,
 * voyelles, accents latins, chiffres arabo-hindis) est celle de la plateforme
 * (`normalizeSearchText`) ; on y ajoute ؤ/ئ et l'apostrophe des noms latins.
 */
import { normalizeSearchText } from '../mathlab/work/workFilters';

export function normalizeSearch(text) {
  return normalizeSearchText(text)
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/['’`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filtre et classe des options `{ code?, terms: string[] }` :
 * - une requête de chiffres vise le CODE (« 1 » → 1, 10–19 ; le code exact d'abord) ;
 * - sinon le nom : un mot qui COMMENCE par la requête (article « ال » ignoré) avant
 *   un nom qui la CONTIENT.
 * Une requête vide rend la liste telle quelle.
 */
export function filterOptions(options, query) {
  const q = normalizeSearch(query);
  if (!q) return options;

  if (/^\d+$/.test(q)) {
    const hits = options.filter((o) => o.code != null && String(o.code).startsWith(q));
    return [...hits.filter((o) => String(o.code) === q), ...hits.filter((o) => String(o.code) !== q)];
  }

  const strong = [];
  const weak = [];
  for (const option of options) {
    let best = 0;
    for (const term of option.terms) {
      const t = normalizeSearch(term);
      const words = t.split(' ').flatMap((w) => [w, w.replace(/^ال/, '')]);
      if (words.some((w) => w.startsWith(q)) || t.startsWith(q)) best = 2;
      else if (best < 1 && t.includes(q)) best = 1;
    }
    if (best === 2) strong.push(option);
    else if (best === 1) weak.push(option);
  }
  // À score égal, l'ordre d'origine (numérique ou alphabétique) est gardé.
  return [...strong, ...weak];
}
