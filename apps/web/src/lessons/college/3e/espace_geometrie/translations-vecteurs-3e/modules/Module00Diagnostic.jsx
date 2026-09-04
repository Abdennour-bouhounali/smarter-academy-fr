import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_translations_vecteurs') :
 * « Repérage dans le plan », « Figures planes », « Coordonnées ». On teste
 * donc lire un couple, calculer un écart de coordonnées et reconnaître un
 * parallélogramme — jamais les vecteurs eux-mêmes, qui sont le contenu de la
 * leçon.
 */
const SKILLS = {
  repere: { label: 'Repérage', emoji: '🗺️' },
  calcul: { label: 'Coordonnées', emoji: '🔢' },
  figures: { label: 'Figures planes', emoji: '🔷' },
};

const QUESTIONS = [
  {
    id: 'tv-d1-lire',
    skill: 'repere',
    points: 2,
    prompt: 'Un point est à 3 graduations à gauche de l’origine et 2 au-dessus. Quelles sont ses coordonnées ?',
    options: ['(−3 ; 2)', '(3 ; −2)', '(2 ; −3)'],
    cols: 3,
    correct: 0,
    explain: 'À gauche : abscisse négative (−3). Au-dessus : ordonnée positive (2). D’où (−3 ; 2).',
  },
  {
    id: 'tv-d2-ordre',
    skill: 'repere',
    points: 2,
    prompt: 'Les points (2 ; 5) et (5 ; 2) sont-ils le même point ?',
    options: ['Non, l’ordre des deux nombres compte', 'Oui, ce sont les mêmes nombres', 'Cela dépend du repère'],
    cols: 1,
    correct: 0,
    explain: 'Le premier nombre est l’abscisse, le second l’ordonnée. Les échanger désigne un autre point.',
  },
  {
    id: 'tv-d3-ecart',
    skill: 'calcul',
    points: 2,
    prompt: 'Combien font 4 − (−3) ?',
    options: ['7', '1', '−7'],
    cols: 3,
    correct: 0,
    explain: 'Soustraire −3 revient à ajouter 3 : 4 + 3 = 7.',
  },
  {
    id: 'tv-d4-somme',
    skill: 'calcul',
    points: 2,
    prompt: 'Combien font (−5) + 2 ?',
    options: ['−3', '3', '−7'],
    cols: 3,
    correct: 0,
    explain: 'On part de −5 et on avance de 2 vers la droite : on arrive à −3.',
  },
  {
    id: 'tv-d5-parallelogramme',
    skill: 'figures',
    points: 2,
    prompt: 'Dans un parallélogramme, les côtés opposés sont…',
    options: [
      'parallèles et de même longueur',
      'perpendiculaires',
      'toujours de longueurs différentes',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la définition : deux paires de côtés opposés parallèles, et ces côtés opposés ont alors la même longueur.',
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
            Avant de faire décoller l’escadrille, un tour de tes outils : lire des coordonnées,
            calculer avec des relatifs et reconnaître un parallélogramme.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
