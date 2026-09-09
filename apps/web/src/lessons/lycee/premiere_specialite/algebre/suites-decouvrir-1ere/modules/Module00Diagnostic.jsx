import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * la notation f(x) et la notion d'image, la lecture d'un tableau de valeurs, le
 * développement et la réduction d'une expression littérale, et le coefficient
 * multiplicateur d'un pourcentage.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas.
 *
 *   AUCUN MOT DE LA LEÇON N'APPARAÎT ICI, explications comprises : ni
 *   « suite », ni « raison », ni « arithmétique », ni « géométrique », ni
 *   « récurrence », ni « terme général », ni « rang ». Les employer
 *   reviendrait à évaluer avant d'enseigner, et à voler au module 1 l'effet de
 *   sa découverte. On parle donc de « listes de nombres », de « valeurs » et de
 *   « ce que l'on ajoute », qui sont du vocabulaire courant.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     sd-d1  vocab-notation-fx, image-antecedent
 *     sd-d2  tableau-valeurs, fonction-dependance
 *     sd-d3  expression-litterale
 *     sd-d4  methode-reduire
 *     sd-d5  coefficient-multiplicateur, mem-k-1-plus-t
 */
const SKILLS = {
  fonctions: { label: 'Notation et images', emoji: 'ƒ' },
  tableaux: { label: 'Tableaux de valeurs', emoji: '📋' },
  litteral: { label: 'Calcul littéral', emoji: '✏️' },
  pourcentages: { label: 'Pourcentages', emoji: '％' },
};

const QUESTIONS = [
  {
    id: 'sd-d1',
    requires: ['vocab-notation-fx', 'image-antecedent'],
    skill: 'fonctions',
    points: 2,
    prompt: 'On pose f(x) = 3x + 1. Que vaut f(4) ?',
    options: ['13', '12', '7'],
    cols: 3,
    correct: 0,
    explain: 'On remplace x par 4 : 3 × 4 + 1 = 12 + 1 = 13. C’est l’image de 4 par f.',
  },
  {
    id: 'sd-d2',
    requires: ['tableau-valeurs', 'fonction-dependance'],
    skill: 'tableaux',
    points: 2,
    prompt:
      'Un tableau donne les valeurs de g : g(0) = 5, g(1) = 8, g(2) = 11. Que peut-on affirmer ?',
    options: [
      'À chaque valeur de la première ligne correspond une valeur de la seconde, et une seule',
      'Le tableau donne aussi la valeur de g entre 0 et 1',
      'On ne peut rien lire dans un tableau sans la courbe',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Un tableau de valeurs est exact sur ses colonnes et muet entre elles : il donne une valeur, et une seule, pour chaque entrée qu’il liste.',
  },
  {
    id: 'sd-d3',
    requires: ['expression-litterale'],
    skill: 'litteral',
    points: 2,
    prompt: 'On pose A = 5x − 2. Que vaut A quand on remplace x par x + 1 ?',
    options: ['5(x + 1) − 2', '5x − 2 + 1', '5x + 1 − 2'],
    cols: 1,
    correct: 0,
    explain:
      'Remplacer x par x + 1 se fait PARTOUT où x apparaît, et la parenthèse retient le tout : 5(x + 1) − 2.',
  },
  {
    id: 'sd-d4',
    requires: ['methode-reduire', 'developper', 'vocab-terme-coefficient'],
    skill: 'litteral',
    points: 2,
    prompt: 'Développe et réduis : [5(x + 1) − 2] − [5x − 2].',
    options: ['5', '10x', '0', '5x'],
    cols: 4,
    correct: 0,
    explain:
      '5(x + 1) − 2 = 5x + 5 − 2. On retranche 5x − 2 : 5x + 5 − 2 − 5x + 2 = 5. Le 5x et le −5x s’annulent, et il ne reste qu’un nombre.',
  },
  {
    id: 'sd-d5',
    requires: ['coefficient-multiplicateur', 'mem-k-1-plus-t'],
    skill: 'pourcentages',
    points: 2,
    prompt: 'Un prix de 400 € augmente de 5 %. Il devient…',
    options: ['420 € (on multiplie par 1,05)', '405 € (on ajoute 5)', '480 € (on multiplie par 1,2)'],
    cols: 1,
    correct: 0,
    explain:
      'Une hausse de 5 % se traduit par une multiplication par 1 + 0,05 = 1,05 : 400 × 1,05 = 420. Ajouter 5 serait ajouter 5 €, pas 5 %.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de faire tourner deux usines à nombres, un tour de tes outils : la notation f(x),
            la lecture d’un tableau de valeurs, le calcul avec une lettre et le pourcentage qui se
            transforme en multiplication. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
