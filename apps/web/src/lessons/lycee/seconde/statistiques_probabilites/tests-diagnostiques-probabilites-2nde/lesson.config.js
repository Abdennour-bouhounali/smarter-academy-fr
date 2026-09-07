/**
 * Tests diagnostiques — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 11 LPs (clé catalogue
 * 'seconde_tests_diagnostiques', append-only) :
 *
 *   seconde_tests-diagnostiques-probabilites-2nde_P1    Modéliser une situation de test diagnostique
 *   seconde_tests-diagnostiques-probabilites-2nde_P2    Identifier la population étudiée
 *   seconde_tests-diagnostiques-probabilites-2nde_P3    Identifier les événements pertinents
 *   seconde_tests-diagnostiques-probabilites-2nde_P4    Comprendre un faux positif
 *   seconde_tests-diagnostiques-probabilites-2nde_P5    Comprendre un faux négatif
 *   seconde_tests-diagnostiques-probabilites-2nde_P6    Comprendre la sensibilité d'un test
 *   seconde_tests-diagnostiques-probabilites-2nde_P7    Comprendre la spécificité d'un test
 *   seconde_tests-diagnostiques-probabilites-2nde_P8    Calculer une probabilité conditionnelle dans un test
 *   seconde_tests-diagnostiques-probabilites-2nde_P9    Interpréter correctement un résultat de test
 *   seconde_tests-diagnostiques-probabilites-2nde_P10   Éviter l'inversion des conditionnements
 *   seconde_tests-diagnostiques-probabilites-2nde_P11   Analyser une affirmation liée à un test
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un test « fiable à 99 % » peut
 * se tromper une fois sur six quand il annonce un positif. Ce n'est pas un
 * paradoxe, c'est une conséquence des EFFECTIFS — les malades sont si peu
 * nombreux que les 5 % de faux positifs prélevés sur l'immense population
 * saine écrasent en nombre les vrais positifs.
 *
 * C'est l'application authentique de l'inversion du conditionnement vue en
 * « Probabilités conditionnelles » : P(test + | malade) = 0,99 (la
 * sensibilité, une qualité du test) n'a RIEN à voir avec
 * P(malade | test +) = 0,17 (ce qui intéresse la personne testée).
 *
 * CHOIX DIDACTIQUE MAJEUR : tout se joue d'abord en EFFECTIFS sur une
 * population de 10 000 personnes, jamais en probabilités décimales. La
 * recherche en didactique est constante sur ce point — le paradoxe devient
 * intuitif dès qu'on compte des individus (99 contre 495) alors qu'il reste
 * opaque en fréquences. La notation probabiliste n'arrive qu'au module 4,
 * une fois le phénomène admis.
 *
 * PRÉCAUTION : la leçon ne donne AUCUN conseil médical. Le test est un objet
 * mathématique ; les nombres sont fictifs et choisis pour la démonstration.
 *
 * PÉRIMÈTRE : formule de Bayes explicite, théorème de la probabilité totale
 * nommé, tests répétés → première/terminale.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/tests-diagnostiques-probabilites-2nde';

export const LESSON_CONFIG = {
  id: 'tests-diagnostiques-probabilites-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md). Cette leçon est
  // la DERNIÈRE du chapitre : elle ne réinvente ni le vocabulaire du hasard,
  // ni la lecture d'un tableau croisé. Toutes sont diagnostiquées au module 0 :
  //   — le langage des probabilités du collège (3e) : expérience aléatoire,
  //     issue et événement, probabilité, et la fréquence qui l'approche ;
  //   — l'effectif d'un groupe (3e) — ici on COMPTE des personnes avant de
  //     rapporter quoi que ce soit, c'est le choix didactique de la leçon ;
  //   — le tableau à double entrée (6e), support des quatre cases ;
  //   — pourcentage (5e), quotient, dénominateur, proportionnalité et arrondi
  //     (6e) : les outils avec lesquels on divise une case par un total.
  // La leçon enseigne le reste : les quatre catégories du test, la prévalence,
  // sensibilité et spécificité, la valeur prédictive positive, et l'inversion
  // du conditionnement.
  priorKnowledge: [
    'experience-aleatoire', 'issue-evenement', 'probabilite', 'frequence',
    'effectif', 'tableau-double-entree',
    'pourcentage', 'quotient', 'denominateur', 'proportionnalite', 'arrondi',
  ],
  title: 'Tests diagnostiques',
  description:
    "Un test juste 99 fois sur 100 annonce un résultat positif : la personne est-elle malade ? Compter les quatre groupes d'une population de 10 000 pour découvrir que la réponse est « probablement pas » — et comprendre exactement pourquoi.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧪',
  estimatedDurationMin: 81,
  skills: [
    'Modéliser un test diagnostique par quatre effectifs : VP, FP, VN, FN',
    'Définir et calculer sensibilité et spécificité',
    'Calculer la probabilité d’être atteint sachant que le test est positif',
    'Expliquer pourquoi un test très fiable produit beaucoup de faux positifs',
    'Repérer une inversion du conditionnement dans une affirmation',
  ],
  teachingScope: {
    include: [
      'Les quatre catégories : vrais/faux positifs, vrais/faux négatifs',
      'Prévalence : la proportion d’individus atteints dans la population',
      'Sensibilité = P(test + | atteint) ; spécificité = P(test − | sain)',
      'Valeur prédictive positive = P(atteint | test +), calculée sur les effectifs',
      'Effet de la prévalence sur la valeur prédictive positive',
      'Inversion du conditionnement dans les affirmations médiatiques',
    ],
    exclude: [
      'Formule de Bayes écrite explicitement, probabilités totales nommées (première)',
      'Tests répétés, tests en série ou en parallèle (post-bac)',
      'Tout conseil médical : la leçon est une modélisation mathématique',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur le langage du hasard, les probabilités conditionnelles et la lecture d’un tableau.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'dix-mille-personnes', path: `${LESSON_BASE_PATH}/dix-mille-personnes`, title: 'Dix mille personnes, quatre groupes', desc: 'Répartis toi-même la population, puis compte les positifs. Le résultat va te surprendre.', stage: 'trigger', teachesLearningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P1', 'seconde_tests-diagnostiques-probabilites-2nde_P2'], color: 'indigo', style: 'featured', estimatedMin: 15, difficulty: 1, actionText: 'Répartir la population' },
    { id: '02', number: 2, slug: 'les-quatre-cases', path: `${LESSON_BASE_PATH}/les-quatre-cases`, title: 'Les quatre cases du test', desc: 'Vrai positif, faux positif, vrai négatif, faux négatif : nommer ce que tu viens de compter.', stage: 'discovery', teachesLearningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P3', 'seconde_tests-diagnostiques-probabilites-2nde_P4', 'seconde_tests-diagnostiques-probabilites-2nde_P5'], color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Nommer les cases' },
    { id: '03', number: 3, slug: 'sensibilite-et-specificite', path: `${LESSON_BASE_PATH}/sensibilite-et-specificite`, title: 'Sensibilité et spécificité', desc: 'Deux qualités du test — qui se lisent toutes les deux « sachant l’état de santé ».', stage: 'discovery', teachesLearningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P6', 'seconde_tests-diagnostiques-probabilites-2nde_P7'], color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Mesurer le test' },
    { id: '04', number: 4, slug: 'le-test-est-positif-et-alors', path: `${LESSON_BASE_PATH}/le-test-est-positif-et-alors`, title: 'Le test est positif : et alors ?', desc: 'La question qui compte vraiment, et pourquoi sa réponse n’est pas 99 %.', stage: 'formalization', teachesLearningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P8', 'seconde_tests-diagnostiques-probabilites-2nde_P9', 'seconde_tests-diagnostiques-probabilites-2nde_P10'], color: 'emerald', style: 'featured', estimatedMin: 15, difficulty: 4, actionText: 'Retourner la question' },
    { id: '05', number: 5, slug: 'atelier-affirmations', path: `${LESSON_BASE_PATH}/atelier-affirmations`, title: 'Atelier : quatre affirmations', desc: 'Dépistage de masse, contrôle antidopage, alarme incendie : qui a raison ?', stage: 'practice_lab', teachesLearningPointIds: ['seconde_tests-diagnostiques-probabilites-2nde_P11', 'seconde_tests-diagnostiques-probabilites-2nde_P9'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Analyser' },
    { id: '06', number: 6, slug: 'mission-finale-le-test', path: `${LESSON_BASE_PATH}/mission-finale-le-test`, title: '🏆 Mission finale : le test', desc: 'Dix épreuves pour prouver que tu ne confonds plus les deux sens du conditionnement.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 10, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
