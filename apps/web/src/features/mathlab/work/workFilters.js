/**
 * « أعمالي » — chercher, filtrer, trier. Logique PURE, sans React : c'est
 * elle qu'on teste, et c'est elle qui décide de ce qui s'affiche.
 *
 * ── Pourquoi tout se passe ici, et non sur le serveur ────────────────────
 * La liste des documents arrive déjà SANS `data` (le serveur ne renvoie que
 * l'enveloppe et le résumé) : quelques centaines d'octets par travail. Un
 * élève en a des dizaines, pas des dizaines de milliers. Chercher et trier
 * en mémoire est donc instantané, ne coûte aucun aller-retour, et laisse la
 * frappe répondre au caractère près — là où « Mon cahier », qui pagine des
 * notes lourdes avec du texte riche, a besoin du serveur (useNotesSearch).
 *
 * Le jour où cela ne suffirait plus, c'est `fetchMathLabDocuments` qui
 * prendrait des paramètres ; l'interface ne changerait pas.
 */

/** Les tris offerts. `updated` est le défaut : on revient à ce qu'on vient de quitter. */
export const WORK_SORTS = Object.freeze(['updated', 'created', 'oldest', 'titleAsc', 'titleDesc']);

/** Les fenêtres de temps. `all` ne filtre rien. */
export const WORK_PERIODS = Object.freeze(['all', 'today', 'week', 'month']);

/** Les مخابر (labScope.js). `all` ne filtre rien. */
export const WORK_LABS = Object.freeze(['all', 'moyen', 'secondaire']);

export const DEFAULT_WORK_FILTERS = Object.freeze({ lab: 'all', tool: 'all', period: 'all', favorite: false });

/**
 * Normalise un texte arabe ou français pour une recherche INDULGENTE.
 *
 * Ce qu'on corrige, et rien de plus (§7 : ne pas bâtir un moteur de
 * recherche arabe) :
 *   - la casse et les accents latins (« Étude » trouvé en tapant « etude ») ;
 *   - les diacritiques arabes (تشكيل) et la tatweel (ـ), qu'on ne tape pas ;
 *   - les variantes d'alif (أ إ آ ا), de ya (ى ي) et de ta marbouta (ة ه),
 *     que personne ne distingue en cherchant ;
 *   - les chiffres arabo-hindis (٣) ramenés aux chiffres latins (3), parce
 *     qu'un même nombre s'écrit des deux façons sur la plateforme.
 */
