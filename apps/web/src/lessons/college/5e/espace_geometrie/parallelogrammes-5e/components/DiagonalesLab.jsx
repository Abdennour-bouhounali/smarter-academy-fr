import React from 'react';
import { cm, etatDiagonales } from './paral';

/**
 * DiagonalesLab — la table qui sépare « milieu commun » de « même longueur ».
 *
 * ACTION → CHANGE → OBSERVATION → SENS
 *   action      : l'élève déforme le parallélogramme dans QuadLab
 *   change      : les six nombres se recalculent depuis le point O réellement
 *                 dessiné à l'intersection des diagonales
 *   observation : OA et OC restent collés, OB et OD aussi — pendant que AC et
 *                 BD, eux, refusent obstinément de se rejoindre
 *   sens        : le parallélogramme garantit un MILIEU COMMUN, pas des
 *                 diagonales égales. C'est deux propriétés différentes.
 *
 * Misconception targeted : « les diagonales d'un parallélogramme sont
 * égales » — la confusion (c) de la spec, entretenue par le fait que c'est
 * VRAI pour le rectangle, la figure que l'élève a en tête.
 *
 * La table est en DOM, jamais en SVG : aucun nombre ne peut venir se poser
 * sur un trait, quel que soit l'état atteint (§6ter.5).
 */
export default function DiagonalesLab({ pts, montrerLongueurs = true }) {
  const d = etatDiagonales(pts);
  if (!d) return null;

  const paires = [
    {
      id: 'ac', titre: 'Sur la diagonale [AC]', a: ['OA', d.OA], b: ['OC', d.OC], ok: d.milieuAC,
      verdict: 'O est le milieu de [AC]',
    },
    {
      id: 'bd', titre: 'Sur la diagonale [BD]', a: ['OB', d.OB], b: ['OD', d.OD], ok: d.milieuBD,
      verdict: 'O est le milieu de [BD]',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        {paires.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border-2 p-3 ${p.ok ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">{p.titre}</div>
            <div className="mt-1.5 flex items-center justify-center gap-4">
              {[p.a, p.b].map(([nom, val]) => (
                <div key={nom} className="text-center">
                  <div className="font-mono text-xs text-slate-500">{nom}</div>
                  <div className="font-mono text-lg font-black tabular-nums text-slate-800">
                    {cm(val)}<span className="text-xs font-semibold text-slate-500"> cm</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-1 text-center text-xs font-bold ${p.ok ? 'text-emerald-700' : 'text-slate-400'}`}>
              {p.ok ? `✓ ${p.verdict}` : 'les deux moitiés diffèrent'}
            </div>
          </div>
        ))}
      </div>

      {/* Le contraste, mis DÉLIBÉRÉMENT à côté : c'est en voyant les deux
          blocs ensemble que l'élève cesse de les confondre. */}
      {montrerLongueurs && (
        <div className={`rounded-xl border-2 p-3 ${d.memeLongueur ? 'border-amber-300 bg-amber-50' : 'border-orange-300 bg-orange-50'}`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600 text-center">
            Et les diagonales entières ?
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-5">
            {[['AC', d.AC], ['BD', d.BD]].map(([nom, val]) => (
              <div key={nom} className="text-center">
                <div className="font-mono text-xs text-slate-500">{nom}</div>
                <div className="font-mono text-lg font-black tabular-nums text-slate-800">
                  {cm(val)}<span className="text-xs font-semibold text-slate-500"> cm</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 text-center text-xs font-bold text-orange-800">
            {d.memeLongueur
              ? 'ici elles sont égales — mais ce n’est pas le parallélogramme qui l’impose'
              : 'elles ne sont PAS égales, et la figure est pourtant un parallélogramme'}
          </div>
        </div>
      )}
    </div>
  );
}
