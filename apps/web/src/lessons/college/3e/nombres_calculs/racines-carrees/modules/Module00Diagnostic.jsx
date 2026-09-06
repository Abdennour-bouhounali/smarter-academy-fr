import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_racine_carree') : « Carrés et
 * puissances », « Calcul numérique », « Longueurs ». On teste donc le carré
 * d'un entier, la lecture de la notation n², la priorité des opérations,
 * l'ordre de deux nombres, et l'aire d'un carré — jamais la racine carrée
 * elle-même, qui est le contenu de la leçon.
 *
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique —
 * uniquement des ids du `priorKnowledge` de lesson.config.js (contrat
 * docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  carres: { label: 'Carrés et puissances', emoji: '²' },
  calcul: { label: 'Calcul numérique', emoji: '🔢' },
  longueurs: { label: 'Longueurs et aires', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'q1-carre',
    requires: ['carre-nombre'],
    skill: 'carres',
    points: 2,
    prompt: (
      <>
        Combien vaut <MathText>{'$7^{2}$'}</MathText> ?
      </>
    ),
    options: ['14', '49', '77'],
    cols: 3,
    correct: 1,
    explain: '7² se lit « 7 au carré » : c’est 7 × 7 = 49. (14, ce serait 7 + 7.)',
  },
  {
    id: 'q2-notation',
    requires: ['carre-nombre'],
    skill: 'carres',
    points: 2,
    prompt: (
      <>
        Quelle écriture signifie « 9 multiplié par lui-même » ?
      </>
    ),
    options: ['9 × 2', '9²', '2⁹'],
    cols: 3,
    correct: 1,
    explain: '9² = 9 × 9 = 81. Le petit 2 dit combien de fois le nombre se multiplie, pas par combien on le multiplie.',
  },
  {
    id: 'q3-priorites',
    requires: ['calcul-numerique', 'carre-nombre'],
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        Combien vaut <MathText>{'$3^{2} + 4^{2}$'}</MathText> ?
      </>
    ),
    options: ['25', '49', '14'],
    cols: 3,
    correct: 0,
    explain: 'On calcule les carrés d’abord : 9 + 16 = 25. (49 serait (3 + 4)² — les carrés ne s’additionnent pas comme ça.)',
  },
  {
    id: 'q4-ordre',
    requires: ['encadrer-nombre'],
    skill: 'calcul',
    points: 2,
    prompt: (
      <>
        Quel nombre est compris entre <MathText>{'$36$'}</MathText> et <MathText>{'$49$'}</MathText> ?
      </>
    ),
    options: ['30', '40', '50'],
    cols: 3,
    correct: 1,
    explain: '36 < 40 < 49. Savoir encadrer un nombre entre deux autres servira à chaque module.',
  },
  {
    id: 'q5-aire',
    requires: ['aire'],
    skill: 'longueurs',
    points: 2,
    prompt: (
      <>
        Quelle est l’aire d’un carré de <strong>8 cm</strong> de côté ?
      </>
    ),
    options: ['32 cm²', '64 cm²', '16 cm²'],
    cols: 3,
    correct: 1,
    explain: 'Aire d’un carré = côté × côté = 8 × 8 = 64 cm². (32 cm, ce serait le périmètre.)',
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
            Cette leçon repose sur les carrés, le calcul numérique et les aires. Vérifions ces réflexes.
            Ce n'est pas un examen — tu continueras vers le Module 1 quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
