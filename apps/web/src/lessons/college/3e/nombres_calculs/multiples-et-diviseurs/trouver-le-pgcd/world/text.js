/** The sentences of lesson `trouver-le-pgcd` that the kit's screens show: the names of its practice levels. */
import { frAll, nb } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the story or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « commun », « PGCD », « lots identiques », « exposant », « Euclide » — `practice.test.js`).
   */
  levels: {
    'diviseurs-communs': ['Course : les fossés de 90 et 54', 'Course : une pièce par planche'],
    'lots-identiques': ['Course : l’étal du marché'],
    'pgcd-facteurs': [`Course : les fossés de ${nb(1736)} et 980`, 'Course : lire deux produits'],
    euclide: ['Course : l’île des horloges', 'Course : les fossés immenses'],
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
