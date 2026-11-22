
/**
 * LE MONDE DESSINÉ du labo `power-train` (thème `railway`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Une locomotive qui part en portant 1, des wagons « × a » (ambre) et « ÷ a » (bleu ciel) avec leur plaque, des roues, des
 * attelages, la voie et le décor de la gare. Le dessin EST l'argument : un wagon = un facteur a (ou un diviseur a), compté.
 * Toutes les longueurs viennent de `w` / `h` (taille d'une place sur le rail) : rien n'est en pixels fixes.
 */

const WAGON = {
  times: { body: '#F59E0B', top: '#FCD34D', edge: '#B45309', roof: '#92400E', plate: '#FFFBEB', ink: '#7C2D12' },
  divide: { body: '#38BDF8', top: '#BAE6FD', edge: '#0369A1', roof: '#075985', plate: '#F0F9FF', ink: '#0C4A6E' },
};

const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
const FONT = 'ui-sans-serif, system-ui, sans-serif';

/** Les gradients d'une scène (ids uniques par instance : un workspace monte deux niveaux). */
export function TrainDefs({ uid }) {
  return (
    <defs>
      <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E0F2FE" />
        <stop offset="1" stopColor="#F5F3FF" />
      </linearGradient>
      <linearGradient id={`${uid}-loco`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#818CF8" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
      <linearGradient id={`${uid}-times`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={WAGON.times.top} />
        <stop offset="1" stopColor={WAGON.times.body} />
      </linearGradient>
      <linearGradient id={`${uid}-divide`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={WAGON.divide.top} />
        <stop offset="1" stopColor={WAGON.divide.body} />
      </linearGradient>
      <radialGradient id={`${uid}-knob`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FEF9C3" />
        <stop offset="1" stopColor="#FACC15" />
      </radialGradient>
    </defs>
  );
}

/** Le décor : ciel, collines, la voie (traverses + deux rails) sur toute la largeur. `railY` = haut des rails. */
export function Backdrop({ uid, width, height, railY }) {
  const sleepers = [];
  for (let x = 6; x < width; x += 18) sleepers.push(<rect key={x} x={x} y={railY - 1} width={9} height={8} rx={1.5} fill="#A16207" opacity={0.45} />);
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={width} height={height} rx={18} fill={`url(#${uid}-sky)`} />
      <path d={`M0 ${railY - 34} Q ${width * 0.18} ${railY - 70} ${width * 0.38} ${railY - 40} T ${width * 0.75} ${railY - 46} T ${width} ${railY - 38} L ${width} ${railY} L 0 ${railY} Z`} fill="#DCFCE7" opacity={0.9} />
      <path d={`M0 ${railY - 16} Q ${width * 0.3} ${railY - 40} ${width * 0.55} ${railY - 18} T ${width} ${railY - 22} L ${width} ${railY} L 0 ${railY} Z`} fill="#BBF7D0" opacity={0.85} />
      {sleepers}
      <rect x={0} y={railY} width={width} height={3} rx={1.5} fill="#64748B" />
      <rect x={0} y={railY + 4} width={width} height={2} rx={1} fill="#94A3B8" />
    </g>
  );
}

/** Deux roues sous une caisse (bas de caisse `y`), centre `cx`, largeur de caisse `w`. */
function Wheels({ cx, y, w, r, color = '#334155' }) {
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={cx + s * w * 0.28} cy={y + r} r={r} fill={color} />
          <circle cx={cx + s * w * 0.28} cy={y + r} r={r * 0.42} fill="#CBD5E1" />
        </g>
      ))}
    </g>
  );
}

/**
 * La locomotive (une place de rail : centre `cx`, largeur de place `w`, caisse de hauteur `h`, bas de caisse `y`) : une
 * cabine, une cheminée qui fume, une plaque « 1 » (ce qu'elle porte au départ). `glow` : le train porte la charge voulue.
 */
