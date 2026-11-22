import MathText from '../../../../../../common/components/MathText';

/**
 * Les petites figures du درس 3, DESSINÉES (jamais raster) : un دستور en code LTR, la ligne d'une série
 * (le tableau du تمرين 7), un tableau à deux lignes (فئات / تكرارات), et un مدرّج تكراري (أستعدّ item 3 :
 * le troisième rectangle à 10 ; تمرين 16 : 6, 1, 4).
 */

/** Un دستور de tableur : code latin, gauche à droite, jamais KaTeX. */
export function Dustur({ children, className = '' }) {
  return <code dir="ltr" className={`rounded bg-slate-100 px-1 font-mono text-[0.95em] text-slate-900 ${className}`}>{children}</code>;
}

/** Un tableau à deux lignes (en-têtes arabes, cellules en $…$ ou nombres). */
export function MiniTable({ head, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center text-sm" data-mini-table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-slate-200 last:border-0">
              <th className="whitespace-nowrap px-1 py-1 text-start text-xs font-semibold text-slate-600">{r.label}</th>
              {r.cells.map((c, i) => <td key={i} className="whitespace-nowrap px-1 py-1"><MathText>{String(c)}</MathText></td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {head}
    </div>
  );
}

/**
 * Un مدرّج تكراري : `bounds` (les limites des classes, n + 1 nombres), `heights` (n hauteurs), `yMax`.
 * Les rectangles sont CONTIGUS (c'est ce qui le distingue d'un مخطط بالأعمدة).
 */
export function HistogramFigure({ bounds, heights, yMax, label, width = 260, height = 150 }) {
  const padL = 26; const padB = 22; const top = 8;
  const W = width; const H = height;
  const iw = W - padL - 8; const ih = H - padB - top;
  const n = heights.length;
  const x = (i) => padL + (i / n) * iw;
  const y = (v) => top + ih - (v / yMax) * ih;
  const step = yMax <= 10 ? 2 : yMax <= 20 ? 5 : 10;
  const ticks = Array.from({ length: Math.floor(yMax / step) + 1 }, (_, i) => i * step);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} dir="ltr" className="max-w-full" data-histogram-figure>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - 6} y1={y(t)} y2={y(t)} stroke="#e2e8f0" />
          <text x={padL - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill="#64748b">{t}</text>
        </g>
      ))}
      {heights.map((h, i) => (
        <rect key={i} x={x(i)} y={y(h)} width={iw / n} height={top + ih - y(h)} fill="#7dd3fc" stroke="#0369a1" strokeWidth="1.2" />
      ))}
      <line x1={padL} x2={W - 6} y1={top + ih} y2={top + ih} stroke="#334155" />
      <line x1={padL} x2={padL} y1={top} y2={top + ih} stroke="#334155" />
      {bounds.map((b, i) => (
        <text key={i} x={x(i)} y={top + ih + 13} fontSize="9" textAnchor="middle" fill="#334155">{b}</text>
      ))}
    </svg>
  );
}
