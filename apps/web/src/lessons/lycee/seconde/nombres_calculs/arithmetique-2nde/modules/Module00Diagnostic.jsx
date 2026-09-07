import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — diagnostic (DONNÉES). Prérequis : « Nombres entiers », « Calcul numérique ». */
const SKILLS = { entiers: { label: 'Nombres entiers', emoji: '🔢' }, calcul: { label: 'Calcul numérique', emoji: '✖️' } };
const QUESTIONS = [
  { id: 'q1-table', skill: 'calcul', points: 2, requires: ['tables-multiplication'], prompt: 'Combien font 7 × 8 ?', options: ['54', '56', '48'], cols: 3, correct: 1, explain: '7 × 8 = 56.' },
  { id: 'q2-division', skill: 'calcul', points: 2, requires: ['quotient'], prompt: 'Dans la division de 47 par 5, quel est le reste ?', options: ['2', '9', '7'], cols: 3, correct: 0, explain: '47 = 5 × 9 + 2 : le quotient est 9, le reste 2 (toujours plus petit que 5).' },
  { id: 'q3-multiple', skill: 'entiers', points: 2, requires: ['tables-multiplication'], prompt: '36 est-il un multiple de 4 ?', options: ['Oui : 36 = 4 × 9', 'Non', 'Seulement si on arrondit'], cols: 1, correct: 0, explain: '36 = 4 × 9 exactement : 36 est un multiple de 4, et 4 un diviseur de 36.' },
  { id: 'q4-pair', skill: 'entiers', points: 2, requires: ['tables-multiplication'], prompt: 'Lequel de ces nombres est impair ?', options: ['128', '250', '341'], cols: 3, correct: 2, explain: 'Un nombre est pair quand son dernier chiffre est 0, 2, 4, 6 ou 8. 341 finit par 1 : impair.' },
  { id: 'q5-priorite', skill: 'calcul', points: 2, requires: ['tables-multiplication'], prompt: 'Combien font 2 × 5 + 3 × 4 ?', options: ['22', '52', '26'], cols: 3, correct: 0, explain: 'Les multiplications d’abord : 10 + 12 = 22.' },
];
export default function Module00Diagnostic() {
  return <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min" brief={{ body: <p>Cette leçon s’appuie sur les entiers et le calcul numérique. Cinq questions, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }} skills={SKILLS} questions={QUESTIONS} />;
}
