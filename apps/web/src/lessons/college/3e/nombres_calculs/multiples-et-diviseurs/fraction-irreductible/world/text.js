/** The sentences of lesson `fraction-irreductible` that the kit's screens show: the names of its practice levels. */
import { frAll } from './math';

export const TEXT = frAll({
  /**
   * One name per level of the practice ladder, by node — each says a place of the story or what ITS waves ask
   * (`practice.js › PRACTICE_NODES`). The hub lists them before the node's key is forged: a name never states the rule
   * nor the key's name (no « facteur », « barrer », « irréductible », « PGCD », « résultat » — `practice.test.js`).
   */
  levels: {
    'simplifier-facteurs': ['Course : les pancartes des ponts'],
    irreductible: ['Course : le poteau de lanterne'],
    'diviser-par-le-pgcd': ['Course : les ponts longs', 'Course : l’atelier du forgeron'],
    'resultat-irreductible': ['Course : les équipes de la jetée', 'Course : sommes et produits'],
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
