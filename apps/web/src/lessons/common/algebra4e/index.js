/**
 * Infrastructure algébrique partagée des leçons de 4e.
 *
 * Un seul noyau mathématique (`exprCore`, pur et testé) et une seule
 * écriture (`exprTex`), dont dérivent les deux manipulations : les tuiles
 * algébriques (« Calcul littéral ») et la balance (« Équations »).
 *
 * Les deux leçons manipulent le MÊME objet — une expression du premier
 * degré — et il n'en existe qu'une définition. Une manipulation propre à
 * une leçon reste dans son dossier `components/`.
 */
export * from './exprCore';
export * from './exprTex';
export { default as TileBoard, TileLegend } from './TileBoard';
export { default as BalanceScale } from './BalanceScale';
export { default as FractionView } from './FractionView';
export { default as FractionField } from './FractionField';
export { balanceGeometry, MAX_TILT } from './balanceGeometry';
