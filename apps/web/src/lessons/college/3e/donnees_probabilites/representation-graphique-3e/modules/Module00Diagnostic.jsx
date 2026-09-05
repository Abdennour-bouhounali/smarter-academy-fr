import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — repérage dans le plan, fonctions,
 * tableaux — et jamais la matière de la leçon : ni choix d'échelle, ni
 * construction, ni détection de graphique trompeur. Aucune question ne porte de
 * métadonnée `assessment`.
 */

const SKILLS = {
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
  fonction: { label: 'Fonctions', emoji: '⚙️' },
  tableau: { label: 'Tableaux', emoji: '📋' },
};

const QUESTIONS = [
  {
    id: 'rg-d1',
    skill: 'repere',
    points: 2,
    prompt: 'Quelles sont les coordonnées d’un point situé 3 à droite et 2 au-dessus de l’origine ?',
    options: ['(3 ; 2)', '(2 ; 3)', '(−3 ; 2)', '(3 ; −2)'],
    cols: 2,
    correct: 0,
    explain: 'L’abscisse vient en premier (3 vers la droite), puis l’ordonnée (2 vers le haut).',
  },
  {
    id: 'rg-d2',
    skill: 'repere',
    points: 2,
    prompt: 'Sur un axe où un carreau vaut 10, où se trouve la valeur 25 ?',
    options: ['Au milieu entre 20 et 30', 'Sur la graduation 20', 'Sur la graduation 30', 'Hors de l’axe'],
    cols: 1,
    correct: 0,
    explain: '25 est à mi-chemin entre 20 et 30 : on place le point au milieu du carreau.',
  },
  {
    id: 'rg-d3',
    skill: 'fonction',
    points: 2,
    prompt: 'Soit f(x) = 2x + 1. Que vaut f(3) ?',
    options: ['7', '6', '9', '5'],
    cols: 2,
    correct: 0,
    explain: '2 × 3 = 6, puis 6 + 1 = 7.',
  },
  {
    id: 'rg-d4',
    skill: 'tableau',
    points: 2,
    prompt: 'Un tableau donne : 1 → 4 · 2 → 8 · 3 → 12. Que vaut la valeur pour 4 ?',
    options: ['16', '15', '20', '14'],
    cols: 2,
    correct: 0,
    explain: 'Les valeurs augmentent de 4 à chaque fois : après 12 vient 16.',
  },
  {
    id: 'rg-d5',
    skill: 'tableau',
    points: 2,
    prompt: 'Dans un tableau « temps / distance », quelle grandeur dépend de l’autre ?',
    options: ['La distance dépend du temps', 'Le temps dépend de la distance', 'Aucune ne dépend de l’autre'],
    cols: 1,
    correct: 0,
    explain: 'Plus le temps passe, plus la distance parcourue augmente : c’est la distance qui dépend du temps.',
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
            Cinq questions rapides sur ce qui sert ici : lire un repère, calculer une image,
            comprendre un tableau. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
