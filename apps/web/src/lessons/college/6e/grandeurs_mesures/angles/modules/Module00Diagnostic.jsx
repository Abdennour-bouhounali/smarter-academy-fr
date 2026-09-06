import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, sur le lesson kit : DONNÉES seules.
 *
 * Prérequis officiels (coursesData.js, 6e_angles) : « Longueurs » et
 * « Figures géométriques ». On vérifie le vocabulaire de base (demi-droite,
 * sommet, côté, perpendiculaire) et la lecture d'une graduation — qui se
 * transfère directement au rapporteur.
 */
const SKILLS = {
  figuresBase: { label: 'Figures et vocabulaire', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'q1-demi-droite',
    skill: 'figuresBase',
    points: 2,
    prompt: <>Une ligne qui part d’un point et se prolonge sans fin d’un seul côté s’appelle :</>,
    options: ['Un segment', 'Une demi-droite', 'Une droite'],
    cols: 3,
    correct: 1,
    requires: ['demi-droite'],
    explain: 'Une demi-droite a une origine et file à l’infini d’un seul côté. Le segment a deux extrémités, la droite n’en a aucune.',
  },
  {
    id: 'q2-sommet',
    skill: 'figuresBase',
    points: 2,
    prompt: <>Dans une figure géométrique, le point où deux côtés se rencontrent s’appelle :</>,
    options: ['Le sommet', 'Le milieu', 'La base'],
    cols: 3,
    correct: 0,
    requires: ['demi-droite'],
    explain: 'C’est le sommet — le mot reviendra sans arrêt dans cette leçon.',
  },
  {
    id: 'q3-rectangle',
    skill: 'figuresBase',
    points: 2,
    prompt: <>Combien un rectangle a-t-il d’angles droits ?</>,
    options: ['2', '4', '0'],
    cols: 3,
    correct: 1,
    requires: ['angle-droit'],
    explain: 'Les quatre coins d’un rectangle sont des angles droits.',
  },
  {
    id: 'q4-perpendiculaires',
    skill: 'figuresBase',
    points: 2,
    prompt: <>Deux droites perpendiculaires se croisent en formant :</>,
    options: ['Un angle droit', 'Un angle très ouvert', 'Aucun angle'],
    cols: 1,
    correct: 0,
    requires: ['angle-droit', 'droites-perpendiculaires'],
    explain: 'Perpendiculaires = qui se coupent à angle droit — c’est bien ce que tu as vu avec les figures.',
  },
  {
    id: 'q5-graduation',
    skill: 'figuresBase',
    points: 2,
    prompt: <>Sur une règle graduée en centimètres, que trouve-t-on entre les traits 4 et 5 ?</>,
    options: ['Rien du tout', 'Des traits plus petits (les millimètres)', 'Le trait du 6'],
    cols: 1,
    correct: 1,
    requires: ['demi-droite'],
    explain: 'Entre deux traits principaux, il y a des traits plus fins — les millimètres. Savoir lire entre les traits d’une règle te servira dans cette leçon.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les angles : le vocabulaire des
            figures déjà rencontré, et la lecture d'une règle. Ce test nous aide à savoir comment t'aider — ce
            n'est pas un examen, et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
