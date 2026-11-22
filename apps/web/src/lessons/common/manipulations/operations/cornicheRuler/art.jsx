import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `corniche-ruler` (« مسطرة الكورنيش », thème `corniche`) : le front de mer ensoleillé — ciel, mer, balustrade bleue, palmiers, mouettes, dallage —
 * et les repères (fontaine, banc, lampadaire, kiosque de glaces, arrêt de bus, palmier, kiosque de pêcheurs). Tout est SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici.
 * Les repères sont posés par leur pied (x, y) ; chacun fait ≈ 26 × 44 px.
 */
export const COL = {
  skyTop: '#BAE6FD', skyLow: '#E0F2FE', sea: '#38BDF8', seaDeep: '#0EA5E9', paving: '#E7D9B8', pavingEdge: '#CDBA8E', rail: '#2563EB', railLight: '#93C5FD',
  wood: '#B7791F', woodDark: '#8B5A14', woodLight: '#E7B96B', trunk: '#8B5A2B', palm: '#2F8F5B', flag: '#DC2626', ink: '#0F172A', brass: '#CA8A04', metal: '#64748B', glow: '#FDE68A',
};

export function Backdrop({ W, yRail, yFoot, uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyTop} /><stop offset="1" stopColor={COL.skyLow} /></linearGradient>
        <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sea} /><stop offset="1" stopColor={COL.seaDeep} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={yRail} fill={`url(#${uid}-sky)`} />
      <circle cx={W * 0.86} cy={20} r={11} fill={COL.glow} />
      <rect x={0} y={yRail * 0.42} width={W} height={yRail * 0.58} fill={`url(#${uid}-sea)`} />
      {[0.12, 0.34, 0.58, 0.8].map((f, i) => <path key={i} d={`M${W * f} ${yRail * 0.62 + i * 3} q6 -4 12 0 q6 4 12 0`} stroke="#E0F2FE" strokeWidth={1.5} fill="none" opacity={0.8} />)}
      <path d={`M${W * 0.22} 14 q5 -5 10 0 q5 -5 10 0`} stroke="#475569" strokeWidth={1.4} fill="none" />
      <path d={`M${W * 0.4} 24 q4 -4 8 0 q4 -4 8 0`} stroke="#475569" strokeWidth={1.4} fill="none" />
      {/* la balustrade bleue */}
      <rect x={0} y={yRail} width={W} height={5} fill={COL.rail} />
      {Array.from({ length: Math.floor(W / 18) }, (_, i) => <rect key={i} x={6 + i * 18} y={yRail + 5} width={3} height={yFoot - yRail - 5} fill={COL.railLight} />)}
      {/* le dallage */}
      <rect x={0} y={yFoot} width={W} height={10} fill={COL.paving} />
      <rect x={0} y={yFoot + 10} width={W} height={2} fill={COL.pavingEdge} />
    </g>
  );
}

