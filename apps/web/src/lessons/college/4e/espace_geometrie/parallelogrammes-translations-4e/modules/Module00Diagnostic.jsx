import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — ceux de 5e sur le
 * parallélogramme (définition, côtés opposés, diagonales, caractérisations)
 * et ceux de la leçon sœur `transformations-4e` sur le glissement (ce qu'il
 * fait, ce qu'il conserve) — et RIEN de la matière de cette leçon-ci : ni le
 * lien entre les deux, ni la construction du quatrième sommet par report du
 * trajet, ni la rédaction d'une justification.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  para: { label: 'Le parallélogramme', emoji: '🔷' },
  glisse: { label: 'Le glissement', emoji: '➡️' },
  vocab: { label: 'Vocabulaire de figure', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'pt4-d1-def',
    skill: 'para',
    points: 2,
    requires: ['parallelogramme', 'caracterisations', 'droites-paralleles', 'losange', 'angle-droit'],
    prompt: 'Qu’est-ce qui définit un parallélogramme ?',
    options: [
      'Ses côtés opposés sont parallèles deux à deux',
      'Ses quatre côtés ont la même longueur',
      'Ses quatre angles sont droits',
      'Ses diagonales ont la même longueur',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la définition vue en 5e : deux paires de côtés opposés parallèles. Les autres propositions décrivent le losange, le rectangle et le rectangle.',
  },
  {
    id: 'pt4-d2-cotes',
    skill: 'para',
    points: 2,
    requires: ['cotes-opposes-egaux'],
    prompt: 'Dans un parallélogramme, que peut-on dire des côtés opposés ?',
    options: ['Ils ont la même longueur', 'Ils sont perpendiculaires', 'Ils sont de longueurs différentes'],
    cols: 1,
    correct: 0,
    explain: 'Les côtés opposés d’un parallélogramme sont parallèles ET de même longueur : c’est une propriété de 5e.',
  },
  {
    id: 'pt4-d3-diag',
    skill: 'para',
    points: 2,
    requires: ['diagonales-milieu', 'droites-perpendiculaires'],
    prompt: 'Dans un parallélogramme, les diagonales…',
    options: [
      'se coupent en leur milieu',
      'ont la même longueur',
      'sont perpendiculaires',
      'ne se coupent jamais',
    ],
    cols: 2,
    correct: 0,
    explain: 'Elles se coupent en leur milieu — mais attention, elles n’ont pas la même longueur (ça, c’est le rectangle).',
  },
  {
    id: 'pt4-d4-glissement',
    skill: 'glisse',
    points: 2,
    requires: ['translation'],
    prompt: 'Une figure glisse sans tourner. Comment sont les traits qui relient chaque point à sa copie ?',
    options: [
      'Parallèles et de même longueur',
      'Ils se coupent tous en un même point',
      'De longueurs différentes',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la marque du glissement : tous les points font le même trajet, donc les traits sont parallèles et de même longueur. S’ils se croisaient tous, ce serait un demi-tour.',
  },
  {
    id: 'pt4-d5-invariants',
    skill: 'glisse',
    points: 2,
    requires: ['invariants-translation', 'aire'],
    prompt: 'Quand une figure glisse, qu’est-ce qui change ?',
    options: [
      'Seulement sa position',
      'Sa taille et sa position',
      'Sa forme et sa position',
      'Rien du tout',
    ],
    cols: 2,
    correct: 0,
    explain: 'Un glissement conserve les longueurs, les angles et l’aire : seule la position change.',
  },
  {
    id: 'pt4-d6-vocab',
    skill: 'vocab',
    points: 2,
    requires: ['diagonale', 'quadrilatere', 'sommet-solide'],
    prompt: 'Dans le quadrilatère ABCD, quelles sont les deux diagonales ?',
    options: ['[AC] et [BD]', '[AB] et [CD]', '[AD] et [BC]'],
    cols: 1,
    correct: 0,
    explain: 'Une diagonale joint deux sommets NON voisins. Dans ABCD, A et C ne sont pas voisins, B et D non plus : les diagonales sont donc [AC] et [BD]. Les autres propositions donnent des côtés.',
  },
  {
    id: 'pt4-d7-image',
    skill: 'glisse',
    points: 2,
    requires: ['image', 'translation-parallelogramme', 'axe-symetrie'],
    prompt: 'Un glissement mène M en M’ et N en N’. On dit que M’ est…',
    options: [
      'l’image de M par ce glissement',
      'le symétrique de M par rapport à un axe',
      'le milieu du segment [M N]',
      'un point sans nom particulier',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le point d’arrivée s’appelle l’IMAGE du point de départ. Ce n’est pas un symétrique : rien n’est retourné, la figure a seulement glissé.',
  },
  {
    id: 'pt4-d8-construire',
    skill: 'para',
    points: 2,
    requires: ['construire-parallelogramme'],
    prompt: 'En 5e, pour placer le quatrième sommet d’un parallélogramme, on utilisait…',
    options: [
      // Les distracteurs restent DANS le vocabulaire déjà acquis : « hauteur
      // issue de » et « rapporteur » ont été retirés, le premier parce que
      // « issue » collide avec le sens probabiliste du lexique, le second
      // parce qu'un instrument non réintroduit crée une exposition inutile.
      'le milieu commun des deux diagonales',
      'le point le plus éloigné des trois autres',
      'le milieu d’un des côtés déjà tracés',
      'l’intersection des deux côtés déjà tracés',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les diagonales d’un parallélogramme se coupent en leur milieu : le quatrième sommet est donc le symétrique du sommet opposé par rapport à ce milieu. Cette leçon va en montrer une autre construction.',
  },
  {
    id: 'pt4-d9-milieu',
    skill: 'vocab',
    points: 2,
    requires: ['milieu-segment', 'notation-segment'],
    prompt: 'M est le milieu du segment [AB]. Que peut-on affirmer ?',
    options: [
      'M est sur [AB] et MA = MB',
      'M est sur [AB] mais MA peut différer de MB',
      'MA = MB, mais M n’est pas forcément sur [AB]',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le milieu appartient au segment ET est à égale distance des deux extrémités. Les deux conditions sont nécessaires.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Le parallélogramme de 5e, et le glissement"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Neuf questions rapides. Rien n’est noté, rien ne bloque : elles servent à savoir
            par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
