/**
 * Statistiques — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `statistiques` du domaine « Données et probabilités », rôle
 * « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_STATISTIQUES_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '4e_statistiques', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   4e_statistiques-4e_P1  Calculer une moyenne pondérée
 *   4e_statistiques-4e_P2  Déterminer la médiane d'une série
 *   4e_statistiques-4e_P3  Interpréter la médiane comme valeur de partage
 *   4e_statistiques-4e_P4  Calculer l'étendue d'une série
 *   4e_statistiques-4e_P5  Distinguer ce que disent la moyenne et la médiane
 *   4e_statistiques-4e_P6  Comparer deux séries statistiques
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un seul nombre ne résume pas
 * une série. Trois résumés répondent à des questions DIFFÉRENTES, et la preuve
 * est qu'aucun ne suffit : on déplace une donnée sans que l'un d'eux bouge
 * d'un millième, et deux séries que l'un ne distingue pas, l'autre les sépare.
 * Le bon résumé ne dépend pas de la série, il dépend de la QUESTION.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`statistiques-5e`, briques réutilisées en
 * `priorKnowledge`) : la série, l'effectif, le tableau d'effectifs, la
 * fréquence, les deux diagrammes, la moyenne simple lue comme un partage
 * équitable, et l'interprétation d'un résultat. Son propre noyau REFUSE
 * d'aller plus loin : `assertScope5e('mediane')` y lève. La 4e ouvre l'autre
 * côté de cette frontière.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. Les quartiles, la boîte à
 * moustaches, l'écart type et la variance sont des objets de 3e puis de 2nde.
 * La frontière est EXÉCUTABLE : `components/stats4e.js` ne les exporte pas
 * (réexport NOMMÉ, jamais `export *`) et `assertScope4e` lève si on les
 * demande.
 *
 * Fil narratif : un observatoire de données de collège, puis un bulletin, une
 * classe qu'on coupe en deux, deux groupes, deux villes, et un sondage.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/donnees_probabilites/statistiques-4e';

export const LESSON_CONFIG = {
  id: 'statistiques-4e',
  sequentialUnlock: true,
  title: 'Statistiques',
  description:
    "Tirer une donnée et voir quels résumés la suivent, pondérer un bulletin par ses coefficients, couper un groupe en deux moitiés égales, mesurer l'écart entre les extrêmes, puis comparer deux séries que l'un des trois résumés ne distingue pas — et démasquer un diagramme dont l'axe ment.",
  level: 'college',
  grade: '4e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 80,
  skills: [
    'Calculer une moyenne pondérée',
    "Déterminer la médiane d'une série",
    'Interpréter la médiane comme valeur de partage',
    "Calculer l'étendue d'une série",
    'Distinguer ce que disent la moyenne et la médiane',
    'Comparer deux séries statistiques',
  ],
  teachingScope: {
    include: [
      'La moyenne pondérée par des coefficients',
      "La moyenne pondérée par des effectifs, sur un tableau d'effectifs",
      "La médiane d'une série, aux deux parités d'effectif",
      'La médiane comme valeur qui partage la série en deux moitiés de même taille',
      "L'étendue d'une série, écart entre la plus grande et la plus petite valeur",
      'Comparer deux séries en choisissant le résumé qui répond à la question posée',
      "Mettre en cause un diagramme dont l'axe ne démarre pas à zéro",
    ],
    exclude: [
      'Les quartiles et l’écart interquartile (3e)',
      'La boîte à moustaches (3e)',
      'L’écart type et la variance (2nde)',
      'Les classes et l’histogramme (3e)',
      'La série, l’effectif, la fréquence et les deux diagrammes comme objets d’étude (déjà installés en 5e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Aucune CHAÎNE DE CONTINUITÉ, et c'est un choix pédagogique, pas un oubli.
  // Le LP P6 demande de choisir un résumé EN FONCTION DE LA QUESTION : une
  // leçon qui garderait la même série du début à la fin laisserait croire que
  // le bon résumé est une propriété de la série. Chaque module a donc son
  // contexte propre — trajets, bulletin, classe, groupes, villes, sondage —
  // et le TRANSFERT d'un contexte à l'autre est précisément l'objectif.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : la série, l'effectif, le tableau d'effectifs, la fréquence, la
  // moyenne simple, les deux diagrammes et l'interprétation — les briques de
  // `statistiques-5e`, vérifiées une par une avant usage.
  priorKnowledge: [
    'serie-donnees', 'effectif', 'tableau-effectifs', 'frequence',
    'moyenne', 'diagramme-barres', 'diagramme-circulaire', 'interpreter',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'lobservatoire', path: `${LESSON_BASE_PATH}/lobservatoire`,
      title: 'L’observatoire',
      desc: 'Douze trajets sur un axe, trois résumés au-dessus. Tire une pastille et regarde lesquels la suivent.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_statistiques-4e_P5'],
      color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Ouvrir l’observatoire',
    },
    {
      id: '02', number: 2, slug: 'tous-les-devoirs-ne-pesent-pas-pareil',
      path: `${LESSON_BASE_PATH}/tous-les-devoirs-ne-pesent-pas-pareil`,
      title: 'Tous les devoirs ne pèsent pas pareil',
      desc: 'Glisse les coefficients d’un bulletin : la moyenne se déplace, et retrouve celle de 5e quand ils valent tous 1.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_statistiques-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Régler les coefficients',
    },
    {
      id: '03', number: 3, slug: 'couper-le-groupe-en-deux', path: `${LESSON_BASE_PATH}/couper-le-groupe-en-deux`,
      title: 'Couper le groupe en deux',
      desc: 'Déplace la coupure jusqu’à ce que les deux moitiés aient exactement le même effectif. Le nombre trouvé a un nom.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_statistiques-4e_P2', '4e_statistiques-4e_P3'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Couper le groupe',
    },
    {
      id: '04', number: 4, slug: 'du-plus-petit-au-plus-grand', path: `${LESSON_BASE_PATH}/du-plus-petit-au-plus-grand`,
      title: 'Du plus petit au plus grand',
      desc: 'Un seul nombre pour dire si les valeurs sont serrées ou éparpillées — et il ne regarde que les deux bouts.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_statistiques-4e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Mesurer l’écart',
    },
    {
      id: '05', number: 5, slug: 'deux-groupes-une-seule-moyenne', path: `${LESSON_BASE_PATH}/deux-groupes-une-seule-moyenne`,
      title: 'Deux groupes, une seule moyenne',
      desc: 'Rouge et Bleu ont la même moyenne ET le même écart entre les extrêmes. Un seul résumé les sépare.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_statistiques-4e_P6', '4e_statistiques-4e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer les groupes',
    },
    {
      id: '06', number: 6, slug: 'deux-villes-un-seul-milieu', path: `${LESSON_BASE_PATH}/deux-villes-un-seul-milieu`,
      title: 'Deux villes, un seul milieu',
      desc: 'La paire miroir : cette fois c’est le résumé qui sauvait la comparaison précédente qui devient aveugle.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_statistiques-4e_P6', '4e_statistiques-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Comparer les villes',
    },
    {
      id: '07', number: 7, slug: 'le-graphique-qui-ment', path: `${LESSON_BASE_PATH}/le-graphique-qui-ment`,
      title: 'Le graphique qui ment',
      desc: 'Glisse le départ de l’axe d’un sondage 48 / 52 et lis de combien l’écart paraît grossi.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_statistiques-4e_P6', '4e_statistiques-4e_P5'],
      color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Démasquer le trucage',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-lobservatoire', path: `${LESSON_BASE_PATH}/mission-finale-lobservatoire`,
      title: '🏆 Mission finale : l’observatoire',
      desc: 'Dix épreuves pour prouver que tu sais choisir et calculer le bon résumé.',
      stage: 'evaluation',
      color: 'slate', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
