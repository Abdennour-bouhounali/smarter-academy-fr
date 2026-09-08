import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucune somme des angles, aucune inégalité
 * triangulaire, aucune médiatrice. Tout ici vient de la 6e — mesurer un angle,
 * l'angle plat, le milieu d'un segment, les perpendiculaires, l'aire d'un
 * triangle.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  angles: { label: 'Angles', emoji: '📐' },
  segments: { label: 'Milieu et perpendiculaires', emoji: '📏' },
  aires: { label: 'Aire d’un triangle', emoji: '🔺' },
};

const QUESTIONS = [
  {
    id: 'tri5-d1-angles',
    skill: 'angles',
    points: 2,
    requires: ['angle-plat'],
    prompt: 'Combien mesure un angle plat ?',
    options: ['180°', '90°', '360°'],
    cols: 3,
    correct: 0,
    explain: 'Un angle plat a ses deux côtés alignés : il forme une droite, et mesure 180°.',
  },
  {
    id: 'tri5-d2-angles',
    skill: 'angles',
    points: 2,
    requires: ['mesure-angle'],
    prompt: 'Un angle mesure 35°. Est-il aigu, droit ou obtus ?',
    options: ['Aigu', 'Droit', 'Obtus'],
    cols: 3,
    correct: 0,
    explain: 'Un angle aigu mesure moins de 90°. À 90° il serait droit, et au-delà il serait obtus.',
  },
  {
    id: 'tri5-d3-angles',
    skill: 'angles',
    points: 2,
    requires: ['angle-plat', 'mesure-angle'],
    prompt: 'Deux angles côte à côte forment un angle plat. Le premier mesure 130°. Combien mesure le second ?',
    options: ['50°', '70°', '130°'],
    cols: 3,
    correct: 0,
    explain: 'Les deux doivent totaliser 180° : 180 − 130 = 50°.',
  },
  {
    id: 'tri5-d4-segments',
    skill: 'segments',
    points: 2,
    requires: ['milieu-segment'],
    prompt: 'Le point M est le milieu du segment [BC]. Que peut-on dire des longueurs BM et MC ?',
    options: ['BM = MC', 'BM est le double de MC', 'On ne peut pas savoir'],
    cols: 3,
    correct: 0,
    explain: 'Le milieu partage le segment en deux morceaux de même longueur : BM = MC.',
  },
  {
    id: 'tri5-d5-segments',
    skill: 'segments',
    points: 2,
    requires: ['droites-perpendiculaires'],
    prompt: 'Deux droites perpendiculaires se coupent en formant un angle de…',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Perpendiculaires signifie exactement : elles se coupent en formant un angle droit, de 90°.',
  },
  {
    id: 'tri5-d6-aires',
    skill: 'aires',
    points: 2,
    requires: ['aire-triangle'],
    prompt: 'Comment calcule-t-on l’aire d’un triangle ?',
    options: [
      'base × hauteur ÷ 2',
      'base × hauteur',
      'base + hauteur ÷ 2',
    ],
    cols: 3,
    correct: 0,
    explain: 'Un triangle est la moitié d’un rectangle de même base et de même hauteur : son aire vaut base × hauteur ÷ 2.',
  },
  {
    id: 'tri5-d7-aires',
    skill: 'aires',
    points: 2,
    requires: ['aire-triangle'],
    prompt: 'Un triangle a une base de 10 cm et une hauteur de 6 cm. Quelle est son aire ?',
    options: ['30 cm²', '60 cm²', '16 cm²'],
    cols: 3,
    correct: 0,
    explain: '10 × 6 = 60, puis 60 ÷ 2 = 30 cm². (60 cm² serait l’aire du rectangle entier.)',
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
        title: 'Avant d’attaquer le triangle',
        body: (
          <p>
            Cette leçon va mesurer des angles, chercher des milieux et comparer des aires. Pour
            cela, on aura besoin de quatre choses déjà vues : l’<strong>angle plat</strong>, le{' '}
            <strong>milieu d’un segment</strong>, les <strong>perpendiculaires</strong>, et l’
            <strong>aire d’un triangle</strong>. Aucune question ne bloque la suite.
          </p>
        ),
      }}
    />
  );
}
