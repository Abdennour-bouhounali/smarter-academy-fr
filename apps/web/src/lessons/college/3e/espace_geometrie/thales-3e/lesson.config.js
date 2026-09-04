/**
 * Théorème de Thalès — 3e.
 *
 * NOTE VALIDATEUR (scripts/validate-lessons.mjs) : les Learning Point ids
 * référencés par `teachesLearningPointIds` et par les métadonnées
 * `assessment` doivent rester des LITTÉRAUX, et les objets `assessment`
 * doivent être écrits en toutes lettres (un helper les rendrait invisibles).
 * Les 12 LPs de cette leçon (clé catalogue '3e_thales') :
 *
 *   3e_thales-3e_P1   Reconnaître une configuration de Thalès
 *   3e_thales-3e_P2   Identifier les droites parallèles dans une configuration
 *   3e_thales-3e_P3   Identifier les longueurs correspondantes
 *   3e_thales-3e_P4   Comprendre le lien entre parallélisme et proportionnalité
 *   3e_thales-3e_P5   Écrire correctement les rapports de longueurs
 *   3e_thales-3e_P6   Utiliser le théorème de Thalès pour calculer une longueur
 *   3e_thales-3e_P7   Choisir les rapports adaptés à une configuration donnée
 *   3e_thales-3e_P8   Vérifier la cohérence d'un calcul utilisant le théorème
 *   3e_thales-3e_P9   Utiliser la réciproque du théorème de Thalès
 *   3e_thales-3e_P10  Utiliser la contraposée du théorème de Thalès
 *   3e_thales-3e_P11  Rédiger une démonstration utilisant Thalès
 *   3e_thales-3e_P12  Résoudre des problèmes concrets faisant intervenir Thalès
 *
 * L'IDÉE CENTRALE : les rapports ne bougent pas. La version pré-kit faisait
 * glisser une figure sans JAMAIS afficher un seul rapport — l'invariant que la
 * leçon prétend enseigner n'était donc jamais constaté. Ici, les trois
 * rapports sont calculés et affichés en permanence, et le module 3 les fait
 * tamponner position après position.
 *
 * REFONTE (2026-09-04) : leçon portée sur le lesson kit.
 *  - `sequentialUnlock` était absent : rien n'était jamais verrouillé.
 *  - Le Bilan affichait « + XP » sans nombre (`assessment.xpReward` inexistant)
 *    et surlignait les options par leur justesse, sans montrer le choix fait.
 *  - Le module « Calculer une longueur » calculait À LA PLACE de l'élève : un
 *    curseur, aucune saisie, et l'XP tombait au premier mouvement.
 *  - La contraposée n'était jamais pratiquée. Elle a désormais son atelier.
 *  - `InteractiveThales` relançait son effet à chaque rendu (callback non
 *    stable) et affichait des longueurs en PIXELS comme si c'étaient des
 *    mesures. Le composant est remplacé par `ThalesLab`.
 * Git conserve l'archive des anciens modules.
 *
 * Fil narratif unique : « mesurer l'inaccessible », du piquet au soleil
 * jusqu'à la pyramide de Khéops, repris figé dans la synthèse du boss.
 */
export const LESSON_BASE_PATH = '/courses/college/3e/espace_geometrie/thales-3e';

