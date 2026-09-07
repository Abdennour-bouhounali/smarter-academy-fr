import React, { useCallback, useRef, useState } from 'react';
import {
  sorted, mean as meanOf, median as medianOf, q1 as q1Of, q3 as q3Of,
  range as rangeOf, standardDeviation, formatNumber,
} from '../../../../../common/stats';

/**
 * SeriesLab — LE laboratoire de la leçon : la série elle-même, manipulable
 * valeur par valeur.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : rendre visible qu'un indicateur RÉAGIT à la série, et que
 *    tous ne réagissent pas de la même façon ;
 *  - action de l'élève : SAISIR une pastille (un élève) et la faire glisser
 *    le long de l'axe — le geste est le changement de la donnée ;
 *  - variable contrôlée : la valeur d'un individu ;
 *  - conséquence visuelle immédiate : les repères d'indicateurs se déplacent
 *    pendant le glissement, sans clic de validation.
 *
 * Le point pédagogique tient au fait de tirer UNE valeur vers l'extrême : la
 * moyenne suit, la médiane reste. Aucun texte ne peut produire cette
 * évidence-là ; le geste, oui.
 *
 * Les repères affichés sont choisis par le module (`show`), pour qu'ils
 * apparaissent au fur et à mesure de la leçon plutôt que tous d'un coup.
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation de l'étape.
 */
