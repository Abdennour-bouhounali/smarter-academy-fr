/**
 * Arbres de probabilités — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 10 LPs (clé catalogue
 * 'seconde_arbres_de_probabilites', append-only) :
 *
 *   seconde_arbres-probabilites-2nde_P1    Construire un arbre de probabilités
 *   seconde_arbres-probabilites-2nde_P2    Lire un arbre pondéré
 *   seconde_arbres-probabilites-2nde_P3    Interpréter la pondération d'une branche
 *   seconde_arbres-probabilites-2nde_P4    Identifier une probabilité conditionnelle dans un arbre
 *   seconde_arbres-probabilites-2nde_P5    Calculer la probabilité d'un chemin
 *   seconde_arbres-probabilites-2nde_P6    Multiplier les probabilités des branches
 *   seconde_arbres-probabilites-2nde_P7    Calculer la probabilité d'un événement
 *   seconde_arbres-probabilites-2nde_P8    Additionner les probabilités de plusieurs chemins
 *   seconde_arbres-probabilites-2nde_P9    Passer d'une situation réelle à un arbre
 *   seconde_arbres-probabilites-2nde_P10   Passer d'un arbre à une situation en langage naturel
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : l'arbre n'est pas un dessin
 * qu'on apprend à remplir, c'est la TRACE d'une expérience qui se déroule en
 * deux temps. D'où les deux règles, qui ne sont pas des conventions mais des
 * conséquences : le long d'un chemin on MULTIPLIE (l'étape 2 se joue dans
 * l'univers déjà restreint par l'étape 1 — c'est la leçon précédente), et
 * pour un événement on ADDITIONNE les chemins qui le réalisent (ils sont
 * incompatibles).
 *
 * Le point le plus mal compris, traité au module 2 : les poids du SECOND
 * niveau sont des probabilités CONDITIONNELLES. Sur la branche « urne A »,
 * le 0,25 ne signifie pas « 25 % des tirages », il signifie « 25 % des
 * tirages QUI PASSENT PAR A ».
 *
 * Situation portée : deux sacs de billes aux compositions différentes, dont
 * on tire d'abord le sac puis la bille. L'élève CONSTRUIT l'arbre nœud par
 * nœud au module 1 (components/TreeBuilder.jsx) : il ne le reçoit pas fini.
 *
 * PÉRIMÈTRE : la formule des probabilités totales est vue ici sous sa forme
 * « somme des chemins » (programme de 2nde), sans le nom ni la partition
 * formelle. Les tests diagnostiques sont la leçon suivante.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/arbres-probabilites-2nde';

export const LESSON_CONFIG = {
  id: 'arbres-probabilites-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Arbres de probabilités',
  description:
    "Construire soi-même l'arbre d'une expérience à deux temps, brancher les poids, puis découvrir que multiplier le long d'un chemin et additionner les chemins n'est pas une recette : c'est ce que la situation impose.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🌳',
  estimatedDurationMin: 80,
  skills: [
    'Construire l’arbre pondéré d’une expérience à deux étapes',
    'Lire un arbre et reconnaître une probabilité conditionnelle au second niveau',
    'Calculer la probabilité d’un chemin en multipliant les branches',
    'Calculer la probabilité d’un événement en additionnant les chemins',
    'Passer d’une situation réelle à un arbre, et d’un arbre à une phrase',
  ],
  teachingScope: {
    include: [
      'Expérience à deux étapes, arbre pondéré, nœuds et branches',
      'Somme des branches issues d’un même nœud = 1',
      'Poids du second niveau = probabilité conditionnelle',
      'Probabilité d’un chemin = produit des branches du chemin',
      'Probabilité d’un événement = somme des chemins qui le réalisent',
      'Traduction situation ↔ arbre dans les deux sens',
    ],
    exclude: [
      'Nom et énoncé formel de la formule des probabilités totales (première)',
      'Arbres à trois niveaux ou plus, répétitions d’épreuves identiques (première)',
      'Sensibilité, spécificité, valeur prédictive (leçon « Tests diagnostiques »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les probabilités conditionnelles et les fractions.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'construis-larbre', path: `${LESSON_BASE_PATH}/construis-larbre`, title: 'Construis l’arbre toi-même', desc: 'Deux sacs, une bille. Pose les nœuds dans l’ordre de l’expérience et l’arbre apparaît sous tes doigts.', stage: 'trigger', teachesLearningPointIds: ['seconde_arbres-probabilites-2nde_P1', 'seconde_arbres-probabilites-2nde_P9'], color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 1, actionText: 'Construire l’arbre' },
    { id: '02', number: 2, slug: 'ce-que-pesent-les-branches', path: `${LESSON_BASE_PATH}/ce-que-pesent-les-branches`, title: 'Ce que pèsent les branches', desc: 'Au second niveau, les poids ne sont pas ce qu’ils semblent : ce sont des conditionnelles.', stage: 'discovery', teachesLearningPointIds: ['seconde_arbres-probabilites-2nde_P2', 'seconde_arbres-probabilites-2nde_P3', 'seconde_arbres-probabilites-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'Peser les branches' },
    { id: '03', number: 3, slug: 'multiplier-le-long-dun-chemin', path: `${LESSON_BASE_PATH}/multiplier-le-long-dun-chemin`, title: 'Multiplier le long d’un chemin', desc: 'Pourquoi un produit, et pas une somme ? Compte les billes, tu verras.', stage: 'discovery', teachesLearningPointIds: ['seconde_arbres-probabilites-2nde_P5', 'seconde_arbres-probabilites-2nde_P6'], color: 'sky', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'Suivre un chemin' },
    { id: '04', number: 4, slug: 'additionner-les-chemins', path: `${LESSON_BASE_PATH}/additionner-les-chemins`, title: 'Additionner les chemins', desc: 'Un même résultat par plusieurs routes : on les rassemble.', stage: 'formalization', teachesLearningPointIds: ['seconde_arbres-probabilites-2nde_P7', 'seconde_arbres-probabilites-2nde_P8'], color: 'emerald', style: 'featured', estimatedMin: 14, difficulty: 3, actionText: 'Rassembler les routes' },
    { id: '05', number: 5, slug: 'atelier-de-larbre-a-la-phrase', path: `${LESSON_BASE_PATH}/atelier-de-larbre-a-la-phrase`, title: 'Atelier : de l’arbre à la phrase', desc: 'Traduire dans les deux sens, sur trois situations qui n’ont rien à voir avec des billes.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_arbres-probabilites-2nde_P10', 'seconde_arbres-probabilites-2nde_P9'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Traduire' },
    { id: '06', number: 6, slug: 'mission-finale-larbre', path: `${LESSON_BASE_PATH}/mission-finale-larbre`, title: '🏆 Mission finale : l’arbre', desc: 'Dix épreuves pour prouver que tu sais quand multiplier et quand additionner.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
