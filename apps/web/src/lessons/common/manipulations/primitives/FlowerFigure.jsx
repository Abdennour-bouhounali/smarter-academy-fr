
/**
 * UNE FLEUR ET SON BOUQUET, dessinés en SVG (2026-10-14, labo `division-jumps`, 1AM) — des `<g>` à poser DANS une scène
 * SVG (pas de `<svg>` imbriqué : la scène garde une seule origine et un seul repère).
 *
 * - `FlowerFigure` : une fleur de taille `size` dans la boîte (x, y) — cinq pétales, un cœur, une tige, une feuille.
 *   `lean` (en tailles de fleur) incline la tige vers le pied du bouquet ; `hue` choisit la teinte (décor seulement :
 *   aucune couleur ne code un groupe) ; `ghost` la dessine en pointillés roses (une fleur qui MANQUE, elle n'existe pas).
 * - `BouquetWrap` : le cornet de papier qui serre les tiges d'un bouquet noué et son nœud de ruban. `tone` 'tied'
 *   (un bouquet complet), 'short' (un bouquet auquel des fleurs manquent : rose, pointillé) ou 'ghost' (le bouquet qui
 *   TIENT encore dans ce qui reste : contour indigo pointillé, sans papier).
 *
 * La géométrie (où est le cornet, de combien chaque tige penche) vient de `logic/divisionJumps.js › bouquetShape`,
 * pure et testée ; ce fichier ne fait que dessiner.
 */

const FLOWER_HUES = Object.freeze([
  { petal: '#F472B6', edge: '#DB2777', light: '#FBCFE8' },
  { petal: '#FB7185', edge: '#E11D48', light: '#FECDD3' },
  { petal: '#C084FC', edge: '#9333EA', light: '#E9D5FF' },
  { petal: '#FDBA74', edge: '#EA580C', light: '#FFEDD5' },
]);

/** Une teinte de décor pour la fleur i : jamais périodique en b (aucune couleur ne forme un groupe). */
export const hueOf = (i) => (i * 7 + Math.floor(i / 5)) % FLOWER_HUES.length;

const PETALS = [0, 72, 144, 216, 288];

export function FlowerFigure({ x, y, size: s, lean = 0, hue = 0, ghost = false, ...rest }) {
  const hx = x + s * 0.5;
  const hy = y + s * 0.35;
  const c = FLOWER_HUES[hue % FLOWER_HUES.length];
  const pr = s * 0.17;
  const off = s * 0.18;
  if (ghost) {
    return (
      <g {...rest}>
        {PETALS.map((d) => {
          const r = (d - 90) * Math.PI / 180;
          return <circle key={d} cx={hx + off * Math.cos(r)} cy={hy + off * Math.sin(r)} r={pr} fill="#FFF1F2" fillOpacity={0.7} stroke="#E11D48" strokeWidth={1.3} strokeDasharray="2.5 2" />;
        })}
        <circle cx={hx} cy={hy} r={s * 0.08} fill="none" stroke="#E11D48" strokeWidth={1.2} strokeDasharray="2 2" />
      </g>
    );
  }
  const foot = x + s * 0.5 + lean * s;
  return (
    <g {...rest}>
      {/* la tige et sa feuille */}
      <path d={`M${hx} ${hy + s * 0.12} Q${hx} ${y + s * 0.78} ${foot} ${y + s}`} fill="none" stroke="#15803D" strokeWidth={Math.max(1.4, s * 0.06)} strokeLinecap="round" />
      <path d={`M${hx + (foot - hx) * 0.35} ${y + s * 0.68} q${s * 0.2} ${-s * 0.02} ${s * 0.24} ${-s * 0.16} q${-s * 0.18} ${-s * 0.02} ${-s * 0.24} ${s * 0.16} Z`} fill="#22C55E" />
      {/* les pétales */}
      {PETALS.map((d) => {
        const r = (d - 90) * Math.PI / 180;
        return <circle key={d} cx={hx + off * Math.cos(r)} cy={hy + off * Math.sin(r)} r={pr} fill={c.petal} stroke={c.edge} strokeWidth={Math.max(0.6, s * 0.025)} />;
      })}
      {PETALS.map((d) => {
        const r = (d - 90) * Math.PI / 180;
        return <circle key={`l${d}`} cx={hx + off * 1.15 * Math.cos(r) - pr * 0.25} cy={hy + off * 1.15 * Math.sin(r) - pr * 0.3} r={pr * 0.32} fill={c.light} opacity={0.75} />;
      })}
      {/* le cœur */}
      <circle cx={hx} cy={hy} r={s * 0.11} fill="#FBBF24" stroke="#D97706" strokeWidth={Math.max(0.6, s * 0.025)} />
      <circle cx={hx - s * 0.03} cy={hy - s * 0.035} r={s * 0.03} fill="#FFFBEB" />
    </g>
  );
}

