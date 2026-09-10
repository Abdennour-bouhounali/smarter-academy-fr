import React from 'react';
import { nthArithmetic, nthGeometric, fr } from './sommesUtils';

/**
 * PliageDesPas — l'instrument des modules 2 et 3 : n pas identiques repliés.
 *
 * Activity               un rang cible au cliquet. L'instrument écrit les pas
 *                        « + r » (ou « × q ») l'un après l'autre, puis les
 *                        REPLIE : les n pas identiques deviennent « n × r »
 *                        (ou « qⁿ »), et le résultat s'affiche des deux façons.
 * Mathematical objective répéter n fois la même addition, c'est multiplier par
 *                        n ; répéter n fois la même multiplication, c'est
 *                        élever à la puissance n.
 * Student action         changer le rang cible au cliquet, et comparer les deux
 *                        lignes — la dépliée et la repliée.
 * Controlled variable    le rang n.
 * Mathematical state     { u0, pas, n, mode } ; les deux écritures et le
 *                        résultat en sont dérivés.
 * Visual consequence     la ligne dépliée s'allonge (et se tronque au-delà de
 *                        six pas, avec des points de suspension) tandis que la
 *                        ligne repliée garde exactement la même longueur.
 * Expected observation   « la ligne du bas ne bouge pas quand n grandit — c'est
 *                        elle qu'il faut écrire ».
 * Misconception targeted « u(n) = u(0) + r » (on oublie le facteur n) ;
 *                        « u(n) = u(0) × q × n » (multiplier n fois n'est pas
 *                        multiplier par n).
 *
 * SÉCURITÉ DE MISE EN PAGE. La ligne dépliée est TRONQUÉE au-delà de six pas :
 * sans cela, trente « + 3 » déborderaient. Les deux lignes défilent
 * horizontalement dans leur propre conteneur, le corps de la page jamais.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ.
 */
export default function PliageDesPas({
  u0,
  pas,
  mode = 'add',           // 'add' | 'mul'
  n,
  nMax,
  onChangeRang,
  disabled = false,
  uniteLabel = 'rang',
}) {
  const signe = mode === 'add' ? '+' : '×';
  const valeur = mode === 'add' ? nthArithmetic(u0, pas, n) : nthGeometric(u0, pas, n);

  // La ligne dépliée, TRONQUÉE : au-delà de six pas on montre les trois
  // premiers, des points, et le dernier.
  const pasVisibles = n <= 6
    ? Array.from({ length: n }, () => `${signe} ${fr(pas)}`)
    : [
      ...Array.from({ length: 3 }, () => `${signe} ${fr(pas)}`),
      '…',
      `${signe} ${fr(pas)}`,
    ];

  const replie = mode === 'add'
    ? `u(0) ${pas < 0 ? '−' : '+'} ${fr(n)} × ${fr(Math.abs(pas))}`
    : `u(0) × ${fr(pas)}^${fr(n)}`;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-3">
      <div className="text-[13px] font-semibold text-violet-900">
        u(0) = {fr(u0)}, et chaque pas fait « {signe} {fr(pas)} »
      </div>

      {/* ── Le cliquet du rang ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Choisir le ${uniteLabel}`}>
        <span className="text-[13px] text-slate-600">{uniteLabel} visé :</span>
        <button
          type="button"
          className={btn}
          onClick={() => onChangeRang?.(n - 1)}
          disabled={disabled || n <= 0}
          aria-label={`${uniteLabel} précédent`}
        >
          −
        </button>
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-white">
          n = {fr(n)}
        </span>
        <button
          type="button"
          className={btn}
          onClick={() => onChangeRang?.(n + 1)}
          disabled={disabled || n >= nMax}
          aria-label={`${uniteLabel} suivant`}
        >
          +
        </button>
      </div>

      {/* ── Les deux écritures, dépliée puis repliée ────────────────────── */}
      <div className="space-y-2" aria-live="polite">
        <div className="rounded-xl border border-violet-200 bg-white p-2.5">
          <div className="text-[13px] font-semibold text-slate-600">
            dépliée — {fr(n)} pas identiques
          </div>
          <div className="mt-1 overflow-x-auto">
            <p className="whitespace-nowrap font-mono text-sm text-slate-800">
              u(0) {pasVisibles.length === 0 ? <span className="text-slate-400">(aucun pas)</span> : pasVisibles.join(' ')}
            </p>
          </div>
        </div>
        <div className="rounded-xl border-2 border-violet-300 bg-white p-2.5">
          <div className="text-[13px] font-semibold text-violet-700">
            repliée — sa longueur ne change jamais
          </div>
          <p className="mt-1 font-mono text-sm font-black text-violet-900">{replie}</p>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-2.5 text-center">
          <div className="text-[13px] text-emerald-800">u({fr(n)}) vaut</div>
          <div className="font-mono text-2xl font-black tabular-nums text-emerald-900">
            {fr(Math.round(valeur * 10000) / 10000)}
          </div>
        </div>
      </div>
    </div>
  );
}
