/**
 * Fonctions affines (3e) — « Les deux boutons ».
 *
 * Learning Points (coursesData.js, clé '3e_fonctions_affines', dans l'ordre de
 * `pointsToLearn` — ne jamais inventer ni recalculer un id) :
 *   3e_fonctions-affines-3e_P1  — Reconnaître une fonction affine
 *   3e_fonctions-affines-3e_P2  — Comprendre la forme f(x)=ax+b
 *   3e_fonctions-affines-3e_P3  — Identifier le coefficient directeur a
 *   3e_fonctions-affines-3e_P4  — Identifier l'ordonnée à l'origine b
 *   3e_fonctions-affines-3e_P5  — Comprendre le rôle de a sur le graphique
 *   3e_fonctions-affines-3e_P6  — Comprendre le rôle de b sur le graphique
 *   3e_fonctions-affines-3e_P7  — Calculer l'image d'un nombre
 *   3e_fonctions-affines-3e_P8  — Construire un tableau de valeurs
 *   3e_fonctions-affines-3e_P9  — Représenter graphiquement une fonction affine
 *   3e_fonctions-affines-3e_P10 — Déterminer l'expression à partir de données
 *   3e_fonctions-affines-3e_P11 — Modéliser une situation concrète
 *
 * IDÉE CENTRALE — a et b ne font PAS le même travail. a est un taux (de combien
 * ça monte quand x avance de 1), b une valeur de départ (ce qu'on a en x = 0).
 * Toute la leçon est construite pour que cette dissociation soit VUE : les
 * modules 2 et 3 verrouillent l'un des deux réglages (pédagogie §8, une
 * variable à la fois) avant que le module 4 ne libère les deux.
 *
 * CE QUI LA DISTINGUE DES LEÇONS VOISINES : `fonctions-lineaires-3e` étudiait
 * la droite qui pivote autour de O ; ici la droite GLISSE aussi, et c'est le
 * point (0 ; b) qui devient l'objet d'attention. `fonctions-3e` a déjà comparé
 * deux forfaits au curseur : le module 6 ne le refait pas, il part de deux
 * FACTURES et remonte aux expressions (P10), puis règle b pour changer le
 * verdict — la modélisation à l'envers.
 *
 * INVARIANT SIGNATURE : changer b ne change jamais l'inclinaison ; changer a ne
 * change jamais le point de départ sur l'axe des ordonnées.
 */

export const LESSON_BASE_PATH = '/courses/college/3e/donnees_probabilites/fonctions-affines-3e';

export const LESSON_CONFIG = {
  id: 'fonctions-affines-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte.
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (états A du contrat « connaissances avant
  // la demande ») : le vocabulaire des fonctions vient de `fonctions-3e`, le
  // repérage de 6e et le calcul littéral de 4e. Le module 0 les diagnostique —
  // et rien d'autre. Tout le reste (a, b, leurs noms, leurs rôles) est établi
  // dans la leçon même, par des <KnowledgeBrick>.
  priorKnowledge: [
    'fonction', 'notation-fx', 'image', 'fonction-lineaire',
    'tableau-de-valeurs', 'representation-graphique',
    'calcul-litteral', 'abscisse', 'ordonnee', 'coordonnees', 'origine-repere',
    'proportionnalite', 'coefficient-lineaire',
  ],
  title: 'Fonctions affines',
  description:
    "Comprendre que dans f(x) = ax + b le coefficient a commande l'inclinaison et b le point de départ, en verrouillant l'un pour observer l'autre, puis retrouver l'expression à partir de deux points et s'en servir pour comparer deux tarifs.",
  level: 'college',
  grade: '3e',
  chapter: 'donnees_probabilites',
  chapterTitle: 'Organisation et gestion de données, fonctions',
  passingScore: 5,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 65,
  skills: [
    'Reconnaître une fonction affine',
    'Comprendre la forme f(x)=ax+b',
    'Identifier le coefficient directeur a',
    "Identifier l'ordonnée à l'origine b",
    'Comprendre le rôle de a sur la représentation graphique',
    'Comprendre le rôle de b sur la représentation graphique',
    "Calculer l'image d'un nombre",
    'Construire un tableau de valeurs',
    'Représenter graphiquement une fonction affine',
    "Déterminer l'expression d'une fonction affine à partir de données",
    'Utiliser une fonction affine pour modéliser une situation concrète',
  ],
  teachingScope: {
    include: [
      'Forme f(x) = ax + b et rôle séparé des deux paramètres',
      "Lecture de a (escalier) et de b (ordonnée à l'origine) sur un graphique",
      'Tableau de valeurs et tracé de la droite',
      "Détermination de l'expression à partir de deux points",
      'Comparaison de deux tarifs à part fixe',
    ],
    exclude: [
      'Résolution algébrique de systèmes',
      'Inéquations et étude de signe',
      'Fonctions non affines (carré, inverse)',
      'Droites verticales et équation x = k',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ',
      desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-taxi-et-le-forfait', path: `${LESSON_BASE_PATH}/le-taxi-et-le-forfait`,
      title: 'Le taxi et le forfait',
      desc: 'Deux nombres commandent le prix : celui qu’on paie d’avance, et celui qui court.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P1', '3e_fonctions-affines-3e_P2'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Monter dans le taxi',
    },
    {
      id: '02', number: 2, slug: 'le-bouton-a', path: `${LESSON_BASE_PATH}/le-bouton-a`,
      title: 'Le bouton a',
      desc: 'On bloque b. Un seul réglage bouge — et la droite s’incline.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P3', '3e_fonctions-affines-3e_P5', '3e_fonctions-affines-3e_P7'],
      color: 'sky', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Régler a',
    },
    {
      id: '03', number: 3, slug: 'le-bouton-b', path: `${LESSON_BASE_PATH}/le-bouton-b`,
      title: 'Le bouton b',
      desc: 'On bloque a. La droite garde son inclinaison et glisse.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P4', '3e_fonctions-affines-3e_P6'],
      color: 'cyan', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Régler b',
    },
    {
      id: '04', number: 4, slug: 'les-deux-boutons', path: `${LESSON_BASE_PATH}/les-deux-boutons`,
      title: 'Les deux boutons',
      desc: 'Les deux réglages libres, un tableau qui suit, un graphique à lire.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P5', '3e_fonctions-affines-3e_P6', '3e_fonctions-affines-3e_P8', '3e_fonctions-affines-3e_P9'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Tout régler',
    },
    {
      id: '05', number: 5, slug: 'deux-points-suffisent', path: `${LESSON_BASE_PATH}/deux-points-suffisent`,
      title: 'Deux points suffisent',
      desc: 'Un triangle entre deux points donne a ; le reste donne b.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P10', '3e_fonctions-affines-3e_P3', '3e_fonctions-affines-3e_P4'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Construire le triangle',
    },
    {
      id: '06', number: 6, slug: 'la-facture-a-lenvers', path: `${LESSON_BASE_PATH}/la-facture-a-lenvers`,
      title: 'La facture à l’envers',
      desc: 'Deux factures, deux expressions à retrouver — puis un abonnement à négocier.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_fonctions-affines-3e_P11', '3e_fonctions-affines-3e_P7', '3e_fonctions-affines-3e_P10'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Enquêter',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-latelier-des-tarifs', path: `${LESSON_BASE_PATH}/mission-finale-latelier-des-tarifs`,
      title: '🏆 Mission finale : l’atelier des tarifs',
      desc: 'Huit épreuves où a et b ne doivent jamais être confondus.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
