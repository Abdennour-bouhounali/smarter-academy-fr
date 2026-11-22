import * as L from '../../logic/unitLadder';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';

/**
 * Le dessin de « مسطرة التحويل » (unit-ladder) : l'établi du club de technologie, la règle de laiton gravée de colonnes, les plaques d'unités
 * émaillées et le ruban de mesure à deux poignées. Tout est dessiné en code (CLAUDE.md « Images ») ; l'arabe est du texte DOM de l'SVG.
 * Repère : une colonne = COL unités ; la frontière `pos` est à x = PAD + pos × COL ; la règle est un îlot LTR (les grandes unités à GAUCHE).
 */
export const COL = 36;
export const PAD = 20;
export const H = 184;
const Y_PLAQUE = 6;
export const Y_RULER = 76;
export const Y_BAND = 130;
export const Y_TOTAL = 154;
export const xOf = (pos) => PAD + pos * COL;
export const widthOf = (mode) => 2 * PAD + L.totalColumns(mode) * COL;

export const CSS = `
@keyframes ulShakeA { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes ulShakeB { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-6px) } 40% { transform: translateX(6px) } 60% { transform: translateX(-4px) } 80% { transform: translateX(3px) } }
@keyframes ulPop { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
@keyframes ulPulse { 0%,100% { opacity: .45 } 50% { opacity: 1 } }
.ul-shake-a { animation: ulShakeA .45s ease-in-out both }
.ul-shake-b { animation: ulShakeB .45s ease-in-out both }
.ul-pop { animation: ulPop .4s ease-out both }
.ul-pulse { animation: ulPulse 1.3s ease-in-out infinite }
.ul-plaques { transition: opacity .3s }
@media (prefers-reduced-motion: reduce) { .ul-shake-a, .ul-shake-b, .ul-pop, .ul-pulse { animation: none !important } .ul-plaques { transition: none !important } }
`;

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** 10³ · 10⁻² · 10⁰ en caractères en exposant (plaques de la table de longueur). */
export const tenSup = (n) => `10${String(n).split('').map((c) => SUP[c]).join('')}`;

/** La règle : bois de l'établi, barre de laiton, une colonne par rang (frontières gravées), un trait plus fort à chaque frontière de plaque. */
export function Ruler({ mode, hot }) {
  const cols = L.totalColumns(mode);
  const edges = Array.from({ length: cols + 1 }, (_, i) => i);
  return (
    <g aria-hidden="true" data-ul-ruler>
      <rect x={PAD - 10} y={Y_RULER - 6} width={cols * COL + 20} height="58" rx="8" fill="#92400E" opacity=".18" />
      <rect x={PAD - 6} y={Y_RULER} width={cols * COL + 12} height="44" rx="6" fill="#F6D77A" stroke="#B45309" strokeWidth="3" />
      {edges.map((i) => {
        const strong = L.unitAt(i, mode) !== null;
        return <line key={i} x1={xOf(i)} x2={xOf(i)} y1={Y_RULER + (strong ? 2 : 8)} y2={Y_RULER + 42} stroke="#7C4A03" strokeWidth={strong ? 2.6 : 1.4} opacity={strong ? 0.95 : 0.55} />;
      })}
      {hot !== null && hot !== undefined && <rect x={xOf(hot)} y={Y_RULER} width={COL} height="44" fill="#fff" opacity=".25" />}
    </g>
  );
}

/** Une plaque d'unité : émail blanc, bord de laiton, deux fils vers la règle ; en table de longueur, sa valeur en mètres (10³ …). */
export function Plaque({ u, mode, label, value, state, onTap }) {
  const pos = L.plaquePos(u, mode);
  const w = mode * COL - 5;
  const x = xOf(pos) + 2.5;
  const stroke = state === 'from' ? '#B91C1C' : state === 'to' ? '#047857' : '#B45309';
  return (
    <g data-ul-plaque={u} data-state={state} onClick={onTap} style={{ cursor: 'pointer' }} role="button" tabIndex={-1} aria-label={label} outline="none" className="outline-none">
      <line x1={x + 6} x2={x + 6} y1={Y_PLAQUE + 54} y2={Y_RULER} stroke="#64748B" strokeWidth="1.4" />
      <line x1={x + w - 6} x2={x + w - 6} y1={Y_PLAQUE + 54} y2={Y_RULER} stroke="#64748B" strokeWidth="1.4" />
      <rect x={x} y={Y_PLAQUE} width={w} height="54" rx="7" fill={state === 'from' ? '#FEF2F2' : state === 'to' ? '#ECFDF5' : '#FFFBEB'} stroke={stroke} strokeWidth="3" />
      <text x={x + w / 2} y={Y_PLAQUE + (value ? 22 : 31)} textAnchor="middle" fontSize={mode === 1 ? (label.length > 3 ? 11 : 13) : 14} fontWeight="900" fill="#1E293B">{label}</text>
      {value && <text x={x + w / 2} y={Y_PLAQUE + 42} textAnchor="middle" fontSize="12" fontWeight="800" fill="#7C2D12" direction="ltr">{value}</text>}
    </g>
  );
}

/** Le ruban : de la poignée 1 (fixe) à la poignée 2 (libre) ; rouge vers une plus petite unité, bleu vers une plus grande. */
export function Band({ from, to, k, y = Y_BAND, dashed = false, faint = false, label, labelBelow = false }) {
  if (k === 0 && !label) return null;
  const col = k >= 0 ? '#DC2626' : '#2563EB';
  const a = xOf(from);
  const b = xOf(to);
  const dir = Math.sign(b - a) || 1;
  return (
    <g data-ul-band data-k={k} opacity={faint ? 0.6 : 1}>
      <line x1={a} x2={b - dir * 4} y1={y} y2={y} stroke={col} strokeWidth={dashed ? 4 : 9} strokeLinecap="round" strokeDasharray={dashed ? '8 6' : undefined} />
      {k !== 0 && <path d={`M${b} ${y} l${-dir * 11} -8 v16 Z`} fill={col} />}
      {label && <text x={(a + b) / 2} y={labelBelow ? y + 18 : y - 12} textAnchor="middle" fontSize="13" fontWeight="900" fill={col} stroke="#fff" strokeWidth="3" paintOrder="stroke">{label}</text>}
    </g>
  );
}

/** « × 100000 » : sans groupes de chiffres (le texte du ruban reste court) ; la lecture de la lecture groupe, elle. */
export const factorLabel = (k) => `× ${T.decText({ m: 1n, e: k }, { group: false })}`;
