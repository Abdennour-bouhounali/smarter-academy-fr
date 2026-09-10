/**
 * Dérivation : les règles de calcul — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 5 LP
 * (clé catalogue 'premiere_specialite_derivation', partie 2/3, append-only) :
 *
 *   premiere_specialite_derivation-calculer-1ere_P1  Calculer la dérivée des fonctions usuelles
 *   premiere_specialite_derivation-calculer-1ere_P2  Utiliser la dérivée d'une somme et d'un produit par un réel
 *   premiere_specialite_derivation-calculer-1ere_P3  Utiliser la dérivée d'un produit
 *   premiere_specialite_derivation-calculer-1ere_P4  Utiliser la dérivée d'un quotient
 *   premiere_specialite_derivation-calculer-1ere_P5  Utiliser la dérivée d'une fonction composée simple
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : dériver ne se distribue PAS
 * sur toutes les opérations. Le geste « je remplace chaque morceau par sa
 * dérivée et je recolle pareil » TRAVERSE le « + » et le « × k », et ÉCHOUE
 * pour le « × » — visiblement, chiffres en main. Chaque opération qui ne se
 * laisse pas traverser exige donc SA règle.
 *
 * Objet porté : L'USINE À DÉRIVÉES (components/BancDeCartes.jsx), un banc de
 * cartes qui portent leur dérivée au dos ; on assemble, on retourne, et l'on
 * confronte la prédiction à la pente réellement mesurée.
 *
 * PÉRIMÈTRE : la leçon amont (« Le nombre dérivé et la tangente ») a établi
 * f′(a), la tangente et son équation — on s'en sert, on ne les réenseigne pas.
 * Pas de lien signe de f′ / variations ni d'optimisation (« Dérivation :
 * variations et optimisation »). Pas de composée générale (u ∘ v quelconque),
 * seulement (ax + b)^n et u^n : le refus est CODÉ dans `composee` et
 * `assemblage`, pas seulement commenté.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/derivation-calculer-1ere';

export const LESSON_CONFIG = {
  id: 'derivation-calculer-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (docs/architecture/KNOWLEDGE_DEPENDENCY.md, état A) :
  //   nombre-derive, derive-coefficient-directeur, methode-calculer-nombre-derive,
  //     taux-variation-secante — établis par « Dérivation : le nombre dérivé
  //     et la tangente ». Cette leçon PART de f′(a) : elle ne le crée pas, elle
  //     apprend à le calculer sans repasser par le taux (dc-d1, dc-d2, dc-d3) ;
  //   expression-litterale, developper, methode-reduire — de « Calcul
  //     littéral » (2de) : chaque règle produit une expression à développer et
  //     à réduire, faute de quoi le résultat reste illisible (dc-d4, dc-d5) ;
  //   vocab-terme-coefficient — la somme et le produit par un réel se lisent
  //     TERME par TERME, avec son coefficient : sans ce vocabulaire, la règle
  //     de la somme n'a pas d'objet sur quoi porter (dc-d5).
  //
  // Les huit suivants portent les ids du LEXIQUE (scripts/audit/lexicon.json) :
  // ce sont des mots de 6e/3e que la leçon EMPLOIE partout sans les enseigner —
  // « pente », « tangente », « terme », « facteur », « dénominateur »,
  // « coefficient », « réduire », la notation f(x). L'audit --strict les voit
  // et exige qu'ils soient DÉCLARÉS puis MESURÉS, faute de quoi la leçon les
  // demande sans les avoir posés. Chacun est mesuré par la question du module 0
  // indiquée en regard.
  //   pente, tangente, notation-fx ......... dc-d1
  //   denominateur ......................... dc-d2
  //   facteur .............................. dc-d3
  //   reduire-expression ................... dc-d4
  //   terme-algebrique, coefficient-lineaire  dc-d5
  priorKnowledge: [
    'nombre-derive',
    'derive-coefficient-directeur',
    'methode-calculer-nombre-derive',
    'taux-variation-secante',
    'expression-litterale',
    'developper',
    'methode-reduire',
    'vocab-terme-coefficient',
    'pente',
    'tangente',
    'notation-fx',
    'denominateur',
    'facteur',
    'reduire-expression',
    'terme-algebrique',
    'coefficient-lineaire',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Dérivation : les règles de calcul',
  description:
    "Assembler des fonctions comme des cartes, les retourner, et découvrir que le geste naïf traverse le « + » mais bute sur le « × ». De là, les règles : fonctions usuelles, somme, produit par un réel, produit, quotient, composée simple.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🧮',
  estimatedDurationMin: 80,
  skills: [
    'Calculer la dérivée des fonctions usuelles : x^n, 1/x, √x, une constante',
    'Dériver une somme et un produit par un réel',
    'Appliquer la règle du produit (uv)′ = u′v + uv′',
    'Appliquer la règle du quotient (u/v)′ = (u′v − uv′)/v²',
    'Dériver une composée simple (ax + b)^n et u^n',
  ],
  teachingScope: {
    include: [
      'Dérivées des fonctions usuelles : une constante, x, x^n, 1/x, √x',
      'Dérivée d’une somme et d’un produit par un réel : le geste traverse ces deux opérations',
      'Dérivée d’un produit : (uv)′ = u′v + uv′, et pourquoi u′v′ est faux',
      'Dérivée d’un quotient : (u/v)′ = (u′v − uv′)/v², et le rôle du signe moins',
      'Dérivée d’une composée simple : ((ax + b)^n)′ = n·a·(ax + b)^(n−1), et (u^n)′ = n·u′·u^(n−1)',
    ],
    exclude: [
      'Le nombre dérivé, la tangente et son équation, déjà établis par « Dérivation : le nombre dérivé et la tangente »',
      'Le lien entre le signe de f′ et les variations, et l’optimisation (leçon « Dérivation : variations et optimisation »)',
      'La composée générale u ∘ v, l’exponentielle, le logarithme et les fonctions trigonométriques',
      'La théorie des limites et la dérivabilité (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur f′(a), le taux de variation et le calcul littéral de 2de.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'l-usine-a-derivees', path: `${LESSON_BASE_PATH}/l-usine-a-derivees`, title: 'L’usine à dérivées', desc: 'Emboîte deux cartes, retourne-les, et confronte ta prédiction à la pente vraiment mesurée. Le « + » se laisse traverser. Le « × », non.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P2', 'premiere_specialite_derivation-calculer-1ere_P3'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Assembler des cartes' },
    { id: '02', number: 2, slug: 'les-cartes-de-base', path: `${LESSON_BASE_PATH}/les-cartes-de-base`, title: 'Les cartes de base', desc: 'Le dos de chaque carte ne se récite pas : il se DÉCOUVRE en regardant vers quoi le taux se dirige. x^n, 1/x, √x, une constante.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Retourner les cartes' },
    { id: '03', number: 3, slug: 'somme-et-produit', path: `${LESSON_BASE_PATH}/somme-et-produit`, title: 'La somme, le réel… et le produit', desc: 'Deux opérations que la dérivation traverse, une qui exige sa propre règle : (uv)′ = u′v + uv′.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P2', 'premiere_specialite_derivation-calculer-1ere_P3'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Poser les règles' },
    { id: '04', number: 4, slug: 'le-quotient', path: `${LESSON_BASE_PATH}/le-quotient`, title: 'Le quotient', desc: 'Diviser les dérivées ne marche pas non plus — et cette fois le signe lui-même se trompe. La règle du quotient, et son moins.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P4'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Diviser deux cartes' },
    { id: '05', number: 5, slug: 'la-composee-simple', path: `${LESSON_BASE_PATH}/la-composee-simple`, title: 'La composée simple', desc: '(3x − 2)⁴ : l’intérieur laisse une trace. Un facteur oublié, et la pente est trois fois trop petite.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Dériver l’emboîtement' },
    { id: '06', number: 6, slug: 'atelier-mixte', path: `${LESSON_BASE_PATH}/atelier-mixte`, title: 'Atelier mixte', desc: 'Cinq expressions, cinq règles à reconnaître. Le vrai travail n’est pas de calculer : c’est de voir de quelle règle il s’agit.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_derivation-calculer-1ere_P1', 'premiere_specialite_derivation-calculer-1ere_P2', 'premiere_specialite_derivation-calculer-1ere_P3', 'premiere_specialite_derivation-calculer-1ere_P4', 'premiere_specialite_derivation-calculer-1ere_P5'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Trier les règles' },
    { id: '07', number: 7, slug: 'mission-finale-l-usine', path: `${LESSON_BASE_PATH}/mission-finale-l-usine`, title: '🏆 Mission finale : l’usine', desc: 'Dix épreuves pour prouver que tu sais reconnaître la règle qui convient, et l’appliquer sans perdre un facteur en route.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
