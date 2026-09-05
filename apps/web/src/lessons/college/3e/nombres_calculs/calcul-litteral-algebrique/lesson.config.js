/**
 * Calcul littéral et algébrique — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 11 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_calcul_litteral',
 * append-only) :
 *
 *   3e_calcul-litteral-algebrique_P1   Comprendre une expression littérale
 *   3e_calcul-litteral-algebrique_P2   Identifier les termes et facteurs d'une expression
 *   3e_calcul-litteral-algebrique_P3   Réduire une expression littérale
 *   3e_calcul-litteral-algebrique_P4   Regrouper des termes semblables
 *   3e_calcul-litteral-algebrique_P5   Développer une expression
 *   3e_calcul-litteral-algebrique_P6   Utiliser la distributivité simple
 *   3e_calcul-litteral-algebrique_P7   Utiliser la double distributivité
 *   3e_calcul-litteral-algebrique_P8   Factoriser une expression simple
 *   3e_calcul-litteral-algebrique_P9   Comprendre l'équivalence entre différentes écritures d'une expression
 *   3e_calcul-litteral-algebrique_P10  Utiliser les identités remarquables
 *   3e_calcul-litteral-algebrique_P11  Choisir une transformation adaptée à un problème
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : une expression
 * est une machine qui calcule un nombre pour chaque x ; deux écritures sont
 * la MÊME expression quand elles s'accordent pour tout x. La leçon ne
 * commence donc pas par « développer, c'est… » mais par une bordure de
 * dalles que trois élèves comptent de trois façons — et qui donne toujours
 * le même nombre.
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : cette leçon N'ENSEIGNE PAS la
 * résolution d'équations — c'est le contenu de « Équations produit nul »,
 * vers laquelle le module 7 renvoie explicitement. Sont aussi exclus les
 * fractions rationnelles, les puissances littérales au-delà de x², et la
 * factorisation à coefficients littéraux généraux.
 *
 * Fil narratif unique : « le jardin de Maya » — la bordure du module 1, les
 * dalles devenues tuiles algébriques (2–3), le parterre rectangulaire (4),
 * la terrasse carrée (5), les morceaux à réassembler (6), l'allée et le prix
 * (7), repris figés dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/calcul-litteral-algebrique';

export const LESSON_CONFIG = {
  id: 'calcul-litteral-algebrique',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Calcul littéral et algébrique',
  description:
    "Compter une bordure de dalles de trois façons différentes, découper un rectangle dont les côtés s'écrivent avec x, empiler des tuiles semblables, puis retrouver les côtés à partir des morceaux : développer, réduire et factoriser ne changent que l'écriture, jamais la quantité.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '𝑥',
  estimatedDurationMin: 85,
  skills: [
    'Comprendre une expression littérale',
    "Identifier les termes et facteurs d'une expression",
    'Réduire une expression littérale',
    'Regrouper des termes semblables',
    'Développer une expression',
    'Utiliser la distributivité simple',
    'Utiliser la double distributivité',
    'Factoriser une expression simple',
    "Comprendre l'équivalence entre différentes écritures d'une expression",
    'Utiliser les identités remarquables',
    'Choisir une transformation adaptée à un problème',
  ],
  teachingScope: {
    include: [
      'Expression littérale, valeur pour un x donné, équivalence de deux écritures',
      'Termes, facteurs, termes semblables ; réduire une somme',
      'Développer : distributivité simple k(a + b) et double (a + b)(c + d)',
      'Factoriser par un facteur commun',
      'Les trois identités remarquables : (a + b)², (a − b)², (a + b)(a − b)',
      "Choisir la forme développée ou factorisée selon l'objectif",
    ],
    exclude: [
      "Résoudre une équation (contenu de « Équations produit nul », vers laquelle le module 7 renvoie)",
      'Fractions rationnelles et expressions quotients',
      'Puissances littérales au-delà de x²',
      'Factorisation à coefficients littéraux généraux (ax² + bx + c)',
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
      id: '01', number: 1, slug: 'trois-formules-pour-une-bordure', path: `${LESSON_BASE_PATH}/trois-formules-pour-une-bordure`,
      title: 'Trois formules pour une bordure', desc: 'Trois élèves comptent les mêmes dalles autrement. Qui a raison ?',
      stage: 'trigger',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P1', '3e_calcul-litteral-algebrique_P9',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Compter la bordure',
    },
    {
      id: '02', number: 2, slug: 'termes-et-facteurs', path: `${LESSON_BASE_PATH}/termes-et-facteurs`,
      title: 'Termes et facteurs', desc: "On additionne des termes, on multiplie des facteurs — et seules les tuiles de même forme s'empilent.",
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P1', '3e_calcul-litteral-algebrique_P2',
        '3e_calcul-litteral-algebrique_P4',
      ],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Toucher les termes',
    },
    {
      id: '03', number: 3, slug: 'reduire-sans-se-tromper', path: `${LESSON_BASE_PATH}/reduire-sans-se-tromper`,
      title: 'Réduire sans se tromper', desc: "3x + 2 n'est pas 5x. Mets x = 2 et regarde ce qui se passe.",
      stage: 'discovery',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P3', '3e_calcul-litteral-algebrique_P4',
        '3e_calcul-litteral-algebrique_P9',
      ],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Empiler les tuiles',
    },
    {
      id: '04', number: 4, slug: 'le-rectangle-daire', path: `${LESSON_BASE_PATH}/le-rectangle-daire`,
      title: "Le rectangle d'aire", desc: 'Découpe le rectangle, compte chaque morceau : voilà ce que veut dire développer.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P5', '3e_calcul-litteral-algebrique_P6',
        '3e_calcul-litteral-algebrique_P7',
      ],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Découper le rectangle',
    },
    {
      id: '05', number: 5, slug: 'le-carre-de-cote-a-plus-b', path: `${LESSON_BASE_PATH}/le-carre-de-cote-a-plus-b`,
      title: 'Le carré de côté a + b', desc: "(a + b)² n'est pas a² + b² : il manque deux rectangles. Va les chercher.",
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P10', '3e_calcul-litteral-algebrique_P9',
      ],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Découper le carré',
    },
    {
      id: '06', number: 6, slug: 'factoriser-le-chemin-inverse', path: `${LESSON_BASE_PATH}/factoriser-le-chemin-inverse`,
      title: 'Factoriser, le chemin inverse', desc: 'Des morceaux, retrouve les côtés du rectangle. La même image, lue à l’envers.',
      stage: 'formalization',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P8', '3e_calcul-litteral-algebrique_P10',
        '3e_calcul-litteral-algebrique_P9',
      ],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Remonter aux côtés',
    },
    {
      id: '07', number: 7, slug: 'choisir-la-bonne-forme', path: `${LESSON_BASE_PATH}/choisir-la-bonne-forme`,
      title: 'Choisir la bonne forme', desc: "Calculer vite, ou annuler un produit : c'est la question qui décide de l'écriture.",
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_calcul-litteral-algebrique_P11', '3e_calcul-litteral-algebrique_P9',
        '3e_calcul-litteral-algebrique_P8', '3e_calcul-litteral-algebrique_P5',
      ],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Choisir la forme',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-jardin-de-maya', path: `${LESSON_BASE_PATH}/mission-finale-le-jardin-de-maya`,
      title: '🏆 Mission finale : le jardin de Maya', desc: 'Dix épreuves pour prouver qu’aucune écriture ne te trompe.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
