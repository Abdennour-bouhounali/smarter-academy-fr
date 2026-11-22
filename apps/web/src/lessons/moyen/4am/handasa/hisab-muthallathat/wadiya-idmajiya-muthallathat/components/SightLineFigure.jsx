
/**
 * « الشكل » de la وضعية (p. 124) : le monument (à gauche), le poteau électrique, l'observateur (à droite), la ligne
 * de visée en pointillé qui passe par le sommet du poteau et touche le sommet du monument, les deux distances au sol
 * et l'angle x au pied de l'observateur (la figure du manuel néglige sa taille). AUCUNE réponse : la hauteur du
 * monument est un « ? », l'angle un « x ». Comme le manuel, le dessin n'est PAS à l'échelle (95,65 m contre 2,45 m
 * écraseraient le poteau) : il garde seulement l'alignement Q–S.
 *
 * Props : `pole`, `poleAt`, `d` — écrits comme le manuel (« 2,30 ») ; `landmark` = 'maqam' (مقام الشهيد) ou
 * 'minaret' (la minaret de جامع الجزائر, le test) ; `label` = aria-label (sinon construit).
 */
const W = 360; const YG = 168; const XM = 70; const XP = 250; const XA = 322; const YT = 22;

export default function SightLineFigure({ pole = '2,30', poleAt = '95,65', d = '2,45', landmark = 'maqam', label }) {
  const yQ = YG - (YG - YT) * ((XA - XP) / (XA - XM));
  const tp = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const name = landmark === 'minaret' ? 'مئذنة جامع الجزائر' : 'مقام الشهيد';
  const aria = label ?? `${name} ارتفاعه مجهول، وعمود شاقولي طوله ${pole} m على بعد ${poleAt} m من قاعدته، والملاحظ على بعد ${d} m من العمود؛ خط النظر يمرّ بقمة العمود ويصل القمة؛ x الزاوية بين الأرض وخط النظر عند الملاحظ`;
  return (
    <figure className="mx-auto w-full max-w-md rounded-xl border-2 border-slate-200 bg-white p-2" data-figure="sight-line" data-landmark={landmark}>
      <svg viewBox={`0 0 ${W} 214`} className="h-auto w-full" style={{ direction: 'ltr' }} role="img" aria-label={aria}>
        <defs>
          <linearGradient id="slf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0F2FE" /><stop offset="1" stopColor="#F8FAFC" /></linearGradient>
          <marker id="slf-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#334155" />
          </marker>
        </defs>
        <rect x={0} y={0} width={W} height={YG} fill="url(#slf-sky)" />
        {landmark === 'minaret' ? (
          <g aria-hidden="true">
            <rect x={XM - 9} y={YT + 18} width={18} height={YG - YT - 18} fill="#F8FAFC" stroke="#64748B" strokeWidth={1.2} />
            {[0.25, 0.45, 0.65, 0.85].map((f) => <line key={f} x1={XM - 9} x2={XM + 9} y1={YT + 18 + f * (YG - YT - 18)} y2={YT + 18 + f * (YG - YT - 18)} stroke="#CBD5E1" />)}
            <rect x={XM - 12} y={YT + 12} width={24} height={8} fill="#E2E8F0" stroke="#64748B" />
            <rect x={XM - 6} y={YT + 2} width={12} height={10} fill="#F1F5F9" stroke="#64748B" />
            <line x1={XM} y1={YT} x2={XM} y2={YT + 2} stroke="#64748B" strokeWidth={2} />
          </g>
        ) : (
          <g aria-hidden="true">
            {/* les trois palmes de مقام الشهيد, jointes sous la coupole ; le socle */}
            <rect x={XM - 40} y={YG - 14} width={80} height={14} fill="#CBD5E1" stroke="#64748B" />
            {[-1, 0, 1].map((s) => (
              <path key={s}
                d={`M${XM + s * 30} ${YG - 14} C ${XM + s * 26} ${YG - 70}, ${XM + s * 8} ${YT + 50}, ${XM + s * 2} ${YT} L ${XM + s * 10} ${YT + 30} C ${XM + s * 14} ${YT + 70}, ${XM + s * 30} ${YG - 60}, ${XM + s * 40 - (s === 0 ? 10 : 0)} ${YG - 14} Z`}
                fill={s === 0 ? '#E2E8F0' : '#F1F5F9'} stroke="#64748B" strokeWidth={1.2} />
            ))}
            <ellipse cx={XM} cy={YT + 58} rx={9} ry={5} fill="#94A3B8" />
          </g>
        )}
        {/* la hauteur inconnue */}
        <line x1={XM - 46} y1={YT} x2={XM - 46} y2={YG} stroke="#334155" strokeDasharray="4 3" markerStart="url(#slf-arrow)" markerEnd="url(#slf-arrow)" />
        <text x={XM - 52} y={(YT + YG) / 2} textAnchor="end" fontSize={15} fontWeight="bold" fill="#334155" {...tp}>?</text>
        {/* la ligne de visée */}
        <line x1={XA} y1={YG} x2={XM} y2={YT} stroke="#D97706" strokeWidth={1.8} strokeDasharray="6 4" />
        {/* le poteau électrique */}
        <rect x={XP - 2} y={yQ} width={4} height={YG - yQ} fill="#475569" />
        <line x1={XP - 7} y1={yQ + 5} x2={XP + 7} y2={yQ + 5} stroke="#475569" strokeWidth={2} />
        <path d={`M${XP} ${YG - 9} h 9 v 9`} fill="none" stroke="#334155" />
        <text x={XP + 8} y={(yQ + YG) / 2} fontSize={11} fontWeight="bold" fill="#0F172A" {...tp}>{`${pole}m`}</text>
        {/* l'observateur */}
        <g aria-hidden="true" stroke="#0F766E" strokeWidth={2} fill="none">
          <circle cx={XA + 10} cy={YG - 34} r={5} />
          <line x1={XA + 10} y1={YG - 29} x2={XA + 10} y2={YG - 13} />
          <line x1={XA + 10} y1={YG - 13} x2={XA + 4} y2={YG} />
          <line x1={XA + 10} y1={YG - 13} x2={XA + 16} y2={YG} />
          <line x1={XA + 3} y1={YG - 24} x2={XA + 17} y2={YG - 22} />
        </g>
        {/* l'angle x */}
        <path d={`M${XA - 26} ${YG} A 26 26 0 0 1 ${XA - 26 * Math.cos(Math.atan((YG - YT) / (XA - XM)))} ${YG - 26 * Math.sin(Math.atan((YG - YT) / (XA - XM)))}`} fill="none" stroke="#B45309" strokeWidth={1.5} />
        <text x={XA - 36} y={YG - 6} fontSize={13} fontStyle="italic" fontWeight="bold" fill="#B45309" {...tp}>x</text>
        {/* le sol et les distances */}
        <line x1={6} y1={YG} x2={W - 6} y2={YG} stroke="#92400E" strokeWidth={2} />
        {[[XM, XP, poleAt], [XP, XA, d]].map(([a, b, lab]) => (
          <g key={lab}>
            <line x1={a} y1={186} x2={b} y2={186} stroke="#334155" markerStart="url(#slf-arrow)" markerEnd="url(#slf-arrow)" />
            <text x={(a + b) / 2} y={204} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#0F172A" {...tp}>{`${lab}m`}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
