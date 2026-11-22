/**
 * Le registre des figures du labo des énigmes : UN fichier par figure, nommé comme
 * `figure.component` / `whiteboard.seed` du contenu (FourArcs.jsx…). Aucune liste à
 * tenir à jour : le glob les trouve, chacune devient un lot paresseux À PART, chargé
 * seulement par le défi qui l'affiche (BUNDLE_BOUNDARIES.md : ce glob vit sous la
 * frontière paresseuse de la route /espace/tafkir).
 *
 * Contrat d'une figure (docs/architecture/THINKING_LAB.md §7) :
 *   export const LAYERS       toutes les couches que la figure sait dessiner ;
 *   export const BASE_LAYERS  celles de l'énoncé (avant toute relecture) ;
 *   export default function Figure({ layers, props, ariaLabel })  →  un <svg> dessiné en code,
 *     paramétré par `props` (les nombres de l'élève), aucune image matricielle,
 *     les lettres et nombres en texte LTR.
 * Les couches d'un pas de relecture (`replay[i].layers`) sont un sous-ensemble de LAYERS
 * (figures.test.js le vérifie pour chaque défi).
 */
const MODULES = import.meta.glob(['./*.jsx', '!./*.test.jsx']);

export const FIGURE_NAMES = Object.keys(MODULES).map((path) => path.slice(2, -4)).sort();

/** @returns {Promise<{default: Function, LAYERS: string[], BASE_LAYERS: string[]}>} */
export function loadFigure(name) {
  const load = MODULES[`./${name}.jsx`];
  return load ? load() : Promise.reject(new Error(`figure inconnue : ${name}`));
}
