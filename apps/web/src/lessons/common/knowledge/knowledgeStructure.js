import { CATEGORIES } from './KnowledgeMap';

/**
 * HIÉRARCHIE de la carte — dérivée des données existantes, sans nouveau
 * modèle à remplir par les leçons.
 *
 * Les six catégories de `CATEGORIES` portent déjà un RÔLE épistémique ; on les
 * regroupe en trois strates qui racontent la structure mathématique plutôt
 * qu'une liste plate :
 *
 *   IDÉES        concepts, vocabulaire   ← de quoi on parle
 *   PROPRIÉTÉS   regles, formules        ← ce qui est toujours vrai
 *   FAIRE        methodes                ← comment on s'en sert
 *
 * « À mémoriser » (memoriser) n'est pas une strate : c'est une MISE EN AVANT
 * transversale, affichée en tête et signalée sur les items concernés.
 *
 * Aucune leçon n'a à déclarer quoi que ce soit de plus : `type` et `module`
 * existent déjà. Voir docs/architecture/KNOWLEDGE_MAP.md.
 */

/** Strates, dans l'ordre de lecture. `cats` = ids de CATEGORIES. */
export const STRATA = [
  {
    id: 'idees',
    label: 'IDÉES',
    caption: 'De quoi on parle',
    cats: ['concepts', 'vocabulaire'],
    accent: 'blue',
  },
  {
    id: 'proprietes',
    label: 'PROPRIÉTÉS',
    caption: "Ce qui est toujours vrai",
    cats: ['regles', 'formules'],
    accent: 'orange',
  },
  {
    id: 'faire',
    label: 'MÉTHODES',
    caption: "Comment s'en servir",
    cats: ['methodes'],
    accent: 'green',
  },
];

/** La catégorie mise en avant, hors strates. */
export const HIGHLIGHT_CAT = 'memoriser';

const catById = (id) => CATEGORIES.find((c) => c.id === id);

/**
 * Structure hiérarchique des items courants :
 *
 *   { highlight: item[], strata: [{ ...strate, groups: [{ category, items }], count }] }
 *
 * Les groupes et strates vides sont omis — la carte d'un élève au module 1
 * ne montre pas six rubriques vides.
 */
export function buildStructure(items = []) {
  const highlight = items.filter((i) => i.type === HIGHLIGHT_CAT);

  const strata = STRATA.map((s) => {
    const groups = s.cats
      .map((cid) => ({ category: catById(cid), items: items.filter((i) => i.type === cid) }))
      .filter((g) => g.category && g.items.length > 0);
    return { ...s, groups, count: groups.reduce((n, g) => n + g.items.length, 0) };
  }).filter((s) => s.count > 0);

  return { highlight, strata };
}

/**
 * Fil de progression : combien d'items chaque module a apportés, dans l'ordre.
 * Alimente l'indicateur « ta carte s'enrichit à chaque module ».
 */
export function progressionByModule(items = []) {
  const byModule = new Map();
  for (const it of items) {
    const m = Number(it.module);
    if (!Number.isFinite(m)) continue;
    byModule.set(m, (byModule.get(m) ?? 0) + 1);
  }
  return [...byModule.entries()].sort((a, b) => a[0] - b[0]).map(([module, count]) => ({ module, count }));
}