/** Un repère posé par son pied (x, y). */
export function Landmark({ id, x, y, lit }) {
  const glow = lit ? <ellipse cx={x} cy={y + 2} rx={20} ry={5} fill={COL.glow} opacity={0.85} /> : null;
  switch (id) {
    case 'fountain':
      return (
        <g aria-hidden="true">{glow}
          <path d={`M${x - 15} ${y} h30 l-4 -10 h-22 z`} fill="#94A3B8" />
          <rect x={x - 3} y={y - 26} width={6} height={16} fill="#CBD5E1" />
          <path d={`M${x} ${y - 30} q-12 2 -14 14 M${x} ${y - 30} q12 2 14 14 M${x} ${y - 30} v-6`} stroke="#38BDF8" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <ellipse cx={x} cy={y - 10} rx={17} ry={3} fill="#38BDF8" opacity={0.75} />
        </g>
      );
    case 'bench': case 'bench2':
      return (
        <g aria-hidden="true">{glow}
          <rect x={x - 15} y={y - 18} width={30} height={5} rx={1.5} fill={COL.woodLight} /><rect x={x - 15} y={y - 11} width={30} height={5} rx={1.5} fill={COL.wood} />
          <rect x={x - 13} y={y - 6} width={4} height={6} fill={COL.metal} /><rect x={x + 9} y={y - 6} width={4} height={6} fill={COL.metal} />
        </g>
      );
    case 'lamp':
      return (
        <g aria-hidden="true">{glow}
          <rect x={x - 1.5} y={y - 44} width={3} height={44} fill={COL.metal} />
          <path d={`M${x} ${y - 44} q10 -2 12 6`} stroke={COL.metal} strokeWidth={3} fill="none" /><circle cx={x + 12} cy={y - 36} r={5} fill={COL.glow} stroke={COL.brass} strokeWidth={1.5} />
        </g>
      );
    case 'kiosk': case 'fish':
      return (
        <g aria-hidden="true">{glow}
          <rect x={x - 13} y={y - 24} width={26} height={24} fill={id === 'kiosk' ? '#FCE7F3' : '#E0F2FE'} stroke={COL.metal} strokeWidth={1.2} />
          <path d={`M${x - 16} ${y - 24} h32 l-3 -9 h-26 z`} fill={id === 'kiosk' ? '#EC4899' : '#0EA5E9'} />
          {[-10, -3.5, 3, 9.5].map((dx, i) => <rect key={i} x={x + dx - 1.5} y={y - 33} width={3} height={9} fill="#fff" opacity={0.8} />)}
          <rect x={x - 8} y={y - 16} width={16} height={8} fill="#fff" stroke={COL.metal} strokeWidth={1} />
        </g>
      );
    case 'palm':
      return (
        <g aria-hidden="true">{glow}
          <path d={`M${x - 2} ${y} q-4 -20 0 -38 h4 q-3 18 1 38 z`} fill={COL.trunk} />
          {[-75, -38, 0, 38, 75].map((a) => <path key={a} d={`M${x + 1} ${y - 38} q16 -12 30 2 q-15 -7 -30 -2 z`} fill={COL.palm} transform={`rotate(${a} ${x + 1} ${y - 38})`} />)}
        </g>
      );
    case 'bus':
      return (
        <g aria-hidden="true">{glow}
          <rect x={x - 1.5} y={y - 42} width={3} height={42} fill={COL.metal} />
          <rect x={x - 11} y={y - 44} width={22} height={14} rx={3} fill="#2563EB" /><rect x={x - 7} y={y - 41} width={14} height={4} fill="#fff" opacity={0.9} />
          <rect x={x - 6} y={y - 36} width={12} height={2} fill="#fff" opacity={0.6} />
        </g>
      );
    default: return null;
  }
}

/** Le drapeau rouge « 0 » planté sur la planche. */
export function PinFlag({ x, y, active, locked, label }) {
  return (
    <g aria-hidden="true" data-cr-flag>
      <rect x={x - 1.5} y={y - 30} width={3} height={30} fill="#7F1D1D" />
      <path d={`M${x + 1.5} ${y - 30} h22 l-5 7 l5 7 h-22 z`} fill={COL.flag} stroke="#fff" strokeWidth={1} />
      <text x={x + 12} y={y - 18} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff" direction="ltr">{label}</text>
      <circle cx={x} cy={y} r={active ? 7 : 5.5} fill={locked ? '#94A3B8' : COL.flag} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

/** Un fanion de point (A, B, C, D) au-dessus de la planche. */
export function Pennant({ x, y, text, color, off }) {
  return (
    <g aria-hidden="true" opacity={off ? 0.55 : 1}>
      <rect x={x - 1} y={y - 22} width={2} height={22} fill={COL.metal} />
      <path d={`M${x + 1} ${y - 22} h15 l-4 5.5 l4 5.5 h-15 z`} fill={color} />
      <text x={x + 7} y={y - 12} textAnchor="middle" fontSize={10} fontWeight={900} fill="#fff">{text}</text>
    </g>
  );
}

export function Guide({ x, y, mood, girl }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
