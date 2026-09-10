/**
 * Le seul fichier du frontend qui sache OÙ vit le contenu des exercices.
 *
 * Le glob remonte hors de apps/web parce que content/ est à la racine du
 * dépôt : c'est de la donnée versionnée, lue aussi par Laravel et par le
 * script de validation, pas de la source Vite. Le chemin est laid ; il est
 * confiné ici, et nulle part ailleurs.
 *
 * Chargement PARESSEUX : un exercice n'arrive qu'au moment où l'élève
 * l'ouvre. La bibliothèque grandira — quinze exercices aujourd'hui, des
 * centaines demain — et rien ne doit entrer dans le paquet initial.
 */
const MODULES = import.meta.glob('../../../../../content/practice/**/level-*/*.json');
const INDEX = import.meta.glob('../../../../../content/practice/index.generated.json', { eager: true });

const indexData = Object.values(INDEX)[0]?.default ?? {};

/** niveau → nombre d'exercices, sans ouvrir un seul fichier. */
export function levelCounts(lessonCode) {
  const levels = indexData[lessonCode] ?? {};

  return Object.fromEntries(Object.entries(levels).map(([level, ids]) => [Number(level), ids.length]));
}

/** Les identifiants d'exercice d'un niveau, dans l'ordre d'écriture. */
export function exerciseIdsFor(lessonCode, level) {
  return indexData[lessonCode]?.[String(level)] ?? [];
}

/** Charge un exercice. @returns {Promise<object|null>} */
export async function loadExercise(lessonCode, level, exerciseId) {
  const suffix = `/${lessonCode}/level-${level}/${exerciseId}.json`;
  const key = Object.keys(MODULES).find((path) => path.endsWith(suffix));
  if (!key) return null;
  const mod = await MODULES[key]();

  return mod.default ?? null;
}
