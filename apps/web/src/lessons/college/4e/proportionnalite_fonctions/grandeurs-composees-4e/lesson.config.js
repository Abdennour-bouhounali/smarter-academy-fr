/**
 * Grandeurs composées — 4e.
 *
 * ─── POURQUOI CETTE LEÇON EXISTE, ET OÙ ELLE SE RATTACHE ──────────────
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A).
 * Le référentiel 2026 ne porte AUCUN objet « grandeurs et mesures » au cycle 4
 * (il n'en existe qu'en 6e). Les grandeurs composées y vivent dans la
 * PROPORTIONNALITÉ : la 5e y installe la vitesse moyenne (brique
 * `vitesse-moyenne`), la 3e y ajoute les « grandeurs quotient » (brique
 * `grandeurs-quotient` de `proportionnalite-3e`).
 *
 * Cette leçon est donc la PART 2 de l'objet officiel `proportionnalite`, et non
 * un objet inventé — exactement comme `pythagore-4e` est la part 2 de
 * `4e_triangles`. La clé catalogue `4e_proportionnalite` porte un TABLEAU de
 * deux entrées (mécanisme `buildLesson`, partIndex 1 et 2).
 *
 * La coupe est pédagogique : `proportionnalite-4e` traite le NOMBRE (quatrième
 * proportionnelle, coefficient multiplicateur, évolutions) ; cette leçon traite
 * la GRANDEUR (ce qu'est un km/h, pourquoi le débit n'est pas une notion de
 * plus, et pourquoi « ÷ 3,6 » n'est pas une recette).
 *
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_GRANDEURS_COMPOSEES_SPEC.md.
 *
 * ─── NOTE VALIDATEUR (scripts/validate-lessons.mjs) ───────────────────
 * Les Learning Point ids référencés par `teachesLearningPointIds` et par les
 * métadonnées `assessment` doivent rester des LITTÉRAUX. Les 6 LPs de cette
 * leçon (clé catalogue '4e_proportionnalite', élément 1, append-only, dans
 * l'ordre de `pointsToLearn`) :
 *
 *   4e_grandeurs-composees-4e_P1  Relier distance, durée et vitesse
 *   4e_grandeurs-composees-4e_P2  Reconnaître une grandeur quotient et une grandeur produit
 *   4e_grandeurs-composees-4e_P3  Calculer un débit
 *   4e_grandeurs-composees-4e_P4  Convertir une vitesse de km/h en m/s
 *   4e_grandeurs-composees-4e_P5  Interpréter une formule reliant des grandeurs
 *   4e_grandeurs-composees-4e_P6  Résoudre un problème de grandeurs composées
 *
 * ─── L'IDÉE CENTRALE, VÉCUE AVANT D'ÊTRE NOMMÉE ───────────────────────
 * Une vitesse n'est pas un nombre : c'est DEUX grandeurs tenues ensemble. On le
 * découvre en fixant l'une des trois et en bougeant une autre — parce que la
 * réponse à « si je double, que se passe-t-il ? » DÉPEND de ce qu'on a fixé.
 * Doubler la distance à durée fixée double la vitesse ; doubler la durée à
 * distance fixée la divise par deux. Ce n'est pas un piège : c'est la structure.
 *
 * ─── CE QUE LA 5e A DÉJÀ FAIT ─────────────────────────────────────────
 * `proportionnalite-5e` a installé le CALCUL d'une vitesse moyenne
 * (`vitesse-moyenne`, `mem-vitesse`) et le coefficient de proportionnalité. La
 * 4e n'y revient pas : elle explique ce QU'EST cette vitesse, montre que le
 * débit et la masse volumique ont la MÊME structure, oppose le quotient au
 * produit, et fait changer d'unité par le sens.
 *
 * ─── PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS ────────────────────
 * Les fonctions linéaires et affines, et l'effet d'un agrandissement sur les
 * aires et les volumes (k², k³), sont des objets de 3e. Les mots « fonction
 * affine » et « coefficient directeur » n'apparaissent nulle part. La frontière
 * est EXÉCUTABLE : `components/grandeurs4e.js` n'expose aucune de ces fonctions
 * et `assertScope4e` lève si on les demande.
 *
 * Fil narratif : un cycliste dont on règle le trajet, puis un robinet, une
 * autoroute et un carnet de route.
 */
export const LESSON_BASE_PATH = '/courses/college/4e/proportionnalite_fonctions/grandeurs-composees-4e';

