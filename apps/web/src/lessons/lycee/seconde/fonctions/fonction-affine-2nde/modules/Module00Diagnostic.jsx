import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis (clé 'seconde_fonction_affine') : Fonctions affines du
 * collège, Équations de droites.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un diagnostic MESURE des prérequis, il n'enseigne rien. Les cinq questions
 *   ne portent donc que sur des ids de `priorKnowledge` — la fonction affine,
 *   f(x), la représentation graphique, le coefficient directeur, l'ordonnée à
 *   l'origine et la pente sont acquis de 3e, et chaque id déclaré est mesuré
 *   ici par au moins une question (sinon W_PRIOR_NOT_DIAGNOSED). Rien de ce
 *   que la leçon enseigne — le taux d'accroissement, le lien signe de a /
 *   variations, le zéro −b/a — n'apparaît dans ce module.
 */
const SKILLS = { college: { label: 'Fonctions affines (collège)', emoji: 'ƒ' }, droites: { label: 'Équations de droites', emoji: '📈' } };
const QUESTIONS = [
  { id: 'fa-d1', skill: 'college', points: 2, prompt: 'f(x) = 3x − 2. Que vaut f(4) ?', options: ['10', '14', '5'], cols: 3, correct: 0, explain: '3 × 4 − 2 = 10.', requires: ['fonction', 'notation-fx'] },
  { id: 'fa-d2', skill: 'college', points: 2, prompt: 'Laquelle de ces fonctions est affine ?', options: ['f(x) = 5x + 1', 'g(x) = x² + 1', 'h(x) = 1/x'], cols: 3, correct: 0, explain: 'Une fonction affine s’écrit ax + b : 5x + 1.', requires: ['fonction', 'fonction-affine'] },
  { id: 'fa-d3', skill: 'college', points: 2, prompt: 'La représentation graphique d’une fonction affine est…', options: ['une droite', 'une parabole', 'un cercle'], cols: 3, correct: 0, explain: 'Toujours une droite (non verticale).', requires: ['fonction-affine', 'representation-graphique'] },
  { id: 'fa-d4', skill: 'droites', points: 2, prompt: 'Pour la droite d’équation y = 2x + 5, le coefficient directeur et l’ordonnée à l’origine sont…', options: ['2 et 5', '5 et 2', '2x et 5'], cols: 3, correct: 0, explain: 'y = mx + p : m = 2, p = 5.', requires: ['coefficient-directeur', 'ordonnee-origine', 'origine-repere'] },
  { id: 'fa-d5', skill: 'droites', points: 2, prompt: 'Une droite passe par (0 ; 3) et (2 ; 7). Sa pente est…', options: ['2', '4', '3'], cols: 3, correct: 0, explain: '(7 − 3) ÷ (2 − 0) = 2.', requires: ['pente'] },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} moduleTitle="Mission de départ" moduleSubtitle="Cinq questions pour savoir par où commencer" estimatedTime="4 min"
      brief={{ body: <p>Avant d’ouvrir le robinet, un tour de tes outils : une image, une fonction affine du collège, une droite et sa pente. <strong>Rien n’est bloquant.</strong></p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
