
/**
 * Le dessin de « لوحة الدمج » (merge-board) : la barre signée d'une tuile, l'aimant, la mini-droite des barres et le CSS des animations.
 * Tout est dessiné en code (CLAUDE.md « Images ») ; aucune image. Les couleurs ne portent JAMAIS seules le signe : « + » / « − » est toujours imprimé.
 */
const BLUE = '#2563EB';
const RED = '#DC2626';
const colorOf = (sg) => (sg < 0 ? RED : sg > 0 ? BLUE : '#64748B');

export const CSS = `
@keyframes mbPop { 0% { transform: scale(.55); opacity: .2 } 60% { transform: scale(1.1); opacity: 1 } 100% { transform: scale(1) } }
@keyframes mbShakeA { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-7px) } 40% { transform: translateX(7px) } 60% { transform: translateX(-5px) } 80% { transform: translateX(4px) } }
@keyframes mbShakeB { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-7px) } 40% { transform: translateX(7px) } 60% { transform: translateX(-5px) } 80% { transform: translateX(4px) } }
@keyframes mbGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,.0) } 50% { box-shadow: 0 0 18px 4px rgba(251,191,36,.55) } }
.mb-pop { animation: mbPop .45s ease-out both }
.mb-shake-a { animation: mbShakeA .45s ease-in-out both }
.mb-shake-b { animation: mbShakeB .45s ease-in-out both }
.mb-glow { animation: mbGlow 1.6s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .mb-pop, .mb-shake-a, .mb-shake-b, .mb-glow { animation: none !important } }
`;

/** La barre signée sous une tuile : le centre est le zéro, bleu vers la droite (+), rouge vers la gauche (−) ; `frac` ∈ [0, 1]. */
export function SignBar({ sign, frac, hidden = false, width = 76 }) {
  const half = width / 2;
  if (hidden) {
    return (
      <svg width={width} height="18" viewBox={`0 0 ${width} 18`} aria-hidden="true" data-mb-bar="hidden">
        <line x1="3" x2={width - 3} y1="9" y2="9" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 4" />
        <line x1={half} x2={half} y1="3" y2="15" stroke="#64748B" strokeWidth="2" />
      </svg>
    );
  }
  const len = Math.max(sign === 0 ? 0 : 3, frac * (half - 3));
  const x = sign < 0 ? half - len : half;
  return (
    <svg width={width} height="18" viewBox={`0 0 ${width} 18`} aria-hidden="true" data-mb-bar={sign < 0 ? 'neg' : sign > 0 ? 'pos' : 'zero'} data-len={len.toFixed(1)}>
      <line x1="3" x2={width - 3} y1="9" y2="9" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x={x} y="4" width={len} height="10" rx="3" fill={colorOf(sign)} />
      <line x1={half} x2={half} y1="2" y2="16" stroke="#0F172A" strokeWidth="2" />
      <text x={sign < 0 ? width - 8 : 8} y="13" fontSize="12" fontWeight="900" fill={colorOf(sign)} textAnchor="middle">{sign < 0 ? '−' : sign > 0 ? '+' : '٠'}</text>
    </svg>
  );
}

/** L'aimant en fer à cheval qui tient un × ou ÷ à ses voisines (rouge et argent, pôles blancs). */
export function Magnet({ faint = false, size = 30 }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 30 24" aria-hidden="true" data-mb-magnet-art style={{ opacity: faint ? 0.45 : 1 }}>
      <path d="M5 22 V10 a10 10 0 0 1 20 0 V22" fill="none" stroke="#DC2626" strokeWidth="6" strokeLinecap="butt" />
      <rect x="2" y="17" width="6" height="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
      <rect x="22" y="17" width="6" height="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
    </svg>
  );
}

/**
 * La mini-droite d'un + ou − : les deux barres BOUT À BOUT à partir du zéro. Mêmes couleurs : elles s'ajoutent ; couleurs opposées : elles se CHEVAUCHENT et la partie la plus courte disparaît.
 * `a`, `b` : rationnels (b déjà signé par l'opération : pour « − » on passe l'opposé). `scale` : |valeur| maximale de la chaîne.
 */
export function MiniLine({ a, b, scale, width = 300 }) {
  const num = (v) => Number(v.n) / Number(v.d);
  const x0 = width / 2;
  const unit = (width / 2 - 14) / Math.max(1, scale * 1.6);
  const A = num(a); const B = num(b); const S = A + B;
  const X = (v) => x0 + v * unit;
  const bar = (from, to, y, color, op = 1) => (
    <rect x={Math.min(X(from), X(to))} y={y} width={Math.max(2, Math.abs(X(to) - X(from)))} height="11" rx="3" fill={color} opacity={op} />
  );
  const sg = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
  return (
    <svg viewBox={`0 0 ${width} 66`} width="100%" height="66" role="img" data-mb-miniline data-sum={S.toFixed(3)} aria-hidden="true" className="max-w-[340px]">
      <line x1="6" x2={width - 6} y1="33" y2="33" stroke="#334155" strokeWidth="1" opacity="0.35" />
      <line x1={x0} x2={x0} y1="2" y2="64" stroke="#0F172A" strokeWidth="2" />
      {bar(0, A, 6, colorOf(sg(A)))}
      {bar(A, A + B, 22, colorOf(sg(B)), 0.85)}
      {bar(0, S, 46, colorOf(sg(S)))}
      <text x={X(S) + (S < 0 ? -6 : 6)} y={55} fontSize="11" fontWeight="900" textAnchor={S < 0 ? 'end' : 'start'} fill={colorOf(sg(S))}>{S < 0 ? '−' : S > 0 ? '+' : '٠'}</text>
    </svg>
  );
}

