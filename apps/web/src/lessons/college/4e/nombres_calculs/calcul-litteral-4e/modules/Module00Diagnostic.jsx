import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — le sens de la lettre,
 * l'écriture d'une expression, la substitution, la distributivité sur des
 * nombres (5e), la règle des signes et les priorités (4e / 5e) — et RIEN de
 * la matière de la leçon : ni réduction, ni développement littéral, ni
 * factorisation.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  lettre: { label: 'La lettre', emoji: '🔤' },
  ecrire: { label: 'Écrire une expression', emoji: '✍️' },
  calcul: { label: 'Calculer', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'cl4-d1-lettre',
    skill: 'lettre',
    points: 2,
    requires: ['inconnue-variable', 'calcul-litteral'],
    prompt: 'Dans l’expression 4n, que représente la lettre n ?',
    options: [
      'Un nombre qui peut changer de valeur',
      'Toujours le nombre 14',
      'Une unité de mesure',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une lettre désigne un nombre qui n’est pas fixé : selon la situation, n peut valoir 2, 10 ou 1000, et 4n suit.',
  },
  {
    id: 'cl4-d2-substituer',
    skill: 'lettre',
    points: 2,
    requires: ['substituer'],
    prompt: 'Combien vaut 5x + 3 quand x = 4 ?',
    options: ['23', '54', '12'],
    cols: 3,
    correct: 0,
    explain: 'On remplace x par 4 : 5 × 4 + 3 = 20 + 3 = 23. (54 viendrait d’avoir écrit les chiffres à la suite au lieu de multiplier.)',
  },
  {
    id: 'cl4-d3-ecrire',
    skill: 'ecrire',
    points: 2,
    requires: ['ecrire-expression'],
    prompt: 'Un stylo coûte p euros. Comment s’écrit le prix de 7 stylos ?',
    options: ['7p', 'p + 7', 'p⁷'],
    cols: 3,
    correct: 0,
    explain: 'Sept fois le prix d’un stylo : 7 × p, qu’on écrit 7p — le signe × disparaît devant une lettre.',
  },
  {
    id: 'cl4-d4-distributivite',
    skill: 'calcul',
    points: 2,
    requires: ['distributivite'],
    prompt: 'Combien fait 4 × 23, en découpant 23 en 20 + 3 ?',
    options: ['92', '83', '26'],
    cols: 3,
    correct: 0,
    explain: '4 × 20 = 80 et 4 × 3 = 12, donc 80 + 12 = 92. Le facteur 4 multiplie les DEUX morceaux — c’est déjà la distributivité.',
  },
  {
    id: 'cl4-d5-signes',
    skill: 'calcul',
    points: 2,
    requires: ['regle-des-signes'],
    prompt: 'Combien fait (−4) × 7 ?',
    options: ['−28', '28', '−11'],
    cols: 3,
    correct: 0,
    explain: 'Des signes contraires donnent un produit négatif : 4 × 7 = 28, donc −28.',
  },
  {
    id: 'cl4-d6-priorites',
    skill: 'calcul',
    points: 2,
    requires: ['priorites-operatoires'],
    prompt: 'Combien fait 2 × (5 + 3) ?',
    options: ['16', '13', '10'],
    cols: 3,
    correct: 0,
    explain: 'La parenthèse d’abord : 5 + 3 = 8, puis 2 × 8 = 16. (13 viendrait d’avoir multiplié seulement le 5.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions sur ce que tu sais déjà"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon va apprendre à <strong>transformer</strong> les expressions littérales :
            les réduire, les développer, les factoriser. Avant cela, un tour de ce que tu sais déjà :
            la lettre, l’écriture d’une expression et le calcul avec des parenthèses.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
