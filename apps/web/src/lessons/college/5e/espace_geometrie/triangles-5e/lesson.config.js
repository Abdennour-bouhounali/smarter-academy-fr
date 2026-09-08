/**
 * Triangles — somme des angles, construction et droites remarquables (5e).
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `triangles` du domaine « Espace et géométrie », applicable à la 5e à
 * la rentrée 2026-2027.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '5e_triangles', append-only) :
 *
 *   5e_triangles-5e_P1  Utiliser la somme des angles d'un triangle égale à 180°
 *   5e_triangles-5e_P2  Calculer un angle manquant dans un triangle
 *   5e_triangles-5e_P3  Reconnaître si trois longueurs forment un triangle
 *   5e_triangles-5e_P4  Utiliser l'inégalité triangulaire
 *   5e_triangles-5e_P5  Construire un triangle à partir de données
 *   5e_triangles-5e_P6  Construire les médiatrices et le cercle circonscrit
 *   5e_triangles-5e_P7  Reconnaître une hauteur et une médiane
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un triangle n'est pas une forme
 * libre. Trois contraintes très fortes pèsent sur lui — ses angles totalisent
 * toujours 180°, ses côtés ne peuvent pas être quelconques, et ses droites
 * remarquables se rencontrent en des points qui n'ont aucune raison évidente
 * d'exister. Toute la leçon consiste à faire découvrir ces contraintes en
 * essayant de les violer.
 *
 * FIL NARRATIF : ce qu'on ne peut pas faire. Le module 1 laisse l'élève
 * déformer un triangle autant qu'il veut et constater que la somme des angles
 * ne bouge JAMAIS — le « wow » demandé. Le module 2 le fait démontrer, en
 * recollant les trois coins découpés. Les modules suivants découvrent les
 * autres impossibilités : trois longueurs qui refusent de fermer (M3), puis
 * les points de concours (M5) et l'égalité des aires (M6).
 *
 * PROGRESSION — manipuler, observer, conjecturer, justifier, formaliser,
 * réutiliser. Les deux démonstrations exigées par le programme (la somme des
 * angles, et la médiane qui partage en deux aires égales) sont chacune
 * PRÉCÉDÉES d'une recherche : on ne démontre jamais ce qui n'a pas d'abord été
 * conjecturé.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : le théorème de Pythagore (4e),
 * le théorème de Thalès (4e), la trigonométrie (4e/3e), le centre de gravité
 * et l'orthocentre comme points de concours démontrés (4e). Ces frontières ne
 * sont pas que documentaires : components/triangles.js LÈVE si l'on demande un
 * triangle dont les côtés violent l'inégalité triangulaire, ou un troisième
 * angle impossible — et les tests le vérifient.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/triangles-5e';

export const LESSON_CONFIG = {
  id: 'triangles-5e',
  sequentialUnlock: true,
  title: 'Triangles : angles, construction et droites remarquables',
  description:
    "Découvrir que la somme des angles d'un triangle ne bouge jamais, puis le démontrer en recollant les trois coins ; établir quelles longueurs peuvent former un triangle et lesquelles refusent de fermer ; construire un triangle à partir de données, rencontrer les médiatrices et le cercle circonscrit, distinguer hauteur et médiane, et démontrer qu'une médiane partage le triangle en deux aires égales.",
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 84,
  skills: [
    "Utiliser la somme des angles d'un triangle égale à 180°",
    'Calculer un angle manquant dans un triangle',
    'Reconnaître si trois longueurs forment un triangle',
    "Utiliser l'inégalité triangulaire",
    'Construire un triangle à partir de données',
    'Construire les médiatrices et le cercle circonscrit',
    'Reconnaître une hauteur et une médiane',
  ],
  teachingScope: {
    include: [
      'La somme des angles d’un triangle vaut 180°',
      'Le calcul d’un angle manquant',
      'L’inégalité triangulaire',
      'La construction d’un triangle à partir de données',
      'Les médiatrices et le cercle circonscrit',
      'Les hauteurs et les médianes',
      'La médiane partage le triangle en deux aires égales',
    ],
    exclude: [
      'Le théorème de Pythagore (4e)',
      'Le théorème de Thalès (4e)',
      'La trigonométrie (4e et 3e)',
      'Le centre de gravité et l’orthocentre démontrés (4e)',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, toutes diagnostiquées par le module 0 :
  // mesurer un angle, l'angle plat, le milieu d'un segment, les droites
  // perpendiculaires et l'aire d'un triangle — tout cela vient de la 6e.
  priorKnowledge: [
    'mesure-angle', 'angle-plat', 'milieu-segment', 'droites-perpendiculaires', 'aire-triangle',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-nombre-qui-ne-bouge-pas', path: `${LESSON_BASE_PATH}/le-nombre-qui-ne-bouge-pas`,
      title: 'Le nombre qui ne bouge pas', desc: 'Déforme le triangle autant que tu veux. Un nombre refuse de changer.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_triangles-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Déformer',
    },
    {
      id: '02', number: 2, slug: 'pourquoi-toujours-180', path: `${LESSON_BASE_PATH}/pourquoi-toujours-180`,
      title: 'Pourquoi toujours 180 ?', desc: 'Découpe les trois coins, recolle-les bout à bout — et vois ce qu’ils forment.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_triangles-5e_P1', '5e_triangles-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Démontrer',
    },
    {
      id: '03', number: 3, slug: 'trois-longueurs-qui-refusent', path: `${LESSON_BASE_PATH}/trois-longueurs-qui-refusent`,
      title: 'Trois longueurs qui refusent', desc: 'Certaines longueurs ne ferment jamais. Trouve où est la frontière.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_triangles-5e_P3', '5e_triangles-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Chercher la frontière',
    },
    {
      id: '04', number: 4, slug: 'construire-au-compas', path: `${LESSON_BASE_PATH}/construire-au-compas`,
      title: 'Construire au compas', desc: 'Trois longueurs, deux arcs de cercle, et le triangle apparaît.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_triangles-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Construire',
    },
    {
      id: '05', number: 5, slug: 'le-point-a-egale-distance', path: `${LESSON_BASE_PATH}/le-point-a-egale-distance`,
      title: 'Le point à égale distance', desc: 'Trois médiatrices qui se croisent au même endroit — et un cercle qui passe par les trois sommets.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_triangles-5e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Trouver le centre',
    },
    {
      id: '06', number: 6, slug: 'hauteur-ou-mediane', path: `${LESSON_BASE_PATH}/hauteur-ou-mediane`,
      title: 'Hauteur ou médiane ?', desc: 'Deux droites qu’on confond — et la médiane qui coupe le triangle en deux parts égales.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_triangles-5e_P7'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Les distinguer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-les-triangles', path: `${LESSON_BASE_PATH}/mission-finale-les-triangles`,
      title: '🏆 Mission finale : les triangles', desc: 'Dix épreuves pour prouver que le triangle n’a plus de secret.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
