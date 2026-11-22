import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `trail-odometer` (« عدّاد المسلك », thème `mountaintrail`) : des collines, des cèdres, le sentier (un ruban), les poteaux blancs et rouges, le portail
 * en bois « مدخل الحظيرة », la source « العين », une randonneuse (fille en hijab et tunique longue — مبتدئ) ou un randonneur (garçon en sweat — متقدم). Tout est
 * dessiné en SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici que celui qu'on lui passe.
 */
export const COL = {
  sky: '#E0F2FE', hillA: '#BBD9A6', hillB: '#9CC48A', hillC: '#7FAE70', trunk: '#7A4A24', cedar: '#2F6B4A', cedarLight: '#3E8A60', trail: '#E8D3A5', trailEdge: '#B89C66',
  post: '#FFFFFF', postInk: '#64748B', red: '#DC2626', redDark: '#991B1B', wood: '#A9713A', woodDark: '#7A4A24', water: '#38BDF8', waterDark: '#0369A1',
  leg: ['#10B981', '#2563EB', '#F97316'],
};

function Cedar({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <rect x={-2} y={0} width={4} height={9} fill={COL.trunk} />
      <path d="M0 -30 L12 -10 L5 -10 L15 6 L-15 6 L-5 -10 L-12 -10 Z" fill={COL.cedar} stroke="#1F4D36" strokeWidth={0.8} />
      <path d="M0 -30 L6 -16 L0 -14 Z" fill={COL.cedarLight} opacity={0.7} />
    </g>
  );
}

export function TrailBackdrop({ W, H, uid, loop }) {
  const trees = [[40, 46, 0.9], [W - 40, 44, 1], [W * 0.5, 36, 0.8], [W * 0.18, H - 34, 0.9], [W * 0.82, H - 30, 1], [W * 0.5, H - 26, 0.75], [20, H - 60, 0.7], [W - 22, H - 66, 0.7]];
  return (
    <g aria-hidden="true">
      <defs><linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sky} /><stop offset="1" stopColor="#F0FDF4" /></linearGradient></defs>
      <rect x={0} y={0} width={W} height={H} rx={12} fill={`url(#${uid}-sky)`} />
      <path d={`M0 ${H * 0.34} Q${W * 0.22} ${H * 0.12} ${W * 0.45} ${H * 0.3} T${W} ${H * 0.22} L${W} ${H} L0 ${H} Z`} fill={COL.hillA} />
      <path d={`M0 ${H * 0.62} Q${W * 0.3} ${H * 0.42} ${W * 0.6} ${H * 0.6} T${W} ${H * 0.52} L${W} ${H} L0 ${H} Z`} fill={COL.hillB} opacity={0.85} />
      <path d={`M0 ${H * 0.86} Q${W * 0.35} ${H * 0.72} ${W * 0.7} ${H * 0.86} T${W} ${H * 0.8} L${W} ${H} L0 ${H} Z`} fill={COL.hillC} opacity={0.8} />
      {trees.map(([x, y, s], i) => <Cedar key={i} x={x} y={y} s={s} />)}
      {loop && <ellipse cx={W / 2} cy={H / 2 + 6} rx={W / 2 - 62} ry={H / 2 - 64} fill="#A7D08C" opacity={0.55} />}
    </g>
  );
}

/** Le portail en bois du début du sentier ; `label` : « مدخل الحظيرة ». */
export function Gate({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x={-15} y={-26} width={5} height={30} fill={COL.wood} stroke={COL.woodDark} strokeWidth={1} />
      <rect x={10} y={-26} width={5} height={30} fill={COL.wood} stroke={COL.woodDark} strokeWidth={1} />
      <rect x={-17} y={-30} width={34} height={7} rx={2} fill={COL.wood} stroke={COL.woodDark} strokeWidth={1} />
      <text x={0} y={-35} textAnchor="middle" fontSize={11} fontWeight={800} fill="#3F2A12">{label}</text>
    </g>
  );
}

/** La source : un petit bassin et un filet d'eau. */
export function Spring({ x, y, label }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <ellipse cx={0} cy={4} rx={17} ry={8} fill={COL.water} stroke={COL.waterDark} strokeWidth={1.4} />
      <path d="M-5 4 Q0 -2 5 4" fill="none" stroke="#FFFFFF" strokeWidth={1.6} />
      <circle cx={0} cy={-8} r={3.4} fill={COL.water} stroke={COL.waterDark} strokeWidth={1} />
      <text x={0} y={-17} textAnchor="middle" fontSize={11} fontWeight={800} fill="#075985">{label}</text>
    </g>
  );
}

/** Un poteau : blanc (petit) ou rouge (haut, avec une bande) planté au point (x, y) du sentier. */
export function Post({ x, y, red = false, ...rest }) {
  return red ? (
    <g {...rest}>
      <line x1={x} x2={x} y1={y} y2={y - 20} stroke={COL.redDark} strokeWidth={5} strokeLinecap="round" />
      <line x1={x} x2={x} y1={y - 3} y2={y - 19} stroke={COL.red} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={x - 3} y={y - 13} width={6} height={3} fill="#FFFFFF" />
    </g>
  ) : (
    <g {...rest}>
      <line x1={x} x2={x} y1={y} y2={y - 10} stroke={COL.postInk} strokeWidth={4} strokeLinecap="round" />
      <line x1={x} x2={x} y1={y - 1} y2={y - 9} stroke={COL.post} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** La randonneuse / le randonneur : la scoute (fille en hijab) à مبتدئ, le garçon en sweat à متقدم. */
export function Hiker({ x, y, girl, mood, ...rest }) {
  return (
    <g {...rest}>
      {girl
        ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </g>
  );
}
