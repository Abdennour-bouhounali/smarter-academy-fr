import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * MathText — LaTeX renderer for Smarter Academy.
 *
 * Responsibility: render mathematical notation ($...$  and  $$...$$) via KaTeX.
 *
 * NOT responsible for:
 *  - Markdown bold (**text**)  → use <strong>text</strong> in JSX
 *  - Markdown italic (*text*)  → use <em>text</em> in JSX
 *  - Paragraph layout          → use <p> in JSX
 *
 * Usage — inline math mixed with text:
 *   <p>La fonction <MathText>$f(x)=ax+b$</MathText> est affine.</p>
 *
 * Usage — full sentence with multiple expressions:
 *   <MathText>{"Pour $x=3$, on obtient $f(3)=7$."}</MathText>
 *
 * Usage — display (block) formula:
 *   <MathText>{"$$a=\\frac{y_B-y_A}{x_B-x_A}$$"}</MathText>
 *
 * Usage — with className:
 *   <MathText className="font-mono text-blue-700">$f(x)=2x$</MathText>
 */
// Math isolation: notation reads left to right, and each expression is kept
// whole (never broken, never reordered by the surrounding text). Every expression is wrapped in a `dir="ltr"`
// container carrying .sa-math-inline / .sa-math-block (index.css). Block math
// gets a <div>: react-katex's BlockMath renders a <div>, which is invalid
// inside a <span> and triggers a React DOM-nesting warning. Single chokepoint
// — 360+ call sites inherit this without individual changes. A Latin word
// attached to a formula (`PGCD$(a ; b)$`) joins its island (`mathSegments`).

/**
 * Les SEGMENTS d'un texte : du texte, une formule en bloc, ou une ÎLE LTR.
 *
 * Une île regroupe une formule en ligne et ce qui lui est ATTACHÉ en écriture
 * latine : un mot latin collé devant (`PGCD$(a ; b)$`, `PGCD $(a ; b)$`), et
 * les formules suivantes quand seuls des espaces ou un tel mot les séparent
 * (`PGCD$(a ; b) = $ PGCD$(b ; r)$`) : une égalité « PGCD(a ; b) = PGCD(b ; r) »
 * reste d'un seul tenant (une formule ne se coupe jamais sur deux lignes). Un
 * chiffre, un mot accentué (« où ») ou une ponctuation (« $a$, $b$ ») sépare
 * toujours deux îles.
 *
 *   { type: 'text', text } · { type: 'block', math } ·
 *   { type: 'inline', pieces: [{ text } | { math }] }
 */
/**
 * La paire à la française dans une formule : « PGCD(12 ; 18) », « (2 ; −3) ». KaTeX colle « ; » à ce qui
 * le précède ; écrit « a ; b » (une espace de chaque côté), il reçoit une fine espace de part et d'autre.
 * Une commande « \; » n'est jamais touchée (son « ; » suit une barre oblique, pas une espace).
 */
export const frenchMath = (math) => math.replace(/ ; /g, '\\,;\\,');

export function mathSegments(source) {
  const parts = source.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
  const isBlock = (p) => p.startsWith('$$') && p.endsWith('$$') && p.length > 4;
  const isInline = (p) => !isBlock(p) && p.startsWith('$') && p.endsWith('$') && p.length > 2;
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (isBlock(part)) { out.push({ type: 'block', math: frenchMath(part.slice(2, -2)) }); continue; }
    if (!isInline(part)) { if (part) out.push({ type: 'text', text: part }); continue; }
    const pieces = [];
    // Un mot latin collé devant la formule (au plus une espace) la rejoint — un mot ENTIER en lettres
    // non accentuées : « écrit $x$ » ne se coupe jamais en « é » + « crit ».
    const prev = out[out.length - 1];
    const lead = prev?.type === 'text' ? prev.text.match(/(^|[^\p{L}\p{M}])([A-Za-z]+ ?)$/u) : null;
    if (lead) {
      prev.text = prev.text.slice(0, prev.text.length - lead[2].length);
      if (!prev.text) out.pop();
      pieces.push({ text: lead[2] });
    }
    pieces.push({ math: frenchMath(part.slice(1, -1)) });
    // Tant que seuls des espaces ou un mot latin mènent à la formule suivante,
    // l'île continue.
    while (i + 2 < parts.length && /^\s*(?:[A-Za-z]+\s*)?$/.test(parts[i + 1]) && isInline(parts[i + 2])) {
      if (parts[i + 1]) pieces.push({ text: parts[i + 1] });
      pieces.push({ math: frenchMath(parts[i + 2].slice(1, -1)) });
      i += 2;
    }
    out.push({ type: 'inline', pieces });
  }
  return out;
}

export default function MathText({ children, className }) {
  if (typeof children !== 'string') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[MathText] Expected a string child. Received:', typeof children,
        '— Use <strong>/<em> for emphasis in JSX, not ** inside MathText.'
      );
    }
    return null;
  }

  const rendered = mathSegments(children).map((seg, index) => {
    if (seg.type === 'block') {
      return (
        <div key={index} dir="ltr" className="sa-math-block">
          <BlockMath math={seg.math} />
        </div>
      );
    }
    if (seg.type === 'inline') {
      return (
        <span key={index} dir="ltr" className="sa-math-inline">
          {seg.pieces.map((p, j) => (p.math !== undefined
            ? <InlineMath key={j} math={`\\displaystyle ${p.math}`} />
            : <span key={j}>{p.text}</span>))}
        </span>
      );
    }
    // the PLAIN text between the islands, as it is written: one direction, no invisible mark around an equality
    return <span key={index}>{seg.text}</span>;
  });

  if (className) {
    return <span className={className}>{rendered}</span>;
  }
  return <>{rendered}</>;
}
