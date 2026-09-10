import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Prérequis officiels (clé 'seconde_colinearite_et_alignement') : « Vecteurs »,
 * « Coordonnées » — la leçon précédente. On teste donc les coordonnées de AB,
 * k·u, l'opposé, l'égalité et la lecture d'un couple — jamais la colinéarité
 * ni le déterminant, qui sont le contenu de la leçon.
 */
const SKILLS = {
  coords: { label: 'Coordonnées de AB', emoji: '🔢' },
  produit: { label: 'k · u', emoji: '✖️' },
  egalite: { label: 'Vecteurs égaux', emoji: '🟰' },
};

const QUESTIONS = [
  {
    id: 'col-d1-ab',
    skill: 'coords',
    points: 2,
    requires: ['abscisse', 'ordonnee', 'vecteur', 'composante'],
    prompt: 'A (−1 ; 2) et B (3 ; 1). Quelles sont les coordonnées du vecteur AB ?',
    options: ['(4 ; −1)', '(−4 ; 1)', '(2 ; 3)'],
    cols: 3,
    correct: 0,
    explain: 'Arrivée moins départ : 3 − (−1) = 4 et 1 − 2 = −1. (−4 ; 1) est BA.',
  },
  {
    id: 'col-d2-lire',
    skill: 'coords',
    points: 2,
    requires: ['abscisse', 'ordonnee', 'coordonnees'],
    prompt: 'Une flèche part de (0 ; 0) et arrive 2 cases à gauche et 3 cases plus haut. Coordonnées du vecteur ?',
    options: ['(−2 ; 3)', '(3 ; −2)', '(2 ; −3)'],
    cols: 3,
    correct: 0,
    explain: 'Vers la gauche : abscisse négative (−2). Vers le haut : ordonnée positive (3).',
  },
  {
    id: 'col-d3-ku',
    skill: 'produit',
    points: 2,
    requires: ['vecteur', 'composante'],
    prompt: 'u (2 ; −3). Coordonnées de 3·u ?',
    options: ['(6 ; −9)', '(6 ; −3)', '(5 ; 0)'],
    cols: 3,
    correct: 0,
    explain: 'On multiplie LES DEUX coordonnées par 3 : (3 × 2 ; 3 × (−3)) = (6 ; −9).',
  },
  {
    // « Les vecteurs » (module 5) a déjà énoncé v = k·u : cette leçon le REPREND
    // pour en tirer la lecture par les coordonnées, le déterminant et
    // l'alignement. On vérifie donc le mot AVANT de le réutiliser — le
    // référentiel 2026 place cet item dans les deux objets officiels.
    id: 'col-d6-colineaire',
    skill: 'produit',
    points: 2,
    requires: ['vecteur', 'composante', 'colineaire'],
    prompt: 'Dans « Les vecteurs », tu as vu que v = k·u signifie que v est un multiple de u. Comment appelle-t-on alors ces deux vecteurs ?',
    options: ['Colinéaires', 'Égaux', 'Opposés'],
    cols: 3,
    correct: 0,
    explain: 'v = k·u : v est un multiple de u, les deux flèches gardent la même direction. On dit qu’ils sont COLINÉAIRES. Ils ne sont égaux que si k = 1, et opposés que si k = −1.',
  },
  {
    id: 'col-d4-oppose',
    skill: 'produit',
    points: 2,
    requires: ['vecteur', 'composante'],
    prompt: 'Le vecteur opposé de u (4 ; −1) est…',
    options: ['(−4 ; 1)', '(−1 ; 4)', '(4 ; 1)'],
    cols: 3,
    correct: 0,
    explain: '−u a les deux coordonnées changées de signe : (−4 ; 1). Même direction, même longueur, sens contraire.',
  },
  {
    id: 'col-d5-egaux',
    skill: 'egalite',
    points: 2,
    requires: ['vecteur', 'composante'],
    prompt: 'Une flèche va de (1 ; 1) à (4 ; 3). Une autre va de (−2 ; 0) à (1 ; 2). Représentent-elles le même vecteur ?',
    options: ['Oui : les deux valent (3 ; 2)', 'Non : elles ne partent pas du même point', 'Non : elles n’arrivent pas au même point'],
    cols: 1,
    correct: 0,
    explain: '4 − 1 = 3 et 3 − 1 = 2 ; 1 − (−2) = 3 et 2 − 0 = 2. Mêmes coordonnées : même vecteur, où qu’il soit dessiné.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions sur les vecteurs, pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon se sert des vecteurs de la leçon précédente : coordonnées de AB, produit par un
            réel, opposé, égalité. Un tour rapide avant de partir. <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
