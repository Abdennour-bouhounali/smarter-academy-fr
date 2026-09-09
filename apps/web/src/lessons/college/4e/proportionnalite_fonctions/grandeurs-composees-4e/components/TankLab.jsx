import React, { useId } from 'react';
import { fr, debitRelation, GRANDEURS } from './grandeurs4e';

/**
 * TankLab — le robinet, et la DÉMONSTRATION que le débit n'est pas une notion
 * de plus.
 *
 * Activity               régler le débit d'un robinet et la durée d'ouverture,
 *                        et voir le réservoir se remplir.
 * Mathematical objective un débit est un volume par unité de temps : EXACTEMENT
 *                        la structure de la vitesse, sur d'autres grandeurs.
 * Student action         glisser le débit, glisser la durée.
 * Controlled variable    le débit et la durée. Le volume n'est jamais réglable :
 *                        il est CALCULÉ, comme la troisième aiguille du
 *                        tableau de bord.
 * Mathematical state     (debit, duree). Le volume est dérivé par
 *                        `debitRelation`, qui délègue elle-même à `relation` —
 *                        le même code que la vitesse, littéralement.
 * Visual consequence     le niveau d'eau monte, et le volume se réécrit.
 * Expected observation   « c'est le même tableau de bord, avec d'autres mots ».
 * Misconception targeted croire qu'un débit est une notion nouvelle, avec sa
 *                        propre formule à mémoriser.
 *
 * SÉCURITÉ VISUELLE : le niveau est clampé dans [0 ; 1] avant d'être converti
 * en hauteur — l'eau ne peut pas déborder du réservoir, quel que soit le
 * réglage. Le DÉBORDEMENT MATHÉMATIQUE, lui, est dit en toutes lettres dans le
 * DOM : quand le volume dépasse la capacité, on l'annonce, on ne le cache pas.
 * Aucun nombre en <text> SVG.
 *
 * IDENTIFIANTS UNIQUES : ce labo est rendu PLUSIEURS FOIS dans un même module
 * (une fois par étape qui en a besoin). Un `id` écrit en dur y serait dupliqué,
 * et chaque <label for> pointerait alors vers la PREMIÈRE occurrence — le clic
 * sur le libellé de l'étape 3 déplacerait le curseur de l'étape 1. `useId`
 * donne à chaque instance son propre identifiant. Défaut trouvé au navigateur,
 * invisible en test unitaire.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

/** La capacité du réservoir, en litres. */
export const CAPACITE = 300;

/** Les bornes des deux cadrans réglables. */
export const BORNES_ROBINET = {
  debit: { min: 2, max: 30, pas: 1, unite: 'L/min' },
  duree: { min: 1, max: 30, pas: 1, unite: 'min' },
};

