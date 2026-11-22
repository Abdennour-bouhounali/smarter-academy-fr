/**
 * Les PAGES d'une leçon du manuel, en texte lisible.
 *
 * `lesson.textbookRef.pages` n'est pas un nombre : c'est la carte des sections
 * de la leçon vers leur(s) page(s), telle que le catalogue la déclare —
 *
 *   { activity: 8, knowledge: 10, method: 11, exercises: 14 }
 *   { activity: 8, knowledge: [10, 12], exercises: 14 }
 *
 * Interpolée directement dans « الكتاب ص {{pages}} », elle rendait
 * « الكتاب ص [object Object] ». Cette fonction en fait la LISTE ORDONNÉE des
 * pages que la leçon occupe, sans doublon : « 8، 10، 11، 14 ».
 *
 * Le séparateur est la virgule arabe (U+060C), comme dans le reste de
 * l'interface. Les chiffres restent occidentaux, comme partout dans la
 * plateforme ; l'appelant enveloppe déjà la chaîne dans une phrase arabe.
 *
 * @param {Record<string, number|number[]>|string|number|null|undefined} pages
 *        la valeur brute du catalogue. Une chaîne (« 7–16 », l'unité) ou un
 *        nombre est rendu tel quel : ces formes sont déjà lisibles.
 * @returns {string} le texte à afficher, ou '' quand il n'y a rien à dire.
 */
export function formatTextbookPages(pages) {
  if (pages === null || pages === undefined) return '';
  if (typeof pages === 'string') return pages.trim();
  if (typeof pages === 'number') return Number.isFinite(pages) ? String(pages) : '';

  const collected = [];
  const take = (value) => {
    // Une section sans page (« method »: null — la page appartient à une autre leçon) n'est pas la page 0.
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach(take);
      return;
    }
    const n = Number(value);
    if (Number.isFinite(n)) collected.push(n);
  };

  if (Array.isArray(pages)) pages.forEach(take);
  else if (typeof pages === 'object') Object.values(pages).forEach(take);
  else return '';

  // Ordre du manuel et pas de doublon : une même page porte souvent deux
  // sections (activité et معارف page 8, par exemple).
  const unique = [...new Set(collected)].sort((a, b) => a - b);
  return unique.join('، ');
}
