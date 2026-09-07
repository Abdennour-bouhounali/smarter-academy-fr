/**
 * Probabilités conditionnelles — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 9 LPs (clé catalogue
 * 'seconde_probabilites_conditionnelles', append-only) :
 *
 *   seconde_probabilites-conditionnelles-2nde_P1   Comprendre une probabilité conditionnelle
 *   seconde_probabilites-conditionnelles-2nde_P2   Interpréter « sachant que »
 *   seconde_probabilites-conditionnelles-2nde_P3   Calculer P_A(B)
 *   seconde_probabilites-conditionnelles-2nde_P4   Calculer une probabilité conditionnelle à partir d'un tableau
 *   seconde_probabilites-conditionnelles-2nde_P5   Calculer une probabilité conditionnelle dans une situation concrète
 *   seconde_probabilites-conditionnelles-2nde_P6   Distinguer P_A(B) et P_B(A)
 *   seconde_probabilites-conditionnelles-2nde_P7   Interpréter une probabilité conditionnelle
 *   seconde_probabilites-conditionnelles-2nde_P8   Identifier une erreur d'inversion du conditionnement
 *   seconde_probabilites-conditionnelles-2nde_P9   Relier probabilité conditionnelle et fréquence conditionnelle
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : conditionner, c'est CHANGER
 * D'UNIVERS. On n'ajoute pas une information à un calcul : on jette une
 * partie de la population et on recalcule tout dans ce qu'il reste. La
 * population restreinte devient le nouveau « tout », et c'est pour cela que
 * P_A(B) et P_B(A) n'ont aucune raison d'être égales.
 *
 * Situation portée : 800 lycéens (internes/externes × pratique d'un sport
 * en club), affichés comme une POPULATION DE PASTILLES qu'on éteint —
 * l'univers restreint se voit, il ne se déduit pas d'une formule.
 *
 * ARTICULATION AVEC « FRÉQUENCES CONDITIONNELLES » (leçon précédente) —
 * c'est la même division, et la leçon le DIT au module 4 plutôt que de le
 * cacher : là-bas on décrivait des données observées (fréquences), ici on
 * modélise une expérience aléatoire (probabilités) et on gagne une
 * notation, P_A(B), plus la formule des probabilités composées. On ne
 * refait donc PAS le tableau croisé pour lui-même.
 *
 * PÉRIMÈTRE : l'arbre pondéré appartient à la leçon suivante ; les tests
 * diagnostiques (VPP, sensibilité) à la dernière. L'indépendance est hors
 * programme de 2nde.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde';

export const LESSON_CONFIG = {
  id: 'probabilites-conditionnelles-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md), toutes venues du
  // collège et toutes diagnostiquées par le module 0 :
  //   — le modèle probabiliste de 3e : expérience aléatoire, issue et
  //     événement, équiprobabilité, et la probabilité comme quotient des cas
  //     favorables par les cas possibles ;
  //   — les écritures d'un quotient : numérateur, dénominateur, pourcentage ;
  //   — l'effectif d'un groupe et la lecture d'un tableau à double entrée,
  //     que la leçon utilise comme outils de comptage sans les redécouvrir.
  // La leçon enseigne le reste : l'univers restreint, la notation P_A(B), la
  // non-symétrie du conditionnement, le lien fréquence/probabilité et les
  // probabilités composées.
  priorKnowledge: [
    'experience-aleatoire', 'issue-evenement', 'equiprobable', 'probabilite',
    'quotient', 'numerateur', 'denominateur', 'pourcentage',
    'effectif', 'tableau-double-entree',
  ],
  title: 'Probabilités conditionnelles',
  description:
    "Éteindre une partie de la population et recalculer dans ce qui reste : conditionner, ce n'est pas ajouter une information, c'est changer d'univers. Découvrir pourquoi « sachant A, la probabilité de B » ne se retourne jamais.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎯',
  estimatedDurationMin: 80,
  skills: [
    'Comprendre une probabilité conditionnelle comme une probabilité dans un univers restreint',
    'Traduire « sachant que » et calculer P_A(B) à partir d’effectifs ou d’un tableau',
    'Distinguer P_A(B) de P_B(A) et repérer une erreur d’inversion',
    'Interpréter une probabilité conditionnelle par une phrase correcte',
    'Relier probabilité conditionnelle et fréquence conditionnelle',
  ],
  teachingScope: {
    include: [
      'Univers restreint : conditionner, c’est remplacer le tout par une partie',
      'Notation P_A(B), lecture « probabilité de B sachant A »',
      'Formule P_A(B) = P(A ∩ B) / P(A), et sur les effectifs n(A ∩ B) / n(A)',
      'Probabilités composées : P(A ∩ B) = P(A) × P_A(B)',
      'P_A(B) ≠ P_B(A) : l’erreur d’inversion du conditionnement',
      'Lien avec la fréquence conditionnelle : même quotient, statut différent',
    ],
    exclude: [
      'Arbre pondéré et expériences à deux étapes (leçon « Arbres de probabilités »)',
      'Sensibilité, spécificité, valeur prédictive (leçon « Tests diagnostiques »)',
      'Indépendance de deux événements, formule des probabilités totales (première)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les probabilités et les proportions.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'eteindre-la-population', path: `${LESSON_BASE_PATH}/eteindre-la-population`, title: 'Éteins une partie de la population', desc: 'Applique une condition : la moitié des pastilles s’éteint, et la probabilité change sous tes yeux.', stage: 'trigger', teachesLearningPointIds: ['seconde_probabilites-conditionnelles-2nde_P1', 'seconde_probabilites-conditionnelles-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'Appliquer la condition' },
    { id: '02', number: 2, slug: 'la-notation-sachant-que', path: `${LESSON_BASE_PATH}/la-notation-sachant-que`, title: 'La notation « sachant que »', desc: 'Mettre un nom et une écriture sur ce que tu viens de faire : P_A(B).', stage: 'discovery', teachesLearningPointIds: ['seconde_probabilites-conditionnelles-2nde_P3', 'seconde_probabilites-conditionnelles-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'Nommer et écrire' },
    { id: '03', number: 3, slug: 'ne-jamais-retourner-la-condition', path: `${LESSON_BASE_PATH}/ne-jamais-retourner-la-condition`, title: 'Ne jamais retourner la condition', desc: 'P_A(B) et P_B(A) : deux univers, deux dénominateurs, deux nombres.', stage: 'discovery', teachesLearningPointIds: ['seconde_probabilites-conditionnelles-2nde_P6', 'seconde_probabilites-conditionnelles-2nde_P8'], color: 'sky', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'Inverser pour voir' },
    { id: '04', number: 4, slug: 'des-frequences-aux-probabilites', path: `${LESSON_BASE_PATH}/des-frequences-aux-probabilites`, title: 'Des fréquences aux probabilités', desc: 'Le même quotient qu’en statistiques — mais il ne dit plus tout à fait la même chose.', stage: 'formalization', teachesLearningPointIds: ['seconde_probabilites-conditionnelles-2nde_P9', 'seconde_probabilites-conditionnelles-2nde_P7'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Faire le lien' },
    { id: '05', number: 5, slug: 'atelier-situations-concretes', path: `${LESSON_BASE_PATH}/atelier-situations-concretes`, title: 'Atelier : situations concrètes', desc: 'Quatre énoncés : repérer la condition, choisir le dénominateur, conclure.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_probabilites-conditionnelles-2nde_P5', 'seconde_probabilites-conditionnelles-2nde_P7'], color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'S’entraîner' },
    { id: '06', number: 6, slug: 'mission-finale-sachant-que', path: `${LESSON_BASE_PATH}/mission-finale-sachant-que`, title: '🏆 Mission finale : sachant que', desc: 'Dix épreuves pour prouver que tu sais toujours dans quel univers tu calcules.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
