import KidFigure from '../../primitives/KidFigure';

/**
 * Le décor de `letter-dial` (« قرص الحروف », thème `copyshop`) : le comptoir d'une papeterie-photocopie, dessiné en SVG (jamais d'image raster).
 * Une bande de comptoir (la pile de feuilles, la photocopieuse, la CAISSE dont l'écran affiche le nombre que la carte calcule) et, plus bas, un ou deux CADRANS à tourner
 * (un par lettre : la lettre au centre, la valeur en grand, les graduations autour). Aucun chiffre n'est écrit ici sauf ceux que la scène lui donne. Les personnes sont toujours `KidFigure`
 * (la fille en hijab). Les cadrans sont dessinés en géométrie LTR (`direction: ltr`), l'aiguille tourne de −150° (le minimum) à +150° (le maximum) en passant par le haut.
 */
const SW = 640;
const SH = 150;

const COL = {
  wall: '#E0F2FE', wall2: '#BAE6FD', counter: '#B45309', counterTop: '#D97706', floor: '#E7E5E4', ink: '#0F172A', paper: '#FFFFFF', copier: '#64748B', copierDark: '#334155',
  screen: '#0F172A', screenText: '#5EEAD4', ok: '#059669', miss: '#E11D48', amber: '#F59E0B',
};
/** Une couleur par lettre : la même sur la carte, dans la fente, sur le cadran et dans les questions. */
const LETTER_COLOR = { n: '#0D9488', a: '#4F46E5', b: '#D97706', c: '#7C3AED', x: '#0D9488', y: '#D97706' };
export const colorOf = (letter, i = 0) => LETTER_COLOR[letter] ?? ['#0D9488', '#4F46E5', '#D97706'][i % 3];

const iso = (s) => `⁦${s}⁩`;

/** Le fond de la boutique : un mur clair, un comptoir, une pile de feuilles et une photocopieuse. */
function Backdrop({ uid }) {
  return (
    <g aria-hidden="true">
      <defs><linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COL.wall2} /><stop offset="1" stopColor={COL.wall} /></linearGradient></defs>
      <rect x={0} y={0} width={SW} height={SH} fill={`url(#${uid}-wall)`} />
      {/* des étagères : cahiers et boîtes */}
      <rect x={20} y={26} width={190} height={5} rx={2} fill={COL.counter} opacity={0.55} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={28 + i * 21} y={6 + (i % 2) * 3} width={15} height={20 - (i % 2) * 3} rx={2} fill={['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9'][i]} opacity={0.75} />)}
      {/* le comptoir */}
      <rect x={0} y={108} width={SW} height={42} fill={COL.counter} />
      <rect x={0} y={104} width={SW} height={10} rx={3} fill={COL.counterTop} />
      {/* la photocopieuse */}
      <g>
        <rect x={452} y={58} width={112} height={50} rx={7} fill={COL.copier} stroke={COL.copierDark} strokeWidth={3} />
        <rect x={462} y={50} width={92} height={12} rx={4} fill="#CBD5E1" stroke={COL.copierDark} strokeWidth={2} />
        <rect x={472} y={72} width={72} height={9} rx={3} fill={COL.copierDark} />
        <rect x={488} y={62} width={40} height={14} rx={2} fill={COL.paper} opacity={0.95} />
        <circle cx={548} cy={92} r={4} fill="#5EEAD4" />
      </g>
      {/* la pile de feuilles */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={582 - i * 1.5} y={96 - i * 4} width={44} height={4} rx={1} fill={COL.paper} stroke="#CBD5E1" strokeWidth={1} />)}
      </g>
    </g>
  );
}

/** La caisse : un écran sombre qui affiche le nombre calculé (grand) et son unité ; `null` = « ؟ ». */
function Register({ text, unit, lit, fontSize = 34 }) {
  return (
    <g data-ld-register data-lit={lit ? 'true' : 'false'} aria-hidden="true">
      <rect x={196} y={56} width={206} height={52} rx={9} fill="#1E293B" stroke="#0F172A" strokeWidth={3} />
      <rect x={206} y={63} width={186} height={38} rx={6} fill={COL.screen} />
      <text x={228} y={90} fontSize={15} fontWeight={800} fill="#94A3B8" direction="rtl">{unit}</text>
      <text x={382} y={91} textAnchor="end" fontSize={fontSize} fontWeight={900} fill={lit ? COL.screenText : '#475569'} direction="ltr" style={{ unicodeBidi: 'isolate', fontVariantNumeric: 'tabular-nums' }} data-ld-register-text>{iso(text)}</text>
    </g>
  );
}

/** Le comparateur d'une prétendue règle : deux écrans (les deux membres) et, entre eux, le signe « = » ou « ≠ ». */
function Comparator({ left, right, eq }) {
  const col = eq ? COL.ok : COL.miss;
  return (
    <g data-ld-compare data-eq={eq ? 'true' : 'false'} aria-hidden="true">
      {[{ x: 150, t: left }, { x: 342, t: right }].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={56} width={104} height={52} rx={9} fill="#1E293B" stroke="#0F172A" strokeWidth={3} />
          <rect x={s.x + 8} y={63} width={88} height={38} rx={6} fill={COL.screen} />
          <text x={s.x + 88} y={91} textAnchor="end" fontSize={30} fontWeight={900} fill={COL.screenText} direction="ltr" style={{ unicodeBidi: 'isolate', fontVariantNumeric: 'tabular-nums' }}>{iso(s.t)}</text>
        </g>
      ))}
      <circle cx={299} cy={82} r={22} fill="#fff" stroke={col} strokeWidth={4} />
      <text x={299} y={94} textAnchor="middle" fontSize={34} fontWeight={900} fill={col} data-ld-sign>{eq ? '=' : '≠'}</text>
    </g>
  );
}

