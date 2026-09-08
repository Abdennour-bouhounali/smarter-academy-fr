import React from 'react';
import { valeur, ecrire, developper } from './litteral';

/**
 * RectangleDistribLab — la distributivité simple, lue sur une aire.
 *
 * Un rectangle de hauteur k et de largeur (n + b) est coupé en deux morceaux :
 * l'un de largeur n, l'autre de largeur b. L'élève fait varier n, et constate
 * que l'aire totale est toujours la somme des deux aires — quel que soit n.
 * C'est la distributivité, montrée avant d'être écrite, exactement comme la
 * leçon « Opérations » avait montré le découpage d'un produit.
 *
 * Expected observation : « couper le rectangle ne change pas son aire, donc
 * les deux écritures donnent toujours le même résultat ».
 * Misconception targeted : ne distribuer que sur le premier terme
 * (3 × (n + 2) → 3n + 2), qui reviendrait à oublier tout un morceau du
 * rectangle — ce que le dessin rend impossible à ignorer.
 *
 * PÉRIMÈTRE : le facteur k est un NOMBRE, jamais une expression contenant la
 * lettre. La double distributivité est un objet de 4e, et components/litteral.js
 * LÈVE si on tente de la produire.
 *
 * Sécurité visuelle : les deux morceaux sont deux <div> en flex dont les
 * largeurs sont des pourcentages bornés ; leurs libellés vivent dans des
 * cellules distinctes sous le dessin. Rien ne peut se chevaucher.
 */
export default function RectangleDistribLab({
  k,                    // la hauteur — un NOMBRE seul
  e,                    // l'expression de la largeur, { a: 1, b }
  n,                    // la valeur donnée à la lettre
  onN,
  valeurs = [1, 2, 3, 4, 5],
  lettre = 'n',
  ariaLabel,
}) {
  const largeurN = e.a * n;
  const largeurB = e.b;
  const totale = largeurN + largeurB;
  const pctN = totale === 0 ? 50 : (largeurN / totale) * 100;
  const d = developper(k, e);

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* Le choix de la valeur de la lettre. */}
      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
          {lettre} vaut…
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label={ariaLabel || 'Choisir la valeur de la lettre'}>
          {valeurs.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onN?.(val)}
              aria-pressed={val === n}
              data-valeur={val}
              className={[
                'min-h-[44px] min-w-[48px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                val === n
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400',
              ].join(' ')}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Le rectangle coupé en deux. */}
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-wide text-slate-400 text-center">
          Un rectangle de hauteur {k} et de largeur {ecrire(e, lettre)}
        </div>
        <div className="flex rounded-xl overflow-hidden border-2 border-slate-300 h-20 sm:h-24">
          <div
            className="bg-emerald-400/70 flex items-center justify-center min-w-0"
            style={{ width: `${pctN}%` }}
          >
            <span className="font-mono text-xs sm:text-sm font-black text-emerald-950 px-1 truncate">
              {k} × {e.a === 1 ? lettre : `${e.a}${lettre}`}
            </span>
          </div>
          <div
            className="bg-sky-400/70 flex items-center justify-center min-w-0 border-l-2 border-white"
            style={{ width: `${100 - pctN}%` }}
          >
            <span className="font-mono text-xs sm:text-sm font-black text-sky-950 px-1 truncate">
              {k} × {e.b}
            </span>
          </div>
        </div>
      </div>

      {/* Les trois aires, chacune dans sa cellule. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-1.5">
          <div className="text-[11px] text-emerald-700">morceau 1</div>
          <div className="font-mono font-black text-emerald-800 tabular-nums">{k * largeurN}</div>
        </div>
        <div className="rounded-lg bg-sky-50 border border-sky-200 py-1.5">
          <div className="text-[11px] text-sky-700">morceau 2</div>
          <div className="font-mono font-black text-sky-800 tabular-nums">{k * largeurB}</div>
        </div>
        <div className="rounded-lg bg-slate-100 border-2 border-slate-300 py-1.5">
          <div className="text-[11px] text-slate-600">aire totale</div>
          <output className="font-mono font-black text-slate-900 tabular-nums" data-aire={String(k * totale)}>
            {k * totale}
          </output>
        </div>
      </div>

      {/* Les deux écritures, en regard : elles donnent toujours le même nombre. */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-center">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">D’un bloc</div>
          <div className="font-mono text-sm font-bold text-slate-800">
            {k} × ({ecrire(e, lettre)}) = {k * totale}
          </div>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-center">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Morceau par morceau</div>
          <div className="font-mono text-sm font-bold text-slate-800">
            {ecrire(d, lettre)} = {valeur(d, n)}
          </div>
        </div>
      </div>
    </div>
  );
}
