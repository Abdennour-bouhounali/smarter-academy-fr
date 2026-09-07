import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_tableaux_croises') : effectifs, tableau à double entrée. */
const SKILLS = {
  effectifs: { label: 'Effectifs', emoji: '🔢' },
  tableau: { label: 'Tableau à double entrée', emoji: '🗂️' },
};
const QUESTIONS = [
  { id: 'tc-d1', skill: 'effectifs', points: 2, requires: ['effectif'], prompt: 'Dans un groupe, 12 filles et 18 garçons. Effectif total ?', options: ['30', '12', '6'], cols: 3, correct: 0, explain: '12 + 18 = 30 personnes.' },
  { id: 'tc-d2', skill: 'effectifs', points: 2, requires: ['effectif'], prompt: 'Sur 30 personnes, 12 sont des filles. Combien ne sont pas des filles ?', options: ['18', '12', '30'], cols: 3, correct: 0, explain: '30 − 12 = 18 : c’est le complémentaire.' },
  { id: 'tc-d3', skill: 'tableau', points: 2, requires: ['tableau-double-entree', 'effectif'], prompt: 'Dans un tableau à double entrée, une case située à l’intersection d’une ligne et d’une colonne contient…', options: ['les individus qui vérifient les DEUX caractères', 'tous les individus de la ligne', 'le total général'], cols: 1, correct: 0, explain: 'Une case croise les deux caractères : ligne ET colonne.' },
  { id: 'tc-d4', skill: 'tableau', points: 2, requires: ['tableau-double-entree', 'effectif'], prompt: 'Une ligne d’un tableau contient 4, 7 et 5. Son total vaut…', options: ['16', '12', '5'], cols: 3, correct: 0, explain: '4 + 7 + 5 = 16.' },
  { id: 'tc-d5', skill: 'tableau', points: 2, requires: ['serie-statistique'], prompt: 'Un caractère « couleur des yeux » est…', options: ['qualitatif', 'quantitatif', 'une moyenne'], cols: 3, correct: 0, explain: 'Ses valeurs sont des mots (bleu, vert…), pas des nombres : le caractère est qualitatif.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de croiser deux caractères : un effectif, un complémentaire, une case de tableau. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
