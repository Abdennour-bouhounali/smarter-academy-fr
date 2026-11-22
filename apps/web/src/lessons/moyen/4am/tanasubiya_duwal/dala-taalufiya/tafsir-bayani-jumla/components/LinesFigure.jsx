
/**
 * Une FIGURE dessinée (jamais une image) : un معلم gradué et des droites y = ax + b (pas forcément par O),
 * des points marqués. Elle ne porte aucune réponse que l'énoncé ne donne pas : chaque droite vient de
 * l'énoncé (ou de la figure du manuel, ACT_FIGURE), et un point n'est marqué que si l'énoncé le nomme.
 * Les nombres des graduations sont dans le SVG (LTR) ; la légende est du DOM arabe.
 *
 * Props : win { xMin, xMax, yMin, yMax }, step (pas de la grille), every (une graduation sur n porte son
 * nombre), lines [{ a, b, label, color }], points [{ x, y, label }], caption, testId, height.
 */
const COLORS = ['#4F46E5', '#D97706', '#059669'];

export default function LinesFigure({ win, step = 1, every = 1, lines = [], points = [], caption, testId, width = 320, height = 240 }) {
  const pad = 22;
  const u = Math.min((width - 2 * pad) / (win.xMax - win.xMin), (height - 2 * pad) / (win.yMax - win.yMin));
  const W = (win.xMax - win.xMin) * u + 2 * pad;
  const H = (win.yMax - win.yMin) * u + 2 * pad;
  const px = (x) => pad + (x - win.xMin) * u;
  const py = (y) => pad + (win.yMax - y) * u;
  const range = (min, max) => {
    const out = [];
    for (let v = Math.ceil(min / step - 1e-9) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  };
  const fmt = (v) => String(v).replace('.', ',').replace('-', '−');
  const seg = ({ a, b }) => {
    let lo = win.xMin; let hi = win.xMax;
    if (a !== 0) { const b1 = (win.yMin - b) / a; const b2 = (win.yMax - b) / a; lo = Math.max(lo, Math.min(b1, b2)); hi = Math.min(hi, Math.max(b1, b2)); }
    return [[lo, a * lo + b], [hi, a * hi + b]];
  };
  const xs = range(win.xMin, win.xMax);
  const ys = range(win.yMin, win.yMax);
  const lab = (v) => v !== 0 && Math.abs(Math.round(v / (step * every)) * step * every - v) < 1e-9;
  return (
    <span className="mx-auto block w-full max-w-[400px] space-y-1" data-lines-figure={testId ?? ''}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={caption ?? ''} style={{ direction: 'ltr' }}>
        {xs.map((x) => <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={py(win.yMax)} y2={py(win.yMin)} stroke="#E2E8F0" />)}
        {ys.map((y) => <line key={`gy${y}`} x1={px(win.xMin)} x2={px(win.xMax)} y1={py(y)} y2={py(y)} stroke="#E2E8F0" />)}
        <line x1={px(win.xMin)} x2={px(win.xMax) + 6} y1={py(0)} y2={py(0)} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(win.xMax) + 8} ${py(0)} l-7 -4 v8 z`} fill="#334155" />
        <line x1={px(0)} x2={px(0)} y1={py(win.yMin)} y2={py(win.yMax) - 6} stroke="#334155" strokeWidth={1.5} />
        <path d={`M${px(0)} ${py(win.yMax) - 8} l-4 7 h8 z`} fill="#334155" />
        {xs.map((x) => (lab(x) ? <text key={`tx${x}`} x={px(x)} y={py(0) + 13} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(x)}</text> : null))}
        {ys.map((y) => (lab(y) ? <text key={`ty${y}`} x={px(0) - 4} y={py(y) + 3.5} textAnchor="end" fontSize={10} fill="#475569" fontFamily="ui-monospace, monospace">{fmt(y)}</text> : null))}
        <text x={px(0) - 4} y={py(0) + 13} textAnchor="end" fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">O</text>
        {lines.map((l, i) => {
          const [[x1, y1], [x2, y2]] = seg(l);
          const color = l.color ?? COLORS[i % COLORS.length];
          const tag = i % 2 === 0 ? [x1, y1] : [x2, y2];
          return (
            <g key={`l${l.a}:${l.b}`} data-figure-line={`${l.a}:${l.b}`}>
              <line x1={px(x1)} y1={py(y1)} x2={px(x2)} y2={py(y2)} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
              {l.label && <text x={Math.max(4, Math.min(W - 34, px(tag[0]) + (i % 2 === 0 ? 6 : -34)))} y={Math.max(12, Math.min(H - 4, py(tag[1]) + (i % 2 === 0 ? 14 : -6)))} fontSize={11} fontWeight="bold" fill={color} fontFamily="ui-monospace, monospace">{l.label}</text>}
            </g>
          );
        })}
        {points.map((p) => (
          <g key={`p${p.x};${p.y}`}>
            <circle cx={px(p.x)} cy={py(p.y)} r={3.5} fill="#0F172A" />
            {p.label && <text x={px(p.x) + 5} y={py(p.y) - 5} fontSize={11} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace">{p.label}</text>}
          </g>
        ))}
      </svg>
      {caption && <span className="block text-center text-[11px] text-slate-500">{caption}</span>}
    </span>
  );
}
