import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés dans `lesson.config.js`
 * (`priorKnowledge`) — le vocabulaire des fonctions hérité de `fonctions-3e`,
 * le calcul littéral, le repérage dans le plan — et jamais la matière de la
 * leçon : ni ax + b, ni coefficient directeur, ni ordonnée à l'origine.
 * Aucune question ne porte de métadonnée `assessment`.
 *
 * `requires` (docs/architecture/KNOWLEDGE_DEPENDENCY.md) : un diagnostic MESURE
 * des prérequis, donc chaque question ne peut exiger que des ids de
 * `priorKnowledge` — l'audit refuse tout autre id ici.
 */

const SKILLS = {
  fonctions: { label: 'Le langage des fonctions', emoji: '⚙️' },
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
    requires: ['fonction', 'notation-fx', 'image', 'fonction-lineaire', 'coefficient-lineaire', 'proportionnalite'],
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
    requires: ['fonction-lineaire', 'representation-graphique', 'origine-repere', 'ordonnee'],
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
    requires: ['calcul-litteral'],
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
    requires: ['calcul-litteral'],
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
    requires: ['coordonnees', 'abscisse', 'ordonnee', 'origine-repere'],
    explain: 'Une abscisse nulle place le point sur l’axe vertical ; l’ordonnée −4 le place en dessous de l’origine.',
  },
  {
    id: 'fa-d6',
    skill: 'fonctions',
    // Le tableau de valeurs et la lecture d'une image y sont des ACQUIS de
    // `fonctions-3e` : cette leçon s'en sert dès le module 4 sans les
    // réenseigner, il faut donc les mesurer ici.
    points: 2,
    prompt: (
      <>
        Dans ce tableau de valeurs, quelle est l’image de 2 par g ?
        <span className="mt-2 block rounded-xl bg-slate-50 border border-slate-200 p-2 font-mono text-center text-sm">
          <span className="block">x &nbsp;&nbsp;&nbsp;&nbsp;| 0 &nbsp;| 1 &nbsp;| 2 &nbsp;| 3</span>
          <span className="block">g(x) | 7 &nbsp;| 4 &nbsp;| 1 &nbsp;| −2</span>
        </span>
      </>
    ),
    options: ['1', '2', '4', '−2'],
    cols: 2,
    correct: 0,
    requires: ['fonction', 'notation-fx', 'image', 'tableau-de-valeurs'],
    explain: 'On cherche la colonne x = 2 et on lit en dessous : g(2) = 1. L’image se lit sur la ligne du bas.',
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
            Six questions rapides sur ce qui sert ici : le langage des fonctions vu
            juste avant (image, f(x), tableau de valeurs), calculer avec une lettre, se
            repérer dans un repère. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
