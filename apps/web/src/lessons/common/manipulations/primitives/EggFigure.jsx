import { trayGrid, openCells } from '../logic/eggTrays';

/**
 * LE MONDE DE LA FERME (thème `farm`, 2AM) — œuf, boîte de 12 (علبة), plateau de 30 (صفيحة) et palette, dessinés en code
 * (root CLAUDE.md : jamais d'image générée). Chaque pièce est un `<g>` SVG posé par ses coordonnées ; aucune ne contient
 * de texte. Les COMPTES sont exacts : un plateau ouvert dessine exactement r œufs dans ses cases (colonne par colonne, de
 * gauche à droite — `logic/eggTrays › openCells`), un plateau fermé en montre b, et la couleur ne fabrique jamais un
 * groupe (tous les œufs ont la même teinte crème).
 *
 *   <Egg x y w />                    un œuf (centre x, y ; largeur w, hauteur 1,25 w), avec son reflet
 *   <TrayBody x y w h b eggs kind /> un plateau vu de dessus, ses b cases et `eggs` œufs (kind 'carton' | 'tray')
 *   <CartonLid x y w h />            le couvercle fermé d'une boîte de 12 (les bosses des œufs dessous)
 *   <Pallet x y w h />               une palette en bois (sous dix plateaux)
 */

const EGG = { fill: '#FFF1DC', stroke: '#D9A066', shade: '#F6D7AE' };
const CARD = { body: '#E8C48E', edge: '#B98544', cell: '#D6A764', cellIn: '#C99353', lid: '#F2D3A1' };

/** La silhouette d'un œuf : plus étroit en haut, le plus large un peu sous le milieu. */
export function eggPath(x, y, w) {
  const h = w * 1.25;
  return `M${x} ${y - h / 2} C${x + w * 0.36} ${y - h / 2} ${x + w / 2} ${y - h * 0.1} ${x + w / 2} ${y + h * 0.12} `
    + `C${x + w / 2} ${y + h * 0.36} ${x + w * 0.28} ${y + h / 2} ${x} ${y + h / 2} `
    + `C${x - w * 0.28} ${y + h / 2} ${x - w / 2} ${y + h * 0.36} ${x - w / 2} ${y + h * 0.12} `
    + `C${x - w / 2} ${y - h * 0.1} ${x - w * 0.36} ${y - h / 2} ${x} ${y - h / 2} Z`;
}

export function Egg({ x, y, w, ghost = false, ...rest }) {
  const h = w * 1.25;
  return (
    <g {...rest}>
      <path d={eggPath(x, y, w)} fill={ghost ? 'none' : EGG.fill} stroke={ghost ? '#F59E0B' : EGG.stroke}
        strokeWidth={Math.max(0.5, w * 0.08)} strokeDasharray={ghost ? `${Math.max(1.5, w * 0.2)} ${Math.max(1, w * 0.14)}` : undefined} />
      {!ghost && w >= 6 && (
        <>
          <path d={`M${x + w * 0.42} ${y + h * 0.08} Q${x + w * 0.36} ${y + h * 0.4} ${x} ${y + h * 0.46}`} fill="none" stroke={EGG.shade} strokeWidth={w * 0.12} strokeLinecap="round" />
          <ellipse cx={x - w * 0.16} cy={y - h * 0.18} rx={w * 0.11} ry={h * 0.13} fill="#FFFFFF" opacity={0.85} />
        </>
      )}
    </g>
  );
}

/**
 * Un plateau (ou le fond d'une boîte) de b cases en `trayGrid(b)`, `eggs` œufs posés colonne par colonne.
 * `open` : bord pointillé (le plateau en cours) ; `glow` : liseré (dans le cadre de l'élève).
 */
