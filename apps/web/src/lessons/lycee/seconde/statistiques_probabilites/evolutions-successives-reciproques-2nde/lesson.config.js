/**
 * Évolutions successives et réciproques — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 8 LPs (clé catalogue
 * 'seconde_evolutions_successives_reciproques', append-only) :
 *
 *   seconde_evolutions-successives-reciproques-2nde_P1  Calculer une évolution successive
 *   seconde_evolutions-successives-reciproques-2nde_P2  Composer des coefficients multiplicateurs
 *   seconde_evolutions-successives-reciproques-2nde_P3  Calculer un taux d'évolution global
 *   seconde_evolutions-successives-reciproques-2nde_P4  Comprendre qu'une succession de pourcentages ne s'additionne pas
 *   seconde_evolutions-successives-reciproques-2nde_P5  Calculer une évolution réciproque
 *   seconde_evolutions-successives-reciproques-2nde_P6  Déterminer le coefficient multiplicateur réciproque
 *   seconde_evolutions-successives-reciproques-2nde_P7  Interpréter une évolution dans son contexte
 *   seconde_evolutions-successives-reciproques-2nde_P8  Résoudre des problèmes d'évolution
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : les taux ne s'ajoutent pas,
 * les COEFFICIENTS se multiplient. D'où les deux surprises de la leçon :
 * +20 % puis −20 % ne ramène pas au départ (×1,2 × 0,8 = 0,96), et le taux
 * qui annule +25 % n'est pas −25 % mais −20 % (1/1,25 = 0,8).
 *
 * Situation portée : LE PRIX D'UN VÉLO à 100 € qui traverse une hausse puis
 * une baisse. La chaîne 100 → ×1,20 → 120 → ×0,80 → 96 ouvre la leçon (M1)
 * et sert de fil aux modules 2, 3 et 4.
 *
 * PÉRIMÈTRE : la leçon suppose acquis le coefficient d'UNE évolution
 * (leçon « Proportions et pourcentages ») et ne revient pas sur la
 * distinction proportion / évolution : elle enchaîne, compose et inverse.
 * Elle n'aborde pas les suites géométriques ni les taux moyens en n étapes
 * avec racine n-ième (hors programme de 2nde).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/statistiques_probabilites/evolutions-successives-reciproques-2nde';

export const LESSON_CONFIG = {
  id: 'evolutions-successives-reciproques-2nde',
  sequentialUnlock: true,
  knowledgeMap: true,
  // Connaissances SUPPOSÉES acquises (état A du contrat « connaissances avant
  // la demande », docs/architecture/KNOWLEDGE_DEPENDENCY.md). Toutes sont
  // diagnostiquées par le module 0 :
  //   — le pourcentage lui-même et la proportionnalité qui le porte : ils
  //     viennent du collège (5e/6e) et la leçon « Proportions et pourcentages »
  //     les a repris ; ici on ENCHAÎNE des pourcentages, on ne les définit plus ;
  //   — le quotient, dont le taux d'évolution (V_f − V_i)/V_i est un cas ;
  //   — le coefficient de proportionnalité, dont le coefficient multiplicateur
  //     k = 1 + t d'UNE évolution est la forme installée par la leçon
  //     précédente — cette leçon-ci se contente d'en faire le produit ;
  //   — l'arrondi (6e), employé dans les consignes de calcul (« au millième »).
  // La leçon enseigne le reste : la base mouvante, le produit des coefficients,
  // le taux global, l'évolution réciproque et la remontée d'une chaîne.
  priorKnowledge: [
    'pourcentage', 'proportionnalite', 'coefficient-proportionnalite',
    'quotient', 'arrondi',
  ],
  title: 'Évolutions successives et réciproques',
  description:
    "Faire subir à un prix deux évolutions de suite et constater que +20 % puis −20 % ne ramène pas au point de départ, puis découvrir que seuls les coefficients se composent — par produit pour enchaîner, par inverse pour revenir en arrière — et s'en servir pour retrouver une valeur initiale.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'statistiques_probabilites',
  chapterTitle: 'Statistiques et probabilités',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 70,
  skills: [
    'Enchaîner deux évolutions et calculer la valeur finale',
    'Composer les coefficients multiplicateurs pour obtenir le coefficient global',
    'Calculer le taux d’évolution global et savoir qu’il n’est pas la somme des taux',
    'Déterminer l’évolution réciproque, par le coefficient inverse',
    'Retrouver une valeur initiale à partir de la valeur finale et des évolutions subies',
  ],
  teachingScope: {
    include: [
      'Évolutions successives : V_f = V_i × k₁ × k₂ × … ; le coefficient global est le PRODUIT des coefficients',
      'Taux global t = k_global − 1 ; les taux ne s’additionnent pas (+10 % puis +10 % donne +21 %)',
      'Une hausse et une baisse de même taux ne se compensent pas : ×1,2 × 0,8 = 0,96, soit −4 %',
      'Évolution réciproque : k’ = 1/k, donc t’ = 1/(1 + t) − 1 ; annuler +25 % demande −20 %',
      'Retrouver la valeur initiale : V_i = V_f / k_global (le sens « à rebours » d’une chaîne d’évolutions)',
    ],
    exclude: [
      'Définition de la proportion, points de pourcentage, coefficient d’une seule évolution (leçon « Proportions et pourcentages »)',
      'Taux moyen d’évolution avec racine n-ième, suites géométriques (programme de première)',
      'Indices base 100 et évolutions en chaîne sur de longues séries (hors programme de 2nde)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les coefficients multiplicateurs et les taux d’évolution.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'le-prix-du-velo', path: `${LESSON_BASE_PATH}/le-prix-du-velo`, title: 'Le prix du vélo', desc: 'Un vélo à 100 €. Une hausse de 20 %, puis une baisse de 20 %. Fais tourner la chaîne et regarde où l’on retombe.', stage: 'trigger', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P1', 'seconde_evolutions-successives-reciproques-2nde_P4'], color: 'indigo', style: 'featured', estimatedMin: 11, difficulty: 1, actionText: 'Faire tourner la chaîne' },
    { id: '02', number: 2, slug: 'les-coefficients-se-multiplient', path: `${LESSON_BASE_PATH}/les-coefficients-se-multiplient`, title: 'Les coefficients se multiplient', desc: 'Deux évolutions, un seul coefficient : le produit. Et l’ordre n’y change rien.', stage: 'discovery', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P2', 'seconde_evolutions-successives-reciproques-2nde_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Composer les coefficients' },
    { id: '03', number: 3, slug: 'le-taux-global', path: `${LESSON_BASE_PATH}/le-taux-global`, title: 'Le taux global', desc: 'Du coefficient global au taux global : t = k − 1. Et pourquoi +10 % puis +10 % fait +21 %, jamais +20 %.', stage: 'discovery', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P3', 'seconde_evolutions-successives-reciproques-2nde_P4'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Calculer le taux global' },
    { id: '04', number: 4, slug: 'revenir-au-depart', path: `${LESSON_BASE_PATH}/revenir-au-depart`, title: 'Revenir au départ', desc: 'Quel taux annule une hausse de 25 % ? Pas −25 %. Cherche le coefficient qui ramène à 1.', stage: 'manipulation', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P5', 'seconde_evolutions-successives-reciproques-2nde_P6'], color: 'emerald', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Chercher le retour' },
    { id: '05', number: 5, slug: 'retrouver-la-valeur-initiale', path: `${LESSON_BASE_PATH}/retrouver-la-valeur-initiale`, title: 'Retrouver la valeur initiale', desc: 'Le prix final est connu, le prix de départ non. Remonter la chaîne en divisant.', stage: 'manipulation', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P8', 'seconde_evolutions-successives-reciproques-2nde_P6'], color: 'cyan', style: 'featured', estimatedMin: 9, difficulty: 3, actionText: 'Remonter la chaîne' },
    { id: '06', number: 6, slug: 'atelier-lire-les-evolutions', path: `${LESSON_BASE_PATH}/atelier-lire-les-evolutions`, title: 'Atelier : lire les évolutions', desc: 'Soldes en deux temps, population sur trois ans, salaire gelé puis revalorisé : interpréter avant de calculer.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_evolutions-successives-reciproques-2nde_P7', 'seconde_evolutions-successives-reciproques-2nde_P8', 'seconde_evolutions-successives-reciproques-2nde_P3', 'seconde_evolutions-successives-reciproques-2nde_P5'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 4, actionText: 'Interpréter' },
    { id: '07', number: 7, slug: 'mission-finale-la-chaine', path: `${LESSON_BASE_PATH}/mission-finale-la-chaine`, title: '🏆 Mission finale : la chaîne', desc: 'Dix épreuves pour prouver que tu composes, inverses et remontes sans te tromper.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 5, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
