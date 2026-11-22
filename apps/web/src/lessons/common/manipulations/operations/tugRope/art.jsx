import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `tug-rope` (« شدّ الحبل », thème `tugfield`) : la cour du collège un jour de sport — le ciel, l'herbe, la corde, deux drapeaux (vert à droite « + », orange à gauche « − »),
 * la bande graduée au sol (−20 … +20) et le ruban rouge noué au milieu de la corde. Tout est SVG, aucun chiffre n'est écrit sauf les graduations de la bande.
 */
export const COL = { sky: '#E0F2FE', skyLow: '#F0F9FF', grass: '#BBF7D0', grassDark: '#86EFAC', ground: '#FDE68A', groundDark: '#CA8A04', rope: '#92400E', plus: '#16A34A', minus: '#EA580C', ribbon: '#DC2626', ink: '#0F172A' };

/** La plage de la bande : de −20 à +20. `u` = pixels par unité. */
const RANGE = 20;
export const unitFor = (W) => Math.max(6, (W - 28) / (2 * RANGE));
export const clampMark = (m) => Math.max(-RANGE, Math.min(RANGE, m));

export function Backdrop({ W, H, ropeY, stripY, uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sky} /><stop offset="1" stopColor={COL.skyLow} /></linearGradient>
        <linearGradient id={`${uid}-grass`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.grass} /><stop offset="1" stopColor={COL.grassDark} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-sky)`} />
      <rect x={0} y={ropeY - 14} width={W} height={H - ropeY + 14} fill={`url(#${uid}-grass)`} />
      {/* la bande graduée au sol */}
      <rect x={6} y={stripY} width={W - 12} height={36} rx={8} fill={COL.ground} stroke={COL.groundDark} strokeWidth={1.4} />
      {/* la corde */}
      <line x1={6} x2={W - 6} y1={ropeY} y2={ropeY} stroke={COL.rope} strokeWidth={3.4} strokeLinecap="round" />
    </g>
  );
}

/** Un drapeau (mât + fanion) planté en (x, y bas), couleur c. */
export function Flag({ x, y, c, dir = 1 }) {
  return (
    <g aria-hidden="true">
      <line x1={x} x2={x} y1={y - 38} y2={y} stroke="#475569" strokeWidth={2} />
      <path d={`M${x} ${y - 38} h${22 * dir} l${-6 * dir} 8 l${6 * dir} 8 h${-22 * dir} z`} fill={c} stroke="#0F172A" strokeOpacity={0.35} strokeWidth={0.8} />
    </g>
  );
}

/** Les graduations de la bande : un repère par unité, un nombre tous les 5 ; à متقدم les demis aussi. */
export function Strip({ W, stripY, u, half }) {
  const cx = W / 2;
  const items = [];
  for (let n = -RANGE; n <= RANGE; n += 1) {
    const x = cx + n * u;
    const major = n % 5 === 0;
    items.push(<line key={n} x1={x} x2={x} y1={stripY + 4} y2={stripY + (major ? 17 : 11)} stroke="#78350F" strokeWidth={n === 0 ? 2.6 : major ? 1.6 : 1} />);
    if (major) items.push(<text key={`t${n}`} x={x} y={stripY + 30} textAnchor="middle" fontSize={10} fontWeight={800} fill="#451A03">{n === 0 ? '0' : String(n).replace('-', '−')}</text>);
    if (half && n < RANGE) items.push(<line key={`h${n}`} x1={x + u / 2} x2={x + u / 2} y1={stripY + 4} y2={stripY + 8} stroke="#78350F" strokeWidth={0.8} />);
  }
  return <g aria-hidden="true" direction="ltr">{items}</g>;
}

/** Le ruban rouge noué à la corde, au-dessus de la graduation `mark` ; `ghost` : le ruban VRAI en pointillés. */
export function Ribbon({ x, ropeY, stripY, ghost }) {
  const c = ghost ? '#B45309' : COL.ribbon;
  return (
    <g aria-hidden="true" data-tr-ribbon-art={ghost ? 'ghost' : 'real'}>
      <line x1={x} x2={x} y1={ropeY} y2={stripY + 6} stroke={c} strokeWidth={ghost ? 1.6 : 2} strokeDasharray={ghost ? '4 3' : undefined} />
      <path d={`M${x - 6} ${ropeY - 9} h12 l-3 9 l3 9 h-12 z`} fill={ghost ? 'none' : c} stroke={c} strokeWidth={ghost ? 1.6 : 1} strokeDasharray={ghost ? '3 2' : undefined} />
      <path d={`M${x - 5} ${stripY + 2} h10 l-5 8 z`} fill={ghost ? 'none' : c} stroke={c} strokeWidth={1.2} />
      {ghost && <text x={x} y={ropeY - 13} textAnchor="middle" fontSize={16} fontWeight={900} fill={c}>؟</text>}
    </g>
  );
}

const CAST = [
  { girl: true, scarf: 'rose', outfit: 'green', skin: 'light' },
  { girl: false, outfit: 'blue', skin: 'wheat', hair: 'black' },
  { girl: true, scarf: 'lavender', outfit: 'teal', skin: 'brown' },
  { girl: false, outfit: 'orange', skin: 'light', hair: 'brown' },
  { girl: true, scarf: 'mint', outfit: 'violet', skin: 'wheat' },
  { girl: false, outfit: 'red', skin: 'deep', hair: 'black' },
];
/** L'enfant n°`i` de la file (filles toujours en hijab et tunique longue). */
export function Kid({ i, mood = 'happy', size = 40, dim }) {
  const c = CAST[i % CAST.length];
  const h = Math.round(size * 1.3);
  return (
    <svg width={size} height={h} viewBox="0 0 40 52" aria-hidden="true" data-tr-kid-art={i} style={{ display: 'block' }}>
      {c.girl
        ? <KidFigure cx={20} top={-1} foot={51} hairStyle="hijab" scarf={c.scarf} outfit={c.outfit} skin={c.skin} mood={mood} dim={dim} />
        : <KidFigure cx={20} top={-1} foot={51} hairStyle="short" outfit={c.outfit} skin={c.skin} hair={c.hair} mood={mood} dim={dim} />}
    </svg>
  );
}
