import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels (coursesData.js, 6e_solides_patrons) : « Figures
 * planes » et « Longueurs ». On ne teste QUE ces acquis — jamais les solides
 * ni les patrons, objets de la leçon.
 */
const SKILLS = {
  figures: { label: 'Figures planes', emoji: '🔷' },
  longueurs: { label: 'Longueurs', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'q1-carre',
    skill: 'figures',
    points: 2,
    requires: ['figures-planes-usuelles'],
    prompt: <>Un carré possède…</>,
    options: ['4 côtés égaux et 4 angles droits', '4 côtés égaux seulement', '3 côtés'],
    cols: 1,
    correct: 0,
    explain: 'Les deux propriétés ensemble : 4 côtés égaux ET 4 angles droits.',
  },
  {
    id: 'q2-rectangle',
    skill: 'figures',
    points: 2,
    requires: ['figures-planes-usuelles'],
    prompt: <>Combien de côtés a un rectangle ?</>,
    options: ['3', '4', '6'],
    cols: 3,
    correct: 1,
    explain: 'Un rectangle a 4 côtés — deux longueurs et deux largeurs — et 4 coins.',
  },
  {
    id: 'q3-triangle',
    skill: 'figures',
    points: 2,
    requires: ['figures-planes-usuelles'],
    prompt: <>Une figure a 3 côtés. C’est…</>,
    options: ['Un triangle', 'Un carré', 'Un pentagone'],
    cols: 3,
    correct: 0,
    explain: '3 côtés ⇒ un triangle. Un carré en a 4, un pentagone 5.',
  },
  {
    id: 'q4-perimetre',
    skill: 'longueurs',
    points: 2,
    requires: ['perimetre', 'figures-planes-usuelles'],
    prompt: (
      <>
        Un carré a des côtés de <strong className="font-mono">5 cm</strong>. Quel est son périmètre ?
      </>
    ),
    options: ['10 cm', '20 cm', '25 cm'],
    cols: 3,
    correct: 1,
    explain: 'Le périmètre est la somme des longueurs des côtés : 5 × 4 = 20 cm.',
  },
  {
    id: 'q5-unites',
    skill: 'longueurs',
    points: 2,
    requires: ['unites-longueur'],
    prompt: <>Combien de centimètres dans <strong className="font-mono">1 mètre</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm.',
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
            Les solides sont faits de figures planes assemblées. Vérifions ces deux bases : les figures et
            les longueurs. Ce n’est pas un examen — tu pourras continuer quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
