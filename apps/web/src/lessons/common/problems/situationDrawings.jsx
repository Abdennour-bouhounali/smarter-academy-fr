
/**
 * Les dessins GÉNÉRIQUES d'une مسألة (2026-10-13) — huit genres paramétrés par des DONNÉES (jamais une image) :
 * `plan` `stacks` `tags` `tanks` `route` `ladder` `timeline` `scene`. Ils s'ajoutent aux six dessins de la fiche
 * « رياضيات ببساطة » (ProblemIllustration.jsx) et se règlent comme eux : ils illustrent la SITUATION de
 * l'énoncé, jamais sa solution — chaque nombre est un nombre de l'énoncé, l'inconnue est marquée « ؟ ».
 * Mots arabes = texte SVG vivant ; nombres = îlots LTR (`NUM`) ; direction LTR sur le SVG (piège RTL des SVG).
 * Les champs sont décrits dans `problemIllustration.js` (validateur) et docs/lessons/MASAIL_GENERATION_GUIDE.md.
 */
const NUM = { direction: 'ltr', unicodeBidi: 'isolate' };
const AR = { direction: 'rtl' };
const lerp = (a, b, t) => a + (b - a) * t;
const UNK = '؟';

/* ── les petits dessins (centrés en 0,0, ~22 px) ─────────────────────────── */

