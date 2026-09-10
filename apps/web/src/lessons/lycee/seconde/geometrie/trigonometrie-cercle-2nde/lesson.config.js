/**
 * Le cercle trigonométrique — Seconde, LEÇON D'EXTENSION.
 *
 * ⚠️ HORS PROGRAMME OFFICIEL. Le référentiel 2026 ne met aucune trigonométrie
 * en Seconde, et l'objet 3e « trigonometrie » exclut explicitement le cercle
 * trigonométrique. Cette leçon dérive d'un `extension_objects` du domaine
 * geometrie : elle est badgée « HORS PROGRAMME » sur sa carte, et rien ne doit
 * la présenter comme officielle.
 *
 * POSITIONNEMENT VERTICAL
 *   revisé      cos, sin et tan comme RAPPORTS de longueurs dans le triangle
 *               rectangle (3e, trigonometrie-triangle-rectangle-3e) ; le
 *               repérage dans le plan et la lecture de coordonnées (2de).
 *   étendu      ces rapports, réservés aux angles aigus, deviennent définis
 *               pour TOUT réel — y compris négatif, y compris au-delà d'un tour.
 *   nouveau     le CERCLE trigonométrique, le RADIAN (l'angle mesuré par la
 *               longueur de l'arc, pas par une graduation arbitraire), et
 *               l'idée que cos t et sin t sont deux COORDONNÉES.
 *   formalisé   les valeurs remarquables, et la lecture « abscisse / ordonnée ».
 *   outil       sert de socle à « Identités et équations » (partie 2), puis aux
 *               fonctions trigonométriques de Première.
 *
 * Couverture : P1 → M1 · P2, P3 → M2 · P4, P5, P6 → M3 · P7, P8, P9 → M4.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/geometrie/trigonometrie-cercle-2nde';

export const LESSON_CONFIG = {
  id: 'trigonometrie-cercle-2nde',
  sequentialUnlock: true,
  title: 'Le cercle trigonométrique',
  description: "Enrouler la droite des réels sur un cercle de rayon 1, mesurer l'angle par la longueur parcourue, et découvrir que cosinus et sinus sont les deux coordonnées du point d'arrivée.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'geometrie',
  chapterTitle: 'Géométrie',
  emoji: '🔵',
  estimatedDurationMin: 80,
  passingScore: 0.7,
  masteryThreshold: 0.8,
  knowledgeMap: true,

  priorKnowledge: [
    'triangle-rectangle', 'hypotenuse', 'angle-droit', 'abscisse', 'ordonnee',
    'coordonnees', 'origine-repere', 'proportionnalite',
  ],

  // Termes d'appui ANTÉRIEURS que cette leçon emploie sans les enseigner : ils
  // relèvent du collège et ne sont pas des cibles ici. Chacun est justifié —
  // jamais ajouté pour faire taire l'audit (KNOWLEDGE_DEPENDENCY.md).
  knowledgeAudit: {
    ignore: [
      { term: 'cote-adjacent', reason: 'Vocabulaire du triangle rectangle (3e), employé UNIQUEMENT par le module 0 pour diagnostiquer le prérequis.' },
      { term: 'arrondi', reason: 'Notion de 6e, réactivée par nombres-reels-2nde ; ici simple consigne de réponse (« à l’unité près »).' },
      { term: 'axe-symetrie', reason: 'Symétrie axiale du collège (6e), utilisée pour justifier le placement d’un angle par symétrie — pas une notion enseignée ici.' },
      { term: 'valeur-absolue', reason: 'Enseignée par valeur-absolue-distance-2nde ; n’apparaît que dans une explication du boss, pour dire que deux coordonnées ont la même valeur absolue.' },
    ],
  },

  teachingScope: {
    include: [
      'Le cercle de rayon 1 et l\'enroulement de la droite des réels',
      'Le radian : l\'angle mesuré par la longueur d\'arc',
      'Conversion degrés ↔ radians',
      'cos t et sin t comme abscisse et ordonnée du point associé à t',
      'Les valeurs remarquables de 0 à π',
    ],
    exclude: [
      'Les fonctions sinus et cosinus d\'une variable réelle (Première)',
      'Périodicité, parité, dérivation (Première)',
      'cos²t + sin²t = 1 et les équations (partie 2 de ce chapitre)',
    ],
  },

  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Ce que le triangle rectangle t\'a déjà appris.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 5, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'enrouler-le-fil', path: `${LESSON_BASE_PATH}/enrouler-le-fil`, title: 'Enrouler le fil', desc: 'Un fil de longueur t posé sur un cercle de rayon 1 : où arrive-t-il ?', stage: 'trigger', teachesLearningPointIds: ['seconde_trigonometrie-cercle-2nde_P1'], color: 'violet', style: 'featured', estimatedMin: 14, difficulty: 2, actionText: 'Enrouler' },
    { id: '02', number: 2, slug: 'le-radian', path: `${LESSON_BASE_PATH}/le-radian`, title: 'Le radian', desc: 'Mesurer un angle par la longueur parcourue, et convertir.', stage: 'discovery', teachesLearningPointIds: ['seconde_trigonometrie-cercle-2nde_P2', 'seconde_trigonometrie-cercle-2nde_P3'], color: 'indigo', style: 'default', estimatedMin: 14, difficulty: 2, actionText: 'Mesurer' },
    { id: '03', number: 3, slug: 'deux-coordonnees', path: `${LESSON_BASE_PATH}/deux-coordonnees`, title: 'Deux coordonnées', desc: 'Le cosinus est une abscisse, le sinus une ordonnée.', stage: 'formalization', teachesLearningPointIds: ['seconde_trigonometrie-cercle-2nde_P4', 'seconde_trigonometrie-cercle-2nde_P5', 'seconde_trigonometrie-cercle-2nde_P6'], color: 'emerald', style: 'default', estimatedMin: 16, difficulty: 3, actionText: 'Lire' },
    { id: '04', number: 4, slug: 'les-valeurs-remarquables', path: `${LESSON_BASE_PATH}/les-valeurs-remarquables`, title: 'Les valeurs remarquables', desc: 'Huit points qu\'on n\'a pas besoin de calculer.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_trigonometrie-cercle-2nde_P7', 'seconde_trigonometrie-cercle-2nde_P8', 'seconde_trigonometrie-cercle-2nde_P9'], color: 'amber', style: 'default', estimatedMin: 16, difficulty: 3, actionText: 'Placer' },
    { id: '05', number: 5, slug: 'mission-finale-le-cercle', path: `${LESSON_BASE_PATH}/mission-finale-le-cercle`, title: '🏆 Mission finale : le cercle', desc: 'Onze épreuves sur le cercle, le radian et les coordonnées.', stage: 'evaluation', color: 'rose', style: 'featured', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
