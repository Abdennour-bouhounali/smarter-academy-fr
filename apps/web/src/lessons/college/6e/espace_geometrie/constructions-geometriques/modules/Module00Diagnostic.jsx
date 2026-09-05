import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (données seules ; moteur dans le kit).
 *
 * Prérequis officiels : « Droites et segments », « Parallélisme et
 * perpendicularité », « Figures planes ». On ne teste QUE ces acquis —
 * jamais l'usage des instruments, objet de la leçon.
 */
const SKILLS = {
  droites: { label: 'Droites et segments', emoji: '📏' },
  relations: { label: 'Parallèles et perpendiculaires', emoji: '🛤️' },
  figures: { label: 'Figures planes', emoji: '🔷' },
};

const QUESTIONS = [
  {
    id: 'q1-notation',
    skill: 'droites',
    points: 2,
    prompt: <>Que désigne l’écriture <strong className="font-mono">[AB]</strong> ?</>,
    options: ['Le segment d’extrémités A et B', 'La droite passant par A et B', 'La demi-droite d’origine A'],
    cols: 1,
    correct: 0,
    explain: 'Deux crochets : ça s’arrête des deux côtés — c’est le segment.',
  },
  {
    id: 'q2-milieu',
    skill: 'droites',
    points: 2,
    prompt: <>Le milieu M d’un segment [AB] vérifie…</>,
    options: ['M est sur [AB] et AM = MB', 'AM = MB seulement', 'M est n’importe où entre A et B'],
    cols: 1,
    correct: 0,
    explain: 'Deux conditions : appartenir au segment ET être à égale distance des extrémités.',
  },
  {
    id: 'q3-perp',
    skill: 'relations',
    points: 2,
    prompt: <>Deux droites perpendiculaires forment un angle de…</>,
    options: ['45°', '90°', '180°'],
    cols: 3,
    correct: 1,
    explain: 'La perpendicularité, c’est exactement l’angle droit : 90°.',
  },
  {
    id: 'q4-paralleles',
    skill: 'relations',
    points: 2,
    prompt: <>Deux droites parallèles…</>,
    options: [
      'Gardent le même écart et ne se coupent jamais',
      'Se coupent en un point',
      'Forment un angle droit',
    ],
    cols: 1,
    correct: 0,
    explain: 'Écart constant, aucun point commun : c’est la définition du parallélisme.',
  },
  {
    id: 'q5-rectangle',
    skill: 'figures',
    points: 2,
    prompt: <>Un rectangle possède…</>,
    options: ['4 angles droits', '4 côtés égaux', '3 côtés'],
    cols: 3,
    correct: 0,
    explain: 'Le rectangle se définit par ses 4 angles droits. Le carré en est un cas particulier.',
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
            Construire, c’est réaliser des propriétés qu’on connaît déjà. Vérifions-les : segments,
            relations entre droites, figures. Ce n’est pas un examen — tu pourras continuer quel que soit
            ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
