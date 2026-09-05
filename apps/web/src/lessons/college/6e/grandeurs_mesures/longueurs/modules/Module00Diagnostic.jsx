import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiel (coursesData.js, 6e_longueurs) : « Unités de longueur »
 * — le sens général de l'échelle km/m/cm/mm et des puissances de 10, PAS la
 * mesure ou la conversion elles-mêmes, qui sont enseignées à partir du
 * Module 1.
 */
const SKILLS = {
  ordresGrandeur: { label: 'Ordres de grandeur', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'q1-m-cm',
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Combien y a-t-il de centimètres dans <strong className="font-mono">1 mètre</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm : le mètre se partage en 100 centimètres.',
  },
  {
    id: 'q2-plus-grand',
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Lequel est le plus grand : <strong className="font-mono">1 km</strong> ou <strong className="font-mono">1 000 m</strong> ?</>,
    options: ['1 km', '1 000 m', 'Ils sont égaux'],
    cols: 1,
    correct: 2,
    explain: '1 km = 1 000 m : ce sont deux écritures de la même longueur.',
  },
  {
    id: 'q3-sens',
    skill: 'ordresGrandeur',
    points: 2,
    prompt: (
      <>
        Un objet mesure <strong className="font-mono">2 mètres</strong>. En centimètres, ce nombre sera :
      </>
    ),
    options: ['Plus petit', 'Plus grand', 'Identique'],
    cols: 3,
    correct: 1,
    explain: 'Une unité plus petite (le cm) donne un nombre plus grand pour la même longueur : 2 m = 200 cm.',
  },
  {
    id: 'q4-graduation',
    skill: 'ordresGrandeur',
    points: 2,
    prompt: (
      <>
        Sur une règle graduée de 0 à 10, avec une graduation tous les 1 cm, à combien de centimètres se trouve
        la 6ᵉ graduation après 0 ?
      </>
    ),
    options: ['4 cm', '6 cm', '10 cm'],
    cols: 3,
    correct: 1,
    explain: 'Chaque graduation vaut 1 cm : la 6ᵉ graduation se trouve donc à 6 cm.',
  },
  {
    id: 'q5-dix',
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Combien de fois 10 faut-il pour obtenir 1 000 ?</>,
    options: ['2 fois (10 × 2)', '3 fois (10 × 10 × 10)', '10 fois'],
    cols: 1,
    correct: 1,
    explain: '10 × 10 × 10 = 1 000 : trois multiplications par 10 successives.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les longueurs : le sens des
            unités et des puissances de 10. Ce test nous aide à savoir comment t'aider — ce n'est pas un
            examen, et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
