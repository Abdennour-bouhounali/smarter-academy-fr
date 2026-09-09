import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis de 5e listés dans `priorKnowledge` — le coefficient, le
 * tableau, le pourcentage, la lecture graphique et le quotient — et RIEN de la
 * matière de la leçon : ni produit en croix, ni coefficient multiplicateur, ni
 * évolution.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  coefficient: { label: 'Coefficient et tableau', emoji: '⚖️' },
  pourcentage: { label: 'Pourcentages', emoji: '🏷️' },
  lecture: { label: 'Lire un graphique', emoji: '📈' },
};

const QUESTIONS = [
  {
    id: 'p4-d1-coefficient',
    skill: 'coefficient',
    points: 2,
    requires: ['coefficient-proportionnalite'],
    prompt: '4 stylos coûtent 5 €. Par quel nombre multiplie-t-on le nombre de stylos pour obtenir le prix ?',
    options: ['1,25', '4', '5'],
    cols: 3,
    correct: 0,
    explain: '5 ÷ 4 = 1,25 : chaque stylo coûte 1,25 €, et ce nombre est le coefficient de proportionnalité vu en 5e.',
  },
  {
    id: 'p4-d2-tableau',
    skill: 'coefficient',
    points: 2,
    requires: ['tableau-proportionnalite', 'quotient'],
    prompt: 'Dans un tableau de proportionnalité, 3 → 12. Que vaut 5 ?',
    options: ['20', '14', '17'],
    cols: 3,
    correct: 0,
    explain: 'On passe de 3 à 12 en multipliant par 4. Le même coefficient de proportionnalité donne 5 × 4 = 20.',
  },
  {
    id: 'p4-d3-pourcentage',
    skill: 'pourcentage',
    points: 2,
    requires: ['pourcentage'],
    prompt: 'Combien font 25 % de 80 € ?',
    options: ['20 €', '25 €', '32 €'],
    cols: 3,
    correct: 0,
    explain: '25 %, c’est le quart : 80 ÷ 4 = 20 €.',
  },
  {
    id: 'p4-d4-remise',
    skill: 'pourcentage',
    points: 2,
    requires: ['pourcentage'],
    prompt: 'Un article à 60 € subit une remise de 10 €. Quel pourcentage de remise cela fait-il ?',
    options: ['Environ 17 %', '10 %', '6 %'],
    cols: 3,
    correct: 0,
    explain: '10 ÷ 60 ≈ 0,167, soit environ 17 % du prix de départ.',
  },
  {
    id: 'p4-d5-graphique',
    skill: 'lecture',
    points: 2,
    requires: ['graphique-proportionnalite'],
    prompt: 'Sur un graphique, comment reconnaît-on une situation proportionnelle ?',
    options: [
      'Les points sont alignés et la droite passe par le point (0 ; 0)',
      'Les points sont alignés, où qu’ils soient',
      'Les points montent',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’alignement ne suffit pas : il faut aussi que la droite passe par le point (0 ; 0).',
  },
  {
    id: 'p4-d6-quotient',
    skill: 'lecture',
    points: 2,
    requires: ['quotient'],
    prompt: '7 cahiers coûtent 21 €. Combien coûte un cahier ?',
    options: ['3 €', '14 €', '2,80 €'],
    cols: 3,
    correct: 0,
    explain: '21 ÷ 7 = 3 € : le prix d’un seul objet s’obtient par une division.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Cinq acquis de 5e, vérifiés en cinq minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Six questions rapides sur la proportionnalité de 5e. Rien n’est noté, rien ne bloque :
            elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
