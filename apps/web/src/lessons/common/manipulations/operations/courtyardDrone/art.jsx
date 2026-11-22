import KidFigure from '../../primitives/KidFigure';
import * as P from '@smarter-academy/core/arithmetic/planeFrame.js';

/**
 * Le décor de `courtyard-drone` (« مسيّرة الساحة », thème `schoolcourt`) : le PLAN d'une cour d'école vu d'en haut — un sol dallé, un mur, le mât du drapeau au point O (l'origine), deux lignes PEINTES (les axes,
 * graduées) et, sur le papier quadrillé, les dalles de la cour. Ce que la main conduit : un drone à quatre hélices. Tout est SVG (jamais d'image raster) ; les NOMBRES viennent de la scène.
 * Les personnes sont toujours `KidFigure` (les filles en hijab).
 */
export const W = 640;
export const H = 442;
const U = 46;                    // une unité = une dalle
const OX = 320;                  // le x écran de l'origine
const OY = 222;                  // le y écran de l'origine
const XMAX = 5;                  // |x| ≤ 5 unités
const YMAX = 4;                  // |y| ≤ 4 unités

const COL = {
  floor: '#F1E7D5', floorDark: '#E3D3B8', wall: '#B8A88F', ink: '#0F172A', paint: '#F59E0B', paintDark: '#B45309',
  drone: '#0F172A', rotor: '#38BDF8', guide: '#6366F1', east: '#D97706', west: '#0EA5E9', ok: '#059669', bad: '#DC2626',
};

/** Où se pose une coordonnée (dixièmes) à l'écran : x vers la droite, y vers le HAUT. */
const sx = (t) => OX + (t * U) / P.TENTH;
const sy = (t) => OY - (t * U) / P.TENTH;
export const tx = (px) => ((px - OX) * P.TENTH) / U;
export const ty = (py) => ((OY - py) * P.TENTH) / U;

/** Le sol de la cour, ses murs, le quadrillage (papier quadrillé) ; le mur du bâtiment en haut avec la porte. */
export function Backdrop({ squared }) {
  const x0 = sx(-XMAX * 10);
  const x1 = sx(XMAX * 10);
  const y0 = sy(YMAX * 10);
  const y1 = sy(-YMAX * 10);
  return (
    <g aria-hidden="true">
      <rect x={0} y={0} width={W} height={H} fill="#CFE8D5" />
      <rect x={x0 - 22} y={y0 - 22} width={x1 - x0 + 44} height={y1 - y0 + 44} rx={14} fill={COL.floor} stroke={COL.wall} strokeWidth={5} />
      {/* un massif d'arbustes et la porte de l'école : décor hors du cadre */}
      <rect x={x0 - 22} y={y0 - 22} width={x1 - x0 + 44} height={6} fill={COL.wall} />
      {squared && (
        <g data-cd-grid>
          {Array.from({ length: XMAX * 2 + 1 }, (_, i) => <line key={`v${i}`} x1={sx((i - XMAX) * 10)} x2={sx((i - XMAX) * 10)} y1={y0} y2={y1} stroke={COL.floorDark} strokeWidth={1.6} />)}
          {Array.from({ length: YMAX * 2 + 1 }, (_, i) => <line key={`h${i}`} x1={x0} x2={x1} y1={sy((i - YMAX) * 10)} y2={sy((i - YMAX) * 10)} stroke={COL.floorDark} strokeWidth={1.6} />)}
        </g>
      )}
    </g>
  );
}

