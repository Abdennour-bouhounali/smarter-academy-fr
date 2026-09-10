/**
 * Fonctions trigonométriques : équations et phénomènes périodiques — 1ère spé.
 *
 * NOTE VALIDATEUR : ids de LP LITTÉRAUX, générés depuis le catalogue
 * (clé 'premiere_specialite_fonctions_trigonometriques', partie 2/2) :
 *
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P1  Résoudre une équation du type cos(x) = k
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P2  Résoudre une équation du type sin(x) = k
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P3  Résoudre une inéquation trigonométrique simple
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P4  Utiliser les formules d'addition
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P5  Utiliser les formules de duplication
 *   premiere_specialite_trigonometrie-equations-modeles-1ere_P6  Modéliser un phénomène périodique par une fonction trigonométrique
 *
 * ─── POSITIONNEMENT VERTICAL, load-bearing ─────────────────────────────────
 * DEUX leçons antérieures, toutes deux LIVRÉES, portent déjà l'essentiel des
 * outils, et cette leçon n'en réenseigne AUCUN :
 *
 *   `trigonometrie-equations-2nde` (Seconde) résout DÉJÀ cos t = a et
 *   sin t = b SUR UN TOUR — deux points lus sur le cercle, la symétrie
 *   horizontale pour l'un, verticale pour l'autre — et connaît DÉJÀ les
 *   formules d'addition et l'identité cos²t + sin²t = 1.
 *
 *   `trigonometrie-cercle-fonctions-1ere` (partie 1 de ce chapitre) a fait du
 *   sinus et du cosinus des FONCTIONS, avec leur périodicité, leur parité,
 *   leurs variations et leur courbe.
 *
 * L'APPORT PROPRE de cette leçon tient en quatre points, et rien d'autre :
 *   · les solutions sur ℝ TOUT ENTIER — la FAMILLE « ±a + 2kπ », l'infinité
 *     de solutions, là où la Seconde s'arrêtait à un tour ;
 *   · les INÉQUATIONS : la solution n'est plus une liste de points, c'est un
 *     ARC de cercle — un objet d'une autre nature ;
 *   · les formules de DUPLICATION, absentes de la Seconde, et DÉDUITES des
 *     formules d'addition en y posant b = a ;
 *   · la MODÉLISATION d'un phénomène périodique : amplitude, période, décalage.
 *
 * L'IDÉE CENTRALE, vécue avant d'être nommée (module 1) : une BARRE
 * HORIZONTALE de hauteur k, qu'on attrape et qu'on fait glisser. Sur la
 * courbe, elle coupe en des points EN NOMBRE INFINI, régulièrement espacés de
 * 2π ; sur le cercle, les mêmes solutions ne sont que DEUX points symétriques.
 * Au-dessus de 1, tout s'éteint. Résoudre cos x = k, ce n'est donc pas trouver
 * UN nombre : c'est décrire une FAMILLE — et le module 1 ne le nomme pas, il
 * le DEMANDE.
 *
 * Objet porté : LA BARRE (components/BarreLab.jsx), reprise au module 2 (une
 * seule branche, pour voir l'écart de 2π), au module 3 (le sinus, et son autre
 * symétrie) et au module 4 (l'arc de l'inéquation).
 *
 * PÉRIMÈTRE : pas d'enroulement, de radian ni de « cos = abscisse » (Seconde) ;
 * pas de parité, de périodicité, de variations ni de tracé de courbe (partie 1
 * de ce chapitre) ; pas de dérivée des fonctions trigonométriques (Terminale) ;
 * pas de linéarisation ni de transformation a·cos x + b·sin x (Terminale).
 * CARTE DES CONNAISSANCES : lessons/common/knowledge, données knowledge.jsx.
 */
export const LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/analyse/trigonometrie-equations-modeles-1ere';

