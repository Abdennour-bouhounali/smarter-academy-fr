import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — lire et simplifier un quotient,
 * lire un pourcentage, soustraire à 1 — et jamais la matière de la leçon : ni
 * issue, ni événement, ni probabilité, ni fréquence. Aucune question ne porte
 * de métadonnée `assessment`.
 *
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 * Ces ids sont ceux de `priorKnowledge` (lesson.config.js) et d'eux seuls :
 * un diagnostic MESURE des acquis, il n'enseigne rien
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */

const SKILLS = {
  fractions: { label: 'Fractions', emoji: '🍕' },
  pourcentages: { label: 'Pourcentages', emoji: '％' },
  calcul: { label: 'Calcul numérique', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'pb-d1',
    requires: ['quotient'],
    skill: 'fractions',
    points: 2,
    prompt: 'Quelle fraction est égale à 2/8 ?',
    options: ['1/4', '1/2', '2/4', '4/8'],
    cols: 2,
    correct: 0,
    explain: '2/8 = (2 ÷ 2)/(8 ÷ 2) = 1/4.',
  },
  {
    id: 'pb-d2',
    requires: ['quotient'],
    skill: 'fractions',
    points: 2,
    prompt: 'Laquelle de ces fractions est la plus grande ?',
    options: ['1/2', '1/3', '1/4', '1/6'],
    cols: 2,
    correct: 0,
    explain: 'Pour un même numérateur, plus le dénominateur est petit, plus la fraction est grande : 1/2 > 1/3 > 1/4 > 1/6.',
  },
  {
    id: 'pb-d3',
    requires: ['pourcentage', 'quotient'],
    skill: 'pourcentages',
    points: 2,
    prompt: '25 sur 100, c’est…',
    options: ['25 %', '2,5 %', '0,25 %', '75 %'],
    cols: 2,
    correct: 0,
    explain: '25 sur 100 = 25/100 = 25 %.',
  },
  {
    id: 'pb-d4',
    requires: ['pourcentage'],
    skill: 'pourcentages',
    points: 2,
    prompt: 'Combien font 20 % de 300 ?',
    options: ['60', '20', '150', '6'],
    cols: 2,
    correct: 0,
    explain: '20 % de 300 = 300 × 20/100 = 60.',
  },
  {
    id: 'pb-d5',
    requires: ['calcul-numerique'],
    skill: 'calcul',
    points: 2,
    prompt: 'Que vaut 1 − 0,7 ?',
    options: ['0,3', '0,7', '1,3', '0,03'],
    cols: 2,
    correct: 0,
    explain: '1 − 0,7 = 0,3.',
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
            Cinq questions rapides sur ce qui sert ici : simplifier et comparer des fractions,
            lire un pourcentage, soustraire à 1. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
