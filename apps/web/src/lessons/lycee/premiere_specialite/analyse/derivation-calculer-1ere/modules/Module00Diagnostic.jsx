import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * f′(a) et sa lecture graphique (acquis de la leçon amont), la méthode du taux,
 * et le calcul littéral de 2de — développer, réduire, lire un coefficient.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. AUCUNE question ne porte sur la matière de la leçon, et
 *   aucun de ses mots n'apparaît — ni « règle de dérivation », ni « dérivée
 *   d'un produit », ni « composée », y compris dans les `explain`.
 *   Chaque prérequis déclaré est mesuré par au moins une question. Les ids en
 *   seconde position sont ceux du LEXIQUE (scripts/audit/lexicon.json) : la
 *   leçon emploie « pente », « tangente », « facteur », « dénominateur »… sans
 *   les enseigner, donc l'audit --strict exige qu'ils soient déclarés ET
 *   mesurés — c'est ici qu'ils le sont.
 *     dc-d1  nombre-derive, derive-coefficient-directeur · pente, tangente, notation-fx
 *     dc-d2  methode-calculer-nombre-derive, taux-variation-secante · denominateur
 *     dc-d3  developper · facteur
 *     dc-d4  expression-litterale, methode-reduire · reduire-expression
 *     dc-d5  vocab-terme-coefficient · terme-algebrique, coefficient-lineaire
 */
const SKILLS = {
  pente: { label: 'Le nombre f′(a)', emoji: '📈' },
  taux: { label: 'La méthode du taux', emoji: '📊' },
  litteral: { label: 'Calcul littéral', emoji: '✍️' },
};

const QUESTIONS = [
  {
    id: 'dc-d1',
    requires: ['nombre-derive', 'derive-coefficient-directeur', 'pente', 'tangente', 'notation-fx'],
    skill: 'pente',
    points: 2,
    prompt: 'Pour f(x) = x², on sait que f′(a) = 2a. Que vaut f′(4) ?',
    options: ['8', '16', '4'],
    cols: 3,
    correct: 0,
    explain: 'f′(4) = 2 × 4 = 8. Répondre 16, c’est donner f(4), l’ordonnée du point — pas la pente de la tangente en ce point.',
  },
  {
    id: 'dc-d2',
    requires: ['methode-calculer-nombre-derive', 'taux-variation-secante', 'denominateur'],
    skill: 'taux',
    points: 2,
    prompt: 'Pour obtenir f′(a), on écrit [f(a + h) − f(a)] ÷ h, on simplifie, puis…',
    options: [
      'on regarde vers quel nombre le résultat se dirige quand h se rapproche de 0',
      'on remplace h par 1',
      'on remplace a par 0',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la méthode vue précédemment : simplifier jusqu’à faire disparaître le h du dénominateur, puis faire tendre h vers 0.',
  },
  {
    id: 'dc-d3',
    requires: ['developper', 'facteur'],
    skill: 'litteral',
    points: 2,
    prompt: 'Développe (2x + 1)(x − 3).',
    options: ['2x² − 5x − 3', '2x² − 3', '2x² + 5x − 3'],
    cols: 1,
    correct: 0,
    explain: '2x × x = 2x², 2x × (−3) = −6x, 1 × x = x, 1 × (−3) = −3. En réduisant : 2x² − 5x − 3.',
  },
  {
    id: 'dc-d4',
    requires: ['expression-litterale', 'methode-reduire', 'reduire-expression'],
    skill: 'litteral',
    points: 2,
    prompt: 'Réduis l’expression 4x² + 2x − x² + 3x.',
    options: ['3x² + 5x', '3x² + 6x', '5x² + 5x'],
    cols: 3,
    correct: 0,
    explain: 'On regroupe ce qui se ressemble : 4x² − x² = 3x², et 2x + 3x = 5x. Un x² ne se regroupe jamais avec un x.',
  },
  {
    id: 'dc-d5',
    requires: ['vocab-terme-coefficient', 'terme-algebrique', 'coefficient-lineaire'],
    skill: 'litteral',
    points: 2,
    prompt: 'Dans l’expression 7x³ − 4x + 9, quel est le coefficient du terme en x ?',
    options: ['−4', '4', '7'],
    cols: 3,
    correct: 0,
    explain: 'Le terme en x est −4x : son coefficient est −4, signe compris. Le 7 est le coefficient du terme en x³.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant d’assembler des fonctions, un tour de tes outils : le nombre f′(a), la méthode
            qui le produit, et le calcul littéral de 2de — développer, réduire, lire un
            coefficient. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
