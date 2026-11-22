import KidFigure from '../manipulations/primitives/KidFigure';

/**
 * LA SCÈNE « شبّاك المتحف » (unité 5 leçon 3 `mushkilat-jumla`, `mission.scene = 'museum-desk'` ; conseil du 2026-11-11, verdict L3.16 et X8).
 * La façade d'un musée (fronton, quatre colonnes, la lampe du hall), le guichet avec deux étiquettes de prix VIERGES (aucun nombre), un tourniquet,
 * et le CAHIER DU GARDIEN posé sur le comptoir : à chaque outil gagné (`fill` 0 → 1) une page de plus se remplit de lignes (jamais un chiffre) ;
 * à 1 la lampe du hall s'allume. Les visiteurs sont le personnage partagé `KidFigure` : une fille en hijab qui tient la main de son petit frère, et
 * UN adulte (le même `KidFigure` à 1,25 × la taille du plus grand enfant, en tunique, teal — comme FamilyHeightsScene). Exposés : une jarre, un
 * tapis au mur, une pièce ancienne — aucune statue, aucune image de personne ni d'animal. Dessiné en code, `aria-hidden` sans `label`.
 */
export default function MuseumDeskScene({ fill = 0, label, className = '', scene = 'museum-desk' }) {
  const f = Math.max(0, Math.min(1, fill));
  const pages = Math.round(f * 3);
  const FLOOR = 232;
  return (
    <svg viewBox="0 0 480 260" className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={fill}>
      <rect x="0" y="0" width="480" height="260" fill="#F5F0E6" />
      {/* la façade : fronton, colonnes, la lampe du hall */}
      <path d="M150 58 L300 14 L450 58 Z" fill="#E7E5E4" stroke="#78716C" strokeWidth="2.5" />
      <rect x="156" y="58" width="288" height="10" fill="#D6D3D1" stroke="#A8A29E" />
      {[176, 236, 356, 416].map((x) => <rect key={x} x={x} y="68" width="16" height={FLOOR - 74} fill="#FAFAF9" stroke="#A8A29E" />)}
      <circle cx="300" cy="40" r="7" fill="#FDE047" opacity={f >= 1 ? 1 : 0.35} data-museum-lamp={f >= 1 ? 'on' : 'off'} />
      {/* les exposés entre les colonnes : un tapis au mur, une jarre, une pièce ancienne */}
      <g transform="translate(250 80)">
        <rect x="0" y="0" width="62" height="44" rx="2" fill="#B91C1C" />
        <rect x="5" y="5" width="52" height="34" fill="none" stroke="#FDE68A" strokeWidth="2" />
        <path d="M31 9 L49 22 L31 35 L13 22 Z" fill="#FDE68A" />
        {[6, 14, 22, 30, 38, 46, 54].map((x) => <line key={x} x1={x + 2} x2={x + 2} y1="44" y2="50" stroke="#B91C1C" strokeWidth="1.5" />)}
      </g>
      <g transform="translate(262 150)">
        <rect x="-10" y="58" width="44" height="22" fill="#D6D3D1" />
        <path d="M2 58 Q-6 34 6 22 L8 12 L18 12 L20 22 Q32 34 24 58 Z" fill="#C2410C" stroke="#7C2D12" strokeWidth="1.5" />
        <path d="M2 36 H24" stroke="#FDBA74" strokeWidth="2" />
      </g>
      <g transform="translate(305 186)">
        <rect x="-4" y="22" width="34" height="24" fill="#D6D3D1" />
        <circle cx="13" cy="12" r="11" fill="#CA8A04" stroke="#854D0E" strokeWidth="2" />
        <circle cx="13" cy="12" r="5" fill="none" stroke="#854D0E" strokeWidth="1.2" />
      </g>
      {/* le sol */}
      <rect x="0" y={FLOOR} width="480" height="28" fill="#D6D3D1" />
      <line x1="0" x2="480" y1={FLOOR} y2={FLOOR} stroke="#A8A29E" strokeWidth="2" />
      {/* le guichet : deux étiquettes de prix VIERGES, le comptoir, le cahier du gardien */}
      <g data-museum-desk>
        <rect x="20" y="96" width="122" height="70" rx="6" fill="#0F766E" />
        <rect x="28" y="104" width="106" height="44" rx="4" fill="#CCFBF1" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${36 + i * 50} 112)`}>
            <path d="M8 0 H42 V26 H8 L0 13 Z" fill="#fff" stroke={i ? '#E11D48' : '#2563EB'} strokeWidth="2.5" />
            <circle cx="9" cy="13" r="2.5" fill={i ? '#E11D48' : '#2563EB'} fillOpacity="0.4" />
          </g>
        ))}
        <rect x="14" y="166" width="134" height="66" fill="#A16207" />
        <rect x="14" y="162" width="134" height="8" rx="2" fill="#854D0E" />
        {/* le cahier : une page de plus à chaque outil gagné, des lignes et aucun chiffre */}
        <g transform="translate(40 136)" data-museum-notebook={pages}>
          <rect x="0" y="0" width="34" height="26" rx="2" fill="#FEF9C3" stroke="#A16207" strokeWidth="1.5" />
          <rect x="34" y="0" width="34" height="26" rx="2" fill={pages > 0 ? '#FEF9C3' : '#E5E7EB'} stroke="#A16207" strokeWidth="1.5" />
          {Array.from({ length: Math.min(3, pages + 1) }, (_, i) => (
            <g key={i}>
              <line x1="5" x2="29" y1={7 + i * 6} y2={7 + i * 6} stroke="#64748B" strokeWidth="1.4" />
              {pages > 0 && <line x1="39" x2={63 - (i === pages - 1 ? 8 : 0)} y1={7 + i * 6} y2={7 + i * 6} stroke="#64748B" strokeWidth="1.4" />}
            </g>
          ))}
        </g>
      </g>
      {/* le tourniquet */}
      <g transform="translate(160 186)">
        <rect x="8" y="0" width="10" height="46" rx="3" fill="#94A3B8" />
        <rect x="-4" y="44" width="34" height="4" rx="2" fill="#64748B" />
        {[0, 120, 240].map((a) => <rect key={a} x="13" y="6" width="22" height="3.5" rx="1.5" fill="#0F766E" transform={`rotate(${a} 13 8)`} />)}
        <circle cx="13" cy="8" r="4" fill="#334155" />
      </g>
      {/* les visiteurs : l'adulte (1,25 × la plus grande enfant), la grande sœur en hijab et son petit frère, la main dans la main */}
      <KidFigure cx={410} top={FLOOR - 162} foot={FLOOR} outfit="teal" hair="black" tunic mood={f >= 1 ? 'proud' : 'happy'} data-museum-visitor="adult" />
      <line x1="353" x2="371" y1={FLOOR - 64} y2={FLOOR - 56} stroke="#E0B48A" strokeWidth="4" strokeLinecap="round" />
      <KidFigure cx={340} top={FLOOR - 130} foot={FLOOR} outfit="pink" hair="brown" hairStyle="hijab" tunic scarf="lavender" mood="happy" data-museum-visitor="sister" />
      <KidFigure cx={380} top={FLOOR - 98} foot={FLOOR} outfit="orange" hair="chestnut" mood={f > 0 ? 'happy' : 'wonder'} data-museum-visitor="brother" />
    </svg>
  );
}
