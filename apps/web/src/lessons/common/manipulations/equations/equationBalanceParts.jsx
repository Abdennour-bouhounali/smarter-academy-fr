
/**
 * Les pièces dessinées de `equation-balance` (la balance du vestiaire), PARTAGÉES par la page (`EquationBalance.jsx`) et le lecteur de mission
 * (`EquationBalancePlayer.jsx`, rollout 2026-11-11, unité 4 leçon 1) : la géométrie du fléau, la place de chaque objet, les objets dessinés.
 * Déplacées telles quelles de la page — aucun changement de dessin.
 */
// ── Géométrie de la scène (unités du viewBox) ────────────────────────────
export const W = 640;
export const PIVOT = 320;
export const ARM = 210;
export const PW = 200; // largeur d'un plateau
export const CX = { L: PIVOT - ARM, R: PIVOT + ARM };
export const KINDS = ['bag', 'anti', 'ball', 'balloon'];

/**
 * La géométrie du fléau pour un déplacement s des plateaux (s > 0 : le plateau GAUCHE descend
 * de s, le droit monte de s). En SVG un angle positif tourne dans le sens horaire et abaisse
 * l'extrémité DROITE : le fléau prend donc −atan(s / ARM), pour que chaque extrémité suive sa
 * tige (ARM·sin θ ≈ s). Le signe a été inversé à la première version (vu par le propriétaire).
 */
export function beamGeometry(s) {
  const angle = -(Math.atan2(s, ARM) * 180) / Math.PI;
  const rad = (angle * Math.PI) / 180;
  return { angle, leftEndDy: -ARM * Math.sin(rad), rightEndDy: ARM * Math.sin(rad) };
}

/** La place de chaque objet sur un plateau (coordonnées locales : origine au centre du plateau, y vers le haut négatif). */
export function layoutPan(c) {
  const ground = [
    ...Array.from({ length: c.bags }, () => 'bag'),
    ...Array.from({ length: c.balls }, () => 'ball'),
    ...(c.part && !c.part.negative ? ['partBall'] : []),
  ];
  const float = [
    ...Array.from({ length: c.antis }, () => 'anti'),
    ...Array.from({ length: c.balloons }, () => 'balloon'),
    ...(c.part && c.part.negative ? ['partBalloon'] : []),
  ];
  const place = (list, cell, yStart) => {
    const cols = Math.max(1, Math.floor(PW / cell));
    const rows = Math.ceil(list.length / cols);
    const items = list.map((kind, i) => {
      const row = Math.floor(i / cols); const col = i % cols;
      const inRow = Math.min(cols, list.length - row * cols);
      const x0 = -(inRow * cell) / 2 + cell / 2;
      return { kind, x: x0 + col * cell, y: yStart - cell / 2 - row * cell, size: cell };
    });
    return { items, h: rows * cell };
  };
  const gCell = ground.length <= 28 ? 30 : ground.length <= 45 ? 22 : 18;
  const g = place(ground, gCell, -4);
  const fCell = float.length <= 32 ? 26 : float.length <= 50 ? 20 : 16;
  const fStart = -4 - g.h - (float.length ? 34 : 0);
  const f = place(float, fCell, fStart);
  return { ground: g.items, float: f.items, height: 4 + g.h + (float.length ? 34 + f.h : 0), knotY: -4 - g.h - 8 };
}

