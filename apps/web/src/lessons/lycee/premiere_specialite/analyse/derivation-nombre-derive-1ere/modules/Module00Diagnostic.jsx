import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * la notation f(x), la position d'un point par ses coordonnées, le coefficient
 * directeur d'une droite, le taux d'accroissement de 2de et l'écriture réduite
 * y = mx + p.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur le nombre dérivé, la tangente
 *   ni la limite — c'est la matière de la leçon, et la mesurer ici reviendrait
 *   à évaluer avant d'enseigner.
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     dv-d1  notation-fx, fonction, image
 *     dv-d2  abscisse, ordonnee
 *     dv-d3  coefficient-directeur
 *     dv-d4  taux-accroissement
 *     dv-d5  droite-equation-reduite
 */
const SKILLS = {
  fonctions: { label: 'Fonctions', emoji: 'ƒ' },
  reperage: { label: 'Repérage', emoji: '📍' },
  droites: { label: 'Droites', emoji: '📈' },
  taux: { label: 'Taux d’accroissement', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'dv-d1',
    requires: ['fonction', 'notation-fx', 'image'],
    skill: 'fonctions',
    points: 2,
    prompt: 'f(x) = x². Que vaut f(3) ?',
    options: ['9', '6', '3'],
    cols: 3,
    correct: 0,
    explain: 'f(3) = 3² = 9. On élève au carré, on ne multiplie pas par 2.',
  },
  {
    id: 'dv-d2',
    requires: ['abscisse', 'ordonnee'],
    skill: 'reperage',
    points: 2,
    prompt: 'Sur la courbe de f, un point a pour abscisse 2 et pour ordonnée 4. On l’écrit…',
    options: ['(2 ; 4)', '(4 ; 2)', '(2 ; 2)'],
    cols: 3,
    correct: 0,
    explain: 'On écrit toujours l’abscisse en premier, puis l’ordonnée : (2 ; 4).',
  },
  {
    id: 'dv-d3',
    requires: ['coefficient-directeur'],
    skill: 'droites',
    points: 2,
    prompt: 'Une droite passe par A(1 ; 2) et B(3 ; 8). Quel est son coefficient directeur ?',
    options: ['3', '6', '2'],
    cols: 3,
    correct: 0,
    explain: '(8 − 2) ÷ (3 − 1) = 6 ÷ 2 = 3. On divise la différence des ordonnées par celle des abscisses.',
  },
  {
    id: 'dv-d4',
    requires: ['taux-accroissement'],
    skill: 'taux',
    points: 2,
    prompt: 'Le taux d’accroissement d’une fonction entre 2 et 5 se calcule par…',
    options: ['[f(5) − f(2)] / (5 − 2)', 'f(5) − f(2)', 'f(5) / f(2)'],
    cols: 1,
    correct: 0,
    explain: 'C’est une différence d’images DIVISÉE par la différence des abscisses : c’est le coefficient directeur de la droite qui joint les deux points.',
  },
  {
    id: 'dv-d5',
    requires: ['droite-equation-reduite'],
    skill: 'droites',
    points: 2,
    prompt: 'La droite d’équation y = 4x − 4 passe-t-elle par le point (2 ; 4) ?',
    options: ['Oui : 4 × 2 − 4 = 4', 'Non : 4 × 2 − 4 = 8', 'On ne peut pas le savoir'],
    cols: 1,
    correct: 0,
    explain: 'On remplace x par 2 : 4 × 2 − 4 = 4, qui est bien l’ordonnée annoncée.',
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
            Avant de rapprocher deux points d’une courbe, un tour de tes outils : une image, la
            position d’un point, le coefficient directeur d’une droite et le taux d’accroissement
            de 2de. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
