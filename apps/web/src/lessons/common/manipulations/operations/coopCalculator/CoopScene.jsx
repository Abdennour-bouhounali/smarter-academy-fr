import KidFigure from '../../primitives/KidFigure';

/**
 * LE MONDE DESSINÉ du labo `coop-calculator` (thème `coopshop`) — SVG en code, paramétré, jamais une image générée (root CLAUDE.md). Le comptoir de la coopérative
 * de l'école : étagères de cahiers et de boîtes de crayons au fond, un comptoir en bois, les MARCHANDISES de l'histoire posées dessus (`task.world.items`), Hiba (KidFigure :
 * hijab et tunique) derrière le comptoir. La VÉRITÉ de l'histoire — le partage (`task.world.share`) — n'est dessinée qu'une fois la tâche faite ou après le deuxième refus
 * (jamais avant : elle donnerait la réponse). Une ligne dont la valeur est refusée par l'histoire pose une étiquette barrée « ؟ » sur les marchandises.
 * Le texte arabe est du texte vivant ; le décor est `aria-hidden`, le sens passe par le DOM du labo.
 */
const FONT = 'ui-sans-serif, system-ui, sans-serif';
export const SCENE_H = 214;
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
export const CSS = `
@keyframes cc-pop { 0% { transform: scale(0.85); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
.cc-pop { animation: cc-pop 0.3s ease-out; transform-box: fill-box; transform-origin: center; }
@keyframes cc-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.cc-cursor { animation: cc-blink 1s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .cc-pop { animation: none; } .cc-cursor { animation: none; } }
`;

const SPINES = ['#F59E0B', '#0EA5E9', '#10B981', '#F43F5E', '#8B5CF6', '#F97316', '#14B8A6'];

