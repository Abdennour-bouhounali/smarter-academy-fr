import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_statistiques_une_variable') : moyenne, médiane, lecture d'un tableau d'effectifs. */
const SKILLS = {
  moyenne: { label: 'Moyenne (collège)', emoji: '➗' },
  lecture: { label: 'Lire des données', emoji: '📋' },
};
const QUESTIONS = [
  { id: 'st-d1', skill: 'moyenne', points: 2, prompt: 'Quelle est la moyenne de 4, 8 et 9 ?', options: ['7', '8', '21'], cols: 3, correct: 0, explain: '(4 + 8 + 9) ÷ 3 = 21 ÷ 3 = 7.' },
  { id: 'st-d2', skill: 'moyenne', points: 2, prompt: 'Trois notes : 10, 10 et 16. La moyenne est…', options: ['12', '10', '13'], cols: 3, correct: 0, explain: '36 ÷ 3 = 12.' },
  { id: 'st-d3', skill: 'moyenne', points: 2, prompt: 'La médiane de 3, 5, 9 est…', options: ['5', '9', '5,67'], cols: 3, correct: 0, explain: 'La valeur du milieu une fois la série rangée : 5.' },
  { id: 'st-d4', skill: 'lecture', points: 2, prompt: 'Un tableau indique : valeur 2 → effectif 3 ; valeur 5 → effectif 2. Combien d’individus en tout ?', options: ['5', '7', '10'], cols: 3, correct: 0, explain: '3 + 2 = 5 individus.' },
  { id: 'st-d5', skill: 'lecture', points: 2, prompt: 'Avec ce tableau, la somme de toutes les valeurs vaut…', options: ['16', '7', '10'], cols: 3, correct: 0, explain: '2 × 3 + 5 × 2 = 6 + 10 = 16.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de poser la série : une moyenne, une médiane, et la lecture d’un tableau d’effectifs. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
