import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucun parallélogramme, aucune propriété
 * des côtés opposés, aucune diagonale de parallélogramme. Tout ici vient de
 * la 6e — quadrilatères, parallélisme, diagonale, milieu, notation, angle
 * droit, losange.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test
 * final »).
 */
const SKILLS = {
  quadri: { label: 'Quadrilatères', emoji: '🔷' },
  paralleles: { label: 'Parallèles et perpendiculaires', emoji: '📐' },
  segments: { label: 'Segments et milieux', emoji: '📏' },
  mesures: { label: 'Périmètre et aire', emoji: '📐' },
};

const QUESTIONS = [
  {
    id: 'par5-d1-quadri',
    skill: 'quadri',
    points: 2,
    requires: ['quadrilatere'],
    prompt: 'Combien de côtés a un quadrilatère ?',
    options: ['4', '3', '5'],
    cols: 3,
    correct: 0,
    explain: 'Quadri- veut dire quatre : un quadrilatère a quatre côtés, et donc aussi quatre sommets et quatre angles.',
  },
  {
    id: 'par5-d2-quadri',
    skill: 'quadri',
    points: 2,
    requires: ['quadrilatere', 'diagonale'],
    prompt: 'Dans le quadrilatère ABCD, laquelle de ces lignes est une diagonale ?',
    options: ['[AC]', '[AB]', '[BC]'],
    cols: 3,
    correct: 0,
    explain: 'Une diagonale joint deux sommets qui ne sont PAS voisins. [AB] et [BC] sont des côtés ; [AC] et [BD] sont les deux diagonales.',
  },
  {
    id: 'par5-d3-quadri',
    skill: 'quadri',
    points: 2,
    requires: ['losange'],
    prompt: 'Un losange, c’est un quadrilatère dont…',
    options: ['les quatre côtés ont la même longueur', 'les quatre angles sont droits', 'les diagonales sont égales'],
    cols: 1,
    correct: 0,
    explain: 'Le losange se reconnaît à ses quatre côtés de même longueur. Les quatre angles droits, c’est le rectangle.',
  },
  {
    id: 'par5-d4-paralleles',
    skill: 'paralleles',
    points: 2,
    requires: ['droites-paralleles'],
    prompt: 'Deux droites parallèles, ce sont deux droites qui…',
    options: ['ne se croisent jamais', 'se croisent à angle droit', 'se croisent en un seul point'],
    cols: 1,
    correct: 0,
    explain: 'Deux droites parallèles gardent partout le même écart : elles ne se rencontrent jamais, aussi loin qu’on les prolonge.',
  },
  {
    id: 'par5-d5-paralleles',
    skill: 'paralleles',
    points: 2,
    requires: ['angle-droit'],
    prompt: 'Un angle droit mesure…',
    options: ['90°', '180°', '45°'],
    cols: 3,
    correct: 0,
    explain: 'L’angle droit mesure 90°. C’est celui qu’on marque par un petit carré, et celui de l’équerre.',
  },
  {
    id: 'par5-d6-segments',
    skill: 'segments',
    points: 2,
    requires: ['milieu-segment'],
    prompt: 'Le point O est le milieu du segment [AC]. Que peut-on dire des longueurs OA et OC ?',
    options: ['OA = OC', 'OA est le double de OC', 'On ne peut pas savoir'],
    cols: 3,
    correct: 0,
    explain: 'Le milieu partage le segment en deux morceaux de même longueur : OA = OC.',
  },
  {
    id: 'par5-d8-perpendiculaires',
    skill: 'paralleles',
    points: 2,
    requires: ['droites-perpendiculaires'],
    prompt: 'Deux droites perpendiculaires, ce sont deux droites qui…',
    options: ['se croisent en formant un angle droit', 'ne se croisent jamais', 'ont la même longueur'],
    cols: 1,
    correct: 0,
    explain: 'Perpendiculaires signifie exactement : elles se coupent en formant un angle de 90°. Deux droites qui ne se croisent jamais sont parallèles.',
  },
  {
    id: 'par5-d9-sommets',
    skill: 'quadri',
    points: 2,
    requires: ['sommet-solide'],
    prompt: 'Combien de sommets a un quadrilatère ?',
    options: ['4', '3', '8'],
    cols: 3,
    correct: 0,
    explain: 'Un sommet est un « coin » de la figure, là où deux côtés se rejoignent. Quatre côtés donnent quatre sommets.',
  },
  {
    id: 'par5-d10-perimetre',
    skill: 'mesures',
    points: 2,
    requires: ['perimetre'],
    prompt: 'Le périmètre d’une figure, c’est…',
    options: [
      'la longueur totale de son contour',
      'la place qu’elle occupe à l’intérieur',
      'la longueur de sa plus grande diagonale',
    ],
    cols: 1,
    correct: 0,
    // Le module 0 MESURE des prérequis et ne touche jamais à la matière de la
    // leçon : cette correction parle donc du périmètre seul. Le mot « aire »
    // appartient au module 7, qui le fera découvrir par le glissement.
    explain: 'Le périmètre fait le tour de la figure : on additionne les longueurs de tous ses côtés.',
  },
  {
    id: 'par5-d7-segments',
    skill: 'segments',
    points: 2,
    requires: ['notation-segment'],
    prompt: 'Que désigne l’écriture [AB] ?',
    options: ['Le segment d’extrémités A et B', 'La droite qui passe par A et B', 'La longueur de A à B'],
    cols: 1,
    correct: 0,
    explain: '[AB] est le SEGMENT ; (AB) serait la droite qui le prolonge des deux côtés, et AB tout court la longueur.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      skills={SKILLS}
      questions={QUESTIONS}
      moduleTitle="Mission de départ"
      moduleSubtitle="Ce dont on va se servir"
      estimatedTime="5 min"
      brief={{
        tag: 'Diagnostic',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <p>
            Dix questions rapides sur ce que tu sais déjà : les quadrilatères, les droites
            parallèles et perpendiculaires, les milieux, le périmètre. Rien n’est noté, rien ne bloque — c’est juste pour savoir sur
            quoi la leçon va pouvoir s’appuyer.
          </p>
        ),
      }}
    />
  );
}
