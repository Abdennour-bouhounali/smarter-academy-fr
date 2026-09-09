/**
 * Théorème de Pythagore — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `triangles` du domaine « Espace et géométrie », rôle
 * « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e.
 * Part 2 de la clé catalogue `4e_triangles` (part 1 = `triangles-4e`, la
 * démonstration : cercle circonscrit et droite des milieux).
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_PYTHAGORE_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '4e_triangles', part 2, append-only) :
 *
 *   4e_pythagore-4e_P1  Énoncer le théorème de Pythagore
 *   4e_pythagore-4e_P2  Calculer la longueur de l'hypoténuse
 *   4e_pythagore-4e_P3  Calculer la longueur d'un côté de l'angle droit
 *   4e_pythagore-4e_P4  Utiliser la réciproque pour prouver qu'un triangle est rectangle
 *   4e_pythagore-4e_P5  Utiliser la contraposée pour prouver qu'un triangle n'est pas rectangle
 *   4e_pythagore-4e_P6  Résoudre un problème avec le théorème de Pythagore
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : sur un triangle rectangle, le
 * carré construit sur l'hypoténuse est FAIT des deux autres. Pas « a pour aire
 * la somme » — littéralement fait : quatre copies du triangle laissent au
 * milieu un trou carré dont le côté EST l'hypoténuse. L'égalité des aires
 * précède l'égalité des nombres, qui précède la formule.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE `pythagore-3e`. La 3e fait des RELEVÉS sur
 * une balance d'aires, puis applique. La 4e DÉCOUPE et REMPLIT : même
 * mathématique, geste d'une autre nature, adapté à une introduction. La 3e
 * gardera l'application à l'espace et le choix de la relation dans des
 * configurations complexes.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : la géométrie dans l'espace,
 * le théorème de Thalès, la trigonométrie, le produit et le quotient de
 * racines. La frontière est EXÉCUTABLE : `components/pythagore4e.js` n'expose
 * aucune de ces fonctions et `assertScope4e` lève si on les demande.
 *
 * Fil narratif : un triangle qu'on déforme sans jamais casser son angle droit,
 * puis des longueurs à trouver là où personne ne les annonce.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/pythagore-4e';

export const LESSON_CONFIG = {
  id: 'pythagore-4e',
  sequentialUnlock: true,
  title: 'Théorème de Pythagore',
  description:
    "Déformer un triangle rectangle et voir trois aires changer sans que leur égalité ne bouge, casser l'angle droit pour voir la balance pencher, faire apparaître le carré de l'hypoténuse en posant quatre triangles, puis calculer une longueur et décider, sans figure, si un triangle est rectangle.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 80,
  skills: [
    'Énoncer le théorème de Pythagore',
    "Calculer la longueur de l'hypoténuse",
    "Calculer la longueur d'un côté de l'angle droit",
    'Utiliser la réciproque pour prouver qu’un triangle est rectangle',
    'Utiliser la contraposée pour prouver qu’un triangle n’est pas rectangle',
    'Résoudre un problème avec le théorème de Pythagore',
  ],
  teachingScope: {
    include: [
      'L’hypoténuse : le côté opposé à l’angle droit',
      'L’égalité des aires des trois carrés',
      'L’énoncé du théorème de Pythagore',
      'Calculer l’hypoténuse à partir des deux autres côtés',
      'Calculer un côté de l’angle droit',
      'La réciproque : décider qu’un triangle est rectangle',
      'La contraposée : décider qu’un triangle ne l’est pas',
      'Résoudre un problème réel (échelle, écran, terrain)',
    ],
    exclude: [
      'Le théorème de Pythagore dans l’espace (3e)',
      'Le théorème de Thalès (3e)',
      'La trigonométrie : cosinus, sinus, tangente (3e)',
      'Le produit et le quotient de racines carrées (3e)',
      'Le cercle circonscrit et la droite des milieux (leçon sœur « Triangles »)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : le triangle déformé au module 1 est CELUI qu'on
  // libère au module 2 — c'est la même figure, à laquelle on retire sa
  // contrainte. Au-delà, les modules ont besoin de triangles CHOISIS (3-4-5,
  // puis des cas qui ne tombent pas juste) : y imposer la continuité serait
  // artificiel et priverait la leçon de ses exemples.
  continuity: { key: 'triangle', chain: [1, 2] },
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : l'angle droit, l'aire d'un carré, le carré d'un nombre, la
  // racine carrée et son encadrement (leçon `racines-carrees-4e`).
  priorKnowledge: ['angle-droit', 'aire', 'carre-ou-pas', 'racine-carree', 'encadrer-une-racine'],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'les-trois-carres', path: `${LESSON_BASE_PATH}/les-trois-carres`,
      title: 'Les trois carrés', desc: 'Déforme le triangle : les trois aires changent, et pourtant la balance ne bouge pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_pythagore-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Déformer le triangle',
    },
    {
      id: '02', number: 2, slug: 'quand-langle-se-casse', path: `${LESSON_BASE_PATH}/quand-langle-se-casse`,
      title: 'Quand l’angle se casse', desc: 'Libère le sommet du cercle : la balance penche aussitôt, et dans les deux sens.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_pythagore-4e_P1', '4e_pythagore-4e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Casser l’angle droit',
    },
    {
      id: '03', number: 3, slug: 'le-puzzle', path: `${LESSON_BASE_PATH}/le-puzzle`,
      title: 'Le puzzle', desc: 'Quatre triangles posés dans un cadre : le trou qu’ils laissent est le carré de l’hypoténuse.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_pythagore-4e_P1'],
      color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Poser les pièces',
    },
    {
      id: '04', number: 4, slug: 'ecrire-puis-calculer', path: `${LESSON_BASE_PATH}/ecrire-puis-calculer`,
      title: 'Écrire, puis calculer', desc: 'De l’égalité des aires au nombre : trouver l’hypoténuse, et se méfier d’une addition trop simple.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_pythagore-4e_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '05', number: 5, slug: 'le-cote-manquant', path: `${LESSON_BASE_PATH}/le-cote-manquant`,
      title: 'Le côté manquant', desc: 'Même théorème, mais cette fois on soustrait.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_pythagore-4e_P3'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Retrouver le côté',
    },
    {
      id: '06', number: 6, slug: 'rectangle-ou-pas', path: `${LESSON_BASE_PATH}/rectangle-ou-pas`,
      title: 'Rectangle ou pas ?', desc: 'Trois longueurs, aucune figure fiable : à toi de décider — puis de t’en servir.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_pythagore-4e_P4', '4e_pythagore-4e_P5', '4e_pythagore-4e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Rendre le verdict',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-chantier', path: `${LESSON_BASE_PATH}/mission-finale-le-chantier`,
      title: '🏆 Mission finale : le chantier', desc: 'Dix épreuves pour prouver que tu maîtrises Pythagore.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
