import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const FLOOR = 196;

/**
 * LA BALANCE DU VESTIAIRE (leçon `muadala-ula`, rollout 2026-11-11 ; conseil du 2026-11-11, verdict « L1 ») — dessinée en code (CLAUDE.md : aucune
 * image générée dans les leçons). Le vestiaire de l'équipe : une rangée de casiers, un banc, et sur le banc une balance de Roberval à deux plateaux
 * où des SACS ATTACHÉS sont entassés des deux côtés (qui se chevauchent : on ne peut pas les compter), un ballon et une pompe par terre. Un garçon
 * (l'aide de l'équipe, par `KidFigure`) regarde la balance. `fill` ∈ [0, 1] suit les trois outils : les portes des casiers s'allument un tiers à la
 * fois (deux par outil) et le lien du sac le plus proche se desserre ; à 1 le sac est ouvert et des balles en dépassent (sans les compter).
 * Aucun nombre, aucune lettre « x » n'est dessiné ; le texte arabe reste dans le DOM.
 */
function Sack({ x, y, s = 1, open = false, loose = 0, tone = '#B45309', edge = '#78350F' }) {
  const w = 30 * s; const h = 32 * s;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w * 0.3} ${-h * 0.5} Q${-w * 0.62} ${-h * 0.1} ${-w * 0.55} ${h * 0.2} Q${-w * 0.5} ${h * 0.5} 0 ${h * 0.5} Q${w * 0.5} ${h * 0.5} ${w * 0.55} ${h * 0.2} Q${w * 0.62} ${-h * 0.1} ${w * 0.3} ${-h * 0.5} Z`} fill={tone} stroke={edge} strokeWidth="1.4" />
      {open ? (
        <g data-sack-open>
          <path d={`M${-w * 0.34} ${-h * 0.5} L${-w * 0.5} ${-h * 0.7} L${-w * 0.14} ${-h * 0.6} L0 ${-h * 0.78} L${w * 0.16} ${-h * 0.6} L${w * 0.5} ${-h * 0.7} L${w * 0.34} ${-h * 0.5} Z`} fill="#92400E" />
          {[-0.2, 0.14].map((dx, i) => <circle key={i} cx={w * dx} cy={-h * (0.62 + i * 0.08)} r={5.5 * s} fill="#fff" stroke="#0F172A" strokeWidth="1" />)}
        </g>
      ) : (
        <g>
          <rect x={-w * 0.22} y={-h * 0.58} width={w * 0.44} height={h * 0.12} rx={2} fill="#92400E" />
          <path d={`M${-w * 0.12} ${-h * 0.58} q${-3 - loose * 6} ${-9} ${-9 - loose * 8} ${-4} M${w * 0.12} ${-h * 0.58} q${3 + loose * 6} ${-9} ${9 + loose * 8} ${-4}`} fill="none" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

export default function LockerBalanceScene({ fill = 0, label, className = '', scene = 'locker-balance' }) {
  const f = Math.max(0, Math.min(1, fill));
  const done = f >= 1;
  const litCount = done ? 6 : Math.min(6, Math.floor(f * 3 + 1e-6) * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-fill={f.toFixed(2)}>
      {/* le mur et le sol */}
      <rect x="0" y="0" width={W} height={FLOOR} fill="#EFF6FF" />
      <rect x="0" y={FLOOR} width={W} height={H - FLOOR} fill="#CBD5E1" />
      <rect x="0" y={FLOOR} width={W} height="4" fill="#94A3B8" />
      {/* les casiers : leurs portes s'allument un tiers à la fois */}
      <g data-lockers={litCount}>
        {Array.from({ length: 6 }, (_, i) => {
          const on = i < litCount;
          return (
            <g key={i}>
              <rect x={14 + i * 76} y="14" width="68" height="118" rx="5" fill={on ? '#FDE68A' : '#BFDBFE'} stroke={on ? '#D97706' : '#60A5FA'} strokeWidth="2" />
              <line x1={14 + i * 76 + 34} y1="14" x2={14 + i * 76 + 34} y2="132" stroke={on ? '#F59E0B' : '#93C5FD'} strokeWidth="1.5" />
              <circle cx={14 + i * 76 + 28} cy="78" r="3" fill={on ? '#B45309' : '#1D4ED8'} />
              <circle cx={14 + i * 76 + 40} cy="78" r="3" fill={on ? '#B45309' : '#1D4ED8'} />
            </g>
          );
        })}
      </g>
      {/* le banc */}
      <rect x="86" y="156" width="308" height="14" rx="4" fill="#92400E" />
      <rect x="104" y="170" width="10" height={FLOOR - 170} fill="#78350F" />
      <rect x="366" y="170" width="10" height={FLOOR - 170} fill="#78350F" />
      {/* la balance sur le banc : pied, fléau horizontal, deux plateaux */}
      <g data-balance>
        <rect x="222" y="128" width="12" height="28" fill="#64748B" />
        <rect x="204" y="152" width="48" height="6" rx="3" fill="#475569" />
        <rect x="140" y="92" width="200" height="6" rx="3" fill="#334155" />
        <circle cx="240" cy="95" r="6" fill="#0F172A" />
        <polygon points="240,76 235,92 245,92" fill="#10B981" />
        {[160, 320].map((cx) => (
          <g key={cx}>
            <line x1={cx} y1="95" x2={cx} y2="132" stroke="#94A3B8" strokeWidth="2" />
            <rect x={cx - 36} y="132" width="72" height="6" rx="3" fill="#475569" />
          </g>
        ))}
        {/* des sacs entassés, qui se chevauchent : impossible de les compter */}
        <Sack x={146} y={116} s={0.95} />
        <Sack x={168} y={118} s={0.9} tone="#A16207" />
        <Sack x={156} y={104} s={0.8} tone="#B45309" />
        <Sack x={332} y={116} s={0.95} tone="#A16207" />
        <Sack x={308} y={118} s={0.9} />
        <Sack x={320} y={104} s={0.8} loose={f} open={done} tone="#B45309" />
      </g>
      {/* un ballon et une pompe par terre */}
      <g data-floor-objects>
        <circle cx="404" cy={FLOOR + 24} r="13" fill="#fff" stroke="#0F172A" strokeWidth="1.6" />
        <path d={`M404 ${FLOOR + 17} l5 3.6 -2 6 h-6 l-2 -6 Z`} fill="#0F172A" />
        <rect x="438" y={FLOOR + 14} width="8" height="26" rx="2" fill="#475569" />
        <rect x="434" y={FLOOR + 10} width="16" height="5" rx="2" fill="#0F172A" />
        <path d={`M442 ${FLOOR + 40} q-18 6 -26 -2`} fill="none" stroke="#64748B" strokeWidth="2" />
      </g>
      <KidFigure cx={70} top={106} foot={FLOOR + 40} outfit="orange" mood={done ? 'proud' : 'wonder'} />
    </svg>
  );
}
