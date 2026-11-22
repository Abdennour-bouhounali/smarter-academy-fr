import KidFigure from '../../primitives/KidFigure';
import { STRIDES } from '../../logic/strideStamp';
import * as G from '@smarter-academy/core/arithmetic/graduatedLine.js';

/**
 * Le décor de `stride-stamp` (« خطوة الطابع », thème `villageroad`) : UNE route de village droite vue de côté — la station de bus est l'origine O, l'école est à l'EST
 * (à droite), la place de la mosquée à l'OUEST (à gauche). Sur la route : les ticks tamponnés, le bâton-foulée, les bâtiments à placer, le cadre d'encadrement, le drapeau
 * de l'origine. Tout est SVG (jamais d'image raster) ; les NOMBRES viennent de la scène. Les personnes sont toujours `KidFigure` (les filles en hijab).
 */
export const W = 760;
export const H = 300;
export const LY = 214;           // la ligne graduée (le milieu de la route)
const OX = 290;           // l'origine O (station de bus)
const OX_ORIGIN = 110;    // le tick 0 d'une droite à origine cachée (tâche `origin`)
const U_ORIGIN = 54;      // l'écart de deux ticks de la tâche `origin`
const U_FREE = 54;        // l'unité de la droite libre

export const COL = {
  sky: '#E0F2FE', skyDark: '#BAE6FD', grass: '#BBF7D0', grassDark: '#86EFAC', road: '#A8A29E', roadDark: '#78716C', ink: '#0F172A',
  east: '#D97706', west: '#0EA5E9', origin: '#E11D48', stick: '#F59E0B', stickDark: '#B45309', wall: '#E7D8C4', wallDark: '#B8A88F', dome: '#0D9488',
  hatch: '#A5B4FC', frame: '#6366F1', mirror: '#14B8A6',
};
export const HOUSE_COLORS = ['#16A34A', '#E11D48', '#2563EB', '#D97706'];

/** Où se pose une abscisse (dixièmes) à l'écran, et l'inverse. */
export const xOf = (ox, u, t) => ox + (t * u) / G.TENTH;
export const tAt = (ox, u, x) => ((x - ox) * G.TENTH) / u;

/** La géométrie d'une tâche : `ox` est le x du tick 0 (ou de O), `u` l'écart d'un tick (une foulée). */
export function geoOf(task, strideIdx, free = false) {
  if (free) return { ox: OX, u: U_FREE };
  if (task.kind === 'origin') return { ox: OX_ORIGIN, u: U_ORIGIN };
  return { ox: OX, u: STRIDES[strideIdx] };
}

