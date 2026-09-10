/**
 * Variables aléatoires : dispersion et loi binomiale — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue `premiere_specialite_variables-aleatoires`, partie 2/2,
 * append-only) :
 *
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P1  Calculer la variance d'une variable aléatoire
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P2  Calculer l'écart type d'une variable aléatoire
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P3  Reconnaître un schéma de Bernoulli
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P4  Reconnaître une situation relevant de la loi binomiale
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P5  Calculer une probabilité avec la loi binomiale
 *   premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P6  Modéliser une situation aléatoire par une variable aléatoire
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : deux jeux peuvent avoir
 * EXACTEMENT la même espérance et n'avoir rigoureusement rien à voir. L'un paie
 * 1, 2 ou 3 € à chaque partie ; l'autre ne paie rien neuf fois sur dix et 20 €
 * la dixième. Même moyenne à long terme, 2 € — et pourtant personne ne les
 * confondrait. Il manque donc un second nombre, qui mesure à quel point les
 * résultats S'ÉCARTENT de l'espérance.
 *
 * Objet porté : LES DEUX JEUX (components/DeuxJeuxLab.jsx), simulés côte à côte
 * puis étirés au module 3, avant que la seconde moitié de la leçon ne se
 * déplace vers la répétition d'épreuves identiques (Bernoulli, puis binomiale).
 *
 * PÉRIMÈTRE : la loi de probabilité, son tableau et l'espérance sont ACQUIS
 * (leçon « Variables aléatoires : loi et espérance ») — ils sont employés, pas
 * enseignés. Pas de loi normale, pas d'intervalle de fluctuation, pas de somme
 * de variables aléatoires ni de linéarité de l'espérance : Terminale.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/probabilites/variables-aleatoires-dispersion-binomiale-1ere';

export const LESSON_CONFIG = {
  id: 'variables-aleatoires-dispersion-binomiale-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0. Les quatre premières viennent de la leçon amont
  // (variables-aleatoires-loi-esperance-1ere), les quatre suivantes de la 2de :
  //   variable-aleatoire — la leçon PART d'un nombre associé à chaque issue,
  //     et ne le redéfinit jamais (vd-d1) ;
  //   loi-de-probabilite, tableau-de-loi — le tableau est l'instrument de
  //     travail de toute la première moitié (vd-d2, vd-d3) ;
  //   esperance — le module 1 compare DEUX espérances : sans elle, il n'y a
  //     rien à comparer (vd-d4) ;
  //   arbre-structure, produit-chemin, somme-chemins — l'arbre de 2de est
  //     exactement ce qui sera répété n fois au module 5 (vd-d5, vd-d6) ;
  //   frequence-probabilite — les simulations du module 1 se lisent avec le
  //     lien entre fréquence observée et probabilité (vd-d7).
  priorKnowledge: [
    'variable-aleatoire', 'loi-de-probabilite', 'tableau-de-loi', 'esperance',
    'arbre-structure', 'produit-chemin', 'somme-chemins', 'frequence-probabilite',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Variables aléatoires : dispersion et loi binomiale',
  description:
    "Deux jeux de fête foraine ont exactement la même espérance : 2 € la partie. L'un paie 1, 2 ou 3 € à chaque coup ; l'autre ne paie rien neuf fois sur dix, et 20 € la dixième. Un seul nombre ne suffit donc pas à décrire un jeu — il en faut un second, qui dise à quel point on s'écarte de la moyenne. Puis, quand la même épreuve à deux issues se répète, une formule donne toutes les probabilités d'un coup.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'probabilites',
  chapterTitle: 'Probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔔',
  estimatedDurationMin: 80,
  skills: [
    'Calculer la variance d’une variable aléatoire à partir de sa loi',
    'Calculer l’écart type et l’interpréter dans l’unité des valeurs',
    'Reconnaître une épreuve à deux issues et sa répétition',
    'Calculer une probabilité avec la loi binomiale',
    'Modéliser une situation par une variable aléatoire et ses paramètres',
  ],
  // LEXIQUE D'AUDIT — les mots déjà disponibles, écartés du détecteur.
  //
  // Le lexique est un DÉTECTEUR, pas un juge : il signale des candidats. Les
  // entrées ci-dessous sont toutes des mots que l'élève possède avant d'ouvrir
  // la leçon, et qu'aucun module n'a à enseigner. Chacune porte sa raison, et
  // aucune ne concerne une cible de la leçon — `variance`, `ecart-type`,
  // `schema-bernoulli` et `loi-binomiale` restent sous surveillance.
  knowledgeAudit: {
    ignore: [
      { term: 'probabilite', reason: 'Prérequis mesuré au module 0 (vd-d1, vd-d2) via les briques `loi-de-probabilite` et `frequence-probabilite`. Le mot est de 3e ; il est signalé comme « cible » uniquement parce que le libellé catalogue « Calculer une probabilité avec la loi binomiale » le contient — la cible y est la loi binomiale, pas le mot « probabilité ».' },
      { term: 'experience-aleatoire', reason: 'Mot de 3e, prérequis établi par la leçon amont via la brique `variable-aleatoire` (mesurée en vd-d1). Signalé comme « cible » parce que le libellé catalogue « Modéliser une situation aléatoire… » contient « aléatoire » — la cible y est la modélisation, pas le mot.' },
      { term: 'frequence', reason: 'Mot de 3e, prérequis mesuré au module 0 (vd-d7) via la brique `frequence-probabilite`, dont le libellé même contient le mot.' },
      { term: 'moyenne', reason: 'Mot de 6e. La leçon PART de la moyenne à long terme (l’espérance, prérequis mesuré en vd-d4) pour construire ce qui lui manque ; elle ne l’enseigne pas.' },
      { term: 'indicateur-stat', reason: 'Mot de 3e (statistiques d’une série). Employé au module 2 au sens courant de « nombre qui résume », avant que la brique `variance` ne nomme celui de la leçon.' },
      { term: 'arrondi', reason: 'Mot de 6e. Employé dans une consigne de saisie (« arrondie au centième »), jamais comme objet d’étude.' },
      { term: 'exposant', reason: 'Mot de 3e, employé au module 5 pour relire un produit de puissances déjà écrit. Les puissances sont acquises depuis la 4e.' },
      { term: 'puissance', reason: 'Mot de 4e, employé au module 6 dans un retour d’erreur qui distingue 0,75⁴ de 0,75 × 4.' },
      { term: 'face-solide', reason: 'Mot de 6e, employé au module 6 pour décrire un dé à six faces dans un énoncé de modélisation.' },
      { term: 'racine-carree', reason: 'Mot de 4e. Le module 3 n’enseigne pas la racine carrée : il enseigne POURQUOI on l’applique à la variance. Le titre de l’étape 2 la nomme donc à dessein — c’est l’opération connue, pas la notion nouvelle.' },
    ],
  },
  teachingScope: {
    include: [
      'Variance V(X) = Σ pᵢ (xᵢ − E(X))² : la construire et la calculer',
      'Écart type σ(X) = √V(X) : pourquoi la racine, et ce que le nombre dit',
      'Comparer deux lois de même espérance par leur dispersion',
      'Épreuve à deux issues et schéma de Bernoulli : les reconnaître',
      'Répétition de n épreuves identiques et indépendantes ; loi binomiale',
      'C(n,k) : le nombre de chemins de l’arbre qui portent k succès',
      'P(X = k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ : le calcul, et le passage au complémentaire',
      'Modéliser une situation : identifier n, p et ce que compte la variable',
    ],
    exclude: [
      'La loi normale et l’approximation d’une loi binomiale (Terminale)',
      'Les intervalles de fluctuation et la prise de décision statistique (Terminale)',
      'La somme de deux variables aléatoires et la linéarité de l’espérance (Terminale)',
      'La définition de la loi de probabilité, son tableau et l’espérance (leçon « Variables aléatoires : loi et espérance », supposée acquise)',
      'Les variables aléatoires continues et les densités (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur le tableau d’une loi, son espérance et les arbres pondérés.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'deux-jeux-une-seule-moyenne', path: `${LESSON_BASE_PATH}/deux-jeux-une-seule-moyenne`, title: 'Deux jeux, une seule moyenne', desc: 'Deux stands, exactement la même espérance — et deux nuages de points qui n’ont rien à voir. Il manque un nombre.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Simuler les deux jeux' },
    { id: '02', number: 2, slug: 'mesurer-l-ecart-a-la-moyenne', path: `${LESSON_BASE_PATH}/mesurer-l-ecart-a-la-moyenne`, title: 'Mesurer l’écart à la moyenne', desc: 'Les écarts s’annulent ; leurs carrés, non. Le nombre manquant se construit case après case.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Construire le nombre' },
    { id: '03', number: 3, slug: 'revenir-dans-l-unite-des-gains', path: `${LESSON_BASE_PATH}/revenir-dans-l-unite-des-gains`, title: 'Revenir dans l’unité des gains', desc: 'Le nombre du module 2 est en euros carrés. Une racine le ramène en euros — et il devient enfin lisible.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Prendre la racine' },
    { id: '04', number: 4, slug: 'une-epreuve-deux-issues', path: `${LESSON_BASE_PATH}/une-epreuve-deux-issues`, title: 'Une épreuve, deux issues', desc: 'La situation la plus simple qui soit — et ce qui se passe quand on la répète cinq fois de suite.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Répéter l’épreuve' },
    { id: '05', number: 5, slug: 'compter-les-chemins', path: `${LESSON_BASE_PATH}/compter-les-chemins`, title: 'Compter les chemins', desc: 'Reconnaître la situation, compter les chemins de l’arbre, et calculer n’importe quelle probabilité d’un coup.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P4', 'premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Compter et calculer' },
    { id: '06', number: 6, slug: 'traduire-une-situation', path: `${LESSON_BASE_PATH}/traduire-une-situation`, title: 'Traduire une situation', desc: 'Un énoncé en français, trois questions : que compte-t-on, combien de fois, avec quelle probabilité ?', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-les-deux-jeux', path: `${LESSON_BASE_PATH}/mission-finale-les-deux-jeux`, title: '🏆 Mission finale : les deux jeux', desc: 'Dix épreuves pour prouver que tu sais mesurer une dispersion, reconnaître une répétition d’épreuves et calculer avec elle.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 5, actionText: 'Relever le défi' },
  ],
};
