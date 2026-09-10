import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis : calcul numérique et littéral, ordre des nombres. On teste ce que
 * le collège a construit — évaluer une expression, comparer, suivre un ordre
 * d'opérations — sans employer les mots que la leçon enseigne (variable
 * informatique, type, affectation, boucle).
 */
const SKILLS = {
  calcul: { label: 'Calculer', emoji: '🔢' },
  ordre: { label: 'Comparer', emoji: '⚖️' },
  suite: { label: 'Suivre un ordre', emoji: '📋' },
};

const QUESTIONS = [
  {
    id: 'vi-d1-expression',
    skill: 'calcul',
    points: 2,
    requires: ['calcul-litteral'],
    prompt: 'Si a vaut 4, combien vaut 2 × a + 3 ?',
    options: ['11', '14', '9'],
    cols: 3,
    correct: 0,
    explain: '2 × 4 + 3 = 8 + 3 = 11. La multiplication passe avant l’addition.',
  },
  {
    id: 'vi-d2-priorite',
    skill: 'calcul',
    points: 2,
    requires: ['calcul-litteral'],
    prompt: 'Combien vaut 2 + 3 × 4 ?',
    options: ['14', '20', '24'],
    cols: 3,
    correct: 0,
    explain: '3 × 4 = 12 d’abord, puis 2 + 12 = 14. Sans parenthèses, la multiplication est prioritaire — et c’est pareil dans un programme.',
  },
  {
    id: 'vi-d3-comparer',
    skill: 'ordre',
    points: 2,
    requires: ['ordre-nombres'],
    prompt: 'L’affirmation « 10 ⩾ 10 » est-elle vraie ?',
    options: ['Vraie : ⩾ signifie « supérieur OU égal »', 'Fausse : 10 n’est pas supérieur à 10', 'On ne peut pas comparer'],
    cols: 1,
    correct: 0,
    explain: '⩾ accepte l’égalité, > la refuse. Cette différence décidera de quel côté tombe un cas limite dans un programme.',
  },
  {
    id: 'vi-d4-quotient',
    skill: 'calcul',
    points: 2,
    requires: ['ordre-nombres', 'arrondi'],
    prompt: 'Combien vaut 7 ÷ 2 ?',
    options: ['3,5', '3', '4'],
    cols: 3,
    correct: 0,
    explain: '7 ÷ 2 = 3,5. Certains langages distinguent ce résultat exact du résultat arrondi vers le bas (3) : la leçon y reviendra.',
  },
  {
    id: 'vi-d5-ordre',
    skill: 'suite',
    points: 2,
    requires: ['calcul-litteral'],
    prompt: 'On part de 5. On ajoute 3, puis on multiplie par 2. Quel résultat ?',
    options: ['16', '11', '13'],
    cols: 3,
    correct: 0,
    explain: '(5 + 3) × 2 = 16. L’ordre des étapes change le résultat : 5 + 3 × 2 donnerait 11.',
  },
  {
    id: 'vi-d6-ordre-inverse',
    skill: 'suite',
    points: 2,
    requires: ['calcul-litteral'],
    prompt: 'Et si on multiplie par 2 D’ABORD, puis on ajoute 3 ?',
    options: ['13', '16', '10'],
    cols: 3,
    correct: 0,
    explain: '5 × 2 = 10, puis 10 + 3 = 13. Deux ordres de calcul, deux résultats : tu verras que l’ordre des lignes d’un programme compte tout autant.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleNumber={0}
      moduleTitle="Mission de départ"
      moduleSubtitle="Ce que le collège t’a déjà appris"
      estimatedTime="5 min"
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