/** Une marchandise dessinée à (x, y = le dessus du comptoir). */
function Glyph({ kind, x, y, s = 1 }) {
  const w = (v) => v * s;
  switch (kind) {
    case 'pencilBox': return (
      <g><rect x={x - w(15)} y={y - w(22)} width={w(30)} height={w(22)} rx={3} fill="#F59E0B" stroke="#92400E" strokeWidth={1.2} />
        {[-8, -3, 2, 7].map((d, i) => <rect key={i} x={x + w(d) - 1.5} y={y - w(32)} width={3} height={w(12)} fill={['#EF4444', '#3B82F6', '#10B981', '#8B5CF6'][i]} />)}</g>);
    case 'pencil': return <g><rect x={x - 2} y={y - w(26)} width={4} height={w(26)} fill="#FACC15" stroke="#92400E" strokeWidth={0.8} /><path d={`M${x - 2} ${y - w(26)} L${x} ${y - w(32)} L${x + 2} ${y - w(26)} Z`} fill="#FDE68A" /></g>;
    case 'book': return <g><rect x={x - w(13)} y={y - w(26)} width={w(26)} height={w(26)} rx={2} fill="#2563EB" stroke="#1E3A8A" strokeWidth={1.2} /><rect x={x - w(13)} y={y - w(26)} width={w(5)} height={w(26)} fill="#1E40AF" /><rect x={x - w(4)} y={y - w(19)} width={w(12)} height={w(3)} rx={1} fill="#BFDBFE" /></g>;
    case 'cover': return <g><rect x={x - w(14)} y={y - w(7)} width={w(28)} height={w(7)} rx={2} fill="#F97316" stroke="#9A3412" strokeWidth={1.2} /></g>;
    case 'coin': return <g><circle cx={x} cy={y - w(7)} r={w(7)} fill="#FBBF24" stroke="#B45309" strokeWidth={1.2} /><text x={x} y={y - w(4.2)} textAnchor="middle" fontSize={w(7)} fontWeight={900} fill="#78350F" fontFamily={FONT}>DA</text></g>;
    case 'notebook': return <g><rect x={x - w(8)} y={y - w(16)} width={w(16)} height={w(16)} rx={2} fill="#34D399" stroke="#065F46" strokeWidth={1} /><line x1={x - w(4)} y1={y - w(11)} x2={x + w(5)} y2={y - w(11)} stroke="#065F46" strokeWidth={0.8} /><line x1={x - w(4)} y1={y - w(7)} x2={x + w(5)} y2={y - w(7)} stroke="#065F46" strokeWidth={0.8} /></g>;
    case 'notebookBox': return <g><rect x={x - w(16)} y={y - w(22)} width={w(32)} height={w(22)} rx={3} fill="#A78BFA" stroke="#5B21B6" strokeWidth={1.2} /><rect x={x - w(9)} y={y - w(16)} width={w(18)} height={w(8)} rx={2} fill="#EDE9FE" /></g>;
    case 'ballBox': return <g><rect x={x - w(16)} y={y - w(20)} width={w(32)} height={w(20)} rx={3} fill="#38BDF8" stroke="#075985" strokeWidth={1.2} /><circle cx={x - w(6)} cy={y - w(24)} r={w(6)} fill="#F43F5E" /><circle cx={x + w(6)} cy={y - w(24)} r={w(6)} fill="#FACC15" /></g>;
    case 'ball': return <g><circle cx={x} cy={y - w(8)} r={w(8)} fill="#F43F5E" stroke="#9F1239" strokeWidth={1.2} /><path d={`M${x - w(8)} ${y - w(8)} h${w(16)}`} stroke="#fff" strokeWidth={1} /></g>;
    case 'bus': return <g><rect x={x - w(24)} y={y - w(26)} width={w(48)} height={w(22)} rx={5} fill="#F59E0B" stroke="#92400E" strokeWidth={1.2} />{[-16, -6, 4, 14].map((d, i) => <rect key={i} x={x + w(d) - 3} y={y - w(23)} width={7} height={8} rx={1.5} fill="#E0F2FE" />)}<circle cx={x - w(14)} cy={y - w(3)} r={w(4.5)} fill="#334155" /><circle cx={x + w(14)} cy={y - w(3)} r={w(4.5)} fill="#334155" /></g>;
    case 'seat': return <g><rect x={x - w(6)} y={y - w(12)} width={w(12)} height={w(12)} rx={3} fill="#60A5FA" stroke="#1E3A8A" strokeWidth={1} /></g>;
    case 'bread': return <g><ellipse cx={x} cy={y - w(11)} rx={w(16)} ry={w(10)} fill="#D97706" stroke="#78350F" strokeWidth={1.2} /><path d={`M${x - w(8)} ${y - w(14)} l${w(5)} ${w(-4)} M${x} ${y - w(14)} l${w(5)} ${w(-4)}`} stroke="#FDE68A" strokeWidth={1.4} /></g>;
    case 'milk': return <g><rect x={x - w(8)} y={y - w(24)} width={w(16)} height={w(24)} rx={2} fill="#F8FAFC" stroke="#475569" strokeWidth={1.2} /><rect x={x - w(8)} y={y - w(24)} width={w(16)} height={w(7)} fill="#38BDF8" /></g>;
    case 'mark': return <g><rect x={x - w(9)} y={y - w(24)} width={w(18)} height={w(24)} rx={2} fill="#FFFBEB" stroke="#92400E" strokeWidth={1.2} /><line x1={x - w(5)} y1={y - w(16)} x2={x + w(5)} y2={y - w(16)} stroke="#92400E" strokeWidth={1} /><line x1={x - w(5)} y1={y - w(10)} x2={x + w(3)} y2={y - w(10)} stroke="#92400E" strokeWidth={1} /></g>;
    default: return null;
  }
}

/** Un groupe de marchandises identiques (au plus 9 dessinées), son étiquette au-dessus. */
function Cluster({ item, cx, top }) {
  const n = Math.min(item.n, 9);
  const per = Math.min(n, 3);
  const rows = Math.ceil(n / per);
  const dx = ['bus', 'bread', 'notebookBox', 'pencilBox', 'ballBox'].includes(item.glyph) ? 38 : 22;
  const dy = rows > 1 ? 18 : 0;
  return (
    <g data-coop-item={item.glyph}>
      {Array.from({ length: n }, (_, i) => {
        const col = i % per; const row = Math.floor(i / per);
        return <Glyph key={i} kind={item.glyph} x={cx + (col - (per - 1) / 2) * dx} y={top - row * dy} s={rows > 1 ? 0.8 : 1} />;
      })}
      {item.label && <g><rect x={cx - 24} y={top + 4} width={48} height={16} rx={5} fill="#FFF7ED" stroke="#C2410C" strokeWidth={1} /><text x={cx} y={top + 16} textAnchor="middle" fontSize={11} fontWeight={900} fill="#9A3412" fontFamily={FONT}>{iso(item.label)}</text></g>}
    </g>
  );
}

