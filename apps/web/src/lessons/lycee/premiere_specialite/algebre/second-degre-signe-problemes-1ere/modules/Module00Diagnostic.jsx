import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * le discriminant et les racines d'un trinôme (leçon amont), la forme
 * factorisée, la résolution d'une inéquation du premier degré et sa règle du
 * signe, et l'écriture d'un ensemble en intervalle.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur le SIGNE d'un trinôme sur un
 *   intervalle, sur un tableau de signes, sur une inéquation du second degré,
 *   ni sur la traduction d'une situation concrète — c'est la matière de la
 *   leçon.
 *
 *   VOCABULAIRE INTERDIT ICI, y compris dans les `explain` : « le signe du
 *   trinôme » comme objet d'étude, « tableau de signes », « inéquation du
 *   second degré », « modéliser », « interpréter dans le contexte ». Ce sont
 *   les notions que la leçon POSE.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     sp-d1  discriminant, trinome
 *     sp-d2  formule-racines, forme-factorisee-trinome
 *     sp-d3  methode-resoudre-inequation
 *     sp-d4  regle-signe-retourne, mem-signe-negatif
 *     sp-d5  intervalle, borne-incluse-exclue, intervalle-crochets
 */
const SKILLS = {
  delta: { label: 'Discriminant', emoji: 'Δ' },
  racines: { label: 'Racines', emoji: '🎯' },
  inequations: { label: 'Inéquations de 2de', emoji: '⚖️' },
  signes: { label: 'Règle du signe', emoji: '±' },
  intervalles: { label: 'Intervalles', emoji: '[ ]' },
};

const QUESTIONS = [
  {
    id: 'sp-d1',
    requires: ['discriminant', 'trinome'],
    skill: 'delta',
    points: 2,
    prompt: 'Quel est le discriminant du trinôme x² − 5x + 6 ?',
    options: ['1', '49', '19', '−1'],
    cols: 4,
    correct: 0,
    explain: 'Δ = (−5)² − 4 × 1 × 6 = 25 − 24 = 1. Répondre 49, c’est avoir ajouté 4ac au lieu de le retrancher.',
  },
  {
    id: 'sp-d2',
    requires: ['formule-racines', 'forme-factorisee-trinome'],
    skill: 'racines',
    points: 2,
    prompt: 'Le trinôme x² − 5x + 6 a pour discriminant 1. Quelles sont ses racines, et quelle est sa forme factorisée ?',
    options: [
      '2 et 3, donc (x − 2)(x − 3)',
      '2 et 3, donc (x + 2)(x + 3)',
      '−2 et −3, donc (x − 2)(x − 3)',
      '5 et 6, donc (x − 5)(x − 6)',
    ],
    cols: 1,
    correct: 0,
    explain: 'x = (5 ± 1) ÷ 2, soit 2 et 3. Chaque parenthèse s’écrit (x − racine), d’où (x − 2)(x − 3). En multipliant les deux parenthèses on retrouve bien x² − 5x + 6.',
  },
  {
    id: 'sp-d3',
    requires: ['methode-resoudre-inequation'],
    skill: 'inequations',
    points: 2,
    prompt: 'Résous l’inéquation 3x − 6 > 0, où x n’apparaît qu’à la puissance un.',
    options: ['x > 2', 'x < 2', 'x > 6', 'x > −2'],
    cols: 4,
    correct: 0,
    explain: 'On ajoute 6 aux deux membres : 3x > 6, puis on divise par 3, qui est positif : x > 2. Le sens de l’inégalité ne change pas.',
  },
  {
    id: 'sp-d4',
    requires: ['regle-signe-retourne', 'mem-signe-negatif'],
    skill: 'signes',
    points: 2,
    prompt: 'On part de −2x > 6. Que devient l’inégalité quand on divise les deux membres par −2 ?',
    options: [
      'x < −3 : diviser par un nombre négatif RETOURNE l’inégalité',
      'x > −3 : le sens ne change jamais quand on divise',
      'x > 3 : on change le signe du résultat, pas celui de l’inégalité',
      'x < 3 : on retourne l’inégalité et on garde 6 ÷ 2',
    ],
    cols: 1,
    correct: 0,
    explain: 'Multiplier ou diviser par un nombre négatif retourne le sens : de > on passe à <. Et 6 ÷ (−2) = −3. On obtient donc x < −3. Vérification avec x = −4 : −2 × (−4) = 8, et 8 > 6 ✔',
  },
  {
    id: 'sp-d5',
    requires: ['intervalle', 'borne-incluse-exclue', 'intervalle-crochets'],
    skill: 'intervalles',
    points: 2,
    prompt: 'Comment s’écrit en intervalle l’ensemble des nombres x tels que 2 ⩽ x < 7 ?',
    options: ['[2 ; 7[', ']2 ; 7]', '[2 ; 7]', ']2 ; 7['],
    cols: 4,
    correct: 0,
    explain: 'Le crochet se tourne VERS le nombre quand la borne est comprise : 2 l’est (⩽), donc [2 ; et 7 ne l’est pas (<), donc 7[. On écrit [2 ; 7[.',
  },
  {
    id: 'sp-d6',
    requires: ['intervalle', 'intervalle-crochets'],
    skill: 'intervalles',
    points: 2,
    prompt: 'Que désigne l’écriture ]−∞ ; 4] ?',
    options: [
      'Tous les nombres inférieurs ou égaux à 4',
      'Tous les nombres strictement inférieurs à 4',
      'Tous les nombres compris entre −∞ et 4, 4 exclu',
      'Le seul nombre 4',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le crochet fermé à droite dit que 4 fait partie de l’ensemble. Du côté de l’infini, le crochet est toujours ouvert : l’infini n’est pas un nombre, il ne peut pas être compris.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Six questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de faire glisser une péniche sous une arche de pont, un tour de tes outils : le
            discriminant, les racines, la forme factorisée, les inéquations où x n’apparaît qu’à la
            puissance un, et l’écriture des intervalles. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
