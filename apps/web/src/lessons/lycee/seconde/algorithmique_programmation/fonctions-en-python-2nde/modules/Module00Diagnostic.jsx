import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis : la fonction MATHÉMATIQUE (image d'un nombre), la moyenne, et
 * l'expérience aléatoire du collège. On ne nomme jamais ce que la leçon
 * enseigne — def, return, paramètre, portée, randint, simulation.
 */
const SKILLS = {
  fonction: { label: 'Fonctions', emoji: '📈' },
  calcul: { label: 'Calculer', emoji: '🔢' },
  hasard: { label: 'Hasard', emoji: '🎲' },
};

const QUESTIONS = [
  {
    id: 'fp-d1-image',
    skill: 'fonction',
    points: 2,
    requires: ['fonction', 'image', 'notation-fx'],
    prompt: 'Soit f la fonction définie par f(x) = 3x − 1. Combien vaut f(4) ?',
    options: ['11', '12', '10'],
    cols: 3,
    correct: 0,
    explain: '3 × 4 − 1 = 12 − 1 = 11. On remplace x par 4, puis on calcule.',
  },
  {
    id: 'fp-d2-antecedent',
    skill: 'fonction',
    points: 2,
    requires: ['fonction', 'image'],
    prompt: 'Avec la même fonction f(x) = 3x − 1, que faut-il donner à f pour obtenir 14 ?',
    options: ['5', '4', '15'],
    cols: 3,
    correct: 0,
    explain: 'f(5) = 3 × 5 − 1 = 14. Une fonction transforme une entrée en une sortie ; ici on remonte de la sortie vers l’entrée.',
  },
  {
    id: 'fp-d3-deux-entrees',
    skill: 'calcul',
    points: 2,
    requires: ['aire'],
    prompt: 'Un rectangle mesure 7 cm sur 3 cm. Quelle est son aire ?',
    options: ['21 cm²', '20 cm²', '10 cm²'],
    cols: 3,
    correct: 0,
    explain: '7 × 3 = 21 cm². Ce calcul a besoin de DEUX nombres pour donner son résultat — retiens-le, la leçon y reviendra.',
  },
  {
    id: 'fp-d4-moyenne',
    skill: 'calcul',
    points: 2,
    requires: ['moyenne'],
    prompt: 'Quelle est la moyenne des trois notes 10, 12 et 14 ?',
    options: ['12', '36', '13'],
    cols: 3,
    correct: 0,
    explain: '(10 + 12 + 14) ÷ 3 = 36 ÷ 3 = 12. On additionne, puis on divise par le nombre de valeurs.',
  },
  {
    id: 'fp-d5-de',
    skill: 'hasard',
    points: 2,
    requires: ['experience-aleatoire', 'probabilite'],
    prompt: 'On lance un dé équilibré à six faces. Quelle est la probabilité d’obtenir 6 ?',
    options: ['1/6', '1/2', '6'],
    cols: 3,
    correct: 0,
    explain: 'Six faces également probables, une seule porte le 6 : la probabilité vaut 1/6 ≈ 0,167.',
  },
  {
    id: 'fp-d6-repetition',
    skill: 'hasard',
    points: 2,
    requires: ['experience-aleatoire'],
    prompt: 'On lance ce dé 600 fois. Combien de 6 peut-on s’attendre à obtenir, à peu près ?',
    options: ['Environ 100', 'Exactement 100', 'Environ 6'],
    cols: 3,
    correct: 0,
    explain: '600 ÷ 6 = 100 : c’est l’ordre de grandeur attendu. Mais « environ » est essentiel — obtenir exactement 100 serait une coïncidence, pas la règle.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleNumber={0}
      moduleTitle="Mission de départ"
      moduleSubtitle="Fonctions, moyenne et hasard : ce que tu sais déjà"
      estimatedTime="5 min"
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
