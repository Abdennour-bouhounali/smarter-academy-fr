import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * les coordonnées et le produit scalaire de l'espace, la norme, la colinéarité,
 * les critères POUR DEUX DROITES, et la lecture d'un dessin de solide.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur une position relative droite /
 *   plan, sur un vecteur normal, sur une représentation paramétrique, sur une
 *   équation de plan ni sur une distance à un plan — c'est la matière de la
 *   leçon, et la mesurer ici reviendrait à évaluer avant d'enseigner.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     ev-d1  repere-espace, coordonnees-vecteur-espace
 *     ev-d2  formule-scalaire-espace, mem-un-terme-de-plus, terme-algebrique
 *     ev-d3  formule-norme-espace, methode-calculer-norme-espace
 *     ev-d4  regle-parallelisme-espace
 *     ev-d5  regle-orthogonalite-espace, droites-espace-trois-cas
 *     ev-d6  vocab-produit-scalaire, formule-coordonnees-scalaire
 *     ev-d7  regle-orthogonalite
 *     ev-d8  colin-direction, mem-colin-multiple, colineaire
 *     ev-d9  perspective-cavaliere, arete-cachee
 *     ev-d10 arete, face-solide, sommet-solide
 *     ev-d11 droites-paralleles, secantes, droites-perpendiculaires
 *     ev-d12 abscisse, ordonnee, origine-repere
 *     ev-d13 arrondi
 *     ev-d14 orthogonal
 *     ev-d15 coefficient-lineaire
 *     ev-d16 valeur-absolue
 *
 *   ev-d14 à ev-d16 ont été AJOUTÉS après l'audit strict, qui signalait
 *   « orthogonal », « coefficient » et « valeur absolue » comme employés avant
 *   d'être disponibles. « Orthogonal » appartient à la leçon voisine de
 *   Première ; « coefficient » est un acquis de 3e ; « valeur absolue » un
 *   acquis de 5e. Les déclarer et les mesurer est la réparation juste, la seule
 *   autre étant de les retirer des énoncés — ce qui aurait appauvri la leçon
 *   sans rien enseigner de plus.
 *
 *   ev-d1 à ev-d5 mesurent la leçon d'AMONT, « L'espace : vecteurs et
 *   coordonnées », dont celle-ci est la suite directe et qui est prérequis du
 *   catalogue. Ce n'est pas un luxe : sans le produit scalaire de l'espace, le
 *   critère central de cette leçon-ci n'aurait rien à calculer.
 *
 *   ev-d5 mesure les critères POUR DEUX DROITES. Il est capital : la leçon les
 *   transporte aux plans en INVERSANT le rôle du produit scalaire, et l'on ne
 *   peut pas inverser ce qu'on n'a pas. La question est formulée pour DEUX
 *   DROITES seulement — elle n'anticipe rien.
 */
const SKILLS = {
  espace: { label: 'Vecteurs de l’espace', emoji: '📦' },
  scalaire: { label: 'Produit scalaire', emoji: '⊥' },
  longueurs: { label: 'Longueurs', emoji: '📏' },
  droites: { label: 'Droites', emoji: '∥' },
  dessin: { label: 'Lire un solide', emoji: '🧊' },
  reperage: { label: 'Repérage', emoji: '📍' },
};

