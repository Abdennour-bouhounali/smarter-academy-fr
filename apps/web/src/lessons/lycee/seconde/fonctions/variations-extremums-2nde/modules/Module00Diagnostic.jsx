import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_variations_et_extremums') : Fonctions,
 * Lecture graphique, Inégalités, Intervalles. Les deux dernières questions
 * MESURENT l'appartenance à un intervalle et l'inclusion d'un intervalle dans
 * un autre — acquis d'« Ensembles et intervalles », employés par les tableaux
 * de variations dès le module 2. On n'y teste aucune variation.
 */
const SKILLS = { fonctions: { label: 'Fonctions', emoji: 'ƒ' }, lecture: { label: 'Lecture graphique', emoji: '📈' }, inegalites: { label: 'Inégalités', emoji: '⚖️' }, intervalles: { label: 'Intervalles', emoji: '[ ]' } };
const QUESTIONS = [
  { id: 'va-d1', skill: 'fonctions', points: 2, prompt: 'f(x) = x² + 1. Que vaut f(3) ?', options: ['10', '7', '16'], cols: 3, correct: 0, explain: '3² + 1 = 10.' },
  { id: 'va-d2', skill: 'lecture', points: 2, prompt: 'Sur une courbe, le point d’abscisse 2 est à la hauteur 5. Alors…', options: ['f(2) = 5', 'f(5) = 2', 'f(2) = 2'], cols: 3, correct: 0, explain: 'Abscisse 2, ordonnée 5 : l’image de 2 est 5.' },
  { id: 'va-d3', skill: 'lecture', points: 2, prompt: 'Une courbe passe par (1 ; 4) et (3 ; 4). Combien d’antécédents 4 a-t-il au moins ?', options: ['2', '1', '4'], cols: 3, correct: 0, explain: '1 et 3 ont tous deux pour image 4.' },
  { id: 'va-d4', skill: 'inegalites', points: 2, prompt: 'Lequel est vrai ?', options: ['2,45 < 2,5', '2,5 < 2,45', '2,45 = 2,5'], cols: 3, correct: 0, explain: '2,45 < 2,50.' },
  { id: 'va-d5', skill: 'inegalites', points: 2, prompt: 'Si a < b, alors a + 3 … b + 3.', options: ['<', '>', 'on ne peut pas savoir'], cols: 3, correct: 0, explain: 'Ajouter le même nombre conserve l’ordre.' },
  { id: 'va-d6', skill: 'intervalles', points: 2, requires: ['intervalle', 'intervalle-crochets', 'appartient'], prompt: 'Laquelle de ces trois affirmations est vraie ?', options: ['0 ∈ [−2 ; 2]', '2 ∈ [−2 ; 2[', '−3 ∈ [−2 ; 2]'], cols: 1, correct: 0, explain: '−2 ≤ 0 ≤ 2 : oui. En revanche 2 est exclu de [−2 ; 2[ (crochet ouvert), et −3 est en dehors.' },
  { id: 'va-d7', skill: 'intervalles', points: 2, requires: ['intervalle', 'inclus'], prompt: 'Quel intervalle est inclus dans [−2 ; 2] ?', options: ['[−1 ; 1]', '[−3 ; −1]', '[0 ; 5]'], cols: 3, correct: 0, explain: 'Tous les nombres de [−1 ; 1] sont entre −2 et 2 : [−1 ; 1] ⊂ [−2 ; 2]. Les deux autres débordent d’un côté.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de partir sur le sentier, un tour de tes outils : une image, une lecture de courbe, une comparaison. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
