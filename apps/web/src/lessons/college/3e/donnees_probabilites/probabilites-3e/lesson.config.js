/**
 * Probabilités (3e) — « Le laboratoire du hasard ».
 *
 * Learning Points (coursesData.js, clé '3e_probabilites', dans l'ordre de
 * `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_probabilites-3e_P1  — Identifier une expérience aléatoire
 *   3e_probabilites-3e_P2  — Identifier les issues possibles d'une expérience
 *   3e_probabilites-3e_P3  — Déterminer les événements associés à une expérience
 *   3e_probabilites-3e_P4  — Comprendre qu'une probabilité mesure la possibilité qu'un événement se réalise
 *   3e_probabilites-3e_P5  — Calculer une probabilité dans une situation simple
 *   3e_probabilites-3e_P6  — Utiliser les fractions pour représenter une probabilité
 *   3e_probabilites-3e_P7  — Utiliser les fréquences observées dans une expérience aléatoire
 *   3e_probabilites-3e_P8  — Comparer une fréquence expérimentale à une probabilité théorique
 *   3e_probabilites-3e_P9  — Comprendre la stabilisation des fréquences lorsque le nombre d'expériences augmente
 *   3e_probabilites-3e_P10 — Calculer la probabilité d'événements simples
 *   3e_probabilites-3e_P11 — Interpréter une probabilité dans le contexte d'un problème
 *   3e_probabilites-3e_P12 — Résoudre des problèmes de probabilités issus de situations concrètes
 *
 * IDÉE CENTRALE — on ne peut pas prévoir UN lancer, mais on peut prévoir
 * MILLE lancers. La probabilité est ce nombre que les fréquences cherchent ;
 * elle se calcule sur le MODÈLE (issues équiprobables), jamais sur une
 * série. L'élève doit l'éprouver avant qu'on la nomme : d'où le laboratoire
 * du dé en module 1, l'expérience « après trois 6 de suite », et le dé truqué
 * qui montre que 1/6 dépend d'une hypothèse.
 *
 * FIL ROUGE : un jeu de plateau. Le dé dit de combien avancer, il faut un 6
 * pour passer le pont, et la somme de deux dés décide du dernier défi.
 * Voir docs/lessons/3E_PROBABILITES_SPEC.md.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/probabilites-3e';

export const LESSON_CONFIG = {
  id: 'probabilites-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Probabilités',
  description:
    "Lancer un dé mille fois pour voir les fréquences se stabiliser, composer des événements et des sacs de billes, cocher les 36 cas de deux dés — et découvrir ce que le hasard cache : un nombre entre 0 et 1.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md) : lire un
  // quotient et le simplifier, lire un pourcentage, soustraire à 1. Le module
  // 0 les diagnostique — et rien d'autre. Tout le vocabulaire probabiliste
  // (expérience aléatoire, issue, événement, effectif, fréquence,
  // probabilité, équiprobable…) est établi DANS la leçon, par des
  // <KnowledgeBrick>, jamais supposé connu.
  priorKnowledge: ['quotient', 'pourcentage', 'calcul-numerique'],
  emoji: '🎲',
  estimatedDurationMin: 83,
  skills: [
    'Identifier une expérience aléatoire et ses issues',
    'Déterminer les événements associés à une expérience',
    'Comprendre qu’une probabilité mesure une chance, entre 0 et 1',
    'Calculer une probabilité et l’écrire en fraction',
    'Utiliser des fréquences observées et les comparer à la probabilité',
    'Comprendre la stabilisation des fréquences',
    'Interpréter une probabilité dans son contexte',
    'Résoudre des problèmes de probabilités concrets',
  ],
  teachingScope: {
    include: [
      'Expérience aléatoire, issues, événements',
      'Probabilité d’un événement en situation d’équiprobabilité',
      'Fréquences observées, stabilisation, fréquence ≠ probabilité',
      'Expérience à deux épreuves : la somme de deux dés et la grille 6 × 6',
      'Événement contraire, événements impossible et certain',
    ],
    exclude: [
      'Variables aléatoires et espérance',
      'Arbres pondérés et probabilités conditionnelles',
      'Formule P(A ∪ B) + P(A ∩ B) = P(A) + P(B)',
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
      id: '01', number: 1, slug: 'le-laboratoire-du-de', path: `${LESSON_BASE_PATH}/le-laboratoire-du-de`,
      title: 'Le laboratoire du dé',
      desc: 'Prédis, lance, relance mille fois : que cache le hasard ?',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_probabilites-3e_P1', '3e_probabilites-3e_P2', '3e_probabilites-3e_P7', '3e_probabilites-3e_P9'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Lancer le dé',
    },
    {
      id: '02', number: 2, slug: 'issues-et-evenements', path: `${LESSON_BASE_PATH}/issues-et-evenements`,
      title: 'Issues et événements',
      desc: 'Touche les faces qui réalisent l’événement : sa part apparaît.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_probabilites-3e_P2', '3e_probabilites-3e_P3', '3e_probabilites-3e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Composer',
    },
    {
      id: '03', number: 3, slug: 'le-sac-de-billes', path: `${LESSON_BASE_PATH}/le-sac-de-billes`,
      title: 'Le sac de billes',
      desc: 'Compose le sac, double-le, tire 200 fois : la fraction décrit le sac.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_probabilites-3e_P5', '3e_probabilites-3e_P6', '3e_probabilites-3e_P10'],
      color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Remplir le sac',
    },
    {
      id: '04', number: 4, slug: 'deux-des', path: `${LESSON_BASE_PATH}/deux-des`,
      title: 'Deux dés',
      desc: 'Parie sur une somme, lance mille fois, puis coche les 36 cas.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_probabilites-3e_P3', '3e_probabilites-3e_P5', '3e_probabilites-3e_P9', '3e_probabilites-3e_P10', '3e_probabilites-3e_P12'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Lancer deux dés',
    },
    {
      id: '05', number: 5, slug: 'le-langage-des-probabilites', path: `${LESSON_BASE_PATH}/le-langage-des-probabilites`,
      title: 'Le langage des probabilités',
      desc: 'L’échelle de 0 à 1, l’événement contraire, et ce qu’une probabilité veut dire.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_probabilites-3e_P4', '3e_probabilites-3e_P6', '3e_probabilites-3e_P8', '3e_probabilites-3e_P11'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Formaliser',
    },
    {
      id: '06', number: 6, slug: 'le-labo-des-situations', path: `${LESSON_BASE_PATH}/le-labo-des-situations`,
      title: 'Le labo des situations',
      desc: 'Une roue, une usine, un tirage au sort : la probabilité en situation.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_probabilites-3e_P5', '3e_probabilites-3e_P10', '3e_probabilites-3e_P11', '3e_probabilites-3e_P12'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-tournoi', path: `${LESSON_BASE_PATH}/mission-finale-le-tournoi`,
      title: '🏆 Mission finale : le tournoi',
      desc: 'Dix épreuves pour ne plus jamais confondre chance, fréquence et probabilité.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
