
/**
 * « الشكل المقابل » du تحدّ (p. 103) : la minaret, le rayon de soleil qui passe par son sommet, le bâton de 1 m et
 * les deux longueurs mesurées au sol (10 m et 11,6 m). AUCUNE réponse : la hauteur de la minaret n'est ni écrite
 * ni graduée (c'est la question). Le même dessin sert la page d'unité (pages/unit/UnitOpenerFigure.jsx, clé
 * « khassiyat-talis:challenge »), le module 7 et, avec d'autres nombres, le test final.
 *
 * Props : `stick`, `stickAt`, `tip` — écrits comme le manuel (« 11,6 ») ; le dessin respecte leurs rapports.
 */
const num = (s) => Number(String(s).replace(',', '.'));

export default function MinaretFigure({ stick = '1', stickAt = '10', tip = '11,6', label }) {
  const S = num(stick); const D = num(stickAt); const T = num(tip);
  const h = (S * T) / (T - D);
  const W = 340; const x0 = 46; const yG = 168;
  const k = Math.min((W - x0 - 34) / T, 150 / h);
  const X = (m) => x0 + m * k; const Y = (m) => yG - m * k;
  const w = Math.max(10, Math.min(0.9 * k, 22));
  const lantern = yG - h * k * 0.9; const shaftTop = yG - h * k * 0.78; const balcony = yG - h * k * 0.72;
  const tp = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const aria = label ?? `مئذنة ارتفاعها مجهول، وعصا شاقولية طولها ${stick} m على بعد ${stickAt} m من قاعدتها؛ شعاع الشمس المارّ برأس المئذنة يمرّ برأس العصا ويصل الأرض على بعد ${tip} m من قاعدة المئذنة`;
  // UN bloc pour les pages du lecteur de mission (`data-paging-keep`) : sinon le découpage descend DANS le SVG et en cache les pièces
  return (
    <figure className="mx-auto w-full max-w-sm rounded-xl border-2 border-slate-200 bg-white p-2" data-figure="minaret" data-paging-keep>
      <svg viewBox={`0 0 ${W} 212`} className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={aria}>
        <rect x={0} y={0} width={W} height={yG} fill="#F0F9FF" />
        <circle cx={22} cy={20} r={11} fill="#FACC15" stroke="#F59E0B" strokeWidth={2} />
        {/* la minaret (hauteur en pointillé : inconnue) */}
        <rect x={X(0) - w / 2} y={shaftTop} width={w} height={yG - shaftTop} fill="#F8FAFC" stroke="#64748B" strokeWidth={1.2} />
        <rect x={X(0) - w * 0.75} y={balcony - 3} width={w * 1.5} height={5} fill="#CBD5E1" stroke="#64748B" />
        <rect x={X(0) - w * 0.36} y={lantern} width={w * 0.72} height={shaftTop - lantern} fill="#E2E8F0" stroke="#64748B" />
        <path d={`M${X(0) - w * 0.42} ${lantern} L${X(0)} ${Y(h)} L${X(0) + w * 0.42} ${lantern} Z`} fill="#10B981" stroke="#047857" />
        <line x1={X(0) - w - 6} y1={Y(h)} x2={X(0) - w - 6} y2={yG} stroke="#334155" strokeDasharray="4 3" />
        <text x={X(0) - w - 10} y={(Y(h) + yG) / 2} textAnchor="end" fontSize={14} fontWeight="bold" fill="#334155" {...tp}>?</text>
        {/* le rayon de soleil */}
        <line x1={X(0)} y1={Y(h)} x2={X(T)} y2={yG} stroke="#D97706" strokeWidth={2} />
        {/* le bâton */}
        <rect x={X(D) - 2} y={Y(S)} width={4} height={S * k} fill="#7C2D12" />
        <text x={X(D) + 6} y={Y(S) + 4} fontSize={11} fill="#7C2D12" {...tp}>{`${stick}m`}</text>
        {/* le sol et les longueurs mesurées */}
        <line x1={6} y1={yG} x2={W - 6} y2={yG} stroke="#92400E" strokeWidth={2} />
        {[[D, 184, stickAt], [T, 202, tip]].map(([m, y, lab]) => (
          <g key={lab}>
            <line x1={X(0)} y1={y - 4} x2={X(m)} y2={y - 4} stroke="#334155" markerEnd="url(#mf-arrow)" markerStart="url(#mf-arrow)" />
            <line x1={X(m)} y1={yG} x2={X(m)} y2={y} stroke="#94A3B8" strokeDasharray="2 2" />
            <text x={(X(0) + X(m)) / 2} y={y - 7} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#0F172A" {...tp}>{`${lab}m`}</text>
          </g>
        ))}
        <defs>
          <marker id="mf-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#334155" />
          </marker>
        </defs>
      </svg>
    </figure>
  );
}
