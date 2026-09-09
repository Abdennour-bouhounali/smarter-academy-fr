/**
 * Probabilités — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `probabilites` du domaine « Organisation et gestion de données et
 * probabilités », rôle « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_PROBABILITES_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '4e_probabilites', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   4e_probabilites-4e_P1  Décrire l'événement contraire d'un événement
 *   4e_probabilites-4e_P2  Calculer la probabilité d'un événement contraire
 *   4e_probabilites-4e_P3  Décrire l'intersection de deux événements
 *   4e_probabilites-4e_P4  Décrire la réunion de deux événements
 *   4e_probabilites-4e_P5  Reconnaître un événement impossible et un événement certain
 *   4e_probabilites-4e_P6  Observer la fluctuation des fréquences lors de répétitions
 *   4e_probabilites-4e_P7  Relier fréquence observée et probabilité
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un événement est un ENSEMBLE
 * D'ISSUES. Tout ce que la 4e ajoute en découle — le contraire est ce qui
 * reste, l'intersection ce qui est dans les deux, la réunion ce qui est dans
 * l'un ou l'autre — et l'erreur du niveau (additionner les deux effectifs)
 * se réfute en montrant les billes comptées deux fois.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`probabilites-5e`, briques réutilisées en
 * `priorKnowledge`) : l'expérience aléatoire, l'issue, l'événement,
 * l'équiprobabilité, la fréquence observée, la probabilité comme quotient,
 * l'échelle de 0 à 1. La 4e n'y revient pas.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. Les arbres pondérés, la
 * formule P(A∪B) = P(A) + P(B) − P(A∩B) énoncée comme règle, les probabilités
 * conditionnelles et les expériences à deux épreuves sont des objets de 3e
 * (`probabilites-3e`). La réunion et l'intersection se DÉCRIVENT ici par les
 * issues, elles ne se calculent pas par une formule additive. La frontière est
 * EXÉCUTABLE : `components/proba4e.js` n'expose aucune de ces fonctions et
 * `assertScope4e` lève si on les demande.
 *
 * Fil narratif : un sac de billes qui ont DEUX caractères (couleur et taille),
 * puis une roue de fête foraine qu'on fait tourner dix mille fois.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/donnees_probabilites/probabilites-4e';

export const LESSON_CONFIG = {
  id: 'probabilites-4e',
  sequentialUnlock: true,
  title: 'Probabilités',
  description:
    "Faire tourner une roue dix mille fois et voir la fréquence se poser sur la probabilité, décrire ce qui reste quand un événement n'arrive pas, compter les billes qui sont à la fois rouges et grandes sans les compter deux fois, et reconnaître ce qui ne peut jamais arriver de ce qui arrive à coup sûr.",
  level: 'college',
  grade: '4e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎲',
  estimatedDurationMin: 76,
  skills: [
    "Décrire l'événement contraire d'un événement",
    "Calculer la probabilité d'un événement contraire",
    "Décrire l'intersection de deux événements",
    'Décrire la réunion de deux événements',
    'Reconnaître un événement impossible et un événement certain',
    'Observer la fluctuation des fréquences lors de répétitions',
    'Relier fréquence observée et probabilité',
  ],
  teachingScope: {
    include: [
      'Un événement est un ENSEMBLE d’issues',
      'L’événement contraire : ce qui reste quand l’événement n’arrive pas',
      'P(contraire) = 1 − P, lu sur les issues',
      'L’intersection : les issues qui vérifient les DEUX conditions',
      'La réunion : les issues qui vérifient l’UNE ou l’AUTRE — sans compter deux fois',
      'Événement impossible (aucune issue) et événement certain (toutes les issues)',
      'La fluctuation des fréquences d’une série à l’autre',
      'La stabilisation de la fréquence autour de la probabilité quand on répète',
    ],
    exclude: [
      'Les arbres pondérés (3e)',
      'La formule P(A ∪ B) = P(A) + P(B) − P(A ∩ B) énoncée comme règle (3e)',
      'Les probabilités conditionnelles (3e)',
      'Les expériences à deux épreuves successives (3e)',
      'La définition de la probabilité comme quotient (installée en 5e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : la roue que l'élève compose au module 1 est CELLE
  // qu'il retrouve au module 6 pour prédire puis vérifier. L'objet est
  // volontairement réutilisé — c'est la même expérience, vue une fois de
  // l'extérieur (les fréquences) et une fois de l'intérieur (le modèle).
  // Le sac, lui, n'est pas persisté : il est donné, pas construit.
  continuity: { key: 'roue', chain: [1, 6] },
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0.
  priorKnowledge: [
    'experience-aleatoire', 'issue', 'evenement', 'equiprobabilite',
    'frequence-observee', 'probabilite', 'echelle-probabilite',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'dix-mille-tours', path: `${LESSON_BASE_PATH}/dix-mille-tours`,
      title: 'Dix mille tours', desc: 'Compose ta roue, lance 10 fois, puis 10 000. Regarde où la fréquence se pose.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_probabilites-4e_P6', '4e_probabilites-4e_P7'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Faire tourner',
    },
    {
      id: '02', number: 2, slug: 'jamais-deux-fois-pareil', path: `${LESSON_BASE_PATH}/jamais-deux-fois-pareil`,
      title: 'Jamais deux fois pareil', desc: 'Cinq séries, cinq résultats différents. Et pourtant, plus on lance, plus ils se ressemblent.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_probabilites-4e_P6', '4e_probabilites-4e_P7'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comparer les séries',
    },
    {
      id: '03', number: 3, slug: 'tout-ce-qui-reste', path: `${LESSON_BASE_PATH}/tout-ce-qui-reste`,
      title: 'Tout ce qui reste', desc: 'Sélectionne un événement dans le sac : ce qui s’éteint est son contraire.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_probabilites-4e_P1', '4e_probabilites-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Choisir un événement',
    },
    {
      id: '04', number: 4, slug: 'et-ou-bien-ou', path: `${LESSON_BASE_PATH}/et-ou-bien-ou`,
      title: 'ET, ou bien OU', desc: 'Rouge ET grande, rouge OU grande : deux filtres, deux résultats très différents.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_probabilites-4e_P3', '4e_probabilites-4e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Croiser les filtres',
    },
    {
      id: '05', number: 5, slug: 'du-jamais-au-toujours', path: `${LESSON_BASE_PATH}/du-jamais-au-toujours`,
      title: 'Du jamais au toujours', desc: 'Compose un sac où l’événement devient impossible, puis certain.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_probabilites-4e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Aller aux extrêmes',
    },
    {
      id: '06', number: 6, slug: 'le-labo-du-hasard', path: `${LESSON_BASE_PATH}/le-labo-du-hasard`,
      title: 'Le labo du hasard', desc: 'Ta roue du module 1 revient : prédis, lance, compare. Puis change le modèle.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_probabilites-4e_P7', '4e_probabilites-4e_P2'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Ouvrir le labo',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-fete-foraine', path: `${LESSON_BASE_PATH}/mission-finale-la-fete-foraine`,
      title: '🏆 Mission finale : la fête foraine', desc: 'Dix épreuves pour prouver que tu maîtrises les probabilités.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
