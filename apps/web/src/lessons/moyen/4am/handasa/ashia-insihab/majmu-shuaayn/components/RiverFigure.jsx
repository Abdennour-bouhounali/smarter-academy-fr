
/**
 * « (الشكل) » du تحدّ (p. 127) : un fleuve entre deux rives, A sur la rive basse et B en face sur la rive haute, le
 * chemin [AB] perpendiculaire aux rives, la flèche du courant (2 km/h, de gauche à droite) dans son cadre blanc, un
 * oiseau dans le ciel (décor du manuel). AUCUNE réponse : ni la direction de nage, ni 30°, ni la vitesse réelle (c'est
 * la question). Le même dessin sert la page d'unité (pages/unit/UnitOpenerFigure.jsx, clé « ashia-insihab:challenge »)
 * et le module 1.
 *
 * Props : `current` (« 2km/h », écrit comme le manuel), `label` (ariaLabel arabe).
 */
export default function RiverFigure({ current = '2km/h', label }) {
  const W = 320; const H = 210; const yTop = 52; const yBot = 176; const x = 236;
  const tp = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const aria = label ?? `نهر بين حافتين: النقطة A على الحافة القريبة والنقطة B مقابلتها على الحافة الأخرى، والمسار [AB] عمودي على الحافتين، وسهم سرعة التيار ${current} يتجه من اليسار إلى اليمين`;
  return (
    <figure className="mx-auto w-full max-w-sm rounded-xl border-2 border-slate-200 bg-white p-2" data-figure="river">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={aria}>
        <rect x={0} y={0} width={W} height={yTop - 12} fill="#E0F2FE" />
        {/* l'oiseau (décor du manuel) */}
        <path d="M58 20 q6 -7 12 0 q6 -7 12 0" fill="none" stroke="#334155" strokeWidth={1.6} aria-hidden="true" />
        {/* les deux rives (herbe) */}
        <rect x={0} y={yTop - 14} width={W} height={14} fill="#86EFAC" />
        <rect x={0} y={yBot} width={W} height={H - yBot} fill="#86EFAC" />
        {/* l'eau */}
        <rect x={0} y={yTop} width={W} height={yBot - yTop} fill="#7DD3FC" />
        {[0.25, 0.75].map((f) => (
          <path key={f} d={Array.from({ length: 8 }, (_, j) => `M${j * 44 + (f > 0.5 ? 18 : 0)} ${yTop + (yBot - yTop) * f} q11 -4 22 0`).join(' ')} fill="none" stroke="#E0F2FE" strokeWidth={1.4} aria-hidden="true" />
        ))}
        {/* le courant : une flèche horizontale vers la droite dans un cadre blanc */}
        <rect x={96} y={(yTop + yBot) / 2 - 22} width={96} height={40} rx={4} fill="#FFFFFF" stroke="#94A3B8" />
        <line x1={108} y1={(yTop + yBot) / 2 + 4} x2={170} y2={(yTop + yBot) / 2 + 4} stroke="#DC2626" strokeWidth={3} />
        <path d={`M180 ${(yTop + yBot) / 2 + 4} l-12 -6 l0 12 z`} fill="#DC2626" />
        <text x={144} y={(yTop + yBot) / 2 - 6} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#991B1B" {...tp}>{current}</text>
        {/* [AB], perpendiculaire aux rives */}
        <line x1={x} y1={yBot} x2={x} y2={yTop} stroke="#0F172A" strokeWidth={1.6} strokeDasharray="5 4" />
        <circle cx={x} cy={yBot} r={4.5} fill="#0F172A" />
        <circle cx={x} cy={yTop} r={4.5} fill="#0F172A" />
        <text x={x + 9} y={yBot + 18} fontSize={14} fontWeight="bold" fill="#0F172A" {...tp}>A</text>
        <text x={x + 9} y={yTop - 18} fontSize={14} fontWeight="bold" fill="#0F172A" {...tp}>B</text>
        <path d={`M${x} ${yTop + 12} l10 0 l0 -12`} fill="none" stroke="#0F172A" strokeWidth={1.2} />
      </svg>
    </figure>
  );
}
