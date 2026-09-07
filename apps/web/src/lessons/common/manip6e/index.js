/**
 * Primitives de manipulation partagées par les leçons de 6e.
 *
 * Deux gestes, deux outils — choisis par la MATHÉMATIQUE, pas par confort :
 *
 *   grandeur continue (une longueur, une position, une part)
 *       → `useDragValue` : on saisit l'élément lui-même et on le déplace.
 *
 *   grandeur discrète (des blocs, des jetons, des objets à compter)
 *       → `DragTray` : on prend un objet et on le pose dans une zone.
 *
 * Aucun des deux n'expose de `disabled` : une manipulation ne se fige jamais
 * après validation de l'étape (règle projet du 2026-09-06). Les deux sont
 * pilotables au clavier.
 */
export { default as useDragValue } from './useDragValue';
export { default as DragTray } from './DragTray';
// La mécanique de `DragTray` sans son rendu : pour les manipulations qui
// dessinent elles-mêmes leur réserve et leurs zones (un plateau de numération
// dont les colonnes empilent des formes), tout en gardant le même contrat de
// geste et d'accessibilité.
export { default as useDragDrop } from './useDragDrop';