/** La vendeuse : toujours KidFigure (fille en hijab). */
function Seller({ mood = 'happy', x = 30, y = 28, size = 94 }) {
  return (
    <svg x={x} y={y} width={size} height={size * 1.25} viewBox="0 0 40 50" aria-hidden="true" data-ld-kid data-mood={mood}>
      <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    </svg>
  );
}

/** La scène du haut : la boutique, la vendeuse et l'écran (la caisse ou le comparateur). */
export function Scene({ uid, label, mood, register, compare }) {
  return (
    <svg width="100%" viewBox={`0 0 ${SW} 128`} style={{ maxWidth: SW, display: 'block', margin: '0 auto' }} role="img" aria-label={label} data-ld-svg dir="ltr">
      <Backdrop uid={uid} />
      <Seller mood={mood} x={64} y={8} size={96} />
      {compare ? <Comparator {...compare} /> : <Register {...register} />}
    </svg>
  );
}

/** Un mini enfant pour le bandeau de verdict (HTML). */
export function KidChip({ mood = 'happy', size = 40 }) {
  return (
    <svg width={size} height={size + 6} viewBox="0 0 40 50" aria-hidden="true" data-ld-kid data-mood={mood}>
      <KidFigure cx={20} top={2} foot={47} hairStyle="hijab" scarf="rose" outfit="green" skin="light" mood={mood} />
    </svg>
  );
}

/* ── Le cadran ── */
const SWEEP = 300;
const START = -150;
export const angleOf = (v, min, max) => START + (SWEEP * (v - min)) / (max - min);
export const valueAtAngle = (deg, min, max) => {
  const a = Math.abs(deg) > 150 ? (deg > 0 ? 150 : -150) : deg;
  return Math.round(min + ((a - START) / SWEEP) * (max - min));
};
const rad = (deg) => ((deg - 90) * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/** Le cadran d'une lettre : un bouton rond gradué ; la valeur en grand au centre, la lettre au-dessus. `drag` : la main est dessus. */
export function Knob({ letter, value, min, max, color, drag, locked, ariaLabel }) {
  const cx = 80; const cy = 82; const R = 62;
  const major = max - min <= 12 ? 1 : 5;
  const ticks = [];
  for (let v = min; v <= max; v += 1) ticks.push(v);
  const a = angleOf(value, min, max);
  const [px, py] = pt(cx, cy, R - 8, a);
  const [qx, qy] = pt(cx, cy, 31, a);
  const [tx, ty] = pt(cx, cy, R + 3, a);
  const txt = String(value);
  return (
    <svg viewBox="0 0 160 160" width="100%" style={{ maxWidth: 164, display: 'block', margin: '0 auto', touchAction: 'none' }} dir="ltr" aria-hidden="true" data-ld-knob-svg>
      <circle cx={cx} cy={cy} r={R + 12} fill="#fff" stroke={locked ? '#CBD5E1' : color} strokeWidth={drag ? 5 : 3.5} />
      <circle cx={cx} cy={cy} r={R - 4} fill={locked ? '#F1F5F9' : '#F8FAFC'} stroke="#CBD5E1" strokeWidth={2} />
      {ticks.map((v) => {
        const isMajor = (v - min) % major === 0;
        const [x1, y1] = pt(cx, cy, R + (isMajor ? 8 : 4), angleOf(v, min, max));
        const [x2, y2] = pt(cx, cy, R + 11, angleOf(v, min, max));
        return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke={v <= value ? color : '#94A3B8'} strokeWidth={isMajor ? 2.4 : 1.3} strokeLinecap="round" />;
      })}
      {ticks.filter((v) => (v - min) % (major === 1 ? 3 : 10) === 0 || v === max).map((v) => {
        const [x, y] = pt(cx, cy, R + 21, angleOf(v, min, max));
        return <text key={v} x={x} y={y + 3.5} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#64748B" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</text>;
      })}
      <circle cx={cx} cy={cy} r={R - 18} fill="#fff" stroke={color} strokeWidth={2} opacity={0.9} />
      <line x1={qx} y1={qy} x2={px} y2={py} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <circle cx={tx} cy={ty} r={7} fill={color} stroke="#fff" strokeWidth={2.5} data-ld-handle />
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize={14} fontWeight={900} fill={color} data-ld-knob-letter>{letter}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize={txt.length > 2 ? 22 : 28} fontWeight={900} fill={COL.ink} direction="ltr" style={{ unicodeBidi: 'isolate', fontVariantNumeric: 'tabular-nums' }} data-ld-knob-value>{iso(txt)}</text>
      <title>{ariaLabel}</title>
    </svg>
  );
}
