
/**
 * Le مخطط بالأعمدة du نشاط 3 (p. 93), DESSINÉ en SVG (jamais une image) : une barre par valeur, hauteur = effectif,
 * graduations entières. Les titres d'axes sont du texte arabe DOM (hors SVG), les nombres en chiffres latins.
 */
export default function BarChart({ values, freqs, xLabel, yLabel, yMax, testId, caption }) {
  const W = 340;
  const H = 196;
  const L = 34;
  const B = 26;
  const T = 10;
  const top = yMax ?? Math.max(...freqs);
  const slot = (W - L - 10) / values.length;
  const y = (f) => H - B - ((H - B - T) * f) / top;
  return (
    <figure className="space-y-1" data-bar-chart={testId ?? ''}>
      <p className="text-xs font-bold text-slate-600">↑ {yLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-md" role="img" aria-label={caption ?? yLabel} dir="ltr">
        {Array.from({ length: top + 1 }, (_, f) => (
          <g key={f}>
            <line x1={L} x2={W - 6} y1={y(f)} y2={y(f)} stroke={f === 0 ? '#334155' : '#E2E8F0'} strokeWidth={f === 0 ? 1.4 : 1} />
            <text x={L - 5} y={y(f) + 3.5} fontSize={10} fill="#475569" textAnchor="end" fontFamily="ui-monospace, monospace">{f}</text>
          </g>
        ))}
        <line x1={L} x2={L} y1={T - 6} y2={H - B} stroke="#334155" strokeWidth={1.4} />
        {values.map((v, i) => {
          const cx = L + slot * (i + 0.5);
          return (
            <g key={v} data-bar={v} data-f={freqs[i]}>
              <rect x={cx - slot * 0.3} y={y(freqs[i])} width={slot * 0.6} height={H - B - y(freqs[i])} fill="#F59E0B" stroke="#B45309" strokeWidth={1} />
              <text x={cx} y={H - B + 13} fontSize={9} fill="#334155" textAnchor="middle" fontFamily="ui-monospace, monospace">{v}</text>
            </g>
          );
        })}
      </svg>
      <p className="text-center text-xs font-bold text-slate-600">{xLabel} →</p>
      {caption && <figcaption className="text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
