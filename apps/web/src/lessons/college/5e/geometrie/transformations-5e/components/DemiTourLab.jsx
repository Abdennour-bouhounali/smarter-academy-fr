import React, { useCallback, useEffect, useRef, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, midpoint, symCentralPts } from '../../../../../common/geo5e/geo5e';
import { rotatePartialPts } from './transformations';

const W = 720;
const H = 430;

/**
 * DemiTourLab — LE laboratoire de la leçon : un calque qu'on fait tourner
 * d'un demi-tour autour d'une punaise qu'on déplace.
 *
 * Ce que l'élève manipule, ce sont les objets eux-mêmes (§ « on traîne la
 * figure, jamais un bouton + / − ») : la punaise se prend et se déplace, et
 * le calque se fait tourner en traînant la poignée de rotation. Rien ne se
 * fige une fois l'étape validée — après avoir trouvé, on continue d'explorer.
 *
 * Le demi-tour est ANIMÉ (0 → 180°) et non appliqué d'un coup : c'est
 * l'animation qui rend le mot « demi-tour » littéral. À 180°, et seulement
 * là, on est sur la symétrique exacte.
 */
export default function DemiTourLab({
  figure,
  centre,
  onCentre,
  angle,
  onAngle,
  montrerTraces = false,      // les segments [M M'] passant par le centre
  montrerImage = true,
  nomsSommets = ['A', 'B', 'C', 'D', 'E'],
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);
  const image = symCentralPts(figure, centre);
  const courant = rotatePartialPts(figure, centre, angle);
  const fini = angle >= 179.5;

  // La poignée de rotation : au bout du premier sommet, elle suit le calque.
  const poignee = courant[0];

  const move = useCallback((p) => {
    if (!p || !drag) return;
    if (drag === 'centre') {
      onCentre(clampPt(p, W, H, 30));
    } else if (drag === 'rot') {
      // L'angle suit le doigt, mais reste dans [0 ; 180] : le calque ne part
      // pas au-delà du demi-tour, qui est le seul objet de la 5e.
      const a0 = Math.atan2(figure[0].y - centre.y, figure[0].x - centre.x);
      const a1 = Math.atan2(p.y - centre.y, p.x - centre.x);
      let d = ((a1 - a0) * 180) / Math.PI;
      while (d < 0) d += 360;
      onAngle(Math.min(180, d > 270 ? 0 : d));
    }
  }, [drag, onCentre, onAngle, figure, centre]);

  const labels = [
    { id: 'O', text: 'O', anchor: centre, color: '#dc2626' },
    ...figure.map((p, i) => ({ id: `s${i}`, text: nomsSommets[i], anchor: p, color: '#334155' })),
    ...(montrerImage && fini
      ? image.map((p, i) => ({ id: `i${i}`, text: `${nomsSommets[i]}’`, anchor: p, color: '#7c3aed' }))
      : []),
  ];

  const obstacles = [
    ...dotObstacles([centre, ...figure], 15),
    ...polyObstacles(figure),
    ...(montrerImage && fini ? [...dotObstacles(image, 15), ...polyObstacles(image)] : []),
  ];

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={labels}
        obstacles={obstacles}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Grille />

        {/* Les traces [M M'] : elles ne s'affichent qu'une fois le demi-tour
            achevé, sinon elles montreraient une propriété qui n'est pas
            encore vraie. */}
        {montrerTraces && fini && figure.map((p, i) => (
          <g key={`t${i}`}>
            <Seg a={p} b={image[i]} color="#f59e0b" w={2.5} dash="7 6" />
            <circle cx={midpoint(p, image[i]).x} cy={midpoint(p, image[i]).y} r={4} fill="#f59e0b" />
          </g>
        ))}

        {/* La figure de départ, toujours visible : on compare, on ne remplace pas. */}
        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} />
        {figure.map((p, i) => <Dot key={`d${i}`} p={p} color="#334155" />)}

        {/* Le calque en cours de rotation. */}
        {angle > 0.5 && (
          <g opacity={fini ? 1 : 0.55}>
            <Poly pts={courant} fill="#7c3aed" stroke="#6d28d9" fillOpacity={fini ? 0.16 : 0.1} />
            {courant.map((p, i) => <Dot key={`c${i}`} p={p} color="#7c3aed" r={fini ? 7 : 5} />)}
          </g>
        )}

        {/* La poignée de rotation : c'est la figure qu'on saisit. */}
        <g>
          <Seg a={centre} b={poignee} color="#a78bfa" w={2} dash="4 5" />
          <Handle
            p={poignee} color="#7c3aed" r={12}
            dragging={drag === 'rot'}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('rot'); }}
            label="Faire tourner le calque"
          />
        </g>

        {/* La punaise. */}
        <Handle
          p={centre} color="#dc2626" r={12}
          dragging={drag === 'centre'}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('centre'); }}
          label="Déplacer la punaise (le centre)"
        />
      </GeoScene>

      <div className="border-t-2 border-violet-100 bg-violet-50/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-600">
          Punaise <strong className="text-rose-600">O</strong> · calque tourné de{' '}
          <strong className="tabular-nums text-violet-700">{Math.round(angle)}°</strong>
        </span>
        <span className={`text-sm font-bold ${fini ? 'text-violet-700' : 'text-slate-400'}`}>
          {fini ? '½ tour complet' : 'traîne la pastille violette'}
        </span>
      </div>
    </div>
  );
}

/** Le quadrillage : décor, jamais protégé par l'audit de collisions. */
export function Grille({ step = 40 }) {
  const lines = [];
  for (let x = step; x < W; x += step) lines.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#f1f5f9" strokeWidth={1} data-visual-role="grid" />);
  for (let y = step; y < H; y += step) lines.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={1} data-visual-role="grid" />);
  return <g>{lines}</g>;
}

export { W as LAB_W, H as LAB_H };

/** Anime le demi-tour jusqu'à 180° — utilisé par le module 1 pour le « wow ». */
export function useDemiTourAnime(setAngle) {
  const raf = useRef(null);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return useCallback((depuis = 0) => {
    const t0 = performance.now();
    const D = 1100;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / D);
      // Départ et arrivée doux : le demi-tour se REGARDE, il ne claque pas.
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      setAngle(depuis + (180 - depuis) * e);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [setAngle]);
}
