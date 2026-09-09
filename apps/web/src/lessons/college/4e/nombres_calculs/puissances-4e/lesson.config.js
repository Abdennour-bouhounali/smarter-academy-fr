/**
 * Puissances — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `puissances` du domaine « Nombres et calculs », applicable à la 4e à
 * la rentrée 2027-2028. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon
 * (clé catalogue '4e_puissances', append-only) :
 *
 *   4e_puissances-4e_P1  Interpréter une puissance d'exposant négatif
 *   4e_puissances-4e_P2  Multiplier deux puissances d'un même nombre
 *   4e_puissances-4e_P3  Diviser deux puissances d'un même nombre
 *   4e_puissances-4e_P4  Calculer la puissance d'une puissance
 *   4e_puissances-4e_P5  Utiliser les puissances de 10 d'exposant positif ou négatif
 *   4e_puissances-4e_P6  Écrire un nombre en notation scientifique
 *   4e_puissances-4e_P7  Comparer deux ordres de grandeur
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : l'exposant négatif n'est pas
 * une convention à mémoriser, c'est la SEULE façon de continuer une descente
 * où l'on divise par la base à chaque cran. L'élève descend lui-même
 * l'échelle des puissances de 10, constate que le rapport entre deux barreaux
 * ne change jamais, et voit 10^0 = 1 puis 10^-1 = 0,1 s'imposer.
 *
 * CE QUE LA 4e AJOUTE À LA 5e. La 5e a construit le SENS de la puissance
 * (un raccourci pour un produit de facteurs identiques), l'exposant qui
 * COMPTE les facteurs — et ne le multiplie pas —, le carré et le cube lus sur
 * la figure, les carrés parfaits, et les puissances de 10 d'exposant positif.
 * La 4e ne rejoue rien de cela : elle ouvre l'exposant négatif, les règles
 * opératoires, et la notation scientifique.
 *
 * FRONTIÈRE AVEC LA 3e. La leçon de 3e (`puissances-3e`) reprend ces règles
 * pour les établir ALGÉBRIQUEMENT et les pousser plus loin. Ici on les
 * découvre en comptant des facteurs, cas par cas — la démonstration générale
 * n'est pas de ce niveau.
 *
 * PÉRIMÈTRE — hors sujet ici : les puissances littérales complexes (a^m × b^m
 * avec a ≠ b) et les exponentielles, exclusions officielles du niveau ; les
 * racines carrées (objet `racine_carree`). La garde est EXÉCUTABLE : le noyau
 * `components/puissances4e.js` LÈVE sur un produit de bases différentes, et
 * `verifierPerimetre` refuse un exposant hors plage.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/nombres_calculs/puissances-4e';

export const LESSON_CONFIG = {
  id: 'puissances-4e',
  sequentialUnlock: true,
  title: 'Puissances',
  description:
    "Descendre l'échelle des puissances de 10 jusque sous le zéro et voir l'exposant négatif s'imposer, puis établir les règles du produit, du quotient et de la puissance d'une puissance en comptant les facteurs, avant d'écrire les très grands et très petits nombres en notation scientifique.",
  level: 'college',
  grade: '4e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚡',
  estimatedDurationMin: 70,
  skills: [
    "Interpréter une puissance d'exposant négatif",
    "Multiplier deux puissances d'un même nombre",
    "Diviser deux puissances d'un même nombre",
    "Calculer la puissance d'une puissance",
    "Utiliser les puissances de 10 d'exposant positif ou négatif",
    'Écrire un nombre en notation scientifique',
    'Comparer deux ordres de grandeur',
  ],
  teachingScope: {
    include: [
      "L'exposant négatif, obtenu en prolongeant la descente des exposants",
      'a⁻ⁿ = 1/aⁿ, et pourquoi a⁰ = 1',
      "Le produit de deux puissances d'un même nombre",
      "Le quotient de deux puissances d'un même nombre",
      "La puissance d'une puissance",
      'Les puissances de 10, positives et négatives',
      'La notation scientifique',
      'Les ordres de grandeur et leur comparaison',
    ],
    exclude: [
      'Les puissances littérales complexes, aᵐ × bᵐ avec a ≠ b (exclusion officielle)',
      'Les exponentielles (exclusion officielle)',
      'Le sens de la puissance, le carré, le cube, les carrés parfaits (acquis de 5e)',
      'Les racines carrées (objet officiel « Racine carrée »)',
      'Les chiffres significatifs et la précision des mesures (physique, 3e)',
    ],
  },
  // La leçon formalise en continu par sa carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : tout vient de « Puissances » de 5e et du calcul
  // numérique, et le module 0 les diagnostique.
  priorKnowledge: [
    'puissance', 'exposant', 'carre-cube', 'puissance-de-dix',
    'priorite-puissance', 'decalage-virgule', 'quotient',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'descendre-l-echelle', path: `${LESSON_BASE_PATH}/descendre-l-echelle`,
      title: 'Descendre l’échelle', desc: 'Continue la descente des puissances de 10 — et ne t’arrête pas à 1.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_puissances-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Descendre',
    },
    {
      id: '02', number: 2, slug: 'l-exposant-negatif', path: `${LESSON_BASE_PATH}/l-exposant-negatif`,
      title: 'L’exposant négatif', desc: 'Ce que veut dire 10⁻³ — et ce que ça ne veut surtout pas dire.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_puissances-4e_P1', '4e_puissances-4e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Comprendre le signe',
    },
    {
      id: '03', number: 3, slug: 'compter-les-facteurs', path: `${LESSON_BASE_PATH}/compter-les-facteurs`,
      title: 'Compter les facteurs', desc: 'Les trois règles de calcul, lues sur le nombre de facteurs — jamais apprises par cœur.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_puissances-4e_P2', '4e_puissances-4e_P3', '4e_puissances-4e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 13, difficulty: 3, actionText: 'Compter',
    },
    {
      id: '04', number: 4, slug: 'ecrire-l-immense', path: `${LESSON_BASE_PATH}/ecrire-l-immense`,
      title: 'Écrire l’immense et l’infime', desc: 'Une écriture unique pour la masse du Soleil comme pour celle d’un atome.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_puissances-4e_P6', '4e_puissances-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Écrire',
    },
    {
      id: '05', number: 5, slug: 'ordres-de-grandeur', path: `${LESSON_BASE_PATH}/ordres-de-grandeur`,
      title: 'Ordres de grandeur', desc: 'Comparer sans calculer : combien de puissances de 10 séparent deux nombres ?',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_puissances-4e_P7'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Comparer',
    },
    {
      id: '06', number: 6, slug: 'mission-finale-l-echelle', path: `${LESSON_BASE_PATH}/mission-finale-l-echelle`,
      title: '🏆 Mission finale : l’échelle', desc: 'Dix épreuves pour prouver que tu maîtrises les puissances.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
