import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_statistiques_une_variable') : moyenne, médiane, lecture d'un tableau d'effectifs. */
const SKILLS = {
  moyenne: { label: 'Moyenne (collège)', emoji: '➗' },
  lecture: { label: 'Lire des données', emoji: '📋' },
  resumer: { label: 'Résumer une série', emoji: '📊' },
};
// Chaque question MESURE un prérequis déclaré dans `priorKnowledge` — jamais la
// matière de la leçon (quartiles, écart interquartile, écart type, robustesse).
const QUESTIONS = [
  { id: 'st-d1', skill: 'moyenne', points: 2, requires: ['moyenne', 'quotient'], prompt: 'Quelle est la moyenne de 4, 8 et 9 ?', options: ['7', '8', '21'], cols: 3, correct: 0, explain: '(4 + 8 + 9) ÷ 3 = 21 ÷ 3 = 7.' },
  { id: 'st-d2', skill: 'moyenne', points: 2, requires: ['moyenne', 'arrondi'], prompt: 'Trois notes : 10, 10 et 17. La moyenne, arrondie au dixième, vaut…', options: ['12,3', '12', '13'], cols: 3, correct: 0, explain: '37 ÷ 3 = 12,333… ; arrondi au dixième : 12,3.' },
  { id: 'st-d3', skill: 'moyenne', points: 2, requires: ['mediane-stat', 'ordre-nombres'], prompt: 'La médiane de 9, 3 et 5 est…', options: ['5', '9', '5,67'], cols: 3, correct: 0, explain: 'On range d’abord du plus petit au plus grand — 3, 5, 9 — puis on prend la valeur du milieu : 5.' },
  { id: 'st-d4', skill: 'lecture', points: 2, requires: ['effectif', 'serie-statistique'], prompt: 'Un tableau indique : valeur 2 → effectif 3 ; valeur 5 → effectif 2. Combien d’individus en tout ?', options: ['5', '7', '10'], cols: 3, correct: 0, explain: '3 + 2 = 5 individus.' },
  { id: 'st-d5', skill: 'lecture', points: 2, requires: ['moyenne-ponderee', 'effectif'], prompt: 'Avec ce tableau, la somme de toutes les valeurs vaut…', options: ['16', '7', '10'], cols: 3, correct: 0, explain: 'Chaque valeur compte autant de fois qu’il y a d’individus : 2 × 3 + 5 × 2 = 6 + 10 = 16.' },
  { id: 'st-d6', skill: 'lecture', points: 2, requires: ['frequence', 'effectif'], prompt: 'Toujours ce tableau : quelle est la fréquence de la valeur 2 ?', options: ['0,6', '3', '0,4'], cols: 3, correct: 0, explain: '3 individus sur 5 : 3 ÷ 5 = 0,6, soit 60 %.' },
  { id: 'st-d7', skill: 'resumer', points: 2, requires: ['indicateur-stat', 'etendue', 'dispersion'], prompt: 'Série : 4, 7, 7, 7, 12. Parmi ces indicateurs, lequel mesure la dispersion (l’étalement) et non la position ?', options: ['L’étendue : 12 − 4 = 8', 'La médiane : 7', 'La moyenne : 7,4'], cols: 1, correct: 0, explain: 'La médiane et la moyenne disent OÙ se situe la série ; l’étendue, écart entre la plus grande et la plus petite valeur, dit sur quelle largeur elle s’étale. (La médiane de cette série vaut bien 7 : c’est la valeur du milieu.)' },
  { id: 'st-d8', skill: 'resumer', points: 2, requires: ['racine-carree'], prompt: 'Combien vaut √49 ?', options: ['7', '24,5', '2401'], cols: 3, correct: 0, explain: '7 × 7 = 49, donc √49 = 7.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Huit questions pour savoir par où commencer" estimatedTime="5 min"
      brief={{ body: <p>Avant de poser la série : une moyenne, une médiane, la lecture d’un tableau d’effectifs, et les indicateurs que tu connais déjà du collège. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
