import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import {
  valueToX, xToValue, viewBounds, ticksFor, snapValue,
} from './numberValue.js';
import { formatNumber } from './numberValue.js';
import { fracToText } from './fraction.js';

/**
 * LE MISTÉCIM MDARRAJ — la droite graduée du مختبر (§7, §43, §44).
 *
 * C'est le dessin le plus réutilisé du laboratoire : la comparaison (§45),
 * l'arrondi (§32), l'erreur (§34), les opérations (§36, §37) et les négatifs
 * (§40) s'appuient tous dessus. Il est donc GÉNÉRIQUE — il reçoit des
 * marqueurs et des bandes, et ne sait rien du mode qui l'affiche.
 *
 * ── Ce que le doigt fait ────────────────────────────────────────────────
 * On attrape un point et on le déplace ; la valeur se lit en direct. Le
 * geste utilise `setPointerCapture` (souris, doigt et stylet d'un coup) et
 * `touch-action: none` en CSS, sinon le doigt ferait défiler la page au lieu
 * de manipuler — le piège que le contrat des manipulations nomme.
 *
 * ── LTR par nature ──────────────────────────────────────────────────────
 * Le SVG est en `direction: ltr` : les négatifs sont à GAUCHE, comme dans
 * tous les manuels, même sur une page arabe (§58, ARABIC_RTL_CONTRACT §4).
 * SVG n'hérite pas de `dir`, donc c'est une règle qu'on tient explicitement.
 */

const HEIGHT = 132;
const MARGIN = 34;

