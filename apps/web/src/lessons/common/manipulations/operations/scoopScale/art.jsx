import { SvgPill } from '../../primitives/SvgPill';

/**
 * Le décor de `scoop-scale` (« ميزان العطّار », thème `attar`) : les étagères de bocaux, le sac de cumin et sa louche de laiton, la balance
 * numérique à écran sept segments, le cône d'épice qui grandit avec la masse, le sachet modèle et sa lampe, et la bande de précision.
 * Tout est dessiné en SVG (jamais d'image raster) ; les chiffres de l'écran sont des SEGMENTS, jamais un texte, et restent donc fidèles à la lecture.
 */

export const COL = {
  wall: '#FFF4DC', wallDark: '#F6E2B5', shelf: '#A9713A', counterTop: '#D39A58', counterFront: '#9B6334', counterDark: '#7A4A24',
  brass: '#D9A21B', brassDark: '#A87408', cumin: '#B2742F', cuminDark: '#8A5622', pepper: '#4A4540', pepperDark: '#2F2B28',
  lcd: '#CFE0A4', lcdOff: '#C2D497', lcdOn: '#1D2A10', scale: '#F4EFE6', scaleDark: '#CFC6B4', ok: '#059669', warn: '#D97706',
};

/* ── L'écran sept segments ──────────────────────────────────────────────────────────────────────── */
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

function Digit({ x, y, w, h, ch }) {
  const t = Math.max(3, h * 0.13);
  const on = SEG[ch] ?? '';
  const v = (h - 3 * t) / 2 + 0.01;
  const rect = (id, rx, ry, rw, rh) => <rect key={id} x={rx} y={ry} width={rw} height={rh} rx={t / 2.4} fill={on.includes(id) ? COL.lcdOn : COL.lcdOff} opacity={on.includes(id) ? 1 : 0.55} />;
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      {rect('a', t * 0.5, 0, w - t, t)}
      {rect('g', t * 0.5, (h - t) / 2, w - t, t)}
      {rect('d', t * 0.5, h - t, w - t, t)}
      {rect('f', 0, t * 0.8, t, v + t * 0.3)}
      {rect('b', w - t, t * 0.8, t, v + t * 0.3)}
      {rect('e', 0, (h + t) / 2 - t * 0.1, t, v + t * 0.3)}
      {rect('c', w - t, (h + t) / 2 - t * 0.1, t, v + t * 0.3)}
    </g>
  );
}

/** L'écran : `text` = « 1,3 » (chiffres latins et virgule), dessiné au centre de la boîte (x, y, w, h). */
export function SevenSegLcd({ x, y, w, h, text, unit = 'kg', label, ...rest }) {
  const chars = String(text).split('');
  const dh = h - 14;
  const dw = dh * 0.56;
  const gap = dh * 0.14;
  const comma = dh * 0.2;
  const widths = chars.map((c) => (c === ',' ? comma : dw));
  const total = widths.reduce((s, v) => s + v, 0) + gap * (chars.length - 1);
  const room = w - 44;
  const k = Math.min(1, room / total);
  let cx = x + 10 + (room - total * k) / 2 + 14 * 0;
  const out = [];
  chars.forEach((c, i) => {
    const wi = widths[i] * k;
    if (c === ',') {
      out.push(<g key={i} aria-hidden="true"><rect x={cx} y={y + 7 + dh - dh * 0.17 * k} width={Math.max(3, dh * 0.15 * k)} height={Math.max(3, dh * 0.15 * k)} fill={COL.lcdOn} /><rect x={cx - 0.5} y={y + 7 + dh - dh * 0.05 * k} width={Math.max(2, dh * 0.07 * k)} height={Math.max(2, dh * 0.09 * k)} fill={COL.lcdOn} /></g>);
    } else out.push(<Digit key={i} x={cx} y={y + 7 + dh * (1 - k) / 2} w={dw * k} h={dh * k} ch={c} />);
    cx += wi + gap * k;
  });
  return (
    <g data-ss-lcd data-reading={text} role="img" aria-label={label} {...rest}>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={COL.lcd} stroke="#7C8F52" strokeWidth={2} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h * 0.42} rx={5} fill="#FFFFFF" opacity={0.14} />
      {out}
      <text x={x + w - 8} y={y + h - 9} textAnchor="end" fontSize={Math.max(10, h * 0.26)} fontWeight={800} fill={COL.lcdOn} fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{unit}</text>
    </g>
  );
}

