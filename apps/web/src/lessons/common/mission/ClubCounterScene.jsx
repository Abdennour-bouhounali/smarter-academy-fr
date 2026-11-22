import KidFigure from '../manipulations/primitives/KidFigure';

const W = 480;
const H = 260;
const GROUND = 214;

/** Un ticket de séance (un petit rectangle à encoche) — sans nombre. */
function Ticket({ x, y, color }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="22" height="14" rx="2" fill={color} stroke="#334155" strokeWidth="1" />
      <circle cx="0" cy="7" r="3" fill="#F8FAFC" />
      <circle cx="22" cy="7" r="3" fill="#F8FAFC" />
    </g>
  );
}

/**
 * LE GUICHET DU CLUB (la synthèse de l'unité 4 `wadiya-idmajiya-muadalat`, `mission.scene = 'club-counter'`, 2026-11-12) — une scène MINCE dessinée
 * en code : le mur d'un club de sport et DEUX panneaux de prix, aux étiquettes VIDES (aucun nombre, aucune lettre) — à gauche une rangée de
 * tickets de séance de même taille ; à droite une carte d'abonnement, puis une rangée de tickets plus PETITS. Les élèves sont le personnage
 * partagé `KidFigure` : une fille en hijab (tenue islamique) qui compare les deux panneaux, un garçon qui les montre. Une synthèse n'a rien à
 * gagner (les clés sont à l'élève dès le départ) : `fill` éclaire seulement les panneaux. Ni piscine ni lieu de la وضعية : le décor reste neutre.
 */
export default function ClubCounterScene({ fill = 1, label, className = '', scene = 'club-counter' }) {
  const f = Math.max(0, Math.min(1, fill));
  const board = (x, title) => (
    <g data-club-board={title}>
      <rect x={x} y="46" width="150" height="112" rx="10" fill="#FFFBEB" stroke="#B45309" strokeWidth="3" />
      {/* l'étiquette du prix : vide */}
      <rect x={x + 36} y="56" width="78" height="20" rx="6" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      data-scene={scene} data-club-fill={f.toFixed(2)}>
      {/* le mur et le sol du club */}
      <rect x="0" y="0" width={W} height={GROUND} fill="#E0E7FF" />
      <rect x="0" y={GROUND} width={W} height={H - GROUND} fill="#CBD5E1" />
      <rect x="0" y={GROUND - 8} width={W} height="8" fill="#94A3B8" />
      <g opacity={0.65 + 0.35 * f}>
        {board(70, 'per-session')}
        {[0, 1, 2, 3].map((i) => [0, 1].map((j) => <Ticket key={`a${i}${j}`} x={86 + i * 30} y={90 + j * 26} color="#93C5FD" />))}
        {board(260, 'subscription')}
        {/* la carte d'abonnement, puis des tickets plus petits */}
        <rect x="276" y="88" width="46" height="30" rx="4" fill="#A7F3D0" stroke="#047857" strokeWidth="1.5" />
        <rect x="282" y="95" width="18" height="4" rx="2" fill="#047857" />
        {[0, 1, 2, 3].map((i) => (
          <g key={`b${i}`} transform={`translate(${330 + (i % 2) * 34} ${92 + Math.floor(i / 2) * 22}) scale(0.7)`}>
            <Ticket x={0} y={0} color="#FCD34D" />
          </g>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={`c${i}`} transform={`translate(${278 + i * 30} 130) scale(0.7)`}>
            <Ticket x={0} y={0} color="#FCD34D" />
          </g>
        ))}
      </g>
      <KidFigure cx={40} top={GROUND - 112} foot={GROUND + 4} hairStyle="hijab" scarf="lavender" outfit="teal" mood="wonder" />
      <KidFigure cx={440} top={GROUND - 114} foot={GROUND + 4} outfit="orange" mood="happy" />
    </svg>
  );
}
