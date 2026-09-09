/**
 * Triangles : démontrer — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `triangles` du domaine « Espace et géométrie », rôle
 * « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e.
 * Part 1 de la clé catalogue `4e_triangles` (part 2 = `pythagore-4e`, le
 * théorème et ses calculs).
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_TRIANGLES_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 4 LPs de cette leçon (clé catalogue
 * '4e_triangles', part 1, append-only) :
 *
 *   4e_triangles-4e_P1  Caractériser le triangle rectangle par son cercle circonscrit
 *   4e_triangles-4e_P2  Utiliser la droite des milieux
 *   4e_triangles-4e_P3  Distinguer une propriété et sa réciproque
 *   4e_triangles-4e_P4  Rédiger une démonstration géométrique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une propriété géométrique est
 * un CHEMIN À SENS UNIQUE, et le chemin inverse est une AUTRE affirmation
 * qu'il faut vérifier séparément. L'élève ne l'apprend pas comme une règle de
 * logique : il la rencontre sur deux configurations où les deux sens sont
 * vrais (le cercle circonscrit, la droite des milieux), puis sur des énoncés
 * où la réciproque tombe. Le mot « réciproque » arrive après le constat.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE SA SŒUR `pythagore-4e`. Les deux partagent
 * l'objet officiel et la clé catalogue, mais pas la question. Chez Pythagore,
 * l'angle droit est une HYPOTHÈSE qu'on préserve pour observer des aires : le
 * sommet mobile est contraint au cercle, et la contrainte est montrée. Ici,
 * l'angle droit est la CIBLE : le sommet est LIBRE, et l'élève cherche la
 * position où deux témoins indépendants se mettent d'accord. Cette leçon peut
 * CITER Pythagore comme acquis ; elle ne le réenseigne jamais.
 *
 * CE QUI LA DISTINGUE DE `triangles-3e`. La 3e possède déjà une brique
 * `droite-des-milieux` et une brique `conjecturer-puis-prouver` : elle
 * RÉINVESTIT ces propriétés dans des configurations composées. La 4e les
 * ÉTABLIT, en faisant chercher la propriété avant de l'énoncer. Même
 * architecture, jamais les mêmes mathématiques au même endroit — c'est la
 * règle « inspiration inter-niveaux » du dépôt.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : le théorème de Thalès, la
 * trigonométrie (3e), et le calcul par le théorème de Pythagore (leçon sœur).
 * La frontière est EXÉCUTABLE : `components/triangles4e.js` n'expose aucune de
 * ces fonctions et `assertScope4e` lève si on les demande.
 *
 * Fil narratif : le bureau du détective — on ne croit pas ce qu'on voit, on
 * établit ce qu'on peut prouver.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/triangles-4e';

export const LESSON_CONFIG = {
  id: 'triangles-4e',
  sequentialUnlock: true,
  title: 'Triangles : démontrer',
  description:
    "Chercher où un triangle devient rectangle en regardant son cercle circonscrit, découvrir que le segment joignant deux milieux est parallèle au troisième côté et en mesure la moitié, apprendre qu'une propriété et sa réciproque sont deux affirmations différentes, puis rédiger une vraie démonstration.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 78,
  skills: [
    'Caractériser le triangle rectangle par son cercle circonscrit',
    'Utiliser la droite des milieux',
    'Distinguer une propriété et sa réciproque',
    'Rédiger une démonstration géométrique',
  ],
  teachingScope: {
    include: [
      'Le cercle circonscrit d’un triangle rectangle et son centre',
      'Le triangle rectangle inscrit dans un cercle dont un côté est un diamètre',
      'La médiane issue de l’angle droit vaut la moitié de l’hypoténuse',
      'La droite des milieux : parallélisme et moitié de longueur',
      'La réciproque de la droite des milieux',
      'Distinguer définition, propriété et caractérisation',
      'Rédiger une démonstration : donnée, propriété, conclusion',
    ],
    exclude: [
      'Le théorème de Thalès (3e)',
      'La trigonométrie : cosinus, sinus, tangente (3e)',
      'Le théorème de Pythagore et ses calculs (leçon sœur « pythagore-4e »)',
      'Les angles inscrits et l’angle au centre (lycée)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : le triangle que l'élève rend rectangle au module 1
  // est CELUI qu'il retourne au module 2 — on y part du cercle pour retrouver
  // l'angle droit, exactement à l'envers du chemin parcouru. Au-delà, les
  // modules 3 à 6 travaillent sur des configurations CHOISIES (des milieux,
  // des énoncés à trier, une preuve à écrire) : y imposer la continuité serait
  // artificiel et priverait la leçon de ses contre-exemples.
  continuity: { key: 'triangle', chain: [1, 2] },
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : les acquis de 5e sur le triangle (`triangles-5e`) et le
  // vocabulaire de géométrie plane de 6e dont la leçon se sert sans le
  // réenseigner.
  priorKnowledge: [
    'mediatrices-cercle-circonscrit', 'somme-angles-triangle', 'inegalite-triangulaire',
    'mediatrice', 'milieu-segment', 'droites-paralleles', 'droites-perpendiculaires',
    'notation-segment', 'angle-droit', 'triangle-rectangle', 'quadrilatere', 'diagonale',
  ],
  // NOTE. `triangle-rectangle` figure ici, et pas dans la carte : SAVOIR ce
  // qu'est un triangle rectangle est un acquis de 6e (« il a un angle droit »).
  // Ce que la 4e ajoute n'est pas la notion mais sa CARACTÉRISATION par le
  // cercle circonscrit — c'est-à-dire un nouveau moyen de la RECONNAÎTRE.
  // Le module 0 le diagnostique.
  /**
   * FAUX AMIS DU LEXIQUE, écartés nommément.
   *
   * L'audit des connaissances scanne un lexique de termes français. Deux
   * d'entre eux se déclenchent ici sur des mots qui n'ont RIEN à voir avec la
   * notion qu'ils désignent — et les taire globalement enterrerait de vraies
   * trouvailles. On les écarte donc un par un, avec leur raison.
   */
  knowledgeAudit: {
    ignore: [
      {
        term: 'mediane-stat',
        reason: 'La « médiane » de cette leçon est le segment joignant un sommet au milieu du côté opposé — un objet de géométrie de 5e, sans rapport avec la médiane statistique de 3e que le lexique vise.',
      },
      {
        term: 'issue-evenement',
        reason: 'Le mot « issue » n’apparaît que dans « la médiane ISSUE de C », au sens de « qui part de ». Ce n’est pas l’issue d’une expérience aléatoire, notion de probabilités que le lexique vise.',
      },
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-cercle-qui-trahit', path: `${LESSON_BASE_PATH}/le-cercle-qui-trahit`,
      title: 'Le cercle qui trahit', desc: 'Déplace le sommet C jusqu’à ce que l’angle devienne droit. Regarde alors où se trouve le centre du cercle.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_triangles-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Mener l’enquête',
    },
    {
      id: '02', number: 2, slug: 'le-demi-tour-du-detective', path: `${LESSON_BASE_PATH}/le-demi-tour-du-detective`,
      title: 'Le demi-tour du détective', desc: 'Le même fait, lu à l’envers : pars du cercle et retrouve l’angle droit.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_triangles-4e_P1', '4e_triangles-4e_P3'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Faire demi-tour',
    },
    {
      id: '03', number: 3, slug: 'deux-milieux-une-droite', path: `${LESSON_BASE_PATH}/deux-milieux-une-droite`,
      title: 'Deux milieux, une droite', desc: 'Joins les milieux de deux côtés, déforme tout ce que tu veux : deux nombres refusent de bouger.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_triangles-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Relever les nombres',
    },
    {
      id: '04', number: 4, slug: 'et-dans-lautre-sens', path: `${LESSON_BASE_PATH}/et-dans-lautre-sens`,
      title: 'Et dans l’autre sens ?', desc: 'Cette fois, c’est le parallélisme qui est donné. Le point est-il forcément un milieu ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_triangles-4e_P2', '4e_triangles-4e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Chercher la position',
    },
    {
      id: '05', number: 5, slug: 'le-tri-du-detective', path: `${LESSON_BASE_PATH}/le-tri-du-detective`,
      title: 'Le tri du détective', desc: 'Huit énoncés sur le bureau. Lesquels se retournent, lesquels non ?',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_triangles-4e_P3'],
      color: 'purple', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Trier les énoncés',
    },
    {
      id: '06', number: 6, slug: 'rediger-la-preuve', path: `${LESSON_BASE_PATH}/rediger-la-preuve`,
      title: 'Rédiger la preuve', desc: 'Assemble une vraie démonstration : ce qu’on te donne, la propriété que tu invoques, ce que tu conclus.',
      // `practice_lab` et non `manipulation` : on n'y découvre plus rien, on
      // ENTRAÎNE la rédaction sur des propriétés déjà établies — et une preuve
      // mal assemblée doit pouvoir se défaire et se refaire sans jamais
      // compter comme preuve de maîtrise.
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_triangles-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 13, difficulty: 4, actionText: 'Écrire la preuve',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-dossier', path: `${LESSON_BASE_PATH}/mission-finale-le-dossier`,
      title: '🏆 Mission finale : le dossier', desc: 'Dix épreuves pour clore l’enquête.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Clore le dossier',
    },
  ],
};
