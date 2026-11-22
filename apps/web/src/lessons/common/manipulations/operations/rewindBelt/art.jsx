import * as M from '@smarter-academy/core/arithmetic/missingNumber.js';
import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `rewind-belt` (« الحزام المعاكس », thème `packingline`) : un atelier de conditionnement de fournitures scolaires, dessiné en SVG (jamais d'image raster).
 * De gauche à droite (la machine travaille de gauche à droite, comme son schéma « دخول ← خروج ») : le BAC D'ENTRÉE (le nombre manquant □), la MACHINE à carte (sa carte d'origine
 * en haut, la carte CHOISIE à rebours dans sa fente), le PLATEAU DE SORTIE (le nombre connu). Entre eux un tapis roulant dont les chevrons indiquent le sens : vers la gauche
 * quand le tapis tourne à rebours, vers la droite pour la contre-épreuve. La caisse est ce que la main tire. Aucun chiffre n'est écrit ici sauf ceux que la scène lui donne.
 * Les personnes sont toujours `KidFigure` (les filles en hijab).
 */
export const W = 640;
export const H = 330;
const X_IN = 112;      // le centre du bac d'entrée (pos = 1)
const X_OUT = 530;     // le centre du plateau de sortie (pos = 0)
const X_M = 321;       // le centre de la machine
export const Y_BELT = 214;    // le dessus du tapis
export const CRATE_W = 88;
const CRATE_H = 54;

/** La position (0 : sortie, 1 : entrée) d'une abscisse SVG, et inversement. */
export const posOfX = (x) => (X_OUT - x) / (X_OUT - X_IN);
export const xOfPos = (p) => X_OUT - (X_OUT - X_IN) * p;

const COL = {
  wall: '#FEF3C7', wall2: '#FDE68A', floor: '#E7E5E4', floorDark: '#D6D3D1', belt: '#334155', beltLight: '#64748B', roller: '#94A3B8', ink: '#0F172A',
  machine: '#0F766E', machineDark: '#115E59', brass: '#D97706', glass: '#CCFBF1', crate: '#D9A760', crateDark: '#A16207', tape: '#FEF3C7', tray: '#E0E7FF', trayDark: '#6366F1',
  bin: '#FEE2E2', binDark: '#E11D48', reverse: '#0D9488', miss: '#E11D48', ok: '#059669',
};
/** La couleur d'une carte d'opération : la même dans le rack, sur la machine et dans les questions. */
export const CARD_COLOR = { add: '#059669', sub: '#E11D48', mul: '#4F46E5', div: '#D97706', rsub: '#7C3AED' };
export const SIGN = { add: '+', sub: '−', mul: '×', div: '÷', rsub: '−' };

const iso = (s) => `⁦${s}⁩`;

