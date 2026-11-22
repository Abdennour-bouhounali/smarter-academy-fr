
/**
 * La figure du تحدّ (x² + 10x = 39, côté 5) dessinée en SVG : le carré ABCD découpé en le carré
 * AEGF (côté x), les rectangles EBHG et FGKD (x × 6) et le carré GHCK (côté 6) ;
 * EB = FD = 5. Les aires des quatre pièces sont écrites dedans — x², 5x, 5x, 25 :
 * c'est le carré COMPLÉTÉ, (x + 5)² = x² + 10x + 25.
 * `showAreas={false}` : la figure nue, sans la piste des aires.
 *
 * `x` est la longueur DESSINÉE (en unités de la figure, pas une solution) : la
 * figure ne révèle pas la réponse x = 5, elle garde x > 5.
 * Les lettres et les aires sont latines (notation) ; la légende arabe est du DOM.
 */
export default function ChallengeSquare({ x = 8, side = 5, label, showAreas = true }) {
  const u = 22;
  const pad = 26;
  const X = x * u;
  const S = side * u;
  const W = X + S + 2 * pad;
  const A = { x: pad, y: pad };
  const P = (dx, dy) => ({ x: A.x + dx, y: A.y + dy });
  const E = P(X, 0); const B = P(X + S, 0); const F = P(0, X); const G = P(X, X);
  const H = P(X + S, X); const D = P(0, X + S); const K = P(X, X + S); const C = P(X + S, X + S);
  const pt = (p, name, dx, dy) => <text x={p.x + dx} y={p.y + dy} fontSize={14} fontWeight="bold" fill="#0F172A" fontFamily="ui-monospace, monospace" textAnchor="middle">{name}</text>;
  const area = (cx, cy, t, fill) => <text x={cx} y={cy} fontSize={15} fontWeight="bold" fill={fill} textAnchor="middle" dominantBaseline="middle" fontFamily="ui-monospace, monospace">{t}</text>;
  return (
    <figure className="mx-auto w-full max-w-sm" data-challenge-figure>
      <svg viewBox={`0 0 ${W} ${W}`} className="h-auto w-full" role="img" aria-label={label} dir="ltr">
        <rect x={A.x} y={A.y} width={X} height={X} fill="#DCFCE7" stroke="#15803D" strokeWidth={2} />
        <rect x={E.x} y={E.y} width={S} height={X} fill="#DBEAFE" stroke="#1D4ED8" strokeWidth={2} />
        <rect x={F.x} y={F.y} width={X} height={S} fill="#DBEAFE" stroke="#1D4ED8" strokeWidth={2} />
        <rect x={G.x} y={G.y} width={S} height={S} fill="#FEF3C7" stroke="#B45309" strokeWidth={2} strokeDasharray="5 3" />
        {showAreas && (
          <>
            {area(A.x + X / 2, A.y + X / 2, 'x²', '#166534')}
            {area(E.x + S / 2, E.y + X / 2, `${side}x`, '#1E3A8A')}
            {area(F.x + X / 2, F.y + S / 2, `${side}x`, '#1E3A8A')}
            {area(G.x + S / 2, G.y + S / 2, String(side * side), '#92400E')}
          </>
        )}
        {pt(A, 'A', -10, -8)}{pt(E, 'E', 0, -8)}{pt(B, 'B', 10, -8)}
        {pt(F, 'F', -12, 5)}{pt(G, 'G', 10, 16)}{pt(H, 'H', 12, 5)}
        {pt(D, 'D', -10, 16)}{pt(K, 'K', 0, 18)}{pt(C, 'C', 10, 16)}
        <text x={A.x - 14} y={A.y + X / 2} fontSize={14} fontStyle="italic" fill="#0F172A" textAnchor="middle">x</text>
        <text x={E.x + S / 2} y={A.y - 8} fontSize={13} fill="#0F172A" textAnchor="middle">{side}</text>
        <text x={A.x - 14} y={F.y + S / 2} fontSize={13} fill="#0F172A" textAnchor="middle">{side}</text>
      </svg>
    </figure>
  );
}
