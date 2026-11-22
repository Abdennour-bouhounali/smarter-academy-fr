import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `window-blinds` (« ستائر النافذة », thème `classwindow`) : l'intérieur d'une salle de classe, une grande fenêtre à cadre d'aluminium blanc qui donne sur la cour ensoleillée
 * et un palmier, un rail à crans pour le rideau latéral, un cordon à crans pour le store à enrouleur, l'écran de projection qui descend dans le coin sombre. Tout est SVG (jamais d'image
 * raster) ; aucun chiffre n'est écrit ici que celui qu'on lui passe. Une élève (fille en hijab et tunique longue) à مبتدئ, un élève (garçon en sweat) à متقدم.
 */
export const COL = {
  wall: '#F3EAD7', wallEdge: '#D9C9A6', sky: '#BAE6FD', skyLow: '#E0F2FE', yard: '#9AD07F', yardDark: '#78B864', trunk: '#8B5A2B', palm: '#2F8F5B', sun: '#FDE68A',
  frame: '#F8FAFC', frameEdge: '#94A3B8', rail: '#64748B', ring: '#E2E8F0', curtain: '#4338CA', blind: '#B45309', ink: '#0F172A', cord: '#475569', flag: '#EA580C',
};

function Palm({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <path d="M-2 0 Q-4 -18 0 -34 L3 -34 Q0 -18 3 0 Z" fill={COL.trunk} />
      {[-70, -35, 0, 35, 70].map((a) => (
        <path key={a} d="M1 -34 Q16 -46 30 -32 Q14 -38 1 -34 Z" fill={COL.palm} transform={`rotate(${a} 1 -34)`} />
      ))}
    </g>
  );
}

/** La vue par la vitre : ciel, soleil, cour, palmier. Une seule fois par fenêtre (cellule `u` × `h`). */
export function Outside({ x, y, w, h, uid, n }) {
  return (
    <g aria-hidden="true">
      <defs><linearGradient id={`${uid}-sky${n}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.sky} /><stop offset="1" stopColor={COL.skyLow} /></linearGradient></defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${uid}-sky${n})`} />
      <circle cx={x + w * 0.2} cy={y + h * 0.2} r={Math.min(w, h) * 0.09} fill={COL.sun} />
      <rect x={x} y={y + h * 0.72} width={w} height={h * 0.28} fill={COL.yard} />
      <rect x={x} y={y + h * 0.86} width={w} height={h * 0.14} fill={COL.yardDark} opacity={0.6} />
      <Palm x={x + w * 0.74} y={y + h * 0.8} s={Math.min(w, h) / 150} />
    </g>
  );
}

/** Le rail du rideau : une barre, et des crans (anneaux) tous les 1/b de fenêtre. */
export function Rail({ x0, x1, y }) {
  return (
    <g aria-hidden="true">
      <rect x={x0 - 10} y={y - 4} width={x1 - x0 + 20} height={8} rx={4} fill={COL.rail} />
      <rect x={x0 - 10} y={y - 4} width={x1 - x0 + 20} height={3} rx={1.5} fill="#94A3B8" />
    </g>
  );
}

/** Une poignée : un petit bouton arrondi avec deux chevrons — `dir="h"` (↔, le rideau) ou `dir="v"` (↕, le store). */
export function Grip({ x, y, dir, active, locked }) {
  const w = 38; const h = 24;
  const ink = locked ? '#94A3B8' : '#334155';
  return (
    <g aria-hidden="true">
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} fill={locked ? '#CBD5E1' : '#FFFFFF'} stroke={locked ? '#94A3B8' : active ? '#4F46E5' : '#334155'} strokeWidth={2.2} />
      {dir === 'h'
        ? <path d={`M${x - 11} ${y} h22 M${x - 11} ${y} l5 -5 M${x - 11} ${y} l5 5 M${x + 11} ${y} l-5 -5 M${x + 11} ${y} l-5 5`} stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        : <path d={`M${x} ${y - 8} v16 M${x} ${y - 8} l-5 5 M${x} ${y - 8} l5 5 M${x} ${y + 8} l-5 -5 M${x} ${y + 8} l5 -5`} stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />}
    </g>
  );
}

export function Student({ x, y, girl, mood }) {
  return girl
    ? <KidFigure cx={x} top={y - 52} foot={y} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    : <KidFigure cx={x} top={y - 52} foot={y} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />;
}
