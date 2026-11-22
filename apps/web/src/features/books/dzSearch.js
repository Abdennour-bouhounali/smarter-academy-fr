/**
 * Recherche tolérante pour les listes du formulaire de commande (wilayas, communes).
 * Un client tape « 16 », « ١٦ », « جزاير », « الجزائر » ou « alger » : tous trouvent
 * la wilaya 16. La normalisation de base (hamza/alif, tā' marbūṭa, alif maqṣūra,
 * voyelles, accents latins, chiffres arabo-hindis) vit ici depuis que la plateforme est
 * française (la librairie est éteinte et garde son arabe jusqu'à ses livres français) ;
 * on y ajoute ؤ/ئ et l'apostrophe des noms latins.
 */
function foldArabic(value) {
  let text = String(value ?? '').toLowerCase();
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  text = text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  text = text.replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627');
  text = text.replace(/\u0649/g, '\u064A');
  text = text.replace(/\u0629/g, '\u0647');
  text = text.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  text = text.replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  return text.replace(/\s+/g, ' ').trim();
}

export function normalizeSearch(text) {
  return foldArabic(text)
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
