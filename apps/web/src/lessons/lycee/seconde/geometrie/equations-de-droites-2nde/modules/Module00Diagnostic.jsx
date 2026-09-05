import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (clé 'seconde_equations_de_droites') : « Fonctions
 * affines », « Vecteurs », « Repérage dans le plan ». On teste donc lire un
 * point, les coordonnées de AB, la colinéarité (leçon précédente), une image
 * par une fonction affine et son coefficient — jamais l'équation d'une
 * droite, qui est le contenu de la leçon.
 */
const SKILLS = {
  repere: { label: 'Repérage', emoji: '🗺️' },
  vecteurs: { label: 'Vecteurs', emoji: '➡️' },
  affine: { label: 'Fonction affine', emoji: '📈' },
};

const QUESTIONS = [
  {
    id: 'eq-d1-lire',
    skill: 'repere',
    points: 2,
    prompt: 'Un point est 3 graduations à droite de l’origine et 2 en dessous. Ses coordonnées ?',
    options: ['(3 ; −2)', '(−2 ; 3)', '(−3 ; 2)'],
    cols: 3,
    correct: 0,
    explain: 'À droite : abscisse positive (3). En dessous : ordonnée négative (−2).',
  },
  {
    id: 'eq-d2-ab',
    skill: 'vecteurs',
    points: 2,
    prompt: 'A (−1 ; 3) et B (2 ; 1). Coordonnées du vecteur AB ?',
    options: ['(3 ; −2)', '(−3 ; 2)', '(1 ; 4)'],
    cols: 3,
    correct: 0,
    explain: 'Arrivée moins départ : 2 − (−1) = 3 et 1 − 3 = −2.',
  },
  {
    id: 'eq-d3-colineaires',
    skill: 'vecteurs',
    points: 2,
    prompt: 'u (2 ; −1) et v (−4 ; 2). Sont-ils colinéaires ?',
    options: ['Oui : v = −2·u', 'Non : ils sont de sens contraires', 'Non : v est plus long'],
    cols: 1,
    correct: 0,
    explain: 'v = −2·u : même direction, sens contraire, deux fois plus long — colinéaires. det = 2 × 2 − (−1) × (−4) = 0.',
  },
  {
    id: 'eq-d4-image',
    skill: 'affine',
    points: 2,
    prompt: 'f(x) = 2x + 1. Que vaut f(3) ?',
    options: ['7', '6', '5'],
    cols: 3,
    correct: 0,
    explain: 'f(3) = 2 × 3 + 1 = 7.',
  },
  {
    id: 'eq-d5-coef',
    skill: 'affine',
    points: 2,
    prompt: 'Dans f(x) = −3x + 2, le coefficient directeur est…',
    options: ['−3', '2', '−3x'],
    cols: 3,
    correct: 0,
    explain: 'Le coefficient directeur est le nombre qui multiplie x : −3. Le 2 est l’ordonnée à l’origine.',
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
            Cette leçon s’appuie sur le repérage, les vecteurs de la leçon précédente et la fonction
            affine du collège. Un tour rapide avant de partir. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
