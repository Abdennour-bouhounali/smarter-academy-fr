import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_puissances') : « Calcul
 * numérique », « Multiplication », « Fractions ». On teste donc l'ordre des
 * opérations, une multiplication répétée écrite en toutes lettres, la
 * multiplication par 10 et 100, et la lecture d'une fraction unitaire —
 * jamais les puissances elles-mêmes, qui sont le contenu de la leçon.
 */
const SKILLS = {
  calcul: { label: 'Calcul numérique', emoji: '🧮' },
  multiplication: { label: 'Multiplication', emoji: '✖️' },
  fractions: { label: 'Fractions', emoji: '½' },
};

const QUESTIONS = [
  {
    id: 'q1-ordre',
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        Que vaut <MathText>{'$3 + 2 \\times 5$'}</MathText> ?
      </>
    ),
    options: ['13', '25', '10'],
    cols: 3,
    correct: 0,
    explain: 'La multiplication passe avant l’addition : 2 × 5 = 10, puis 3 + 10 = 13. (25, ce serait (3 + 2) × 5.)',
  },
  {
    id: 'q2-repetee',
    skill: 'multiplication',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$2 \\times 2 \\times 2$'}</MathText> ?
      </>
    ),
    options: ['6', '8', '4'],
    cols: 3,
    correct: 1,
    explain: '2 × 2 = 4, puis 4 × 2 = 8. (6, ce serait 2 + 2 + 2 : une addition, pas une multiplication.)',
  },
  {
    id: 'q3-par-cent',
    skill: 'multiplication',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$4{,}5 \\times 100$'}</MathText> ?
      </>
    ),
    options: ['450', '45', '4 500'],
    cols: 3,
    correct: 0,
    explain: 'Multiplier par 100 décale la virgule de deux rangs vers la droite : 4,5 → 45 → 450.',
  },
  {
    id: 'q4-division-dix',
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$7 \\div 10$'}</MathText> ?
      </>
    ),
    options: ['70', '0,7', '0,07'],
    cols: 3,
    correct: 1,
    explain: 'Diviser par 10 décale la virgule d’un rang vers la gauche : 7 devient 0,7.',
  },
  {
    id: 'q5-fraction',
    skill: 'fractions',
    points: 2,
    prompt: (
      <>
        Quelle est l’écriture décimale de <MathText>{'$\\dfrac{1}{100}$'}</MathText> ?
      </>
    ),
    options: ['0,01', '0,1', '100'],
    cols: 3,
    correct: 0,
    explain: 'Un centième s’écrit 0,01 : deux chiffres après la virgule. (0,1 est un dixième.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon repose sur le calcul numérique, la multiplication et les fractions. Vérifions ces
            réflexes. Ce n'est pas un examen — tu continueras vers le Module 1 quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
