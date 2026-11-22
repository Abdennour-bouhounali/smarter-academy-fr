import KidFigure from '../../primitives/KidFigure';
import { lockerSlots, booksOf, LOCKER_W, LOCKER_H } from './geometry';

/**
 * LE MONDE DESSINÉ du labo `code-lockers` (thème `libraryLockers`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Le hall de la bibliothèque municipale vu de face : un mur d'étagères de livres, une lampe de lecture, l'affiche « الكتاب صديق », une rangée de petits
 * casiers numérotés (fermé / celui qu'on ouvre / ouvert, la porte entrouverte et un livre qui dépasse) et, à droite, le comptoir où إيناس (KidFigure,
 * hijab) attend. Le casier ACTIF est grand, au premier plan : il est dessiné en DOM par le labo (les molettes se saisissent). Le texte arabe est du
 * texte vivant ; tout est décor `aria-hidden`.
 */
const FONT = 'ui-sans-serif, system-ui, sans-serif';
const SPINES = ['#F97316', '#38BDF8', '#A78BFA', '#34D399', '#FB7185', '#FBBF24'];

export default function HallArt({ uid, width, height, lockers = [], current = 0, mood = 'neutral', words, glow = false }) {
  const shelfW = Math.min(width * 0.34, 170);
  const kidW = 54;
  const wallX0 = shelfW + 34;
  const wallX1 = width - kidW - 38;
  const xs = lockerSlots(lockers.length, wallX0, wallX1);
  const lockerY = height - LOCKER_H - 12;
  const floor = height - 6;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: width }} aria-hidden="true" data-cl-hall>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEF3C7" /><stop offset="1" stopColor="#FDE68A" /></linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B45309" /><stop offset="1" stopColor="#92400E" /></linearGradient>
        <radialGradient id={`${uid}-lamp`} cx="0.5" cy="0" r="0.9"><stop offset="0" stopColor="#FEF08A" stopOpacity="0.9" /><stop offset="1" stopColor="#FEF08A" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill={`url(#${uid}-wall)`} />
      <rect x={0} y={floor - 6} width={width} height={12} fill="#A16207" opacity={0.55} />
      {/* les étagères */}
      <g data-cl-shelves>
        {[18, 52].map((y, r) => (
          <g key={y}>
            {booksOf(shelfW, r * 3).map((b, i) => (
              <rect key={i} x={10 + b.x} y={y + 22 - b.h} width={b.w} height={b.h} rx={1.5} fill={SPINES[(b.c + r) % SPINES.length]} opacity={0.92} />
            ))}
            <rect x={6} y={y + 22} width={shelfW + 8} height={5} rx={2} fill={`url(#${uid}-wood)`} />
          </g>
        ))}
      </g>
      {/* la lampe de lecture */}
      <g>
        <ellipse cx={shelfW + 26} cy={34} rx={34} ry={30} fill={`url(#${uid}-lamp)`} />
        <path d={`M${shelfW + 26} 10 v12`} stroke="#78350F" strokeWidth={2} />
        <path d={`M${shelfW + 14} 30 q12 -16 24 0 z`} fill="#16A34A" stroke="#14532D" strokeWidth={1.5} />
      </g>
      {/* l'affiche */}
      <g>
        <rect x={wallX0 + 6} y={8} width={Math.min(98, wallX1 - wallX0 - 12)} height={36} rx={4} fill="#FFFFFF" stroke="#0F766E" strokeWidth={2} />
        <text x={wallX0 + 6 + Math.min(98, wallX1 - wallX0 - 12) / 2} y={31} textAnchor="middle" fontSize={14} fontWeight={900} fill="#0F766E" fontFamily={FONT}>{words.poster}</text>
      </g>
      {/* le mur de petits casiers */}
      <g data-cl-wall>
        {xs.map((x, i) => {
          const st = lockers[i];
          const cur = i === current;
          return (
            <g key={i} data-cl-small={i} data-state={st.state}>
              <rect x={x} y={lockerY} width={LOCKER_W} height={LOCKER_H} rx={3} fill="#451A03" stroke={cur ? '#4F46E5' : '#78350F'} strokeWidth={cur ? 3 : 1.5} />
              {st.state === 'open' ? (
                <g>
                  <rect x={x + 3} y={lockerY + 3} width={LOCKER_W - 6} height={LOCKER_H - 6} fill="#FDE68A" />
                  <rect x={x + 8} y={lockerY + 12} width={10} height={LOCKER_H - 18} rx={1.5} fill="#38BDF8" />
                  <polygon points={`${x + 3},${lockerY + 3} ${x - 7},${lockerY + 7} ${x - 7},${lockerY + LOCKER_H - 4} ${x + 3},${lockerY + LOCKER_H - 3}`} fill={`url(#${uid}-wood)`} stroke="#78350F" strokeWidth={1.2} />
                </g>
              ) : (
                <g>
                  <rect x={x + 3} y={lockerY + 3} width={LOCKER_W - 6} height={LOCKER_H - 6} rx={2} fill={`url(#${uid}-wood)`} />
                  <circle cx={x + LOCKER_W - 9} cy={lockerY + LOCKER_H / 2} r={2.6} fill="#FDE047" stroke="#92400E" strokeWidth={0.8} />
                </g>
              )}
              <text x={x + LOCKER_W / 2} y={lockerY + 14} textAnchor="middle" fontSize={10} fontWeight={900} fill={st.state === 'open' ? '#78350F' : '#FEF3C7'} fontFamily={FONT} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{i + 1}</text>
            </g>
          );
        })}
      </g>
      {/* le comptoir et إيناس */}
      <g>
        <rect x={width - kidW - 30} y={floor - 30} width={kidW + 26} height={32} rx={3} fill={`url(#${uid}-wood)`} stroke="#78350F" strokeWidth={1.5} />
        <text x={width - kidW - 30 + (kidW + 26) / 2} y={floor - 10} textAnchor="middle" fontSize={11} fontWeight={900} fill="#FEF3C7" fontFamily={FONT}>{words.desk}</text>
        <KidFigure cx={width - kidW / 2 - 10} top={floor - 84} foot={floor - 30} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={glow ? 'proud' : mood} data-cl-kid />
      </g>
    </svg>
  );
}
