import KidFigure from '../../primitives/KidFigure';
import { matGeometry, ticksOf, arcHeight } from './geometry';

/**
 * LE MONDE DESSINÉ du labo `robot-track` (thème `roboticsClub`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Le local du نادي الروبوتيك : un long tapis posé au sol, vu de biais (perspective douce, ombres), gradué comme une droite des nombres ; la moitié
 * des nombres négatifs d'une couleur, celle des nombres positifs d'une autre ; le poteau 0 est un petit portique à miroir au milieu ; la raie du but
 * est une petite flamme plantée sur le tapis ; un robot à roues et aux yeux LED ; les sauts par-dessus le poteau restent tracés en arcs numérotés.
 * Deux enfants (KidFigure) de chaque côté : سلمى (hijab) et أمين. Le dessin EST l'argument : le robot SAUTE le poteau chaque fois qu'une carte est négative.
 * Tout est décor `aria-hidden` sauf le robot (son aria dit où il est).
 */
const FONT = 'ui-sans-serif, system-ui, sans-serif';
const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
export const minus = (s) => String(s).replace(/-/g, '−');

export default function MatArt({
  uid, width, height, max, tick, label, flag = null, pos = 1, stopText = '', jumps = [], showArcs = true, offLabel = null, words, mood = 'neutral', glow = false, ariaLabel,
}) {
  const g = matGeometry({ width, max });
  const yc = Math.round(height * 0.62);
  const ground = yc + 5;
  const half = g.half;
  const x0 = g.x0;
  const skew = 14;
  const top = yc - 34;
  const bot = yc + 34;
  const left = x0 - half - 10;
  const right = x0 + half + 10;
  const xr = g.x(pos);
  const kidTop = height - 78;
  const kidFoot = height - 8;
  const flagX = flag != null ? g.x(flag) : null;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: width }} role="img" aria-label={ariaLabel} data-rt-svg>
      <defs>
        <linearGradient id={`${uid}-neg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
        <linearGradient id={`${uid}-pos`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#99F6E4" /><stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0F2FE" stopOpacity="0.9" /><stop offset="1" stopColor="#93C5FD" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id={`${uid}-negclip`}><rect x={0} y={0} width={x0} height={height} /></clipPath>
        <clipPath id={`${uid}-posclip`}><rect x={x0} y={0} width={width - x0} height={height} /></clipPath>
      </defs>
      {/* le sol du club */}
      <rect x={0} y={0} width={width} height={height} fill="#EEF2FF" />
      <rect x={0} y={yc + 40} width={width} height={height - yc - 40} fill="#E0E7FF" />
      <path d={`M0 ${yc + 40} H${width}`} stroke="#C7D2FE" strokeWidth={2} />
      {/* l'ombre et le tapis, vu de biais */}
      <polygon points={`${left + skew + 4},${top + 8} ${right - skew + 4},${top + 8} ${right + 10},${bot + 8} ${left - 4},${bot + 8}`} fill="#1E1B4B" opacity={0.12} />
      <g clipPath={`url(#${uid}-negclip)`}>
        <polygon points={`${left + skew},${top} ${right - skew},${top} ${right},${bot} ${left},${bot}`} fill={`url(#${uid}-neg)`} stroke="#B45309" strokeWidth={2.5} strokeLinejoin="round" />
      </g>
      <g clipPath={`url(#${uid}-posclip)`}>
        <polygon points={`${left + skew},${top} ${right - skew},${top} ${right},${bot} ${left},${bot}`} fill={`url(#${uid}-pos)`} stroke="#0F766E" strokeWidth={2.5} strokeLinejoin="round" />
      </g>
      <text x={x0 - half * 0.62} y={top + 14} textAnchor="middle" fontSize={12} fontWeight={900} fill="#92400E" fontFamily={FONT}>{words.neg}</text>
      <text x={x0 + half * 0.62} y={top + 14} textAnchor="middle" fontSize={12} fontWeight={900} fill="#115E59" fontFamily={FONT}>{words.pos}</text>
      {/* les graduations */}
      <line x1={x0 - half} x2={x0 + half} y1={yc} y2={yc} stroke="#78350F" strokeWidth={2} opacity={0.55} />
      {ticksOf({ max, tick, label }).map((t) => (
        <g key={t.v}>
          <line x1={g.x(t.v)} x2={g.x(t.v)} y1={yc - (t.labelled ? 7 : 4)} y2={yc + (t.labelled ? 7 : 4)} stroke="#78350F" strokeWidth={t.labelled ? 2.2 : 1.4} opacity={0.75} />
          {t.labelled && t.v !== 0 && (
            <text x={g.x(t.v)} y={yc + 24} textAnchor="middle" fontSize={12} fontWeight={800} fill="#44403C" fontFamily={FONT} style={LTR}>{minus(t.v)}</text>
          )}
        </g>
      ))}
      <text x={x0} y={yc + 26} textAnchor="middle" fontSize={14} fontWeight={900} fill="#1E1B4B" fontFamily={FONT} style={LTR}>0</text>
      {/* le point de départ : le nombre 1 */}
      <g data-rt-start>
        <circle cx={g.x(1)} cy={yc} r={4.5} fill="#4338CA" opacity={0.85} />
      </g>
      {/* le poteau 0 : un petit portique à miroir */}
      <g aria-hidden="true" data-rt-post>
        <rect x={x0 - 15} y={yc - 50} width={30} height={52} rx={4} fill={`url(#${uid}-glass)`} stroke="#6366F1" strokeWidth={2} opacity={0.9} />
        <rect x={x0 - 18} y={yc - 54} width={36} height={7} rx={3} fill="#4338CA" />
        <rect x={x0 - 18} y={yc - 2} width={36} height={6} rx={2} fill="#4338CA" />
        <path d={`M${x0 - 8} ${yc - 38} L${x0 + 4} ${yc - 46} M${x0 - 8} ${yc - 24} L${x0 + 8} ${yc - 36}`} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      </g>
      {/* la raie du but */}
      {flag != null && (
        <g data-rt-flag data-flag={flag}>
          <line x1={flagX} x2={flagX} y1={yc + 4} y2={yc - 50} stroke="#334155" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M${flagX} ${yc - 50} L${flagX + 26} ${yc - 42} L${flagX} ${yc - 33} Z`} fill="#F43F5E" stroke="#9F1239" strokeWidth={1.5} strokeLinejoin="round" />
          <text x={flagX} y={yc - 56} textAnchor="middle" fontSize={13} fontWeight={900} fill="#9F1239" fontFamily={FONT} style={LTR}>{minus(flag)}</text>
        </g>
      )}
      {/* les sauts : des arcs numérotés au-dessus du tapis, laissés comme une trace */}
      {showArcs && jumps.map((j) => {
        const xa = g.x(j.from);
        const xb = g.x(j.to);
        const h = arcHeight(xb - xa);
        const mid = (xa + xb) / 2;
        return (
          <g key={j.n} data-rt-arc={j.n}>
            <path d={`M${xa} ${yc - 6} Q${mid} ${yc - 6 - h * 1.6} ${xb} ${yc - 6}`} fill="none" stroke="#6D28D9" strokeWidth={2.4} strokeDasharray="5 4" strokeLinecap="round" opacity={0.85} />
            <circle cx={mid} cy={yc - 6 - h * 0.8} r={9} fill="#EDE9FE" stroke="#6D28D9" strokeWidth={1.8} />
            <text x={mid} y={yc - 6 - h * 0.8 + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#4C1D95" fontFamily={FONT} style={LTR}>{j.n}</text>
          </g>
        );
      })}
      {/* le robot */}
      <g data-rt-robot data-pos={pos} data-stop={stopText} transform={`translate(${xr} 0)`} style={{ transition: 'transform 320ms ease-out' }} role="img" aria-label={ariaLabel}>
        <ellipse cx={0} cy={ground + 2} rx={20} ry={4.5} fill="#1E1B4B" opacity={0.18} />
        <line x1={0} x2={0} y1={ground - 40} y2={ground - 30} stroke="#475569" strokeWidth={2} />
        <circle cx={0} cy={ground - 42} r={3.2} fill={glow ? '#34D399' : '#F43F5E'} />
        <rect x={-16} y={ground - 32} width={32} height={22} rx={8} fill="#6366F1" stroke="#3730A3" strokeWidth={2} />
        <rect x={-11} y={ground - 28} width={22} height={11} rx={5} fill="#0F172A" />
        <circle cx={-5} cy={ground - 22.5} r={2.6} fill={glow ? '#4ADE80' : '#38BDF8'} />
        <circle cx={5} cy={ground - 22.5} r={2.6} fill={glow ? '#4ADE80' : '#38BDF8'} />
        <rect x={-19} y={ground - 10} width={38} height={7} rx={3.5} fill="#4338CA" />
        <circle cx={-11} cy={ground - 3} r={5.2} fill="#334155" /><circle cx={11} cy={ground - 3} r={5.2} fill="#334155" />
        <circle cx={-11} cy={ground - 3} r={1.8} fill="#CBD5E1" /><circle cx={11} cy={ground - 3} r={1.8} fill="#CBD5E1" />
      </g>
      {offLabel && (
        <text x={xr + (pos > 0 ? -26 : 26)} y={yc - 52} textAnchor="middle" fontSize={13} fontWeight={900} fill="#9F1239" fontFamily={FONT} style={LTR} data-rt-off>{offLabel}</text>
      )}
      <KidFigure cx={24} top={kidTop} foot={kidFoot} hairStyle="hijab" scarf="lavender" outfit="violet" skin="medium" mood={mood} data-rt-kid />
      <KidFigure cx={width - 24} top={kidTop + 3} foot={kidFoot} hairStyle="short" hair="brown" outfit="blue" skin="light" mood={mood} />
    </svg>
  );
}
