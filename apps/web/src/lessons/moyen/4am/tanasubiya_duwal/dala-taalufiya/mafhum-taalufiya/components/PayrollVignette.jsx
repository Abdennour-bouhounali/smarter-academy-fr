
/**
 * La vignette de la carte d'activité du نشاط 1 : l'atelier — une pointeuse, une horloge, une fiche de
 * paie. DESSINÉE (jamais raster), décorative (`aria-hidden`), sans nombre : elle ne porte aucune réponse.
 */
export default function PayrollVignette() {
  return (
    <svg viewBox="0 0 160 90" width="100%" height="90" aria-hidden="true" focusable="false" data-payroll-vignette>
      <rect x="0" y="0" width="160" height="90" rx="12" fill="#FFFBEB" />
      <rect x="0" y="66" width="160" height="24" fill="#E7E5E4" />
      <rect x="14" y="20" width="34" height="46" rx="4" fill="#78350F" />
      <rect x="19" y="26" width="24" height="10" rx="2" fill="#0F172A" />
      <rect x="24" y="44" width="14" height="18" rx="1" fill="#FDE68A" stroke="#451A03" />
      <g transform="translate(80 30)">
        <circle r="15" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.5" />
        <path d="M0 0 V-10 M0 0 L7 4" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(108 18) rotate(6)">
        <rect width="36" height="48" rx="3" fill="#FFFFFF" stroke="#A8A29E" />
        <rect x="5" y="6" width="26" height="5" fill="#F59E0B" />
        {[18, 25, 32, 39].map((y) => <line key={y} x1="5" x2="31" y1={y} y2={y} stroke="#CBD5E1" strokeWidth="2" />)}
      </g>
      <circle cx="62" cy="58" r="6" fill="#F2C9A0" />
      <path d="M54 76 Q62 62 70 76 Z" fill="#2563EB" />
    </svg>
  );
}
