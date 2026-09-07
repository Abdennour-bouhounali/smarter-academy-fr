import React from 'react';
import PopulationBar from '../../../../../common/stats/PopulationBar';
import { formatPercent } from '../../../../../common/stats';
import { POPULATION, scenario, populationGroups } from '../data';

/**
 * TestPopulationLab — la population de 10 000 personnes, révélée par étapes.
 *
 * OBSERVATION ATTENDUE : à l'étape « positifs », l'orange (495 faux
 * positifs) écrase le rouge (99 vrais positifs). Le paradoxe n'est pas
 * énoncé, il se VOIT — et il se voit parce que les LARGEURS sont
 * proportionnelles aux effectifs, pas parce qu'on manipule des décimaux.
 *
 * POURQUOI DEUX BARRES. Avec 1 % de prévalence, les 99 vrais positifs font
 * 1 % de la largeur totale : invisibles dans la seule barre du haut. La barre
 * du bas REDESSINE les positifs sur toute la largeur — c'est précisément le
 * geste « parmi les positifs », donc le dénominateur de la VPP, et c'est là
 * que le rapport 99 contre 495 devient lisible.
 *
 * Les étapes sont volontairement dans cet ordre : la population entière, puis
 * le partage malades/sains (et sa disproportion), puis seulement le résultat
 * du test. Révéler les quatre catégories d'emblée ferait perdre l'essentiel :
 * les faux positifs sont nombreux PARCE QUE les sains sont nombreux.
 */
const STEPS = ['population', 'sante', 'test', 'positifs'];

export default function TestPopulationLab({ step = 'population', params, onStepChange = null }) {
  const s = scenario(params);
  const groups = populationGroups(params);

  // Ce qu'on montre dépend de l'étape : on n'éteint jamais des individus,
  // on les regroupe différemment.
  const viewGroups = step === 'population'
    ? [{ id: 'tous', count: POPULATION, color: '#94a3b8', label: 'personnes testées' }]
    : step === 'sante'
      ? [
        { id: 'atteints', count: s.ill, color: '#dc2626', label: 'atteints' },
        { id: 'sains', count: s.healthy, color: '#cbd5e1', label: 'sains' },
      ]
      : groups;

  const dimmed = step === 'positifs' ? ['fn', 'vn'] : [];

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      {onStepChange && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
            Révèle la population, étape par étape
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Étapes de la révélation">
            {[
              ['population', '1. Les 10 000 personnes'],
              ['sante', '2. Qui est atteint ?'],
              ['test', '3. Que dit le test ?'],
              ['positifs', '4. Ne garder que les positifs'],
            ].map(([id, label]) => {
              const on = step === id;
              const idx = STEPS.indexOf(id);
              const reached = STEPS.indexOf(step) >= idx;
              return (
                <button key={id} type="button" onClick={() => onStepChange(id)} aria-pressed={on}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                    on ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                       : reached ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                       : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <PopulationBar
        groups={viewGroups}
        dimmed={dimmed}
        restrictedLabel="Ne restent que les tests positifs"
        caption={`Population de ${POPULATION.toLocaleString('fr-FR')} personnes — étape « ${step} »`}
      />

      {/* Le commentaire suit l'étape : une phrase, jamais un cours */}
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        {step === 'population' && (
          <>On teste <strong>{POPULATION.toLocaleString('fr-FR')} personnes</strong>. Pour l’instant, on ne sait rien d’elles.</>
        )}
        {step === 'sante' && (
          <>
            La maladie touche <strong>{formatPercent(s.prevalence, 1)}</strong> de la population :{' '}
            <strong className="text-rose-700">{s.ill}</strong> personnes atteintes contre{' '}
            <strong>{s.healthy.toLocaleString('fr-FR')}</strong> personnes saines. Retiens ce déséquilibre.
          </>
        )}
        {step === 'test' && (
          <>
            Le test détecte <strong>{s.truePositive}</strong> des {s.ill} atteints (il en manque{' '}
            <strong>{s.falseNegative}</strong>), et se trompe sur{' '}
            <strong className="text-amber-600">{s.falsePositive}</strong> personnes saines.
          </>
        )}
        {step === 'positifs' && (
          <>
            Parmi les <strong>{s.positive}</strong> tests positifs, seulement{' '}
            <strong className="text-rose-700">{s.truePositive}</strong> concernent une personne réellement
            atteinte — les <strong className="text-amber-600">{s.falsePositive}</strong> autres sont des
            erreurs. Soit <strong>{formatPercent(s.ppv, 1)}</strong>.
          </>
        )}
      </div>

      {/* Le tableau des quatre effectifs, dès que le test a parlé */}
      {(step === 'test' || step === 'positifs') && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[24rem]">
            <caption className="sr-only">Les quatre catégories du test</caption>
            <thead>
              <tr className="text-slate-500">
                <th scope="col" className="py-1.5 px-2 text-left font-semibold" />
                <th scope="col" className="py-1.5 px-2 font-semibold">Atteints</th>
                <th scope="col" className="py-1.5 px-2 font-semibold">Sains</th>
                <th scope="col" className="py-1.5 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <th scope="row" className="py-1.5 px-2 text-left font-semibold text-slate-700">Test +</th>
                <td className="py-1.5 px-2 text-center font-bold text-rose-700 tabular-nums">{s.truePositive}</td>
                <td className="py-1.5 px-2 text-center font-bold text-amber-600 tabular-nums">{s.falsePositive}</td>
                <td className="py-1.5 px-2 text-center font-bold tabular-nums">{s.positive}</td>
              </tr>
              <tr className="border-t border-slate-200">
                <th scope="row" className="py-1.5 px-2 text-left font-semibold text-slate-700">Test −</th>
                <td className="py-1.5 px-2 text-center tabular-nums">{s.falseNegative}</td>
                <td className="py-1.5 px-2 text-center tabular-nums">{s.trueNegative.toLocaleString('fr-FR')}</td>
                <td className="py-1.5 px-2 text-center font-bold tabular-nums">{s.negative.toLocaleString('fr-FR')}</td>
              </tr>
              <tr className="border-t-2 border-slate-300 text-slate-600">
                <th scope="row" className="py-1.5 px-2 text-left font-semibold">Total</th>
                <td className="py-1.5 px-2 text-center font-bold tabular-nums">{s.ill}</td>
                <td className="py-1.5 px-2 text-center font-bold tabular-nums">{s.healthy.toLocaleString('fr-FR')}</td>
                <td className="py-1.5 px-2 text-center font-bold tabular-nums">{s.total.toLocaleString('fr-FR')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
