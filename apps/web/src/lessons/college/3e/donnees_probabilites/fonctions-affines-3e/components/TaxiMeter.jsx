import React from 'react';
import { formatDec } from '@smarter-academy/core';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { receipt } from './affineUtils';

/**
 * TaxiMeter — le compteur du taxi : on roule, le prix grimpe… à partir d'un
 * montant qui n'est pas zéro.
 *
 * Activity            faire avancer le taxi kilomètre par kilomètre ; lire le
 *                     compteur, la facture en deux lignes, et la trace du prix
 *                     dans le repère ; changer de compagnie.
 * Mathematical objective  faire ÉPROUVER qu'il faut DEUX nombres pour décrire
 *                     ce prix : ce qu'on paie au départ, et ce que coûte chaque
 *                     kilomètre — et que ces deux nombres n'ont pas le même
 *                     effet sur la trace.
 * Student action      glisser (ou ±) la distance ; toucher une pastille de
 *                     prise en charge ou de prix du kilomètre.
 * Controlled variable x, la distance ; puis, par pastilles, b et a.
 * Mathematical state  { a, b, km } — le compteur, la facture, le point et la
 *                     trace sont tous calculés par `receipt` : ils ne peuvent
 *                     pas se contredire.
 * Visual consequence  le taxi avance sur la route ; le compteur grimpe ; la
 *                     ligne « prise en charge » ne bouge pas quand la distance
 *                     change ; la trace démarre à la hauteur b et grimpe de a
 *                     par kilomètre.
 * Expected observation « à 0 km on paie déjà quelque chose » ; « changer la
 *                     prise en charge décale le départ, changer le prix du km
 *                     change la vitesse à laquelle ça grimpe ».
 * Misconception targeted  « deux fois plus loin, deux fois plus cher ».
 * Feedback            le compteur et la facture, mis à jour à chaque geste.
 * Formalization       aucune ici : a, b et « affine » sont nommés aux modules
 *                     2, 3 et en pied de module 1.
 * Scaffolding         distance seule (SHOW) → prédictions (TRY) → deux
 *                     pastilles de tarif (EXPLORE) ; les curseurs continus de
 *                     a et b sont réservés aux modules 2 à 4.
 * Transfer            le module 2 isole a, le module 3 isole b.
 *
 * SÉCURITÉ D'AFFICHAGE — le repère a une étendue FIXE calculée pour le plus
 * cher des tarifs (b max + a max × kmMax) ; aucune valeur atteignable ne sort
 * du cadre. Les lectures vivent dans le DOM, jamais en <text> SVG.
 */
export default function TaxiMeter({
  a,                       // prix du kilomètre (€/km)
  b,                       // prise en charge (€)
  km,                      // distance parcourue
  onKmChange,
  kmMax = 10,
  tariffs = null,          // { fixed: [..], rate: [..] } — affiche les pastilles de tarif
  onTariffChange,          // ({ a, b }) => void
  yMax = 25,
  showSlider = true,
  showPlane = true,
  disabled = false,
}) {
  const r = receipt(a, b, km);
  const trace = Array.from({ length: km + 1 }, (_, k) => ({ x: k, y: receipt(a, b, k).total }));
  const money = (v) => `${formatDec(v, { minDecimals: 2 })} €`;

  return (
    <div className="space-y-3" role="group" aria-label="Compteur du taxi">
      {tariffs && (
        <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-3">
          {[
            { key: 'fixed', label: 'Prise en charge', values: tariffs.fixed, current: b, unit: ' €', tone: 'amber' },
            { key: 'rate', label: 'Prix du kilomètre', values: tariffs.rate, current: a, unit: ' €/km', tone: 'indigo' },
          ].map((row) => (
            <div key={row.key} className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-700 w-36 shrink-0">{row.label}</span>
              <div className="flex gap-1.5 flex-wrap" role="group" aria-label={row.label}>
                {row.values.map((v) => {
                  const on = v === row.current;
                  return (
                    <button
                      key={v}
                      type="button"
                      disabled={disabled}
                      aria-pressed={on}
                      onClick={() => !disabled && onTariffChange?.(row.key === 'fixed' ? { a, b: v } : { a: v, b })}
                      className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition
                        focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50
                        ${on
                          ? (row.tone === 'amber' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'}`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {formatDec(v)}{row.unit}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSlider && (
        <ParamSlider
          label="Route"
          ariaLabel="la distance parcourue"
          value={km}
          onChange={(v) => !disabled && onKmChange?.(v)}
          min={0}
          max={kmMax}
          step={1}
          tone="sky"
          unit=" km"
          disabled={disabled}
        />
      )}

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-3">
        {/* La route : la position du taxi EST la distance */}
        <div className="relative h-9 rounded-full bg-slate-100 border border-slate-200" aria-hidden="true">
          <div
            className="absolute top-1/2 -translate-y-1/2 text-2xl leading-none transition-[left] duration-300"
            style={{ left: `calc(${(km / kmMax) * 100}% - ${(km / kmMax) * 32}px)` }}
          >
            🚕
          </div>
        </div>

        {/* Le compteur */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compteur</span>
          <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums" aria-live="polite">
            {money(r.total)}
          </span>
        </div>

        {/* La facture en deux lignes */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
          <div className="flex justify-between gap-3">
            <span>Prise en charge</span>
            <span className="font-mono tabular-nums text-amber-700 font-bold">{money(r.fixed)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>{formatDec(km)} km × {formatDec(a)} €</span>
            <span className="font-mono tabular-nums text-indigo-700 font-bold">{money(r.variable)}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-slate-300 pt-1 font-bold">
            <span>Total</span>
            <span className="font-mono tabular-nums">{money(r.total)}</span>
          </div>
        </div>
      </div>

      {showPlane && (
        <CoordPlane
          range={{ xMin: 0, xMax: kmMax, yMin: 0, yMax }}
          unit={30}
          unitY={250 / yMax}
          xStep={1}
          yStep={5}
          curves={trace.length >= 2 ? [{ id: 'trace', points: trace, tone: 'indigo' }] : []}
          points={[
            { id: 'start', x: 0, y: r.fixed, color: '#d97706' },
            { id: 'now', x: km, y: r.total, color: '#4f46e5' },
          ]}
          axisLabels={{ x: 'km', y: '€' }}
          ariaLabel={`Repère : prix de la course selon la distance, prise en charge ${formatDec(b)} €, ${formatDec(a)} € par kilomètre`}
          caption={false}
        />
      )}
    </div>
  );
}
