import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge`) et rien de sa matière :
 * ni dépendance, ni « en fonction de », ni tableau de valeurs, ni lecture
 * graphique. Tout ici vient de la 6e et du calcul de 5e — le repérage, la
 * lecture d'un tableau, et remplacer une lettre par un nombre.
 *
 * PÉRIMÈTRE : aucune question n'emploie f(x), « image » ni « antécédent ».
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  repere: { label: 'Se repérer dans un repère', emoji: '📍' },
  tableau: { label: 'Lire un tableau', emoji: '📋' },
  calcul: { label: 'Calculer', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'fonc5-d1-coordonnees',
    skill: 'repere',
    points: 2,
    requires: ['coordonnees'],
    prompt: 'Un point a pour coordonnées (5 ; 3). Comment le place-t-on ?',
    options: [
      '5 vers la droite, puis 3 vers le haut',
      '3 vers la droite, puis 5 vers le haut',
      '5 vers le haut, puis 3 vers la droite',
    ],
    cols: 1,
    correct: 0,
    explain: 'On lit toujours le premier nombre sur l’axe horizontal : 5 vers la droite, puis 3 vers le haut.',
  },
  {
    id: 'fonc5-d2-abscisse',
    skill: 'repere',
    points: 2,
    requires: ['abscisse'],
    prompt: 'Dans le couple (7 ; 2), quel nombre se lit sur l’axe horizontal ?',
    options: ['7', '2', 'Les deux'],
    cols: 3,
    correct: 0,
    explain: 'Le premier nombre du couple, l’abscisse, se lit sur l’axe horizontal : ici, 7.',
  },
  {
    id: 'fonc5-d3-ordonnee',
    skill: 'repere',
    points: 2,
    requires: ['ordonnee'],
    prompt: 'Un point est situé à 4 vers la droite et 9 vers le haut. Quelles sont ses coordonnées ?',
    options: ['(4 ; 9)', '(9 ; 4)', '(4 + 9)'],
    cols: 3,
    correct: 0,
    explain: 'On écrit d’abord l’abscisse, puis l’ordonnée : (4 ; 9).',
  },
  {
    id: 'fonc5-d4-tableau',
    skill: 'tableau',
    points: 2,
    requires: ['lire-tableau'],
    prompt:
      'Un tableau donne : 1 h → 12 km, 2 h → 24 km, 3 h → 36 km. Quelle distance en 2 h ?',
    options: ['24 km', '12 km', '36 km'],
    cols: 3,
    correct: 0,
    explain: 'On cherche « 2 h » sur la première ligne, et on lit dessous : 24 km.',
  },
  {
    id: 'fonc5-d5-calcul',
    skill: 'calcul',
    points: 2,
    requires: ['calcul-numerique'],
    prompt: 'On multiplie un nombre par 3, puis on ajoute 2. Que donne le nombre 5 ?',
    options: ['17', '21', '10'],
    cols: 3,
    correct: 0,
    explain: '5 × 3 = 15, puis 15 + 2 = 17. (21 reviendrait à ajouter 2 d’abord, puis multiplier.)',
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
            Avant d’allumer le four de la cantine, un tour de tes outils : placer un point, lire un
            tableau, et suivre un petit calcul. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
