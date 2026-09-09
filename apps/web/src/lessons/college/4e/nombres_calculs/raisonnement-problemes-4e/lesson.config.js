/**
 * Raisonnement et résolution de problèmes — 4e.
 *
 * ─── POURQUOI CETTE LEÇON EXISTE ──────────────────────────────────────
 * Le référentiel 2026 fait de la résolution de problèmes un AXE TRANSVERSAL
 * (`generation_rules.problem_solving_rule`) : elle traverse tous les domaines.
 * Elle reçoit pourtant un objet propre en 6e et en 3e — JAMAIS en 4e. Le trou
 * tombe exactement là où la 4e vient d'acquérir l'outil qui manque aux deux
 * autres niveaux : le calcul littéral.
 *
 * D'où le rattachement. Cette leçon est la PART 3 de l'objet officiel
 * `calcul_litteral`, dont les deux premières parties sont :
 *   part 1  `calcul-litteral-4e`  TRANSFORMER  3x + 2x = 5x
 *   part 2  `equations-4e`        RÉSOUDRE     2x + 5 = 11 → x = 3
 *   part 3  cette leçon           PROUVER      2(n+3) − 2n = 6, pour TOUT n
 * Ce qu'on sait transformer, on peut désormais s'en servir pour PROUVER : la
 * lettre cesse d'être une inconnue à trouver, elle devient un nombre
 * quelconque. C'est le seul glissement de ce genre de tout le collège.
 *
 * Conception : docs/lessons/4E_RAISONNEMENT_SPEC.md.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * ─── L'IDÉE CENTRALE, VÉCUE AVANT D'ÊTRE NOMMÉE ───────────────────────
 * Quelques exemples ne prouvent rien. Un seul contre-exemple réfute
 * définitivement. Le calcul littéral démontre pour TOUS les cas à la fois.
 * Le noyau REFUSE de mentir : `tester()` n'a pas de statut « prouvée », et son
 * message est calculé — après cent essais réussis il dit encore « cent essais
 * ne prouvent rien ». La copie des modules ne peut donc pas le contredire.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '4e_calcul_litteral', part 3, append-only) :
 *
 *   4e_raisonnement-problemes-4e_P1  Comprendre un énoncé et en extraire les données utiles
 *   4e_raisonnement-problemes-4e_P2  Représenter une situation par un schéma ou un tableau
 *   4e_raisonnement-problemes-4e_P3  Estimer un résultat avant de calculer
 *   4e_raisonnement-problemes-4e_P4  Conjecturer à partir d'exemples
 *   4e_raisonnement-problemes-4e_P5  Réfuter par un contre-exemple
 *   4e_raisonnement-problemes-4e_P6  Prouver une conjecture par le calcul littéral
 *   4e_raisonnement-problemes-4e_P7  Vérifier et interpréter un résultat
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : les systèmes de deux
 * équations, l'équation produit nul, les identités remarquables, les
 * inéquations. Ce sont des objets de 3e, et la frontière est EXÉCUTABLE :
 * `components/raisonnement4e.js` n'expose aucune de ces fonctions et
 * `assertScope4e` lève si on les demande.
 *
 * Fil narratif : un programme de calcul qu'on n'arrive pas à mettre en défaut,
 * puis un club qui achète des ballons pour un prix qui ne tombe pas rond.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/raisonnement-problemes-4e';

export const LESSON_CONFIG = {
  id: 'raisonnement-problemes-4e',
  sequentialUnlock: true,
  title: 'Raisonnement et résolution de problèmes',
  description:
    "Essayer un programme de calcul avec ses propres nombres sans jamais réussir à le mettre en défaut, découvrir que les essais ne prouvent rien et qu'un seul contre-exemple réfute, puis se servir du calcul littéral pour démontrer d'un coup ce qu'aucun essai ne pouvait établir — et mener une enquête complète, de l'énoncé à la phrase-réponse.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔎',
  estimatedDurationMin: 83,
  skills: [
    'Comprendre un énoncé et en extraire les données utiles',
    'Représenter une situation par un schéma ou un tableau',
    'Estimer un résultat avant de calculer',
    'Conjecturer à partir d’exemples',
    'Réfuter par un contre-exemple',
    'Prouver une conjecture par le calcul littéral',
    'Vérifier et interpréter un résultat',
  ],
  teachingScope: {
    include: [
      'Les sept temps d’une résolution : comprendre, extraire, représenter, choisir, calculer, vérifier, expliquer',
      'Trier les données utiles et les données inutiles d’un énoncé',
      'Représenter une situation par un schéma en barres ou un tableau',
      'Estimer un ordre de grandeur avant de calculer',
      'Énoncer une conjecture à partir d’essais',
      'Comprendre que des essais réussis ne prouvent rien',
      'Réfuter une conjecture par un contre-exemple',
      'Démontrer une conjecture par le calcul littéral',
      'Choisir une stratégie parmi plusieurs qui aboutissent',
      'Vérifier un résultat dans l’énoncé, et pas dans la dernière ligne',
      'Rédiger une phrase qui répond à la question posée',
    ],
    exclude: [
      'Les systèmes de deux équations (3e)',
      'L’équation produit nul (3e)',
      'Les identités remarquables (3e)',
      'Les inéquations (3e)',
      'Transformer une expression littérale (partie 1 de cet objet : leçon « Calcul littéral »)',
      'Résoudre une équation du premier degré (partie 2 : leçon « Équations du premier degré »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CONTINUITÉ : aucune, et c'est un CHOIX. Le module 1 travaille un programme
  // de calcul, le module 2 l'énoncé d'un club sportif, le module 5 des entiers
  // consécutifs : ce sont trois objets mathématiques différents PAR NÉCESSITÉ,
  // et la leçon a besoin de cette variété pour montrer que le raisonnement est
  // transversal. Fabriquer un objet commun serait un artifice d'architecture,
  // pas un choix pédagogique — la règle du dépôt demande alors de déclarer
  // `null` avec sa raison.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes diagnostiquées par le module 0 : le programme de
  // calcul de 5e, et les acquis des parts 1 et 2 de cet objet.
  priorKnowledge: [
    'programme-de-calcul', 'substituer', 'distributivite-simple', 'factoriser',
    'tester-une-egalite', 'modeliser-par-une-equation', 'controler-le-sens',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis en calcul littéral.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-programme-mystere', path: `${LESSON_BASE_PATH}/le-programme-mystere`,
      title: 'Le programme mystère', desc: 'Essaie tes propres nombres. Le résultat ne bouge pas — et tu ne sais pas encore pourquoi.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_raisonnement-problemes-4e_P4', '4e_raisonnement-problemes-4e_P6'],
      color: 'indigo', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'Mener l’enquête',
    },
    {
      id: '02', number: 2, slug: 'ce-que-l-enonce-raconte', path: `${LESSON_BASE_PATH}/ce-que-l-enonce-raconte`,
      title: 'Ce que l’énoncé raconte', desc: 'Toutes les informations d’un énoncé ne servent pas. Range-les.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_raisonnement-problemes-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Trier',
    },
    {
      id: '03', number: 3, slug: 'dessiner-puis-estimer', path: `${LESSON_BASE_PATH}/dessiner-puis-estimer`,
      title: 'Dessiner, puis estimer', desc: 'Un schéma rend la situation visible — et donne un ordre de grandeur avant tout calcul.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_raisonnement-problemes-4e_P2', '4e_raisonnement-problemes-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Schématiser',
    },
    {
      id: '04', number: 4, slug: 'deux-chemins-une-reponse', path: `${LESSON_BASE_PATH}/deux-chemins-une-reponse`,
      title: 'Deux chemins, une réponse', desc: 'La même situation, résolue de deux façons différentes. Les deux sont bonnes.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_raisonnement-problemes-4e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer',
    },
    {
      id: '05', number: 5, slug: 'le-contre-exemple', path: `${LESSON_BASE_PATH}/le-contre-exemple`,
      title: 'Le contre-exemple', desc: 'Une affirmation qui tient cent fois, une autre qui tombe au premier essai — et la différence.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '4e_raisonnement-problemes-4e_P4', '4e_raisonnement-problemes-4e_P5',
        '4e_raisonnement-problemes-4e_P6',
      ],
      color: 'purple', style: 'featured', estimatedMin: 13, difficulty: 4, actionText: 'Chercher la faille',
    },
    {
      id: '06', number: 6, slug: 'l-enquete-complete', path: `${LESSON_BASE_PATH}/l-enquete-complete`,
      title: 'L’enquête complète', desc: 'Un problème du début à la fin, jusqu’à la phrase qui répond vraiment.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_raisonnement-problemes-4e_P1', '4e_raisonnement-problemes-4e_P7'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-dossier', path: `${LESSON_BASE_PATH}/mission-finale-le-dossier`,
      title: '🏆 Mission finale : le dossier', desc: 'Dix épreuves pour prouver que tu sais raisonner, pas seulement calculer.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