/** Le fond de l'atelier. */
export function Backdrop({ uid }) {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.wall2} /><stop offset="1" stopColor={COL.wall} /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#${uid}-wall)`} />
      <rect x={0} y={Y_BELT + 62} width={W} height={H - Y_BELT - 62} fill={COL.floor} />
      <line x1={0} x2={W} y1={Y_BELT + 62} y2={Y_BELT + 62} stroke={COL.floorDark} strokeWidth={3} />
      {/* des étagères de cartons au fond de l'atelier */}
      {[18, 96].map((x) => (
        <g key={x} opacity={0.55}>
          <rect x={x} y={38} width={64} height={30} rx={3} fill={COL.crate} stroke={COL.crateDark} strokeWidth={1.5} />
          <rect x={x + 8} y={20} width={48} height={18} rx={3} fill={COL.crate} stroke={COL.crateDark} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={14} y={70} width={150} height={5} rx={2} fill={COL.crateDark} opacity={0.5} />
      {/* une fenêtre */}
      <rect x={560} y={24} width={62} height={52} rx={5} fill="#BAE6FD" stroke={COL.crateDark} strokeWidth={2} opacity={0.8} />
      <line x1={591} x2={591} y1={24} y2={76} stroke={COL.crateDark} strokeWidth={2} /><line x1={560} x2={622} y1={50} y2={50} stroke={COL.crateDark} strokeWidth={2} />
    </g>
  );
}

/** Le tapis : un ruban sombre avec des rouleaux ; les chevrons montrent le sens (`dir` : -1 vers la gauche (à rebours), +1 vers la droite, 0 à l'arrêt). */
export function Belt({ dir, drag }) {
  const chev = [];
  for (let x = 60; x <= 590; x += 46) chev.push(x);
  return (
    <g aria-hidden="true" data-rb-belt data-dir={dir}>
      <rect x={30} y={Y_BELT} width={580} height={26} rx={13} fill={COL.belt} />
      <rect x={30} y={Y_BELT} width={580} height={6} rx={3} fill={COL.beltLight} opacity={0.6} />
      {chev.map((x) => (dir === 0
        ? <line key={x} x1={x} x2={x} y1={Y_BELT + 8} y2={Y_BELT + 19} stroke="#64748B" strokeWidth={3} strokeLinecap="round" />
        : <path key={x} d={dir < 0 ? `M${x + 6} ${Y_BELT + 6} l-8 7 l8 7` : `M${x - 6} ${Y_BELT + 6} l8 7 l-8 7`} fill="none"
          stroke={dir < 0 ? '#5EEAD4' : '#FDE68A'} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" opacity={drag ? 1 : 0.85} />))}
      {[48, 590].map((x) => <circle key={x} cx={x} cy={Y_BELT + 13} r={11} fill={COL.roller} stroke={COL.belt} strokeWidth={3} />)}
      <rect x={70} y={Y_BELT + 26} width={9} height={36} fill={COL.belt} /><rect x={560} y={Y_BELT + 26} width={9} height={36} fill={COL.belt} />
    </g>
  );
}

/** Une carte d'opération dessinée dans le SVG (centre `cx`, `cy`) : le signe et le nombre en gras ; « a − ▢ » porte un petit carré vide dessiné. */
function CardPlate({ kind, a, cx, cy, w = 96, h = 40, fontSize = 24, muted = false, dashed = false, ...rest }) {
  const col = CARD_COLOR[kind];
  const at = typeof a === 'object' && a !== null ? M.text(a) : a;
  const text = kind === 'rsub' ? `${at} −` : `${SIGN[kind]} ${at}`;
  const boxW = kind === 'rsub' ? 14 : 0;
  return (
    <g {...rest}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={10} fill={muted ? '#F1F5F9' : '#fff'} stroke={col} strokeWidth={3.2} strokeDasharray={dashed ? '6 4' : undefined} />
      <text x={cx - boxW / 2 - 1} y={cy + fontSize * 0.34} textAnchor="middle" fontSize={fontSize} fontWeight={900} fill={muted ? '#94A3B8' : col} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{iso(text)}</text>
      {kind === 'rsub' && <rect x={cx + w / 2 - 25} y={cy - 8} width={16} height={16} rx={3} fill="none" stroke={muted ? '#94A3B8' : col} strokeWidth={3} />}
    </g>
  );
}

/** La machine : sa carte d'origine sur le fronton, la fente de la carte choisie à rebours dessous, le tunnel où passe la caisse en bas. */
export function Machine({ card, pick, lit, label, slotLabel }) {
  const x0 = X_M - 74;
  return (
    <g data-rb-machine aria-hidden="true">
      <rect x={x0} y={46} width={148} height={Y_BELT - 46} rx={14} fill={COL.machine} stroke={COL.machineDark} strokeWidth={3} />
      {/* le tunnel où passe la caisse */}
      <rect x={x0 + 12} y={Y_BELT - 50} width={124} height={50} rx={9} fill="#0B3B37" opacity={0.95} />
      {lit && <rect x={x0 + 16} y={Y_BELT - 9} width={116} height={5} rx={2.5} fill="#5EEAD4" opacity={0.9} />}
      {/* le fronton : le nom et la carte d'origine */}
      <text x={X_M} y={67} textAnchor="middle" fontSize={19} fontWeight={800} fill="#CCFBF1">{label}</text>
      <CardPlate kind={card.kind} a={card.a} cx={X_M} cy={91} w={112} h={32} fontSize={21} data-rb-card-own />
      {/* la fente de la carte choisie à rebours */}
      <g data-rb-slot data-pick={pick ?? ''}>
        <text x={X_M} y={123} textAnchor="middle" fontSize={15.5} fontWeight={800} fill="#99F6E4">{slotLabel}</text>
        {pick
          ? <CardPlate kind={pick} a={card.a} cx={X_M} cy={143} w={112} h={30} fontSize={20} />
          : <><rect x={X_M - 56} y={128} width={112} height={30} rx={9} fill="none" stroke="#99F6E4" strokeWidth={2.6} strokeDasharray="7 5" /><text x={X_M} y={150} textAnchor="middle" fontSize={20} fontWeight={800} fill="#99F6E4">؟</text></>}
      </g>
      <circle cx={x0 + 13} cy={58} r={4} fill={lit ? '#5EEAD4' : '#475569'} />
    </g>
  );
}

/** Le bac d'entrée et le plateau de sortie : un panneau au-dessus de chacun porte son nom et le nombre (« □ » tant que le manquant n'est pas trouvé) ; la caisse vient se poser dans la cuvette. */
function Board({ cx, name, text, fontSize, tone, filled }) {
  const stroke = tone === 'in' ? COL.binDark : COL.trayDark;
  const fill = tone === 'in' ? COL.bin : COL.tray;
  return (
    <g>
      <text x={cx} y={Y_BELT - 126} textAnchor="middle" fontSize={20} fontWeight={800} fill={stroke}>{name}</text>
      <rect x={cx - 3} y={Y_BELT - 84} width={6} height={44} fill={stroke} opacity={0.6} />
      <rect x={cx - 50} y={Y_BELT - 120} width={100} height={42} rx={11} fill={fill} stroke={stroke} strokeWidth={3} />
      <text x={cx} y={Y_BELT - 120 + 30} textAnchor="middle" fontSize={fontSize} fontWeight={900} fill={filled ? '#1E1B4B' : stroke} direction="ltr" style={{ unicodeBidi: 'isolate' }} data-rb-board-text>{iso(text)}</text>
    </g>
  );
}
function Basin({ cx, tone }) {
  const stroke = tone === 'in' ? COL.binDark : COL.trayDark;
  const fill = tone === 'in' ? COL.bin : COL.tray;
  return <path d={`M${cx - 66} ${Y_BELT - 30} h132 l-12 34 h-108 z`} fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" opacity={0.9} />;
}
export function Bin({ name, text, fontSize = 28, filled }) {
  return (
    <g data-rb-bin data-filled={filled ? 'true' : 'false'} aria-hidden="true">
      <Basin cx={X_IN} tone="in" />
      <Board cx={X_IN} name={name} text={text} fontSize={fontSize} tone="in" filled={filled} />
    </g>
  );
}
export function Tray({ name, text, fontSize = 28 }) {
  return (
    <g data-rb-tray aria-hidden="true">
      <Basin cx={X_OUT} tone="out" />
      <Board cx={X_OUT} name={name} text={text} fontSize={fontSize} tone="out" filled />
    </g>
  );
}

/** La caisse que la main tire : un carton avec un ruban adhésif et le nombre qu'elle porte (« ؟ » quand le tapis est bloqué). */
export function Crate({ x, text, active, tone, jam }) {
  const w = CRATE_W; const h = CRATE_H;
  const y = Y_BELT - h;
  const stroke = active ? '#4338CA' : COL.crateDark;
  const fs = text.length > 6 ? 17 : text.length > 4 ? 21 : 28;
  return (
    <g data-rb-crate-art data-tone={tone} transform={jam ? `translate(${x} 0)` : `translate(${x} 0)`}>
      <rect x={-w / 2} y={y} width={w} height={h} rx={9} fill={COL.crate} stroke={stroke} strokeWidth={active ? 4 : 3} />
      <rect x={-10} y={y} width={20} height={h} fill={COL.tape} opacity={0.75} />
      <rect x={-w / 2 + 8} y={y + 12} width={w - 16} height={h - 24} rx={7} fill="#fff" stroke={COL.crateDark} strokeWidth={1.6} />
      <text x={0} y={y + h / 2 + fs * 0.35} textAnchor="middle" fontSize={fs} fontWeight={900} fill={tone === 'miss' ? COL.miss : COL.ink} direction="ltr" style={{ unicodeBidi: 'isolate' }}>{iso(text)}</text>
    </g>
  );
}

/** L'élève qui pousse les caisses : toujours KidFigure (la fille en hijab). */
export function Observer({ idx = 0, mood = 'happy', size = 70, x = 18, y = 190 }) {
  const girl = idx % 2 === 0;
  return (
    <svg x={x} y={y} width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true" data-rb-kid data-mood={mood}>
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
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-rb-kid data-mood={mood}>
      {girl
        ? <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
        : <KidFigure cx={20} top={2} foot={47} hairStyle="short" outfit="blue" skin="light" hair="brown" mood={mood} />}
    </svg>
  );
}
