import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — tous établis par
 * `reperage-5e` : le repère et ses axes, le couple ordonné, la lecture et le
 * placement d'un point, les quadrants, les points sur un axe, et l'idée qu'une
 * graduation ne vaut pas toujours 1.
 *
 * Il ne teste RIEN de la matière de la leçon : ni le choix d'une graduation,
 * ni la coordonnée décimale, ni les coordonnées comme moyen de preuve.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  repere: { label: 'Le repère', emoji: '🧭' },
  lire: { label: 'Lire un point', emoji: '👁️' },
  placer: { label: 'Placer un point', emoji: '📌' },
};

const QUESTIONS = [
  {
    id: 'rp4-d1-axes',
    skill: 'repere',
    points: 2,
    requires: ['repere', 'axes-origine'],
    prompt: 'Dans un repère du plan, comment appelle-t-on le point où les deux axes se croisent ?',
    options: ['L’origine', 'Le sommet', 'Le centre du quadrant'],
    cols: 3,
    correct: 0,
    explain: 'Les deux axes se croisent à l’origine, le point de coordonnées (0 ; 0).',
  },
  {
    id: 'rp4-d2-ordre',
    skill: 'lire',
    points: 2,
    requires: ['coordonnees', 'ordre-du-couple'],
    prompt: 'Dans le couple (3 ; −2), que désigne le nombre −2 ?',
    options: ['L’ordonnée', 'L’abscisse', 'La distance à l’origine'],
    cols: 3,
    correct: 0,
    explain: 'On écrit toujours l’abscisse d’abord, puis l’ordonnée : ici l’abscisse est 3 et l’ordonnée −2.',
  },
  {
    id: 'rp4-d3-lire',
    skill: 'lire',
    points: 2,
    requires: ['lire-un-point', 'quadrant'],
    prompt: 'Un point a une abscisse négative et une ordonnée positive. Où se trouve-t-il ?',
    options: ['En haut à gauche', 'En haut à droite', 'En bas à gauche'],
    cols: 3,
    correct: 0,
    explain: 'Abscisse négative : à gauche de l’axe vertical. Ordonnée positive : au-dessus de l’axe horizontal. Donc en haut à gauche.',
  },
  {
    id: 'rp4-d4-axe',
    skill: 'lire',
    points: 2,
    requires: ['sur-un-axe'],
    prompt: 'Un point est posé sur l’axe horizontal. Que vaut son ordonnée ?',
    options: ['0', '1', 'On ne peut pas savoir'],
    cols: 3,
    correct: 0,
    explain: 'Sur l’axe horizontal, le point n’est ni au-dessus ni en dessous : son ordonnée vaut 0.',
  },
  {
    id: 'rp4-d5-placer',
    skill: 'placer',
    points: 2,
    requires: ['placer-un-point'],
    prompt: 'Pour placer le point (−4 ; 1), par quoi commence-t-on ?',
    options: [
      'On se déplace de 4 vers la gauche, puis de 1 vers le haut',
      'On se déplace de 4 vers le haut, puis de 1 vers la droite',
      'On se déplace de 1 vers la gauche, puis de 4 vers le haut',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le premier nombre est l’abscisse : elle se lit sur l’axe horizontal. −4 envoie vers la gauche, puis 1 fait monter.',
  },
  {
    id: 'rp4-d6-echelle',
    skill: 'repere',
    points: 2,
    requires: ['echelle-graduation'],
    prompt: 'Sur un axe, il y a 4 graduations entre 0 et 2. Combien vaut une graduation ?',
    options: ['0,5', '2', '4'],
    cols: 3,
    correct: 0,
    explain: 'On divise l’écart des nombres par le nombre de graduations : 2 ÷ 4 = 0,5. Une graduation ne vaut donc pas toujours 1.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Le repère, le couple, lire et placer"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Six questions rapides sur le repérage vu en 5e : les deux axes et leur point de
            croisement, <strong>l’origine</strong> ; le couple de coordonnées, dont le premier
            nombre est <strong>l’abscisse</strong> et le second l’ordonnée ; et ce que vaut une
            graduation. Rien n’est noté, rien ne bloque : ces questions servent à savoir par où
            commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
