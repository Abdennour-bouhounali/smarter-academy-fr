/**
 * Résolution de problèmes — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 11 LPs de cette leçon
 * (dérivés de `pointsToLearn` de la clé catalogue '3e_resolution_problemes',
 * append-only) :
 *
 *   3e_resolution-problemes-3e_P1   Comprendre et extraire les informations utiles d'un problème
 *   3e_resolution-problemes-3e_P2   Identifier la question et les contraintes
 *   3e_resolution-problemes-3e_P3   Choisir une stratégie de résolution
 *   3e_resolution-problemes-3e_P4   Traduire une situation en calcul, expression ou équation
 *   3e_resolution-problemes-3e_P5   Mobiliser les nombres et opérations adaptés
 *   3e_resolution-problemes-3e_P6   Utiliser le calcul littéral dans une situation problème
 *   3e_resolution-problemes-3e_P7   Utiliser une équation pour modéliser une situation
 *   3e_resolution-problemes-3e_P8   Organiser les étapes d'une résolution
 *   3e_resolution-problemes-3e_P9   Vérifier la cohérence d'un résultat
 *   3e_resolution-problemes-3e_P10  Interpréter le résultat dans le contexte du problème
 *   3e_resolution-problemes-3e_P11  Communiquer une solution complète et argumentée
 *
 * L'IDÉE CENTRALE, jamais énoncée avant d'avoir été vécue : un problème se
 * résout en CHOISISSANT ce que x désigne, en traduisant l'histoire par une
 * égalité qui dit deux fois la même quantité, en la résolvant, puis en
 * REVENANT à l'histoire pour vérifier et répondre avec ses mots. L'équation
 * est un modèle de la situation, pas la réponse. La leçon ne commence donc
 * pas par « pour traduire, on pose x = … » mais par deux cartes de cinéma
 * dont l'élève cherche le point d'équilibre à tâtons (module 1) — puis
 * découvre qu'une équation le donne en une ligne.
 *
 * IDENTIFIANT : `resolution-problemes-3e`, PAS `resolution-problemes` qui est
 * le code de la leçon de 6e (les codes de leçon sont globalement uniques :
 * clé de stockage, API evidence et test d'invariants du catalogue).
 *
 * PÉRIMÈTRE (teachingScope, contraignant) : la résolution d'une équation du
 * premier degré est un PRÉREQUIS (leçon « Équations produit nul ») — ici on
 * l'organise et on la vérifie, on ne l'enseigne pas. Aucun problème purement
 * arithmétique (c'est la leçon de 6e du même nom) : chaque tâche porte une
 * inconnue ou une décision de stratégie.
 *
 * Fil narratif unique : « Le Carnet de modélisation », cinq onglets (Lire ·
 * Inconnue · Équation · Résoudre · Vérifier-Répondre) que l'élève remplit
 * module après module, repris figé dans la synthèse du boss. Les situations
 * REVIENNENT au lieu de se multiplier : le forfait de cinéma (M1, M4, M7),
 * Tom et Léa (M3, M6, M7), le rectangle (M4, M5, M7), les crêpes (M2, M5).
 */
export const LESSON_BASE_PATH = '/courses/college/3e/nombres_calculs/resolution-problemes-3e';

