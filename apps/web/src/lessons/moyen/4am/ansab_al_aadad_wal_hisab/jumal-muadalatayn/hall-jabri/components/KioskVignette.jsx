
/**
 * La vignette de la carte d'activité (MissionBrief.visual) : le kiosque du quartier, son
 * auvent rayé, un plateau de كرنتيكة et des bouteilles de gazouz, et les deux cartes du vendeur
 * posées sur le comptoir. DÉCORATIVE (`aria-hidden`), dessinée en SVG — le même kiosque que le
 * laboratoire au-dessous ; aucun nombre n'y figure (les cartes se lisent dans le texte).
 */
export default function KioskVignette({ className = '' }) {
  return (
    <svg viewBox="0 0 200 110" className={`h-24 w-auto ${className}`} aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="200" height="110" rx="12" fill="#FFF7ED" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={10 + i * 18} y="10" width="18" height="16" fill={i % 2 ? '#FFFFFF' : '#DC2626'} />)}
      <path d="M10 26 Q19 32 28 26 Q37 32 46 26 Q55 32 64 26 Q73 32 82 26 Q91 32 100 26 Q109 32 118 26 Q127 32 136 26 Q145 32 154 26 Q163 32 172 26 Q181 32 190 26" fill="none" stroke="#B91C1C" strokeWidth="2" />
      <rect x="14" y="26" width="6" height="56" fill="#78350F" />
      <rect x="180" y="26" width="6" height="56" fill="#78350F" />
      <rect x="8" y="80" width="184" height="22" rx="3" fill="#92400E" />
      <rect x="8" y="78" width="184" height="5" rx="2" fill="#B45309" />
      {/* plateau de كرنتيكة */}
      <rect x="30" y="64" width="54" height="13" rx="2" fill="#FDE68A" stroke="#B45309" />
      {[1, 2, 3].map((i) => <line key={i} x1={30 + i * 13.5} y1="64" x2={30 + i * 13.5} y2="77" stroke="#D97706" />)}
      {/* bouteilles de gazouz */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${96 + i * 13} 46)`}>
          <rect x="3" y="0" width="5" height="5" rx="1" fill={['#16A34A', '#F97316', '#16A34A'][i]} />
          <path d="M2 5 L9 5 L11 10 L11 31 L0 31 L0 10 Z" fill={['#86EFAC', '#FDBA74', '#86EFAC'][i]} stroke={['#15803D', '#C2410C', '#15803D'][i]} />
          <rect x="0" y="15" width="11" height="6" fill="#FFFFFF" opacity="0.85" />
        </g>
      ))}
      {/* les deux cartes du vendeur */}
      <g transform="rotate(-6 150 68)"><rect x="136" y="56" width="34" height="22" rx="3" fill="#FFFFFF" stroke="#334155" /><rect x="141" y="62" width="10" height="7" rx="1.5" fill="#FBBF24" /><rect x="153" y="62" width="10" height="7" rx="1.5" fill="#2DD4BF" /></g>
      <g transform="rotate(5 168 74)"><rect x="152" y="62" width="34" height="22" rx="3" fill="#FFFFFF" stroke="#334155" /><rect x="157" y="68" width="10" height="7" rx="1.5" fill="#FBBF24" /><rect x="169" y="68" width="10" height="7" rx="1.5" fill="#FFE4E6" stroke="#F43F5E" strokeDasharray="2 1" /></g>
    </svg>
  );
}
