import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_boites_a_moustaches') : médiane, quartiles,
 * étendue. Un diagnostic MESURE des acquis antérieurs : les `requires` de ces
 * questions ne portent QUE des ids de `priorKnowledge` (lesson.config.js),
 * jamais la matière de la leçon (la boîte, ses zones, l'axe commun).
 */
const SKILLS = {
  position: { label: 'Médiane et quartiles', emoji: '✂️' },
  dispersion: { label: 'Étendue', emoji: '📐' },
  resume: { label: 'Résumer une série', emoji: '📊' },
};
const QUESTIONS = [
  { id: 'bm-d1', skill: 'position', points: 2, requires: ['mediane-stat', 'serie-statistique', 'effectif'], prompt: 'La médiane d’une série partage l’effectif en…', options: ['deux moitiés', 'quatre quarts', 'trois tiers'], cols: 3, correct: 0, explain: 'La médiane coupe l’effectif ordonné en deux parties égales.' },
  { id: 'bm-d2', skill: 'position', points: 2, requires: ['quartile', 'effectif', 'ordre-nombres'], prompt: 'Q1 est un seuil tel qu’au moins… de l’effectif lui est inférieur ou égal', options: ['25 %', '50 %', '75 %'], cols: 3, correct: 0, explain: 'Le premier quartile correspond au quart inférieur.' },
  { id: 'bm-d3', skill: 'position', points: 2, requires: ['mediane-stat', 'serie-statistique', 'ordre-nombres'], prompt: 'Série : 3, 5, 8, 9, 12. Quelle est la médiane ?', options: ['8', '5', '9'], cols: 3, correct: 0, explain: 'n = 5, impair : la 3ᵉ valeur, soit 8.' },
  { id: 'bm-d4', skill: 'dispersion', points: 2, requires: ['etendue', 'dispersion', 'indicateur-stat'], prompt: 'L’étendue d’une série vaut…', options: ['max − min', 'Q3 − Q1', 'la médiane'], cols: 3, correct: 0, explain: 'L’étendue est la différence entre la plus grande et la plus petite valeur.' },
  { id: 'bm-d5', skill: 'dispersion', points: 2, requires: ['quartile', 'etendue', 'dispersion'], prompt: 'Q1 = 12 et Q3 = 25. L’écart interquartile vaut…', options: ['13', '37', '18,5'], cols: 3, correct: 0, explain: 'Q3 − Q1 = 25 − 12 = 13.' },
  { id: 'bm-d6', skill: 'resume', points: 2, requires: ['moyenne', 'serie-statistique', 'indicateur-stat'], prompt: 'Série : 4, 6, 6, 8. Quelle est sa moyenne ?', options: ['6', '7', '5'], cols: 3, correct: 0, explain: '(4 + 6 + 6 + 8) ÷ 4 = 24 ÷ 4 = 6. La moyenne se calcule, la médiane se repère par le rang : ce ne sont pas les mêmes nombres.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Six questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de dessiner des boîtes : une médiane, un quartile, une étendue, une moyenne. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
