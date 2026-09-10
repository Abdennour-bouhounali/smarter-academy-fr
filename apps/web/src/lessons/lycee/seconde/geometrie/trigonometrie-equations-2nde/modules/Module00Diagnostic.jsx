import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis : la partie 1 du chapitre (cercle, radian, coordonnées, valeurs
 * remarquables) et Pythagore. On ne teste RIEN de ce que cette leçon enseigne —
 * ni l'identité, ni les formules d'addition, ni les équations.
 */
const SKILLS = {
  cercle: { label: 'Le cercle', emoji: '🔵' },
  coord: { label: 'Coordonnées', emoji: '🎯' },
  pythagore: { label: 'Pythagore', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'te-d1-coord',
    skill: 'coord',
    points: 2,
    requires: ['cos-sin-coordonnees', 'abscisse', 'ordonnee'],
    prompt: 'Le point du cercle associé au réel t a pour abscisse…',
    options: ['La première coordonnée, lue sur l’axe horizontal', 'La longueur d’arc t elle-même', 'Le rayon du cercle'],
    cols: 1,
    correct: 0,
    explain: 'L’abscisse se lit toujours sur l’axe horizontal — c’est la première des deux coordonnées du point. Acquis depuis la partie 1 du chapitre.',
  },
  {
    id: 'te-d2-borne',
    skill: 'cercle',
    points: 2,
    requires: ['cercle-trigonometrique'],
    prompt: 'Entre quelles valeurs l’abscisse d’un point du cercle est-elle toujours comprise ?',
    options: ['Entre −1 et 1', 'Entre 0 et 1', 'Entre −π et π'],
    cols: 3,
    correct: 0,
    explain: 'Le point reste sur un cercle de rayon 1 : son abscisse ne peut pas sortir de [−1 ; 1].',
  },
  {
    id: 'te-d3-remarquable',
    skill: 'coord',
    points: 2,
    requires: ['valeurs-remarquables'],
    prompt: 'Quelle est l’abscisse du point associé à π/3 ?',
    options: ['1/2', '√3/2', '√2/2'],
    cols: 3,
    correct: 0,
    explain: 'π/3 est le plus grand des trois angles remarquables du premier quart : son abscisse est donc la plus petite, 1/2.',
  },
  {
    id: 'te-d4-pythagore',
    skill: 'pythagore',
    points: 2,
    requires: ['triangle-rectangle', 'hypotenuse'],
    prompt: 'Dans un triangle rectangle de côtés 3 et 4, combien mesure l’hypoténuse ?',
    options: ['5', '7', '25'],
    cols: 3,
    correct: 0,
    explain: '3² + 4² = 9 + 16 = 25, et l’hypoténuse est la racine carrée de 25, soit 5.',
  },
  {
    id: 'te-d5-pythagore-general',
    skill: 'pythagore',
    points: 2,
    requires: ['triangle-rectangle', 'hypotenuse'],
    prompt: 'Dans un triangle rectangle d’hypoténuse 1, que vaut la somme des carrés des deux autres côtés ?',
    options: ['1', '2', 'Cela dépend du triangle'],
    cols: 3,
    correct: 0,
    explain: 'Pythagore : la somme des carrés des deux côtés de l’angle droit égale le carré de l’hypoténuse, soit 1² = 1. Cette égalité va servir de fil rouge à toute la leçon.',
  },
  {
    id: 'te-d6-equation',
    skill: 'cercle',
    points: 2,
    requires: ['equation-solution'],
    prompt: 'Résoudre une équation, c’est…',
    options: [
      'Trouver toutes les valeurs qui rendent l’égalité vraie',
      'Trouver une valeur qui convient',
      'Simplifier l’expression',
    ],
    cols: 1,
    correct: 0,
    explain: 'TOUTES les solutions, pas une seule — c’est exactement ce qui va compter ici, où il y en aura souvent deux.',
  },
  {
    id: 'te-d7-radian',
    skill: 'cercle',
    points: 2,
    requires: ['radian', 'cercle-trigonometrique'],
    prompt: 'Un demi-tour du cercle correspond à quelle mesure en radians ?',
    options: ['π', '2π', '180'],
    cols: 3,
    correct: 0,
    explain: 'Le tour complet mesure 2π (le périmètre d’un cercle de rayon 1), donc le demi-tour mesure π. 180 est la mesure du même angle en DEGRÉS. Acquis en partie 1.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleNumber={0}
      moduleTitle="Mission de départ"
      moduleSubtitle="Ce que le cercle t’a déjà appris"
      estimatedTime="5 min"
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
