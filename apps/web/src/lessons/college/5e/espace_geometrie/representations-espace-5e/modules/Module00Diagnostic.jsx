import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les six `priorKnowledge` de lesson.config.js et rien de la
 * matière de la leçon : aucune vue, aucune perspective cavalière, aucun
 * patron de prisme ni de cylindre. Tout vient de la 6e (« Solides et
 * patrons », « Figures planes »).
 *
 * `perimetre` est diagnostiqué avec soin : c'est de lui que dépendra la
 * découverte du module 5 (la bande a pour longueur le périmètre de la base).
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  solides: { label: 'Solides', emoji: '🧊' },
  patrons: { label: 'Patrons', emoji: '📐' },
  perimetre: { label: 'Périmètre', emoji: '⭕' },
};

const QUESTIONS = [
  {
    id: 're5-d1-solides',
    skill: 'solides',
    points: 2,
    requires: ['face-solide', 'arete', 'sommet-solide'],
    prompt: 'Sur un solide, qu’appelle-t-on une « arête » ?',
    options: [
      'Le segment où deux faces se rejoignent',
      'Une surface plate du solide',
      'Un coin du solide',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une arête est le segment commun à deux faces. La surface plate est une face, le coin est un sommet.',
  },
  {
    id: 're5-d2-solides',
    skill: 'solides',
    points: 2,
    requires: ['face-solide'],
    prompt: 'Combien de faces a un pavé droit ?',
    options: ['6', '8', '12'],
    cols: 3,
    correct: 0,
    explain: 'Un pavé droit a 6 faces rectangulaires. 8 est son nombre de sommets, 12 son nombre d’arêtes.',
  },
  {
    id: 're5-d3-patrons',
    skill: 'patrons',
    points: 2,
    requires: ['patron-solide'],
    prompt: 'Qu’est-ce que le patron d’un solide ?',
    options: [
      'La figure plane qui, pliée, redonne le solide',
      'Un dessin du solide en relief',
      'Une photographie du solide',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un patron est une figure plane à découper et à plier pour fabriquer le solide. Ce n’est ni un dessin en relief ni une photographie.',
  },
  {
    id: 're5-d4-perimetre',
    skill: 'perimetre',
    points: 2,
    requires: ['perimetre', 'figures-planes-usuelles'],
    prompt: 'Quel est le périmètre d’un triangle dont les trois côtés mesurent 6 cm ?',
    options: ['18 cm', '12 cm', '36 cm'],
    cols: 3,
    correct: 0,
    explain: 'Le périmètre est la somme des côtés : 6 + 6 + 6 = 18 cm.',
  },
  {
    id: 're5-d5-perimetre',
    skill: 'perimetre',
    points: 2,
    requires: ['perimetre', 'figures-planes-usuelles'],
    prompt: 'Le périmètre d’un disque (le tour du cercle), c’est environ combien de fois son diamètre ?',
    options: ['Un peu plus de 3 fois', 'Exactement 2 fois', 'Un peu moins de 1 fois'],
    cols: 1,
    correct: 0,
    explain: 'Le tour d’un cercle vaut environ 3,14 fois son diamètre. C’est toujours un peu plus de 3 fois, quel que soit le cercle.',
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
            Avant d’entrer dans l’atelier, un tour de tes outils : le vocabulaire des solides, les
            patrons, et le tour d’une figure. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
