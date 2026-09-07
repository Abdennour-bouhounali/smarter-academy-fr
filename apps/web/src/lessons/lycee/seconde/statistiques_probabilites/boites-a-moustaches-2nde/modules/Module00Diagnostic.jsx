import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_boites_a_moustaches') : médiane, quartiles, étendue. */
const SKILLS = {
  position: { label: 'Médiane et quartiles', emoji: '✂️' },
  dispersion: { label: 'Étendue', emoji: '📐' },
};
const QUESTIONS = [
  { id: 'bm-d1', skill: 'position', points: 2, prompt: 'La médiane d’une série partage l’effectif en…', options: ['deux moitiés', 'quatre quarts', 'trois tiers'], cols: 3, correct: 0, explain: 'La médiane coupe l’effectif ordonné en deux parties égales.' },
  { id: 'bm-d2', skill: 'position', points: 2, prompt: 'Q1 est un seuil tel qu’au moins… de l’effectif lui est inférieur ou égal', options: ['25 %', '50 %', '75 %'], cols: 3, correct: 0, explain: 'Le premier quartile correspond au quart inférieur.' },
  { id: 'bm-d3', skill: 'position', points: 2, prompt: 'Série : 3, 5, 8, 9, 12. Quelle est la médiane ?', options: ['8', '5', '9'], cols: 3, correct: 0, explain: 'n = 5, impair : la 3ᵉ valeur, soit 8.' },
  { id: 'bm-d4', skill: 'dispersion', points: 2, prompt: 'L’étendue d’une série vaut…', options: ['max − min', 'Q3 − Q1', 'la médiane'], cols: 3, correct: 0, explain: 'L’étendue est la différence entre la plus grande et la plus petite valeur.' },
  { id: 'bm-d5', skill: 'dispersion', points: 2, prompt: 'Q1 = 12 et Q3 = 25. L’écart interquartile vaut…', options: ['13', '37', '18,5'], cols: 3, correct: 0, explain: 'Q3 − Q1 = 25 − 12 = 13.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de dessiner des boîtes : une médiane, un quartile, une étendue. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
