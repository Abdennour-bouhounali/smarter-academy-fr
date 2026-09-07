/**
 * Nombres réels — 2nde.
 *
 * NOTE VALIDATEUR : les Learning Point ids référencés par
 * `teachesLearningPointIds` et par les métadonnées `assessment` doivent
 * rester des LITTÉRAUX. Les 5 LPs (clé catalogue 'seconde_nombres_reels',
 * append-only) :
 *
 *   seconde_nombres-reels-2nde_P1  Comprendre l’ensemble des nombres réels.
 *   seconde_nombres-reels-2nde_P2  Représenter des nombres réels sur une droite graduée.
 *   seconde_nombres-reels-2nde_P3  Distinguer nombres décimaux, rationnels et irrationnels.
 *   seconde_nombres-reels-2nde_P4  Reconnaître et utiliser les écritures exactes et approchées.
 *   seconde_nombres-reels-2nde_P5  Comparer et encadrer des nombres réels.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : tout nombre réel est un point
 * de la droite ; en zoomant ×10, certains nombres tombent sur une
 * graduation (décimaux), d'autres répètent le même motif sans jamais
 * tomber (rationnels non décimaux), d'autres ne s'arrêtent ni ne se
 * répètent (irrationnels). L'écriture exacte (√2, 1/3, π) est le seul nom
 * complet ; l'écriture décimale est un encadrement.
 *
 * Fil narratif : la diagonale du carreau de 1 m (√2) — placée au zoom (M1),
 * classée (M2), encadrée (M4, M6), figée dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/nombres_calculs/nombres-reels-2nde';

export const LESSON_CONFIG = {
  id: 'nombres-reels-2nde',
  // Connaissance SUPPOSÉE acquise, venue d'« Ensembles et intervalles »
  // (premier objet du domaine) : le symbole ∈, employé pour écrire « 4 ∈ ℕ »
  // dès le module 2. Les familles de nombres elles-mêmes sont la MATIÈRE de
  // cette leçon : elles restent enseignées ici, jamais supposées.
  // Diagnostiquée par q6-appartient.
  priorKnowledge: ['appartient'],
  // Faux positif documenté du lexique : « ordre croissant » dans la question
  // q2 du module 0 est la locution française du RANGEMENT de nombres, pas la
  // notion de variation d'une fonction que le terme vise. Le contrat demande
  // de déclarer l'exception plutôt que d'abaisser le niveau du terme
  // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
  knowledgeAudit: {
    ignore: [{
      term: 'variations',
      reason: "« Range dans l'ordre croissant » (module 0) est le rangement de trois relatifs, pas la variation d'une fonction : cette leçon n'étudie aucune fonction.",
    }],
  },
  sequentialUnlock: true,
  title: 'Nombres réels',
  description:
    "Zoomer dix fois sur la droite pour chercher √2, poser la division de 1 par 3 jusqu'à ce qu'un reste revienne, ranger des nombres dans cinq boîtes emboîtées, encadrer une racine par des carrés : les nombres réels, décimaux, rationnels et irrationnels, découverts en zoomant avant d'être nommés.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'nombres_calculs',
  chapterTitle: 'Nombres et calculs',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: 'ℝ',
  estimatedDurationMin: 75,
  skills: [
    'Comprendre l’ensemble des nombres réels',
    'Représenter des nombres réels sur une droite graduée',
    'Distinguer nombres décimaux, rationnels et irrationnels',
    'Reconnaître et utiliser les écritures exactes et approchées',
    'Comparer et encadrer des nombres réels',
  ],
  teachingScope: {
    include: [
      'La droite des réels : tout réel est un point, tout point est un réel ; zoom ×10 et chiffres successifs',
      'ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ ; décimal ⇔ écriture décimale finie ; rationnel ⇔ écriture périodique ; irrationnels √2, π',
      'Écriture exacte (fraction, racine, π) contre valeur approchée (troncature, arrondi)',
      'Encadrer un réel à 10^-k, encadrer une racine carrée par des carrés, comparer',
    ],
    exclude: [
      'La preuve de l’irrationalité de √2 (leçon « Logique et raisonnement »)',
      'Les intervalles et leur notation (leçon « Ensembles et intervalles »)',
      'La valeur absolue (leçon « Valeur absolue et distance »)',
    ],
  },
  modules: [
    {
      id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases',
    },
    {
      id: '01', number: 1, slug: 'le-zoom-infini', path: `${LESSON_BASE_PATH}/le-zoom-infini`,
      title: 'Le zoom infini', desc: 'Où est √2 sur le mètre-ruban ? Zoome ×10, encore, encore… tombe-t-il un jour sur une graduation ?',
      stage: 'trigger',
      teachesLearningPointIds: [
        'seconde_nombres-reels-2nde_P1', 'seconde_nombres-reels-2nde_P2', 'seconde_nombres-reels-2nde_P5',
      ],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 1, actionText: 'Zoomer',
    },
    {
      id: '02', number: 2, slug: 'les-familles-de-nombres', path: `${LESSON_BASE_PATH}/les-familles-de-nombres`,
      title: 'Les familles de nombres', desc: 'Cinq boîtes emboîtées, ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ : range chaque nombre dans la plus petite.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_nombres-reels-2nde_P1', 'seconde_nombres-reels-2nde_P3'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Ranger',
    },
    {
      id: '03', number: 3, slug: 'decimal-ou-pas', path: `${LESSON_BASE_PATH}/decimal-ou-pas`,
      title: 'Décimal ou pas ?', desc: 'Pose la division, suis les restes : celui qui revient à 0 arrête l’écriture, celui qui revient tout court la fait tourner en rond.',
      stage: 'discovery',
      teachesLearningPointIds: ['seconde_nombres-reels-2nde_P3', 'seconde_nombres-reels-2nde_P4'],
      color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Poser la division',
    },
    {
      id: '04', number: 4, slug: 'exact-ou-approche', path: `${LESSON_BASE_PATH}/exact-ou-approche`,
      title: 'Exact ou approché ?', desc: '1,41 ; 1,414 ; 1,4142… aucun n’a un carré égal à 2. Seul √2 le fait.',
      stage: 'manipulation',
      teachesLearningPointIds: ['seconde_nombres-reels-2nde_P4', 'seconde_nombres-reels-2nde_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Approcher',
    },
    {
      id: '05', number: 5, slug: 'a-retenir', path: `${LESSON_BASE_PATH}/a-retenir`,
      title: 'À retenir', desc: 'Les familles, les écritures, et le bon réflexe : exact tant qu’on calcule, approché seulement pour conclure.',
      stage: 'formalization',
      teachesLearningPointIds: [
        'seconde_nombres-reels-2nde_P1', 'seconde_nombres-reels-2nde_P3', 'seconde_nombres-reels-2nde_P4',
      ],
      color: 'violet', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Retenir',
    },
    {
      id: '06', number: 6, slug: 'encadrer-et-comparer', path: `${LESSON_BASE_PATH}/encadrer-et-comparer`,
      title: 'Encadrer et comparer', desc: 'Encadre √10 par des carrés, range √2 parmi ses approximations, puis clôture un champ dont la diagonale n’est pas décimale.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['seconde_nombres-reels-2nde_P5', 'seconde_nombres-reels-2nde_P2'],
      color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Encadrer',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-la-diagonale', path: `${LESSON_BASE_PATH}/mission-finale-la-diagonale`,
      title: '🏆 Mission finale : la diagonale', desc: 'Dix épreuves pour prouver qu’aucune écriture ne te trompe.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
