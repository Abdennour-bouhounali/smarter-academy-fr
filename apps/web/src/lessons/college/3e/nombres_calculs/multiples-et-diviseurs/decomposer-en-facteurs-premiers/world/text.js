/** The sentences of lesson `decomposer-en-facteurs-premiers` that the kit's screens show: the names of its practice levels. */
import { frAll } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the story or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « facteur premier », « puissance », « s’arrêter », « tableur » — `practice.test.js`).
   */
  levels: {
    'plus-petit-premier': ['Course : les fossés de 60 et 72', 'Course : le morceau qui manque'],
    puissances: ['Course : l’île des enclumes', 'Course : lire un produit'],
    arret: ['Course : 91 et 97', 'Course : un nombre qui ne se casse pas'],
    tableur: ['Course : l’île des lanternes'],
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
