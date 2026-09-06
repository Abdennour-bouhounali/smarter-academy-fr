/**
 * Durées — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 7 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_durees_P1  Utiliser les unités usuelles de durée (jour, heure, minute, seconde)
 *   6e_durees_P2  Lire et interpréter des horaires (horloge, représentation du temps)
 *   6e_durees_P3  Comprendre les relations entre heures, minutes et secondes
 *   6e_durees_P4  Convertir une durée dans une autre unité
 *   6e_durees_P5  Comparer et ordonner des durées
 *   6e_durees_P6  Calculer une durée entre deux instants
 *   6e_durees_P7  Résoudre des problèmes de durée et d'horaires
 *
 * Particularité : SEULE leçon de la famille en base SOIXANTE. Le piège
 * décimal (« 1,5 h = 1 h 50 min ») est traité de front, et toutes les
 * réponses numériques sont entières par conception (champs h et min
 * séparés) — jamais de durée en écriture décimale d'heures en 6e.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/durees';

export const LESSON_CONFIG = {
  id: 'durees',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques au point de besoin et se termine sur l'état
  // courant de la carte (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances
  // avant la demande »), diagnostiquées une à une par le module 0 : le
  // calcul avec les entiers (compléments à 60, soustraction avec retenue,
  // multiples) et le rangement de nombres. La base 60 elle-même n'y figure
  // PAS : c'est le concept central de la leçon, posé par une brique au
  // Module 3 après le tour complet de la grande aiguille.
  priorKnowledge: ['calcul-numerique', 'tables-multiplication', 'ordre-nombres'],
  title: 'Durées',
  description:
    'Lire l’heure, compter en base 60, convertir, comparer et calculer des durées entre deux instants — jusqu’à organiser une vraie journée de voyage.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⏱️',
  estimatedDurationMin: 78,
  skills: [
    'Utiliser les unités usuelles de durée (jour, heure, minute, seconde)',
    'Lire et interpréter des horaires sur une horloge ou une représentation du temps',
    'Comprendre les relations entre heures, minutes et secondes',
    'Convertir une durée dans une autre unité',
    'Comparer et ordonner des durées',
    'Calculer une durée entre deux instants',
    'Résoudre des problèmes de durée et d’horaires',
  ],
  teachingScope: {
    include: ['Lecture de l’heure (12 h / 24 h)', 'Relations 1 h = 60 min, 1 min = 60 s, 1 j = 24 h', 'Méthode des sauts pour les durées'],
    exclude: ['Vitesses moyennes', 'Écriture décimale des heures (1,5 h)', 'Fuseaux horaires'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-course-contre-la-montre', path: `${LESSON_BASE_PATH}/la-course-contre-la-montre`,
      title: 'La course contre la montre', desc: 'Un sprint, un cours, des vacances : chaque durée a son unité.',
      stage: 'trigger', teachesLearningPointIds: ['6e_durees_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'lire-l-heure', path: `${LESSON_BASE_PATH}/lire-l-heure`,
      title: 'Lire l’heure comme un chef de gare', desc: 'Deux aiguilles, deux notations : lire un instant sans se tromper.',
      stage: 'discovery', teachesLearningPointIds: ['6e_durees_P2'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Lire l’heure' },
    { id: '03', number: 3, slug: 'le-secret-du-60', path: `${LESSON_BASE_PATH}/le-secret-du-60`,
      title: 'Le secret du 60', desc: 'Un tour complet de la grande aiguille… et le mystère de la base 60 s’ouvre.',
      stage: 'discovery', teachesLearningPointIds: ['6e_durees_P3'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Découvrir' },
    { id: '04', number: 4, slug: 'convertir-et-comparer', path: `${LESSON_BASE_PATH}/convertir-et-comparer`,
      title: 'Convertir et comparer', desc: '90 min ou 1 h 20 min : qui dure le plus ? Convertis, puis ordonne.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_durees_P4', '6e_durees_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Convertir' },
    { id: '05', number: 5, slug: 'la-methode-des-sauts', path: `${LESSON_BASE_PATH}/la-methode-des-sauts`,
      title: 'La méthode des sauts', desc: 'De 9 h 47 à 12 h 15 : saute d’heure ronde en heure ronde.',
      stage: 'formalization', teachesLearningPointIds: ['6e_durees_P6'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Sauter' },
    { id: '06', number: 6, slug: 'missions-horaires', path: `${LESSON_BASE_PATH}/missions-horaires`,
      title: 'Missions horaires', desc: 'Trains, entraînements, comparaisons : les durées en situation réelle.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_durees_P7'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'le-grand-voyage', path: `${LESSON_BASE_PATH}/le-grand-voyage`,
      title: '🏆 Mission finale : le grand voyage', desc: 'Une journée Paris–Marseille : mobilise tout ce que tu as appris.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
