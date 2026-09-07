import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_probabilites_conditionnelles') : probabilité, proportion, tableau croisé. */
const SKILLS = {
  probabilite: { label: 'Probabilité', emoji: '🎲' },
  proportion: { label: 'Proportion', emoji: '％' },
};
const QUESTIONS = [
  { id: 'pc-d1', skill: 'probabilite', points: 2, prompt: 'Dans une urne de 20 boules dont 5 rouges, on tire une boule au hasard. Probabilité d’obtenir une rouge ?', options: ['1/4', '1/5', '5'], cols: 3, correct: 0, explain: '5 ÷ 20 = 1/4. Toutes les boules ont la même chance d’être tirées.' },
  { id: 'pc-d2', skill: 'probabilite', points: 2, prompt: 'Dans une situation d’équiprobabilité, une probabilité se calcule…', options: ['cas favorables ÷ cas possibles', 'cas possibles ÷ cas favorables', 'cas favorables × cas possibles'], cols: 1, correct: 0, explain: 'C’est le quotient du nombre de cas favorables par le nombre total de cas possibles.' },
  { id: 'pc-d3', skill: 'proportion', points: 2, prompt: '150 élèves sur 200. Quelle proportion ?', options: ['75 %', '50 %', '150 %'], cols: 3, correct: 0, explain: '150 ÷ 200 = 0,75 = 75 %.' },
  { id: 'pc-d4', skill: 'proportion', points: 2, prompt: 'Dans un tableau croisé, une case donne l’effectif des individus qui vérifient…', options: ['les deux caractères à la fois', 'au moins un des deux', 'aucun des deux'], cols: 1, correct: 0, explain: 'Une case croise les deux caractères : c’est une intersection, un ET.' },
  { id: 'pc-d5', skill: 'proportion', points: 2, prompt: '« Parmi les 200 internes, 150 sont en club. » Le dénominateur de cette proportion est…', options: ['200', '150', 'l’effectif total du lycée'], cols: 3, correct: 0, explain: 'Le mot « parmi » désigne la population de référence : les 200 internes.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions avant de restreindre l’univers" estimatedTime="4 min"
      brief={{ body: <p>Avant de conditionner : une probabilité, une proportion, une case de tableau. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
