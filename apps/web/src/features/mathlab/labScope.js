/**
 * LES DEUX مخابر — مخبر المتوسط et مخبر الثانوي — logique pure, sans React.
 *
 * Le مختبر n'a qu'UN registre d'instruments et qu'UNE famille de routes. Ce
 * qui change d'un مخبر à l'autre n'est pas l'instrument, c'est ce qu'il
 * EXPOSE : راسم الدوال reste un seul outil, mais l'onglet « المماس » n'existe
 * pas au collège. D'où deux déclarations par instrument (toolContract.js) :
 *
 *   scopes        'common'                  → hors مخبر, pour tous (la سبّورة)
 *                 ['moyen', 'secondaire']   → les مخابر où il apparaît
 *   capabilities  { moyen: {...}, secondaire: {...} }
 *                 → ce que l'instrument montre dans chacun. La forme
 *                   appartient à l'instrument (ses sections, ses options) ;
 *                   `null` pour un مخبر veut dire « tout ».
 *
 * Le مخبر voyage dans l'URL (`?lab=moyen`) et dans le document lui-même
 * (`data.labScope`, réservé à la coquille) : un travail commencé au collège
 * se rouvre au collège, d'où qu'on vienne. Voir MATH_LAB.md §2.1.
 */

export const LAB_SCOPES = Object.freeze(['moyen', 'secondaire']);

/** L'instrument d'usage commun, hors des مخابر (la سبّورة). */
const COMMON_SCOPE = 'common';

/** Le paramètre d'URL qui porte le مخبر : `/espace/atelier?lab=moyen`. */
const LAB_SCOPE_PARAM = 'lab';

/** La clé que la coquille réserve dans `data` pour se souvenir du مخبر. */
const LAB_SCOPE_DATA_KEY = 'labScope';

/** Le dernier مخبر choisi dans ce navigateur (une préférence, jamais une vérité). */
const LAB_SCOPE_STORAGE_KEY = 'sa-ml-lab';

export function isLabScope(value) {
  return LAB_SCOPES.includes(value);
}

/** Vrai pour la سبّورة : présente pour tous, sans مخبر. */
export function isCommonTool(tool) {
  return tool?.scopes === COMMON_SCOPE;
}

/** Les مخابر où l'instrument apparaît — vide pour un instrument commun. */
export function toolScopes(tool) {
  return Array.isArray(tool?.scopes) ? tool.scopes : [];
}

export function toolInScope(tool, scope) {
  return toolScopes(tool).includes(scope);
}

/** Les instruments d'un مخبر, dans l'ordre du registre. */
export function toolsForScope(tools, scope) {
  return tools.filter((tool) => toolInScope(tool, scope));
}

/** Les instruments communs (hors مخبر). */
export function commonTools(tools) {
  return tools.filter(isCommonTool);
}

/**
 * Ce que l'instrument montre dans ce مخبر. `null` = tout (instrument commun,
 * مخبر sans restriction déclarée). La forme de l'objet appartient à l'outil.
 */
export function toolCapabilities(tool, scope) {
  if (!isLabScope(scope)) return null;

  return tool?.capabilities?.[scope] ?? null;
}

/**
 * Le مخبر dans lequel ouvrir un instrument.
 *
 *   1. un instrument commun n'en a pas → null ;
 *   2. un instrument d'un seul مخبر y est toujours ;
 *   3. un document enregistré garde le sien (`stored`) — un travail appartient
 *      au مخبر où il est né ;
 *   4. sinon celui que l'URL demande (`requested`) ;
 *   5. sinon le dernier choisi dans ce navigateur (`remembered`) ;
 *   6. sinon le premier de l'instrument (le collège, pour un outil partagé).
 *
 * Un مخبر où l'instrument n'existe pas n'est jamais retenu.
 */
export function resolveToolScope(tool, { stored = null, requested = null, remembered = null } = {}) {
  const scopes = toolScopes(tool);
  if (scopes.length === 0) return null;
  if (scopes.length === 1) return scopes[0];
  for (const candidate of [stored, requested, remembered]) {
    if (scopes.includes(candidate)) return candidate;
  }

  return scopes[0];
}

