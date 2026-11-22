
/**
 * Le dessin de « عدسة القوى » (ten-zoom) : la table du club de sciences, la lentille de laiton, la BAGUE crantée, le cadre carré et le décor à son
 * échelle (un petit décor par exposant de −7 à 9, tailles TYPIQUES et honnêtes). Tout est dessiné en code (CLAUDE.md « Images ») ; aucune image,
 * aucune frontière politique (côte et relief stylisés seulement). La couleur ne porte jamais seule le sens : le côté est écrit sur la plaque.
 * Repère : viewBox 0 0 600 400 ; la lentille est centrée en (300, 198), rayon intérieur 122, bague de 122 à 162.
 */
export const VB_W = 600;
export const VB_H = 400;
export const CX = 300;
export const CY = 198;
export const R_IN = 122;
export const R_OUT = 162;
export const FRAME = 150;
export const NOTCH_DEG = 30;
/** La cellule en surbrillance de la grille 10 × 10 du cadre (colonne 4, rangée 4 à partir du coin) : le cadre voisin y rentre ou en sort. */
const CELL = { col: 4, row: 4 };
const AMBER = '#F59E0B';
const FX = CX - FRAME / 2;
const FY = CY - FRAME / 2;

export const CSS = `
@keyframes tzShakeA { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes tzShakeB { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes tzOld { from { opacity: 1; transform: none } to { opacity: 0; transform: translate(90px, 90px) scale(var(--tz-f)) translate(-90px, -90px) } }
@keyframes tzNew { from { opacity: 0 } to { opacity: 1 } }
@keyframes tzPulse { 0%,100% { opacity: .45 } 50% { opacity: 1 } }
.tz-shake-a { animation: tzShakeA .45s ease-in-out both }
.tz-shake-b { animation: tzShakeB .45s ease-in-out both }
.tz-old { animation: tzOld .55s ease-in forwards; transform-origin: 0 0 }
.tz-new { animation: tzNew .55s ease-out both }
.tz-pulse { animation: tzPulse 1.3s ease-in-out infinite }
.tz-ring { transition: transform .25s cubic-bezier(.3,1.4,.5,1); transform-origin: ${CX}px ${CY}px; transform-box: view-box }
@media (prefers-reduced-motion: reduce) { .tz-shake-a, .tz-shake-b, .tz-old, .tz-new, .tz-pulse { animation: none !important } .tz-old { opacity: 0 } .tz-ring { transition: none !important } }
`;

/** La table du club de sciences : mur clair, plan de travail en bois, ombre de la lentille. */
export function Bench() {
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width={VB_W} height={VB_H} fill="#EEF2FF" />
      <rect x="0" y="318" width={VB_W} height="82" fill="#C9A27A" />
      <rect x="0" y="318" width={VB_W} height="8" fill="#A67C52" />
      {[40, 130, 220, 310, 400, 490, 580].map((x) => <line key={x} x1={x} x2={x - 20} y1="326" y2="400" stroke="#B08A60" strokeWidth="1.2" opacity=".55" />)}
      <ellipse cx={CX} cy="362" rx="150" ry="14" fill="#6B4F32" opacity=".28" />
      <rect x="226" y="338" width="148" height="26" rx="6" fill="#92400E" opacity=".9" />
      <rect x="226" y="338" width="148" height="6" rx="3" fill="#B45309" />
    </g>
  );
}

