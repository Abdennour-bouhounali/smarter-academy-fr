import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucun demi-tour, aucun centre, aucune
 * symétrie centrale. Tout ici vient de la 6e — milieu d'un segment, notation
 * [AB], axe de symétrie, perpendiculaires.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  milieu: { label: 'Milieu et segment', emoji: '📏' },
  symetrie: { label: 'Symétrie axiale', emoji: '🪞' },
  figures: { label: 'Figures planes', emoji: '🔷' },
};

const QUESTIONS = [
  {
    id: 'tr5-d1-milieu',
    skill: 'milieu',
    points: 2,
    requires: ['milieu-segment'],
    prompt: 'Le point I est le milieu du segment [AB]. Que peut-on dire des longueurs IA et IB ?',
    options: ['IA = IB', 'IA est le double de IB', 'On ne peut pas savoir'],
    cols: 3,
    correct: 0,
    explain: 'Le milieu partage le segment en deux morceaux de même longueur : IA = IB.',
  },
  {
    id: 'tr5-d2-milieu',
    skill: 'milieu',
    points: 2,
    requires: ['milieu-segment', 'notation-segment'],
    prompt: 'Le segment [AB] mesure 8 cm et I en est le milieu. Combien mesure [AI] ?',
    options: ['4 cm', '8 cm', '16 cm'],
    cols: 3,
    correct: 0,
    explain: 'Le milieu coupe les 8 cm en deux parts égales : 8 ÷ 2 = 4 cm.',
  },
  {
    id: 'tr5-d3-milieu',
    skill: 'milieu',
    points: 2,
    requires: ['milieu-segment'],
    prompt: 'I est le milieu de [AB]. Les points A, I et B sont-ils alignés ?',
    options: ['Oui, toujours', 'Non, jamais', 'Seulement si le segment est horizontal'],
    cols: 3,
    correct: 0,
    explain: 'I est un point DU segment [AB] : il est donc forcément sur la droite (AB), avec A et B.',
  },
  {
    id: 'tr5-d4-symetrie',
    skill: 'symetrie',
    points: 2,
    requires: ['axe-symetrie'],
    prompt: 'Une figure est symétrique par rapport à une droite. Qu’a-t-on fait pour l’obtenir ?',
    options: ['On l’a pliée le long de la droite', 'On l’a agrandie', 'On l’a fait glisser'],
    cols: 3,
    correct: 0,
    explain: 'La symétrie axiale est un PLIAGE : la droite est l’axe, et les deux moitiés se superposent.',
  },
  {
    id: 'tr5-d5-symetrie',
    skill: 'symetrie',
    points: 2,
    requires: ['axe-symetrie'],
    prompt: 'Combien d’axes de symétrie a un carré ?',
    options: ['4', '2', '1'],
    cols: 3,
    correct: 0,
    explain: 'Les deux droites qui passent par les milieux des côtés opposés, et les deux diagonales : 4 axes de symétrie.',
  },
  {
    id: 'tr5-d6-figures',
    skill: 'figures',
    points: 2,
    requires: ['droites-perpendiculaires'],
    prompt: 'Deux droites perpendiculaires forment un angle de…',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Perpendiculaires signifie exactement : elles se coupent en formant un angle droit, de 90°.',
  },
  {
    id: 'tr5-d7-figures',
    skill: 'figures',
    points: 2,
    requires: ['notation-segment'],
    prompt: 'Que désigne l’écriture [AB] ?',
    options: ['Le segment d’extrémités A et B', 'La droite qui passe par A et B', 'La longueur de A à B'],
    cols: 3,
    correct: 0,
    explain: '[AB] est le SEGMENT ; (AB) serait la droite, et AB tout court la longueur.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      skills={SKILLS}
      questions={QUESTIONS}
      moduleTitle="Mission de départ"
      moduleSubtitle="Ce dont on va se servir"
      estimatedTime="4 min"
      brief={{
        title: 'Avant de faire tourner quoi que ce soit',
        body: (
          <p>
            Cette leçon va faire pivoter des figures autour d’un point. Pour cela, on aura besoin de
            trois choses déjà vues : le <strong>milieu d’un segment</strong>, la{' '}
            <strong>symétrie axiale</strong> (le pliage), et le vocabulaire des figures. Rien de
            nouveau ici — et aucune question ne bloque la suite.
          </p>
        ),
      }}
    />
  );
}
