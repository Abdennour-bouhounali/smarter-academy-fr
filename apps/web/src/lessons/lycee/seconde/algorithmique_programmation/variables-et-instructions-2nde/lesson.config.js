/**
 * Variables et instructions — Seconde, domaine algorithmique_programmation.
 *
 * POSITIONNEMENT VERTICAL
 *   revisé      la variable comme « boîte », la séquence et la conditionnelle,
 *               rencontrées en langage à blocs (4e, algorithmique-programmation-4e).
 *   étendu      le bloc devient du TEXTE : Python. Une faute de frappe existe,
 *               l'indentation porte du sens, et le programme peut planter.
 *   nouveau     les TYPES (int, float, bool, str), la boucle while et sa
 *               condition d'arrêt, et la vérification d'un programme par
 *               l'exécution plutôt que par la relecture.
 *   formalisé   l'affectation comme opération (x = x + 1 n'est pas une équation).
 *   outil       prépare « Fonctions en Python » et la simulation en probabilités.
 *
 * Couverture : P1, P2 → M1 · P3, P8 → M2 · P4, P5 → M3 · P6, P7 → M4 ·
 *              P9, P10, P11, P12 → M5.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/algorithmique_programmation/variables-et-instructions-2nde';

export const LESSON_CONFIG = {
  id: 'variables-et-instructions-2nde',
  sequentialUnlock: true,
  title: 'Variables et instructions',
  description: "Utiliser les variables, affectations, conditions et boucles pour concevoir et comprendre des algorithmes simples.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'algorithmique_programmation',
  chapterTitle: 'Algorithmique et programmation',
  emoji: '💻',
  estimatedDurationMin: 76,
  passingScore: 0.7,
  masteryThreshold: 0.8,
  knowledgeMap: true,

  priorKnowledge: ['calcul-litteral', 'ordre-nombres', 'arrondi'],

  knowledgeAudit: {
    ignore: [
      { term: 'arrondi', reason: 'Notion de 6e ; sert une fois à commenter l’affichage d’un quotient.' },
      { term: 'moyenne', reason: 'Notion de collège, réactivée par statistiques-une-variable-2nde ; ici simple contexte d’un programme d’exemple.' },
      { term: 'perimetre', reason: 'Formule de 6e ; sert de support à une épreuve sur l’écriture d’une formule avec des variables, pas de contenu enseigné.' },
      { term: 'aire', reason: 'Formule de 6e ; citée dans un distracteur pour opposer aire et périmètre.' },
    ],
  },

  teachingScope: {
    include: [
      'La variable informatique : un nom, une valeur, un type',
      'L\'affectation, et pourquoi x = x + 1 a un sens',
      'La séquence d\'instructions et la conditionnelle',
      'Les boucles for et while, et la condition d\'arrêt',
      'Lire, compléter, modifier et VÉRIFIER un programme',
    ],
    exclude: [
      'Les fonctions Python (leçon « Fonctions en Python »)',
      'Les listes, dictionnaires et fichiers',
      'La programmation orientée objet',
    ],
  },

  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Ce que le collège t\'a déjà appris sur les programmes.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-boite-et-son-etiquette', path: `${LESSON_BASE_PATH}/la-boite-et-son-etiquette`, title: 'La boîte et son étiquette', desc: 'Exécute ton premier programme et regarde les variables changer.', stage: 'trigger', teachesLearningPointIds: ['seconde_variables-et-instructions-2nde_P1', 'seconde_variables-et-instructions-2nde_P2'], color: 'violet', style: 'featured', estimatedMin: 13, difficulty: 2, actionText: 'Exécuter' },
    { id: '02', number: 2, slug: 'affecter-n-est-pas-egaler', path: `${LESSON_BASE_PATH}/affecter-n-est-pas-egaler`, title: 'Affecter n\'est pas égaler', desc: 'x = x + 1 : absurde en mathématiques, banal en informatique.', stage: 'discovery', teachesLearningPointIds: ['seconde_variables-et-instructions-2nde_P3', 'seconde_variables-et-instructions-2nde_P8'], color: 'indigo', style: 'default', estimatedMin: 12, difficulty: 2, actionText: 'Comprendre' },
    { id: '03', number: 3, slug: 'le-programme-qui-choisit', path: `${LESSON_BASE_PATH}/le-programme-qui-choisit`, title: 'Le programme qui choisit', desc: 'Une séquence, puis un si… sinon qui change la sortie.', stage: 'discovery', teachesLearningPointIds: ['seconde_variables-et-instructions-2nde_P4', 'seconde_variables-et-instructions-2nde_P5'], color: 'emerald', style: 'default', estimatedMin: 12, difficulty: 3, actionText: 'Brancher' },
    { id: '04', number: 4, slug: 'repeter-sans-recopier', path: `${LESSON_BASE_PATH}/repeter-sans-recopier`, title: 'Répéter sans recopier', desc: 'for quand on sait combien, while quand on attend un seuil.', stage: 'formalization', teachesLearningPointIds: ['seconde_variables-et-instructions-2nde_P6', 'seconde_variables-et-instructions-2nde_P7'], color: 'amber', style: 'default', estimatedMin: 12, difficulty: 3, actionText: 'Boucler' },
    { id: '05', number: 5, slug: 'lire-completer-reparer', path: `${LESSON_BASE_PATH}/lire-completer-reparer`, title: 'Lire, compléter, réparer', desc: 'Trois programmes : un à prévoir, un à compléter, un à réparer.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_variables-et-instructions-2nde_P9', 'seconde_variables-et-instructions-2nde_P10', 'seconde_variables-et-instructions-2nde_P11', 'seconde_variables-et-instructions-2nde_P12'], color: 'rose', style: 'default', estimatedMin: 10, difficulty: 4, actionText: 'Réparer' },
    { id: '06', number: 6, slug: 'mission-finale-le-programme', path: `${LESSON_BASE_PATH}/mission-finale-le-programme`, title: '🏆 Mission finale : le programme', desc: 'Douze épreuves : types, affectation, condition, boucles, vérification.', stage: 'evaluation', color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
