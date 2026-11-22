import { useId } from 'react';
import { layoutArcTape } from './arcTape';

/**
 * « مخطط بأقواس » — the textbook's tape diagram (data and rules in arcTape.js). Drawn in SVG, never an image; the
 * body reads left to right like the textbook's figure (`direction: ltr`), numbers are isolated LTR text and an Arabic
 * label is drawn right to left. The element carries an Arabic `aria-label`.
 *
 * Used by the 1AM lessons of unit 2 « الجمع والطرح » (figures of معارف and طرائق), by the `story-bars` lab (live tape),
 * by the practice bank (`statement.figure` with `kind: 'tape'`, through StatementFigure) and by the مسائل.
 */
const STROKE = {
  amber: '#d97706', emerald: '#059669', sky: '#0284c7', violet: '#7c3aed', indigo: '#4f46e5', rose: '#e11d48', slate: '#334155',
};

export default function ArcTape(fig) {
  const { ariaLabel, caption, maxWidth = 420, inline = false } = fig;
  const Fig = inline ? 'span' : 'figure';
  const Cap = inline ? 'span' : 'figcaption';
  const L = layoutArcTape(fig);
  // One pattern id PER INSTANCE (useId): a constant id is shared by every tape of the page (unit 11's twin-sky bug).
  const hatch = `arc-tape-${useId().replace(/:/g, '')}`;
  const ltr = { direction: 'ltr', unicodeBidi: 'isolate', fontFamily: 'ui-monospace, SFMono-Regular, monospace' };
  const rtl = { direction: 'rtl', unicodeBidi: 'isolate' };
  const textOf = (it, x, y) => (
    <text x={x} y={y} fontSize={it.unknown ? 16 : 14} fontWeight={700} textAnchor="middle"
      fill={it.unknown ? STROKE.rose : STROKE[it.tone] ?? STROKE.slate} style={it.arabic ? rtl : ltr}
      data-tape-label={it.unknown ? 'unknown' : 'known'}>{it.label}</text>
  );

  return (
    <Fig className="mx-auto my-2 block w-full" style={{ maxWidth }} data-arc-tape data-tape-closed={L.closed ? 'true' : 'false'}>
      <svg viewBox={`0 0 ${L.W} ${L.H.toFixed(1)}`} className="h-auto w-full" role="img" aria-label={ariaLabel} style={{ direction: 'ltr' }}>
        <defs>
          <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={STROKE.rose} strokeWidth="2" />
          </pattern>
        </defs>
        <line x1={L.x0} x2={L.lineEnd} y1={L.y} y2={L.y} stroke="#1e293b" strokeWidth={2.4} />
        {L.ticks.map((x) => <line key={x} x1={x} x2={x} y1={L.y - 7} y2={L.y + 7} stroke="#1e293b" strokeWidth={2} />)}
        {L.mismatch && (
          L.mismatch.kind === 'gap'
            ? <line x1={L.mismatch.x1} x2={L.mismatch.x2} y1={L.y} y2={L.y} stroke={STROKE.rose} strokeWidth={4} strokeDasharray="5 4" data-tape-gap />
            : <rect x={L.mismatch.x1} y={L.y - 6} width={Math.max(L.mismatch.x2 - L.mismatch.x1, 2)} height={12} fill={`url(#${hatch})`} stroke={STROKE.rose} data-tape-overflow />
        )}
        {L.parts.map((p, i) => (
          <g key={i} data-tape-part={i}>
            <path d={p.path} fill="none" stroke={STROKE[p.tone] ?? STROKE.slate} strokeWidth={2} strokeDasharray={p.unknown ? '5 4' : undefined} />
            {textOf(p, p.labelX, p.labelY)}
          </g>
        ))}
        <g data-tape-whole>
          <path d={L.whole.path} fill="none" stroke={STROKE[L.whole.tone] ?? STROKE.indigo} strokeWidth={2} strokeDasharray={L.whole.unknown ? '5 4' : undefined} />
          {textOf(L.whole, L.whole.labelX, L.whole.labelY)}
        </g>
      </svg>
      {caption && <Cap className="mt-1 block text-center text-xs text-slate-500">{caption}</Cap>}
    </Fig>
  );
}
