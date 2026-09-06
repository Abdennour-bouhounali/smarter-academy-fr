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
 *
 * DÉBLOCAGE PAR ITEM. Une connaissance entre aussi dans la carte au moment
 * précis où un <KnowledgeBrick> l'établit, sans attendre la fin du module :
 * c'est le sens même de la carte distribuée (« je viens de l'apprendre, et je
 * peux m'en servir »). Ces ids vivent le temps de la page, exactement comme
 * l'état des étapes du module ; rien de neuf n'est persisté.
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
 * - Un item est visible si son module est débloqué OU si son id figure dans
 *   `unlockedItemIds` (une brique vient de l'établir dans la page) ; dans ce
 *   second cas il est signalé « nouveau ».
 *
 * @param {{ modules: Record<number, object[]> }} lessonKnowledge
 * @param {Iterable<number|string>} unlocked   modules validés
 * @param {Iterable<number|string>} [newModules] sous-ensemble à signaler « nouveau »
 * @param {Iterable<string>} [unlockedItemIds] ids établis par une brique
 * @returns {object[]}
 */
export function cumulativeKnowledge(lessonKnowledge, unlocked, newModules = [], unlockedItemIds = []) {
  const on = toModuleSet(unlocked);
  const fresh = toModuleSet(newModules);
  const live = new Set(unlockedItemIds ?? []);
  const seen = new Set();
  const out = [];
  for (const n of knowledgeModuleNumbers(lessonKnowledge)) {
    const moduleOn = on.has(n);
    for (const item of lessonKnowledge.modules[n] ?? []) {
      // La visibilité se décide AVANT la déduplication : un id sauté parce que
      // son module est verrouillé ne doit pas bloquer un doublon visible.
      if (!moduleOn && !live.has(item.id)) continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push({ ...item, module: n, isNew: fresh.has(n) || (!moduleOn && live.has(item.id)) });
    }
  }
  return out;
}

/**
 * L'item `id` tel que la carte le connaît, `module` compris — c'est ce que
 * rend `<KnowledgeBrick id>` au moment où il l'établit. Le premier module qui
 * déclare l'id gagne, comme dans le réducteur.
 */
export function findKnowledgeItem(lessonKnowledge, id) {
  if (typeof id !== 'string' || !id) return null;
  for (const n of knowledgeModuleNumbers(lessonKnowledge)) {
    for (const item of lessonKnowledge?.modules?.[n] ?? []) {
      if (item.id === id) return { ...item, module: n };
    }
  }
  return null;
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
