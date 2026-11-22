import { FIG, ltrText } from './palette';

/**
 * #250 « ظلّ الشجرة » — même instant, même soleil : un bâton de 1,5 m d'ombre 2 m et un arbre
 * d'ombre T m, À LA MÊME ÉCHELLE. La hauteur de l'arbre est CALCULÉE (1,5 / 2 × T) ; les
 * rayons passent par le sommet de chaque objet et le bout de son ombre, donc ils sont parallèles.
 */
export const LAYERS = ['ground', 'sun', 'stick', 'tree', 'shadows', 'rays', 'triStick', 'triTree', 'angles', 'labels'];
export const BASE_LAYERS = ['ground', 'sun', 'stick', 'tree', 'shadows', 'labels'];

const W = 520;
const GY = 290; // niveau du sol
const STICK = 1.5;
const STICK_SHADOW = 2;

function Label({ x, y, children, color = FIG.label, size = 17, anchor = 'middle' }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} fontWeight="600" textAnchor={anchor} dominantBaseline="middle" style={ltrText}>
      {children}
    </text>
  );
}

export default function TreeShadow({ layers = BASE_LAYERS, props = {}, ariaLabel }) {
  const on = new Set(layers);
  const T = Number(props.T) || 18;
  const H = (STICK / STICK_SHADOW) * T; // hauteur de l'arbre
  const k = Math.min(290 / T, 220 / H); // px par mètre, commun aux deux objets
  const sx = 70; // pied du bâton
  const tx = 190; // pied de l'arbre
  const stickTop = [sx, GY - STICK * k];
  const stickEnd = [sx + STICK_SHADOW * k, GY];
  const treeTop = [tx, GY - H * k];
  const treeEnd = [tx + T * k, GY];
  const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  // direction du rayon (vers le bas à droite), pour prolonger chaque rayon vers le soleil
  const [dx, dy] = [STICK_SHADOW, STICK]; // en coordonnées SVG (y vers le bas)
  const len = Math.hypot(dx, dy);
  const back = (p, d) => [p[0] - (dx / len) * d, p[1] - (dy / len) * d];
  const crownR = Math.max(10, Math.min(30, H * k * 0.18));
  const pt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const angleArc = (end, r) => {
    const a = [end[0] - r, end[1]];
    const b = [end[0] - (dx / len) * r, end[1] - (dy / len) * r];
    return `M ${pt(a)} A ${r} ${r} 0 0 1 ${pt(b)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} 330`} role="img" aria-label={ariaLabel} className="h-auto w-full max-w-[560px]" data-figure="TreeShadow">
      <rect x="0" y="0" width={W} height="330" fill={FIG.paper} />
      {on.has('sun') && (
        <g stroke={FIG.observe} strokeWidth="2">
          <circle cx="40" cy="40" r="16" fill={FIG.observeFill} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <path key={i} d={`M ${40 + 21 * Math.cos(a)} ${40 + 21 * Math.sin(a)} L ${40 + 28 * Math.cos(a)} ${40 + 28 * Math.sin(a)}`} />;
          })}
        </g>
      )}
      {on.has('triStick') && <path d={`M ${sx} ${GY} L ${pt(stickEnd)} L ${pt(stickTop)} Z`} fill={FIG.buildFill} stroke={FIG.build} strokeWidth="1.8" />}
      {on.has('triTree') && <path d={`M ${tx} ${GY} L ${pt(treeEnd)} L ${pt(treeTop)} Z`} fill={FIG.soughtFill} stroke={FIG.sought} strokeWidth="1.8" />}
      {on.has('rays') && (
        <g stroke={FIG.observe} strokeWidth="1.6" strokeDasharray="6 5">
          <path d={`M ${pt(back(stickTop, 60))} L ${pt(stickEnd)}`} />
          <path d={`M ${pt(back(treeTop, 40))} L ${pt(treeEnd)}`} />
        </g>
      )}
      {on.has('angles') && (
        <g fill="none" stroke={FIG.observe} strokeWidth="2">
          <path d={angleArc(stickEnd, 14)} />
          <path d={angleArc(treeEnd, 22)} />
        </g>
      )}
      {on.has('shadows') && (
        <g stroke={FIG.deadEnd} strokeWidth="6" strokeLinecap="round" opacity="0.7">
          <path d={`M ${sx} ${GY - 3} L ${stickEnd[0]} ${GY - 3}`} />
          <path d={`M ${tx} ${GY - 3} L ${treeEnd[0]} ${GY - 3}`} />
        </g>
      )}
      {on.has('ground') && <path d={`M 16 ${GY} L ${W - 12} ${GY}`} stroke={FIG.ink} strokeWidth="2.2" />}
      {on.has('stick') && <path d={`M ${sx} ${GY} L ${pt(stickTop)}`} stroke={FIG.ink} strokeWidth="4" strokeLinecap="round" />}
      {on.has('tree') && (
        <g>
          <path d={`M ${tx} ${GY} L ${tx} ${treeTop[1] + crownR}`} stroke={FIG.ink} strokeWidth="5" strokeLinecap="round" />
          <circle cx={tx} cy={treeTop[1] + crownR} r={crownR} fill={FIG.deadEndFill} stroke={FIG.deadEnd} strokeWidth="2" />
          <circle cx={tx} cy={treeTop[1]} r="3" fill={FIG.ink} />
        </g>
      )}
      {on.has('labels') && (
        <g>
          <Label x={sx - 8} y={GY - (STICK * k) / 2 - 6} anchor="end">1,5</Label>
          <Label x={(sx + stickEnd[0]) / 2} y={GY + 20}>2</Label>
          <Label x={(tx + treeEnd[0]) / 2} y={GY + 20}>{fmt(T)}</Label>
          <Label x={tx - 12} y={GY - (H * k) / 2} anchor="end" color={FIG.sought} size={18}>h = ?</Label>
        </g>
      )}
    </svg>
  );
}
