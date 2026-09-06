import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, sur le lesson kit : ce fichier ne
 * contient que les DONNÉES.
 *
 * Prérequis officiels (coursesData.js, 6e_durees) : « Nombres entiers » et
 * « Opérations ». Les questions préparent en douceur la base 60 (complément
 * à 60, ×60) sans jamais enseigner les durées elles-mêmes.
 */
const SKILLS = {
  calculEntiers: { label: 'Calculer avec les entiers', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'q1-complement-60',
    skill: 'calculEntiers',
    points: 2,
    prompt: <>Complète : <strong className="font-mono">47 + ? = 60</strong></>,
    options: ['13', '17', '23'],
    cols: 3,
    correct: 0,
    requires: ['calcul-numerique'],
    explain: '47 + 13 = 60. Les compléments à 60 vont beaucoup servir dans cette leçon…',
  },
  {
    id: 'q2-soustraction',
    skill: 'calculEntiers',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">425 − 187</strong> ?</>,
    options: ['238', '248', '262'],
    cols: 3,
    correct: 0,
    requires: ['calcul-numerique'],
    explain: '425 − 187 = 238 (une soustraction avec retenue).',
  },
  {
    id: 'q3-fois-60',
    skill: 'calculEntiers',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">3 × 60</strong> ?</>,
    options: ['120', '180', '360'],
    cols: 3,
    correct: 1,
    requires: ['tables-multiplication'],
    explain: '3 × 60 = 180.',
  },
  {
    id: 'q4-multiple',
    skill: 'calculEntiers',
    points: 2,
    prompt: <>Lequel de ces nombres est un multiple de 24 ?</>,
    options: ['36', '48', '54'],
    cols: 3,
    correct: 1,
    requires: ['tables-multiplication'],
    explain: '48 = 2 × 24. (36 et 54 sont des multiples de 6, pas de 24.)',
  },
  {
    id: 'q5-ordonner',
    skill: 'calculEntiers',
    points: 2,
    prompt: <>Range du plus petit au plus grand : 95, 59, 105, 89.</>,
    options: ['59 < 89 < 95 < 105', '59 < 95 < 89 < 105', '89 < 59 < 95 < 105'],
    cols: 1,
    correct: 0,
    requires: ['ordre-nombres'],
    explain: '59 < 89 < 95 < 105 : on compare d’abord le nombre de chiffres, puis chiffre à chiffre.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les durées : le calcul avec les
            nombres entiers. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et tu pourras
            toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
