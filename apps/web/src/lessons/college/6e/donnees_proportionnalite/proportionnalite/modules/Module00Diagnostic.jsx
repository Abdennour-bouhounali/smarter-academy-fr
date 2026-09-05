import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, 6e_proportionnalite) : « Nombres
 * entiers », « Multiplication et division », « Tableaux ». On teste donc les
 * tables, la division exacte, le double/moitié et la lecture d'un tableau —
 * jamais la proportionnalité elle-même.
 */
const SKILLS = {
  calcul: { label: 'Multiplier et diviser', emoji: '✖️' },
  tableau: { label: 'Lire un tableau', emoji: '📋' },
};

const QUESTIONS = [
  {
    id: 'q1-table',
    skill: 'calcul',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">7 × 4</strong> ?</>,
    options: ['24', '28', '32'],
    cols: 3,
    correct: 1,
    explain: '7 × 4 = 28.',
  },
  {
    id: 'q2-division',
    skill: 'calcul',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">36 ÷ 3</strong> ?</>,
    options: ['9', '12', '18'],
    cols: 3,
    correct: 1,
    explain: '36 ÷ 3 = 12, car 3 × 12 = 36.',
  },
  {
    id: 'q3-double',
    skill: 'calcul',
    points: 2,
    prompt: <>Quel est le <strong>double</strong> de 15 ?</>,
    options: ['7,5', '30', '17'],
    cols: 3,
    correct: 1,
    explain: 'Le double de 15, c’est 15 × 2 = 30. (7,5 en est la moitié.)',
  },
  {
    id: 'q4-moitie',
    skill: 'calcul',
    points: 2,
    prompt: <>Quelle est la <strong>moitié</strong> de 18 ?</>,
    options: ['9', '36', '6'],
    cols: 3,
    correct: 0,
    explain: 'La moitié de 18, c’est 18 ÷ 2 = 9.',
  },
  {
    id: 'q5-tableau',
    skill: 'tableau',
    points: 2,
    prompt: (
      <>
        Un tableau indique « 3 cahiers → 6 € ». Combien coûte <strong>1 cahier</strong> si tous ont le même
        prix ?
      </>
    ),
    options: ['1 €', '2 €', '3 €'],
    cols: 3,
    correct: 1,
    explain: '6 € pour 3 cahiers : chacun coûte 6 ÷ 3 = 2 €.',
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
            Cette leçon repose sur la multiplication et la division. Vérifions ces réflexes, plus la lecture
            d'un petit tableau. Ce n'est pas un examen — tu continueras vers le Module 1 quel que soit ton
            score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
