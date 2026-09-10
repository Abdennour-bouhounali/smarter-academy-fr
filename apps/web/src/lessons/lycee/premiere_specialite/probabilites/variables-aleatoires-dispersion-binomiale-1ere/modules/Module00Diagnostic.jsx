import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — prérequis. On MESURE ce que la leçon va employer sans l'enseigner :
 * un nombre associé à chaque issue, la loi et son tableau, l'espérance, la
 * structure d'un arbre pondéré et le produit le long d'un chemin, et le lien
 * entre fréquence observée et probabilité.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Un module 0 ne peut exiger que des `priorKnowledge` : il mesure, il
 *   n'enseigne pas. Aucune question ne porte sur ce que la leçon doit établir,
 *   et — la règle va plus loin — AUCUN MOT de la leçon n'apparaît ici, pas même
 *   dans un `explain` : ni « variance », ni « écart type », ni « dispersion »,
 *   ni « Bernoulli », ni « binomiale », ni « coefficient binomial ». Les idées
 *   voisines se disent avec le vocabulaire déjà acquis : « à quel point les
 *   résultats sont éloignés » ne s'écrit pas ici du tout, parce que c'est
 *   précisément la cible du module 1.
 *
 *   Chaque prérequis déclaré est mesuré par au moins une question :
 *     vd-d1  variable-aleatoire
 *     vd-d2  loi-de-probabilite
 *     vd-d3  tableau-de-loi
 *     vd-d4  esperance
 *     vd-d5  arbre-structure, produit-chemin
 *     vd-d6  somme-chemins
 *     vd-d7  frequence-probabilite
 */
const SKILLS = {
  variable: { label: 'Variables aléatoires', emoji: '🎯' },
  arbre: { label: 'Arbres pondérés', emoji: '🌳' },
  freq: { label: 'Fréquences', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'vd-d1',
    requires: ['variable-aleatoire'],
    skill: 'variable',
    points: 2,
    prompt: 'Une urne contient 10 jetons : 6 portent 1 €, 3 portent 4 € et 1 porte 10 €. X est le montant du jeton tiré. Combien de valeurs différentes X peut-il prendre ?',
    options: ['3', '10', '15'],
    cols: 3,
    correct: 0,
    explain: 'X prend les valeurs 1, 4 et 10 : trois valeurs. Répondre 10, c’est compter les jetons — c’est-à-dire les issues — et non les valeurs différentes.',
  },
  {
    id: 'vd-d2',
    requires: ['loi-de-probabilite'],
    skill: 'variable',
    points: 2,
    prompt: 'Avec la même urne (6 jetons à 1 €, 3 à 4 €, 1 à 10 €), que vaut P(X = 4) ?',
    options: ['0,3', '0,4', '0,25'],
    cols: 3,
    correct: 0,
    explain: '3 jetons sur les 10 que compte l’urne portent 4 € : 3/10 = 0,3. Répondre 0,25, c’est rapporter les 3 jetons aux 12 autres au lieu du total.',
  },
  {
    id: 'vd-d3',
    requires: ['tableau-de-loi'],
    skill: 'variable',
    points: 2,
    prompt: 'Un tableau donne P(X = 0) = 0,45 et P(X = 3) = 0,35, la troisième valeur étant 8. Que vaut P(X = 8) ?',
    options: ['0,2', '0,8', '0,55'],
    cols: 3,
    correct: 0,
    explain: 'La ligne des probabilités d’un tel tableau somme toujours à 1 : 1 − 0,45 − 0,35 = 0,2. Répondre 0,55, c’est n’avoir retiré qu’une des deux valeurs connues.',
  },
  {
    id: 'vd-d4',
    requires: ['esperance'],
    skill: 'variable',
    points: 2,
    prompt: 'X vaut 0 avec la probabilité 0,5 ; 2 avec 0,3 ; 10 avec 0,2. Que vaut E(X) ?',
    options: ['2,6', '4', '6'],
    cols: 3,
    correct: 0,
    explain: '0 × 0,5 + 2 × 0,3 + 10 × 0,2 = 0 + 0,6 + 2 = 2,6. Répondre 4, c’est faire la moyenne simple (0 + 2 + 10) ÷ 3, qui ignore les probabilités.',
  },
  {
    id: 'vd-d5',
    requires: ['arbre-structure', 'produit-chemin'],
    skill: 'arbre',
    points: 2,
    prompt: 'Sur un arbre, un chemin passe par deux branches portant 0,4 puis 0,5. Quelle est la probabilité de ce chemin ?',
    options: ['0,2', '0,9', '0,45'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie le long d’un chemin : 0,4 × 0,5 = 0,2. On additionne entre chemins, jamais à l’intérieur d’un chemin.',
  },
  {
    id: 'vd-d6',
    requires: ['somme-chemins'],
    skill: 'arbre',
    points: 2,
    prompt: 'Trois chemins d’un arbre mènent au même résultat, avec les poids 0,12 · 0,12 · 0,12. Quelle est la probabilité de ce résultat ?',
    options: ['0,36', '0,12', '0,04'],
    cols: 3,
    correct: 0,
    explain: 'Des chemins qui mènent au même résultat s’additionnent : 0,12 × 3 = 0,36. Répondre 0,12, c’est n’avoir compté qu’un seul des trois chemins.',
  },
  {
    id: 'vd-d7',
    requires: ['frequence-probabilite'],
    skill: 'freq',
    points: 2,
    prompt: 'On répète 2 000 fois une expérience dont un résultat a la probabilité 0,25. À quoi s’attend-on pour la fréquence observée de ce résultat ?',
    options: [
      'Proche de 0,25, sans valoir exactement 0,25',
      'Exactement 0,25',
      'N’importe quoi : rien ne se stabilise',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur un grand nombre de répétitions, la fréquence observée s’approche de la probabilité — sans la rejoindre exactement. C’est ce qu’on a vu en 2de.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Sept questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant d’entrer dans deux stands de fête foraine, un tour de tes outils : un nombre par
            issue, un tableau de loi, une espérance et un arbre pondéré.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
