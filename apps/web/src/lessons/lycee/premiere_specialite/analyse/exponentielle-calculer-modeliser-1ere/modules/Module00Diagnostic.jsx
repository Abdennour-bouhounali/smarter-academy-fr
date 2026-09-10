import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * ce que la leçon amont a établi de l'exponentielle (sa notation, son signe, ses
 * variations), les règles de calcul sur les PUISSANCES (4e), et la résolution
 * d'une inéquation du premier degré (2de).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur e^(a+b), sur e^(−a), sur
 *   (e^a)^n, sur une équation ou une inéquation à exponentielles, ni sur un
 *   modèle A·e^{kt} — c'est la matière de la leçon.
 *
 *   AUCUN MOT DE LA LEÇON N'Y FIGURE, pas même dans un `explain`. La question
 *   ec-d4 porte sur les puissances d'un nombre QUELCONQUE (2^m × 2^n), jamais
 *   sur une puissance de e : c'est la seule façon de mesurer l'outil sans
 *   révéler l'usage que la leçon va en faire.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     ec-d1  exponentielle-definition, exponentielle, fonction, notation-fx
 *     ec-d2  exp-strictement-positive, quotient, inverse-nombre
 *     ec-d3  exp-strictement-croissante, variations
 *     ec-d4  regles-puissances, puissance, exposant
 *     ec-d5  methode-resoudre-inequation, equation-premier-degre,
 *            ensemble-reels, intervalle, intervalle-crochets
 *     ec-d6  modele, fonction-affine, pourcentage
 */
const SKILLS = {
  connue: { label: 'Ce qu’on sait déjà d’elle', emoji: '🚀' },
  puissances: { label: 'Les puissances', emoji: '🔢' },
  resoudre: { label: 'Résoudre', emoji: '⚖️' },
  situations: { label: 'Lire une situation', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'ec-d1',
    requires: ['exponentielle-definition', 'exponentielle', 'fonction', 'notation-fx'],
    skill: 'connue',
    points: 2,
    prompt: 'La fonction exponentielle est notée exp, et l’on écrit exp(x) = e^x. Que vaut e^0 ?',
    options: ['1', '0', 'e', 'On ne peut pas le savoir'],
    cols: 4,
    correct: 0,
    explain: 'e^0 = exp(0) = 1 : c’est l’une des deux conditions qui définissent cette fonction. La valeur e, elle, est ce que la fonction rend en 1.',
  },
  {
    id: 'ec-d2',
    requires: ['exp-strictement-positive', 'quotient', 'inverse-nombre'],
    skill: 'connue',
    points: 2,
    prompt: 'On calcule le quotient de e^5 par e^2. Que peut-on affirmer du résultat, sans le calculer ?',
    options: [
      'Il est strictement positif : ces deux nombres le sont, et l’inverse d’un nombre positif l’est aussi',
      'Il peut être négatif, selon les valeurs',
      'Il vaut 0, car les deux nombres se compensent',
      'Il n’existe pas : on ne peut pas diviser ces nombres-là',
    ],
    cols: 1,
    correct: 0,
    explain: 'Cette fonction ne prend que des valeurs strictement positives — jamais nulles, jamais négatives. Diviser un nombre strictement positif par un autre donne encore un nombre strictement positif, et l’opération est toujours possible puisque le diviseur n’est jamais nul.',
  },
  {
    id: 'ec-d3',
    requires: ['exp-strictement-croissante', 'variations'],
    skill: 'connue',
    points: 2,
    prompt: 'La fonction exponentielle est strictement croissante sur ℝ. Que peut-on en déduire pour deux nombres u et v tels que u < v ?',
    options: [
      'e^u < e^v : l’ordre est conservé',
      'e^u > e^v : l’ordre est renversé',
      'e^u = e^v : la fonction gomme la différence',
      'Rien : cela dépend du signe de u et de v',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une fonction strictement croissante range les nombres dans le même ordre : le plus petit donne la plus petite valeur. Le signe de u et de v n’intervient pas — la propriété vaut sur ℝ tout entier.',
  },
  {
    id: 'ec-d4',
    requires: ['regles-puissances', 'puissance', 'exposant'],
    skill: 'puissances',
    points: 2,
    prompt: 'Combien vaut 2⁵ × 2³ ?',
    options: ['2⁸', '2¹⁵', '4⁸', '2⁵'],
    cols: 4,
    correct: 0,
    explain: 'Multiplier deux puissances de même base revient à ajouter les exposants : 5 + 3 = 8, donc 2⁵ × 2³ = 2⁸. On n’additionne pas les bases, et l’on ne multiplie pas les exposants entre eux.',
  },
  {
    id: 'ec-d5',
    requires: ['methode-resoudre-inequation', 'equation-premier-degre', 'ensemble-reels', 'intervalle', 'intervalle-crochets'],
    skill: 'resoudre',
    points: 2,
    prompt: 'Résous l’inéquation 2x + 1 < x + 4 dans ℝ. Quel est l’ensemble des solutions ?',
    options: [']−∞ ; 3[', ']3 ; +∞[', ']−∞ ; 5[', ']−∞ ; 3]'],
    cols: 4,
    correct: 0,
    explain: 'On regroupe : 2x − x < 4 − 1, soit x < 3. L’ensemble des solutions est donc ]−∞ ; 3[, avec un crochet ouvert en 3 puisque l’inégalité est stricte.',
  },
  {
    id: 'ec-d6',
    requires: ['modele', 'fonction-affine', 'pourcentage'],
    skill: 'situations',
    points: 2,
    prompt: 'Une population augmente de 10 % chaque année. Un modèle affine — qui ajoute le même nombre chaque année — décrit-il correctement cette évolution ?',
    options: [
      'Non : 10 % d’une population qui grandit représente chaque année un nombre plus grand',
      'Oui : un pourcentage fixe correspond toujours à un ajout fixe',
      'Oui, mais seulement les trois premières années',
      'On ne peut pas le savoir sans connaître la population de départ',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un modèle affine ajoute le même NOMBRE à chaque pas. Ici on multiplie par le même FACTEUR : 10 % de 1 000 font 100, mais 10 % de 2 000 font 200. L’ajout grandit avec la population, ce qu’un modèle affine ne sait pas faire.',
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
            Avant d’apprendre à CALCULER avec cette fonction, un tour de tes outils : ce que la
            leçon précédente en a établi, les règles de calcul sur les puissances, la résolution
            d’une inéquation, et la lecture d’une évolution.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
