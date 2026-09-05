import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — fonctions linéaires, calcul
 * littéral, repérage dans le plan — et jamais la matière de la leçon : ni
 * ax + b, ni coefficient directeur, ni ordonnée à l'origine. Aucune question
 * ne porte de métadonnée `assessment`.
 */

const SKILLS = {
  lineaire: { label: 'Fonctions linéaires', emoji: '📈' },
  litteral: { label: 'Calcul littéral', emoji: '🔤' },
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
};

const QUESTIONS = [
  {
    id: 'fa-d1',
    skill: 'lineaire',
    points: 2,
    prompt: 'Soit f(x) = 3x. Que vaut f(5) ?',
    options: ['15', '8', '35', '3'],
    cols: 2,
    correct: 0,
    explain: 'On remplace x par 5 : 3 × 5 = 15.',
  },
  {
    id: 'fa-d2',
    skill: 'lineaire',
    points: 2,
    prompt: 'La représentation graphique d’une fonction linéaire passe toujours par…',
    options: ["l'origine du repère", "le point (1 ; 1)", "l'axe des ordonnées en 1", 'aucun point fixe'],
    cols: 1,
    correct: 0,
    explain: 'f(0) = a × 0 = 0 : le point (0 ; 0) est sur toutes les droites linéaires.',
  },
  {
    id: 'fa-d3',
    skill: 'litteral',
    points: 2,
    prompt: 'Que vaut 4x − 3 quand x = −2 ?',
    options: ['−11', '−5', '5', '11'],
    cols: 2,
    correct: 0,
    explain: '4 × (−2) = −8, puis −8 − 3 = −11.',
  },
  {
    id: 'fa-d4',
    skill: 'litteral',
    points: 2,
    prompt: 'Quelle valeur de x vérifie 5x + 4 = 19 ?',
    options: ['3', '4', '15', '2,5'],
    cols: 2,
    correct: 0,
    explain: 'On retire 4 des deux côtés (5x = 15), puis on divise par 5 : x = 3.',
  },
  {
    id: 'fa-d5',
    skill: 'repere',
    points: 2,
    prompt: 'Un point a pour coordonnées (0 ; −4). Où se situe-t-il ?',
    options: ["Sur l'axe vertical, en dessous de l'origine", "Sur l'axe horizontal, à gauche", "En (−4 ; 0)", 'Hors du repère'],
    cols: 1,
    correct: 0,
    explain: 'Une abscisse nulle place le point sur l’axe vertical ; l’ordonnée −4 le place en dessous de l’origine.',
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
            Cinq questions rapides sur ce qui sert ici : calculer avec une lettre, se
            repérer dans un repère, se souvenir des fonctions linéaires. Aucune note,
            aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
