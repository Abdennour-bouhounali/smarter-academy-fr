import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni proportionnalité, ni coefficient, ni
 * échelle, ni pourcentage, ni vitesse. Tout ici est de la 6e — les tables, le
 * quotient, la lecture d'un tableau, la valeur des décimales et le repérage.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  calcul: { label: 'Multiplier et diviser', emoji: '🔢' },
  decimaux: { label: 'Nombres décimaux', emoji: '📐' },
  lire: { label: 'Lire un tableau, un repère', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'prop5-d1-tables',
    skill: 'calcul',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: 'Combien font 6 × 7 ?',
    options: ['42', '48', '36'],
    cols: 3,
    correct: 0,
    explain: '6 × 7 = 42. (48 est 6 × 8, et 36 est 6 × 6.)',
  },
  {
    id: 'prop5-d2-quotient',
    skill: 'calcul',
    points: 2,
    requires: ['quotient'],
    prompt: 'On partage équitablement 45 billes entre 9 enfants. Combien chacun en reçoit-il ?',
    options: ['5', '9', '36'],
    cols: 3,
    correct: 0,
    explain: 'Un partage équitable est une division : 45 ÷ 9 = 5 billes chacun.',
  },
  {
    id: 'prop5-d3-decimaux',
    skill: 'decimaux',
    points: 2,
    requires: ['valeur-position'],
    prompt: 'Combien font 4 × 1,5 ?',
    options: ['6', '4,5', '5,4'],
    cols: 3,
    correct: 0,
    explain: '4 × 1,5, c’est 4 × 1 plus 4 × 0,5, soit 4 + 2 = 6.',
  },
  {
    id: 'prop5-d4-tableau',
    skill: 'lire',
    points: 2,
    requires: ['lire-tableau'],
    prompt:
      'Un tableau donne : 2 stylos → 3 €, 5 stylos → 7,50 €. Combien coûtent 5 stylos ?',
    options: ['7,50 €', '3 €', '5 €'],
    cols: 3,
    correct: 0,
    explain: 'On lit la colonne « 5 stylos » : elle indique 7,50 €. Lire un tableau, c’est croiser une ligne et une colonne.',
  },
  {
    id: 'prop5-d5-coordonnees',
    skill: 'lire',
    points: 2,
    requires: ['coordonnees'],
    prompt: 'Dans un repère, quel point a pour coordonnées (3 ; 2) ?',
    options: [
      'Celui qui est à 3 vers la droite et 2 vers le haut',
      'Celui qui est à 2 vers la droite et 3 vers le haut',
      'Celui qui est à 3 vers le haut et 2 vers la droite',
    ],
    cols: 1,
    correct: 0,
    explain:
      'On lit toujours le premier nombre en premier : 3 vers la droite, puis le second, 2 vers le haut.',
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
            Avant de doser le sirop de la fête, un tour de tes outils : tes tables, le partage, les
            décimaux, la lecture d’un tableau et le repérage.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
