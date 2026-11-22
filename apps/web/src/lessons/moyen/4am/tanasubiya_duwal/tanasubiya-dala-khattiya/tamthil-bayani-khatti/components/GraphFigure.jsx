
/**
 * Une FIGURE du manuel, dessinée (jamais une image) : un معلم gradué, des droites par O, des points,
 * des horizontales et les chemins pointillés d'une lecture. Elle ne porte aucune réponse que l'énoncé
 * ne donne pas : chaque droite et chaque point viennent de la figure du livre (extraction › figure /
 * reading) ou d'un énoncé de la plateforme. Les mots (titres des axes) sont du DOM arabe sous la
 * figure ; les nombres des graduations sont dans le SVG (LTR).
 *
 * Props : win { xMin, xMax, yMin, yMax }, xStep, yStep, lines [{ a, label, color }], points
 * [{ x, y, label }], hlines [{ y, label, color }], reads [{ x, y }] (chemin axe → droite → axe),
 * xLabel, yLabel, width, height, every { x, y } (une graduation sur n porte son nombre), caption.
 */
export default function GraphFigure({
  win, xStep = 1, yStep = 1, lines = [], points = [], hlines = [], reads = [], xLabel, yLabel,
  width = 320, height = 220, every = { x: 1, y: 1 }, caption, testId,
}) {
  const pad = 22;
  const ux = (width - 2 * pad) / (win.xMax - win.xMin);
  const uy = (height - 2 * pad) / (win.yMax - win.yMin);
  const px = (x) => pad + (x - win.xMin) * ux;
  const py = (y) => pad + (win.yMax - y) * uy;
  const range = (min, max, step) => {
    const out = [];
    for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  };
  const fmt = (v) => String(v).replace('.', ',').replace('-', '−');
  const seg = (a) => {
    let lo = win.xMin; let hi = win.xMax;
    if (a !== 0) { const b1 = win.yMin / a; const b2 = win.yMax / a; lo = Math.max(lo, Math.min(b1, b2)); hi = Math.min(hi, Math.max(b1, b2)); }
    return [[lo, a * lo], [hi, a * hi]];
  };
  const xs = range(win.xMin, win.xMax, xStep);
  const ys = range(win.yMin, win.yMax, yStep);
  return (
    <span className="mx-auto block w-full max-w-[420px] space-y-1" data-graph-figure={testId ?? ''}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={caption ?? ''} style={{ direction: 'ltr' }}>
        {xs.map((x) => <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMax)} y2={py(win.yMin)} stroke="#E2E8F0" />)}
        {ys.map((y) => <line key={`gy${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#E2E8F0" />)}
        <line x1={px(win.xMin)} x2={px(win.xMax) + 6} y1={py(0)} y2={py(0)} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(win.xMax) + 8} ${py(0)} l-7 -4 v8 z`} fill="#334155" />
        <line x1={px(0)} x2={px(0)} y1={py(win.yMin)} y2={py(win.yMax) - 6} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(0)} ${py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
        {xs.map((x, i) => (x !== 0 && i % every.x === 0 ? <text key={`tx${x}`} x={px(x)} y={py(0) + 13} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(x)}</text> : null))}
        {ys.map((y, i) => (y !== 0 && i % every.y === 0 ? <text key={`ty${y}`} x={px(0) - 4} y={py(y) + 3.5} textAnchor="end" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(y)}</text> : null))}
        <text x={px(0) - 4} y={py(0) + 13} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">O</text>
        {hlines.map((h) => (
          <g key={`h${h.y}`}>
            <line x1={px(win.xMin)} x2={px(win.xMax)} y1={py(h.y)} y2={py(h.y)} stroke={h.color ?? '#E11D48'} strokeWidth={1.6} strokeDasharray="6 4" />
            {h.label && <text x={px(win.xMax) - 2} y={py(h.y) - 4} textAnchor="end" fontSize={10} fill={h.color ?? '#E11D48'} fontFamily="ui-monospace, monospace">{h.label}</text>}
          </g>
        ))}
        {lines.map((l) => {
          const [[x1, y1], [x2, y2]] = seg(l.a);
          const far = x2 > 0 ? [x2, y2] : [x1, y1];
          return (
            <g key={`l${l.a}`}>
              <line x1={px(x1)} y1={py(y1)} x2={px(x2)} y2={py(y2)} stroke={l.color ?? '#1D4ED8'} strokeWidth={2.2} strokeLinecap="round" />
              {l.label && <text x={px(far[0]) - 4} y={py(far[1]) + (l.a >= 0 ? 14 : -6)} textAnchor="end" fontSize={11} fontWeight="bold" fill={l.color ?? '#1D4ED8'} fontFamily="ui-monospace, monospace">{l.label}</text>}
            </g>
          );
        })}
        {reads.map((r) => (
          <path key={`r${r.x}`} d={`M${px(r.x)} ${py(0)} L${px(r.x)} ${py(r.y)} L${px(0)} ${py(r.y)}`} fill="none" stroke="#7C3AED" strokeWidth={1.4} strokeDasharray="4 3" />
        ))}
        {points.map((p) => (
          <g key={`p${p.x};${p.y}`}>
            <circle cx={px(p.x)} cy={py(p.y)} r={3.5} fill="#0F172A" />
            {p.label && <text x={px(p.x) + 5} y={py(p.y) - 5} fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">{p.label}</text>}
          </g>
        ))}
      </svg>
      {(xLabel || yLabel) && (
        <span className="flex flex-wrap justify-between gap-2 text-[11px] font-bold text-slate-600">
          {yLabel && <span>↑ {yLabel}</span>}
          {xLabel && <span>{xLabel} →</span>}
        </span>
      )}
    </span>
  );
}
