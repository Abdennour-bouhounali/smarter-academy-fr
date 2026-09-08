import React from 'react';
import GeoScene, { Seg, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import { clipLine, fr } from '../../../../../common/geo5e/geo5e';
import { droite, lineInter, pointsDe, ecartDirections } from './angles';

const W = 780;
const H = 430;

/**
 * ZoomArriereLab — le laboratoire qui met l'œil en défaut.
 *
 * Deux droites presque parallèles, et un curseur qui RECULE. À l'échelle 1,
 * l'écart de 3° est invisible ; à l'échelle 10, le croisement entre dans le
 * cadre. Rien n'a changé sur la feuille — seul le point de vue s'est éloigné.
 *
 * LE DÉZOOM EST HONNÊTE. On ne redessine pas des droites différentes : on
 * applique une homothétie de centre l'écran à la MÊME configuration, et le
 * point de croisement affiché est celui que `lineInter` calcule réellement.
 * L'élève ne peut donc pas être trompé dans l'autre sens.
 *
 * Le curseur est ici l'objet manipulé lui-même : « reculer » n'est pas un
 * paramètre de la figure, c'est le geste tout entier. C'est le seul cas de la
 * famille où une glissière est le bon contrôle, parce qu'elle EST le
 * mouvement du point de vue.
 */
export default function ZoomArriereLab({ d1, d2, zoom, onZoom, ariaLabel }) {
  const centre = { x: W / 2, y: H / 2 };

  /** Une droite vue « de loin » : les points se rapprochent du centre. */
  const vue = (d) => {
    const [a, b] = pointsDe(d, 4000);
    const shrink = (p) => ({
      x: centre.x + (p.x - centre.x) / zoom,
      y: centre.y + (p.y - centre.y) / zoom,
    });
    return clipLine(shrink(a), shrink(b), W, H, 8);
  };

  const [a1, b1] = vue(d1);
  const [a2, b2] = vue(d2);

  // Le vrai croisement, calculé sur les droites réelles puis ramené à l'échelle.
  const [p1, q1] = pointsDe(d1, 4000);
  const [p2, q2] = pointsDe(d2, 4000);
  const X = lineInter(p1, q1, p2, q2);
  const Xvue = X ? {
    x: centre.x + (X.x - centre.x) / zoom,
    y: centre.y + (X.y - centre.y) / zoom,
  } : null;
  const visible = Xvue && Xvue.x > 12 && Xvue.x < W - 12 && Xvue.y > 12 && Xvue.y < H - 12;

  const ecart = ecartDirections(d1, d2);

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={visible ? [{ id: 'X', text: 'elles se coupent ici', anchor: Xvue, color: '#dc2626', priority: true, size: 17 }] : []}
        obstacles={visible ? dotObstacles([Xvue], 22) : []}
        ariaLabel={ariaLabel}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />

        <Seg a={a1} b={b1} color="#334155" w={4} />
        <Seg a={a2} b={b2} color="#334155" w={4} />

        {visible && (
          <>
            <circle cx={Xvue.x} cy={Xvue.y} r={26} fill="none" stroke="#fca5a5" strokeWidth={3} data-visual-role="decor" />
            <circle cx={Xvue.x} cy={Xvue.y} r={9} fill="#dc2626" stroke="#fff" strokeWidth={3} />
          </>
        )}
      </GeoScene>

      <div className="border-t-2 border-violet-100 bg-violet-50/60 px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600 shrink-0">Recule :</span>
          <input
            type="range"
            min={1} max={14} step={0.1}
            value={zoom}
            onChange={(e) => onZoom(Number(e.target.value))}
            className="w-full accent-violet-600 h-6"
            aria-label="Reculer pour voir plus loin"
          />
          <span className="text-sm font-black tabular-nums text-violet-700 shrink-0 w-14 text-right">
            ×{fr(zoom, 1)}
          </span>
        </div>
        <div className="text-sm text-center">
          {visible ? (
            <span className="font-bold text-rose-600">
              Les droites se coupent : elles ne sont pas parallèles.
            </span>
          ) : (
            <span className="text-slate-500">
              Écart de direction : <strong className="tabular-nums text-slate-700">{fr(ecart, 1)}°</strong>
              {' '}— invisible à cette distance.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export { W as ZOOM_W, H as ZOOM_H, droite };
