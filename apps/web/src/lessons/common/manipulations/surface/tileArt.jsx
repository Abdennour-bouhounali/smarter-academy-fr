import * as S from '@smarter-academy/core/arithmetic/surfaces.js';

/**
 * tile-yard — les PIÈCES DESSINÉES du monde « حوش » (zellige, clôture de bois, tas, rouleau de corde, mini-cour du carnet).
 * Tout est du SVG en code, paramétré par la taille de cellule `c` — jamais une image.
 *
 *   ZelligeTile   un carreau : fond de couleur, étoile à huit pointes (deux carrés), reflet — la couleur suit le carreau (id), pas la cellule
 *   FenceRails    les côtés de la clôture : un bâton par côté de bord, des piquets aux sommets ; `lit` en éclaire les premiers (la marche)
 *   Heap          le tas de carreaux (mode corde)
 *   RopeCoil      le rouleau de corde (mode corde)
 *   MiniYard      une cour en miniature (carnet, formules)
 */

export const TONES = Object.freeze([
  Object.freeze({ id: 'teal', base: '#0F766E', rim: '#115E59', mid: '#2DD4BF', star: '#FDE68A', starRim: '#B45309' }),
  Object.freeze({ id: 'clay', base: '#C2410C', rim: '#9A3412', mid: '#FDBA74', star: '#FEF3C7', starRim: '#7C2D12' }),
  Object.freeze({ id: 'indigo', base: '#3730A3', rim: '#312E81', mid: '#A5B4FC', star: '#FDE68A', starRim: '#B45309' }),
  Object.freeze({ id: 'rose', base: '#9D174D', rim: '#831843', mid: '#F9A8D4', star: '#FEF3C7', starRim: '#9D174D' }),
]);
/** La couleur d'un carreau : fixée par son identité (id), jamais par sa cellule. */
export const toneOf = (id) => TONES[((id % 3) + 3) % 3];

