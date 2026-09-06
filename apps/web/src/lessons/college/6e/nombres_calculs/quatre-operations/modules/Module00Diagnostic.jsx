import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 V2 — diagnostic des prérequis, reconstruit sur le lesson kit :
 * ce fichier ne contient plus que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiel (coursesData.js, 6e_operations) : "Numération décimale"
 * (lire et comparer des nombres, valeur positionnelle des chiffres) et
 * "Tables de multiplication" — PAS les quatre opérations elles-mêmes, qui
 * sont enseignées à partir du Module 1 de cette leçon.
 */
const SKILLS = {
  numeration: { label: 'Numération', emoji: '🔢' },
  tables: { label: 'Tables de multiplication', emoji: '✖️' },
};

const QUESTIONS = [
  {
    id: 'q1-valeur-position',
    skill: 'numeration',
    points: 2,
    // Module 0 MESURE des prérequis : ses requires ne citent que des ids de
    // priorKnowledge (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['valeur-position'],
    prompt: (
      <>
        Dans le nombre <strong className="font-mono">4 582</strong>, que représente le chiffre{' '}
        <strong className="font-mono">4</strong> ?
      </>
    ),
    options: ['4 unités', '4 centaines', '4 milliers'],
    cols: 1,
    correct: 2,
    explain: 'Dans 4 582, le chiffre 4 est en position des milliers : il représente 4 000.',
  },
  {
    id: 'q2-comparaison',
    skill: 'numeration',
    points: 2,
    requires: ['valeur-position', 'calcul-numerique'],
    prompt: (
      <>
        Entre <strong className="font-mono">2 987</strong> et <strong className="font-mono">2 879</strong>,
        lequel est le plus grand ?
      </>
    ),
    options: ['2 987', '2 879', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: 'Les deux nombres ont le même chiffre des milliers (2), mais 2 987 a 9 centaines contre 8 pour 2 879 : 2 987 > 2 879.',
  },
  {
    id: 'q3-lecture-nombre',
    skill: 'numeration',
    points: 2,
    requires: ['valeur-position'],
    prompt: (
      <>
        Comment s'écrit en chiffres le nombre <strong>« douze mille trois cent six »</strong> ?
      </>
    ),
    options: ['1 236', '12 306', '12 360'],
    cols: 3,
    correct: 1,
    explain: '« Douze mille » donne 12 000, puis « trois cent six » donne 306 : soit 12 306.',
  },
  {
    id: 'q4-table-7x8',
    skill: 'tables',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: <>Combien font <strong className="font-mono">7 × 8</strong> ?</>,
    options: ['54', '56', '64'],
    cols: 3,
    correct: 1,
    explain: '7 × 8 = 56 : une table à bien connaître par cœur.',
  },
  {
    id: 'q5-table-6x9',
    skill: 'tables',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: <>Combien font <strong className="font-mono">6 × 9</strong> ?</>,
    options: ['45', '54', '56'],
    cols: 3,
    correct: 1,
    explain: '6 × 9 = 54 : on peut aussi la retrouver avec 6 × 10 = 60, puis 60 − 6 = 54.',
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
            Avant de plonger dans les quatre opérations, vérifions ensemble deux petites bases : bien lire
            les nombres et connaître tes tables de multiplication. Ce test nous aide à savoir comment
            t'aider — ce n'est jamais un examen, et tu pourras toujours continuer vers le Module 1, quel
            que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
