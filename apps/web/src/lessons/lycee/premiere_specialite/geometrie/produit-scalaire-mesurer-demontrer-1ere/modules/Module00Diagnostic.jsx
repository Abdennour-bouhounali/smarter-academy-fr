import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * le produit scalaire par les coordonnées, sa formule par les normes et
 * l'angle, le critère d'orthogonalité, les coordonnées d'une flèche, sa norme,
 * le vecteur directeur d'une droite, et le critère de colinéarité.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Le produit scalaire lui-même EST un acquis ici — la leçon
 *   amont « Produit scalaire : définir et détecter l'orthogonalité » le pose —
 *   et le mesurer est donc légitime.
 *
 *   VOCABULAIRE INTERDIT ICI, `explain` compris, parce que ce sont les CIBLES
 *   de la leçon : « calculer un angle », « mesurer un angle », « nature du
 *   triangle », « isocèle », « équation normale », « forme normale »,
 *   « Al-Kashi », « carré scalaire », « distance d'un point à une droite ».
 *
 *   « Rectangle » n'apparaît nulle part dans un énoncé ou une option : la
 *   leçon en fait une CIBLE (« déterminer la nature d'un triangle »). On dit
 *   ici « l'angle est droit », jamais « le triangle est rectangle ».
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question. Les ids en
 *   petites capitales sont ceux du LEXIQUE de l'audit : ils désignent des mots
 *   acquis (collège, 2de, ou leçon amont) que cette leçon EMPLOIE sans les
 *   enseigner, et les déclarer ici est ce qui rend l'audit strict silencieux
 *   à leur sujet — sans faire semblant qu'ils sont hors sujet.
 *     psm-d1  vocab-produit-scalaire, formule-coordonnees-scalaire,
 *             PRODUIT-SCALAIRE, VECTEUR, ABSCISSE, ORDONNEE
 *     psm-d2  formule-normes-angle, COSINUS, SINUS
 *     psm-d3  regle-orthogonalite, ORTHOGONAL, ANGLE-DROIT,
 *             TRIANGLE-RECTANGLE, DROITES-PERPENDICULAIRES
 *     psm-d4  coordonnees-vecteur, regle-coordonnees
 *     psm-d5  vocab-norme, formule-norme
 *     psm-d6  vocab-vecteur-normal, VECTEUR-NORMAL, droite-vecteur-directeur
 *     psm-d7  regle-colineaire, COLINEAIRE
 */
const SKILLS = {
  scalaire: { label: 'Produit scalaire', emoji: '·' },
  vecteurs: { label: 'Vecteurs', emoji: '➜' },
  droites: { label: 'Droites', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'psm-d1',
    requires: ['vocab-produit-scalaire', 'formule-coordonnees-scalaire', 'produit-scalaire', 'vecteur', 'abscisse', 'ordonnee'],
    skill: 'scalaire',
    points: 2,
    prompt: 'u(4 ; 3) et v(0 ; 5). Combien vaut le produit scalaire u · v ?',
    options: ['15', '20', '12', '35'],
    cols: 4,
    correct: 0,
    explain: '4 × 0 + 3 × 5 = 0 + 15 = 15. On multiplie les abscisses entre elles, les ordonnées entre elles, puis on additionne.',
  },
  {
    id: 'psm-d2',
    requires: ['formule-normes-angle', 'cosinus', 'sinus'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Quelle égalité relie le produit scalaire de deux vecteurs à leurs longueurs ?',
    options: [
      'u · v = ‖u‖ × ‖v‖ × cos(angle entre les deux)',
      'u · v = ‖u‖ + ‖v‖',
      'u · v = ‖u‖ × ‖v‖',
      'u · v = ‖u‖ ÷ ‖v‖',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux longueurs, multipliées par le cosinus de l’angle qu’elles forment. Sans le cosinus, l’égalité ne serait vraie que si les deux flèches pointaient exactement dans le même sens.',
  },
  {
    id: 'psm-d3',
    requires: ['regle-orthogonalite', 'orthogonal', 'angle-droit', 'triangle-rectangle', 'droites-perpendiculaires'],
    skill: 'scalaire',
    points: 2,
    prompt: 'Deux vecteurs non nuls sont orthogonaux exactement quand…',
    options: [
      'leur produit scalaire vaut 0',
      'leur produit scalaire est négatif',
      'ils ont la même longueur',
      'la somme de leurs coordonnées vaut 0',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est une équivalence, dans les deux sens : produit nul ⟹ ils sont en travers, et réciproquement. Un produit négatif signale seulement un angle plus ouvert que l’angle droit.',
  },
  {
    id: 'psm-d4',
    requires: ['coordonnees-vecteur', 'regle-coordonnees'],
    skill: 'vecteurs',
    points: 2,
    prompt: 'A(−2 ; 1) et B(3 ; −5). Quelles sont les coordonnées du vecteur AB ?',
    options: ['(5 ; −6)', '(1 ; −4)', '(−5 ; 6)', '(6 ; −5)'],
    cols: 4,
    correct: 0,
    explain: 'Arrivée moins départ : 3 − (−2) = 5, puis −5 − 1 = −6. Donc AB = (5 ; −6). L’ordre des lettres compte : BA donnerait (−5 ; 6).',
  },
  {
    id: 'psm-d5',
    requires: ['vocab-norme', 'formule-norme'],
    skill: 'vecteurs',
    points: 2,
    prompt: 'Quelle est la norme ‖u‖ du vecteur u(−3 ; 4) ?',
    options: ['5', '1', '7', '25'],
    cols: 4,
    correct: 0,
    explain: '‖u‖ = √((−3)² + 4²) = √(9 + 16) = √25 = 5. Les coordonnées sont mises au carré : leur signe disparaît. Répondre 25, c’est oublier la racine.',
  },
  {
    id: 'psm-d6',
    requires: ['vocab-vecteur-normal', 'vecteur-normal', 'droite-vecteur-directeur'],
    skill: 'droites',
    points: 2,
    prompt: 'Dans l’équation 2x + 5y − 10 = 0, quel vecteur est normal à la droite ?',
    options: ['(2 ; 5)', '(−5 ; 2)', '(5 ; 2)', '(10 ; 0)'],
    cols: 4,
    correct: 0,
    explain: 'Les deux premiers coefficients, dans l’ordre : n(2 ; 5). Le vecteur (−5 ; 2) est un vecteur DIRECTEUR — il suit la droite au lieu de la traverser.',
  },
  {
    id: 'psm-d7',
    requires: ['regle-colineaire', 'colineaire'],
    skill: 'vecteurs',
    points: 2,
    prompt: 'Les vecteurs u(3 ; 2) et v(6 ; 4) sont-ils colinéaires ?',
    options: [
      'Oui : v = 2u, donc ils ont la même direction',
      'Non : leurs coordonnées sont différentes',
      'Oui, car leur produit scalaire vaut 26',
      'On ne peut pas le savoir sans les dessiner',
    ],
    cols: 1,
    correct: 0,
    explain: 'Chaque coordonnée de v est le double de celle de u : v = 2u. Deux vecteurs colinéaires portent la même direction, l’un étant un multiple de l’autre. C’est ce critère — et lui seul — qui décide si trois points se trouvent sur une même ligne.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Sept questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de déformer des figures et de lire ce qu’un instrument en dit, un tour de tes
            outils : le produit scalaire que tu sais déjà calculer de deux façons, les coordonnées
            d’une flèche, sa longueur, et ce qui fait qu’une flèche suit ou traverse une droite.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
