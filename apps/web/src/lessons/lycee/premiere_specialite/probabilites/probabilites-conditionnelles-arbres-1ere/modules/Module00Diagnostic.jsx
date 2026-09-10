import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner,
 * et qui vient ENTIÈREMENT des deux leçons de 2de déjà livrées : l'univers
 * restreint, la notation P_A(B), la non-symétrie du conditionnement, la
 * structure de l'arbre, la somme des branches d'un nœud, les poids
 * conditionnels du second niveau, le produit le long d'un chemin et la somme
 * des chemins.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur ce que la leçon doit établir —
 *   et la règle va plus loin : AUCUN MOT de la leçon n'apparaît ici, pas même
 *   dans un `explain`. Ni « probabilités totales », ni « partition », ni
 *   « paradoxe », ni « instrument de calcul ». Les mêmes idées se disent avec
 *   le vocabulaire de la Seconde, qui est acquis.
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     pc-d1  univers-restreint, denominateur
 *     pc-d2  notation-sachant
 *     pc-d3  inversion
 *     pc-d4  arbre-structure, somme-branches
 *     pc-d5  poids-conditionnels
 *     pc-d6  produit-chemin, somme-chemins
 *     pc-d7  probabilite, effectif, pourcentage, quotient
 *     pc-d8  issue-evenement (aussi mesuré par pc-d2)
 */
const SKILLS = {
  univers: { label: 'Univers restreint', emoji: '🎯' },
  notation: { label: 'La notation P_A(B)', emoji: '✍️' },
  arbre: { label: 'Arbres pondérés', emoji: '🌳' },
  compter: { label: 'Compter et diviser', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'pc-d1',
    requires: ['univers-restreint', 'denominateur'],
    skill: 'univers',
    points: 2,
    prompt: 'Dans un club de 400 membres, 100 sont juniors et 40 de ces juniors jouent en compétition. On choisit un junior au hasard : quelle est la probabilité qu’il joue en compétition ?',
    options: ['40 / 100', '40 / 400', '100 / 400'],
    cols: 3,
    correct: 0,
    explain: 'On ne choisit que parmi les 100 juniors : c’est ce nombre qui va au dénominateur. 40/100 = 0,4.',
  },
  {
    id: 'pc-d2',
    requires: ['notation-sachant', 'issue-evenement'],
    skill: 'notation',
    points: 2,
    prompt: 'Dans l’écriture P_A(B), lequel des deux événements donne le dénominateur ?',
    options: ['A, celui qui est en indice', 'B, celui qui est entre parenthèses', 'Aucun des deux'],
    cols: 1,
    correct: 0,
    explain: 'L’indice porte la condition : c’est son effectif qui devient le dénominateur, et B est l’événement dont on calcule la part à l’intérieur.',
  },
  {
    id: 'pc-d3',
    requires: ['inversion'],
    skill: 'notation',
    points: 2,
    prompt: '90 % des joueurs de l’équipe première sont majeurs. Peut-on en déduire que 90 % des majeurs du club jouent en équipe première ?',
    options: [
      'Non : les deux phrases comptent sur des groupes différents',
      'Oui : c’est le même pourcentage',
      'Oui, à condition que le club ait plus de 100 membres',
    ],
    cols: 1,
    correct: 0,
    explain: 'La première phrase compte parmi les joueurs de l’équipe première, la seconde parmi tous les majeurs du club. Deux groupes, deux quotients — sans lien automatique.',
  },
  {
    id: 'pc-d4',
    requires: ['arbre-structure', 'somme-branches'],
    skill: 'arbre',
    points: 2,
    prompt: 'Trois branches partent d’un même nœud d’un arbre pondéré. Deux portent 0,5 et 0,2. Que porte la troisième ?',
    options: ['0,3', '0,7', '1,3'],
    cols: 3,
    correct: 0,
    explain: 'Les branches issues d’un même nœud couvrent toutes les suites possibles : leurs poids s’additionnent pour faire 1. Donc 1 − 0,5 − 0,2 = 0,3.',
  },
  {
    id: 'pc-d5',
    requires: ['poids-conditionnels'],
    skill: 'arbre',
    points: 2,
    prompt: 'Sur la branche « sac A », un poids de 0,25 est accroché à « rouge » au second niveau. Que signifie ce 0,25 ?',
    options: [
      '25 % des tirages QUI PASSENT PAR le sac A donnent une rouge',
      '25 % de tous les tirages donnent une rouge',
      '25 % des billes rouges sont dans le sac A',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un poids du second niveau se lit « sachant qu’on est arrivé à ce nœud ». Il ne porte que sur les tirages passés par le sac A.',
  },
  {
    id: 'pc-d6',
    requires: ['produit-chemin', 'somme-chemins'],
    skill: 'arbre',
    points: 2,
    prompt: 'Deux chemins mènent au résultat « rouge » : l’un pèse 0,6 × 0,5, l’autre 0,4 × 0,25. Quelle est la probabilité d’obtenir une rouge ?',
    options: ['0,4', '0,75', '0,3'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie le long de chaque chemin (0,30 et 0,10), puis on additionne les chemins qui donnent le même résultat : 0,30 + 0,10 = 0,40.',
  },
  {
    id: 'pc-d8',
    requires: ['issue-evenement', 'probabilite'],
    skill: 'compter',
    points: 2,
    prompt: 'On tire au hasard une boule dans un sac qui en contient six, numérotées de 1 à 6. Combien d’issues cette expérience a-t-elle ?',
    options: ['6', '2', '36'],
    cols: 3,
    correct: 0,
    explain: 'Une issue est un résultat possible de l’expérience : ici les six numéros, de 1 à 6.',
  },
  {
    id: 'pc-d7',
    requires: ['probabilite', 'effectif', 'pourcentage', 'quotient'],
    skill: 'compter',
    points: 2,
    prompt: 'Sur 2 000 pièces, 50 sont rebutées. Quelle part cela représente-t-il ?',
    options: ['2,5 %', '25 %', '0,25 %'],
    cols: 3,
    correct: 0,
    explain: '50 ÷ 2 000 = 0,025, soit 2,5 %. Le tout de référence est bien les 2 000 pièces.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Huit questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon reprend là où la Seconde s’est arrêtée. Avant de continuer, un tour de tes
            outils : une part calculée dans un groupe restreint, l’écriture P_A(B), un arbre
            pondéré et ses poids. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
