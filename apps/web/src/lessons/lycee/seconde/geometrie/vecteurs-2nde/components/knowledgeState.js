/**
 * État cumulatif de la carte des connaissances — réducteur PUR.
 *
 *   contributions par module  →  modules débloqués  →  connaissances courantes
 *
 * `lessonKnowledge.modules[n]` liste les items qu'apporte le module n. Un
 * module est « débloqué » quand l'architecture de progression existante le
 * considère validé (useProgress.completedModules) ou quand son « À retenir »
 * vient de s'afficher (toutes ses étapes faites — même condition que
 * ContentModule/ModuleLayout pour markModuleCompleted). Il n'y a pas de
 * second système de progression : ce fichier ne lit ni stockage ni contexte.
 */

/** Numéros de modules présents dans les données, triés. */
export function knowledgeModuleNumbers(lessonKnowledge) {
  return Object.keys(lessonKnowledge?.modules ?? {})
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
}

/**
 * Normalise une liste de modules débloqués (nombres ou chaînes, telles que
 * les stocke useProgress) en Set de nombres.
 */
export function toModuleSet(unlocked) {
  const set = new Set();
  for (const m of unlocked ?? []) {
    const n = Number(m);
    if (Number.isFinite(n)) set.add(n);
  }
  return set;
}

/**
 * Connaissances disponibles une fois les modules `unlocked` validés.
 *
 * - Ordre : par module croissant, puis dans l'ordre déclaré — la carte
 *   regroupe ensuite par catégorie, donc l'ordre intra-catégorie est celui
 *   de la découverte.
 * - Chaque item reçoit `module` (le module qui l'apporte) et `isNew` si ce
 *   module figure dans `newModules` (débloqué pendant la session courante).
 * - Un id ne peut apparaître qu'une fois : le premier module qui le déclare
 *   gagne (garde-fou contre « Vecteur / Vecteur / Vecteur »).
 *
 * @param {{ modules: Record<number, object[]> }} lessonKnowledge
 * @param {Iterable<number|string>} unlocked   modules validés
 * @param {Iterable<number|string>} [newModules] sous-ensemble à signaler « nouveau »
 * @returns {object[]}
 */
export function cumulativeKnowledge(lessonKnowledge, unlocked, newModules = []) {
  const on = toModuleSet(unlocked);
  const fresh = toModuleSet(newModules);
  const seen = new Set();
  const out = [];
  for (const n of knowledgeModuleNumbers(lessonKnowledge)) {
    if (!on.has(n)) continue;
    for (const item of lessonKnowledge.modules[n] ?? []) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push({ ...item, module: n, isNew: fresh.has(n) });
    }
  }
  return out;
}

/** Tous les items, tous modules confondus (pour les tests de cohérence). */
export function allKnowledge(lessonKnowledge) {
  return cumulativeKnowledge(lessonKnowledge, knowledgeModuleNumbers(lessonKnowledge));
}

/** Items groupés par catégorie, dans l'ordre de `categories` (vides omises). */
export function groupByCategory(items, categories) {
  return categories
    .map((cat) => ({ category: cat, items: items.filter((i) => i.type === cat.id) }))
    .filter((g) => g.items.length > 0);
}
