/**
 * Fonctions de référence — 2nde.
 *
 * NOTE VALIDATEUR : LP ids LITTÉRAUX. Les 11 LPs (clé catalogue
 * 'seconde_fonctions_de_reference', append-only) :
 *
 *   seconde_fonctions-de-reference-2nde_P1   Reconnaître la fonction valeur absolue
 *   seconde_fonctions-de-reference-2nde_P2   Étudier la fonction carré
 *   seconde_fonctions-de-reference-2nde_P3   Étudier la fonction inverse
 *   seconde_fonctions-de-reference-2nde_P4   Connaître leurs expressions
 *   seconde_fonctions-de-reference-2nde_P5   Construire un tableau de valeurs
 *   seconde_fonctions-de-reference-2nde_P6   Représenter graphiquement une fonction de référence
 *   seconde_fonctions-de-reference-2nde_P7   Identifier les caractéristiques d'une courbe
 *   seconde_fonctions-de-reference-2nde_P8   Comparer les courbes de fonctions de référence
 *   seconde_fonctions-de-reference-2nde_P9   Déterminer une image graphiquement
 *   seconde_fonctions-de-reference-2nde_P10  Déterminer un antécédent graphiquement
 *   seconde_fonctions-de-reference-2nde_P11  Utiliser une fonction de référence pour modéliser une situation
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : trois machines à nombres —
 * x², 1/x, |x| — se comportent de trois façons très différentes pour la même
 * entrée, et chacune a une IMAGE MENTALE : la parabole, l'hyperbole, le V.
 * Symétrie, signe, sens de variation, comportement près de 0 et loin de 0,
 * points caractéristiques : tout se lit sur la courbe, et se retrouve par le
 * calcul. Les mots « croissante / décroissante » sont utilisés au sens du
 * collège (la courbe monte / descend) ; la définition par inégalités et le
 * tableau de variations appartiennent à « Variations et extremums ».
 *
 * PÉRIMÈTRE : pas de dérivation, pas de fonctions racine carrée / cube (non
 * exigibles), pas de tableau de variations formel.
 *
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/seconde/fonctions/fonctions-de-reference-2nde';

export const LESSON_CONFIG = {
  id: 'fonctions-de-reference-2nde',
  // CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
  // Ce que la leçon SUPPOSE, et que le module 0 mesure — un id par question de
  // diagnostic, sinon W_PRIOR_NOT_DIAGNOSED. Rien de ce que la leçon enseigne
  // (les trois courbes, leurs symétries, leurs variations, la position
  // relative) n'est ici : cela vient des briques des modules 1 à 6.
  //   fonction, notation-fx, image  la machine à nombres et son écriture (3e)
  //   abscisse, ordonnee            lire un point du repère (6e)
  //   valeur-absolue                la distance à 0 (chapitre « Valeur absolue »)
  //   puissance                     un carré se calcule (4e)
  //   inverse-nombre                1 ÷ a (3e)
  priorKnowledge: ['fonction', 'notation-fx', 'image', 'abscisse', 'ordonnee', 'valeur-absolue', 'puissance', 'inverse-nombre'],
  knowledgeAudit: {
    ignore: [
      // « en pointillés » est ici une convention de tracé (la parabole et les
      // demi-droites y = x / y = −x, dessinées en repère), pas l'arête cachée
      // d'un solide en perspective cavalière. Rien à enseigner.
      { term: 'arete-cachee', reason: '« en pointillés » = convention de tracé du repère, jamais l’arête cachée d’un solide' },
      // « vitesse moyenne » au module 6 : le langage ordinaire du trajet, pas
      // l'indicateur statistique. La leçon ne calcule aucune moyenne.
      { term: 'moyenne', reason: '« vitesse moyenne » — langage du trajet, jamais la moyenne d’une série' },
      // « périmètre » n'apparaît que dans la correction d'un distracteur
      // (« 4c serait son périmètre »), pour séparer c² de 4c. Notion de 6e,
      // jamais demandée ni calculée ici.
      { term: 'perimetre', reason: 'correction d’un distracteur ; notion de 6e, jamais demandée' },
    ],
  },
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Fonctions de référence',
  description:
    "Nourrir trois machines — carré, inverse, valeur absolue — avec les mêmes nombres, tracer leurs courbes point par point, puis lire sur la parabole, l'hyperbole et le V ce que le calcul confirme : symétrie, signe, sens de variation, comportement près de zéro.",
  level: 'lycee',
  grade: 'seconde',
  chapter: 'fonctions',
  chapterTitle: 'Fonctions',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📈',
  estimatedDurationMin: 80,
  skills: [
    'Connaître les expressions x², 1/x et |x| et leurs courbes',
    'Identifier symétrie, signe, sens de variation et points caractéristiques',
    'Comparer les trois courbes',
    'Lire une image et des antécédents sur une courbe de référence',
    'Modéliser une situation avec une fonction de référence',
  ],
  teachingScope: {
    include: [
      'Fonction carré : parabole, sommet en O, axe de symétrie (Oy), x² ≥ 0, décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[, comparaison de carrés',
      'Fonction inverse : hyperbole, ℝ*, symétrie centrale en O, signe de 1/x = signe de x, décroissante sur ]−∞ ; 0[ et sur ]0 ; +∞[ (pas sur ℝ*), comportement près de 0 et loin de 0',
      'Fonction valeur absolue : le V, |x| = distance à 0, deux demi-droites, symétrie, minimum 0',
      'Tableaux de valeurs symétriques, tracé point par point, lecture d’images et d’antécédents',
      'Position relative des courbes : x² ≤ |x| sur [−1 ; 1] ; ordre de x², |x|, 1/x sur ]0 ; 1[ et sur ]1 ; +∞[',
    ],
    exclude: [
      'La définition de croissante / décroissante par des inégalités et le tableau de variations (leçon « Variations et extremums »)',
      'Le tableau de signes (leçon « Signe d’une fonction »)',
      'Fonctions racine carrée et cube, dérivation',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un petit diagnostic — jamais bloquant — sur les images, la valeur absolue, les carrés et les inverses.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'trois-machines', path: `${LESSON_BASE_PATH}/trois-machines`, title: 'Trois machines, une sonde', desc: 'Le même nombre entre dans trois machines : x², 1/x, |x|. Compare les sorties, essaie −x, essaie 0, essaie 0,1 et 100 — et trace.', stage: 'trigger', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P4', 'seconde_fonctions-de-reference-2nde_P5', 'seconde_fonctions-de-reference-2nde_P6'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 1, actionText: 'Nourrir les machines' },
    { id: '02', number: 2, slug: 'la-parabole', path: `${LESSON_BASE_PATH}/la-parabole`, title: 'La parabole', desc: 'Deux sondes sur x² : le miroir en x = 0, jamais sous l’axe, et le piège des carrés de nombres négatifs.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P2', 'seconde_fonctions-de-reference-2nde_P7'], color: 'violet', style: 'featured', estimatedMin: 9, difficulty: 2, actionText: 'Sonder la parabole' },
    { id: '03', number: 3, slug: 'l-hyperbole', path: `${LESSON_BASE_PATH}/l-hyperbole`, title: 'L’hyperbole', desc: 'Deux branches, un trou en 0, un centre de symétrie, et une fonction qui descend partout — sauf que −1 < 1 et 1/(−1) < 1/1.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P3', 'seconde_fonctions-de-reference-2nde_P7'], color: 'rose', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Sonder l’hyperbole' },
    { id: '04', number: 4, slug: 'le-v', path: `${LESSON_BASE_PATH}/le-v`, title: 'Le V', desc: '|x| est la distance à 0 : deux demi-droites, un coin en O. Et entre −1 et 1, le V passe au-dessus de la parabole.', stage: 'discovery', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P1', 'seconde_fonctions-de-reference-2nde_P7', 'seconde_fonctions-de-reference-2nde_P8'], color: 'emerald', style: 'featured', estimatedMin: 8, difficulty: 2, actionText: 'Sonder le V' },
    { id: '05', number: 5, slug: 'lire-sur-les-courbes', path: `${LESSON_BASE_PATH}/lire-sur-les-courbes`, title: 'Lire sur les courbes', desc: 'x² = 4, x² = −1, 1/x = 2, |x| = 3 : combien d’antécédents ? Et qui est au-dessus entre 0 et 1, puis au-delà de 1 ?', stage: 'manipulation', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P9', 'seconde_fonctions-de-reference-2nde_P10', 'seconde_fonctions-de-reference-2nde_P8', 'seconde_fonctions-de-reference-2nde_P6'], color: 'sky', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Lire' },
    { id: '06', number: 6, slug: 'atelier-modeliser', path: `${LESSON_BASE_PATH}/atelier-modeliser`, title: 'Atelier : modéliser', desc: 'L’aire d’un carrelage, la durée d’un trajet, l’écart à zéro : reconnaître la référence, dresser le tableau, répondre.', stage: 'practice_lab', teachesLearningPointIds: ['seconde_fonctions-de-reference-2nde_P11', 'seconde_fonctions-de-reference-2nde_P5', 'seconde_fonctions-de-reference-2nde_P6', 'seconde_fonctions-de-reference-2nde_P8', 'seconde_fonctions-de-reference-2nde_P4'], color: 'amber', style: 'featured', estimatedMin: 13, difficulty: 4, actionText: 'Modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-les-trois-courbes', path: `${LESSON_BASE_PATH}/mission-finale-les-trois-courbes`, title: '🏆 Mission finale : les trois courbes', desc: 'Dix épreuves pour prouver que la parabole, l’hyperbole et le V n’ont plus de secret pour toi.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