export function Locomotive({ uid, cx, y, w, h, glow = false, plate = '1', ...rest }) {
  const bw = w * 0.9;
  const x0 = cx - bw / 2;
  const r = Math.max(4, h * 0.14);
  return (
    <g {...rest}>
      <ellipse cx={cx} cy={y + 2 * r + 2} rx={bw * 0.55} ry={3} fill="#1E1B4B" opacity={0.12} />
      {/* fumée */}
      <g opacity={0.55}>
        <circle cx={x0 + bw * 0.22} cy={y - h - h * 0.42} r={h * 0.12} fill="#E2E8F0" />
        <circle cx={x0 + bw * 0.12} cy={y - h - h * 0.62} r={h * 0.09} fill="#F1F5F9" />
      </g>
      {/* cheminée */}
      <rect x={x0 + bw * 0.15} y={y - h - h * 0.28} width={bw * 0.16} height={h * 0.34} rx={2} fill="#312E81" />
      {/* caisse */}
      <rect x={x0} y={y - h * 0.72} width={bw} height={h * 0.72} rx={h * 0.16} fill={`url(#${uid}-loco)`} stroke="#312E81" strokeWidth={1.6} />
      {/* cabine */}
      <rect x={x0 + bw * 0.46} y={y - h} width={bw * 0.5} height={h * 0.42} rx={h * 0.1} fill="#6366F1" stroke="#312E81" strokeWidth={1.6} />
      <rect x={x0 + bw * 0.55} y={y - h * 0.92} width={bw * 0.32} height={h * 0.24} rx={3} fill="#E0E7FF" />
      {/* plaque : la charge de départ */}
      <rect x={x0 + bw * 0.1} y={y - h * 0.58} width={bw * 0.42} height={h * 0.4} rx={h * 0.08}
        fill={glow ? '#ECFDF5' : '#FFFFFF'} stroke={glow ? '#10B981' : '#C7D2FE'} strokeWidth={glow ? 2.4 : 1.4} />
      <text x={x0 + bw * 0.31} y={y - h * 0.27} textAnchor="middle" fontSize={Math.max(11, h * 0.3)} fontWeight={900} fill="#312E81" fontFamily={FONT} style={LTR}>{plate}</text>
      {/* lanterne */}
      <circle cx={x0 + bw - 3} cy={y - h * 0.3} r={Math.max(2.5, h * 0.07)} fill={glow ? '#34D399' : '#FDE68A'} stroke="#312E81" strokeWidth={1} />
      <Wheels cx={cx} y={y} w={bw} r={r} color="#1E1B4B" />
    </g>
  );
}

/**
 * Un wagon : `kind` 'times' | 'divide', sa plaque `label` (« × (−2) »), centre `cx`, largeur de place `w`, hauteur `h`,
 * bas de caisse `y`. `faded` : un wagon annulé (attelage × / ÷), en pointillé. `fresh` : vient d'être attelé (il glisse).
 */
export function Wagon({ uid, kind, label, cx, y, w, h, faded = false, fresh = false, ...rest }) {
  const C = WAGON[kind];
  const bw = w * 0.84;
  const x0 = cx - bw / 2;
  const r = Math.max(3.5, h * 0.13);
  const fs = Math.max(10, Math.min(16, w * 0.22));
  return (
    <g className={fresh ? 'pt-wagon-in' : undefined} opacity={faded ? 0.42 : 1} {...rest}>
      {/* attelage vers la place voisine (côté locomotive) */}
      <rect x={cx - w / 2 - 1} y={y - h * 0.24} width={w * 0.1 + 2} height={3} rx={1.5} fill="#475569" />
      <rect x={cx + bw / 2 - 1} y={y - h * 0.24} width={w * 0.1 + 2} height={3} rx={1.5} fill="#475569" />
      <rect x={x0} y={y - h} width={bw} height={h} rx={h * 0.14} fill={faded ? '#FFFFFF' : `url(#${uid}-${kind})`}
        stroke={C.edge} strokeWidth={1.6} strokeDasharray={faded ? '4 3' : undefined} />
      <rect x={x0 + 2} y={y - h} width={bw - 4} height={h * 0.16} rx={h * 0.08} fill={C.roof} opacity={faded ? 0.3 : 0.85} />
      <rect x={x0 + bw * 0.1} y={y - h * 0.72} width={bw * 0.8} height={h * 0.46} rx={h * 0.1} fill={C.plate} stroke={C.edge} strokeWidth={1} />
      <text x={cx} y={y - h * 0.4} textAnchor="middle" fontSize={fs} fontWeight={900} fill={C.ink} fontFamily={FONT} style={LTR}>{label}</text>
      {!faded && <Wheels cx={cx} y={y} w={bw} r={r} />}
    </g>
  );
}

/** La poignée de queue : un gros bouton rond jaune à saisir (≥ 44 px), deux traits de prise. */
export function Knob({ uid, cx, cy, r = 22, active = false, ...rest }) {
  return (
    <g {...rest}>
      <circle cx={cx} cy={cy + 2.5} r={r} fill="#1E1B4B" opacity={0.15} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-knob)`} stroke="#A16207" strokeWidth={active ? 3.5 : 2.5} />
      <path d={`M${cx - r * 0.42} ${cy - r * 0.3} L${cx - r * 0.42} ${cy + r * 0.3} M${cx} ${cy - r * 0.38} L${cx} ${cy + r * 0.38} M${cx + r * 0.42} ${cy - r * 0.3} L${cx + r * 0.42} ${cy + r * 0.3}`}
        stroke="#A16207" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}
