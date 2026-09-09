import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les cinq `priorKnowledge` de lesson.config.js et rien de la
 * matière de la leçon : aucune coordonnée, aucun repère, aucun quadrant.
 * Tout vient de la 6e (lecture d'un quadrillage, abscisse sur une droite) et
 * de la leçon voisine « Nombres relatifs » de 5e (signe, ordre).
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '➖' },
  droite: { label: 'Droite graduée', emoji: '📏' },
  quadrillage: { label: 'Quadrillage', emoji: '🗺️' },
};

const QUESTIONS = [
  {
    id: 'rep5-d1-relatifs',
    skill: 'relatifs',
    points: 2,
    requires: ['nombres-relatifs'],
    prompt: 'Sur une droite graduée, où se trouve le nombre −4 par rapport à 0 ?',
    options: ['À gauche de 0', 'À droite de 0', 'Au même endroit que 0'],
    cols: 3,
    correct: 0,
    explain: 'Un nombre négatif se place à gauche de l’origine : le signe dit de quel côté de 0 on est.',
  },
  {
    id: 'rep5-d2-ordre',
    skill: 'relatifs',
    points: 2,
    requires: ['ordre-nombres', 'nombres-relatifs'],
    prompt: 'Quel est le plus grand : −2 ou −7 ?',
    options: ['−2', '−7', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: '−2 est plus à droite que −7 sur la droite graduée : c’est donc le plus grand, même si 7 est plus grand que 2.',
  },
  {
    id: 'rep5-d3-droite',
    skill: 'droite',
    points: 2,
    requires: ['abscisse'],
    prompt: 'Sur une droite graduée d’origine 0 et de pas 1, quel nombre se trouve 3 graduations à droite de 0 ?',
    options: ['3', '−3', '13'],
    cols: 3,
    correct: 0,
    explain: 'Trois graduations vers la droite depuis l’origine : le nombre est 3.',
  },
  {
    id: 'rep5-d4-droite',
    skill: 'droite',
    points: 2,
    requires: ['abscisse', 'calcul-numerique'],
    prompt: 'Sur une droite graduée, on lit 0 puis 2 après 4 graduations. Combien vaut UNE graduation ?',
    options: ['0,5', '2', '4'],
    cols: 3,
    correct: 0,
    explain: 'L’écart 2 est partagé en 4 graduations : 2 ÷ 4 = 0,5. Une graduation ne vaut pas toujours 1.',
  },
  {
    id: 'rep5-d5-quadrillage',
    skill: 'quadrillage',
    points: 2,
    requires: ['lecture-quadrillage'],
    prompt: 'Sur un plan de ville, pour retrouver une rue on donne une lettre ET un chiffre (comme « C4 »). Pourquoi deux informations ?',
    options: [
      'Parce qu’une seule ne suffit pas à désigner une case',
      'Parce que c’est plus joli',
      'Parce que la lettre est le nom de la rue',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une lettre seule désigne toute une colonne, un chiffre seul toute une ligne. Il en faut deux pour désigner une case.',
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
            Avant de partir sur les pistes, un tour de tes outils : les nombres relatifs, la
            droite graduée et la lecture d’un plan. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
