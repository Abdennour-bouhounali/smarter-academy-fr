import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, construit sur le lesson kit : ce
 * fichier ne contient que les DONNÉES. Le moteur (score, paliers,
 * persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiels (coursesData.js, 6e_resolution_problemes) :
 * « Opérations », « Fractions », « Nombres décimaux » — ici, la fluidité de
 * calcul de base et la lecture attentive d'un énoncé simple, PAS la
 * démarche de résolution elle-même, qui est enseignée à partir du Module 1.
 */
const SKILLS = {
  operations: { label: 'Opérations de base', emoji: '🧮' },
  lecture: { label: "Lire un énoncé", emoji: '📖' },
};

const QUESTIONS = [
  {
    id: 'q1-division',
    skill: 'operations',
    points: 2,
    // Module 0 MESURE des prérequis : ses requires ne citent que des ids de
    // priorKnowledge (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['tables-multiplication'],
    prompt: <>Combien font <strong className="font-mono">24 ÷ 6</strong> ?</>,
    options: ['3', '4', '6'],
    cols: 3,
    correct: 1,
    explain: '24 ÷ 6 = 4 : en répartissant 24 en 6 groupes égaux, chaque groupe contient 4.',
  },
  {
    id: 'q2-multiplication',
    skill: 'operations',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: <>Combien font <strong className="font-mono">7 × 8</strong> ?</>,
    options: ['54', '56', '64'],
    cols: 3,
    correct: 1,
    explain: '7 × 8 = 56.',
  },
  {
    id: 'q3-decimal',
    skill: 'operations',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: <>Combien font <strong className="font-mono">3 × 4,50</strong> ?</>,
    options: ['12', '13,50', '14'],
    cols: 3,
    correct: 1,
    explain: '3 × 4,50 = 13,50 : 3 × 4 = 12, puis 3 × 0,50 = 1,50, soit 12 + 1,50 = 13,50.',
  },
  {
    id: 'q4-question',
    skill: 'lecture',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: (
      <>
        « Un panier contient 14 pommes et 9 poires. Combien de fruits contient-il en tout ? » Que cherche-t-on
        exactement ?
      </>
    ),
    options: ['Le nombre de pommes', 'Le nombre total de fruits', 'La différence entre pommes et poires'],
    cols: 1,
    correct: 1,
    explain: "La question porte sur le TOTAL de fruits, pas sur une seule sorte ni sur un écart.",
  },
  {
    id: 'q5-info-utile',
    skill: 'lecture',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: (
      <>
        « Léo a 15 cartes. Il est né en juillet. Zoé a 9 cartes. Combien de cartes ont-ils en tout ? » Quelle
        information ne sert à rien pour répondre ?
      </>
    ),
    options: ['Le nombre de cartes de Léo', 'Le mois de naissance de Léo', 'Le nombre de cartes de Zoé'],
    cols: 1,
    correct: 1,
    explain: "Le mois de naissance de Léo est une vraie information, mais elle ne sert à rien pour compter des cartes.",
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
            Vérifions ensemble la petite base dont tu auras besoin pour résoudre des problèmes : calculer
            sûrement et bien lire ce qu'on te demande. Ce test nous aide à savoir comment t'aider — ce n'est
            pas un examen, et tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
