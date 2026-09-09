import React from 'react';
import { racine, carre, encadrement } from './racines4e';

/**
 * EncadrementLab — coincer une racine entre deux entiers.
 *
 * Activity              déplacer un curseur d'entiers et regarder son CARRÉ
 *                       se comparer au nombre cible.
 * Mathematical objective encadrer √n, c'est trouver les deux carrés parfaits
 *                       qui entourent n. La comparaison ne se fait donc
 *                       jamais sur les racines (qu'on ne sait pas calculer)
 *                       mais sur les CARRÉS (qu'on connaît).
 * Student action        −/+ sur l'entier d'essai.
 * Controlled variable   l'entier candidat, seul.
 * Mathematical state    `k` — détenu par le MODULE. Composant contrôlé.
 * Visual consequence    une barre montre la position de n entre k² et
 *                       (k+1)² ; les deux bornes s'affichent avec leur carré.
 * Expected observation  « je ne calcule jamais la racine — je compare des
 *                       carrés que je connais ».
 * Misconception targeted encadrer par des nombres non consécutifs (7 et 9),
 *                       ce qui est vrai mais inutilement lâche.
 *
 * SÉCURITÉ VISUELLE (§17bis) : la barre est un <div> en pourcentage, les
 * nombres vivent dans leurs propres cellules. La position du repère est
 * bornée à [0 ; 100] %, donc aucun état atteignable ne le sort du cadre.
 */
export default function EncadrementLab({
  n,                  // le nombre dont on encadre la racine
  k,                  // l'entier d'essai — l'état, détenu par le module
  onK,
  min = 1,
  max = 14,
  disabled = false,
}) {
  const bas = carre(k);
  const haut = carre(k + 1);
  const dans = bas <= n && n < haut;
  const attendu = encadrement(n);

  // La position de n dans l'intervalle [k² ; (k+1)²], bornée pour rester
  // dans le cadre quel que soit l'essai.
  const position = Math.min(Math.max(((n - bas) / (haut - bas)) * 100, 0), 100);

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <p className="text-center text-sm text-slate-600">
        Où se trouve <strong className="font-mono text-base text-slate-800">√{n}</strong> ?
      </p>

      {/* Les deux bornes et leur carré, dans le DOM : rien ne se chevauche. */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="text-center">
          <div className={`text-xl font-black tabular-nums ${dans ? 'text-emerald-700' : 'text-slate-400'}`}>{k}</div>
          <div className="font-mono text-[11px] text-slate-500">{k}² = {bas}</div>
        </div>

        <div className="relative">
          <div className={`h-8 overflow-hidden rounded-lg border-2 ${dans ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
            {dans && (
              <span
                className="absolute top-0 h-8 w-[3px] -translate-x-1/2 rounded bg-rose-500"
                style={{ left: `${position}%` }}
                aria-hidden="true"
              />
            )}
          </div>
          <p className="mt-1 text-center text-xs text-slate-500">
            {dans ? `${bas} ≤ ${n} < ${haut}` : `${n} n’est pas entre ${bas} et ${haut}`}
          </p>
        </div>

        <div className="text-center">
          <div className={`text-xl font-black tabular-nums ${dans ? 'text-emerald-700' : 'text-slate-400'}`}>{k + 1}</div>
          <div className="font-mono text-[11px] text-slate-500">{(k + 1)}² = {haut}</div>
        </div>
      </div>

      <p className={`text-center text-sm font-semibold ${dans ? 'text-emerald-700' : 'text-slate-500'}`}>
        {dans
          ? `Trouvé : ${k} < √${n} < ${k + 1}`
          : n < bas
          ? `Trop haut : ${k}² dépasse déjà ${n}.`
          : `Trop bas : ${n} dépasse ${haut}.`}
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Essayer un entier plus petit"
          disabled={disabled || k <= min}
          onClick={() => onK(k - 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          −
        </button>
        <span className="inline-flex min-h-[44px] min-w-[64px] items-center justify-center rounded-lg border-2 border-emerald-300 bg-emerald-50 text-xl font-black tabular-nums text-emerald-800">
          {k}
        </span>
        <button
          type="button"
          aria-label="Essayer un entier plus grand"
          disabled={disabled || k >= max}
          onClick={() => onK(k + 1)}
          className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          +
        </button>
      </div>
    </div>
  );
}
