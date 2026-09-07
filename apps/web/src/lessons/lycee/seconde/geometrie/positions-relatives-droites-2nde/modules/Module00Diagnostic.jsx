import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé 'seconde_positions_relatives_droites') :
 * « Équations de droites », « Systèmes simples », « Vecteurs ». On teste donc
 * lire m et p, une pente entre deux points, les coordonnées d'un vecteur, la
 * colinéarité par le déterminant et une équation du premier degré — jamais
 * les positions relatives elles-mêmes.
 */
const SKILLS = {
  equations: { label: 'Équations de droites', emoji: '📈' },
  vecteurs: { label: 'Vecteurs', emoji: '➡️' },
  systemes: { label: 'Équations', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'pr-d1-lire-mp',
    skill: 'equations',
    points: 2,
    prompt: 'La droite d’équation y = 3x − 2 : quel est son coefficient directeur, et son ordonnée à l’origine ?',
    options: ['m = 3 et p = −2', 'm = −2 et p = 3', 'm = 3 et p = 2'],
    cols: 1,
    correct: 0,
    explain: 'Dans y = mx + p, m multiplie x (ici 3) et p est le terme constant (ici −2).',
  },
  {
    id: 'pr-d2-pente',
    skill: 'equations',
    points: 2,
    prompt: 'A(1 ; 2) et B(3 ; 8). Quelle est la pente de la droite (AB) ?',
    options: ['3', '1/3', '6'],
    cols: 3,
    correct: 0,
    explain: 'Pente = (y_B − y_A) ÷ (x_B − x_A) = (8 − 2) ÷ (3 − 1) = 6 ÷ 2 = 3.',
  },
  {
    id: 'pr-d3-vecteur',
    skill: 'vecteurs',
    points: 2,
    prompt: 'C(−1 ; 4) et D(2 ; −2). Coordonnées du vecteur CD ?',
    options: ['(3 ; −6)', '(−3 ; 6)', '(1 ; 2)'],
    cols: 3,
    correct: 0,
    explain: 'Arrivée moins départ : 2 − (−1) = 3 et −2 − 4 = −6.',
  },
  {
    id: 'pr-d4-det',
    skill: 'vecteurs',
    points: 2,
    // Un diagnostic MESURE un prérequis : `requires` dit lequel, et c'est ce
    // qui relie la déclaration `priorKnowledge` à la question qui la vérifie.
    requires: ['colineaire'],
    prompt: 'u(2 ; 1) et v(4 ; 2). Que vaut det(u, v) = x·y′ − y·x′, et que peut-on conclure ?',
    options: ['0 : u et v sont colinéaires', '8 : u et v sont colinéaires', '0 : u et v ne sont pas colinéaires'],
    cols: 1,
    correct: 0,
    explain: 'det = 2 × 2 − 1 × 4 = 0, et un déterminant nul signifie exactement que les deux vecteurs ont la même direction.',
  },
  {
    id: 'pr-d5-equation',
    skill: 'systemes',
    points: 2,
    prompt: 'Résous 2x + 1 = −x + 4.',
    options: ['x = 1', 'x = 5', 'x = 3'],
    cols: 3,
    correct: 0,
    explain: 'On rassemble les x d’un côté : 2x + x = 4 − 1, soit 3x = 3, donc x = 1.',
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
            Avant de faire se croiser des droites, un tour de tes outils : lire une équation
            réduite, calculer une pente, un vecteur, un déterminant, résoudre une équation.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
