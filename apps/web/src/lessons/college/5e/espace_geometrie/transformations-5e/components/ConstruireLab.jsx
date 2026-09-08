import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, dist, symCentral, symCentralPts } from '../../../../../common/geo5e/geo5e';
import { Grille } from './DemiTourLab';

const W = 760;
const H = 500;

/**
 * ConstruireLab — la construction sommet par sommet, sans calque.
 *
 * Le module 2 a donné la règle pour UN point. Ici, l'élève l'applique lui-même
 * à chaque sommet : il traîne une pastille et la dépose à la place de A', puis
 * B', puis C'. Le polygone image ne se referme qu'une fois tous les sommets
 * posés — c'est la construction qui fait apparaître la figure, pas un bouton.
 *
 * CE QUI EST GUIDÉ, ET CE QUI NE L'EST PAS. La demi-droite [sommet O) est
 * tracée en pointillé : c'est un instrument, comme la règle qu'on poserait sur
 * la feuille, et elle ne donne pas la réponse (elle ne dit pas à quelle
 * distance s'arrêter). La place exacte reste à trouver.
 */
export default function ConstruireLab({
  figure, centre, onCentre,
  poses,                    // { [i]: {x,y} } — les images déjà validées
  onPoser,                  // (i, p) => void
  courant,                  // l'indice du sommet à placer, ou null si fini
  noms = ['A', 'B', 'C', 'D'],
  tolerance = 16,
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);
  const [libre, setLibre] = useState({ x: W - 120, y: 90 });

  const image = symCentralPts(figure, centre);
  const fini = courant === null;
  const posesList = figure.map((_, i) => poses[i]).filter(Boolean);

  const move = useCallback((p) => {
    if (!p || !drag) return;
    const q = clampPt(p, W, H, 30);
    if (drag === 'O') onCentre?.(q);
    else if (drag === 'libre') setLibre(q);
  }, [drag, onCentre]);

  const deposer = () => {
    if (courant === null) return;
    const vise = symCentral(figure[courant], centre);
    if (dist(libre, vise) <= tolerance) onPoser(courant, vise);
  };

  const cible = courant === null ? null : symCentral(figure[courant], centre);
  const pret = cible && dist(libre, cible) <= tolerance;

  const labels = [
    { id: 'O', text: 'O', anchor: centre, color: '#dc2626', priority: true },
    ...figure.map((p, i) => ({ id: `s${i}`, text: noms[i], anchor: p, color: '#334155', priority: true })),
    ...figure.map((p, i) => (poses[i]
      ? { id: `i${i}`, text: `${noms[i]}’`, anchor: poses[i], color: '#0ea5e9', priority: true }
      : null)).filter(Boolean),
  ];

  const obstacles = [
    ...dotObstacles([centre, ...figure, ...posesList], 18),
    ...polyObstacles(figure),
    ...(courant !== null ? [...dotObstacles([libre], 20), ...segObstacles(figure[courant], centre)] : []),
  ];

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white overflow-hidden">
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

        {/* L'instrument : la demi-droite du sommet courant, prolongée
            au-delà de O. Elle guide la main, elle ne donne pas la distance. */}
        {courant !== null && (
          <line
            x1={figure[courant].x} y1={figure[courant].y}
            x2={figure[courant].x + (centre.x - figure[courant].x) * 2.7}
            y2={figure[courant].y + (centre.y - figure[courant].y) * 2.7}
            stroke="#bae6fd" strokeWidth={2.5} strokeDasharray="8 6" data-visual-role="decor"
          />
        )}

        <Poly pts={figure} fill="#64748b" stroke="#475569" fillOpacity={0.1} />
        {figure.map((p, i) => (
          <Dot key={`d${i}`} p={p} color={i === courant ? '#0284c7' : '#334155'} r={i === courant ? 10 : 8} />
        ))}

        {/* La figure image se referme dès que tous les sommets sont posés. */}
        {fini && <Poly pts={image} fill="#0ea5e9" stroke="#0284c7" fillOpacity={0.15} />}
        {figure.map((_, i) => (poses[i] ? <Dot key={`p${i}`} p={poses[i]} color="#0ea5e9" r={8} /> : null))}

        {courant !== null && (
          <Handle
            p={libre} color={pret ? '#059669' : '#0ea5e9'} r={13}
            dragging={drag === 'libre'}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('libre'); }}
            label={`Placer l’image du sommet ${noms[courant]}`}
          />
        )}

        <Handle
          p={centre} color="#dc2626" r={13}
          dragging={drag === 'O'}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('O'); }}
          label="Déplacer le centre O"
        />
      </GeoScene>

      <div className="border-t-2 border-sky-100 bg-sky-50/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-600">
          {fini
            ? <>Les {figure.length} sommets sont placés — la figure image est construite.</>
            : <>Sommet à placer : <strong className="text-sky-700">{noms[courant]}’</strong> ({posesList.length} / {figure.length})</>}
        </span>
        {!fini && (
          <button
            type="button"
            onClick={deposer}
            className={`rounded-xl px-4 py-1.5 text-sm font-bold transition ${
              pret ? 'bg-sky-600 text-white hover:bg-sky-700' : 'border-2 border-sky-200 bg-white text-sky-700'
            }`}
          >
            {pret ? `Poser ${noms[courant]}’ ici` : 'Pas encore au bon endroit'}
          </button>
        )}
      </div>
    </div>
  );
}

export { W as CONS_W, H as CONS_H };
