
/**
 * « الشكل المقابل » de la وضعية (p. 112) : le cône de révolution couché (base à gauche, sommet à droite) et le
 * cylindre de même axe posé sur sa base, son autre cercle sur la surface du cône. Les seules mesures écrites sont
 * celles du manuel (la longueur du cône et le rayon de sa base) ; h et r restent des LETTRES. Aussi au test final,
 * avec d'autres nombres.
 */
export default function ConeFigure({ H = '18', R = '6', label }) {
  const W = 340; const x0 = 40; const yA = 100; const L = 270; const Rp = 62;
  const h = 0.42 * L; const r = Rp * (1 - h / L); // un cylindre inscrit quelconque (pas celui de la réponse)
  const e = 0.22;
  const tp = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const aria = label ?? `مخروط دوران ارتفاعه ${H} ونصف قطر قاعدته ${R}، وأسطوانة دوران داخله لها نفس المحور، طولها h ونصف قطرها r`;
  // UN bloc pour les pages du lecteur de mission (`data-paging-keep`) : sinon le découpage descend DANS le SVG et en cache les pièces
  return (
    <figure className="mx-auto w-full max-w-sm rounded-xl border-2 border-slate-200 bg-white p-2" data-figure="cone-cylinder" data-paging-keep>
      <svg viewBox={`0 0 ${W} 190`} className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={aria}>
        <path d={`M${x0} ${yA - Rp} L${x0 + L} ${yA} L${x0} ${yA + Rp}`} fill="#FEF3C7" stroke="#92400E" strokeWidth={1.6} />
        <ellipse cx={x0} cy={yA} rx={e * Rp} ry={Rp} fill="#FDE68A" stroke="#92400E" strokeWidth={1.6} />
        <rect x={x0} y={yA - r} width={h} height={2 * r} fill="#BAE6FD" opacity={0.75} />
        <line x1={x0} y1={yA - r} x2={x0 + h} y2={yA - r} stroke="#0369A1" strokeWidth={1.8} />
        <line x1={x0} y1={yA + r} x2={x0 + h} y2={yA + r} stroke="#0369A1" strokeWidth={1.8} />
        <ellipse cx={x0} cy={yA} rx={e * r} ry={r} fill="none" stroke="#0369A1" strokeDasharray="3 3" />
        <ellipse cx={x0 + h} cy={yA} rx={e * r} ry={r} fill="#E0F2FE" stroke="#0369A1" strokeWidth={1.8} />
        <line x1={x0} y1={yA} x2={x0 + L} y2={yA} stroke="#334155" strokeDasharray="5 4" />
        {/* la longueur du cône */}
        <line x1={x0} y1={yA - Rp - 14} x2={x0 + L} y2={yA - Rp - 14} stroke="#334155" />
        <line x1={x0} y1={yA - Rp - 19} x2={x0} y2={yA - Rp - 9} stroke="#334155" />
        <line x1={x0 + L} y1={yA - Rp - 19} x2={x0 + L} y2={yA - 4} stroke="#94A3B8" strokeDasharray="2 2" />
        <text x={x0 + L / 2} y={yA - Rp - 19} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#0F172A" {...tp}>{H}</text>
        {/* le rayon de la base */}
        <line x1={x0 - e * Rp - 10} y1={yA - Rp} x2={x0 - e * Rp - 10} y2={yA} stroke="#334155" />
        <text x={x0 - e * Rp - 14} y={yA - Rp / 2 + 4} textAnchor="end" fontSize={12} fontWeight="bold" fill="#0F172A" {...tp}>{R}</text>
        {/* h et r */}
        <text x={x0 + h / 2} y={yA + r + 16} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#0369A1" {...tp}>h</text>
        <line x1={x0 + h + e * r + 4} y1={yA} x2={x0 + h + e * r + 4} y2={yA - r} stroke="#0369A1" />
        <text x={x0 + h + e * r + 8} y={yA - r / 2 + 4} fontSize={12} fontWeight="bold" fill="#0369A1" {...tp}>r</text>
        <text x={x0 + L + 5} y={yA + 4} fontSize={12} fontWeight="bold" fill="#0F172A" {...tp}>O</text>
      </svg>
    </figure>
  );
}
