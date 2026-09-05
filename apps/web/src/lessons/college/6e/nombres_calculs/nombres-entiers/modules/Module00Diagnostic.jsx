import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueTable from '../components/PlaceValueTable';

/**
 * Module 0 V2 — même diagnostic que Module00Diagnostic.jsx, reconstruit sur
 * le lesson kit : ce fichier ne contient plus que les DONNÉES (compétences,
 * questions, textes). Le moteur (score, paliers, persistance, correction,
 * jamais-bloquant) vit dans common/kit/PrerequisiteDiagnostic.jsx.
 */

const SKILLS = {
  numerationDecimale: { label: 'Numération décimale', emoji: '🧱' },
  lectureEcriture: { label: 'Lecture et écriture', emoji: '✍️' },
};

const QUESTIONS = [
  {
    id: 'q1-digit',
    skill: 'numerationDecimale',
    points: 2,
    type: 'custom',
    prompt: (
      <>
        Clique sur le chiffre <strong className="font-mono">5</strong> dans <strong className="font-mono">4 582</strong>.
      </>
    ),
    // Dans 4 582, le 5 occupe la colonne des CENTAINES (clé 'C').
    // (L'original comparait à 'M' — la clé des millions, jamais affichée
    // pour un nombre à 4 chiffres : la question était impossible à réussir.)
    isCorrect: (pick) => pick === 'C',
    render: ({ pick, onPick }) => (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
        <PlaceValueTable value={4582} onDigitClick={(cell) => onPick(cell.key)} selectedKey={pick} />
      </div>
    ),
    review: ({ pick }) => (
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
        <PlaceValueTable value={4582} selectedKey={pick} compact />
      </div>
    ),
    explainOk: 'Bien vu ! Le 5 est dans la colonne des centaines : il vaut 500.',
    explainKo: '💡 Regarde bien sa place dans le tableau : le 5 est dans la colonne des centaines — il vaut 500.',
  },
  {
    id: 'q2-value',
    skill: 'numerationDecimale',
    points: 2,
    prompt: (
      <>
        Dans <strong className="font-mono">7 306</strong>, quelle est la valeur du chiffre <strong className="font-mono">3</strong> ?
      </>
    ),
    options: ['3', '30', '300', '3 000'],
    cols: 2,
    correct: 2,
    explain: '7 306 : le 3 occupe la colonne des centaines. Sa valeur est donc 300.',
  },
  {
    id: 'q3-position',
    skill: 'numerationDecimale',
    points: 1,
    prompt: (
      <>
        Dans <strong className="font-mono">52 481</strong>, où se trouve le chiffre <strong className="font-mono">2</strong> ?
      </>
    ),
    options: ['Dizaines de milliers', 'Milliers', 'Centaines', 'Dizaines'],
    cols: 2,
    correct: 1,
    explain: '52 481 : en partant de la droite, 2 occupe la 4ᵉ position — la colonne des milliers.',
  },
  {
    id: 'q4-mots-vers-chiffres',
    skill: 'lectureEcriture',
    points: 2,
    prompt: <>Quelle écriture correspond à <em>« quatre mille vingt-six »</em> ?</>,
    options: ['4 026', '4 260', '4 206', '40 026'],
    cols: 2,
    correct: 0,
    explain: '« quatre mille » → 4 dans la classe des mille ; « vingt-six » → 26 dans la classe des unités. Donc 4 026.',
  },
  {
    id: 'q5-chiffres-vers-mots',
    skill: 'lectureEcriture',
    points: 2,
    prompt: <>Comment lit-on <strong className="font-mono">8 405</strong> ?</>,
    options: [
      'huit mille quatre cent cinq',
      'huit mille quarante-cinq',
      'huit cent quatre-cinq',
      'quatre-vingt-cinq cents',
    ],
    cols: 1,
    correct: 0,
    explain: '8 405 = 8 | 405 → « huit mille » puis « quatre cent cinq ».',
  },
  {
    id: 'q6-mots-vers-chiffres-2',
    skill: 'lectureEcriture',
    points: 1,
    prompt: <>Quelle écriture correspond à <em>« douze mille cinquante »</em> ?</>,
    options: ['douze mille cinquante', '12 050', '12 500', '12 005'],
    cols: 2,
    correct: 1,
    explain: '« douze mille » → 12 dans la classe des mille ; « cinquante » → 050 dans la classe des unités. Donc 12 050.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="5 min"
      brief={{
        body: (
          <p>
            Vérifions ensemble les deux petites bases dont tu auras besoin pour explorer les grands
            nombres. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et tu pourras
            toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
