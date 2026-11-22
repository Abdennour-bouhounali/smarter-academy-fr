
/**
 * Un مخطط بالأعمدة DESSINÉ (SVG paramétré, jamais une image) : l'axe vertical gradué de `step` en `step`
 * jusqu'à `yMax`, une barre par catégorie, son nom (DOM-SVG, `direction="rtl"`) dessous. Les nombres sont
 * des graduations : la valeur d'une barre n'est PAS écrite dessus — l'élève la LIT sur l'axe (ex-19, les
 * voitures du club vert). Les étiquettes latines (« 7h–8h », « A ») restent LTR dans leur tspan.
 */
export default function BarChart({ bars, yMax, step, axis, labelEvery = 1, height = 260, ariaLabel }) {
  const W = 360;
  const pad = { top: 22, right: 8, bottom: 44, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const y = (v) => pad.top + innerH - (v / yMax) * innerH;
  const ticks = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  const slot = innerW / bars.length;
  const bw = Math.min(34, slot * 0.45);
  return (
    <figure className="mx-auto w-full max-w-md" data-bar-chart={bars.length}>
      <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img" aria-label={ariaLabel ?? axis} style={{ direction: 'ltr' }}>
        <text x={pad.left - 30} y={12} fontSize="11" fontWeight="bold" fill="#334155" direction="rtl" textAnchor="end">{axis}</text>
        {ticks.map((v, i) => (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} stroke={i % labelEvery === 0 ? '#CBD5E1' : '#EEF2F7'} />
            {i % labelEvery === 0 && <text x={pad.left - 4} y={y(v) + 3} fontSize="9" textAnchor="end" fill="#475569" fontFamily="ui-monospace, monospace">{v}</text>}
          </g>
        ))}
        <line x1={pad.left} x2={pad.left} y1={pad.top - 4} y2={pad.top + innerH} stroke="#334155" strokeWidth="1.5" />
        {bars.map((b, i) => {
          const cx = pad.left + slot * (i + 0.5);
          return (
            <g key={b.label} data-bar={b.label}>
              <rect x={cx - bw / 2} y={y(b.value)} width={bw} height={pad.top + innerH - y(b.value)} fill="#475569" />
              <text x={cx} y={height - pad.bottom + 16} fontSize="10" textAnchor="middle" fill="#1E293B" direction="rtl">{b.label}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
