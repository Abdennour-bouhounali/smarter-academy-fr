
/**
 * Les figures du manuel (p. 61), REDESSINÉES en SVG (jamais d'image) : elles portent seulement des
 * lettres latines, x, y et des mesures — tout texte arabe reste dans l'énoncé. Chaque figure est
 * décrite par l'énoncé qui l'accompagne : elle est donc `aria-hidden`, et sa largeur suit le
 * conteneur (lisible du fond de la classe).
 */
const Frame = ({ children, viewBox, label }) => (
  <figure className="mx-auto w-full max-w-[20rem]" dir="ltr" data-figure={label}>
    <svg viewBox={viewBox} width="100%" aria-hidden="true" focusable="false" style={{ display: 'block' }}
      fontFamily="ui-sans-serif, system-ui" fontSize="13">
      {children}
    </svg>
  </figure>
);

/** Un trait d'égalité perpendiculaire au segment [P, Q], en son milieu (n traits). */
function ticks(P, Q, n = 1, color = '#059669') {
  const mx = (P[0] + Q[0]) / 2; const my = (P[1] + Q[1]) / 2;
  const dx = Q[0] - P[0]; const dy = Q[1] - P[1]; const L = Math.hypot(dx, dy);
  const ux = dx / L; const uy = dy / L; const nx = -uy; const ny = ux;
  return Array.from({ length: n }, (_, i) => {
    const o = (i - (n - 1) / 2) * 4;
    const cx = mx + ux * o; const cy = my + uy * o;
    return <line key={i} x1={cx - nx * 6} y1={cy - ny * 6} x2={cx + nx * 6} y2={cy + ny * 6} stroke={color} strokeWidth="2" />;
  });
}

/**
 * تمرين 19 : le triangle isocèle ABC de sommet A (Â = x = 36°, B̂ = Ĉ = y = 72°), la bissectrice (d)
 * de Ĉ qui coupe [AB] en D, avec AD = DC. Les angles sont ceux de la solution, pour que la figure
 * soit JUSTE (le manuel dit « الأطوال على الشكل ليست حقيقية » seulement pour l'ex. 21).
 */
export function IsoscelesBisectorFigure() {
  // A en haut ; base BC = 140 ; Â = 36° ⇒ hauteur = 70 / tan 18°
  const B = [60, 250]; const C = [200, 250];
  const h = 70 / Math.tan((18 * Math.PI) / 180);
  const A = [130, 250 - h];
  // D sur [AB] avec AD = DC : D = A + t (B − A), Â = ACD = 36°, AD = DC = BC (triangle d'or)
  const AB = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const t = 140 / AB;
  const D = [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
  // (d) prolongée au-delà de D
  const ext = [C[0] + 1.45 * (D[0] - C[0]), C[1] + 1.45 * (D[1] - C[1])];
  return (
    <Frame viewBox="0 -2 260 272" label="ex-19">
      <path d={`M${A} L${B} L${C} Z`} fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={C[0]} y1={C[1]} x2={ext[0]} y2={ext[1]} stroke="#DC2626" strokeWidth="2" />
      {ticks(A, B, 1)}{ticks(A, C, 1)}
      {ticks(A, D, 2, '#D97706')}{ticks(D, C, 2, '#D97706')}
      <text x={A[0]} y={A[1] - 6} textAnchor="middle" fontWeight="bold" fill="#0F172A">A</text>
      <text x={B[0] - 12} y={B[1] + 14} fontWeight="bold" fill="#0F172A">B</text>
      <text x={C[0] + 4} y={C[1] + 14} fontWeight="bold" fill="#0F172A">C</text>
      <text x={D[0] - 16} y={D[1] + 2} fontWeight="bold" fill="#0F172A">D</text>
      <text x={ext[0] - 6} y={ext[1] - 6} fill="#DC2626" fontWeight="bold">(d)</text>
      <text x={A[0] - 3} y={A[1] + 30} fill="#1D4ED8" fontWeight="bold" fontStyle="italic">x</text>
      <text x={B[0] + 14} y={B[1] - 6} fill="#1D4ED8" fontWeight="bold" fontStyle="italic">y</text>
      <path d={`M${B[0] + 10} ${B[1]} A 10 10 0 0 0 ${B[0] + 10 * (A[0] - B[0]) / Math.hypot(A[0] - B[0], A[1] - B[1])} ${B[1] + 10 * (A[1] - B[1]) / Math.hypot(A[0] - B[0], A[1] - B[1])}`} fill="none" stroke="#1D4ED8" strokeWidth="1.5" />
    </Frame>
  );
}

/**
 * تمرين 21 : le triangle EBC, A sur [EB], D sur [EC], (AD) ∥ (BC) ; EA = 6 cm (manuel : 10 cm, triangle impossible —
 * coquille corrigée 2026-10-07), AB = 4 cm,
 * DC = 5 cm, AD = y, BC = x ; ABCD trapèze (coloré). « الأطوال على الشكل ليست حقيقية » : on garde
 * seulement le parallélisme et l'ordre des points.
 */
export function ThalesTrapezoidFigure() {
  const E = [150, 14]; const B = [40, 250]; const C = [210, 280];
  const k = 6 / 10;
  const A = [E[0] + k * (B[0] - E[0]), E[1] + k * (B[1] - E[1])];
  const D = [E[0] + k * (C[0] - E[0]), E[1] + k * (C[1] - E[1])];
  const mid = (P, Q, dx = 0, dy = 0) => [(P[0] + Q[0]) / 2 + dx, (P[1] + Q[1]) / 2 + dy];
  const [eaX, eaY] = mid(E, A, -34, 0);
  const [abX, abY] = mid(A, B, -30, 4);
  const [dcX, dcY] = mid(D, C, 10, 0);
  const [adX, adY] = mid(A, D, 0, -6);
  const [bcX, bcY] = mid(B, C, 0, 18);
  return (
    <Frame viewBox="0 0 260 300" label="ex-21">
      <path d={`M${A} L${B} L${C} L${D} Z`} fill="#FCE7F3" stroke="none" />
      <path d={`M${E} L${B} L${C} Z`} fill="none" stroke="#334155" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke="#BE185D" strokeWidth="2.5" />
      <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#BE185D" strokeWidth="2.5" />
      <text x={E[0] + 6} y={E[1] + 4} fontWeight="bold" fill="#0F172A">E</text>
      <text x={A[0] - 14} y={A[1] - 2} fontWeight="bold" fill="#0F172A">A</text>
      <text x={B[0] - 14} y={B[1] + 6} fontWeight="bold" fill="#0F172A">B</text>
      <text x={C[0] + 4} y={C[1] + 10} fontWeight="bold" fill="#0F172A">C</text>
      <text x={D[0] + 6} y={D[1]} fontWeight="bold" fill="#0F172A">D</text>
      <text x={eaX} y={eaY} fill="#475569">6cm</text>
      <text x={abX} y={abY} fill="#475569">4cm</text>
      <text x={dcX} y={dcY} fill="#475569">5cm</text>
      <text x={adX} y={adY} textAnchor="middle" fill="#BE185D" fontWeight="bold" fontStyle="italic">y</text>
      <text x={bcX} y={bcY} textAnchor="middle" fill="#BE185D" fontWeight="bold" fontStyle="italic">x</text>
    </Frame>
  );
}
