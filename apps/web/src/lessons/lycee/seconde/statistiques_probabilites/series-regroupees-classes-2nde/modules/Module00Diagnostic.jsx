import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_series_regroupees_classes') : effectifs, fréquences, moyenne pondérée. */
const SKILLS = {
  effectifs: { label: 'Effectifs et fréquences', emoji: '📋' },
  ponderee: { label: 'Moyenne pondérée', emoji: '⚖️' },
};
const QUESTIONS = [
  { id: 'sr-d1', skill: 'effectifs', points: 2, prompt: 'Sur 50 personnes, 20 ont répondu « oui ». Quelle fréquence ?', options: ['0,4', '0,2', '2,5'], cols: 3, correct: 0, explain: '20 ÷ 50 = 0,4, soit 40 %.' },
  { id: 'sr-d2', skill: 'effectifs', points: 2, prompt: 'Trois classes ont pour effectifs 12, 25 et 13. Effectif total ?', options: ['50', '3', '25'], cols: 3, correct: 0, explain: '12 + 25 + 13 = 50.' },
  { id: 'sr-d3', skill: 'effectifs', points: 2, prompt: 'La somme de toutes les fréquences d’une série vaut toujours…', options: ['1', '100', 'l’effectif total'], cols: 3, correct: 0, explain: 'Les fréquences somment à 1, soit 100 %.' },
  { id: 'sr-d4', skill: 'ponderee', points: 2, prompt: '2 valeurs de 10 et 3 valeurs de 20. Moyenne ?', options: ['16', '15', '30'], cols: 3, correct: 0, explain: '(2×10 + 3×20) ÷ 5 = 80 ÷ 5 = 16.' },
  { id: 'sr-d5', skill: 'ponderee', points: 2, prompt: 'Le centre de l’intervalle [20 ; 30[ est…', options: ['25', '10', '50'], cols: 3, correct: 0, explain: '(20 + 30) ÷ 2 = 25 ; 10 est son amplitude.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de regrouper : une fréquence, un effectif total, une moyenne pondérée et le centre d’un intervalle. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