export const LESSON_CONFIG = {
  id: 'thales-3e',
  sequentialUnlock: true, // déverrouillage séquentiel des modules (voir lessonAccess.js)
  title: 'Théorème de Thalès',
  description:
    "Découvrir au soleil qu'un rapport de longueurs peut refuser de changer, voir les trois rapports d'une configuration rester égaux quoi qu'on déplace, puis calculer une longueur, démontrer un parallélisme et mesurer une pyramide.",
  level: 'college',
  grade: '3e',
  chapter: 'espace_geometrie',
  chapterTitle: 'Espace et géométrie',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📐',
  estimatedDurationMin: 85,
  skills: [
    'Reconnaître une configuration de Thalès',
    'Identifier les droites parallèles dans une configuration',
    'Identifier les longueurs correspondantes',
    'Comprendre le lien entre parallélisme et proportionnalité',
    'Écrire correctement les rapports de longueurs',
    'Utiliser le théorème de Thalès pour calculer une longueur',
    'Choisir les rapports adaptés à une configuration donnée',
    "Vérifier la cohérence d'un calcul utilisant le théorème de Thalès",
    'Utiliser la réciproque du théorème de Thalès',
    'Utiliser la contraposée du théorème de Thalès',
    'Rédiger une démonstration utilisant Thalès',
    'Résoudre des problèmes concrets faisant intervenir le théorème de Thalès',
  ],
  teachingScope: {
    include: [
      'Configuration triangle et configuration papillon',
      'Égalité des trois rapports quand les droites sont parallèles',
      'Calcul d’une longueur par produit en croix, et contrôle de cohérence',
      'Réciproque et contraposée, avec la condition d’ordre des points',
      'Rédaction d’une démonstration',
      'Problèmes concrets : hauteur inaccessible, largeur d’une rivière',
    ],
    exclude: [
      'Homothéties formelles',
      'Agrandissement et réduction des aires et des volumes',
      'Triangles semblables et cas de similitude',
      'Trigonométrie (leçon dédiée du même chapitre)',
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
      id: '01', number: 1, slug: 'lombre-au-soleil', path: `${LESSON_BASE_PATH}/lombre-au-soleil`,
      title: 'L’ombre au soleil', desc: 'La hauteur change, l’ombre change — et un rapport refuse de bouger.',
      stage: 'trigger',
      teachesLearningPointIds: ['3e_thales-3e_P4'],
      color: 'indigo', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Observer',
    },
    {
      id: '02', number: 2, slug: 'reconnaitre-la-configuration', path: `${LESSON_BASE_PATH}/reconnaitre-la-configuration`,
      title: 'Reconnaître la configuration', desc: 'Deux conditions, jamais une seule — et le papillon compte aussi.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_thales-3e_P1', '3e_thales-3e_P2'],
      color: 'sky', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Trier',
    },
    {
      id: '03', number: 3, slug: 'les-rapports-qui-ne-bougent-pas', path: `${LESSON_BASE_PATH}/les-rapports-qui-ne-bougent-pas`,
      title: 'Les rapports qui ne bougent pas', desc: 'Trois relevés : les longueurs changent, les rapports non.',
      stage: 'discovery',
      teachesLearningPointIds: ['3e_thales-3e_P3', '3e_thales-3e_P4', '3e_thales-3e_P5'],
      color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Relever',
    },
    {
      id: '04', number: 4, slug: 'calculer-une-longueur', path: `${LESSON_BASE_PATH}/calculer-une-longueur`,
      title: 'Calculer une longueur', desc: 'Choisir la paire utile, puis le produit en croix.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_thales-3e_P6', '3e_thales-3e_P7', '3e_thales-3e_P8'],
      color: 'violet', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Calculer',
    },
    {
      id: '05', number: 5, slug: 'et-si-ce-nest-pas-parallele', path: `${LESSON_BASE_PATH}/et-si-ce-nest-pas-parallele`,
      title: 'Et si ce n’est pas parallèle ?', desc: 'N devient libre : les rapports et le parallélisme vont toujours ensemble.',
      stage: 'manipulation',
      teachesLearningPointIds: ['3e_thales-3e_P9', '3e_thales-3e_P10'],
      color: 'purple', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Explorer',
    },
    {
      id: '06', number: 6, slug: 'rediger', path: `${LESSON_BASE_PATH}/rediger`,
      title: 'Rédiger', desc: 'Le bon énoncé au bon moment : théorème, réciproque ou contraposée.',
      stage: 'formalization',
      teachesLearningPointIds: ['3e_thales-3e_P11', '3e_thales-3e_P9'],
      color: 'blue', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Rédiger',
    },
    {
      id: '07', number: 7, slug: 'de-kheops-au-chantier', path: `${LESSON_BASE_PATH}/de-kheops-au-chantier`,
      title: 'De Khéops au chantier', desc: 'Mesurer l’inaccessible, vérifier l’invisible.',
      stage: 'practice_lab',
      teachesLearningPointIds: ['3e_thales-3e_P12', '3e_thales-3e_P8'],
      color: 'rose', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Résoudre',
    },
    {
      id: '08', number: 8, slug: 'mission-finale-larpenteur', path: `${LESSON_BASE_PATH}/mission-finale-larpenteur`,
      title: '🏆 Mission finale : l’arpenteur', desc: 'Dix épreuves pour prouver que tu maîtrises Thalès.',
      stage: 'evaluation',
      color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi',
    },
  ],
};
