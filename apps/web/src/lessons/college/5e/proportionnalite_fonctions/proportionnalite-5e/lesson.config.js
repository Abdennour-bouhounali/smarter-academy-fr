/**
 * Proportionnalité — 5e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `proportionnalite` du domaine « Proportionnalité et fonctions »,
 * rôle « approfondissement » en 5e. Périmètre et frontières de niveau :
 * docs/architecture/CURRICULUM_MATRIX_5E_4E.md ; conception de la famille :
 * docs/lessons/5E_PROPORTIONNALITE_FONCTIONS_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 7 LPs de cette leçon (clé catalogue
 * '5e_proportionnalite', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   5e_proportionnalite-5e_P1  Reconnaître une situation de proportionnalité
 *   5e_proportionnalite-5e_P2  Déterminer un coefficient de proportionnalité
 *   5e_proportionnalite-5e_P3  Compléter un tableau de proportionnalité
 *   5e_proportionnalite-5e_P4  Résoudre un problème d'échelle
 *   5e_proportionnalite-5e_P5  Calculer et appliquer un pourcentage
 *   5e_proportionnalite-5e_P6  Calculer une vitesse moyenne
 *   5e_proportionnalite-5e_P7  Reconnaître la proportionnalité sur un graphique
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : passer d'une grandeur à
 * l'autre, c'est toujours multiplier par LE MÊME nombre. Ce nombre n'est pas
 * un artefact de tableau — il a un sens concret (un prix à l'unité, une
 * échelle, une vitesse), et c'est lui qui EST la situation.
 *
 * CE QUI DISTINGUE CETTE LEÇON DE SES VOISINES VERTICALES :
 *  — la 6e (`proportionnalite`, la kermesse) travaille des PROCÉDURES (unité,
 *    linéarité additive, double/triple) sans jamais isoler un nombre unique,
 *    et le graphique y est explicitement hors programme ;
 *  — la 3e (`proportionnalite-3e`, la recette pour 7) ajoute le produit en
 *    croix, k², k³ et Thalès.
 *  La 5e occupe l'espace laissé libre : elle installe le COEFFICIENT comme
 *  opérateur, ouvre le GRAPHIQUE, et ajoute les trois transferts du niveau —
 *  échelle, pourcentage, vitesse moyenne.
 *
 * CE QUI LA DISTINGUE DE SA VOISINE DE FAMILLE (`fonctions-5e`) : ici, une
 * situation non proportionnelle est un CONTRE-EXEMPLE qu'on apprend à
 * écarter ; là-bas, c'est un cas parfaitement normal. Le tableau et le
 * graphique servent ici à trouver et à reconnaître, là-bas à lire.
 *
 * Fil narratif : la fête de fin d'année du collège — le sirop à doser, la
 * carte du parc, les soldes de la buvette, le trajet du car.
 */
export const LESSON_BASE_PATH = '/courses/college/5e/proportionnalite_fonctions/proportionnalite-5e';

