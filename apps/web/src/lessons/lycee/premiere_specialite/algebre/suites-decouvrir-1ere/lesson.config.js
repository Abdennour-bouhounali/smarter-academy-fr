/**
 * Suites : générer et reconnaître — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue 'premiere_specialite_suites_numeriques', partie 1/3,
 * append-only) :
 *
 *   premiere_specialite_suites-decouvrir-1ere_P1  Générer les termes d'une suite définie par une formule explicite
 *   premiere_specialite_suites-decouvrir-1ere_P2  Générer les termes d'une suite définie par une relation de récurrence
 *   premiere_specialite_suites-decouvrir-1ere_P3  Reconnaître une suite arithmétique et déterminer sa raison
 *   premiere_specialite_suites-decouvrir-1ere_P4  Reconnaître une suite géométrique et déterminer sa raison
 *   premiere_specialite_suites-decouvrir-1ere_P5  Démontrer qu'une suite est arithmétique ou géométrique
 *   premiere_specialite_suites-decouvrir-1ere_P6  Étudier le sens de variation d'une suite
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : une suite se fabrique de deux
 * façons, et CE QUI EST CONSTANT N'EST PAS LE TERME, C'EST LE PAS — un écart
 * pour l'une, un rapport pour l'autre. Deux machines réglées sur les mêmes
 * deux premiers termes se séparent NÉCESSAIREMENT au troisième : la
 * démonstration tient en une ligne (u0 + 2r = u0q² et u0 + r = u0q forcent
 * q = 1), et le laboratoire la fait sentir avant qu'on l'écrive.
 *
 * Objet porté : LA MACHINE À DEUX BOUTONS (components/MachineLab.jsx), reprise
 * au module 3 pour lire les écarts et les rapports d'une pile donnée.
 *
 * PÉRIMÈTRE : pas de formule du terme de rang n atteint directement, pas de
 * somme des premiers termes, pas de modélisation longue (leçon « Suites :
 * calculer et modéliser ») ; pas de limite, de convergence ni de raisonnement
 * par récurrence (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/algebre/suites-decouvrir-1ere';

export const LESSON_CONFIG = {
  id: 'suites-decouvrir-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (docs/architecture/KNOWLEDGE_DEPENDENCY.md, état A). Les ids sont
  // ceux que la 2de établit déjà : une leçon de Première hérite du
  // vocabulaire, elle ne le réinvente pas.
  //   vocab-notation-fx, image-antecedent — la leçon écrit u(n) dès sa
  //     première phrase et lit « l'image de n » ; elle ne l'enseigne pas (sd-d1) ;
  //   tableau-valeurs — une pile de termes EST un tableau de valeurs à une
  //     entrée, lu colonne par colonne (sd-d2) ;
  //   fonction-dependance — « à chaque rang correspond une valeur, et une
  //     seule » est exactement ce dont la leçon a besoin (sd-d2) ;
  //   expression-litterale, developper, methode-reduire,
  //     vocab-terme-coefficient — le module 4 calcule u(n+1) − u(n) en
  //     DÉVELOPPANT une parenthèse puis en RÉDUISANT, et parle des « termes
  //     en n qui s'annulent » : c'est du calcul littéral de 2de, appliqué et
  //     non réenseigné. Les quatre ids sont ceux que « Calcul littéral » (2de)
  //     établit (sd-d3, sd-d4). L'audit strict a montré que sans eux, le
  //     module 0 employait « développer » et « terme » sans qu'aucune brique
  //     ne les pose : deux mots au-dessus du niveau en position de demande ;
  //   coefficient-multiplicateur, mem-k-1-plus-t — « + 5 % ⟺ × 1,05 » de
  //     « Proportions et pourcentages » : le module 6 s'en sert pour modéliser
  //     une hausse, il ne le redémontre pas (sd-d5).
  priorKnowledge: [
    'vocab-notation-fx', 'image-antecedent', 'tableau-valeurs', 'fonction-dependance',
    'expression-litterale', 'developper', 'methode-reduire', 'vocab-terme-coefficient',
    'coefficient-multiplicateur', 'mem-k-1-plus-t',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Suites : générer et reconnaître',
  description:
    "Deux usines à nombres, deux boutons : l'une ajoute toujours le même montant, l'autre multiplie toujours par le même facteur. Réglées sur les mêmes deux premiers termes, elles se séparent au troisième — parce que ce qui est constant n'est pas le terme, c'est le pas. De quoi générer, reconnaître, démontrer et décrire le sens de variation d'une suite.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'algebre',
  chapterTitle: 'Algèbre',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔢',
  estimatedDurationMin: 80,
  skills: [
    'Générer les termes d’une suite, par formule ou de proche en proche',
    'Reconnaître une suite arithmétique ou géométrique et donner sa raison',
    'Démontrer la nature d’une suite par l’écart ou par le rapport',
    'Décrire le sens de variation d’une suite et le justifier',
  ],
  teachingScope: {
    include: [
      'Générer les termes d’une suite définie par une formule explicite u(n) = …',
      'Générer les termes d’une suite définie par une relation de récurrence u(n+1) = f(u(n))',
      'Reconnaître une suite arithmétique : l’écart u(n+1) − u(n) est constant, et cet écart est la raison',
      'Reconnaître une suite géométrique : le rapport u(n+1) / u(n) est constant, et ce rapport est la raison',
      'Démontrer la nature d’une suite en calculant u(n+1) − u(n) ou u(n+1) / u(n)',
      'Étudier le sens de variation d’une suite à partir du signe de l’écart ou de la raison et du premier terme',
    ],
    exclude: [
      'Le calcul direct d’un terme de rang lointain et la somme des premiers termes (leçon « Suites : calculer et modéliser »)',
      'La limite d’une suite, la convergence et le raisonnement par récurrence (Terminale)',
      'La représentation graphique d’une suite en escalier et l’étude algorithmique des seuils (leçons voisines)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur la notation f(x), le tableau de valeurs, le calcul littéral et le coefficient multiplicateur.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-machine-a-deux-boutons', path: `${LESSON_BASE_PATH}/la-machine-a-deux-boutons`, title: 'La machine à deux boutons', desc: 'Deux usines fabriquent des nombres. Règle-les sur les mêmes deux premiers résultats, puis appuie encore : elles se séparent.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P1', 'premiere_specialite_suites-decouvrir-1ere_P2'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire tourner les usines' },
    { id: '02', number: 2, slug: 'deux-facons-de-fabriquer', path: `${LESSON_BASE_PATH}/deux-facons-de-fabriquer`, title: 'Deux façons de fabriquer', desc: 'Donner le calcul du rang, ou donner le premier et la règle du suivant : deux définitions pour la même famille de nombres.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P1', 'premiere_specialite_suites-decouvrir-1ere_P2'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Générer les termes' },
    { id: '03', number: 3, slug: 'arithmetique-ou-geometrique', path: `${LESSON_BASE_PATH}/arithmetique-ou-geometrique`, title: 'Arithmétique ou géométrique', desc: 'Les deux familles ont un nom, et leur pas constant s’appelle la raison. Reste à la trouver sur une liste de nombres.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P3', 'premiere_specialite_suites-decouvrir-1ere_P4'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Trouver la raison' },
    { id: '04', number: 4, slug: 'le-demontrer', path: `${LESSON_BASE_PATH}/le-demontrer`, title: 'Le démontrer, pas le deviner', desc: 'Quatre termes qui s’alignent ne prouvent rien. La preuve tient en une ligne de calcul littéral, valable pour TOUT rang.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P5'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Démontrer' },
    { id: '05', number: 5, slug: 'monte-ou-descend', path: `${LESSON_BASE_PATH}/monte-ou-descend`, title: 'Monte ou descend ?', desc: 'Le sens de variation se lit sur le signe de l’écart — et une multiplication peut très bien faire descendre.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P6'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 3, actionText: 'Trancher le sens' },
    { id: '06', number: 6, slug: 'atelier-modeliser', path: `${LESSON_BASE_PATH}/atelier-modeliser`, title: 'Atelier : modéliser', desc: 'Un versement fixe, une hausse en pourcentage : deux situations réelles, et la famille qui leur convient.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_suites-decouvrir-1ere_P3', 'premiere_specialite_suites-decouvrir-1ere_P4', 'premiere_specialite_suites-decouvrir-1ere_P2'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Modéliser' },
    { id: '07', number: 7, slug: 'mission-finale-deux-familles', path: `${LESSON_BASE_PATH}/mission-finale-deux-familles`, title: '🏆 Mission finale : deux familles', desc: 'Dix épreuves pour prouver que tu sais générer, reconnaître, démontrer et décrire le sens de variation.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
