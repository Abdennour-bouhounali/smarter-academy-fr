import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiels (coursesData.js, 6e_reperage_plan) : « Nombres
 * entiers » et « Lecture d'un quadrillage ». On teste UNIQUEMENT ces
 * acquis d'école élémentaire — jamais les coordonnées elles-mêmes, qui sont
 * l'objet de la leçon à partir du Module 1.
 */
const SKILLS = {
  entiers: { label: 'Nombres entiers', emoji: '🔢' },
  quadrillage: { label: 'Lecture d’un quadrillage', emoji: '▦' },
};

const QUESTIONS = [
  {
    id: 'q1-compter',
    skill: 'entiers',
    points: 2,
    prompt: <>Sur une file de cases numérotées à partir de 0, quelle case vient juste après la case 6 ?</>,
    options: ['5', '7', '60'],
    cols: 3,
    correct: 1,
    explain: 'Après 6 vient 7 : on avance d’une unité à chaque case.',
  },
  {
    id: 'q2-zero',
    skill: 'entiers',
    points: 2,
    prompt: (
      <>
        Une graduation commence à <strong className="font-mono">0</strong>. Combien d’intervalles
        sépare le 0 du nombre <strong className="font-mono">4</strong> ?
      </>
    ),
    options: ['3 intervalles', '4 intervalles', '5 intervalles'],
    cols: 1,
    correct: 1,
    explain: 'De 0 à 4, on franchit 4 intervalles : 0→1, 1→2, 2→3, 3→4.',
  },
  {
    id: 'q3-lignes-colonnes',
    skill: 'quadrillage',
    points: 2,
    prompt: (
      <>
        Dans un quadrillage, une <strong>colonne</strong> se lit dans quel sens ?
      </>
    ),
    options: ['De haut en bas (verticale)', 'De gauche à droite (horizontale)', 'En diagonale'],
    cols: 1,
    correct: 0,
    explain: 'Une colonne est verticale ; une ligne, elle, est horizontale.',
  },
  {
    id: 'q4-case',
    skill: 'quadrillage',
    points: 2,
    prompt: (
      <>
        Un quadrillage a <strong className="font-mono">4</strong> colonnes et{' '}
        <strong className="font-mono">3</strong> lignes. Combien contient-il de cases en tout ?
      </>
    ),
    options: ['7 cases', '12 cases', '43 cases'],
    cols: 3,
    correct: 1,
    explain: '4 colonnes × 3 lignes = 12 cases : chaque colonne rencontre chaque ligne une fois.',
  },
  {
    id: 'q5-croisement',
    skill: 'quadrillage',
    points: 2,
    prompt: (
      <>
        Sur un quadrillage, l’endroit où un trait vertical croise un trait horizontal s’appelle…
      </>
    ),
    options: ['une case', 'un croisement (un nœud)', 'une colonne'],
    cols: 1,
    correct: 1,
    explain:
      'Deux traits se croisent en un point : un nœud. Une case, elle, est la surface entourée par quatre traits.',
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
            Avant de partir explorer le plan, vérifions la petite base dont tu auras besoin : compter avec
            des nombres entiers et lire un quadrillage. Ce n’est pas un examen — quel que soit ton score, tu
            pourras continuer vers le Module 1.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
