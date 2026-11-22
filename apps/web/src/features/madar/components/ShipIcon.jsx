import { useId } from 'react';
import { hullPath, shipById } from '../engine/ships';

/** Un vaisseau en SVG (listes, classement, déblocage) — la même silhouette qu'en vol. */
export default function ShipIcon({ id, size = 40, locked = false, flame = true, className = '' }) {
  const ship = shipById(id);
  const gid = useId().replace(/:/g, '');
  const [kx, ky, kw, kh] = ship.cockpit;
  return (
    <svg viewBox="-1.6 -1.2 2.8 2.4" width={size} height={size} className={className} aria-hidden="true" style={{ transform: 'scaleX(-1)' }}>
      <defs>
        <linearGradient id={`b${gid}`} x1="0" y1="-1" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor={locked ? '#64748b' : ship.colors.body} />
          <stop offset="1" stopColor={locked ? '#334155' : ship.colors.accent} />
        </linearGradient>
        <linearGradient id={`f${gid}`} x1="-0.7" y1="0" x2="-1.6" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={ship.colors.flame[0]} />
          <stop offset="0.45" stopColor={ship.colors.flame[1]} />
          <stop offset="1" stopColor={ship.colors.flame[1]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {flame && !locked && <path d="M-0.72 -0.2 Q-1.25 0 -0.72 0.2 L-1.55 0 Z" fill={`url(#f${gid})`} />}
      <path d={hullPath(ship)} fill={`url(#b${gid})`} stroke={locked ? '#475569' : ship.colors.accent} strokeWidth="0.07" strokeLinejoin="round" />
      <ellipse cx={kx} cy={ky} rx={kw} ry={kh} fill={locked ? '#94a3b8' : ship.colors.cockpit} />
    </svg>
  );
}
