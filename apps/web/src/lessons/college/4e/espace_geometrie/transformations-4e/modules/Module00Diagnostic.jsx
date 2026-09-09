import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — le demi-tour de 5e et
 * son centre, la construction d'une image, les invariants d'une
 * transformation, et le vocabulaire de géométrie plane de 6e dont la leçon se
 * sert sans le réenseigner — et RIEN de la matière de cette leçon : ni
 * glissement, ni translation, ni parallélogramme-image.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  demiTour: { label: 'Le demi-tour de 5e', emoji: '🔄' },
  figures: { label: 'Vocabulaire des figures', emoji: '📐' },
  mesures: { label: 'Longueurs et aires', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'tr4-d1-demi-tour',
    skill: 'demiTour',
    points: 2,
    requires: ['symetrie-centrale'],
    prompt: 'Une figure subit une symétrie centrale. Comment se retrouve sa copie ?',
    options: [
      'Retournée, comme si on avait fait faire un demi-tour à la feuille',
      'Exactement dans la même position, juste plus loin',
      'Plus grande que la figure de départ',
    ],
    cols: 1,
    correct: 0,
    explain: 'La symétrie centrale est un demi-tour autour d’un point : la copie se retrouve « la tête en bas » par rapport à l’originale.',
  },
  {
    id: 'tr4-d2-centre',
    skill: 'demiTour',
    points: 2,
    requires: ['symetrie-centrale', 'milieu-segment'],
    prompt: 'M’ est le symétrique de M par rapport au point O. Que représente O pour le segment [M M’] ?',
    options: ['Son milieu', 'Une de ses extrémités', 'Un point quelconque de ce segment'],
    cols: 3,
    correct: 0,
    explain: 'Le centre de symétrie est toujours le milieu du segment qui joint un point à son symétrique.',
  },
  {
    id: 'tr4-d3-construire',
    skill: 'demiTour',
    points: 2,
    requires: ['construire-image', 'invariants-symetrie'],
    prompt: 'Pour construire la copie d’un triangle par une transformation, que suffit-il de construire ?',
    options: [
      'L’image de ses trois sommets, puis on relie',
      'L’image de tous les points du triangle, un par un',
      'L’image de son centre seulement',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les côtés sont des segments : une fois les trois sommets images placés, il ne reste qu’à les relier dans le même ordre.',
  },
  {
    id: 'tr4-d4-parallelogramme',
    skill: 'figures',
    points: 2,
    requires: ['parallelogramme', 'droites-paralleles', 'quadrilatere'],
    prompt: 'Qu’est-ce qui caractérise un parallélogramme ?',
    options: [
      'Ses côtés opposés sont parallèles deux à deux',
      'Ses quatre côtés ont la même longueur',
      'Il possède au moins un angle droit',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est sa définition : les côtés opposés sont parallèles deux à deux. Quatre côtés de même longueur ou un angle droit sont des conditions supplémentaires, qui décrivent des figures plus particulières.',
  },
  {
    id: 'tr4-d5-diagonales',
    skill: 'figures',
    points: 2,
    requires: ['diagonale', 'milieu-segment', 'parallelogramme'],
    prompt: 'Dans un parallélogramme, que peut-on dire des deux diagonales ?',
    options: [
      'Elles se coupent en leur milieu',
      'Elles ont toujours la même longueur',
      'Elles ont toujours le même point de départ',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les diagonales d’un parallélogramme se coupent en leur milieu — c’est vrai pour tous les parallélogrammes. Avoir la même longueur, en revanche, est une condition supplémentaire que tous ne remplissent pas.',
  },
  {
    id: 'tr4-d6-notation',
    skill: 'figures',
    points: 2,
    requires: ['notation-segment', 'axe-symetrie'],
    prompt: 'Que désigne l’écriture [AB] ?',
    options: [
      'Le segment d’extrémités A et B',
      'La droite qui passe par A et par B',
      'La longueur du chemin de A à B, en centimètres',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les crochets désignent le segment. Sans crochets, AB désigne sa longueur ; avec des parenthèses, (AB) désigne la droite.',
  },
  {
    id: 'tr4-d7-aire',
    skill: 'mesures',
    points: 2,
    requires: ['aire', 'perimetre'],
    prompt: 'On découpe une figure en papier et on la pose ailleurs sur la table, sans la plier. Son aire…',
    options: [
      '…ne change pas',
      '…augmente si on la pose plus loin',
      '…dépend de l’endroit où on la pose',
    ],
    cols: 1,
    correct: 0,
    explain: 'Déplacer une figure ne change ni son aire ni son périmètre : c’est la même surface de papier, posée ailleurs.',
  },
  {
    id: 'tr4-d8-angle',
    skill: 'mesures',
    points: 2,
    requires: ['angle-droit'],
    prompt: 'Combien mesure un angle droit ?',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Un angle droit mesure 90°, soit le quart d’un tour complet.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Le demi-tour de 5e et le vocabulaire des figures, vérifiés en cinq minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Huit questions rapides sur la transformation vue en 5e et sur le vocabulaire des
            figures. Rien n’est noté, rien ne bloque : elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
