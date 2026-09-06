import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — diagnostic (DONNÉES). Prérequis : « Calcul littéral », « Ensembles et intervalles ». */
const SKILLS = { litteral: { label: 'Calcul littéral', emoji: '𝑥' }, intervalles: { label: 'Intervalles et ordre', emoji: '[ ]' } };
const QUESTIONS = [
  { id: 'q1-reduire', skill: 'litteral', requires: ['calcul-litteral', 'developper', 'nombres-relatifs', 'aire', 'perimetre'], points: 2, prompt: <>Réduis <MathText>{'$3x + 5 - x$'}</MathText>.</>, options: ['2x + 5', '8x − x', '7x'], cols: 3, correct: 0, explain: '3x − x = 2x, et le 5 reste seul : 2x + 5.' },
  { id: 'q2-developper', skill: 'litteral', requires: ['calcul-litteral', 'developper', 'nombres-relatifs'], points: 2, prompt: <>Développe <MathText>{'$2(x + 3)$'}</MathText>.</>, options: ['2x + 3', '2x + 6', '2x + 5'], cols: 3, correct: 1, explain: 'Le 2 multiplie CHAQUE terme : 2 × x + 2 × 3 = 2x + 6.' },
  { id: 'q3-tester', skill: 'litteral', requires: ['calcul-litteral', 'developper', 'nombres-relatifs'], points: 2, prompt: <>Combien vaut <MathText>{'$2x + 5$'}</MathText> pour x = 4 ?</>, options: ['13', '29', '11'], cols: 3, correct: 0, explain: '2 × 4 + 5 = 13. (29 colle « 2 » et « 4 » ; 11 oublie de multiplier.)' },
  { id: 'q4-ordre', skill: 'intervalles', requires: ['ordre-nombres', 'intervalle', 'intervalle-crochets', 'ensemble-reels', 'appartient'], points: 2, prompt: 'Laquelle de ces inégalités est vraie ?', options: ['−2 < −5', '−5 < −2', '−2 = −5'], cols: 3, correct: 1, explain: '−5 est plus à gauche sur la droite : −5 < −2.' },
  { id: 'q5-intervalle', skill: 'intervalles', requires: ['ordre-nombres', 'intervalle', 'intervalle-crochets', 'ensemble-reels', 'appartient'], points: 2, prompt: 'Les nombres x tels que x > 3 forment l’intervalle :', options: [']3 ; +∞[', '[3 ; +∞[', ']−∞ ; 3['], cols: 3, correct: 0, explain: 'Strict → 3 exclu ; « plus grand » → vers +∞ : ]3 ; +∞[.' },
];
export default function Module00Diagnostic() {
  return <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min" brief={{ body: <p>Cette leçon s’appuie sur le calcul littéral et les intervalles. Cinq questions, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }} skills={SKILLS} questions={QUESTIONS} />;
}