export function normalizeSearchText(value) {
  let text = String(value ?? '').toLowerCase();

  // Les accents latins : « é » → « e ».
  text = text.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Le تشكيل arabe et la tatweel : ils ne se tapent pas.
  text = text.replace(/[ً-ٰٟـ]/g, '');
  // Les variantes qu'on ne distingue pas en cherchant.
  text = text.replace(/[آأإٱ]/g, 'ا'); // آ أ إ ٱ → ا
  text = text.replace(/ى/g, 'ي'); // ى → ي
  text = text.replace(/ة/g, 'ه'); // ة → ه
  // Les chiffres arabo-hindis (٠..٩) et persans (۰..۹) → 0..9.
  text = text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  text = text.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Tout ce sur quoi un travail se cherche : son titre, le nom de son
 * instrument (en arabe, tel que l'élève le voit) et le texte que
 * l'instrument a mis dans son résumé (les expressions, l'équation, les
 * dimensions…).
 *
 * @param {object} work
 * @param {(toolId: string) => string} toolLabel
 */
export function searchableText(work, toolLabel) {
  const parts = [work?.title ?? '', toolLabel?.(work?.tool) ?? '', work?.tool ?? ''];
  const text = work?.summary?.text;
  if (Array.isArray(text)) parts.push(...text.filter((entry) => typeof entry === 'string'));

  return normalizeSearchText(parts.join(' '));
}

/** Le début de la fenêtre de temps, en millisecondes — ou null pour « كل الأوقات ». */
export function periodStart(period, now = Date.now()) {
  const date = new Date(now);
  switch (period) {
    case 'today':
      date.setHours(0, 0, 0, 0);

      return date.getTime();
    case 'week':
      // Sept jours glissants : « cette semaine » veut dire « récemment »,
      // pas « depuis dimanche » — et cela évite toute question de calendrier.
      return now - 7 * 86_400_000;
    case 'month':
      return now - 30 * 86_400_000;
    default:
      return null;
  }
}

/** La date qui compte pour un travail : sa dernière modification. */
function timeOf(work) {
  const iso = work?.updatedAt ?? work?.createdAt;
  const ms = iso ? new Date(iso).getTime() : NaN;

  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * La liste telle qu'elle s'affiche : filtrée, cherchée, triée.
 *
 * Les trois se combinent (§47, §48) et aucun ne réinitialise les autres :
 * changer le tri ne touche pas aux filtres, et chercher ne les efface pas.
 *
 * @param {object[]} works
 * `labOf(work)` rend le مخبر d'un travail (labScope.workLabScope) ; sans
 * lui, seul le résumé est lu.
 *
 * @param {{q?: string, filters?: object, sort?: string, toolLabel?: Function, labOf?: Function, now?: number}} options
 */
export function selectWorks(works, { q = '', filters = DEFAULT_WORK_FILTERS, sort = 'updated', toolLabel, labOf, now = Date.now() } = {}) {
  const needle = normalizeSearchText(q);
  const since = periodStart(filters?.period, now);
  const wantedTool = filters?.tool && filters.tool !== 'all' ? filters.tool : null;
  const wantedLab = filters?.lab && filters.lab !== 'all' ? filters.lab : null;
  const readLab = labOf ?? ((work) => work?.summary?.scope ?? null);

  const kept = (Array.isArray(works) ? works : []).filter((work) => {
    if (wantedLab && readLab(work) !== wantedLab) return false;
    if (wantedTool && work?.tool !== wantedTool) return false;
    if (filters?.favorite && work?.isFavorite !== true) return false;
    if (since != null && timeOf(work) < since) return false;
    if (needle !== '' && !searchableText(work, toolLabel).includes(needle)) return false;

    return true;
  });

  return sortWorks(kept, sort);
}

/** Le tri, sur une COPIE : la liste d'origine garde son ordre. */
export function sortWorks(works, sort = 'updated') {
  const list = [...(Array.isArray(works) ? works : [])];
  const byTitle = (a, b) => String(a?.title ?? '').localeCompare(String(b?.title ?? ''), 'ar-DZ', { numeric: true, sensitivity: 'base' });

  switch (sort) {
    case 'created':
      return list.sort((a, b) => createdOf(b) - createdOf(a));
    case 'oldest':
      return list.sort((a, b) => createdOf(a) - createdOf(b));
    case 'titleAsc':
      return list.sort(byTitle);
    case 'titleDesc':
      return list.sort((a, b) => byTitle(b, a));
    case 'updated':
    default:
      return list.sort((a, b) => timeOf(b) - timeOf(a));
  }
}

function createdOf(work) {
  const iso = work?.createdAt ?? work?.updatedAt;
  const ms = iso ? new Date(iso).getTime() : NaN;

  return Number.isNaN(ms) ? 0 : ms;
}

/** Combien de filtres sont actifs — la pastille du bouton « الفلاتر ». */
export function activeWorkFilterCount(filters) {
  let count = 0;
  if (filters?.lab && filters.lab !== 'all') count += 1;
  if (filters?.tool && filters.tool !== 'all') count += 1;
  if (filters?.period && filters.period !== 'all') count += 1;
  if (filters?.favorite) count += 1;

  return count;
}

/**
 * Le titre d'une copie : « نسخة من X ». Jamais « نسخة من نسخة من X » —
 * copier une copie donne « نسخة من X (2) », puis (3), et ainsi de suite.
 *
 * @param {string} title       le titre de l'original
 * @param {string} copyPrefix  le mot « نسخة من » traduit (i18n)
 * @param {string[]} existing  les titres déjà pris
 */
export function duplicateTitle(title, copyPrefix, existing = []) {
  const source = String(title ?? '').trim();
  const bare = source.startsWith(copyPrefix) ? source.slice(copyPrefix.length).replace(/\s*\(\d+\)$/, '').trim() : source;
  const base = `${copyPrefix}${bare}`;
  const taken = new Set(existing.map((entry) => String(entry ?? '').trim()));
  if (!taken.has(base)) return base.slice(0, 160);

  for (let n = 2; n < 100; n += 1) {
    const candidate = `${base} (${n})`;
    if (!taken.has(candidate)) return candidate.slice(0, 160);
  }

  return base.slice(0, 160);
}
