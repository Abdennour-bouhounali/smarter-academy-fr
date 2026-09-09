import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * la notation f(x) et la valeur en un nombre, la courbe de la fonction carré,
 * ce qu'est une solution d'une équation, la règle du produit nul et le
 * développement.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur le discriminant, sur les
 *   valeurs qui annulent une expression du second degré, ni sur la
 *   factorisation d'une telle expression — c'est la matière de la leçon.
 *
 *   VOCABULAIRE INTERDIT ICI, y compris dans les `explain` : « discriminant »,
 *   « racine », « trinôme », « parabole », « second degré ». Ce sont les mots
 *   que la leçon POSE ; les employer avant leur brique reviendrait à supposer
 *   ce qu'on va enseigner. Les questions parlent donc de « la courbe de la
 *   fonction carré », de « l'expression », de « solutions d'une équation ».
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     sd-d1  vocab-notation-fx, image-antecedent
 *     sd-d2  courbe-representative, fonction-carre
 *     sd-d3  equation-solution, methode-verifier-solution
 *     sd-d2  coordonnees (le point le plus bas est donné par ses coordonnées)
 *     sd-d4  produit-nul, vocab-facteur, facteur
 *     sd-d5  developper
 *     sd-d6  racine-carree (√Δ suppose la racine carrée acquise)
 */
const SKILLS = {
  fonctions: { label: 'Fonctions', emoji: 'ƒ' },
  courbes: { label: 'Courbes', emoji: '📈' },
  equations: { label: 'Équations', emoji: '⚖️' },
  produit: { label: 'Produit nul', emoji: '✖️' },
  calcul: { label: 'Calcul littéral', emoji: '🧮' },
  racines: { label: 'Racines carrées', emoji: '√' },
};

const QUESTIONS = [
  {
    id: 'sd-d1',
    requires: ['vocab-notation-fx', 'image-antecedent'],
    skill: 'fonctions',
    points: 2,
    prompt: 'On pose f(x) = x² − 4x + 3. Que vaut f(0) ?',
    options: ['3', '0', '−4'],
    cols: 3,
    correct: 0,
    explain: 'On remplace x par 0 : 0 − 0 + 3 = 3. Les deux premiers termes contiennent x, ils s’effacent ; il reste le nombre seul.',
  },
  {
    id: 'sd-d2',
    requires: ['courbe-representative', 'fonction-carre', 'coordonnees'],
    skill: 'courbes',
    points: 2,
    prompt: 'La courbe de la fonction carré (x ↦ x²) a la forme d’…',
    options: [
      'une courbe en U dont le point le plus bas est le point de coordonnées (0 ; 0)',
      'une droite qui monte',
      'deux branches séparées qui ne se touchent jamais',
    ],
    cols: 1,
    correct: 0,
    explain: 'x² est toujours positif ou nul, et vaut la même chose en x et en −x : les deux branches de la courbe se répondent de part et d’autre de l’axe des ordonnées, et le point le plus bas est (0 ; 0).',
  },
  {
    id: 'sd-d3',
    requires: ['equation-solution', 'methode-verifier-solution'],
    skill: 'equations',
    points: 2,
    prompt: 'Le nombre 3 est-il solution de l’équation x² − 4x + 3 = 0 ?',
    options: ['Oui : 9 − 12 + 3 = 0', 'Non : 9 − 12 + 3 = 4', 'On ne peut pas le savoir sans calculatrice'],
    cols: 1,
    correct: 0,
    explain: 'On remplace x par 3 : 3² − 4 × 3 + 3 = 9 − 12 + 3 = 0. L’égalité est vraie, donc 3 est bien solution. Vérifier une solution, c’est toujours remplacer et calculer.',
  },
  {
    id: 'sd-d4',
    requires: ['produit-nul', 'vocab-facteur', 'facteur'],
    skill: 'produit',
    points: 2,
    prompt: 'Un produit de deux facteurs est nul. Que peut-on en dire ?',
    options: [
      'Au moins un des deux facteurs du produit est nul',
      'Il faut que les deux soient nuls en même temps',
      'C’est leur somme qui est nulle',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la règle du produit nul : si A × B = 0, alors A = 0 ou B = 0. Il suffit qu’un seul des facteurs du produit s’annule. C’est elle qui transforme un produit égal à zéro en deux équations plus simples.',
  },
  {
    id: 'sd-d5',
    requires: ['developper'],
    skill: 'calcul',
    points: 2,
    prompt: 'Développe (x − 1)(x − 3).',
    options: ['x² − 4x + 3', 'x² − 3x − 1', 'x² + 4x + 3', 'x² − 4x − 3'],
    cols: 2,
    correct: 0,
    explain: 'x × x = x², puis x × (−3) = −3x, puis (−1) × x = −x, enfin (−1) × (−3) = +3. On rassemble : x² − 4x + 3. Le produit de deux nombres négatifs est positif.',
  },
  {
    id: 'sd-d6',
    requires: ['racine-carree'],
    skill: 'racines',
    points: 2,
    prompt: 'Combien vaut la racine carrée de 25 ?',
    options: ['5', '12,5', '625', '25'],
    cols: 4,
    correct: 0,
    explain: 'La racine carrée de 25 est le nombre positif dont le carré vaut 25 : 5 × 5 = 25, donc √25 = 5. Ce n’est ni la moitié de 25, ni son carré.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de faire glisser une courbe et de compter ses points de rencontre avec un axe,
            un tour de tes outils : la notation f(x), la courbe de la fonction carré, les
            solutions d’une équation, le produit nul, le développement et les racines carrées.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
