import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (PRÉREQUIS uniquement).
 *
 * Prérequis officiels (coursesData.js, 3e_multiples_diviseurs) : « Nombres
 * entiers », « Multiplication », « Division ». On teste donc l'ordre et la
 * valeur des entiers, une table de multiplication, un ordre de grandeur d'un
 * produit, et deux lectures d'une division euclidienne (le quotient et le
 * reste) — jamais les multiples, les diviseurs ni les nombres premiers, qui
 * sont l'objet de la leçon.
 */
const SKILLS = {
  entiers: { label: 'Nombres entiers', emoji: '🔢' },
  calcul: { label: 'Multiplier et diviser', emoji: '✖️' },
};

const QUESTIONS = [
  {
    id: 'q1-ordre',
    skill: 'entiers',
    points: 2,
    prompt: <>Parmi ces trois nombres, lequel est le plus <strong>grand</strong> : 408, 84, 480 ?</>,
    options: ['408', '84', '480'],
    cols: 3,
    correct: 2,
    explain: '480 a 4 centaines et 8 dizaines ; 408 a 4 centaines et 0 dizaine. Donc 480 > 408 > 84.',
  },
  {
    id: 'q2-table',
    skill: 'calcul',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">7 × 8</strong> ?</>,
    options: ['54', '56', '63'],
    cols: 3,
    correct: 1,
    explain: '7 × 8 = 56. (63 = 7 × 9, et 54 = 6 × 9.)',
  },
  {
    id: 'q3-produit',
    skill: 'calcul',
    points: 2,
    prompt: <>Quel est le résultat de <strong className="font-mono">12 × 5</strong> ?</>,
    options: ['17', '60', '55'],
    cols: 3,
    correct: 1,
    explain: '12 × 5 = 60. (17, c’est 12 + 5 : une addition, pas une multiplication.)',
  },
  {
    id: 'q4-euclide',
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        On écrit <strong className="font-mono">47 = 5 × 9 + 2</strong>. Que vaut le{' '}
        <strong>reste</strong> de la division de 47 par 5 ?
      </>
    ),
    options: ['9', '5', '2'],
    cols: 3,
    correct: 2,
    explain: 'Le reste est ce qui dépasse après avoir formé les paquets : ici 2. Le quotient, lui, vaut 9.',
  },
  {
    id: 'q5-reste-nul',
    skill: 'calcul',
    points: 2,
    prompt: <>Quel est le reste de la division de <strong className="font-mono">36 par 4</strong> ?</>,
    options: ['0', '4', '9'],
    cols: 3,
    correct: 0,
    explain: '36 = 4 × 9 + 0 : la division tombe juste, le reste est nul. (9 est le quotient.)',
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
            Cette leçon repose sur la multiplication et surtout sur la division avec reste.
            Vérifions ces réflexes. Ce n’est pas un examen — tu continueras vers le Module 1 quel
            que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
