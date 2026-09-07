/**
 * Arithmétique — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 5 LPs (clé catalogue
 * 'seconde_arithmetique', append-only) :
 *
 *   seconde_arithmetique-2nde_P1  Reconnaître et utiliser les multiples et diviseurs.
 *   seconde_arithmetique-2nde_P2  Utiliser les propriétés de divisibilité.
 *   seconde_arithmetique-2nde_P3  Raisonner sur les nombres entiers.
 *   seconde_arithmetique-2nde_P4  Résoudre des problèmes faisant intervenir multiples et diviseurs.
 *   seconde_arithmetique-2nde_P5  Utiliser les propriétés arithmétiques pour construire une démonstration.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un multiple de p, c'est un
 * nombre qui se range en paquets de p SANS RESTE. Ce sont les restes qui
 * décident de tout : la somme de deux multiples de p est un multiple de p
 * parce que les restes valent 0 ; deux impairs s'additionnent en pair parce
 * que leurs deux unités seules forment un paquet. La 2nde ajoute l'écriture
 * littérale (n = 2k + 1) qui transforme ce constat en DÉMONSTRATION.
 *
 * Distinct de la leçon 3e « Multiples et diviseurs » (rectangles, crible,
 * arbre de facteurs) : ici les paquets et les restes, les critères DÉMONTRÉS
 * (999a + 99b + 9c), la parité littérale et la démonstration.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/arithmetique-2nde';

export const LESSON_CONFIG = {
  id: 'arithmetique-2nde',
  sequentialUnlock: true,
  title: 'Arithmétique',
  description:
    "Ranger des jetons en paquets et regarder les restes : ce sont eux qui disent si une somme reste un multiple. Puis écrire un pair 2k, un impair 2k + 1, découper 4 725 en 999 + 99 + 9, et transformer un constat en démonstration.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 65,
  skills: [
    'Reconnaître et utiliser les multiples et diviseurs',
    'Utiliser les propriétés de divisibilité',
    'Raisonner sur les nombres entiers',
    'Résoudre des problèmes faisant intervenir multiples et diviseurs',
    'Utiliser les propriétés arithmétiques pour construire une démonstration',
  ],
  teachingScope: {
    include: [
      'Multiple, diviseur, division euclidienne n = pq + r ; le reste décide',
      'Somme et différence de multiples ; multiple × entier ; parité (2k, 2k + 1) et démonstrations',
      'Critères de divisibilité par 2, 3, 4, 5, 9, 10 — démontrés par le découpage 999a + 99b + 9c',
      'Problèmes : rangements, PGCD (le plus grand carreau), PPCM (le prochain rendez-vous)',
      'Écrire une démonstration arithmétique : hypothèse littérale, transformation, conclusion',
    ],
    exclude: [
      'Le crible d’Ératosthène et la décomposition en facteurs premiers (leçon 3e « Multiples et diviseurs »)',
      'Les congruences et l’algorithme d’Euclide formalisé',
      'La preuve de l’irrationalité de √2 (leçon « Logique et raisonnement »)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète. Aucun module « À retenir » n'est attendu
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Prérequis : la table de multiplication et le reste d'une division
  // (module 0, q1/q2). Le vocabulaire multiple/diviseur, pair/impair, PGCD,
  // PPCM… est enseigné ICI (module 1 et suivants), donc n'y figure pas.
  priorKnowledge: ['tables-multiplication', 'quotient'],
  // « factoriser »/« développer » : sens courant du collège (3e), employés
  // en passant dans des explications de calcul littéral déjà posé par cette
  // leçon (2k+1) — pas des notions réenseignées ni ciblées ici.
  // « relation d'Euler » : faux positif du lexique — le texte parle du
  // polynôme premier d'Euler n² + n + 41, sans rapport avec la relation
  // d'Euler des polyèdres (V − E + F = 2, leçon de géométrie 3e).
  knowledgeAudit: {
    ignore: [
      { term: 'factoriser', reason: 'sens courant du collège, employé en passant dans une explication (2k+2m+2 = 2(k+m+1)) déjà justifiée par la leçon' },
      { term: 'developper', reason: 'sens courant du collège, employé en passant dans une explication (4k²+4k+1) déjà justifiée par la leçon' },
      { term: 'relation-euler', reason: 'faux positif : « polynôme d’Euler » (n² + n + 41, module 5) est sans rapport avec la relation d’Euler des polyèdres' },
      { term: 'arrondi', reason: 'distracteur du module 4 (« on a arrondi ») : réponse fausse au sens courant, jamais un calcul d’arrondi de cette leçon' },
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'les-paquets-et-les-restes', path: `${LESSON_BASE_PATH}/les-paquets-et-les-restes`, title: 'Les paquets et les restes', desc: 'Range des jetons en paquets de p. Deux tas sans reste : leur somme aussi. Deux restes de 1 : ils forment un paquet.', stage: 'trigger', teachesLearningPointIds: ['seconde_arithmetique-2nde_P1', 'seconde_arithmetique-2nde_P3'], color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Faire des paquets' },
    { id: '02', number: 2, slug: 'pair-impair-et-la-lettre', path: `${LESSON_BASE_PATH}/pair-impair-et-la-lettre`, title: 'Pair, impair, et la lettre', desc: 'Un pair s’écrit 2k, un impair 2k + 1. Avec ces écritures, un constat devient une preuve.', stage: 'discovery', teachesLearningPointIds: ['seconde_arithmetique-2nde_P3', 'seconde_arithmetique-2nde_P5'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Écrire avec k' },
    { id: '03', number: 3, slug: 'les-criteres-demontres', path: `${LESSON_BASE_PATH}/les-criteres-demontres`, title: 'Les critères, démontrés', desc: 'Pourquoi la somme des chiffres décide pour 3 et 9 ? Découpe 4 725 en 999 + 99 + 9 et regarde.', stage: 'discovery', teachesLearningPointIds: ['seconde_arithmetique-2nde_P2', 'seconde_arithmetique-2nde_P5'], color: 'cyan', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découper le nombre' },
    { id: '04', number: 4, slug: 'multiples-communs', path: `${LESSON_BASE_PATH}/multiples-communs`, title: 'Multiples communs', desc: 'Deux bus, deux rythmes : quand se croisent-ils ? Et quel est le plus grand carreau qui pave sans découpe ?', stage: 'manipulation', teachesLearningPointIds: ['seconde_arithmetique-2nde_P4', 'seconde_arithmetique-2nde_P1'], color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Croiser les rythmes' },
    { id: '05', number: 5, slug: 'demontrer', path: `${LESSON_BASE_PATH}/demontrer`, title: 'Démontrer', desc: 'Remets une démonstration en ordre, prouve que le carré d’un impair est impair, et déjoue une fausse preuve.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_arithmetique-2nde_P5', 'seconde_arithmetique-2nde_P3', 'seconde_arithmetique-2nde_P4'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Démontrer' },
    { id: '06', number: 6, slug: 'mission-finale-latelier', path: `${LESSON_BASE_PATH}/mission-finale-latelier`, title: '🏆 Mission finale : l’atelier', desc: 'Dix épreuves pour prouver qu’aucun reste ne t’échappe.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
