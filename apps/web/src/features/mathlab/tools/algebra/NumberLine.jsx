import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from './rational.js';
import { formatAxisLabel } from '../functionGrapher/grapherFormat.js';
import { NUMBER_LINE_MIN_SPAN, NUMBER_LINE_MAX_SPAN } from './algebraState.js';

/**
 * LA DROITE GRADUÉE — ce qu'une inégalité veut dire.
 *
 *     ──────○════════════▶
 *          −3
 *
 * Un cercle VIDE pour une borne exclue (< et >), PLEIN pour une borne
 * incluse (⩽ et ⩾) : la différence entre les deux est exactement ce que
 * l'élève confond, et elle se voit ici d'un coup d'œil.
 *
 * Le dessin est en SVG et `direction: ltr` (algebra.css) : les négatifs sont
 * à gauche, comme dans tous les manuels.
 *
 * Zoom (molette, boutons) et déplacement (glissé) suivent la même idée que
 * la fenêtre du grapheur : l'élève cadre ce qu'il veut lire.
 */

const WIDTH = 520;
const HEIGHT = 92;
const AXIS_Y = 50;
const MARGIN = 26;

/** Le pas de graduation « rond » le plus proche pour cette portée. */
function tickStepFor(span) {
  const rough = span / 10;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const nice = normalized >= 5 ? 5 : (normalized >= 2 ? 2 : 1);

  return nice * magnitude;
}

export default function NumberLine({ solution, relation, view, onChangeView }) {
  const { t } = useTranslation('mathlab');
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  const { center, span } = view;
  const min = center - span / 2;
  const max = center + span / 2;
  const toX = useCallback((value) => MARGIN + ((value - min) / (max - min)) * (WIDTH - MARGIN * 2), [min, max]);

  const value = solution ? R.toNumber(solution) : null;
  const included = relation === '<=' || relation === '>=';
  const pointsLeft = relation === '<' || relation === '<=';

  const zoom = useCallback((factor) => {
    const next = Math.max(NUMBER_LINE_MIN_SPAN, Math.min(NUMBER_LINE_MAX_SPAN, span * factor));
    if (next !== span) onChangeView({ center, span: next });
  }, [center, span, onChangeView]);

  const recenter = useCallback(() => {
    onChangeView({ center: value === null ? 0 : Math.round(value), span: 10 });
  }, [onChangeView, value]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.15 : 1 / 1.15);
  }, [zoom]);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { x: event.clientX, center, unitsPerPixel: span / (rect.width || WIDTH) };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [center, span]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const moved = (event.clientX - drag.x) * drag.unitsPerPixel;
    onChangeView({ center: drag.center - moved, span });
  }, [onChangeView, span]);

  const endDrag = useCallback((event) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleKeyDown = useCallback((event) => {
    const stepBy = span / 10;
    if (event.key === 'ArrowLeft') { onChangeView({ center: center - stepBy, span }); event.preventDefault(); }
    else if (event.key === 'ArrowRight') { onChangeView({ center: center + stepBy, span }); event.preventDefault(); }
    else if (event.key === '+' || event.key === '=') { zoom(1 / 1.3); event.preventDefault(); }
    else if (event.key === '-' || event.key === '_') { zoom(1.3); event.preventDefault(); }
    else if (event.key === '0') { recenter(); event.preventDefault(); }
  }, [center, span, onChangeView, zoom, recenter]);

  const step = tickStepFor(span);
  const ticks = [];
  const first = Math.ceil(min / step) * step;
  for (let tick = first; tick <= max + step * 0.001 && ticks.length < 60; tick += step) {
    const rounded = Math.abs(tick) < step * 1e-6 ? 0 : tick;
    ticks.push(rounded);
  }

  const solutionX = value === null ? null : toX(value);
  const visible = solutionX !== null && value >= min && value <= max;
  const rayStart = solutionX === null ? null : Math.max(MARGIN, Math.min(WIDTH - MARGIN, solutionX));

  const description = value === null
    ? t('tools.algebra.numberLineEmpty')
    : t('tools.algebra.numberLineValue', { value: R.toPlainText(solution) });

  return (
    <div className="sa-ml-alg__numberline">
      <div className="sa-ml-alg__numberline-head">
        <span className="sa-ml-alg__numberline-title">{t('tools.algebra.numberLineHeading')}</span>
        <div className="sa-ml-alg__numberline-actions">
          <button type="button" className="sa-ml-alg__mini" onClick={() => zoom(1 / 1.3)} aria-label={t('tools.algebra.zoomIn')}>+</button>
          <button type="button" className="sa-ml-alg__mini" onClick={() => zoom(1.3)} aria-label={t('tools.algebra.zoomOut')}>−</button>
          <button type="button" className="sa-ml-alg__mini" onClick={recenter} aria-label={t('tools.algebra.recenter')}>⌖</button>
        </div>
      </div>
      <svg
        ref={svgRef}
        className="sa-ml-alg__numberline-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={description}
        tabIndex={0}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1={MARGIN} y1={AXIS_Y} x2={WIDTH - MARGIN} y2={AXIS_Y} stroke="#94a3b8" strokeWidth="2" />
        {/* Les pointes : la droite continue au-delà du cadre */}
        <path d={`M ${MARGIN - 8} ${AXIS_Y} l 8 -5 l 0 10 Z`} fill="#94a3b8" />
        <path d={`M ${WIDTH - MARGIN + 8} ${AXIS_Y} l -8 -5 l 0 10 Z`} fill="#94a3b8" />

        {ticks.map((tick) => {
          const x = toX(tick);
          const isZero = tick === 0;

          return (
            <g key={tick}>
              <line x1={x} y1={AXIS_Y - (isZero ? 9 : 5)} x2={x} y2={AXIS_Y + (isZero ? 9 : 5)} stroke={isZero ? '#475569' : '#cbd5e1'} strokeWidth={isZero ? 2 : 1.5} />
              <text x={x} y={AXIS_Y + 24} textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="'Inter', sans-serif">
                {formatAxisLabel(tick)}
              </text>
            </g>
          );
        })}

        {visible && (
          <g className="sa-ml-alg__numberline-solution">
            {/* Le rayon des solutions */}
            <line
              x1={rayStart}
              y1={AXIS_Y}
              x2={pointsLeft ? MARGIN : WIDTH - MARGIN}
              y2={AXIS_Y}
              stroke="#7c3aed"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d={pointsLeft
                ? `M ${MARGIN - 2} ${AXIS_Y} l 11 -7 l 0 14 Z`
                : `M ${WIDTH - MARGIN + 2} ${AXIS_Y} l -11 -7 l 0 14 Z`}
              fill="#7c3aed"
            />
            {/* La borne : vide si exclue, pleine si incluse */}
            <circle
              cx={solutionX}
              cy={AXIS_Y}
              r="7.5"
              fill={included ? '#7c3aed' : '#ffffff'}
              stroke="#7c3aed"
              strokeWidth="3"
            />
            <text x={solutionX} y={AXIS_Y - 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#6d28d9" fontFamily="'JetBrains Mono', 'Inter', sans-serif">
              {R.toPlainText(solution)}
            </text>
          </g>
        )}
      </svg>
      <p className="sa-ml-alg__numberline-hint">{t('tools.algebra.numberLineHint')}</p>
    </div>
  );
}
