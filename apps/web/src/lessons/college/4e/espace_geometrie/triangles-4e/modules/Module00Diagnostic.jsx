import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — les médiatrices et le
 * cercle circonscrit, la somme des angles, l'inégalité triangulaire (5e), plus
 * le milieu d'un segment, les droites parallèles, la notation [AB] et l'angle
 * droit (6e) — et RIEN de la matière de la leçon : ni caractérisation, ni
 * droite des milieux, ni réciproque, ni démonstration.
 *
 * Il ne touche pas non plus au théorème de Pythagore : c'est la leçon SŒUR, et
 * cette leçon-ci n'en dépend pas.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  cercle: { label: 'Cercle circonscrit', emoji: '⭕' },
  angles: { label: 'Angles du triangle', emoji: '📐' },
  plan: { label: 'Vocabulaire du plan', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'tg4-d1-mediatrices',
    skill: 'cercle',
    points: 2,
    requires: ['mediatrices-cercle-circonscrit', 'mediatrice'],
    prompt: 'Où se coupent les trois médiatrices d’un triangle ?',
    options: [
      'Au centre du cercle qui passe par les trois sommets',
      'Au milieu du plus grand côté',
      'Au sommet du plus grand angle',
      'Elles ne se coupent pas toujours',
    ],
    cols: 1,
    correct: 0,
    explain: 'Elles se coupent en un même point, à égale distance des trois sommets : c’est le centre du cercle circonscrit.',
  },
  {
    id: 'tg4-d1b-mediatrice',
    skill: 'plan',
    points: 2,
    requires: ['mediatrice', 'droites-perpendiculaires', 'milieu-segment'],
    prompt: 'La médiatrice d’un segment [AB], c’est la droite qui…',
    options: [
      'passe par le milieu de [AB] et lui est perpendiculaire',
      'passe par A et par B',
      'partage l’angle en A en deux parts égales',
      'est parallèle à [AB] et passe par son milieu',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux conditions à la fois : elle coupe [AB] en son milieu, et elle forme avec lui un angle droit. Tous ses points sont alors à égale distance de A et de B.',
  },
  {
    id: 'tg4-d2-somme',
    skill: 'angles',
    points: 2,
    requires: ['somme-angles-triangle'],
    prompt: 'Dans un triangle, deux angles mesurent 50° et 60°. Combien mesure le troisième ?',
    options: ['70°', '80°', '110°', '90°'],
    cols: 4,
    correct: 0,
    explain: 'La somme des trois angles vaut 180°. Ici, 180 − 50 − 60 = 70°.',
  },
  {
    id: 'tg4-d3-inegalite',
    skill: 'angles',
    points: 2,
    requires: ['inegalite-triangulaire'],
    prompt: 'Peut-on construire un triangle dont les côtés mesurent 3 cm, 4 cm et 9 cm ?',
    options: [
      'Non : 3 + 4 est plus petit que 9',
      'Oui, sans difficulté',
      'Oui, mais il sera très aplati',
      'Cela dépend des angles',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux petits côtés réunis (7 cm) n’atteignent pas le grand (9 cm) : les arcs de compas ne peuvent pas se croiser.',
  },
  {
    id: 'tg4-d4-milieu',
    skill: 'plan',
    points: 2,
    requires: ['milieu-segment', 'notation-segment'],
    prompt: 'M est le milieu du segment [AB], qui mesure 14 cm. Combien mesure AM ?',
    options: ['7 cm', '14 cm', '28 cm', 'On ne peut pas savoir'],
    cols: 4,
    correct: 0,
    explain: 'Le milieu partage le segment en deux parties de même longueur : 14 ÷ 2 = 7 cm. Les crochets de [AB] indiquent qu’il s’agit du segment.',
  },
  {
    id: 'tg4-d5-paralleles',
    skill: 'plan',
    points: 2,
    requires: ['droites-paralleles'],
    prompt: 'Deux droites parallèles, c’est…',
    options: [
      'Deux droites qui ne se coupent jamais',
      'Deux droites qui se coupent à angle droit',
      'Deux droites de même longueur',
      'Deux droites qui se coupent très loin',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux droites parallèles gardent partout le même écart : elles n’ont aucun point commun.',
  },
  {
    id: 'tg4-d6-angle-droit',
    skill: 'plan',
    points: 2,
    requires: ['angle-droit'],
    prompt: 'Combien mesure un angle droit ?',
    options: ['90°', '180°', '45°', '60°'],
    cols: 4,
    correct: 0,
    explain: 'Un angle droit mesure 90°, et se marque par un petit carré au sommet.',
  },
  {
    id: 'tg4-d6b-triangle-rectangle',
    skill: 'angles',
    points: 2,
    requires: ['triangle-rectangle', 'angle-droit'],
    prompt: 'Qu’est-ce qui fait qu’un triangle est un triangle rectangle ?',
    options: [
      'Il a un angle droit',
      'Il a trois côtés de même longueur',
      'Il a deux côtés de même longueur',
      'Il a la forme d’un rectangle',
    ],
    cols: 2,
    correct: 0,
    explain: 'Un seul angle droit suffit — et il ne peut pas y en avoir deux, puisque la somme des trois angles vaut 180°.',
  },
  {
    id: 'tg4-d6c-quadrilatere',
    skill: 'plan',
    points: 2,
    requires: ['quadrilatere', 'diagonale'],
    prompt: 'Dans un quadrilatère ABCD, qu’appelle-t-on une diagonale ?',
    options: [
      'Un segment joignant deux coins opposés, comme [AC]',
      'Un des quatre côtés',
      'Le segment joignant les milieux de deux côtés',
      'La droite qui coupe la figure en deux parts égales',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un quadrilatère est une figure à quatre côtés. Une diagonale relie deux coins qui ne sont PAS voisins : ce sont [AC] et [BD].',
  },
  {
    id: 'tg4-d7-cercle-rayon',
    skill: 'cercle',
    points: 2,
    requires: ['mediatrices-cercle-circonscrit'],
    prompt: 'Le cercle circonscrit d’un triangle a un rayon de 6 cm. À quelle distance du centre se trouve chacun des trois sommets ?',
    options: ['6 cm', '3 cm', '12 cm', 'Cela dépend du sommet'],
    cols: 4,
    correct: 0,
    explain: 'Le cercle circonscrit passe par les trois sommets : ils sont tous les trois à une distance du centre égale au rayon.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Cercle circonscrit, angles du triangle, vocabulaire du plan"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Dix questions rapides sur tes acquis de 5e et de 6e. Rien n’est noté, rien ne
            bloque : elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
