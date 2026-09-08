/**
 * Puissances — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `puissances` du domaine « Nombres et calculs », applicable à la 5e à
 * la rentrée 2026-2027. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '5e_puissances', append-only) :
 *
 *   5e_puissances-5e_P1  Écrire un produit de facteurs identiques sous forme de puissance
 *   5e_puissances-5e_P2  Lire et interpréter une notation puissance
 *   5e_puissances-5e_P3  Interpréter le carré et le cube géométriquement
 *   5e_puissances-5e_P4  Reconnaître les carrés parfaits de 0 à 12
 *   5e_puissances-5e_P5  Écrire et lire une puissance de 10 d'exposant positif
 *   5e_puissances-5e_P6  Calculer une expression simple contenant une puissance
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : quand un même facteur se répète,
 * écrire le produit en entier devient absurde. On invente alors une écriture
 * qui dit la STRUCTURE — quel facteur, et combien de fois — au lieu de la
 * lister. L'exposant COMPTE LES FACTEURS ; il ne multiplie rien.
 *
 * Fil narratif : la légende de l'échiquier. Un grain sur la première case, le
 * double sur la suivante — le calcul écrit en entier déborde de l'écran avant
 * la dixième case (M1), et c'est ce débordement qui crée le besoin de la
 * notation. L'échiquier revient dans la synthèse du test final.
 *
 * PLACE DANS LA FAMILLE « Puissances & pensée algébrique » de 5e. Cette leçon
 * est la PREMIÈRE des deux : elle installe le geste « inventer une écriture
 * courte pour une répétition », que « Calcul littéral » reprend un cran plus
 * loin — une écriture courte pour une RÉGULARITÉ. Elle hérite d'« Opérations »
 * (5e) la convention des priorités, qu'elle étend d'un seul cran : la
 * puissance se calcule avant les × et ÷.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : les exposants négatifs, la
 * notation scientifique (4e), et les règles algébriques des puissances
 * (aⁿ × aᵐ, 3e). Ces frontières ne sont pas que documentaires :
 * components/puissances.js LÈVE sur un exposant négatif, et n'offre aucune
 * fonction combinant deux puissances ; le test le vérifie.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/nombres_calculs/puissances-5e';

export const LESSON_CONFIG = {
  id: 'puissances-5e',
  sequentialUnlock: true,
  title: 'Puissances',
  description:
    "Suivre la légende de l’échiquier jusqu’à ce que le calcul écrit en entier déborde de l’écran, inventer l’écriture courte qui le remplace, comprendre que l’exposant compte les facteurs, lire le carré et le cube sur les figures qui leur donnent leur nom, reconnaître les carrés parfaits, et manier les puissances de 10.",
  level: 'college',
  grade: '5e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚡',
  estimatedDurationMin: 60,
  skills: [
    'Écrire un produit de facteurs identiques sous forme de puissance',
    'Lire et interpréter une notation puissance',
    'Interpréter le carré et le cube géométriquement',
    'Reconnaître les carrés parfaits de 0 à 12',
    "Écrire et lire une puissance de 10 d'exposant positif",
    'Calculer une expression simple contenant une puissance',
  ],
  teachingScope: {
    include: [
      "L'écriture puissance comme raccourci d'un produit de facteurs identiques",
      "L'exposant compte les facteurs — il ne multiplie pas",
      'Le carré et le cube, lus sur la figure qui leur donne leur nom',
      'Les carrés parfaits de 0 à 12',
      "Les puissances de 10 d'exposant positif",
      'Calculer une expression simple contenant une puissance',
    ],
    exclude: [
      'Les exposants négatifs (4e)',
      "L'écriture scientifique (4e)",
      'Les règles algébriques des puissances : aⁿ × aᵐ, quotient, puissance de puissance (3e)',
      'Les racines carrées (3e)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module se termine sur l'état courant de la carte, et le test final en
  // affiche la version complète (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes diagnostiquées par le module 0 : le produit de
  // facteurs identiques et les tables (6e), le décalage de la virgule (6e), et
  // l'aire d'un carré (6e).
  priorKnowledge: [
    'multiplication-repetee', 'tables-multiplication', 'calcul-numerique', 'decalage-virgule', 'aire',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'l-echiquier-du-roi', path: `${LESSON_BASE_PATH}/l-echiquier-du-roi`,
      title: 'L’échiquier du roi', desc: 'Un grain, puis le double à chaque case. Regarde le calcul écrit déborder de l’écran.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_puissances-5e_P1'],
      color: 'amber', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Avancer sur l’échiquier',
    },
    {
      id: '02', number: 2, slug: 'ce-que-compte-l-etage', path: `${LESSON_BASE_PATH}/ce-que-compte-l-etage`,
      title: 'Deux tours, deux nombres', desc: 'Empile les facteurs : la hauteur de la tour ne se confond plus avec ce qu’il y a dedans.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_puissances-5e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Comparer les tours',
    },
    {
      id: '03', number: 3, slug: 'le-carre-et-le-cube', path: `${LESSON_BASE_PATH}/le-carre-et-le-cube`,
      title: 'Le carré et le cube', desc: 'Deux mots qui ne sont pas des conventions : ce sont les figures qu’on obtient.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_puissances-5e_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire les figures',
    },
    {
      id: '04', number: 4, slug: 'les-carres-parfaits', path: `${LESSON_BASE_PATH}/les-carres-parfaits`,
      title: 'Les carrés parfaits', desc: 'Treize nombres à reconnaître au premier coup d’œil, de 0 à 144.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_puissances-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Reconnaître',
    },
    {
      id: '05', number: 5, slug: 'les-puissances-de-dix', path: `${LESSON_BASE_PATH}/les-puissances-de-dix`,
      title: 'Les puissances de dix', desc: 'Un suivi de zéros : compter les zéros, c’est compter les facteurs.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_puissances-5e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Compter les zéros',
    },
    {
      id: '06', number: 6, slug: 'calculer-avec-une-puissance', path: `${LESSON_BASE_PATH}/calculer-avec-une-puissance`,
      title: 'Calculer avec une puissance', desc: 'Un cran de plus dans l’ordre des priorités — et il se déduit du sens.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_puissances-5e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Calculer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-grain-de-riz', path: `${LESSON_BASE_PATH}/mission-finale-le-grain-de-riz`,
      title: '🏆 Mission finale : le grain de riz', desc: 'Dix épreuves pour prouver que l’exposant compte les facteurs.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
