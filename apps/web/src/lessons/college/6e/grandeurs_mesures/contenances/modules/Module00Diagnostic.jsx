import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 V2 — même diagnostic que Module00Diagnostic.jsx, reconstruit sur
 * le lesson kit : ce fichier ne contient plus que les DONNÉES. Le moteur
 * (score, paliers, persistance, correction, jamais-bloquant) vit dans
 * common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiel (coursesData.js, 6e_contenances) : "Conversions
 * d'unités" — le sens général du passage d'une unité à l'autre par
 * puissances de 10, PAS les unités de contenance elles-mêmes.
 */
const SKILLS = {
  conversionsUnites: { label: "Conversions d'unités", emoji: '🔁' },
};

const QUESTIONS = [
  {
    id: 'q1-cm-m',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien y a-t-il de centimètres dans <strong className="font-mono">1 mètre</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm : le mètre se partage en 100 centimètres.',
  },
  {
    id: 'q2-sens',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'conversionsUnites',
    points: 2,
    prompt: (
      <>
        Un objet mesure <strong className="font-mono">3 mètres</strong>. En centimètres, ce nombre sera :
      </>
    ),
    options: ['Plus petit', 'Plus grand', 'Identique'],
    cols: 3,
    correct: 1,
    explain: "Une unité plus petite (le cm) donne un nombre plus grand pour la même longueur : 3 m = 300 cm.",
  },
  {
    id: 'q3-dix',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['multiplication-repetee'],
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien de fois 10 faut-il pour obtenir 1 000 ?</>,
    options: ['2 fois (10 × 2)', '3 fois (10 × 10 × 10)', '10 fois'],
    cols: 1,
    correct: 1,
    explain: '10 × 10 × 10 = 1 000 : trois multiplications par 10 successives.',
  },
  {
    id: 'q4-graduation',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'conversionsUnites',
    points: 2,
    prompt: (
      <>
        Sur une règle graduée de 0 à 10, avec une graduation tous les 1 cm, à combien de centimètres se
        trouve la 7ᵉ graduation après 0 ?
      </>
    ),
    options: ['5 cm', '7 cm', '10 cm'],
    cols: 3,
    correct: 1,
    explain: 'Chaque graduation vaut 1 cm : la 7ᵉ graduation se trouve donc à 7 cm.',
  },
  {
    id: 'q5-poids',
    // Ce que la question MESURE — jamais ce que la leçon enseigne
    // (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
    requires: ['calcul-numerique'],
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien y a-t-il de grammes dans <strong className="font-mono">1 kilogramme</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 2,
    explain: '1 kg = 1 000 g : même logique que pour les longueurs, par paquets de 1 000.',
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
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les contenances : passer
            d'une unité à l'autre. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et
            tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