export default function TankLab({ debit, onDebit, duree, onDuree, releves = [], onRelever }) {
  // Un identifiant par INSTANCE : le labo est rendu à plusieurs étapes.
  const uid = useId();
  const r = debitRelation({ debit, duree });
  const volume = r.volume;
  const plein = Math.max(0, Math.min(1, volume / CAPACITE));
  const deborde = volume > CAPACITE;

  const H = 130;
  const W = 96;
  const hEau = plein * (H - 12);

  return (
    <div className="space-y-4" role="group" aria-label="Robinet et réservoir : régler le débit et la durée">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
        {/* ── Le réservoir ──────────────────────────────────────────── */}
        <div className="shrink-0 rounded-2xl border-2 border-slate-200 bg-white p-3">
          <svg viewBox={`0 0 ${W} ${H + 26}`} className="h-[156px] w-auto" role="img"
               aria-label={`Réservoir rempli de ${fr(Math.min(volume, CAPACITE))} litres sur ${CAPACITE}`}>
            {/* le robinet, dont l'ouverture SUIT le débit */}
            <rect x={W / 2 - 5} y="0" width="10" height="12" rx="2" fill="#64748b" />
            <rect
              x={W / 2 - 1.5}
              y="12"
              width="3"
              height={10 + (debit / BORNES_ROBINET.debit.max) * 8}
              fill="#38bdf8"
            />
            {/* la cuve */}
            <rect x="6" y="26" width={W - 12} height={H - 12} rx="5"
                  fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            {/* l'eau, clampée : elle ne peut pas sortir du cadre */}
            <rect
              x="8" y={26 + (H - 12) - hEau - 2} width={W - 16} height={Math.max(0, hEau)}
              rx="3" fill={deborde ? '#f59e0b' : '#38bdf8'} opacity="0.75"
            />
            {/* le trait de capacité */}
            <line x1="6" y1="28" x2={W - 6} y2="28" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          {/* Les graduations vivent dans le DOM (§6ter.5). */}
          <p className="mt-1 text-center text-[13px] text-slate-400">capacité {CAPACITE} L</p>
        </div>

        {/* ── Les deux curseurs, et le volume CALCULÉ ───────────────── */}
        <div className="flex-1 space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
            <label htmlFor={`${uid}-debit`} className="flex items-baseline justify-between gap-2 text-sm font-bold text-slate-700">
              <span>Débit du robinet</span>
              <span className="font-mono text-base font-black tabular-nums text-sky-700">
                {fr(debit)} {BORNES_ROBINET.debit.unite}
              </span>
            </label>
            <input
              id={`${uid}-debit`}
              type="range"
              min={BORNES_ROBINET.debit.min}
              max={BORNES_ROBINET.debit.max}
              step={BORNES_ROBINET.debit.pas}
              value={debit}
              onChange={(e) => onDebit(Number(e.target.value))}
              className="sa-slider accent-sky-600 w-full"
              role="slider"
              aria-valuemin={BORNES_ROBINET.debit.min}
              aria-valuemax={BORNES_ROBINET.debit.max}
              aria-valuenow={debit}
              aria-valuetext={`${fr(debit)} litres par minute`}
            />
            <p className="text-[13px] text-slate-500">
              se lit « {GRANDEURS.debit.lecture} »
            </p>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
            <label htmlFor={`${uid}-duree`} className="flex items-baseline justify-between gap-2 text-sm font-bold text-slate-700">
              <span>Durée d’ouverture</span>
              <span className="font-mono text-base font-black tabular-nums text-slate-700">
                {fr(duree)} min
              </span>
            </label>
            <input
              id={`${uid}-duree`}
              type="range"
              min={BORNES_ROBINET.duree.min}
              max={BORNES_ROBINET.duree.max}
              step={BORNES_ROBINET.duree.pas}
              value={duree}
              onChange={(e) => onDuree(Number(e.target.value))}
              className="sa-slider accent-slate-500 w-full"
              role="slider"
              aria-valuemin={BORNES_ROBINET.duree.min}
              aria-valuemax={BORNES_ROBINET.duree.max}
              aria-valuenow={duree}
              aria-valuetext={`${fr(duree)} minutes`}
            />
          </div>

          {/* Le volume : calculé, jamais réglé. */}
          <div className={`rounded-2xl border-2 p-3.5 text-center ${
            deborde ? 'border-amber-400 bg-amber-50' : 'border-indigo-200 bg-indigo-50'
          }`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Volume écoulé (calculé)
            </p>
            <p className={`font-mono text-2xl font-black tabular-nums ${
              deborde ? 'text-amber-900' : 'text-indigo-900'
            }`} data-volume={volume}>
              {fr(volume)} L
            </p>
            <p className="mt-0.5 font-mono text-[13px] text-slate-600">
              {fr(debit)} × {fr(duree)} = {fr(volume)}
            </p>
            {deborde && (
              <p className="mt-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-[13px] font-semibold text-amber-900">
                Le réservoir déborde : il ne contient que {CAPACITE} L.
              </p>
            )}
          </div>

          {onRelever && (
            <button
              type="button"
              onClick={() => onRelever({ debit, duree, volume })}
              className="min-h-[44px] w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700"
            >
              Noter ce remplissage
            </button>
          )}
        </div>
      </div>

      {/* ── Les remplissages notés ───────────────────────────────────── */}
      {releves.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
          <p className="mb-2 text-sm font-bold text-slate-700">Tes remplissages</p>
          <ul className="space-y-1">
            {releves.map((x, i) => (
              <li key={`${x.debit}-${x.duree}-${i}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-slate-500">
                  {fr(x.debit)} L/min pendant {fr(x.duree)} min
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900">
                  {fr(x.volume)} L
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
