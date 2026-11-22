import KidFigure from '../../primitives/KidFigure';
import { SvgPill } from '../../primitives/SvgPill';
import { PILL, RING, AXIS_PAD, minus } from './geometry';

/**
 * LE MONDE DESSINÉ du labo `zero-probe` (thème `researchBoat`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md).
 * Le ciel au-dessus de la ligne du zéro, la mer dessous ; un bateau de recherche sur la ligne (une chercheuse en hijab sur le pont,
 * un mât, un drone au-dessus, un robot plongeur dessous) ; un capteur A fixé (fanion rouge, valeur écrite) ; un capteur B au bout d'un
 * câble qui part du zéro. L'échelle graduée est à droite. Toutes les longueurs viennent de `geo` (échelle verticale `u`) : le dessin EST
 * l'argument — la longueur du câble est la distance à zéro, dessinée.
 */

const LTR = { direction: 'ltr', unicodeBidi: 'isolate' };
const FONT = 'ui-sans-serif, system-ui, sans-serif';

export function SeaDefs({ uid }) {
  return (
    <defs>
      <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#F0F9FF" />
      </linearGradient>
      <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7DD3FC" />
        <stop offset="0.45" stopColor="#0EA5E9" />
        <stop offset="1" stopColor="#0C4A6E" />
      </linearGradient>
      <radialGradient id={`${uid}-knob`} cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#FEF9C3" />
        <stop offset="1" stopColor="#FACC15" />
      </radialGradient>
      <clipPath id={`${uid}-clip`}><rect x={0} y={0} width="100%" height="100%" rx={18} /></clipPath>
    </defs>
  );
}

/** Ciel, mer, vagues, bulles, et la ligne du zéro. */
export function Backdrop({ uid, geo }) {
  const { W, H, y0 } = geo;
  const wave = [];
  for (let x = 0; x <= W; x += 24) wave.push(`${x === 0 ? 'M' : 'L'}${x} ${y0 + (x / 24) % 2 * 2 - 1}`);
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={W} height={H} rx={18} fill={`url(#${uid}-sky)`} />
      <rect x={0} y={y0} width={W} height={H - y0} rx={0} fill={`url(#${uid}-sea)`} clipPath={`url(#${uid}-clip)`} />
      <circle cx={W * 0.78} cy={geo.yOf(8.4)} r={Math.max(11, geo.u * 1.1)} fill="#FDE68A" opacity={0.85} />
      {[[0.1, 7.6, 1], [0.56, 8.9, 0.8], [0.66, 6.2, 0.62]].map(([fx, v, sc], i) => (
        <g key={`c${i}`} transform={`translate(${W * fx} ${geo.yOf(v)}) scale(${sc * Math.max(0.8, geo.u / 14)})`} opacity={0.9}>
          <ellipse cx={0} cy={0} rx={22} ry={7} fill="#FFFFFF" /><ellipse cx={-8} cy={-5} rx={11} ry={8} fill="#FFFFFF" /><ellipse cx={8} cy={-6} rx={13} ry={9} fill="#FFFFFF" />
        </g>
      ))}
      <path d={`M${W * 0.43} ${geo.yOf(5.4)} q 6 -7 12 0 q 6 -7 12 0`} stroke="#475569" strokeWidth={2} fill="none" strokeLinecap="round" />
      {[[0.1, -8.4, 1], [0.64, -8.9, 0.8], [0.36, -9.1, 0.7]].map(([fx, v, sc], i) => (
        <g key={`f${i}`} transform={`translate(${W * fx} ${geo.yOf(v)}) scale(${sc})`} opacity={0.5}>
          <ellipse cx={0} cy={0} rx={10} ry={4.6} fill="#BAE6FD" /><path d="M10 0 l 7 -5 v 10 z" fill="#BAE6FD" /><circle cx={-5} cy={-1} r={1.1} fill="#0C4A6E" />
        </g>
      ))}
      <path d={wave.join(' ')} stroke="#E0F2FE" strokeWidth={2.4} fill="none" opacity={0.9} />
      <line x1={0} x2={geo.axisX} y1={y0} y2={y0} stroke="#0369A1" strokeWidth={1.6} strokeDasharray="2 5" opacity={0.7} />
      {[[0.12, 0.45], [0.27, 0.78], [0.44, 0.34], [0.66, 0.6], [0.74, 0.86]].map(([fx, fy], i) => (
        <circle key={i} cx={W * fx} cy={y0 + (H - y0) * fy} r={2.2 + (i % 3)} fill="#E0F2FE" opacity={0.22} />
      ))}
    </g>
  );
}