export function TrayBody({ x, y, w, h, b, eggs = 0, kind = 'tray', open = false, ...rest }) {
  const { rows, cols } = trayGrid(b);
  const pad = Math.max(1, Math.min(w, h) * 0.06);
  const cw = (w - 2 * pad) / cols;
  const ch = (h - 2 * pad) / rows;
  const r = Math.min(cw, ch);
  const filled = new Set(openCells(Math.min(eggs, b), b).map((c) => `${c.row}/${c.col}`));
  const showCells = cw >= 3.2;
  return (
    <g {...rest}>
      <rect x={x} y={y + Math.max(1, h * 0.06)} width={w} height={h} rx={Math.min(6, w * 0.12)} fill={CARD.edge} opacity={0.55} />
      <rect x={x} y={y} width={w} height={h} rx={Math.min(6, w * 0.12)} fill={kind === 'carton' ? '#DCE9F7' : CARD.body}
        stroke={open ? '#6366F1' : kind === 'carton' ? '#7FA6CF' : CARD.edge} strokeWidth={open ? 1.4 : 0.9}
        strokeDasharray={open ? '4 3' : undefined} />
      {showCells && Array.from({ length: rows * cols }, (_, j) => {
        const row = Math.floor(j / cols);
        const col = j % cols;
        const cx = x + pad + (col + 0.5) * cw;
        const cy = y + pad + (row + 0.5) * ch;
        const has = filled.has(`${row}/${col}`);
        return (
          <g key={j}>
            <ellipse cx={cx} cy={cy} rx={r * 0.4} ry={r * 0.4} fill={kind === 'carton' ? '#B9CFE6' : CARD.cell} />
            <ellipse cx={cx} cy={cy + r * 0.06} rx={r * 0.3} ry={r * 0.3} fill={kind === 'carton' ? '#A3BEDB' : CARD.cellIn} />
            {has && <Egg x={cx} y={cy - r * 0.05} w={r * 0.74} />}
          </g>
        );
      })}
      {!showCells && eggs > 0 && (
        // trop étroit pour ses cases : la part remplie, à l'échelle (eggs / b de la largeur)
        <rect x={x + 0.5} y={y + 1} width={Math.max(0.6, (w - 1) * Math.min(1, eggs / b))} height={h - 2} rx={0.6} fill={EGG.fill} stroke={EGG.stroke} strokeWidth={0.4} />
      )}
    </g>
  );
}

/** Le couvercle d'une boîte FERMÉE (les bosses des œufs dessous, une languette). */
export function CartonLid({ x, y, w, h, b = 12, ...rest }) {
  const { cols } = trayGrid(b);
  const cw = w / cols;
  return (
    <g {...rest}>
      <rect x={x} y={y + Math.max(1, h * 0.08)} width={w} height={h} rx={Math.min(5, w * 0.1)} fill="#5B87B8" opacity={0.35} />
      <rect x={x} y={y} width={w} height={h} rx={Math.min(5, w * 0.1)} fill="#A9C7E8" stroke="#5B87B8" strokeWidth={0.9} />
      {cw >= 3 && Array.from({ length: cols }, (_, i) => (
        <ellipse key={i} cx={x + (i + 0.5) * cw} cy={y + h * 0.42} rx={cw * 0.34} ry={h * 0.26} fill="#C7DCF2" />
      ))}
      <rect x={x + w * 0.42} y={y + h - Math.max(1.5, h * 0.18)} width={w * 0.16} height={Math.max(1.5, h * 0.18)} rx={1} fill="#5B87B8" />
    </g>
  );
}

/** Un plateau PLEIN vu de profil (les dômes des œufs dépassent) : la pile d'une palette, au plus mince. */
export function FullTraySlat({ x, y, w, h, ...rest }) {
  const bumps = Math.max(1, Math.floor(w / 4));
  return (
    <g {...rest}>
      <rect x={x} y={y} width={w} height={h} rx={Math.min(2, w * 0.25)} fill={CARD.body} stroke={CARD.edge} strokeWidth={0.6} />
      {w >= 3 && Array.from({ length: bumps }, (_, i) => (
        <ellipse key={i} cx={x + (i + 0.5) * (w / bumps)} cy={y + 2} rx={Math.min(2, w / bumps / 2.4)} ry={1.6} fill={EGG.fill} />
      ))}
      <line x1={x + w / 2} x2={x + w / 2} y1={y + h * 0.3} y2={y + h - 2} stroke={CARD.edge} strokeWidth={0.4} opacity={0.5} />
    </g>
  );
}

/** Une palette en bois : deux lames et trois plots. */
export function Pallet({ x, y, w, h, ...rest }) {
  const lh = h * 0.42;
  return (
    <g {...rest}>
      <rect x={x} y={y} width={w} height={lh} rx={1} fill="#C08A4E" stroke="#8A5A2B" strokeWidth={0.6} />
      {[0, 0.5, 1].map((f) => (
        <rect key={f} x={x + f * (w - Math.min(8, w * 0.14))} y={y + lh} width={Math.min(8, w * 0.14)} height={h - lh} fill="#9C6A36" />
      ))}
    </g>
  );
}
