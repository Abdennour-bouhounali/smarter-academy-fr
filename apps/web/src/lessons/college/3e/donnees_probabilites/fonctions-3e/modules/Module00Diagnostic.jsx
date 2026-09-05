import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés au catalogue — repérage dans le
 * plan, calcul littéral, proportionnalité — et jamais la matière de la leçon
 * elle-même : ni image, ni antécédent, ni f(x), ni tableau de valeurs, ni
 * fonction linéaire ou affine. Aucune question ne porte de métadonnée
 * `assessment` : un diagnostic n'est pas une évaluation et ne produit aucune
 * preuve d'apprentissage.
 */

const SKILLS = {
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'fo-d1',
    skill: 'repere',
    points: 2,
    prompt: 'Dans un repère, quelles sont les coordonnées d’un point situé 3 unités à droite et 2 unités en dessous de l’origine ?',
    options: ['(3 ; −2)', '(−2 ; 3)', '(2 ; −3)', '(−3 ; 2)'],
    cols: 2,
    correct: 0,
    explain: 'L’abscisse vient toujours en premier : 3 vers la droite, puis l’ordonnée −2 vers le bas.',
  },
  {
    id: 'fo-d2',
    skill: 'repere',
    points: 2,
    prompt: 'Un point a pour ordonnée 0. Où se trouve-t-il ?',
    options: ["Sur l'axe des abscisses", "Sur l'axe des ordonnées", "À l'origine", 'Impossible à dire'],
    cols: 2,
    correct: 0,
    explain: 'Une ordonnée nulle signifie une hauteur nulle : le point est sur l’axe horizontal.',
  },
  {
    id: 'fo-d3',
    skill: 'litteral',
    points: 2,
    prompt: 'Que vaut 3x + 5 quand x = −2 ?',
    options: ['−1', '11', '1', '−11'],
    cols: 2,
    correct: 0,
    explain: '3 × (−2) = −6, puis −6 + 5 = −1. On multiplie avant d’ajouter.',
  },
  {
    id: 'fo-d4',
    skill: 'litteral',
    points: 2,
    prompt: 'Quelle valeur de x vérifie 2x + 1 = 9 ?',
    options: ['4', '5', '3', '4,5'],
    cols: 2,
    correct: 0,
    explain: 'On enlève 1 des deux côtés (2x = 8), puis on divise par 2 : x = 4.',
  },
  {
    id: 'fo-d5',
    skill: 'proportion',
    points: 2,
    prompt: '4 cahiers coûtent 6 €. Combien coûtent 10 cahiers au même prix unitaire ?',
    options: ['15 €', '12 €', '18 €', '24 €'],
    cols: 2,
    correct: 0,
    explain: 'Un cahier coûte 6 ÷ 4 = 1,50 €, donc 10 cahiers coûtent 15 €.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cinq questions rapides sur ce qui sert dans cette leçon : lire un repère,
            calculer avec une lettre, raisonner sur des proportions. Aucune note, aucun
            blocage — juste de quoi savoir par où commencer.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
