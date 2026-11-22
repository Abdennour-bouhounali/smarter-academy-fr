
/**
 * Le schéma de l'exercice 33 (أتعمّق, p. 29) : AED rectangle en A, AD = 1,
 * AE = 1/2 — puis la construction demandée : l'arc de centre E et de rayon
 * ED coupe [AE) en B, et ABCD est un rectangle. Les longueurs sont CALCULÉES
 * (ED = √(1 + 1/4)), jamais dessinées à l'œil ; aucune valeur de ED ni de AB
 * n'est écrite (c'est ce que l'exercice demande).
 * Géométrie en LTR (`dir="ltr"`), lettres latines du manuel.
 */
const U = 120; // pixels pour une unité
const A = { x: 24, y: 150 };
const D = { x: A.x, y: A.y - U };
const E = { x: A.x + U / 2, y: A.y };
const ED = Math.hypot(D.x - E.x, D.y - E.y);
const B = { x: E.x + ED, y: A.y };
const C = { x: B.x, y: D.y };

export default function GoldenFigure() {
  const w = Math.ceil(B.x + 24);
  return (
    <figure className="flex justify-center" dir="ltr" data-golden-figure>
      <svg viewBox={`0 0 ${w} 178`} className="w-full max-w-sm" role="img" aria-label="مثلث AED قائم في A، والمستطيل ABCD">
        {/* la construction : arc de centre E, rectangle ABCD */}
        <path d={`M ${D.x} ${D.y} A ${ED} ${ED} 0 0 1 ${B.x} ${B.y}`} fill="none" className="stroke-amber-500" strokeWidth={1.5} strokeDasharray="5 4" />
        <polyline points={`${E.x},${E.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`} fill="none" className="stroke-slate-400" strokeWidth={1.5} strokeDasharray="6 4" />
        {/* le triangle AED du manuel */}
        <polygon points={`${A.x},${A.y} ${E.x},${E.y} ${D.x},${D.y}`} className="fill-violet-100 stroke-violet-700" strokeWidth={2} />
        <polyline points={`${A.x + 10},${A.y} ${A.x + 10},${A.y - 10} ${A.x},${A.y - 10}`} fill="none" className="stroke-violet-700" strokeWidth={1.5} />
        {[['A', A, -14, 16], ['D', D, -14, 4], ['E', E, -4, 18], ['B', B, -4, 18], ['C', C, 6, 4]].map(([t, p, dx, dy]) => (
          <text key={t} x={p.x + dx} y={p.y + dy} fontSize={14} fontWeight={700} className="fill-slate-800">{t}</text>
        ))}
        <text x={A.x - 16} y={(A.y + D.y) / 2 + 4} fontSize={13} className="fill-slate-700">1</text>
        <text x={(A.x + E.x) / 2 - 4} y={A.y + 18} fontSize={11} className="fill-slate-700">1/2</text>
      </svg>
    </figure>
  );
}
