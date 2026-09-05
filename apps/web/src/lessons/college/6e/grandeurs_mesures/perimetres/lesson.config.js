/**
 * Périmètres — 6e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` des modules doivent rester des LITTÉRAUX. Les 8 LPs de
 * cette leçon (dérivés de `pointsToLearn` dans coursesData.js, append-only) :
 *
 *   6e_perimetres_P1  Comprendre le périmètre comme la longueur du contour
 *   6e_perimetres_P2  Mesurer les longueurs des côtés d'un polygone
 *   6e_perimetres_P3  Calculer le périmètre en additionnant les côtés
 *   6e_perimetres_P4  Propriétés du carré et du rectangle (formules)
 *   6e_perimetres_P5  Choisir une unité adaptée
 *   6e_perimetres_P6  Estimer un périmètre avant de le calculer
 *   6e_perimetres_P7  Résoudre des problèmes de périmètres
 *   6e_perimetres_P8  Connaître et utiliser la longueur du cercle (P = π × D)
 *
 * Positionnement : la leçon Longueurs introduit déjà « additionner les côtés »
 * (6e_longueurs_P6). Ici le Module 2 fait une courte réactivation puis tout le
 * reste est un terrain nouveau : figures quelconques, formules, cercle,
 * estimation, choix d'unité, problèmes.
 */
export const LESSON_BASE_PATH = '/courses/college/6e/grandeurs_mesures/perimetres';

export const LESSON_CONFIG = {
  id: 'perimetres',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Périmètres',
  description:
    'Le périmètre comme longueur du contour : le parcourir, le mesurer, le calculer avec les bonnes formules — du polygone quelconque jusqu’au tour du cercle.',
  level: 'college',
  grade: '6e',
  chapter: 'grandeurs_mesures',
  chapterTitle: 'Grandeurs et mesures',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 80,
  skills: [
    'Comprendre le périmètre comme la longueur du contour d’une figure',
    'Mesurer les longueurs des côtés d’un polygone',
    'Calculer le périmètre en additionnant les longueurs des côtés',
    'Utiliser les propriétés du carré et du rectangle pour calculer leur périmètre',
    'Choisir une unité adaptée pour exprimer un périmètre',
    'Estimer un périmètre avant de le calculer',
    'Résoudre des problèmes faisant intervenir des périmètres',
    'Connaître et utiliser la longueur du cercle (P = π × D)',
  ],
  teachingScope: {
    include: ['Périmètre de polygones', 'Formules du carré et du rectangle', 'Longueur du cercle (P = π × D, première approche)'],
    exclude: ['Aires', 'Résolution algébrique (retrouver un côté à partir de P)', 'Valeurs exactes en π'],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`,
      title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — pour savoir par où bien commencer.',
      stage: 'prerequisite_check',
      color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-cloture-du-parc', path: `${LESSON_BASE_PATH}/la-cloture-du-parc`,
      title: 'La clôture du parc', desc: 'Faire le tour d’un enclos, pas à pas : c’est ça, le périmètre.',
      stage: 'trigger', teachesLearningPointIds: ['6e_perimetres_P1'],
      color: 'indigo', style: 'featured', estimatedMin: 7, difficulty: 1, actionText: 'Démarrer' },
    { id: '02', number: 2, slug: 'le-tour-complet', path: `${LESSON_BASE_PATH}/le-tour-complet`,
      title: 'Le tour complet', desc: 'Mesurer chaque côté, n’en oublier aucun, tout additionner.',
      stage: 'discovery', teachesLearningPointIds: ['6e_perimetres_P2', '6e_perimetres_P3'],
      color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Mesurer' },
    { id: '03', number: 3, slug: 'les-formules-magiques', path: `${LESSON_BASE_PATH}/les-formules-magiques`,
      title: 'Les formules du carré et du rectangle', desc: 'Des côtés égaux ? Alors une formule peut faire le travail.',
      stage: 'manipulation', teachesLearningPointIds: ['6e_perimetres_P4'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Construire' },
    { id: '04', number: 4, slug: 'le-tour-du-cercle', path: `${LESSON_BASE_PATH}/le-tour-du-cercle`,
      title: 'Le tour du cercle', desc: 'Fais rouler la roue : combien de diamètres pour un tour complet ?',
      stage: 'manipulation', teachesLearningPointIds: ['6e_perimetres_P8'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 2, actionText: 'Faire rouler' },
    { id: '05', number: 5, slug: 'les-bons-reflexes', path: `${LESSON_BASE_PATH}/les-bons-reflexes`,
      title: 'Estimer et choisir son unité', desc: 'Avant de calculer : quel ordre de grandeur, et quelle unité ?',
      stage: 'formalization', teachesLearningPointIds: ['6e_perimetres_P5', '6e_perimetres_P6'],
      color: 'amber', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Estimer' },
    { id: '06', number: 6, slug: 'ateliers-du-geometre', path: `${LESSON_BASE_PATH}/ateliers-du-geometre`,
      title: 'Les ateliers du géomètre', desc: 'Trois commandes réelles : clôture, piste, bordure de fontaine.',
      stage: 'practice_lab', teachesLearningPointIds: ['6e_perimetres_P7'],
      color: 'rose', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Résoudre' },
    { id: '07', number: 7, slug: 'le-parc-a-amenager', path: `${LESSON_BASE_PATH}/le-parc-a-amenager`,
      title: '🏆 Mission finale : le parc à aménager', desc: 'La mairie te confie le chantier : mobilise tout ce que tu as appris.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