/** Les deux lignes peintes (les axes) avec leurs graduations : un chiffre par graduation entière, jamais le 0 (il est sous le mât). */
export function Axes({ squared }) {
  const ax0 = sx(-XMAX * 10) - 12;
  const ax1 = sx(XMAX * 10) + 16;
  const ay0 = sy(YMAX * 10) - 16;
  const ay1 = sy(-YMAX * 10) + 12;
  return (
    <g data-cd-axes>
      <line x1={ax0} x2={ax1} y1={OY} y2={OY} stroke={COL.paint} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${ax1 + 8} ${OY} l-14 -9 v18 z`} fill={COL.paint} />
      <line x1={OX} x2={OX} y1={ay0} y2={ay1} stroke={COL.paint} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${OX} ${ay0 - 8} l-9 14 h18 z`} fill={COL.paint} />
      {Array.from({ length: XMAX * 2 + 1 }, (_, i) => {
        const v = i - XMAX;
        if (v === 0) return null;
        return (
          <g key={`tx${v}`} data-cd-tick={`x${v}`}>
            <line x1={sx(v * 10)} x2={sx(v * 10)} y1={OY - 8} y2={OY + 8} stroke={COL.paintDark} strokeWidth={3} />
            <text x={sx(v * 10)} y={OY + 31} textAnchor="middle" fontSize={22} fontWeight={800} fill={v < 0 ? COL.west : COL.east} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${P.fmt(v * 10)}⁩`}</text>
          </g>
        );
      })}
      {Array.from({ length: YMAX * 2 + 1 }, (_, i) => {
        const v = i - YMAX;
        if (v === 0) return null;
        return (
          <g key={`ty${v}`} data-cd-tick={`y${v}`}>
            <line x1={OX - 8} x2={OX + 8} y1={sy(v * 10)} y2={sy(v * 10)} stroke={COL.paintDark} strokeWidth={3} />
            <text x={OX - 14} y={sy(v * 10) + 8} textAnchor="end" fontSize={22} fontWeight={800} fill={v < 0 ? COL.west : COL.east} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${P.fmt(v * 10)}⁩`}</text>
          </g>
        );
      })}
      {!squared && null}
    </g>
  );
}

/** Le mât du drapeau au point O : un poteau vu d'en haut (un disque) et un petit fanion. */
export function Pole() {
  return (
    <g data-cd-pole>
      <circle cx={OX} cy={OY} r={11} fill="#fff" stroke={COL.ink} strokeWidth={3} />
      <circle cx={OX} cy={OY} r={4.5} fill="#E11D48" />
      <path d={`M${OX + 4} ${OY - 6} h26 l-8 7 l8 7 h-26 z`} fill="#16A34A" stroke={COL.ink} strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
      <text x={OX - 16} y={OY + 24} textAnchor="end" fontSize={22} fontWeight={900} fill="#E11D48" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{'⁦0⁩'}</text>
    </g>
  );
}

const S = 30; // la taille d'un objet de la cour (unités SVG)
/** Un objet de la cour (vu d'en haut) posé au point (x, y) en dixièmes. */
export function Thing({ what, x, y, state = 'idle', id }) {
  const cx = sx(x);
  const cy = sy(y);
  const ring = state === 'target' ? '#4338CA' : state === 'done' ? COL.ok : 'transparent';
  return (
    <g data-cd-thing={what} data-state={state} data-cd-id={id ?? ''} transform={`translate(${cx} ${cy})`}>
      {state === 'target' && <circle r={S * 0.95} fill="none" stroke="#4338CA" strokeWidth={3.4} strokeDasharray="7 5" className="cd-pulse" />}
      {state === 'done' && <circle r={S * 0.8} fill="#ECFDF5" opacity={0.7} stroke={ring} strokeWidth={2.4} />}
      <Glyph what={what} />
    </g>
  );
}

