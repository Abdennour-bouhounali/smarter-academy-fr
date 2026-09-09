/**
 * Repérage sur une droite et dans le plan — 5e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX (ils sont lus statiquement).
 * Les 5 LPs de cette leçon (clé catalogue '5e_reperage') :
 *
 *   5e_reperage-5e_P1   Lire l'abscisse d'un point, positive ou négative
 *   5e_reperage-5e_P2   Placer un point d'abscisse donnée sur une droite graduée
 *   5e_reperage-5e_P3   Identifier les axes et l'origine d'un repère du plan
 *   5e_reperage-5e_P4   Lire les coordonnées d'un point dans les quatre quadrants
 *   5e_reperage-5e_P5   Placer un point à partir de ses coordonnées
 *
 * ─── L'IDÉE CENTRALE ──────────────────────────────────────────────────
 * Un seul nombre ne suffit pas à DÉSIGNER UN ENDROIT. Le module 1 ne
 * commence donc pas par une définition de repère (CLAUDE.md §4) : l'élève
 * bouge un unique curseur sur la carte du domaine et voit DEUX lieux
 * s'allumer en même temps. C'est ce manque constaté qui appelle le second
 * axe, et le mot « repère » n'arrive qu'au module 2, comme sa réponse.
 *
 * ─── LA FRONTIÈRE AVEC `nombres-relatifs-5e` (contrainte la plus forte) ─
 * La leçon voisine du même niveau enseigne déjà « lire et placer un relatif
 * sur une droite graduée » et « comparer des relatifs », avec un ascenseur
 * vertical puis la même droite couchée. Une manipulation qui ferait glisser
 * une cabine le long d'un axe signé serait donc un DOUBLON de 5e à 5e.
 *
 * Partage retenu : `nombres-relatifs-5e` construit le NOMBRE (signe, opposé,
 * ordre) ; cette leçon-ci s'en sert pour situer un POINT. L'abscisse
 * relative est ici un PRÉREQUIS (`priorKnowledge`), révisé en deux étapes au
 * module 1, jamais réenseigné. C'est pourquoi la droite graduée n'occupe
 * qu'une rampe et que le poids porte sur le plan (modules 2 à 5).
 * Voir docs/lessons/5E_REPERAGE_SPEC.md §3.2.
 *
 * ─── PÉRIMÈTRE (exécutable, pas déclaratif) ───────────────────────────
 * Le référentiel 2026 exclut les coordonnées dans l'espace :
 * `components/reperageUtils.js` lève une exception si on passe une
 * troisième composante à `point()`. Les longueurs, milieux, figures et
 * symétries lues sur les coordonnées restent à la 3e
 * (`reperage-droite-plan-3e`) ; la distance entre deux points quelconques
 * exigerait Pythagore (4e).
 */
export const LESSON_BASE_PATH = '/courses/college/5e/espace_geometrie/reperage-5e';

