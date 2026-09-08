import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Seg, dotObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, dist, fr, midpoint, symCentral } from '../../../../../common/geo5e/geo5e';
import { Grille } from './DemiTourLab';

const W = 760;
const H = 470;

/**
 * PointImageLab — UN point, UNE punaise, et l'image qu'on place soi-même.
 *
 * C'est le laboratoire du module 2 : là où le module 1 faisait tourner un
 * calque entier, celui-ci réduit la scène à un seul point pour que la RÈGLE de
 * placement devienne visible. L'élève traîne M', et la scène lui dit deux
 * choses mesurées — la distance OM' et l'alignement — sans jamais lui dire où
 * poser le point.
 *
 * CE QUI EST MESURÉ, ET NON ASSÉNÉ. `OM`, `OM'` et l'écart à l'alignement sont
 * calculés à partir des points RÉELLEMENT dessinés (geo5e). Si l'élève place
 * M' à peu près, l'affichage le dit ; il n'y a aucun endroit où la figure
 * pourrait afficher « aligné » sur une figure qui ne l'est pas.
 *
 * RIEN NE SE FIGE. Même une fois la cible atteinte, M, O et M' restent
 * saisissables : on continue d'explorer après avoir trouvé.
 */
export default function PointImageLab({
  M, onM,
  O, onO,
  Mprime, onMprime,
  cible = null,           // { tol } — quand fournie, la scène évalue le placement
  montrerSolution = false,
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);

  const attendu = symCentral(M, O);
  const ecart = dist(Mprime, attendu);
  const juste = cible ? ecart <= (cible.tol ?? 14) : false;

  const dOM = dist(O, M);
  const dOMp = dist(O, Mprime);
  const mil = midpoint(M, Mprime);
  // « Aligné » se mesure : la distance du centre au milieu de [M M'] est nulle
  // exactement quand O EST ce milieu. Une seule quantité, et elle décide.
  const ecartMilieu = dist(mil, O);

  const move = useCallback((p) => {
    if (!p || !drag) return;
    const q = clampPt(p, W, H, 34);
    if (drag === 'M') onM?.(q);
    else if (drag === 'O') onO?.(q);
    else if (drag === 'Mp') onMprime?.(q);
  }, [drag, onM, onO, onMprime]);

  const prendre = (which) => (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(which);
  };

  const labels = [
    { id: 'M', text: 'M', anchor: M, color: '#334155', size: 20 },
    { id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 20 },
    { id: 'Mp', text: 'M’', anchor: Mprime, color: '#7c3aed', size: 20 },
  ];

  const obstacles = [
    ...dotObstacles([M, O, Mprime], 20),
    ...segObstacles(M, O),
    ...segObstacles(O, Mprime),
    ...(montrerSolution ? dotObstacles([attendu], 18) : []),
  ];

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden">
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

        {/* La solution ne s'affiche QUE si on la demande — sinon elle
            répondrait à la place de l'élève. */}
        {montrerSolution && !juste && (
          <circle
            cx={attendu.x} cy={attendu.y} r={16}
            fill="none" stroke="#10b981" strokeWidth={3} strokeDasharray="6 5"
          />
        )}

        <Seg a={M} b={O} color={juste ? '#f59e0b' : '#94a3b8'} w={3.5} />
        <Seg a={O} b={Mprime} color={juste ? '#f59e0b' : '#cbd5e1'} w={3.5} dash={juste ? undefined : '8 6'} />

        {/* M est saisissable lui aussi : l'étape 2 demande justement de le
            déplacer pour éprouver la règle sur d'autres configurations. */}
        <Handle
          p={M} color="#334155" r={13}
          dragging={drag === 'M'}
          onPointerDown={prendre('M')}
          label="Déplacer le point M"
        />
        <Handle
          p={Mprime} color="#7c3aed" r={13}
          dragging={drag === 'Mp'}
          onPointerDown={prendre('Mp')}
          label="Placer l’image M prime"
        />
        <Handle
          p={O} color="#dc2626" r={13}
          dragging={drag === 'O'}
          onPointerDown={prendre('O')}
          label="Déplacer le centre O"
        />
      </GeoScene>

      {/* Le tableau de bord : trois nombres MESURÉS sur la figure. */}
      <div className="border-t-2 border-indigo-100 bg-indigo-50/60 px-4 py-3 grid grid-cols-3 gap-2 text-center">
        <Mesure label="O M" value={`${fr(dOM / 40, 1)} u`} />
        <Mesure
          label="O M’"
          value={`${fr(dOMp / 40, 1)} u`}
          ok={Math.abs(dOM - dOMp) <= 12}
        />
        <Mesure
          label="O est le milieu"
          value={ecartMilieu <= 12 ? 'oui' : 'non'}
          ok={ecartMilieu <= 12}
        />
      </div>
    </div>
  );
}

function Mesure({ label, value, ok }) {
  const tone = ok === undefined
    ? 'text-slate-700'
    : ok ? 'text-emerald-700' : 'text-slate-400';
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-mono text-base font-black tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

export { W as PT_W, H as PT_H };
