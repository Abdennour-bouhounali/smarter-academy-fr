/** The sentences of lesson `multiples-et-diviseurs-communs` that the kit's screens show: the names of its practice levels. */
import { frAll } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the story or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « commun », « multiple », « exposant », « facteurs », « rendez-vous », « cycle » —
   * `practice.test.js`).
   */
  levels: {
    'pilier-commun': ['Course : le ponton des bâtisseurs', 'Course : les planches du chantier'],
    'ppcm-facteurs': ['Course : l’île des brumes', 'Course : les nombres décomposés'],
    'traduire-rendez-vous': ['Course : l’île des vigies', 'Course : les roues et les bus'],
    'cinq-equipes': ['Course : le calendrier des balises', 'Course : les jours de repos'],
    exam: ['Course : tout le chemin', 'Course : au rythme du brevet'],
  },
  /** The real-world worlds of the lesson's cases: none. */
  worlds: {},
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'Défi du brevet',
    text: 'Des questions des quatre clés mêlées, plus vite : la révision avant le brevet.',
  },
  busy: '',
});
