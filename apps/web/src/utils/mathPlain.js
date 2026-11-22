import { isolateOutsideMath, isolateMathRuns } from './bidi';

/**
 * `mathToPlain(text)` — a content string with `$…$` islands made readable WITHOUT KaTeX.
 *
 * For the places where only a STRING fits: `<option>`, `title` / `aria-label` attributes, a label
 * concatenated into a template, the `MathLabel` fallback while KaTeX loads. The catalogue's points to
 * learn, descriptions and module blurbs are written like lesson content (« الترميز $x \longmapsto ax + b$ »);
 * printed raw, the student read the dollars and the backslashes. Here each island becomes Unicode
 * (« x ⟼ ax + b »), isolated LTR like any formula (ARABIC_RTL_CONTRACT.md).
 *
 * Dependency-free on purpose (no KaTeX): it may run in the entry bundle.
 */
const SYMBOLS = [
  [/\\longmapsto|\\mapsto/g, '⟼'], [/\\times/g, '×'], [/\\div/g, '÷'], [/\\cdot/g, '·'],
  [/\\leq?\b/g, '≤'], [/\\geq?\b/g, '≥'], [/\\neq\b/g, '≠'], [/\\approx/g, '≈'], [/\\pm/g, '±'],
  [/\\infty/g, '∞'], [/\\ldots|\\dots/g, '…'], [/\\iff/g, '⟺'], [/\\Rightarrow/g, '⇒'], [/\\in\b/g, '∈'],
  [/\\%/g, '%'], [/\{,\}/g, ','], [/\^\{?\\circ\}?/g, '°'], [/\\[,;!:]|\\quad|\\qquad/g, ' '],
  [/\\left|\\right/g, ''],
];
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };

/** One island's LaTeX → Unicode text. */
export function latexToPlain(tex) {
  let s = String(tex);
  // \dfrac{a}{b} / \frac{a}{b} → a/b (innermost first, nested fractions included)
  for (let i = 0; i < 5 && /\\[dt]?frac/.test(s); i += 1) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) => `${/^[\w.,]+$/.test(a) ? a : `(${a})`}/${/^[\w.,]+$/.test(b) ? b : `(${b})`}`);
  }
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_, a) => (/^[\w.,]+$/.test(a) ? `√${a}` : `√(${a})`));
  s = s.replace(/\\(?:mathrm|text|textrm|mathbf|operatorname|mathit)\{([^{}]*)\}/g, '$1');
  for (const [re, by] of SYMBOLS) s = s.replace(re, by);
  s = s.replace(/\^\{?(\d)\}?/g, (_, d) => SUP[d]).replace(/_\{?(\d)\}?/g, (_, d) => SUB[d]);
  s = s.replace(/\\begin\{[^}]*\}|\\end\{[^}]*\}/g, '').replace(/\\\\/g, ' ; ');
  return s.replace(/[{}]/g, '').replace(/\\([A-Za-z]+)/g, '$1').replace(/\s+/g, ' ').trim();
}

/** A content string with `$…$` / `$$…$$` islands → readable plain text (bidi-isolated). */
export function mathToPlain(value) {
  if (typeof value !== 'string') return value;
  if (!value.includes('$')) return isolateOutsideMath(value);
  return value
    .split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g)
    .map((seg, i) => {
      if (i % 2 === 0) return isolateMathRuns(seg);
      const inner = seg.startsWith('$$') ? seg.slice(2, -2) : seg.slice(1, -1);
      return `⁦${latexToPlain(inner)}⁩`; // LRI … PDI : la formule se lit de gauche à droite
    })
    .join('');
}

/** Does this string carry a `$…$` island? */
export const hasMath = (value) => typeof value === 'string' && /\$[^$]+\$/.test(value);
