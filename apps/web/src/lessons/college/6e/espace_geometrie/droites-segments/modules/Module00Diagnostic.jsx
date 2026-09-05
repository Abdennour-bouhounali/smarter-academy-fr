import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels (coursesData.js, 6e_droites_segments) : « Repérage
 * dans le plan » et « Figures géométriques ». On ne teste QUE ces acquis —
 * jamais la distinction droite/segment/demi-droite, qui est l'objet même de
 * la leçon.
 */
const SKILLS = {
  reperage: { label: 'Repérage dans le plan', emoji: '🗺️' },
  figures: { label: 'Figures géométriques', emoji: '🔷' },
};

const QUESTIONS = [
  {
    id: 'q1-coords',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Dans l’écriture <strong className="font-mono">(4 ; 2)</strong>, que commande le premier nombre ?
      </>
    ),
    options: ['Le déplacement horizontal', 'Le déplacement vertical', 'La taille du point'],
    cols: 1,
    correct: 0,
    explain: 'Le premier nombre se lit sur l’axe horizontal, le second sur l’axe vertical.',
  },
  {
    id: 'q2-alignes',
    skill: 'reperage',
    points: 2,
    prompt: (
      <>
        Trois points sont en <span className="font-mono">(1 ; 3)</span>,{' '}
        <span className="font-mono">(4 ; 3)</span> et <span className="font-mono">(6 ; 3)</span>. Ils sont…
      </>
    ),
    options: ['À la même hauteur', 'À des hauteurs différentes', 'Au même endroit'],
    cols: 1,
    correct: 0,
    explain: 'Leur seconde coordonnée est la même (3) : ils sont donc tous à la même hauteur.',
  },
  {
    id: 'q3-cotes',
    skill: 'figures',
    points: 2,
    prompt: <>Combien de côtés a un triangle ?</>,
    options: ['3 côtés', '4 côtés', 'Cela dépend du triangle'],
    cols: 3,
    correct: 0,
    explain: 'Un triangle a toujours exactement 3 côtés et 3 sommets.',
  },
  {
    id: 'q4-sommet',
    skill: 'figures',
    points: 2,
    prompt: <>Dans une figure, un <strong>sommet</strong> est…</>,
    options: [
      'Un point où deux côtés se rejoignent',
      'Le côté le plus long',
      'Le point le plus haut de la figure',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un sommet est un point de rencontre entre deux côtés — sa position en hauteur n’a rien à voir.',
  },
  {
    id: 'q5-trait',
    skill: 'figures',
    points: 2,
    prompt: <>Pour tracer un trait bien droit entre deux points, quel instrument utilises-tu ?</>,
    options: ['La règle', 'Le compas', 'Le rapporteur'],
    cols: 3,
    correct: 0,
    explain: 'La règle sert à tracer des traits droits ; le compas trace des cercles, le rapporteur mesure des angles.',
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
            Avant d’explorer les droites, vérifions deux bases : savoir se repérer dans le plan et connaître
            le vocabulaire des figures. Ce n’est pas un examen — tu pourras continuer quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
