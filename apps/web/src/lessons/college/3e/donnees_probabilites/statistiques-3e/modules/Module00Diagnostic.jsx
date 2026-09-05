import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — nombres relatifs, calcul numérique,
 * proportionnalité — et jamais la matière de la leçon : ni moyenne, ni médiane,
 * ni étendue, ni effectif. Aucune question ne porte de métadonnée `assessment`.
 */

const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '➖' },
  calcul: { label: 'Calcul numérique', emoji: '🔢' },
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'st-d1',
    skill: 'calcul',
    points: 2,
    prompt: 'Combien font 12 + 8 + 10 ?',
    options: ['30', '28', '32', '20'],
    cols: 2,
    correct: 0,
    explain: '12 + 8 = 20, puis 20 + 10 = 30.',
  },
  {
    id: 'st-d2',
    skill: 'calcul',
    points: 2,
    prompt: 'Combien font 90 ÷ 6 ?',
    options: ['15', '14', '16', '12'],
    cols: 2,
    correct: 0,
    explain: '6 × 15 = 90, donc 90 ÷ 6 = 15.',
  },
  {
    id: 'st-d3',
    skill: 'relatifs',
    points: 2,
    prompt: 'Que vaut 12 − 20 ?',
    options: ['−8', '8', '−32', '32'],
    cols: 2,
    correct: 0,
    explain: '20 est plus grand que 12 : le résultat est négatif, il vaut −8.',
  },
  {
    id: 'st-d4',
    skill: 'calcul',
    points: 2,
    prompt: 'Range ces nombres du plus petit au plus grand : 15, 5, 12, 30.',
    options: ['5, 12, 15, 30', '5, 15, 12, 30', '30, 15, 12, 5', '12, 5, 15, 30'],
    cols: 1,
    correct: 0,
    explain: 'Dans l’ordre croissant : 5, puis 12, puis 15, puis 30.',
  },
  {
    id: 'st-d5',
    skill: 'proportion',
    points: 2,
    prompt: 'Dans une classe de 20 élèves, 5 viennent à pied. Quelle proportion cela représente-t-il ?',
    options: ['Un quart', 'Un cinquième', 'La moitié', 'Un tiers'],
    cols: 2,
    correct: 0,
    explain: '5 sur 20, c’est 5 ÷ 20 = 0,25, soit un quart de la classe.',
  },
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
            Cinq questions rapides sur ce qui sert ici : additionner, diviser, ranger des
            nombres, raisonner sur une proportion. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
