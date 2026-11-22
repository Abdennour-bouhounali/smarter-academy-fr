import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mafs, Coordinates, Line, MovablePoint, Text, useTransformContext, vec } from 'mafs';
import 'mafs/core.css';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { DEFAULT_VIEWPORT, fitViewportToAspect, resizeViewport, zoomViewport, pixelToMath, mathToPixel } from './viewport.js';
import { gridStepFor } from './gridStep.js';
import { formatAxisLabel, formatValue, decimalsFor } from './grapherFormat.js';
import { useViewportGestures, ZOOM_STEP } from './useViewportGestures.js';
import FunctionCurve from './FunctionCurve.jsx';

/** Après un geste, la fenêtre est remise au document une fois le calme revenu. */
const REPORT_VIEW_MS = 400;
/** Un tap à moins de cette distance (px) d'une courbe pose un point dessus. */
const SNAP_PX = 40;

/**
 * LE PLAN : mafs pour le dessin (grille, axes, étiquettes, point mobile),
 * notre fenêtre pour la caméra (viewport.js), nos gestes (useViewportGestures),
 * nos courbes (FunctionCurve). Le conteneur mesure sa boîte lui-même : le
 * repère reste orthonormé quelle que soit la taille.
 *
 * Deux affichages sont hors React pendant les mouvements : la lecture des
 * coordonnées du curseur (mise à jour directe du DOM à chaque pointermove)
 * — le reste (grille, courbes, point) suit l'état `view`.
 *
 * Le plan sait accueillir des CONSTRUCTIONS au-dessus des courbes :
 * `renderOverlay({ view, step })` dessine, dans le SVG de mafs, celles d'un
 * mode (tangente, triangle de pente…) ;
 * `defaultViewport` est la fenêtre de « Revenir à la vue de départ » ; `canvasLabel` son nom
 * pour les technologies d'assistance ; `constrainPointX(next, current)` peut
 * refuser un déplacement du point (ne pas traverser un pôle, par exemple).
 */
