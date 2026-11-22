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
import { DEFAULT_VECTORS_VIEWPORT } from './vectorState.js';

/** Après un geste, la fenêtre est remise au document une fois le calme revenu. */
const REPORT_VIEW_MS = 400;

/**
 * LE PLAN du مختبر الأشعة.
 *
 * Le cahier des charges (§3) est catégorique : « Do NOT create a second
 * coordinate-system implementation ». Ce composant n'en crée pas. La CAMÉRA
 * (viewport.js), le PAS DE GRILLE (gridStep.js), les GESTES
 * (useViewportGestures.js) et le FORMAT des étiquettes (grapherFormat.js)
 * sont les modules du grapheur, importés tels quels — un seul repère sur la
 * plateforme, un seul zoom, un seul pincement, une seule graduation. Ce qui
 * est propre à cet instrument, et ce qui justifie un composant distinct, est
 * ce qu'on pose DESSUS : des objets glissables, pas des courbes échantillonnées.
 *
 * Le plan est `dir="ltr"` — c'est des mathématiques (§35) : l'axe des
 * abscisses croît vers la DROITE même quand l'interface est en arabe. Seuls
 * les panneaux suivent la direction de la page.
 *
 * Les enfants sont rendus dans le SVG de mafs via `children` : le plan ne
 * sait rien des أشعة, il sait dessiner un repère et écouter des gestes.
 */
const VectorPlane = forwardRef(function VectorPlane({
  initialViewport, grid = true, onViewportChange, onTap, canvasLabel = null,
  defaultViewport = DEFAULT_VECTORS_VIEWPORT, children,
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

  useImperativeHandle(ref, () => ({
    getSvgElement: () => hostRef.current?.querySelector('svg') ?? null,
    getView: () => viewRef.current,
    getSize: () => sizeRef.current,
    resetView,
    /** Pixels de l'écran → coordonnées du plan : ce dont un glissement a besoin. */
    toMath: (clientX, clientY) => {
      const host = hostRef.current;
      const current = viewRef.current;
      const { width, height } = sizeRef.current;
      if (!host || !current || !(width > 0)) return null;
      const rect = host.getBoundingClientRect();

      return pixelToMath(current, width, height, clientX - rect.left, clientY - rect.top);
    },
  }), [resetView]);

  const pixelsPerUnit = view && size.width > 0 ? size.width / (view.xMax - view.xMin) : 60;
  const { step, subdivisions } = useMemo(() => gridStepFor(pixelsPerUnit), [pixelsPerUnit]);

  return (
    <div
      ref={hostRef}
      className={`sa-ml-vec__plane ${grid ? '' : 'sa-ml-vec__plane--nogrid'}`}
      tabIndex={0}
      role="application"
      aria-label={canvasLabel ?? t('tools.vectors.canvasLabel')}
      dir="ltr"
      data-ml-plane
      data-ml-vec-plane
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
          {typeof children === 'function' ? children({ view, size: { width: size.width, height: size.height }, step }) : children}
        </Mafs>
      )}

      <div className="sa-ml-vec__zoom" role="group" aria-label={t('tools.vectors.viewControls')}>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__zoombtn" onClick={() => zoomBy(ZOOM_STEP)} aria-label={t('tools.vectors.zoomIn')} title={t('tools.vectors.zoomIn')} data-ml-zoom-in>
          <ZoomIn size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__zoombtn" onClick={() => zoomBy(1 / ZOOM_STEP)} aria-label={t('tools.vectors.zoomOut')} title={t('tools.vectors.zoomOut')} data-ml-zoom-out>
          <ZoomOut size={18} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-btn sa-ml-btn--icon sa-ml-vec__zoombtn" onClick={resetView} aria-label={t('tools.vectors.resetView')} title={t('tools.vectors.resetView')} data-ml-zoom-reset>
          <Maximize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

export default VectorPlane;

/** « x », « y » au bout des axes, « O » à l'origine — la convention du manuel (reprise du grapheur). */
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
    <g className="sa-ml-vec__axisnames mafs-shadow" fontStyle="italic">
      <text x={xEndPx - 8} y={onXAxis ? xAxisPy - 8 : xAxisPy + (view.yMax <= 0 ? -8 : 18)} textAnchor="end">x</text>
      <text x={onYAxis || view.xMax <= 0 ? yAxisPx - 8 : yAxisPx + 8} y={yEndPy + 16} textAnchor={onYAxis || view.xMax <= 0 ? 'end' : 'start'}>y</text>
      {originVisible && <text x={originPx - 6} y={originPy + 16} textAnchor="end">O</text>}
    </g>
  );
}
