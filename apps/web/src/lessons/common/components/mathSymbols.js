import { isValidElement, Children } from 'react';

/**
 * Les symboles qu'une règle UTILISE — et seulement eux (demande du propriétaire,
 * 2026-10-06 : « just display the symbols needed in the rule, not complex ones
 * for nothing »). La palette de MathTextArea est déduite du texte de la règle
 * (ou de la rédaction modèle) : chaînes, LaTeX `$…$`, et les chaînes portées
 * par un élément React (enfants et props `text`, `lines`, `title`…).
 */
const DETECT = [
  // [symbole, groupe, motif dans le texte source]
  ['+', 'arith', /\+/],
  ['−', 'arith', /−|\s-\s|\$-|\(-|=\s*-/],
  ['×', 'arith', /×|\\times|\\cdot/],
  ['÷', 'arith', /÷|\\div/],
  ['=', 'arith', /(^|[^<>≤≥!\\])=|\\equiv/],
  ['≠', 'arith', /≠|\\neq?\b/],
  ['<', 'compare', /(^|\s|\$)<|\\lt\b/],
  ['>', 'compare', /(^|\s|\$)>|\\gt\b/],
  ['≤', 'compare', /≤|\\leq?\b|\\leqslant/],
  ['≥', 'compare', /≥|\\geq?\b|\\geqslant/],
  ['²', 'powers', /²|\^\{?2\}?/],
  ['³', 'powers', /³|\^\{?3\}?/],
  ['√', 'powers', /√|\\sqrt/],
  ['(', 'powers', /\(|\\left\(/],
  [')', 'powers', /\)|\\right\)/],
  ['/', 'powers', /\\frac|\\dfrac|\d\s*\/\s*\d/],
  ['°', 'geometry', /°|\\circ/],
  ['π', 'geometry', /π|\\pi\b/],
  ['∥', 'geometry', /∥|\\parallel|\/\//],
  ['⊥', 'geometry', /⊥|\\perp/],
  ['∠', 'geometry', /∠|\\widehat|\\angle|\\hat/],
  ['→', 'geometry', /→|\\overrightarrow|\\vec/],
  ['%', 'arith', /%|\\%/],
];
const GROUP_ORDER = ['arith', 'compare', 'powers', 'letters', 'geometry'];
// Mots LaTeX à ne pas prendre pour des lettres d'algèbre.
const LATEX_WORD = /\\[a-zA-Z]+/g;

/** Toutes les chaînes d'un nœud : texte, tableaux, éléments React (enfants et props textuelles). */
function collectText(node, out = [], depth = 0) {
  if (node == null || node === false || depth > 12) return out;
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out; }
  if (Array.isArray(node)) { node.forEach((n) => collectText(n, out, depth + 1)); return out; }
  if (isValidElement(node)) {
    const { children, text, lines, title, prompt, label } = node.props ?? {};
    [text, lines, title, prompt, label].forEach((v) => collectText(v, out, depth + 1));
    Children.forEach(children, (c) => collectText(c, out, depth + 1));
  }
  return out;
}

/**
 * Les groupes de symboles qu'utilisent les `sources` (chaînes ou nœuds React).
 * @returns {{ id: string, symbols: string[] }[]} groupes non vides, dans l'ordre de la palette
 */
export function symbolsFor(sources) {
  // Les parenthèses de PROSE arabe (« قاسم (بالباقي) ») ne sont pas des mathématiques.
  const text = collectText(sources).join('\n').replace(/\([^()]*[\u0600-\u06FF][^()]*\)/g, ' ');
  const groups = Object.fromEntries(GROUP_ORDER.map((g) => [g, []]));
  for (const [sym, group, re] of DETECT) if (re.test(text)) groups[group].push(sym);
  // Les lettres d'algèbre : isolées (a, b, q, x…), dans les formules comme dans
  // le texte arabe (« b قاسم لـ a »), jamais les mots LaTeX ni les unités (cm).
  const letters = new Set();
  // Les sigles (PGCD, PPCM) sont des MOTS, pas des noms de points : jamais
  // éclatés en lettres P, G, C, D (bug vu au déploiement des prompts, 2026-10-06).
  const plain = text.replace(LATEX_WORD, ' ').replace(/(?<![A-Za-z])(PGCD|PPCM)(?![A-Za-z])/g, ' ');
  for (const m of plain.matchAll(/(?<![A-Za-z])([a-zA-Z])(?![A-Za-z])/g)) letters.add(m[1]);
  // Les noms de points s'écrivent collés (AB, ABCD) : majuscules seules, 2 à 4.
  for (const m of plain.matchAll(/(?<![A-Za-z])([A-Z]{2,4})(?![A-Za-z])/g)) [...m[1]].forEach((c) => letters.add(c));
  groups.letters = [...letters].sort((a, b) => a.localeCompare(b)).slice(0, 8);
  // Une parenthèse ne va pas sans l'autre.
  if (groups.powers.includes('(') !== groups.powers.includes(')')) {
    groups.powers = [...new Set([...groups.powers, '(', ')'])];
  }
  return GROUP_ORDER.map((id) => ({ id, symbols: groups[id] })).filter((g) => g.symbols.length > 0);
}
