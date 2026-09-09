/**
 * Représentation de l'espace — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `representations_espace` du domaine « Espace et géométrie », rôle
 * « APPROFONDISSEMENT » dans la chaîne 5e → 4e → 3e.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_REPRESENTATIONS_ESPACE_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * doivent rester des LITTÉRAUX. Les 6 LPs (clé catalogue
 * '4e_representations_espace', append-only) :
 *
 *   4e_representations-espace-4e_P1  Reconnaître une pyramide et un cône de révolution
 *   4e_representations-espace-4e_P2  Identifier la base et la hauteur d'une pyramide
 *   4e_representations-espace-4e_P3  Identifier la base et la hauteur d'un cône
 *   4e_representations-espace-4e_P4  Calculer le volume d'une pyramide
 *   4e_representations-espace-4e_P5  Calculer le volume d'un cône de révolution
 *   4e_representations-espace-4e_P6  Résoudre un problème de volume
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une pyramide et un prisme de
 * même base et même hauteur ne contiennent pas la même chose — il en faut
 * exactement TROIS pour remplir le prisme. Le tiers n'est pas une formule à
 * retenir, c'est un nombre de versements qu'on compte, et qui ne bouge pas
 * quand on change les dimensions.
 *
 * CE QUE LA 5e A DÉJÀ FAIT (`representations-espace-5e`, briques réutilisées
 * en `priorKnowledge`) : les trois vues, la perspective cavalière, les patrons
 * du prisme droit et du cylindre, les dimensions d'un solide.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS. La boule, la sphère, les
 * SECTIONS DE SOLIDES PAR UN PLAN et l'agrandissement des volumes sont des
 * objets de 3e (`representation-espace-3e`). Le laboratoire fait donc tourner,
 * déplier, redimensionner et remplir — il ne coupe pas. La frontière est
 * EXÉCUTABLE : `components/espace4e.js` n'expose aucune de ces fonctions et
 * `assertScope4e` lève si on les demande.
 *
 * Fil narratif : deux récipients jumeaux qu'on remplit, puis une tente, un
 * cornet et un toit.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/representations-espace-4e';

export const LESSON_CONFIG = {
  id: 'representations-espace-4e',
  sequentialUnlock: true,
  title: 'Représentation de l’espace',
  description:
    "Verser une pyramide dans un prisme de même base et même hauteur jusqu'à découvrir qu'il en faut exactement trois, distinguer la hauteur d'une pyramide de son arête, déplier son patron, faire naître un cône en tournant un triangle, puis calculer des volumes dans des situations réelles.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔺',
  estimatedDurationMin: 75,
  skills: [
    'Reconnaître une pyramide et un cône de révolution',
    "Identifier la base et la hauteur d'une pyramide",
    "Identifier la base et la hauteur d'un cône",
    "Calculer le volume d'une pyramide",
    "Calculer le volume d'un cône de révolution",
    'Résoudre un problème de volume',
  ],
  teachingScope: {
    include: [
      'La pyramide à base carrée et le cône de révolution',
      'La base et la hauteur, distinguées de l’arête latérale',
      'Le volume d’une pyramide : le tiers du prisme de même base et même hauteur',
      'Le volume d’un cône de révolution',
      'Le patron d’une pyramide',
      'Le cône engendré par la rotation d’un triangle rectangle',
      'Résoudre un problème de volume',
    ],
    exclude: [
      'Les sections de solides par un plan (3e)',
      'La boule et la sphère (3e)',
      'L’effet d’un agrandissement sur les volumes, k³ (3e)',
      'Les vues et la perspective cavalière comme objets d’étude (installées en 5e)',
      'Le patron du prisme et du cylindre (installés en 5e)',
    ],
  },
  // Formalisation continue par la carte des connaissances.
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : les dimensions réglées au module 1 sont celles
  // qu'on examine au module 2 — c'est le MÊME solide, regardé de plus près.
  // Au-delà, chaque module a besoin de solides choisis (un patron lisible, un
  // cône, des données de problème) : la continuité y serait artificielle.
  continuity: { key: 'solide', chain: [1, 2] },
  // Connaissances SUPPOSÉES acquises (état A), diagnostiquées par le module 0.
  // Les ids sont ceux du LEXIQUE (scripts/audit/lexicon.json) : c'est ce qui
  // permet à l'audit de connaissances de savoir qu'« arête », « patron » ou
  // « perpendiculaire » sont des mots déjà rencontrés, et non des notions que
  // cette leçon devrait poser. Chacun est diagnostiqué au module 0.
  priorKnowledge: [
    'perspective-cavaliere', 'arete-cachee', 'trois-vues', 'patron-solide',
    'arete', 'face-solide', 'sommet-solide', 'pave-droit',
    'aire', 'droites-perpendiculaires', 'angle-droit', 'triangle-rectangle',
    'milieu-segment', 'arrondi',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'trois-versements', path: `${LESSON_BASE_PATH}/trois-versements`,
      title: 'Trois versements', desc: 'Deux récipients jumeaux. Verse la pyramide dans le prisme et compte.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_representations-espace-4e_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Commencer à verser',
    },
    {
      id: '02', number: 2, slug: 'la-pointe-et-le-plancher', path: `${LESSON_BASE_PATH}/la-pointe-et-le-plancher`,
      title: 'La pointe et le plancher', desc: 'Trois longueurs se disputent le nom de « hauteur ». Une seule est la bonne.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_representations-espace-4e_P1', '4e_representations-espace-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Mesurer la pyramide',
    },
    {
      id: '03', number: 3, slug: 'deplier-la-pyramide', path: `${LESSON_BASE_PATH}/deplier-la-pyramide`,
      title: 'Déplier la pyramide', desc: 'Un carré, quatre triangles — et une longueur qu’on se trompe de prendre.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_representations-espace-4e_P1', '4e_representations-espace-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Déplier',
    },
    {
      id: '04', number: 4, slug: 'le-cone-tourne-dun-triangle', path: `${LESSON_BASE_PATH}/le-cone-tourne-dun-triangle`,
      title: 'Le cône, tourné d’un triangle', desc: 'Fais tourner un triangle rectangle : un cône apparaît. Et le tiers revient.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_representations-espace-4e_P1', '4e_representations-espace-4e_P3', '4e_representations-espace-4e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Faire tourner',
    },
    {
      id: '05', number: 5, slug: 'les-deux-formules', path: `${LESSON_BASE_PATH}/les-deux-formules`,
      title: 'Les deux formules', desc: 'Base carrée ou base ronde : le même tiers, deux écritures.',
      stage: 'formalization',
      teachesLearningPointIds: ['4e_representations-espace-4e_P4', '4e_representations-espace-4e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Écrire les formules',
    },
    {
      id: '06', number: 6, slug: 'la-tente-et-le-cornet', path: `${LESSON_BASE_PATH}/la-tente-et-le-cornet`,
      title: 'La tente et le cornet', desc: 'Trois situations réelles, dont une où l’on change une dimension.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_representations-espace-4e_P6'],
      color: 'rose', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Ouvrir l’atelier',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-lentrepot', path: `${LESSON_BASE_PATH}/mission-finale-lentrepot`,
      title: '🏆 Mission finale : l’entrepôt', desc: 'Dix épreuves pour prouver que tu maîtrises les volumes.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
