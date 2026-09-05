import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatDec } from '@smarter-academy/core';
import { rangeFor, fitsIn, describeError, CELLS } from './graphUtils';

/**
 * GraphBuilder — l'atelier : on FABRIQUE le graphique, on ne le lit pas.
 *
 * Activity            choisir l'échelle, puis poser une à une les lignes du
 *                     tableau, puis décider de relier ou non.
 * Mathematical objective  un graphique est une suite de décisions, et chacune
 *                     change ce qu'on verra. L'échelle en particulier n'est pas
 *                     un détail de présentation : un mauvais pas fait sortir
 *                     des points du cadre.
 * Student action      toucher une pastille d'échelle ; déplacer le point actif
 *                     jusqu'à la ligne visée ; valider ; basculer « relier ».
 * Controlled variable le pas de l'échelle, puis la position du point courant.
 * Mathematical state  { step, placed[], joined } — le cadre, les graduations,
 *                     les points hors cadre et le tracé en dérivent tous.
 * Visual consequence  changer le pas redessine les graduations et peut faire
 *                     disparaître des lignes du cadre (annoncées en clair) ;
 *                     chaque point validé se fige en vert.
 * Expected observation « si mon échelle est trop fine, mes grandes valeurs ne
 *                     rentrent plus ».
 * Misconception targeted  croire qu'on place les points avant de choisir
 *                     l'échelle ; et qu'un point « à peu près » suffit.
 * Feedback            l'écart est dit en mots (« 2 vers la droite »), jamais
 *                     jugé ; les lignes hors cadre sont listées en clair.
 * Formalization       la suite axes → échelle → points → tracé est nommée dans
 *                     le module.
 * Scaffolding         échelle imposée puis libre ; cible affichée sur le
 *                     premier point seulement.
 * Transfer            le module 6 répare les graphiques des autres.
 *
 * SÉCURITÉ D'AFFICHAGE (§17bis) — les points hors cadre ne sont JAMAIS passés
 * à `CoordPlane` : ils seraient dessinés hors du viewBox. Ils sont annoncés en
 * texte. Les points posés ne portent pas de nom (deux points de même ordonnée
 * verraient leurs étiquettes se chevaucher) ; seul le point actif est nommé.
 */
export default function GraphBuilder({
  rows,                    // [{ x, y, label }] — le tableau à représenter
  step,                    // pas d'échelle de l'axe des ordonnées
  xStep = 1,
  onStepChange,
  stepChoices = [],
  current,                 // {x, y} du point en cours de placement
  onCurrentChange,
  placed = [],             // [{x, y}] déjà validés
  onValidate,
  joined = false,
  onJoinChange,
  showJoin = false,
  targetIndex = -1,        // ligne visée ; -1 = terminé
  showTarget = false,
  axisLabels = { x: 'x', y: 'y' },
  lastError = null,
  disabled = false,
  frozen = false,
}) {
  const locked = disabled || frozen;
  const yRange = rangeFor(step, CELLS);
  const range = { xMin: 0, xMax: xStep * CELLS, yMin: 0, yMax: yRange.max };

  // Ce qui ne tient pas dans le cadre est DIT, jamais dessiné dehors.
  const ys = rows.map((r) => r.y);
  const { outside } = fitsIn(yRange, ys);
  const outsideRows = rows.filter((r) => outside.includes(r.y));

  const target = targetIndex >= 0 && targetIndex < rows.length ? rows[targetIndex] : null;
  const inFrame = (p) => p.y >= range.yMin && p.y <= range.yMax && p.x >= range.xMin && p.x <= range.xMax;

  const points = [
    ...placed.filter(inFrame).map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: '#059669' })),
    ...(!locked && target && current && inFrame(current)
      ? [{ id: 'M', name: 'M', x: current.x, y: current.y, color: '#4f46e5' }]
      : []),
  ];

  const curve = joined && placed.length >= 2
    ? [{ id: 'trace', points: [...placed].sort((a, b) => a.x - b.x), tone: 'emerald' }]
    : [];

  return (
    <div className="space-y-3">
      {/* ── Échelle ── */}
      {stepChoices.length > 0 && !frozen && (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700">
            Échelle de l’axe vertical — {formatDec(step)} par carreau
          </p>
          <div className="flex flex-wrap gap-2">
            {stepChoices.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => !locked && onStepChange?.(s)}
                disabled={locked}
                aria-pressed={s === step}
                aria-label={`Échelle ${formatDec(s)} par carreau`}
                className={`min-h-[44px] px-3 rounded-xl border-2 font-mono font-bold transition disabled:opacity-50
                  focus-visible:ring-2 focus-visible:ring-blue-500
                  ${s === step ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400'}`}
                style={{ touchAction: 'manipulation' }}
              >
                {formatDec(s)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* L'unité verticale est DÉDUITE pour que le cadre garde toujours douze
          carreaux de haut : changer d'échelle change les graduations, jamais la
          taille du repère. Sans cela, un pas de 20 ferait un cadre de 6 300 px. */}
      <CoordPlane
        range={range}
        unit={26}
        unitY={(12 * 26) / Math.max(1e-9, range.yMax - range.yMin)}
        xStep={xStep}
        yStep={step}
        points={points}
        curves={curve}
        draggableId={locked || !target ? null : 'M'}
        onPointChange={(p) => onCurrentChange?.(p)}
        target={showTarget && target ? target : null}
        step={xStep}
        axisLabels={axisLabels}
        frozen={frozen}
        disabled={locked}
        caption={false}
        ariaLabel={`Repère à construire, échelle ${formatDec(step)} par carreau`}
      />

      {/* Ce qui ne rentre pas est annoncé, jamais dessiné hors cadre. */}
      {outsideRows.length > 0 && (
        <Feedback tone="ko">
          <strong>{outsideRows.length}</strong> valeur{outsideRows.length > 1 ? 's' : ''} ne
          rentre{outsideRows.length > 1 ? 'nt' : ''} pas dans le cadre :{' '}
          {outsideRows.map((r) => formatDec(r.y)).join(', ')}. L’échelle est trop fine — le
          cadre s’arrête à {formatDec(yRange.max)}.
        </Feedback>
      )}

      {!frozen && target && (
        <>
          <button
            type="button"
            onClick={() => !locked && onValidate?.()}
            disabled={locked}
            className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700
              disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ touchAction: 'manipulation' }}
          >
            Poser le point ({formatDec(target.x)} ; {formatDec(target.y)})
          </button>
          {lastError && (
            <Feedback tone="ko">
              Ton point est à {describeError(lastError.placed, lastError.target)} de la
              position demandée.
            </Feedback>
          )}
        </>
      )}

      {showJoin && !frozen && (
        <button
          type="button"
          onClick={() => !locked && onJoinChange?.(!joined)}
          disabled={locked}
          aria-pressed={joined}
          className={`w-full min-h-[44px] rounded-xl border-2 font-semibold transition disabled:opacity-50
            focus-visible:ring-2 focus-visible:ring-blue-500
            ${joined ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
          style={{ touchAction: 'manipulation' }}
        >
          {joined ? 'Points reliés' : 'Relier les points'}
        </button>
      )}
    </div>
  );
}
