import React from 'react';
import { formatPercent } from '../../../../../common/stats';
import { scenario, SLIDERS, POPULATION } from '../data';

/**
 * PpvExplorer — trois curseurs, et LA question : « test positif, et alors ? »
 *
 * OBSERVATION ATTENDUE : en ne bougeant QUE la prévalence, la VPP passe de
 * 2 % à 93 % — le test n'a pas changé d'un iota. L'élève découvre que la
 * réponse à sa question ne dépend pas seulement du test, mais de la
 * population dans laquelle on l'utilise.
 *
 * Les curseurs sont accessibles au clavier (input range natif) et chaque
 * valeur est écrite en clair à côté : on ne lit jamais une position, on lit
 * un nombre.
 */
export default function PpvExplorer({ params, onChange }) {
  const s = scenario(params);

  const set = (key) => (e) => onChange({ ...params, [key]: Number(e.target.value) });

  return (
    <div className="rounded-2xl border-2 border-emerald-100 bg-white p-4 space-y-4">
      <div className="space-y-3">
        {Object.entries(SLIDERS).map(([key, cfg]) => (
          <div key={key}>
            <label className="flex items-baseline justify-between text-sm font-semibold text-slate-700 mb-1">
              <span>{cfg.label}</span>
              <span className="tabular-nums text-emerald-700">{formatPercent(params[key], 1)}</span>
            </label>
            <input
              type="range"
              min={cfg.min} max={cfg.max} step={cfg.step}
              value={params[key]}
              onChange={set(key)}
              aria-label={`${cfg.label} : ${formatPercent(params[key], 1)}`}
              className="w-full accent-emerald-600 h-6"
            />
          </div>
        ))}
      </div>

      {/* Les effectifs qui en découlent */}
      <div className="grid gap-2 sm:grid-cols-2">
        <Stat label="Vrais positifs" value={s.truePositive.toLocaleString('fr-FR')} tone="rose" />
        <Stat label="Faux positifs" value={s.falsePositive.toLocaleString('fr-FR')} tone="amber" />
      </div>

      {/* LA réponse */}
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <div className="text-sm text-emerald-900 mb-1">
          Le test est <strong>positif</strong>. Probabilité que la personne soit réellement atteinte :
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-black text-emerald-800 tabular-nums">
            {s.truePositive.toLocaleString('fr-FR')} / {s.positive.toLocaleString('fr-FR')}
          </span>
          <span className="text-2xl font-black text-emerald-600">=</span>
          <span className="text-3xl font-black text-emerald-800 tabular-nums">
            {s.ppv === null ? '—' : formatPercent(s.ppv, 1)}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-emerald-700">
          Sur {POPULATION.toLocaleString('fr-FR')} personnes testées. Bouge la prévalence sans toucher au
          test : ce nombre change du tout au tout.
        </p>
      </div>
    </div>
  );
}

const TONES = {
  rose: 'border-rose-200 bg-rose-50 text-rose-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
};

function Stat({ label, value, tone }) {
  return (
    <div className={`rounded-xl border-2 px-3 py-2 ${TONES[tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-xl font-black tabular-nums">{value}</div>
    </div>
  );
}
