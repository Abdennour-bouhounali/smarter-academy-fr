import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_evolutions_successives_reciproques') : coefficients multiplicateurs, taux d'évolution. */
const SKILLS = {
  coefficient: { label: 'Coefficient multiplicateur', emoji: '✖️' },
  taux: { label: 'Taux d’évolution', emoji: '📈' },
};
const QUESTIONS = [
  { id: 'ev-d1', skill: 'coefficient', points: 2, prompt: 'Une hausse de 20 % correspond à une multiplication par…', options: ['1,2', '0,2', '20'], cols: 3, correct: 0, explain: 'k = 1 + 0,20 = 1,20.' },
  { id: 'ev-d2', skill: 'coefficient', points: 2, prompt: 'Une baisse de 20 % correspond à une multiplication par…', options: ['0,8', '0,2', '−0,2'], cols: 3, correct: 0, explain: 'k = 1 − 0,20 = 0,80 : il reste 80 %.' },
  { id: 'ev-d3', skill: 'coefficient', points: 2, prompt: 'Multiplier par 1,05, c’est…', options: ['augmenter de 5 %', 'augmenter de 105 %', 'augmenter de 1,05 %'], cols: 3, correct: 0, explain: 't = k − 1 = 0,05, soit +5 %.' },
  { id: 'ev-d4', skill: 'taux', points: 2, prompt: 'Un prix passe de 50 € à 60 €. Quel est le taux d’évolution ?', options: ['+20 %', '+10 %', '+16,7 %'], cols: 3, correct: 0, explain: '(60 − 50)/50 = 10/50 = 0,20, soit +20 %.' },
  { id: 'ev-d5', skill: 'taux', points: 2, prompt: '80 € augmente de 25 %. Nouveau prix ?', options: ['100 €', '105 €', '85 €'], cols: 3, correct: 0, explain: '80 × 1,25 = 100 €.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant d’enchaîner les évolutions : un coefficient à trouver, un taux à lire, une évolution à appliquer. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
