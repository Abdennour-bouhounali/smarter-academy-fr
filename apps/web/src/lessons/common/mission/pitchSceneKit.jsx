
/**
 * LES PRIMITIVES DES SCÈNES DE L'UNITÉ 3 « الحساب الحرفي » (rollout 2026-11-11 ; conseil du 2026-11-11, « Cross-lesson › Scenes ») — dessinées
 * en code, sans AUCUN nombre ni lettre. Chaque leçon de l'unité a SA scène, mince, qui compose ces pièces, et UN objet reconnaissable :
 * leçon 1 les bancs le long de la bande coupée, leçon 2 les tribunes d'angle, leçon 3 les rouleaux de gazon empilés.
 *
 *   <PitchBackdrop width height ground sky? soil? />           le ciel et le sol (une bande)
 *   <PitchPlot x y w h />                                      le terrain nu (terre battue), bordé
 *   <TurfStrips x y w h fill? bands? vertical? />              le gazon posé bande après bande (`fill` ∈ [0, 1]), rayé clair / foncé
 *   <PitchLines x y w h />                                     les lignes blanches (bord, milieu, rond central) — aucun nombre
 *   <Goal x y h? side? />                                      un but (montants, barre, filet), `side` 'left' | 'right'
 *   <Bench x y w? color? /> · <BenchRow x y w count? color? />  un banc / une rangée de bancs (le couloir des spectateurs)
 *   <CornerStand x y w h corner? color? />                     une tribune en gradins dans un angle (`corner` 'tl' | 'tr' | 'bl' | 'br')
 *   <TurfRoll x y r? len? /> · <TurfRollStack x y count? r? />  un rouleau de gazon (spirale vue de profil), une pile de rouleaux
 *   <TapeMeasure x1 y1 x2 y2 />                                un mètre ruban tendu (boîtier + ruban), SANS graduation chiffrée
 *   <CutStrip x y w h />                                       une bande hachurée retirée du terrain (le ✂ du laboratoire, sans nombre)
 *
 * Les personnes ne sont JAMAIS dessinées ici : KidFigure seulement (filles en hijab), posé par la scène. API stable : on AJOUTE des exports,
 * on n'en renomme aucun (les trois leçons de l'unité en dépendent).
 */
export function PitchBackdrop({ width = 480, height = 260, ground = 200, sky = '#E0F2FE', soil = '#D6D3D1' }) {
  return (
    <g data-scene-backdrop>
      <rect x="0" y="0" width={width} height={ground} fill={sky} />
      <rect x="0" y={ground} width={width} height={height - ground} fill={soil} />
      <line x1="0" x2={width} y1={ground} y2={ground} stroke="#78716C" strokeWidth="2" />
    </g>
  );
}

/** Le terrain nu, en terre battue, bordé d'une bordure béton. */
export function PitchPlot({ x, y, w, h }) {
  return (
    <g data-pitch-plot>
      <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx="4" fill="#A8A29E" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill="#D4B483" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={x + ((i * 37) % w)} cy={y + ((i * 23 + 9) % h)} r="1.6" fill="#B08D57" />
      ))}
    </g>
  );
}

/**
 * Le gazon posé bande après bande : `bands` bandes (verticales par défaut), les `round(fill × bands)` premières posées (rayures claires /
 * foncées), le reste laissé en terre. `data-turf-fill` porte la part posée.
 */
export function TurfStrips({ x, y, w, h, fill = 1, bands = 8, vertical = true }) {
  const f = Math.max(0, Math.min(1, fill));
  const on = Math.round(f * bands);
  const step = (vertical ? w : h) / bands;
  return (
    <g data-turf-strips data-turf-fill={f.toFixed(2)}>
      {Array.from({ length: on }, (_, i) => (
        vertical
          ? <rect key={i} x={x + i * step} y={y} width={step + 0.5} height={h} fill={i % 2 ? '#16A34A' : '#22C55E'} />
          : <rect key={i} x={x} y={y + i * step} width={w} height={step + 0.5} fill={i % 2 ? '#16A34A' : '#22C55E'} />
      ))}
    </g>
  );
}

/** Les lignes blanches d'un terrain : le bord, la ligne médiane, le rond central (aucune graduation, aucun nombre). */
export function PitchLines({ x, y, w, h }) {
  const r = Math.min(w, h) * 0.16;
  return (
    <g data-pitch-lines fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.92">
      <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} />
      <line x1={x + w / 2} y1={y + 4} x2={x + w / 2} y2={y + h - 4} />
      <circle cx={x + w / 2} cy={y + h / 2} r={r} />
      <rect x={x + 4} y={y + h * 0.3} width={w * 0.12} height={h * 0.4} />
      <rect x={x + w - 4 - w * 0.12} y={y + h * 0.3} width={w * 0.12} height={h * 0.4} />
    </g>
  );
}

