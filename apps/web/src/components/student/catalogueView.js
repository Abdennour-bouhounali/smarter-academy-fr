import { useCallback, useState } from 'react';
import { storage } from '../../utils/storage';

/**
 * La VUE du catalogue de leçons — le choix de l'élève (ou de l'enseignant)
 * sur /courses, « دروسي » (/espace/cours) et « استكشاف » (/espace/explorer,
 * /enseignant/cours). Deux axes indépendants :
 *
 *   group  — comment la sélection est ORGANISÉE
 *     'units'    les cartes d'unité du manuel (le niveau الوحدة, défaut) ;
 *     'chapters' ميدان → وحدة → ses leçons, toutes visibles sur la page ;
 *     'all'      toutes les leçons à plat, dans l'ordre du catalogue.
 *   layout — comment chaque élément est DESSINÉ
 *     'grid'     des cartes ;
 *     'rows'     des lignes compactes.
 *
 * Une préférence d'interface, pas une donnée d'élève : elle vit dans
 * `storage` (non préfixé par utilisateur, comme les filtres de /courses) et
 * une valeur absente ou illisible retombe sur le défaut.
 */
const CATALOGUE_GROUPS = ['units', 'chapters', 'all'];
const CATALOGUE_LAYOUTS = ['grid', 'rows'];
export const DEFAULT_CATALOGUE_VIEW = Object.freeze({ group: 'units', layout: 'grid' });
export const CATALOGUE_VIEW_STORAGE_KEY = 'sa.catalogue.view';

export function normalizeCatalogueView(value) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    group: CATALOGUE_GROUPS.includes(v.group) ? v.group : DEFAULT_CATALOGUE_VIEW.group,
    layout: CATALOGUE_LAYOUTS.includes(v.layout) ? v.layout : DEFAULT_CATALOGUE_VIEW.layout,
  };
}

export function readCatalogueView() {
  try {
    return normalizeCatalogueView(JSON.parse(storage.getItem(CATALOGUE_VIEW_STORAGE_KEY) ?? 'null'));
  } catch {
    return { ...DEFAULT_CATALOGUE_VIEW };
  }
}

export function useCatalogueView() {
  const [view, setViewState] = useState(readCatalogueView);
  const setView = useCallback((patch) => {
    setViewState((prev) => {
      const next = normalizeCatalogueView({ ...prev, ...patch });
      storage.setItem(CATALOGUE_VIEW_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return [view, setView];
}

/** L'unité de chaque leçon visible (synthèse comprise), par identifiant. */
export function unitByLessonId(chapters) {
  const map = new Map();
  for (const unit of (chapters ?? []).flatMap((c) => c.units ?? [])) {
    for (const l of [...unit.lessons, unit.synthesis].filter(Boolean)) map.set(l.id, unit);
  }
  return map;
}

/**
 * La vue « حسب الميادين » : pour chaque ميدان visible, ses unités dans
 * l'ordre du manuel — chacune avec ses leçons PUIS sa synthèse — et enfin
 * les leçons hors unité (`unit: null`). Seules les leçons de `lessons`
 * apparaissent ; un ميدان ou une unité sans leçon visible disparaît.
 *
 * @returns {Array<{ chapter, blocks: Array<{ unit: object|null, lessons: Array }> }>}
 */
export function groupLessonsByChapter(chapters, lessons) {
  const visible = new Set((lessons ?? []).map((l) => l.id));
  return (chapters ?? []).map((chapter) => {
    const inUnit = new Set();
    const blocks = (chapter.units ?? []).map((unit) => {
      const own = [...unit.lessons, unit.synthesis].filter(Boolean);
      own.forEach((l) => inUnit.add(l.id));
      return { unit, lessons: own.filter((l) => visible.has(l.id)) };
    });
    const rest = (chapter.lessons ?? []).filter((l) => visible.has(l.id) && !inUnit.has(l.id));
    if (rest.length) blocks.push({ unit: null, lessons: rest });
    return { chapter, blocks: blocks.filter((b) => b.lessons.length > 0) };
  }).filter((section) => section.blocks.length > 0);
}
