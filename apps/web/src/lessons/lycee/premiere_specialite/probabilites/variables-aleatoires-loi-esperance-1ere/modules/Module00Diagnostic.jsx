import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * une expérience aléatoire et ses issues, une probabilité, la somme des
 * probabilités d'un même niveau d'arbre, le produit et la somme le long des
 * chemins, le lien fréquence / probabilité, et la lecture d'une part par
 * rapport à son tout.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur ce que la leçon doit établir,
 *   et — la règle va plus loin — AUCUN MOT de la leçon n'apparaît ici, pas même
 *   dans un `explain` : ni « variable aléatoire », ni « espérance », ni « loi
 *   de probabilité ». Les mêmes idées se disent avec le vocabulaire de 2de :
 *   « le nombre qu'on gagne », « la moyenne des résultats », « le tableau des
 *   probabilités ».
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     va-d1  probabilite
 *     va-d2  experience-aleatoire, issue-evenement
 *     va-d3  somme-branches
 *     va-d4  produit-chemin, somme-chemins
 *     va-d5  frequence-probabilite
 *     va-d6  proportion-reference
 */
const SKILLS = {
  proba: { label: 'Probabilités', emoji: '🎲' },
  arbre: { label: 'Arbres pondérés', emoji: '🌳' },
  freq: { label: 'Fréquences', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'va-d1',
    requires: ['probabilite'],
    skill: 'proba',
    points: 2,
    prompt: 'Une roue a 10 secteurs de même taille, dont 3 sont rouges. Quelle est la probabilité de s’arrêter sur un secteur rouge ?',
    options: ['3/10', '3/7', '1/3'],
    cols: 3,
    correct: 0,
    explain: 'Les 10 secteurs ont la même taille : chacun a la même chance. 3 secteurs conviennent sur 10 en tout, donc 3/10.',
  },
  {
    id: 'va-d2',
    requires: ['experience-aleatoire', 'issue-evenement'],
    skill: 'proba',
    points: 2,
    prompt: 'On tire au hasard une boule dans un sac qui en contient six, numérotées de 1 à 6. Combien y a-t-il d’issues possibles ?',
    options: ['6', '2', '36'],
    cols: 3,
    correct: 0,
    explain: 'Une issue est un résultat possible de l’expérience : ici les six numéros, de 1 à 6.',
  },
  {
    id: 'va-d3',
    requires: ['somme-branches'],
    skill: 'arbre',
    points: 2,
    prompt: 'Sur un arbre, deux branches partent du même nœud. La première porte 0,3. Que porte la seconde ?',
    options: ['0,7', '0,3', '1,3'],
    cols: 3,
    correct: 0,
    explain: 'Les branches issues d’un même nœud se partagent la totalité des possibilités : leurs poids s’additionnent pour faire 1. Donc 1 − 0,3 = 0,7.',
  },
  {
    id: 'va-d4',
    requires: ['produit-chemin', 'somme-chemins'],
    skill: 'arbre',
    points: 2,
    prompt: 'Un arbre a deux chemins qui mènent au résultat « rouge » : l’un pèse 0,3 × 0,5 et l’autre 0,7 × 0,2. Quelle est la probabilité d’obtenir « rouge » ?',
    options: ['0,29', '0,50', '0,15'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie le long de chaque chemin (0,15 et 0,14), puis on additionne les chemins qui donnent le même résultat : 0,15 + 0,14 = 0,29.',
  },
  {
    id: 'va-d5',
    requires: ['frequence-probabilite'],
    skill: 'freq',
    points: 2,
    prompt: 'On lance une pièce équilibrée 1 000 fois. À quoi s’attend-on pour la fréquence de « pile » ?',
    options: [
      'Elle sera proche de 0,5, sans valoir exactement 0,5',
      'Elle vaudra exactement 0,5',
      'Elle peut valoir n’importe quoi : rien ne se stabilise',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur un grand nombre de répétitions, la fréquence observée s’approche de la probabilité — sans la rejoindre exactement. C’est ce qu’on a vu en 2de.',
  },
  {
    id: 'va-d6',
    requires: ['proportion-reference'],
    skill: 'freq',
    points: 2,
    prompt: 'Dans une urne de 40 boules, 10 sont vertes. Quelle proportion des boules est verte ?',
    options: ['25 %', '10 %', '40 %'],
    cols: 3,
    correct: 0,
    explain: '10 sur 40, c’est-à-dire 10 ÷ 40 = 0,25, soit 25 %. Le tout de référence est bien les 40 boules.',
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
            Avant de faire tourner une roue de loterie, un tour de tes outils : une probabilité,
            des issues, un arbre pondéré et une fréquence observée.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
