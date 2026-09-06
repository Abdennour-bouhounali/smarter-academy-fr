/**
 * Solides et patrons — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 10 LPs de cette
 * leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_solides-patrons_P1   Reconnaître les principaux solides usuels
 *   6e_solides-patrons_P2   Identifier les faces d'un solide
 *   6e_solides-patrons_P3   Identifier les arêtes d'un solide
 *   6e_solides-patrons_P4   Identifier les sommets d'un solide
 *   6e_solides-patrons_P5   Distinguer les représentations planes et les objets en 3D
 *   6e_solides-patrons_P6   Associer un solide à son patron
 *   6e_solides-patrons_P7   Comprendre comment un patron se replie pour former un solide
 *   6e_solides-patrons_P8   Construire mentalement un solide à partir d'un patron
 *   6e_solides-patrons_P9   Identifier les patrons impossibles
 *   6e_solides-patrons_P10  Résoudre des problèmes de représentation de solides
 *
 * PÉRIMÈTRE OFFICIEL : cube, pavé droit, cylindre, prisme droit ; vocabulaire
 * (faces, arêtes, sommets) ; patrons du CUBE et du PAVÉ DROIT. Les patrons de
 * solides de révolution (cône, cylindre complet) sont exclus.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/espace_geometrie/solides-patrons';

export const LESSON_CONFIG = {
  id: 'solides-patrons',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  // La leçon formalise en continu par sa carte des connaissances : chaque
  // module pose ses briques et se termine sur l'état courant de la carte
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande ») : les figures planes de l'école élémentaire (carré,
  // rectangle, triangle) et les longueurs (périmètre, unités) — exactement ce
  // que mesurent les cinq questions du module 0, et rien d'autre. Tout le
  // reste (face, arête, sommet, pavé droit, patron) est établi dans la leçon.
  priorKnowledge: ['figures-planes-usuelles', 'perimetre', 'unites-longueur'],
  title: 'Solides et patrons',
  description:
    'Passer de l’objet en trois dimensions à sa représentation plane : compter faces, arêtes et sommets, puis plier et déplier des patrons.',
  level: 'college',
  grade: '6e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧊',
  estimatedDurationMin: 80,
  skills: [
    'Reconnaître les solides usuels',
    'Identifier faces, arêtes et sommets',
    'Distinguer un objet 3D de sa représentation plane',
    'Associer un solide à son patron',
    'Comprendre le pliage d’un patron',
    'Repérer un patron impossible',
  ],
  teachingScope: {
    include: [
      'Cube, pavé droit, cylindre, prisme droit',
      'Vocabulaire (faces, arêtes, sommets)',
      'Patrons du cube et du pavé droit',
    ],
    exclude: ['Patrons de solides de révolution', 'Volumes', 'Sections de solides'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-boite-mysterieuse', path: `${LESSON_BASE_PATH}/la-boite-mysterieuse`,
      title: 'La boîte mystérieuse', desc: 'Un dessin plat, un objet en volume : ce que le dessin ne dit pas.',
      stage: 'trigger',
      teachesLearningPointIds: ['6e_solides-patrons_P1', '6e_solides-patrons_P5'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'faces-aretes-sommets', path: `${LESSON_BASE_PATH}/faces-aretes-sommets`,
      title: 'Faces, arêtes, sommets', desc: 'Tourne le solide et compte ce que tu vois — et ce que tu ne vois pas.',
      stage: 'discovery',
      teachesLearningPointIds: ['6e_solides-patrons_P2', '6e_solides-patrons_P3', '6e_solides-patrons_P4'],
      color: 'sky', style: 'featured', estimatedMin: 12, difficulty: 2, actionText: 'Compter' },
    { id: '03', number: 3, slug: 'deplier-le-cube', path: `${LESSON_BASE_PATH}/deplier-le-cube`,
      title: 'Déplier le cube', desc: 'Ouvre la boîte à plat : voilà son patron.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_solides-patrons_P6', '6e_solides-patrons_P7'],
      color: 'violet', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Déplier' },
    { id: '04', number: 4, slug: 'plier-dans-sa-tete', path: `${LESSON_BASE_PATH}/plier-dans-sa-tete`,
      title: 'Plier dans sa tête', desc: 'Ce patron donnera-t-il un cube ? Prédis, puis vérifie en pliant.',
      stage: 'manipulation',
      teachesLearningPointIds: ['6e_solides-patrons_P8', '6e_solides-patrons_P9'],
      color: 'purple', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Prédire' },
    { id: '05', number: 5, slug: 'la-fiche-des-solides', path: `${LESSON_BASE_PATH}/la-fiche-des-solides`,
      title: 'La fiche des solides', desc: 'Chaque solide, ses faces, ses arêtes, ses sommets — à retenir.',
      stage: 'formalization',
      teachesLearningPointIds: ['6e_solides-patrons_P1'],
      color: 'blue', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Retenir' },
    { id: '06', number: 6, slug: 'problemes-de-solides', path: `${LESSON_BASE_PATH}/problemes-de-solides`,
      title: 'Problèmes de solides', desc: 'Emballer, peindre, compter : la 3D dans la vraie vie.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_solides-patrons_P10'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'mission-finale-l-emballage', path: `${LESSON_BASE_PATH}/mission-finale-l-emballage`,
      title: '🏆 Mission finale : l’atelier d’emballage', desc: 'Dix épreuves : solides, patrons et pliages.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