/* ── Les objets dessinés ───────────────────────────────────────────────── */
function Bag({ x, y, s, anti = false }) {
  const w = s * 0.82; const h = s * 0.86;
  return (
    <g transform={`translate(${x} ${y})`}>
      {anti && <ellipse cx={0} cy={-h / 2 - s * 0.18} rx={s * 0.16} ry={s * 0.2} fill="#FB7185" stroke="#BE123C" strokeWidth={1} />}
      <path d={`M${-w * 0.28} ${-h * 0.38} Q${-w / 2} ${-h * 0.1} ${-w / 2} ${h * 0.22} Q${-w / 2} ${h / 2} 0 ${h / 2} Q${w / 2} ${h / 2} ${w / 2} ${h * 0.22} Q${w / 2} ${-h * 0.1} ${w * 0.28} ${-h * 0.38} Z`}
        fill={anti ? '#FFE4E6' : '#B45309'} stroke={anti ? '#BE123C' : '#78350F'} strokeWidth={1.4} strokeDasharray={anti ? '3 2' : undefined} />
      <rect x={-w * 0.2} y={-h * 0.48} width={w * 0.4} height={h * 0.12} rx={2} fill={anti ? '#FDA4AF' : '#92400E'} />
      <text x={0} y={h * 0.26} textAnchor="middle" fontSize={s * 0.36} fontWeight="bold" fill={anti ? '#9F1239' : '#FEF3C7'} fontFamily="ui-monospace, monospace">{anti ? '−x' : 'x'}</text>
    </g>
  );
}
export function Ball({ x, y, s, frac: part }) {
  const r = s * 0.4;
  return (
    <g transform={`translate(${x} ${y})`}>
      {part ? (
        <>
          <circle r={r} fill="#fff" stroke="#94A3B8" strokeDasharray="3 2" />
          <path d={pie(r, part.n / part.d)} fill="#F1F5F9" stroke="#0F172A" strokeWidth={1.2} />
        </>
      ) : (
        <>
          <circle r={r} fill="#fff" stroke="#0F172A" strokeWidth={1.2} />
          <path d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.36} L${-r * 0.25} ${r * 0.36} L${-r * 0.4} ${-r * 0.13} Z`} fill="#0F172A" />
        </>
      )}
    </g>
  );
}
function Balloon({ x, y, s, frac: part }) {
  const rx = s * 0.32; const ry = s * 0.4;
  return (
    <g transform={`translate(${x} ${y})`}>
      {part ? (
        <>
          <ellipse rx={rx} ry={ry} fill="#fff" stroke="#FDA4AF" strokeDasharray="3 2" />
          <path d={pie(Math.min(rx, ry), part.n / part.d)} fill="#F43F5E" stroke="#BE123C" strokeWidth={1} />
        </>
      ) : (
        <ellipse rx={rx} ry={ry} fill="#F43F5E" stroke="#BE123C" strokeWidth={1} />
      )}
      <path d={`M-2 ${ry} L2 ${ry} L0 ${ry + 3} Z`} fill="#BE123C" />
    </g>
  );
}
/** Un secteur de disque : la PART d'un ballon (1/2, 1/7 …). */
function pie(r, f) {
  if (f >= 1) return `M${-r} 0 A${r} ${r} 0 1 1 ${r} 0 A${r} ${r} 0 1 1 ${-r} 0 Z`;
  const a = 2 * Math.PI * f;
  const x = r * Math.sin(a); const y = -r * Math.cos(a);
  return `M0 0 L0 ${-r} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}
export function Item({ it, part }) {
  if (it.kind === 'bag') return <Bag x={it.x} y={it.y} s={it.size} />;
  if (it.kind === 'anti') return <Bag x={it.x} y={it.y} s={it.size} anti />;
  if (it.kind === 'ball') return <Ball x={it.x} y={it.y} s={it.size} />;
  if (it.kind === 'partBall') return <Ball x={it.x} y={it.y} s={it.size} frac={part} />;
  if (it.kind === 'partBalloon') return <Balloon x={it.x} y={it.y} s={it.size} frac={part} />;
  return <Balloon x={it.x} y={it.y} s={it.size} />;
}
/** Une icône seule (réserve, parts) : un petit SVG. */
export function Icon({ kind, size = 30 }) {
  const it = { kind, x: size / 2, y: size / 2 + (kind === 'anti' ? 3 : 0), size: size * 0.95 };
  return <svg width={size} height={size} aria-hidden="true" focusable="false"><Item it={it} /></svg>;
}
