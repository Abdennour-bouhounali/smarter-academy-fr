/**
 * Parallélogrammes et translations — 4e.
 *
 * Programme officiel : cycle 4, BO n°10 du 5 mars 2026 (NOR MENE2602912A),
 * objet `parallelogrammes_translations` du domaine « Espace et géométrie ».
 * Chaîne verticale : la 4e SEULE. Rôle : INTRODUCTION + MAÎTRISE.
 * Périmètre : docs/architecture/CURRICULUM_MATRIX_5E_4E.md ;
 * conception : docs/lessons/4E_PARALLELOGRAMMES_SPEC.md.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX. Les 4 LPs de cette leçon (clé
 * catalogue '4e_parallelogrammes_translations', dans l'ordre de
 * `pointsToLearn`) :
 *
 *   4e_parallelogrammes-translations-4e_P1  Reconnaître le parallélogramme formé par une translation
 *   4e_parallelogrammes-translations-4e_P2  Construire le quatrième sommet d'un parallélogramme par translation
 *   4e_parallelogrammes-translations-4e_P3  Justifier qu'un quadrilatère est un parallélogramme par une translation
 *   4e_parallelogrammes-translations-4e_P4  Utiliser le lien translation / parallélogramme dans une démonstration
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : un parallélogramme n'est pas
 * seulement une FORME, c'est la TRACE d'un glissement. Un même glissement
 * emporte A sur D et B sur C ; les deux trajets [AD] et [BC] sont alors
 * parallèles et de même longueur, et le quadrilatère se referme tout seul.
 * L'élève ne reconnaît donc pas un parallélogramme à son allure : il le
 * fabrique en glissant, et il le justifie par le glissement qui l'a produit.
 *
 * LE RENVERSEMENT PAR RAPPORT À LA 5e tient en une phrase : la 5e demandait
 * « est-ce un parallélogramme ? », la 4e demande « quel glissement l'a
 * fait ? » — et c'est la réponse à la seconde question qui justifie la
 * première.
 *
 * PÉRIMÈTRE — ce que cette leçon ne fait JAMAIS : le VECTEUR, sa notation,
 * ses coordonnées, la relation de Chasles, la composition de deux
 * translations. Tous objets de 3e. La frontière est EXÉCUTABLE :
 * `components/paral4e.js` n'expose aucun objet vectoriel, `assertScope4e`
 * lève si on en demande un, et un test BALAYE tous les fichiers de la leçon
 * à la recherche du mot interdit et de la notation fléchée.
 *
 * LEÇON SŒUR : `transformations-4e` enseigne la translation elle-même. Cette
 * leçon-ci la REÇOIT en `priorKnowledge` et va plus loin — le quatrième
 * sommet construit, la justification rédigée, la démonstration complète.
 * Aucune brique de la sœur n'est redéclarée ici.
 *
 * Fil narratif : un point qu'on ne place pas et qui arrive quand même, puis
 * une figure qu'il faut justifier sans avoir le droit de dire « ça se voit ».
 */
export const LESSON_BASE_PATH = '/courses/college/4e/espace_geometrie/parallelogrammes-translations-4e';

