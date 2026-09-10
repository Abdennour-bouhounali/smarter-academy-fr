/**
 * Infrastructure partagée « statistiques & probabilités » des leçons de 2nde.
 *
 * Un seul noyau de calcul (statsUtils / percentUtils / randomUtils, purs et
 * testés) et un jeu de représentations (nuage, boîte, histogramme, tableau
 * croisé, population, arbre, fréquences) réutilisés par les onze leçons —
 * pas un moteur par leçon. Les manipulations propres à une leçon restent
 * dans son dossier `components/`.
 */
export * from './statsUtils';
export * from './percentUtils';
export * from './randomUtils';
export * from './randomVariable';
export * from './binomial';
export { default as DraggableSplitBar } from './DraggableSplitBar';
export { default as DotPlot } from './DotPlot';
export { default as BoxPlot } from './BoxPlot';
export { default as Histogram } from './Histogram';
export { default as CrossTableView } from './CrossTableView';
export { default as PopulationBar } from './PopulationBar';
export { default as ProbabilityTree } from './ProbabilityTree';
export { default as FrequencyChart } from './FrequencyChart';