/** Lit `?lab=` dans une chaîne de recherche (ou un URLSearchParams). */
export function readLabScopeParam(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search ?? '');
  const value = params.get(LAB_SCOPE_PARAM);

  return isLabScope(value) ? value : null;
}

/** Ajoute (ou retire) `?lab=` à un chemin. */
export function withLabScope(path, scope) {
  return isLabScope(scope) ? `${path}?${LAB_SCOPE_PARAM}=${scope}` : path;
}

/** L'accueil d'un مخبر (`…/atelier?lab=moyen`), ou l'accueil du مختبر. */
export function labHomePath(root, scope = null) {
  return withLabScope(root, scope);
}

/** Le مخبر mémorisé par un document, ou null. */
export function storedLabScope(data) {
  const value = data && typeof data === 'object' ? data[LAB_SCOPE_DATA_KEY] : null;

  return isLabScope(value) ? value : null;
}

/** L'état de l'instrument SANS la clé de la coquille — ce que l'outil reçoit. */
export function stripLabScope(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !(LAB_SCOPE_DATA_KEY in data)) return data;
  const { [LAB_SCOPE_DATA_KEY]: _omit, ...rest } = data;

  return rest;
}

/** L'état que le serveur reçoit : celui de l'outil, plus le مخبر s'il y en a un. */
export function attachLabScope(data, scope) {
  if (!isLabScope(scope) || !data || typeof data !== 'object' || Array.isArray(data)) return data;

  return { ...data, [LAB_SCOPE_DATA_KEY]: scope };
}

/** Le résumé de « أعمالي », marqué de son مخبر (badge et filtre). */
export function attachScopeToSummary(summary, scope) {
  if (!summary || !isLabScope(scope)) return summary;

  return { ...summary, scope };
}

/** Le مخبر d'une carte de « أعمالي » — lu dans son résumé, null s'il n'en a pas. */
export function summaryLabScope(summary) {
  return isLabScope(summary?.scope) ? summary.scope : null;
}

/**
 * Le مخبر d'un travail de « أعمالي » : celui que son résumé a retenu ; à
 * défaut (un travail plus ancien que les مخابر), celui de son instrument s'il
 * n'en a qu'un — un travail de مختبر التحليل est du ثانوي, quoi qu'il arrive.
 * Null pour la سبّورة, et pour un ancien travail d'un instrument partagé.
 */
export function workLabScope(work, tool) {
  const fromSummary = summaryLabScope(work?.summary);
  if (fromSummary) return fromSummary;
  const scopes = toolScopes(tool);

  return scopes.length === 1 ? scopes[0] : null;
}

export function readRememberedLabScope() {
  try {
    const value = window.localStorage.getItem(LAB_SCOPE_STORAGE_KEY);

    return isLabScope(value) ? value : null;
  } catch {
    return null;
  }
}

export function rememberLabScope(scope) {
  if (!isLabScope(scope)) return;
  try {
    window.localStorage.setItem(LAB_SCOPE_STORAGE_KEY, scope);
  } catch {
    // Stockage refusé (navigation privée, vignette) : une préférence perdue, rien de plus.
  }
}

/**
 * Valide la déclaration d'un instrument (appelé par defineMathLabTool).
 * Rend un message d'erreur, ou null.
 */
export function scopeDeclarationError(definition) {
  const { scopes, capabilities } = definition;
  if (scopes === COMMON_SCOPE) {
    return capabilities === undefined ? null : 'un instrument commun ne déclare pas de capabilities';
  }
  if (!Array.isArray(scopes) || scopes.length === 0) return 'scopes doit valoir « common » ou une liste de مخابر';
  if (scopes.some((scope) => !isLabScope(scope)) || new Set(scopes).size !== scopes.length) {
    return `scopes invalides (${scopes.join(', ')})`;
  }
  if (capabilities !== undefined) {
    if (!capabilities || typeof capabilities !== 'object') return 'capabilities doit être un objet';
    const stray = Object.keys(capabilities).find((key) => !scopes.includes(key));
    if (stray) return `capabilities.${stray} ne correspond à aucun مخبر de l'instrument`;
  }

  return null;
}
