import React from 'react';
import PopulationBar from '../../../../../common/stats/PopulationBar';
import { formatPercent } from '../../../../../common/stats';
import { POPULATION_GROUPS, CONDITIONS, EVENTS, probabilityUnder } from '../data';

/**
 * UniverseLab — l'interaction SIGNATURE : appliquer une condition RETIRE
 * une partie de la population, et la probabilité se recalcule dans ce qui
 * reste.
 *
 * OBSERVATION ATTENDUE : « être en club » vaut 56 % sur toute la population
 * et 75 % chez les seuls internes. Le numérateur (150) n'a pas changé de
 * nature — c'est le TOUT qui a rétréci. La figure le montre en deux barres :
 * la population entière, puis le sous-groupe REDESSINÉ sur toute la largeur.
 * « Univers restreint » cesse d'être une métaphore : c'est la barre du bas.
 *
 * Le quotient est affiché en toutes lettres (150 / 200), jamais seulement
 * son résultat : c'est le dénominateur qui est l'objet de la leçon.
 */
export default function UniverseLab({ conditionId, eventId, onConditionChange, onEventChange = null }) {
  const cond = CONDITIONS.find((c) => c.id === conditionId) ?? CONDITIONS[0];
  const ev = EVENTS.find((e) => e.id === eventId) ?? EVENTS[0];
  const { numerator, denominator, value } = probabilityUnder(cond.id, ev.id);

  // Les groupes hors de l'univers restreint sont hachurés dans la barre du
  // haut, pas supprimés : l'élève doit VOIR ce qu'il vient d'exclure, puis
  // le retrouver absent de la barre du bas.
  const dimmed = POPULATION_GROUPS.filter((g) => !cond.keep(g)).map((g) => g.id);

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          On tire un élève au hasard. Quelle est la probabilité qu’il soit…
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir l’événement">
          {EVENTS.map((e) => {
            const on = e.id === ev.id;
            return (
              <button key={e.id} type="button" onClick={() => onEventChange?.(e.id)}
                aria-pressed={on} disabled={!onEventChange}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                  on ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                     : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 disabled:opacity-50'}`}>
                {e.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
          … en imposant cette condition
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir la condition">
          {CONDITIONS.map((c) => {
            const on = c.id === cond.id;
            return (
              <button key={c.id} type="button" onClick={() => onConditionChange(c.id)}
                aria-pressed={on}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                  on ? 'border-violet-500 bg-violet-50 text-violet-800'
                     : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <PopulationBar
        groups={POPULATION_GROUPS}
        dimmed={dimmed}
        restrictedLabel={cond.id === 'aucune' ? undefined : `Univers restreint : ${cond.short}`}
        caption={`Population de 800 élèves ; univers restreint : ${cond.short}, soit ${denominator} élèves`}
      />

      {/* Le quotient, en toutes lettres */}
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
        <div className="text-sm text-indigo-900 mb-1">
          Probabilité d’<strong>{ev.label}</strong>{cond.id === 'aucune' ? '' : <> parmi <strong>{cond.short}</strong></> } :
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-black text-indigo-800 tabular-nums">
            {numerator} / {denominator}
          </span>
          <span className="text-2xl font-black text-indigo-600">=</span>
          <span className="text-2xl font-black text-indigo-800 tabular-nums">
            {value === null ? '—' : formatPercent(value, 1)}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-indigo-700">
          {cond.id === 'aucune'
            ? 'Sans condition, le dénominateur est la population entière : 800 élèves.'
            : `L’univers ne compte plus que ${denominator} élèves : c’est lui, le nouveau dénominateur.`}
        </p>
      </div>
    </div>
  );
}
