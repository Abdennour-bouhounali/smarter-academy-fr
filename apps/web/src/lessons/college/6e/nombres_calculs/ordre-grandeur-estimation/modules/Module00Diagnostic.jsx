import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiels (coursesData.js, 6e_ordre_grandeur_estimation) :
 * « Nombres entiers », « Nombres décimaux », « Opérations » — la valeur
 * positionnelle des chiffres et le calcul mental sur nombres ronds, PAS
 * l'estimation elle-même, qui est enseignée à partir du Module 1.
 */
const SKILLS = {
  valeurPosition: { label: 'Valeur des chiffres', emoji: '🔢' },
  calculMental: { label: 'Calcul mental sur nombres ronds', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'q1-valeur-chiffre',
    skill: 'valeurPosition',
    points: 2,
    prompt: (
      <>
        Dans le nombre <strong className="font-mono">3 472</strong>, que vaut le chiffre{' '}
        <strong className="font-mono">4</strong> ?
      </>
    ),
    options: ['4', '40', '400'],
    cols: 3,
    correct: 2,
    explain: 'Le 4 est au rang des centaines : il vaut 400. C\'est cette valeur positionnelle qui permet d\'arrondir.',
  },
  {
    id: 'q2-nombre-proche',
    skill: 'valeurPosition',
    points: 2,
    prompt: (
      <>
        Quel nombre rond est le plus proche de <strong className="font-mono">297</strong> ?
      </>
    ),
    options: ['200', '300', '390'],
    cols: 3,
    correct: 1,
    explain: '297 est à 3 unités de 300, mais à 97 de 200 : 300 est de loin le plus proche.',
  },
  {
    id: 'q3-somme-ronde',
    skill: 'calculMental',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">200 + 300</strong> ?</>,
    options: ['500', '600', '2 300'],
    cols: 3,
    correct: 0,
    explain: '2 centaines + 3 centaines = 5 centaines : 200 + 300 = 500.',
  },
  {
    id: 'q4-produit-rond',
    skill: 'calculMental',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">50 × 20</strong> ?</>,
    options: ['100', '1 000', '10 000'],
    cols: 3,
    correct: 1,
    explain: '5 × 2 = 10, puis on remet les deux zéros : 50 × 20 = 1 000.',
  },
  {
    id: 'q5-difference-ronde',
    skill: 'calculMental',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">800 − 300</strong> ?</>,
    options: ['500', '300', '1 100'],
    cols: 3,
    correct: 0,
    explain: '8 centaines − 3 centaines = 5 centaines : 800 − 300 = 500.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour apprendre à estimer : connaître la
            valeur des chiffres et calculer de tête avec des nombres ronds. Ce test nous aide à savoir comment
            t'aider — ce n'est pas un examen, et tu pourras toujours continuer vers le Module 1, quel que soit
            ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
