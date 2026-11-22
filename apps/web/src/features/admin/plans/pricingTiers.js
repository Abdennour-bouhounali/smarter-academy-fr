/**
 * La GRILLE de prix par élève, côté éditeur : lignes, normalisation,
 * problèmes affichés AVANT l'envoi. Le serveur (TeacherPricingService)
 * revalide tout ; ceci n'est que le miroir pour l'ergonomie.
 */

export const emptyTier = (order = 0) => ({ minStudents: '', maxStudents: '', pricePerStudent: '', currency: 'DZD', isActive: true, sortOrder: order });

/** Du serveur (centimes) vers le formulaire (dinars). */
export function tiersToRows(tiers = []) {
  return tiers.map((t, i) => ({
    id: t.id,
    minStudents: t.minStudents,
    maxStudents: t.maxStudents ?? '',
    pricePerStudent: Math.round((t.pricePerStudentCents ?? 0) / 100),
    currency: t.currency || 'DZD',
    isActive: t.isActive !== false,
    sortOrder: t.sortOrder ?? i,
  }));
}

/** Du formulaire vers la charge utile de l'API (centimes). */
export function rowsToPayload(rows = []) {
  return rows.map((r, i) => ({
    minStudents: Number(r.minStudents),
    maxStudents: r.maxStudents === '' || r.maxStudents === null ? null : Number(r.maxStudents),
    pricePerStudentCents: Math.round(Number(r.pricePerStudent || 0) * 100),
    currency: (r.currency || 'DZD').toUpperCase(),
    isActive: r.isActive !== false,
    sortOrder: i,
  }));
}

/**
 * Les problèmes d'une grille (formulaire) : bornes, prix, chevauchements,
 * trous entre paliers ACTIFS. Vide = saine.
 *
 * ELLE REND DES CODES, PAS DES PHRASES. Elle rendait des chaînes françaises,
 * que l'éditeur — devenu arabe — ne pouvait plus afficher : il avait fallu
 * recalculer les mêmes règles à côté, pour les dire dans la langue du
 * produit. Deux implémentations d'une même règle finissent toujours par
 * diverger, et celle qui bloque l'enregistrement n'aurait plus été celle qui
 * s'affiche.
 *
 * D'où un `{ code, params }` : la RÈGLE vit ici, la PHRASE dans le catalogue
 * (`admin.plans.tier*`). C'est exactement la règle « l'API parle en codes, le
 * client parle arabe » (ARABIC_RTL_CONTRACT §2), appliquée à une frontière
 * interne.
 *
 * @returns {{code: string, params: object}[]}
 */
export function tierProblems(rows = []) {
  const problems = [];
  const push = (code, params = {}) => problems.push({ code, params });

  rows.forEach((r, i) => {
    const n = i + 1;
    const min = Number(r.minStudents);
    const max = r.maxStudents === '' || r.maxStudents === null ? null : Number(r.maxStudents);
    const price = Number(r.pricePerStudent || 0);
    if (!Number.isInteger(min) || min < 1) push('tierMinInvalid', { n });
    if (max !== null && (!Number.isInteger(max) || max < min)) push('tierMaxInvalid', { n });
    if (!Number.isFinite(price) || price < 0) push('tierPriceInvalid', { n });
  });

  const active = rows
    .filter((r) => r.isActive !== false && Number.isInteger(Number(r.minStudents)) && Number(r.minStudents) >= 1)
    .map((r) => ({ min: Number(r.minStudents), max: r.maxStudents === '' || r.maxStudents === null ? null : Number(r.maxStudents) }))
    .sort((a, b) => a.min - b.min);

  for (let i = 1; i < active.length; i += 1) {
    const prev = active[i - 1];
    const cur = active[i];
    if (prev.max === null) { push('tierUnbounded', { min: prev.min }); continue; }
    if (cur.min <= prev.max) {
      // Les bornes partent formatées : « 1–20 » est une PLAGE, elle doit
      // rester lisible d'un bloc dans la phrase arabe plutôt que d'être
      // recomposée de quatre nombres que le bidi pourrait réordonner.
      push('tierOverlap', { a: `${prev.min}–${prev.max}`, b: `${cur.min}–${cur.max ?? '∞'}` });
    } else if (cur.min !== prev.max + 1) {
      const from = prev.max + 1; const to = cur.min - 1;
      if (from === to) push('tierGapOne', { n: from });
      else push('tierGapRange', { from, to });
    }
  }

  // Dédoublonnage sur le couple (code, paramètres) : deux paliers peuvent
  // produire le même défaut, et le lister deux fois n'apprend rien.
  const seen = new Set();
  return problems.filter((p) => {
    const key = `${p.code}:${JSON.stringify(p.params)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
