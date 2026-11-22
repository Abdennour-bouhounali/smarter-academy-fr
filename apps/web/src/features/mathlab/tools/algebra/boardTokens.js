/**
 * LES JETONS DU TABLEAU du مختبر الجبر — logique pure, sans React.
 *
 * Le tableau partagé (shared/mathBoard/frames.js) désigne des JETONS : des
 * morceaux d'expression qu'on peut colorer, sous lesquels on pose une flèche.
 * Ce module découpe ce que les moteurs du مختبر écrivent (equation.js,
 * simplify.js, systems.js, factor.js) en jetons — sans jamais recalculer :
 *
 *   formTokens      a·x + b (equation.js)          → [2x] [+ 3]
 *   splitTerms      une ligne LaTeX d'une somme     → [3x] [+ 2\left(x + 4\right)] [- x]
 *   splitProduct    un produit posé                 → [+ 2] [\left(x + 4\right)]
 *   diffRows        deux lignes successives         → ce qui a disparu, ce qui est apparu
 *
 * Le découpage se fait au niveau SUPÉRIEUR seulement (hors accolades,
 * parenthèses et `\left…\right`) : `2 \times \left(-3\right)` reste un jeton.
 */

import { tok } from '../../shared/mathBoard/frames.js';
import * as R from './rational.js';
import { formToLatex } from './linearForm.js';

/** Les jetons d'une forme `a·x + b` ; ids `${prefix}x` et `${prefix}c`. */
export function formTokens(form, prefix, variable = 'x', tones = {}) {
  const tokens = [];
  if (!R.isZero(form.a)) tokens.push(tok(`${prefix}x`, formToLatex({ a: form.a, b: R.ZERO }, variable), tones.x));
  if (!R.isZero(form.b) || tokens.length === 0) {
    const value = form.b;
    const latex = tokens.length === 0
      ? R.toLatex(value)
      : `${R.isNegative(value) ? '-' : '+'} ${R.toLatex(R.isNegative(value) ? R.negate(value) : value)}`;
    tokens.push(tok(`${prefix}c`, latex, tones.c));
  }

  return tokens;
}

/** Profondeur d'imbrication : accolades, parenthèses, crochets, `\left … \right`. */
function scan(latex, visit) {
  let depth = 0;
  for (let i = 0; i < latex.length; i += 1) {
    if (latex.startsWith('\\left', i)) { depth += 1; i += 5; continue; }
    if (latex.startsWith('\\right', i)) { depth -= 1; i += 6; continue; }
    const ch = latex[i];
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
    else if (visit(i, depth) === false) return;
  }
}

/**
 * Une somme écrite `a + b - c` → ses termes signés : `['a', '+ b', '- c']`.
 * Les moteurs écrivent toujours ` + ` / ` - ` entourés d'espaces entre termes
 * (joinPieces) ; un signe collé (`-x`, `x^{-1}`) n'est pas une coupure.
 */
export function splitTerms(latex) {
  const text = String(latex ?? '').trim();
  const cuts = [];
  scan(text, (i, depth) => {
    if (depth === 0 && i > 0 && text[i - 1] === ' ' && (text[i] === '+' || text[i] === '-') && text[i + 1] === ' ') cuts.push(i);
  });
  const parts = [];
  let start = 0;
  for (const cut of cuts) {
    parts.push(text.slice(start, cut).trim());
    start = cut;
  }
  parts.push(text.slice(start).trim());

  return parts.filter(Boolean);
}

/** Coupe `A = B` au niveau supérieur (un seul `=` attendu) ; rend null sinon. */
export function splitEquality(latex) {
  const text = String(latex ?? '');
  const cuts = [];
  scan(text, (i, depth) => { if (depth === 0 && text[i] === '=') cuts.push(i); });

  return cuts.map((cut, index) => text.slice(index === 0 ? 0 : cuts[index - 1] + 1, cut).trim())
    .concat([text.slice(cuts.length ? cuts[cuts.length - 1] + 1 : 0).trim()]);
}

/**
 * Un terme produit → ses facteurs visibles, pour poser l'arc « × » :
 *   `+ 2\left(x + 4\right)`             → ['+ 2', '\left(x + 4\right)']
 *   `\left(x + 2\right)\left(x - 3\right)` → ['\left(x + 2\right)', '\left(x - 3\right)']
 * Rend null quand il n'y a pas deux facteurs lisibles (`\left(x + 1\right)^{2}`, `- \left(…\right)`).
 */
export function splitProduct(term) {
  const text = String(term ?? '').trim();
  const opens = [];
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text.startsWith('\\left', i)) {
      if (depth === 0) opens.push(i);
      depth += 1;
      i += 5;
    } else if (text.startsWith('\\right', i)) {
      depth -= 1;
      i += 6;
    }
  }
  if (!opens.length || /\^\{/.test(text.slice(text.lastIndexOf('\\right')))) return null;
  if (opens[0] > 0) {
    const head = text.slice(0, opens[0]).trim();
    // Un vrai facteur (chiffre ou lettre), pas un simple signe.
    if (!/[0-9a-z]/i.test(head.replace(/\\times/g, ''))) return null;

    return [head.replace(/\s*\\times\s*$/, ''), text.slice(opens[0]).trim()];
  }
  if (opens.length === 2) return [text.slice(0, opens[1]).trim(), text.slice(opens[1]).trim()];

  return null;
}

/** Un terme sans son signe de tête : `+ 2x` → `2x`, `- x` → `-x`. */
export function unsigned(term) {
  const text = String(term).trim();
  if (text.startsWith('+ ')) return text.slice(2);
  if (text.startsWith('- ')) return `-${text.slice(2)}`;

  return text;
}

/**
 * Ce qui change d'une ligne à la suivante, en multiensembles de termes :
 * `removed` (indices dans `before`), `added` (indices dans `after`). Un terme
 * de tête perd son `+` : on compare sans le signe de tête positif.
 */
export function diffRows(before, after) {
  const norm = (term) => (term.startsWith('+ ') ? term.slice(2) : term);
  const pool = new Map();
  before.forEach((term, index) => {
    const key = norm(term);
    if (!pool.has(key)) pool.set(key, []);
    pool.get(key).push(index);
  });
  const kept = new Map();
  const added = [];
  after.forEach((term, index) => {
    const list = pool.get(norm(term));
    if (list?.length) kept.set(index, list.shift());
    else added.push(index);
  });
  const used = new Set(kept.values());
  const removed = before.map((_, index) => index).filter((index) => !used.has(index));

  return { kept, added, removed };
}
