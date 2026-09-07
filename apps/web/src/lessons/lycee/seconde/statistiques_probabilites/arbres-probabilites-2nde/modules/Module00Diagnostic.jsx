import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_arbres_de_probabilites') : conditionnelles, fractions. */
const SKILLS = {
  conditionnelle: { label: 'Conditionnelle', emoji: '🎯' },
  fractions: { label: 'Fractions', emoji: '➗' },
};
const QUESTIONS = [
  { id: 'ar-d1', skill: 'conditionnelle', points: 2, requires: ['probabilite', 'issue-evenement'], prompt: 'P_A(B) se lit…', options: ['probabilité de B sachant A', 'probabilité de A sachant B', 'probabilité de A et B'], cols: 1, correct: 0, explain: 'L’événement en indice est la condition : on lit « B sachant A ».' },
  { id: 'ar-d2', skill: 'conditionnelle', points: 2, requires: ['probabilite', 'issue-evenement', 'equiprobable', 'quotient', 'frequence'], prompt: 'Dans un sac de 8 billes dont 2 rouges, on tire une bille. Probabilité qu’elle soit rouge ?', options: ['1/4', '1/8', '2'], cols: 3, correct: 0, explain: '2 ÷ 8 = 1/4 = 0,25.' },
  { id: 'ar-d3', skill: 'fractions', points: 2, requires: ['quotient'], prompt: 'Combien vaut 0,6 × 0,5 ?', options: ['0,3', '1,1', '0,11'], cols: 3, correct: 0, explain: '0,6 × 0,5 = 0,30. Multiplier par 0,5, c’est prendre la moitié.' },
  { id: 'ar-d4', skill: 'fractions', points: 2, requires: ['quotient'], prompt: 'Combien vaut 0,12 + 0,07 ?', options: ['0,19', '0,84', '1,9'], cols: 3, correct: 0, explain: '0,12 + 0,07 = 0,19.' },
  { id: 'ar-d5', skill: 'conditionnelle', points: 2, requires: ['experience-aleatoire', 'issue-evenement', 'probabilite'], prompt: 'Deux issues d’une même expérience se partagent toutes les possibilités. Leurs probabilités…', options: ['ont pour somme 1', 'sont égales', 'ont pour somme 0'], cols: 1, correct: 0, explain: 'Elles se répartissent la totalité des cas : leur somme vaut 1.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions avant de brancher l’arbre" estimatedTime="4 min"
      brief={{ body: <p>Avant de construire : une conditionnelle, un produit, une somme. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
