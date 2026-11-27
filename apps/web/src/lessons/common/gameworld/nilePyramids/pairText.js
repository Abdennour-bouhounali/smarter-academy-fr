/**
 * The words of the experiment `pair` (`pair.js`, `InquiryPair.jsx`) — France. Every sentence the screen shows is here;
 * a lesson's `spec.text` changes any of them (one level deep). French typography: U+00A0 before « : » and inside
 * « … », U+202F before « ; ! ? », « ’ ». No sentence names the rule (« premier lien », never which sides it joins).
 */
const NB = ' ';
const NN = ' ';
const list = (xs) => xs.join(`${NN}; `);
/** a, a et b, a, b et c */
const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} et ${xs.at(-1)}`);

export const PAIR_TEXT = {
  lead: `Les maçons tracent leurs triangles sur le sable de la cour avant de tailler (longueurs en mètres). À gauche, le gabarit${NN}; à droite, un tracé posé autrement.`,
  template: (names) => `Le gabarit ${names}`,
  stone: (names) => `Le tracé ${names}`,
  figure: (t, s) => `Le gabarit ${t} et le tracé ${s}, dessinés à part`,
  length: (x) => `${x}${NB}m`,
  sideAria: (seg, x) => `Le côté [${seg}], ${x}${NB}m`,
  ask: `Avant de relier les côtés${NB}: ce tracé a-t-il la forme du gabarit${NN}?`,
  say: { shape: 'Ce tracé a la forme du gabarit', not: 'Il ne l’a pas' },
  said: `Ta prédiction${NB}:`,
  firstLink: `Le premier lien est posé. Relie les deux autres côtés${NB}: touche un côté du gabarit, puis un côté du tracé.`,
  givenLinks: `Un maçon a lié les côtés dans l’ordre de leurs noms. Tu peux les relier autrement${NB}: touche un côté du gabarit, puis un côté du tracé.`,
  first: 'premier lien',
  quotient: (s, t) => `${s}${NB}÷${NB}${t}`,
  pending: '…',
  mark: { eq: '=', ne: '≠' },
  withLinks: (expected, measured) => `Avec ces liens${NB}: attendu ${list(expected)} — mesuré ${list(measured)}`,
  lay: 'Poser le tracé sur le gabarit',
  /** how the world moved the stone: `scale` 'down' | 'up' | 'same', `turned`, `flipped` */
  laidHow: ({ scale, turned, flipped }) => {
    const done = [
      ...(scale === 'down' ? ['réduit'] : scale === 'up' ? ['agrandi'] : []),
      ...(turned ? ['tourné'] : []),
      ...(flipped ? ['retourné'] : []),
    ];
    return done.length ? `Le tracé est ${and(done)}, puis posé sur le gabarit.` : 'Le tracé est posé sur le gabarit.';
  },
  laid: {
    covers: `Il recouvre exactement le gabarit${NB}: ce tracé a la forme du gabarit.`,
    apart: `Il ne recouvre pas le gabarit${NB}: ce tracé n’a pas la forme du gabarit.`,
  },
  hit: 'Comme tu l’avais dit.',
  miss: 'Ta prédiction n’a pas vu juste cette fois.',
  again: 'Tu peux encore relier les côtés autrement.',
  next: 'Suivant',
};
