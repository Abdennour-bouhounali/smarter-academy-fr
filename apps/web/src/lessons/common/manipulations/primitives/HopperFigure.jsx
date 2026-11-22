
/**
 * LE SAUTEUR — un petit lapin dessiné en SVG (2026-10-14, labo `division-jumps` متقدم, 1AM). Un `<g>` à poser DANS la
 * scène : ses pattes touchent (x, y) — le point d'arrivée de la dernière قفزة sur le مستقيم المدرّج — et il regarde
 * vers la droite (le sens des nombres). `size` ≈ la hauteur du corps ; les oreilles montent à ≈ 1,12 × size.
 *
 * `mood` : 'idle' (posé), 'happy' (l'arrêt juste : il sourit), 'oops' (il a sauté APRÈS le nombre : il est tombé dans
 * la mare — des gouttes autour des pattes, la bouche ronde). L'humeur ne fait que SUIVRE le verdict exact du labo ;
 * elle n'annonce rien avant le relâchement.
 */
export default function HopperFigure({ x, y, size: s, mood = 'idle', ...rest }) {
  const fur = '#FFFFFF';
  const line = '#4338CA';
  const sw = Math.max(1.1, s * 0.045);
  const hx = x + s * 0.22;
  const hy = y - s * 0.62;
  return (
    <g {...rest}>
      <ellipse cx={x} cy={y + 1} rx={s * 0.42} ry={s * 0.07} fill="#312E81" opacity={mood === 'oops' ? 0 : 0.14} />
      {/* la queue, le corps, la patte arrière */}
      <circle cx={x - s * 0.36} cy={y - s * 0.34} r={s * 0.1} fill={fur} stroke={line} strokeWidth={sw} />
      <ellipse cx={x - s * 0.06} cy={y - s * 0.3} rx={s * 0.32} ry={s * 0.26} fill={fur} stroke={line} strokeWidth={sw} />
      <ellipse cx={x - s * 0.12} cy={y - s * 0.06} rx={s * 0.2} ry={s * 0.07} fill={fur} stroke={line} strokeWidth={sw} />
      <ellipse cx={x + s * 0.16} cy={y - s * 0.08} rx={s * 0.08} ry={s * 0.06} fill={fur} stroke={line} strokeWidth={sw} />
      {/* les oreilles */}
      <g transform={`rotate(-14 ${hx - s * 0.06} ${hy - s * 0.18})`}>
        <ellipse cx={hx - s * 0.06} cy={hy - s * 0.32} rx={s * 0.075} ry={s * 0.22} fill={fur} stroke={line} strokeWidth={sw} />
        <ellipse cx={hx - s * 0.06} cy={hy - s * 0.31} rx={s * 0.035} ry={s * 0.15} fill="#F9A8D4" />
      </g>
      <g transform={`rotate(16 ${hx + s * 0.08} ${hy - s * 0.18})`}>
        <ellipse cx={hx + s * 0.08} cy={hy - s * 0.3} rx={s * 0.075} ry={s * 0.21} fill={fur} stroke={line} strokeWidth={sw} />
        <ellipse cx={hx + s * 0.08} cy={hy - s * 0.29} rx={s * 0.035} ry={s * 0.14} fill="#F9A8D4" />
      </g>
      {/* la tête */}
      <circle cx={hx} cy={hy} r={s * 0.21} fill={fur} stroke={line} strokeWidth={sw} />
      <circle cx={hx + s * 0.02} cy={hy + s * 0.08} r={s * 0.05} fill="#FBCFE8" opacity={0.9} />
      <circle cx={hx + s * 0.08} cy={hy - s * 0.03} r={s * 0.035} fill="#1E1B4B" />
      <circle cx={hx + s * 0.09} cy={hy - s * 0.045} r={s * 0.012} fill="#FFFFFF" />
      <circle cx={hx + s * 0.2} cy={hy + s * 0.02} r={s * 0.035} fill="#EC4899" />
      {mood === 'happy' && <path d={`M${hx + s * 0.08} ${hy + s * 0.08} q${s * 0.05} ${s * 0.05} ${s * 0.1} 0`} fill="none" stroke="#1E1B4B" strokeWidth={sw * 0.8} strokeLinecap="round" />}
      {mood === 'oops' && <circle cx={hx + s * 0.12} cy={hy + s * 0.1} r={s * 0.03} fill="none" stroke="#1E1B4B" strokeWidth={sw * 0.8} />}
      {/* la mare : des gouttes autour des pattes */}
      {mood === 'oops' && (
        <g fill="#38BDF8">
          <path d={`M${x - s * 0.5} ${y - s * 0.12} q${-s * 0.06} ${-s * 0.12} 0 ${-s * 0.2} q${s * 0.06} ${s * 0.08} 0 ${s * 0.2} Z`} />
          <path d={`M${x + s * 0.42} ${y - s * 0.16} q${-s * 0.06} ${-s * 0.12} 0 ${-s * 0.2} q${s * 0.06} ${s * 0.08} 0 ${s * 0.2} Z`} />
          <ellipse cx={x} cy={y + 1} rx={s * 0.5} ry={s * 0.08} fill="none" stroke="#0EA5E9" strokeWidth={1.4} />
        </g>
      )}
    </g>
  );
}
