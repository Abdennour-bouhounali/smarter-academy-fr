import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni priorité, ni parenthèse, ni division par
 * un décimal, ni multiple. Tout ici est de la 6e — le sens des quatre
 * opérations, les tables, la valeur des chiffres après la virgule, le quotient
 * et le décalage de la virgule.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  sens: { label: 'Sens des opérations', emoji: '🔢' },
  decimaux: { label: 'Nombres décimaux', emoji: '📐' },
  division: { label: 'Division', emoji: '➗' },
};

const QUESTIONS = [
  {
    id: 'op5-d1-sens',
    skill: 'sens',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: 'Six paquets contiennent chacun 7 gommes. Quelle opération donne le nombre total de gommes ?',
    options: ['6 × 7', '6 + 7', '7 − 6'],
    cols: 3,
    correct: 0,
    explain: 'Des paquets identiques qu’on réunit, c’est une multiplication : 6 × 7 = 42.',
  },
  {
    id: 'op5-d2-tables',
    skill: 'sens',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: 'Combien font 7 × 8 ?',
    options: ['56', '54', '63'],
    cols: 3,
    correct: 0,
    explain: '7 × 8 = 56. (54 est 6 × 9, et 63 est 7 × 9.)',
  },
  {
    id: 'op5-d3-decimaux',
    skill: 'decimaux',
    points: 2,
    requires: ['valeur-position'],
    prompt: 'Dans le nombre 3,47, que vaut le chiffre 4 ?',
    options: ['4 dixièmes', '4 centièmes', '4 unités'],
    cols: 3,
    correct: 0,
    explain: 'Juste après la virgule viennent les dixièmes. Le 4 vaut donc 4 dixièmes, et le 7 vaut 7 centièmes.',
  },
  {
    id: 'op5-d4-virgule',
    skill: 'decimaux',
    points: 2,
    requires: ['decalage-virgule'],
    prompt: 'Combien font 2,5 × 10 ?',
    options: ['25', '2,50', '250'],
    cols: 3,
    correct: 0,
    explain: 'Multiplier par 10 décale la virgule d’un rang vers la droite : 2,5 devient 25.',
  },
  {
    id: 'op5-d5-quotient',
    skill: 'division',
    points: 2,
    requires: ['quotient'],
    prompt: 'On partage équitablement 72 billes entre 8 enfants. Combien chacun en reçoit-il ?',
    options: ['9', '8', '64'],
    cols: 3,
    correct: 0,
    explain: 'Un partage équitable est une division : 72 ÷ 8 = 9. Chaque enfant reçoit 9 billes.',
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
            Avant d’ouvrir la caisse, un tour de tes outils : reconnaître l’opération d’une
            situation, tes tables, la valeur des chiffres après la virgule et le partage.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
