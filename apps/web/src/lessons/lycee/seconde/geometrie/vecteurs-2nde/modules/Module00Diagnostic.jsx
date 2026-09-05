import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé 'seconde_vecteurs') : « Repérage
 * dans le plan », « Translations », « Coordonnées » — et Pythagore, dont la
 * norme aura besoin. On teste donc lire un couple, calculer avec des
 * relatifs, l'image d'un point par une translation du collège et une
 * hypoténuse — jamais les vecteurs de Seconde eux-mêmes.
 */
const SKILLS = {
  repere: { label: 'Repérage', emoji: '🗺️' },
  calcul: { label: 'Relatifs', emoji: '🔢' },
  translation: { label: 'Translations', emoji: '↗️' },
  pythagore: { label: 'Pythagore', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'vec-d1-lire',
    skill: 'repere',
    points: 2,
    prompt: 'Un point est à 2 graduations à gauche de l’origine et 5 au-dessus. Quelles sont ses coordonnées ?',
    options: ['(−2 ; 5)', '(5 ; −2)', '(2 ; −5)'],
    cols: 3,
    correct: 0,
    explain: 'À gauche : abscisse négative (−2). Au-dessus : ordonnée positive (5). D’où (−2 ; 5).',
  },
  {
    id: 'vec-d2-ordre',
    skill: 'repere',
    points: 2,
    prompt: 'Les points (3 ; −1) et (−1 ; 3) sont-ils le même point ?',
    options: ['Non : le premier nombre est l’abscisse, le second l’ordonnée', 'Oui : ce sont les mêmes nombres', 'Oui, s’ils sont sur la même diagonale'],
    cols: 1,
    correct: 0,
    explain: 'L’ordre compte : (3 ; −1) est à droite et en dessous, (−1 ; 3) à gauche et au-dessus.',
  },
  {
    id: 'vec-d3-relatifs',
    skill: 'calcul',
    points: 2,
    prompt: 'Combien font 2 − (−5) ?',
    options: ['7', '−3', '3'],
    cols: 3,
    correct: 0,
    explain: 'Soustraire −5 revient à ajouter 5 : 2 + 5 = 7.',
  },
  {
    id: 'vec-d4-translation',
    skill: 'translation',
    points: 2,
    prompt: 'Une translation déplace chaque point de 3 vers la droite et de 2 vers le bas. Quelle est l’image du point (1 ; 4) ?',
    options: ['(4 ; 2)', '(−2 ; 6)', '(4 ; 6)'],
    cols: 3,
    correct: 0,
    explain: 'On ajoute 3 à l’abscisse (1 + 3 = 4) et on retire 2 à l’ordonnée (4 − 2 = 2) : l’image est (4 ; 2).',
  },
  {
    id: 'vec-d5-pythagore',
    skill: 'pythagore',
    points: 2,
    prompt: 'Un triangle rectangle a des côtés de l’angle droit de 3 et 4. Combien mesure l’hypoténuse ?',
    options: ['5', '7', '√7'],
    cols: 3,
    correct: 0,
    explain: 'Pythagore : 3² + 4² = 9 + 16 = 25, et √25 = 5. Ajouter les côtés (7) n’est pas une longueur d’hypoténuse.',
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
            Avant de mettre le robot en route, un tour de tes outils : lire des coordonnées,
            calculer avec des relatifs, translater un point, retrouver une hypoténuse.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
