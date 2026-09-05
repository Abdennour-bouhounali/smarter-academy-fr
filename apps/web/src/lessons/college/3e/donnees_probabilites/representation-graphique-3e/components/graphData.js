/**
 * graphData — les jeux de données de la leçon.
 *
 * Chaque série est choisie pour ce qu'elle rend visible :
 *  - CROISSANCE : une plante mesurée chaque semaine, valeurs décimales, dont
 *    l'échelle « naturelle » n'est pas 1 — c'est ce qui oblige à compter entre
 *    les graduations (module 3).
 *  - TEMPERATURE : une série resserrée (17,5 → 19,5) dont l'amplitude relative
 *    est faible : à l'échelle complète elle paraît plate, tronquée elle paraît
 *    spectaculaire. Le même tableau raconte deux histoires (modules 2 et 6).
 *  - RESERVOIR : une vidange, données continues, à relier.
 *  - VENTES : des quantités discrètes, à NE PAS relier.
 */

export const CROISSANCE = {
  id: 'croissance',
  title: 'Hauteur d’un plant de tournesol',
  xLabel: 'semaine',
  yLabel: 'cm',
  kind: 'continu',
  rows: [
    { x: 1, y: 7.5 },
    { x: 2, y: 15 },
    { x: 3, y: 22.5 },
    { x: 4, y: 30 },
  ],
};

export const TEMPERATURE = {
  id: 'temperature',
  title: 'Température de la salle, heure par heure',
  xLabel: 'h',
  yLabel: '°C',
  kind: 'continu',
  rows: [
    { x: 1, y: 17.5 },
    { x: 2, y: 18 },
    { x: 3, y: 19 },
    { x: 4, y: 19.5 },
  ],
};

export const RESERVOIR = {
  id: 'reservoir',
  title: 'Volume restant dans le réservoir',
  xLabel: 'min',
  yLabel: 'L',
  kind: 'continu',
  rows: [
    { x: 0, y: 60 },
    { x: 2, y: 45 },
    { x: 4, y: 30 },
    { x: 6, y: 15 },
  ],
};

export const VENTES = {
  id: 'ventes',
  title: 'Cahiers vendus par jour',
  xLabel: 'jour',
  yLabel: 'cahiers',
  kind: 'discret',
  rows: [
    { x: 1, y: 12 },
    { x: 2, y: 8 },
    { x: 3, y: 15 },
    { x: 4, y: 10 },
  ],
};

/**
 * BATTERIE — la charge d'un téléphone, heure par heure (module 1).
 * Choisie pour que TOUT tombe sur une graduation (pas de 20 %) : au module 1,
 * l'objet est la correspondance ligne ↔ point et la tendance qui émerge, pas
 * la difficulté du placement entre deux graduations (c'est le module 3).
 * La baisse est régulière (−20 % par heure) : le trait prolongé atteint 0 %
 * à 5 h, ce que la courbe prédit et que le tableau ne dit pas.
 */
export const BATTERIE = {
  id: 'batterie',
  title: 'Charge du téléphone, heure par heure',
  xLabel: 'h',
  yLabel: '%',
  kind: 'continu',
  rows: [
    { x: 0, y: 100 },
    { x: 1, y: 80 },
    { x: 2, y: 60 },
    { x: 3, y: 40 },
    { x: 4, y: 20 },
  ],
};
