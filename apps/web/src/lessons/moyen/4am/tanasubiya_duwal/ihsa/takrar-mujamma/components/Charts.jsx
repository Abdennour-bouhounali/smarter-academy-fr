
/**
 * Les FIGURES du manuel redessinées en SVG (jamais une image) : le مخطط بالأعمدة des âges (نشاط 1), les
 * مدرّجات تكرارية (طرائق : les ouvriers ; تمرين 6 : l'électricité) et les مخططات دائرية (أستعدّ 4 ; تمرين 4).
 * Le corps du graphique est `dir="ltr"` (un axe se lit de gauche à droite, ARABIC_RTL_CONTRACT « Charts
 * read left to right ») ; les titres d'axes arabes sont du DOM hors du SVG.
 */
const W = 300;
const H = 170;
const PAD = { l: 30, r: 10, t: 10, b: 24 };

function Axes({ yMax, yStep }) {
  const ih = H - PAD.t - PAD.b;
  const ticks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  return (
    <g>
      {ticks.map((v) => {
        const y = PAD.t + ih - (v / yMax) * ih;
        return (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#E2E8F0" />
            <text x={PAD.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#475569" fontFamily="ui-monospace, monospace">{v}</text>
          </g>
        );
      })}
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke="#334155" />
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#334155" />
    </g>
  );
}

function Frame({ title, xLabel, yLabel, children, label }) {
  return (
    <figure className="mx-auto w-full max-w-sm space-y-1" data-chart>
      {title && <figcaption className="text-center text-xs font-bold text-slate-700">{title}</figcaption>}
      {yLabel && <p className="text-xs font-semibold text-slate-600" dir="rtl">↑ {yLabel}</p>}
      <div dir="ltr">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>{children}</svg>
      </div>
      {xLabel && <p className="text-end text-xs font-semibold text-slate-600" dir="rtl">{xLabel} ←</p>}
    </figure>
  );
}

/** مخطط بالأعمدة : une barre par valeur (`labels` sous l'axe). */
export function BarChart({ labels, freqs, yMax, yStep, xLabel, yLabel, title, label }) {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const step = iw / labels.length;
  return (
    <Frame title={title} xLabel={xLabel} yLabel={yLabel} label={label}>
      <Axes yMax={yMax} yStep={yStep} />
      {freqs.map((f, i) => {
        const x = PAD.l + step * (i + 0.5);
        const h = (f / yMax) * ih;
        return (
          <g key={labels[i]}>
            <rect x={x - 6} y={PAD.t + ih - h} width="12" height={h} fill="#1E293B" />
            <text x={x} y={H - PAD.b + 13} textAnchor="middle" fontSize="10" fill="#1E293B" fontFamily="ui-monospace, monospace">{labels[i]}</text>
          </g>
        );
      })}
    </Frame>
  );
}

/** مدرّج تكراري : des rectangles CONTIGUS sur des classes d'égale amplitude (`edges` = bornes). */
export function Histogram({ edges, freqs, yMax, yStep, xLabel, yLabel, title, label, edgeText = (e) => String(e) }) {
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const lo = edges[0];
  const hi = edges[edges.length - 1];
  const X = (e) => PAD.l + ((e - lo) / (hi - lo)) * iw;
  return (
    <Frame title={title} xLabel={xLabel} yLabel={yLabel} label={label}>
      <Axes yMax={yMax} yStep={yStep} />
      {freqs.map((f, i) => {
        const h = (f / yMax) * ih;
        return <rect key={i} x={X(edges[i])} y={PAD.t + ih - h} width={X(edges[i + 1]) - X(edges[i])} height={h} fill="#CBD5E1" stroke="#334155" />;
      })}
      {edges.map((e) => <text key={e} x={X(e)} y={H - PAD.b + 13} textAnchor="middle" fontSize="9" fill="#1E293B" fontFamily="ui-monospace, monospace">{edgeText(e)}</text>)}
    </Frame>
  );
}

/** مخطط دائري : des secteurs proportionnels à `value`, chacun avec son étiquette (texte court, LTR). */
export function PieChart({ parts, label, size = 150 }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const R = 60;
  const C = 70;
  const colors = ['#60A5FA', '#FBBF24', '#34D399', '#F472B6', '#A78BFA'];
  let a0 = -Math.PI / 2;
  return (
    <span dir="ltr" className="mx-auto block" style={{ width: size }} data-chart="pie">
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={label}>
        {parts.map((p, i) => {
          const a1 = a0 + (p.value / total) * 2 * Math.PI;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const d = `M${C} ${C} L${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 ${large} 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)} Z`;
          const mid = (a0 + a1) / 2;
          const lx = C + R * 0.6 * Math.cos(mid);
          const ly = C + R * 0.6 * Math.sin(mid);
          a0 = a1;
          return (
            <g key={i}>
              <path d={d} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="1.5" />
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0F172A" fontFamily="ui-monospace, monospace">{p.label}</text>
            </g>
          );
        })}
      </svg>
    </span>
  );
}
