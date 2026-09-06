import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés — fonctions, repérage dans le plan,
 * représentation graphique — et jamais la matière de la leçon : ni lecture
 * d'une image SUR UNE COURBE, ni recherche de tous les antécédents, ni
 * variations, ni intersections. Aucune question ne porte de métadonnée
 * `assessment` : un diagnostic n'est pas une évaluation et ne produit aucune
 * preuve d'apprentissage.
 *
 * `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 * Ces ids sont exactement ceux du `priorKnowledge` de la leçon
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * CORRIGÉ. La cinquième question demandait autrefois ce que raconte « une
 * courbe qui monte » : c'est le point P6 de CETTE leçon, donc de la matière à
 * enseigner, pas un prérequis à mesurer. Elle porte désormais sur ce que les
 * deux axes d'un graphique représentent — l'acquis de
 * `representation-graphique-3e` dont la leçon a réellement besoin.
 */

const SKILLS = {
  fonction: { label: 'Fonctions', emoji: '⚙️' },
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
  graphique: { label: 'Représentation graphique', emoji: '📊' },
};

const QUESTIONS = [
  {
    id: 'lg-d1',
    skill: 'fonction',
    points: 2,
    requires: ['fonction', 'notation-fx', 'image'],
    prompt: 'Soit f(x) = 2x + 1. Que vaut f(4) ?',
    options: ['9', '8', '6', '10'],
    cols: 2,
    correct: 0,
    explain: '2 × 4 = 8, puis 8 + 1 = 9.',
  },
  {
    id: 'lg-d2',
    skill: 'fonction',
    points: 2,
    requires: ['notation-fx', 'image', 'antecedent'],
    prompt: 'On sait que f(2) = 7. Quel nombre est l’image de l’autre ?',
    options: ['7 est l’image de 2', '2 est l’image de 7', 'Les deux sont des images'],
    cols: 1,
    correct: 0,
    explain: 'Le nombre entre parenthèses est ce qu’on entre : son image est le résultat, 7.',
  },
  {
    id: 'lg-d3',
    skill: 'repere',
    points: 2,
    requires: ['coordonnees', 'abscisse', 'ordonnee'],
    prompt: 'Que lit-on en premier dans le couple (5 ; 3) ?',
    options: ["L'abscisse, sur l'axe horizontal", "L'ordonnée, sur l'axe vertical", 'Peu importe l’ordre'],
    cols: 1,
    correct: 0,
    explain: 'L’abscisse vient toujours en premier : elle se lit sur l’axe horizontal.',
  },
  {
    id: 'lg-d4',
    skill: 'graphique',
    points: 2,
    requires: ['echelle-axe'],
    prompt: 'Sur un axe où un carreau vaut 50, à quelle valeur correspondent 3 carreaux ?',
    options: ['150', '3', '53', '50'],
    cols: 2,
    correct: 0,
    explain: '3 × 50 = 150. Compter les carreaux ne suffit pas : il faut les multiplier par ce que vaut un carreau.',
  },
  {
    id: 'lg-d5',
    skill: 'graphique',
    points: 2,
    requires: ['representation-graphique', 'abscisse', 'ordonnee'],
    prompt: 'On représente l’altitude d’un ballon en fonction du temps. Que porte l’axe vertical ?',
    options: ['L’altitude', 'Le temps', 'La vitesse du ballon'],
    cols: 1,
    correct: 0,
    explain: 'Dans « altitude en fonction du temps », le temps est ce qu’on choisit — il va sur l’axe horizontal — et l’altitude est ce qu’on lit, sur l’axe vertical.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cinq questions rapides sur ce qui sert ici : calculer une image, lire un couple
            de coordonnées, comprendre une échelle et savoir ce que porte chaque axe. Aucune
            note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
