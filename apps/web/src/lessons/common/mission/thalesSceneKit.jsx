
/**
 * LES PRIMITIVES DES SCÈNES DE L'UNITÉ 9 « خاصية طالس » (rollout 2026-11-10 ; conseil du 2026-11-10, verdict « Scenes: shared SVG primitives + one
 * thin scene file per lesson ») — dessinées en code, sans aucun nombre. Chaque leçon de l'unité a SA scène, mince, qui compose ces pièces :
 * `PaintWallScene` (leçon 2), `TifoBannerScene` (leçon 3) et `NightCinemaScene` (leçon 1) — jamais un « variant » à trois branches.
 *
 *   <SceneBackdrop width height ground sky? />           le ciel et le sol (une bande)
 *   <XTrestle cx foot height spread plankAt level? />     le tréteau en X : deux barres croisées en A, la planche entre elles
 *   <BubbleLevel x y w level? deg? />                     le niveau à bulle (bulle au centre quand `level`)
 *   <PaintRoller x y color? /> · <PaintBucket x y color? />
 *   <FloorBanner x y w h? split? painted? colors? strokes? />   la banderole étendue, en deux couleurs (leçon 3)
 *   <BigCompass x y open? height? /> · <Straightedge x1 y1 x2 y2 />   le compas d'atelier, la règle NON graduée (leçon 3)
 *   <Projector x y /> · <LightBeam from top bottom lit? /> · <CinemaScreen x y w h lit? /> · <ChairRows x y w rows? />   le ciné-club de nuit (leçon 1)
 *   <Sun x y r? /> · <PlainTower x foot h w? /> · <SunRay from to /> · <GroundShadow x1 x2 y />   la place à l'heure de l'ombre (la synthèse) : une tour
 *                                                           SANS aucun symbole, le soleil, un rayon, les ombres au sol
 * Les personnes ne sont JAMAIS dessinées ici : KidFigure seulement (filles en hijab), posé par la scène.
 */
export function SceneBackdrop({ width = 480, height = 260, ground = 232, sky = '#E0F2FE', soil = '#D6D3D1' }) {
  return (
    <g data-scene-backdrop>
      <rect x="0" y="0" width={width} height={ground} fill={sky} />
      <rect x="0" y={ground} width={width} height={height - ground} fill={soil} />
      <line x1="0" x2={width} y1={ground} y2={ground} stroke="#78716C" strokeWidth="2" />
    </g>
  );
}