/** La route, le ciel, la mosquée à l'ouest, l'école à l'est, la station en O. */
export function Backdrop({ uid, showStop = true, ox = OX }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.skyDark} /><stop offset="1" stopColor={COL.sky} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-sky)`} />
      <rect x={0} y={150} width={W} height={H - 150} fill={COL.grass} />
      
      {/* des collines */}
      <path d="M0 150 Q100 98 200 142 T400 138 T600 140 T760 120 L760 160 L0 160 Z" fill={COL.grassDark} opacity={0.7} />
      {/* la place de la mosquée, à l'ouest : un dôme et un minaret */}
      <g data-ss-mosque>
        <rect x={20} y={108} width={86} height={50} fill={COL.wall} stroke={COL.wallDark} strokeWidth={2} />
        <path d="M30 108 a33 30 0 0 1 66 0 z" fill={COL.dome} stroke="#0F766E" strokeWidth={2} />
        <rect x={110} y={62} width={16} height={96} fill={COL.wall} stroke={COL.wallDark} strokeWidth={2} />
        <path d="M110 62 q8 -20 16 0 z" fill={COL.dome} stroke="#0F766E" strokeWidth={2} />
        <rect x={58} y={128} width={14} height={30} rx={7} fill="#92400E" />
      </g>
      {/* l'école, à l'est : un bâtiment, une porte et un drapeau */}
      <g data-ss-school>
        <rect x={634} y={96} width={118} height={62} fill="#FEF3C7" stroke={COL.wallDark} strokeWidth={2} />
        <rect x={634} y={88} width={118} height={10} fill="#B91C1C" />
        {[0, 1, 2].map((i) => <rect key={i} x={646 + i * 34} y={110} width={20} height={22} rx={2} fill="#BAE6FD" stroke={COL.wallDark} strokeWidth={1.4} />)}
        <rect x={682} y={136} width={22} height={22} rx={2} fill="#92400E" />
        <line x1={738} y1={88} x2={738} y2={52} stroke="#475569" strokeWidth={3} />
        <rect x={710} y={52} width={28} height={9} fill="#fff" stroke="#CBD5E1" strokeWidth={1} />
        <rect x={710} y={61} width={28} height={9} fill="#16A34A" />
      </g>
      {/* la route */}
      <rect x={0} y={LY - 34} width={W} height={68} fill={COL.road} />
      <rect x={0} y={LY - 34} width={W} height={5} fill={COL.roadDark} />
      <rect x={0} y={LY + 29} width={W} height={5} fill={COL.roadDark} />
      <line x1={0} x2={W} y1={LY} y2={LY} stroke="#E7E5E4" strokeWidth={2} strokeDasharray="16 14" opacity={0.7} />
      {showStop && <BusStop ox={ox} />}
    </g>
  );
}

/** La station de bus : le poteau, le panneau, et le point rouge de l'origine O sur la route. */
function BusStop({ ox }) {
  return (
    <g data-ss-stop>
      <line x1={ox} x2={ox} y1={LY - 34} y2={108} stroke="#475569" strokeWidth={4} />
      <rect x={ox - 30} y={92} width={60} height={26} rx={5} fill="#1D4ED8" stroke="#1E3A8A" strokeWidth={2} />
      <rect x={ox - 18} y={99} width={36} height={12} rx={3} fill="#fff" />
      <circle cx={ox - 11} cy={113} r={3} fill="#1E3A8A" /><circle cx={ox + 11} cy={113} r={3} fill="#1E3A8A" />
    </g>
  );
}

/** Un tick (trait + son écriture sous la route) ; `label` n'est écrit que s'il est donné. */
export function Tick({ x, label, tone = 'plain', zero = false, small = false }) {
  const color = zero ? COL.origin : tone === 'west' ? COL.west : tone === 'east' ? COL.east : '#334155';
  return (
    <g data-ss-tick={label ?? ''} data-tone={tone}>
      <line x1={x} x2={x} y1={LY - (zero ? 30 : small ? 12 : 22)} y2={LY + (zero ? 30 : small ? 12 : 22)} stroke={zero ? COL.origin : '#fff'} strokeWidth={zero ? 4 : 3.4} strokeLinecap="round" />
      {label != null && <text x={x} y={LY + 62} textAnchor="middle" fontSize={zero ? 32 : 28} fontWeight={800} fill={color} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${label}⁩`}</text>}
    </g>
  );
}

/** Le trait épais de la droite déjà tamponnée entre deux x. */
export function Axis({ x1, x2 }) {
  return <line x1={x1} x2={x2} y1={LY} y2={LY} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.95} />;
}

/** Le bâton-foulée tenu par la main : une règle de bois de O jusqu'au bout, et son tampon. */
export function Stick({ x0, x1, active }) {
  const left = Math.min(x0, x1);
  const w = Math.abs(x1 - x0);
  return (
    <g data-ss-stick>
      {w > 0 && <rect x={left} y={LY - 8} width={w} height={16} rx={4} fill={COL.stick} stroke={COL.stickDark} strokeWidth={2.4} opacity={0.92} />}
      {w > 0 && Array.from({ length: Math.floor(w / 12) }, (_, i) => <line key={i} x1={left + 12 + i * 12} x2={left + 12 + i * 12} y1={LY - 8} y2={LY - 2} stroke={COL.stickDark} strokeWidth={1.2} opacity={0.6} />)}
      <g transform={`translate(${x1} ${LY})`}>
        <circle r={20} fill="#fff" stroke={active ? '#4338CA' : COL.ink} strokeWidth={3.4} />
        <rect x={-9} y={-10} width={18} height={9} rx={2} fill={COL.stickDark} />
        <rect x={-12} y={0} width={24} height={9} rx={2} fill={active ? '#4338CA' : COL.ink} />
      </g>
    </g>
  );
}

