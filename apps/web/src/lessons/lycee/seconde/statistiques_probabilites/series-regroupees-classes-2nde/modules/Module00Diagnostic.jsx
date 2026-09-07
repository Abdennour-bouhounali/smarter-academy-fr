import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_series_regroupees_classes') : effectifs,
 * fréquences, moyenne pondérée, indicateurs d'une série discrète, notation
 * d'intervalle.
 *
 * Un diagnostic MESURE : chaque `requires` ne nomme que des ids du
 * `priorKnowledge` de la leçon, jamais la matière enseignée ici (classes,
 * amplitude, histogramme, cumuls, estimation).
 */
const SKILLS = {
  effectifs: { label: 'Effectifs et fréquences', emoji: '📋' },
  ponderee: { label: 'Moyenne pondérée', emoji: '⚖️' },
  indicateurs: { label: 'Indicateurs et intervalles', emoji: '📐' },
};
const QUESTIONS = [
  { id: 'sr-d1', skill: 'effectifs', points: 2, requires: ['frequence', 'effectif', 'quotient'], prompt: 'Sur 50 personnes, 20 ont répondu « oui ». Quelle fréquence ?', options: ['0,4', '0,2', '2,5'], cols: 3, correct: 0, explain: '20 ÷ 50 = 0,4, soit 40 %.' },
  { id: 'sr-d2', skill: 'effectifs', points: 2, requires: ['effectif', 'serie-statistique'], prompt: 'Trois classes ont pour effectifs 12, 25 et 13. Effectif total ?', options: ['50', '3', '25'], cols: 3, correct: 0, explain: '12 + 25 + 13 = 50.' },
  { id: 'sr-d3', skill: 'effectifs', points: 2, requires: ['frequence', 'serie-statistique', 'effectif'], prompt: 'La somme de toutes les fréquences d’une série vaut toujours…', options: ['1', '100', 'l’effectif total'], cols: 3, correct: 0, explain: 'Les fréquences somment à 1, soit 100 %.' },
  { id: 'sr-d4', skill: 'ponderee', points: 2, requires: ['moyenne-ponderee', 'moyenne', 'effectif'], prompt: '2 valeurs de 10 et 3 valeurs de 20. Moyenne ?', options: ['16', '15', '30'], cols: 3, correct: 0, explain: '(2×10 + 3×20) ÷ 5 = 80 ÷ 5 = 16.' },
  { id: 'sr-d5', skill: 'indicateurs', points: 2, requires: ['intervalle', 'intervalle-crochets'], prompt: 'Le centre de l’intervalle [20 ; 30[ est…', options: ['25', '10', '50'], cols: 3, correct: 0, explain: '(20 + 30) ÷ 2 = 25 ; 10 est son amplitude.' },
  // Les indicateurs d'une série discrète viennent de « Statistiques à une
  // variable » : la leçon les emploie dès le module 1 pour dire qu'ils
  // deviendront ESTIMÉS. Elle doit donc savoir s'ils sont là.
  { id: 'sr-d6', skill: 'indicateurs', points: 2, requires: ['indicateur-stat', 'moyenne', 'mediane-stat', 'etendue'], prompt: 'Sur la série 3 ; 5 ; 8 ; 9 ; 20, que valent la médiane et l’étendue ?', options: ['médiane 8 et étendue 17', 'médiane 9 et étendue 20', 'médiane 8 et étendue 20'], cols: 3, correct: 0, explain: 'La valeur du milieu des cinq est 8 ; l’étendue vaut 20 − 3 = 17. Moyenne, médiane et étendue sont les indicateurs de cette série.' },
  { id: 'sr-d7', skill: 'indicateurs', points: 2, requires: ['arrondi', 'quotient'], prompt: 'Arrondi au dixième, 40 + (2 ÷ 64) × 10 vaut…', options: ['40,3', '40,4', '40,0'], cols: 3, correct: 0, explain: '(2 ÷ 64) × 10 ≈ 0,31, donc 40,31 → 40,3 au dixième.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Sept questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de regrouper : une fréquence, un effectif total, une moyenne pondérée, les indicateurs d’une série et le centre d’un intervalle. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
