import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucune sécante, aucun angle alterne-interne,
 * aucun correspondant. Tout ici vient de la 6e — mesurer un angle, le
 * vocabulaire aigu/droit/obtus, parallèles et perpendiculaires.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  mesurer: { label: 'Mesurer un angle', emoji: '📐' },
  vocabulaire: { label: 'Aigu, droit, obtus', emoji: '🔺' },
  droites: { label: 'Parallèles et perpendiculaires', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'an5-d1-mesurer',
    skill: 'mesurer',
    points: 2,
    requires: ['angle-droit'],
    prompt: 'Combien mesure un angle droit ?',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'L’angle droit — celui du coin d’une feuille — mesure 90°.',
  },
  {
    id: 'an5-d2-mesurer',
    skill: 'mesurer',
    points: 2,
    requires: ['angle-aigu-obtus'],
    prompt: 'Un angle plat, qui forme une ligne droite, mesure…',
    options: ['180°', '90°', '360°'],
    cols: 3,
    correct: 0,
    explain: 'Un angle plat vaut deux angles droits : 90° + 90° = 180°. Ses deux côtés forment une seule droite.',
  },
  {
    id: 'an5-d3-vocabulaire',
    skill: 'vocabulaire',
    points: 2,
    requires: ['angle-aigu-obtus'],
    prompt: 'Un angle de 130° est un angle…',
    options: ['obtus', 'aigu', 'droit'],
    cols: 3,
    correct: 0,
    explain: 'Au-dessus de 90° et en dessous de 180°, l’angle est OBTUS. En dessous de 90°, il serait aigu.',
  },
  {
    id: 'an5-d4-vocabulaire',
    skill: 'vocabulaire',
    points: 2,
    requires: ['angle-aigu-obtus'],
    prompt: 'Deux angles mesurent 55° et 125°. Combien font-ils ensemble ?',
    options: ['180°', '170°', '190°'],
    cols: 3,
    correct: 0,
    explain: '55 + 125 = 180. Ces deux angles mis côte à côte formeraient donc une ligne droite — on les dit supplémentaires.',
  },
  {
    id: 'an5-d5-droites',
    skill: 'droites',
    points: 2,
    requires: ['droites-paralleles'],
    prompt: 'Que peut-on dire de deux droites parallèles ?',
    options: [
      'Elles ne se coupent jamais, même prolongées très loin',
      'Elles se coupent en formant un angle droit',
      'Elles se coupent en un seul point',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux droites parallèles gardent toujours le même écartement : prolongées à l’infini, elles ne se rencontrent jamais.',
  },
  {
    id: 'an5-d6-droites',
    skill: 'droites',
    points: 2,
    requires: ['droites-perpendiculaires'],
    prompt: 'Deux droites perpendiculaires se coupent en formant un angle de…',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'Perpendiculaires signifie exactement : elles se croisent en formant un angle droit, de 90°.',
  },
  {
    id: 'an5-d7-droites',
    skill: 'droites',
    points: 2,
    requires: ['droites-paralleles', 'droites-perpendiculaires'],
    prompt: 'Deux droites sont chacune perpendiculaires à une même troisième droite. Que sont-elles entre elles ?',
    options: ['Parallèles', 'Perpendiculaires', 'Elles se croisent en un point'],
    cols: 3,
    correct: 0,
    explain: 'Deux droites perpendiculaires à une même droite partent dans la même direction : elles sont parallèles entre elles.',
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
        title: 'Avant de traquer le parallélisme',
        body: (
          <p>
            Cette leçon va mesurer des angles pour décider si deux droites sont parallèles. On aura
            donc besoin de trois choses déjà vues : <strong>mesurer un angle</strong>, le
            vocabulaire <strong>aigu / droit / obtus</strong>, et ce que veut dire{' '}
            <strong>parallèle</strong>. Rien de nouveau ici — et aucune question ne bloque la suite.
          </p>
        ),
      }}
    />
  );
}
