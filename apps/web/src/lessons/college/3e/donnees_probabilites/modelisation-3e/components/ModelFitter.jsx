import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import MathText from '../../../../../common/components/MathText';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { formatDec, evaluate, residual, verdicts, formatModel, planeFor, proportional, affine, square, none } from './modelUtils';

/**
 * ModelFitter — choisir une famille de modèle, régler ses paramètres, et
 * lire l'écart aux données.
 *
 * Activity            toucher une famille (proportionnel, affine, carré,
 *                     aucun) ; régler a, b ou c ; la courbe se redessine sur
 *                     les points ; l'écart total s'écrit.
 * Mathematical objective  le modèle est CHOISI PAR LES DONNÉES : la bonne
 *                     famille et les bons paramètres sont ceux qui annulent
 *                     l'écart — et certaines données n'acceptent aucun modèle
 *                     simple.
 * Student action      chips de famille ; ± ou glissière sur les paramètres.
 * Controlled variable la famille et ses paramètres.
 * Mathematical state  { family, a, b, c } appartient au module ; la courbe,
 *                     le tableau des verdicts et l'écart sont dérivés.
 * Visual consequence  la droite pivote / glisse, la parabole s'ouvre ; les
 *                     points passent au vert quand la courbe les touche.
 * Expected observation « une part fixe demande b ; le carré ne se laisse pas
 *                     approcher par une droite ; la température par rien ».
 *
 * SÉCURITÉ D'AFFICHAGE : le repère vient de `planeFor` (points + 0, unités
 * séparées) ; lectures dans le DOM.
 */
export const FAMILIES = [
  { id: 'proportional', label: 'y = k × x' },
  { id: 'affine', label: 'y = a × x + b' },
  { id: 'square', label: 'y = c × x²' },
  { id: 'none', label: 'aucun modèle simple' },
];

export function buildModel(family, params) {
  switch (family) {
    case 'proportional': return proportional(params.k);
    case 'affine': return affine(params.a, params.b);
    case 'square': return square(params.c);
    default: return none();
  }
}

export default function ModelFitter({
  dataset,               // { points, xLabel, yLabel, variable }
  family,
  params,                // { k, a, b, c }
  ranges,                // { k: {min,max,step}, a: {…}, b: {…}, c: {…} }
  onFamily,
  onParams,
  revealed = false,
  disabled = false,
}) {
  const model = buildModel(family, params);
  const geo = planeFor(dataset.points);
  const fn = model.kind === 'affine' ? { a: model.a, b: model.b } : model.kind === 'proportional' ? { a: model.k, b: 0 } : null;
  const curve = model.kind === 'square'
    ? Array.from({ length: 41 }, (_, i) => { const x = (geo.range.xMax * i) / 40; return { x, y: evaluate(model, x) }; }).filter((p) => p.y <= geo.range.yMax)
    : [];
  const vs = verdicts(model, dataset.points, 0.05);
  const res = residual(model, dataset.points);
  const agree = vs.filter((v) => v.ok).length;
  const slider = (key, label, tone) => ranges[key] && (
    <ParamSlider key={key} label={label} ariaLabel={`le paramètre ${label}`} value={params[key]} onChange={(v) => onParams?.({ ...params, [key]: v })}
      min={ranges[key].min} max={ranges[key].max} step={ranges[key].step} tone={tone} disabled={disabled} />
  );

  return (
    <div className="space-y-3" role="group" aria-label={`Ajuster un modèle sur ${dataset.title}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Famille de modèle">
        {FAMILIES.map((f) => (
          <button key={f.id} type="button" disabled={disabled} onClick={() => onFamily?.(f.id)} aria-pressed={family === f.id}
            aria-label={`Famille : ${f.label}`}
            className={`min-h-[44px] px-2 rounded-xl border-2 text-xs sm:text-sm font-mono font-bold transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60
              ${family === f.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-500'}`}
            style={{ touchAction: 'manipulation' }}>
            {f.label}
          </button>
        ))}
      </div>
      {family === 'proportional' && slider('k', 'k', 'indigo')}
      {family === 'affine' && <>{slider('a', 'a', 'indigo')}{slider('b', 'b', 'amber')}</>}
      {family === 'square' && slider('c', 'c', 'indigo')}

      <CoordPlane
        range={geo.range} unit={geo.unit} unitY={geo.unitY} xStep={geo.xStep} yStep={geo.yStep}
        functions={fn ? [{ id: 'm', a: fn.a, b: fn.b, tone: 'emerald' }] : []}
        curves={curve.length ? [{ id: 'c', points: curve, tone: 'emerald' }] : []}
        points={dataset.points.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: vs[i].ok ? '#059669' : '#e11d48' }))}
        axisLabels={{ x: dataset.xLabel, y: dataset.yLabel }}
        ariaLabel={`Repère : ${dataset.title}, ${agree} point${agree > 1 ? 's' : ''} sur ${dataset.points.length} touchés par le modèle`}
        caption={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center text-sm">
        <p className="py-2 px-3 rounded-xl bg-slate-900 text-white text-center">
          {model.kind === 'none' ? <span className="font-semibold">aucun modèle simple</span>
            : <MathText>{`$\\text{${dataset.yLabel}} = ${formatModel(model, { variable: dataset.variable })}$`}</MathText>}
        </p>
        <p className={`font-mono tabular-nums px-3 py-2 rounded-xl border-2 text-center ${model.kind === 'none' ? 'border-slate-300 bg-slate-50 text-slate-600' : res < 0.05 * dataset.points.length ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`} aria-live="polite">
          {model.kind === 'none' ? '—' : <>écart total <strong>{formatDec(res)}</strong> · {agree}/{dataset.points.length} points</>}
        </p>
      </div>
      {revealed && (
        <p className="text-xs text-slate-500">Points en vert : touchés par le modèle (à 0,05 près) ; en rouge : manqués.</p>
      )}
    </div>
  );
}
