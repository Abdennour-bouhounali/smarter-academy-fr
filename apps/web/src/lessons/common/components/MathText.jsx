import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { isolateMathRuns } from '../../../utils/bidi';

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
// Math LTR isolation (ALGERIA_PLATFORM_MASTER_SPEC.md §14): the UI is RTL
// (ar-DZ — src/locale.js) but notation reads left-to-right regardless of the
// surrounding text direction. Every expression is wrapped in a `dir="ltr"`
// container carrying .sa-math-inline / .sa-math-block (index.css). Block math
// gets a <div>: react-katex's BlockMath renders a <div>, which is invalid
// inside a <span> and triggers a React DOM-nesting warning. Single chokepoint
// — 360+ call sites inherit this without individual changes. A Latin word
// attached to a formula (`PGCD$(a ; b)$`) joins its LTR island
// (`mathSegments`, ARABIC_RTL_CONTRACT.md).

/**
 * Les SEGMENTS d'un texte : du texte, une formule en bloc, ou une ÎLE LTR.
 *
 * Une île regroupe une formule en ligne et ce qui lui est ATTACHÉ en écriture
 * latine : un mot latin collé devant (`PGCD$(a ; b)$`, `PGCD $(a ; b)$`), et
 * les formules suivantes quand seuls des espaces ou un tel mot les séparent
 * (`PGCD$(a ; b) = $ PGCD$(b ; r)$`). Sans ce regroupement, le paragraphe RTL
 * range le mot latin et chaque île dans l'ordre de droite à gauche : le
 * manuel écrit « PGCD(a ; b) = PGCD(b ; r) » et l'élève lisait
 * « (b ; r)PGCD(a ; b) = PGCD ». Ce qui est arabe (« $a$ و $b$ ») ou ponctué
 * (« $a$ ، $b$ ») sépare toujours deux îles : rien ne change pour eux.
 *
 *   { type: 'text', text } · { type: 'block', math } ·
 *   { type: 'inline', pieces: [{ text } | { math }] }
 */
export function mathSegments(source) {
  const parts = source.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
  const isBlock = (p) => p.startsWith('$$') && p.endsWith('$$') && p.length > 4;
  const isInline = (p) => !isBlock(p) && p.startsWith('$') && p.endsWith('$') && p.length > 2;
  const out = [];
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (isBlock(part)) { out.push({ type: 'block', math: part.slice(2, -2) }); continue; }
    if (!isInline(part)) { if (part) out.push({ type: 'text', text: part }); continue; }
    const pieces = [];
    // Un mot latin collé devant la formule (au plus une espace) la rejoint.
    const prev = out[out.length - 1];
    const lead = prev?.type === 'text' ? prev.text.match(/(^|[^A-Za-z])([A-Za-z]+ ?)$/) : null;
    if (lead) {
      prev.text = prev.text.slice(0, prev.text.length - lead[2].length);
      if (!prev.text) out.pop();
      pieces.push({ text: lead[2] });
    }
    pieces.push({ math: part.slice(1, -1) });
    // Tant que seuls des espaces ou un mot latin mènent à la formule suivante,
    // l'île continue.
    while (i + 2 < parts.length && /^\s*(?:[A-Za-z]+\s*)?$/.test(parts[i + 1]) && isInline(parts[i + 2])) {
      if (parts[i + 1]) pieces.push({ text: parts[i + 1] });
      pieces.push({ math: parts[i + 2].slice(1, -1) });
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
    // Le texte BRUT entre les îles : « √a », « x² = a » écrits sans `$` dans une
    // phrase arabe s'afficheraient « a√ » — isolés ici (utils/bidi.js).
    return <span key={index}>{isolateMathRuns(seg.text)}</span>;
  });

  if (className) {
    return <span className={className}>{rendered}</span>;
  }
  return <>{rendered}</>;
}
