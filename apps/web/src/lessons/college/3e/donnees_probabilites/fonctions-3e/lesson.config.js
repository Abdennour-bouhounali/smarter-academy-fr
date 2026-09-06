/**
 * Fonctions (3e) — « La machine à nombres ».
 *
 * Learning Points (packages/core/curriculum/coursesData.js, clé '3e_fonctions',
 * dans l'ordre de `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_fonctions-3e_P1  — Comprendre la notion de fonction
 *   3e_fonctions-3e_P2  — Identifier un antécédent et son image
 *   3e_fonctions-3e_P3  — Utiliser la notation f(x)
 *   3e_fonctions-3e_P4  — Calculer l'image d'un nombre par une fonction
 *   3e_fonctions-3e_P5  — Déterminer un antécédent à partir d'une fonction
 *   3e_fonctions-3e_P6  — Construire et compléter un tableau de valeurs
 *   3e_fonctions-3e_P7  — Représenter une fonction dans un repère
 *   3e_fonctions-3e_P8  — Lire des informations sur la représentation graphique
 *   3e_fonctions-3e_P9  — Identifier une fonction linéaire
 *   3e_fonctions-3e_P10 — Identifier une fonction affine
 *   3e_fonctions-3e_P11 — Déterminer l'expression d'une fonction à partir de données
 *   3e_fonctions-3e_P12 — Utiliser une fonction pour modéliser une situation concrète
 *
 * IDÉE CENTRALE — une fonction est une MACHINE : une entrée, une règle, une
 * sortie, et la même règle pour tout x. Le vocabulaire (image, antécédent,
 * f(x)) est nommé APRÈS le geste qui lui donne un sens, jamais avant.
 *
 * DISSYMÉTRIE À FAIRE VOIR : un nombre a UNE image, mais une image peut avoir
 * PLUSIEURS antécédents. C'est pourquoi le module 2 utilise x², qui en donne
 * deux : l'affirmer sans le montrer ne convainc personne.
 *
 * OBJET FIL ROUGE : la machine, qui revient sous quatre habits — boîte noire
 * (M1), tableau (M3), repère (M4), situation réelle (M7).
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/fonctions-3e';

export const LESSON_CONFIG = {
  id: 'fonctions-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (états A du contrat « connaissances avant
  // la demande ») : elles viennent des années précédentes et le module 0 les
  // diagnostique. Tout le reste doit être établi dans la leçon même.
  priorKnowledge: ['abscisse', 'ordonnee', 'coordonnees', 'origine-repere', 'calcul-litteral', 'proportionnalite'],
  title: 'Fonctions',
  description:
    "Nourrir une machine à nombres jusqu'à ce que « image », « antécédent » et f(x) deviennent des mots pour ce qu'on vient de faire, puis lire la même fonction dans un tableau, dans un repère et dans une situation réelle.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 84,
  skills: [
    'Comprendre la notion de fonction',
    'Identifier un antécédent et son image',
    'Utiliser la notation f(x)',
    "Calculer l'image d'un nombre par une fonction",
    'Déterminer un antécédent à partir d\'une fonction',
    'Construire et compléter un tableau de valeurs',
    'Représenter une fonction dans un repère',
    'Lire des informations sur la représentation graphique',
    'Identifier une fonction linéaire',
    'Identifier une fonction affine',
    "Déterminer l'expression d'une fonction à partir de données",
    'Utiliser une fonction pour modéliser une situation concrète',
  ],
  teachingScope: {
    include: [
      'Notion de fonction, image, antécédent, notation f(x)',
      'Tableau de valeurs et représentation graphique',
      'Reconnaissance des fonctions linéaires et affines',
      "Détermination d'une expression à partir de données",
      'Modélisation de situations concrètes simples',
    ],
    exclude: [
      'Étude de variations formelle et dérivation',
      'Fonctions du second degré et racines',
      'Notation ensembliste des domaines de définition',
      'Composition de fonctions',
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
      id: '01', number: 1, slug: 'la-machine-mysterieuse', path: `${LESSON_BASE_PATH}/la-machine-mysterieuse`,
      title: 'La machine mystérieuse',
      desc: 'Une boîte avale un nombre et en recrache un autre. Trouve sa règle.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_fonctions-3e_P1', '3e_fonctions-3e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Nourrir la machine',
    },
    {
      id: '02', number: 2, slug: 'image-et-antecedent', path: `${LESSON_BASE_PATH}/image-et-antecedent`,
      title: 'Image et antécédent',
      desc: 'Un nombre a une seule image. Une image peut avoir deux antécédents.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-3e_P2', '3e_fonctions-3e_P3', '3e_fonctions-3e_P4', '3e_fonctions-3e_P5'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Remonter la machine',
    },
    {
      id: '03', number: 3, slug: 'le-tableau-de-valeurs', path: `${LESSON_BASE_PATH}/le-tableau-de-valeurs`,
      title: 'Le tableau de valeurs',
      desc: 'Ranger les entrées et les sorties : la machine tient dans deux lignes.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-3e_P6', '3e_fonctions-3e_P4'],
      color: 'cyan', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Remplir le tableau',
    },
    {
      id: '04', number: 4, slug: 'du-tableau-au-repere', path: `${LESSON_BASE_PATH}/du-tableau-au-repere`,
      title: 'Du tableau au repère',
      desc: 'Chaque ligne du tableau devient un point. Les points dessinent la fonction.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_fonctions-3e_P7', '3e_fonctions-3e_P8'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '05', number: 5, slug: 'lineaire-affine-ou-ni-lun-ni-lautre', path: `${LESSON_BASE_PATH}/lineaire-affine-ou-ni-lun-ni-lautre`,
      title: 'Linéaire, affine, ou ni l’un ni l’autre',
      desc: 'Trois machines, trois allures. Le graphique donne le nom.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_fonctions-3e_P9', '3e_fonctions-3e_P10'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Classer les machines',
    },
    {
      id: '06', number: 6, slug: 'retrouver-la-regle', path: `${LESSON_BASE_PATH}/retrouver-la-regle`,
      title: 'Retrouver la règle',
      desc: 'À partir d’un tableau ou d’un graphique, remonte jusqu’à l’expression.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-3e_P11', '3e_fonctions-3e_P9', '3e_fonctions-3e_P10'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Mener l’enquête',
    },
    {
      id: '07', number: 7, slug: 'la-machine-dans-la-vraie-vie', path: `${LESSON_BASE_PATH}/la-machine-dans-la-vraie-vie`,
      title: 'La machine dans la vraie vie',
      desc: 'Un taxi, un forfait : la fonction sort du cahier.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-3e_P12', '3e_fonctions-3e_P4', '3e_fonctions-3e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Modéliser',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-latelier-des-machines', path: `${LESSON_BASE_PATH}/mission-finale-latelier-des-machines`,
      title: '🏆 Mission finale : l’atelier des machines',
      desc: 'Dix épreuves pour prouver qu’aucune machine ne te résiste.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
