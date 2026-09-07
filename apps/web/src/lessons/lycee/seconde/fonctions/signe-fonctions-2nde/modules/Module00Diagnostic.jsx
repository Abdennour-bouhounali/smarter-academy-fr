import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_signe_fonctions') : Fonctions, Inégalités,
 * Calcul littéral, Intervalles. On MESURE l'écriture en crochets et le symbole
 * ∈ (acquis d'« Ensembles et intervalles »), que le tableau de signes emploie
 * dès le module 2 — sans jamais enseigner le signe d'une fonction, qui est la
 * matière de la leçon.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` — il mesure, il
 *   n'enseigne pas. Chaque question déclare donc ce qu'elle mesure, et chaque
 *   prérequis déclaré par la leçon est mesuré ici par au moins une question :
 *   sg-d1 la notation f(x), sg-d2 abscisse et ordonnée (la position d'un point
 *   par rapport à l'axe, qui portera tout le module 1), sg-d6 les intervalles.
 */
const SKILLS = { fonctions: { label: 'Fonctions', emoji: 'ƒ' }, inegalites: { label: 'Inégalités', emoji: '⚖️' }, litteral: { label: 'Calcul littéral', emoji: '🔤' }, intervalles: { label: 'Intervalles', emoji: '[ ]' } };
const QUESTIONS = [
  { id: 'sg-d1', requires: ['fonction', 'notation-fx', 'image'], skill: 'fonctions', points: 2, prompt: 'f(x) = x² − 5. Que vaut f(2) ?', options: ['−1', '−3', '9'], cols: 3, correct: 0, explain: '2² − 5 = 4 − 5 = −1.' },
  { id: 'sg-d2', requires: ['abscisse', 'ordonnee'], skill: 'fonctions', points: 2, prompt: 'Sur une courbe, le point d’abscisse 2 a pour ordonnée −1. Ce point est…', options: ['en dessous de l’axe des abscisses', 'au-dessus de l’axe des abscisses', 'sur l’axe des ordonnées'], cols: 1, correct: 0, explain: 'Une ordonnée négative place le point sous l’axe horizontal.' },
  { id: 'sg-d3', requires: [], skill: 'inegalites', points: 2, prompt: 'Résous 2x − 6 > 0.', options: ['x > 3', 'x < 3', 'x > −3'], cols: 3, correct: 0, explain: '2x > 6, donc x > 3.' },
  { id: 'sg-d4', requires: [], skill: 'litteral', points: 2, prompt: 'Le produit (−3) × (−2) est…', options: ['positif : 6', 'négatif : −6', 'nul'], cols: 3, correct: 0, explain: 'Deux facteurs de même signe : produit positif.' },
  { id: 'sg-d5', requires: [], skill: 'litteral', points: 2, prompt: 'Pour quelle valeur de x a-t-on x − 4 = 0 ?', options: ['4', '−4', '0'], cols: 3, correct: 0, explain: 'x − 4 = 0 ⟺ x = 4.' },
  { id: 'sg-d6', skill: 'intervalles', points: 2, requires: ['intervalle', 'intervalle-crochets', 'appartient'], prompt: 'Parmi ces trois nombres, lequel vérifie x ∈ ]1 ; 4[ ?', options: ['2', '1', '4'], cols: 3, correct: 0, explain: '1 < 2 < 4 : 2 est strictement entre les bornes. Les deux crochets sont ouverts, donc 1 et 4 eux-mêmes sont exclus.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de sonder les courbes, un tour de tes outils : une image, la position d’un point, une inéquation, la règle des signes. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
