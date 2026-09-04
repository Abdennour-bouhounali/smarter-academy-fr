import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_representations_espace') :
 * « Figures planes », « Solides », « Repérage dans le plan ». On teste donc le
 * vocabulaire des figures planes, celui des solides de 6e et la lecture d'un
 * couple de coordonnées — jamais la perspective ni les positions relatives,
 * qui sont le contenu de la leçon.
 */
const SKILLS = {
  planes: { label: 'Figures planes', emoji: '🔷' },
  solides: { label: 'Solides', emoji: '🧊' },
  repere: { label: 'Repérage', emoji: '🗺️' },
};

const QUESTIONS = [
  {
    id: 're-d1-carre',
    skill: 'planes',
    points: 2,
    prompt: 'Un quadrilatère qui a quatre côtés égaux et quatre angles droits est…',
    options: ['un carré', 'un losange quelconque', 'un trapèze'],
    cols: 1,
    correct: 0,
    explain: 'Quatre côtés égaux ET quatre angles droits : c’est la définition du carré. Un losange a bien quatre côtés égaux, mais pas forcément d’angles droits.',
  },
  {
    id: 're-d2-cube',
    skill: 'solides',
    points: 2,
    prompt: 'De quelle forme sont les faces d’un cube ?',
    options: ['Six carrés identiques', 'Six rectangles différents', 'Quatre triangles'],
    cols: 1,
    correct: 0,
    explain: 'Un cube est le pavé droit dont les six faces sont des carrés identiques.',
  },
  {
    id: 're-d3-vocabulaire',
    skill: 'solides',
    points: 2,
    prompt: 'Comment appelle-t-on le segment où deux faces d’un solide se rencontrent ?',
    options: ['Une arête', 'Un sommet', 'Une diagonale'],
    cols: 3,
    correct: 0,
    explain: 'Deux faces se rencontrent le long d’une arête ; les arêtes se rencontrent en un sommet.',
  },
  {
    id: 're-d4-pave',
    skill: 'solides',
    points: 2,
    prompt: 'Combien un pavé droit a-t-il de faces ?',
    options: ['6', '8', '12'],
    cols: 3,
    correct: 0,
    explain: 'Un pavé droit a 6 faces (deux par direction), 12 arêtes et 8 sommets.',
  },
  {
    id: 're-d5-coordonnees',
    skill: 'repere',
    points: 2,
    prompt: 'Dans un repère du plan, le couple (3 ; −2) désigne un point situé…',
    options: [
      'à droite de l’origine et en dessous',
      'à gauche et au-dessus',
      'à droite et au-dessus',
    ],
    cols: 1,
    correct: 0,
    explain: 'Abscisse positive : à droite. Ordonnée négative : en dessous.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant d’entrer dans l’atelier, un tour de tes outils : les figures planes, le
            vocabulaire des solides et le repérage. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
