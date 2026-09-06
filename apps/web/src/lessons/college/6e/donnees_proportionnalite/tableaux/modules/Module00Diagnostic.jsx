import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement, moteur dans
 * common/kit/PrerequisiteDiagnostic.jsx).
 *
 * Prérequis officiels (coursesData.js, 6e_tableaux) : « Nombres entiers » et
 * « Lecture d'informations ». On teste donc la lecture de nombres, la
 * comparaison, une petite addition et le prélèvement d'une information dans
 * un texte — JAMAIS le tableau lui-même, qui est le sujet de la leçon.
 */
const SKILLS = {
  nombres: { label: 'Lire et comparer des nombres', emoji: '🔢' },
  info: { label: 'Prélever une information', emoji: '🔎' },
};

const QUESTIONS = [
  {
    id: 'q1-comparer',
    skill: 'nombres',
    requires: ['comparer-entiers'],
    points: 2,
    prompt: <>Quel est le plus grand de ces trois nombres ?</>,
    options: ['108', '87', '99'],
    cols: 3,
    correct: 0,
    explain: '108 dépasse la centaine, les deux autres non : 108 > 99 > 87.',
  },
  {
    id: 'q2-addition',
    skill: 'nombres',
    requires: ['calcul-numerique'],
    points: 2,
    prompt: <>Combien font <strong className="font-mono">12 + 8 + 9</strong> ?</>,
    options: ['27', '29', '31'],
    cols: 3,
    correct: 1,
    explain: '12 + 8 = 20, puis 20 + 9 = 29. Ce genre de total reviendra souvent.',
  },
  {
    id: 'q3-prelever',
    skill: 'info',
    requires: ['lecture-information'],
    points: 2,
    prompt: (
      <>
        « Lundi, Léa a lu 14 pages ; mardi, elle en a lu 9. » Combien de pages a-t-elle lues{' '}
        <strong>mardi</strong> ?
      </>
    ),
    options: ['14 pages', '9 pages', '23 pages'],
    cols: 3,
    correct: 1,
    explain: 'Le mardi correspond à 9 pages. 14 est le lundi, 23 serait le total des deux jours.',
  },
  {
    id: 'q4-ordre',
    skill: 'nombres',
    requires: ['comparer-entiers'],
    points: 2,
    prompt: <>Range mentalement 15, 6 et 11. Lequel est au milieu ?</>,
    options: ['15', '11', '6'],
    cols: 3,
    correct: 1,
    explain: 'Dans l’ordre : 6 < 11 < 15. Le nombre du milieu est 11.',
  },
  {
    id: 'q5-deux-infos',
    skill: 'info',
    requires: ['lecture-information', 'calcul-numerique'],
    points: 2,
    prompt: (
      <>
        « Tom a 9 billes rouges et 4 billes bleues. » Combien de billes a-t-il en <strong>tout</strong> ?
      </>
    ),
    options: ['9', '13', '5'],
    cols: 3,
    correct: 1,
    explain: '9 + 4 = 13 billes. Il fallait réunir DEUX informations du texte, pas une seule.',
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
            Avant de ranger des informations, vérifions deux petites choses : lire et comparer des nombres, et
            aller chercher une information précise dans une phrase. Ce n'est pas un examen — quel que soit ton
            score, tu continueras vers le Module 1.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
