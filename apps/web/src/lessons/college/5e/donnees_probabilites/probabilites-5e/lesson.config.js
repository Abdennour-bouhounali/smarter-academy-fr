/**
 * Probabilités — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `probabilites` du domaine « Données et probabilités », applicable à
 * la 5e à la rentrée 2026-2027.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon
 * (clé catalogue '5e_probabilites', append-only) :
 *
 *   5e_probabilites-5e_P1  Reconnaître une expérience aléatoire
 *   5e_probabilites-5e_P2  Identifier les issues d'une expérience aléatoire
 *   5e_probabilites-5e_P3  Décrire un événement par les issues qui le réalisent
 *   5e_probabilites-5e_P4  Reconnaître une situation d'équiprobabilité
 *   5e_probabilites-5e_P5  Calculer une probabilité en situation d'équiprobabilité
 *   5e_probabilites-5e_P6  Situer une probabilité sur l'échelle de 0 à 1
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : le hasard n'est pas
 * l'imprévisible total. On ne sait pas ce que DONNERA le prochain lancer,
 * mais on sait exactement CE QUI PEUT ARRIVER — et si rien ne distingue ces
 * possibilités entre elles, on peut mesurer la chance de chacune. La
 * probabilité n'est donc pas une prédiction : c'est une mesure.
 *
 * L'ORDRE EST NON NÉGOCIABLE, et il est l'inverse de l'ordre d'exposition
 * habituel. La leçon ne commence PAS par « P(A) = favorables / possibles ».
 * Elle commence par un lancer, une prédiction que l'élève écrit avant de
 * savoir, puis une répétition qui fait apparaître une régularité — et le
 * quotient n'arrive qu'au module 6, pour rendre compte de ce qui a été
 * observé au module 5. Le mot « probabilité » lui-même est retenu jusque-là.
 *
 *   expérience (M1) → issues (M2) → événement (M3) → équiprobabilité (M4)
 *              → fréquence observée en répétant (M5) → probabilité (M6)
 *
 * FIL NARRATIF — trois dispositifs qu'on garde tout du long : la pièce, le dé
 * à six faces, et le sac de 6 billes (3 rouges, 2 bleues, 1 verte). Le sac
 * est le contre-exemple indispensable : ses BILLES sont équiprobables, ses
 * COULEURS ne le sont pas. Sans lui, « toutes les issues ont la même chance »
 * se mémorise comme une loi de la nature au lieu d'une condition à vérifier.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait PAS : l'événement contraire et la
 * réunion/intersection (4e) ; les arbres à plusieurs niveaux et les
 * expériences à deux épreuves (4e) ; la loi des grands nombres énoncée (4e) ;
 * les probabilités conditionnelles (lycée). Le module 5 fait CONSTATER que la
 * fréquence se rapproche de la probabilité quand on répète, sans jamais
 * énoncer le théorème. La garde est exécutable : le noyau lève sur
 * `assertScope5e('loi-des-grands-nombres')` — cf. components/probabilites.js.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/donnees_probabilites/probabilites-5e';

export const LESSON_CONFIG = {
  id: 'probabilites-5e',
  sequentialUnlock: true,
  title: 'Probabilités',
  description:
    "Découvrir le hasard par l’expérience : lancer avant de savoir, écrire une prédiction, énumérer ce qui peut arriver, décrire un événement par les issues qui le réalisent, vérifier que rien ne favorise personne — puis répéter des milliers de fois jusqu’à voir apparaître le nombre que la formule finira par écrire.",
  level: 'college',
  grade: '5e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Données et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🎲',
  estimatedDurationMin: 77,
  skills: [
    'Reconnaître une expérience aléatoire',
    "Identifier les issues d'une expérience aléatoire",
    'Décrire un événement par les issues qui le réalisent',
    "Reconnaître une situation d'équiprobabilité",
    "Calculer une probabilité en situation d'équiprobabilité",
    "Situer une probabilité sur l'échelle de 0 à 1",
  ],
  teachingScope: {
    include: [
      'Une expérience aléatoire : on connaît les possibilités, pas le résultat',
      'Les issues : tout ce qui peut arriver, une fois et une seule',
      'Un événement, décrit par les issues qui le réalisent',
      'L’équiprobabilité : une condition qui se vérifie, pas une évidence',
      'Répéter une expérience et observer la fréquence se stabiliser',
      'La probabilité : favorables ÷ possibles, quand les issues sont équiprobables',
      'L’échelle de 0 à 1 : impossible, peu probable, certain',
    ],
    exclude: [
      'L’événement contraire, la réunion et l’intersection (4e)',
      'Les expériences à deux épreuves et les arbres à plusieurs niveaux (4e)',
      'La loi des grands nombres énoncée comme théorème (4e)',
      'Les probabilités conditionnelles (lycée)',
    ],
  },
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A), toutes venues de la 6e et du
  // début de la 5e, et toutes diagnostiquées par le module 0 : la fraction
  // comme part d'un tout, le passage fraction ↔ pourcentage, comparer deux
  // fractions simples, et lire une fréquence dans un tableau.
  priorKnowledge: [
    'fraction-part', 'fraction-pourcentage', 'comparer-fractions', 'lire-tableau',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'lance-avant-de-savoir', path: `${LESSON_BASE_PATH}/lance-avant-de-savoir`,
      title: 'Lance avant de savoir', desc: 'Écris ta prédiction, puis lance. Ce qui te surprend est le vrai sujet.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_probabilites-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Lancer',
    },
    {
      id: '02', number: 2, slug: 'tout-ce-qui-peut-arriver', path: `${LESSON_BASE_PATH}/tout-ce-qui-peut-arriver`,
      title: 'Tout ce qui peut arriver', desc: 'Coche les résultats possibles — sans en oublier, et sans en compter deux fois.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_probabilites-5e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Lister les issues',
    },
    {
      id: '03', number: 3, slug: 'decrire-un-evenement', path: `${LESSON_BASE_PATH}/decrire-un-evenement`,
      title: 'Décrire un événement', desc: '« Faire un nombre pair » : quelles faces le réalisent ? Sélectionne-les.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_probabilites-5e_P3'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Décrire',
    },
    {
      id: '04', number: 4, slug: 'le-sac-truque', path: `${LESSON_BASE_PATH}/le-sac-truque`,
      title: 'Le sac qui n’est pas juste', desc: 'Trois rouges, deux bleues, une verte. Les billes sont-elles à égalité ? Et les couleurs ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_probabilites-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Vérifier l’égalité',
    },
    {
      id: '05', number: 5, slug: 'repeter-mille-fois', path: `${LESSON_BASE_PATH}/repeter-mille-fois`,
      title: 'Répéter mille fois', desc: '10 lancers, 100, 10 000 : la fréquence s’approche d’un nombre. Lequel ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_probabilites-5e_P5', '5e_probabilites-5e_P2'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Répéter',
    },
    {
      id: '06', number: 6, slug: 'mesurer-la-chance', path: `${LESSON_BASE_PATH}/mesurer-la-chance`,
      title: 'Mesurer la chance', desc: 'Le nombre que tu as vu apparaître se calcule sans rien lancer. Voici comment.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_probabilites-5e_P5', '5e_probabilites-5e_P3'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '07', number: 7, slug: 'de-l-impossible-au-certain', path: `${LESSON_BASE_PATH}/de-l-impossible-au-certain`,
      title: 'De l’impossible au certain', desc: 'Place chaque événement sur la règle graduée de 0 à 1.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_probabilites-5e_P6', '5e_probabilites-5e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Placer sur l’échelle',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-le-pari-eclaire', path: `${LESSON_BASE_PATH}/mission-finale-le-pari-eclaire`,
      title: '🏆 Mission finale : le pari éclairé', desc: 'Dix épreuves pour mesurer une chance au lieu de la deviner.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
