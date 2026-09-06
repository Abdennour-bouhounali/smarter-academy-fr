import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — MISSION DE DÉPART (diagnostic, jamais bloquant).
 *
 * Teste UNIQUEMENT les prérequis déclarés en `priorKnowledge` — repérage dans
 * le plan (6e), fonctions et notation f(x) (`fonctions-3e`), fonctions affines
 * et rôles de a et b (`fonctions-affines-3e`), tableau de valeurs — et jamais
 * la matière de la leçon : ni choix des axes, ni choix d'échelle, ni placement
 * entre deux graduations, ni construction, ni détection de graphique trompeur.
 * Aucune question ne porte de métadonnée `assessment`.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Deux questions PRÉ-TESTAIENT la leçon et ont été remplacées :
 *     - « Sur un axe où un carreau vaut 10, où se trouve 25 ? » était le point
 *       P4, enseigné au module 3 : un diagnostic mesure, il ne devance pas.
 *     - « Quelle grandeur dépend de l'autre ? » était le point P1, enseigné au
 *       module 1.
 *   À leur place, deux acquis réels des leçons antérieures du chapitre : lire
 *   l'ordonnée à l'origine d'une droite, et lire le sens d'un coefficient.
 *   `requires` nomme, pour chaque question, le prérequis qu'elle diagnostique.
 */

const SKILLS = {
  repere: { label: 'Repérage dans le plan', emoji: '📍' },
  fonction: { label: 'Fonctions', emoji: '⚙️' },
  affine: { label: 'Fonctions affines', emoji: '📐' },
  tableau: { label: 'Tableaux', emoji: '📋' },
};

const QUESTIONS = [
  {
    id: 'rg-d1',
    skill: 'repere',
    points: 2,
    requires: ['coordonnees', 'abscisse', 'ordonnee', 'origine-repere'],
    prompt: 'Quelles sont les coordonnées d’un point situé 3 à droite et 2 au-dessus de l’origine ?',
    options: ['(3 ; 2)', '(2 ; 3)', '(−3 ; 2)', '(3 ; −2)'],
    cols: 2,
    correct: 0,
    explain: 'L’abscisse vient en premier (3 vers la droite), puis l’ordonnée (2 vers le haut).',
  },
  {
    id: 'rg-d2',
    skill: 'affine',
    points: 2,
    requires: ['fonction-affine', 'ordonnee-origine'],
    prompt: 'La droite de f(x) = 3x + 5 coupe l’axe vertical à quelle hauteur ?',
    options: ['5', '3', '8', '0'],
    cols: 2,
    correct: 0,
    explain: 'f(0) = 3 × 0 + 5 = 5 : c’est l’ordonnée à l’origine, la hauteur où la droite croise l’axe vertical.',
  },
  {
    id: 'rg-d3',
    skill: 'fonction',
    points: 2,
    requires: ['fonction', 'notation-fx', 'image'],
    prompt: 'Soit f(x) = 2x + 1. Que vaut f(3) ?',
    options: ['7', '6', '9', '5'],
    cols: 2,
    correct: 0,
    explain: '2 × 3 = 6, puis 6 + 1 = 7. Autrement dit : l’image de 3 par f est 7.',
  },
  {
    id: 'rg-d4',
    skill: 'tableau',
    points: 2,
    requires: ['tableau-de-valeurs'],
    prompt: 'Un tableau de valeurs donne : 1 → 4 · 2 → 8 · 3 → 12. Que vaut la valeur pour 4 ?',
    options: ['16', '15', '20', '14'],
    cols: 2,
    correct: 0,
    explain: 'Les valeurs augmentent de 4 à chaque fois : après 12 vient 16.',
  },
  {
    id: 'rg-d5',
    skill: 'affine',
    points: 2,
    requires: ['fonction-affine', 'coefficient-lineaire'],
    prompt: 'Dans f(x) = −2x + 9, que dit le signe du coefficient a = −2 ?',
    options: [
      'Quand x augmente, f(x) diminue',
      'Quand x augmente, f(x) augmente',
      'f(x) ne change pas',
      'Le signe de a ne dit rien',
    ],
    cols: 1,
    correct: 0,
    explain: 'a est négatif : chaque fois que x avance de 1, f perd 2. La droite descend.',
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
            Cinq questions rapides sur ce qui sert ici : lire un repère, calculer une image,
            reconnaître ce que disent a et b d’une fonction affine, comprendre un tableau.
            Aucune note, aucun blocage.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
