/**
 * Racine carrée — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `racine_carree` du domaine « Nombres et calculs », applicable à la 4e
 * à la rentrée 2027-2028. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * REFONTE. Cette leçon existait déjà, écrite avant le kit : cinq modules
 * `ModuleLayout` en direct, sans module 0, sans carte des connaissances, sans
 * `priorKnowledge`, avec `totalModules` (champ retiré du contrat) et
 * `level: '4ème'` au lieu de `'college'`. Elle est ici reconstruite au
 * standard courant. Ses deux points d'apprentissage supplémentaires
 * (encadrement, x² = a) ont été AJOUTÉS EN FIN de `pointsToLearn` dans le
 * catalogue, jamais insérés : les ids P1 à P4 gardent leur sens.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon
 * (clé catalogue '4e_racine_carree', append-only) :
 *
 *   4e_racines-carrees-4e_P1  Comprendre la racine carrée
 *   4e_racines-carrees-4e_P2  Identifier les carrés parfaits
 *   4e_racines-carrees-4e_P3  Calculer des racines carrées simples
 *   4e_racines-carrees-4e_P4  Utiliser la racine carrée dans des problèmes
 *   4e_racines-carrees-4e_P5  Encadrer une racine carrée entre deux entiers consécutifs
 *   4e_racines-carrees-4e_P6  Résoudre une équation du type x² = a
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : on donne à l'élève un TAS de
 * carreaux et on lui demande d'en faire un carré. Certains nombres y
 * arrivent, d'autres laissent des carreaux orphelins. Chercher le côté quand
 * on connaît l'aire — voilà l'opération nouvelle ; les nombres qui tombent
 * juste sont exactement les carrés parfaits. Rien de tout cela n'est énoncé
 * avant que la manipulation ne l'ait produit.
 *
 * FRONTIÈRE AVEC LA 3e — la contrainte la plus forte de cette leçon. La leçon
 * `racines-carrees-3e` existe, elle est excellente, et son laboratoire
 * d'ouverture fait redimensionner un carré CONTINU jusqu'à une aire cible,
 * ce qui mène à l'irrationalité. La 4e ne peut donc pas rejouer ce geste :
 * elle compte des carreaux DISCRETS, ce qui est l'entrée naturelle d'une
 * INTRODUCTION. Et elle s'arrête là où la 3e commence — pas de produit ni de
 * quotient de racines, pas de simplification a√b, pas de comparaison par les
 * carrés. La garde est EXÉCUTABLE : `components/racines4e.js` n'expose aucune
 * de ces fonctions, et son test échoue si on les y ajoute.
 *
 * PÉRIMÈTRE — hors sujet ici : les opérations sur les racines et la
 * simplification (exclusions officielles du niveau, objets de 3e), et la
 * racine d'un nombre négatif (`racine` LÈVE plutôt que de renvoyer NaN).
 */
// Le dernier segment est l'ID DE LA LEÇON (`racines-carrees-4e`), pas le nom du
// dossier (`racines-carrees`, hérité d'avant la refonte). C'est l'id que
// `buildLesson` met dans le lien de la carte des cours : un chemin qui ne le
// reprend pas ne correspond à aucune route, et l'élève est renvoyé sur la page
// d'accueil sans la moindre erreur (memory: unrouted_lessons_silent_failure,
// lesson_path_domain_segment). La leçon de 3e suit la même règle.
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/racines-carrees-4e';

export const LESSON_CONFIG = {
  id: 'racines-carrees-4e',
  sequentialUnlock: true,
  title: 'Racine carrée',
  description:
    "Ranger des carreaux en carré pour découvrir que certains nombres y arrivent et d'autres non, nommer la racine carrée comme l'opération inverse du carré, reconnaître les carrés parfaits, encadrer une racine entre deux entiers consécutifs et résoudre x² = a.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '√',
  estimatedDurationMin: 71,
  skills: [
    'Comprendre la racine carrée',
    'Identifier les carrés parfaits',
    'Calculer des racines carrées simples',
    'Utiliser la racine carrée dans des problèmes',
    'Encadrer une racine carrée entre deux entiers consécutifs',
    'Résoudre une équation du type x² = a',
  ],
  teachingScope: {
    include: [
      'La racine carrée comme côté d’un carré d’aire donnée',
      'La racine carrée comme opération inverse du carré',
      'Les carrés parfaits de 0 à 144',
      'Le symbole √ et ce qu’il désigne',
      'L’encadrement de √n entre deux entiers consécutifs',
      'La résolution de x² = a, et ses DEUX solutions quand a > 0',
      'Des problèmes où l’on cherche une longueur à partir d’une aire',
    ],
    exclude: [
      'Le produit et le quotient de racines carrées (3e)',
      'La simplification a√b, par exemple √12 = 2√3 (3e)',
      'La comparaison de nombres contenant des racines, par les carrés (3e)',
      'La racine carrée d’un nombre négatif (exclusion officielle du niveau)',
      'Le théorème de Pythagore (objet officiel « Triangles »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : le carré et les puissances de 5e, l'aire de 6e, les
  // relatifs de 4e. Le module 0 les diagnostique.
  priorKnowledge: [
    'carre-cube', 'carres-parfaits', 'aire', 'puissance', 'regle-des-signes',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis sur les carrés.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-tas-de-carreaux', path: `${LESSON_BASE_PATH}/le-tas-de-carreaux`,
      title: 'Le tas de carreaux', desc: 'Range les carreaux en carré. Certains nombres y arrivent — d’autres pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P1', '4e_racines-carrees-4e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Ranger',
    },
    {
      id: '02', number: 2, slug: 'le-symbole', path: `${LESSON_BASE_PATH}/le-symbole`,
      title: 'Le symbole √', desc: 'Nommer l’opération qui remonte de l’aire au côté — et ce qu’elle refuse.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P1', '4e_racines-carrees-4e_P3'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Nommer',
    },
    {
      id: '03', number: 3, slug: 'les-carres-parfaits', path: `${LESSON_BASE_PATH}/les-carres-parfaits`,
      title: 'Les carrés parfaits', desc: 'Les treize nombres à connaître par cœur — et le réflexe qu’ils donnent.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P2', '4e_racines-carrees-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Mémoriser',
    },
    {
      id: '04', number: 4, slug: 'encadrer', path: `${LESSON_BASE_PATH}/encadrer`,
      title: 'Encadrer', desc: 'Et quand ça ne tombe pas juste ? On coince la racine entre deux entiers.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Encadrer',
    },
    {
      id: '05', number: 5, slug: 'x-au-carre-egale-a', path: `${LESSON_BASE_PATH}/x-au-carre-egale-a`,
      title: 'x² = a', desc: 'L’équation qui a DEUX solutions — et celle qui n’en a aucune.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P6'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '06', number: 6, slug: 'le-terrain-et-la-dalle', path: `${LESSON_BASE_PATH}/le-terrain-et-la-dalle`,
      title: 'Le terrain et la dalle', desc: 'Deux problèmes où l’on remonte d’une aire à une longueur.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_racines-carrees-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-carre', path: `${LESSON_BASE_PATH}/mission-finale-le-carre`,
      title: '🏆 Mission finale : le carré', desc: 'Dix épreuves pour prouver que tu maîtrises la racine carrée.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
