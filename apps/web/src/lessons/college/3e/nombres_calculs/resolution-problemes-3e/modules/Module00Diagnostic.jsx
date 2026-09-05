import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels de la leçon (coursesData.js, clé
 * '3e_resolution_problemes') : « Calcul numérique », « Calcul littéral »,
 * « Équations », « Proportionnalité ». On teste donc la priorité des
 * opérations, l'évaluation d'une expression littérale pour une valeur, la
 * réduction d'une expression, la résolution d'une équation du premier degré
 * et la quatrième proportionnelle.
 *
 * On ne teste JAMAIS le contenu de la leçon elle-même : ni le tri des données
 * utiles, ni le choix de l'inconnue, ni la traduction d'un énoncé en
 * équation, ni la vérification dans l'histoire — c'est ce que l'élève vient
 * apprendre. La résolution d'une équation, en revanche, EST un prérequis
 * (leçon « Équations produit nul ») : ici on l'organisera et on la vérifiera,
 * on ne l'enseignera pas.
 *
 * Jamais bloquant : quel que soit le score, le module 1 s'ouvre. Un score bas
 * sur « Équations » renvoie vers la leçon « Équations produit nul ».
 */
const SKILLS = {
  calcul: { label: 'Calcul numérique', emoji: '🔢' },
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  equations: { label: 'Équations', emoji: '🟰' },
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'q1-priorites',
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        Combien vaut <MathText>{'$2 + 3 \\times 4$'}</MathText> ?
      </>
    ),
    options: ['20', '14', '9'],
    cols: 3,
    correct: 1,
    explain:
      'La multiplication passe avant l’addition : 3 × 4 = 12, puis 2 + 12 = 14. (20, c’est (2 + 3) × 4 — on aurait calculé de gauche à droite.)',
  },
  {
    id: 'q2-evaluer',
    skill: 'litteral',
    points: 2,
    prompt: (
      <>
        Combien vaut <MathText>{'$3x + 2$'}</MathText> pour <MathText>{'$x = 4$'}</MathText> ?
      </>
    ),
    options: ['14', '18', '24'],
    cols: 3,
    correct: 0,
    explain:
      '3x veut dire 3 × x : 3 × 4 = 12, puis 12 + 2 = 14. (18 viendrait de 3 × (4 + 2) : le + 2 arrive après la multiplication.)',
  },
  {
    id: 'q3-reduire',
    skill: 'litteral',
    points: 2,
    prompt: (
      <>
        Réduis <MathText>{'$2x + 5 - x$'}</MathText>.
      </>
    ),
    options: ['x + 5', '2x + 5', '6x'],
    cols: 3,
    correct: 0,
    explain:
      'On regroupe ce qui se ressemble : 2x − x = x, et le 5 reste seul. Résultat : x + 5. (6x additionnerait 5 avec des x — impossible, ce ne sont pas les mêmes objets.)',
  },
  {
    id: 'q4-equation',
    skill: 'equations',
    points: 2,
    prompt: (
      <>
        Quelle est la solution de <MathText>{'$2x + 5 = 17$'}</MathText> ?
      </>
    ),
    options: ['x = 6', 'x = 11', 'x = 22'],
    cols: 3,
    correct: 0,
    explain:
      'On retire 5 des deux côtés : 2x = 12, puis on partage en 2 : x = 6. (11, c’est 17 − 6 ; 22, c’est la valeur de 2x sans le partage.) Cette technique est un PRÉREQUIS ici — si elle est fragile, la leçon « Équations produit nul » la reprend depuis le début.',
  },
  {
    id: 'q5-proportion',
    skill: 'proportion',
    points: 2,
    prompt: (
      <>
        3 stylos coûtent 12 €. Combien coûtent 5 stylos, au même tarif ?
      </>
    ),
    options: ['14 €', '20 €', '60 €'],
    cols: 3,
    correct: 1,
    explain:
      'Un stylo coûte 12 ÷ 3 = 4 €, donc 5 stylos coûtent 5 × 4 = 20 €. (14 €, ce serait « 2 stylos de plus, donc 2 € de plus » — on ajouterait au lieu de multiplier.)',
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
            Cette leçon s’appuie sur quatre réflexes déjà travaillés : le calcul numérique, le calcul
            littéral, la résolution d’une équation et la proportionnalité. Vérifions-les en cinq questions.
            Ce n’est pas un examen — tu continueras vers le Module 1 quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
