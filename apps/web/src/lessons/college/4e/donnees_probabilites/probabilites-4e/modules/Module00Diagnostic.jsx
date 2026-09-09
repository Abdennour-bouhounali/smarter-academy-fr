import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis de 5e listés dans `priorKnowledge` — expérience
 * aléatoire, issue, événement, équiprobabilité, fréquence observée,
 * probabilité, échelle de 0 à 1 — et RIEN de la matière de la leçon : ni
 * contraire, ni intersection, ni réunion, ni fluctuation.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  vocabulaire: { label: 'Résultats possibles', emoji: '🎯' },
  calcul: { label: 'Calculer une probabilité', emoji: '🧮' },
  echelle: { label: 'Lire une chance', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'pb4-d1-issue',
    skill: 'vocabulaire',
    points: 2,
    requires: ['experience-aleatoire', 'issue'],
    prompt: 'On lance un dé ordinaire. Combien y a-t-il de résultats possibles ?',
    options: ['6', '2', '12'],
    cols: 3,
    correct: 0,
    explain: 'Le dé peut tomber sur 1, 2, 3, 4, 5 ou 6 : six résultats possibles.',
  },
  {
    id: 'pb4-d2-evenement',
    skill: 'vocabulaire',
    points: 2,
    requires: ['evenement', 'issue'],
    prompt: 'Avec ce même dé, « obtenir un nombre pair » regroupe combien de résultats ?',
    options: ['3', '2', '6'],
    cols: 3,
    correct: 0,
    explain: 'Les résultats pairs sont 2, 4 et 6 : cela en regroupe trois.',
  },
  {
    id: 'pb4-d3-equiprobable',
    skill: 'calcul',
    points: 2,
    requires: ['equiprobabilite'],
    prompt: 'Un sac contient 3 billes rouges et 2 bleues. Les COULEURS ont-elles la même chance de sortir ?',
    options: [
      'Non : il y a plus de rouges que de bleues',
      'Oui : il n’y a que deux couleurs',
      'Oui : chaque bille a la même chance',
    ],
    cols: 1,
    correct: 0,
    explain: 'Chaque BILLE a la même chance, mais pas chaque couleur : le rouge occupe 3 billes sur 5, le bleu seulement 2.',
  },
  {
    id: 'pb4-d4-probabilite',
    skill: 'calcul',
    points: 2,
    requires: ['probabilite'],
    prompt: 'Dans un sac de 10 billes dont 4 vertes, quelle est la probabilité de tirer une verte ?',
    options: ['4/10', '10/4', '4'],
    cols: 3,
    correct: 0,
    explain: 'On compte les cas favorables sur le nombre total : 4 vertes sur 10 billes, soit 4/10 (ou 2/5).',
  },
  {
    id: 'pb4-d5-echelle',
    skill: 'echelle',
    points: 2,
    requires: ['echelle-probabilite'],
    prompt: 'Une probabilité peut-elle valoir 1,5 ?',
    options: [
      'Non : elle est toujours comprise entre 0 et 1',
      'Oui, si le résultat est très probable',
      'Oui, s’il y a plus de 1 chance sur 1',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une probabilité se situe toujours entre 0 (impossible) et 1 (certain) : elle ne peut pas dépasser 1.',
  },
  {
    id: 'pb4-d6-frequence',
    skill: 'echelle',
    points: 2,
    requires: ['frequence-observee'],
    prompt: 'On lance une pièce 100 fois et on obtient 47 fois « pile ». Quelle part des lancers cela représente-t-il ?',
    options: ['47 %', '50 %', '47 lancers'],
    cols: 3,
    correct: 0,
    explain: 'On divise le nombre obtenu par le nombre de lancers : 47 ÷ 100 = 47 %.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Les acquis de 5e sur le hasard, vérifiés en cinq minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà du hasard',
        tone: 'slate',
        body: (
          <>
            Six questions rapides sur les probabilités de 5e. Rien n’est noté, rien ne bloque :
            elles servent à savoir par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