export default function SeriesLab({
  values,
  onChange,                 // (nextValues, movedIndex) => void ; absent = lecture seule
  min = 0,
  max = 60,
  step = 1,
  unit = 'min',
  show = { mean: false, median: false, quartiles: false, sd: false },
  label = 'Temps de trajet',
  height = 268,
  highlightIndex = null,
  compareValues = null,     // seconde série, dessinée en dessous (lecture seule)
  compareLabel = '',
}) {
  const svgRef = useRef(null);
  const [dragIndex, setDragIndex] = useState(null);

  const W = 1000;
  // `top` réserve la place des lignes d'étiquettes d'indicateurs (3 max).
  const pad = { left: 26, right: 26, top: 78, bottom: 42 };
  const IW = W - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;
  const span = max - min || 1;
  const toX = (v) => pad.left + ((v - min) / span) * IW;

  const s = sorted(values);
  const m = meanOf(values);
  const med = medianOf(values);
  const Q1 = q1Of(values);
  const Q3 = q3Of(values);
  const sd = standardDeviation(values);

  /** Empilement des pastilles : une valeur répétée monte d'un cran. */
  const stackOf = (vals) => {
    const seen = new Map();
    return vals.map((v) => {
      const k = seen.get(v) ?? 0;
      seen.set(v, k + 1);
      return k;
    });
  };
  const stacks = stackOf(values);
  const maxStack = Math.max(1, ...stacks) + 1;
  const R = Math.max(5, Math.min(11, (H * 0.62) / maxStack / 2));
  const baseY = pad.top + H;
  const yOf = (stack) => baseY - 6 - stack * (R * 2 + 2) - R;

  const clamp = (v) => Math.max(min, Math.min(max, v));
  const valueFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return null;
    const ratio = ((e.clientX - rect.left) / rect.width) * W;
    return clamp(Math.round(((ratio - pad.left) / IW) * span + min) / step) * step;
  }, [min, max, span, step, IW]);

  const startDrag = (i) => (e) => {
    if (!onChange) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragIndex(i);
  };
  const moveDrag = (e) => {
    if (dragIndex === null || !onChange) return;
    const v = valueFromEvent(e);
    if (v === null || v === values[dragIndex]) return;
    const next = [...values];
    next[dragIndex] = v;
    onChange(next, dragIndex);
  };
  const endDrag = (e) => {
    if (dragIndex === null) return;
    e.currentTarget?.releasePointerCapture?.(e.pointerId);
    setDragIndex(null);
  };
  const onKeyDown = (i) => (e) => {
    if (!onChange) return;
    const d = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const next = [...values];
    next[i] = clamp(next[i] + d);
    onChange(next, i);
  };

  // Graduations rondes : au plus 8 sur l'axe.
  const niceStep = (sp) => { for (const st of [1, 2, 5, 10, 15, 20, 25, 50, 100]) if (sp / st <= 8) return st; return 200; };
  const gs = niceStep(span);
  const ticks = [];
  for (let t = Math.ceil(min / gs) * gs; t <= max + 1e-9; t += gs) ticks.push(t);

  /**
   * Repère d'indicateur. Les étiquettes vont TOUTES au-dessus du nuage, sur
   * deux lignes distinctes (`row`) : sous l'axe vivent les graduations, et
   * une étiquette posée là se superposait à un nombre de l'axe (collision
   * détectée par l'audit de mise en page e2e).
   */
  const Marker = ({ v, color, text, row = 0 }) => (
    <g>
      <line x1={toX(v)} y1={pad.top - 4} x2={toX(v)} y2={baseY + 4} stroke={color} strokeWidth="2.5" strokeDasharray="5 3" />
      <text x={Math.max(pad.left + 34, Math.min(W - pad.right - 34, toX(v)))}
        y={pad.top - 9 - row * 17}
        textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>
        {text}
      </text>
    </g>
  );

  return (
    <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}{onChange ? ' — attrape une pastille et fais-la glisser' : ''}
      </p>
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${W} ${height + (compareValues ? 54 : 0)}`}
        className="select-none touch-none overflow-visible"
        style={{ touchAction: 'none' }}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="img"
        aria-label={`${label} : ${values.length} valeurs, de ${formatNumber(s[0])} à ${formatNumber(s[s.length - 1])} ${unit}`}
      >
        {show.quartiles && Q1 !== null && (
          <rect x={toX(Q1)} y={pad.top} width={Math.max(2, toX(Q3) - toX(Q1))} height={H}
            fill="#c7d2fe" opacity="0.4" />
        )}
        {show.sd && m !== null && (
          <rect x={toX(Math.max(min, m - sd))} y={pad.top + 4}
            width={Math.max(2, toX(Math.min(max, m + sd)) - toX(Math.max(min, m - sd)))} height={H - 8}
            fill="#a7f3d0" opacity="0.45" />
        )}

        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={baseY} x2={toX(t)} y2={baseY + 6} stroke="#94a3b8" strokeWidth="1" />
            <text x={toX(t)} y={baseY + 21} textAnchor="middle" fontSize="14" fill="#64748b">{t}</text>
          </g>
        ))}
        <line x1={pad.left} y1={baseY} x2={W - pad.right} y2={baseY} stroke="#475569" strokeWidth="1.5" />
        <text x={W - pad.right} y={baseY + 38} textAnchor="end" fontSize="13" fill="#94a3b8">{unit}</text>

        {show.median && med !== null && <Marker v={med} color="#059669" text={`Méd = ${formatNumber(med, 1)}`} row={0} />}
        {show.quartiles && Q1 !== null && (
          <>
            <Marker v={Q1} color="#7c3aed" text={`Q1 = ${formatNumber(Q1, 1)}`} row={1} />
            <Marker v={Q3} color="#7c3aed" text={`Q3 = ${formatNumber(Q3, 1)}`} row={2} />
          </>
        )}
        {show.mean && m !== null && <Marker v={m} color="#d97706" text={`Moy = ${formatNumber(m, 2)}`} row={show.quartiles ? 3 : show.median ? 1 : 0} />}

        {values.map((v, i) => {
          const on = dragIndex === i || highlightIndex === i;
          return (
            <g key={i}
              role={onChange ? 'slider' : undefined}
              tabIndex={onChange ? 0 : undefined}
              aria-label={onChange ? `Valeur ${i + 1}` : undefined}
              aria-valuemin={onChange ? min : undefined}
              aria-valuemax={onChange ? max : undefined}
              aria-valuenow={onChange ? v : undefined}
              aria-valuetext={onChange ? `${v} ${unit}` : undefined}
              onPointerDown={startDrag(i)}
              onKeyDown={onKeyDown(i)}
              style={{ cursor: onChange ? (dragIndex === i ? 'grabbing' : 'grab') : 'default', outline: 'none' }}>
              <circle cx={toX(v)} cy={yOf(stacks[i])} r={R + (on ? 2 : 0)}
                fill={on ? '#e11d48' : '#0284c7'} stroke="#fff" strokeWidth="2" />
            </g>
          );
        })}

        {compareValues && (() => {
          const cs = stackOf(compareValues);
          const cBase = height + 38;
          return (
            <g>
              <line x1={pad.left} y1={cBase} x2={W - pad.right} y2={cBase} stroke="#94a3b8" strokeWidth="1.2" />
              <text x={pad.left} y={cBase - 26} fontSize="13" fontWeight="700" fill="#a21caf">{compareLabel}</text>
              {compareValues.map((v, i) => (
                <circle key={i} cx={toX(v)} cy={cBase - 8 - cs[i] * (R + 2) - R / 1.4} r={R * 0.75}
                  fill="#c026d3" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
              ))}
            </g>
          );
        })()}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span><strong>n</strong> = {values.length}</span>
        {show.mean && <span className="text-amber-700"><strong>moyenne</strong> = {formatNumber(m, 2)} {unit}</span>}
        {show.median && <span className="text-emerald-700"><strong>médiane</strong> = {formatNumber(med, 1)} {unit}</span>}
        {show.quartiles && <span className="text-violet-700"><strong>Q1</strong> = {formatNumber(Q1, 1)} · <strong>Q3</strong> = {formatNumber(Q3, 1)} · <strong>Q3 − Q1</strong> = {formatNumber(Q3 - Q1, 1)}</span>}
        {show.sd && <span className="text-emerald-800"><strong>écart type</strong> = {formatNumber(sd, 2)} {unit}</span>}
        {show.range && <span><strong>étendue</strong> = {formatNumber(rangeOf(values), 1)} {unit}</span>}
      </div>
    </div>
  );
}
