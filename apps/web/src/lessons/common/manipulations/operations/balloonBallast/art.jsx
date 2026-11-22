import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `balloon-ballast` (« أكياس المنطاد », thème `balloonvalley`) : le plateau de grès du Tassili (arches, cyprès sahariens), le canyon, l'échelle d'altitude,
 * le montgolfière (enveloppe rayée, nacelle d'osier), les flammes (+1) et les sacs de sable (−1). Tout est SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici.
 */
const COL = {
  skyTop: '#FDE68A', skyLow: '#FEF3C7', rock: '#C2713A', rockDark: '#9A4F24', rockLight: '#E39A5E', canyon: '#7C3A1B', tree: '#3F7D4E', ink: '#0F172A',
  flame: '#F97316', flameCore: '#FDE047', sack: '#92612B', sackDark: '#6B4420', basket: '#B7791F', basketDark: '#8B5A14', glow: '#FDE68A', rope: '#475569',
};

export function Backdrop({ W, H, y0, uid }) {
  const plate = Math.max(54, W * 0.17);
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyTop} /><stop offset="1" stopColor={COL.skyLow} /></linearGradient>
        <linearGradient id={`${uid}-can`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.rockLight} stopOpacity="0.35" /><stop offset="1" stopColor={COL.canyon} stopOpacity="0.55" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-sky)`} />
      <circle cx={W * 0.8} cy={26} r={13} fill="#FDBA74" opacity="0.9" />
      {/* le canyon sous le zéro */}
      <rect x={0} y={y0} width={W} height={H - y0} fill={`url(#${uid}-can)`} />
      {/* le plateau (bord = ligne 0) */}
      <path d={`M0 ${y0} H${plate} V${H} H0 Z`} fill={COL.rock} />
      <path d={`M0 ${y0} H${plate} V${y0 + 8} H0 Z`} fill={COL.rockLight} />
      {[0.22, 0.45, 0.7].map((f, i) => <path key={i} d={`M${plate * 0.1} ${y0 + (H - y0) * f} h${plate * 0.8}`} stroke={COL.rockDark} strokeWidth={1.2} opacity="0.5" />)}
      <path d={`M${plate * 0.18} ${y0 + 22} v-10 a${plate * 0.14} ${plate * 0.14} 0 0 1 ${plate * 0.28} 0 v10`} fill={COL.canyon} opacity="0.55" />
      {/* un cyprès saharien sur le plateau */}
      <path d={`M${plate * 0.72} ${y0} q-6 -16 0 -34 q6 18 0 34 z`} fill={COL.tree} />
      <path d={`M${plate * 0.4} ${y0} q-5 -12 0 -26 q5 14 0 26 z`} fill={COL.tree} opacity="0.85" />
      {/* la ligne 0 : le bord du plateau prolongé */}
      <line x1={plate} x2={W - 36} y1={y0} y2={y0} stroke="#B91C1C" strokeWidth={1.6} strokeDasharray="6 4" />
    </g>
  );
}

/** L'échelle d'altitude (−12 … +12 m) à droite : un repère tous les 2 m, un nombre tous les 4 m. */
export function AltitudeScale({ x, y0, u }) {
  return (
    <g aria-hidden="true" direction="ltr">
      <line x1={x} x2={x} y1={y0 - 12 * u} y2={y0 + 12 * u} stroke={COL.rockDark} strokeWidth={1.6} />
      {Array.from({ length: 13 }, (_, i) => i * 2 - 12).map((m) => (
        <g key={m}>
          <line x1={x - (m % 4 === 0 ? 7 : 4)} x2={x} y1={y0 - m * u} y2={y0 - m * u} stroke={COL.rockDark} strokeWidth={m === 0 ? 2.4 : 1.4} />
          {m % 4 === 0 && <text x={x + 5} y={y0 - m * u + 3.5} fontSize={10} fontWeight={800} fill="#334155">{m === 0 ? '0' : String(m).replace('-', '−')}</text>}
        </g>
      ))}
    </g>
  );
}

