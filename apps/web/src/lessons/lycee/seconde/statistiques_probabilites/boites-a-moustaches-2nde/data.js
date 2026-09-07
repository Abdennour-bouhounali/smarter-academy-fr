/**
 * Données de la leçon « Boîtes à moustaches ».
 *
 * Trois villes, 30 relevés de température à midi (°C) sur un même mois. Les
 * séries sont écrites en clair (et non engendrées) : l'élève doit pouvoir les
 * relire, et les cinq nombres de chacune sont cités dans les corrections.
 *
 * Elles sont choisies pour que la comparaison soit INSTRUCTIVE :
 *  · Brest    — médiane moyenne, très resserrée (climat océanique) ;
 *  · Toulouse — médiane la plus haute, dispersion moyenne ;
 *  · Embrun   — médiane la plus basse mais AMPLITUDE la plus forte, si bien
 *               qu'elle atteint le maximum absolu : « la ville la plus froide »
 *               y connaît pourtant le jour le plus chaud. C'est le contre-exemple
 *               qui interdit de conclure d'une médiane à toutes les valeurs.
 *
 * data.test.js vérifie chacun des cinq nombres cités dans les modules.
 */

/** Brest — océanique : peu d'écart entre les jours. */
export const BREST = [
  14, 15, 15, 16, 16, 16, 17, 17, 17, 17,
  18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
  20, 20, 21, 21, 21, 22, 22, 22, 23, 24,
];

/** Toulouse — plus chaude, dispersion moyenne. */
export const TOULOUSE = [
  16, 17, 18, 19, 19, 20, 20, 21, 21, 22,
  22, 23, 23, 23, 24, 24, 24, 25, 25, 26,
  26, 26, 27, 27, 28, 28, 29, 30, 31, 32,
];

/** Embrun — montagne : médiane basse, mais des extrêmes des deux côtés. */
export const EMBRUN = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  15, 16, 16, 17, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 28, 29, 30, 32, 34, 35,
];

export const VILLES = [
  { id: 'brest', label: 'Brest', values: BREST, color: '#0284c7' },
  { id: 'toulouse', label: 'Toulouse', values: TOULOUSE, color: '#c026d3' },
  { id: 'embrun', label: 'Embrun', values: EMBRUN, color: '#059669' },
];

/** Boîtes de l'atelier (module 5), données par leurs cinq nombres. */
export const ATELIER_BOITES = {
  reponseA: [120, 180, 200, 240, 900],   // temps de réponse serveur A (ms)
  reponseB: [150, 190, 210, 230, 320],   // serveur B
};
