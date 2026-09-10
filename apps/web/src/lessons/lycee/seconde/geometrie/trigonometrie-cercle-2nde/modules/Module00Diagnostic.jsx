import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis déclarés : trigonométrie du triangle rectangle (3e), repérage dans
 * le plan, proportionnalité. On teste donc lire un couple de coordonnées,
 * reconnaître un rapport de longueurs dans un triangle rectangle, et une
 * quatrième proportionnelle — jamais le cercle ni le radian, que la leçon
 * enseigne. Ces questions ne bloquent rien et ne produisent aucune preuve.
 */
const SKILLS = {
  repere: { label: 'Repérage', emoji: '🗺️' },
  triangle: { label: 'Triangle rectangle', emoji: '📐' },
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'tc-d1-coord',
    skill: 'repere',
    points: 2,
    requires: ['abscisse', 'ordonnee', 'coordonnees', 'origine-repere'],
    prompt: 'Un point est à 3 graduations à gauche de l’origine et 1 en dessous. Quelles sont ses coordonnées ?',
    options: ['(−3 ; −1)', '(−1 ; −3)', '(3 ; 1)'],
    cols: 3,
    correct: 0,
    explain: 'À gauche : abscisse négative (−3). En dessous : ordonnée négative (−1). D’où (−3 ; −1).',
  },
  {
    id: 'tc-d2-rapport3e',
    skill: 'triangle',
    points: 2,
    requires: ['triangle-rectangle', 'hypotenuse', 'angle-droit'],
    prompt: 'Dans un triangle rectangle, la première touche trigonométrique de la calculatrice (celle qui suit CAH) donne quel rapport ?',
    options: [
      'côté adjacent ÷ hypoténuse',
      'côté opposé ÷ hypoténuse',
      'côté opposé ÷ côté adjacent',
    ],
    cols: 1,
    correct: 0,
    explain: 'CAH : Adjacent ÷ Hypoténuse. Les deux autres touches donnent Opposé ÷ Hypoténuse, et le rapport des deux côtés de l’angle droit.',
  },
  {
    id: 'tc-d3-hypotenuse',
    skill: 'triangle',
    points: 2,
    requires: ['hypotenuse', 'triangle-rectangle'],
    prompt: 'Dans un triangle rectangle, l’hypoténuse est…',
    options: [
      'le côté opposé à l’angle droit, le plus long',
      'le côté le plus court',
      'n’importe lequel des trois côtés',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’hypoténuse fait face à l’angle droit et c’est toujours le plus long des trois côtés.',
  },
  {
    id: 'tc-d4-borne',
    skill: 'triangle',
    points: 2,
    requires: ['triangle-rectangle', 'hypotenuse'],
    prompt: 'Dans un triangle rectangle, le rapport (côté adjacent ÷ hypoténuse) peut-il valoir 1,4 ?',
    options: [
      'Non : un côté est toujours plus court que l’hypoténuse, le rapport reste inférieur à 1',
      'Oui, si le triangle est très aplati',
      'Oui, cela dépend de l’unité choisie',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le côté adjacent est plus court que l’hypoténuse, donc le rapport est strictement inférieur à 1. Cette borne va rester vraie sur le cercle, pour une autre raison.',
  },
  {
    id: 'tc-d5-proportion',
    skill: 'proportion',
    points: 2,
    requires: ['proportionnalite'],
    prompt: 'Si 180 correspond à π, à quoi correspond 90 ?',
    options: ['π/2', '2π', 'π/4'],
    cols: 3,
    correct: 0,
    explain: 'La correspondance est proportionnelle : la moitié de 180 correspond à la moitié de π, soit π/2.',
  },
  {
    id: 'tc-d6-perimetre',
    skill: 'proportion',
    points: 2,
    requires: ['proportionnalite'],
    prompt: 'Quel est le périmètre d’un cercle de rayon 1 ?',
    options: ['2π', 'π', 'π/2'],
    cols: 3,
    correct: 0,
    explain: 'Périmètre = 2 × π × rayon = 2π pour un rayon de 1. Ce nombre va mesurer le tour complet.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleNumber={0}
      moduleTitle="Mission de départ"
      moduleSubtitle="Ce que le triangle rectangle t’a déjà appris"
      estimatedTime="5 min"
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