/** Une flamme orange (+1) centrée en (x, y), rayon r. */
export function Flame({ x, y, r = 5, lit }) {
  return (
    <g aria-hidden="true">
      {lit && <circle cx={x} cy={y} r={r + 3} fill={COL.glow} opacity="0.9" />}
      <path d={`M${x} ${y - r * 1.5} q${r * 1.2} ${r * 1.1} ${r * 0.9} ${r * 2} a${r} ${r} 0 0 1 ${-r * 1.8} 0 q${-r * 0.3} ${-r * 0.9} ${r * 0.9} ${-r * 2} z`} fill={COL.flame} stroke="#C2410C" strokeWidth={0.8} />
      <circle cx={x} cy={y + r * 0.35} r={r * 0.4} fill={COL.flameCore} />
    </g>
  );
}

/** Un sac de sable brun (−1) centré en (x, y), rayon r. */
export function Sack({ x, y, r = 5, lit }) {
  return (
    <g aria-hidden="true">
      {lit && <circle cx={x} cy={y} r={r + 3} fill={COL.glow} opacity="0.9" />}
      <path d={`M${x - r * 0.45} ${y - r * 1.3} h${r * 0.9} l${r * 0.4} ${r * 0.5} q${r * 0.9} ${r * 0.5} ${r * 0.6} ${r * 1.5} q${-r * 0.2} ${r * 0.5} ${-r * 1.5} ${r * 0.5} h${-r * 0.9} q${-r * 1.3} 0 ${-r * 1.5} ${-r * 0.5} q${-r * 0.3} ${-r} ${r * 0.6} ${-r * 1.5} z`} fill={COL.sack} stroke={COL.sackDark} strokeWidth={0.8} />
      <line x1={x - r * 0.45} x2={x + r * 0.45} y1={y - r * 0.85} y2={y - r * 0.85} stroke={COL.sackDark} strokeWidth={1.2} />
    </g>
  );
}

/** Le montgolfière : nacelle dont le BAS est en (x, yBase) ; l'enveloppe est au-dessus. */
export function Balloon({ x, yBase, dim, ghost, mood, label }) {
  const bw = 30; const bh = 13; const er = 19;
  const top = yBase - bh;
  const c = ghost ? '#B45309' : '#DC2626';
  return (
    <g aria-hidden="true" opacity={dim ? 0.55 : 1} data-bb-balloon-art={ghost ? 'ghost' : 'real'}>
      <path d={`M${x - er} ${top - er * 1.15} a${er} ${er * 1.2} 0 0 1 ${er * 2} 0 q0 ${er * 0.8} ${-er * 0.6} ${er * 1.35} h${-er * 0.8} q${-er * 0.6} ${-er * 0.55} ${-er * 0.6} ${-er * 1.35} z`} fill={ghost ? 'none' : c} stroke={ghost ? c : '#7F1D1D'} strokeWidth={ghost ? 2 : 1.2} strokeDasharray={ghost ? '5 3' : undefined} />
      {!ghost && <path d={`M${x} ${top - er * 2.35} q${-er * 0.55} ${er * 1.1} ${-er * 0.1} ${er * 2.2} M${x} ${top - er * 2.35} q${er * 0.55} ${er * 1.1} ${er * 0.1} ${er * 2.2}`} stroke="#FEF3C7" strokeWidth={5} fill="none" opacity="0.9" />}
      {!ghost && <path d={`M${x - 6} ${top - er * 0.2} L${x - bw / 2 + 3} ${top} M${x + 6} ${top - er * 0.2} L${x + bw / 2 - 3} ${top}`} stroke={COL.rope} strokeWidth={1.2} />}
      <rect x={x - bw / 2} y={top} width={bw} height={bh} rx={3} fill={ghost ? 'none' : COL.basket} stroke={ghost ? c : COL.basketDark} strokeWidth={ghost ? 2 : 1.4} strokeDasharray={ghost ? '5 3' : undefined} />
      {!ghost && [-9, 0, 9].map((dx) => <line key={dx} x1={x + dx} x2={x + dx} y1={top + 1} y2={yBase - 1} stroke={COL.basketDark} strokeWidth={1} opacity="0.7" />)}
      {ghost && <text x={x} y={top - er * 0.9} textAnchor="middle" fontSize={20} fontWeight={900} fill={c}>؟</text>}
      {label}
      {mood ? null : null}
    </g>
  );
}

export function Guide({ x, y, mood, girl }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
