/**
 * Repérage dans le plan — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `reperage` du domaine « Espace et géométrie », rôle
 * « APPROFONDISSEMENT » dans la chaîne 6e → 5e → 4e → 3e.
 * Clé catalogue `4e_reperage`.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md, section 4E ;
 * conception : docs/lessons/4E_REPERAGE_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 4 LPs de cette leçon (append-only, déjà
 * importés en base) :
 *
 *   4e_reperage-4e_P1  Lire des coordonnées décimales ou négatives
 *   4e_reperage-4e_P2  Choisir une graduation adaptée à des données
 *   4e_reperage-4e_P3  Placer un point dans un repère à graduation non unitaire
 *   4e_reperage-4e_P4  Utiliser les coordonnées pour résoudre un problème géométrique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : jusqu'ici le repère était
 * DONNÉ — un quadrillage tout prêt, une graduation de 1 en 1, des points qui
 * tombaient sur les nœuds. En 4e, le repère devient un CHOIX. On reçoit des
 * données réelles, et c'est l'élève qui décide de la graduation. Un mauvais
 * choix ne produit pas une erreur de calcul : il produit un graphique
 * ILLISIBLE — des relevés empilés sur le même point, ou un axe couvert de
 * traits qu'on ne peut plus compter.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE `reperage-5e`. La 5e a DÉJÀ ouvert les
 * quatre quadrants, les coordonnées négatives, et a même touché du doigt une
 * graduation non unitaire. Cette leçon ne re-enseigne donc JAMAIS « lire un
 * point » ni « le couple est ordonné » : ce sont des acquis, listés dans
 * `priorKnowledge` et diagnostiqués au module 0. Ce qui est neuf en 4e :
 * la coordonnée DÉCIMALE (entre deux graduations), le CHOIX de la graduation
 * pour un jeu de données réel, et l'USAGE des coordonnées pour trancher une
 * question géométrique.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : le repérage sur la SPHÈRE
 * (latitude, longitude), les coordonnées dans l'ESPACE, la formule du milieu
 * et celle de la longueur comme objets d'étude formels (tous réservés à
 * `reperage-droite-plan-3e`), et les vecteurs (2nde). La frontière est
 * EXÉCUTABLE : `components/reperage4e.js` n'expose aucune de ces fonctions,
 * `assertScope4e` lève si on les demande, et un test vérifie leur ABSENCE.
 * Conséquence de conception : le module 6 compare des CARRÉS de distances —
 * ce qui suffit à classer et évite d'écrire la moindre racine.
 *
 * Fil narratif : une journée de relevés qui ne tient pas dans le repère qu'on
 * lui donne, puis des points qu'on apprend à lire et à poser entre les traits,
 * puis des coordonnées qui tranchent une question de figure.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/reperage-4e';

export const LESSON_CONFIG = {
  id: 'reperage-4e',
  sequentialUnlock: true,
  title: 'Repérage dans le plan',
  description:
    "Recevoir douze relevés qui ne tiennent pas dans le repère proposé et choisir soi-même la graduation, lire un point qui tombe entre deux traits, en poser un quand une graduation ne vaut pas 1, puis se servir des coordonnées pour décider si un quadrilatère est un parallélogramme et quel refuge est le plus proche.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📍',
  estimatedDurationMin: 50,
  skills: [
    'Lire des coordonnées décimales ou négatives',
    'Choisir une graduation adaptée à des données',
    'Placer un point dans un repère à graduation non unitaire',
    'Utiliser les coordonnées pour résoudre un problème géométrique',
  ],
  teachingScope: {
    include: [
      'Lire une coordonnée qui tombe entre deux graduations',
      'Lire une coordonnée négative ou décimale',
      'Choisir la graduation d’un axe pour un jeu de données donné',
      'Reconnaître les trois défauts d’une graduation mal choisie',
      'Placer un point quand une graduation ne vaut pas 1',
      'Fermer un parallélogramme par le calcul sur les coordonnées',
      'Comparer des distances à partir des coordonnées',
    ],
    exclude: [
      'Le repérage sur la sphère : latitude et longitude (3e)',
      'Les coordonnées dans l’espace (3e)',
      'La formule du milieu comme objet d’étude formel (3e)',
      'La formule de la longueur d’un segment (3e)',
      'Les vecteurs et la colinéarité (2nde)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : le repère réglé au module 1 est CELUI dans lequel
  // on lit au module 2 — l'élève lit dans la grille qu'il vient lui-même de
  // choisir, ce qui donne son sens au module 2. Au-delà, les modules ont
  // besoin de jeux de données CHOISIS (des altitudes d'un autre ordre de
  // grandeur, puis un quadrilatère) : y imposer la continuité serait
  // artificiel et priverait la leçon de sa progression.
  continuity: { key: 'temperatures', chain: [1, 2] },
  // Connaissances SUPPOSÉES acquises (état A), toutes établies par
  // `reperage-5e` et toutes diagnostiquées par le module 0.
  priorKnowledge: [
    'repere', 'axes-origine', 'coordonnees', 'ordre-du-couple', 'lire-un-point',
    'placer-un-point', 'quadrant', 'sur-un-axe', 'echelle-graduation',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-journee-qui-ne-tient-pas', path: `${LESSON_BASE_PATH}/la-journee-qui-ne-tient-pas`,
      title: 'La journée qui ne tient pas', desc: 'Douze relevés, un repère qui ne convient pas. À toi de choisir la graduation.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_reperage-4e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Régler l’axe',
    },
    {
      id: '02', number: 2, slug: 'entre-deux-graduations', path: `${LESSON_BASE_PATH}/entre-deux-graduations`,
      title: 'Entre deux graduations', desc: 'Trois graduations, et pourtant 1,5 : compter ne suffit plus.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_reperage-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'Lire le point',
    },
    {
      id: '03', number: 3, slug: 'le-pas-quon-se-donne', path: `${LESSON_BASE_PATH}/le-pas-quon-se-donne`,
      title: 'Le pas qu’on se donne', desc: 'D’autres données, mille fois plus grandes — et exactement la même méthode.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_reperage-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 6, difficulty: 3, actionText: 'Transposer la méthode',
    },
    {
      id: '04', number: 4, slug: 'poser-un-point', path: `${LESSON_BASE_PATH}/poser-un-point`,
      title: 'Poser un point', desc: 'Aller à 1,5 quand une graduation vaut 0,5 : combien de graduations ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_reperage-4e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '05', number: 5, slug: 'le-quatrieme-sommet', path: `${LESSON_BASE_PATH}/le-quatrieme-sommet`,
      title: 'Le quatrième sommet', desc: 'Trois sommets donnés, un à trouver — et c’est le calcul qui le trouve.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_reperage-4e_P4', '4e_reperage-4e_P3'],
      color: 'purple', style: 'featured', estimatedMin: 7, difficulty: 4, actionText: 'Fermer la figure',
    },
    {
      id: '06', number: 6, slug: 'decider-par-les-coordonnees', path: `${LESSON_BASE_PATH}/decider-par-les-coordonnees`,
      title: 'Décider par les coordonnées', desc: 'Quel refuge est le plus proche ? Sans règle, sans compas — par les nombres.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_reperage-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 6, difficulty: 4, actionText: 'Trancher',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-carte', path: `${LESSON_BASE_PATH}/mission-finale-la-carte`,
      title: '🏆 Mission finale : la carte', desc: 'Dix épreuves pour prouver que tu maîtrises le repérage.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