export const LESSON_CONFIG = {
  id: 'grandeurs-composees-4e',
  sequentialUnlock: true,
  title: 'Grandeurs composées',
  description:
    "Régler trois cadrans liés et découvrir que « si je double » n'a pas la même réponse selon ce qu'on tient fixe, trier les unités qui se lisent « par » de celles qui se lisent « fois », retrouver la même structure dans un robinet qui remplit, changer de km/h en m/s par le sens et non par une recette, puis lire une formule dans ses trois sens.",
  level: 'college',
  grade: '4e',
  chapter: 'proportionnalite_fonctions',
  chapterTitle: 'Proportionnalité et fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🚴',
  estimatedDurationMin: 77,
  skills: [
    'Relier distance, durée et vitesse',
    'Reconnaître une grandeur quotient et une grandeur produit',
    'Calculer un débit',
    'Convertir une vitesse de km/h en m/s',
    'Interpréter une formule reliant des grandeurs',
    'Résoudre un problème de grandeurs composées',
  ],
  teachingScope: {
    include: [
      'La vitesse comme grandeur QUOTIENT : deux grandeurs tenues ensemble',
      'Distinguer une grandeur quotient d’une grandeur produit',
      'Lire une unité composée : « par » ou « fois »',
      'Le débit, un volume par unité de temps',
      'La masse volumique, une masse par unité de volume',
      'Convertir km/h ↔ m/s en raisonnant sur le sens de l’unité',
      'Lire une formule reliant des grandeurs, dans ses trois sens',
      'Résoudre un problème de grandeurs composées en contexte',
    ],
    exclude: [
      'Les fonctions linéaires (3e)',
      'Les fonctions affines et le vocabulaire « affine » ou « coefficient directeur » (3e)',
      'L’effet d’un agrandissement sur les aires et les volumes, k² et k³ (3e)',
      'La vitesse moyenne comme objet d’étude à calculer (déjà installée en 5e)',
      'Le produit en croix et les évolutions en pourcentage (part 1, proportionnalite-4e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // Aucune CHAÎNE DE CONTINUITÉ, et c'est DÉLIBÉRÉ. L'objectif même de la leçon
  // est que la structure « une grandeur par une autre » se TRANSPORTE d'un
  // contexte à l'autre : le cycliste, les étiquettes, le robinet, l'autoroute,
  // le carnet. Garder le cycliste partout enfermerait la leçon dans un seul
  // décor et détruirait son argument central — que le débit n'est pas une
  // notion de plus, mais la même sur d'autres grandeurs.
  continuity: null,
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0 : la vitesse moyenne et son mémo (5e), le coefficient de
  // proportionnalité (5e), et le quotient.
  priorKnowledge: [
    'vitesse-moyenne', 'mem-vitesse', 'coefficient-proportionnalite', 'quotient',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-tableau-de-bord', path: `${LESSON_BASE_PATH}/le-tableau-de-bord`,
      title: 'Le tableau de bord', desc: 'Trois cadrans liés. Tiens-en un fixe, bouge un autre — et regarde le troisième obéir.',
      stage: 'trigger',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 13, difficulty: 1, actionText: 'Régler les cadrans',
    },
    {
      id: '02', number: 2, slug: 'par-ou-fois', path: `${LESSON_BASE_PATH}/par-ou-fois`,
      title: '« Par » ou « fois » ?', desc: 'Des étiquettes d’unités à trier. La lecture à voix haute décide, pas la barre de fraction.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P2'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Trier les étiquettes',
    },
    {
      id: '03', number: 3, slug: 'le-robinet', path: `${LESSON_BASE_PATH}/le-robinet`,
      title: 'Le robinet', desc: 'Un réservoir se remplit. Rien de neuf à apprendre : c’est exactement le tableau de bord.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P3'],
      color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Ouvrir le robinet',
    },
    {
      id: '04', number: 4, slug: 'mille-metres-en-trois-mille-six-cents-secondes',
      path: `${LESSON_BASE_PATH}/mille-metres-en-trois-mille-six-cents-secondes`,
      title: '1000 mètres en 3600 secondes', desc: 'Changer d’unité en disant ce que l’unité veut dire — le raccourci arrive après, tout seul.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Refaire le raisonnement',
    },
    {
      id: '05', number: 5, slug: 'lire-une-formule', path: `${LESSON_BASE_PATH}/lire-une-formule`,
      title: 'Lire une formule', desc: 'Une seule égalité, trois questions. Choisis celle qui répond à la tienne.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P5'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Retourner la formule',
    },
    {
      id: '06', number: 6, slug: 'le-carnet-de-route', path: `${LESSON_BASE_PATH}/le-carnet-de-route`,
      title: 'Le carnet de route', desc: 'Trois situations réelles, de l’énoncé à la réponse : à toi de reconnaître la structure.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_grandeurs-composees-4e_P6', '4e_grandeurs-composees-4e_P3'],
      color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Ouvrir le carnet',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-grand-trajet', path: `${LESSON_BASE_PATH}/mission-finale-le-grand-trajet`,
      title: '🏆 Mission finale : le grand trajet', desc: 'Dix épreuves pour prouver que tu maîtrises les grandeurs composées.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 9, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