export default function NumberLineStage({
  view,
  onChangeView = null,
  points = [],
  onDragPoint = null,
  ticksTarget = 10,
  subdivisions = null,
  snapTo = null,
  bands = [],
  marks = [],
  brackets = [],
  height = HEIGHT,
  label = null,
  compact = false,
}) {
  const { t } = useTranslation('mathlab');
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const [width, setWidth] = useState(640);
  const [activePoint, setActivePoint] = useState(null);

  // La largeur RÉELLE : le dessin doit remplir ce qu'on lui donne, sur
  // téléphone comme sur vidéoprojecteur.
  useEffect(() => {
    const node = svgRef.current?.parentElement;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect?.width;
      if (next && Math.abs(next - width) > 1) setWidth(next);
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [width]);

  const bounds = viewBounds(view);
  const axisY = Math.round(height * 0.56);
  const toX = useCallback((value) => valueToX(value, view, width, MARGIN), [view, width]);
  const fromX = useCallback((x) => xToValue(x, view, width, MARGIN), [view, width]);

  const { step, ticks } = useMemo(
    () => ticksFor(view, { target: compact ? 6 : ticksTarget }),
    [view, ticksTarget, compact],
  );

  /** Les sous-graduations : ce qui rend `1/3` atteignable au doigt (§7). */
  const minorTicks = useMemo(() => {
    if (!subdivisions || subdivisions < 2) return [];
    const out = [];
    const minor = step / subdivisions;
    const first = Math.ceil(bounds.min / minor) * minor;
    for (let tick = first; tick <= bounds.max && out.length < 400; tick += minor) out.push(tick);

    return out;
  }, [subdivisions, step, bounds.min, bounds.max]);

  const zoom = useCallback((factor) => {
    if (!onChangeView) return;
    const span = Math.max(0.001, Math.min(1e6, bounds.span * factor));
    onChangeView({ center: bounds.center, span });
  }, [onChangeView, bounds.center, bounds.span]);

  const recenter = useCallback(() => {
    if (!onChangeView) return;
    const values = points.map((p) => p.value).filter(Number.isFinite);
    if (values.length === 0) { onChangeView({ center: 0, span: 10 }); return; }
    const low = Math.min(...values, 0);
    const high = Math.max(...values, 0);
    const span = Math.max(1, (high - low) * 1.6);
    onChangeView({ center: (low + high) / 2, span });
  }, [onChangeView, points]);

  /* ── Le glissé d'un point ─────────────────────────────────────────── */

  const pointerValue = useCallback((event) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = ((event.clientX - rect.left) / rect.width) * width;

    return fromX(x);
  }, [fromX, width]);

  const handlePointerDown = useCallback((event, index) => {
    if (!onDragPoint) return;
    event.stopPropagation();
    event.preventDefault();
    dragRef.current = { index };
    setActivePoint(index);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [onDragPoint]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || !onDragPoint) return;
    const raw = pointerValue(event);
    if (raw === null) return;
    const value = snapTo ? snapValue(raw, snapTo) : raw;
    onDragPoint(drag.index, value);
  }, [onDragPoint, pointerValue, snapTo]);

  const endDrag = useCallback((event) => {
    dragRef.current = null;
    setActivePoint(null);
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
  }, []);

  /**
   * Le clavier déplace le point : §59 veut une poignée pilotable au clavier.
   *
   * ── Le pas suit la GRILLE D'ACCROCHAGE quand il y en a une ─────────────
   * Sinon la flèche ne fait rien : un pas plus petit que la grille est
   * ramené à sa valeur de départ par `snapValue`, et l'élève au clavier voit
   * un point immobile. Le pas est donc `1/snapDenominator` — exactement ce
   * qui sépare deux positions atteignables.
   */
  const handleKeyDown = useCallback((event, index, value) => {
    if (!onDragPoint) return;
    const fine = event.shiftKey ? 10 : 1;
    const snapDenominator = snapTo?.snapDenominator;
    const unit = Number.isFinite(snapDenominator) && snapDenominator > 0
      ? 1 / snapDenominator
      : (subdivisions ? step / subdivisions : step / 10);
    let next = null;
    if (event.key === 'ArrowLeft') next = value - unit * fine;
    else if (event.key === 'ArrowRight') next = value + unit * fine;
    else if (event.key === 'Home') next = bounds.min;
    else if (event.key === 'End') next = bounds.max;
    if (next === null) return;
    event.preventDefault();
    onDragPoint(index, snapTo ? snapValue(next, snapTo) : next);
  }, [onDragPoint, step, subdivisions, snapTo, bounds.min, bounds.max]);

  /* ── Le déplacement de la fenêtre ─────────────────────────────────── */

  const panRef = useRef(null);

  const handleBackgroundDown = useCallback((event) => {
    if (!onChangeView || dragRef.current) return;
    panRef.current = { x: event.clientX, center: bounds.center };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [onChangeView, bounds.center]);

  const handleBackgroundMove = useCallback((event) => {
    const pan = panRef.current;
    if (!pan || !onChangeView) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const moved = ((event.clientX - pan.x) / rect.width) * bounds.span;
    onChangeView({ center: pan.center - moved, span: bounds.span });
  }, [onChangeView, bounds.span]);

  const endPan = useCallback((event) => {
    panRef.current = null;
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
  }, []);

  const handleWheel = useCallback((event) => {
    if (!onChangeView) return;
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.15 : 1 / 1.15);
  }, [onChangeView, zoom]);

  const axisLabel = label ?? t('tools.numberLab.line.canvasLabel', {
    min: formatNumber(bounds.min, 3),
    max: formatNumber(bounds.max, 3),
    count: points.length,
  });

  return (
    <div className="sa-ml-nb__line">
      {onChangeView && (
        <div className="sa-ml-nb__line-actions">
          <button type="button" className="sa-ml-nb__mini" onClick={() => zoom(1 / 1.3)} aria-label={t('tools.numberLab.line.zoomIn')}>
            <ZoomIn size={15} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ml-nb__mini" onClick={() => zoom(1.3)} aria-label={t('tools.numberLab.line.zoomOut')}>
            <ZoomOut size={15} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ml-nb__mini" onClick={recenter} aria-label={t('tools.numberLab.line.recenter')}>
            <Crosshair size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="sa-ml-nb__line-svg"
        data-ml-nb-line
        data-ml-nb-view={`${bounds.min},${bounds.max},${MARGIN},${width}`}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={axisLabel}
        onWheel={handleWheel}
        onPointerDown={handleBackgroundDown}
        onPointerMove={(event) => { handleBackgroundMove(event); handlePointerMove(event); }}
        onPointerUp={(event) => { endPan(event); endDrag(event); }}
        onPointerCancel={(event) => { endPan(event); endDrag(event); }}
      >
        {/* Les bandes : un intervalle mis en évidence (arrondi, erreur, solution). */}
        {bands.map((band, index) => {
          const x1 = toX(band.from);
          const x2 = toX(band.to);

          return (
            <rect
              key={`band-${index}`}
              x={Math.min(x1, x2)}
              y={axisY - (band.height ?? 26)}
              width={Math.abs(x2 - x1)}
              height={(band.height ?? 26) * 2}
              className={`sa-ml-nb__band sa-ml-nb__band--${band.tone ?? 'neutral'}`}
            />
          );
        })}

        {/* Les sous-graduations, puis les graduations principales. */}
        {minorTicks.map((tick, index) => (
          <line
            key={`minor-${index}`}
            x1={toX(tick)} x2={toX(tick)}
            y1={axisY - 5} y2={axisY + 5}
            className="sa-ml-nb__tick sa-ml-nb__tick--minor"
          />
        ))}

        <line x1={MARGIN} x2={width - MARGIN} y1={axisY} y2={axisY} className="sa-ml-nb__axis" />
        {/* La flèche : la droite continue au-delà de ce qu'on voit. */}
        <path d={`M ${width - MARGIN} ${axisY} l -9 -5 v 10 z`} className="sa-ml-nb__arrow" />
        <path d={`M ${MARGIN} ${axisY} l 9 -5 v 10 z`} className="sa-ml-nb__arrow" />

        {ticks.map((tick) => {
          const x = toX(tick);
          const isZero = tick === 0;

          return (
            <g key={`tick-${tick}`}>
              <line
                x1={x} x2={x}
                y1={axisY - (isZero ? 12 : 8)} y2={axisY + (isZero ? 12 : 8)}
                className={`sa-ml-nb__tick${isZero ? ' sa-ml-nb__tick--zero' : ''}`}
              />
              <text x={x} y={axisY + 26} className="sa-ml-nb__tick-label" textAnchor="middle">
                {formatNumber(tick, 6)}
              </text>
            </g>
          );
        })}

        {/* Les repères nommés : le milieu d'un arrondi, une valeur exacte. */}
        {marks.map((mark, index) => {
          const x = toX(mark.value);
          if (x < MARGIN - 20 || x > width - MARGIN + 20) return null;

          return (
            <g key={`mark-${index}`} className={`sa-ml-nb__mark sa-ml-nb__mark--${mark.tone ?? 'neutral'}`}>
              <line x1={x} x2={x} y1={axisY - 30} y2={axisY + 14} className="sa-ml-nb__mark-line" />
              {mark.label && (
                <text x={x} y={axisY - 36} className="sa-ml-nb__mark-label" textAnchor="middle">{mark.label}</text>
              )}
            </g>
          );
        })}

        {/* Les accolades : une distance mesurée entre deux valeurs (§45). */}
        {brackets.map((bracket, index) => {
          const x1 = toX(bracket.from);
          const x2 = toX(bracket.to);
          const y = axisY - (bracket.offset ?? 44);

          return (
            <g key={`bracket-${index}`} className="sa-ml-nb__bracket">
              <path d={`M ${x1} ${y + 7} V ${y} H ${x2} V ${y + 7}`} className="sa-ml-nb__bracket-path" />
              {bracket.label && (
                <text x={(x1 + x2) / 2} y={y - 6} className="sa-ml-nb__bracket-label" textAnchor="middle">
                  {bracket.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Les points : ce qu'on attrape. */}
        {points.map((point, index) => {
          const x = toX(point.value);
          const visible = x >= MARGIN - 14 && x <= width - MARGIN + 14;
          const draggable = Boolean(onDragPoint) && point.draggable !== false;
          const text = point.label ?? (point.frac ? fracToText(point.frac) : formatNumber(point.value, 4));

          return (
            <g
              key={`point-${point.id ?? index}`}
              data-ml-nb-point={index}
              className={`sa-ml-nb__point sa-ml-nb__point--${point.tone ?? (index === 0 ? 'primary' : 'secondary')}${activePoint === index ? ' is-active' : ''}${visible ? '' : ' is-offscreen'}`}
            >
              <line x1={x} x2={x} y1={axisY} y2={axisY - 30} className="sa-ml-nb__point-stem" />
              <circle
                cx={x}
                cy={axisY}
                r={draggable ? 11 : 7}
                className="sa-ml-nb__point-dot"
                role={draggable ? 'slider' : undefined}
                tabIndex={draggable ? 0 : undefined}
                aria-label={draggable ? t('tools.numberLab.line.pointHandle', { index: index + 1 }) : undefined}
                aria-valuenow={draggable ? Number(point.value.toFixed(4)) : undefined}
                aria-valuemin={draggable ? Number(bounds.min.toFixed(4)) : undefined}
                aria-valuemax={draggable ? Number(bounds.max.toFixed(4)) : undefined}
                aria-valuetext={draggable ? text : undefined}
                onPointerDown={draggable ? (event) => handlePointerDown(event, index) : undefined}
                onKeyDown={draggable ? (event) => handleKeyDown(event, index, point.value) : undefined}
              />
              <text x={x} y={axisY - 38} className="sa-ml-nb__point-label" textAnchor="middle">{text}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
