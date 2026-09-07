import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_tests_diagnostiques') : conditionnelles, lecture d'un tableau. */
const SKILLS = {
  conditionnelle: { label: 'Conditionnelle', emoji: '🎯' },
  tableau: { label: 'Tableau', emoji: '🗂️' },
};
const QUESTIONS = [
  { id: 'td-d1', skill: 'conditionnelle', points: 2, prompt: 'P_A(B) se lit…', options: ['probabilité de B sachant A', 'probabilité de A sachant B', 'probabilité de A et B'], cols: 1, correct: 0, explain: 'L’événement en indice est la condition.' },
  { id: 'td-d2', skill: 'conditionnelle', points: 2, prompt: 'P_A(B) et P_B(A) sont…', options: ['en général différentes', 'toujours égales', 'toujours de somme 1'], cols: 1, correct: 0, explain: 'Échanger la condition et l’événement change l’univers de calcul, donc la valeur.' },
  { id: 'td-d3', skill: 'tableau', points: 2, prompt: 'Sur 594 personnes, 99 sont dans un certain cas. Quelle proportion ?', options: ['environ 17 %', 'environ 99 %', 'environ 6 %'], cols: 3, correct: 0, explain: '99 ÷ 594 ≈ 0,167, soit environ 17 %.' },
  { id: 'td-d4', skill: 'tableau', points: 2, prompt: '5 % de 9 900 personnes, cela fait…', options: ['495', '50', '1 980'], cols: 3, correct: 0, explain: '0,05 × 9 900 = 495.' },
  { id: 'td-d5', skill: 'conditionnelle', points: 2, prompt: 'Une petite proportion d’un très grand groupe peut-elle dépasser une grande proportion d’un petit groupe ?', options: ['Oui, tout dépend des effectifs', 'Non, jamais', 'Seulement si les groupes sont égaux'], cols: 1, correct: 0, explain: '5 % de 9 900 (495) dépasse largement 99 % de 100 (99). C’est toute la leçon qui vient.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions avant de tester 10 000 personnes" estimatedTime="4 min"
      brief={{ body: <p>Avant de diagnostiquer : une conditionnelle, un pourcentage, un ordre de grandeur. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
