import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis de 5e listés dans `priorKnowledge` — le sens de la
 * puissance, l'exposant qui compte les facteurs, le carré et le cube, les
 * puissances de 10 positives, la priorité du calcul, le décalage de la
 * virgule — et RIEN de la matière de la leçon : ni exposant négatif, ni
 * règles opératoires, ni notation scientifique.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  sens: { label: 'Sens de la puissance', emoji: '⚡' },
  dix: { label: 'Puissances de 10', emoji: '🔟' },
  calcul: { label: 'Calculer', emoji: '🧮' },
};

const QUESTIONS = [
  {
    id: 'pu4-d1-sens',
    skill: 'sens',
    points: 2,
    requires: ['puissance', 'exposant'],
    prompt: 'Combien vaut 2⁴ ?',
    options: ['16', '8', '6'],
    cols: 3,
    correct: 0,
    explain: '2⁴ veut dire 2 × 2 × 2 × 2 = 16. L’exposant COMPTE les facteurs, il ne les multiplie pas : 8 serait 2 × 4.',
  },
  {
    id: 'pu4-d2-exposant',
    skill: 'sens',
    points: 2,
    requires: ['exposant'],
    prompt: 'Que compte l’exposant dans 5³ ?',
    options: ['Le nombre de facteurs 5', 'Le nombre par lequel on multiplie 5', 'Le résultat'],
    cols: 1,
    correct: 0,
    explain: 'L’exposant dit COMBIEN DE FOIS la base apparaît dans le produit : 5³ = 5 × 5 × 5.',
  },
  {
    id: 'pu4-d3-carre',
    skill: 'sens',
    points: 2,
    requires: ['carre-cube'],
    prompt: 'Combien vaut 7² ?',
    options: ['49', '14', '27'],
    cols: 3,
    correct: 0,
    explain: '7² se lit « 7 au carré » : c’est 7 × 7 = 49. C’est aussi l’aire d’un carré de côté 7.',
  },
  {
    id: 'pu4-d4-dix',
    skill: 'dix',
    points: 2,
    requires: ['puissance-de-dix'],
    prompt: 'Combien vaut 10⁵ ?',
    options: ['100 000', '50', '10 000'],
    cols: 3,
    correct: 0,
    explain: '10⁵ = 1 suivi de 5 zéros, soit 100 000. L’exposant donne directement le nombre de zéros.',
  },
  {
    id: 'pu4-d5-virgule',
    skill: 'dix',
    points: 2,
    requires: ['decalage-virgule'],
    prompt: 'Combien fait 3,7 × 100 ?',
    options: ['370', '3700', '37'],
    cols: 3,
    correct: 0,
    explain: 'Multiplier par 100, c’est décaler la virgule de deux rangs vers la droite : 3,7 devient 370.',
  },
  {
    id: 'pu4-d6-quotient',
    skill: 'calcul',
    points: 2,
    requires: ['quotient'],
    prompt: 'Combien fait 1000 ÷ 10 ?',
    options: ['100', '10', '990'],
    cols: 3,
    correct: 0,
    explain: 'Diviser par 10 retire un rang : 1000 devient 100. (990 viendrait d’une soustraction — diviser n’est pas retirer.)',
  },
  {
    id: 'pu4-d7-priorite',
    skill: 'calcul',
    points: 2,
    requires: ['priorite-puissance'],
    prompt: 'Combien fait 3 + 2³ ?',
    options: ['11', '125', '9'],
    cols: 3,
    correct: 0,
    explain: 'La puissance se calcule avant l’addition : 2³ = 8, puis 3 + 8 = 11. (125 viendrait de 5³, c’est-à-dire d’avoir additionné d’abord.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Sept questions sur tes acquis de 5e"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon va prolonger les puissances <strong>sous l’exposant zéro</strong> et servir à
            écrire les très grands et très petits nombres. Avant cela, un tour de ce que la 5e t’a
            laissé : le sens de la puissance, le carré, les puissances de 10 et les priorités.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
