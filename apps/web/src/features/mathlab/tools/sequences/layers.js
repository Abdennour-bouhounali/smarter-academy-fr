/**
 * LES COUCHES du مختبر المتتاليات — le vocabulaire visuel de l'instrument.
 *
 * Module FEUILLE : il n'importe rien. `presets.js` a besoin de la liste et
 * `sequenceState.js` a besoin des préréglages ; mettre la liste dans l'état
 * créerait un cycle ESM, qui ne casse pas au chargement du module fautif
 * mais plus tard, sur un `Object.keys(undefined)` incompréhensible. C'est la
 * même raison, et la même solution, que `trigonometry/layers.js`.
 *
 * ── Pourquoi ces valeurs d'ouverture (§50) ───────────────────────────────
 * §50 veut que « the mathematics remain the visual hero » et refuse « a
 * dashboard of cards ». §2 veut qu'on voie la suite sous plusieurs formes
 * À LA FOIS. La première seconde doit donc montrer : des termes, un tableau,
 * un graphe — et rien d'autre.
 *
 * Tout ce qui INTERPRÈTE attend d'être demandé : la toile d'araignée, les
 * points fixes, les sommes partielles, les sous-suites, la comparaison. Ce
 * ne sont pas des détails avancés par timidité — ce sont les couches qui
 * dépassent le programme de 4AM (voir §5h.1 de MATH_LAB.md), et la règle de
 * la plateforme est qu'elles existent sans jamais prendre le premier écran.
 *
 * `differences` est la SEULE lecture allumée d'emblée, et c'est un choix de
 * programme : « الفروق المتتالية » est le geste du manuel de 4AM (LP 2.1).
 * L'élève voit donc, sans rien cliquer, que la différence est constante.
 */

export const DEFAULT_LAYERS = Object.freeze({
  // Le repère et les termes — la suite elle-même.
  points: true,        // les points (n, u(n))
  stems: true,         // le trait vertical qui les relie à l'axe (§18)
  connect: false,      // relier les points : FAUX par défaut, §18 l'exige
  grid: true,
  labels: true,        // u(0), u(1)… sur le graphe

  // Les lectures sur les termes.
  table: true,
  differences: true,   // le geste du programme de 4AM (LP 2.1)
  ratios: false,
  sums: false,         // §36
  secondDifferences: false,  // §41

  // Ce qui interprète — au-delà du programme, donc éteint (§5h.1).
  cobweb: false,       // §9
  fixedPoints: false,  // §10
  bounds: false,       // §22
  evenOdd: false,      // §23
  compare: false,      // §33
  continuous: false,   // §18 : la fonction continue derrière une explicite
});

export const LAYER_KEYS = Object.freeze(Object.keys(DEFAULT_LAYERS));

/**
 * L'ordre des bascules dans le panneau, groupées comme on les pense : la
 * suite, ce qu'on lit sur elle, ce qui l'interprète. Suivre l'ordre
 * alphabétique de l'objet ferait lire « bounds, cobweb, compare… » —
 * l'ordre du code, pas celui de l'élève.
 */
export const LAYER_GROUPS = Object.freeze([
  { id: 'plot', keys: ['points', 'stems', 'connect', 'labels', 'grid', 'continuous'] },
  { id: 'readings', keys: ['table', 'differences', 'ratios', 'secondDifferences', 'sums'] },
  { id: 'analysis', keys: ['cobweb', 'fixedPoints', 'bounds', 'evenOdd', 'compare'] },
]);
