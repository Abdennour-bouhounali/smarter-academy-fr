import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucune lettre, aucune expression, aucune
 * formule. Tout ici vient de la 6e (tables, périmètre, partage) et de la leçon
 * « Opérations » de 5e (priorités opératoires) — c'est-à-dire de ce que l'élève
 * a déjà rencontré.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  priorites: { label: 'Priorités', emoji: '🧮' },
  regularite: { label: 'Suites de nombres', emoji: '📈' },
  geometrie: { label: 'Périmètre', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'cl5-d1-priorites',
    skill: 'priorites',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: 'Combien vaut 3 × 4 + 2 ?',
    options: ['14', '18', '9'],
    cols: 3,
    correct: 0,
    explain: 'Le produit d’abord : 3 × 4 = 12, puis 12 + 2 = 14. (18 viendrait de 3 × (4 + 2).)',
  },
  {
    id: 'cl5-d2-priorites',
    skill: 'priorites',
    points: 2,
    requires: ['calcul-numerique', 'tables-multiplication'],
    prompt: 'Combien vaut 2 × (5 + 3) ?',
    options: ['16', '13', '10'],
    cols: 3,
    correct: 0,
    explain: 'La parenthèse d’abord : 5 + 3 = 8, puis 2 × 8 = 16. (13 viendrait de 2 × 5 + 3.)',
  },
  {
    id: 'cl5-d3-regularite',
    skill: 'regularite',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: 'Une suite commence par 4 ; 7 ; 10 ; 13. Quel nombre vient ensuite ?',
    options: ['16', '15', '17'],
    cols: 3,
    correct: 0,
    explain: 'On ajoute 3 à chaque fois : après 13 vient 16.',
  },
  {
    id: 'cl5-d4-regularite',
    skill: 'regularite',
    points: 2,
    requires: ['calcul-numerique', 'quotient'],
    prompt: 'Une place de cinéma coûte 8 €. Combien coûtent 6 places ?',
    options: ['48 €', '14 €', '86 €'],
    cols: 3,
    correct: 0,
    explain: 'Six places à 8 € : 6 × 8 = 48 €. (14 € serait 6 + 8.)',
  },
  {
    id: 'cl5-d5-perimetre',
    skill: 'geometrie',
    points: 2,
    requires: ['perimetre'],
    prompt: 'Quel est le périmètre d’un carré de côté 7 cm ?',
    options: ['28 cm', '49 cm', '14 cm'],
    cols: 3,
    correct: 0,
    explain: 'Le périmètre d’un carré est 4 × côté : 4 × 7 = 28 cm. (49 cm² serait son aire.)',
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
            Avant de construire ton premier motif, un tour de tes outils : l’ordre des opérations,
            les suites régulières et le périmètre.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
