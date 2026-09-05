/**
 * Fonctions linéaires (3e) — « La droite à pivot ».
 *
 * Learning Points (coursesData.js, clé '3e_fonctions_lineaires', dans l'ordre
 * de `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_fonctions-lineaires-3e_P1  — Reconnaître une fonction linéaire
 *   3e_fonctions-lineaires-3e_P2  — Comprendre la forme f(x)=ax
 *   3e_fonctions-lineaires-3e_P3  — Identifier le coefficient
 *   3e_fonctions-lineaires-3e_P4  — Calculer l'image d'un nombre
 *   3e_fonctions-lineaires-3e_P5  — Construire un tableau de valeurs
 *   3e_fonctions-lineaires-3e_P6  — Représenter graphiquement
 *   3e_fonctions-lineaires-3e_P7  — Comprendre que la droite passe par l'origine
 *   3e_fonctions-lineaires-3e_P8  — Relier à une situation de proportionnalité
 *   3e_fonctions-lineaires-3e_P9  — Interpréter le coefficient a concrètement
 *   3e_fonctions-lineaires-3e_P10 — Déterminer une fonction linéaire à partir de données
 *   3e_fonctions-lineaires-3e_P11 — Résoudre un problème
 *
 * IDÉE CENTRALE — une fonction linéaire EST une situation de proportionnalité
 * écrite autrement. Le coefficient a est le coefficient de proportionnalité :
 * le prix au kilo, la vitesse, le taux. La leçon ne pose donc pas f(x) = ax
 * comme une formule neuve, elle la fait reconnaître dans ce que l'élève sait
 * déjà faire depuis la 6e.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE « fonctions-3e » : là-bas, on découvrait la
 * notion de fonction et on classait les familles. Ici, on ne regarde QUE les
 * linéaires, et l'objet d'étude est le coefficient lui-même — ce qu'il fait à
 * la droite, ce qu'il vaut dans une situation, comment le retrouver.
 *
 * INVARIANT SIGNATURE : quand a change, la droite pivote AUTOUR DE L'ORIGINE.
 * Le point (0 ; 0) ne bouge jamais — c'est ce qui se voit, et c'est exactement
 * ce que « pas de terme constant » veut dire.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/fonctions-lineaires-3e';

export const LESSON_CONFIG = {
  id: 'fonctions-lineaires-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Fonctions linéaires',
  description:
    "Reconnaître qu'une situation de proportionnalité s'écrit f(x) = ax, faire pivoter la droite autour de l'origine pour comprendre ce que fait le coefficient, et retrouver a à partir d'un point, d'un tableau ou d'un graphique.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 5,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 58,
  skills: [
    'Reconnaître une fonction linéaire',
    'Comprendre la forme f(x)=ax',
    'Identifier le coefficient de la fonction linéaire',
    "Calculer l'image d'un nombre",
    'Construire un tableau de valeurs',
    'Représenter graphiquement une fonction linéaire',
    "Comprendre que la représentation graphique passe par l'origine",
    'Relier une fonction linéaire à une situation de proportionnalité',
    'Interpréter le coefficient a dans une situation concrète',
    'Déterminer une fonction linéaire à partir de données',
    'Utiliser une fonction linéaire pour résoudre un problème',
  ],
  teachingScope: {
    include: [
      'Forme f(x) = ax et coefficient',
      'Lien avec la proportionnalité et le coefficient de proportionnalité',
      "Représentation graphique : une droite passant par l'origine",
      "Détermination de a à partir d'un point, d'un tableau ou d'un graphique",
      'Problèmes concrets : prix, vitesse, agrandissement',
    ],
    exclude: [
      'Fonctions affines (traitées dans leur propre leçon)',
      'Équations de droites sous la forme y = mx + p',
      'Systèmes de deux équations',
      'Proportionnalité inverse',
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
      id: '01', number: 1, slug: 'le-prix-au-kilo', path: `${LESSON_BASE_PATH}/le-prix-au-kilo`,
      title: 'Le prix au kilo',
      desc: 'Une balance, un prix : tu connais déjà cette fonction sans le savoir.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_fonctions-lineaires-3e_P1', '3e_fonctions-lineaires-3e_P2', '3e_fonctions-lineaires-3e_P8'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Peser',
    },
    {
      id: '02', number: 2, slug: 'le-coefficient', path: `${LESSON_BASE_PATH}/le-coefficient`,
      title: 'Le coefficient',
      desc: 'Un seul nombre commande tout : celui par lequel on multiplie.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-lineaires-3e_P3', '3e_fonctions-lineaires-3e_P4', '3e_fonctions-lineaires-3e_P5', '3e_fonctions-lineaires-3e_P9'],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Trouver le coefficient',
    },
    {
      id: '03', number: 3, slug: 'la-droite-a-pivot', path: `${LESSON_BASE_PATH}/la-droite-a-pivot`,
      title: 'La droite à pivot',
      desc: 'Fais tourner la droite : un point ne bouge jamais.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_fonctions-lineaires-3e_P6', '3e_fonctions-lineaires-3e_P7', '3e_fonctions-lineaires-3e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Faire pivoter',
    },
    {
      id: '04', number: 4, slug: 'retrouver-le-coefficient', path: `${LESSON_BASE_PATH}/retrouver-le-coefficient`,
      title: 'Retrouver le coefficient',
      desc: 'Un point, un tableau, une droite : trois façons de remonter à a.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_fonctions-lineaires-3e_P10', '3e_fonctions-lineaires-3e_P2', '3e_fonctions-lineaires-3e_P7'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Mener l’enquête',
    },
    {
      id: '05', number: 5, slug: 'le-labo-lineaire', path: `${LESSON_BASE_PATH}/le-labo-lineaire`,
      title: 'Le labo linéaire',
      desc: 'Vitesse, remise, agrandissement : la même droite partout.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-lineaires-3e_P11', '3e_fonctions-lineaires-3e_P4', '3e_fonctions-lineaires-3e_P9'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '06', number: 6, slug: 'mission-finale-le-marche', path: `${LESSON_BASE_PATH}/mission-finale-le-marche`,
      title: '🏆 Mission finale : le marché',
      desc: 'Huit épreuves où tout se ramène à un seul coefficient.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