/** L'échelle graduée à droite de −10 à 10 : un trait par mètre, un nombre tous les deux mètres, le zéro marqué. */
export function Scale({ geo }) {
  const { axisX, yOf } = geo;
  const ticks = [];
  for (let t = -10; t <= 10; t += 1) {
    const major = t % 2 === 0;
    ticks.push(
      <g key={t} data-zp-tick={t}>
        <line x1={axisX} x2={axisX + (t === 0 ? 14 : major ? 7 : 4)} y1={yOf(t)} y2={yOf(t)} stroke={t === 0 ? '#0C4A6E' : '#475569'} strokeWidth={t === 0 ? 3 : 1.5} strokeLinecap="round" />
        {major && (
          <text x={axisX + (t === 0 ? 18 : 12)} y={yOf(t) + 4} fontSize={t === 0 ? 13 : 11} fontWeight={t === 0 ? 900 : 700} fill={t === 0 ? '#0C4A6E' : '#334155'}
            fontFamily={FONT} style={LTR}>{minus(t)}</text>
        )}
      </g>,
    );
  }
  return (
    <g aria-hidden="true">
      <rect x={axisX - 14} y={yOf(10) - 12} width={AXIS_PAD + 12} height={yOf(-10) - yOf(10) + 24} rx={10} fill="#FFFFFF" opacity={0.78} />
      <rect x={axisX - 3} y={yOf(10) - 4} width={4} height={yOf(-10) - yOf(10) + 8} rx={2} fill="#CBD5E1" opacity={0.9} />
      {ticks}
    </g>
  );
}

/** Le bateau de recherche sur la ligne du zéro : coque, cabine, mât, antenne, la chercheuse (`KidFigure`, hijab) sur le pont, le drone au-dessus. */
export function Boat({ geo, mood }) {
  const { xBoat, boatW, y0, u } = geo;
  const hull = Math.max(14, u * 1.25);
  const x0 = xBoat - boatW / 2;
  const deck = y0 - hull * 0.55;
  const kidH = Math.max(40, Math.min(66, u * 3.7));
  const cabinW = boatW * 0.3;
  const mastX = xBoat + boatW * 0.2;
  const droneX = xBoat + boatW * 0.05;
  const droneY = Math.max(geo.yOf(9.2), y0 - u * 7.2);
  return (
    <g aria-hidden="true" className="zp-bob">
      <ellipse cx={xBoat} cy={y0 + 3} rx={boatW * 0.55} ry={3.2} fill="#0C4A6E" opacity={0.28} />
      {/* mât, antenne radar, fanion */}
      <rect x={mastX - 2} y={deck - u * 4.1} width={4} height={u * 4.1} rx={2} fill="#475569" />
      <ellipse cx={mastX} cy={deck - u * 4.1} rx={9} ry={3} fill="#94A3B8" />
      <path d={`M${mastX + 2} ${deck - u * 4.1 - 2} l 14 4 l -14 4 z`} fill="#F43F5E" />
      {/* cabine */}
      <rect x={xBoat + boatW * 0.02} y={deck - u * 1.9} width={cabinW} height={u * 1.9} rx={4} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1.4} />
      <rect x={xBoat + boatW * 0.02 + cabinW * 0.18} y={deck - u * 1.5} width={cabinW * 0.64} height={u * 0.75} rx={2.5} fill="#7DD3FC" stroke="#0369A1" strokeWidth={1} />
      {/* coque */}
      <path d={`M${x0} ${deck} L${x0 + boatW} ${deck} L${x0 + boatW - hull * 0.8} ${deck + hull} L${x0 + hull * 0.8} ${deck + hull} Z`} fill="#1D4ED8" stroke="#1E3A8A" strokeWidth={1.6} />
      <rect x={x0 + 2} y={deck - 2} width={boatW - 4} height={5} rx={2.5} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={1} />
      <path d={`M${x0 + hull * 0.5} ${deck + hull * 0.55} h ${boatW - hull}`} stroke="#93C5FD" strokeWidth={2} />
      <KidFigure cx={xBoat - boatW * 0.22} top={deck - 3 - kidH} foot={deck - 2} hairStyle="hijab" scarf="mint" outfit="teal" skin="wheat" mood={mood} data-zp-kid data-mood={mood} />
      {/* drone */}
      <g transform={`translate(${droneX} ${droneY})`}>
        <ellipse cx={0} cy={0} rx={11} ry={4.5} fill="#334155" />
        <circle cx={0} cy={1} r={3} fill="#38BDF8" />
        {[-1, 1].map((s) => <g key={s}><line x1={s * 11} x2={s * 17} y1={0} y2={-4} stroke="#334155" strokeWidth={2} /><ellipse cx={s * 17} cy={-5} rx={8} ry={1.8} fill="#94A3B8" className="zp-prop" /></g>)}
      </g>
    </g>
  );
}

