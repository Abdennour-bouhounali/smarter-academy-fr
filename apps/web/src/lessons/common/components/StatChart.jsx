import MathText from './MathText';
import { layoutAxisChart, layoutPie } from './statChart';

/**
 * Un DIAGRAMME STATISTIQUE déclaratif (مخطط بالأعمدة، مدرّج تكراري، مضلّع، مخطط دائري / نصف دائري) — la
 * donnée et ses règles de lecture sont dans statChart.js. Dessiné en SVG, jamais une image. Le corps se lit
 * de gauche à droite (`dir="ltr"`) ; titres d'axes, noms de catégories et légende sont du texte arabe.
 *
 * Utilisé par la pratique (`statement.figure` avec `kind: 'chart'`, via StatementFigure) et par les مسائل
 * (ProblemSupport). Les valeurs ne sont pas écrites sur les barres : l'élève les LIT sur l'axe gradué.
 */
const INK = '#1e293b';
const AXIS = '#334155';
const PIE_FILLS = ['#93c5fd', '#fcd34d', '#6ee7b7', '#f9a8d4', '#c4b5fd', '#fdba74', '#a5f3fc', '#d9f99d'];
const num = { fontFamily: 'ui-monospace, SFMono-Regular, monospace', direction: 'ltr', unicodeBidi: 'isolate' };

function AxisChart(c) {
  const L = layoutAxisChart(c);
  const arabic = { direction: 'rtl', unicodeBidi: 'isolate' };
  return (
    <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label={c.ariaLabel}>
      {L.grid.map((g) => (
        <g key={g.v}>
          <line x1={L.x0} x2={L.x1} y1={g.y} y2={g.y} stroke={g.major ? '#cbd5e1' : '#eef2f7'} strokeWidth={g.major ? 1 : 0.8} />
          {g.text != null && <text x={L.x0 - 5} y={g.y + 3.5} fontSize="12" textAnchor="end" fill="#475569" style={num}>{g.text}</text>}
        </g>
      ))}
      {L.rects.map((r) => (r.missing ? (
        <g key={r.key} data-chart-missing>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="#94a3b8" strokeDasharray="4 3" />
          <text x={r.x + r.w / 2} y={L.yb - 8} fontSize="14" fontWeight="700" textAnchor="middle" fill="#64748b">؟</text>
        </g>
      ) : (
        <rect key={r.key} x={r.x} y={r.y} width={r.w} height={r.h} data-chart-bar
          fill={r.contiguous ? '#bae6fd' : '#475569'} stroke={r.contiguous ? '#0369a1' : 'none'} strokeWidth="1.2" />
      )))}
      {L.points.length > 0 && (
        <polyline points={L.points.map((p) => p.map((v) => v.toFixed(2)).join(',')).join(' ')} fill="none" stroke="#be123c" strokeWidth="2" strokeLinejoin="round" data-chart-line />
      )}
      {L.dots && L.points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#be123c" />)}
      {L.valueTexts.map((t, i) => <text key={i} x={t.x} y={t.y} fontSize="12" fontWeight="700" textAnchor="middle" fill={INK} style={num}>{t.text}</text>)}
      {/* Les axes par-dessus : flèche au bout de chacun. */}
      <line x1={L.x0} x2={L.x0} y1={L.yb} y2={L.yTop - 6} stroke={AXIS} strokeWidth="1.5" />
      <path d={`M${L.x0 - 3.5} ${L.yTop - 1} L${L.x0} ${L.yTop - 8} L${L.x0 + 3.5} ${L.yTop - 1}`} fill="none" stroke={AXIS} strokeWidth="1.5" />
      <line x1={L.x0} x2={L.x1 + 6} y1={L.yb} y2={L.yb} stroke={AXIS} strokeWidth="1.5" />
      <path d={`M${L.x1 + 1} ${L.yb - 3.5} L${L.x1 + 8} ${L.yb} L${L.x1 + 1} ${L.yb + 3.5}`} fill="none" stroke={AXIS} strokeWidth="1.5" />
      {L.xLabels.map((t, i) => (
        <text key={i} x={t.x} y={L.yb + 17 + (t.row ? 14 : 0)} fontSize={c.type === 'bar' ? L.labelFont : 12} textAnchor="middle" fill={INK}
          style={c.type === 'bar' && /[؀-ۿ]/.test(t.text) ? arabic : num}>{t.text}</text>
      ))}
    </svg>
  );
}

function PieChart(c) {
  const L = layoutPie(c);
  return (
    <>
      <svg viewBox={`0 0 ${L.W} ${L.H}`} className="mx-auto block h-auto w-full max-w-[280px]" role="img" aria-label={c.ariaLabel}>
        {L.sectors.map((s) => (
          <path key={s.i} d={s.d} fill={PIE_FILLS[s.i % PIE_FILLS.length]} stroke="#fff" strokeWidth="2" data-chart-sector={s.label} />
        ))}
        {L.half && <line x1={L.cx - L.R} x2={L.cx + L.R} y1={L.cy} y2={L.cy} stroke={AXIS} strokeWidth="1.2" />}
        {L.sectors.map((s) => (
          <g key={s.i}>
            {s.nameInside && (
              <text x={s.tx} y={s.text != null ? s.ty - 5 : s.ty + 5} fontSize="13" textAnchor="middle" fill={INK}
                style={/[؀-ۿ]/.test(s.label) ? { direction: 'rtl', unicodeBidi: 'isolate' } : num}>{s.label}</text>
            )}
            {s.text != null && (
              <text x={s.tx} y={s.nameInside ? s.ty + 13 : s.ty + 5} fontSize={s.missing ? 18 : 14} fontWeight="700" textAnchor="middle"
                fill={s.missing ? '#475569' : INK} style={num}>{s.text}</text>
            )}
          </g>
        ))}
      </svg>
      <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-800" data-chart-legend>
        {L.sectors.map((s) => (
          <li key={s.i} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-3 w-3 rounded-sm" style={{ background: PIE_FILLS[s.i % PIE_FILLS.length] }} />
            {/* Une classe « $10 \le a < 20$ » est une formule : MathText. */}
            <MathText>{s.label}</MathText>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function StatChart(c) {
  const { maxWidth = 420, caption, xTitle, yTitle, inline = false } = c;
  // `inline` : posé DANS un paragraphe (comme GeoFigure) — des <span> blocs au lieu de <figure>/<figcaption>.
  const Fig = inline ? 'span' : 'figure';
  const Cap = inline ? 'span' : 'figcaption';
  const axes = c.type !== 'pie';
  return (
    <Fig className="mx-auto my-2 block w-full" style={{ maxWidth }} data-stat-chart={c.type}>
      {axes && yTitle && <span dir="ltr" className="block ps-1 text-left"><span dir="rtl" className="text-sm font-semibold text-slate-600">{yTitle}</span></span>}
      <span dir="ltr" className="block">{axes ? <AxisChart {...c} /> : <PieChart {...c} />}</span>
      {axes && xTitle && <span dir="ltr" className="block pe-1 text-right"><span dir="rtl" className="text-sm font-semibold text-slate-600">{xTitle}</span></span>}
      {caption && <Cap className="mt-1 block text-center text-sm text-slate-600">{caption}</Cap>}
    </Fig>
  );
}
