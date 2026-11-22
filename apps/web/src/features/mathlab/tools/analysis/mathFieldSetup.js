/**
 * MathLive pour le مختبر التحليل : le clavier, et rien d'autre.
 *
 * La CONFIGURATION (polices locales, sons coupés) vit dans
 * `functionGrapher/mathliveSetup.js` et n'est pas réécrite ici : `ensureMathLive`
 * est idempotent et global, donc les deux instruments partagent la même
 * instance de MathLive, les mêmes polices, la même absence de requête sortante.
 * Ce fichier n'ajoute que ce qui DIFFÈRE : la disposition du clavier.
 *
 * ── Pourquoi un clavier à part ───────────────────────────────────────────
 * Celui du grapheur est fait pour ÉCRIRE une fonction. Ici on écrit des
 * fonctions aussi, mais on répond également à des questions dont la réponse
 * est un nombre — souvent une fraction (« ½ ») ou un négatif. Le clavier de
 * réponse n'a donc besoin ni de sin/cos/tan ni de π, et il doit au contraire
 * mettre la fraction et le signe moins à portée de pouce.
 *
 * Deux dispositions, donc, et `installKeyboard` pose celle que l'écran
 * courant demande. Le clavier virtuel de MathLive est GLOBAL : on remplace
 * ses dispositions à l'ouverture et on rend les précédentes à la fermeture,
 * exactement comme le grapheur (sans quoi un instrument laisserait son
 * clavier à celui qu'on ouvre ensuite).
 */

import { ensureMathLive } from '../functionGrapher/mathliveSetup.js';

export { ensureMathLive };

/** Le clavier des EXPRESSIONS : x, puissances, racine, fraction, fonctions. */
const ANALYSIS_FUNCTION_KEYBOARD = Object.freeze({
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
      // Les PARAMÈTRES du laboratoire (§24) : a, b, c s'écrivent au clavier
      // comme x, sinon `ax^2+bx+c` ne se saisit pas au doigt.
      { latex: 'a' }, { latex: 'b' },
      { class: 'action', label: '⏎', command: ['performWithFeedback', 'commit'] },
    ],
  ],
});

/**
 * Le clavier des RÉPONSES : des nombres, une fraction, un moins.
 *
 * Pas de fonctions, pas de π : on répond « 2,5 », « −3 » ou « ½ » à un défi,
 * jamais « sin(x) ». Un clavier plus court se prend en main plus vite, et
 * §44 interdit le fouillis.
 */
const ANALYSIS_ANSWER_KEYBOARD = Object.freeze({
  label: '123',
  tooltip: '123',
  rows: [
    [
      { label: '7', latex: '7' }, { label: '8', latex: '8' }, { label: '9', latex: '9' },
      { latex: '\\frac{a}{b}', insert: '\\frac{#@}{#?}' },
      { class: 'action', label: '⌫', command: ['performWithFeedback', 'deleteBackward'] },
    ],
    [
      { label: '4', latex: '4' }, { label: '5', latex: '5' }, { label: '6', latex: '6' },
      { latex: '-' },
      { class: 'action', label: '←', command: ['performWithFeedback', 'moveToPreviousChar'] },
    ],
    [
      { label: '1', latex: '1' }, { label: '2', latex: '2' }, { label: '3', latex: '3' },
      { latex: '\\sqrt{x}', insert: '\\sqrt{#0}' },
      { class: 'action', label: '→', command: ['performWithFeedback', 'moveToNextChar'] },
    ],
    [
      { label: '0', latex: '0' },
      // La virgule décimale : c'est ce que l'élève algérien écrit. MathLive
      // insère un point, que l'analyseur lit indifféremment.
      { label: ',', latex: '.' },
      { latex: '\\pi' },
      { class: 'action', label: '⏎', command: ['performWithFeedback', 'commit'] },
    ],
  ],
});

/**
 * Pose les deux dispositions sur le clavier virtuel GLOBAL et rend de quoi
 * remettre les précédentes.
 *
 * Les deux sont installées ensemble : MathLive laisse l'élève passer de
 * l'une à l'autre par un onglet, et un champ de réponse ouvert au milieu
 * d'une saisie de fonction ne doit pas reconfigurer le clavier sous les
 * doigts.
 */
export function installAnalysisKeyboard() {
  const keyboard = typeof window !== 'undefined' ? window.mathVirtualKeyboard : null;
  if (!keyboard) return () => {};
  const previous = keyboard.layouts;
  keyboard.layouts = [ANALYSIS_FUNCTION_KEYBOARD, ANALYSIS_ANSWER_KEYBOARD];

  return () => {
    try {
      keyboard.layouts = previous;
    } catch {
      // Le clavier a pu être détruit entre-temps : rien à rendre.
    }
  };
}
