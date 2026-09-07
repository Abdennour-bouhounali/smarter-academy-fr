import React, { useState, useCallback } from 'react';
import { makeRng, frequencyTrajectory } from '../../../../../common/stats';
import { formatNumber, formatPercent } from '../../../../../common/stats';
import FrequencyChart from '../../../../../common/stats/FrequencyChart';
import { EXPERIMENTS, TRIAL_STEPS } from '../data';

/**
 * SimulationLab — l'interaction SIGNATURE de la leçon.
 *
 * OBSERVATION ATTENDUE : sur 10 lancers la fréquence tombe n'importe où
 * (0 %, 30 %, 50 %…) ; sur 10 000 elle colle à p sans jamais s'y poser
 * exactement. L'élève doit pouvoir REJOUER la même taille de série et
 * obtenir autre chose — c'est ce qui distingue une simulation d'une
 * animation.
 *
 * Chaque lancer est réellement calculé (mulberry32). La graine change à
 * chaque série : « Relancer » n'est pas un bouton décoratif, il produit une
 * série authentiquement nouvelle. Le coût est linéaire et 10 000 tirages
 * prennent moins d'une milliseconde — aucun DOM par tirage, un seul chemin
 * SVG pour la trajectoire.
 */
export default function SimulationLab({
  experimentId,
  onExperimentChange = null,
  onRun = null,
  allowExperimentChange = true,
  seed0 = 20260906,
}) {
  const exp = EXPERIMENTS.find((e) => e.id === experimentId) ?? EXPERIMENTS[0];
  const [runs, setRuns] = useState([]);   // séries lancées, la dernière en tête
  const [seed, setSeed] = useState(seed0);

  const run = useCallback((n) => {
    const rng = makeRng(seed);
    const points = frequencyTrajectory(rng, n, exp.p);
    const last = points[points.length - 1];
    const entry = {
      key: `${seed}-${n}`,
      n,
      points,
      frequency: last.frequency,
      successes: Math.round(last.frequency * n),
      gap: Math.abs(last.frequency - exp.p),
    };
    setRuns((prev) => [entry, ...prev].slice(0, 6));
    setSeed((s) => (s * 1664525 + 1013904223) >>> 0);
    onRun?.(entry);
  }, [seed, exp.p, onRun]);

  const latest = runs[0] ?? null;

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      {/* Choix de l'expérience */}
      {allowExperimentChange && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Expérience</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir l’expérience aléatoire">
            {EXPERIMENTS.map((e) => {
              const on = e.id === exp.id;
              return (
                <button key={e.id} type="button" onClick={() => { onExperimentChange?.(e.id); setRuns([]); }}
                  aria-pressed={on}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                    on ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
                  <span aria-hidden="true">{e.emoji}</span> {e.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            On suit l’événement « <strong>{exp.eventLabel}</strong> ». Dans le modèle, sa probabilité vaut{' '}
            <strong>{exp.pLabel}</strong> ≈ {formatNumber(exp.p, 3)}. <span className="text-slate-500">{exp.why}</span>
          </p>
        </div>
      )}

      {/* Les lancers */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Combien de répétitions ?</div>
        <div className="flex flex-wrap gap-2">
          {TRIAL_STEPS.map((n) => (
            <button key={n} type="button" onClick={() => run(n)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-indigo-200 bg-indigo-50 text-indigo-800
                         hover:border-indigo-400 hover:bg-indigo-100 active:scale-95 transition">
              Lancer {n.toLocaleString('fr-FR')} fois
            </button>
          ))}
          {latest && (
            <button type="button" onClick={() => run(latest.n)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-violet-300 bg-white text-violet-700
                         hover:bg-violet-50 active:scale-95 transition">
              ↻ Relancer {latest.n.toLocaleString('fr-FR')}
            </button>
          )}
        </div>
      </div>

      {/* Résultat de la dernière série */}
      {latest ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Répétitions" value={latest.n.toLocaleString('fr-FR')} tone="slate" />
          <Stat label={`Nombre de « ${exp.event} »`} value={latest.successes.toLocaleString('fr-FR')} tone="slate" />
          <Stat label="Fréquence observée" value={formatPercent(latest.frequency, 2)} tone="indigo" />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Choisis un nombre de répétitions pour lancer ta première série.</p>
      )}

      <FrequencyChart
        points={latest ? latest.points : []}
        theoretical={exp.p}
      />

      {/* Historique : c'est lui qui rend la fluctuation indiscutable */}
      {runs.length > 1 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tes séries</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">Historique des séries lancées</caption>
              <thead>
                <tr className="text-left text-slate-500">
                  <th scope="col" className="py-1 pr-3 font-semibold">Répétitions</th>
                  <th scope="col" className="py-1 pr-3 font-semibold">Fréquence</th>
                  <th scope="col" className="py-1 font-semibold">Écart à {exp.pLabel}</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.key} className="border-t border-slate-100">
                    <td className="py-1 pr-3 tabular-nums">{r.n.toLocaleString('fr-FR')}</td>
                    <td className="py-1 pr-3 tabular-nums font-semibold text-indigo-700">{formatPercent(r.frequency, 2)}</td>
                    <td className="py-1 tabular-nums text-slate-600">{formatPercent(r.gap, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const TONES = {
  slate: 'border-slate-200 bg-slate-50 text-slate-800',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800',
};

function Stat({ label, value, tone }) {
  return (
    <div className={`rounded-xl border-2 px-3 py-2 ${TONES[tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-xl font-black tabular-nums">{value}</div>
    </div>
  );
}
