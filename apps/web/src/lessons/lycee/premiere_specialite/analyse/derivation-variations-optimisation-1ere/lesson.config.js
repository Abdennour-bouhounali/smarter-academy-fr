/**
 * Dérivation : variations et optimisation — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 3 LP
 * (clé catalogue 'premiere_specialite_derivation', partie 3/3, append-only) :
 *
 *   premiere_specialite_derivation-variations-optimisation-1ere_P1  Relier le signe de la dérivée aux variations de la fonction
 *   premiere_specialite_derivation-variations-optimisation-1ere_P2  Construire un tableau de variations à partir de la dérivée
 *   premiere_specialite_derivation-variations-optimisation-1ere_P3  Résoudre un problème d'optimisation à l'aide de la dérivée
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une seule sonde traverse DEUX
 * panneaux superposés — la courbe de f en haut, celle de f′ en dessous, sur le
 * MÊME axe des abscisses. Là où la sonde du bas passe au-dessus de l'axe, la
 * flèche du haut pointe vers le haut ; là où elle passe en dessous, la flèche
 * bascule. Les deux basculent EXACTEMENT aux mêmes abscisses. Le signe de la
 * courbe du bas EST le sens de marche de celle du haut.
 *
 * Objet porté : LES DEUX PANNEAUX QUI SE RÉPONDENT
 * (components/DeuxPanneaux.jsx) — repris au module 2 pour le contre-exemple de
 * x³, puis figé en vérification aux modules suivants. La sonde SE GLISSE : on
 * attrape la figure, on ne la pilote pas au bouton. Le glisser aimante sur le
 * pas de la fonction, ce qui garde chaque zéro de f′ exactement atteignable ;
 * clavier et boutons « un cran » restent des chemins complets, en second.
 *
 * PÉRIMÈTRE : les deux leçons amont ont établi f′(a) (« Le nombre dérivé et la
 * tangente ») et les règles de calcul (« Les règles de calcul ») — on les
 * consomme, on ne les réenseigne pas. Le tableau de variations et le tableau de
 * signes eux-mêmes viennent de 2de : cette leçon ne les invente pas, elle
 * apprend à les REMPLIR à partir de la dérivée. Pas de dérivée seconde, pas de
 * convexité, pas de point d'inflexion (Terminale) ; pas de limites ni
 * d'asymptotes. Le refus est CODÉ dans `assertDansLePerimetre`
 * (components/variationsUtils.js), qui REFUSE toute fonction dont les zéros de
 * la dérivée ne sont pas donnés en littéraux exacts : la leçon ne résout aucune
 * équation par balayage numérique.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/derivation-variations-optimisation-1ere';

export const LESSON_CONFIG = {
  id: 'derivation-variations-optimisation-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0 :
  //
  //   De « Dérivation : le nombre dérivé et la tangente » (1ère) :
  //     nombre-derive, derive-coefficient-directeur — la leçon PART de f′(a) et
  //       de sa lecture comme pente ; c'est ce qui rend le lien signe/variations
  //       lisible du premier coup (dvo-d1).
  //   De « Dérivation : les règles de calcul » (1ère) :
  //     derivees-usuelles, regle-somme-et-reel, methode-choisir-la-regle —
  //       chaque fonction de la leçon arrive avec sa dérivée déjà calculable ;
  //       la leçon ne réapprend pas à dériver (dvo-d2).
  //   De « Signe d'une fonction » (2de) :
  //     signe-position-courbe, tableau-de-signes, methode-construire-tableau —
  //       lire le signe d'une fonction sur sa position par rapport à l'axe, et
  //       le ranger dans un tableau, est l'outil que la leçon applique à f′
  //       (dvo-d3).
  //   De « Variations d'une fonction » (2de) :
  //     variations-sens, tableau-de-variations, maximum-minimum — le sens de
  //       variation, le tableau et les extremums sont ACQUIS ; la leçon apporte
  //       uniquement de quoi les REMPLIR sans lire la courbe (dvo-d4, dvo-d5).
  //
  // Les six suivants portent les ids du LEXIQUE (scripts/audit/lexicon.json) :
  // ce sont des mots employés partout sans être enseignés ici. L'audit --strict
  // les voit et exige qu'ils soient DÉCLARÉS puis MESURÉS. Chacun est mesuré par
  // la question du module 0 indiquée en regard.
  //   fonction, notation-fx ......... dvo-d1
  //   pente, tangente, tangente-courbe, abscisse  dvo-d1
  //   equation-premier-degre, racine-carree ..... dvo-d2
  //   intervalle, intervalle-crochets, ensemble-reels  dvo-d3
  //   variations .................... dvo-d5
  //   extremum ...................... dvo-d6
  priorKnowledge: [
    'nombre-derive',
    'derive-coefficient-directeur',
    'derivees-usuelles',
    'regle-somme-et-reel',
    'methode-choisir-la-regle',
    'signe-position-courbe',
    'tableau-de-signes',
    'methode-construire-tableau',
    'variations-sens',
    'tableau-de-variations',
    'maximum-minimum',
    'fonction',
    'notation-fx',
    'pente',
    'variations',
    'extremum',
    'intervalle',
    // La leçon écrit « tangente », « abscisse », « racine carrée », « ℝ », les
    // crochets d'intervalle et « résoudre … = 0 » partout, sans jamais les
    // enseigner : ce sont des mots de 6e à 2de, et le nombre dérivé lui-même
    // a été posé comme pente de la tangente à la courbe par la leçon amont.
    'tangente',
    'tangente-courbe',
    'abscisse',
    'equation-premier-degre',
    'racine-carree',
    'intervalle-crochets',
    'ensemble-reels',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Dérivation : variations et optimisation',
  description:
    "Une seule sonde traverse deux panneaux : la courbe de f en haut, celle de f′ en dessous. Le signe de la courbe du bas est le sens de marche de celle du haut — et les deux basculent exactement au même endroit. De là : remplir un tableau sans regarder la courbe, et trouver le meilleur choix d'un problème.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🏔️',
  estimatedDurationMin: 75,
  skills: [
    'Relier le signe de f′ au sens de variation de f',
    'Savoir qu’une dérivée nulle ne suffit pas : c’est le CHANGEMENT de signe qui décide',
    'Construire un tableau de variations à partir du seul signe de la dérivée',
    'Résoudre un problème d’optimisation : modéliser, dériver, conclure',
  ],
  teachingScope: {
    include: [
      'Le signe de f′ sur un intervalle donne le sens de variation de f : f′ > 0 fait monter, f′ < 0 fait descendre',
      'Une dérivée nulle en un point ne suffit pas à produire un extremum : c’est le CHANGEMENT de signe de f′ qui décide',
      'Construire un tableau de variations à partir de la dérivée : résoudre f′(x) = 0, étudier le signe de f′, en déduire les flèches et les valeurs',
      'Résoudre un problème d’optimisation : mettre la grandeur en fonction d’une variable, dériver, étudier le signe et conclure sur le meilleur choix',
    ],
    exclude: [
      'Le nombre dérivé, la tangente et son équation, déjà établis par « Dérivation : le nombre dérivé et la tangente »',
      'Les règles de calcul des dérivées : somme, produit, quotient, composée (leçon « Dérivation : les règles de calcul »)',
      'La dérivée seconde, la convexité et les points d’inflexion (Terminale)',
      'Les limites, les asymptotes et l’étude des branches infinies (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur f′(a), les règles de calcul, le tableau de signes et le tableau de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'deux-lignes-qui-se-repondent', path: `${LESSON_BASE_PATH}/deux-lignes-qui-se-repondent`, title: 'Deux lignes qui se répondent', desc: 'Attrape la sonde et fais-la glisser à travers deux panneaux superposés. En haut une flèche montre le sens de marche, en bas la courbe passe au-dessus ou en dessous de l’axe — et les deux basculent au même endroit.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Promener la sonde' },
    { id: '02', number: 2, slug: 'le-signe-decide-du-sens', path: `${LESSON_BASE_PATH}/le-signe-decide-du-sens`, title: 'Le signe décide du sens', desc: 'La synchronisation observée porte un nom, et une réserve : une dérivée nulle ne suffit pas. Sur x³, elle s’annule sans que rien ne se retourne.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Poser la règle' },
    { id: '03', number: 3, slug: 'construire-le-tableau', path: `${LESSON_BASE_PATH}/construire-le-tableau`, title: 'Construire le tableau', desc: 'Quatre gestes, toujours les mêmes : annuler la dérivée, étudier son signe, poser les flèches, calculer les valeurs aux bornes. Sans jamais regarder la courbe.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2', 'premiere_specialite_derivation-variations-optimisation-1ere_P1'], color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Remplir le tableau' },
    { id: '04', number: 4, slug: 'atelier-de-tableaux', path: `${LESSON_BASE_PATH}/atelier-de-tableaux`, title: 'Atelier de tableaux', desc: 'Trois fonctions, trois formes de tableau — dont une où la dérivée ne s’annule jamais, et une où le retournement arrive dans l’autre sens.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Enchaîner les cas' },
    { id: '05', number: 5, slug: 'le-meilleur-choix', path: `${LESSON_BASE_PATH}/le-meilleur-choix`, title: 'Le meilleur choix', desc: 'Une boîte à fabriquer, un bénéfice à viser : mettre la grandeur en fonction d’une variable, dériver, et lire la meilleure valeur dans le tableau.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P3'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Chercher le sommet' },
    { id: '06', number: 6, slug: 'mission-finale-le-sommet', path: `${LESSON_BASE_PATH}/mission-finale-le-sommet`, title: '🏆 Mission finale : le sommet', desc: 'Dix épreuves pour prouver que tu sais lire un signe, remplir un tableau et trouver le meilleur choix.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