export const LESSON_CONFIG = {
  id: 'proportionnalite-5e',
  sequentialUnlock: true,
  title: 'Proportionnalité',
  description:
    "Doser un sirop et découvrir qu'une seule des deux situations double quand on double, isoler le nombre qui ne bouge pas, remplir un tableau par plusieurs chemins, lire une échelle, appliquer un pourcentage, reconnaître la proportionnalité à l'alignement des points avec l'origine, et donner une unité au coefficient avec la vitesse moyenne.",
  level: 'college',
  grade: '5e',
  chapter: 'proportionnalite_fonctions',
  chapterTitle: 'Proportionnalité et fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 79,
  skills: [
    'Reconnaître une situation de proportionnalité',
    'Déterminer un coefficient de proportionnalité',
    'Compléter un tableau de proportionnalité',
    "Résoudre un problème d'échelle",
    'Calculer et appliquer un pourcentage',
    'Calculer une vitesse moyenne',
    'Reconnaître la proportionnalité sur un graphique',
  ],
  teachingScope: {
    include: [
      'Reconnaître une situation proportionnelle et une situation qui ne l’est pas',
      'Le coefficient de proportionnalité comme opérateur : ×k dans un sens, ÷k dans l’autre',
      'Compléter un tableau : passage par l’unité, facteur entre colonnes, coefficient',
      'Échelle d’un plan ou d’une carte',
      'Pourcentage d’une quantité, et pourcentage comme coefficient',
      'Vitesse moyenne : le coefficient porte une unité',
      'Représentation graphique : des points alignés AVEC l’origine',
    ],
    exclude: [
      'Le produit en croix formel (4e)',
      'Les fonctions linéaires et la notation f(x) (3e)',
      'Les agrandissements et réductions : k² sur les aires, k³ sur les volumes (3e)',
      'La proportionnalité inverse',
    ],
  },
  // Formalisation continue par la carte des connaissances : chaque module pose
  // ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande »), toutes de 6e et toutes diagnostiquées par le module 0 : les
  // tables, le quotient, la lecture d'un tableau, la valeur des décimales et
  // le repérage dans le plan (pour le module 6).
  priorKnowledge: [
    'tables-multiplication', 'quotient', 'lire-tableau', 'valeur-position', 'coordonnees',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-doseur', path: `${LESSON_BASE_PATH}/le-doseur`,
      title: 'Le doseur', desc: 'Deux situations montent quand tu montes. Double l’entrée : une seule double avec toi.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Doser',
    },
    {
      id: '02', number: 2, slug: 'le-nombre-qui-ne-bouge-pas', path: `${LESSON_BASE_PATH}/le-nombre-qui-ne-bouge-pas`,
      title: 'Le nombre qui ne bouge pas', desc: 'Divise chaque sortie par son entrée : dans un seul des deux cas, tu trouves toujours pareil.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P2', '5e_proportionnalite-5e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Trouver le nombre',
    },
    {
      id: '03', number: 3, slug: 'quatre-cases', path: `${LESSON_BASE_PATH}/quatre-cases`,
      title: 'Quatre cases, plusieurs chemins', desc: 'Une case vide, trois façons de la remplir. Choisis la tienne, compare avec les autres.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Remplir',
    },
    {
      id: '04', number: 4, slug: 'la-carte-et-le-terrain', path: `${LESSON_BASE_PATH}/la-carte-et-le-terrain`,
      title: 'La carte et le terrain', desc: 'Un coefficient que tu ne choisis pas : celui qui est écrit sur la carte.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Mesurer',
    },
    {
      id: '05', number: 5, slug: 'les-soldes', path: `${LESSON_BASE_PATH}/les-soldes`,
      title: 'Les soldes', desc: 'Prendre 30 %, c’est multiplier. Enlever 30 %, c’est multiplier aussi — mais pas par le même nombre.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Solder',
    },
    {
      id: '06', number: 6, slug: 'la-ligne-droite', path: `${LESSON_BASE_PATH}/la-ligne-droite`,
      title: 'La ligne droite', desc: 'Place les points d’une situation. Proportionnelle ou pas, ça se voit — à une condition.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P7', '5e_proportionnalite-5e_P1'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '07', number: 7, slug: 'la-vitesse-du-car', path: `${LESSON_BASE_PATH}/la-vitesse-du-car`,
      title: 'La vitesse du car', desc: 'Le coefficient a une unité : des kilomètres par heure. Et il se lit sur la pente.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_proportionnalite-5e_P6'],
      color: 'amber', style: 'featured', estimatedMin: 9, difficulty: 4, actionText: 'Chronométrer',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-la-fete', path: `${LESSON_BASE_PATH}/mission-finale-la-fete`,
      title: '🏆 Mission finale : la fête', desc: 'Dix épreuves pour prouver que tu reconnais un coefficient partout où il se cache.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 6, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
