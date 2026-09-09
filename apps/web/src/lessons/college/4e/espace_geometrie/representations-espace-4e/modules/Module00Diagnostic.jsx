import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — la perspective
 * cavalière et son pointillé, les vues, le patron, le vocabulaire du solide
 * (face, arête, sommet), le pavé droit, l'aire, la perpendicularité, l'angle
 * droit, le triangle rectangle, le milieu d'un segment, l'arrondi — et RIEN
 * de la matière de la leçon : ni pyramide, ni cône, ni tiers.
 *
 * Chaque id de `priorKnowledge` est cité par au moins une question : c'est
 * cette couverture que l'audit de connaissances vérifie, et c'est elle qui
 * autorise les modules à employer ces mots sans les redéfinir.
 *
 * Aucune question ne bloque et aucune ne produit de preuve.
 */
const SKILLS = {
  representer: { label: 'Représenter un solide', emoji: '📦' },
  patron: { label: 'Patrons et vocabulaire', emoji: '📄' },
  mesurer: { label: 'Aires et mesures', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 're4-d1-perspective',
    skill: 'representer',
    points: 2,
    requires: ['perspective-cavaliere', 'arete-cachee'],
    prompt: 'Sur un dessin en perspective cavalière, comment représente-t-on une arête cachée ?',
    options: ['En pointillé', 'En trait épais', 'On ne la dessine pas'],
    cols: 3,
    correct: 0,
    explain:
      'Les arêtes qu’on ne verrait pas se dessinent en pointillé : le dessin montre tout le solide, sans mentir sur ce qui est devant.',
  },
  {
    id: 're4-d2-vues',
    skill: 'representer',
    points: 2,
    requires: ['trois-vues', 'pave-droit'],
    prompt: 'Pour décrire un pavé droit sans ambiguïté, on dessine en général…',
    options: [
      'La vue de face, la vue de dessus et la vue de côté',
      'La seule vue de face',
      'Six vues différentes',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Trois vues suffisent pour la plupart des solides usuels : la vue de face, la vue de dessus et la vue de côté.',
  },
  {
    id: 're4-d3-patron',
    skill: 'patron',
    points: 2,
    requires: ['patron-solide'],
    prompt: 'Un patron de solide, c’est…',
    options: [
      'La figure plane qu’on plie pour obtenir le solide',
      'Le dessin du solide vu de face',
      'La mesure de toutes ses longueurs',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un patron se découpe et se plie : c’est le solide « à plat », toutes ses faces reliées.',
  },
  {
    id: 're4-d4-vocabulaire',
    skill: 'patron',
    points: 2,
    requires: ['face-solide', 'arete', 'sommet-solide', 'milieu-segment'],
    prompt: 'Sur un cube, une arête est…',
    options: [
      'Le segment où deux faces se rejoignent',
      'Un point du solide',
      'Une des faces carrées',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Une face est une surface, une arête est le segment qui borde deux faces, un sommet est un point. On sait aussi placer le milieu d’un segment : il servira plus tard.',
  },
  {
    id: 're4-d5-aire',
    skill: 'mesurer',
    points: 2,
    requires: ['aire', 'arrondi'],
    prompt: 'Quelle est l’aire d’un carré de 6 cm de côté ?',
    options: ['36 cm²', '24 cm²', '12 cm²'],
    cols: 3,
    correct: 0,
    explain:
      '6 × 6 = 36 cm². (24 serait la longueur de son tour.) Et quand un résultat ne tombe pas juste, on en donne un arrondi.',
  },
  {
    id: 're4-d6-perpendiculaire',
    skill: 'mesurer',
    points: 2,
    requires: ['droites-perpendiculaires', 'angle-droit', 'triangle-rectangle'],
    prompt: 'Deux droites perpendiculaires forment entre elles…',
    options: ['Un angle droit', 'Un angle de 45°', 'Aucun angle'],
    cols: 3,
    correct: 0,
    explain:
      'Perpendiculaire veut dire « à angle droit ». Un triangle qui possède un tel angle est appelé triangle rectangle.',
  },
  {
    id: 're4-d7-volume-pave',
    skill: 'mesurer',
    points: 2,
    requires: ['pave-droit', 'aire'],
    prompt: 'Un pavé droit a une base de 20 cm² et une hauteur de 5 cm. Quel est son volume ?',
    options: ['100 cm³', '25 cm³', '4 cm³'],
    cols: 3,
    correct: 0,
    explain: 'Pour un solide droit, on multiplie l’aire de la base par la hauteur : 20 × 5 = 100 cm³.',
  },
  {
    id: 're4-d8-disque',
    skill: 'mesurer',
    points: 2,
    requires: ['aire'],
    prompt: 'Quelle formule donne l’aire d’un disque de rayon r ?',
    options: ['π × r × r', '2 × π × r', 'π × r'],
    cols: 3,
    correct: 0,
    explain: 'L’aire d’un disque vaut π × r². (2πr est la longueur du cercle, pas une aire.)',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Les acquis de 5e sur les solides, vérifiés en cinq minutes"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà des solides',
        tone: 'slate',
        body: (
          <>
            Huit questions rapides. Rien n’est noté, rien ne bloque : elles servent à savoir par
            où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
