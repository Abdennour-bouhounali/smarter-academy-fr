import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `wax-cells` (« خلايا الشمع », thème `apiary`) : le منحل du grand-père au bord d'un verger — ciel, collines, quelques ruches en bois, fleurs, abeilles dessinées PETITES (jamais sur les enfants) — et un cadre en bois qui
 * porte le rang de cellules. Tout est SVG (jamais d'image raster), aucun chiffre n'est écrit ici que celui qu'on lui passe. Yacine (garçon en sweat) construit à مبتدئ ; Rania (fille en hijab et tunique longue) tient l'ardoise à متقدم.
 */
export const COL = {
  sky: '#DBEAFE', skyLow: '#FEF9C3', hill: '#A3C585', hill2: '#8DB26F', wood: '#B7793B', woodDark: '#8A5A2B', woodLight: '#E3B16F',
  rod: '#E0A526', rodDark: '#B7791F', rodShared: '#C2410C', rodRed: '#E11D48', cell: '#FDE68A', slate: '#3F3F46', chalk: '#F8FAFC', tray: '#D6A15C',
  flag: '#EA580C',
};

export function Hive({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <rect x={-14} y={-26} width={28} height={8} rx={2} fill={COL.woodDark} />
      <rect x={-12} y={-18} width={24} height={9} fill={COL.woodLight} stroke={COL.woodDark} strokeWidth={0.8} />
      <rect x={-12} y={-9} width={24} height={9} fill={COL.wood} stroke={COL.woodDark} strokeWidth={0.8} />
      <rect x={-3} y={-6} width={6} height={2.4} rx={1} fill="#3B2412" />
      <rect x={-10} y={0} width={4} height={6} fill={COL.woodDark} />
      <rect x={6} y={0} width={4} height={6} fill={COL.woodDark} />
    </g>
  );
}

export function Flower({ x, y, c = '#F472B6' }) {
  return (
    <g aria-hidden="true">
      <line x1={x} x2={x} y1={y} y2={y + 12} stroke="#4D7C0F" strokeWidth={1.4} />
      {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 3.2} cy={y + Math.sin((a * Math.PI) / 180) * 3.2} r={2.2} fill={c} />)}
      <circle cx={x} cy={y} r={1.8} fill="#FDE047" />
    </g>
  );
}

/** Une abeille, petite : corps rayé, deux ailes. */
export function Bee({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <ellipse cx={-2} cy={-4} rx={3.4} ry={2.2} fill="#E0F2FE" opacity={0.9} />
      <ellipse cx={2} cy={-4} rx={3.4} ry={2.2} fill="#E0F2FE" opacity={0.9} />
      <ellipse cx={0} cy={0} rx={5} ry={3.2} fill="#FACC15" stroke="#3F3F46" strokeWidth={0.6} />
      <path d="M-1.4 -3 v6 M1.8 -3 v6" stroke="#3F3F46" strokeWidth={1.2} />
    </g>
  );
}

/** Un hexagone (cellule) dessiné d'un trait fin : l'icône du plateau. */
export function HexIcon({ cx, cy, r = 14, fill = COL.cell, stroke = COL.rodDark, ...rest }) {
  const pts = [0, 60, 120, 180, 240, 300].map((a) => `${(cx + r * Math.cos(((a + 30) * Math.PI) / 180)).toFixed(1)},${(cy + r * Math.sin(((a + 30) * Math.PI) / 180)).toFixed(1)}`).join(' ');
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" {...rest} />;
}

export function Student({ x, y, girl, mood }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
