import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni issue, ni événement, ni équiprobabilité,
 * ni probabilité. Tout ici est de la 6e ou du début de la 5e — la fraction
 * comme part d'un tout, le passage fraction ↔ pourcentage, la comparaison de
 * deux fractions simples, et la lecture d'un tableau.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  parts: { label: 'Parts d’un tout', emoji: '🍰' },
  ecritures: { label: 'Fractions et %', emoji: '🔁' },
  lire: { label: 'Lire des données', emoji: '👀' },
};

const QUESTIONS = [
  {
    id: 'prob5-d1-fraction',
    skill: 'parts',
    points: 2,
    requires: ['fraction-part'],
    prompt: 'Un sachet contient 8 bonbons, dont 2 à la fraise. Quelle part des bonbons est à la fraise ?',
    options: ['2/8', '8/2', '2/6'],
    cols: 3,
    correct: 0,
    explain: 'La part s’écrit « ce qui nous intéresse » sur « le total » : 2 sur 8, donc 2/8 (soit un quart).',
  },
  {
    id: 'prob5-d2-pourcentage',
    skill: 'ecritures',
    points: 2,
    requires: ['fraction-pourcentage'],
    prompt: 'La fraction 1/4 correspond à quel pourcentage ?',
    options: ['25 %', '14 %', '40 %'],
    cols: 3,
    correct: 0,
    explain: 'Un quart de 100, c’est 25 : la fraction 1/4 vaut 25 %.',
  },
  {
    id: 'prob5-d3-moitie',
    skill: 'ecritures',
    points: 2,
    requires: ['fraction-pourcentage'],
    prompt: 'Quelle écriture ne vaut PAS la moitié ?',
    options: ['3/5', '1/2', '50 %'],
    cols: 3,
    correct: 0,
    explain: '1/2 et 50 % sont deux écritures de la moitié. 3/5 vaut 60 %, un peu plus que la moitié.',
  },
  {
    id: 'prob5-d4-comparer',
    skill: 'parts',
    points: 2,
    requires: ['comparer-fractions'],
    prompt: 'Quelle fraction est la plus grande : 1/3 ou 1/6 ?',
    options: ['1/3', '1/6', 'Elles sont égales'],
    cols: 3,
    correct: 0,
    explain: 'Plus on partage en un grand nombre de parts, plus chaque part est petite. Un tiers est donc plus grand qu’un sixième.',
  },
  {
    id: 'prob5-d5-tableau',
    skill: 'lire',
    points: 2,
    requires: ['lire-tableau'],
    prompt: 'Un tableau indique que sur 50 lancers, « Pile » est sorti 27 fois. Quelle fréquence cela fait-il ?',
    options: ['27/50', '50/27', '27/100'],
    cols: 3,
    correct: 0,
    explain: 'On écrit ce qu’on a compté sur le total : 27 sorties de Pile sur 50 lancers, donc 27/50.',
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
            Avant de lancer le premier dé, un tour de tes outils : reconnaître une part d’un
            tout, passer d’une fraction à un pourcentage, comparer deux fractions et lire une
            fréquence. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
