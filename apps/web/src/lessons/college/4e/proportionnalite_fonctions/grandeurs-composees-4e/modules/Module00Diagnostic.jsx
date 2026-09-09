import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — la vitesse moyenne de 5e
 * et son mémo, le coefficient de proportionnalité, et le quotient — et RIEN de
 * la matière de la leçon : ni grandeur quotient, ni débit, ni changement
 * d'unité, ni lecture de formule.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  vitesse: { label: 'Vitesse', emoji: '🚴' },
  quotient: { label: 'Diviser pour partager', emoji: '➗' },
  coefficient: { label: 'Passer d’une grandeur à l’autre', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'gc-d1-vitesse',
    skill: 'vitesse',
    points: 2,
    requires: ['vitesse-moyenne'],
    prompt: 'Une voiture parcourt 120 km en 2 h. À quelle vitesse roule-t-elle ?',
    options: ['60 km/h', '240 km/h', '122 km/h'],
    cols: 3,
    correct: 0,
    explain: '120 ÷ 2 = 60 : la voiture parcourt 60 km chaque heure.',
  },
  {
    id: 'gc-d2-memo-vitesse',
    skill: 'vitesse',
    points: 2,
    requires: ['mem-vitesse', 'vitesse-moyenne'],
    prompt: 'À 50 km/h pendant 3 h, quelle distance parcourt-on ?',
    options: ['150 km', '53 km', '16,7 km'],
    cols: 3,
    correct: 0,
    explain: '50 × 3 = 150 km : on répète 50 km chaque heure, trois fois.',
  },
  {
    id: 'gc-d3-quotient',
    skill: 'quotient',
    points: 2,
    requires: ['quotient'],
    prompt: '6 bouteilles contiennent 9 L au total. Combien contient une bouteille ?',
    options: ['1,5 L', '3 L', '54 L'],
    cols: 3,
    correct: 0,
    explain: '9 ÷ 6 = 1,5 L. Ce qu’une seule vaut s’obtient toujours par une division.',
  },
  {
    id: 'gc-d4-coefficient',
    skill: 'coefficient',
    points: 2,
    requires: ['coefficient-proportionnalite'],
    prompt: '5 kg de sable coûtent 4 €. Par quel nombre multiplie-t-on la masse pour obtenir le prix ?',
    options: ['0,8', '1,25', '20'],
    cols: 3,
    correct: 0,
    explain: '4 ÷ 5 = 0,8 : chaque kilogramme coûte 0,80 €, et c’est ce nombre-là qui fait passer de la masse au prix.',
  },
  {
    id: 'gc-d5-duree',
    skill: 'vitesse',
    points: 2,
    requires: ['vitesse-moyenne', 'quotient'],
    prompt: 'Un train roule à 80 km/h. Combien de temps met-il pour faire 200 km ?',
    options: ['2 h 30 min', '2 h', '3 h'],
    cols: 3,
    correct: 0,
    explain: '200 ÷ 80 = 2,5, c’est-à-dire 2 h 30 min. Une durée décimale se dit aussi en heures et minutes.',
  },
  {
    id: 'gc-d6-lecture',
    skill: 'quotient',
    points: 2,
    requires: ['quotient'],
    prompt: 'Que veut dire « ce robinet débite 10 litres par minute » ?',
    options: [
      'Chaque minute, il en sort 10 litres',
      'Il faut 10 minutes pour un litre',
      'Il contient 10 litres en tout',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le mot « par » dit combien il y en a POUR UNE unité de l’autre grandeur : 10 litres pour une minute.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Quatre acquis de 5e, vérifiés en quelques minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Six questions rapides sur la vitesse et la division de 5e. Rien n’est noté, rien ne
            bloque : elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
