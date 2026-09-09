/**
 * Statistiques — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `statistiques` du domaine « Données et probabilités », applicable à
 * la 5e à la rentrée 2026-2027.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon
 * (clé catalogue '5e_statistiques', append-only) :
 *
 *   5e_statistiques-5e_P1  Recueillir et organiser des données dans un tableau
 *   5e_statistiques-5e_P2  Calculer un effectif
 *   5e_statistiques-5e_P3  Calculer une fréquence
 *   5e_statistiques-5e_P4  Lire et construire un diagramme en barres
 *   5e_statistiques-5e_P5  Lire et construire un diagramme circulaire
 *   5e_statistiques-5e_P6  Calculer une moyenne simple
 *   5e_statistiques-5e_P7  Interpréter une série de données dans son contexte
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : des données brutes ne disent
 * rien. Ce sont les GESTES qu'on leur applique — ranger, compter, comparer au
 * total, dessiner, résumer — qui les font parler. Chaque geste répond à une
 * question qu'on ne pouvait pas poser au geste précédent, et aucun ne remplace
 * les données : à la fin, la moyenne 2,08 ne dit toujours pas que Noé a lu 5
 * livres. C'est ce dernier point qui fait l'interprétation (M7).
 *
 * FIL NARRATIF — une seule enquête, du début à la fin. « Combien de livres
 * as-tu lus pendant les vacances ? » posée à 12 élèves. Les mêmes 12 réponses
 * traversent les huit modules et se transforment sous les yeux de l'élève :
 * liste en vrac (M1) → tableau (M2) → fréquences (M3) → barres (M4) →
 * secteurs (M5) → moyenne (M6) → interprétation (M7).
 *
 * LA MANIPULATION CENTRALE (§6bis — chaque module ouvre sur un geste) : le
 * jeu de données est VIVANT. L'élève ajoute un élève, en supprime un, trie la
 * liste, change de représentation — et voit le tableau, le graphique et la
 * moyenne se recalculer. C'est là que « trier ne change pas la moyenne » et
 * « une valeur extrême tire la moyenne » se découvrent, au lieu d'être dites.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : la médiane, les quartiles,
 * l'étendue et l'écart type (4e et 3e) ; les séries regroupées en classes et
 * l'histogramme (3e) ; la moyenne pondérée par des coefficients (4e) ; la
 * comparaison de deux séries (4e). La garde est exécutable : le noyau de
 * calcul lève sur `assertScope5e('mediane')` — cf. components/statistiques.js.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/donnees_probabilites/statistiques-5e';

export const LESSON_CONFIG = {
  id: 'statistiques-5e',
  sequentialUnlock: true,
  title: 'Statistiques',
  description:
    "Mener une vraie enquête d’un bout à l’autre : poser une question, récolter douze réponses en vrac, les ranger dans un tableau, compter les effectifs, les comparer au total avec des fréquences, choisir entre barres et secteurs, résumer par une moyenne — et finir par se demander ce que ce seul nombre ne dit pas.",
  level: 'college',
  grade: '5e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 70,
  skills: [
    'Recueillir et organiser des données dans un tableau',
    'Calculer un effectif',
    'Calculer une fréquence',
    'Lire et construire un diagramme en barres',
    'Lire et construire un diagramme circulaire',
    'Calculer une moyenne simple',
    'Interpréter une série de données dans son contexte',
  ],
  teachingScope: {
    include: [
      'Une question d’enquête, et les données brutes qu’elle produit',
      'Ranger des données brutes dans un tableau',
      'L’effectif d’une valeur, et l’effectif total',
      'La fréquence : un effectif comparé au total, en fraction et en pourcentage',
      'Le diagramme en barres : comparer des effectifs',
      'Le diagramme circulaire : voir des parts d’un tout',
      'La moyenne comme partage équitable',
      'Interpréter : ce que la moyenne dit, et ce qu’elle cache',
    ],
    exclude: [
      'La médiane, les quartiles et l’étendue (4e et 3e)',
      'L’écart type et la comparaison de deux séries (3e)',
      'Les séries regroupées en classes et l’histogramme (3e)',
      'La moyenne pondérée par des coefficients (4e)',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes venues de la 6e et toutes diagnostiquées par le
  // module 0 : lire un tableau, lire un graphique, la division-partage, et
  // la fraction comme part d'un tout.
  priorKnowledge: [
    'lire-tableau', 'lire-graphique', 'division-partage', 'fraction-part',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'l-enquete-en-vrac', path: `${LESSON_BASE_PATH}/l-enquete-en-vrac`,
      title: 'L’enquête en vrac', desc: 'Douze réponses en désordre. Range-les toi-même, et vois ce qui apparaît.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_statistiques-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Ranger les réponses',
    },
    {
      id: '02', number: 2, slug: 'compter-sans-se-tromper', path: `${LESSON_BASE_PATH}/compter-sans-se-tromper`,
      title: 'Compter sans se tromper', desc: 'Le tableau se remplit sous tes doigts : chaque case est un effectif.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_statistiques-5e_P2', '5e_statistiques-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Remplir le tableau',
    },
    {
      id: '03', number: 3, slug: 'comparer-au-total', path: `${LESSON_BASE_PATH}/comparer-au-total`,
      title: 'Comparer au total', desc: '4 élèves sur 12, est-ce beaucoup ? Change l’effectif total et regarde.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_statistiques-5e_P3'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Calculer les fréquences',
    },
    {
      id: '04', number: 4, slug: 'le-dataset-vivant', path: `${LESSON_BASE_PATH}/le-dataset-vivant`,
      title: 'Le jeu de données vivant', desc: 'Ajoute, supprime, trie : le graphique bouge en direct. Qu’est-ce qui change vraiment ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_statistiques-5e_P4', '5e_statistiques-5e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Manipuler les données',
    },
    {
      id: '05', number: 5, slug: 'barres-ou-camembert', path: `${LESSON_BASE_PATH}/barres-ou-camembert`,
      title: 'Barres ou camembert ?', desc: 'Deux dessins des mêmes données. Chacun répond à une question — pas la même.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_statistiques-5e_P5', '5e_statistiques-5e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Choisir le graphique',
    },
    {
      id: '06', number: 6, slug: 'le-partage-equitable', path: `${LESSON_BASE_PATH}/le-partage-equitable`,
      title: 'Le partage équitable', desc: 'Redistribue les livres pour que tout le monde en ait autant. Ce nombre a un nom.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_statistiques-5e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Partager',
    },
    {
      id: '07', number: 7, slug: 'ce-que-la-moyenne-cache', path: `${LESSON_BASE_PATH}/ce-que-la-moyenne-cache`,
      title: 'Ce que la moyenne cache', desc: 'Deux classes, la même moyenne, et pourtant rien à voir. Lis au-delà du nombre.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_statistiques-5e_P7', '5e_statistiques-5e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Interpréter',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-l-enquete-complete', path: `${LESSON_BASE_PATH}/mission-finale-l-enquete-complete`,
      title: '🏆 Mission finale : l’enquête complète', desc: 'Dix épreuves pour mener une enquête de la question à l’interprétation.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