/** Un robot plongeur, sous la surface : un décor (aucune étiquette ne lui appartient). */
export function Diver({ geo }) {
  const x = geo.xBoat - geo.boatW * 0.1;
  const y = geo.yOf(-6.4);
  return (
    <g aria-hidden="true" opacity={0.92} className="zp-bob">
      <rect x={x - 13} y={y - 8} width={26} height={16} rx={7} fill="#F59E0B" stroke="#B45309" strokeWidth={1.5} />
      <circle cx={x + 7} cy={y - 1} r={4.2} fill="#E0F2FE" stroke="#0369A1" strokeWidth={1.2} />
      <path d={`M${x - 13} ${y} l -7 -4 v 8 z`} fill="#B45309" />
      <rect x={x - 3} y={y + 7} width={6} height={4} rx={2} fill="#78350F" />
    </g>
  );
}

/** Le capteur A : le fanion (une pastille rouge portant sa valeur) au bout d'une tige fixée à la surface. */
export function SensorA({ geo, text, ...rest }) {
  const y = geo.yOf(Number(String(text).replace(',', '.')));
  return (
    <g {...rest}>
      <line x1={geo.xA} x2={geo.xA} y1={geo.y0} y2={y} stroke="#9F1239" strokeWidth={3} strokeLinecap="round" />
      <circle cx={geo.xA} cy={geo.y0} r={5} fill="#E11D48" stroke="#FFF1F2" strokeWidth={1.5} />
      <SvgPill x={geo.xA} y={y} text={`A = ${minus(text)}`} fill="#E11D48" size={PILL} />
    </g>
  );
}

/** Une borne de zone (`between`) : une ligne pointillée verte sur toute la scène et sa pastille (lo sous la ligne, hi au-dessus). */
export function Bound({ geo, id, text, ...rest }) {
  const y = geo.yOf(Number(String(text).replace(',', '.')));
  const dy = id === 'hi' ? -(Math.round(PILL * 1.9) / 2 + 1) : (Math.round(PILL * 1.9) / 2 + 1);
  return (
    <g {...rest}>
      <line x1={0} x2={geo.axisX} y1={y} y2={y} stroke="#059669" strokeWidth={2} strokeDasharray="6 4" />
      <SvgPill x={geo.xA} y={y + dy} text={minus(text)} fill="#059669" size={PILL} />
    </g>
  );
}

/** La zone entre les deux bornes, teintée. */
export function Band({ geo, lo, hi, lit }) {
  const yHi = geo.yOf(Number(String(hi).replace(',', '.')));
  const yLo = geo.yOf(Number(String(lo).replace(',', '.')));
  return <rect x={0} y={yHi} width={geo.axisX} height={Math.max(2, yLo - yHi)} fill={lit ? '#34D399' : '#A7F3D0'} opacity={lit ? 0.7 : 0.5} aria-hidden="true" />;
}

/**
 * Le capteur B au bout de son câble, et le nœud à saisir (un anneau de 44 px autour du capteur). Le câble part de la bouée du zéro
 * (`xB`, `y0`) et ne la traverse jamais ; sa longueur est `d`.
 */
export function SensorB({ uid, geo, yB, lit, active, d, valueText, knobProps = {} }) {
  const { xB, y0 } = geo;
  return (
    <g>
      {/* le câble : sa longueur EST la distance à zéro */}
      <g data-zp-cable data-d={d}>
        <line x1={xB} x2={xB} y1={y0} y2={yB} stroke="#7C2D12" strokeWidth={5} strokeLinecap="round" />
        <line x1={xB} x2={xB} y1={y0} y2={yB} stroke="#FDBA74" strokeWidth={5} strokeDasharray="2 5" strokeLinecap="butt" opacity={0.75} />
      </g>
      {/* la bouée du zéro */}
      <g aria-hidden="true">
        <ellipse cx={xB} cy={y0} rx={10} ry={5} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.2} />
        <rect x={xB - 6} y={y0 - 9} width={12} height={9} rx={3} fill="#EF4444" stroke="#991B1B" strokeWidth={1.2} />
      </g>
      <g data-zp-knob {...knobProps}>
      <g data-zp-b data-value={valueText}>
        <circle cx={xB} cy={yB + 2.5} r={RING} fill="#1E1B4B" opacity={0.14} />
        <circle cx={xB} cy={yB} r={RING} fill={`url(#${uid}-knob)`} stroke={lit ? '#059669' : '#A16207'} strokeWidth={active || lit ? 4 : 2.5} />
        <rect x={xB - 7} y={yB - 10} width={14} height={20} rx={5} fill="#F59E0B" stroke="#92400E" strokeWidth={1.6} />
        <circle cx={xB} cy={yB - 2} r={3.4} fill="#E0F2FE" stroke="#0369A1" strokeWidth={1} />
        <path d={`M${xB} ${yB - 10} v -5`} stroke="#92400E" strokeWidth={2} strokeLinecap="round" />
      </g>
      </g>
    </g>
  );
}