const eightStar = (cx, cy, r) => {
  const sq = (rot) => {
    const pts = [];
    for (let i = 0; i < 4; i += 1) {
      const a = (Math.PI / 2) * i + Math.PI / 4 + rot;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  };
  return [sq(0), sq(Math.PI / 4)];
};

/** L'étoile à huit pointes (deux carrés) au centre (cx, cy) : les deux polygones. */
export function StarMark({ cx, cy, r, fill, stroke, sw }) {
  const [a, b] = eightStar(cx, cy, r);
  return (
    <>
      <polygon points={a} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <polygon points={b} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    </>
  );
}

/** Un carreau de zellige de côté `s`, coin haut-gauche (x, y). */
export function ZelligeTile({ x = 0, y = 0, s, tone, uid, dashed = false, ghost = false, half = null, shadow = false, children, ...rest }) {
  const p = tone ?? TONES[0];
  const m = Math.max(1, s * 0.035);
  const [a, b] = eightStar(s / 2, s / 2, s * 0.285);
  return (
    <g transform={`translate(${x} ${y})`} opacity={ghost ? 0.55 : 1} {...rest}>
      {shadow && <rect x={m + 1.5} y={m + 3} width={s - 2 * m} height={s - 2 * m} rx={s * 0.1} fill="#1E1B4B" opacity={0.28} />}
      <rect x={m} y={m} width={s - 2 * m} height={s - 2 * m} rx={s * 0.1} fill={p.base} stroke={p.rim} strokeWidth={Math.max(1.2, s * 0.045)} strokeDasharray={dashed ? `${s * 0.12} ${s * 0.1}` : undefined} />
      <rect x={m + s * 0.07} y={m + s * 0.07} width={s - 2 * m - s * 0.14} height={s - 2 * m - s * 0.14} rx={s * 0.06} fill="none" stroke={p.mid} strokeWidth={Math.max(0.8, s * 0.028)} opacity={0.85} />
      <polygon points={a} fill={p.star} stroke={p.starRim} strokeWidth={Math.max(0.7, s * 0.02)} strokeLinejoin="round" />
      <polygon points={b} fill={p.star} stroke={p.starRim} strokeWidth={Math.max(0.7, s * 0.02)} strokeLinejoin="round" />
      <circle cx={s / 2} cy={s / 2} r={s * 0.085} fill={p.base} stroke={p.starRim} strokeWidth={Math.max(0.6, s * 0.018)} />
      {[[0.17, 0.17], [0.83, 0.17], [0.17, 0.83], [0.83, 0.83]].map(([fx, fy], i) => (
        <circle key={i} cx={s * fx} cy={s * fy} r={s * 0.035} fill={p.mid} opacity={0.9} />
      ))}
      <path d={`M${m + s * 0.12} ${m + s * 0.05} H${s - m - s * 0.12}`} stroke="#fff" strokeOpacity={0.4} strokeWidth={Math.max(1, s * 0.04)} strokeLinecap="round" />
      {half && null}
      {children}
    </g>
  );
}

const WOOD = { dark: '#4A2C12', mid: '#8B5A2B', light: '#D9A25F', post: '#7C4A24', cap: '#E2B173' };

/** Les côtés de la clôture. `edges` = `S.boundaryLoop(cells)` (sommets en coordonnées de grille), `lit` = nombre de côtés éclairés (dans l'ordre). */
export function FenceRails({ edges, c, ox, oy, lit = 0, dashed = false, tone = 'wood' }) {
  const px = (x) => ox + x * c;
  const py = (y) => oy + y * c;
  const post = new Map();
  edges.forEach((e, i) => {
    const k = `${e.x0},${e.y0}`;
    if (!post.has(k)) post.set(k, { x: e.x0, y: e.y0, i });
  });
  const stroke = tone === 'ghost' ? '#6366F1' : WOOD.mid;
  return (
    <g data-ty-fence-art>
      {!dashed && edges.map((e, i) => (
        <g key={`r${i}`} data-ty-stick={i} data-lit={i < lit ? 'true' : 'false'}>
          <line x1={px(e.x0)} y1={py(e.y0)} x2={px(e.x1)} y2={py(e.y1)} stroke={WOOD.dark} strokeWidth={c * 0.2} strokeLinecap="butt" />
          <line x1={px(e.x0)} y1={py(e.y0)} x2={px(e.x1)} y2={py(e.y1)} stroke={i < lit ? '#FDE047' : stroke} strokeWidth={c * 0.13} strokeLinecap="butt" />
          <line x1={px(e.x0)} y1={py(e.y0)} x2={px(e.x1)} y2={py(e.y1)} stroke={i < lit ? '#FEF9C3' : WOOD.light} strokeOpacity={0.7} strokeWidth={c * 0.035} strokeLinecap="butt" transform={`translate(${e.y0 === e.y1 ? 0 : -c * 0.025} ${e.y0 === e.y1 ? -c * 0.025 : 0})`} />
          {i < lit && <line x1={px(e.x0)} y1={py(e.y0)} x2={px(e.x1)} y2={py(e.y1)} stroke="#FACC15" strokeOpacity={0.35} strokeWidth={c * 0.34} strokeLinecap="round" />}
        </g>
      ))}
      {dashed && edges.map((e, i) => (
        <line key={`g${i}`} x1={px(e.x0)} y1={py(e.y0)} x2={px(e.x1)} y2={py(e.y1)} stroke="#4F46E5" strokeWidth={Math.max(2, c * 0.09)} strokeDasharray={`${c * 0.16} ${c * 0.12}`} strokeLinecap="round" opacity={0.9} />
      ))}
      {!dashed && [...post.values()].map((p) => (
        <g key={`p${p.x},${p.y}`}>
          <circle cx={px(p.x)} cy={py(p.y)} r={c * 0.125} fill={WOOD.post} stroke={WOOD.dark} strokeWidth={Math.max(1, c * 0.03)} />
          <circle cx={px(p.x) - c * 0.02} cy={py(p.y) - c * 0.025} r={c * 0.065} fill={p.i < lit ? '#FEF08A' : WOOD.cap} />
        </g>
      ))}
    </g>
  );
}

/** Le tas de carreaux (mode corde) dans un rectangle (x, y, w, h) : `n` carreaux en vrac ; le plus haut est celui qu'on prend. */
export function Heap({ x, y, w, h, n, c, focusable = true, label, countLabel }) {
  const shown = Math.min(n, 12);
  const cols = 3;
  const s = c * 0.7;
  return (
    <g data-ty-heap data-ty-src="heap" data-count={n} role={focusable ? 'button' : undefined} aria-label={label} tabIndex={focusable ? 0 : undefined} style={{ cursor: n > 0 ? 'grab' : 'default', outline: 'none' }}>
      <rect x={x} y={y} width={w} height={h} rx={c * 0.3} fill="#EADFC6" stroke="#B89B62" strokeWidth={2} strokeDasharray={`${c * 0.2} ${c * 0.14}`} />
      <ellipse cx={x + w / 2} cy={y + h - c * 0.55} rx={w * 0.38} ry={c * 0.22} fill="#1E1B4B" opacity={0.12} />
      {Array.from({ length: shown }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const tx = x + (w - cols * s * 0.92) / 2 + col * s * 0.92 + ((row % 2) * s * 0.18) - s * 0.05;
        const ty = y + h - c * 0.45 - (row + 1) * s * 0.7;
        const rot = ((i * 37) % 17) - 8;
        return <g key={i} transform={`rotate(${rot} ${tx + s / 2} ${ty + s / 2})`}><ZelligeTile x={tx} y={ty} s={s} tone={toneOf(i)} /></g>;
      })}
      <g transform={`translate(${x + w / 2} ${y + c * 0.5})`}>
        <rect x={-c * 0.62} y={-c * 0.32} width={c * 1.24} height={c * 0.64} rx={c * 0.32} fill="#fff" stroke="#6366F1" strokeWidth={2} />
        <text x={0} y={c * 0.14} textAnchor="middle" fontSize={c * 0.44} fontWeight={900} fill="#312E81" direction="ltr" aria-label={countLabel}>{n}</text>
      </g>
    </g>
  );
}