function Glyph({ what }) {
  switch (what) {
    case 'fountain': return (<g><circle r={S * 0.62} fill="#38BDF8" stroke="#0369A1" strokeWidth={3} /><circle r={S * 0.3} fill="#E0F2FE" stroke="#0369A1" strokeWidth={2} /><circle r={4} fill="#0369A1" /></g>);
    case 'door': return (<g><rect x={-S * 0.55} y={-S * 0.42} width={S * 1.1} height={S * 0.84} rx={3} fill="#92400E" stroke={COL.ink} strokeWidth={2.4} /><rect x={-S * 0.3} y={-S * 0.3} width={S * 0.6} height={S * 0.6} fill="#B45309" /><circle cx={S * 0.18} cy={0} r={2.6} fill="#FDE68A" /></g>);
    case 'bench': return (<g><rect x={-S * 0.62} y={-S * 0.28} width={S * 1.24} height={S * 0.56} rx={3} fill="#B45309" stroke={COL.ink} strokeWidth={2.4} />{[-0.3, 0, 0.3].map((k) => <line key={k} x1={S * k * 1.3} x2={S * k * 1.3} y1={-S * 0.28} y2={S * 0.28} stroke="#78350F" strokeWidth={2} />)}</g>);
    case 'tap': return (<g><circle r={S * 0.46} fill="#fff" stroke="#0369A1" strokeWidth={3} /><path d="M0 -9 q9 11 0 17 q-9 -6 0 -17 z" fill="#38BDF8" stroke="#0369A1" strokeWidth={2} /></g>);
    case 'gate': return (<g><rect x={-S * 0.66} y={-S * 0.2} width={S * 0.2} height={S * 0.4} fill="#475569" stroke={COL.ink} strokeWidth={2} /><rect x={S * 0.46} y={-S * 0.2} width={S * 0.2} height={S * 0.4} fill="#475569" stroke={COL.ink} strokeWidth={2} /><rect x={-S * 0.46} y={-S * 0.1} width={S * 0.92} height={S * 0.2} fill="#16A34A" stroke={COL.ink} strokeWidth={2} /></g>);
    case 'kiosk': return (<g><rect x={-S * 0.55} y={-S * 0.55} width={S * 1.1} height={S * 1.1} rx={3} fill="#FCA5A5" stroke={COL.ink} strokeWidth={2.4} /><path d={`M${-S * 0.55} ${-S * 0.55} L${S * 0.55} ${S * 0.55} M${S * 0.55} ${-S * 0.55} L${-S * 0.55} ${S * 0.55}`} stroke="#B91C1C" strokeWidth={2} /><rect x={-5} y={-5} width={10} height={10} fill="#fff" /></g>);
    case 'tree': return (<g><circle r={S * 0.62} fill="#4ADE80" stroke="#15803D" strokeWidth={3} /><circle cx={-6} cy={-5} r={S * 0.28} fill="#86EFAC" /><circle r={3.4} fill="#78350F" /></g>);
    case 'board': return (<g><rect x={-S * 0.62} y={-S * 0.44} width={S * 1.24} height={S * 0.88} rx={3} fill="#3B82F6" stroke={COL.ink} strokeWidth={2.4} /><rect x={-S * 0.44} y={-S * 0.28} width={S * 0.38} height={S * 0.3} fill="#fff" /><rect x={S * 0.04} y={-S * 0.28} width={S * 0.38} height={S * 0.3} fill="#FDE68A" /><rect x={-S * 0.44} y={S * 0.08} width={S * 0.82} height={S * 0.18} fill="#fff" opacity={0.85} /></g>);
    case 'chair': return (<g><rect x={-S * 0.4} y={-S * 0.4} width={S * 0.8} height={S * 0.8} rx={4} fill="#A855F7" stroke={COL.ink} strokeWidth={2.4} /><rect x={-S * 0.4} y={-S * 0.4} width={S * 0.8} height={S * 0.2} fill="#7E22CE" /></g>);
    case 'well': return (<g><circle r={S * 0.55} fill="#94A3B8" stroke={COL.ink} strokeWidth={3} /><circle r={S * 0.32} fill="#1E3A8A" /></g>);
    default: return <circle r={S * 0.5} fill="#E11D48" />;
  }
}

/** Les guides du drone : la verticale qu'il suit (parallèle à l'axe vertical) et, en phase `y`, l'horizontale vers l'axe vertical — des pointillés, jamais un nombre. */
export function Guides({ x, y, phase, squared }) {
  const px = sx(x);
  const py = sy(y);
  const top = sy(YMAX * 10) - 14;
  const bot = sy(-YMAX * 10) + 14;
  return (
    <g data-cd-guide={phase} aria-hidden="true" stroke={COL.guide} strokeWidth={squared ? 3 : 2.6} strokeDasharray="8 6" strokeLinecap="round">
      {/* la verticale qui passe par le drone : le pied sur l'axe horizontal */}
      <line x1={px} x2={px} y1={top} y2={bot} opacity={phase === 'x' ? 0.55 : 0.9} />
      {phase === 'y' && y !== 0 && <line x1={OX} x2={px} y1={py} y2={py} opacity={0.9} />}
      {phase === 'y' && <circle cx={px} cy={OY} r={7} fill={COL.guide} stroke="#fff" strokeWidth={2} strokeDasharray="0" />}
      {phase === 'y' && y !== 0 && <circle cx={OX} cy={py} r={7} fill={COL.guide} stroke="#fff" strokeWidth={2} strokeDasharray="0" />}
    </g>
  );
}

