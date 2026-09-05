import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, sur le lesson kit : ce fichier ne
 * contient que les DONNÉES. Le moteur vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiels (coursesData.js, 6e_aires) : « Longueurs » et
 * « Unités de longueur ». Jeu de questions volontairement DISJOINT du
 * diagnostic de la leçon Périmètres (qui partage le prérequis Longueurs) :
 * ici l'accent est mis sur les unités et la multiplication, pas sur la
 * lecture de règle.
 */
const SKILLS = {
  longueursUnites: { label: 'Longueurs et unités', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'q1-m-cm',
    skill: 'longueursUnites',
    points: 2,
    prompt: <>Combien y a-t-il de centimètres dans <strong className="font-mono">1 mètre</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm.',
  },
  {
    id: 'q2-multiplication',
    skill: 'longueursUnites',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">4 × 7</strong> ?</>,
    options: ['24', '28', '32'],
    cols: 3,
    correct: 1,
    explain: '4 × 7 = 28 — cette table servira beaucoup pour les aires !',
  },
  {
    id: 'q3-unite-adaptee',
    skill: 'longueursUnites',
    points: 2,
    prompt: <>Quelle unité choisir pour mesurer la largeur d’un cahier ?</>,
    options: ['km', 'cm', 'mm'],
    cols: 3,
    correct: 1,
    explain: 'Un cahier fait une vingtaine de centimètres de large : le cm est l’unité adaptée.',
  },
  {
    id: 'q4-decimal',
    skill: 'longueursUnites',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">4 × 2,5</strong> ?</>,
    options: ['8', '10', '12'],
    cols: 3,
    correct: 1,
    explain: '4 × 2,5 = 10 : quatre moitiés de 5.',
  },
  {
    id: 'q5-carre-vocab',
    skill: 'longueursUnites',
    points: 2,
    prompt: <>Un carré a des côtés de 6 cm. Que peut-on dire de ses quatre côtés ?</>,
    options: ['Ils sont tous différents', 'Ils sont égaux deux à deux', 'Ils sont tous égaux'],
    cols: 1,
    correct: 2,
    explain: 'Dans un carré, les quatre côtés ont exactement la même longueur.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les aires : les unités de
            longueur et quelques multiplications. Ce test nous aide à savoir comment t'aider — ce n'est pas un
            examen, et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
