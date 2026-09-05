import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (fichier de DONNÉES uniquement).
 *
 * Prérequis déclarés (coursesData.js, clé 'seconde_ensembles_et_intervalles') :
 * « Nombres relatifs », « Inégalités », « Repérage sur une droite ». On teste
 * la comparaison de relatifs et de décimaux, la lecture d'une inégalité
 * stricte et large, la lecture d'un point sur une droite graduée — jamais
 * les intervalles eux-mêmes, qui sont le contenu de la leçon.
 */
const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
  inegalites: { label: 'Inégalités', emoji: '<' },
  droite: { label: 'Droite graduée', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'q1-comparer-relatifs',
    skill: 'relatifs',
    points: 2,
    prompt: 'Quel est le plus grand des deux nombres −3 et −5 ?',
    options: ['−3', '−5', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: 'Sur la droite, −3 est à droite de −5 : il est plus grand. Plus un nombre négatif s’éloigne de 0, plus il est petit.',
  },
  {
    id: 'q2-comparer-decimaux',
    skill: 'relatifs',
    points: 2,
    prompt: 'Laquelle de ces comparaisons est vraie ?',
    options: ['2,5 < 2,05', '2,05 < 2,5', '2,5 = 2,50 est faux'],
    cols: 1,
    correct: 1,
    explain: '2,05 = 2 + 5 centièmes, alors que 2,5 = 2 + 50 centièmes. Donc 2,05 < 2,5 ; et 2,5 = 2,50, un zéro à droite ne change rien.',
  },
  {
    id: 'q3-inegalite-stricte',
    skill: 'inegalites',
    points: 2,
    prompt: (
      <>
        Que signifie <MathText>{'$x > 4$'}</MathText> ?
      </>
    ),
    options: ['x vaut au moins 4 (4 compris)', 'x est strictement plus grand que 4 (4 exclu)', 'x est plus petit que 4'],
    cols: 1,
    correct: 1,
    explain: 'Le signe > sans barre est STRICT : 4 lui-même ne convient pas. « Au moins 4 » s’écrirait x ≥ 4.',
  },
  {
    id: 'q4-lire-un-point',
    skill: 'droite',
    points: 2,
    prompt: (
      <span className="block space-y-2">
        <span className="block">Quelle est l’abscisse du point A ?</span>
        <RealLine inline min={-3} max={3} step={0.5} labelEvery={2} points={[{ id: 'A', value: -1.5, label: 'A', tone: 'rose' }]} ariaLabel="Droite graduée de −3 à 3, un point A" />
      </span>
    ),
    options: ['−1,5', '1,5', '−2'],
    cols: 3,
    correct: 0,
    explain: 'A est entre −2 et −1, exactement au milieu : −1,5. À gauche de 0, les nombres sont négatifs.',
  },
  {
    id: 'q5-inegalite-large',
    skill: 'inegalites',
    points: 2,
    prompt: 'Un panneau indique « poids maximal 30 kg ». Quelle inégalité traduit les poids p autorisés ?',
    options: ['p < 30', 'p ≤ 30', 'p ≥ 30'],
    cols: 3,
    correct: 1,
    explain: '« Maximal 30 » : 30 est encore autorisé, donc p ≤ 30. Le signe ≥ dirait « au moins 30 », le contraire.',
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
            Cette leçon s’appuie sur les nombres relatifs, les inégalités et la droite graduée. Vérifions ces
            réflexes en cinq questions. Ce n’est pas un examen — tu continueras vers le Module 1 quel que soit
            ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