/** Un but vu de face-profil : deux montants, la barre, un filet en croisillons ; `x` est la ligne de but, `side` le côté du filet. */
export function Goal({ x, y, h = 34, side = 'left' }) {
  const d = side === 'left' ? -12 : 12;
  return (
    <g data-goal={side}>
      <path d={`M ${x} ${y} L ${x + d} ${y + 6} L ${x + d} ${y + h + 4} L ${x} ${y + h}`} fill="#F8FAFC" opacity="0.55" stroke="#CBD5E1" strokeWidth="1" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={x} y1={y + ((i + 1) * h) / 5} x2={x + d} y2={y + 6 + ((i + 1) * (h - 2)) / 5} stroke="#CBD5E1" strokeWidth="0.8" />
      ))}
      <line x1={x} y1={y} x2={x} y2={y + h} stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + d} y2={y + 6} stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

/** Un banc de spectateurs (assise + dossier + deux pieds). */
export function Bench({ x, y, w = 34, color = '#0EA5E9' }) {
  return (
    <g data-bench>
      <rect x={x} y={y - 12} width={w} height="5" rx="2" fill={color} stroke="#0F172A" strokeWidth="0.8" />
      <rect x={x} y={y - 5} width={w} height="4" rx="1.5" fill={color} stroke="#0F172A" strokeWidth="0.8" />
      <line x1={x + 4} y1={y - 1} x2={x + 4} y2={y + 5} stroke="#334155" strokeWidth="2" />
      <line x1={x + w - 4} y1={y - 1} x2={x + w - 4} y2={y + 5} stroke="#334155" strokeWidth="2" />
    </g>
  );
}

/** Une rangée de `count` bancs répartis sur la largeur `w` (le couloir des spectateurs). */
export function BenchRow({ x, y, w, count = 5, color = '#0EA5E9' }) {
  const bw = Math.min(40, (w / count) * 0.78);
  return (
    <g data-bench-row>
      {Array.from({ length: count }, (_, i) => (
        <Bench key={i} x={x + (i + 0.5) * (w / count) - bw / 2} y={y} w={bw} color={i % 2 ? color : '#F59E0B'} />
      ))}
    </g>
  );
}

/** Un rouleau de gazon vu de profil : un disque spiralé (vert dessus, terre dessous) et sa longueur. */
export function TurfRoll({ x, y, r = 12, len = 34 }) {
  return (
    <g data-turf-roll>
      <rect x={x} y={y - r} width={len} height={r * 2} fill="#16A34A" stroke="#14532D" strokeWidth="1" />
      <line x1={x} y1={y + r - 2} x2={x + len} y2={y + r - 2} stroke="#92400E" strokeWidth="3" />
      <circle cx={x} cy={y} r={r} fill="#22C55E" stroke="#14532D" strokeWidth="1.2" />
      <path d={`M ${x} ${y} m ${-r * 0.25} 0 a ${r * 0.25} ${r * 0.25} 0 1 1 ${r * 0.5} 0 a ${r * 0.5} ${r * 0.5} 0 1 1 ${-r} 0 a ${r * 0.75} ${r * 0.75} 0 1 1 ${r * 1.5} 0`}
        fill="none" stroke="#92400E" strokeWidth="1.2" />
    </g>
  );
}

/** Une pile de rouleaux de gazon (pyramide : la rangée du bas a `count` rouleaux). `y` est le sol. */
export function TurfRollStack({ x, y, count = 3, r = 11, len = 30 }) {
  const items = [];
  for (let row = 0; row < count; row += 1) {
    for (let i = 0; i < count - row; i += 1) {
      items.push(<TurfRoll key={`${row}-${i}`} x={x + i * (r * 2 + 2) + row * (r + 1)} y={y - r - row * (r * 2 - 2)} r={r} len={len} />);
    }
  }
  return <g data-turf-roll-stack>{items}</g>;
}

/** Un mètre ruban tendu de (x1, y1) à (x2, y2) : le boîtier au départ, le ruban jaune, des traits courts SANS nombre. */
export function TapeMeasure({ x1, y1, x2, y2 }) {
  const n = 8;
  return (
    <g data-tape-measure>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CA8A04" strokeWidth="5" strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: n - 1 }, (_, i) => {
        const t = (i + 1) / n;
        const px = x1 + (x2 - x1) * t; const py = y1 + (y2 - y1) * t;
        return <circle key={i} cx={px} cy={py} r="0.9" fill="#713F12" />;
      })}
      <rect x={x1 - 8} y={y1 - 8} width="16" height="16" rx="4" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1" />
      <circle cx={x1} cy={y1} r="3" fill="#FCA5A5" />
    </g>
  );
}

/** Une bande retirée du terrain : hachures obliques sur la terre, bord pointillé (le « مقتطع » du laboratoire, sans nombre). */
export function CutStrip({ x, y, w, h }) {
  const id = `cut-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g data-cut-strip>
      <defs>
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#B45309" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill="#FDE68A" />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity="0.6" />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#92400E" strokeWidth="1.5" strokeDasharray="5 4" />
    </g>
  );
}
