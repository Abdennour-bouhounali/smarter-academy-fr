/**
 * Repérage dans le plan — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 7 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_reperage-plan_P1  Comprendre qu'un point peut être localisé précisément dans un plan
 *   6e_reperage-plan_P2  Comprendre le rôle de la première et de la deuxième coordonnée
 *   6e_reperage-plan_P3  Lire les coordonnées d'un point dans un repère simple
 *   6e_reperage-plan_P4  Placer un point à partir de ses coordonnées
 *   6e_reperage-plan_P5  Retrouver les coordonnées d'un point placé dans le plan
 *   6e_reperage-plan_P6  Se déplacer dans un quadrillage pour atteindre une position donnée
 *   6e_reperage-plan_P7  Utiliser les coordonnées pour résoudre des problèmes de repérage
 *
 * PÉRIMÈTRE OFFICIEL : l'objet « reperage_plan » exclut explicitement les
 * « coordonnées avec abscisse et ordonnée relatives ». Toute la leçon reste
 * donc dans le premier quadrant, sans nombre négatif, et traite aussi bien le
 * repérage par CASES (A3) que par NŒUDS (3 ; 5).
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/reperage-plan';

export const LESSON_CONFIG = {
  id: 'reperage-plan',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : compter avec des entiers, et lire un quadrillage (lignes,
  // colonnes, cases, croisements) — exactement ce que mesurent les cinq
  // questions du module 0, et rien d'autre. Tout le reste (l'ordre du couple,
  // abscisse, ordonnée, coordonnées, origine, nœud contre case) est établi
  // dans la leçon même.
  priorKnowledge: ['calcul-numerique', 'lecture-quadrillage'],
  // « intervalle » et « minimum » relèvent du lexique de seconde mais sont ici
  // employés dans leur sens courant de l'école élémentaire (l'écart entre deux
  // graduations, le trajet le plus court) : ce ne sont pas les notions de
  // seconde, et aucune question n'en dépend.
  knowledgeAudit: {
    ignore: [
      { term: 'intervalle', reason: "sens élémentaire « écart entre deux graduations », prérequis d'école, jamais la notion de seconde" },
      { term: 'extremum', reason: "« au minimum » au sens courant du trajet le plus court, jamais l'extremum d'une fonction" },
    ],
  },
  title: 'Repérage dans le plan',
  description:
    'Décrire une position sans ambiguïté, lire et placer des points dans un repère, se déplacer dans un quadrillage et résoudre des problèmes de plan.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🗺️',
  estimatedDurationMin: 87,
  skills: [
    'Comprendre qu’un point peut être localisé précisément dans un plan',
    'Comprendre le rôle de la première et de la deuxième coordonnée',
    'Lire les coordonnées d’un point dans un repère simple',
    'Placer un point à partir de ses coordonnées',
    'Retrouver les coordonnées d’un point placé dans le plan',
    'Se déplacer dans un quadrillage pour atteindre une position donnée',
    'Utiliser les coordonnées pour résoudre des problèmes de repérage',
  ],
  teachingScope: {
    include: ['Repérage sur une carte ou un plan', 'Quadrillage (cases, nœuds)'],
    exclude: ['Coordonnées avec abscisse et ordonnée relatives', 'Nombres négatifs', 'Repère du plan en 4 quadrants'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-tresor-perdu', path: `${LESSON_BASE_PATH}/le-tresor-perdu`,
      title: 'Le trésor perdu', desc: '« Il est vers le haut à droite » — décris une position sans qu’on puisse se tromper.',
      stage: 'trigger', teachesLearningPointIds: ['6e_reperage-plan_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'les-deux-nombres', path: `${LESSON_BASE_PATH}/les-deux-nombres`,
      title: 'Les deux nombres', desc: 'Échange les deux nombres : tu n’arrives plus au même endroit. Pourquoi ?',
      stage: 'discovery', teachesLearningPointIds: ['6e_reperage-plan_P2'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Explorer' },
    { id: '03', number: 3, slug: 'lire-un-point', path: `${LESSON_BASE_PATH}/lire-un-point`,
      title: 'Lire un point', desc: 'Un point est posé : retrouve les deux nombres qui le nomment.',
      stage: 'discovery', teachesLearningPointIds: ['6e_reperage-plan_P3', '6e_reperage-plan_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Lire' },
    { id: '04', number: 4, slug: 'placer-un-point', path: `${LESSON_BASE_PATH}/placer-un-point`,
      title: 'Placer un point', desc: 'On te donne les deux nombres : à toi de poser le point au bon nœud.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_reperage-plan_P4'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer' },
    { id: '05', number: 5, slug: 'le-parcours-du-robot', path: `${LESSON_BASE_PATH}/le-parcours-du-robot`,
      title: 'Le parcours du robot', desc: 'Programme les déplacements : combien de pas à droite, combien vers le haut ?',
      stage: 'manipulation', teachesLearningPointIds: ['6e_reperage-plan_P6'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Programmer' },
    { id: '06', number: 6, slug: 'noeuds-et-cases', path: `${LESSON_BASE_PATH}/noeuds-et-cases`,
      title: 'Nœuds et cases', desc: 'A3 ou (3 ; 5) ? Deux façons de repérer, à ne jamais confondre.',
      stage: 'formalization', teachesLearningPointIds: ['6e_reperage-plan_P3'],
      color: 'blue', style: 'featured', estimatedMin: 7, difficulty: 2, actionText: 'Retenir' },
    { id: '07', number: 7, slug: 'missions-de-reperage', path: `${LESSON_BASE_PATH}/missions-de-reperage`,
      title: 'Missions de repérage', desc: 'Croise deux indices, compare des positions, retrouve le point qui manque.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_reperage-plan_P7'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Résoudre' },
    { id: '08', number: 8, slug: 'mission-finale-le-parc', path: `${LESSON_BASE_PATH}/mission-finale-le-parc`,
      title: '🏆 Mission finale : le plan du parc', desc: 'Dix épreuves sur le plan du parc d’aventure.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
