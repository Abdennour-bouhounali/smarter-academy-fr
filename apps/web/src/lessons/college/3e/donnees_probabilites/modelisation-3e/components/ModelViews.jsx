import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import MathText from '../../../../../common/components/MathText';
import { formatDec, evaluate, tableOf, formatModel, planeFor } from './modelUtils';

/**
 * ModelViews — un même modèle, trois écritures : tableau, graphique, expression.
 *
 * Activity            voir apparaître, l'une après l'autre, les trois vues du
 *                     modèle retenu (le module commande `show`).
 * Mathematical objective  un modèle est UN objet ; tableau, droite et
 *                     expression en sont trois lectures qui ne peuvent pas se
 *                     contredire — elles dérivent toutes de `evaluate`.
 * Mathematical state  { model, xs, points } ; tout est calculé au rendu.
 * Visual consequence  les tickets (points) et la droite du modèle passent
 *                     par les mêmes endroits ; le tableau montre les mêmes
 *                     nombres ; l'expression écrit la règle.
 *
 * SÉCURITÉ D'AFFICHAGE : le repère est calculé par `planeFor` (contient 0,
 * les points et la prévision, unités séparées en x et y — pas de cadre de
 * 6 000 px) ; les lectures numériques sont dans le DOM.
 */
export default function ModelViews({
  model,
  xs,
  points = [],
  extraPoint = null,        // { x, y, label } : la prévision, ajoutée au repère
  variable = 'x',
  xLabel = 'x', yLabel = 'y', xUnit = '', yUnit = '',
  show = { table: true, graph: true, expression: true },
  caption,
}) {
  const rows = tableOf(model, xs);
  const all = [...points, ...rows, ...(extraPoint ? [extraPoint] : [])];
  const geo = planeFor(all);
  const fn = model.kind === 'affine' ? { a: model.a, b: model.b } : model.kind === 'proportional' ? { a: model.k, b: 0 } : null;
  const curve = fn ? [] : xs.map((x) => ({ x, y: evaluate(model, x) }));

  return (
    <div className="space-y-3" role="group" aria-label="Les trois vues du modèle">
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      {show.table && (
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
          <table className="w-full text-sm font-mono tabular-nums">
            <caption className="sr-only">Tableau de valeurs du modèle</caption>
            <tbody>
              <tr className="bg-slate-50">
                <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{xLabel}{xUnit ? ` (${xUnit})` : ''}</th>
                {rows.map((r) => <td key={r.x} className="px-3 py-2 text-center">{formatDec(r.x)}</td>)}
              </tr>
              <tr>
                <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap">{yLabel}{yUnit ? ` (${yUnit})` : ''}</th>
                {rows.map((r) => <td key={r.x} className="px-3 py-2 text-center font-bold text-indigo-700">{formatDec(r.y)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {show.graph && (
        <CoordPlane
          range={geo.range} unit={geo.unit} unitY={geo.unitY} xStep={geo.xStep} yStep={geo.yStep}
          functions={fn ? [{ id: 'm', a: fn.a, b: fn.b, tone: 'indigo' }] : []}
          curves={curve.length ? [{ id: 'c', points: curve, tone: 'indigo' }] : []}
          points={[
            ...points.map((p) => ({ id: `t${p.x}`, x: p.x, y: p.y, color: '#d97706' })),
            ...(extraPoint ? [{ id: 'extra', x: extraPoint.x, y: extraPoint.y, name: extraPoint.label, color: '#e11d48' }] : []),
          ]}
          axisLabels={{ x: xUnit || xLabel, y: yUnit || yLabel }}
          ariaLabel={`Repère : ${yLabel} selon ${xLabel}, tickets en orange, modèle en indigo`}
          caption={false}
        />
      )}
      {show.expression && (
        <p className="text-center py-2.5 px-3 rounded-xl bg-slate-900 text-white">
          <MathText>{`$\\text{${yLabel}} = ${formatModel(model, { variable })}$`}</MathText>
        </p>
      )}
    </div>
  );
}
