import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — nombres relatifs, fractions,
 * pourcentages, tableaux — et jamais la matière de la leçon : ni coefficient,
 * ni produit en croix, ni agrandissement. Aucune métadonnée `assessment`.
 */

const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '➖' },
  fractions: { label: 'Fractions', emoji: '🍕' },
  pourcentages: { label: 'Pourcentages', emoji: '％' },
  tableaux: { label: 'Tableaux', emoji: '📋' },
};

const QUESTIONS = [
  { id: 'pr-d1', skill: 'fractions', requires: ['quotient'], points: 2, prompt: 'Que vaut 3/4 de 20 ?', options: ['15', '5', '12', '24'], cols: 2, correct: 0, explain: '20 ÷ 4 = 5, puis 5 × 3 = 15.' },
  { id: 'pr-d2', skill: 'pourcentages', requires: ['pourcentage'], points: 2, prompt: 'Combien font 10 % de 250 ?', options: ['25', '2,5', '10', '240'], cols: 2, correct: 0, explain: '10 % de 250 = 250 ÷ 10 = 25.' },
  { id: 'pr-d3', skill: 'relatifs', requires: ['quotient'], points: 2, prompt: 'Que vaut 1 − 0,25 ?', options: ['0,75', '0,25', '1,25', '0,85'], cols: 2, correct: 0, explain: '1 − 0,25 = 0,75.' },
  { id: 'pr-d4', skill: 'tableaux', requires: ['tableau-de-valeurs', 'quotient'], points: 2, prompt: 'Dans un tableau, la ligne « masse » indique 2 puis 6, la ligne « prix » indique 5 puis ?. Si le prix est proportionnel à la masse, que vaut ? ', options: ['15', '9', '10', '7,5'], cols: 2, correct: 0, explain: 'De 2 à 6, on multiplie par 3 ; donc 5 × 3 = 15.' },
  { id: 'pr-d5', skill: 'fractions', requires: ['quotient'], points: 2, prompt: 'Que vaut 7,5 ÷ 3 ?', options: ['2,5', '2,25', '3,5', '22,5'], cols: 2, correct: 0, explain: '3 × 2,5 = 7,5, donc 7,5 ÷ 3 = 2,5.' },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cinq questions rapides sur ce qui sert ici : une fraction d’un nombre, un pourcentage simple,
            une soustraction à 1, la lecture d’un tableau, une division décimale. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
