import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels (coursesData.js, 6e_figures_planes) : « Droites et
 * segments », « Angles », « Parallélisme et perpendicularité ». On ne teste
 * QUE ces acquis — jamais la caractérisation des figures, objet de la leçon.
 */
const SKILLS = {
  droites: { label: 'Droites et segments', emoji: '📏' },
  angles: { label: 'Angles', emoji: '📐' },
  relations: { label: 'Parallèles et perpendiculaires', emoji: '🛤️' },
};

const QUESTIONS = [
  {
    id: 'q1-segment',
    // Module 0 : uniquement des ids de priorKnowledge.
    requires: [],
    skill: 'droites',
    points: 2,
    prompt: <>Combien d’extrémités possède un <strong>segment</strong> ?</>,
    options: ['Aucune', 'Une seule', 'Deux'],
    cols: 3,
    correct: 2,
    explain: 'Un segment s’arrête des deux côtés : il a exactement deux extrémités.',
  },
  {
    id: 'q2-angle-droit',
    // Module 0 : uniquement des ids de priorKnowledge.
    requires: ['angle-droit'],
    skill: 'angles',
    points: 2,
    prompt: <>Un <strong>angle droit</strong> mesure…</>,
    options: ['45°', '90°', '180°'],
    cols: 3,
    correct: 1,
    explain: 'Un angle droit mesure exactement 90° — le coin d’une feuille.',
  },
  {
    id: 'q3-comparer-angles',
    // Module 0 : uniquement des ids de priorKnowledge.
    requires: ['angle-droit', 'angle-aigu-obtus'],
    skill: 'angles',
    points: 2,
    prompt: <>Un angle de <strong className="font-mono">120°</strong> est…</>,
    options: ['Plus fermé qu’un angle droit', 'Plus ouvert qu’un angle droit', 'Égal à un angle droit'],
    cols: 1,
    correct: 1,
    explain: '120° > 90° : l’angle est plus ouvert que l’angle droit. On dit qu’il est obtus.',
  },
  {
    id: 'q4-paralleles',
    // Module 0 : uniquement des ids de priorKnowledge.
    requires: ['droites-paralleles'],
    skill: 'relations',
    points: 2,
    prompt: <>Deux droites <strong>parallèles</strong>…</>,
    options: [
      'Ne se coupent jamais, même prolongées',
      'Se coupent en formant un angle droit',
      'Se coupent en un seul point',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux parallèles gardent le même écart partout : elles n’ont aucun point commun.',
  },
  {
    id: 'q5-perpendiculaires',
    // Module 0 : uniquement des ids de priorKnowledge.
    requires: ['droites-perpendiculaires', 'angle-droit'],
    skill: 'relations',
    points: 2,
    prompt: <>Deux droites <strong>perpendiculaires</strong> se coupent en formant…</>,
    options: ['Un angle droit', 'Un angle aigu', 'Aucun angle'],
    cols: 3,
    correct: 0,
    explain: 'La perpendicularité, c’est exactement l’angle droit — 90°, ni plus ni moins.',
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
            Les figures sont faites de segments, d’angles et de relations entre droites. Vérifions ces trois
            bases. Ce n’est pas un examen — tu pourras continuer quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
