/**
 * La station météo du collège — jeu de données unique de la leçon
 * Graphiques (module 1 → synthèse du boss), plus le sondage du club utilisé
 * pour le diagramme circulaire.
 *
 * Choix des nombres (vérifiés numériquement avant écriture des modules) :
 *  - un maximum franc (jeudi, 24 °C) et un minimum franc (mardi, 11 °C),
 *    sans ex æquo : « le plus haut » et « le plus bas » n'ont qu'une réponse ;
 *  - une baisse marquée puis une remontée, pour que la lecture d'évolution
 *    ait vraiment quelque chose à raconter ;
 *  - la plus forte hausse (mercredi → jeudi, +7) n'est PAS la plus haute
 *    valeur : le module 5 s'appuie sur cette distinction.
 */
import { makeSeries } from './chartUtils';

export const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
export const TEMPERATURES = [16, 11, 17, 24, 20];

/** La série de référence de la leçon. */
export const METEO = makeSeries({
  categories: JOURS,
  values: TEMPERATURES,
  unit: '°C',
  label: 'Température à midi',
});

/** Série vierge : point de départ de la construction (module 3). */
export const METEO_VIDE = makeSeries({
  categories: JOURS,
  values: JOURS.map(() => 0),
  unit: '°C',
  label: 'Température à midi',
});

/** Sondage du club : parts d'un tout → diagramme circulaire. */
export const SONDAGE = makeSeries({
  categories: ['Foot', 'Danse', 'Échecs', 'Théâtre'],
  values: [12, 6, 3, 3],
  unit: 'élèves',
  label: 'Activité choisie',
});

/** Fréquentation du CDI : sert aux comparaisons du module 4. */
export const CDI = makeSeries({
  categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
  values: [30, 45, 15, 40, 25],
  unit: 'élèves',
  label: 'Élèves au CDI',
});
