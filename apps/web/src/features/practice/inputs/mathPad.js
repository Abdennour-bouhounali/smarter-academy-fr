/**
 * « لوحة الرموز » — quand une réponse numérique a besoin d'une écriture mathématique
 * (conseil du 2026-11-09, demande du propriétaire). Contrat : EXERCISE_CONTRACT.md
 * § « لوحة الرموز ».
 *
 * Décidé par une règle PURE sur ce que le client connaît toujours, même sans clé de
 * réponse : `answerType`, `answerFormat` et `evaluationPolicy.requiredForm`.
 * Mesuré sur la banque (16 466 réponses `rational`) : ~4 441 attendent une FRACTION,
 * aucune une racine ; « قوة » vise presque toujours un exposant entier. La lettre a donc
 * la fraction au centre ; √ et la puissance n'apparaissent que si la consigne les nomme.
 */

const FRACTION = /كسر|ناطق|نسبي|a\s*\/\s*b|حاصل\s*قسمة/;
const ROOT = /جذر|√/;
const POWER = /على\s*شكل\s*قوّ?ة|\^/;

/** La lettre est-elle utile pour cette question ? */
export function needsMathPad(question) {
  if (!question || question.answerType !== 'rational') return false;
  const format = String(question.answerFormat ?? '');
  const form = question.evaluationPolicy?.requiredForm;
  return FRACTION.test(format) || ROOT.test(format) || POWER.test(format) || form === 'irreducible' || form === 'fraction';
}

/**
 * Les touches, dans l'ordre d'affichage (grille LTR de 4 colonnes).
 * `kind` : digit | symbol | action. `latex` : ce qu'on insère dans le champ MathLive
 * (`#0`/`#?` = cases à remplir, `#@` = ce qui précède) ; `command` : une commande MathLive.
 */
export function padKeys(question) {
  const format = String(question?.answerFormat ?? '');
  const keys = [
    { id: 'frac', kind: 'symbol', latex: '\\frac{#0}{#?}', wide: true },
    { id: '7', kind: 'digit', latex: '7' }, { id: '8', kind: 'digit', latex: '8' }, { id: '9', kind: 'digit', latex: '9' },
    { id: 'back', kind: 'action', command: 'deleteBackward' },
    { id: '4', kind: 'digit', latex: '4' }, { id: '5', kind: 'digit', latex: '5' }, { id: '6', kind: 'digit', latex: '6' },
    { id: 'minus', kind: 'symbol', latex: '-' },
    { id: '1', kind: 'digit', latex: '1' }, { id: '2', kind: 'digit', latex: '2' }, { id: '3', kind: 'digit', latex: '3' },
    { id: 'comma', kind: 'symbol', latex: '{,}' },
    { id: 'left', kind: 'action', command: 'moveToPreviousChar' },
    { id: '0', kind: 'digit', latex: '0' },
    { id: 'right', kind: 'action', command: 'moveToNextChar' },
  ];
  if (ROOT.test(format)) keys.push({ id: 'sqrt', kind: 'symbol', latex: '\\sqrt{#0}' });
  if (POWER.test(format)) keys.push({ id: 'power', kind: 'symbol', latex: '#@^{#?}' });
  return keys;
}
