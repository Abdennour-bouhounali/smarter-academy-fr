import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés dans `priorKnowledge`
 * (lesson.config.js) — proportionnalité, fonction et notation f(x), image,
 * fonction linéaire, calcul littéral, équation du premier degré — et jamais la
 * matière de la leçon (tri des informations, choix d'un modèle, limites).
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 * Aucune métadonnée `assessment`.
 */

const SKILLS = {
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
  fonctions: { label: 'Fonctions', emoji: '📈' },
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  equations: { label: 'Équations', emoji: '🟰' },
};

const QUESTIONS = [
  { id: 'mo-d1', skill: 'proportion', points: 2, prompt: '3 kg coûtent 7,50 €. Combien coûtent 5 kg (prix proportionnel) ?', options: ['12,50 €', '9,50 €', '37,50 €', '2,50 €'], cols: 2, correct: 0, explain: '1 kg coûte 2,50 € ; 5 kg : 12,50 €.', requires: ['proportionnalite'] },
  { id: 'mo-d2', skill: 'fonctions', points: 2, prompt: 'Soit f(x) = 2x + 3. Que vaut f(4) ?', options: ['11', '9', '24', '7'], cols: 2, correct: 0, explain: '2 × 4 + 3 = 11.', requires: ['fonction', 'notation-fx', 'image'] },
  { id: 'mo-d3', skill: 'litteral', points: 2, prompt: '« Un nombre, multiplié par 5, puis on ajoute 2. » Quelle expression ?', options: ['5x + 2', '5(x + 2)', '5 + 2x', 'x + 7'], cols: 2, correct: 0, explain: 'Multiplier par 5 : 5x ; puis ajouter 2 : 5x + 2.', requires: ['calcul-litteral'] },
  { id: 'mo-d4', skill: 'equations', points: 2, prompt: 'Résoudre 0,5x + 1 = 4.', options: ['x = 6', 'x = 3', 'x = 10', 'x = 2,5'], cols: 2, correct: 0, explain: '0,5x = 3, donc x = 6.', requires: ['equation-premier-degre'] },
  { id: 'mo-d5', skill: 'fonctions', points: 2, prompt: 'Une droite passe par l’origine et par (2 ; 6). Quelle est sa fonction ?', options: ['f(x) = 3x', 'f(x) = x + 4', 'f(x) = 6x', 'f(x) = 2x + 2'], cols: 2, correct: 0, explain: 'Par l’origine : f(x) = ax, et 6 = a × 2 donne a = 3.', requires: ['fonction-lineaire', 'notation-fx'] },
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
            Cinq questions rapides sur ce qui sert ici : une proportionnalité, l’image par une fonction, une
            expression littérale, une équation, une droite par l’origine. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
