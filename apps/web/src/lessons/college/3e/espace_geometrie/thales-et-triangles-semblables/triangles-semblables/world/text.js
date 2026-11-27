/** The sentences of lesson `triangles-semblables` that the kit's screens show: the names of its practice levels. */
import { frAll, K } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the river or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « semblables », « côtés », « angles », « homologues », « proportionnels » — `text.test.js`).
   */
  levels: {
    [K.cotes]: ['Sortie : le chantier', 'Sortie : les tracés sur le sable'],
    [K.angles]: ['Sortie : le pyramidion', 'Sortie : les blocs de pierre'],
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