export const LESSON_CONFIG = {
  id: 'resolution-problemes-3e',
  // Formalisation continue par la carte des connaissances.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, diagnostiquées par le module 0.
  priorKnowledge: ['calcul-litteral', 'developper', 'nombres-relatifs', 'proportionnalite',
    'equation-premier-degre'],
  // Termes détectés par le lexique mais acquis dès le cycle 3 : la leçon les
  // utilise comme support d'énoncé, elle ne les enseigne pas.
  knowledgeAudit: {
    ignore: [
      { term: 'perimetre', reason: 'Périmètre du rectangle : notion de 6e, support d’énoncé, jamais un objectif de cette leçon.' },
      { term: 'aire', reason: 'Cité une seule fois pour distinguer x² + 4x du périmètre ; aucune demande ne porte sur l’aire.' },
    ],
  },
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Résolution de problèmes',
  description:
    "Chercher à tâtons quel forfait de cinéma est le moins cher, puis apprendre à lire un énoncé comme un détective, à choisir l'inconnue, à traduire l'histoire en équation carte par carte, à organiser la résolution et à revenir à l'histoire pour vérifier et répondre.",
  level: 'college',
  grade: '3e',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧠',
  estimatedDurationMin: 85,
  skills: [
    "Comprendre et extraire les informations utiles d'un problème",
    'Identifier la question et les contraintes',
    'Choisir une stratégie de résolution',
    'Traduire une situation en calcul, expression ou équation',
    'Mobiliser les nombres et opérations adaptés',
    'Utiliser le calcul littéral dans une situation problème',
    'Utiliser une équation pour modéliser une situation',
    "Organiser les étapes d'une résolution",
    "Vérifier la cohérence d'un résultat",
    'Interpréter le résultat dans le contexte du problème',
    'Communiquer une solution complète et argumentée',
  ],
  teachingScope: {
    include: [
      'Données utiles et données inutiles, la question et les contraintes',
      "Choix de l'inconnue et réécriture des autres quantités",
      'Traduction d’une situation en expression et en équation',
      'Choix d’une stratégie : proportionnalité, calcul direct, essais, équation',
      'Organisation des étapes d’une résolution',
      'Vérification dans la situation et interprétation du résultat',
      'Réponse complète : résultat, unité, phrase',
    ],
    exclude: [
      'La technique de résolution d’une équation du premier degré (prérequis)',
      'Les équations produit et le second degré',
      'Les problèmes purement arithmétiques sans inconnue (leçon de 6e)',
      'Les systèmes de deux équations à deux inconnues',
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
      id: '01', number: 1, slug: 'le-forfait-mystere', path: `${LESSON_BASE_PATH}/le-forfait-mystere`,
      title: 'Le forfait mystère', desc: 'Deux cartes de cinéma. Trouve à partir de quand la deuxième devient plus intéressante.',
      stage: 'trigger',
      teachesLearningPointIds: [
        '3e_resolution-problemes-3e_P1', '3e_resolution-problemes-3e_P2', '3e_resolution-problemes-3e_P4',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Tester des séances',
    },
    {
      id: '02', number: 2, slug: 'lire-comme-un-detective', path: `${LESSON_BASE_PATH}/lire-comme-un-detective`,
      title: 'Lire comme un détective', desc: 'Toutes les données ne servent pas. Trouve la question, et ce que le résultat a le droit d’être.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_resolution-problemes-3e_P1', '3e_resolution-problemes-3e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Mener l’enquête',
    },
    {
      id: '03', number: 3, slug: 'choisir-linconnue', path: `${LESSON_BASE_PATH}/choisir-linconnue`,
      title: 'Choisir l’inconnue', desc: 'Nomme une quantité x — et regarde les autres s’écrire toutes seules.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_resolution-problemes-3e_P4', '3e_resolution-problemes-3e_P7'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Choisir x',
    },
    {
      id: '04', number: 4, slug: 'le-traducteur', path: `${LESSON_BASE_PATH}/le-traducteur`,
      title: 'Le Traducteur', desc: 'Assemble l’équation carte par carte, puis teste-la toi-même avec la sonde.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '3e_resolution-problemes-3e_P4', '3e_resolution-problemes-3e_P6', '3e_resolution-problemes-3e_P7',
      ],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Traduire',
    },
    {
      id: '05', number: 5, slug: 'deux-strategies-un-resultat', path: `${LESSON_BASE_PATH}/deux-strategies-un-resultat`,
      title: 'Deux stratégies, un résultat', desc: 'Toute situation n’a pas besoin d’une équation. Mais quand le résultat n’est pas rond…',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_resolution-problemes-3e_P3', '3e_resolution-problemes-3e_P5'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Choisir la stratégie',
    },
    {
      id: '06', number: 6, slug: 'resoudre-et-verifier', path: `${LESSON_BASE_PATH}/resoudre-et-verifier`,
      title: 'Résoudre et vérifier', desc: 'Choisis chaque étape valable, puis remets ta valeur dans l’histoire — pas dans la dernière ligne.',
      stage: 'formalization',
      teachesLearningPointIds: [
        '3e_resolution-problemes-3e_P8', '3e_resolution-problemes-3e_P9', '3e_resolution-problemes-3e_P11',
      ],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '07', number: 7, slug: 'le-labo-de-modelisation', path: `${LESSON_BASE_PATH}/le-labo-de-modelisation`,
      title: 'Le labo de modélisation', desc: 'Des parcours complets, de l’énoncé à la phrase de réponse — y compris quand le résultat tombe sur 6,25.',
      stage: 'practice_lab',
      teachesLearningPointIds: [
        '3e_resolution-problemes-3e_P10', '3e_resolution-problemes-3e_P11',
        '3e_resolution-problemes-3e_P9', '3e_resolution-problemes-3e_P5',
      ],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Modéliser',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-carnet-complet', path: `${LESSON_BASE_PATH}/mission-finale-le-carnet-complet`,
      title: '🏆 Mission finale : le carnet complet', desc: 'Dix épreuves pour prouver qu’aucun énoncé ne te résiste, de la lecture à la phrase de réponse.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
