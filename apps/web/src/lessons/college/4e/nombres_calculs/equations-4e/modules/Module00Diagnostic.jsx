import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — le sens de la lettre et
 * la substitution (5e), les termes semblables et la distributivité simple
 * (partie 1 de cet objet), la règle des signes et le quotient de relatifs
 * (leçon « Opérations sur les nombres relatifs ») — et RIEN de la matière de
 * la leçon : ni équation, ni solution, ni résolution.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  lettre: { label: 'La lettre', emoji: '🔤' },
  transformer: { label: 'Transformer', emoji: '🧩' },
  relatifs: { label: 'Relatifs', emoji: '±' },
};

const QUESTIONS = [
  {
    id: 'eq4-d1-substituer',
    skill: 'lettre',
    points: 2,
    requires: ['substituer', 'inconnue-variable'],
    prompt: 'Combien vaut 3x + 5 quand x = 4 ?',
    options: ['17', '35', '12'],
    cols: 3,
    correct: 0,
    explain: 'On remplace x par 4 : 3 × 4 + 5 = 12 + 5 = 17. La multiplication se calcule avant l’addition.',
  },
  {
    id: 'eq4-d2-reduire',
    skill: 'transformer',
    points: 2,
    requires: ['termes-semblables'],
    prompt: 'Réduis 4x + 3 + 2x',
    options: ['6x + 3', '9x', '6x + 3x'],
    cols: 3,
    correct: 0,
    explain: 'On regroupe les termes semblables : 4x + 2x = 6x. Le 3 n’a pas de semblable, il reste seul.',
  },
  {
    id: 'eq4-d3-developper',
    skill: 'transformer',
    points: 2,
    requires: ['distributivite-simple'],
    prompt: 'À quelle expression 3(x + 4) est-elle égale ?',
    options: ['3x + 12', '3x + 4', '3x + 7'],
    cols: 3,
    correct: 0,
    explain: 'Le 3 multiplie les DEUX parties de la parenthèse : 3 × x = 3x et 3 × 4 = 12.',
  },
  {
    id: 'eq4-d4-signes',
    skill: 'relatifs',
    points: 2,
    requires: ['regle-des-signes'],
    prompt: 'Combien fait 5 − (−3) ?',
    options: ['8', '2', '−8'],
    cols: 3,
    correct: 0,
    explain: 'Retirer −3 revient à ajouter 3 : 5 + 3 = 8.',
  },
  {
    id: 'eq4-d5-quotient',
    skill: 'relatifs',
    points: 2,
    requires: ['quotient-relatifs'],
    prompt: 'Combien fait (−12) ÷ 4 ?',
    options: ['−3', '3', '−8'],
    cols: 3,
    correct: 0,
    explain: 'Des signes contraires donnent un quotient négatif : 12 ÷ 4 = 3, donc −3.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions sur ce que tu sais déjà"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon va apprendre à <strong>résoudre</strong> une équation. Pour cela il faut
            savoir transformer une expression et calculer avec des relatifs — c’est ce qu’on vérifie
            ici. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