/** La bague de zoom : une couronne de laiton à 24 crans, qui tourne de 30° par cran ; l'index fixe est en haut. */
export function Ring({ angle, active }) {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <g data-tz-ring-art>
      <g className="tz-ring" style={{ transform: `rotate(${angle}deg)` }}>
        <circle cx={CX} cy={CY} r={(R_IN + R_OUT) / 2} fill="none" stroke="#D69E2E" strokeWidth={R_OUT - R_IN} />
        <circle cx={CX} cy={CY} r={(R_IN + R_OUT) / 2} fill="none" stroke="#F6D77A" strokeWidth="6" opacity=".55" />
        {ticks.map((d) => {
          const long = d % 30 === 0;
          const a = (d * Math.PI) / 180;
          const r0 = R_OUT - (long ? 18 : 11);
          return <line key={d} x1={CX + r0 * Math.sin(a)} y1={CY - r0 * Math.cos(a)} x2={CX + (R_OUT - 2) * Math.sin(a)} y2={CY - (R_OUT - 2) * Math.cos(a)} stroke="#7C4A03" strokeWidth={long ? 4 : 2.2} strokeLinecap="round" />;
        })}
        {ticks.filter((d) => d % 30 === 0).map((d) => {
          const a = (d * Math.PI) / 180;
          return <circle key={`d${d}`} cx={CX + (R_IN + 11) * Math.sin(a)} cy={CY - (R_IN + 11) * Math.cos(a)} r="2.6" fill="#7C4A03" />;
        })}
      </g>
      <circle cx={CX} cy={CY} r={R_IN} fill="none" stroke="#7C4A03" strokeWidth="5" />
      <circle cx={CX} cy={CY} r={R_OUT + 3} fill="none" stroke="#92400E" strokeWidth="3" />
      {/* l'index fixe */}
      <path d={`M${CX - 11} ${CY - R_OUT - 14} L${CX + 11} ${CY - R_OUT - 14} L${CX} ${CY - R_OUT + 4} Z`} fill={active ? '#DC2626' : '#B91C1C'} stroke="#fff" strokeWidth="2" />
    </g>
  );
}