/* ── Les bocaux, le sac, la louche, le cône, le sachet ──────────────────────────────────────────── */
const JARS = [
  ['#B2742F', '#8A5622'], ['#2F2B28', '#171412'], ['#C23B2A', '#8C2417'], ['#E5B422', '#B88A0C'], ['#6B8E3A', '#476324'], ['#B65A2A', '#8A3E16'], ['#7A5C3E', '#54402B'],
];
export function Shelves({ width, y1, y2 }) {
  const rows = [[y1, 28], [y2, 32]];
  return (
    <g aria-hidden="true" opacity={0.92}>
      {rows.map(([y, h], r) => (
        <g key={r}>
          {Array.from({ length: Math.floor((width - 16) / 30) }, (_, i) => {
            const c = JARS[(i * 3 + r * 2) % JARS.length];
            const jh = h - (i % 3 === 0 ? 0 : 6);
            return (
              <g key={i} transform={`translate(${12 + i * 30} ${y - jh})`}>
                <rect x={0} y={0} width={22} height={jh} rx={5} fill={c[0]} stroke={c[1]} strokeWidth={1.2} />
                <rect x={3} y={-4} width={16} height={5} rx={2} fill="#E9D8B4" stroke="#B89B64" strokeWidth={0.8} />
                <rect x={4} y={jh * 0.4} width={14} height={jh * 0.22} rx={2} fill="#FFF4DC" opacity={0.85} />
              </g>
            );
          })}
          <rect x={4} y={y} width={width - 8} height={6} rx={2} fill={COL.shelf} />
        </g>
      ))}
    </g>
  );
}

export function Sack({ x, y }) {
  return (
    <g aria-hidden="true">
      <path d={`M${x} ${y + 44} C${x - 6} ${y + 18} ${x + 8} ${y + 4} ${x + 26} ${y} L${x + 52} ${y} C${x + 70} ${y + 6} ${x + 80} ${y + 22} ${x + 74} ${y + 44} Z`} fill="#CDA872" stroke="#9C7A44" strokeWidth={1.6} />
      <ellipse cx={x + 39} cy={y + 1} rx={31} ry={8} fill={COL.cumin} stroke={COL.cuminDark} strokeWidth={1.4} />
      {[[-14, -1], [-4, 2], [8, -2], [18, 1], [2, -4], [-10, 3]].map(([dx, dy], i) => <circle key={i} cx={x + 39 + dx} cy={y + 1 + dy} r={1.6} fill={COL.cuminDark} />)}
      <path d={`M${x + 8} ${y + 20} h58 v14 h-58 Z`} fill="#F7EAD0" opacity={0.9} />
      <text x={x + 37} y={y + 31} textAnchor="middle" fontSize={11} fontWeight={800} fill="#6B4A1C">كمّون</text>
      <path d={`M${x + 20} ${y + 6} L${x + 28} ${y + 14} M${x + 58} ${y + 6} L${x + 50} ${y + 14}`} stroke="#9C7A44" strokeWidth={1.4} fill="none" />
    </g>
  );
}

/** La louche de laiton : sa bouche regarde la balance ; elle bascule quand on verse. */
export function Scoop({ x, y, pouring, label, ...rest }) {
  const rot = pouring ? 34 : -4;
  return (
    <g {...rest} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={label} style={{ cursor: 'pointer', outline: 'none', touchAction: 'none' }}>
      <circle cx={0} cy={0} r={30} fill="transparent" />
      <g style={{ transform: `rotate(${rot}deg)`, transformOrigin: '-12px 4px', transition: 'transform 160ms ease-out' }}>
        <rect x={-46} y={0} width={36} height={7} rx={3.5} fill={COL.brassDark} />
        <path d="M-12 -9 C-12 -9 14 -9 20 -2 C20 8 8 16 -12 14 Z" fill="#E6B52A" stroke={COL.brassDark} strokeWidth={2} />
        <path d="M-8 -5 C2 -6 11 -5 15 -1" stroke="#FFF1B8" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.85} />
        <ellipse cx={4} cy={-3} rx={14} ry={4.6} fill={COL.cumin} stroke={COL.cuminDark} strokeWidth={1.2} opacity={pouring ? 0.5 : 1} />
      </g>
    </g>
  );
}

