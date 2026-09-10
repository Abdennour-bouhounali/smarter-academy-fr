/**
 * Exponentielle : règles de calcul et modèles — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue 'premiere_specialite_fonction_exponentielle', partie 2/2,
 * append-only) :
 *
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P1  Utiliser la relation e^(a+b) = e^a × e^b
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P2  Utiliser les relations e^(−a) et e^(a−b)
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P3  Utiliser la relation (e^a)^n = e^(na)
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P4  Résoudre une équation avec des exponentielles
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P5  Résoudre une inéquation avec des exponentielles
 *   premiere_specialite_exponentielle-calculer-modeliser-1ere_P6  Modéliser une croissance ou une décroissance par une exponentielle
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : l'exponentielle TRANSPORTE
 * l'addition sur la multiplication. Deux axes superposés le montrent — en haut
 * on additionne des exposants, en bas les longueurs correspondantes composent
 * un PRODUIT de valeurs. Ce n'est pas une formule de plus à retenir : c'est un
 * traducteur entre deux mondes, et toutes les autres relations en découlent
 * (l'opposé donne l'inverse, la différence donne le quotient, la puissance
 * multiplie l'exposant). De là, résoudre devient possible : la fonction étant
 * STRICTEMENT CROISSANTE — acquis de la leçon amont — passer de e^u = e^v à
 * u = v est légitime, et le sens d'une inégalité se CONSERVE.
 *
 * Objet porté : LES DEUX AXES SUPERPOSÉS (components/DoubleAxe.jsx) — l'élève
 * ATTRAPE deux curseurs sur l'axe des exposants et les fait glisser ; les deux
 * afficheurs, e^(a+b) et e^a × e^b, ne se contredisent jamais.
 *
 * PÉRIMÈTRE : la leçon amont a établi la définition, exp′ = exp, exp(0) = 1, le
 * signe strictement positif, la stricte croissance, la tangente en 0 et la
 * dérivée de e^{ax+b} — on s'en sert, on ne les réenseigne pas. Pas de
 * logarithme népérien (le seul outil qui résoudrait e^x = 5), pas de limites en
 * l'infini, pas de convexité, pas de suites géométriques associées :
 * Terminale. Le refus du logarithme est CODÉ, pas commenté : les équations de
 * la leçon ont TOUJOURS des exponentielles des deux côtés
 * (`resoudreEquationExp` ne sait rien faire d'autre).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/exponentielle-calculer-modeliser-1ere';

export const LESSON_CONFIG = {
  id: 'exponentielle-calculer-modeliser-1ere',
  // Connaissances SUPPOSÉES acquises (docs/architecture/KNOWLEDGE_DEPENDENCY.md,
  // état A), chacune MESURÉE par une question du module 0 :
  //
  //   De « Exponentielle : la fonction égale à sa dérivée » (1ère, leçon
  //   immédiatement amont — cette leçon en est la SUITE DIRECTE) :
  //     exponentielle-definition — la notation e^x et exp(0) = 1 sont employées
  //       à chaque ligne ; sans elles, « e^(a+b) » ne désigne rien (ec-d1).
  //     exp-strictement-positive — aucune valeur n'est jamais négative ni
  //       nulle : c'est ce qui rend l'inverse 1/e^a toujours défini (ec-d2).
  //     exp-strictement-croissante — LE pivot des modules 5 et 6 : c'est le
  //       SEUL argument qui autorise à passer de e^u = e^v à u = v, et à
  //       conserver le sens d'une inégalité (ec-d3).
  //
  //   De la 2de et du collège :
  //     regles-puissances — a^m × a^n = a^(m+n) : la leçon montre que
  //       l'exponentielle obéit à la MÊME loi, et cette loi doit être déjà là
  //       pour que la ressemblance se voie (ec-d4).
  //     methode-resoudre-inequation — résoudre ax + b < c, signe compris : une
  //       fois les exposants égalés, il ne reste que cela (ec-d5).
  //
  // Les suivants portent les ids du LEXIQUE (scripts/audit/lexicon.json) : ce
  // sont des mots d'un niveau antérieur que la leçon EMPLOIE partout sans les
  // enseigner. L'audit --strict les voit et exige qu'ils soient DÉCLARÉS puis
  // MESURÉS. Chacun est mesuré par la question du module 0 indiquée en regard.
  //   exponentielle .................. ec-d1 — le mot lui-même est de Première,
  //     et il est ACQUIS : la leçon amont l'a posé.
  //   fonction, notation-fx .......... ec-d1
  //   puissance, exposant ............ ec-d4
  //   quotient ....................... ec-d2 — la leçon écrit e^a / e^b partout.
  //   inverse-nombre ................. ec-d2 — e^(−a) EST l'inverse de e^a.
  //   variations ..................... ec-d3 — « strictement croissante ».
  //   ensemble-reels, intervalle ..... ec-d5 — les solutions sont des
  //     intervalles de ℝ.
  //   intervalle-crochets ............ ec-d5 — la leçon écrit ]−∞ ; 3[.
  //   equation-premier-degre ......... ec-d5
  //   modele ......................... ec-d6 — le mot « modèle » est de 3e.
  //   fonction-affine ................ ec-d6 — le contre-modèle du module 6 :
  //     un écart constant, contre un facteur constant.
  //   pourcentage .................... ec-d6
  priorKnowledge: [
    'exponentielle-definition',
    'exp-strictement-positive',
    'exp-strictement-croissante',
    'regles-puissances',
    'methode-resoudre-inequation',
    'exponentielle',
    'fonction',
    'notation-fx',
    'puissance',
    'exposant',
    'quotient',
    'inverse-nombre',
    'variations',
    'ensemble-reels',
    'intervalle',
    'intervalle-crochets',
    'equation-premier-degre',
    'modele',
    'fonction-affine',
    'pourcentage',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Exponentielle : règles de calcul et modèles',
  description:
    "Deux axes superposés, deux curseurs à faire glisser : en haut on additionne des exposants, en bas les valeurs se multiplient. L'exponentielle traduit l'addition en multiplication — et de là découlent l'inverse, le quotient, la puissance, puis les équations, les inéquations et les modèles de croissance.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📉',
  estimatedDurationMin: 80,
  skills: [
    'Transformer une somme d’exposants en produit d’exponentielles, et l’inverse',
    'Utiliser e^(−a) = 1/e^a et e^(a−b) = e^a/e^b',
    'Utiliser (e^a)^n = e^(na)',
    'Résoudre une équation e^u = e^v en égalant les exposants',
    'Résoudre une inéquation en conservant le sens',
    'Reconnaître et exploiter un modèle A·e^{kt}',
  ],
  teachingScope: {
    include: [
      'La relation e^(a+b) = e^a × e^b, constatée sur deux axes superposés avant d’être énoncée',
      'Les relations e^(−a) = 1/e^a et e^(a−b) = e^a/e^b, déduites de la première',
      'La relation (e^a)^n = e^(na) pour n entier, obtenue en dépliant le produit',
      'Résoudre e^u = e^v en égalant les exposants, par la stricte croissance',
      'Résoudre e^u < e^v en conservant le sens, par la même stricte croissance',
      'Modéliser une croissance ou une décroissance par f(t) = A·e^{kt}, et lire le sens sur le signe de k',
    ],
    exclude: [
      'La définition de l’exponentielle, exp′ = exp, exp(0) = 1, le signe, les variations, la tangente en 0 et la dérivée de e^{ax+b}, tous établis par « Exponentielle : la fonction égale à sa dérivée »',
      'La fonction logarithme népérien — donc les équations du type e^x = 5, qui l’exigeraient (Terminale)',
      'Les limites en l’infini, la convexité et les suites géométriques associées à un modèle exponentiel (Terminale)',
      'Les puissances d’exposant fractionnaire et les racines n-ièmes',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur ce que la leçon précédente a établi, les puissances, et la résolution d’une inéquation du premier degré.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-somme-devient-un-produit', path: `${LESSON_BASE_PATH}/la-somme-devient-un-produit`, title: 'La somme qui devient un produit', desc: 'Deux axes superposés, deux curseurs à attraper. En haut tu additionnes ; en bas, regarde ce que font les valeurs.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire glisser les curseurs' },
    { id: '02', number: 2, slug: 'la-regle-fondamentale', path: `${LESSON_BASE_PATH}/la-regle-fondamentale`, title: 'La règle fondamentale', desc: 'Ce que les deux afficheurs répétaient sans jamais se contredire s’écrit en une ligne — et c’est la loi des puissances, à l’identique.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Poser la règle' },
    { id: '03', number: 3, slug: 'l-oppose-et-la-difference', path: `${LESSON_BASE_PATH}/l-oppose-et-la-difference`, title: 'L’opposé, et la différence', desc: 'Fais passer un curseur en négatif : la valeur devient un diviseur. Deux relations de plus, et pas une de neuve — elles sortent toutes de la première.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Passer en négatif' },
    { id: '04', number: 4, slug: 'la-puissance', path: `${LESSON_BASE_PATH}/la-puissance`, title: 'La puissance', desc: 'Multiplier e^a par lui-même n fois, c’est additionner n fois son exposant. Déplie le produit et regarde ce que la première règle en fait.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Déplier le produit' },
    { id: '05', number: 5, slug: 'resoudre-une-equation', path: `${LESSON_BASE_PATH}/resoudre-une-equation`, title: 'Résoudre une équation', desc: 'Deux valeurs égales imposent deux exposants égaux — parce que la fonction ne repasse jamais deux fois par la même hauteur.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Égaler les exposants' },
    { id: '06', number: 6, slug: 'inegalites-et-modeles', path: `${LESSON_BASE_PATH}/inegalites-et-modeles`, title: 'Inégalités et modèles', desc: 'Le même argument règle les inégalités — et le sens se conserve. Puis deux situations réelles, où tout se joue sur le signe d’un nombre.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P5', 'premiere_specialite_exponentielle-calculer-modeliser-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Comparer et modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-le-traducteur', path: `${LESSON_BASE_PATH}/mission-finale-le-traducteur`, title: '🏆 Mission finale : le traducteur', desc: 'Dix épreuves pour prouver que tu sais transformer, simplifier, résoudre et modéliser.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
