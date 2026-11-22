import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const FLOOR = 214;

/**
 * LA TABLE DU GOÛTER DE L'ÉCOLE (la synthèse de l'unité 5 `wadiya-idmajiya-jumal`, `mission.scene = 'party-table'`, 2026-11-12) — une scène
 * MINCE dessinée en code : la salle de l'école préparée pour la fête (une guirlande aux couleurs du drapeau, sans aucun symbole religieux), une
 * table avec des rangées ÉGALES de briques de jus et de parts de gâteau (la première information du حفل : autant des unes que des autres), un
 * plateau de RESTES à part (la seconde) et deux étiquettes de prix VIERGES — aucun nombre, aucune lettre. Les élèves sont le personnage partagé
 * `KidFigure` : une fille en hijab (tenue islamique) qui porte le plateau, un garçon qui range. Une synthèse n'a rien à gagner (les clés sont
 * à l'élève dès le départ) : la scène est pleine ; `fill` éclaire seulement la guirlande.
 */
export default function PartyTableScene({ fill = 1, label, className = '', scene = 'party-table' }) {
  const f = Math.max(0, Math.min(1, fill));
  const flags = Array.from({ length: 11 }, (_, i) => i);
  const flagColors = ['#16A34A', '#F8FAFC', '#DC2626'];
  const row = [0, 1, 2, 3, 4];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-party-fill={f.toFixed(2)}>
      <rect x="0" y="0" width={W} height={H} fill="#FEF3C7" />
      <rect x="0" y={FLOOR} width={W} height={H - FLOOR} fill="#E7E5E4" />
      <line x1="0" x2={W} y1={FLOOR} y2={FLOOR} stroke="#A8A29E" strokeWidth="2" />
      {/* la guirlande */}
      <g opacity={0.5 + 0.5 * f} data-party-garland>
        <path d={`M10 18 Q${W / 2} 62 ${W - 10} 18`} fill="none" stroke="#92400E" strokeWidth="1.5" />
        {flags.map((i) => {
          const x = 24 + i * 42; const t = (x - 10) / (W - 20); const y = 18 + 88 * t * (1 - t);
          return <path key={i} d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 16} Z`} fill={flagColors[i % 3]} stroke="#78350F" strokeWidth="0.8" />;
        })}
      </g>
      {/* la grande table : deux rangées ÉGALES (cinq briques de jus, cinq parts de gâteau) */}
      <g data-party-table>
        <rect x="40" y="132" width="250" height="10" rx="3" fill="#F8FAFC" stroke="#CBD5E1" />
        <path d="M46 142 L284 142 L276 200 L54 200 Z" fill="#E0F2FE" stroke="#94A3B8" />
        <rect x="70" y="200" width="8" height={FLOOR - 200} fill="#A8A29E" />
        <rect x="252" y="200" width="8" height={FLOOR - 200} fill="#A8A29E" />
        {row.map((i) => (
          <g key={`j${i}`} transform={`translate(${56 + i * 22} 104)`}>
            <rect x="0" y="4" width="14" height="24" rx="1.5" fill="#FB923C" stroke="#9A3412" />
            <circle cx="7" cy="18" r="3.4" fill="#FDE68A" />
            <path d="M10 4 L13 -4" stroke="#0EA5E9" strokeWidth="1.8" />
          </g>
        ))}
        {row.map((i) => (
          <g key={`c${i}`} transform={`translate(${176 + i * 22} 112)`}>
            <path d="M0 20 L18 20 L16 6 L2 6 Z" fill="#FBCFE8" stroke="#9D174D" />
            <rect x="1" y="3" width="16" height="4" rx="2" fill="#F9A8D4" />
            <circle cx="9" cy="1.5" r="2.4" fill="#DC2626" />
          </g>
        ))}
        {/* deux étiquettes de prix VIERGES */}
        {[0, 1].map((i) => (
          <g key={`t${i}`} transform={`translate(${96 + i * 120} 158)`}>
            <path d="M8 0 H52 V24 H8 L0 12 Z" fill="#fff" stroke={i ? '#DB2777' : '#EA580C'} strokeWidth="2.5" />
            <circle cx="9" cy="12" r="2.6" fill={i ? '#DB2777' : '#EA580C'} fillOpacity="0.4" />
          </g>
        ))}
      </g>
      {/* le plateau des RESTES, porté par une fille en hijab */}
      <g data-party-leftovers transform="translate(330 120)">
        <ellipse cx="34" cy="22" rx="38" ry="6" fill="#E2E8F0" stroke="#94A3B8" />
        {[0, 1, 2].map((i) => <rect key={`lj${i}`} x={6 + i * 13} y="0" width="10" height="18" rx="1.2" fill="#FB923C" stroke="#9A3412" />)}
        {[0, 1].map((i) => <path key={`lc${i}`} d={`M${46 + i * 14} 18 L${58 + i * 14} 18 L${57 + i * 14} 8 L${47 + i * 14} 8 Z`} fill="#FBCFE8" stroke="#9D174D" />)}
      </g>
      <KidFigure cx={366} top={FLOOR - 92} foot={FLOOR + 6} hairStyle="hijab" scarf="sand" outfit="green" mood="happy" />
      <KidFigure cx={438} top={FLOOR - 96} foot={FLOOR + 8} outfit="blue" mood="wonder" />
    </svg>
  );
}
