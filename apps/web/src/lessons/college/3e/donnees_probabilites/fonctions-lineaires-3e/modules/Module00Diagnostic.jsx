import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — fonctions, proportionnalité,
 * repérage dans le plan — et jamais la matière de la leçon : ni f(x) = ax, ni
 * coefficient de fonction linéaire, ni droite passant par l'origine. Aucune
 * question ne porte de métadonnée `assessment`.
 */

const SKILLS = {
  fonction: { label: 'Fonctions', emoji: '⚙️' },
  proportion: { label: 'Proportionnalité', emoji: '⚖️' },
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
};

const QUESTIONS = [
  {
    id: 'fl-d1',
    skill: 'fonction',
    points: 2,
    prompt: 'Soit f la fonction définie par f(x) = 5x. Que vaut f(3) ?',
    options: ['15', '8', '53', '5'],
    cols: 2,
    correct: 0,
    explain: 'On remplace x par 3 : 5 × 3 = 15.',
  },
  {
    id: 'fl-d2',
    skill: 'fonction',
    points: 2,
    prompt: 'On sait que g(7) = 21. Quelle phrase est exacte ?',
    options: ['21 est l’image de 7', '7 est l’image de 21', 'g vaut 21 partout', '7 et 21 sont deux images'],
    cols: 1,
    correct: 0,
    explain: 'Le nombre entre parenthèses est l’antécédent ; le résultat est l’image.',
  },
  {
    id: 'fl-d3',
    skill: 'proportion',
    points: 2,
    prompt: '5 stylos coûtent 7,50 €. Combien coûte un stylo ?',
    options: ['1,50 €', '2,50 €', '1,25 €', '3,75 €'],
    cols: 2,
    correct: 0,
    explain: '7,50 ÷ 5 = 1,50 €. C’est le passage par l’unité.',
  },
  {
    id: 'fl-d4',
    skill: 'proportion',
    points: 2,
    prompt: 'Ce tableau est-il proportionnel ? 2 → 6 · 3 → 9 · 5 → 15',
    options: ['Oui, tous les rapports valent 3', 'Non, les écarts changent', 'Oui, on ajoute 3 à chaque fois'],
    cols: 1,
    correct: 0,
    explain: '6 ÷ 2 = 3, 9 ÷ 3 = 3, 15 ÷ 5 = 3 : les rapports sont égaux, c’est proportionnel.',
  },
  {
    id: 'fl-d5',
    skill: 'repere',
    points: 2,
    prompt: 'Quelles sont les coordonnées du point situé 2 à droite et 5 en haut de l’origine ?',
    options: ['(2 ; 5)', '(5 ; 2)', '(−2 ; 5)', '(2 ; −5)'],
    cols: 2,
    correct: 0,
    explain: 'L’abscisse d’abord (2 vers la droite), puis l’ordonnée (5 vers le haut).',
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
            Cinq questions rapides sur ce qui sert ici : calculer une image, reconnaître une
            proportionnalité, lire un repère. Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
