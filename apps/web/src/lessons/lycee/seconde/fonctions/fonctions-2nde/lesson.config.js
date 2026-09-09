/**
 * Fonctions — 2nde.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : LP ids LITTÉRAUX,
 * objets `assessment` écrits en toutes lettres. Les 12 LPs de cette leçon
 * (clé catalogue 'seconde_fonctions', append-only) :
 *
 *   seconde_fonctions-2nde_P1   Comprendre une fonction comme une relation de dépendance
 *   seconde_fonctions-2nde_P2   Identifier la variable
 *   seconde_fonctions-2nde_P3   Déterminer l'ensemble de définition
 *   seconde_fonctions-2nde_P4   Calculer une image
 *   seconde_fonctions-2nde_P5   Déterminer un antécédent
 *   seconde_fonctions-2nde_P6   Lire une fonction dans un tableau
 *   seconde_fonctions-2nde_P7   Lire une fonction sur un graphique
 *   seconde_fonctions-2nde_P8   Lire une fonction à partir d'une expression
 *   seconde_fonctions-2nde_P9   Passer d'un registre de représentation à un autre
 *   seconde_fonctions-2nde_P10  Modéliser une situation avec une fonction
 *   seconde_fonctions-2nde_P11  Utiliser une fonction définie sur un intervalle
 *   seconde_fonctions-2nde_P12  Utiliser une fonction définie sur une réunion d'intervalles
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une fonction est une
 * DÉPENDANCE — quand on choisit la valeur d'une grandeur (la variable), une
 * autre grandeur est entièrement déterminée, et une seule. Quatre registres
 * décrivent la même dépendance (situation, tableau, courbe, expression) ; on
 * passe de l'un à l'autre. Image et antécédent ne sont pas symétriques ; la
 * fonction n'existe que sur son ensemble de définition, parfois une réunion
 * d'intervalles.
 *
 * Objet porté : LA BOÎTE SANS COUVERCLE — une feuille carrée de 20 cm dont on
 * découpe les coins (x), pliée en boîte ; son volume dépend de x. Elle ouvre
 * la leçon (M1), reçoit le vocabulaire (M2), révèle sa formule (M3) et revient
 * au module 7 avec une feuille de 30 cm.
 *
 * PÉRIMÈTRE : pas de variations, d'extremums ni de signe formels (leçons
 * dédiées) ; pas de fonctions de référence (leçon dédiée) ; pas de
 * fonction affine comme objet (leçon dédiée).
 *
 * CARTE DES CONNAISSANCES : pas de module « À retenir » ; implémentation
 * partagée lessons/common/knowledge, données dans knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/fonctions/fonctions-2nde';

export const LESSON_CONFIG = {
  id: 'fonctions-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md). Deux origines,
  // et le module 0 les diagnostique toutes :
  //   — le collège : repérage dans le plan (6e), grandeurs (6e), calcul
  //     littéral, développement et distributivité (4e/3e), équation du premier
  //     degré (4e), et la notion de fonction vue en 3e (image, antécédent,
  //     f(x), tableau de valeurs, représentation graphique) ;
  //   — la Seconde DÉJÀ FAITE : « Ensembles et intervalles » est le premier
  //     objet du programme de Seconde, bien avant « Fonctions ». Intervalle,
  //     crochets, ℝ et ∈ n'appartiennent donc pas à cette leçon : elle les
  //     REMPLOIE pour dire un ensemble de définition, et les resitue au point
  //     d'emploi par une brique `variant="rappel"`.
  // La leçon enseigne le reste : ensemble de définition, courbe
  // représentative, quatre registres, réunion d'intervalles, modélisation.
  priorKnowledge: [
    'abscisse', 'ordonnee', 'coordonnees', 'origine-repere',
    'perimetre', 'aire',
    'calcul-litteral', 'developper', 'distributivite', 'equation-premier-degre', 'carre-nombre',
    'encadrer-nombre',
    'fonction', 'image', 'antecedent', 'notation-fx', 'tableau-de-valeurs', 'representation-graphique',
    'intervalle', 'intervalle-crochets', 'ensemble-reels', 'appartient',
  ],
  knowledgeAudit: {
    ignore: [
      // « minimum » apparaît une seule fois, dans la correction d'une ligne du
      // module 5 qui décrit une courbe (« une parabole, minimum −2 en x = 0 »).
      // Les variations et les extremums sont explicitement HORS PÉRIMÈTRE
      // (teachingScope.exclude) : le mot y est employé au sens courant du
      // point le plus bas du dessin, jamais comme notion à manipuler, et la
      // leçon « Variations et extremums » l'enseigne pour de bon.
      { term: 'extremum', reason: "mot employé au sens courant dans une correction du module 5 pour décrire l'allure d'une parabole ; les extremums sont hors périmètre (leçon dédiée)" },
      // « moyenne » n'est qu'un distracteur du test final (« n(13) serait la
      // moyenne de n(12) et n(14) ? »). Notion de 6e ; l'élève n'a qu'à
      // écarter l'idée qu'on puisse combler un trou de l'ensemble de
      // définition, pas à calculer quoi que ce soit.
      { term: 'moyenne', reason: 'distracteur du test final ; notion de 6e, jamais calculée ici' },
    ],
  },
  title: 'Fonctions',
  description:
    "Découper les coins d'une feuille pour en faire une boîte, chercher la découpe qui donne le plus grand volume, puis découvrir que ce volume ne dépend que d'un nombre : la variable. Image, antécédent, ensemble de définition, et les quatre façons — situation, tableau, courbe, expression — de décrire la même dépendance.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'fonctions',
  chapterTitle: 'Fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: 'ƒ',
  estimatedDurationMin: 87,
  skills: [
    'Comprendre une fonction comme une dépendance entre deux grandeurs',
    "Identifier la variable et l'ensemble de définition",
    'Calculer une image, déterminer un antécédent',
    'Lire une fonction dans un tableau, sur une courbe, dans une expression',
    "Passer d'un registre à l'autre et modéliser une situation",
    "Utiliser une fonction définie sur un intervalle ou une réunion d'intervalles",
  ],
  teachingScope: {
    include: [
      'Fonction = dépendance : à chaque x de l’ensemble de définition, une unique image f(x) ; notation f : x ↦ f(x)',
      'Image (unique) et antécédents (0, 1 ou plusieurs) ; lecture dans un tableau, sur une courbe, calcul à partir d’une expression',
      'Ensemble de définition : intervalle, réunion d’intervalles, valeurs sans image',
      'Courbe représentative : M(x ; y) ∈ C ⟺ y = f(x) ; tracer point par point',
      'Passer d’un registre à l’autre ; modéliser une situation (volume d’une boîte, périmètre, forfait, fréquentation)',
    ],
    exclude: [
      'Variations, extremums, tableau de variations (leçon « Variations et extremums »)',
      'Signe d’une fonction et tableau de signes (leçon « Signe d’une fonction »)',
      'Fonctions carré, inverse, valeur absolue comme références (leçon dédiée) ; fonction affine comme objet (leçon dédiée)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les fonctions du collège, le repérage, le calcul littéral et les intervalles.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 6, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-boite', path: `${LESSON_BASE_PATH}/la-boite`, title: 'La boîte', desc: 'Découpe les coins d’une feuille, plie, mesure le volume. Trouve la plus grande boîte — et ce dont le volume dépend vraiment.', stage: 'trigger', teachesLearningPointIds: ['seconde_fonctions-2nde_P1', 'seconde_fonctions-2nde_P2', 'seconde_fonctions-2nde_P10'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Fabriquer la boîte' },
    { id: '02', number: 2, slug: 'image-antecedent-ensemble-de-definition', path: `${LESSON_BASE_PATH}/image-antecedent-ensemble-de-definition`, title: 'Image, antécédent, ensemble de définition', desc: 'Une sonde sur la courbe de la boîte : une découpe donne UN volume, un volume peut venir de deux découpes — et certaines découpes n’existent pas.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-2nde_P3', 'seconde_fonctions-2nde_P4', 'seconde_fonctions-2nde_P5', 'seconde_fonctions-2nde_P7'], color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Sonder la courbe' },
    { id: '03', number: 3, slug: 'le-tableau-de-valeurs', path: `${LESSON_BASE_PATH}/le-tableau-de-valeurs`, title: 'Le tableau de valeurs', desc: 'Trois formules candidates, un tableau qui les départage : la formule de la boîte apparaît. Calculer une image, lire un tableau, retrouver un antécédent.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-2nde_P6', 'seconde_fonctions-2nde_P8', 'seconde_fonctions-2nde_P4', 'seconde_fonctions-2nde_P5'], color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Tester les formules' },
    { id: '04', number: 4, slug: 'du-tableau-a-la-courbe', path: `${LESSON_BASE_PATH}/du-tableau-a-la-courbe`, title: 'Du tableau à la courbe', desc: 'Place les points du tableau, relie-les : la courbe. Un point est dessus exactement quand y = f(x) — et (6 ; 3) n’est pas (3 ; 6).', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonctions-2nde_P7', 'seconde_fonctions-2nde_P9'], color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Placer les points' },
    { id: '05', number: 5, slug: 'quatre-registres', path: `${LESSON_BASE_PATH}/quatre-registres`, title: 'Quatre registres, une fonction', desc: 'Situation, tableau, courbe, expression : la même dépendance. Reconnaître, traduire, et choisir le registre qui répond le plus vite.', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonctions-2nde_P9', 'seconde_fonctions-2nde_P10', 'seconde_fonctions-2nde_P8'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Traduire' },
    { id: '06', number: 6, slug: 'une-fonction-en-morceaux', path: `${LESSON_BASE_PATH}/une-fonction-en-morceaux`, title: 'Une fonction en morceaux', desc: 'La piscine est fermée entre 12 h et 14 h : à 13 h, aucune image. Un ensemble de définition en deux morceaux — une réunion d’intervalles.', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonctions-2nde_P11', 'seconde_fonctions-2nde_P12', 'seconde_fonctions-2nde_P3'], color: 'purple', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Sonder la piscine' },
    { id: '07', number: 7, slug: 'atelier-modeliser', path: `${LESSON_BASE_PATH}/atelier-modeliser`, title: 'Atelier : modéliser', desc: 'Une feuille de 30 cm, un forfait par paliers, une courbe à lire : choisir la variable, écrire la fonction, répondre.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_fonctions-2nde_P10', 'seconde_fonctions-2nde_P4', 'seconde_fonctions-2nde_P5', 'seconde_fonctions-2nde_P7', 'seconde_fonctions-2nde_P9', 'seconde_fonctions-2nde_P11', 'seconde_fonctions-2nde_P12'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Modéliser' },
    { id: '08', number: 8, slug: 'mission-finale-la-boite', path: `${LESSON_BASE_PATH}/mission-finale-la-boite`, title: '🏆 Mission finale : la boîte', desc: 'Dix épreuves pour prouver que tu lis, calcules et traduis une fonction dans tous ses registres.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
