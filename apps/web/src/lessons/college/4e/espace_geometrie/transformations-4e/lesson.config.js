/**
 * Transformations — la translation (4e).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `transformations` du domaine « Espace et géométrie », rôle
 * « MAÎTRISE / RÉUTILISATION » dans la chaîne 5e → 4e.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_TRANSFORMATIONS_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 5 LPs de cette leçon (clé catalogue
 * '4e_transformations', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   4e_transformations-4e_P1  Reconnaître une translation à son glissement
 *   4e_transformations-4e_P2  Construire l'image d'un point par une translation
 *   4e_transformations-4e_P3  Construire l'image d'une figure par une translation
 *   4e_transformations-4e_P4  Relier une translation au parallélogramme qu'elle forme
 *   4e_transformations-4e_P5  Utiliser les propriétés conservées par une translation
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une translation est UN
 * glissement du plan, décrit par TROIS caractères et rien d'autre — une
 * direction, un sens, une longueur. Tous les points font EXACTEMENT le même
 * trajet, et c'est ce simultané qui distingue le glissement du demi-tour de
 * 5e : les traits [M M'] du glissement ne se croisent jamais, ceux du
 * demi-tour se croisent tous au même endroit.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`transformations-5e`, briques réutilisées en
 * `priorKnowledge`) : la symétrie centrale comme demi-tour, le centre comme
 * milieu de [M M'], la construction d'une image point par point, et les
 * invariants d'une transformation. La 4e n'y revient pas : elle ajoute la
 * transformation qui ne retourne rien, et le quadrilatère que ce glissement
 * fabrique — le parallélogramme, qui n'est pas une propriété ajoutée mais la
 * même chose vue deux fois.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. L'objet formel qui porte une
 * translation, sa notation, ses coordonnées, la loi qui compose deux
 * glissements et l'agrandissement-réduction sont des objets de 3e. La
 * frontière est EXÉCUTABLE : `components/translation4e.js` n'expose aucune de
 * ces fonctions, `assertScope4e` lève si on les demande, et
 * `translation4e.test.js` balaie le TEXTE SOURCE de toute la leçon pour
 * vérifier qu'aucun de ces mots n'atteint l'élève.
 *
 * Fil narratif : un tapis roulant qui fait glisser des caisses, puis un
 * carrelage dont chaque motif est la copie glissée du précédent.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/transformations-4e';

export const LESSON_CONFIG = {
  id: 'transformations-4e',
  sequentialUnlock: true,
  title: 'Transformations',
  description:
    "Faire glisser une figure en tirant la flèche du glissement, découvrir que tous ses points font le même trajet, construire l'image d'un point puis d'une figure entière, mesurer ce qui ne change pas, et reconnaître le parallélogramme que le glissement fabrique.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '➡️',
  estimatedDurationMin: 72,
  skills: [
    'Reconnaître une translation à son glissement',
    "Construire l'image d'un point par une translation",
    "Construire l'image d'une figure par une translation",
    'Relier une translation au parallélogramme qu’elle forme',
    'Utiliser les propriétés conservées par une translation',
  ],
  teachingScope: {
    include: [
      'La translation comme glissement du plan',
      'Les trois caractères d’un glissement : direction, sens, longueur',
      'Construire l’image d’un point par une translation',
      'Construire l’image d’une figure par une translation',
      'Les propriétés conservées : longueurs, angles, parallélisme, aires',
      'Le parallélogramme formé par un point, son image, et un second couple',
      'Distinguer une translation d’une symétrie centrale',
    ],
    exclude: [
      'L’objet formel qui porte une translation et sa notation fléchée (3e)',
      'Les coordonnées de cet objet dans un repère (3e)',
      'La loi qui compose deux glissements bout à bout (3e)',
      'L’agrandissement-réduction de rapport k (3e)',
      'La symétrie centrale comme objet d’étude (déjà installée en 5e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Aucune CHAÎNE DE CONTINUITÉ, et c'est délibéré : la figure change à chaque
  // module (un drapeau, un point isolé, un triangle, un quadrilatère scalène,
  // deux points, un carrelage) PARCE QUE le transfert d'une figure à l'autre
  // est l'objectif. Une translation vue sur un seul dessin resterait une
  // propriété de ce dessin. Ce qui persiste n'est pas un état, c'est le
  // glissement — redéfini à chaque module pour être reconnu ailleurs.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : les acquis de la 5e sur la symétrie centrale, et le vocabulaire
  // de géométrie plane de 6e dont la leçon se sert sans le réenseigner.
  priorKnowledge: [
    'symetrie-centrale', 'construire-image', 'invariants-symetrie',
    'parallelogramme', 'droites-paralleles', 'milieu-segment',
    'quadrilatere', 'diagonale', 'notation-segment', 'aire', 'perimetre',
    'angle-droit', 'axe-symetrie',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e sur le demi-tour.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-tapis-roulant', path: `${LESSON_BASE_PATH}/le-tapis-roulant`,
      title: 'Le tapis roulant', desc: 'Tire la flèche, la copie suit. Regarde les traits qui relient chaque sommet à sa copie — ils ne se croisent jamais.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_transformations-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Tirer la flèche',
    },
    {
      id: '02', number: 2, slug: 'le-trajet-dun-seul-point', path: `${LESSON_BASE_PATH}/le-trajet-dun-seul-point`,
      title: 'Le trajet d’un seul point', desc: 'Un point, une flèche modèle, et l’image à poser toi-même. Trois choses doivent coïncider.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_transformations-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Poser l’image',
    },
    {
      id: '03', number: 3, slug: 'toute-la-figure', path: `${LESSON_BASE_PATH}/toute-la-figure`,
      title: 'Toute la figure d’un coup', desc: 'Trois sommets, trois fois le même geste — et la figure entière a glissé.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_transformations-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire l’image',
    },
    {
      id: '04', number: 4, slug: 'ce-que-le-glissement-garde', path: `${LESSON_BASE_PATH}/ce-que-le-glissement-garde`,
      title: 'Ce que le glissement garde', desc: 'Envoie la copie où tu veux : quatre grandeurs mesurées refusent de bouger.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_transformations-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Mesurer les deux figures',
    },
    {
      id: '05', number: 5, slug: 'le-parallelogramme-cache', path: `${LESSON_BASE_PATH}/le-parallelogramme-cache`,
      title: 'Le parallélogramme caché', desc: 'Deux points et leurs images font un quadrilatère — mais dans quel ordre faut-il les relier ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_transformations-4e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Relier les quatre points',
    },
    {
      id: '06', number: 6, slug: 'latelier-des-trois-gestes', path: `${LESSON_BASE_PATH}/latelier-des-trois-gestes`,
      title: 'L’atelier des trois gestes', desc: 'Trois figures, trois copies : à toi de dire lequel des gestes a été fait.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_transformations-4e_P1', '4e_transformations-4e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Ouvrir l’atelier',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-carrelage', path: `${LESSON_BASE_PATH}/mission-finale-le-carrelage`,
      title: '🏆 Mission finale : le carrelage', desc: 'Dix épreuves pour prouver que tu maîtrises la translation.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
