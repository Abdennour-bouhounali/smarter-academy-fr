import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mafs, Coordinates, useTransformContext, vec } from 'mafs';
import 'mafs/core.css';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import {
  fitViewportToAspect, resizeViewport, zoomViewport, pixelToMath,
} from '../functionGrapher/viewport.js';
import { gridStepFor } from '../functionGrapher/gridStep.js';
import { formatAxisLabel } from '../functionGrapher/grapherFormat.js';
import { useViewportGestures, ZOOM_STEP } from '../functionGrapher/useViewportGestures.js';
import { DEFAULT_CONICS_VIEWPORT } from './conicState.js';

/** Après un geste, la fenêtre est remise au document une fois le calme revenu. */
const REPORT_VIEW_MS = 400;

/**
 * LE PLAN du مختبر المقاطع المخروطية (§4).
 *
 * Il ne crée PAS un cinquième repère : la caméra (viewport.js), le pas de
 * grille (gridStep.js), les gestes (useViewportGestures.js) et le format des
 * étiquettes (grapherFormat.js) sont les modules du grapheur, importés tels
 * quels — une seule implémentation du plan sur la plateforme, un seul zoom,
 * un seul pincement, une seule graduation. C'est la décision déjà prise par
 * le مختبر الأشعة (MATH_LAB §5f.2) et le مختبر التحويلات (§5j), et §1 du
 * cahier des charges la réclame explicitement : « ne pas créer de système de
 * coordonnées en double ».
 *
 * Le plan est `dir="ltr"` — c'est des mathématiques (§48) : l'axe des
 * abscisses croît vers la DROITE même quand l'interface est en arabe. Seuls
 * les panneaux suivent la direction de la page.
 *
 * Les enfants sont rendus dans le SVG de mafs via `children` : le plan ne
 * sait rien des coniques, il sait dessiner un repère et écouter des gestes.
 */
const ConicPlane = forwardRef(function ConicPlane({
  initialViewport, grid = true, onViewportChange, onTap, canvasLabel = null,
  defaultViewport = DEFAULT_CONICS_VIEWPORT, children,
}, ref) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
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

  const handleTap = useCallback(([x, y]) => {
    onTap?.([x, y]);
  }, [onTap]);

  useViewportGestures(hostRef, {
    getView: () => viewRef.current ?? defaultViewport,
    getSize: () => sizeRef.current,
    setView: applyGesture,
    onTap: handleTap,
    onReset: resetView,
  });

  /**
   * CADRER un ensemble de points : la fenêtre s'ouvre sur eux (§4).
   *
   * Sans cela, une conique posée d'un bloc — une équation saisie, une
   * question d'entraînement, un lieu — se retrouve hors de la fenêtre
   * enregistrée, et l'élève voit un plan vide. On ne fait pourtant PAS un
   * cadrage automatique permanent : la fenêtre appartient à l'élève dès
   * qu'il l'a touchée, et seule une scène entièrement remplacée la reprend.
   *
   * Contrairement au مختبر التحويلات, l'origine n'est PAS forcée dans le
   * cadre : une conique de centre (40, 40) se comprend parfaitement sans
   * l'origine, et l'y inclure la réduirait à un point.
   */
  const frame = useCallback((points) => {
    const finite = (Array.isArray(points) ? points : []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
    const { width, height } = sizeRef.current;
    if (finite.length === 0 || !(width > 0)) {
      resetView();

      return;
    }
    const xs = finite.map((p) => p.x);
    const ys = finite.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const padX = Math.max((xMax - xMin) * 0.25, 1);
    const padY = Math.max((yMax - yMin) * 0.25, 1);
    const cx = (xMin + xMax) / 2;
    const cy = (yMin + yMax) / 2;
    const halfX = Math.max((xMax - xMin) / 2 + padX, 2);
    const halfY = Math.max((yMax - yMin) / 2 + padY, 1.5);

    applyGesture(() => fitViewportToAspect(
      { xMin: cx - halfX, xMax: cx + halfX, yMin: cy - halfY, yMax: cy + halfY },
      width,
      height,
    ));
  }, [applyGesture, resetView]);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => hostRef.current?.querySelector('svg') ?? null,
    getView: () => viewRef.current,
    getSize: () => sizeRef.current,
    resetView,
    frame,
    /** Pixels de l'écran → coordonnées du plan : ce dont un glissement a besoin. */
    toMath: (clientX, clientY) => {
      const host = hostRef.current;
      const current = viewRef.current;
      const { width, height } = sizeRef.current;
      if (!host || !current || !(width > 0)) return null;
      const rect = host.getBoundingClientRect();

      return pixelToMath(current, width, height, clientX - rect.left, clientY - rect.top);
    },
  }), [resetView, frame]);

  const pixelsPerUnit = view && size.width > 0 ? size.width / (view.xMax - view.xMin) : 60;
  const { step, subdivisions } = useMemo(() => gridStepFor(pixelsPerUnit), [pixelsPerUnit]);

  return (
    <div
      ref={hostRef}
      className={`sa-ml-cn__plane ${grid ? '' : 'sa-ml-cn__plane--nogrid'}`}
      tabIndex={0}
      role="application"
      aria-label={canvasLabel ?? t('tools.conics.canvasLabel')}
      dir="ltr"
      data-ml-plane
      data-ml-cn-plane
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
          {grid && (
            <Coordinates.Cartesian
              xAxis={{ lines: step, labels: formatAxisLabel }}
              yAxis={{ lines: step, labels: formatAxisLabel }}
              subdivisions={subdivisions}
            />
          )}
          {!grid && (
            <Coordinates.Cartesian
              xAxis={{ lines: false, labels: formatAxisLabel }}
              yAxis={{ lines: false, labels: formatAxisLabel }}
              subdivisions={false}
            />
          )}
          <AxisNames view={view} />
          {typeof children === 'function'
            ? children({ view, size: { width: size.width, height: size.height }, step, pixelsPerUnit })
            : children}
        </Mafs>
      )}

      <div className="sa-ml-cn__zoom" role="group" aria-label={t('tools.conics.viewControls')}>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-cn__zoombtn" onClick={() => zoomBy(ZOOM_STEP)} aria-label={t('tools.conics.zoomIn')} title={t('tools.conics.zoomIn')} data-ml-zoom-in>
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-cn__zoombtn" onClick={() => zoomBy(1 / ZOOM_STEP)} aria-label={t('tools.conics.zoomOut')} title={t('tools.conics.zoomOut')} data-ml-zoom-out>
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-cn__zoombtn" onClick={resetView} aria-label={t('tools.conics.resetView')} title={t('tools.conics.resetView')} data-ml-zoom-reset>
          <Maximize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default ConicPlane;

/** « x », « y » au bout des axes, « O » à l'origine — la convention du manuel. */
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
    <g className="sa-ml-cn__axisnames mafs-shadow" fontStyle="italic">
      <text x={xEndPx - 8} y={onXAxis ? xAxisPy - 8 : xAxisPy + (view.yMax <= 0 ? -8 : 18)} textAnchor="end">x</text>
      <text x={onYAxis || view.xMax <= 0 ? yAxisPx - 8 : yAxisPx + 8} y={yEndPy + 16} textAnchor={onYAxis || view.xMax <= 0 ? 'end' : 'start'}>y</text>
      {originVisible && <text x={originPx - 6} y={originPy + 16} textAnchor="end">O</text>}
    </g>
  );
}
