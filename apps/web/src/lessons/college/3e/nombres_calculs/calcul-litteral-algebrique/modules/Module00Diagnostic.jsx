import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (fichier de DONNÉES uniquement).
 *
 * Prérequis officiels (coursesData.js, clé '3e_calcul_litteral') :
 * « Nombres relatifs », « Calcul numérique », « Propriétés de la
 * distributivité ». On teste donc le signe d'un produit de relatifs, une
 * somme de relatifs, les priorités opératoires, et la distributivité
 * NUMÉRIQUE (7 × 103 découpé en 7 × 100 + 7 × 3) — jamais le calcul
 * littéral lui-même, qui est le contenu de la leçon.
 */
const SKILLS = {
  relatifs: { label: 'Nombres relatifs', emoji: '±' },
  numerique: { label: 'Calcul numérique', emoji: '🔢' },
  distri: { label: 'Distributivité', emoji: '📦' },
};

const QUESTIONS = [
  {
    id: 'q1-produit-relatifs',
    skill: 'relatifs',
    points: 2,
    prompt: (
      <>
        Quel est le signe de <MathText>{'$(-4) \\times 7$'}</MathText> ?
      </>
    ),
    options: ['Positif', 'Négatif', 'Nul'],
    cols: 3,
    correct: 1,
    explain:
      'Un négatif multiplié par un positif donne un négatif : (−4) × 7 = −28. Deux négatifs, en revanche, donneraient un positif.',
  },
  {
    id: 'q2-somme-relatifs',
    skill: 'relatifs',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$-3 + 8$'}</MathText> ?
      </>
    ),
    options: ['5', '−5', '11'],
    cols: 3,
    correct: 0,
    explain:
      'On avance de 8 en partant de −3 : on franchit le 0 et on arrive à 5. (−11, ce serait −3 − 8 ; 11, ce serait 3 + 8.)',
  },
  {
    id: 'q3-soustraire-relatif',
    skill: 'relatifs',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$5 - (-2)$'}</MathText> ?
      </>
    ),
    options: ['3', '7', '−7'],
    cols: 3,
    correct: 1,
    explain:
      'Soustraire un nombre négatif revient à ajouter son opposé : 5 − (−2) = 5 + 2 = 7. C’est ce même réflexe de signe qui servira pour −(x − 4).',
  },
  {
    id: 'q4-priorites',
    skill: 'numerique',
    points: 2,
    prompt: (
      <>
        Combien font <MathText>{'$2 + 3 \\times 4$'}</MathText> ?
      </>
    ),
    options: ['20', '14', '9'],
    cols: 3,
    correct: 1,
    explain:
      'La multiplication passe avant l’addition : 3 × 4 = 12, puis 2 + 12 = 14. Répondre 20, c’est avoir additionné d’abord (2 + 3 = 5, puis × 4).',
  },
  {
    id: 'q5-distributivite-numerique',
    skill: 'distri',
    points: 2,
    prompt: (
      <>
        Pour calculer <MathText>{'$7 \\times 103$'}</MathText> de tête, on découpe 103 en 100 + 3. Quel
        calcul donne le bon résultat ?
      </>
    ),
    options: ['7 × 100 + 3', '7 × 100 + 7 × 3', '7 × 100 × 7 × 3'],
    cols: 1,
    correct: 1,
    explain:
      'Le 7 multiplie CHACUN des deux morceaux : 7 × 100 + 7 × 3 = 700 + 21 = 721. Oublier le second produit (7 × 100 + 3 = 703) est exactement l’erreur qu’on retrouvera plus tard avec 4(2x − 3).',
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
            Cette leçon s’appuie sur les nombres relatifs, le calcul numérique et la distributivité.
            Vérifions ces réflexes en cinq questions. Ce n’est pas un examen — tu continueras vers le
            Module 1 quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
