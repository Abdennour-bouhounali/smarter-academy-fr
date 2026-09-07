/**
 * Nombres relatifs — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `nombres_relatifs` du domaine « Nombres et calculs », applicable à la
 * 5e à la rentrée 2026-2027. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 8 LPs de cette leçon
 * (clé catalogue '5e_nombres_relatifs', append-only) :
 *
 *   5e_nombres-relatifs-5e_P1  Identifier un nombre positif, négatif ou nul dans une situation
 *   5e_nombres-relatifs-5e_P2  Placer et lire un nombre relatif sur une droite graduée
 *   5e_nombres-relatifs-5e_P3  Reconnaître l'opposé d'un nombre relatif
 *   5e_nombres-relatifs-5e_P4  Interpréter la valeur absolue comme une distance à zéro
 *   5e_nombres-relatifs-5e_P5  Comparer et ranger des nombres relatifs
 *   5e_nombres-relatifs-5e_P6  Additionner deux nombres relatifs
 *   5e_nombres-relatifs-5e_P7  Soustraire un nombre relatif
 *   5e_nombres-relatifs-5e_P8  Contrôler le signe d'un résultat par la droite graduée
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un nombre relatif est une
 * POSITION sur un axe gradué qui ne s'arrête pas à zéro, et additionner ou
 * soustraire, c'est SE DÉPLACER sur cet axe. Le signe du nombre dit de quel
 * côté de zéro on est ; le signe de l'opération dit dans quel sens on va.
 *
 * Fil narratif unique : « l'ascenseur du parking » — un immeuble dont les
 * étages montent au-dessus du sol et descendent en sous-sol. Le sol est le
 * zéro. Il ouvre la leçon (M1), sa cabine devient une droite graduée (M2),
 * et il revient dans la synthèse du test final.
 *
 * PÉRIMÈTRE — ce que la 5e ne fait PAS (réservé à la 4e, objet officiel
 * `nombres_relatifs` de 4e) : multiplier et diviser des relatifs, la règle
 * des signes, les priorités opératoires sur des relatifs.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/nombres_calculs/nombres-relatifs-5e';

export const LESSON_CONFIG = {
  id: 'nombres-relatifs-5e',
  sequentialUnlock: true,
  title: 'Nombres relatifs',
  description:
    "Piloter l'ascenseur d'un immeuble qui descend en sous-sol, découvrir que les étages continuent en dessous de zéro, puis lire et placer ces nombres sur une droite graduée, reconnaître l'opposé, mesurer une distance à zéro, comparer, et enfin additionner et soustraire en se déplaçant.",
  level: 'college',
  grade: '5e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🌡️',
  estimatedDurationMin: 75,
  skills: [
    "Identifier un nombre positif, négatif ou nul dans une situation",
    "Placer et lire un nombre relatif sur une droite graduée",
    "Reconnaître l'opposé d'un nombre relatif",
    "Interpréter la valeur absolue comme une distance à zéro",
    "Comparer et ranger des nombres relatifs",
    "Additionner deux nombres relatifs",
    "Soustraire un nombre relatif",
    "Contrôler le signe d'un résultat par la droite graduée",
  ],
  teachingScope: {
    include: [
      "Nombres positifs, négatifs et zéro ; le signe comme côté de zéro",
      "Lire et placer un relatif sur une droite graduée",
      "Opposé d'un nombre : même distance à zéro, de l'autre côté",
      "Valeur absolue comme distance à zéro",
      "Comparer et ranger des relatifs (l'ordre suit la droite graduée)",
      "Additionner deux relatifs comme un déplacement",
      "Soustraire un relatif comme le déplacement inverse",
    ],
    exclude: [
      "Multiplier et diviser des nombres relatifs (objet officiel de 4e)",
      "La règle des signes (4e)",
      "Les priorités opératoires avec des relatifs (4e)",
      "Les puissances d'exposant négatif (4e)",
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes venues de la 6e et toutes diagnostiquées par le
  // module 0 : lire une graduation, comparer deux nombres positifs, lire une
  // abscisse, et le sens de l'addition et de la soustraction sur les entiers.
  priorKnowledge: [
    'droite-graduee', 'abscisse', 'comparaison', 'addition', 'soustraction', 'ecart',
  ],
  knowledgeAudit: {
    ignore: [
      // Module 0, question 3 : « Range dans l'ordre croissant » est le
      // rangement de nombres de la 6e — le scanner du lexique y voit le terme
      // « croissante » des VARIATIONS d'une fonction (2nde), qui n'a rien à
      // voir. Même faux positif, même traitement que statistiques-3e.
      { term: 'variations', reason: "« ordre croissant » — rangement de nombres de 6e, pas les variations d'une fonction" },
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
      id: '01', number: 1, slug: 'l-ascenseur-du-parking', path: `${LESSON_BASE_PATH}/l-ascenseur-du-parking`,
      title: 'L’ascenseur du parking', desc: 'Descends sous le sol : les étages ne s’arrêtent pas à zéro.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Piloter l’ascenseur',
    },
    {
      id: '02', number: 2, slug: 'la-droite-des-nombres', path: `${LESSON_BASE_PATH}/la-droite-des-nombres`,
      title: 'La droite des nombres', desc: 'Couche l’ascenseur : place et lis des relatifs, trouve l’opposé, mesure la distance à zéro.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P2', '5e_nombres-relatifs-5e_P3', '5e_nombres-relatifs-5e_P4'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Placer et lire',
    },
    {
      id: '03', number: 3, slug: 'qui-est-le-plus-grand', path: `${LESSON_BASE_PATH}/qui-est-le-plus-grand`,
      title: 'Qui est le plus grand ?', desc: 'Range des relatifs — et découvre pourquoi −2 est plus grand que −7.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P5', '5e_nombres-relatifs-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comparer',
    },
    {
      id: '04', number: 4, slug: 'se-deplacer-sur-la-droite', path: `${LESSON_BASE_PATH}/se-deplacer-sur-la-droite`,
      title: 'Se déplacer sur la droite', desc: 'Additionner un relatif, c’est avancer ou reculer. Le signe dit le sens.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P6', '5e_nombres-relatifs-5e_P8'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Additionner',
    },
    {
      id: '05', number: 5, slug: 'soustraire-c-est-reculer', path: `${LESSON_BASE_PATH}/soustraire-c-est-reculer`,
      title: 'Soustraire, c’est reculer', desc: 'Soustraire un relatif, c’est faire le déplacement inverse — et l’écart se lit sur la droite.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P7', '5e_nombres-relatifs-5e_P8', '5e_nombres-relatifs-5e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Soustraire',
    },
    {
      id: '06', number: 6, slug: 'le-releve-de-la-station', path: `${LESSON_BASE_PATH}/le-releve-de-la-station`,
      title: 'Le relevé de la station', desc: 'Des températures réelles à interpréter : écarts, records, classements.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_nombres-relatifs-5e_P1', '5e_nombres-relatifs-5e_P5', '5e_nombres-relatifs-5e_P7', '5e_nombres-relatifs-5e_P8'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Analyser le relevé',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-l-immeuble', path: `${LESSON_BASE_PATH}/mission-finale-l-immeuble`,
      title: '🏆 Mission finale : l’immeuble', desc: 'Dix épreuves pour prouver que tu maîtrises les nombres relatifs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
