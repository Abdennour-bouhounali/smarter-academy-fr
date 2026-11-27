/**
 * The words of the experiment `angles` (`angles.js`, `InquiryAngles.jsx`) — France's, beside `strings.fr.js` (which
 * this kind does not touch). Facts only: no sentence names a rule; a miss is answered by the same sentence as the other
 * kinds, followed by what the slide did. A lesson's `inquiry.text` overrides any of them (one level deep). French
 * typography is laid by `frAll` (U+00A0 before « : », U+202F before « ; ! ? », « ’ »).
 */
import { frAll } from '../kit/authoring/numbers';

export const ANGLES_TEXT = frAll({
  lead: 'Deux triangles posés à part sur la table des maçons. Pose le rapporteur sur un sommet et amène son aiguille sur le deuxième côté.',
  /** A round without the protractor: the masons wrote two sides of each triangle and the angle between them. */
  leadGiven:
    'Deux triangles posés à part sur la table des maçons. Les maçons ont écrit deux côtés de chacun et l’angle entre ces côtés.',
  /** A round where the world draws the second triangle itself. */
  leadDrawn: (t) => `Mesure deux angles du triangle $${t}$. Les angles du bloc, les maçons les ont tracés eux-mêmes.`,
  /** The lead once the measures are taken: the place, no instruction left (`lead`, `leadDrawn`). */
  leadDone: 'Deux triangles posés à part sur la table des maçons.',
  leadDrawnDone: 'Les angles du bloc, les maçons les ont tracés eux-mêmes.',
  pick: (t) => `Pose le rapporteur sur un sommet du triangle $${t}$ :`,
  needle: 'L’aiguille du rapporteur',
  reading: 'Le rapporteur indique',
  read: 'Lire l’angle',
  off: 'L’aiguille n’est pas sur le côté.',
  ask: 'Avant le glissement : ces deux triangles ont-ils la même forme ?',
  say: { same: 'Même forme', other: 'Pas la même forme' },
  slide: 'Faire glisser',
  /** The slide, its quotient written as the two lengths it is made of (`top`, `bottom`: LaTeX). */
  slideOf: (a, b, top, bottom) =>
    `Le triangle $${a}$ glisse sur $${b}$, chaque côté multiplié par $${top} \\div ${bottom}$.`,
  fact: {
    covers: 'Il recouvre exactement l’autre triangle.',
    apart: 'Il ne recouvre pas l’autre triangle.',
    open: 'Ces trois angles ne ferment pas de triangle : les maçons n’ont pas pu le fermer.',
  },
  miss: 'Ta prédiction n’a pas vu juste cette fois.',
  hit: 'Comme tu l’avais dit.',
  next: 'Suivant',
  unit: 'm',
  /** What a screen reader says of the drawing. */
  aria: (a, b) => `Deux triangles ${a} et ${b}, posés à part`,
  ariaNeedle: 'Angle de l’aiguille, en degrés',
});
