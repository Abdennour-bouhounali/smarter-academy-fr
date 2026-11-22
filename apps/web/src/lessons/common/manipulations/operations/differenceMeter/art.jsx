import { ratText } from '@smarter-academy/core/arithmetic/powers.js';

/**
 * Le dessin de « مقياس الفرق » (difference-meter) : la paillasse du labo de physique, le galvanomètre à aiguille, la rail de verre graduée, les perles, les sondes, le rideau.
 * Tout est dessiné en code (CLAUDE.md « Images ») ; aucune image. La couleur ne porte JAMAIS seule le sens : « + » et « − » sont imprimés aux deux bouts du cadran.
 * Repère : viewBox 0 0 600 330 ; la rail occupe x ∈ [0, 600] à y = RAIL_Y ; le galvanomètre est centré en (300, PIVOT_Y).
 */
export const VB_W = 600;
export const VB_H = 340;
export const RAIL_Y = 262;
const PIVOT = { x: 300, y: 128 };
const MAX_DEG = 62;
const RED = '#DC2626';
const GREEN = '#16A34A';
export const AMBER = '#F59E0B';
export const BLUE = '#2563EB';

export const CSS = `
@keyframes dmShakeA { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes dmShakeB { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes dmPulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
.dm-shake-a { animation: dmShakeA .45s ease-in-out both }
.dm-shake-b { animation: dmShakeB .45s ease-in-out both }
.dm-pulse { animation: dmPulse 1.4s ease-in-out infinite }
.dm-needle { transition: transform .55s cubic-bezier(.3,1.5,.5,1) }
.dm-bead { transition: transform .35s ease-out }
@media (prefers-reduced-motion: reduce) { .dm-shake-a, .dm-shake-b, .dm-pulse { animation: none !important } .dm-needle, .dm-bead { transition: none !important } }
`;

/** « −1/176 » avec le vrai moins, en texte simple (LTR). */
export const fmt = (r) => ratText(r).replace('-', '−');

/** Angle (degrés) de l'aiguille pour une lecture `v` (nombre) sur une échelle `vmax` : compressé (puissance 0,4) pour qu'une très petite lecture de signe reste visible. */
export function needleDeg(v, vmax) {
  if (v === 0) return 0;
  const f = Math.min(1, (Math.abs(v) / vmax) ** 0.4);
  return Math.sign(v) * f * MAX_DEG;
}

const polar = (deg, r) => ({ x: PIVOT.x + r * Math.sin((deg * Math.PI) / 180), y: PIVOT.y - r * Math.cos((deg * Math.PI) / 180) });
const arc = (a0, a1, r) => { const p = polar(a0, r); const q = polar(a1, r); return `M${p.x} ${p.y} A${r} ${r} 0 0 1 ${q.x} ${q.y}`; };

/** La paillasse : le mur, le plan de travail en bois et l'ombre de la rail. */
export function Bench() {
  return (
    <g aria-hidden="true">
      <rect x="0" y="0" width={VB_W} height={VB_H} fill="#EEF2FF" />
      <rect x="0" y="226" width={VB_W} height="114" fill="#C9A27A" />
      <rect x="0" y="226" width={VB_W} height="8" fill="#A67C52" />
      {[60, 150, 240, 330, 420, 510].map((x) => <line key={x} x1={x} x2={x - 18} y1="234" y2="340" stroke="#B08A60" strokeWidth="1.2" opacity=".6" />)}
      <rect x="6" y="238" width="588" height="52" rx="14" fill="#6B4F32" opacity=".25" />
    </g>
  );
}

