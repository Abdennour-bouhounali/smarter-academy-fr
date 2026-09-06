import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiel (coursesData.js, 6e_masses) : « Unités de mesure » — le
 * sens général d'une échelle d'unités et des multiplications par 1 000, PAS
 * la pesée ni la conversion des masses elles-mêmes, enseignées à partir du
 * Module 1.
 */
const SKILLS = {
  ordresGrandeur: { label: 'Unités et paquets de 1 000', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'q1-kg-g',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Combien y a-t-il de grammes dans <strong className="font-mono">1 kilogramme</strong> ?</>,
    options: ['100', '1 000', '10 000'],
    cols: 3,
    correct: 1,
    explain: '1 kg = 1 000 g : le préfixe « kilo » signifie justement « mille ».',
  },
  {
    id: 'q2-plus-lourd',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Lequel est le plus lourd : <strong className="font-mono">1 kg</strong> ou <strong className="font-mono">1 000 g</strong> ?</>,
    options: ['1 kg', '1 000 g', 'Ils sont égaux'],
    cols: 1,
    correct: 2,
    explain: '1 kg = 1 000 g : ce sont deux écritures de la même masse.',
  },
  {
    id: 'q3-sens',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'ordresGrandeur',
    points: 2,
    prompt: (
      <>
        Un objet pèse <strong className="font-mono">3 kilogrammes</strong>. Exprimé en grammes, ce nombre sera :
      </>
    ),
    options: ['Plus petit', 'Plus grand', 'Identique'],
    cols: 3,
    correct: 1,
    explain: 'Une unité plus petite (le gramme) donne un nombre plus grand pour la même masse : 3 kg = 3 000 g.',
  },
  {
    id: 'q4-comparer',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'ordresGrandeur',
    points: 2,
    prompt: (
      <>
        Range du plus petit au plus grand : <strong className="font-mono">1 200</strong>,{' '}
        <strong className="font-mono">980</strong>, <strong className="font-mono">1 020</strong>.
      </>
    ),
    options: ['980 · 1 020 · 1 200', '980 · 1 200 · 1 020', '1 020 · 980 · 1 200'],
    cols: 1,
    correct: 0,
    explain: '980 n’a que trois chiffres : c’est le plus petit. Puis 1 020 vient avant 1 200.',
  },
  {
    id: 'q5-mille',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['multiplication-repetee'],
    skill: 'ordresGrandeur',
    points: 2,
    prompt: <>Combien font <strong className="font-mono">2 × 1 000</strong> ?</>,
    options: ['200', '2 000', '20 000'],
    cols: 3,
    correct: 1,
    explain: '2 × 1 000 = 2 000. Multiplier par 1 000 revient à ajouter trois zéros.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les masses : le sens des unités
            et des multiplications par 1 000. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen,
            et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