export const LESSON_CONFIG = {
  id: 'parallelogrammes-translations-4e',
  sequentialUnlock: true,
  title: 'Parallélogrammes et translations',
  description:
    "Découvrir qu'un parallélogramme est la trace d'un glissement : placer trois points et voir le quatrième arriver tout seul, retrouver un sommet caché en reportant le trajet, glisser une figure entière, puis justifier et démontrer qu'un quadrilatère est un parallélogramme grâce au glissement qui l'a produit.",
  level: 'college',
  grade: '4e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔷',
  estimatedDurationMin: 64,
  skills: [
    'Reconnaître le parallélogramme formé par une translation',
    "Construire le quatrième sommet d'un parallélogramme par translation",
    'Justifier qu’un quadrilatère est un parallélogramme par une translation',
    'Utiliser le lien translation / parallélogramme dans une démonstration',
  ],
  teachingScope: {
    include: [
      'Le parallélogramme comme trace d’un glissement',
      'Les deux trajets d’un même glissement : parallèles, de même longueur, de même sens',
      'Construire le quatrième sommet en reportant le glissement',
      'L’ordre des sommets, et le quadrilatère croisé qu’un mauvais ordre fabrique',
      'Glisser une figure entière : tous les points font le même trajet',
      'Justifier qu’un quadrilatère est un parallélogramme par le glissement',
      'La chaîne donnée → propriété → conclusion d’une démonstration rédigée',
    ],
    exclude: [
      'Le vecteur, sa notation et son égalité (3e)',
      'Les coordonnées d’un déplacement dans un repère (3e)',
      'La relation de Chasles (3e)',
      'La composition de deux translations (3e)',
      'La rotation et l’homothétie (3e)',
    ],
  },
  // Formalisation continue par la carte des connaissances
  // (docs/architecture/KNOWLEDGE_MAP.md).
  knowledgeMap: true,
  // CHAÎNE DE CONTINUITÉ : le quadrilatère construit au module 1 est CELUI
  // qu'on décortique au module 2, puis celui dont on cache un sommet au
  // module 3. C'est la même figure, regardée trois fois autrement. Au-delà,
  // les modules 4 à 6 ont besoin de configurations CHOISIES — une figure
  // entière à glisser, puis des énoncés SANS figure : y imposer la
  // continuité serait artificiel et priverait la leçon de ses situations.
  continuity: { key: 'quad', chain: [1, 2, 3] },
  // Connaissances SUPPOSÉES acquises (état A), toutes diagnostiquées par le
  // module 0. De la leçon `parallelogrammes-5e` : la définition, la
  // construction, les côtés opposés, les diagonales, les caractérisations.
  // De la leçon sœur `transformations-4e` : le glissement lui-même, l'image
  // d'un point, ses invariants, et le lien qu'elle établit déjà. Le reste
  // vient de la 6e.
  priorKnowledge: [
    'parallelogramme', 'construire-parallelogramme', 'cotes-opposes-egaux',
    'diagonales-milieu', 'caracterisations',
    'translation', 'image', 'invariants-translation', 'translation-parallelogramme',
    'droites-paralleles', 'milieu-segment', 'quadrilatere', 'diagonale',
    'notation-segment', 'angle-droit',
    // Cinq notions de 6e que la leçon MOBILISE sans les enseigner : le
    // losange et les droites perpendiculaires (distracteurs du diagnostic),
    // l'aire (l'invariant affiché par le labo du module 4), le sommet d'une
    // figure (« les cinq sommets du drapeau ») et l'axe de symétrie
    // (distracteur du module 3). Les déclarer ici est ce que demande
    // KNOWLEDGE_DEPENDENCY.md : elles sont alors en état « acquis » plutôt
    // que jamais posées — c'est l'audit qui les a fait remonter.
    'losange', 'droites-perpendiculaires', 'aire', 'sommet-solide', 'axe-symetrie',
  ],
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour vérifier tes acquis de 5e et le glissement.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-quatrieme-point', path: `${LESSON_BASE_PATH}/le-quatrieme-point`,
      title: 'Le quatrième point arrive tout seul', desc: 'Place trois sommets, et regarde le quatrième se poser sans que tu y touches.',
      stage: 'trigger',
      teachesLearningPointIds: [
        '4e_parallelogrammes-translations-4e_P1',
        '4e_parallelogrammes-translations-4e_P2',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 12, difficulty: 1, actionText: 'Faire arriver le point',
    },
    {
      id: '02', number: 2, slug: 'un-seul-glissement', path: `${LESSON_BASE_PATH}/un-seul-glissement`,
      title: 'Un seul glissement, deux trajets', desc: 'Pourquoi la figure se referme : les deux trajets sont le même déplacement.',
      stage: 'discovery',
      teachesLearningPointIds: ['4e_parallelogrammes-translations-4e_P1'],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Comparer les trajets',
    },
    {
      id: '03', number: 3, slug: 'place-le-point-manquant', path: `${LESSON_BASE_PATH}/place-le-point-manquant`,
      title: 'Place le point qui manque', desc: 'Cette fois, personne ne pose C à ta place. Reporte le trajet.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_parallelogrammes-translations-4e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Relever le défi',
    },
    {
      id: '04', number: 4, slug: 'le-meme-deplacement-partout', path: `${LESSON_BASE_PATH}/le-meme-deplacement-partout`,
      title: 'Le même déplacement partout', desc: 'Une figure entière glisse : chaque point trace exactement le même trajet.',
      stage: 'manipulation',
      teachesLearningPointIds: [
        '4e_parallelogrammes-translations-4e_P1',
        '4e_parallelogrammes-translations-4e_P3',
      ],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Faire glisser la figure',
    },
    {
      id: '05', number: 5, slug: 'le-dire-proprement', path: `${LESSON_BASE_PATH}/le-dire-proprement`,
      title: 'Le dire proprement', desc: 'Une figure juste ne suffit pas : il faut écrire la phrase qui la justifie.',
      stage: 'manipulation',
      teachesLearningPointIds: ['4e_parallelogrammes-translations-4e_P3'],
      color: 'purple', style: 'featured', estimatedMin: 7, difficulty: 3, actionText: 'Écrire la justification',
    },
    {
      id: '06', number: 6, slug: 'trois-lignes-qui-prouvent', path: `${LESSON_BASE_PATH}/trois-lignes-qui-prouvent`,
      title: 'Trois lignes qui prouvent', desc: 'Une donnée, une propriété, une conclusion — dans cet ordre, sans en sauter une.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['4e_parallelogrammes-translations-4e_P4'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Rédiger la preuve',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-latelier', path: `${LESSON_BASE_PATH}/mission-finale-latelier`,
      title: '🏆 Mission finale : l’atelier', desc: 'Dix épreuves pour prouver que tu maîtrises le lien glissement / parallélogramme.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 8, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
