import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 0 — prérequis (clé 'seconde_proportions_et_pourcentages') : fractions, pourcentages du collège, proportionnalité. */
const SKILLS = {
  fractions: { label: 'Fractions et décimaux', emoji: '½' },
  pourcentages: { label: 'Pourcentages (collège)', emoji: '%' },
};
const QUESTIONS = [
  { id: 'pp-d1', skill: 'fractions', points: 2, requires: ['quotient', 'numerateur', 'denominateur'], prompt: 'Quelle est l’écriture décimale de 3/4 ?', options: ['0,75', '0,34', '1,33'], cols: 3, correct: 0, explain: '3 ÷ 4 = 0,75.' },
  { id: 'pp-d2', skill: 'fractions', points: 2, requires: ['fraction-decimale', 'quotient', 'numerateur', 'denominateur'], prompt: '0,4 s’écrit aussi…', options: ['4/10', '4/100', '1/4'], cols: 3, correct: 0, explain: '0,4 = 4 dixièmes = 4/10 = 2/5.' },
  { id: 'pp-d3', skill: 'pourcentages', points: 2, requires: ['pourcentage', 'proportionnalite'], prompt: 'Combien font 25 % de 60 ?', options: ['15', '25', '35'], cols: 3, correct: 0, explain: '25 % = 0,25 et 0,25 × 60 = 15.' },
  { id: 'pp-d4', skill: 'pourcentages', points: 2, requires: ['pourcentage', 'quotient', 'effectif'], prompt: '12 élèves sur 50 sont externes. Quel pourcentage ?', options: ['24 %', '12 %', '38 %'], cols: 3, correct: 0, explain: '12 ÷ 50 = 0,24 = 24 %.' },
  { id: 'pp-d5', skill: 'pourcentages', points: 2, requires: ['pourcentage', 'coefficient-proportionnalite'], prompt: 'Un prix augmente de 10 %. Il est multiplié par…', options: ['1,1', '0,9', '10'], cols: 3, correct: 0, explain: 'Augmenter de 10 %, c’est garder 100 % et ajouter 10 % : ×1,10.' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant de découper le lycée : une fraction, un décimal, un pourcentage à appliquer et un à calculer. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
