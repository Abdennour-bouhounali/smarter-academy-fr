/**
 * Logique et raisonnement — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 6 LPs (clé catalogue
 * 'seconde_logique_et_raisonnement', append-only) :
 *
 *   seconde_logique-et-raisonnement-2nde_P1  Construire et analyser une proposition mathématique.
 *   seconde_logique-et-raisonnement-2nde_P2  Utiliser les connecteurs logiques.
 *   seconde_logique-et-raisonnement-2nde_P3  Comprendre et utiliser l’implication.
 *   seconde_logique-et-raisonnement-2nde_P4  Comprendre et utiliser l’équivalence.
 *   seconde_logique-et-raisonnement-2nde_P5  Utiliser un contre-exemple pour réfuter une affirmation.
 *   seconde_logique-et-raisonnement-2nde_P6  Raisonner par contradiction.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une proposition est vraie ou
 * fausse, et pour une affirmation qui porte sur TOUS les nombres, aucun
 * nombre d'exemples ne suffit — alors qu'UN SEUL contre-exemple suffit à la
 * détruire. Le module 1 le fait vivre avec n² + n + 41, premier pour n = 0
 * à 39 et composé pour n = 40 : l'élève teste, se convainc, puis tombe.
 *
 * Périmètre : la logique est ici un OUTIL sur des propriétés numériques
 * simples (parité, multiples, carrés), pas une théorie formelle ; les
 * quantificateurs ∀ et ∃ sont nommés mais pas manipulés symboliquement.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde';

export const LESSON_CONFIG = {
  id: 'logique-et-raisonnement-2nde',
  // Connaissances SUPPOSÉES acquises, venues d'« Ensembles et intervalles »
  // (premier objet du domaine) : la leçon les emploie dès le module 0 pour
  // écrire ses propriétés numériques. Diagnostiquées par q1 et q2.
  priorKnowledge: ['appartient', 'ensemble-reels'],
  sequentialUnlock: true,
  title: 'Logique et raisonnement',
  description:
    "Tester une formule qui donne quarante nombres premiers d'affilée — et la voir tomber au quarante-et-unième. Puis brancher ET, OU, NON, distinguer une implication de sa réciproque, réfuter d'un contre-exemple et raisonner par l'absurde.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧠',
  estimatedDurationMin: 65,
  skills: [
    'Construire et analyser une proposition mathématique',
    'Utiliser les connecteurs logiques',
    'Comprendre et utiliser l’implication',
    'Comprendre et utiliser l’équivalence',
    'Utiliser un contre-exemple pour réfuter une affirmation',
    'Raisonner par contradiction',
  ],
  teachingScope: {
    include: [
      'Proposition (vraie ou fausse), proposition dépendant d’une variable, quantification « pour tout » / « il existe »',
      'Connecteurs ET, OU (inclusif), NON et la négation d’une proposition simple',
      'Implication P ⇒ Q, réciproque, contraposée ; le seul cas interdit (P vraie et Q fausse)',
      'Équivalence P ⇔ Q : les deux implications ; « si et seulement si »',
      'Contre-exemple : un seul suffit pour réfuter une affirmation universelle',
      'Raisonnement par l’absurde et par disjonction des cas, sur des exemples numériques',
    ],
    exclude: [
      'Le calcul propositionnel formel et les tables de vérité complètes',
      'La récurrence (Première)',
      'Les preuves d’arithmétique elles-mêmes (leçon « Arithmétique »)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-formule-qui-tombe', path: `${LESSON_BASE_PATH}/la-formule-qui-tombe`, title: 'La formule qui tombe', desc: 'n² + n + 41 donne un nombre premier. Pour n = 0, 1, 2… jusqu’où ? Teste, et regarde la formule tomber.', stage: 'trigger', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P1', 'seconde_logique-et-raisonnement-2nde_P5'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Tester la formule' },
    { id: '02', number: 2, slug: 'et-ou-non', path: `${LESSON_BASE_PATH}/et-ou-non`, title: 'ET, OU, NON', desc: 'Deux propriétés, un branchement : qui passe le filtre « pair ET plus grand que 5 » ? Et « pair OU… » ?', stage: 'discovery', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P2', 'seconde_logique-et-raisonnement-2nde_P1'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Brancher les filtres' },
    { id: '03', number: 3, slug: 'implication-et-reciproque', path: `${LESSON_BASE_PATH}/implication-et-reciproque`, title: 'Implication et réciproque', desc: 'Un seul cas est interdit : P vraie et Q fausse. Cherche-le — dans un sens, puis dans l’autre.', stage: 'discovery', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P3', 'seconde_logique-et-raisonnement-2nde_P5'], color: 'cyan', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Chercher le cas interdit' },
    { id: '04', number: 4, slug: 'equivalence', path: `${LESSON_BASE_PATH}/equivalence`, title: 'Équivalence', desc: 'Deux implications, deux sens. « x² = 9 ⇔ x = 3 » : cherche l’oublié.', stage: 'manipulation', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P4', 'seconde_logique-et-raisonnement-2nde_P3'], color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Tester les deux sens' },
    { id: '05', number: 5, slug: 'a-retenir', path: `${LESSON_BASE_PATH}/a-retenir`, title: 'À retenir', desc: 'Proposition, connecteurs, implication, réciproque, contraposée, équivalence, contre-exemple : la carte.', stage: 'formalization', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P1', 'seconde_logique-et-raisonnement-2nde_P2', 'seconde_logique-et-raisonnement-2nde_P3', 'seconde_logique-et-raisonnement-2nde_P4'], color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Retenir' },
    { id: '06', number: 6, slug: 'labsurde', path: `${LESSON_BASE_PATH}/labsurde`, title: 'Par l’absurde', desc: 'Treize élèves, douze mois : deux partagent forcément le même. Supposer le contraire, et se cogner.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_logique-et-raisonnement-2nde_P6', 'seconde_logique-et-raisonnement-2nde_P5'], color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Raisonner par l’absurde' },
    { id: '07', number: 7, slug: 'mission-finale-le-tribunal', path: `${LESSON_BASE_PATH}/mission-finale-le-tribunal`, title: '🏆 Mission finale : le tribunal des affirmations', desc: 'Dix épreuves pour prouver qu’aucune affirmation ne te piège.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