/** Le cône d'épice : sa hauteur suit la masse (le volume d'un cône suit le cube de sa hauteur). */
export function SpiceCone({ cx, base, frac, pepper }) {
  const h = frac <= 0 ? 0 : 5 + 52 * Math.cbrt(Math.min(1, frac));
  const r = Math.min(52, h * 0.95 + 4);
  const fill = pepper ? COL.pepper : COL.cumin;
  const dark = pepper ? COL.pepperDark : COL.cuminDark;
  if (h === 0) return null;
  return (
    <g aria-hidden="true" data-ss-cone data-h={Math.round(h)}>
      <path d={`M${cx - r} ${base} Q${cx - r * 0.45} ${base - h * 0.35} ${cx} ${base - h} Q${cx + r * 0.45} ${base - h * 0.35} ${cx + r} ${base} Z`} fill={fill} stroke={dark} strokeWidth={1.3} />
      <ellipse cx={cx} cy={base} rx={r} ry={Math.min(7, 2 + r * 0.12)} fill={dark} opacity={0.5} />
      {[[-0.4, 0.18], [0.1, 0.34], [0.35, 0.14], [-0.15, 0.55], [0.2, 0.6]].map(([a, b], i) => <circle key={i} cx={cx + a * r} cy={base - b * h} r={1.3} fill={dark} opacity={0.8} />)}
    </g>
  );
}

export function Grains({ from, to, on }) {
  if (!on) return null;
  return (
    <g aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} className="ss-fx" style={{ '--dx': `${to.x - from.x + (i - 2) * 5}px`, animationDelay: `${i * 70}ms` }}>
          <circle cx={from.x} cy={from.y} r={2.4} fill={COL.cumin} className="ss-fy" style={{ '--dy': `${to.y - from.y}px`, animationDelay: `${i * 70}ms` }} />
        </g>
      ))}
    </g>
  );
}

/** Le sachet modèle, suspendu à un crochet, et sa lampe. */
export function ModelSachet({ x, y, lamp }) {
  const lampFill = lamp === '<' ? '#38BDF8' : lamp === '>' ? '#F59E0B' : '#10B981';
  return (
    <g aria-hidden="true">
      <path d={`M${x} ${y - 14} v14`} stroke="#6B7280" strokeWidth={2} />
      <path d={`M${x - 5} ${y - 14} a5 5 0 1 1 10 0`} fill="none" stroke="#6B7280" strokeWidth={2} />
      <path d={`M${x - 16} ${y + 2} L${x + 16} ${y + 2} L${x + 19} ${y + 42} Q${x} ${y + 48} ${x - 19} ${y + 42} Z`} fill="#E9DDC6" stroke="#A58B58" strokeWidth={1.6} />
      <path d={`M${x - 16} ${y + 8} h32`} stroke="#A58B58" strokeWidth={1.4} strokeDasharray="3 3" />
      <rect x={x - 11} y={y + 18} width={22} height={13} rx={3} fill="#FFFFFF" stroke="#A58B58" strokeWidth={1} />
      <circle cx={x - 3} cy={y + 24.5} r={2.2} fill={COL.pepper} /><circle cx={x + 4} cy={y + 26} r={2} fill={COL.pepper} /><circle cx={x} cy={y + 22} r={1.7} fill={COL.pepper} />
      <g data-ss-lamp data-lamp={lamp}>
        <circle cx={x + 34} cy={y + 12} r={13} fill={lampFill} opacity={0.28} className="ss-glow" />
        <circle cx={x + 34} cy={y + 12} r={8.5} fill={lampFill} stroke="#475569" strokeWidth={2} />
        <path d={`M${x + 28} ${y + 22} h12 v5 h-12 Z`} fill="#64748B" />
      </g>
    </g>
  );
}

