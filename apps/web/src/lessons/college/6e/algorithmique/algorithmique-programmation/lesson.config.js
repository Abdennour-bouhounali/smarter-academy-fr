/**
 * Algorithmique et programmation — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 12 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_algorithmique-programmation_P1   Comprendre qu'un algorithme décrit une suite d'instructions permettant de résoudre un problème
 *   6e_algorithmique-programmation_P2   Identifier une instruction et comprendre son effet
 *   6e_algorithmique-programmation_P3   Décomposer un problème en étapes simples
 *   6e_algorithmique-programmation_P4   Construire une séquence d'instructions
 *   6e_algorithmique-programmation_P5   Exécuter mentalement ou visuellement un algorithme
 *   6e_algorithmique-programmation_P6   Comprendre l'ordre des instructions
 *   6e_algorithmique-programmation_P7   Utiliser des répétitions simples pour éviter de reproduire plusieurs fois la même instruction
 *   6e_algorithmique-programmation_P8   Modifier un programme pour obtenir le résultat attendu
 *   6e_algorithmique-programmation_P9   Repérer une erreur dans une séquence d'instructions
 *   6e_algorithmique-programmation_P10  Corriger un programme qui ne produit pas le résultat attendu
 *   6e_algorithmique-programmation_P11  Tester un programme et observer son comportement
 *   6e_algorithmique-programmation_P12  Traduire une stratégie de résolution en programme simple
 *
 * PÉRIMÈTRE OFFICIEL (JSON du programme, objet « algorithmique_programmation ») :
 *   include — « Déplacements, séquences d'instructions », « Boucles simples (répéter) »
 *   exclude — « Variables, conditions complexes »
 * Le jeu d'instructions est donc CLOS : AVANCER, TOURNER (gauche/droite),
 * RAMASSER, et un seul niveau de RÉPÉTER. Aucune variable, aucun test
 * conditionnel — la structure du modèle (components/algoUtils.js) l'interdit.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/algorithmique/algorithmique-programmation';

export const LESSON_CONFIG = {
  id: 'algorithmique-programmation',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Algorithmique et programmation',
  description:
    "Programmer ROBI, le robot du potager : construire une suite d'instructions, l'exécuter, comprendre pourquoi l'ordre compte, répéter sans tout réécrire, puis repérer et corriger les erreurs d'un programme.",
  level: 'college',
  grade: '6e',
  chapter: 'algorithmique',
  chapterTitle: 'Initiation à la pensée informatique',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🤖',
  estimatedDurationMin: 86,
  skills: [
    "Comprendre qu'un algorithme est une suite d'instructions",
    "Identifier une instruction et prévoir son effet",
    "Construire une séquence pour atteindre un objectif",
    "Comprendre que l'ordre des instructions change le résultat",
    'Utiliser une répétition pour raccourcir un programme',
    'Repérer et corriger une erreur dans un programme',
    'Traduire une stratégie en programme simple',
  ],
  teachingScope: {
    include: ["Déplacements, séquences d'instructions", 'Boucles simples (répéter)'],
    exclude: ['Variables', 'Conditions complexes', 'Boucles imbriquées', 'Écriture de code textuel'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },

    { id: '01', number: 1, slug: 'le-robot-nobeit-pas', path: `${LESSON_BASE_PATH}/le-robot-nobeit-pas`,
      title: "Le robot n'obéit pas", desc: "Tu lui dis où aller… et il ne bouge pas. Que comprend-il vraiment ?",
      stage: 'trigger',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P1', '6e_algorithmique-programmation_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },

    { id: '02', number: 2, slug: 'une-instruction-un-effet', path: `${LESSON_BASE_PATH}/une-instruction-un-effet`,
      title: 'Une instruction, un effet', desc: 'Une seule instruction à la fois : prédis ce qu’elle fait, puis vérifie.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P2', '6e_algorithmique-programmation_P5'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Explorer' },

    { id: '03', number: 3, slug: 'construire-une-sequence', path: `${LESSON_BASE_PATH}/construire-une-sequence`,
      title: 'Construire une séquence', desc: 'Découpe le trajet en étapes simples et écris ton premier algorithme.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P3', '6e_algorithmique-programmation_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Construire' },

    { id: '04', number: 4, slug: 'lordre-change-tout', path: `${LESSON_BASE_PATH}/lordre-change-tout`,
      title: "L'ordre change tout", desc: 'Mêmes instructions, ordre différent : le robot n’arrive plus au même endroit.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P6', '6e_algorithmique-programmation_P5'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Réordonner' },

    { id: '05', number: 5, slug: 'repeter-sans-tout-reecrire', path: `${LESSON_BASE_PATH}/repeter-sans-tout-reecrire`,
      title: 'Répéter sans tout réécrire', desc: 'Huit fois la même instruction… ou une seule carte RÉPÉTER ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P7'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Répéter' },

    { id: '06', number: 6, slug: 'reparer-un-programme', path: `${LESSON_BASE_PATH}/reparer-un-programme`,
      title: 'Réparer un programme', desc: 'Le but change, le programme reste : modifie-le. Puis répare celui qui bugue.',
      stage: 'formalization',
      teachesLearningPointIds: [
        '6e_algorithmique-programmation_P8',
        '6e_algorithmique-programmation_P9',
        '6e_algorithmique-programmation_P10',
      ],
      color: 'blue', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Réparer' },

    { id: '07', number: 7, slug: 'le-labo-de-debogage', path: `${LESSON_BASE_PATH}/le-labo-de-debogage`,
      title: 'Le labo de débogage', desc: 'Lance, observe, fais une hypothèse, corrige, relance : le vrai métier.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['6e_algorithmique-programmation_P11', '6e_algorithmique-programmation_P12'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Déboguer' },

    { id: '08', number: 8, slug: 'mission-finale-le-robot-explorateur', path: `${LESSON_BASE_PATH}/mission-finale-le-robot-explorateur`,
      title: '🏆 Mission finale : ROBI explorateur', desc: 'Dix épreuves pour devenir Programmeur du potager.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