const CoordinatePlane = forwardRef(function CoordinatePlane({
  functions, compiledById, point, initialViewport, grid, onViewportChange, onTap, onMovePoint,
  renderOverlay = null, defaultViewport = DEFAULT_VIEWPORT, canvasLabel = null, constrainPointX = null,
}, ref) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const readoutRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setViewState] = useState(null);
  const viewRef = useRef(null);
  const sizeRef = useRef(size);
  const reportTimer = useRef(null);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  sizeRef.current = size;
  viewRef.current = view;

  // ── La boîte ────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      const rect = host.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setSize((current) => (current.width === next.width && current.height === next.height ? current : next));
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(host);

    return () => observer?.disconnect();
  }, []);

  // ── La fenêtre : ajustée à la boîte à l'ouverture, conservée en x ensuite ──
  useLayoutEffect(() => {
    if (!(size.width > 0 && size.height > 0)) return;
    setViewState((current) => (current
      ? resizeViewport(current, size.width, size.height)
      : fitViewportToAspect(initialViewport ?? defaultViewport, size.width, size.height)));
    // initialViewport et defaultViewport ne comptent qu'à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  /** Un changement VOULU par l'élève : appliqué tout de suite, remis au document après le calme. */
  const applyGesture = useCallback((updater) => {
    setViewState((current) => {
      if (!current) return current;
      const next = updater(current);
      viewRef.current = next;

      return next;
    });
    clearTimeout(reportTimer.current);
    reportTimer.current = setTimeout(() => {
      if (viewRef.current) onViewportChangeRef.current?.(viewRef.current);
    }, REPORT_VIEW_MS);
  }, []);

  useEffect(() => () => clearTimeout(reportTimer.current), []);

  const resetView = useCallback(() => {
    const { width, height } = sizeRef.current;
    applyGesture(() => fitViewportToAspect(defaultViewport, width, height));
  }, [applyGesture, defaultViewport]);

  const zoomBy = useCallback((factor) => applyGesture((v) => zoomViewport(v, factor)), [applyGesture]);

  // ── Le tap : quelle courbe est sous le doigt ? ─────────────────────────
  const handleTap = useCallback(([x, y], [, py]) => {
    const current = viewRef.current;
    const { width, height } = sizeRef.current;
    if (!current || !onTap) return;
    let best = null;
    for (const fn of functions) {
      if (!fn.visible) continue;
      const compiled = compiledById.get(fn.id);
      if (!compiled?.ok) continue;
      if (fn.domain && ((Number.isFinite(fn.domain.min) && x < fn.domain.min) || (Number.isFinite(fn.domain.max) && x > fn.domain.max))) continue;
      const value = compiled.fn(x);
      if (!Number.isFinite(value)) continue;
      const [, fyPx] = mathToPixel(current, width, height, x, value);
      const distance = Math.abs(fyPx - py);
      if (distance <= SNAP_PX && (!best || distance < best.distance)) best = { fn, distance };
    }
    onTap(best ? { functionId: best.fn.id, x } : null, [x, y]);
  }, [functions, compiledById, onTap]);

  useViewportGestures(hostRef, {
    getView: () => viewRef.current ?? defaultViewport,
    getSize: () => sizeRef.current,
    setView: applyGesture,
    onTap: handleTap,
    onReset: resetView,
  });

  // ── La lecture du curseur, hors React ──────────────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    const readout = readoutRef.current;
    if (!host || !readout) return undefined;
    const move = (event) => {
      const current = viewRef.current;
      const { width, height } = sizeRef.current;
      if (!current || !(width > 0)) return;
      const rect = host.getBoundingClientRect();
      const [x, y] = pixelToMath(current, width, height, event.clientX - rect.left, event.clientY - rect.top);
      const decimals = decimalsFor((current.xMax - current.xMin) / width);
      readout.textContent = `x = ${formatValue(x, decimals)}   y = ${formatValue(y, decimals)}`;
      readout.dataset.visible = 'true';
    };
    const leave = () => { readout.dataset.visible = 'false'; };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('pointercancel', leave);

    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('pointercancel', leave);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => hostRef.current?.querySelector('svg') ?? null,
    getView: () => viewRef.current,
    resetView,
  }), [resetView]);

  const pixelsPerUnit = view && size.width > 0 ? size.width / (view.xMax - view.xMin) : 60;
  const { step, subdivisions } = useMemo(() => gridStepFor(pixelsPerUnit), [pixelsPerUnit]);
  const pointFn = point ? functions.find((f) => f.id === point.functionId) : null;
  const pointCompiled = pointFn ? compiledById.get(pointFn.id) : null;

  return (
    <div
      ref={hostRef}
      className={`sa-ml-grapher__plane ${grid ? '' : 'sa-ml-grapher__plane--nogrid'}`}
      tabIndex={0}
      role="application"
      aria-label={canvasLabel ?? t('tools.functionGrapher.canvasLabel')}
      dir="ltr"
      data-ml-plane
      data-ml-step={step}
      data-ml-view={view ? [view.xMin, view.xMax, view.yMin, view.yMax].map((v) => v.toFixed(4)).join(',') : ''}
    >
      {view && size.width > 0 && size.height > 0 && (
        <Mafs
          width={size.width}
          height={size.height}
          pan={false}
          zoom={false}
          preserveAspectRatio={false}
          viewBox={{ x: [view.xMin, view.xMax], y: [view.yMin, view.yMax], padding: 0 }}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: step, labels: formatAxisLabel }}
            yAxis={{ lines: step, labels: formatAxisLabel }}
            subdivisions={subdivisions}
          />
          <AxisNames view={view} />
          {functions.map((fn) => {
            const compiled = compiledById.get(fn.id);
            if (!fn.visible || !compiled?.ok) return null;

            return <FunctionCurve key={fn.id} fn={compiled.fn} color={fn.color} view={view} width={size.width} domain={fn.domain} name={fn.name} />;
          })}
          {renderOverlay?.({ view, step })}
          {point && pointFn?.visible && pointCompiled?.ok && (
            <InspectionPoint point={point} fn={pointFn} compiled={pointCompiled} onMove={onMovePoint} constrainX={constrainPointX} />
          )}
        </Mafs>
      )}

      <div ref={readoutRef} className="sa-ml-grapher__readout" aria-hidden="true" data-visible="false" data-ml-readout />

      <div className="sa-ml-grapher__zoom" role="group" aria-label={t('tools.functionGrapher.viewControls')}>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__zoombtn" onClick={() => zoomBy(ZOOM_STEP)} aria-label={t('tools.functionGrapher.zoomIn')} title={t('tools.functionGrapher.zoomIn')} data-ml-zoom-in>
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__zoombtn" onClick={() => zoomBy(1 / ZOOM_STEP)} aria-label={t('tools.functionGrapher.zoomOut')} title={t('tools.functionGrapher.zoomOut')} data-ml-zoom-out>
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-grapher__zoombtn" onClick={resetView} aria-label={t('tools.functionGrapher.resetView')} title={t('tools.functionGrapher.resetView')} data-ml-zoom-reset>
          <Maximize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default CoordinatePlane;

