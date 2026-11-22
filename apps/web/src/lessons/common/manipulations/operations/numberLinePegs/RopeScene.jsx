import { W, SVG_H, ROPE_Y, PAD, xOfValue, integersOf } from './pegArt';

/**
 * LE حبل DE « يوم الرياضيات » (thème `clothesline`) — la scène SVG de `number-line-pegs`, dessinée en code, jamais générée. Tout y est HONNÊTE :
 *  - le حبل est tendu entre deux poteaux peints, gradué aux entiers par des étiquettes en bois ; le côté NÉGATIF est peint en bleu froid (avec « − »), le POSITIF en orange
 *    chaud (avec « + ») — la couleur n'est jamais seule ;
 *  - en مبتدئ de petites graduations marquent les douzièmes (le curseur s'y accroche) ; en متقدم il n'y en a pas entre les entiers ;
 *  - rien ne dit où habite un nombre : les cartes sont du DOM posé par le parent.
 * Repère de conception : 470 × 134, mis à l'échelle par le parent.
 */
export const CSS = `
@keyframes npp-dots { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
.npp-ellipsis { animation: npp-dots 1.1s ease-in-out infinite; }
@keyframes npp-pop { 0% { transform: scale(.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.npp-pop { animation: npp-pop 220ms ease-out both; }
@keyframes npp-swing { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
.npp-swing { animation: npp-swing 520ms ease-in-out 2; transform-origin: 50% 0; }
.npp-card { transition: left 900ms cubic-bezier(.3,.7,.2,1), top 900ms cubic-bezier(.3,.7,.2,1); }
.npp-string { transition: height 900ms cubic-bezier(.3,.7,.2,1); }
.npp-rope:focus-visible { outline: 4px solid #818CF8; outline-offset: 2px; border-radius: 12px; }
@media (prefers-reduced-motion: reduce) { .npp-card, .npp-string { transition: none !important; } .npp-ellipsis, .npp-pop, .npp-swing { animation: none !important; } }
`;

const WOOD = '#B45309';
const WOOD_DARK = '#78350F';
const iso = (s) => `⁦${s}⁩`;

export default function RopeScene({ range, snap, ticks, scale, svgRef, uid, label }) {
  const x = (v) => xOfValue(v, range);
  const zero = x(0);
  const tw = [];
  if (ticks) {
    const [lo, hi] = range;
    for (let k = lo * 12; k <= hi * 12; k += 1) if (k % 12 !== 0) tw.push(k);
  }
  const ints = integersOf(range);
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${SVG_H}`} width={W * scale} height={SVG_H * scale} role="img" aria-label={label} data-npp-svg data-snap={snap} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E0F2FE" /><stop offset="1" stopColor="#FEF9C3" /></linearGradient>
        <linearGradient id={`${uid}-neg`} x1="0" x2="1"><stop offset="0" stopColor="#BFDBFE" stopOpacity="0.85" /><stop offset="1" stopColor="#DBEAFE" stopOpacity="0.25" /></linearGradient>
        <linearGradient id={`${uid}-pos`} x1="0" x2="1"><stop offset="0" stopColor="#FED7AA" stopOpacity="0.25" /><stop offset="1" stopColor="#FDBA74" stopOpacity="0.85" /></linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={SVG_H} rx={10} fill={`url(#${uid}-sky)`} />
      {range[0] < 0 && <rect x={PAD - 10} y={ROPE_Y - 40} width={Math.min(zero, W - PAD + 10) - PAD + 10} height={80} rx={8} fill={`url(#${uid}-neg)`} data-npp-negside />}
      {range[1] > 0 && <rect x={Math.max(zero, PAD - 10)} y={ROPE_Y - 40} width={W - PAD + 10 - Math.max(zero, PAD - 10)} height={80} rx={8} fill={`url(#${uid}-pos)`} data-npp-posside />}
      <rect x={0} y={SVG_H - 10} width={W} height={10} fill="#BEF264" opacity={0.7} />

      {/* les deux poteaux peints */}
      {[10, W - 16].map((px, i) => (
        <g key={px} aria-hidden="true">
          <rect x={px} y={14} width={8} height={SVG_H - 22} rx={3} fill={i === 0 ? '#3B82F6' : '#F97316'} stroke={WOOD_DARK} strokeWidth={1.6} />
          <circle cx={px + 4} cy={ROPE_Y} r={4.4} fill="#FDE68A" stroke={WOOD_DARK} strokeWidth={1.6} />
        </g>
      ))}

      {/* le حبل */}
      <line x1={14} x2={W - 12} y1={ROPE_Y} y2={ROPE_Y} stroke="#A16207" strokeWidth={4} strokeLinecap="round" data-npp-ropeline />
      <line x1={14} x2={W - 12} y1={ROPE_Y - 1} y2={ROPE_Y - 1} stroke="#FDE68A" strokeWidth={1.2} strokeDasharray="5 4" opacity={0.8} />

      {/* les douzièmes (مبتدئ) et les entiers */}
      {tw.map((k) => <line key={k} x1={x(k / 12)} x2={x(k / 12)} y1={ROPE_Y + 3} y2={ROPE_Y + 8} stroke="#78350F" strokeWidth={1} opacity={0.55} data-npp-tw />)}
      {ints.map((i) => {
        const neg = i < 0; const pos = i > 0;
        const cx = x(i);
        const big = i === 0;
        const w = big ? 30 : 24; const h = big ? 24 : 18;
        const txt = neg ? `−${Math.abs(i)}` : pos ? `+${i}` : '0';
        const fill = neg ? '#93C5FD' : pos ? '#FDBA74' : '#FDE68A';
        const stroke = neg ? '#1D4ED8' : pos ? '#C2410C' : WOOD_DARK;
        return (
          <g key={i} data-npp-int={i} aria-hidden="true">
            <line x1={cx} x2={cx} y1={ROPE_Y - 9} y2={ROPE_Y + 12} stroke={WOOD} strokeWidth={big ? 3 : 2.2} />
            <rect x={cx - w / 2} y={ROPE_Y + 12} width={w} height={h} rx={5} fill={fill} stroke={stroke} strokeWidth={1.8} />
            <text x={cx} y={ROPE_Y + 12 + h * 0.72} textAnchor="middle" fontSize={big ? 15 : 12.5} fontWeight={900} fill="#1E1B4B" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{iso(txt)}</text>
          </g>
        );
      })}
    </svg>
  );
}