function Icon({ kind, x = 0, y = 0, s = 1 }) {
  const body = (() => {
    switch (kind) {
      case 'book': return (<><rect x="-8" y="-10" width="16" height="20" rx="2" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.4" /><rect x="-8" y="-10" width="4" height="20" fill="#1E3A8A" opacity="0.6" /><rect x="-2" y="-5" width="7" height="2" fill="#fff" /></>);
      case 'pen': return (<><rect x="-3" y="-11" width="6" height="19" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" /><polygon points="-3,8 3,8 0,13" fill="#334155" /></>);
      case 'egg': return <ellipse cx="0" cy="0" rx="7" ry="9.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.4" />;
      case 'fish': return (<><ellipse cx="-2" cy="0" rx="10" ry="6" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.3" /><polygon points="8,0 14,-6 14,6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="1.2" /><circle cx="-7" cy="-1.5" r="1.4" fill="#0F172A" /></>);
      case 'crate': return (<><rect x="-11" y="-8" width="22" height="16" rx="1.5" fill="#D6A35C" stroke="#92400E" strokeWidth="1.4" /><path d="M-11 -2 H11 M-11 4 H11" stroke="#92400E" strokeWidth="1.2" /></>);
      case 'bottle': return (<><rect x="-3" y="-12" width="6" height="7" fill="#65A30D" stroke="#3F6212" strokeWidth="1.2" /><rect x="-7" y="-6" width="14" height="18" rx="4" fill="#84CC16" stroke="#3F6212" strokeWidth="1.3" /></>);
      case 'sweet': return (<><polygon points="-14,-6 -8,0 -14,6" fill="#F472B6" /><polygon points="14,-6 8,0 14,6" fill="#F472B6" /><circle r="8" fill="#EC4899" stroke="#9D174D" strokeWidth="1.3" /></>);
      case 'ball': return (<><circle r="10" fill="#fff" stroke="#0F172A" strokeWidth="1.6" /><polygon points="0,-4 4,-1 2.5,4 -2.5,4 -4,-1" fill="#0F172A" /></>);
      case 'person': return (<><circle cx="0" cy="-8" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.2" /><path d="M-8 11 Q-8 0 0 0 Q8 0 8 11 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.3" /></>);
      case 'leaf': return <path d="M-9 8 Q-9 -9 9 -9 Q9 9 -9 8 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.4" />;
      case 'coin': return (<><circle r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" /><circle r="6" fill="none" stroke="#B45309" strokeWidth="1" /></>);
      case 'tile': return (<><rect x="-9" y="-9" width="18" height="18" fill="#7DD3FC" stroke="#0369A1" strokeWidth="1.5" /><path d="M0 -9 V9 M-9 0 H9" stroke="#fff" strokeWidth="1.2" /></>);
      case 'ticket': return (<><rect x="-12" y="-7" width="24" height="14" rx="2" fill="#FDE68A" stroke="#B45309" strokeWidth="1.3" /><circle cx="-12" cy="0" r="3" fill="#fff" /><circle cx="12" cy="0" r="3" fill="#fff" /><path d="M-3 -7 V7" stroke="#B45309" strokeDasharray="2 2" /></>);
      case 'tomato': return (<><circle cy="1" r="9" fill="#EF4444" stroke="#991B1B" strokeWidth="1.3" /><path d="M-4 -8 L0 -4 L4 -8" stroke="#15803D" strokeWidth="2" fill="none" /></>);
      case 'olive': return (<><ellipse rx="6" ry="9" fill="#65A30D" stroke="#3F6212" strokeWidth="1.3" transform="rotate(25)" /><circle cx="2" cy="-3" r="1.6" fill="#BEF264" /></>);
      case 'bread': return (<><ellipse rx="12" ry="7" fill="#E9B872" stroke="#92400E" strokeWidth="1.4" /><path d="M-6 -4 L-3 3 M0 -5 L3 3 M6 -4 L8 2" stroke="#92400E" strokeWidth="1.1" /></>);
      case 'jar': return (<><rect x="-6" y="-11" width="12" height="4" rx="1" fill="#92400E" /><rect x="-9" y="-7" width="18" height="18" rx="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.3" /></>);
      case 'sack': return (<><path d="M-9 10 Q-12 -2 -4 -8 L4 -8 Q12 -2 9 10 Z" fill="#D4B483" stroke="#92400E" strokeWidth="1.4" /><path d="M-4 -8 L-2 -12 L2 -12 L4 -8" fill="#B08A57" stroke="#92400E" strokeWidth="1" /></>);
      case 'shirt': return <path d="M-6 -10 L-13 -4 L-9 1 L-6 -1 L-6 10 L6 10 L6 -1 L9 1 L13 -4 L6 -10 Q0 -6 -6 -10 Z" fill="#A78BFA" stroke="#5B21B6" strokeWidth="1.3" />;
      case 'phone': return (<><rect x="-6" y="-11" width="12" height="22" rx="2.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" /><rect x="-4.5" y="-8" width="9" height="14" fill="#7DD3FC" /></>);
      case 'car': return (<><rect x="-14" y="-3" width="28" height="9" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.3" /><path d="M-8 -3 L-5 -9 L6 -9 L10 -3 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" /><circle cx="-8" cy="7" r="3.5" fill="#1E293B" /><circle cx="8" cy="7" r="3.5" fill="#1E293B" /></>);
      case 'bus': return (<><rect x="-15" y="-9" width="30" height="16" rx="3" fill="#0EA5E9" stroke="#075985" strokeWidth="1.3" /><rect x="-12" y="-6" width="8" height="6" fill="#E0F2FE" /><rect x="-2" y="-6" width="8" height="6" fill="#E0F2FE" /><rect x="8" y="-6" width="5" height="6" fill="#E0F2FE" /><circle cx="-8" cy="8" r="3.5" fill="#1E293B" /><circle cx="9" cy="8" r="3.5" fill="#1E293B" /></>);
      case 'candle': return (<><rect x="-4" y="-6" width="8" height="18" rx="1.5" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.3" /><path d="M0 -7 Q-4 -12 0 -16 Q4 -12 0 -7 Z" fill="#F97316" /></>);
      case 'battery': return (<><rect x="-6" y="-9" width="12" height="19" rx="2" fill="#fff" stroke="#0F172A" strokeWidth="1.5" /><rect x="-2.5" y="-12" width="5" height="3" fill="#0F172A" /><rect x="-4" y="1" width="8" height="7" fill="#22C55E" /></>);
      case 'plant': return (<><path d="M0 10 V-4" stroke="#15803D" strokeWidth="2" /><path d="M0 2 Q-9 0 -8 -7 Q0 -6 0 2 Z M0 -3 Q9 -5 8 -12 Q0 -11 0 -3 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1" /><rect x="-6" y="8" width="12" height="5" rx="1" fill="#B45309" /></>);
      case 'house': return (<><polygon points="-12,-1 0,-12 12,-1" fill="#EF4444" stroke="#991B1B" strokeWidth="1.3" /><rect x="-9" y="-1" width="18" height="12" fill="#FDE68A" stroke="#B45309" strokeWidth="1.3" /><rect x="-2" y="4" width="5" height="7" fill="#92400E" /></>);
      case 'kite': return (<><polygon points="0,-13 9,0 0,10 -9,0" fill="#F472B6" stroke="#9D174D" strokeWidth="1.3" /><path d="M0 -13 V10 M-9 0 H9" stroke="#9D174D" strokeWidth="1" /><path d="M0 10 Q-4 14 0 16" stroke="#475569" fill="none" /></>);
      default: return <circle r="8" fill="#94A3B8" />;
    }
  })();
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{body}</g>;
}

const PILL_TONES = { blue: ['#EFF6FF', '#2563EB', '#1E3A8A'], amber: ['#FFFBEB', '#D97706', '#78350F'], green: ['#F0FDF4', '#16A34A', '#14532D'], rose: ['#FFF1F2', '#E11D48', '#881337'], violet: ['#F5F3FF', '#7C3AED', '#4C1D95'], slate: ['#fff', '#475569', '#0F172A'] };

/** Une pastille numérique : un nombre en LTR, une unité arabe facultative, un mot arabe facultatif au-dessus. */
function Pill({ x, y, value, unit, word, tone = 'blue', w }) {
  const col = PILL_TONES[tone] ?? PILL_TONES.blue;
  const text = `${value}${unit ? ` ${unit}` : ''}`;
  const width = w ?? Math.max(44, String(text).length * 8.5 + 18);
  return (
    <g>
      {word && <text x={x} y={y - 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155" style={AR}>{word}</text>}
      <rect x={x - width / 2} y={y - 13} width={width} height="24" rx="12" fill={col[0]} stroke={col[1]} strokeWidth="1.8" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill={col[2]} style={NUM}>{value}{unit && <tspan fontSize="11" fontWeight="700" dx="3" style={AR}>{unit}</tspan>}</text>
    </g>
  );
}

/** Une cote (dimension) : pastille blanche, éventuellement tournée. */
function Dim({ x, y, value, unit, rotate, tone }) {
  return (
    <g transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      <Pill x={x} y={y} value={value} unit={unit} tone={tone ?? 'slate'} />
    </g>
  );
}

/* ═══ 1. plan — une surface vue de dessus, avec ses cotes ═════════════════ */
const FILLS = {
  grass: ['#86C97A', '#4D8F46', '#7AB86D'], water: ['#7DD3FC', '#0369A1', '#BAE6FD'], floor: ['#E7D3B0', '#92400E', '#D9BF93'],
  tile: ['#BAE6FD', '#0369A1', '#fff'], wood: ['#D6A35C', '#92400E', '#C48F45'], glass: ['#BAE6FD', '#0369A1', '#E0F2FE'],
  paper: ['#FFFFFF', '#475569', '#E2E8F0'], garden: ['#A7E3A0', '#2F7D32', '#86C97A'], court: ['#FDBA74', '#C2410C', '#FED7AA'],
  carpet: ['#FCA5A5', '#991B1B', '#FECACA'], sand: ['#FDE68A', '#B45309', '#FCD34D'], blue: ['#BFDBFE', '#1D4ED8', '#DBEAFE'],
};

function Grid({ x, y, w, h, nx, ny, color }) {
  return (
    <g stroke={color} strokeWidth="1.4">
      {Array.from({ length: nx - 1 }, (_, i) => <line key={`v${i}`} x1={x + (w * (i + 1)) / nx} y1={y} x2={x + (w * (i + 1)) / nx} y2={y + h} />)}
      {Array.from({ length: ny - 1 }, (_, i) => <line key={`h${i}`} x1={x} y1={y + (h * (i + 1)) / ny} x2={x + w} y2={y + (h * (i + 1)) / ny} />)}
    </g>
  );
}
function Surface({ il, x, y, w, h }) {
  const [f, s, l] = FILLS[il.fill ?? 'grass'];
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={f} stroke={s} strokeWidth="3" />
      {il.grid ? <Grid x={x} y={y} w={w} h={h} nx={8} ny={5} color={l} /> : [0.25, 0.5, 0.75].map((t) => <line key={t} x1={x} y1={y + h * t} x2={x + w} y2={y + h * t} stroke={l} strokeWidth="5" opacity="0.5" />)}
      {il.grid && <text x={x + w / 2} y={y + h * (il.area ? 0.4 : 0.5) + 7} textAnchor="middle" fontSize="22" fontWeight="800" fill={s} opacity="0.7">{UNK}</text>}
    </>
  );
}
function Plan({ il }) {
  const shape = il.shape ?? 'rect';
  const unit = il.unit;
  if (shape === 'ring') { // un bassin carré entouré d'un passage de largeur `border`
    return (
      <>
        <rect x="70" y="14" width="220" height="150" fill="#E5E7EB" stroke="#475569" strokeWidth="3" strokeDasharray="6 4" />
        <rect x="104" y="40" width="152" height="98" fill={FILLS[il.fill ?? 'water'][0]} stroke={FILLS[il.fill ?? 'water'][1]} strokeWidth="3" />
        <path d="M120 70 Q140 60 160 70 T200 70 T240 70 M120 100 Q140 90 160 100 T200 100 T240 100" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" />
        {il.inner && <Dim x={180} y={154} value={il.inner} unit={unit} />}
        <Dim x={87} y={60} value={il.border} unit={unit} tone="amber" />
        <text x="87" y="88" textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569" style={AR}>{il.borderWord ?? 'ممرّ'}</text>
        {il.area && <Pill x={180} y={96} value={il.area} unit={il.areaUnit ?? unit} tone="blue" />}
      </>
    );
  }
  if (shape === 'tri') {
    const A = [180, 28], B = [34, 150], C = [326, 150];
    const [f, s] = FILLS[il.fill ?? 'grass'];
    return (
      <>
        <polygon points={`${A} ${B} ${C}`} fill={f} stroke={s} strokeWidth="3.5" strokeLinejoin="round" />
        <Dim x={180} y={176} value={il.sides[0]} unit={unit} />
        <Dim x={92} y={80} value={il.sides[1]} unit={unit} rotate={-50} />
        <Dim x={268} y={80} value={il.sides[2]} unit={unit} rotate={50} />
      </>
    );
  }
  if (shape === 'cut') { // un rectangle auquel on retranche un carré (ou rectangle) dans un coin
    const [f, s] = FILLS[il.fill ?? 'garden'];
    return (
      <>
        <polygon points="40,30 320,30 320,120 230,120 230,160 40,160" fill={f} stroke={s} strokeWidth="3" />
        <rect x="230" y="120" width="90" height="40" fill="#fff" stroke={s} strokeWidth="2" strokeDasharray="5 4" />
        <text x="275" y="146" textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748B" style={AR}>{il.cutWord ?? 'مقتطع'}</text>
        <Dim x={180} y={18} value={il.w} unit={unit} />
        <Dim x={32} y={95} value={il.h} unit={unit} rotate={-90} />
        {il.cut && <Dim x={275} y={176} value={il.cut} unit={unit} tone="rose" />}
        {il.cutH && <Dim x={336} y={140} value={il.cutH} unit={unit} tone="rose" rotate={-90} />}
      </>
    );
  }
  if (shape === 'grow') { // un rectangle agrandi : x ajouté à chaque dimension (zone pointillée)
    const [f, s] = FILLS[il.fill ?? 'court'];
    return (
      <>
        <rect x="40" y="46" width="200" height="104" fill={f} stroke={s} strokeWidth="3" />
        <path d="M240 46 H320 V150 H240 M40 150 V176 H320 V150" fill="none" stroke="#0F766E" strokeWidth="2.5" strokeDasharray="6 4" />
        <rect x="240" y="46" width="80" height="104" fill="#CCFBF1" opacity="0.6" />
        <rect x="40" y="150" width="280" height="26" fill="#CCFBF1" opacity="0.6" />
        <Dim x={140} y={36} value={il.w} unit={unit} />
        <Dim x={32} y={98} value={il.h} unit={unit} rotate={-90} />
        <Dim x={280} y={36} value={il.dw} unit={unit} tone="green" />
        <Dim x={337} y={163} value={il.dh} unit={unit} tone="green" rotate={-90} />
      </>
    );
  }
  const square = shape === 'square';
  const w = square ? 150 : 250, h = square ? 150 : 120;
  const x = (360 - w) / 2, y = square ? 14 : 30;
  return (
    <>
      <Surface il={il} x={x} y={y} w={w} h={h} />
      {il.diag && (
        <>
          <line x1={x} y1={y} x2={x + w} y2={y + h} stroke="#DC2626" strokeWidth="3" strokeDasharray="7 4" />
          <Pill x={x + w * 0.5} y={y + h * 0.5} value={il.diag} unit={il.diagUnit ?? unit} tone="rose" />
        </>
      )}
      {il.area && <Pill x={x + w / 2} y={il.diag || il.grid ? y + h * 0.82 : y + h / 2} value={il.area} unit={il.areaUnit ?? unit} tone="blue" />}
      <Dim x={180} y={y + h + 22} value={il.w ?? il.side} unit={unit} />
      {!square || il.h ? <Dim x={x + w + 24} y={y + h / 2} value={il.h ?? il.side} unit={unit} rotate={90} /> : null}
    </>
  );
}

/* ═══ 2. stacks — des objets comptés, rangés par genre ═════════════════════ */
function Stacks({ il }) {
  const rows = il.rows;
  const rh = 176 / rows.length;
  return (
    <>
      {rows.map((r, k) => {
        const y0 = 12 + k * rh;
        const n = Math.min(Number(r.count) || 0, rows.length === 1 ? 24 : 18);
        const cols = 8;
        const sz = Math.min(1, (rh - 14) / 40);
        return (
          <g key={k}>
            <rect x="8" y={y0 + 2} width="260" height={rh - 6} rx="10" fill="#F8FAFC" stroke="#E2E8F0" />
            {Array.from({ length: n }, (_, i) => (
              <Icon key={i} kind={r.icon} x={26 + (i % cols) * 28} y={y0 + 20 + Math.floor(i / cols) * 28 * sz} s={sz} />
            ))}
            {Number(r.count) > n && <text x="254" y={y0 + rh / 2 + 6} textAnchor="end" fontSize="20" fontWeight="800" fill="#64748B">…</text>}
            <Pill x={316} y={y0 + rh / 2 + 4} value={r.count} unit={r.unit} word={r.label} w={64} />
          </g>
        );
      })}
    </>
  );
}

/* ═══ 3. tags — des tarifs / offres côte à côte (partie fixe + partie variable) ═ */
function Tags({ il }) {
  const n = il.cards.length;
  const gap = 10;
  const w = (344 - gap * (n - 1)) / n;
  return (
    <>
      {il.cards.map((c, i) => {
        const x = 8 + i * (w + gap);
        const col = c.tone ?? ['#2563EB', '#D97706', '#16A34A'][i % 3];
        return (
          <g key={i}>
            <rect x={x} y="14" width={w} height="172" rx="14" fill="#fff" stroke={col} strokeWidth="2.5" />
            <rect x={x} y="14" width={w} height="40" rx="14" fill={col} />
            <rect x={x} y="40" width={w} height="14" fill={col} />
            {c.icon && n < 3 && <Icon kind={c.icon} x={x + 22} y={34} s={0.8} />}
            <text x={x + w / 2 + (c.icon && n < 3 ? 10 : 0)} y="39" textAnchor="middle" fontSize={n >= 3 ? 12 : 14} fontWeight="800" fill="#fff" style={AR}>{c.title}</text>
            {c.lines.map((ln, j) => {
              const ly = 80 + j * Math.min(40, 120 / c.lines.length);
              return (
                <g key={j}>
                  <text x={x + w / 2} y={ly - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#475569" style={AR}>{ln.label}</text>
                  <text x={x + w / 2} y={ly + 9} textAnchor="middle" fontSize="16" fontWeight="800" fill="#0F172A" style={NUM}>{ln.value}{ln.unit && <tspan fontSize="11" fontWeight="700" dx="3" style={AR}>{ln.unit}</tspan>}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </>
  );
}

/* ═══ 4. tanks — des réservoirs / cuves / cuves avec niveau ════════════════ */
function Tanks({ il }) {
  const n = il.tanks.length;
  const w = Math.min(100, 330 / n - 20);
  return (
    <>
      <rect x="0" y="168" width="360" height="8" fill="#E2E8F0" />
      {il.tanks.map((t, i) => {
        const cx = (360 / n) * (i + 0.5);
        const lvl = t.level ?? 0.6;
        const top = 40, bot = 160, hh = bot - top;
        const col = t.liquid ?? il.liquid ?? '#38BDF8';
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={top} width={w} height={hh} rx="10" fill="#F8FAFC" stroke="#475569" strokeWidth="2.5" />
            <rect x={cx - w / 2 + 1.5} y={bot - hh * lvl} width={w - 3} height={hh * lvl - 1.5} rx="8" fill={col} opacity="0.75" />
            <path d={`M${cx - w / 2 + 6} ${bot - hh * lvl} q${w / 8} -5 ${w / 4} 0 t${w / 4} 0 t${w / 4} 0`} stroke="#fff" strokeWidth="2" fill="none" opacity="0.8" />
            <rect x={cx - 6} y={top - 12} width="12" height="12" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
            <Pill x={cx} y={top + 2 + (hh * (1 - lvl)) / 2} value={t.value ?? UNK} unit={t.unit ?? il.unit} tone="blue" />
            <text x={cx} y="188" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#334155" style={AR}>{t.label}</text>
          </g>
        );
      })}
    </>
  );
}

/* ═══ 5. route — un trajet entre deux lieux, avec la distance ═══════════════ */
function Route({ il }) {
  const lanes = il.vehicles?.length ?? 1;
  const ys = lanes === 1 ? [116] : [100, 136];
  return (
    <>
      <rect x="0" y="62" width="360" height="104" fill="#ECFCCB" opacity="0.55" />
      <rect x="20" y={ys[0] - 22} width="320" height={lanes === 1 ? 44 : 80} rx="6" fill="#64748B" />
      {lanes === 2 && <line x1="20" y1="118" x2="340" y2="118" stroke="#fff" strokeWidth="2" strokeDasharray="10 8" />}
      {lanes === 1 && <line x1="20" y1="116" x2="340" y2="116" stroke="#fff" strokeWidth="2" strokeDasharray="10 8" />}
      <Icon kind={il.fromIcon ?? 'house'} x={34} y={26} s={1.4} />
      <Icon kind={il.toIcon ?? 'house'} x={326} y={26} s={1.4} />
      <text x="34" y="56" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#334155" style={AR}>{il.from}</text>
      <text x="326" y="56" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#334155" style={AR}>{il.to}</text>
      {(il.vehicles ?? [{ icon: 'car' }]).map((v, i) => <Icon key={i} kind={v.icon ?? 'car'} x={lerp(50, 120, (v.at ?? 0))} y={ys[i]} s={1.3} />)}
      <path d="M52 176 H308 M300 170 L309 176 L300 182 M60 170 L51 176 L60 182" stroke="#0F172A" strokeWidth="2" fill="none" />
      <Pill x={180} y={176} value={il.distance} unit={il.unit} tone="amber" />
      {il.stops?.map((s, i) => (
        <g key={i}>
          <circle cx={lerp(70, 290, (i + 1) / (il.stops.length + 1))} cy="112" r="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
          <text x={lerp(70, 290, (i + 1) / (il.stops.length + 1))} y="148" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" style={AR}>{s}</text>
        </g>
      ))}
    </>
  );
}

/* ═══ 6. ladder — le triangle rectangle d'une situation réelle ═════════════ */
function Ladder({ il }) {
  const obj = il.object ?? 'ladder'; // ladder | rope (mât haubané) | slope
  const G = [40, 164], W = [270, 164], T = [270, 34];
  return (
    <>
      <rect x="0" y="164" width="360" height="12" fill="#B7A27A" />
      {obj === 'ladder' && <rect x="270" y="30" width="26" height="134" fill="#E7C9A5" stroke="#92400E" strokeWidth="2" />}
      <line x1={W[0]} y1={W[1]} x2={T[0]} y2={T[1]} stroke={obj === 'rope' ? '#475569' : '#64748B'} strokeWidth="7" strokeLinecap="round" />
      {obj === 'rope' && <circle cx={T[0]} cy={T[1]} r="6" fill="#DC2626" />}
      <line x1={G[0]} y1={G[1]} x2={T[0]} y2={T[1]} stroke={obj === 'ladder' ? '#B45309' : '#F59E0B'} strokeWidth={obj === 'ladder' ? 6 : 3.5} strokeLinecap="round" />
      {obj === 'ladder' && Array.from({ length: 6 }, (_, i) => {
        const t = (i + 1) / 7, px = lerp(G[0], T[0], t), py = lerp(G[1], T[1], t);
        const len = Math.hypot(T[0] - G[0], T[1] - G[1]), nx = -(T[1] - G[1]) / len * 7, ny = (T[0] - G[0]) / len * 7;
        return <line key={i} x1={px - nx} y1={py - ny} x2={px + nx} y2={py + ny} stroke="#78350F" strokeWidth="2.5" />;
      })}
      <path d="M258 164 V152 H270" stroke="#0F172A" strokeWidth="2" fill="none" />
      <Dim x={282} y={100} value={il.h ?? UNK} unit={il.h ? il.unit : undefined} tone={il.h ? 'slate' : 'rose'} rotate={-90} />
      <Dim x={155} y={186} value={il.base ?? UNK} unit={il.base ? il.unit : undefined} tone={il.base ? 'slate' : 'rose'} />
      <Dim x={140} y={86} value={il.len ?? UNK} unit={il.len ? il.unit : undefined} tone={il.len ? 'slate' : 'rose'} rotate={-26} />
    </>
  );
}

/* ═══ 7. timeline — un axe de temps (ou de grandeur) avec des repères ═══════ */
function Timeline({ il }) {
  const marks = il.marks;
  const n = marks.length;
  return (
    <>
      <Icon kind={il.icon} x={46} y={50} s={2.2} />
      {il.title && <text x="270" y="40" textAnchor="middle" fontSize="14" fontWeight="800" fill="#334155" style={AR}>{il.title}</text>}
      <line x1="30" y1="130" x2="330" y2="130" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <path d="M322 123 L332 130 L322 137" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
      {marks.map((m, i) => {
        const x = n === 1 ? 180 : lerp(50, 300, i / (n - 1));
        return (
          <g key={i}>
            <line x1={x} y1="122" x2={x} y2="138" stroke="#475569" strokeWidth="2.5" />
            <Pill x={x} y={106} value={m.value ?? UNK} unit={m.unit} tone={m.value == null ? 'rose' : 'blue'} />
            <text x={x} y="160" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155" style={AR}>{m.label}</text>
          </g>
        );
      })}
    </>
  );
}

/* ═══ 8. scene — un grand pictogramme et les données de l'énoncé en pastilles ═ */
function Scene({ il }) {
  const chips = il.chips;
  const n = chips.length;
  const [bg, fg] = { blue: ['#EFF6FF', '#BFDBFE'], green: ['#F0FDF4', '#BBF7D0'], amber: ['#FFFBEB', '#FDE68A'], rose: ['#FFF1F2', '#FECDD3'], violet: ['#F5F3FF', '#DDD6FE'] }[il.bg ?? 'blue'];
  return (
    <>
      <rect x="6" y="8" width="348" height="184" rx="16" fill={bg} stroke={fg} strokeWidth="2" />
      <circle cx="180" cy="86" r="52" fill={fg} opacity="0.7" />
      <Icon kind={il.icon} x={180} y={86} s={3.6} />
      {(il.extra ?? []).map((k, i) => <Icon key={i} kind={k} x={lerp(90, 270, (i + 1) / (il.extra.length + 1))} y={138} s={0.9} />)}
      {chips.map((c, i) => {
        const x = n === 1 ? 180 : lerp(60, 300, i / (n - 1));
        const y = i % 2 === 0 ? 176 : 34;
        return <Pill key={i} x={x} y={y} value={c.value ?? UNK} unit={c.unit} word={c.label} tone={c.value == null ? 'rose' : c.tone ?? 'blue'} />;
      })}
    </>
  );
}

export const GENERIC_SCENES = { plan: Plan, stacks: Stacks, tags: Tags, tanks: Tanks, route: Route, ladder: Ladder, timeline: Timeline, scene: Scene };
