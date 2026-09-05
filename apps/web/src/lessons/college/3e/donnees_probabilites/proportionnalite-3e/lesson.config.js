/**
 * Proportionnalité (3e) — « Ce qui ne change pas quand tout grandit ».
 *
 * Learning Points (coursesData.js, clé '3e_proportionnalite', dans l'ordre de
 * `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_proportionnalite-3e_P1  — Reconnaître une situation de proportionnalité
 *   3e_proportionnalite-3e_P2  — Identifier les grandeurs qui interviennent dans une situation
 *   3e_proportionnalite-3e_P3  — Comprendre la relation multiplicative entre deux grandeurs
 *   3e_proportionnalite-3e_P4  — Déterminer un coefficient de proportionnalité
 *   3e_proportionnalite-3e_P5  — Compléter un tableau de proportionnalité
 *   3e_proportionnalite-3e_P6  — Utiliser le passage par l'unité lorsque cela est pertinent
 *   3e_proportionnalite-3e_P7  — Utiliser un coefficient multiplicateur pour résoudre une situation
 *   3e_proportionnalite-3e_P8  — Résoudre des problèmes de proportionnalité avec des pourcentages
 *   3e_proportionnalite-3e_P9  — Utiliser la proportionnalité dans des situations géométriques
 *   3e_proportionnalite-3e_P10 — Utiliser la proportionnalité dans des situations scientifiques
 *   3e_proportionnalite-3e_P11 — Passer entre tableau, représentation graphique et situation concrète
 *   3e_proportionnalite-3e_P12 — Vérifier la cohérence d'un résultat de proportionnalité
 *
 * IDÉE CENTRALE — dans une situation de proportionnalité, on passe TOUJOURS
 * d'une grandeur à l'autre en multipliant par le même nombre. Ce nombre — le
 * coefficient — est ce qui ne change pas quand tout grandit. L'élève doit
 * l'éprouver (la recette pour 7) avant qu'on le nomme, puis découvrir que
 * toutes les méthodes (unité, facteur, coefficient, produit en croix) sont
 * quatre chemins vers la même case, et que l'aire, elle, grandit en k².
 *
 * CE QUI DISTINGUE CETTE LEÇON de « fonctions-lineaires-3e » (la balance du
 * marchand) : ici on ne parle pas de fonction ; l'objet d'étude est le
 * coefficient et ses méthodes, puis les transferts propres à la 3e —
 * agrandissement / réduction (k, k², k³), Thalès, pourcentages et sciences.
 *
 * FIL ROUGE : la grande tablée — une recette pour 2 à adapter pour 7, puis
 * tout ce qu'il faut agrandir, acheter et vérifier pour la fête.
 * Voir docs/lessons/3E_PROPORTIONNALITE_SPEC.md.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/proportionnalite-3e';

export const LESSON_CONFIG = {
  id: 'proportionnalite-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Proportionnalité',
  description:
    "Adapter une recette pour 7 personnes et sentir l'invariance multiplicative, trouver le coefficient caché, choisir le bon chemin vers la case vide, agrandir une figure sans se tromper d'aire — et vérifier chaque résultat.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 84,
  skills: [
    'Reconnaître une situation de proportionnalité et ses grandeurs',
    'Comprendre la relation multiplicative et déterminer le coefficient',
    'Compléter un tableau : unité, facteur, coefficient, produit en croix',
    'Utiliser un coefficient multiplicateur et les pourcentages',
    'Agrandir ou réduire une figure : longueurs, aires, volumes, Thalès',
    'Mobiliser la proportionnalité en sciences : vitesse, masse volumique, échelle',
    'Passer du tableau au graphique et à la situation',
    "Vérifier la cohérence d'un résultat",
  ],
  teachingScope: {
    include: [
      'Coefficient de proportionnalité et rapports constants',
      "Passage par l'unité, facteur entre colonnes, produit en croix",
      'Pourcentages : coefficient multiplicateur ×(1 + t/100)',
      'Agrandissement / réduction : longueurs ×k, aires ×k², volumes ×k³ ; lien avec Thalès',
      'Vitesse, masse volumique, échelle ; tableau ↔ graphique ↔ situation',
    ],
    exclude: [
      'Fonctions linéaires et notation f(x) (leçon dédiée)',
      'Proportionnalité inverse',
      'Fonction logarithme',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-recette', path: `${LESSON_BASE_PATH}/la-recette`,
      title: 'La recette pour 7',
      desc: 'Fais varier le nombre de convives : les quantités grandissent, un nombre ne bouge pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P1', '3e_proportionnalite-3e_P2', '3e_proportionnalite-3e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Adapter la recette',
    },
    {
      id: '02', number: 2, slug: 'le-nombre-cache', path: `${LESSON_BASE_PATH}/le-nombre-cache`,
      title: 'Le nombre caché',
      desc: 'Touche un couple, lis son rapport : le coefficient apparaît — ou pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P4', '3e_proportionnalite-3e_P3', '3e_proportionnalite-3e_P1'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Trouver le coefficient',
    },
    {
      id: '03', number: 3, slug: 'quatre-chemins', path: `${LESSON_BASE_PATH}/quatre-chemins`,
      title: 'Quatre chemins vers la case vide',
      desc: 'Unité, facteur, coefficient, produit en croix : tous mènent à la même case.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P5', '3e_proportionnalite-3e_P6', '3e_proportionnalite-3e_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Choisir un chemin',
    },
    {
      id: '04', number: 4, slug: 'agrandir-sans-se-tromper', path: `${LESSON_BASE_PATH}/agrandir-sans-se-tromper`,
      title: 'Agrandir sans se tromper',
      desc: 'Règle le rapport k : les côtés suivent, l’aire non — elle fait k².',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P9', '3e_proportionnalite-3e_P12'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Agrandir',
    },
    {
      id: '05', number: 5, slug: 'pourcentages-et-coefficient', path: `${LESSON_BASE_PATH}/pourcentages-et-coefficient`,
      title: 'Pourcentages et coefficient multiplicateur',
      desc: '+20 %, c’est ×1,2 ; −25 %, c’est ×0,75 — et l’aller-retour ne revient pas au départ.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P7', '3e_proportionnalite-3e_P8', '3e_proportionnalite-3e_P12'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Formaliser',
    },
    {
      id: '06', number: 6, slug: 'le-labo-des-sciences', path: `${LESSON_BASE_PATH}/le-labo-des-sciences`,
      title: 'Le labo des sciences',
      desc: 'Vitesse, masse volumique, échelle : tableau, graphique, situation — et un résultat à vérifier.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_proportionnalite-3e_P10', '3e_proportionnalite-3e_P11', '3e_proportionnalite-3e_P12'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Expérimenter',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-grande-tablee', path: `${LESSON_BASE_PATH}/mission-finale-la-grande-tablee`,
      title: '🏆 Mission finale : la grande tablée',
      desc: 'Dix épreuves pour organiser la fête sans une erreur de proportion.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