/** Le drone : un corps, quatre bras, quatre hélices qui tournent, une caméra ; il tremble quand il REFUSE. */
export function Drone({ x, y, held, refused, flying = true }) {
  return (
    <g data-cd-drone transform={`translate(${sx(x)} ${sy(y)})`} className={refused ? 'cd-shake' : undefined}>
      <ellipse cx={4} cy={11} rx={26} ry={11} fill="#000" opacity={0.14} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
        <g key={i}>
          <line x1={0} y1={0} x2={a * 24} y2={b * 24} stroke={COL.drone} strokeWidth={5} strokeLinecap="round" />
          <circle cx={a * 24} cy={b * 24} r={13} fill={COL.rotor} opacity={0.5} stroke={held ? '#4338CA' : COL.ink} strokeWidth={2.4} className={flying ? 'cd-spin' : undefined} style={{ transformOrigin: `${a * 24}px ${b * 24}px` }} />
          <line x1={a * 24 - 11} x2={a * 24 + 11} y1={b * 24} y2={b * 24} stroke={COL.ink} strokeWidth={2.6} strokeLinecap="round" className={flying ? 'cd-spin' : undefined} style={{ transformOrigin: `${a * 24}px ${b * 24}px` }} />
        </g>
      ))}
      <rect x={-12} y={-12} width={24} height={24} rx={7} fill={held ? '#4338CA' : COL.drone} stroke="#fff" strokeWidth={2.4} />
      <circle r={5.5} fill="#7DD3FC" stroke="#fff" strokeWidth={1.8} />
    </g>
  );
}

/** Le refus : une diagonale barrée en rouge qui sort du drone. */
export function Refusal({ x, y }) {
  const px = sx(x);
  const py = sy(y);
  return (
    <g data-cd-refused aria-hidden="true">
      <line x1={px + 20} y1={py - 20} x2={px + 62} y2={py - 62} stroke={COL.bad} strokeWidth={5} strokeDasharray="9 7" strokeLinecap="round" />
      <circle cx={px + 70} cy={py - 70} r={15} fill="#fff" stroke={COL.bad} strokeWidth={4} />
      <path d={`M${px + 63} ${py - 77} l14 14 M${px + 77} ${py - 77} l-14 14`} stroke={COL.bad} strokeWidth={4.4} strokeLinecap="round" />
    </g>
  );
}

/** Une pastille de lecture : (x ; y) en direct (le signe n'apparaît que sous le zéro ou à sa gauche). */
export function Reading({ x, y, text, tone = 'plain' }) {
  const w = Math.max(96, 30 + String(text).length * 15);
  const px = Math.min(Math.max(sx(x), w / 2 + 6), W - w / 2 - 6);
  const py = Math.min(Math.max(sy(y) - 52, 30), H - 30);
  const fill = tone === 'west' ? COL.west : tone === 'east' ? COL.east : '#475569';
  return (
    <g data-cd-reading={text} data-tone={tone}>
      <rect x={px - w / 2} y={py - 20} width={w} height={40} rx={20} fill={fill} stroke="#fff" strokeWidth={2.4} />
      <text x={px} y={py + 9} textAnchor="middle" fontSize={26} fontWeight={800} fill="#fff" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${text}⁩`}</text>
    </g>
  );
}

/** Le pied de la verticale sur l'axe horizontal : l'abscisse fixée, écrite sous la ligne (jamais l'ordonnée). */
export function Feet({ x, phase }) {
  return (
    <g data-cd-feet aria-hidden="true">
      {phase === 'y' && (
        <g>
          <text x={sx(x)} y={OY + 56} textAnchor="middle" fontSize={22} fontWeight={900} fill={COL.guide} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${P.fmt(x)}⁩`}</text>
        </g>
      )}
    </g>
  );
}

/** Un mini enfant pour le bandeau de verdict (HTML). */
export function KidChip({ idx = 0, mood = 'happy', size = 40 }) {
  const girl = idx % 2 === 0;
  return (
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-cd-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}
