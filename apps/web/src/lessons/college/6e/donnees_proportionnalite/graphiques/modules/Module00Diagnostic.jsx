import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, 6e_graphiques) : « Tableaux » et
 * « Lecture de nombres ». On teste donc la lecture d'un croisement (acquis
 * de la leçon précédente), la comparaison et l'encadrement de nombres —
 * jamais le graphique lui-même, qui est le sujet de la leçon.
 */
const SKILLS = {
  tableau: { label: 'Lire un tableau', emoji: '📋' },
  nombres: { label: 'Comparer et situer des nombres', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'q1-lire-tableau',
    skill: 'tableau',
    requires: ['lire-tableau'],
    points: 2,
    // Formulé en toutes lettres plutôt qu'avec un vrai <table> : le moteur
    // du kit rend `prompt` à l'intérieur d'un <p>, où un tableau est un
    // descendant invalide (React le signale, et le navigateur referme le
    // paragraphe). Le prérequis testé — prélever la bonne ligne — reste
    // exactement le même.
    prompt: (
      <>
        Un tableau donne : <strong className="font-mono">lundi 16 °C</strong>,{' '}
        <strong className="font-mono">mardi 11 °C</strong>,{' '}
        <strong className="font-mono">mercredi 17 °C</strong>. Quelle température a-t-on relevée le{' '}
        <strong>mardi</strong> ?
      </>
    ),
    options: ['16 °C', '11 °C', '17 °C'],
    cols: 3,
    correct: 1,
    explain: 'Ligne « Mardi », colonne « Température » : 11 °C.',
  },
  {
    id: 'q2-plus-grand',
    skill: 'nombres',
    requires: ['comparer-entiers'],
    points: 2,
    prompt: <>Quel est le plus grand de ces nombres ?</>,
    options: ['18', '24', '20'],
    cols: 3,
    correct: 1,
    explain: '24 est le plus grand : 24 > 20 > 18.',
  },
  {
    id: 'q3-plus-petit',
    skill: 'nombres',
    requires: ['comparer-entiers'],
    points: 2,
    prompt: <>Et le plus petit de ceux-ci ?</>,
    options: ['15', '9', '12'],
    cols: 3,
    correct: 1,
    explain: '9 est le plus petit des trois.',
  },
  {
    id: 'q4-encadrer',
    skill: 'nombres',
    requires: ['encadrement'],
    points: 2,
    prompt: <>Entre quelles graduations se situe le nombre <strong className="font-mono">17</strong> ?</>,
    options: ['Entre 10 et 15', 'Entre 15 et 20', 'Entre 20 et 25'],
    cols: 1,
    correct: 1,
    explain: '17 est compris entre 15 et 20 — savoir situer un nombre entre deux graduations servira beaucoup pour lire un graphique.',
  },
  {
    id: 'q5-ecart',
    skill: 'nombres',
    requires: ['calcul-numerique'],
    points: 2,
    prompt: <>De combien de degrés passe-t-on de <strong className="font-mono">11 °C</strong> à <strong className="font-mono">17 °C</strong> ?</>,
    options: ['6 °C de plus', '6 °C de moins', '28 °C de plus'],
    cols: 1,
    correct: 0,
    explain: '17 − 11 = 6 : la température a AUGMENTÉ de 6 °C.',
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
            Avant de transformer des nombres en image, vérifions deux bases : lire un tableau et situer un
            nombre entre deux graduations. Ce n'est pas un examen — tu continueras vers le Module 1 quel que
            soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