/** « x », « y » au bout des axes visibles, « O » à l'origine — la convention du manuel. */
function AxisNames({ view }) {
  const { viewTransform } = useTransformContext();
  const clampX = (x) => Math.min(view.xMax, Math.max(view.xMin, x));
  const clampY = (y) => Math.min(view.yMax, Math.max(view.yMin, y));
  const [xEndPx, xAxisPy] = vec.transform([view.xMax, clampY(0)], viewTransform);
  const [yAxisPx, yEndPy] = vec.transform([clampX(0), view.yMax], viewTransform);
  const [originPx, originPy] = vec.transform([0, 0], viewTransform);
  const originVisible = view.xMin < 0 && view.xMax > 0 && view.yMin < 0 && view.yMax > 0;
  const onXAxis = view.yMin < 0 && view.yMax > 0;
  const onYAxis = view.xMin < 0 && view.xMax > 0;

  return (
    <g className="sa-ml-grapher__axisnames mafs-shadow" fontStyle="italic">
      <text x={xEndPx - 8} y={onXAxis ? xAxisPy - 8 : xAxisPy + (view.yMax <= 0 ? -8 : 18)} textAnchor="end">x</text>
      <text x={onYAxis || view.xMax <= 0 ? yAxisPx - 8 : yAxisPx + 8} y={yEndPy + 16} textAnchor={onYAxis || view.xMax <= 0 ? 'end' : 'start'}>y</text>
      {originVisible && <text x={originPx - 6} y={originPy + 16} textAnchor="end">O</text>}
    </g>
  );
}

/** Le point A sur la courbe : glissable le long de f (le doigt ne quitte jamais la courbe), avec ses deux pointillés vers les axes. */
function InspectionPoint({ point, fn, compiled, onMove, constrainX }) {
  const y = compiled.fn(point.x);
  if (!Number.isFinite(y)) return null;
  // Le doigt ne quitte jamais la courbe : on ne retient que l'abscisse, et
  // seulement si f y existe (et si l'instrument n'y oppose pas sa règle).
  const constrain = ([nx]) => {
    let x = nx;
    if (fn.domain) {
      if (Number.isFinite(fn.domain.min)) x = Math.max(fn.domain.min, x);
      if (Number.isFinite(fn.domain.max)) x = Math.min(fn.domain.max, x);
    }
    if (constrainX) x = constrainX(x, point.x);
    const ny = compiled.fn(x);

    return Number.isFinite(ny) ? [x, ny] : [point.x, y];
  };

  return (
    <>
      <Line.Segment point1={[point.x, 0]} point2={[point.x, y]} color={fn.color} style="dashed" weight={1.5} opacity={0.7} />
      <Line.Segment point1={[0, y]} point2={[point.x, y]} color={fn.color} style="dashed" weight={1.5} opacity={0.7} />
      <MovablePoint point={[point.x, y]} color={fn.color} constrain={constrain} onMove={([nx]) => onMove(nx)} />
      <Text x={point.x} y={y} attach="ne" attachDistance={14} size={15} color={fn.color}>{point.name}</Text>
    </>
  );
}
