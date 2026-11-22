/**
 * Le niveau الوحدة dans une grille de leçons — la MÊME règle pour la page
 * des cours (/courses), « دروسي » (/espace/cours) et « استكشاف »
 * (/espace/explorer) : dans un ميدان porté par le manuel, l'élève choisit
 * d'abord une UNITÉ (carte menant à sa page), et les leçons hors unité
 * restent des cartes de leçon. Un ميدان découpé « un sujet = une leçon »
 * n'a pas d'unité : `null`, la grille garde ses cartes de leçon.
 *
 * @param {Array} chapters  les ميادين visibles (un seul, ou tous)
 * @param {Array} lessons   les leçons visibles (déjà filtrées par ميدان)
 * @returns {{ units: Array, rest: Array } | null}
 */
export function groupLessonsByUnit(chapters, lessons) {
  const units = (chapters ?? []).flatMap((c) => c.units ?? []);
  if (units.length === 0) return null;
  const inUnit = new Set(units.flatMap((u) => [...u.lessons.map((l) => l.id), u.synthesis?.id].filter(Boolean)));
  return { units, rest: (lessons ?? []).filter((l) => !inUnit.has(l.id)) };
}
