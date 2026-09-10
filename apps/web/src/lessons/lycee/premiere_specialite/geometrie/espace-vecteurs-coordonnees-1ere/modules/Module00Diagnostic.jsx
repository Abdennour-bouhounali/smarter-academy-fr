import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * les coordonnées d'un vecteur du plan, sa longueur, le produit scalaire et son
 * lien avec l'angle droit, le critère de colinéarité, et la lecture d'un dessin
 * de solide.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur la troisième coordonnée, la
 *   norme dans l'espace, ni sur des droites de l'espace — c'est la matière de
 *   la leçon, et la mesurer ici reviendrait à évaluer avant d'enseigner.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     ev-d1  vecteur-deplacement, coordonnees-vecteur, regle-coordonnees
 *     ev-d2  abscisse, ordonnee
 *     ev-d3  vocab-norme, formule-norme
 *     ev-d4  colin-direction, mem-colin-multiple
 *     ev-d5  vocab-produit-scalaire, formule-coordonnees-scalaire
 *     ev-d6  regle-orthogonalite
 *     ev-d7  perspective-cavaliere, arete-cachee
 *     ev-d8  arete, face-solide, sommet-solide
 *     ev-d9  origine-repere
 *     ev-d10 droites-paralleles, secantes
 *     ev-d11 arrondi
 *
 *   ev-d5 et ev-d6 mesurent la leçon VOISINE de Première (« Produit scalaire :
 *   définir et détecter l'orthogonalité »), qui est un prérequis du catalogue.
 *   Ce n'est pas un luxe : sans eux, « produit scalaire » et « orthogonal » —
 *   deux termes du lexique de Première — seraient employés par le module 4 sans
 *   avoir jamais été posés.
 *
 *   ev-d8 à ev-d11 ont été AJOUTÉS après l'audit strict, qui signalait « face
 *   d'un solide », « origine du repère », « droites parallèles », « droites
 *   sécantes » et « arrondi » comme employés avant d'être disponibles. Ce sont
 *   des acquis de 6e et de 3e : les déclarer et les mesurer est la réparation
 *   juste, la seule autre étant de les retirer des énoncés — ce qui aurait
 *   appauvri la leçon sans rien enseigner de plus.
 */
const SKILLS = {
  vecteurs: { label: 'Vecteurs du plan', emoji: '➚' },
  reperage: { label: 'Repérage', emoji: '📍' },
  longueurs: { label: 'Longueurs', emoji: '📏' },
  scalaire: { label: 'Produit scalaire', emoji: '⊥' },
  dessin: { label: 'Dessiner un solide', emoji: '🧊' },
  droites: { label: 'Droites du plan', emoji: '∥' },
};

const QUESTIONS = [
  {
    id: 'ev-d1',
    requires: ['vecteur-deplacement', 'coordonnees-vecteur', 'regle-coordonnees'],
    skill: 'vecteurs',
    points: 2,
    prompt: 'Dans un repère du plan, A(1 ; 2) et B(4 ; 6). Quelles sont les coordonnées de AB ?',
    options: ['(3 ; 4)', '(5 ; 8)', '(−3 ; −4)'],
    cols: 3,
    correct: 0,
    explain: 'On soustrait le départ à l’arrivée, ligne par ligne : 4 − 1 = 3, puis 6 − 2 = 4. Répondre (−3 ; −4), c’est avoir soustrait dans l’autre sens.',
  },
  {
    id: 'ev-d2',
    requires: ['abscisse', 'ordonnee'],
    skill: 'reperage',
    points: 2,
    prompt: 'Un point a pour abscisse 5 et pour ordonnée 0. On l’écrit…',
    options: ['(5 ; 0)', '(0 ; 5)', '(5 ; 5)'],
    cols: 3,
    correct: 0,
    explain: 'L’abscisse s’écrit toujours en premier, l’ordonnée ensuite. Et un 0 est une valeur, pas une case vide.',
  },
  {
    id: 'ev-d3',
    requires: ['vocab-norme', 'formule-norme'],
    skill: 'longueurs',
    points: 2,
    prompt: 'Dans un repère du plan, un vecteur a pour coordonnées (3 ; 4). Quelle est sa longueur ?',
    options: ['5', '7', '25'],
    cols: 3,
    correct: 0,
    explain: 'On additionne les carrés puis on prend la racine : 3² + 4² = 9 + 16 = 25, et √25 = 5. Répondre 7, c’est avoir additionné 3 et 4 ; répondre 25, c’est avoir oublié la racine.',
  },
  {
    id: 'ev-d4',
    requires: ['colin-direction', 'mem-colin-multiple'],
    skill: 'vecteurs',
    points: 2,
    prompt: 'Deux vecteurs du plan valent (2 ; 3) et (6 ; 9). Ont-ils la même direction ?',
    options: [
      'Oui : le second est le premier multiplié par 3',
      'Non : leurs coordonnées sont différentes',
      'On ne peut pas le savoir sans les dessiner',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un même nombre convient aux deux coordonnées : 2 × 3 = 6 et 3 × 3 = 9. Deux vecteurs qui sont multiples l’un de l’autre portent la même direction.',
  },
  {
    id: 'ev-d5',
    requires: ['vocab-produit-scalaire', 'formule-coordonnees-scalaire'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Dans un repère orthonormé du plan, u (2 ; 5) et v (3 ; 1). Que vaut u · v ?',
    options: ['11', '17', '15'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie les coordonnées de même rang, puis on additionne : 2 × 3 + 5 × 1 = 6 + 5 = 11. Répondre 17, c’est avoir croisé les rangs (2 × 1 + 5 × 3).',
  },
  {
    id: 'ev-d6',
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
    id: 'ev-d7',
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
    id: 'ev-d8',
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
    id: 'ev-d9',
    requires: ['origine-repere'],
    skill: 'reperage',
    points: 2,
    prompt: 'Dans un repère, quel point porte les coordonnées (0 ; 0) ?',
    options: [
      'L’origine du repère : le point d’où partent les deux axes',
      'Le point le plus à gauche du dessin',
      'N’importe quel point de l’axe des abscisses',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’origine est le point de départ du repérage : c’est par rapport à elle qu’on compte toutes les autres coordonnées.',
  },
  {
    id: 'ev-d10',
    requires: ['droites-paralleles', 'secantes'],
    skill: 'droites',
    points: 2,
    prompt: 'Dans le PLAN, deux droites qui ne sont pas parallèles…',
    options: [
      'se coupent en un point : elles sont sécantes',
      'peuvent très bien ne jamais se rencontrer',
      'sont forcément confondues',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur une feuille, il n’y a que deux possibilités : parallèles, ou sécantes. Garde bien cela en tête — c’est justement ce que la leçon va bousculer.',
  },
  {
    id: 'ev-d11',
    requires: ['arrondi'],
    skill: 'longueurs',
    points: 2,
    prompt: 'On écrit « √2 ≈ 1,41 ». Que signifie ce signe ≈ ?',
    options: [
      'Que 1,41 est une valeur arrondie : la valeur exacte est √2, qui a une infinité de décimales',
      'Que les deux nombres sont égaux',
      'Que 1,41 est plus grand que √2',
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
      moduleSubtitle="Onze questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant d’attraper une boîte et de la tourner, un tour de tes outils : les coordonnées
            d’un vecteur du plan, sa longueur, ce que le produit scalaire dit d’un angle droit, le
            vocabulaire du solide, et les deux seules positions que deux droites peuvent prendre
            sur une feuille.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
