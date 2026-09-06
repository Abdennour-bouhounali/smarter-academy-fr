import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_triangles') : « Angles »,
 * « Droites et segments », « Parallélisme et perpendicularité ». On teste
 * donc lire un angle, reconnaître un angle droit, le vocabulaire des
 * segments et le parallélisme — jamais les propriétés des triangles
 * elles-mêmes, qui sont le contenu de la leçon.
 */
const SKILLS = {
  angles: { label: 'Angles', emoji: '📐' },
  traits: { label: 'Droites et segments', emoji: '📏' },
  relations: { label: 'Parallélisme', emoji: '🛤️' },
};

const QUESTIONS = [
  {
    id: 'tr-d1-angle-droit',
    skill: 'angles',
    requires: ['angle-droit'],
    points: 2,
    prompt: 'Combien mesure un angle droit ?',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Un angle droit mesure 90°. C’est le quart d’un tour complet, et on le marque par un petit carré.',
  },
  {
    id: 'tr-d2-angle-plat',
    skill: 'angles',
    requires: ['angle-droit'],
    points: 2,
    prompt: 'Un angle plat mesure 180°. Quel angle vaut la moitié d’un angle plat ?',
    options: ['Un angle droit', 'Un angle nul', 'Un angle de 45°'],
    cols: 3,
    correct: 0,
    explain: '180 ÷ 2 = 90 : c’est l’angle droit.',
  },
  {
    id: 'tr-d3-aigu',
    skill: 'angles',
    requires: ['angle-droit'],
    points: 2,
    prompt: 'Un angle qui mesure 52° est…',
    options: ['aigu (plus petit qu’un angle droit)', 'obtus (plus grand qu’un angle droit)', 'plat'],
    cols: 1,
    correct: 0,
    explain: '52° est inférieur à 90° : l’angle est aigu. Au-delà de 90° et jusqu’à 180°, il serait obtus.',
  },
  {
    id: 'tr-d4-segment',
    skill: 'traits',
    requires: ['notation-segment'],
    points: 2,
    prompt: 'Comment note-t-on la LONGUEUR du segment reliant A et B ?',
    options: ['AB', '[AB]', '(AB)'],
    cols: 3,
    correct: 0,
    explain: '[AB] désigne le segment lui-même, (AB) la droite, et AB (sans crochets) sa longueur.',
  },
  {
    id: 'tr-d5-paralleles',
    skill: 'relations',
    requires: ['droites-paralleles'],
    points: 2,
    prompt: 'Deux droites parallèles, c’est…',
    options: [
      'deux droites qui ne se coupent jamais',
      'deux droites qui se coupent à angle droit',
      'deux droites de même longueur',
    ],
    cols: 1,
    correct: 0,
    explain: 'Des droites parallèles gardent un écart constant et ne se rencontrent jamais. Se couper à angle droit, c’est être perpendiculaires.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de monter sur le chantier, un tour rapide de tes outils : les angles, le
            vocabulaire des segments et le parallélisme. <strong>Rien n’est bloquant</strong> — ce
            test sert seulement à te dire où faire attention.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
