import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_reperage') : « Nombres
 * relatifs », « Repérage dans le plan », « Calcul numérique ». On teste donc
 * comparer et soustraire des relatifs, lire une graduation et calculer une
 * moyenne simple — jamais les coordonnées du plan elles-mêmes, qui sont le
 * contenu de la leçon.
 *
 * Jamais bloquant : le lien vers la suite est toujours actif.
 */
const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
  graduation: { label: 'Lire une graduation', emoji: '📏' },
  calcul: { label: 'Calcul numérique', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'rd-d1-comparer',
    skill: 'relatifs',
    points: 2,
    prompt: 'Quel nombre est le plus petit : −4 ou −7 ?',
    options: ['−7', '−4', 'ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: 'Sur une droite graduée, −7 est plus à gauche que −4 : il est donc plus petit. Chez les négatifs, plus le chiffre est grand, plus le nombre est petit.',
  },
  {
    id: 'rd-d2-soustraire',
    skill: 'relatifs',
    points: 2,
    prompt: 'Combien font 3 − (−2) ?',
    options: ['5', '1', '−5'],
    cols: 3,
    correct: 0,
    explain: 'Soustraire −2 revient à ajouter 2 : 3 + 2 = 5. C’est l’écart entre les deux nombres sur la droite graduée.',
  },
  {
    id: 'rd-d3-ecart',
    skill: 'relatifs',
    points: 2,
    prompt: 'Quel est l’écart entre −3 et 4 sur une droite graduée ?',
    options: ['7', '1', '−7'],
    cols: 3,
    correct: 0,
    explain: 'De −3 à 0 il y a 3 pas, puis de 0 à 4 il y en a 4 : soit 7 en tout. Un écart est toujours positif.',
  },
  {
    id: 'rd-d4-graduation',
    skill: 'graduation',
    points: 2,
    prompt: 'Sur une droite graduée de 0,5 en 0,5, quel nombre se trouve juste entre 2 et 3 ?',
    options: ['2,5', '2,3', '5'],
    cols: 3,
    correct: 0,
    explain: 'Le milieu de 2 et 3 est 2,5. Une graduation peut porter des nombres décimaux.',
  },
  {
    id: 'rd-d5-moyenne',
    skill: 'calcul',
    points: 2,
    prompt: 'Quelle est la moyenne de −2 et 6 ?',
    options: ['2', '4', '−4'],
    cols: 3,
    correct: 0,
    explain: 'On additionne puis on divise par 2 : (−2 + 6) ÷ 2 = 4 ÷ 2 = 2. C’est le nombre situé au milieu des deux.',
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
            Avant de partir explorer le parc, un petit tour de tes outils : les nombres relatifs, la
            lecture d’une graduation et un calcul de moyenne. <strong>Rien n’est bloquant</strong> —
            ce test sert seulement à te dire où faire attention.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
