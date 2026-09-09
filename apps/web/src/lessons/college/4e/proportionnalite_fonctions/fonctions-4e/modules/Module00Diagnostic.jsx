import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis de 5e listés dans `priorKnowledge` — la dépendance,
 * « une même entrée redonne la même sortie », « en fonction de », le tableau
 * de valeurs, le programme de calcul EXÉCUTÉ, le couple-point, la lecture
 * d'un graphique et le calcul numérique — et RIEN de la matière de la leçon :
 * ni remontée d'un programme, ni formule, ni modélisation.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  dependance: { label: 'Dépendance entre grandeurs', emoji: '🔗' },
  programme: { label: 'Programme de calcul', emoji: '⚙️' },
  lecture: { label: 'Tableau et graphique', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'f4-d1-dependance',
    skill: 'dependance',
    points: 2,
    requires: ['dependance', 'en-fonction-de'],
    prompt: 'Le prix payé à la pompe dépend du nombre de litres versés. Quelle grandeur COMMANDE l’autre ?',
    options: ['Le nombre de litres', 'Le prix payé', 'Aucune des deux'],
    cols: 3,
    correct: 0,
    explain: 'C’est le nombre de litres qu’on choisit, et le prix qui suit. Le prix dépend donc du nombre de litres, et pas l’inverse.',
  },
  {
    id: 'f4-d2-meme-entree',
    skill: 'dependance',
    points: 2,
    requires: ['meme-entree-meme-sortie'],
    prompt: 'Un programme de calcul rend 14 quand on lui donne 5. Que rend-il si on lui redonne 5 ?',
    options: ['14', 'Un nombre différent à chaque fois', 'On ne peut pas savoir'],
    cols: 3,
    correct: 0,
    explain: 'Une même entrée redonne toujours la même sortie : c’est ce qui fait qu’un programme est une règle, et non un tirage au sort.',
  },
  {
    id: 'f4-d3-executer',
    skill: 'programme',
    points: 2,
    requires: ['programme-de-calcul', 'calcul-numerique'],
    prompt: 'Programme : « multiplier par 4, puis ajouter 3 ». Que rend-il pour 5 ?',
    options: ['23', '32', '20'],
    cols: 3,
    correct: 0,
    explain: '5 × 4 = 20, puis 20 + 3 = 23. (32 viendrait de faire l’addition d’abord : 5 + 3 = 8, puis 8 × 4.)',
  },
  {
    id: 'f4-d4-ordre',
    skill: 'programme',
    points: 2,
    requires: ['programme-de-calcul'],
    prompt: '« Ajouter 3 puis multiplier par 4 » donne-t-il la même chose que « multiplier par 4 puis ajouter 3 » ?',
    options: [
      'Non : l’ordre des étapes change le résultat',
      'Oui : ce sont les mêmes nombres',
      'Oui, sauf si l’entrée est négative',
    ],
    cols: 1,
    correct: 0,
    explain: 'Pour 5, le premier donne 32 et le second 23. L’ordre des étapes fait partie du programme.',
  },
  {
    id: 'f4-d5-tableau',
    skill: 'lecture',
    points: 2,
    requires: ['tableau-de-valeurs'],
    prompt: 'Dans un tableau de valeurs, la ligne du haut porte 1, 2, 3 et celle du bas 5, 7, 9. Que lit-on pour l’entrée 2 ?',
    options: ['7', '2', '9'],
    cols: 3,
    correct: 0,
    explain: 'On lit la colonne de l’entrée 2 : sa sortie est 7. Un tableau se lit en colonnes, pas en lignes séparées.',
  },
  {
    id: 'f4-d6-couple',
    skill: 'lecture',
    points: 2,
    requires: ['couple-point', 'lire-graphique'],
    prompt: 'Une entrée de 3 donne une sortie de 8. Quel point place-t-on dans le repère ?',
    options: ['(3 ; 8)', '(8 ; 3)', '(3 ; 3)'],
    cols: 3,
    correct: 0,
    explain: 'L’entrée se lit horizontalement, la sortie verticalement : le point est (3 ; 8), dans cet ordre.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Les acquis de 5e sur les fonctions, vérifiés en quelques minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Six questions rapides sur les programmes de calcul et les tableaux de 5e. Rien n’est
            noté, rien ne bloque : elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