/** Le niveau à bulle : un tube, deux repères, une bulle — au centre quand `level`, poussée vers un bout sinon. */
function BubbleLevel({ x, y, w = 46, level = true, deg = 0 }) {
  const off = level ? 0 : (w / 2 - 8);
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg})`} data-bubble-level={level ? 'level' : 'tilted'}>
      <rect x={-w / 2 - 3} y={-6} width={w + 6} height={12} rx={3} fill="#1E293B" />
      <rect x={-w / 2} y={-4} width={w} height={8} rx={4} fill={level ? '#BBF7D0' : '#FEF08A'} />
      <line x1={-6} x2={-6} y1={-4} y2={4} stroke="#334155" strokeWidth="1" />
      <line x1={6} x2={6} y1={-4} y2={4} stroke="#334155" strokeWidth="1" />
      <ellipse cx={off} cy={0} rx={5} ry={3} fill="#FFFFFF" stroke="#64748B" strokeWidth="0.8" />
    </g>
  );
}

/**
 * Le tréteau en X : deux barres croisées en A (au-dessus du sol `foot`), écartées de `spread` au sol et qui CONTINUENT au-delà de A ;
 * la planche posée à la hauteur `plankAt` ∈ [0, 1] du bas (0 au sol, 1 en A) — horizontale quand `level`, penchée sinon.
 */
export function XTrestle({ cx, foot, height = 120, spread = 120, plankAt = 0.55, level = true }) {
  const A = { x: cx, y: foot - height * 0.72 };
  const B = { x: cx - spread / 2, y: foot };
  const C = { x: cx + spread / 2, y: foot };
  const over = 0.38; // la part des barres au-delà de A
  const beyond = (P) => ({ x: A.x + (A.x - P.x) * over, y: A.y + (A.y - P.y) * over });
  const TB = beyond(B); const TC = beyond(C);
  const at = (P, t) => ({ x: P.x + (A.x - P.x) * t, y: P.y + (A.y - P.y) * t });
  const L = at(B, plankAt);
  const R = at(C, level ? plankAt : Math.max(0.1, plankAt - 0.22));
  const deg = (Math.atan2(R.y - L.y, R.x - L.x) * 180) / Math.PI;
  return (
    <g data-x-trestle={level ? 'level' : 'tilted'}>
      <line x1={B.x} y1={B.y} x2={TB.x} y2={TB.y} stroke="#92400E" strokeWidth="7" strokeLinecap="round" />
      <line x1={C.x} y1={C.y} x2={TC.x} y2={TC.y} stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
      <circle cx={A.x} cy={A.y} r="4" fill="#451A03" />
      <line x1={L.x - 10} y1={L.y} x2={R.x + 10} y2={R.y} stroke="#A16207" strokeWidth="8" strokeLinecap="round" />
      <BubbleLevel x={(L.x + R.x) / 2} y={(L.y + R.y) / 2 - 9} level={level} deg={deg} />
    </g>
  );
}

/** Un rouleau de peinture (manche + rouleau coloré). */
export function PaintRoller({ x, y, color = '#0EA5E9' }) {
  return (
    <g data-paint-roller>
      <line x1={x} y1={y} x2={x + 2} y2={y + 34} stroke="#57534E" strokeWidth="3" strokeLinecap="round" />
      <rect x={x - 12} y={y - 9} width="24" height="10" rx="4" fill={color} stroke="#0F172A" strokeWidth="1" />
    </g>
  );
}

/** Un seau de peinture. */
export function PaintBucket({ x, y, color = '#0EA5E9' }) {
  return (
    <g data-paint-bucket>
      <path d={`M ${x - 13} ${y - 22} L ${x + 13} ${y - 22} L ${x + 10} ${y} L ${x - 10} ${y} Z`} fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
      <ellipse cx={x} cy={y - 22} rx="13" ry="3.5" fill={color} />
      <path d={`M ${x - 12} ${y - 22} Q ${x} ${y - 38} ${x + 12} ${y - 22}`} fill="none" stroke="#475569" strokeWidth="1.5" />
    </g>
  );
}

/**
 * Une banderole étendue (leçon 3, `TifoBannerScene`) : un long rectangle en deux couleurs, la couture à la part `split` ∈ ]0, 1[ de sa
 * longueur ; `painted` ∈ [0, 1] : la part déjà cousue / peinte (le reste en toile écrue) ; de fins traits parallèles obliques (l'éventail des
 * parallèles, sans graduation ni nombre) quand `strokes`.
 */
export function FloorBanner({ x, y, w, h = 34, split = 0.5, painted = 1, colors = ['#059669', '#E11D48'], strokes = true }) {
  const p = Math.max(0, Math.min(1, painted));
  const cut = x + w * split;
  const end = x + w * p;
  return (
    <g data-floor-banner data-banner-painted={p.toFixed(2)}>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#F5F5F4" stroke="#57534E" strokeWidth="1.5" />
      {p > 0 && <rect x={x} y={y} width={Math.min(end, cut) - x} height={h} rx="3" fill={colors[0]} />}
      {end > cut && <rect x={cut} y={y} width={end - cut} height={h} fill={colors[1]} />}
      <rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke="#57534E" strokeWidth="1.5" />
      {strokes && Array.from({ length: 5 }, (_, i) => {
        const sx = x + (w * (i + 1)) / 6;
        return <line key={i} x1={sx} y1={y} x2={sx - 26} y2={y - 46} stroke="#6366F1" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.55" />;
      })}
      {p >= 1 && <line x1={cut} y1={y - 6} x2={cut} y2={y + h + 6} stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" data-banner-seam />}
    </g>
  );
}

/** Un grand compas d'atelier (deux branches, une charnière), tenu ouvert de `open` pixels ; sa pointe sèche est en (x, y). */
export function BigCompass({ x, y, open = 34, height = 62 }) {
  const top = { x: x + open / 2, y: y - height };
  return (
    <g data-big-compass>
      <line x1={x} y1={y} x2={top.x} y2={top.y} stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      <line x1={x + open} y1={y} x2={top.x} y2={top.y} stroke="#A21CAF" strokeWidth="4" strokeLinecap="round" />
      <circle cx={top.x} cy={top.y} r="5" fill="#1E293B" />
      <rect x={top.x - 2.5} y={top.y - 14} width="5" height="10" rx="2" fill="#1E293B" />
    </g>
  );
}

/** Une règle NON graduée (aucun trait, aucun nombre), posée de (x1, y1) à (x2, y2). */
export function Straightedge({ x1, y1, x2, y2 }) {
  return (
    <g data-straightedge>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CA8A04" strokeWidth="9" strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

/** Un projecteur sur son pied (leçon 1, `NightCinemaScene`) : l'objectif est en (x, y), tourné vers la droite. */
export function Projector({ x, y }) {
  return (
    <g data-projector>
      <line x1={x - 22} y1={y + 12} x2={x - 34} y2={y + 62} stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1={x - 22} y1={y + 12} x2={x - 10} y2={y + 62} stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      <line x1={x - 22} y1={y + 12} x2={x - 22} y2={y + 62} stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      <rect x={x - 40} y={y - 12} width="36" height="24" rx="5" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
      <rect x={x - 6} y={y - 7} width="8" height="14" rx="2" fill="#94A3B8" stroke="#0F172A" strokeWidth="1" />
      <circle cx={x - 30} cy={y - 18} r="7" fill="#475569" stroke="#0F172A" strokeWidth="1.2" />
      <circle cx={x - 14} cy={y - 18} r="7" fill="#475569" stroke="#0F172A" strokeWidth="1.2" />
    </g>
  );
}

/**
 * Le faisceau du projecteur : deux bords issus de `from` qui s'écartent jusqu'aux points `top` et `bottom` (les bords de l'image), et la
 * lumière entre eux — pâle tant que `lit` ∈ [0, 1] est faible. Aucune graduation, aucun nombre.
 */
export function LightBeam({ from, top, bottom, lit = 1 }) {
  const l = Math.max(0, Math.min(1, lit));
  return (
    <g data-light-beam data-beam-lit={l.toFixed(2)}>
      <polygon points={`${from.x},${from.y} ${top.x},${top.y} ${bottom.x},${bottom.y}`} fill="#FDE68A" opacity={0.1 + 0.32 * l} />
      <line x1={from.x} y1={from.y} x2={top.x} y2={top.y} stroke="#FCD34D" strokeWidth="1.6" strokeDasharray="6 5" />
      <line x1={from.x} y1={from.y} x2={bottom.x} y2={bottom.y} stroke="#FCD34D" strokeWidth="1.6" strokeDasharray="6 5" />
    </g>
  );
}

/** Le grand écran sur ses deux poteaux ; `lit` ∈ [0, 1] : la part de l'image déjà nette (des bandes qui s'allument de gauche à droite). */
export function CinemaScreen({ x, y, w, h, lit = 0 }) {
  const l = Math.max(0, Math.min(1, lit));
  const bands = 5;
  const on = Math.round(l * bands);
  return (
    <g data-cinema-screen data-screen-lit={l.toFixed(2)}>
      <line x1={x + 6} y1={y} x2={x + 6} y2={y + h + 40} stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
      <line x1={x + w - 6} y1={y} x2={x + w - 6} y2={y + h + 40} stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
      {Array.from({ length: bands }, (_, i) => (
        i < on ? <rect key={i} x={x + 3 + (i * (w - 6)) / bands} y={y + 3} width={(w - 6) / bands + 0.5} height={h - 6} fill={['#38BDF8', '#7DD3FC', '#FDE68A', '#86EFAC', '#4ADE80'][i]} /> : null
      ))}
      {l >= 1 && (
        <g data-screen-picture>
          <path d={`M ${x + 3} ${y + h - 3} L ${x + w * 0.3} ${y + h * 0.42} L ${x + w * 0.5} ${y + h * 0.7} L ${x + w * 0.72} ${y + h * 0.36} L ${x + w - 3} ${y + h - 3} Z`} fill="#166534" opacity="0.85" />
          <circle cx={x + w * 0.8} cy={y + h * 0.24} r={Math.min(9, h * 0.14)} fill="#F59E0B" />
        </g>
      )}
    </g>
  );
}

/** Des rangées de chaises vues de dos (de simples dossiers arrondis) : le public n'est pas encore là. */
export function ChairRows({ x, y, w, rows = 2, perRow = 7 }) {
  return (
    <g data-chair-rows>
      {Array.from({ length: rows }, (_, r) => Array.from({ length: perRow }, (__, i) => {
        const cx = x + ((i + 0.5 + (r % 2) * 0.5) * w) / (perRow + 0.5);
        const cy = y + r * 15;
        return (
          <g key={`${r}-${i}`}>
            <rect x={cx - 7} y={cy - 12} width="14" height="12" rx="3" fill={r % 2 ? '#7C3AED' : '#6D28D9'} stroke="#2E1065" strokeWidth="0.8" />
            <line x1={cx - 6} y1={cy} x2={cx - 6} y2={cy + 6} stroke="#2E1065" strokeWidth="1.5" />
            <line x1={cx + 6} y1={cy} x2={cx + 6} y2={cy + 6} stroke="#2E1065" strokeWidth="1.5" />
          </g>
        );
      }))}
    </g>
  );
}

/** Le soleil : un disque et huit rayons courts (la synthèse de l'unité 9, 2026-11-10). */
export function Sun({ x, y, r = 16 }) {
  return (
    <g data-sun>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <line key={i} x1={x + Math.cos(a) * (r + 4)} y1={y + Math.sin(a) * (r + 4)} x2={x + Math.cos(a) * (r + 11)} y2={y + Math.sin(a) * (r + 11)} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />;
      })}
      <circle cx={x} cy={y} r={r} fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
    </g>
  );
}

/** Une tour CARRÉE et SIMPLE (aucun croissant, aucun dôme, aucun symbole) : un fût, un balcon, un toit plat — le haut M est en (x, foot − h). */
export function PlainTower({ x, foot, h, w = 26 }) {
  const top = foot - h;
  return (
    <g data-plain-tower>
      <rect x={x - w / 2} y={top + 14} width={w} height={h - 14} fill="#FDE68A" stroke="#92400E" strokeWidth="1.4" />
      <rect x={x - w / 2 - 5} y={top + 10} width={w + 10} height="6" fill="#B45309" />
      <rect x={x - w / 2 + 4} y={top} width={w - 8} height="10" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.2" />
      {[0.35, 0.6].map((f) => <rect key={f} x={x - 4} y={top + 14 + (h - 14) * f} width="8" height="12" rx="4" fill="#92400E" opacity="0.7" />)}
    </g>
  );
}

/** Un rayon de soleil (pointillé doré) entre deux points. */
export function SunRay({ from, to }) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#D97706" strokeWidth="2" strokeDasharray="6 4" data-sun-ray />;
}

/** Une ombre portée au sol, de x1 à x2. */
export function GroundShadow({ x1, x2, y }) {
  return <path d={`M${x1} ${y + 1} L${x2} ${y + 1} L${x2 - 5} ${y + 8} L${x1} ${y + 8} Z`} fill="#1E293B" opacity="0.32" data-ground-shadow />;
}
