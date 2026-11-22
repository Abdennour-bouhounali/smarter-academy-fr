import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `dig-grid` (« شبكة الحفرية », thème `digsite`) : une fouille archéologique vue d'en haut — terre ocre, ficelles blanches tous les mètres,
 * murs de pierre d'une maison ruinée, une brosse, un seau — et les trouvailles (jarre, lampe à huile, tesson d'assiette, pièce lisse, tesselle de mosaïque
 * géométrique, perle, bague, pointe). Tout est SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici. Les trouvailles sont posées par leur centre (x, y).
 * La pièce est un disque lisse : ni visage ni symbole.
 */
export const COL = {
  earth: '#E9D5B0', earthDark: '#D9BE8C', string: '#FFFFFF', stone: '#A8A29E', stoneDark: '#78716C', cordX: '#2563EB', cordY: '#16A34A', stake: '#DC2626',
  ink: '#0F172A', clay: '#B45309', clayLight: '#F59E0B', glow: '#FDE68A', gold: '#CA8A04',
};

export function Pit({ x, y, w, h, uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-earth`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.earth} /><stop offset="1" stopColor={COL.earthDark} /></linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={`url(#${uid}-earth)`} stroke={COL.stoneDark} strokeWidth={2} />
      {/* les murs de pierre d'une maison ruinée, dans un angle */}
      <g opacity={0.5}>
        <rect x={x + w - 54} y={y + 4} width={50} height={9} rx={2} fill={COL.stone} />
        <rect x={x + w - 13} y={y + 4} width={9} height={42} rx={2} fill={COL.stone} />
        <rect x={x + 4} y={y + h - 13} width={46} height={9} rx={2} fill={COL.stone} />
      </g>
    </g>
  );
}

/** Une trouvaille posée par son centre. */
export function Find({ id, x, y, lit }) {
  const halo = lit ? <circle cx={x} cy={y} r={14} fill={COL.glow} opacity={0.85} /> : null;
  switch (id) {
    case 'jar':
      return (<g aria-hidden="true">{halo}<path d={`M${x - 5} ${y - 9} h10 l1 3 c6 2 7 12 0 15 h-12 c-7 -3 -6 -13 0 -15 z`} fill={COL.clay} stroke="#7C2D12" strokeWidth={1} /><rect x={x - 6} y={y - 11} width={12} height={3} rx={1} fill={COL.clayLight} /></g>);
    case 'lamp':
      return (<g aria-hidden="true">{halo}<path d={`M${x - 9} ${y + 3} q0 -9 9 -9 h4 l5 -3 v6 q0 9 -9 9 h-4 q-5 0 -5 -3 z`} fill={COL.clayLight} stroke="#7C2D12" strokeWidth={1} /><circle cx={x + 7} cy={y - 3} r={1.6} fill="#7C2D12" /></g>);
    case 'plate':
      return (<g aria-hidden="true">{halo}<path d={`M${x - 10} ${y + 3} q4 -12 20 -9 l-3 10 z`} fill="#F3E8D0" stroke="#7C2D12" strokeWidth={1} /><path d={`M${x - 6} ${y} q5 -4 11 -3`} stroke="#B45309" strokeWidth={1.4} fill="none" /></g>);
    case 'coin':
      return (<g aria-hidden="true">{halo}<circle cx={x} cy={y} r={8} fill={COL.gold} stroke="#854D0E" strokeWidth={1.2} /><circle cx={x} cy={y} r={5} fill="#EAB308" opacity={0.7} /></g>);
    case 'tile':
      return (<g aria-hidden="true">{halo}<rect x={x - 8} y={y - 8} width={16} height={16} rx={1.5} fill="#0E7490" stroke="#164E63" strokeWidth={1} /><path d={`M${x} ${y - 8} l8 8 l-8 8 l-8 -8 z`} fill="#FDE68A" /><rect x={x - 2.5} y={y - 2.5} width={5} height={5} fill="#0E7490" /></g>);
    case 'bead':
      return (<g aria-hidden="true">{halo}<circle cx={x} cy={y} r={5} fill="#BE185D" stroke="#831843" strokeWidth={1} /><circle cx={x} cy={y} r={1.6} fill="#FDF2F8" /></g>);
    case 'ring':
      return (<g aria-hidden="true"><circle cx={x} cy={y} r={7} fill="none" stroke={COL.gold} strokeWidth={3.5} /><circle cx={x} cy={y - 7} r={2.4} fill="#0E7490" /></g>);
    case 'arrow':
      return (<g aria-hidden="true"><path d={`M${x - 9} ${y + 6} L${x + 9} ${y - 6} M${x + 9} ${y - 6} l-7 0 M${x + 9} ${y - 6} l-1 7`} stroke={COL.stoneDark} strokeWidth={2.4} fill="none" strokeLinecap="round" /></g>);
    default: return null;
  }
}

/** Le piquet rouge planté à un croisement. */
export function StakeArt({ x, y, active, locked }) {
  return (
    <g aria-hidden="true" data-dg-peg>
      <rect x={x - 3} y={y - 22} width={6} height={22} rx={1.5} fill="#7F1D1D" />
      <rect x={x - 4.5} y={y - 26} width={9} height={7} rx={2} fill={locked ? '#94A3B8' : COL.stake} stroke="#fff" strokeWidth={1.2} />
      <circle cx={x} cy={y} r={active ? 7 : 5.5} fill={locked ? '#94A3B8' : COL.stake} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

export function Digger({ x, y, mood, girl }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
