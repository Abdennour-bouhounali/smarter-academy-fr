import { MathfieldElement } from 'mathlive';
import { installKeyboardCloseButton } from './keyboardClose.js';
import 'mathlive/fonts.css';

/**
 * MathLive, configuré UNE fois pour le grapheur.
 *
 *  - Les polices sont les nôtres (`mathlive/fonts.css`, servies par Vite
 *    depuis node_modules) : `fontsDirectory = null` empêche MathLive
 *    d'aller les chercher ailleurs. Aucune requête ne sort de la plateforme.
 *  - Pas de sons.
 *  - Un clavier virtuel COMPACT, celui d'un grapheur : x, puissances,
 *    racine, fraction, valeur absolue, les fonctions usuelles, π — pas le
 *    clavier complet de MathLive avec ses matrices et ses lettres grecques.
 */

let configured = false;

export const GRAPHER_KEYBOARD_LAYOUT = Object.freeze({
  label: 'f(x)',
  tooltip: 'f(x)',
  rows: [
    [
      { latex: 'x', class: 'hide-shift' },
      { latex: 'x^2', insert: '#@^2' },
      { latex: 'x^{n}', insert: '#@^{#?}' },
      { latex: '\\sqrt{x}', insert: '\\sqrt{#0}' },
      { latex: '\\frac{a}{b}', insert: '\\frac{#@}{#?}' },
      { latex: '|x|', insert: '\\left|#0\\right|' },
      { label: '(', latex: '(' },
      { label: ')', latex: ')' },
      { class: 'action', label: '⌫', command: ['performWithFeedback', 'deleteBackward'] },
    ],
    [
      { label: '7', latex: '7' }, { label: '8', latex: '8' }, { label: '9', latex: '9' },
      { latex: '\\div', insert: '/' },
      { latex: '\\sin', insert: '\\sin(#0)' },
      { latex: '\\cos', insert: '\\cos(#0)' },
      { latex: '\\tan', insert: '\\tan(#0)' },
      { latex: '\\pi' },
      { class: 'action', label: '←', command: ['performWithFeedback', 'moveToPreviousChar'] },
    ],
    [
      { label: '4', latex: '4' }, { label: '5', latex: '5' }, { label: '6', latex: '6' },
      { latex: '\\times', insert: '\\cdot' },
      { latex: '\\ln', insert: '\\ln(#0)' },
      { latex: '\\log', insert: '\\log(#0)' },
      { latex: 'e^{x}', insert: 'e^{#0}' },
      { latex: 'e' },
      { class: 'action', label: '→', command: ['performWithFeedback', 'moveToNextChar'] },
    ],
    [
      { label: '1', latex: '1' }, { label: '2', latex: '2' }, { label: '3', latex: '3' },
      { latex: '-' },
      { label: '0', latex: '0' },
      { label: ',', latex: '.' },
      { latex: '+' },
      { latex: '=', class: 'hide-shift' },
      { class: 'action', label: '⏎', command: ['performWithFeedback', 'commit'] },
    ],
  ],
});

/**
 * Le clavier de مخبر المتوسط : le même, sans sin, cos, tan, ln, log ni e —
 * le collège ne trace que des droites (scope.js). Les rangées gardent leur
 * forme : un élève qui passe d'un مخبر à l'autre retrouve ses touches.
 */
const BEYOND_MOYEN = new Set(['\\sin', '\\cos', '\\tan', '\\ln', '\\log', 'e^{x}', 'e']);
export const MOYEN_KEYBOARD_LAYOUT = Object.freeze({
  ...GRAPHER_KEYBOARD_LAYOUT,
  rows: GRAPHER_KEYBOARD_LAYOUT.rows.map((row) => row.filter((key) => !BEYOND_MOYEN.has(key.latex))),
});

export function ensureMathLive() {
  if (configured || typeof window === 'undefined') return;
  configured = true;
  MathfieldElement.fontsDirectory = null;
  MathfieldElement.soundsDirectory = null;
  MathfieldElement.plonkSound = null;
  MathfieldElement.keypressSound = null;
  // Le clavier virtuel se ferme d'un bouton « إغلاق » (2026-10-08), pour tous les champs MathLive.
  installKeyboardCloseButton();
}

/**
 * Le clavier virtuel est GLOBAL : on le remplace à l'ouverture du grapheur, on rend l'ancien à la fermeture.
 * @param {'full'|'moyen'} [variant]  celui du مخبر (scope.js)
 */
export function installGrapherKeyboard(variant = 'full') {
  const keyboard = typeof window !== 'undefined' ? window.mathVirtualKeyboard : null;
  if (!keyboard) return () => {};
  const previous = keyboard.layouts;
  keyboard.layouts = [variant === 'moyen' ? MOYEN_KEYBOARD_LAYOUT : GRAPHER_KEYBOARD_LAYOUT];

  return () => {
    try {
      keyboard.layouts = previous;
    } catch {
      // Le clavier a pu être détruit entre-temps : rien à rendre.
    }
  };
}
