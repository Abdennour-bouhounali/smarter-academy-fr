import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels (coursesData.js, 6e_symetrie) : « Repérage dans le
 * plan », « Figures planes », « Perpendicularité ». On ne teste QUE ces
 * acquis — jamais la symétrie elle-même, objet de la leçon.
 */
const SKILLS = {
  reperage: { label: 'Repérage dans le plan', emoji: '🗺️' },
  figures: { label: 'Figures planes', emoji: '🔷' },
  perpendicularite: { label: 'Perpendicularité', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'q1-coords',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Deux points ont pour coordonnées <span className="font-mono">(2 ; 5)</span> et{' '}
        <span className="font-mono">(6 ; 5)</span>. Que peut-on dire ?
      </>
    ),
    options: ['Ils sont à la même hauteur', 'Ils sont l’un au-dessus de l’autre', 'Ils sont confondus'],
    cols: 1,
    correct: 0,
    explain: 'Même seconde coordonnée (5) ⇒ même hauteur : ils sont alignés horizontalement.',
  },
  {
    id: 'q2-distance',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Sur une droite graduée, quelle est la distance entre les points d’abscisses{' '}
        <span className="font-mono">3</span> et <span className="font-mono">11</span> ?
      </>
    ),
    options: ['8', '14', '11'],
    cols: 3,
    correct: 0,
    explain: '11 − 3 = 8 : la distance est la différence entre les deux abscisses.',
  },
  {
    id: 'q3-carre',
    skill: 'figures',
    points: 2,
    prompt: <>Un carré possède…</>,
    options: [
      '4 côtés égaux et 4 angles droits',
      '4 côtés égaux seulement',
      '4 angles droits seulement',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux propriétés ensemble : 4 côtés égaux ET 4 angles droits.',
  },
  {
    id: 'q4-perp',
    skill: 'perpendicularite',
    points: 2,
    prompt: <>Deux droites perpendiculaires forment un angle de…</>,
    options: ['45°', '90°', '180°'],
    cols: 3,
    correct: 1,
    explain: 'La perpendicularité, c’est exactement l’angle droit : 90°.',
  },
  {
    id: 'q5-distance-droite',
    skill: 'perpendicularite',
    points: 2,
    prompt: <>Pour mesurer la distance d’un point à une droite, on mesure…</>,
    options: [
      'Perpendiculairement à la droite',
      'En diagonale, au plus court à l’œil',
      'Le long de la droite',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La distance d’un point à une droite se mesure toujours perpendiculairement : c’est le plus court chemin.',
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
            La symétrie s’appuie sur trois choses : se repérer, connaître les figures, et savoir mesurer
            perpendiculairement. Vérifions-les. Ce n’est pas un examen — tu pourras continuer quel que soit
            ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