const QUESTIONS = [
  {
    id: 'ev-d1',
    requires: ['repere-espace', 'coordonnees-vecteur-espace'],
    skill: 'espace',
    points: 2,
    prompt: 'Dans un repère de l’espace, A(0 ; 0 ; 0) et G(2 ; 2 ; 2). Quelles sont les coordonnées de AG ?',
    options: ['(2 ; 2 ; 2)', '(0 ; 0 ; 0)', '(−2 ; −2 ; −2)'],
    cols: 3,
    correct: 0,
    explain: 'Arrivée moins départ, sur les trois lignes : 2 − 0 = 2, trois fois. Répondre (−2 ; −2 ; −2), c’est avoir soustrait dans l’autre sens — ce sont les coordonnées de GA.',
  },
  {
    id: 'ev-d2',
    requires: ['formule-scalaire-espace', 'mem-un-terme-de-plus', 'terme-algebrique'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Dans un repère orthonormé de l’espace, u (2 ; 2 ; 0) et v (0 ; 0 ; 1). Que vaut u · v ?',
    options: ['0', '4', '2'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie les coordonnées de même rang, puis on additionne : 2 × 0 + 2 × 0 + 0 × 1 = 0. Le troisième terme ne s’oublie pas, même quand il vaut 0.',
  },
  {
    id: 'ev-d3',
    requires: ['formule-norme-espace', 'methode-calculer-norme-espace'],
    skill: 'longueurs',
    points: 2,
    prompt: 'Un vecteur de l’espace a pour coordonnées (1 ; 1 ; 1). Quelle est sa longueur ?',
    options: ['√3', '3', '√2'],
    cols: 3,
    correct: 0,
    explain: 'On additionne les trois carrés puis on prend la racine : 1 + 1 + 1 = 3, donc √3. Répondre 3, c’est avoir oublié la racine.',
  },
  {
    id: 'ev-d4',
    requires: ['regle-parallelisme-espace'],
    skill: 'droites',
    points: 2,
    prompt: 'Deux droites de l’espace ont pour vecteurs directeurs (1 ; 1 ; 0) et (3 ; 3 ; 0). Que peut-on affirmer ?',
    options: [
      'Elles sont parallèles : le second directeur est le premier multiplié par 3',
      'Elles sont orthogonales',
      'Elles se coupent en un point',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un même nombre, k = 3, convient aux trois coordonnées. Deux directeurs multiples l’un de l’autre portent la même direction, donc les droites sont parallèles.',
  },
  {
    id: 'ev-d5',
    requires: ['regle-orthogonalite-espace', 'droites-espace-trois-cas'],
    skill: 'droites',
    points: 2,
    prompt: 'Deux DROITES de l’espace ont des vecteurs directeurs dont le produit scalaire est nul. Que sait-on ?',
    options: [
      'Qu’elles font un angle droit — sans savoir si elles se rencontrent',
      'Qu’elles se coupent en formant un angle droit',
      'Qu’elles sont parallèles',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le produit nul est le critère de l’orthogonalité de deux droites, et il ne dit rien de la rencontre : dans l’espace, deux droites peuvent faire un angle droit sans jamais se croiser.',
  },
  {
    id: 'ev-d6',
    requires: ['vocab-produit-scalaire', 'formule-coordonnees-scalaire'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Dans un repère orthonormé du plan, u (2 ; 5) et v (3 ; 1). Que vaut u · v ?',
    options: ['11', '17', '15'],
    cols: 3,
    correct: 0,
    explain: '2 × 3 + 5 × 1 = 6 + 5 = 11. Répondre 17, c’est avoir croisé les rangs (2 × 1 + 5 × 3).',
  },
  {
    id: 'ev-d7',
    requires: ['regle-orthogonalite'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Dans le plan, u (3 ; 1) et v (−1 ; 3). Que peut-on affirmer ?',
    options: [
      'Ils font un angle droit, car 3 × (−1) + 1 × 3 = 0',
      'Ils ont la même direction, car leurs coordonnées sont échangées',
      'Ils sont égaux, car ils ont la même longueur',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le calcul donne −3 + 3 = 0. Un résultat nul est exactement la signature de l’angle droit — et c’est une démonstration, pas une impression de dessin.',
  },
  {
    id: 'ev-d8',
    requires: ['colin-direction', 'mem-colin-multiple', 'colineaire'],
    skill: 'droites',
    points: 2,
    prompt: 'Deux vecteurs valent (1 ; 0 ; 2) et (2 ; 0 ; 4). Sont-ils colinéaires ?',
    options: [
      'Oui : le second est le premier multiplié par 2, sur les trois coordonnées',
      'Non : le zéro du milieu empêche de conclure',
      'On ne peut pas le savoir sans les dessiner',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux vecteurs sont colinéaires quand l’un est un multiple de l’autre. Ici le même nombre, k = 2, convient partout : 1 × 2 = 2, 0 × 2 = 0, 2 × 2 = 4. Un zéro multiplié reste zéro, il n’empêche rien.',
  },
  {
    id: 'ev-d9',
    requires: ['perspective-cavaliere', 'arete-cachee'],
    skill: 'dessin',
    points: 2,
    prompt: 'Sur le dessin d’un cube, certaines arêtes sont tracées en pointillé. Que signifient-elles ?',
    options: [
      'Ce sont les arêtes cachées par le solide, qu’on ne verrait pas en vrai sous cet angle',
      'Ce sont les arêtes les plus courtes du cube',
      'Ce sont des arêtes qui n’existent pas vraiment',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le pointillé est une convention de dessin : l’arête existe bel et bien, mais le solide la masque sous cet angle-là. Change d’angle, et elle redevient pleine.',
  },
  {
    id: 'ev-d10',
    requires: ['arete', 'face-solide', 'sommet-solide'],
    skill: 'dessin',
    points: 2,
    prompt: 'Sur un cube, combien y a-t-il de faces, d’arêtes et de sommets ?',
    options: ['6 faces, 12 arêtes, 8 sommets', '6 faces, 8 arêtes, 12 sommets', '8 faces, 12 arêtes, 6 sommets'],
    cols: 1,
    correct: 0,
    explain: 'Six carrés se rejoignent le long de douze segments, et ces segments se rencontrent en huit coins. C’est le vocabulaire que la leçon emploiera à chaque phrase.',
  },
  {
    id: 'ev-d11',
    requires: ['droites-paralleles', 'secantes', 'droites-perpendiculaires'],
    skill: 'droites',
    points: 2,
    prompt: 'Dans le PLAN, deux droites perpendiculaires…',
    options: [
      'se coupent forcément, en formant un angle droit : elles sont sécantes',
      'peuvent très bien ne jamais se rencontrer',
      'sont parallèles',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur une feuille, deux droites perpendiculaires se rencontrent toujours : il n’y a que deux possibilités, parallèles ou sécantes, et l’angle droit relève de la seconde. Garde bien cela en tête — la leçon va s’en servir comme point de comparaison.',
  },
  {
    id: 'ev-d12',
    requires: ['abscisse', 'ordonnee', 'origine-repere'],
    skill: 'reperage',
    points: 2,
    prompt: 'Un point a pour abscisse 0 et pour ordonnée 0. De quel point s’agit-il ?',
    options: [
      'De l’origine du repère : le point d’où partent les axes',
      'Du point le plus à gauche du dessin',
      'D’un point quelconque, on ne peut pas savoir',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’abscisse s’écrit en premier, l’ordonnée ensuite, et deux zéros désignent le point de départ du repérage : c’est par rapport à lui qu’on compte toutes les autres coordonnées.',
  },
  {
    id: 'ev-d14',
    requires: ['orthogonal'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Deux vecteurs dont le produit scalaire est nul sont dits…',
    options: ['orthogonaux', 'colinéaires', 'égaux'],
    cols: 3,
    correct: 0,
    explain: 'C’est le mot exact : deux vecteurs de produit scalaire nul sont orthogonaux. Il remplace « perpendiculaires », qui suppose une rencontre — inutile ici, puisque des vecteurs n’ont pas de position.',
  },
  {
    id: 'ev-d15',
    requires: ['coefficient-lineaire'],
    skill: 'reperage',
    points: 2,
    prompt: 'Dans l’écriture 3x + 5y = 7, comment appelle-t-on les nombres 3 et 5 ?',
    options: [
      'Ce sont les coefficients de x et de y',
      'Ce sont les inconnues',
      'Ce sont les solutions',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un coefficient est le nombre qui multiplie une lettre. Ici 3 multiplie x et 5 multiplie y ; le 7 est le terme constant, et x et y sont les inconnues.',
  },
  {
    id: 'ev-d16',
    requires: ['valeur-absolue'],
    skill: 'longueurs',
    points: 2,
    prompt: 'Que vaut la valeur absolue de −7 ?',
    options: ['7', '−7', '0'],
    cols: 3,
    correct: 0,
    explain: 'La valeur absolue efface le signe : elle rend la distance du nombre à zéro, qui est toujours positive. |−7| = 7 et |7| = 7.',
  },
  {
    id: 'ev-d13',
    requires: ['arrondi'],
    skill: 'longueurs',
    points: 2,
    prompt: 'On écrit « √3 ≈ 1,73 ». Que signifie ce signe ≈ ?',
    options: [
      'Que 1,73 est une valeur arrondie : la valeur exacte est √3, qui a une infinité de décimales',
      'Que les deux nombres sont égaux',
      'Que 1,73 est plus grand que √3',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un arrondi est une valeur approchée, commode pour se représenter la taille d’un nombre. Quand on veut la valeur exacte, on garde l’écriture avec la racine.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Seize questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant d’attraper un plan et de le faire monter à travers une boîte, un tour de tes
            outils : les coordonnées d’un vecteur de l’espace, sa longueur, le produit scalaire et
            ce qu’il dit d’un angle droit, les critères qui décident de deux droites, et le
            vocabulaire du solide. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