/** Le cadre : contour lumineux, coins, grille 10 × 10 (fine), cellule voisine en surbrillance. */
export function Frame({ grid = true }) {
  const step = FRAME / 10;
  return (
    <g data-tz-frame-art>
      {grid && Array.from({ length: 9 }, (_, i) => (
        <g key={i} stroke="#0F172A" strokeWidth="0.7" opacity=".28">
          <line x1={FX + step * (i + 1)} y1={FY} x2={FX + step * (i + 1)} y2={FY + FRAME} />
          <line x1={FX} y1={FY + step * (i + 1)} x2={FX + FRAME} y2={FY + step * (i + 1)} />
        </g>
      ))}
      <rect x={FX + CELL.col * step} y={FY + CELL.row * step} width={step} height={step} fill={AMBER} opacity=".22" />
      <rect x={FX} y={FY} width={FRAME} height={FRAME} fill="none" stroke="#FACC15" strokeWidth="4.5" />
      <rect x={FX - 2} y={FY - 2} width={FRAME + 4} height={FRAME + 4} fill="none" stroke="#92400E" strokeWidth="1.2" opacity=".7" />
      {[[FX, FY, 1, 1], [FX + FRAME, FY, -1, 1], [FX, FY + FRAME, 1, -1], [FX + FRAME, FY + FRAME, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x + sx * 16} ${y} L${x} ${y} L${x} ${y + sy * 16}`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Le décor de l'échelle n (de −7 à 9), dans une boîte 0 … 200. `null` hors de cet intervalle. */
export function Vignette({ n }) {
  const f = SCENES[n];
  return f ? f() : null;
}

const sky = (c = '#DBEAFE') => <rect x="0" y="0" width="200" height="200" fill={c} />;

const SCENES = {
  // −7 : un virus (≈ 100 nm) — une sphère à pointes
  '-7': () => (
    <g>{sky('#ECFEFF')}
      {Array.from({ length: 16 }, (_, i) => { const a = (i * 22.5 * Math.PI) / 180; return <g key={i}><line x1={100 + 40 * Math.cos(a)} y1={100 + 40 * Math.sin(a)} x2={100 + 62 * Math.cos(a)} y2={100 + 62 * Math.sin(a)} stroke="#7C3AED" strokeWidth="5" strokeLinecap="round" /><circle cx={100 + 64 * Math.cos(a)} cy={100 + 64 * Math.sin(a)} r="6" fill="#A78BFA" /></g>; })}
      <circle cx="100" cy="100" r="42" fill="#8B5CF6" /><circle cx="86" cy="86" r="12" fill="#C4B5FD" opacity=".7" /></g>),
  // −6 : une bactérie (≈ 2 µm) — une gélule avec des cils
  '-6': () => (
    <g>{sky('#F0FDF4')}
      {[-30, -10, 10, 30].map((y) => <path key={y} d={`M44 ${100 + y} q-14 ${y > 0 ? 10 : -10} -26 0`} fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />)}
      <rect x="40" y="62" width="130" height="76" rx="38" fill="#4ADE80" stroke="#15803D" strokeWidth="4" />
      <ellipse cx="100" cy="100" rx="34" ry="14" fill="#86EFAC" opacity=".8" />
      {[70, 120, 150].map((x) => <circle key={x} cx={x} cy="100" r="4" fill="#166534" />)}</g>),
  // −5 : un globule rouge (≈ 7 µm) — un disque biconcave
  '-5': () => (
    <g>{sky('#FEF2F2')}
      <ellipse cx="100" cy="100" rx="68" ry="64" fill="#DC2626" /><ellipse cx="100" cy="100" rx="34" ry="30" fill="#EF4444" /><ellipse cx="90" cy="86" rx="14" ry="9" fill="#FCA5A5" opacity=".7" />
      <ellipse cx="100" cy="100" rx="68" ry="64" fill="none" stroke="#7F1D1D" strokeWidth="4" /></g>),
  // −4 : la coupe d'un cheveu (≈ 70 µm) — cercles concentriques
  '-4': () => (
    <g>{sky('#FFFBEB')}
      <circle cx="100" cy="100" r="70" fill="#92400E" /><circle cx="100" cy="100" r="54" fill="#B45309" /><circle cx="100" cy="100" r="30" fill="#D97706" /><circle cx="100" cy="100" r="12" fill="#FCD34D" />
      {Array.from({ length: 14 }, (_, i) => { const a = (i * 25.7 * Math.PI) / 180; return <circle key={i} cx={100 + 42 * Math.cos(a)} cy={100 + 42 * Math.sin(a)} r="3" fill="#78350F" opacity=".7" />; })}</g>),
  // −3 : un grain de sel (≈ 0,5 mm) — un cube en perspective
  '-3': () => (
    <g>{sky('#F1F5F9')}
      <polygon points="100,38 168,74 100,110 32,74" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="32,74 100,110 100,172 32,136" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="168,74 100,110 100,172 168,136" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="4" strokeLinejoin="round" />
      <polygon points="80,58 112,50 128,62 96,70" fill="#fff" opacity=".8" /></g>),
  // −2 : une coccinelle (≈ 7 mm)
  '-2': () => (
    <g>{sky('#ECFCCB')}
      <path d="M20 170 Q100 140 180 170" stroke="#4D7C0F" strokeWidth="6" fill="none" />
      <circle cx="100" cy="70" r="22" fill="#111827" /><circle cx="90" cy="64" r="5" fill="#fff" /><circle cx="110" cy="64" r="5" fill="#fff" />
      <ellipse cx="100" cy="116" rx="60" ry="54" fill="#DC2626" stroke="#7F1D1D" strokeWidth="4" /><line x1="100" y1="62" x2="100" y2="170" stroke="#111827" strokeWidth="4" />
      {[[74, 96], [126, 96], [68, 132], [132, 132], [86, 154], [114, 154]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#111827" />)}</g>),
  // −1 : une gomme (≈ 4 cm)
  '-1': () => (
    <g>{sky('#FFF7ED')}
      <rect x="30" y="64" width="140" height="72" rx="12" fill="#F9A8D4" stroke="#BE185D" strokeWidth="4" />
      <rect x="30" y="64" width="70" height="72" rx="12" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="4" />
      <rect x="40" y="76" width="50" height="10" rx="4" fill="#BFDBFE" opacity=".9" /><rect x="112" y="76" width="46" height="10" rx="4" fill="#FBCFE8" opacity=".9" /></g>),
  // 0 : le dessus d'une table (1 m) avec un cartable
  '0': () => (
    <g>
      <rect x="0" y="0" width="200" height="200" fill="#D6B48A" />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1="0" x2="200" y1={30 + i * 32} y2={30 + i * 32} stroke="#B58B5B" strokeWidth="1.5" opacity=".6" />)}
      <rect x="22" y="50" width="76" height="92" rx="12" fill="#2563EB" stroke="#1E3A8A" strokeWidth="4" /><rect x="34" y="92" width="52" height="34" rx="6" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="3" /><path d="M42 50 q18 -22 36 0" fill="none" stroke="#1E3A8A" strokeWidth="5" />
      <rect x="116" y="70" width="64" height="86" rx="4" fill="#FEF9C3" stroke="#A16207" strokeWidth="3" transform="rotate(8 148 113)" />
      <rect x="112" y="40" width="70" height="9" rx="3" fill="#FACC15" stroke="#A16207" strokeWidth="2" transform="rotate(-12 147 44)" /></g>),
  // 1 : la classe (≈ 10 m) vue d'en haut
  '1': () => (
    <g>{sky('#FEF3C7')}
      <rect x="14" y="14" width="172" height="172" fill="#FDE68A" stroke="#92400E" strokeWidth="5" />
      <rect x="40" y="18" width="120" height="12" fill="#166534" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={34 + c * 36} y={66 + r * 38} width="26" height="20" rx="3" fill="#B45309" />))}
      <rect x="86" y="38" width="28" height="16" rx="3" fill="#7C2D12" /><rect x="164" y="150" width="14" height="36" fill="#7DD3FC" /></g>),
  // 2 : l'école avec son terrain de foot (≈ 100 m)
  '2': () => (
    <g>{sky('#BBF7D0')}
      <rect x="20" y="20" width="160" height="160" fill="#86EFAC" />
      <rect x="28" y="96" width="144" height="76" fill="#4ADE80" stroke="#fff" strokeWidth="3" /><line x1="100" y1="96" x2="100" y2="172" stroke="#fff" strokeWidth="3" /><circle cx="100" cy="134" r="14" fill="none" stroke="#fff" strokeWidth="3" />
      <rect x="28" y="30" width="110" height="46" fill="#FCA5A5" stroke="#991B1B" strokeWidth="4" /><rect x="148" y="30" width="24" height="46" fill="#FDE68A" stroke="#92400E" strokeWidth="3" /></g>),
  // 3 : le quartier (≈ 1 km)
  '3': () => (
    <g>{sky('#E7E5E4')}
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <g key={`${r}${c}`}><rect x={14 + c * 62} y={14 + r * 62} width="48" height="48" fill="#FDE68A" stroke="#92400E" strokeWidth="2.5" /><polygon points={`${14 + c * 62},${14 + r * 62 + 18} ${38 + c * 62},${14 + r * 62 + 4} ${62 + c * 62},${14 + r * 62 + 18}`} fill="#DC2626" /></g>))}
      <path d="M0 76 H200 M0 138 H200 M76 0 V200 M138 0 V200" stroke="#78716C" strokeWidth="6" fill="none" opacity=".55" /></g>),
  // 4 : la ville (≈ 10 km) — pâtés, avenues et un rond-point
  '4': () => (
    <g>{sky('#D6D3D1')}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_c, c) => <rect key={`${r}${c}`} x={10 + c * 38} y={10 + r * 38} width="28" height="28" fill={(r + c) % 3 === 0 ? '#FCA5A5' : '#FDE68A'} opacity=".9" />))}
      <circle cx="100" cy="100" r="16" fill="#86EFAC" stroke="#57534E" strokeWidth="5" /><path d="M0 40 L200 160" stroke="#57534E" strokeWidth="5" opacity=".6" />
      <path d="M0 175 Q60 150 120 172 T200 168" stroke="#38BDF8" strokeWidth="8" fill="none" /></g>),
  // 5 : la wilaya (≈ 100 km) — la côte, la plaine, la montagne (relief stylisé, aucune frontière)
  '5': () => (
    <g>
      <rect width="200" height="200" fill="#86EFAC" />
      <path d="M0 0 H200 V46 Q160 66 120 50 T0 62 Z" fill="#38BDF8" />
      <path d="M0 62 Q60 46 120 50 T200 46" stroke="#FEF08A" strokeWidth="6" fill="none" />
      {[[30, 120], [70, 140], [110, 128], [150, 148], [60, 168], [130, 176]].map(([x, y], i) => <polygon key={i} points={`${x - 22},${y + 18} ${x},${y - 20} ${x + 22},${y + 18}`} fill="#A16207" stroke="#78350F" strokeWidth="3" />)}
      <circle cx="96" cy="92" r="9" fill="#F87171" stroke="#7F1D1D" strokeWidth="2.5" /></g>),
  // 6 : le nord du pays (≈ 1 000 km) — mer, bande de reliefs, désert (stylisé)
  '6': () => (
    <g>
      <rect width="200" height="200" fill="#FDE68A" />
      <path d="M0 0 H200 V40 Q140 62 90 46 T0 58 Z" fill="#38BDF8" />
      <path d="M0 58 Q40 70 90 46 T200 40 V92 Q130 112 80 94 T0 108 Z" fill="#86EFAC" />
      <path d="M0 108 Q80 94 130 112 T200 92 V118 Q120 140 70 124 T0 136 Z" fill="#CA8A04" opacity=".55" />
      {[[30, 100], [80, 90], [130, 100], [170, 86]].map(([x, y], i) => <polygon key={i} points={`${x - 16},${y + 12} ${x},${y - 14} ${x + 16},${y + 12}`} fill="#A16207" />)}
      <g fill="#EAB308" opacity=".5">{[40, 90, 150].map((x) => <circle key={x} cx={x} cy={170} r="10" />)}</g></g>),
  // 7 : la Terre (≈ 10 000 km)
  '7': () => (
    <g>{sky('#0F172A')}
      {[[20, 30], [170, 40], [30, 170], [176, 160], [60, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" />)}
      <circle cx="100" cy="100" r="74" fill="#2563EB" stroke="#1E3A8A" strokeWidth="3" />
      <path d="M62 70 q16 -18 38 -6 q-6 22 -30 30 q-18 0 -8 -24 Z" fill="#4ADE80" /><path d="M110 108 q26 -8 36 14 q-12 28 -34 22 q-12 -14 -2 -36 Z" fill="#4ADE80" /><ellipse cx="82" cy="136" rx="14" ry="9" fill="#4ADE80" />
      <ellipse cx="78" cy="68" rx="22" ry="10" fill="#fff" opacity=".35" /></g>),
  // 8 : la Terre et une partie de l'orbite de la Lune (≈ 100 000 km)
  '8': () => (
    <g>{sky('#0F172A')}
      {[[20, 30], [170, 24], [30, 176], [176, 170], [120, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" />)}
      <circle cx="46" cy="100" r="24" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2.5" /><path d="M36 92 q8 -8 16 -2 q-4 10 -14 12 Z" fill="#4ADE80" />
      <path d="M46 20 A 80 80 0 0 1 46 180" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6 6" />
      <circle cx="126" cy="100" r="9" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" /></g>),
  // 9 : l'orbite entière de la Lune (≈ 1 000 000 km)
  '9': () => (
    <g>{sky('#0F172A')}
      {[[20, 24], [172, 30], [24, 174], [178, 166], [100, 10], [100, 192]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" />)}
      <circle cx="100" cy="100" r="74" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6 6" />
      <circle cx="100" cy="100" r="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="1.5" /><circle cx="170" cy="76" r="5" fill="#E2E8F0" /></g>),
};

/** Les valeurs de n pour lesquelles un décor existe. */
export const SCENE_IDS = Object.freeze(Object.keys(SCENES).map(Number));
