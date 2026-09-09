/**
 * Proportionnalité — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `proportionnalite` du domaine « Proportionnalité et fonctions », rôle
 * « APPROFONDISSEMENT » dans la chaîne 6e → 5e → 4e → 3e.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_PROPORTIONNALITE_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées `assessment`
 * doivent rester des LITTÉRAUX. Les 6 LPs de cette leçon (clé catalogue
 * '4e_proportionnalite', append-only, dans l'ordre de `pointsToLearn`) :
 *
 *   4e_proportionnalite-4e_P1  Déterminer une quatrième proportionnelle par le produit en croix
 *   4e_proportionnalite-4e_P2  Calculer une augmentation en pourcentage
 *   4e_proportionnalite-4e_P3  Calculer une diminution en pourcentage
 *   4e_proportionnalite-4e_P4  Utiliser un coefficient multiplicateur
 *   4e_proportionnalite-4e_P5  Retrouver une valeur initiale après une évolution
 *   4e_proportionnalite-4e_P6  Résoudre un problème de proportionnalité en contexte
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une situation proportionnelle
 * est UNE relation, qui se lit indifféremment comme des objets, une table, un
 * rapport, un coefficient ou un alignement de points passant par l'origine.
 * Quand la situation n'est pas proportionnelle, les CINQ lectures cassent
 * ENSEMBLE — c'est ce simultané qui prouve qu'elles décrivent la même chose.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`proportionnalite-5e`, briques réutilisées en
 * `priorKnowledge`) : le coefficient comme opérateur, le tableau, l'échelle,
 * le pourcentage-remise, la vitesse moyenne, et le graphique. La 4e n'y
 * revient pas : elle ajoute l'outil qui manque quand AUCUN passage n'est
 * entier (le produit en croix), et le raisonnement MULTIPLICATIF sur les
 * évolutions — dont le retour en arrière, qui n'est pas l'évolution opposée.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. Les fonctions linéaires,
 * l'effet d'un agrandissement sur les aires et les volumes (k², k³) et le
 * théorème de Thalès sont des objets de 3e (`proportionnalite-3e`,
 * `thales-3e`). La frontière est EXÉCUTABLE : `components/prop4e.js` n'expose
 * aucune de ces fonctions et `assertScope4e` lève si on les demande.
 *
 * Fil narratif : deux ateliers d'affiches qui ne facturent pas de la même
 * façon, puis les prix qui montent et qui descendent.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/proportionnalite_fonctions/proportionnalite-4e';

export const LESSON_CONFIG = {
  id: 'proportionnalite-4e',
  sequentialUnlock: true,
  title: 'Proportionnalité',
  description:
    "Comparer deux ateliers qui facturent différemment et voir cinq lectures d'une même relation casser ensemble, trouver la case vide quand aucun passage n'est entier, faire monter et descendre un prix avec un coefficient, découvrir que revenir en arrière n'est pas l'évolution opposée, et trancher sur un graphique.",
  level: 'college',
  grade: '4e',
  chapter: 'proportionnalite_fonctions',
  chapterTitle: 'Proportionnalité et fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '⚖️',
  estimatedDurationMin: 77,
  skills: [
    'Déterminer une quatrième proportionnelle par le produit en croix',
    'Calculer une augmentation en pourcentage',
    'Calculer une diminution en pourcentage',
    'Utiliser un coefficient multiplicateur',
    'Retrouver une valeur initiale après une évolution',
    'Résoudre un problème de proportionnalité en contexte',
  ],
  teachingScope: {
    include: [
      'Reconnaître une situation proportionnelle à cinq lectures concordantes',
      'La quatrième proportionnelle par le produit en croix',
      'Le coefficient multiplicateur d’une évolution en pourcentage',
      'Augmenter et diminuer un prix d’un pourcentage donné',
      'Retrouver la valeur initiale après une évolution',
      'Enchaîner deux évolutions : les coefficients se multiplient',
      'Trancher graphiquement : alignement AVEC l’origine',
    ],
    exclude: [
      'Les fonctions linéaires (3e)',
      'L’effet d’un agrandissement sur les aires et les volumes, k² et k³ (3e)',
      'Le théorème de Thalès (3e)',
      'Les fonctions affines et le vocabulaire « affine » (3e)',
      'L’échelle et la vitesse moyenne comme objets d’étude (déjà installés en 5e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Aucune CHAÎNE DE CONTINUITÉ : chaque module a son contexte propre
  // (affiches, recette, prix, graphique) et c'est délibéré — le transfert
  // d'un contexte à l'autre EST l'objectif de la proportionnalité. Réutiliser
  // l'atelier du module 1 partout enfermerait la leçon dans un seul décor
  // sans rien apporter mathématiquement.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : le coefficient et le tableau de 5e, le pourcentage, la lecture
  // graphique de la proportionnalité, et le quotient.
  priorKnowledge: [
    'coefficient-proportionnalite', 'tableau-proportionnalite', 'pourcentage',
    'graphique-proportionnalite', 'quotient',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'la-fabrique', path: `${LESSON_BASE_PATH}/la-fabrique`,
      title: 'La fabrique', desc: 'Deux ateliers, un même geste. Cinq façons de lire la même relation — et cinq façons de la voir casser.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Lancer la presse',
    },
    {
      id: '02', number: 2, slug: 'la-case-vide', path: `${LESSON_BASE_PATH}/la-case-vide`,
      title: 'La case vide', desc: 'Quand aucun passage n’est entier, il reste une égalité : celle des deux produits en croix.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Tirer les diagonales',
    },
    {
      id: '03', number: 3, slug: 'le-prix-qui-change', path: `${LESSON_BASE_PATH}/le-prix-qui-change`,
      title: 'Le prix qui change', desc: 'Augmenter, c’est multiplier. Glisse le taux et regarde le coefficient le suivre.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P2', '4e_proportionnalite-4e_P3', '4e_proportionnalite-4e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Faire varier le prix',
    },
    {
      id: '04', number: 4, slug: 'revenir-en-arriere', path: `${LESSON_BASE_PATH}/revenir-en-arriere`,
      title: 'Revenir en arrière', desc: 'Après +20 %, un −20 % ne ramène pas au départ. Retrouve le prix d’avant.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P5', '4e_proportionnalite-4e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Remonter le temps',
    },
    {
      id: '05', number: 5, slug: 'le-graphique-decide', path: `${LESSON_BASE_PATH}/le-graphique-decide`,
      title: 'Le graphique décide', desc: 'Deux nuages de points, une seule question : la droite passe-t-elle par l’origine ?',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P6'],
      color: 'purple', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Placer les points',
    },
    {
      id: '06', number: 6, slug: 'latelier', path: `${LESSON_BASE_PATH}/latelier`,
      title: 'L’atelier', desc: 'Trois situations réelles, de l’énoncé à la réponse : à toi de choisir l’outil.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_proportionnalite-4e_P6', '4e_proportionnalite-4e_P1'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Ouvrir l’atelier',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-boutique', path: `${LESSON_BASE_PATH}/mission-finale-la-boutique`,
      title: '🏆 Mission finale : la boutique', desc: 'Dix épreuves pour prouver que tu maîtrises la proportionnalité.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
