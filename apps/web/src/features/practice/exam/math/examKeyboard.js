/**
 * Le clavier virtuel MathLive de la feuille d'examen : de quoi écrire une ligne
 * de calcul du programme (4AM) — chiffres, opérations, fraction, racine,
 * parenthèses, « ; » et la touche « PGCD ». Le clavier est GLOBAL dans MathLive :
 * on pose celui-ci à l'ouverture d'un champ et on rend l'ancien à la fermeture,
 * comme les instruments du مختبر.
 */
const EXAM_KEYBOARD = Object.freeze({
  label: '123',
  tooltip: '123',
  rows: [
    [
      { label: '7', latex: '7' }, { label: '8', latex: '8' }, { label: '9', latex: '9' },
      { latex: '\\times' }, { latex: '\\div' },
      { latex: '\\frac{a}{b}', insert: '\\frac{#@}{#?}' },
      { class: 'action', label: '⌫', command: ['performWithFeedback', 'deleteBackward'] },
      // Fermer le clavier (propriétaire, 2026-10-06) : il couvrait la copie sans bouton pour le ranger.
      // La touche intégrée de MathLive : elle range le clavier ET quitte le champ (sinon,
      // en mode « auto », le champ encore actif rouvrait aussitôt le clavier).
      '[hide-keyboard]',
    ],
    [
      { label: '4', latex: '4' }, { label: '5', latex: '5' }, { label: '6', latex: '6' },
      { latex: '+' }, { latex: '-' },
      { latex: '\\sqrt{x}', insert: '\\sqrt{#0}' },
      { class: 'action', label: '←', command: ['performWithFeedback', 'moveToPreviousChar'] },
    ],
    [
      { label: '1', latex: '1' }, { label: '2', latex: '2' }, { label: '3', latex: '3' },
      { latex: '=' }, { latex: '(' }, { latex: ')' },
      { class: 'action', label: '→', command: ['performWithFeedback', 'moveToNextChar'] },
    ],
    [
      { label: '0', latex: '0' },
      // La virgule décimale de l'élève algérien ; l'évaluateur lit aussi le point.
      { label: ',', latex: '{,}' },
      { label: ';', latex: ';' },
      { label: 'PGCD', insert: '\\mathrm{PGCD}(#0;#?)' },
      { latex: 'x' },
      { class: 'action', label: '⏎', command: ['performWithFeedback', 'commit'] },
    ],
  ],
});

/**
 * Le clavier du « مختبر التفكير » (THINKING_LAB.md §4) : une expression, pas une ligne de copie —
 * π, √, puissance, fraction, parenthèses, valeur absolue et les variables du défi.
 * @param {string[]} vars  les variables de la réponse (`answer.vars`)
 */
export function thinkingKeyboard(vars = []) {
  return {
    label: 'π√',
    tooltip: 'π√',
    rows: [
      [
        { label: '7', latex: '7' }, { label: '8', latex: '8' }, { label: '9', latex: '9' },
        { latex: '\\times' }, { latex: '\\div' },
        { latex: '\\frac{a}{b}', insert: '\\frac{#@}{#?}' },
        { class: 'action', label: '⌫', command: ['performWithFeedback', 'deleteBackward'] },
        '[hide-keyboard]',
      ],
      [
        { label: '4', latex: '4' }, { label: '5', latex: '5' }, { label: '6', latex: '6' },
        { latex: '+' }, { latex: '-' },
        { latex: '\\sqrt{x}', insert: '\\sqrt{#0}' },
        { latex: 'x^2', insert: '#@^{2}' },
        { latex: 'x^n', insert: '#@^{#?}' },
      ],
      [
        { label: '1', latex: '1' }, { label: '2', latex: '2' }, { label: '3', latex: '3' },
        { latex: '\\pi' }, { latex: '(' }, { latex: ')' },
        { latex: '|x|', insert: '\\left|#0\\right|' },
        { class: 'action', label: '←', command: ['performWithFeedback', 'moveToPreviousChar'] },
      ],
      [
        { label: '0', latex: '0' },
        { label: ',', latex: '{,}' },
        ...vars.map((v) => ({ latex: v })),
        { class: 'action', label: '→', command: ['performWithFeedback', 'moveToNextChar'] },
        { class: 'action', label: '⏎', command: ['performWithFeedback', 'commit'] },
      ],
    ],
  };
}

export function installExamKeyboard(layout = EXAM_KEYBOARD) {
  const keyboard = typeof window !== 'undefined' ? window.mathVirtualKeyboard : null;
  if (!keyboard) return () => {};
  const previous = keyboard.layouts;
  keyboard.layouts = [layout];
  return () => {
    try { keyboard.layouts = previous; } catch { /* clavier détruit : rien à rendre */ }
  };
}
