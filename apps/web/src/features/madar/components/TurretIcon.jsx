import { TURRETS } from '../defense/constants';

/** Une tourelle en SVG (menus, hangar) — la même silhouette qu'au canevas. */
export default function TurretIcon({ type, size = 36, locked = false }) {
  const color = locked ? '#64748b' : TURRETS[type].color;
  const hex = Array.from({ length: 6 }, (_, i) => `${Math.cos((i / 6) * Math.PI * 2).toFixed(3)},${Math.sin((i / 6) * Math.PI * 2).toFixed(3)}`).join(' ');
  return (
    <svg viewBox="-1.3 -1.3 2.6 2.6" width={size} height={size} aria-hidden="true">
      <polygon points={hex} fill="#0f172a" stroke={color} strokeWidth="0.14" />
      {type === 'pulse' && [0, 1, 2, 3].map((i) => <rect key={i} x="0.2" y="-0.12" width="0.6" height="0.24" fill={color} transform={`rotate(${i * 90})`} />)}
      {type === 'tesla' && [0, 1, 2].map((i) => <rect key={i} x="0.2" y="-0.12" width="0.6" height="0.24" fill={color} transform={`rotate(${i * 120 + 30})`} />)}
      {type === 'laser' && <rect x="0" y="-0.18" width="0.95" height="0.36" fill={color} transform="rotate(-35)" />}
      {type === 'rail' && <rect x="0" y="-0.12" width="1.2" height="0.24" fill={color} transform="rotate(-35)" />}
      {type === 'frost' && (
        <>
          <circle r="0.95" fill={color} opacity="0.15" />
          <rect x="0" y="-0.18" width="0.85" height="0.36" fill={color} transform="rotate(-35)" />
        </>
      )}
      <circle r="0.42" fill={color} />
    </svg>
  );
}
