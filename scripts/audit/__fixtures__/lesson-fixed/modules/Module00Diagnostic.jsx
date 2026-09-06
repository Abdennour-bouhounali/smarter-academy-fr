import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../apps/web/src/lessons/common/kit';

const QUESTIONS = [
  {
    id: 'fx-d1',
    skill: 'repere',
    points: 2,
    prompt: 'Quelle est l’abscisse du point (3 ; 5) ?',
    options: ['3', '5'],
    correct: 0,
    requires: ['abscisse'],
    explain: 'L’abscisse vient en premier.',
  },
];

export default function Module00Diagnostic() {
  return <PrerequisiteDiagnostic questions={QUESTIONS} />;
}
