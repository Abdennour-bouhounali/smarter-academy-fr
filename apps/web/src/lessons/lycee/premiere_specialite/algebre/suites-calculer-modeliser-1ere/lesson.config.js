/**
 * Suites : calculer et modéliser — 1ère spécialité.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue. Les 6 LP
 * (clé catalogue 'premiere_specialite_suites_numeriques', partie 2/2,
 * append-only) :
 *
 *   premiere_specialite_suites-calculer-modeliser-1ere_P1  Calculer un terme de rang donné d'une suite arithmétique
 *   premiere_specialite_suites-calculer-modeliser-1ere_P2  Calculer un terme de rang donné d'une suite géométrique
 *   premiere_specialite_suites-calculer-modeliser-1ere_P3  Calculer la somme des n premiers termes d'une suite arithmétique
 *   premiere_specialite_suites-calculer-modeliser-1ere_P4  Calculer la somme des n premiers termes d'une suite géométrique
 *   premiere_specialite_suites-calculer-modeliser-1ere_P5  Modéliser une situation concrète à l'aide d'une suite
 *   premiere_specialite_suites-calculer-modeliser-1ere_P6  Interpréter les résultats d'un modèle par suite
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée : DÉROULER UNE SUITE COÛTE, ET LE
 * COÛT EST ÉVITABLE. Une définition de proche en proche est une MARCHE : pour
 * atteindre le rang 30, il faut trente pas. Une écriture directe est un SAUT :
 * on arrive au même endroit d'un seul geste. Et quand il faut TOUT additionner,
 * une longue addition se replie en un petit nombre de paires identiques.
 *
 * Objet porté : LE CHEMIN ET LE SAUT (components/SautLab.jsx), puis
 * L'ESCALIER DE PIÈCES (components/EscalierGauss.jsx) qui fait naître la somme
 * de Gauss du geste d'appariement.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. « Suites : générer et reconnaître » fait
 * comparer DEUX machines pour découvrir le PAS ; ici, une seule suite, et
 * l'objet est la DISTANCE parcourue puis le TOTAL accumulé.
 *
 * PÉRIMÈTRE : pas de reconnaissance ni de démonstration de nature (leçon
 * amont) ; pas de limite, de convergence ni de raisonnement par récurrence
 * (Terminale) ; pas d'algorithme de seuil écrit en Python.
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/algebre/suites-calculer-modeliser-1ere';

export const LESSON_CONFIG = {
  id: 'suites-calculer-modeliser-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (docs/architecture/KNOWLEDGE_DEPENDENCY.md, état A). Sept ids,
  // tous RÉELLEMENT établis en amont :
  //   suite-arithmetique, suite-geometrique — les deux familles et leur
  //     RAISON, posées par « Suites : générer et reconnaître » (modules 3).
  //     La présente leçon les emploie dès sa première phrase et n'y revient
  //     pas : elle calcule DANS ces familles (sm-d1, sm-d2) ;
  //   definition-recurrence — « u(0) donné et u(n+1) = … » : c'est la
  //     définition dont le module 1 mesure le COÛT. Elle est acquise, et
  //     c'est bien pour cela qu'on peut lui opposer autre chose (sm-d3) ;
  //   definition-explicite — « une formule donne le terme directement à
  //     partir du rang » : la leçon amont l'a posée sur u(n) = 2n + 1, sans
  //     jamais dire comment l'OBTENIR pour une famille donnée. C'est
  //     exactement la marche que les modules 2 et 3 gravissent (sm-d3) ;
  //   puissance, exposant — u0 × qⁿ n'est lisible que si « élever à la
  //     puissance n » l'est. Les deux ids sont ceux que « Puissances » (3e)
  //     établit, et le catalogue les cite en prérequis (sm-d4) ;
  //   coefficient-multiplicateur — « + 5 % ⟺ × 1,05 », de « Proportions et
  //     pourcentages » (2de) : le module 6 modélise une évolution, il ne
  //     redémontre pas le coefficient (sm-d5).
  //
  // NON RETENU : `mem-k-1-plus-t` ferait doublon avec
  // `coefficient-multiplicateur` sur la même question de diagnostic, et un
  // priorKnowledge non diagnostiqué est un défaut d'audit.
  priorKnowledge: [
    'suite-arithmetique', 'suite-geometrique',
    'definition-recurrence', 'definition-explicite',
    'puissance', 'exposant',
    'coefficient-multiplicateur',
  ],
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Suites : calculer et modéliser',
  description:
    "Atteindre le rang 30 en trente clics, ou d'un seul geste : dérouler une suite coûte, et le coût est évitable. Puis additionner tous les termes en repliant la longue addition sur elle-même — quelques paires de même hauteur suffisent. De quoi calculer un terme lointain, sommer, et faire parler un modèle d'épargne, de population ou de dose.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'algebre',
  chapterTitle: 'Algèbre',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '📊',
  estimatedDurationMin: 80,
  skills: [
    'Calculer directement un terme de rang lointain, dans les deux familles',
    'Sommer les premiers termes d’une suite arithmétique par l’appariement',
    'Sommer les premiers termes d’une suite géométrique par le télescopage',
    'Modéliser une évolution réelle, puis interpréter ce que le modèle répond',
  ],
  teachingScope: {
    include: [
      'Calculer un terme de rang donné d’une suite arithmétique par u(n) = u(0) + n × r',
      'Calculer un terme de rang donné d’une suite géométrique par u(n) = u(0) × q puissance n',
      'Calculer la somme des premiers termes d’une suite arithmétique par l’appariement premier + dernier',
      'Calculer la somme des premiers termes d’une suite géométrique par le télescopage S − qS',
      'Modéliser une situation concrète (épargne, population, dose) à l’aide d’une suite',
      'Interpréter les résultats d’un modèle : franchissement d’un seuil, total accumulé, ordre de grandeur',
    ],
    exclude: [
      'Reconnaître la famille d’une suite sur ses termes et démontrer sa nature (leçon « Suites : générer et reconnaître »)',
      'La limite d’une suite, la convergence et le raisonnement par récurrence (Terminale)',
      'L’écriture algorithmique d’une recherche de seuil et sa programmation (leçons de pensée informatique)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur les deux familles de suites, leurs deux écritures, les puissances et le coefficient multiplicateur.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'sauter-au-rang-30', path: `${LESSON_BASE_PATH}/sauter-au-rang-30`, title: 'Sauter au rang 30', desc: 'Un seul bouton pour avancer, et un compteur de clics qui monte. Au bout d’une dizaine de pas, une autre porte s’ouvre — mais il faut de quoi s’en servir.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P1', 'premiere_specialite_suites-calculer-modeliser-1ere_P3'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Tenter la montée' },
    { id: '02', number: 2, slug: 'le-terme-de-rang-n', path: `${LESSON_BASE_PATH}/le-terme-de-rang-n`, title: 'Le terme de rang n', desc: 'Trente pas identiques, c’est trente fois la même chose ajoutée. L’écriture directe tient sur une ligne — et la raison négative n’y change rien.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Écrire le saut' },
    { id: '03', number: 3, slug: 'quand-on-multiplie', path: `${LESSON_BASE_PATH}/quand-on-multiplie`, title: 'Quand on multiplie', desc: 'Le même raisonnement, l’autre famille : n multiplications identiques se replient sur un exposant. Et un exposant n’a pas peur des grands rangs.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Élever à la puissance' },
    { id: '04', number: 4, slug: 'l-escalier-de-pieces', path: `${LESSON_BASE_PATH}/l-escalier-de-pieces`, title: 'L’escalier de pièces', desc: 'Apparie la première colonne avec la dernière, la deuxième avec l’avant-dernière : toutes les paires ont la même hauteur. La longue addition se replie.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 3, actionText: 'Apparier les colonnes' },
    { id: '05', number: 5, slug: 'la-somme-qui-se-telescope', path: `${LESSON_BASE_PATH}/la-somme-qui-se-telescope`, title: 'La somme qui se télescope', desc: 'Apparier ne marche plus quand on multiplie. Alors on écrit la somme, on la multiplie par la raison, et on retranche : presque tout disparaît.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P4'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Faire le télescopage' },
    { id: '06', number: 6, slug: 'atelier-modeliser-interpreter', path: `${LESSON_BASE_PATH}/atelier-modeliser-interpreter`, title: 'Atelier : modéliser et interpréter', desc: 'Une épargne, une ville qui se vide, une dose qui s’élimine : choisir le modèle, puis lui faire dire quelque chose d’utile.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P5', 'premiere_specialite_suites-calculer-modeliser-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'Faire parler le modèle' },
    { id: '07', number: 7, slug: 'mission-finale-le-saut-et-le-total', path: `${LESSON_BASE_PATH}/mission-finale-le-saut-et-le-total`, title: '🏆 Mission finale : le saut et le total', desc: 'Dix épreuves pour prouver que tu sais atteindre un rang lointain, additionner sans tout écrire, et faire parler un modèle.', stage: 'evaluation', color: 'amber', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};
