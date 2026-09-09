/**
 * Fonctions — 4e. « La machine qu'on remonte ».
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `fonctions` du domaine « Proportionnalité et fonctions », rôle
 * « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e → seconde.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_FONCTIONS_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '4e_fonctions', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   4e_fonctions-4e_P1  Identifier la dépendance entre deux grandeurs
 *   4e_fonctions-4e_P2  Exécuter un programme de calcul sur plusieurs valeurs
 *   4e_fonctions-4e_P3  Produire la formule qui résume un programme de calcul
 *   4e_fonctions-4e_P4  Passer d'un tableau de valeurs à une formule
 *   4e_fonctions-4e_P5  Représenter graphiquement une dépendance
 *   4e_fonctions-4e_P6  Modéliser une situation par une formule et un graphique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un programme de calcul est une
 * CHAÎNE ORIENTÉE, pas une recette. Parce qu'elle est orientée, on peut la
 * descendre (l'exécuter), la remonter (l'inverser) et la RÉSUMER d'un seul
 * trait — une formule. Ces trois gestes portent sur le MÊME objet, et c'est ce
 * qui fait qu'une formule n'est pas une écriture de plus : c'est la machine,
 * dite en une ligne.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`fonctions-5e`, briques reprises en
 * `priorKnowledge`) : la dépendance entre deux grandeurs, « une même entrée
 * redonne la même sortie », l'expression « en fonction de », le tableau de
 * valeurs, le programme de calcul EXÉCUTÉ, le couple-point et la lecture d'un
 * graphique. La 4e n'y revient pas : elle RETOURNE le programme, et lui
 * demande son nom.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. La notation f(x), les mots
 * « image » et « antécédent », les fonctions linéaires et affines, le
 * coefficient directeur et l'ordonnée à l'origine sont des objets de 3e
 * (`fonctions-3e`). La frontière est EXÉCUTABLE : `components/fonctions4e.js`
 * n'expose aucune de ces notions et `assertScope4e` lève si on les demande.
 * La 4e écrit bel et bien « 3x + 2 » — c'est du calcul littéral de 4e, une
 * EXPRESSION. Ce qui appartient à la 3e, c'est de la NOMMER f et d'en évaluer
 * f(3) : la notation, pas l'écriture.
 *
 * Fil narratif : une chaîne de cases qu'on descend puis qu'on remonte, un
 * tableau sans machine, et deux situations où la sortie DIMINUE.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/proportionnalite_fonctions/fonctions-4e';

export const LESSON_CONFIG = {
  id: 'fonctions-4e',
  sequentialUnlock: true,
  title: 'Fonctions',
  description:
    "Descendre une chaîne de calcul puis la remonter à l'envers, la résumer d'un seul trait par une formule, retrouver cette formule dans un tableau muet en la testant sur TOUS les couples, la transformer en dessin, et modéliser deux situations où la sortie diminue quand l'entrée augmente.",
  level: 'college',
  grade: '4e',
  chapter: 'proportionnalite_fonctions',
  chapterTitle: 'Proportionnalité et fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 74,
  skills: [
    'Identifier la dépendance entre deux grandeurs',
    'Exécuter un programme de calcul sur plusieurs valeurs',
    'Produire la formule qui résume un programme de calcul',
    "Passer d'un tableau de valeurs à une formule",
    'Représenter graphiquement une dépendance',
    'Modéliser une situation par une formule et un graphique',
  ],
  teachingScope: {
    include: [
      'Le programme de calcul comme chaîne ORIENTÉE, descendue étape par étape',
      'Inverser un programme : l’ordre se retourne ET chaque opération se défait',
      'Le cas où l’on ne peut pas remonter : « × 0 » écrase toutes les entrées',
      'Exécuter un programme sur plusieurs entrées, en valeurs exactes',
      'Produire la formule qui résume un programme (« 3x + 2 »)',
      'Deux programmes différents peuvent avoir la MÊME formule',
      'Retrouver une formule à partir d’un tableau, en la testant sur TOUS les couples',
      'Représenter la dépendance par des points, puis par un trait',
      'Modéliser une situation réelle par une formule ET un graphique',
      'Une dépendance dont la sortie DIMINUE quand l’entrée augmente',
    ],
    exclude: [
      'La notation f(x) (3e)',
      'Les mots « image » et « antécédent » (3e)',
      'Les fonctions linéaires et affines (3e)',
      'Le coefficient directeur et l’ordonnée à l’origine (3e)',
      'Les programmes à deux entrées possibles — le carré, la racine (3e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Aucune CHAÎNE DE CONTINUITÉ, et c'est délibéré (spec §7). La chaîne du
  // module 1 est un objet ABSTRAIT — trois cases et un nombre qui les
  // descend ; les situations du module 6 sont des contextes RÉELS — un enclos
  // de grillage, une citerne qui se vide. Les relier de force ferait croire
  // qu'une formule appartient à son histoire, alors que le TRANSFERT d'un
  // contexte à l'autre est précisément l'objet de la modélisation.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : les sept briques de `fonctions-5e` et le calcul numérique.
  priorKnowledge: [
    'dependance', 'meme-entree-meme-sortie', 'en-fonction-de', 'tableau-de-valeurs',
    'programme-de-calcul', 'couple-point', 'lire-graphique', 'calcul-numerique',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-chaine', path: `${LESSON_BASE_PATH}/la-chaine`,
      title: 'La chaîne', desc: 'Un nombre descend les cases une à une. Puis tu attrapes la sortie et tu remontes — la chaîne se retourne sous tes doigts.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_fonctions-4e_P1', '4e_fonctions-4e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Lancer la chaîne',
    },
    {
      id: '02', number: 2, slug: 'plusieurs-entrees', path: `${LESSON_BASE_PATH}/plusieurs-entrees`,
      title: 'Plusieurs entrées d’un coup', desc: 'La même chaîne, nourrie de plusieurs nombres : le tableau se remplit tout seul.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_fonctions-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Nourrir la chaîne',
    },
    {
      id: '03', number: 3, slug: 'dire-la-machine-en-une-ligne', path: `${LESSON_BASE_PATH}/dire-la-machine-en-une-ligne`,
      title: 'Dire la machine en une ligne', desc: 'Assemble l’écriture qui tient toute la chaîne, et vérifie-la sur n’importe quelle entrée.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_fonctions-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Écrire la formule',
    },
    {
      id: '04', number: 4, slug: 'le-tableau-muet', path: `${LESSON_BASE_PATH}/le-tableau-muet`,
      title: 'Le tableau muet', desc: 'Des couples, sans machine pour les expliquer. Une candidate juste « parfois » n’est pas la bonne.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_fonctions-4e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Tester des règles',
    },
    {
      id: '05', number: 5, slug: 'la-formule-devient-un-dessin', path: `${LESSON_BASE_PATH}/la-formule-devient-un-dessin`,
      title: 'La formule devient un dessin', desc: 'Chaque couple devient un point, et le repère s’ajuste tout seul à ce que tu calcules.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_fonctions-4e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '06', number: 6, slug: 'lenclos-et-la-citerne', path: `${LESSON_BASE_PATH}/lenclos-et-la-citerne`,
      title: 'L’enclos et la citerne', desc: 'Deux situations où la sortie DIMINUE quand l’entrée augmente. À toi de les modéliser de bout en bout.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_fonctions-4e_P6', '4e_fonctions-4e_P1'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Ouvrir le chantier',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-latelier', path: `${LESSON_BASE_PATH}/mission-finale-latelier`,
      title: '🏆 Mission finale : l’atelier', desc: 'Dix épreuves pour prouver que tu sais descendre, remonter, résumer et dessiner une machine.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
