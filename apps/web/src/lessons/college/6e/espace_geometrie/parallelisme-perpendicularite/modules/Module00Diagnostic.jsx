import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels (coursesData.js, 6e_paralleles_perpendiculaires) :
 * « Droites et segments » et « Angles ». On ne teste QUE ces acquis — jamais
 * le parallélisme ni la perpendicularité, objets de la leçon.
 */
const SKILLS = {
  droites: { label: 'Droites et segments', emoji: '📏' },
  angles: { label: 'Angles', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'q1-droite',
    skill: 'droites',
    points: 2,
    prompt: <>Combien d’extrémités possède une <strong>droite</strong> ?</>,
    options: ['Aucune', 'Une seule', 'Deux'],
    cols: 3,
    correct: 0,
    explain: 'Une droite continue sans fin des deux côtés : elle n’a aucune extrémité.',
  },
  {
    id: 'q2-notation',
    skill: 'droites',
    points: 2,
    prompt: (
      <>
        Que désigne l’écriture <strong className="font-mono">(AB)</strong> ?
      </>
    ),
    options: ['La droite passant par A et B', 'Le segment d’extrémités A et B', 'La demi-droite d’origine A'],
    cols: 1,
    correct: 0,
    explain: 'Deux parenthèses : rien ne s’arrête, c’est la droite. [AB] serait le segment, [AB) la demi-droite.',
  },
  {
    id: 'q3-angle-droit',
    skill: 'angles',
    points: 2,
    prompt: <>Combien mesure un <strong>angle droit</strong> ?</>,
    options: ['45°', '90°', '180°'],
    cols: 3,
    correct: 1,
    explain: 'Un angle droit mesure exactement 90° — c’est le coin d’une feuille de papier.',
  },
  {
    id: 'q4-comparer',
    skill: 'angles',
    points: 2,
    prompt: <>Un angle de <strong className="font-mono">70°</strong> est…</>,
    options: ['Plus petit qu’un angle droit', 'Plus grand qu’un angle droit', 'Égal à un angle droit'],
    cols: 1,
    correct: 0,
    explain: '70° < 90° : c’est un angle aigu, plus fermé qu’un angle droit.',
  },
  {
    id: 'q5-equerre',
    skill: 'angles',
    points: 2,
    prompt: <>Quel instrument sert à vérifier qu’un angle est bien droit ?</>,
    options: ['L’équerre', 'Le compas', 'La règle graduée'],
    cols: 3,
    correct: 0,
    explain: 'L’équerre porte un angle droit : on la pose sur l’angle pour le comparer.',
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
            Deux bases avant de commencer : ce qu’est une droite, et ce qu’est un angle droit. Ce n’est pas
            un examen — tu pourras continuer quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
