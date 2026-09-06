/**
 * Repérage sur une droite et dans le plan — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 10 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_reperage', append-only) :
 *
 *   3e_reperage-droite-plan-3e_P1   Repérer un point sur une droite graduée
 *   3e_reperage-droite-plan-3e_P2   Lire et utiliser les coordonnées d'un point dans le plan
 *   3e_reperage-droite-plan-3e_P3   Identifier l'abscisse et l'ordonnée d'un point
 *   3e_reperage-droite-plan-3e_P4   Placer un point à partir de ses coordonnées
 *   3e_reperage-droite-plan-3e_P5   Déterminer les coordonnées d'un point à partir d'une représentation
 *   3e_reperage-droite-plan-3e_P6   Interpréter les coordonnées comme des déplacements dans le plan
 *   3e_reperage-droite-plan-3e_P7   Utiliser les coordonnées pour déterminer des longueurs simples
 *   3e_reperage-droite-plan-3e_P8   Utiliser les coordonnées pour étudier des configurations géométriques
 *   3e_reperage-droite-plan-3e_P9   Résoudre des problèmes géométriques à l'aide du repérage
 *   3e_reperage-droite-plan-3e_P10  Interpréter une situation géométrique à partir de coordonnées
 *
 * L'IDÉE CENTRALE, découverte et jamais annoncée : chaque coordonnée commande
 * UN déplacement, et un seul. La leçon ne commence donc pas par « le premier
 * nombre est l'abscisse » mais par deux réglages séparés (module 2) : l'élève
 * bouge x, et seul l'horizontal change. L'ordre du couple devient alors une
 * conséquence observable, pas une règle à retenir — d'où le fantôme de
 * (y ; x) qui atterrit ailleurs.
 *
 * PÉRIMÈTRE : quatre quadrants, coordonnées relatives, pas et demi-pas. La
 * longueur d'un segment n'est calculée que s'il est horizontal ou vertical
 * (`axisDistance` renvoie null sinon) : la distance oblique demande Pythagore,
 * qui est une autre leçon. Le repérage sur la sphère (latitude/longitude) et
 * les coordonnées dans l'espace sont hors périmètre.
 *
 * Fil narratif unique : « la carte du parc », repère centré sur la fontaine,
 * reprise figée dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/reperage-droite-plan-3e';

export const LESSON_CONFIG = {
  id: 'reperage-droite-plan-3e',
  // Formalisation continue par la carte des connaissances.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, diagnostiquées par le module 0. Ni
  // « abscisse » ni « ordonnée » n'y figurent : ce sont précisément la matière
  // de cette leçon (teachingScope.include), et des briques les posent.
  priorKnowledge: ['nombres-relatifs', 'ordre-nombres', 'calcul-numerique', 'moyenne'],
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Repérage sur une droite et dans le plan',
  description:
    "Placer un point sur une droite graduée, puis découvrir dans un repère que chaque coordonnée commande un seul déplacement — et se servir enfin des coordonnées pour mesurer, construire et raisonner.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🗺️',
  estimatedDurationMin: 85,
  skills: [
    'Repérer un point sur une droite graduée',
    "Lire et utiliser les coordonnées d'un point dans le plan",
    "Identifier l'abscisse et l'ordonnée d'un point",
    'Placer un point à partir de ses coordonnées',
    "Déterminer les coordonnées d'un point à partir d'une représentation",
    'Interpréter les coordonnées comme des déplacements dans le plan',
    'Utiliser les coordonnées pour déterminer des longueurs simples',
    'Utiliser les coordonnées pour étudier des configurations géométriques',
    "Résoudre des problèmes géométriques à l'aide du repérage",
    'Interpréter une situation géométrique à partir de coordonnées',
  ],
  teachingScope: {
    include: [
      'Abscisse sur une droite graduée, y compris négative et décimale',
      'Repère du plan à quatre quadrants, abscisse et ordonnée',
      'Lecture et placement de points, ordre du couple',
      'Coordonnées comme déplacements horizontaux et verticaux',
      'Longueur d’un segment horizontal ou vertical, milieu',
      'Rectangles, triangles isocèles et symétries lus sur les coordonnées',
    ],
    exclude: [
      'Distance entre deux points quelconques (demande Pythagore)',
      'Repérage sur la sphère (latitude, longitude)',
      "Coordonnées dans l'espace",
      'Équations de droites et coefficient directeur',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-droite-du-parc', path: `${LESSON_BASE_PATH}/la-droite-du-parc`,
      title: 'L’allée du parc', desc: '« À 3 de la fontaine » : deux endroits répondent. Il manque quelque chose.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_reperage-droite-plan-3e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Explorer l’allée',
    },
    {
      id: '02', number: 2, slug: 'un-seul-curseur-a-la-fois', path: `${LESSON_BASE_PATH}/un-seul-curseur-a-la-fois`,
      title: 'Un seul curseur à la fois', desc: 'Bouge x : seul l’horizontal change. Bouge y : seul le vertical. Voilà pourquoi l’ordre compte.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_reperage-droite-plan-3e_P3', '3e_reperage-droite-plan-3e_P6', '3e_reperage-droite-plan-3e_P2',
      ],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Bouger les curseurs',
    },
    {
      id: '03', number: 3, slug: 'lire-un-point', path: `${LESSON_BASE_PATH}/lire-un-point`,
      title: 'Lire un point', desc: 'Deux guides qui se croisent sur le point : la lecture se construit, elle ne se devine pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_reperage-droite-plan-3e_P5', '3e_reperage-droite-plan-3e_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Lire la carte',
    },
    {
      id: '04', number: 4, slug: 'placer-et-echanger', path: `${LESSON_BASE_PATH}/placer-et-echanger`,
      title: 'Placer, et ne pas échanger', desc: 'Place le point demandé — et regarde où atterrit le couple inversé.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_reperage-droite-plan-3e_P4', '3e_reperage-droite-plan-3e_P6'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '05', number: 5, slug: 'des-longueurs-sans-regle', path: `${LESSON_BASE_PATH}/des-longueurs-sans-regle`,
      title: 'Des longueurs sans règle', desc: 'Un côté horizontal ? Sa longueur est déjà dans les coordonnées.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_reperage-droite-plan-3e_P7'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Mesurer',
    },
    {
      id: '06', number: 6, slug: 'a-retenir', path: `${LESSON_BASE_PATH}/a-retenir`,
      title: 'Ce qu’on retient', desc: 'Trois règles, toutes issues de ce que tu viens de faire bouger.',
      stage: 'formalization',
      teachesLearningPointIds: [
        '3e_reperage-droite-plan-3e_P3', '3e_reperage-droite-plan-3e_P7', '3e_reperage-droite-plan-3e_P2',
      ],
      color: 'blue', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Formaliser',
    },
    {
      id: '07', number: 7, slug: 'figures-dans-le-repere', path: `${LESSON_BASE_PATH}/figures-dans-le-repere`,
      title: 'Des figures dans le repère', desc: 'Compléter un rectangle, prouver qu’un triangle est isocèle, retrouver un symétrique.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_reperage-droite-plan-3e_P8', '3e_reperage-droite-plan-3e_P9', '3e_reperage-droite-plan-3e_P10',
      ],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-la-carte', path: `${LESSON_BASE_PATH}/mission-finale-la-carte`,
      title: '🏆 Mission finale : la carte du parc', desc: 'Dix épreuves pour prouver qu’aucun point ne t’échappe.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
