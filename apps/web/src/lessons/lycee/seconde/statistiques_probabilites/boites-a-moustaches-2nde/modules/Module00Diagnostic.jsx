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
  // Cette question demandait la définition de Q1 — or AUCUNE leçon de collège
  // ne l'enseigne (le programme de 3e l'inclut, statistiques-3e s'en exclut) :
  // on diagnostiquait comme acquis ce que personne n'avait posé. Elle porte
  // désormais sur la MÉDIANE, vrai prérequis de 3e, et la définition du
  // quartile est établie au module 1 par la brique `quartile-rang`.
  { id: 'bm-d2', skill: 'position', points: 2, requires: ['mediane-stat', 'effectif', 'ordre-nombres'], prompt: 'La médiane est un seuil tel qu’au moins… de l’effectif lui est inférieur ou égal', options: ['50 %', '25 %', '75 %'], cols: 3, correct: 0, explain: 'La médiane partage la série ordonnée en deux moitiés : au moins la moitié des valeurs lui sont inférieures ou égales.' },
  { id: 'bm-d3', skill: 'position', points: 2, requires: ['mediane-stat', 'serie-statistique', 'ordre-nombres'], prompt: 'Série : 3, 5, 8, 9, 12. Quelle est la médiane ?', options: ['8', '5', '9'], cols: 3, correct: 0, explain: 'n = 5, impair : la 3ᵉ valeur, soit 8.' },
  { id: 'bm-d4', skill: 'dispersion', points: 2, requires: ['etendue', 'dispersion', 'indicateur-stat'], prompt: 'L’étendue d’une série vaut…', options: ['max − min', 'Q3 − Q1', 'la médiane'], cols: 3, correct: 0, explain: 'L’étendue est la différence entre la plus grande et la plus petite valeur.' },
  // Le calcul Q3 − Q1 ne demande PAS de savoir ce qu'est un quartile : c'est
  // une soustraction sur deux nombres donnés. On retire donc `quartile` du
  // requires — la notion n'est pas exigée ici, seulement les deux valeurs.
  { id: 'bm-d5', skill: 'dispersion', points: 2, requires: ['etendue', 'dispersion'], prompt: 'Q1 = 12 et Q3 = 25. L’écart interquartile vaut…', options: ['13', '37', '18,5'], cols: 3, correct: 0, explain: 'Q3 − Q1 = 25 − 12 = 13.' },
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
