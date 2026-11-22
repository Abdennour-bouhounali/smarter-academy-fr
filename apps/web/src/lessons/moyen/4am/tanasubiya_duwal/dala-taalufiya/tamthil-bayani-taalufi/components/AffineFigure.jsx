import MathText from '../../../../../../common/components/MathText';

/**
 * Une FIGURE dessinée (jamais une image) : un معلم متعامد ومتجانس gradué, des droites y = a·x + b, des points
 * et les chemins pointillés d'une lecture. Chaque droite vient d'un énoncé (manuel ou plateforme) ; la figure ne
 * porte aucune réponse que l'énoncé ne donne pas à lire. Les nombres des graduations sont dans le SVG (LTR) ;
 * la légende est du DOM (MathText).
 *
 * Props : win { xMin, xMax, yMin, yMax } (entiers), lines [{ a, b, label, color }], points [{ x, y, label }],
 * reads [{ x, y }] (axe → droite → axe), caption (texte avec $…$), ariaLabel (texte simple), width, height.
 */
export default function AffineFigure({ win, lines = [], points = [], reads = [], caption, ariaLabel, width = 300, height = 240, testId }) {
  const pad = 20;
  const u = Math.min((width - 2 * pad) / (win.xMax - win.xMin), (height - 2 * pad) / (win.yMax - win.yMin));
  const W = (win.xMax - win.xMin) * u + 2 * pad;
  const H = (win.yMax - win.yMin) * u + 2 * pad;
  const px = (x) => pad + (x - win.xMin) * u;
  const py = (y) => pad + (win.yMax - y) * u;
  const xs = []; for (let x = win.xMin; x <= win.xMax; x++) xs.push(x);
  const ys = []; for (let y = win.yMin; y <= win.yMax; y++) ys.push(y);
  const fmt = (v) => String(v).replace('.', ',').replace('-', '−');
  const seg = (a, b) => {
    let lo = win.xMin; let hi = win.xMax;
    if (a !== 0) { const x1 = (win.yMin - b) / a; const x2 = (win.yMax - b) / a; lo = Math.max(lo, Math.min(x1, x2)); hi = Math.min(hi, Math.max(x1, x2)); }
    return [[lo, a * lo + b], [hi, a * hi + b]];
  };
  return (
    <span className="mx-auto block w-full max-w-[360px] space-y-1" data-affine-figure={testId ?? ''}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel ?? ''} style={{ direction: 'ltr' }}>
        {xs.map((x) => <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMax)} y2={py(win.yMin)} stroke="#E2E8F0" />)}
        {ys.map((y) => <line key={`gy${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#E2E8F0" />)}
        <line x1={px(win.xMin)} x2={px(win.xMax) + 6} y1={py(0)} y2={py(0)} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(win.xMax) + 8} ${py(0)} l-7 -4 v8 z`} fill="#334155" />
        <line x1={px(0)} x2={px(0)} y1={py(win.yMin)} y2={py(win.yMax) - 6} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(0)} ${py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
        {xs.map((x) => (x !== 0 ? <text key={`tx${x}`} x={px(x)} y={py(0) + 12} textAnchor="middle" fontSize={9.5} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(x)}</text> : null))}
        {ys.map((y) => (y !== 0 ? <text key={`ty${y}`} x={px(0) - 4} y={py(y) + 3.5} textAnchor="end" fontSize={9.5} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(y)}</text> : null))}
        <text x={px(0) - 4} y={py(0) + 12} textAnchor="end" fontSize={10.5} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">O</text>
        {lines.map((l) => {
          const [[x1, y1], [x2, y2]] = seg(l.a, l.b);
          return (
            <g key={`l${l.a};${l.b}`} data-figure-line={`${l.a}:${l.b}`}>
              <line x1={px(x1)} y1={py(y1)} x2={px(x2)} y2={py(y2)} stroke={l.color ?? '#1D4ED8'} strokeWidth={2.2} strokeLinecap="round" />
              {l.label && <text x={Math.min(px(x2) - 2, W - 4)} y={Math.max(12, Math.min(H - 4, py(y2) + (l.a >= 0 ? 14 : -6)))} textAnchor="end" fontSize={11} fontWeight="bold" fill={l.color ?? '#1D4ED8'} fontFamily="ui-monospace, monospace">{l.label}</text>}
            </g>
          );
        })}
        {reads.map((r) => (
          <path key={`r${r.x};${r.y}`} d={`M${px(r.x)} ${py(0)} L${px(r.x)} ${py(r.y)} L${px(0)} ${py(r.y)}`} fill="none" stroke="#7C3AED" strokeWidth={1.4} strokeDasharray="4 3" />
        ))}
        {points.map((p) => (
          <g key={`p${p.x};${p.y}`}>
            <circle cx={px(p.x)} cy={py(p.y)} r={3.5} fill="#0F172A" />
            {p.label && <text x={px(p.x) + 5} y={py(p.y) - 5} fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">{p.label}</text>}
          </g>
        ))}
      </svg>
      {caption && <span className="block text-center text-xs text-slate-600"><MathText>{caption}</MathText></span>}
    </span>
  );
}