/** Le rouleau de corde : un enroulement de couronnes (hachurées = torsade) ; la part dévidée = la clôture déjà utilisée. */
export function RopeCoil({ w = 120, h = 86, used, total }) {
  const frac = total > 0 ? Math.min(1, used / total) : 0;
  const rings = 5;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true" data-ty-coil>
      <ellipse cx={w * 0.42} cy={h * 0.88} rx={w * 0.4} ry={h * 0.08} fill="#1E1B4B" opacity={0.12} />
      {Array.from({ length: rings }, (_, i) => {
        const k = rings - i;
        const rx = (w * 0.36 * (0.35 + 0.65 * (k / rings)));
        const ry = (h * 0.34 * (0.35 + 0.65 * (k / rings)));
        return (
          <g key={i}>
            <ellipse cx={w * 0.42} cy={h * 0.5 + i * 2.2} rx={rx} ry={ry} fill="none" stroke="#B45309" strokeWidth={7} />
            <ellipse cx={w * 0.42} cy={h * 0.5 + i * 2.2} rx={rx} ry={ry} fill="none" stroke="#FCD34D" strokeWidth={3.5} strokeDasharray="3 4" />
          </g>
        );
      })}
      <path d={`M${w * 0.78} ${h * 0.5} C ${w * 0.9} ${h * 0.55}, ${w * 0.92} ${h * 0.75}, ${w * (0.78 + 0.2 * frac)} ${h * 0.84}`} fill="none" stroke="#B45309" strokeWidth={7} strokeLinecap="round" opacity={frac > 0 ? 1 : 0.25} />
      <path d={`M${w * 0.78} ${h * 0.5} C ${w * 0.9} ${h * 0.55}, ${w * 0.92} ${h * 0.75}, ${w * (0.78 + 0.2 * frac)} ${h * 0.84}`} fill="none" stroke="#FCD34D" strokeWidth={3.5} strokeDasharray="3 4" strokeLinecap="round" opacity={frac > 0 ? 1 : 0.25} />
    </svg>
  );
}

/** Une cour en miniature (le carnet) : ses carreaux et sa clôture, dans un carré de `box` px. */
export function MiniYard({ cells, box = 56, ...rest }) {
  const list = S.uniqueCells(cells);
  if (list.length === 0) return <svg width={box} height={box} aria-hidden="true" {...rest} />;
  let r0 = Infinity; let r1 = -Infinity; let c0 = Infinity; let c1 = -Infinity;
  for (const [r, c] of list) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  const h = r1 - r0 + 1;
  const w = c1 - c0 + 1;
  const u = Math.floor((box - 8) / Math.max(h, w, 3));
  const ox = (box - w * u) / 2 - c0 * u;
  const oy = (box - h * u) / 2 - r0 * u;
  const edges = S.boundaryLoop(list);
  return (
    <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true" {...rest}>
      {list.map(([r, c], i) => <rect key={i} x={ox + c * u + 0.6} y={oy + r * u + 0.6} width={u - 1.2} height={u - 1.2} rx={u * 0.12} fill={TONES[(r + c) % 3].mid} stroke={TONES[(r + c) % 3].base} strokeWidth={1} />)}
      {edges.map((e, i) => <line key={i} x1={ox + e.x0 * u} y1={oy + e.y0 * u} x2={ox + e.x1 * u} y2={oy + e.y1 * u} stroke="#8B5A2B" strokeWidth={Math.max(1.6, u * 0.16)} strokeLinecap="round" />)}
    </svg>
  );
}
