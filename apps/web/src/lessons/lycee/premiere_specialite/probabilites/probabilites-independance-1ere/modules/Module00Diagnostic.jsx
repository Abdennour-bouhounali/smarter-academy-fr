import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner,
 * et qui vient ENTIÈREMENT de deux sources : les deux leçons de 2de sur le
 * conditionnement et les arbres, et la leçon « Probabilités conditionnelles :
 * arbres et probabilités totales » dont celle-ci est la suite directe.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur ce que la leçon doit établir,
 *   et la règle va plus loin : AUCUN MOT de la leçon n'apparaît ici, pas même
 *   dans un `explain`. Ni « indépendant », ni « incompatible », ni « inverser
 *   un conditionnement », ni « le test du produit ». Les mêmes idées se disent
 *   avec le vocabulaire déjà acquis.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     pi-d1  univers-restreint, denominateur
 *     pi-d2  notation-sachant, issue-evenement, inversion
 *     pi-d3  conditionnelle-sur-effectifs, intersection-vs-conditionnelle,
 *            denominateur-decide, phrase-population-reference
 *     pi-d4  arbre-structure, somme-branches
 *     pi-d5  poids-conditionnels, produit-chemin
 *     pi-d6  somme-chemins, arbre-instrument, probabilites-totales, partition
 *     pi-d7  probabilite, effectif, pourcentage, quotient
 *     pi-d8  frequence-conditionnelle, issue-evenement
 */
const SKILLS = {
  univers: { label: 'Le groupe de référence', emoji: '🎯' },
  notation: { label: 'La notation P_A(B)', emoji: '✍️' },
  arbre: { label: 'Arbres pondérés', emoji: '🌳' },
  compter: { label: 'Compter et diviser', emoji: '🔢' },
};

const QUESTIONS = [
  {
    id: 'pi-d1',
    requires: ['univers-restreint', 'denominateur'],
    skill: 'univers',
    points: 2,
    prompt: 'Dans un lycée de 900 élèves, 300 sont demi-pensionnaires et 210 de ces demi-pensionnaires viennent à pied. On choisit un demi-pensionnaire au hasard : quelle est la probabilité qu’il vienne à pied ?',
    options: ['210 / 300', '210 / 900', '300 / 900'],
    cols: 3,
    correct: 0,
    explain: 'On ne choisit que parmi les 300 demi-pensionnaires : c’est ce nombre qui va au dénominateur. 210/300 = 0,7.',
  },
  {
    id: 'pi-d2',
    requires: ['notation-sachant', 'issue-evenement', 'inversion'],
    skill: 'notation',
    points: 2,
    prompt: 'Dans l’écriture P_A(B), lequel des deux événements donne le dénominateur ?',
    options: ['A, celui qui est en indice', 'B, celui qui est entre parenthèses', 'Le total, dans tous les cas'],
    cols: 1,
    correct: 0,
    explain: 'L’indice porte la condition : c’est son effectif qui devient le dénominateur, et B est l’événement dont on calcule la part à l’intérieur.',
  },
  {
    id: 'pi-d3',
    requires: [
      'conditionnelle-sur-effectifs', 'intersection-vs-conditionnelle',
      'denominateur-decide', 'phrase-population-reference',
    ],
    skill: 'univers',
    points: 2,
    prompt: 'Sur 1 000 habitants, 150 sont à la fois cyclistes et proches du centre. Si le quartier « proche du centre » compte 200 habitants, la part de cyclistes parmi eux vaut 75 %. Que devient cette part si le même quartier en compte 600, les 150 cyclistes restant les mêmes ?',
    options: ['25 %', '75 %, comme avant', '15 %'],
    cols: 3,
    correct: 0,
    explain: 'Le comptage n’a pas bougé : 150 individus. Seul l’ensemble auquel on le rapporte a changé de taille. 150/600 = 0,25, soit 25 %.',
  },
  {
    id: 'pi-d4',
    requires: ['arbre-structure', 'somme-branches'],
    skill: 'arbre',
    points: 2,
    prompt: 'Deux branches partent d’un même nœud d’un arbre pondéré. L’une porte 0,35. Que porte l’autre ?',
    options: ['0,65', '0,35', '1,35'],
    cols: 3,
    correct: 0,
    explain: 'Les branches issues d’un même nœud couvrent toutes les suites possibles : leurs poids s’additionnent pour faire 1. Donc 1 − 0,35 = 0,65.',
  },
  {
    id: 'pi-d5',
    requires: ['poids-conditionnels', 'produit-chemin'],
    skill: 'arbre',
    points: 2,
    prompt: 'Un arbre porte 0,20 sur la branche « urne A » du premier niveau, et 0,30 sur la branche « boule verte » qui en part. Quelle est la probabilité de tirer dans l’urne A une boule verte ?',
    options: ['0,06', '0,50', '0,30'],
    cols: 3,
    correct: 0,
    explain: 'Le long d’un chemin, on multiplie les poids rencontrés : 0,20 × 0,30 = 0,06. Le second poids ne porte que sur les tirages passés par l’urne A.',
  },
  {
    id: 'pi-d6',
    requires: ['somme-chemins', 'arbre-instrument', 'probabilites-totales', 'partition'],
    skill: 'arbre',
    points: 2,
    prompt: 'Un atelier reçoit 70 % de ses pièces de la machine 1, qui en rate 10 %, et 30 % de la machine 2, qui en rate 20 %. Quelle est la probabilité qu’une pièce prise au hasard soit ratée ?',
    options: ['13 %', '15 %', '30 %'],
    cols: 3,
    correct: 0,
    explain: 'Les deux machines se partagent toutes les pièces sans recouvrement, on peut donc additionner les deux chemins : 0,70 × 0,10 + 0,30 × 0,20 = 0,07 + 0,06 = 0,13.',
  },
  {
    id: 'pi-d8',
    requires: ['frequence-conditionnelle', 'issue-evenement'],
    skill: 'compter',
    points: 2,
    prompt: 'Dans un tableau croisé d’effectifs, on lit une ligne entière et on divise chaque case par le total de cette ligne. Que représentent les nombres obtenus ?',
    options: [
      'La répartition à l’intérieur de cette ligne seulement',
      'La répartition sur l’ensemble du tableau',
      'La répartition à l’intérieur de chaque colonne',
    ],
    cols: 1,
    correct: 0,
    explain: 'Diviser par le total de la ligne, c’est se placer à l’intérieur de cette ligne : les nombres obtenus décrivent uniquement ce sous-groupe, et leur somme vaut 1.',
  },
  {
    id: 'pi-d7',
    requires: ['probabilite', 'effectif', 'pourcentage', 'quotient'],
    skill: 'compter',
    points: 2,
    prompt: 'Sur 2 500 billets vendus, 100 sont gagnants. Quelle part cela représente-t-il ?',
    options: ['4 %', '40 %', '0,4 %'],
    cols: 3,
    correct: 0,
    explain: '100 ÷ 2 500 = 0,04, soit 4 %. Le tout de référence est bien les 2 500 billets.',
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
            Cette leçon reprend là où la précédente s’est arrêtée. Avant de continuer, un tour de
            tes outils : une part calculée dans un groupe restreint, l’écriture P_A(B), un arbre
            pondéré et la somme de ses chemins. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
