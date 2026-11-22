
/**
 * Les deux représentations graphiques de l'exercice 18 (p. 73), redessinées en SVG paramétré (jamais
 * une image) : (1) la droite qui passe par l'origine et par (1 ; 1,5) ; (2) la courbe qui part
 * d'environ (0 ; 0,3) et monte en s'incurvant (extraction › ex-18 › figure). Même quadrillage que le
 * livre (pas de 0,25, graduations 0,5). Les étiquettes « (1) » / « (2) » sont du texte DOM.
 */
const W = 150; const H = 150; const O = { x: 22, y: 128 }; const U = 52; // 1 unité = 52 px
const X = (v) => O.x + v * U; const Y = (v) => O.y - v * U;

function Frame({ children }) {
  const grid = [];
  for (let i = -0.25; i <= 2.4; i += 0.25) {
    grid.push(<line key={`v${i}`} x1={X(i)} x2={X(i)} y1={Y(-0.3)} y2={Y(2.2)} stroke="#FBCFE8" strokeWidth="0.8" />);
    grid.push(<line key={`h${i}`} x1={X(-0.3)} x2={X(2.4)} y1={Y(i)} y2={Y(i)} stroke="#FBCFE8" strokeWidth="0.8" />);
  }
  const ticks = [0.5, 1, 1.5, 2];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 190 }} aria-hidden="true" focusable="false">
      <rect width={W} height={H} fill="#FFFFFF" />
      {grid}
      <line x1={X(-0.3)} x2={X(2.35)} y1={O.y} y2={O.y} stroke="#0F172A" strokeWidth="1.2" />
      <line x1={O.x} x2={O.x} y1={Y(-0.3)} y2={Y(2.2)} stroke="#0F172A" strokeWidth="1.2" />
      {ticks.map((t) => (
        <g key={t} fontSize="8" fill="#0F172A" fontFamily="ui-monospace, monospace">
          <text x={X(t)} y={O.y + 10} textAnchor="middle">{String(t).replace('.', ',')}</text>
          <text x={O.x - 3} y={Y(t) + 3} textAnchor="end">{String(t).replace('.', ',')}</text>
        </g>
      ))}
      <text x={O.x - 3} y={O.y + 10} textAnchor="end" fontSize="8" fontFamily="ui-monospace, monospace">0</text>
      {children}
    </svg>
  );
}

export default function Ex18Graphs() {
  // (2) : une courbe qui part de (0 ; 0,3) et s'incurve (y = 0,3 + 1,6·√x, lue sur le livre)
  const curve = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * 1.6;
    return `${i === 0 ? 'M' : 'L'}${X(x).toFixed(1)} ${Y(0.3 + 1.55 * Math.sqrt(x)).toFixed(1)}`;
  }).filter((_, i) => 0.3 + 1.55 * Math.sqrt((i / 40) * 1.6) <= 2.2).join(' ');
  return (
    <div className="grid grid-cols-2 gap-2" data-ex18-graphs>
      <figure className="space-y-1 rounded-xl border border-slate-200 bg-white p-1 text-center" data-ex18="1">
        <figcaption className="text-sm font-bold text-slate-800">البيان (1)</figcaption>
        <div dir="ltr"><Frame><line x1={X(-0.15)} y1={Y(-0.225)} x2={X(1.4)} y2={Y(2.1)} stroke="#1D4ED8" strokeWidth="2" /></Frame></div>
      </figure>
      <figure className="space-y-1 rounded-xl border border-slate-200 bg-white p-1 text-center" data-ex18="2">
        <figcaption className="text-sm font-bold text-slate-800">البيان (2)</figcaption>
        <div dir="ltr"><Frame><path d={curve} fill="none" stroke="#C2410C" strokeWidth="2" /></Frame></div>
      </figure>
    </div>
  );
}
