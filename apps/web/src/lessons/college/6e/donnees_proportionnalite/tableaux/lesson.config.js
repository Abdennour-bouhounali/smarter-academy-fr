/**
 * Tableaux — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 9 LPs de cette leçon
 * (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_tableaux_P1  Comprendre l'intérêt d'un tableau pour organiser des informations
 *   6e_tableaux_P2  Identifier les lignes, les colonnes, les cellules et les en-têtes
 *   6e_tableaux_P3  Lire et extraire des informations dans un tableau
 *   6e_tableaux_P4  Compléter un tableau à partir d'informations données
 *   6e_tableaux_P5  Organiser des informations dans un tableau
 *   6e_tableaux_P6  Construire un tableau adapté à une situation
 *   6e_tableaux_P7  Comparer des informations à l'aide d'un tableau
 *   6e_tableaux_P8  Modifier et interpréter des données dans un tableau
 *   6e_tableaux_P9  Utiliser un tableau pour résoudre des problèmes simples
 *
 * L'IDÉE CENTRALE : ce n'est pas la grille qui compte, c'est le CROISEMENT.
 * Un nombre ne veut rien dire seul — il ne prend son sens qu'au croisement
 * d'une ligne et d'une colonne. Toute la leçon est construite là-dessus :
 * le module 1 fait vivre le désordre, le module 3 (manipulation signature)
 * range les faits en vrac dans la grille, et le module 4 attaque le piège
 * n°1 de la leçon — lire la mauvaise case parce qu'on a suivi la mauvaise
 * ligne.
 *
 * Fil narratif unique : le tournoi inter-classes de la 6e B (points marqués
 * par quatre élèves sur quatre épreuves). Le même jeu de données traverse
 * toute la leçon et revient figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/donnees_proportionnalite/tableaux';

export const LESSON_CONFIG = {
  id: 'tableaux',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : comparer et ranger des entiers, poser une petite somme, et
  // prélever une information dans une phrase. Ce sont exactement les trois
  // choses que les cinq questions du module 0 mesurent, et rien d'autre. Tout
  // le reste — le tableau, ses lignes, ses colonnes, ses en-têtes, le
  // croisement, le total — est établi dans la leçon même.
  priorKnowledge: ['comparer-entiers', 'calcul-numerique', 'lecture-information'],
  title: 'Tableaux',
  description:
    "Organiser l'information jusqu'à ce qu'elle devienne lisible : ranger des données en vrac dans un tableau, lire un croisement ligne × colonne, compléter, comparer et décider.",
  level: 'college',
  grade: '6e',
  chapter: 'donnees_proportionnalite',
  chapterTitle: 'Organisation et gestion de données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📋',
  estimatedDurationMin: 79,
  skills: [
    "Comprendre l'intérêt d'un tableau pour organiser des informations",
    'Identifier les lignes, les colonnes, les cellules et les en-têtes',
    'Lire et extraire des informations dans un tableau',
    "Compléter un tableau à partir d'informations données",
    'Organiser des informations dans un tableau',
    'Construire un tableau adapté à une situation',
    "Comparer des informations à l'aide d'un tableau",
    'Modifier et interpréter des données dans un tableau',
    'Utiliser un tableau pour résoudre des problèmes simples',
  ],
  teachingScope: {
    include: ['Lire et interpréter un tableau à simple ou double entrée', 'Prélever des données'],
    exclude: ['Tableaux de fréquences avec classes'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-message-en-vrac', path: `${LESSON_BASE_PATH}/le-message-en-vrac`,
      title: 'Le message en vrac', desc: 'Onze informations jetées en désordre : réponds vite… si tu peux.',
      stage: 'trigger', teachesLearningPointIds: ['6e_tableaux_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'anatomie-d-un-tableau', path: `${LESSON_BASE_PATH}/anatomie-d-un-tableau`,
      title: "Anatomie d'un tableau", desc: 'Lignes, colonnes, en-têtes, cellules : chaque partie a un rôle précis.',
      stage: 'discovery', teachesLearningPointIds: ['6e_tableaux_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Explorer' },
    { id: '03', number: 3, slug: 'ranger-le-desordre', path: `${LESSON_BASE_PATH}/ranger-le-desordre`,
      title: 'Ranger le désordre', desc: 'Chaque information à son croisement : construis le tableau du tournoi.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_tableaux_P5', '6e_tableaux_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Ranger' },
    { id: '04', number: 4, slug: 'lire-le-bon-croisement', path: `${LESSON_BASE_PATH}/lire-le-bon-croisement`,
      title: 'Lire le bon croisement', desc: 'Le piège n°1 : suivre la bonne ligne jusqu’à la bonne colonne.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_tableaux_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Lire' },
    { id: '05', number: 5, slug: 'comparer-et-decider', path: `${LESSON_BASE_PATH}/comparer-et-decider`,
      title: 'Comparer et décider', desc: 'Une ligne, une colonne, un total : le tableau fait apparaître le gagnant.',
      stage: 'formalization', teachesLearningPointIds: ['6e_tableaux_P7', '6e_tableaux_P8'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comparer' },
    { id: '06', number: 6, slug: 'construire-son-tableau', path: `${LESSON_BASE_PATH}/construire-son-tableau`,
      title: 'Construire son tableau', desc: 'Trois situations réelles : à toi de choisir lignes, colonnes et en-têtes.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_tableaux_P6', '6e_tableaux_P9'],
      color: 'rose', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Construire' },
    { id: '07', number: 7, slug: 'le-tournoi-des-6e', path: `${LESSON_BASE_PATH}/le-tournoi-des-6e`,
      title: '🏆 Mission finale : le tournoi des 6e', desc: 'Dix épreuves pour dépouiller le tournoi et désigner les vainqueurs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 11, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
