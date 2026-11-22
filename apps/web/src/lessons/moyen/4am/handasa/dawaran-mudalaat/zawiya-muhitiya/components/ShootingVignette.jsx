
/**
 * La vignette de la carte d'activité du نشاط 4 : la surface de réparation vue d'en haut, le but, le cercle peint et trois
 * tireurs dessus — la même scène que le lab, en petit. DÉCOR (aria-hidden) : aucune mesure, aucun angle écrit.
 */
export default function ShootingVignette() {
  const r = 34; const cx = 80; const cy = 54;
  const at = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  const A = at(150); const B = at(30);
  const shooters = [215, 270, 325].map(at);
  return (
    <svg viewBox="0 0 160 100" className="h-24 w-auto" aria-hidden="true" style={{ direction: 'ltr' }}>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={0} y={i * 20} width={160} height={20} fill={i % 2 ? '#15803D' : '#16A34A'} />)}
      <rect x={0} y={0} width={160} height={14} fill="#1E293B" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={7 + i * 13} cy={7} r={2.4} fill={i % 3 === 0 ? '#16A34A' : i % 3 === 1 ? '#F8FAFC' : '#DC2626'} />)}
      <line x1={0} y1={A[1]} x2={160} y2={A[1]} stroke="#ECFDF5" strokeWidth={1.2} />
      <rect x={A[0]} y={A[1] - 7} width={B[0] - A[0]} height={7} fill="none" stroke="#F8FAFC" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeDasharray="4 3" />
      {shooters.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={A[0]} y2={A[1]} stroke="#F59E0B" strokeWidth={1.1} opacity={0.9} />
          <line x1={x} y1={y} x2={B[0]} y2={B[1]} stroke="#F59E0B" strokeWidth={1.1} opacity={0.9} />
          <circle cx={x} cy={y} r={3.6} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1} />
          <rect x={x - 2.5} y={y - 11} width={5} height={6} rx={1.5} fill="#059669" />
        </g>
      ))}
      <circle cx={A[0]} cy={A[1]} r={2.6} fill="#FFFFFF" /><circle cx={B[0]} cy={B[1]} r={2.6} fill="#FFFFFF" />
    </svg>
  );
}
