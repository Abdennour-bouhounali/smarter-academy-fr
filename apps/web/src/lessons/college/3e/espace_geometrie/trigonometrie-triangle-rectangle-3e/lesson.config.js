/**
 * Trigonométrie dans le triangle rectangle — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 14 LPs de cette leçon (clé catalogue '3e_trigonometrie') :
 *
 *   P1  Reconnaître un triangle rectangle
 *   P2  Identifier l'angle étudié
 *   P3  Identifier le côté opposé à un angle
 *   P4  Identifier le côté adjacent à un angle
 *   P5  Identifier l'hypoténuse
 *   P6  Comprendre qu'un rapport de longueurs dépend de l'angle considéré
 *   P7  Comprendre et utiliser le sinus d'un angle
 *   P8  Comprendre et utiliser le cosinus d'un angle
 *   P9  Comprendre et utiliser la tangente d'un angle
 *   P10 Choisir le rapport trigonométrique adapté à une situation
 *   P11 Calculer une longueur dans un triangle rectangle
 *   P12 Calculer un angle à partir d'un rapport trigonométrique
 *   P13 Utiliser la calculatrice pour les fonctions trigonométriques
 *   P14 Résoudre des problèmes concrets utilisant la trigonométrie
 * (préfixe complet : 3e_trigonometrie-triangle-rectangle-3e_P<n>)
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un rapport de longueurs ne
 * dépend QUE de l'angle. Les modules 1 et 3 le font constater — deux rampes
 * de tailles différentes donnent le même quotient, puis un même triangle
 * agrandi trois fois donne trois fois les mêmes rapports. Les mots « sinus »,
 * « cosinus » et « tangente » n'apparaissent qu'au module 4, une fois qu'il y
 * a quelque chose à nommer.
 *
 * SECONDE IDÉE, tout aussi piégeuse : « opposé » et « adjacent » sont des
 * RÔLES relatifs à l'angle étudié, pas des noms de côtés. Le module 2 fait
 * basculer l'angle de référence et montre les deux rôles s'échanger.
 *
 * CONVENTION D'ANGLE : documentée dans components/trigoUtils.js (degrés,
 * angle étudié au sommet A, angle droit en B). geometry2d.js ne porte aucune
 * convention d'angle, conformément à son en-tête.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : triangle rectangle uniquement.
 * Ni cercle trigonométrique, ni loi des sinus, ni triangle quelconque.
 *
 * Fil narratif unique : « les pentes », de la rampe d'accès à la route de
 * montagne, repris figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/trigonometrie-triangle-rectangle-3e';

export const LESSON_CONFIG = {
  id: 'trigonometrie-triangle-rectangle-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Trigonométrie dans le triangle rectangle',
  description:
    "Découvrir que deux rampes de tailles différentes ont la même pente, constater qu'agrandir un triangle ne change aucun de ses rapports, puis nommer sinus, cosinus et tangente et s'en servir pour calculer longueurs et angles.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 87,
  skills: [
    'Reconnaître un triangle rectangle',
    "Identifier l'angle étudié",
    'Identifier le côté opposé à un angle',
    'Identifier le côté adjacent à un angle',
    "Identifier l'hypoténuse",
    "Comprendre qu'un rapport de longueurs dépend de l'angle considéré",
    "Comprendre et utiliser le sinus d'un angle",
    "Comprendre et utiliser le cosinus d'un angle",
    "Comprendre et utiliser la tangente d'un angle",
    'Choisir le rapport trigonométrique adapté à une situation',
    'Calculer une longueur dans un triangle rectangle',
    "Calculer un angle à partir d'un rapport trigonométrique",
    'Utiliser la calculatrice pour les fonctions trigonométriques',
    'Résoudre des problèmes concrets utilisant la trigonométrie',
  ],
  teachingScope: {
    include: [
      'Rôles relatifs des trois côtés selon l’angle étudié',
      'Invariance des rapports par agrandissement',
      'Sinus, cosinus, tangente : définitions et bornes',
      'Choix du rapport à partir du côté connu et du côté cherché',
      'Calcul d’une longueur, calcul d’un angle (touches inverses)',
      'Problèmes concrets : rampe, échelle, hauteur par visée',
    ],
    exclude: [
      'Cercle trigonométrique',
      'Trigonométrie dans le triangle quelconque, loi des sinus',
      'Relations trigonométriques (formules d’addition)',
      'Radians',
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
      id: '01', number: 1, slug: 'deux-rampes', path: `${LESSON_BASE_PATH}/deux-rampes`,
      title: 'Deux rampes', desc: 'Deux tailles, une seule pente : un quotient les rend identiques.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P6'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Comparer',
    },
    {
      id: '02', number: 2, slug: 'nommer-les-cotes', path: `${LESSON_BASE_PATH}/nommer-les-cotes`,
      title: 'Nommer les côtés', desc: 'Change d’angle étudié : opposé et adjacent s’échangent.',
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_trigonometrie-triangle-rectangle-3e_P1', '3e_trigonometrie-triangle-rectangle-3e_P2',
        '3e_trigonometrie-triangle-rectangle-3e_P3', '3e_trigonometrie-triangle-rectangle-3e_P4',
        '3e_trigonometrie-triangle-rectangle-3e_P5',
      ],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Nommer',
    },
    {
      id: '03', number: 3, slug: 'le-rapport-ne-depend-que-de-langle', path: `${LESSON_BASE_PATH}/le-rapport-ne-depend-que-de-langle`,
      title: 'Le rapport ne dépend que de l’angle', desc: 'Agrandir ne change rien, incliner change tout.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P6'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Agrandir',
    },
    {
      id: '04', number: 4, slug: 'trois-rapports-trois-noms', path: `${LESSON_BASE_PATH}/trois-rapports-trois-noms`,
      title: 'Trois rapports, trois noms', desc: 'Sinus, cosinus, tangente — enfin nommés.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_trigonometrie-triangle-rectangle-3e_P7', '3e_trigonometrie-triangle-rectangle-3e_P8',
        '3e_trigonometrie-triangle-rectangle-3e_P9',
      ],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Nommer',
    },
    {
      id: '05', number: 5, slug: 'calculer-une-longueur', path: `${LESSON_BASE_PATH}/calculer-une-longueur`,
      title: 'Calculer une longueur', desc: 'Le rapport ne se devine pas : il se déduit des deux côtés.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_trigonometrie-triangle-rectangle-3e_P10', '3e_trigonometrie-triangle-rectangle-3e_P11',
      ],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '06', number: 6, slug: 'choisir-puis-resoudre', path: `${LESSON_BASE_PATH}/choisir-puis-resoudre`,
      title: 'Choisir, puis résoudre', desc: 'Et le chemin inverse : remonter du rapport à l’angle.',
      stage: 'formalization',
      teachesLearningPointIds: [
        '3e_trigonometrie-triangle-rectangle-3e_P12', '3e_trigonometrie-triangle-rectangle-3e_P13',
      ],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'angles-et-pentes', path: `${LESSON_BASE_PATH}/angles-et-pentes`,
      title: 'Angles et pentes', desc: 'Une rampe, une échelle, un arbre — et le piège du pourcentage.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_trigonometrie-triangle-rectangle-3e_P14', '3e_trigonometrie-triangle-rectangle-3e_P11',
      ],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-les-pentes', path: `${LESSON_BASE_PATH}/mission-finale-les-pentes`,
      title: '🏆 Mission finale : les pentes', desc: 'Dix épreuves pour prouver que tu maîtrises la trigonométrie.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
