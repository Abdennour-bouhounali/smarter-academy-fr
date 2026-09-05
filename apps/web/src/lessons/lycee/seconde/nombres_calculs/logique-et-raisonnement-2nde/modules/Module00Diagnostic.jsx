import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — diagnostic (DONNÉES). Prérequis : « Ensembles », « Calcul littéral ». */
const SKILLS = { ensembles: { label: 'Ensembles', emoji: '∈' }, litteral: { label: 'Calcul littéral', emoji: '𝑥' } };
const QUESTIONS = [
  { id: 'q1-appartient', skill: 'ensembles', points: 2, prompt: <>Laquelle de ces affirmations est vraie ?</>, options: ['−3 ∈ ℕ', '−3 ∈ ℤ', '−3 ∉ ℝ'], cols: 3, correct: 1, explain: '−3 est un entier relatif : −3 ∈ ℤ. Il n’est pas dans ℕ (entiers positifs), mais il est bien réel.' },
  { id: 'q2-inter', skill: 'ensembles', points: 2, prompt: 'A = {1 ; 2 ; 3} et B = {3 ; 4}. Que vaut A ∩ B ?', options: ['{3}', '{1 ; 2 ; 3 ; 4}', '∅'], cols: 3, correct: 0, explain: 'L’intersection ne garde que les éléments communs : 3.' },
  { id: 'q3-valeur', skill: 'litteral', points: 2, prompt: <>Combien vaut <MathText>{'$n^{2} + 1$'}</MathText> pour n = 4 ?</>, options: ['17', '9', '81'], cols: 3, correct: 0, explain: '4² + 1 = 16 + 1 = 17. (9 serait 2 × 4 + 1.)' },
  { id: 'q4-carre', skill: 'litteral', points: 2, prompt: 'Quel nombre a pour carré 9 ?', options: ['3 seulement', '3 et −3', '4,5'], cols: 3, correct: 1, explain: '3² = 9 et (−3)² = 9 : deux nombres. Cet oubli du négatif reviendra dans la leçon.' },
  { id: 'q5-premier', skill: 'litteral', points: 2, prompt: 'Un nombre premier est un entier qui :', options: ['n’a que deux diviseurs : 1 et lui-même', 'est impair', 'est plus grand que 100'], cols: 1, correct: 0, explain: '2 est premier (et pair) ; 9 est impair mais pas premier (9 = 3 × 3).' },
];
export default function Module00Diagnostic() {
  return <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min" brief={{ body: <p>Cette leçon s’appuie sur les ensembles et le calcul littéral. Cinq questions, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }} skills={SKILLS} questions={QUESTIONS} />;
}
