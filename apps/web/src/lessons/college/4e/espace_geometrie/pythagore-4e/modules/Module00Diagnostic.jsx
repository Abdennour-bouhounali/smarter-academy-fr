import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — l'angle droit, l'aire
 * d'un carré, le carré d'un nombre, la racine carrée et son encadrement — et
 * RIEN de la matière de la leçon : ni hypoténuse, ni égalité des aires, ni
 * théorème.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  angle: { label: 'Angle droit', emoji: '📐' },
  aire: { label: 'Aire d’un carré', emoji: '⬜' },
  racine: { label: 'Carrés et racines', emoji: '√' },
};

const QUESTIONS = [
  {
    id: 'py4-d1-angle',
    skill: 'angle',
    points: 2,
    requires: ['angle-droit'],
    prompt: 'Combien mesure un angle droit ?',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Un angle droit mesure 90°, et se marque par un petit carré au sommet.',
  },
  {
    id: 'py4-d2-aire',
    skill: 'aire',
    points: 2,
    requires: ['aire'],
    prompt: 'Quelle est l’aire d’un carré de côté 7 cm ?',
    options: ['49 cm²', '28 cm²', '14 cm²'],
    cols: 3,
    correct: 0,
    explain: 'L’aire d’un carré est le côté multiplié par lui-même : 7 × 7 = 49 cm². (28 serait la longueur du tour.)',
  },
  {
    id: 'py4-d3-carre',
    skill: 'racine',
    points: 2,
    requires: ['carre-ou-pas'],
    prompt: 'Combien vaut 12² ?',
    options: ['144', '24', '121'],
    cols: 3,
    correct: 0,
    explain: '12² = 12 × 12 = 144. (24 serait 12 × 2.)',
  },
  {
    id: 'py4-d4-racine',
    skill: 'racine',
    points: 2,
    requires: ['racine-carree'],
    prompt: 'Quel nombre positif, multiplié par lui-même, donne 64 ?',
    options: ['8', '32', '64'],
    cols: 3,
    correct: 0,
    explain: '8 × 8 = 64. C’est la racine carrée de 64.',
  },
  {
    id: 'py4-d5-encadrer',
    skill: 'racine',
    points: 2,
    requires: ['encadrer-une-racine'],
    prompt: 'Entre quels deux nombres entiers se trouve la racine carrée de 30 ?',
    options: ['Entre 5 et 6', 'Entre 4 et 5', 'Entre 6 et 7'],
    cols: 1,
    correct: 0,
    explain: '5 × 5 = 25 et 6 × 6 = 36 : 30 est entre les deux, donc sa racine carrée aussi.',
  },
  {
    id: 'py4-d6-aire-figure',
    skill: 'aire',
    points: 2,
    requires: ['aire', 'carre-ou-pas'],
    prompt: 'Un carré a une aire de 81 cm². Combien mesure son côté ?',
    options: ['9 cm', '81 cm', '40,5 cm'],
    cols: 3,
    correct: 0,
    explain: 'On cherche le nombre qui, multiplié par lui-même, donne 81 : c’est 9.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Angle droit, aire d’un carré, racine carrée"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Six questions rapides. Rien n’est noté, rien ne bloque : elles servent à savoir
            par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
