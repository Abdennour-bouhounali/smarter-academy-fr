import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — diagnostic (DONNÉES). Prérequis : « Arithmétique » (entiers, multiples) et le calcul littéral du collège. */
const SKILLS = { litteral: { label: 'Calcul littéral du collège', emoji: '𝑥' }, entiers: { label: 'Nombres entiers', emoji: '🔢' } };
const QUESTIONS = [
  { id: 'q1-reduire', skill: 'litteral', points: 2, requires: ['calcul-litteral', 'termes-semblables', 'reduire-expression', 'terme-algebrique'], prompt: <>Réduis <MathText>{'$3x + 2x$'}</MathText>.</>, options: ['5x', '5x²', '6x'], cols: 3, correct: 0, explain: '3x + 2x = 5x : deux termes semblables s’additionnent. 5x² multiplierait, 6x aussi.' },
  { id: 'q2-distribuer', skill: 'litteral', points: 2, requires: ['calcul-litteral', 'distributivite', 'developper', 'facteur'], prompt: <>Développe <MathText>{'$4(x - 3)$'}</MathText>.</>, options: ['4x − 3', '4x − 12', '4x + 12'], cols: 3, correct: 1, explain: 'Le 4 multiplie CHAQUE terme : 4x − 12.' },
  { id: 'q3-valeur', skill: 'litteral', points: 2, requires: ['calcul-litteral', 'carre-nombre'], prompt: <>Combien vaut <MathText>{'$x^{2} - 1$'}</MathText> pour x = 3 ?</>, options: ['8', '5', '9'], cols: 3, correct: 0, explain: '3² − 1 = 9 − 1 = 8. (5 serait 2 × 3 − 1.)' },
  { id: 'q4-pair', skill: 'entiers', points: 2, requires: ['calcul-litteral'], prompt: 'Un entier pair s’écrit toujours :', options: ['2k, avec k entier', '2k + 1, avec k entier', 'k², avec k entier'], cols: 1, correct: 0, explain: 'Pair = multiple de 2 = 2 × (un entier). 2k + 1 est impair.' },
  { id: 'q5-carre', skill: 'entiers', points: 2, requires: ['carre-nombre'], prompt: 'Combien vaut 15² ?', options: ['225', '30', '125'], cols: 3, correct: 0, explain: '15 × 15 = 225. Le carré n’est pas le double.' },
];
export default function Module00Diagnostic() {
  return <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min" brief={{ body: <p>Cette leçon s’appuie sur le calcul littéral du collège et les entiers. Cinq questions, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }} skills={SKILLS} questions={QUESTIONS} />;
}
