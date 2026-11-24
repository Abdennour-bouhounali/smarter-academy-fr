/** The sentences of lesson `thales-configuration-papillon` that the kit's screens show: the names of its practice levels. */
import { frAll, K } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the river or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « Thalès », « papillon », « sommet », « rapport » — `text.test.js`).
   */
  levels: {
    [K.papillon]: ['Sortie : la largeur du Nil', 'Sortie : les deux rives'],
    [K.calcul]: ['Sortie : le pyramidion', 'Sortie : les morceaux de corde'],
    exam: ['Sortie : tout le Nil', 'Sortie : au rythme du brevet'],
  },
  /** The real-world worlds of the lesson's cases: none. */
  worlds: {},
  /** The summary node of the practice hub. */
  summary: {
    icon: '🏆',
    title: 'Défi du brevet',
    text: 'Des questions des deux clés mêlées, plus vite : la révision avant le brevet.',
  },
  busy: '',
});