/** Le partage de la vérité : `groups` cases (au plus 6 dessinées), chacune avec `each`. */
function Share({ share, x0, x1, y }) {
  const shown = Math.min(share.groups, 5);
  const cell = (x1 - x0) / (shown + (share.groups > shown ? 1 : 0));
  return (
    <g data-coop-share={share.groups}>
      {Array.from({ length: shown }, (_, i) => {
        const cx = x0 + cell * (i + 0.5);
        const lab = String(share.each).replace('.', ',');
        return (
          <g key={i} className="cc-pop" style={{ animationDelay: `${i * 70}ms` }}>
            <rect x={cx - cell * 0.42} y={y - 44} width={cell * 0.84} height={44} rx={8} fill="#ECFDF5" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 3" />
            <Glyph kind={share.glyph} x={cx} y={y - 12} s={0.8} />
            <text x={cx} y={y - 3} textAnchor="middle" fontSize={11} fontWeight={900} fill="#065F46" fontFamily={FONT}>{iso(`${lab}${share.unit ? ` ${share.unit}` : ''}`)}</text>
          </g>
        );
      })}
      {share.groups > shown && <text x={x1 - cell * 0.5} y={y - 18} textAnchor="middle" fontSize={15} fontWeight={900} fill="#047857" fontFamily={FONT}>{iso(`× ${share.groups}`)}</text>}
    </g>
  );
}

export default function CoopScene({ width, maxH, task, mood = 'happy', refuted = null, shared = false, uid, ariaLabel, solved = false }) {
  const H = Math.max(150, Math.min(SCENE_H, maxH));
  const k = H / SCENE_H;
  const W = Math.max(300, width) / k;   // le dessin garde ses proportions : la boîte est plus large en unités du dessin quand la hauteur est comprimée
  const counterTop = 150;
  const items = task.world.items;
  const share = task.world.share;
  const itemZoneEnd = shared && share ? W * 0.42 : W * 0.72;
  const gapX = Math.max(64, (itemZoneEnd - 100) / Math.max(1, items.length));
  const xs = items.map((_, i) => 100 + (i + 0.5) * gapX);
  return (
    <svg viewBox={`0 0 ${W} ${SCENE_H}`} width="100%" height={H} aria-hidden="true" data-coop-scene role="img" aria-label={ariaLabel} style={{ display: 'block', maxHeight: H }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEF3C7" /><stop offset="1" stopColor="#FDE68A" /></linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B45309" /><stop offset="1" stopColor="#92400E" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={SCENE_H} fill={`url(#${uid}-wall)`} />
      {/* étagères du fond */}
      {[34, 80].map((y, r) => (
        <g key={y}>
          <rect x={W * 0.34} y={y + 14} width={W * 0.62} height={5} rx={2} fill="#92400E" />
          {Array.from({ length: Math.floor((W * 0.6) / 17) }, (_, i) => <rect key={i} x={W * 0.35 + i * 17} y={y - 14 + ((i + r) % 3) * 3} width={13} height={28 - ((i + r) % 3) * 3} rx={2} fill={SPINES[(i + r * 3) % SPINES.length]} opacity={0.9} />)}
        </g>
      ))}
      <rect x={W * 0.34} y={6} width={150} height={20} rx={7} fill="#0F766E" stroke="#134E4A" strokeWidth={1.5} />
      <text x={W * 0.34 + 75} y={21} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily={FONT}>تعاونية المدرسة</text>
      {/* Hiba derrière le comptoir */}
      <KidFigure cx={46} top={84} foot={counterTop + 10} mood={mood} skin="light" hair="brown" outfit="green" hairStyle="hijab" scarf="mint" />
      {/* le comptoir */}
      <rect x={0} y={counterTop} width={W} height={SCENE_H - counterTop} fill={`url(#${uid}-wood)`} />
      <rect x={0} y={counterTop} width={W} height={6} fill="#D97706" />
      {items.map((it, i) => <Cluster key={i} item={it} cx={xs[i]} top={counterTop - 2} />)}
      {shared && share && <Share share={share} x0={W * 0.46} x1={W - 10} y={counterTop - 4} />}
      {refuted != null && (
        <g data-coop-refuted className="cc-pop">
          <rect x={W * 0.5 - 52} y={36} width={104} height={46} rx={10} fill="#FFF1F2" stroke="#E11D48" strokeWidth={2} />
          <text x={W * 0.5} y={66} textAnchor="middle" fontSize={22} fontWeight={900} fill="#9F1239" fontFamily={FONT}>{iso(`${refuted}`)}</text>
          <line x1={W * 0.5 - 44} y1={72} x2={W * 0.5 + 44} y2={40} stroke="#E11D48" strokeWidth={3} />
          <text x={W * 0.5} y={32} textAnchor="middle" fontSize={20} fontWeight={900} fill="#E11D48" fontFamily={FONT}>؟</text>
        </g>
      )}
      {solved && !shared && <text x={W - 14} y={30} textAnchor="end" fontSize={22} fill="#059669">✓</text>}
    </svg>
  );
}
