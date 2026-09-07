import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement). Prérequis
 * officiels (clé 'seconde_fonctions_de_reference') : « Fonctions »,
 * « Valeur absolue », « Puissances ». On teste une image, une lecture de
 * courbe, |−3|, (−4)² et 1/0,5 — jamais les propriétés des courbes de référence.
 */
const SKILLS = {
  fonctions: { label: 'Fonctions', emoji: 'ƒ' },
  va: { label: 'Valeur absolue', emoji: '📏' },
  calcul: { label: 'Carrés et inverses', emoji: '🔢' },
};
const QUESTIONS = [
  { id: 'fr-d1', skill: 'fonctions', points: 2, prompt: 'f(x) = 2x − 1. Que vaut f(3) ?', options: ['5', '6', '23'], cols: 3, correct: 0, explain: '2 × 3 − 1 = 5.' },
  { id: 'fr-d2', skill: 'fonctions', points: 2, prompt: 'Sur une courbe, le point (2 ; 7) est dessus. Que peut-on écrire ?', options: ['f(2) = 7', 'f(7) = 2', '2 = 7'], cols: 3, correct: 0, explain: 'Abscisse 2, ordonnée 7 : l’image de 2 est 7.' },
  { id: 'fr-d3', skill: 'va', points: 2, prompt: 'Que vaut |−3| ?', options: ['3', '−3', '0'], cols: 3, correct: 0, explain: 'La valeur absolue est la distance à 0 : |−3| = 3.' },
  { id: 'fr-d4', skill: 'calcul', points: 2, prompt: 'Que vaut (−4)² ?', options: ['16', '−16', '−8'], cols: 3, correct: 0, explain: '(−4) × (−4) = 16 : un carré n’est jamais négatif.' },
  { id: 'fr-d5', skill: 'calcul', points: 2, prompt: 'Quel est l’inverse de 0,5 ?', options: ['2', '0,5', '−0,5'], cols: 3, correct: 0, explain: '1 ÷ 0,5 = 2 (et 0,5 × 2 = 1).' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de nourrir les machines, un tour de tes outils : une image, une lecture de courbe, une valeur absolue, un carré, un inverse. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
