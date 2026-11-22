import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `level-laser` (« ليزر المستوى », thème `oilpress`) : la salle de pierre de la معصرة التعاونية — un mur d'appareil de pierre claire, des réservoirs d'inox sur pieds, un tube de verre
 * gradué contre chacun, l'huile dorée, le trait « 1 » du plein, un rail vertical où glisse le niveau laser rouge. Tout est SVG (jamais d'image raster) ; les seuls chiffres écrits sont ceux qu'on lui passe.
 * Anis (garçon en sweat) à مبتدئ, Salma (fille en hijab et tunique longue, tablier) à متقدم.
 */
export const COL = {
  wall: '#EADFC8', wallLine: '#D3C3A0', floor: '#C9B68E', steel: '#CBD5E1', steelDark: '#94A3B8', steelLight: '#F1F5F9', glass: '#E0F2FE', glassEdge: '#7DA2BC',
  oil: '#E8A317', oilDeep: '#C47F0A', oilTube: '#F2B83A', laser: '#E11D2E', laserGlow: '#FCA5A5', rail: '#64748B', cloth: '#CDBB8C', clothEdge: '#8F7A45', brim: '#0F766E', ink: '#1E293B',
};

/** Le mur : des assises de pierre. */
export function Wall({ W, H }) {
  const rows = Math.ceil(H / 26);
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={W} height={H} rx={12} fill={COL.wall} />
      {Array.from({ length: rows }, (_, r) => {
        const off = r % 2 ? 22 : 0;
        return Array.from({ length: Math.ceil(W / 44) + 1 }, (_2, c) => <rect key={`${r}-${c}`} x={c * 44 - off} y={r * 26} width={44} height={26} fill="none" stroke={COL.wallLine} strokeWidth={0.9} opacity={0.7} />);
      })}
    </g>
  );
}

/** Un réservoir d'inox sur pieds : corps de x à x+bw, du trait « 1 » (y1) au fond (y0). */
export function TankBody({ x, bw, y0, y1, uid, i }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-st${i}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={COL.steelDark} /><stop offset="0.3" stopColor={COL.steelLight} /><stop offset="0.7" stopColor={COL.steel} /><stop offset="1" stopColor={COL.steelDark} />
        </linearGradient>
      </defs>
      <rect x={x + 6} y={y0} width={6} height={10} fill={COL.steelDark} />
      <rect x={x + bw - 12} y={y0} width={6} height={10} fill={COL.steelDark} />
      <rect x={x} y={y1} width={bw} height={y0 - y1} rx={8} fill={`url(#${uid}-st${i})`} stroke={COL.steelDark} strokeWidth={1.4} />
    </g>
  );
}

/** Le laser : la poignée sur le rail (un petit bouton avec deux chevrons ↕). */
export function LaserGrip({ x, y, active, locked }) {
  const w = 40; const h = 26;
  const ink = locked ? '#94A3B8' : '#7F1D1D';
  return (
    <g aria-hidden="true">
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9} fill={locked ? '#CBD5E1' : '#FFFFFF'} stroke={locked ? '#94A3B8' : active ? '#BE123C' : COL.laser} strokeWidth={2.4} />
      <path d={`M${x} ${y - 8} v16 M${x} ${y - 8} l-5 5 M${x} ${y - 8} l5 5 M${x} ${y + 8} l-5 -5 M${x} ${y + 8} l5 -5`} stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle cx={x + w / 2 - 6} cy={y} r={2.6} fill={locked ? '#94A3B8' : COL.laser} />
    </g>
  );
}

export function Student({ x, y, girl, mood }) {
  return girl
    ? <KidFigure cx={x} top={y - 44} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 44} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
