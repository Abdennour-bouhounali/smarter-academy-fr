/**
 * Multiples et diviseurs — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   3e_multiples-diviseurs_P1   Comprendre la relation entre multiples et diviseurs
 *   3e_multiples-diviseurs_P2   Reconnaître si un nombre est multiple ou diviseur d'un autre
 *   3e_multiples-diviseurs_P3   Utiliser les critères de divisibilité usuels
 *   3e_multiples-diviseurs_P4   Identifier les diviseurs d'un nombre
 *   3e_multiples-diviseurs_P5   Identifier les multiples d'un nombre
 *   3e_multiples-diviseurs_P6   Reconnaître un nombre premier
 *   3e_multiples-diviseurs_P7   Décomposer un nombre en produit de facteurs premiers
 *   3e_multiples-diviseurs_P8   Utiliser la décomposition en facteurs premiers pour résoudre des problèmes
 *   3e_multiples-diviseurs_P9   Raisonner sur la divisibilité
 *   3e_multiples-diviseurs_P10  Résoudre des problèmes utilisant multiples, diviseurs et nombres premiers
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : « 36 = 4 × 9 »
 * est UN SEUL fait lu dans deux sens (36 est un multiple de 4 ; 4 est un
 * diviseur de 36), et ce fait est VISIBLE — c'est un rectangle de 4 rangées
 * de 9 carreaux. Un nombre premier est celui dont le seul rectangle est le
 * bâton 1 × n. La leçon ne commence donc pas par « un diviseur est un
 * nombre qui… » mais par 36 chaises à ranger, et un reste qui gêne.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : les critères travaillés sont
 * ceux de 2, 3, 5, 9 et 10 — pas 4, 6, 7, 8, 11. Le crible va jusqu'à 50.
 * PGCD et PPCM sont OBTENUS par les décompositions (facteurs communs /
 * facteurs réunis) et servis par des problèmes ; l'algorithme d'Euclide et
 * le vocabulaire formel « PGCD / PPCM » ne sont pas l'objet de la leçon.
 *
 * Fil narratif unique : la fête du collège (chaises, tables, tickets de
 * tombola numérotés, boîtes-cadeaux, sol à carreler, deux lignes de bus),
 * reprise du module 1 jusqu'à la synthèse du boss. L'objet transporté est
 * le tapis de 36 carreaux, qui revient figé dans la synthèse.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/multiples-diviseurs';

export const LESSON_CONFIG = {
  id: 'multiples-diviseurs',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Multiples et diviseurs',
  description:
    "Ranger des carreaux en rectangles jusqu'à voir que « diviseur » veut dire « reste nul », puis cribler, décomposer en facteurs premiers et s'en servir pour simplifier, carreler et attraper deux bus.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 85,
  skills: [
    'Comprendre la relation entre multiples et diviseurs',
    "Reconnaître si un nombre est multiple ou diviseur d'un autre",
    'Utiliser les critères de divisibilité usuels',
    "Identifier les diviseurs d'un nombre",
    "Identifier les multiples d'un nombre",
    'Reconnaître un nombre premier',
    'Décomposer un nombre en produit de facteurs premiers',
    'Utiliser la décomposition en facteurs premiers pour résoudre des problèmes',
    'Raisonner sur la divisibilité',
    'Résoudre des problèmes utilisant multiples, diviseurs et nombres premiers',
  ],
  teachingScope: {
    include: [
      'Relation multiple / diviseur lue dans les deux sens',
      'Critères de divisibilité par 2, 3, 5, 9 et 10',
      "Diviseurs d'un nombre par paires, nombres premiers, crible jusqu'à 50",
      'Décomposition en produit de facteurs premiers',
      'Facteurs communs et facteurs réunis au service de problèmes concrets',
    ],
    exclude: [
      'Algorithme d’Euclide',
      'Critères de divisibilité par 4, 6, 7, 8 et 11',
      'Congruences et arithmétique modulaire',
      'Écriture formelle du PGCD et du PPCM comme objets à part entière',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'les-36-chaises', path: `${LESSON_BASE_PATH}/les-36-chaises`,
      title: 'Les 36 chaises', desc: '36 chaises à ranger en rangées égales. Une chaise seule change tout.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P1', '3e_multiples-diviseurs_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Ranger les chaises' },
    { id: '02', number: 2, slug: 'deux-lectures-du-meme-produit', path: `${LESSON_BASE_PATH}/deux-lectures-du-meme-produit`,
      title: 'Deux lectures du même produit', desc: "Les multiples ne s'arrêtent jamais, les diviseurs vont par paires.",
      stage: 'discovery',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P1', '3e_multiples-diviseurs_P2', '3e_multiples-diviseurs_P5'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Comparer les deux listes' },
    { id: '03', number: 3, slug: 'la-grille-des-multiples', path: `${LESSON_BASE_PATH}/la-grille-des-multiples`,
      title: 'La grille des multiples', desc: 'Colonnes ou diagonales : le motif dit quel critère utiliser.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P3', '3e_multiples-diviseurs_P5'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Colorier la grille' },
    { id: '04', number: 4, slug: 'le-rectangle-detecteur', path: `${LESSON_BASE_PATH}/le-rectangle-detecteur`,
      title: 'Le Rectangle-Détecteur', desc: 'Tous les diviseurs par paires — et le nombre qui ne fait qu’un bâton.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P4', '3e_multiples-diviseurs_P6'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Détecter les paires' },
    { id: '05', number: 5, slug: 'le-crible', path: `${LESSON_BASE_PATH}/le-crible`,
      title: 'Le crible', desc: 'Barre les multiples de 2, 3, 5, 7 : ce qui survit est premier.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P6', '3e_multiples-diviseurs_P9'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Cribler' },
    { id: '06', number: 6, slug: 'larbre-des-facteurs', path: `${LESSON_BASE_PATH}/larbre-des-facteurs`,
      title: 'L’arbre des facteurs', desc: 'Coupe jusqu’à ce qu’il ne reste que des premiers. Toujours les mêmes.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P7', '3e_multiples-diviseurs_P9'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Couper l’arbre' },
    { id: '07', number: 7, slug: 'le-labo-des-decompositions', path: `${LESSON_BASE_PATH}/le-labo-des-decompositions`,
      title: 'Le labo des décompositions', desc: 'Simplifier, carreler, attraper deux bus : les facteurs au travail.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_multiples-diviseurs_P8', '3e_multiples-diviseurs_P10'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Ouvrir le labo' },
    { id: '08', number: 8, slug: 'mission-finale-la-fete-du-college', path: `${LESSON_BASE_PATH}/mission-finale-la-fete-du-college`,
      title: '🏆 Mission finale : la fête du collège', desc: 'Dix épreuves pour monter la fête sans une erreur de division.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