export const LESSON_CONFIG = {
  id: 'reperage-5e',
  // Formalisation continue par la carte des connaissances (pas de module
  // 'formalization' : chaque module contribue ses briques à la carte).
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises, diagnostiquées par le module 0.
  // `abscisse` et `lecture-quadrillage` viennent de la 6e ; `nombres-relatifs`
  // et `ordre-nombres` de la leçon voisine de 5e, déjà livrée.
  priorKnowledge: ['abscisse', 'lecture-quadrillage', 'nombres-relatifs', 'ordre-nombres', 'calcul-numerique'],
  sequentialUnlock: true,
  title: 'Repérage sur une droite et dans le plan',
  description:
    "Découvrir qu'un seul nombre ne suffit pas à désigner un endroit : deux lieux du domaine partagent la même abscisse. Ajouter le second axe, lire et placer des points dans les quatre quadrants, et ne jamais échanger les deux nombres du couple.",
  level: 'college',
  grade: '5e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📍',
  estimatedDurationMin: 65,
  skills: [
    "Lire l'abscisse d'un point, positive ou négative",
    "Placer un point d'abscisse donnée sur une droite graduée",
    "Identifier les axes et l'origine d'un repère du plan",
    "Lire les coordonnées d'un point dans les quatre quadrants",
    'Placer un point à partir de ses coordonnées',
  ],
  teachingScope: {
    include: [
      "Abscisse d'un point sur une droite graduée, positive ou négative",
      'Repère du plan : les deux axes, leur origine',
      'Coordonnées dans les quatre quadrants (abscisse et ordonnée relatives)',
      'Lecture et placement de points, ordre du couple',
      "Point situé sur un axe : aucune appartenance à un quadrant",
      "Échelle d'une graduation différente de 1",
    ],
    exclude: [
      "Coordonnées dans l'espace",
      'Distance entre deux points quelconques (exigerait Pythagore, 4e)',
      'Longueur, milieu et figures lus sur les coordonnées (3e)',
      'Équation de droite et coefficient directeur',
      'Repérage sur la sphère (latitude, longitude)',
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
      id: '01', number: 1, slug: 'un-seul-nombre-suffit-il', path: `${LESSON_BASE_PATH}/un-seul-nombre-suffit-il`,
      title: 'Un seul nombre suffit-il ?', desc: 'Un curseur, et pourtant deux lieux qui s’allument ensemble.',
      stage: 'trigger',
      teachesLearningPointIds: ['5e_reperage-5e_P1', '5e_reperage-5e_P3'],
      color: 'indigo', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Chercher',
    },
    {
      id: '02', number: 2, slug: 'deux-nombres-un-endroit', path: `${LESSON_BASE_PATH}/deux-nombres-un-endroit`,
      title: 'Deux nombres, un endroit', desc: 'Le second axe lève l’ambiguïté — et le repère a enfin un nom.',
      stage: 'discovery',
      teachesLearningPointIds: ['5e_reperage-5e_P3', '5e_reperage-5e_P4'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Découvrir',
    },
    {
      id: '03', number: 3, slug: 'lire-un-point', path: `${LESSON_BASE_PATH}/lire-un-point`,
      title: 'Lire un point', desc: 'Les quatre quadrants, et ce que chaque signe raconte.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_reperage-5e_P4'],
      color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Lire',
    },
    {
      id: '04', number: 4, slug: 'placer-sans-echanger', path: `${LESSON_BASE_PATH}/placer-sans-echanger`,
      title: 'Placer sans échanger', desc: 'Place (−2 ; 5), et regarde où serait (5 ; −2).',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_reperage-5e_P5'],
      color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Placer',
    },
    {
      id: '05', number: 5, slug: 'sur-un-axe-ou-nulle-part', path: `${LESSON_BASE_PATH}/sur-un-axe-ou-nulle-part`,
      title: 'Sur un axe, ou nulle part', desc: 'Un zéro dans le couple, et le point n’est dans aucun quadrant.',
      stage: 'manipulation',
      teachesLearningPointIds: ['5e_reperage-5e_P3', '5e_reperage-5e_P4'],
      color: 'purple', style: 'featured', estimatedMin: 6, difficulty: 2, actionText: 'Observer',
    },
    {
      id: '06', number: 6, slug: 'le-plan-du-domaine', path: `${LESSON_BASE_PATH}/le-plan-du-domaine`,
      title: 'Le plan du domaine', desc: 'Une carte dont une graduation ne vaut plus 1.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['5e_reperage-5e_P2', '5e_reperage-5e_P5'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'S’entraîner',
    },
    {
      id: '07', number: 7, slug: 'mission-finale-le-domaine', path: `${LESSON_BASE_PATH}/mission-finale-le-domaine`,
      title: '🏆 Mission finale : le domaine', desc: 'Dix épreuves pour prouver que tu sais dire où se trouve un point.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 12, difficulty: 3, actionText: 'Relever le défi',
    },
  ],
};
