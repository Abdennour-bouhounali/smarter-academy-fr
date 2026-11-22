import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `gap-caliper` (« مسماك الفرق », thème `meteoboard`) : la cour du club d'astronomie, un panneau de bois blanc, un grand thermomètre gradué, une station météo et une girouette,
 * des graines colorées pincées sur l'échelle et un compas en laiton. Tout est SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici (les graduations viennent de la scène).
 */
export const COL = {
  wood: '#FEF3C7', woodDark: '#D6B66B', tube: '#F8FAFC', tubeEdge: '#94A3B8', zero: '#2563EB', mercury: '#EF4444',
  brass: '#B7791F', brassLight: '#F6C453', brassDark: '#7C4A03', above: '#16A34A', below: '#EA580C', miss: '#E11D48', ink: '#0F172A',
  anchor: '#F59E0B', target: '#0D9488',
};

/** Le panneau de bois et le tube du thermomètre (de y0 à y1), la boule en bas. */
export function Board({ x, y, w, h, sx, y0, y1, uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFBEB" /><stop offset="1" stopColor={COL.wood} /></linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={`url(#${uid}-wood)`} stroke={COL.woodDark} strokeWidth={2} />
      <rect x={sx - 7} y={y0 - 6} width={14} height={y1 - y0 + 12} rx={7} fill={COL.tube} stroke={COL.tubeEdge} strokeWidth={1.6} />
      <circle cx={sx} cy={y1 + 10} r={11} fill={COL.mercury} stroke={COL.tubeEdge} strokeWidth={1.6} />
      <rect x={sx - 2.6} y={(y0 + y1) / 2} width={5.2} height={(y1 - y0) / 2 + 10} rx={2.6} fill={COL.mercury} opacity={0.9} />
    </g>
  );
}

/** Une petite station météo (persiennes blanches sur pieds) et une girouette — décor discret en haut à gauche. */
export function Station({ x, y }) {
  return (
    <g aria-hidden="true" opacity={0.9}>
      <rect x={x} y={y + 6} width={30} height={22} rx={2} fill="#fff" stroke={COL.tubeEdge} strokeWidth={1.4} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={x + 3} x2={x + 27} y1={y + 11 + i * 4.5} y2={y + 11 + i * 4.5} stroke="#CBD5E1" strokeWidth={1.2} />)}
      <line x1={x + 4} x2={x + 4} y1={y + 28} y2={y + 40} stroke={COL.tubeEdge} strokeWidth={2} />
      <line x1={x + 26} x2={x + 26} y1={y + 28} y2={y + 40} stroke={COL.tubeEdge} strokeWidth={2} />
      <line x1={x + 15} x2={x + 15} y1={y - 12} y2={y + 6} stroke={COL.tubeEdge} strokeWidth={2} />
      <path d={`M${x + 15} ${y - 11} l11 3 l-11 3 z`} fill={COL.below} />
      <path d={`M${x + 15} ${y - 11} l-5 3 l5 3 z`} fill={COL.brassLight} />
    </g>
  );
}

/** Une graine colorée posée sur l'échelle. */
export function Bead({ x, y, color, lit }) {
  return (
    <g aria-hidden="true">
      {lit && <circle cx={x} cy={y} r={13} fill="#FDE68A" opacity={0.85} />}
      <circle cx={x} cy={y} r={8} fill={color} stroke="#fff" strokeWidth={2} />
      <circle cx={x - 2.6} cy={y - 2.8} r={2.2} fill="#fff" opacity={0.7} />
    </g>
  );
}

/** Les deux mâchoires (griffes horizontales) du compas : la fixe en `yA`, la libre en `yB`, reliées par un rail vertical en `rx`, la griffe touchant le tube en `tx`. */
export function Caliper({ rx, tx, yA, yB, locked, active }) {
  const hi = Math.min(yA, yB); const lo = Math.max(yA, yB);
  return (
    <g aria-hidden="true" data-gc-caliper>
      <rect x={rx - 4} y={hi - 2} width={8} height={Math.max(4, lo - hi + 4)} rx={3} fill={COL.brass} stroke={COL.brassDark} strokeWidth={1} />
      <rect x={rx - 1.2} y={hi} width={2.4} height={Math.max(0, lo - hi)} fill={COL.brassLight} opacity={0.8} />
      {/* mâchoire fixe, serrée sur la graine */}
      <path d={`M${rx} ${yA} H${tx - 9}`} stroke={COL.brassDark} strokeWidth={5} strokeLinecap="round" />
      <path d={`M${rx} ${yA} H${tx - 9}`} stroke={COL.brassLight} strokeWidth={2.4} strokeLinecap="round" />
      <rect x={rx - 6} y={yA - 7} width={12} height={14} rx={3} fill={COL.brass} stroke={COL.brassDark} strokeWidth={1.2} />
      {/* mâchoire libre et sa vis */}
      <path d={`M${rx} ${yB} H${tx - 9}`} stroke={COL.brassDark} strokeWidth={5} strokeLinecap="round" />
      <path d={`M${rx} ${yB} H${tx - 9}`} stroke={COL.brassLight} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={rx} cy={yB} r={active ? 10 : 8.5} fill={locked ? '#CBD5E1' : COL.brassLight} stroke={COL.brassDark} strokeWidth={1.8} />
      <line x1={rx - 5} x2={rx + 5} y1={yB} y2={yB} stroke={COL.brassDark} strokeWidth={1.6} />
    </g>
  );
}

export function Observer({ x, y, mood, girl }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