/* ── La bande de précision ──────────────────────────────────────────────────────────────────────── */

/**
 * La bande : la masse EXACTE sous une aiguille fixe, les graduations défilent. `markStep` = le nombre d'unités entre deux repères de l'ÉCRAN (ils sont
 * plus hauts et portent leur nom) ; `tickStep` = l'espacement des petites graduations ; `refAt` = la position (en unités) du sachet modèle, s'il y en a un.
 */
export function PrecisionStrip({ uid = 'ss', width, m, markStep, tickStep, half, label, pillText, refAt, markLabel, glow, refLabel, labelStep = markStep }) {
  const H = 86;
  const x0 = 14;
  const bw = width - 2 * x0;
  const ppu = bw / (2 * half);
  const mid = width / 2;
  const first = Math.max(0, Math.ceil((m - half * 1.2) / tickStep) * tickStep);
  const last = Math.floor((m + half * 1.2) / tickStep) * tickStep;
  const ticks = [];
  for (let u = first; u <= last; u += tickStep) ticks.push(u);
  const lblFor = (u) => markLabel(u);
  const isMark = (u) => u % labelStep === 0;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${H}`} style={{ maxWidth: width, display: 'block', margin: '0 auto' }} role="img" aria-label={label} data-ss-strip data-m={m} dir="ltr">
      <defs><clipPath id={`${uid}-clip`}><rect x={x0} y={20} width={bw} height={H - 22} rx={8} /></clipPath></defs>
      <rect x={x0 - 4} y={18} width={bw + 8} height={H - 20} rx={10} fill="#FFFBEB" stroke="#E7C98A" strokeWidth={1.5} />
      <g clipPath={`url(#${uid}-clip)`}>
        <g style={{ transform: `translateX(${-m * ppu}px)`, transition: 'transform 140ms ease-out' }} className="ss-strip-g">
          {glow && glow.map((g, i) => <rect key={i} x={mid + g * ppu - 11} y={34} width={22} height={34} rx={9} fill="#FDE68A" opacity={0.65} className="ss-glow" />)}
          {ticks.map((u) => (
            <g key={u}>
              <line x1={mid + u * ppu} x2={mid + u * ppu} y1={isMark(u) ? 36 : 44} y2={56} stroke={isMark(u) ? '#92400E' : '#C9A064'} strokeWidth={isMark(u) ? 2.4 : 1.2} />
              {isMark(u) && Math.abs(u - m) * ppu <= bw / 2 - 20 && (
                <text x={mid + u * ppu} y={72} textAnchor="middle" fontSize={13} fontWeight={800} fill="#78350F" fontFamily="ui-sans-serif, system-ui, sans-serif" style={{ direction: 'ltr', unicodeBidi: 'isolate' }} data-ss-mark={lblFor(u)}>{lblFor(u)}</text>
              )}
            </g>
          ))}
          {refAt != null && (
            <g data-ss-ref aria-hidden="true">
              <path d={`M${mid + refAt * ppu - 6} 32 L${mid + refAt * ppu + 6} 32 L${mid + refAt * ppu} 44 Z`} fill="#0F766E" />
              <line x1={mid + refAt * ppu} x2={mid + refAt * ppu} y1={44} y2={58} stroke="#0F766E" strokeWidth={2} strokeDasharray="3 2" />
            </g>
          )}
        </g>
      </g>
      {/* l'aiguille fixe et la lecture exacte */}
      <line x1={mid} x2={mid} y1={30} y2={60} stroke="#DC2626" strokeWidth={2.4} />
      <path d={`M${mid - 6} 30 L${mid + 6} 30 L${mid} 40 Z`} fill="#DC2626" />
      <SvgPill x={mid} y={26} text={pillText} fill="#B45309" size={12} pointer="down" data-ss-pill />
      {refAt != null && refLabel && Math.abs(refAt - m) <= half && (
        <text x={mid + (refAt - m) * ppu} y={H - 2} textAnchor="middle" fontSize={11} fontWeight={800} fill="#0F766E">{refLabel}</text>
      )}
    </svg>
  );
}