export const RAIL_XS = [392, 476, 560];
export const RAIL_BOX = { x: 360, w: 232 };
/** La glissière de la foulée (trois crans) et sa poignée. */
export function Rail({ index, active, label, locked }) {
  const xs = RAIL_XS;
  return (
    <g data-ss-rail data-locked={locked ? 'true' : 'false'}>
      <rect x={RAIL_BOX.x} y={10} width={RAIL_BOX.w} height={72} rx={14} fill="#fff" opacity={0.88} stroke={COL.stickDark} strokeWidth={1.6} />
      <text x={RAIL_BOX.x + RAIL_BOX.w / 2} y={29} textAnchor="middle" fontSize={18} fontWeight={800} fill={COL.stickDark}>{label}</text>
      <line x1={xs[0]} x2={xs[2]} y1={62} y2={62} stroke="#94A3B8" strokeWidth={6} strokeLinecap="round" />
      {xs.map((x, i) => (
        <g key={i} data-ss-stride={i} data-active={i === index ? 'true' : 'false'}>
          <rect x={x - (STRIDES[i] * 0.34)} y={35} width={STRIDES[i] * 0.68} height={9} rx={3} fill={i === index ? COL.stick : '#CBD5E1'} stroke={i === index ? COL.stickDark : '#94A3B8'} strokeWidth={1.6} />
          <circle cx={x} cy={62} r={5} fill="#64748B" />
        </g>
      ))}
      <circle data-ss-rail-handle cx={xs[index]} cy={62} r={14} fill="#fff" stroke={active ? '#4338CA' : COL.ink} strokeWidth={3.4} />
    </g>
  );
}

/** Un bâtiment (maison) posé au-dessus de la route, relié à la ligne par un trait. `ghost` : le jumeau en pointillés. */
export function House({ x, color = HOUSE_COLORS[0], hidden = false, held = false, ghost = false, id }) {
  const top = LY - 112;
  return (
    <g data-ss-house={id ?? ''} data-hidden={hidden ? 'true' : 'false'} opacity={ghost ? 0.55 : 1}>
      <line x1={x} x2={x} y1={top + 62} y2={LY} stroke={held ? '#4338CA' : COL.ink} strokeWidth={2.4} strokeDasharray="4 4" />
      <rect x={x - 22} y={top + 22} width={44} height={40} fill={color} stroke={held ? '#4338CA' : COL.ink} strokeWidth={held ? 3.4 : 2.4} strokeDasharray={ghost ? '6 4' : undefined} />
      <path d={`M${x - 28} ${top + 24} L${x} ${top} L${x + 28} ${top + 24} Z`} fill="#B45309" stroke={held ? '#4338CA' : COL.ink} strokeWidth={held ? 3.4 : 2.4} strokeLinejoin="round" />
      <rect x={x - 6} y={top + 40} width={12} height={22} fill="#fff" opacity={0.85} />
      <circle cx={x} cy={LY} r={6} fill={held ? '#4338CA' : COL.ink} />
    </g>
  );
}

