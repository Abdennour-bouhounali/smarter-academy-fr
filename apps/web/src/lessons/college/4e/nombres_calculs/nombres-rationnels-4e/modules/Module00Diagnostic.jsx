import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — la fraction comme
 * nombre, les fractions égales, la simplification, la comparaison, l'addition
 * à dénominateurs multiples (5e), et la règle des signes (leçon « Opérations
 * sur les nombres relatifs » de 4e) — et RIEN de la matière de la leçon : ni
 * produits en croix, ni dénominateurs quelconques, ni produit, ni inverse.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  sens: { label: 'La fraction, un nombre', emoji: '🍰' },
  ecritures: { label: 'Écritures égales', emoji: '🔁' },
  calcul: { label: 'Calculer', emoji: '➕' },
  signes: { label: 'Signes', emoji: '±' },
};

const QUESTIONS = [
  {
    id: 'nra4-d1-sens',
    skill: 'sens',
    points: 2,
    requires: ['fraction-nombre'],
    prompt: 'Sur une droite graduée, où se trouve 5/4 ?',
    options: ['Entre 1 et 2', 'Entre 0 et 1', 'Entre 4 et 5'],
    cols: 3,
    correct: 0,
    explain: '5/4, c’est 5 quarts : quatre quarts font déjà 1, il en reste un. Le nombre est donc juste après 1.',
  },
  {
    id: 'nra4-d2-egales',
    skill: 'ecritures',
    points: 2,
    requires: ['fractions-egales'],
    prompt: 'Quelle fraction est égale à 3/5 ?',
    options: ['9/15', '6/8', '4/6'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie les DEUX termes par 3 : 3×3 = 9 et 5×3 = 15. Les deux autres viennent d’un ajout, pas d’une multiplication.',
  },
  {
    id: 'nra4-d3-simplifier',
    skill: 'ecritures',
    points: 2,
    requires: ['simplifier'],
    prompt: 'Quelle est l’écriture la plus simple de 12/18 ?',
    options: ['2/3', '6/9', '4/6'],
    cols: 3,
    correct: 0,
    explain: 'On divise les deux termes par 6 : 12 ÷ 6 = 2 et 18 ÷ 6 = 3. 6/9 et 4/6 désignent bien le même nombre, mais peuvent encore être réduits.',
  },
  {
    id: 'nra4-d4-additionner',
    skill: 'calcul',
    points: 2,
    requires: ['additionner-fractions'],
    prompt: 'Combien fait 1/6 + 2/6 ?',
    options: ['3/6', '3/12', '2/6'],
    cols: 3,
    correct: 0,
    explain: 'Les parts ont déjà la même taille : on compte les parts, 1 + 2 = 3, et la taille des parts ne change pas. On obtient 3/6, c’est-à-dire 1/2.',
  },
  {
    id: 'nra4-d5-comparer',
    skill: 'sens',
    points: 2,
    requires: ['comparer-fractions'],
    prompt: 'Lequel est le plus grand : 3/4 ou 5/8 ?',
    options: ['3/4', '5/8', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: 'On réécrit 3/4 en huitièmes : 3/4 = 6/8. Et 6/8 > 5/8. Un plus grand numérateur ne suffit donc pas à faire un plus grand nombre.',
  },
  {
    id: 'nra4-d6-signes',
    skill: 'signes',
    points: 2,
    requires: ['nombre-relatif', 'regle-des-signes'],
    prompt: 'Combien fait (−3) × (−5) ?',
    options: ['15', '−15', '−8'],
    cols: 3,
    correct: 0,
    explain: 'Deux facteurs de même signe donnent un produit positif : 3 × 5 = 15. (−8 serait la somme, pas le produit.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions sur ce que tu sais déjà des fractions"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon va ouvrir les fractions aux <strong>dénominateurs quelconques</strong>, au
            produit et à la division. Avant cela, un tour de ce que tu sais déjà : le sens d’une
            fraction, les écritures égales, la simplification et les signes.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
