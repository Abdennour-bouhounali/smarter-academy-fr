import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni relatif, ni opposé, ni comparaison de
 * négatifs. Tout ici est de la 6e — lire une graduation, comparer deux
 * positifs, additionner, soustraire, lire un écart.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  graduation: { label: 'Droite graduée', emoji: '📏' },
  ordre: { label: 'Comparer', emoji: '⚖️' },
  calcul: { label: 'Calculer', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'nr5-d1-lire',
    skill: 'graduation',
    points: 2,
    requires: ['droite-graduee', 'abscisse'],
    prompt: 'Sur une droite graduée de 1 en 1, on part de 0 et on avance de 4 graduations vers la droite. Où arrive-t-on ?',
    options: ['4', '5', '3'],
    cols: 3,
    correct: 0,
    explain: 'On compte les graduations à partir de zéro : 1, 2, 3, 4. On arrive sur le nombre 4.',
  },
  {
    id: 'nr5-d2-graduation',
    skill: 'graduation',
    points: 2,
    requires: ['droite-graduee', 'abscisse'],
    prompt: 'Sur une droite graduée, entre les nombres 3 et 8, combien y a-t-il de graduations d’écart ?',
    options: ['5', '6', '11'],
    cols: 3,
    correct: 0,
    explain: 'De 3 à 8, on avance de 5 graduations : 8 − 3 = 5. (11 serait la somme, pas l’écart.)',
  },
  {
    id: 'nr5-d3-ordre',
    skill: 'ordre',
    points: 2,
    requires: ['comparaison'],
    prompt: 'Range dans l’ordre croissant : 7 ; 2 ; 5.',
    options: ['2 ; 5 ; 7', '7 ; 5 ; 2', '2 ; 7 ; 5'],
    cols: 3,
    correct: 0,
    explain: 'L’ordre croissant va du plus petit au plus grand : 2, puis 5, puis 7.',
  },
  {
    id: 'nr5-d4-addition',
    skill: 'calcul',
    points: 2,
    requires: ['addition'],
    prompt: 'Un ascenseur est au 2ᵉ étage et monte de 3 étages. À quel étage arrive-t-il ?',
    options: ['5', '6', '1'],
    cols: 3,
    correct: 0,
    explain: 'Monter de 3 étages depuis le 2ᵉ : 2 + 3 = 5.',
  },
  {
    id: 'nr5-d5-soustraction',
    skill: 'calcul',
    points: 2,
    requires: ['soustraction', 'ecart'],
    prompt: 'Un ascenseur est au 9ᵉ étage et descend de 4 étages. À quel étage arrive-t-il ?',
    options: ['5', '13', '4'],
    cols: 3,
    correct: 0,
    explain: 'Descendre de 4 étages depuis le 9ᵉ : 9 − 4 = 5.',
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
            Avant de monter dans l’ascenseur, un tour de tes outils : lire une droite graduée,
            compter un écart, ranger des nombres, monter et descendre d’un étage.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
