
/**
 * La vignette de la carte d'activité du module 1 : une زربية de وادي سوف posée
 * au sol (le manuel, p. 28, en montre la photo). DESSINÉE, jamais raster
 * (CLAUDE.md) ; DÉCORATIVE au sens strict (LESSON_DEVELOPMENT_GUIDE §4bis) :
 * elle ne porte aucune mesure — les dimensions sont ce que l'élève cherche.
 * Le tapis est deux fois plus long que large, comme dans l'énoncé.
 */
const DIAMONDS = [40, 60, 80, 100, 120];

export default function CarpetScene({ className = '' }) {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} aria-hidden="true" focusable="false">
      <rect width="160" height="90" fill="#FEF3C7" />
      {/* le parquet de la غرفة الاستقبال */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1="0" y1={12 + i * 14} x2="160" y2={12 + i * 14} stroke="#FDE68A" strokeWidth="1" />
      ))}
      {/* les franges */}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} stroke="#B45309" strokeWidth=".8">
          <line x1="20" y1={24 + i * 3.8} x2="15" y2={24 + i * 3.8} />
          <line x1="140" y1={24 + i * 3.8} x2="145" y2={24 + i * 3.8} />
        </g>
      ))}
      {/* le tapis : 120 × 60, deux fois plus long que large */}
      <rect x="20" y="15" width="120" height="60" rx="1.5" fill="#7F1D1D" stroke="#451A03" strokeWidth="1.2" />
      <rect x="25" y="20" width="110" height="50" fill="none" stroke="#FCD34D" strokeWidth="1" strokeDasharray="2 1.5" />
      <rect x="29" y="24" width="102" height="42" fill="#991B1B" stroke="#F59E0B" strokeWidth=".8" />
      {DIAMONDS.map((cx, i) => (
        <g key={cx}>
          <path d={`M${cx} 29 L${cx + 9} 45 L${cx} 61 L${cx - 9} 45 Z`} fill={i % 2 ? '#78350F' : '#B91C1C'} stroke="#FDE68A" strokeWidth=".9" />
          <path d={`M${cx - 4} 45 L${cx + 4} 45 M${cx} 41 L${cx} 49`} stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
