import { useId } from 'react';

/**
 * UN GÂTEAU ROND, VU D'EN HAUT (2026-10-15, labo `fair-share`, 1AM) — un `<g>` à poser DANS une scène SVG.
 *
 * Le cercle EST la fraction : un gâteau entier = un tour. Les tranches se lisent comme des secteurs du disque.
 *   cx, cy, r        le disque ;
 *   slices           [{ a0, a1, color, dashed, kid }] des secteurs, angles en TOURS (0 = midi, sens horaire) ;
 *   cuts (n ≥ 2)     n traits de couteau également espacés depuis le centre : le gâteau coupé en n parts égales ;
 *   ghost            le dessine en pointillés roses (un gâteau qui n'existe pas) ;
 *   label            un nombre dans chaque tranche assez large (le numéro de l'enfant).
 * Dessin seulement : la tranche [a0, a1] couvre exactement (a1 − a0) du disque.
 */
const TAU = Math.PI * 2;
const pt = (cx, cy, r, t) => [cx + r * Math.sin(t * TAU), cy - r * Math.cos(t * TAU)];

/** Le chemin d'un secteur [a0, a1] (en tours) de rayon r. Un tour complet est un disque. */
export function sectorPath(cx, cy, r, a0, a1) {
  if (a1 - a0 >= 0.9999) return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1} ${y1}Z`;
}

export function Cake({ cx, cy, r, slices = [], cuts = 1, ghost = false, label = true, ...rest }) {
  const id = useId().replace(/:/g, '');
  if (ghost) {
    return (
      <g {...rest}>
        <circle cx={cx} cy={cy} r={r - 1} fill="#FFF1F2" fillOpacity={0.75} stroke="#E11D48" strokeWidth={1.6} strokeDasharray="5 4" />
        {slices.map((s, i) => (
          <path key={i} d={sectorPath(cx, cy, r - 3, s.a0, s.a1)} fill={s.color} fillOpacity={0.35} stroke="#E11D48" strokeWidth={1.2} strokeDasharray="4 3" data-cake-slice={s.kid} />
        ))}
      </g>
    );
  }
  const rim = Math.max(2.5, r * 0.12);
  const dots = r > 22 ? 12 : 8;
  return (
    <g {...rest}>
      <defs>
        <radialGradient id={`k${id}`} cx="50%" cy="42%" r="62%">
          <stop offset="0" stopColor="#FFF8E7" />
          <stop offset="0.7" stopColor="#FCE7B6" />
          <stop offset="1" stopColor="#F2C27A" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy + r * 0.12} rx={r * 1.02} ry={r * 0.96} fill="#1E1B4B" opacity={0.12} />
      <circle cx={cx} cy={cy} r={r} fill="#D98E3B" stroke="#9A5A14" strokeWidth={1.2} />
      <circle cx={cx} cy={cy} r={r - rim} fill={`url(#k${id})`} stroke="#F6D79A" strokeWidth={1} />
      {Array.from({ length: dots }, (_, i) => {
        const [x, y] = pt(cx, cy, r - rim * 0.5, (i + 0.5) / dots);
        return <circle key={i} cx={x} cy={y} r={Math.max(1.1, r * 0.04)} fill="#FFFFFF" opacity={0.85} />;
      })}
      {slices.map((s, i) => (s.rest
        ? <path key={i} d={sectorPath(cx, cy, r - rim, s.a0, s.a1)} fill="#FFE4E6" fillOpacity={0.35} stroke="#E11D48" strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" data-cake-rest data-fs-gap />
        : <path key={i} d={sectorPath(cx, cy, r - rim, s.a0, s.a1)} fill={s.color} fillOpacity={0.82} stroke="#FFFFFF" strokeWidth={1.6} strokeLinejoin="round" data-cake-slice={s.kid} />))}
      {label && slices.map((s, i) => {
        const span = s.a1 - s.a0;
        if (s.rest || s.kid == null || s.kid < 0 || span * TAU * (r - rim) * 0.6 < 15) return null;
        const mid = (s.a0 + s.a1) / 2;
        const [x, y] = span >= 0.9999 ? [cx, cy] : pt(cx, cy, (r - rim) * (span > 0.6 ? 0.4 : 0.62), mid);
        return (
          <text key={`t${i}`} x={x} y={y + 4} textAnchor="middle" fontSize={Math.max(10, Math.min(15, r * 0.34))} fontWeight={800} fill="#FFFFFF" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>
            {s.kid + 1}
          </text>
        );
      })}
      {cuts >= 2 && Array.from({ length: cuts }, (_, i) => {
        const [x, y] = pt(cx, cy, r - 1, i / cuts);
        return <line key={`c${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#5B3208" strokeWidth={1.3} strokeDasharray="3 2" opacity={0.75} data-cake-cut />;
      })}
      {!slices.some((s) => !s.rest) && <circle cx={cx} cy={cy} r={Math.max(3, r * 0.13)} fill="#E11D48" stroke="#9F1239" strokeWidth={1} />}
    </g>
  );
}