/** Les teintes d'un bouquet : noué (complet), entamé (des fleurs manquent : rose, pointillé), fantôme (il tient encore). */
const PAPER = {
  tied: { fill: '#FDF2F8', stroke: '#F9A8D4', band: '#6366F1', dark: '#4338CA', dash: undefined },
  short: { fill: '#FFF1F2', stroke: '#E11D48', band: '#F43F5E', dark: '#BE123C', dash: '5 3' },
  ghost: { fill: '#EEF2FF', stroke: '#4F46E5', band: null, dark: null, dash: '6 4' },
};

/**
 * La pochette de papier DERRIÈRE les fleurs d'un bouquet : `shape` = { x0, x1, top, bottom } (px, `bouquetShape`).
 * À dessiner AVANT les fleurs.
 */
export function BouquetSleeve({ shape, size: s, tone = 'tied', ...rest }) {
  const p = PAPER[tone] ?? PAPER.tied;
  const { x0, x1, top, bottom } = shape;
  return (
    <g {...rest}>
      <rect x={x0} y={top} width={x1 - x0} height={bottom - top} rx={s * 0.32} fill={p.fill} fillOpacity={tone === 'ghost' ? 0.55 : 1}
        stroke={p.stroke} strokeWidth={tone === 'tied' ? 1.4 : 2} strokeDasharray={p.dash} />
    </g>
  );
}

/**
 * Le ruban qui serre les tiges (une bande sur toute la largeur du bouquet, à `band`) et ses deux boucles de part et
 * d'autre du nœud ; le nœud lui-même est la pilule du compte, posée par la scène en (cx, band). À dessiner APRÈS les
 * fleurs. Rien pour un fantôme.
 */
export function BouquetTie({ shape, size: s, tone = 'tied', knotW = 0, ...rest }) {
  const p = PAPER[tone] ?? PAPER.tied;
  if (!p.band) return null;
  const { x0, x1, band, cx } = shape;
  const sw = Math.max(2.4, s * 0.12);
  const lw = Math.max(5, s * 0.26);
  const gap = knotW / 2;
  const loop = (dir) => {
    const x = cx + dir * (gap + lw * 0.55);
    return <ellipse cx={x} cy={band - lw * 0.15} rx={lw * 0.6} ry={lw * 0.38} transform={`rotate(${dir * 20} ${x} ${band - lw * 0.15})`} fill={p.band} stroke={p.dark} strokeWidth={1} />;
  };
  return (
    <g {...rest}>
      <line x1={x0 + s * 0.12} x2={x1 - s * 0.12} y1={band} y2={band} stroke={p.band} strokeWidth={sw} strokeLinecap="round" strokeDasharray={p.dash} />
      {loop(-1)}{loop(1)}
      {knotW === 0 && <circle cx={cx} cy={band} r={sw * 0.8} fill={p.dark} />}
    </g>
  );
}
