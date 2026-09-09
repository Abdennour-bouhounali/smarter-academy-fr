import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les huit acquis de 5e listés dans `priorKnowledge` — la série,
 * l'effectif, le tableau d'effectifs, la fréquence, la moyenne simple, les
 * deux diagrammes et l'interprétation — et RIEN de la matière de la leçon : ni
 * moyenne pondérée, ni médiane, ni étendue, ni comparaison de deux séries.
 *
 * Chaque `priorKnowledge` est diagnostiqué par AU MOINS une question : c'est
 * la condition de `W_PRIOR_NOT_DIAGNOSED` dans l'audit, et surtout la seule
 * façon honnête de déclarer qu'on suppose ces notions acquises.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  lire: { label: 'Lire une série', emoji: '📋' },
  compter: { label: 'Effectifs et fréquences', emoji: '🔢' },
  resumer: { label: 'Moyenne et lecture', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'st4-d1-serie',
    skill: 'lire',
    points: 2,
    requires: ['serie-donnees'],
    prompt: 'On relève la pointure de chaque élève d’une classe. Comment appelle-t-on l’ensemble de ces relevés ?',
    options: ['Une série de données', 'Une liste de calculs', 'Une échelle'],
    cols: 1,
    correct: 0,
    explain: 'Une série de données, c’est l’ensemble des valeurs relevées sur une même question posée à un groupe.',
  },
  {
    id: 'st4-d2-effectif',
    skill: 'compter',
    points: 2,
    requires: ['effectif'],
    prompt: 'Dans une classe, 7 élèves ont un chien. Que représente le nombre 7 ?',
    options: ['L’effectif de la valeur « chien »', 'La fréquence des chiens', 'La moyenne des animaux'],
    cols: 1,
    correct: 0,
    explain: 'L’effectif d’une valeur, c’est le nombre d’individus qui la portent : ici 7 élèves.',
  },
  {
    id: 'st4-d3-tableau',
    skill: 'compter',
    points: 2,
    requires: ['tableau-effectifs'],
    prompt: 'Un tableau d’effectifs donne : 0 frère → 5 élèves, 1 frère → 12 élèves, 2 frères → 8 élèves. Combien d’élèves ont répondu en tout ?',
    options: ['25', '3', '8'],
    cols: 3,
    correct: 0,
    explain: 'On additionne les effectifs : 5 + 12 + 8 = 25 élèves. Le nombre de LIGNES du tableau (3) n’est pas l’effectif total.',
  },
  {
    id: 'st4-d4-frequence',
    skill: 'compter',
    points: 2,
    requires: ['frequence'],
    prompt: 'Sur 20 élèves, 5 viennent à vélo. Quelle est la fréquence de « vélo » ?',
    options: ['0,25 soit 25 %', '5 %', '4 soit 400 %'],
    cols: 1,
    correct: 0,
    explain: 'La fréquence s’obtient en divisant l’effectif par l’effectif total : 5 ÷ 20 = 0,25, soit 25 %.',
  },
  {
    id: 'st4-d5-moyenne',
    skill: 'resumer',
    points: 2,
    requires: ['moyenne'],
    prompt: 'Cinq notes : 8, 12, 12, 14, 14. Quelle est leur moyenne ?',
    options: ['12', '12,5', '60'],
    cols: 3,
    correct: 0,
    explain: '8 + 12 + 12 + 14 + 14 = 60, puis 60 ÷ 5 = 12. On divise la somme par le nombre de valeurs.',
  },
  {
    id: 'st4-d6-barres',
    skill: 'lire',
    points: 2,
    requires: ['diagramme-barres'],
    prompt: 'Sur un diagramme en barres, que représente la hauteur d’une barre ?',
    options: [
      'L’effectif de la valeur qu’elle désigne',
      'Le nombre de valeurs différentes',
      'La moyenne de la série',
    ],
    cols: 1,
    correct: 0,
    explain: 'Chaque barre porte une valeur, et sa hauteur en donne l’effectif — c’est ce qui permet de comparer les valeurs d’un coup d’œil.',
  },
  {
    id: 'st4-d7-circulaire',
    skill: 'lire',
    points: 2,
    requires: ['diagramme-circulaire'],
    prompt: 'Sur un diagramme circulaire, une part occupe un quart du disque. Que peut-on en dire ?',
    options: [
      'Elle représente 25 % de l’effectif total',
      'Elle représente 25 individus',
      'Elle représente la valeur 25',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le disque entier représente 100 % de l’effectif. Un quart de disque, c’est donc 25 % — une PART, jamais un nombre d’individus.',
  },
  {
    id: 'st4-d8-interpreter',
    skill: 'resumer',
    points: 2,
    requires: ['interpreter'],
    prompt: 'Dans un collège, la note moyenne au dernier contrôle est de 11. Que peut-on affirmer à coup sûr ?',
    options: [
      'Rien sur un élève en particulier : c’est un résumé du groupe',
      'Que la plupart des élèves ont eu 11',
      'Que personne n’a eu plus de 11',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un résumé porte sur le GROUPE. Il ne dit rien de la note d’un élève donné, et surtout pas que « la plupart » l’ont obtenue.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Huit acquis de 5e, vérifiés en quatre minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Huit questions rapides sur les statistiques de 5e. Rien n’est noté, rien ne bloque :
            elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
