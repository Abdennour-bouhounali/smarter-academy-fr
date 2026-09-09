import React from 'react';

/**
 * FacteursLab — les règles opératoires, LUES sur le compte des facteurs.
 *
 * Activity              régler les deux exposants et regarder les facteurs
 *                       s'aligner, se réunir (produit) ou se barrer deux à
 *                       deux (quotient).
 * Mathematical objective aᵐ × aⁿ = aᵐ⁺ⁿ n'est pas une formule à retenir :
 *                       c'est ce qu'on obtient en COMPTANT les facteurs des
 *                       deux paquets mis bout à bout. Pour le quotient, les
 *                       facteurs communs se simplifient et il reste la
 *                       différence.
 * Student action        −/+ sur chacun des deux exposants.
 * Controlled variable   un exposant à la fois (§8).
 * Mathematical state    les deux exposants — détenus par le MODULE.
 * Visual consequence    chaque facteur est une pastille. Au produit, les
 *                       deux rangées se rejoignent ; au quotient, les
 *                       pastilles qui s'annulent passent en gris barré.
 * Expected observation  « je n'ai jamais besoin de calculer la valeur : je
 *                       compte les pastilles ».
 * Misconception targeted « aᵐ × aⁿ = aᵐˣⁿ » — multiplier les exposants.
 *                       Ici on VOIT qu'on met deux paquets bout à bout, ce
 *                       qui les additionne.
 *
 * SÉCURITÉ VISUELLE (§17bis) : aucune coordonnée calculée. Les pastilles
 * sont des <span> dans un `flex-wrap` ; une rangée longue passe à la ligne.
 * Les exposants sont bornés à 6 par le module, si bien qu'aucun état
 * atteignable ne produit une rangée illisible.
 */

const Pastille = ({ base, barree }) => (
  <span
    className={[
      'inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg border-2 px-1.5 text-sm font-bold tabular-nums',
      barree
        ? 'border-slate-200 bg-slate-100 text-slate-400 line-through'
        : 'border-sky-300 bg-sky-50 text-sky-800',
    ].join(' ')}
  >
    {base}
  </span>
);

const Rangee = ({ base, combien, barrees = 0, label }) => (
  <div className="flex flex-wrap items-center gap-2">
    {label && <span className="w-20 shrink-0 text-xs font-semibold text-slate-500">{label}</span>}
    <span className="flex flex-wrap gap-1">
      {Array.from({ length: combien }, (_, i) => (
        <Pastille key={i} base={base} barree={i < barrees} />
      ))}
      {combien === 0 && (
        <span className="text-xs italic text-slate-400">aucun facteur</span>
      )}
    </span>
  </div>
);

const Stepper = ({ label, value, onChange, min, max, disabled }) => (
  <div className="flex items-center gap-2">
    <span className="text-[13px] font-semibold text-slate-500">{label}</span>
    <button
      type="button"
      aria-label={`Diminuer ${label}`}
      disabled={disabled || value <= min}
      onClick={() => onChange(value - 1)}
      className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      −
    </button>
    <span className="inline-flex min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border-2 border-sky-300 bg-sky-50 text-lg font-black tabular-nums text-sky-800">
      {value}
    </span>
    <button
      type="button"
      aria-label={`Augmenter ${label}`}
      disabled={disabled || value >= max}
      onClick={() => onChange(value + 1)}
      className="min-h-[40px] min-w-[40px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      +
    </button>
  </div>
);

export default function FacteursLab({
  base = 2,
  op = '×',            // '×' ou '÷'
  m, n,                // les deux exposants — l'état, détenu par le module
  onM, onN,
  min = 1,
  max = 6,
  disabled = false,
}) {
  const produit = op === '×';
  const resultat = produit ? m + n : m - n;
  const communs = produit ? 0 : Math.min(m, n);

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="text-center font-mono text-lg font-bold text-slate-700">
        {base}<sup>{m}</sup> {op} {base}<sup>{n}</sup>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <Rangee base={base} combien={m} barrees={communs} label={`${base}^${m}`} />
        <Rangee base={base} combien={n} barrees={communs} label={`${base}^${n}`} />
      </div>

      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-3">
        <p className="mb-2 text-xs font-semibold text-emerald-800">
          {produit
            ? `Les deux paquets bout à bout : ${m} + ${n} = ${resultat} facteurs`
            : communs > 0
            ? `${communs} facteur${communs > 1 ? 's' : ''} se simplifie${communs > 1 ? 'nt' : ''} : il reste ${m} − ${n} = ${resultat}`
            : `Il reste ${m} − ${n} = ${resultat} facteurs`}
        </p>
        {resultat >= 0 ? (
          <Rangee base={base} combien={resultat} />
        ) : (
          <p className="text-sm text-emerald-900">
            Il en manque <strong>{-resultat}</strong> : le résultat est{' '}
            <strong className="font-mono">
              {base}<sup>−{-resultat}</sup>
            </strong>
            , c’est-à-dire une division.
          </p>
        )}
        <p className="mt-2 text-center font-mono text-base font-black text-emerald-700">
          = {base}<sup>{resultat < 0 ? `−${-resultat}` : resultat}</sup>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Stepper label="1ᵉʳ exposant" value={m} onChange={onM} min={min} max={max} disabled={disabled} />
        <Stepper label="2ᵉ exposant" value={n} onChange={onN} min={min} max={max} disabled={disabled} />
      </div>
    </div>
  );
}