/** Le galvanomètre : boîtier de laiton, cadran à zéro central (gauche rouge, droite verte), aiguille, fenêtre numérique, deux bornes. */
export function Meter({ deg, dim, shutter, windowText, side }) {
  const ticks = [-60, -45, -30, -15, 0, 15, 30, 45, 60];
  return (
    <g data-dm-meter-art>
      <rect x="150" y="8" width="300" height="196" rx="26" fill="#B88A2E" />
      <rect x="156" y="14" width="288" height="184" rx="22" fill="#F5E6B8" />
      <rect x="168" y="24" width="264" height="116" rx="16" fill="#FFFDF4" stroke="#8A6A1F" strokeWidth="2" />
      <path d={arc(-62, 0, 84)} stroke="#FCA5A5" strokeWidth="18" fill="none" />
      <path d={arc(0, 62, 84)} stroke="#86EFAC" strokeWidth="18" fill="none" />
      {ticks.map((t) => {
        const a = polar(t, 93); const b = polar(t, t === 0 ? 70 : 78);
        return <line key={t} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={t === 0 ? '#CA8A04' : '#475569'} strokeWidth={t === 0 ? 4 : 2} />;
      })}
      <text x={PIVOT.x - 118} y="72" fontSize="30" fontWeight="900" fill={RED} textAnchor="middle" aria-hidden="true">−</text>
      <text x={PIVOT.x + 118} y="72" fontSize="30" fontWeight="900" fill={GREEN} textAnchor="middle" aria-hidden="true">+</text>
      <text x={PIVOT.x} y="30" fontSize="14" fontWeight="900" fill="#CA8A04" textAnchor="middle">٠</text>
      <g className="dm-needle" data-dm-needle-art style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`, transform: `rotate(${deg}deg)`, opacity: dim ? 0.18 : 1 }}>
        <line x1={PIVOT.x} y1={PIVOT.y + 14} x2={PIVOT.x} y2={PIVOT.y - 92} stroke="#111827" strokeWidth="4" strokeLinecap="round" />
        <polygon points={`${PIVOT.x - 5},${PIVOT.y - 82} ${PIVOT.x + 5},${PIVOT.y - 82} ${PIVOT.x},${PIVOT.y - 98}`} fill="#DC2626" />
      </g>
      <circle cx={PIVOT.x} cy={PIVOT.y} r="9" fill="#374151" stroke="#CA8A04" strokeWidth="3" />
      {shutter && (
        <g data-dm-shutter-art>
          <rect x="168" y="24" width="264" height="116" rx="16" fill="#8A6A1F" />
          <rect x="176" y="32" width="248" height="100" rx="12" fill="#B88A2E" stroke="#F5E6B8" strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="190" x2="410" y1={48 + i * 18} y2={48 + i * 18} stroke="#8A6A1F" strokeWidth="2" opacity=".6" />)}
          <rect x="268" y="56" width="64" height="40" rx="10" fill="#F5E6B8" opacity=".95" />
          <text x="300" y="84" fontSize="26" textAnchor="middle" aria-hidden="true">🔒</text>
        </g>
      )}
      <rect x="218" y="150" width="164" height="38" rx="9" fill="#1F2937" stroke="#8A6A1F" strokeWidth="3" />
      <text x="300" y="177" fontSize="24" fontWeight="900" fill="#86EFAC" textAnchor="middle" data-dm-window data-dm-window-text={windowText} style={{ direction: 'ltr', unicodeBidi: 'isolate', fontFamily: 'ui-monospace, monospace' }}>{windowText}</text>
      <circle cx="176" cy="172" r="13" fill="#7F1D1D" stroke="#FCA5A5" strokeWidth="3" />
      <circle cx="424" cy="172" r="13" fill="#111827" stroke="#9CA3AF" strokeWidth="3" />
      <text x="176" y="177" fontSize="14" fontWeight="900" fill="#fff" textAnchor="middle" aria-hidden="true">+</text>
      <text x="424" y="177" fontSize="14" fontWeight="900" fill="#fff" textAnchor="middle" aria-hidden="true">−</text>
      {side !== null && !dim && !shutter && <title>{side}</title>}
    </g>
  );
}

/** La rail de verre graduée : ticks, étiquettes (LTR), zéro doré. `ticks` = [{ x, label, major, zero }]. */
export function Rail({ ticks }) {
  return (
    <g data-dm-rail-art aria-hidden="true">
      <rect x="2" y={RAIL_Y - 14} width={VB_W - 4} height="28" rx="14" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" opacity=".9" />
      <rect x="10" y={RAIL_Y - 10} width={VB_W - 20} height="8" rx="4" fill="#fff" opacity=".55" />
      {ticks.map((t) => (
        <g key={t.x}>
          <line x1={t.x} x2={t.x} y1={RAIL_Y + 6} y2={RAIL_Y + (t.major ? 18 : 12)} stroke={t.zero ? '#CA8A04' : '#0C4A6E'} strokeWidth={t.zero ? 4 : t.major ? 2.5 : 1.5} />
          {t.label !== undefined && <text x={t.x} y={RAIL_Y + 34} fontSize="15" fontWeight="800" fill={t.zero ? '#A16207' : '#0C4A6E'} textAnchor="middle" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{t.label}</text>}
        </g>
      ))}
    </g>
  );
}

/** Une perle de verre (lettre dedans) ; `x` en unités du repère. */
export function Bead({ x, letter, tone, ...rest }) {
  const fill = tone === 'a' ? AMBER : BLUE;
  return (
    <g className="dm-bead" style={{ transform: `translate(${x}px, ${RAIL_Y}px)` }} {...rest}>
      <ellipse cx="0" cy="14" rx="12" ry="3" fill="#0C4A6E" opacity=".25" />
      <circle cx="0" cy="0" r="13" fill={fill} stroke="#fff" strokeWidth="2.5" />
      <ellipse cx="-4" cy="-5" rx="4.5" ry="3" fill="#fff" opacity=".6" />
      <text x="0" y="6" fontSize="16" fontWeight="900" fill="#fff" textAnchor="middle" style={{ fontStyle: 'italic' }}>{letter}</text>
    </g>
  );
}

/** L'étiquette de valeur d'une perle (pilule LTR) posée au-dessus d'elle. */
export function Tag({ x, y = RAIL_Y + 58, text, tone, w = 74, ...rest }) {
  const stroke = tone === 'a' ? AMBER : tone === 'b' ? BLUE : '#475569';
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true" {...rest}>
      <rect x={-w / 2} y="-13" width={w} height="26" rx="13" fill="#fff" stroke={stroke} strokeWidth="2.5" />
      <text x="0" y="6" fontSize="15" fontWeight="900" fill="#1E293B" textAnchor="middle" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{text}</text>
    </g>
  );
}

/** Une sonde : pointe en bas, corps rouge ou noir. (x, y) = la pointe. */
export function ProbeArt({ x, y, color, selected, on }) {
  const body = color === 'red' ? '#DC2626' : '#111827';
  const dark = color === 'red' ? '#7F1D1D' : '#000';
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform .2s ease-out' }} data-dm-probe-art>
      {selected && <circle cx="0" cy="-26" r="34" fill="none" stroke="#FBBF24" strokeWidth="4" strokeDasharray="6 6" className="dm-pulse" />}
      <polygon points="-4,0 4,0 7,-16 -7,-16" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1" />
      <rect x="-9" y="-58" width="18" height="44" rx="6" fill={body} stroke={dark} strokeWidth="1.5" />
      <rect x="-9" y="-44" width="18" height="6" fill={dark} opacity=".5" />
      <text x="0" y="-26" fontSize="15" fontWeight="900" fill="#fff" textAnchor="middle" aria-hidden="true">{color === 'red' ? '+' : '−'}</text>
      {on && <circle cx="0" cy="0" r="3" fill="#FBBF24" />}
    </g>
  );
}

/** Le fil souple d'une borne à une sonde (courbe qui pend). */
export function Lead({ from, to, color }) {
  const sag = Math.max(40, Math.abs(to.y - from.y) * 0.5 + Math.abs(to.x - from.x) * 0.12);
  return <path d={`M${from.x} ${from.y} C${from.x} ${from.y + sag} ${to.x} ${to.y - 58 - sag * 0.4} ${to.x} ${to.y - 58}`} fill="none" stroke={color === 'red' ? '#B91C1C' : '#1F2937'} strokeWidth="4.5" strokeLinecap="round" opacity=".92" />;
}

/** Le rideau qui cache la rail (épreuve `curtain`). */
export function Curtain({ x0 = 110, x1 = 490 }) {
  const folds = [];
  for (let x = x0 + 14; x < x1; x += 28) folds.push(x);
  return (
    <g data-dm-curtain-art aria-hidden="true">
      <rect x={x0} y={RAIL_Y - 52} width={x1 - x0} height="86" rx="10" fill="#7C3AED" />
      {folds.map((x) => <path key={x} d={`M${x} ${RAIL_Y - 50} q-8 40 0 82`} stroke="#4C1D95" strokeWidth="3" fill="none" opacity=".55" />)}
      <rect x={x0 - 6} y={RAIL_Y - 58} width={x1 - x0 + 12} height="9" rx="4" fill="#B88A2E" />
      <text x={(x0 + x1) / 2} y={RAIL_Y + 2} fontSize="30" textAnchor="middle">❓</text>
    </g>
  );
}

/** La loupe de la lampe : une capsule de verre où les deux perles sont EMPILÉES (a en haut, b en bas) — elle ne montre PAS l'ordre sur la rail (haut/bas n'est pas gauche/droite), elle donne seulement une poignée par perle quand elles se recouvrent. */
export const LENS = { x: 548, ya: 138, yb: 198 };
export function Lens({ x = LENS.x, y = (LENS.ya + LENS.yb) / 2 }) {
  return (
    <g transform={`translate(${x} ${y})`} data-dm-lens aria-hidden="true">
      <rect x="-28" y="-58" width="56" height="116" rx="28" fill="#fff" opacity=".85" stroke="#0369A1" strokeWidth="4" />
      <line x1="18" y1="52" x2="34" y2="70" stroke="#0369A1" strokeWidth="6" strokeLinecap="round" />
    </g>
  );
}