/** Une pastille de lecture : l'abscisse (signe seulement à l'ouest de O). */
export function Reading({ x, y, text, tone, anchor = 'middle' }) {
  const w = Math.max(66, 24 + String(text).length * 17);
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  const fill = tone === 'west' ? COL.west : tone === 'east' ? COL.east : '#475569';
  return (
    <g data-ss-reading={text} data-tone={tone}>
      <rect x={x0} y={y - 20} width={w} height={40} rx={20} fill={fill} />
      <text x={x0 + w / 2} y={y + 9} textAnchor="middle" fontSize={26} fontWeight={800} fill="#fff" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${text}⁩`}</text>
    </g>
  );
}

/** La cote de distance à O : une barre hachurée entre deux x au-dessus de la route, avec son nombre. */
export function DistanceBar({ x1, x2, y, label }) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  if (!w) return null;
  return (
    <g data-ss-distance={label ?? ''} aria-hidden="true">
      <rect x={left} y={y - 5} width={w} height={10} fill={COL.hatch} opacity={0.55} />
      <line x1={x1} x2={x1} y1={y - 10} y2={y + 10} stroke={COL.ink} strokeWidth={2} />
      <line x1={x2} x2={x2} y1={y - 10} y2={y + 10} stroke={COL.ink} strokeWidth={2} />
      {label != null && <text x={(x1 + x2) / 2} y={y - 14} textAnchor="middle" fontSize={26} fontWeight={800} fill="#3730A3" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${label}⁩`}</text>}
    </g>
  );
}

/** Le cadre d'UNE foulée entre deux ticks consécutifs (tâche `bound`). */
export function Frame({ x, u, active, locked, ok }) {
  const color = ok ? '#059669' : active ? '#4338CA' : COL.frame;
  return (
    <g data-ss-frame data-locked={locked ? 'true' : 'false'}>
      <rect x={x} y={LY - 96} width={u} height={150} rx={10} fill={color} opacity={0.14} />
      <rect x={x} y={LY - 96} width={u} height={150} rx={10} fill="none" stroke={color} strokeWidth={active ? 5 : 3.6} strokeDasharray={locked ? undefined : '10 6'} />
    </g>
  );
}

/** Le drapeau de l'origine (tâche `origin`) : un panneau de station qu'on plante sur un tick. */
export function Flag({ x, held }) {
  return (
    <g data-ss-flag>
      <line x1={x} x2={x} y1={LY - 34} y2={LY - 104} stroke="#475569" strokeWidth={4} />
      <path d={`M${x} ${LY - 104} h46 l-12 14 l12 14 h-46 z`} fill={COL.origin} stroke={held ? '#4338CA' : COL.ink} strokeWidth={held ? 3.4 : 2.4} strokeLinejoin="round" />
      <text x={x + 18} y={LY - 87} textAnchor="middle" fontSize={20} fontWeight={900} fill="#fff" direction="ltr">0</text>
      <circle cx={x} cy={LY} r={7} fill={COL.origin} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

/** Une graduation ÉCRITE sur la droite à origine cachée : une étiquette ambre au-dessus de la route. */
export function GivenMark({ x, text }) {
  const w = Math.max(64, 24 + String(text).length * 17);
  return (
    <g data-ss-given={text}>
      <line x1={x} x2={x} y1={LY - 76} y2={LY - 34} stroke="#B45309" strokeWidth={2} strokeDasharray="3 4" />
      <rect x={x - w / 2} y={LY - 116} width={w} height={40} rx={9} fill="#FEF3C7" stroke="#B45309" strokeWidth={2.4} />
      <text x={x} y={LY - 87} textAnchor="middle" fontSize={26} fontWeight={900} fill="#92400E" direction="ltr" style={{ unicodeBidi: 'isolate' }}>{`⁦${text}⁩`}</text>
    </g>
  );
}

/** L'élève qui lit : toujours KidFigure (la fille en hijab). */
export function Observer({ idx = 0, mood = 'happy', size = 80, x = 168, y = 70 }) {
  const girl = idx % 2 === 0;
  return (
    <svg x={x} y={y} width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true" data-ss-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}

/** Un mini enfant pour le bandeau de verdict (HTML). */
export function KidChip({ idx = 0, mood = 'happy', size = 40 }) {
  const girl = idx % 2 === 0;
  return (
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-ss-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}
