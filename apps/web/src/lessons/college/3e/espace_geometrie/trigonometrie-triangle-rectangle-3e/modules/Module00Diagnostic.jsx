import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_trigonometrie') : « Triangles »,
 * « Angles », « Pythagore », « Fractions ». On teste donc l'hypoténuse, la
 * somme des angles aigus, un quotient et son arrondi — jamais sinus, cosinus
 * ou tangente, qui sont le contenu de la leçon.
 */
const SKILLS = {
  triangle: { label: 'Triangle rectangle', emoji: '📐' },
  angles: { label: 'Angles', emoji: '🔺' },
  calcul: { label: 'Quotients', emoji: '➗' },
};

const QUESTIONS = [
  {
    id: 'tg-d1-hypotenuse',
    skill: 'triangle',
    requires: ['triangle-rectangle', 'hypotenuse', 'angle-droit'],
    points: 2,
    prompt: 'Dans un triangle rectangle, l’hypoténuse est le côté…',
    options: ['opposé à l’angle droit', 'le plus court', 'toujours horizontal'],
    cols: 1,
    correct: 0,
    explain: 'L’hypoténuse fait face à l’angle droit. C’est aussi le plus long des trois côtés, quelle que soit l’orientation du dessin.',
  },
  {
    id: 'tg-d2-somme-aigus',
    skill: 'angles',
    requires: ['somme-angles-triangle'],
    points: 2,
    prompt: 'Dans un triangle rectangle, un angle aigu mesure 32°. Combien mesure l’autre ?',
    options: ['58°', '148°', '68°'],
    cols: 3,
    correct: 0,
    explain: 'Les deux angles aigus se partagent les 90° restants : 90 − 32 = 58°.',
  },
  {
    id: 'tg-d3-pythagore',
    skill: 'triangle',
    requires: ['triangle-rectangle'],
    points: 2,
    prompt: 'Les côtés de l’angle droit mesurent 6 et 8. Combien mesure l’hypoténuse ?',
    options: ['10', '14', '48'],
    cols: 3,
    correct: 0,
    explain: '6² + 8² = 36 + 64 = 100, donc l’hypoténuse vaut √100 = 10.',
  },
  {
    id: 'tg-d4-quotient',
    skill: 'calcul',
    requires: ['quotient', 'arrondi'],
    points: 2,
    prompt: 'Combien vaut 3 ÷ 5 ?',
    options: ['0,6', '1,67', '15'],
    cols: 3,
    correct: 0,
    explain: '3 ÷ 5 = 0,6. Attention au sens : 5 ÷ 3 donnerait environ 1,67.',
  },
  {
    id: 'tg-d5-arrondi',
    skill: 'calcul',
    requires: ['quotient', 'arrondi'],
    points: 2,
    prompt: 'Arrondi au dixième, que vaut 6,873 ?',
    options: ['6,9', '6,8', '7'],
    cols: 3,
    correct: 0,
    explain: 'Le chiffre des centièmes est 7, donc on arrondit au-dessus : 6,9.',
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
            Avant de mesurer des pentes, un tour de tes outils : le triangle rectangle, les angles
            et les quotients. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
