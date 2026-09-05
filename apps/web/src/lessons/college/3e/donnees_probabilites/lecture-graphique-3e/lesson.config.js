/**
 * Lecture graphique (3e) — « Le curseur-sonde ».
 *
 * Learning Points (coursesData.js, clé '3e_lecture_graphique') :
 *   3e_lecture-graphique-3e_P1  — Lire une image
 *   3e_lecture-graphique-3e_P2  — Déterminer un antécédent
 *   3e_lecture-graphique-3e_P3  — Interpréter les coordonnées d'un point
 *   3e_lecture-graphique-3e_P4  — Lire une valeur avec une échelle donnée
 *   3e_lecture-graphique-3e_P5  — Identifier maximum et minimum
 *   3e_lecture-graphique-3e_P6  — Repérer les variations
 *   3e_lecture-graphique-3e_P7  — Identifier les intervalles de croissance
 *   3e_lecture-graphique-3e_P8  — Déterminer les points d'intersection
 *   3e_lecture-graphique-3e_P9  — Interpréter graphiquement une solution
 *   3e_lecture-graphique-3e_P10 — Résoudre des problèmes à partir d'un graphique
 *
 * IDÉE CENTRALE — la courbe est la SEULE source. Aucune expression, aucune
 * règle : ce que l'élève ne lit pas sur le dessin, il ne l'a pas. C'est ce qui
 * distingue cette leçon de `fonctions-3e`, où l'on pouvait toujours recalculer.
 *
 * DISSYMÉTRIE À FAIRE VOIR : le guide vertical (un x) donne UNE image ; le
 * guide horizontal (un y) peut en donner zéro, un, deux ou trois. Sur une
 * courbe quelconque, c'est spectaculaire — et impossible à deviner sans
 * manipuler.
 *
 * OBJET FIL ROUGE : la montgolfière, dont l'altitude est relevée sur 12 heures.
 * Elle monte, plafonne, redescend, remonte — assez de relief pour que maximum,
 * minimum, intervalles de variation et antécédents multiples existent vraiment.
 *
 * UNITÉ VERTICALE — l'altitude monte à 1 200 m sur un axe des heures de 0 à 12 :
 * `CoordPlane` reçoit donc un `unitY` distinct, sans quoi le cadre ferait des
 * milliers de pixels de haut.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/lecture-graphique-3e';

export const LESSON_CONFIG = {
  id: 'lecture-graphique-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Lecture graphique',
  description:
    "Promener un curseur sur une courbe pour y lire des images, chercher tous les antécédents d'une valeur, repérer maximum, minimum et intervalles de variation, puis résoudre un problème au point de croisement de deux courbes.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 70,
  skills: [
    'Lire une image à partir d’une représentation graphique',
    'Déterminer un antécédent à partir d’une représentation graphique',
    'Interpréter les coordonnées d’un point de la courbe',
    'Lire une valeur avec une échelle donnée',
    'Identifier les valeurs maximales et minimales',
    'Repérer les variations d’une fonction',
    'Identifier les intervalles où une fonction augmente ou diminue',
    'Déterminer les points d’intersection de deux représentations',
    'Interpréter graphiquement une solution',
    'Résoudre des problèmes à partir d’une représentation graphique',
  ],
  teachingScope: {
    include: [
      'Lecture d’images et recherche de TOUS les antécédents',
      'Lecture avec une échelle imposée',
      'Maximum, minimum et intervalles de croissance ou décroissance',
      'Intersection de deux courbes et son interprétation',
      'Résolution de problèmes concrets par lecture graphique',
    ],
    exclude: [
      'Détermination algébrique des extremums',
      'Dérivation et tableau de variations formel',
      'Construction d’un graphique (leçon Représentation graphique)',
      'Résolution algébrique d’équations',
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
      id: '01', number: 1, slug: 'la-montgolfiere', path: `${LESSON_BASE_PATH}/la-montgolfiere`,
      title: 'La montgolfière',
      desc: 'Promène le curseur sur le vol : à chaque heure, son altitude.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P1', '3e_lecture-graphique-3e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Suivre le vol',
    },
    {
      id: '02', number: 2, slug: 'image-ou-antecedent', path: `${LESSON_BASE_PATH}/image-ou-antecedent`,
      title: 'Image ou antécédent',
      desc: 'Un guide vertical donne une réponse. Un guide horizontal peut en donner trois.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P1', '3e_lecture-graphique-3e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Chercher',
    },
    {
      id: '03', number: 3, slug: 'lechelle-imposee', path: `${LESSON_BASE_PATH}/lechelle-imposee`,
      title: 'L’échelle imposée',
      desc: 'Un carreau vaut 100 m. Encore faut-il le remarquer.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P4', '3e_lecture-graphique-3e_P3'],
      color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Lire l’échelle',
    },
    {
      id: '04', number: 4, slug: 'le-curseur-sonde', path: `${LESSON_BASE_PATH}/le-curseur-sonde`,
      title: 'Le curseur-sonde',
      desc: 'Le plus haut, le plus bas, et les moments où ça monte.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P5', '3e_lecture-graphique-3e_P6', '3e_lecture-graphique-3e_P7'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Sonder la courbe',
    },
    {
      id: '05', number: 5, slug: 'deux-ballons-un-croisement', path: `${LESSON_BASE_PATH}/deux-ballons-un-croisement`,
      title: 'Deux ballons, un croisement',
      desc: 'Là où les courbes se coupent, les deux altitudes sont égales.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P8', '3e_lecture-graphique-3e_P9'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Croiser',
    },
    {
      id: '06', number: 6, slug: 'le-labo-de-lecture', path: `${LESSON_BASE_PATH}/le-labo-de-lecture`,
      title: 'Le labo de lecture',
      desc: 'Une courbe inconnue, des questions concrètes, aucune formule.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_lecture-graphique-3e_P10', '3e_lecture-graphique-3e_P9', '3e_lecture-graphique-3e_P2'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Enquêter',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-tour-de-controle', path: `${LESSON_BASE_PATH}/mission-finale-la-tour-de-controle`,
      title: '🏆 Mission finale : la tour de contrôle',
      desc: 'Dix épreuves à lire sur la courbe, et rien qu’à lire.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
