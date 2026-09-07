import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_frequences_conditionnelles') : proportions, lecture d'un tableau croisé. */
const SKILLS = {
  proportions: { label: 'Proportions', emoji: '％' },
  tableau: { label: 'Tableau croisé', emoji: '🗂️' },
};
const QUESTIONS = [
  { id: 'fc-d1', skill: 'proportions', points: 2, requires: ['quotient', 'pourcentage', 'effectif'], prompt: '30 personnes sur 120. Quelle proportion ?', options: ['25 %', '30 %', '4 %'], cols: 3, correct: 0, explain: '30 ÷ 120 = 0,25 = 25 %.' },
  { id: 'fc-d2', skill: 'proportions', points: 2, requires: ['quotient', 'numerateur', 'denominateur'], prompt: 'Une proportion est un quotient de la forme…', options: ['partie ÷ tout', 'tout ÷ partie', 'partie × tout'], cols: 3, correct: 0, explain: 'On divise la partie par le tout de référence.' },
  { id: 'fc-d3', skill: 'proportions', points: 2, requires: ['pourcentage', 'proportionnalite'], prompt: '40 % de 200, c’est…', options: ['80', '40', '500'], cols: 3, correct: 0, explain: '0,40 × 200 = 80.' },
  { id: 'fc-d4', skill: 'tableau', points: 2, requires: ['tableau-double-entree', 'effectif'], prompt: 'Dans un tableau croisé, le total d’une colonne s’appelle…', options: ['un effectif marginal', 'un effectif conjoint', 'le total général'], cols: 1, correct: 0, explain: 'Les totaux de lignes et de colonnes sont les effectifs marginaux.' },
  { id: 'fc-d5', skill: 'tableau', points: 2, requires: ['tableau-double-entree', 'effectif'], prompt: 'Une case d’un tableau croisé donne l’effectif des individus qui vérifient…', options: ['les deux caractères', 'au moins un des deux', 'aucun des deux'], cols: 1, correct: 0, explain: 'Une case croise les deux caractères : c’est un ET.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de diviser : une proportion, un effectif marginal, une case de tableau. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
