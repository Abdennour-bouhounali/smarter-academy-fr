import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis de 5e listés dans `priorKnowledge` — le sens du relatif,
 * l'opposé, la comparaison, la somme et la différence, les priorités sur les
 * positifs — et RIEN de la matière de la leçon : ni produit, ni quotient, ni
 * règle des signes.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  sens: { label: 'Sens du relatif', emoji: '🌡️' },
  somme: { label: 'Somme et différence', emoji: '➕' },
  ordre: { label: 'Priorités', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'nr4-d1-oppose',
    skill: 'sens',
    points: 2,
    requires: ['oppose', 'nombre-relatif'],
    prompt: 'Quel est l’opposé de −9 ?',
    options: ['9', '−9', '0'],
    cols: 3,
    correct: 0,
    explain: 'L’opposé de −9 est 9 : même distance à zéro, de l’autre côté.',
  },
  {
    id: 'nr4-d2-comparer',
    skill: 'sens',
    points: 2,
    requires: ['ordre-relatifs', 'distance-a-zero'],
    prompt: 'Lequel de ces deux nombres est le plus grand : −4 ou −11 ?',
    options: ['−4', '−11', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: '−4 est plus à droite que −11 sur la droite graduée, donc plus grand — même si 11 > 4.',
  },
  {
    id: 'nr4-d3-somme',
    skill: 'somme',
    points: 2,
    requires: ['addition-deplacement'],
    prompt: 'Combien fait −7 + 3 ?',
    options: ['−4', '−10', '4'],
    cols: 3,
    correct: 0,
    explain: 'On part de −7 et on avance de 3 vers la droite : on arrive sur −4.',
  },
  {
    id: 'nr4-d4-difference',
    skill: 'somme',
    points: 2,
    requires: ['soustraction-oppose'],
    prompt: 'Combien fait 2 − (−6) ?',
    options: ['8', '−4', '−8'],
    cols: 3,
    correct: 0,
    explain: 'Retirer −6 revient à ajouter 6 : 2 + 6 = 8.',
  },
  {
    id: 'nr4-d5-priorites',
    skill: 'ordre',
    points: 2,
    requires: ['priorites-operatoires'],
    prompt: 'Combien fait 5 + 2 × 4 ?',
    options: ['13', '28', '11'],
    cols: 3,
    correct: 0,
    explain: 'La multiplication se calcule avant l’addition : 2 × 4 = 8, puis 5 + 8 = 13. (28 vient d’un calcul de gauche à droite.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions sur tes acquis de 5e"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon ouvre la multiplication et la division des relatifs. Avant cela, un tour de
            ce que la 5e t’a laissé : l’opposé, la comparaison, la somme, la différence et les
            priorités. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
