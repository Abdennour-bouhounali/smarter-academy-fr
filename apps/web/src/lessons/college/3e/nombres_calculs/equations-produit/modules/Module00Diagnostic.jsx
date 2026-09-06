import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_equations_inequations') :
 * « Calcul littéral », « Nombres relatifs », « Distributivité ». On teste
 * donc substituer une valeur dans une expression, réduire, multiplier des
 * relatifs et développer k(a + b) — jamais les équations produit
 * elles-mêmes, qui sont le contenu de la leçon.
 *
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 * Ces ids sont exactement ceux du `priorKnowledge` de la leçon : un module 0
 * MESURE des acquis antérieurs, il n'enseigne jamais la matière de la leçon
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
  distri: { label: 'Distributivité', emoji: '📦' },
};

const QUESTIONS = [
  {
    id: 'q1-substituer',
    skill: 'litteral',
    points: 2,
    requires: ['calcul-litteral'],
    prompt: (
      <>
        Que vaut <MathText>{'$3x - 6$'}</MathText> quand <MathText>{'$x = 5$'}</MathText> ?
      </>
    ),
    options: ['9', '15', '−3'],
    cols: 3,
    correct: 0,
    explain: '3 × 5 = 15, puis 15 − 6 = 9. On multiplie avant de soustraire.',
  },
  {
    id: 'q2-reduire',
    skill: 'litteral',
    points: 2,
    requires: ['reduire-expression', 'terme-algebrique', 'calcul-litteral'],
    prompt: (
      <>
        Réduis <MathText>{'$2x + 3 + x$'}</MathText>.
      </>
    ),
    options: ['3x + 3', '5x', '6x'],
    cols: 3,
    correct: 0,
    explain: 'On additionne les termes en x entre eux : 2x + x = 3x. Le 3 tout seul ne se mélange pas aux x.',
  },
  {
    id: 'q3-produit-relatifs',
    skill: 'relatifs',
    points: 2,
    requires: ['nombres-relatifs'],
    prompt: (
      <>
        Combien font <MathText>{'$(-3) \\times 4$'}</MathText> ?
      </>
    ),
    options: ['12', '−12', '1'],
    cols: 3,
    correct: 1,
    explain: 'Un négatif multiplié par un positif donne un négatif : (−3) × 4 = −12. (1, ce serait −3 + 4.)',
  },
  {
    id: 'q4-somme-relatifs',
    skill: 'relatifs',
    points: 2,
    requires: ['nombres-relatifs'],
    prompt: (
      <>
        Quelle valeur de <MathText>{'$x$'}</MathText> vérifie <MathText>{'$x + 4 = 0$'}</MathText> ?
      </>
    ),
    options: ['4', '−4', '0'],
    cols: 3,
    correct: 1,
    explain: '−4 + 4 = 0. Pour annuler un « + 4 », il faut son opposé.',
  },
  {
    id: 'q5-distributivite',
    skill: 'distri',
    points: 2,
    requires: ['distributivite', 'developper', 'facteur'],
    prompt: (
      <>
        Développe <MathText>{'$3(x + 2)$'}</MathText>.
      </>
    ),
    options: ['3x + 2', '3x + 6', 'x + 6'],
    cols: 3,
    correct: 1,
    explain: 'Le 3 multiplie TOUT ce qui est dans la parenthèse : 3 × x + 3 × 2 = 3x + 6.',
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
            Cette leçon repose sur le calcul littéral, les nombres relatifs et la distributivité.
            Vérifions ces réflexes. Ce n'est pas un examen — tu continueras vers le Module 1 quel que soit
            ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
