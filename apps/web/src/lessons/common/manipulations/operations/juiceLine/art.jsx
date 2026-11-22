import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `juice-line` (« خطّ العصير », thème `juicery`) : la معصرة البرتقال التعاونية — des caisses d'oranges, un réservoir en inox avec sa fenêtre graduée (en litres), un tapis roulant, une buse et des bouteilles.
 * Tout est SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici que celui qu'on lui passe. Lina (fille en hijab et tunique longue) tient le pupitre à مبتدئ ; Anis (garçon en sweat) est au réservoir à متقدم. Les ouvriers de la coopérative ne sont jamais dessinés.
 */
export const COL = {
  wall: '#FFF7ED', wallLow: '#FDE7C8', floor: '#E7D3B0', steel: '#CBD5E1', steelDark: '#64748B', glass: '#F8FAFC',
  juice: '#FB923C', juiceDark: '#EA580C', belt: '#475569', beltLight: '#64748B', crate: '#C08A4B', crateDark: '#8A5A2B',
  orange: '#F97316', leaf: '#4D7C0F', mould: '#7DD3FC', mouldLine: '#0284C7', red: '#E11D48', green: '#059669', ink: '#0F172A',
};

export function Crate({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <rect x={-18} y={-18} width={36} height={18} rx={2} fill={COL.crate} stroke={COL.crateDark} strokeWidth={1.4} />
      <path d="M-18 -9 H18" stroke={COL.crateDark} strokeWidth={1.2} />
      {[-11, -3, 5, 12].map((dx, i) => <circle key={dx} cx={dx} cy={-21 + (i % 2) * 2} r={5} fill={COL.orange} stroke="#C2410C" strokeWidth={0.8} />)}
      <path d="M-3 -26 q3 -5 6 0" fill="none" stroke={COL.leaf} strokeWidth={1.6} />
    </g>
  );
}

/** Une bouteille de jus : `level` ∈ [0, 1] de remplissage, `h` hauteur px, `w` largeur px. Le pied est posé en (x, y). */
export function Bottle({ x, y, w = 18, h = 36, level = 1, dashed = false, tone = 'full', ...rest }) {
  const nh = Math.max(4, h * 0.2);
  const bodyH = h - nh;
  const col = tone === 'bad' ? '#FB7185' : COL.juice;
  return (
    <g {...rest} aria-hidden="true">
      <rect x={x - w / 2} y={y - bodyH} width={w} height={bodyH} rx={3} fill={COL.glass} stroke={dashed ? '#94A3B8' : COL.steelDark} strokeWidth={1.4} strokeDasharray={dashed ? '3 3' : undefined} />
      <rect x={x - w * 0.22} y={y - h} width={w * 0.44} height={nh + 1} rx={1.5} fill={COL.glass} stroke={dashed ? '#94A3B8' : COL.steelDark} strokeWidth={1.4} strokeDasharray={dashed ? '3 3' : undefined} />
      {level > 0 && <rect x={x - w / 2 + 1.4} y={y - bodyH * level} width={w - 2.8} height={Math.max(1.5, bodyH * level - 1.4)} rx={2} fill={col} />}
    </g>
  );
}

export function Student({ x, y, girl, mood }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
