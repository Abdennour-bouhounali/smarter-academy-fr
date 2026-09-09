import React from 'react';
import { TOL_ANGLE, TOL_LONG, cm, longueurs, nature } from './paral';
import { angleAt } from '../../../../../common/geo5e/geo5e';

/**
 * FamilleLab — les deux jauges qui disent OÙ l'on est dans la famille.
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : l'élève déforme un parallélogramme (QuadLab, sommet asservi)
 *   change      : deux jauges se recalculent — « l'angle en A est-il droit ? »
 *                 et « deux côtés consécutifs sont-ils égaux ? »
 *   observation : allumer la première donne un rectangle, la seconde un
 *                 losange, LES DEUX un carré — et la figure n'a jamais cessé
 *                 d'être un parallélogramme
 *   sens        : rectangle, losange et carré ne sont pas des figures
 *                 concurrentes du parallélogramme : ce SONT des
 *                 parallélogrammes, avec une condition en plus.
 *
 * Misconception targeted : (a) de la spec — « un parallélogramme, c'est un
 * rectangle penché », donc un rectangle ne serait pas un parallélogramme.
 * Le bandeau « c'est toujours un parallélogramme » reste allumé pendant
 * TOUTE la manipulation : c'est lui qui répond, sans qu'on l'écrive.
 *
 * Les jauges sont en DOM (§6ter.5) et l'écart restant est chiffré : une
 * jauge éteinte dit ce qu'il manque, jamais « faux ».
 */
export default function FamilleLab({ pts }) {
  const n = nature(pts);
  const [ab, bc] = longueurs(pts);
  const angleA = angleAt(pts[3], pts[0], pts[1]);
  const ecartAngle = Math.abs(angleA - 90);
  const ecartCote = Math.abs(ab - bc);

  const jauges = [
    {
      id: 'droit',
      titre: 'Un angle droit ?',
      detail: `l’angle en A mesure ${Math.round(angleA)}°`,
      ok: n.droit,
      manque: `il s’en faut de ${Math.round(ecartAngle)}°`,
      donne: 'rectangle',
      couleur: 'sky',
    },
    {
      id: 'egaux',
      titre: 'Deux côtés consécutifs égaux ?',
      detail: `AB = ${cm(ab)} cm et BC = ${cm(bc)} cm`,
      ok: n.consecutifsEgaux,
      manque: `il s’en faut de ${cm(ecartCote)} cm`,
      donne: 'losange',
      couleur: 'emerald',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        {jauges.map((j) => (
          <div
            key={j.id}
            className={`rounded-xl border-2 p-3 transition ${
              j.ok
                ? j.couleur === 'sky' ? 'border-sky-300 bg-sky-50' : 'border-emerald-300 bg-emerald-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  j.ok ? (j.couleur === 'sky' ? 'bg-sky-500' : 'bg-emerald-500') : 'bg-slate-300'
                }`}
              />
              <span className={`text-sm font-black ${j.ok ? 'text-slate-800' : 'text-slate-400'}`}>{j.titre}</span>
            </div>
            <div className="mt-1 text-center text-xs text-slate-600 font-mono tabular-nums">{j.detail}</div>
            <div className={`mt-0.5 text-center text-xs font-bold ${j.ok ? 'text-slate-700' : 'text-slate-400'}`}>
              {j.ok ? `→ ${j.donne}` : j.manque}
            </div>
          </div>
        ))}
      </div>

      {/* Le nom de la figure, calculé — jamais écrit à côté d'un dessin. */}
      <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 p-3 text-center space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Cette figure est un</div>
        <div className="text-xl font-black text-indigo-900">{n.label}</div>
        {n.estPara && (
          <div className="text-xs font-bold text-emerald-700">
            ✓ et c’est toujours un parallélogramme
          </div>
        )}
      </div>
    </div>
  );
}

/** Les tolérances, exposées pour que la copie des modules ne les redéclare pas. */
export { TOL_ANGLE, TOL_LONG };