export const LESSON_CONFIG = {
  id: 'trigonometrie-equations-modeles-1ere',
  // Connaissances SUPPOSÉES acquises, chacune MESURÉE par une question du
  // module 0 (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
  //
  //   DE LA SECONDE (`trigonometrie-cercle-2nde` et `trigonometrie-equations-2nde`,
  //   toutes deux livrées et disponibles) :
  //     cercle-trigonometrique, radian, cos-sin-coordonnees — le décor commun,
  //       dans lequel toute la leçon écrit (te-d1) ;
  //     valeurs-remarquables — les crans de la barre SONT les valeurs
  //       remarquables : sans elles, aucun cas exact (te-d2) ;
  //     regle-borne-un, regle-hors-bornes — « au-dessus de 1, rien » est le
  //       constat que le module 1 fait REFAIRE au geste, pas une découverte (te-d3) ;
  //     equation-deux-solutions, methode-resoudre-cos — résoudre sur UN TOUR
  //       est acquis ; la leçon part de là pour aller sur ℝ (te-d4) ;
  //     methode-resoudre-sin, regle-deux-symetries — les DEUX symétries sont
  //       connues ; la leçon montre ce qu'elles deviennent sur ℝ (te-d5) ;
  //     formules-addition — la duplication s'en DÉDUIT au module 5 : sans
  //       elles, le geste « posons b = a » n'a aucun sens (te-d6) ;
  //     identite-fondamentale — les deux autres écritures de cos 2a s'en
  //       déduisent (te-d6) ;
  //
  //   DE LA PARTIE 1 DE CE CHAPITRE (`trigonometrie-cercle-fonctions-1ere`) :
  //     periodicite — « + 2kπ » n'est que la périodicité, écrite ; la leçon ne
  //       la réenseigne pas, elle l'EMPLOIE (te-d7) ;
  //     courbe-sinusoide — la courbe déroulée sur laquelle la barre coupe est
  //       celle que la partie 1 a tracée (te-d7) ;
  //     lire-ecart-et-motif — lire une courbe périodique est acquis ; le
  //       module 6 le TRANSPORTE sur un phénomène concret (te-d8) ;
  //
  //   PLUS ANCIENNES :
  //     equation-solution — ce qu'est une solution d'une équation, de la 4e
  //       puis de equations-et-inequations-2nde (te-d9) ;
  //     inequation-infinite, methode-resoudre-inequation — de
  //       `equations-et-inequations-2nde` : « une inéquation a une INFINITÉ de
  //       solutions, qui forment un intervalle ». C'est exactement l'idée que
  //       le module 4 TRANSPORTE sur le cercle, où l'intervalle devient un
  //       ARC ; sans elle, la nouveauté du module ne serait pas lisible (te-d10) ;
  //     abscisse, ordonnee — le repérage du collège (te-d1).
  priorKnowledge: [
    'cercle-trigonometrique', 'radian', 'cos-sin-coordonnees', 'valeurs-remarquables',
    'regle-borne-un', 'regle-hors-bornes',
    'equation-deux-solutions', 'methode-resoudre-cos',
    'methode-resoudre-sin', 'regle-deux-symetries',
    'formules-addition', 'identite-fondamentale',
    'periodicite', 'courbe-sinusoide', 'lire-ecart-et-motif',
    'equation-solution', 'inequation-infinite', 'methode-resoudre-inequation',
    'abscisse', 'ordonnee',
  ],
  // Termes d'appui ANTÉRIEURS que la leçon emploie sans les enseigner. Chacun
  // est justifié — jamais ajouté pour faire taire l'audit.
  knowledgeAudit: {
    ignore: [
      { term: 'sinus', reason: 'Établi comme ordonnée du point du cercle par trigonometrie-cercle-2nde, puis comme FONCTION par trigonometrie-cercle-fonctions-1ere (partie 1 de ce chapitre). Cette leçon ne l’enseigne pas : elle résout des équations qui le mettent en jeu.' },
      { term: 'cosinus', reason: 'Même statut que sinus : acquis en 2de comme abscisse du point du cercle, puis comme fonction en partie 1 de ce chapitre.' },
      { term: 'fonction', reason: 'Notion de 3e, réactivée par toute la 2de, et objet même de la partie 1 de ce chapitre (briques fonction-sinus, courbe-sinusoide). La leçon l’emploie, elle ne l’enseigne pas.' },
      { term: 'coordonnees', reason: 'Repérage du collège, prérequis déclaré (abscisse, ordonnee) : le couple (cos x ; sin x) est l’outil de lecture, jamais une cible.' },
      { term: 'representation-graphique', reason: 'Établie par les fonctions de 3e puis de 2de, et appliquée aux fonctions trigonométriques par la partie 1 de ce chapitre. La barre COUPE une courbe déjà connue.' },
      { term: 'intervalle', reason: 'Écriture [0 ; 2π] établie par ensembles-et-intervalles-2nde ; simple support d’énoncé, jamais un objet d’étude ici.' },
      { term: 'intervalle-crochets', reason: 'Même statut : l’ensemble solution d’une inéquation s’écrit avec des crochets, notation acquise en 2de.' },
      { term: 'axe-symetrie', reason: 'Symétrie axiale du collège, et brique regle-deux-symetries de la 2de (en priorKnowledge) : sert à décrire OÙ sont les deux solutions, jamais à être appris.' },
      { term: 'racine-carree', reason: 'Notion de 4e ; n’apparaît que dans les écritures √2/2 et √3/2 des valeurs remarquables, acquises en 2de.' },
      { term: 'equation-premier-degre', reason: 'Le motif « Résoudre … = » du lexique attrape toute consigne de résolution. Ce que la leçon enseigne n’est pas l’équation du premier degré (2de) mais la FAMILLE de solutions d’une équation trigonométrique sur ℝ — porté par les briques solutions-sur-r, methode-cos-sur-r et methode-sin-sur-r.' },
      { term: 'periodicite', reason: 'Déclarée en priorKnowledge : établie par la partie 1 de ce chapitre (brique periodicite). Le « + 2kπ » de cette leçon EST cette périodicité, écrite ; la leçon l’emploie et ne la redéfinit pas.' },
      { term: 'arrondi', reason: 'Notion de 6e ; n’apparaît que comme consigne de réponse (« arrondie au dixième ») dans le laboratoire de modélisation.' },
      { term: 'inequation', reason: 'Résoudre une inéquation et écrire son ensemble solution est acquis par equations-et-inequations-2nde (briques inequation-infinite et methode-resoudre-inequation, ici en priorKnowledge). Ce que la leçon ajoute est que, pour une inéquation TRIGONOMÉTRIQUE, cet ensemble est un ARC — porté par la brique inequation-arc.' },
      { term: 'modele', reason: 'Le mot « modéliser » est l’intitulé même du LP6 du catalogue officiel. La leçon l’établit par la brique modele-periodique, posée au module 6 avant toute demande, et le module 0 ne l’emploie jamais.' },
      { term: 'moyenne', reason: 'Notion de 6e ; le « niveau moyen » d’un phénomène qui oscille n’est ici qu’une hauteur de référence lue sur un dessin, jamais une moyenne à calculer.' },
    ],
  },
  sequentialUnlock: true,
  knowledgeMap: true,
  title: 'Fonctions trigonométriques : équations et phénomènes périodiques',
  description:
    "Une barre horizontale qu’on fait glisser coupe la courbe en une infinité de points, tous les 2π — et le cercle n’en montre que deux. De là naissent la famille ±a + 2kπ, les inéquations dont la solution est un arc, les formules de duplication et la modélisation d’un phénomène qui se répète.",
  level: 'lycee',
  grade: 'premiere_specialite',
  chapter: 'analyse',
  chapterTitle: 'Analyse',
  passingScore: 6,
  masteryThreshold: 0.8,
  emoji: '🔁',
  estimatedDurationMin: 80,
  skills: [
    'Décrire toutes les solutions de cos x = k sur ℝ par une famille ±a + 2kπ',
    'Décrire toutes les solutions de sin x = k sur ℝ, avec l’autre symétrie',
    'Lire l’ensemble solution d’une inéquation trigonométrique comme un arc',
    'Retrouver cos 2a et sin 2a à partir des formules d’addition',
    'Décrire un phénomène qui se répète par son amplitude et sa période',
  ],
  teachingScope: {
    include: [
      'Résoudre cos x = k sur ℝ : la famille x = a + 2kπ ou x = −a + 2kπ',
      'Résoudre sin x = k sur ℝ : la famille x = a + 2kπ ou x = π − a + 2kπ',
      'Constater qu’une équation trigonométrique a une infinité de solutions, espacées de 2π',
      'Résoudre une inéquation trigonométrique simple, dont l’ensemble solution est un arc',
      'Rappeler les formules d’addition et s’en servir pour un calcul exact',
      'En déduire les formules de duplication cos 2a et sin 2a, en posant b = a',
      'Modéliser un phénomène périodique : amplitude, période, instant du maximum',
    ],
    exclude: [
      'Le cercle trigonométrique, le radian et « cos = abscisse » : acquis en Seconde',
      'La résolution de cos t = a ou sin t = b SUR UN SEUL TOUR : acquise en Seconde',
      'L’établissement des formules d’addition : acquis en Seconde (ici simplement rappelées)',
      'La parité, la périodicité, les variations et le tracé des courbes du sinus et du cosinus : leçon « Fonctions trigonométriques : du cercle à la courbe »',
      'La dérivée des fonctions sinus et cosinus (Terminale)',
      'La linéarisation et la transformation de a·cos x + b·sin x (Terminale)',
    ],
  },
  modules: [
    { id: '00', number: 0, slug: 'mission-de-depart', path: `${LESSON_BASE_PATH}/mission-de-depart`, title: 'Mission de départ', desc: 'Un diagnostic — jamais bloquant — sur ce que la Seconde et la première partie du chapitre t’ont déjà donné.', stage: 'prerequisite_check', color: 'teal', style: 'diagnostic', estimatedMin: 4, difficulty: 1, actionText: 'Vérifier mes bases' },
    { id: '01', number: 1, slug: 'la-barre-qui-coupe-partout', path: `${LESSON_BASE_PATH}/la-barre-qui-coupe-partout`, title: 'La barre qui coupe partout', desc: 'Attrape une barre horizontale et fais-la glisser : elle coupe la courbe en des points qui n’en finissent pas — et le cercle n’en montre que deux.', stage: 'trigger', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P1'], color: 'indigo', style: 'featured', estimatedMin: 10, difficulty: 2, actionText: 'Faire glisser' },
    { id: '02', number: 2, slug: 'une-infinite-de-solutions', path: `${LESSON_BASE_PATH}/une-infinite-de-solutions`, title: 'Une infinité de solutions', desc: 'Deux points sur le cercle, puis « et on recommence tous les 2π » : voilà comment s’écrit tout ce que la barre a allumé.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P1'], color: 'violet', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Écrire la famille' },
    { id: '03', number: 3, slug: 'le-sinus-et-son-autre-symetrie', path: `${LESSON_BASE_PATH}/le-sinus-et-son-autre-symetrie`, title: 'Le sinus et son autre symétrie', desc: 'Même barre, autre courbe — et la deuxième solution ne se trouve plus du tout au même endroit.', stage: 'discovery', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P2'], color: 'sky', style: 'featured', estimatedMin: 10, difficulty: 3, actionText: 'Comparer' },
    { id: '04', number: 4, slug: 'quand-la-solution-est-un-arc', path: `${LESSON_BASE_PATH}/quand-la-solution-est-un-arc`, title: 'Quand la solution est un arc', desc: 'Remplace le signe = par un signe ≥ : la solution cesse d’être des points et devient un morceau de cercle.', stage: 'manipulation', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P3'], color: 'emerald', style: 'featured', estimatedMin: 12, difficulty: 4, actionText: 'Colorier l’arc' },
    { id: '05', number: 5, slug: 'poser-b-egale-a', path: `${LESSON_BASE_PATH}/poser-b-egale-a`, title: 'Poser b = a', desc: 'Un rappel des formules d’addition, puis un geste minuscule qui en fait tomber deux nouvelles.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P4', 'premiere_specialite_trigonometrie-equations-modeles-1ere_P5'], color: 'rose', style: 'featured', estimatedMin: 11, difficulty: 4, actionText: 'Déduire' },
    { id: '06', number: 6, slug: 'ce-qui-se-repete-dans-la-vraie-vie', path: `${LESSON_BASE_PATH}/ce-qui-se-repete-dans-la-vraie-vie`, title: 'Ce qui se répète dans la vraie vie', desc: 'La marée, la température, la grande roue : attrape le sommet et règle deux nombres pour retrouver la courbe observée.', stage: 'practice_lab', teachesLearningPointIds: ['premiere_specialite_trigonometrie-equations-modeles-1ere_P6'], color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 4, actionText: 'Régler' },
    { id: '07', number: 7, slug: 'mission-finale-equations-et-modeles', path: `${LESSON_BASE_PATH}/mission-finale-equations-et-modeles`, title: '🏆 Mission finale : équations et modèles', desc: 'Dix épreuves pour prouver que tu sais décrire une famille, colorier un arc, dupliquer un angle et décrire un phénomène qui se répète.', stage: 'evaluation', color: 'violet', style: 'assessment', estimatedMin: 15, difficulty: 4, actionText: 'Relever le défi' },
  ],
};

export default LESSON_CONFIG;
