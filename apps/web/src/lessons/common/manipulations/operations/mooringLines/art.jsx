import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `mooring-lines` (« حبال المرسى », thème `harbor`) : la mer et deux barques peintes (ni drapeau ni texte sur la coque), le quai de pierre, la corde
 * posée sur le ruban gradué, le mousqueton de laiton, la barre de réglage du curseur ; Yacine (garçon, sweat) et sa sœur Lina (fille, hijab et tunique). Tout est dessiné
 * en SVG (jamais d'image raster) ; aucun chiffre n'est écrit ici que celui qu'on lui passe.
 */
export const COL = {
  skyTop: '#DFF1FB', sea: '#7CC4E6', seaDark: '#4FA3CF', quay: '#D9CDB6', quayDark: '#B9AC93', quayEdge: '#8F8068', rope: '#B07A3C', ropeDark: '#7C5224',
  tape: '#FFF8E1', tapeInk: '#5B4A2A', fit: '#34D399', over: '#F87171', brass: '#D9A21B', brassDark: '#A87408', wood: '#A9713A', woodDark: '#7A4A24',
  tintA: '#BFDBFE', tintB: '#FDE68A',
};

/** Une barque peinte : coque, bande, cabine ; `flip` la tourne. */
function Boat({ x, y, s = 1, hull = '#E5533D', band = '#FFFFFF', flip = false }) {
  const f = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${f * s} ${s})`} aria-hidden="true">
      <path d="M-34 0 L34 0 L26 13 L-26 13 Z" fill={hull} stroke="#7F1D1D" strokeWidth={1.2} />
      <path d="M-31 4 L31 4" stroke={band} strokeWidth={2.2} />
      <rect x={-8} y={-13} width={17} height={13} rx={2} fill="#F1F5F9" stroke="#64748B" strokeWidth={1} />
      <rect x={-5} y={-10} width={5} height={6} rx={1} fill="#7DD3FC" />
      <path d="M-34 14 Q-17 19 0 14 Q17 9 34 14" fill="none" stroke="#FFFFFF" strokeWidth={1.3} opacity={0.7} />
    </g>
  );
}

/** Le mousqueton de laiton (la « poignée » du quotient) ; `label` : la valeur écrite DANS le mousqueton (agrandi). */
export function Clip({ x, y, active = false, label = null, ...rest }) {
  const w = label ? 54 : 26; const h = label ? 30 : 26;
  return (
    <g transform={`translate(${x} ${y})`} {...rest}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={active ? '#FDE68A' : COL.brass} stroke={COL.brassDark} strokeWidth={2} />
      {label ? (
        <text x={0} y={5} textAnchor="middle" fontSize={14} fontWeight={900} fill="#3B2A05" data-ml-qtext>{label}</text>
      ) : (
        <>
          <rect x={-6} y={-6} width={12} height={12} rx={4} fill="none" stroke={COL.brassDark} strokeWidth={2.2} />
          <path d="M-13 0 L-6 0" stroke={COL.brassDark} strokeWidth={2.2} />
        </>
      )}
    </g>
  );
}

/** Le fond : ciel + mer, deux barques, le quai ; `quayEnd` = l'abscisse où le quai s'arrête (au-delà : l'eau). */
export function HarborBackdrop({ W, H, quayEnd, uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyTop} /><stop offset="0.45" stopColor={COL.sea} /><stop offset="1" stopColor={COL.seaDark} /></linearGradient>
        <linearGradient id={`${uid}-quay`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.quay} /><stop offset="1" stopColor={COL.quayDark} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} rx={12} fill={`url(#${uid}-sea)`} />
      <path d={`M0 30 Q${W * 0.12} 24 ${W * 0.25} 30 T${W * 0.5} 30 T${W * 0.75} 30 T${W} 30`} fill="none" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.55} />
      <Boat x={Math.min(W - 70, quayEnd + 56)} y={36} s={0.9} />
      <Boat x={Math.max(60, W * 0.22)} y={24} s={0.6} hull="#2563EB" flip />
      {/* le quai : une dalle de pierre qui s'arrête au bord */}
      <path d={`M0 62 L${quayEnd + 6} 62 L${quayEnd + 6} ${H} L0 ${H} Z`} fill={`url(#${uid}-quay)`} />
      <rect x={0} y={62} width={quayEnd + 6} height={4} fill={COL.quayEdge} opacity={0.55} />
      {[0.18, 0.4, 0.62, 0.84].map((p) => <line key={p} x1={(quayEnd + 6) * p} x2={(quayEnd + 6) * p} y1={68} y2={H} stroke={COL.quayEdge} strokeWidth={1} opacity={0.18} />)}
      <rect x={quayEnd + 6} y={62} width={5} height={H - 62} fill={COL.quayEdge} opacity={0.5} />
    </g>
  );
}

/** Les deux enfants au bord du quai : Yacine (le garçon) et, au niveau مبتدئ, sa sœur Lina (hijab) ; l'humeur suit l'essai. */
export function Kids({ mood, lina }) {
  return (
    <g aria-hidden="true">
      {lina && <KidFigure cx={64} top={58} foot={112} hairStyle="hijab" scarf="rose" outfit="pink" skin="light" mood={mood} />}
      <KidFigure cx={26} top={58} foot={112} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />
    </g>
  );
}

/** La corde : un trait épais torsadé de x0 à x1 à la hauteur y. */
export function Rope({ x0, x1, y }) {
  const n = Math.max(0, Math.floor((x1 - x0) / 9));
  return (
    <g aria-hidden="true">
      <line x1={x0} x2={x1} y1={y} y2={y} stroke={COL.rope} strokeWidth={8} strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => <line key={i} x1={x0 + 6 + i * 9} x2={x0 + 11 + i * 9} y1={y - 3} y2={y + 3} stroke={COL.ropeDark} strokeWidth={1.6} />)}
    </g>
  );
}
