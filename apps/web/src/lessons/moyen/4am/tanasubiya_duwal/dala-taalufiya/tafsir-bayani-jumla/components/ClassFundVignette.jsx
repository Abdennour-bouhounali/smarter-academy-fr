
/**
 * La vignette de la carte d'activité (décor, `aria-hidden`) : la caisse de la classe — une tirelire
 * transparente, des pièces de 100DA (dorées) et de 200DA (argentées) qui y tombent, une guirlande de
 * décoration au-dessus du tableau. Dessinée, jamais générée (CLAUDE.md racine) ; elle ne porte aucune
 * information mathématique (aucun nombre de pièces).
 */
export default function ClassFundVignette() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect width="160" height="90" rx="10" fill="#ECFDF5" />
      <rect x="14" y="12" width="70" height="40" rx="3" fill="#065F46" />
      <path d="M8 10 Q40 22 80 10 T152 10" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
      {[18, 34, 50, 66, 98, 114, 130].map((x, i) => (
        <path key={x} d={`M${x} ${12 + (i % 2) * 3} l5 9 l5 -9 z`} fill={i % 3 === 0 ? '#F43F5E' : i % 3 === 1 ? '#3B82F6' : '#FACC15'} />
      ))}
      <rect x="102" y="38" width="40" height="44" rx="8" fill="#E0F2FE" stroke="#0369A1" strokeWidth="1.5" />
      <rect x="108" y="32" width="28" height="7" rx="2" fill="#0369A1" />
      <rect x="115" y="34" width="14" height="2.6" rx="1" fill="#F8FAFC" />
      {[[112, 74], [124, 74], [118, 69], [130, 69], [112, 64]].map(([x, y], i) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx="6" ry="2.6" fill={i % 2 ? '#CBD5E1' : '#FBBF24'} stroke={i % 2 ? '#64748B' : '#B45309'} strokeWidth="0.8" />
      ))}
      <circle cx="122" cy="20" r="5" fill="#FBBF24" stroke="#B45309" />
      <circle cx="94" cy="26" r="5" fill="#CBD5E1" stroke="#64748B" />
      <path d="M22 44 l10 -12 l10 8 l12 -16" fill="none" stroke="#A7F3D0" strokeWidth="1.5" />
    </svg>
  );
}
