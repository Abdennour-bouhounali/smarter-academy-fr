import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import './geometry3d.css';
import { formatValue } from '../functionGrapher/grapherFormat.js';
import { PARAM_SYMBOLS, dimensionsForShape, normalizeGeometry3DData, sameCamera, clampDimension } from './geometryState.js';
import SolidViewer from './SolidViewer.jsx';
import GeometryPanel from './GeometryPanel.jsx';

/** Le délai entre un changement et sa remise à la coquille (qui attend encore avant d'enregistrer). */
const SERIALIZE_MS = 300;

/**
 * La géométrie dans l'espace (الهندسة ثلاثية الأبعاد) dans la coquille du
 * مختبر (MathLabToolProps — toolContract.js).
 *
 * L'état du document (geometryState.js) vit ICI, en état React : un solide,
 * ses dimensions, trois options, la caméra. Chaque changement de solide ou
 * de dimension redessine tout de suite ; la caméra, qui bouge à haute
 * fréquence pendant un geste, reste dans la scène (solidScene.js) et ne
 * remonte au document qu'une fois le calme revenu. Les calculs
 * (geometryCalculations.js) ne connaissent ni React ni three.js.
 *
 *     choisir un solide → le voir → le tourner, zoomer → changer ses dimensions → lire V et A
 */
export default function Geometry3DTool({ initialData, onChange, onReady }) {
  const { t } = useTranslation('mathlab');
  const [data, setData] = useState(() => normalizeGeometry3DData(initialData));
  const [selectedFace, setSelectedFace] = useState(null);
  // L'invitation « اسحب لتدوير الشكل », jusqu'au premier geste sur la fenêtre.
  const [touched, setTouched] = useState(false);
  const viewerRef = useRef(null);
  const timerRef = useRef(null);
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  dataRef.current = data;

  /** Une modification voulue : appliquée tout de suite, remise à la coquille après SERIALIZE_MS. */
  const commit = useCallback((updater) => {
    setData((current) => {
      const next = updater(current);
      if (next === current) return current;
      dataRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onChangeRef.current?.(dataRef.current);
      }, SERIALIZE_MS);

      return next;
    });
  }, []);

  // Ce qui attendait d'être remis part au démontage.
  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onChangeRef.current?.(dataRef.current);
    }
  }, []);

  // ── Les actions de la coquille : l'image, la grille (synchronisée avec la case du panneau) ──
  useEffect(() => {
    onReady?.({
      exportPng: () => viewerRef.current?.exportPng() ?? Promise.reject(new Error('export')),
      isGridEnabled: () => dataRef.current.showGrid,
      toggleGrid: () => {
        const next = !dataRef.current.showGrid;
        commit((current) => ({ ...current, showGrid: next }));

        return next;
      },
    });

    return () => onReady?.(null);
  }, [onReady, commit, data.showGrid]);

  // ── Le solide et ses dimensions ────────────────────────────────────────
  const changeShape = useCallback((shape) => {
    setSelectedFace(null);
    commit((current) => (current.shape === shape ? current : {
      ...current, shape, dimensions: dimensionsForShape(shape, current.shape, current.dimensions),
    }));
  }, [commit]);

  const changeDimension = useCallback((param, value) => commit((current) => {
    if (!(param in current.dimensions)) return current;
    const next = clampDimension(value, current.dimensions[param]);
    if (next === current.dimensions[param]) return current;

    return { ...current, dimensions: { ...current.dimensions, [param]: next } };
  }), [commit]);

  const toggleOption = useCallback((key) => commit((current) => ({ ...current, [key]: !current[key] })), [commit]);

  const changeCamera = useCallback((camera) => commit((current) => (sameCamera(current.camera, camera) ? current : { ...current, camera })), [commit]);

  const formatLabel = useCallback((param, value) => `${param === 'slant' ? 'l' : PARAM_SYMBOLS[param]} = ${formatValue(value, 2)}`, []);

  const markTouched = useCallback(() => setTouched(true), []);

  return (
    <div className="sa-ml-g3d" role="region" aria-label={t('tools.geometry3d.name')} data-ml-g3d>
      <GeometryPanel
        data={data}
        selectedFace={selectedFace}
        onChangeShape={changeShape}
        onChangeDimension={changeDimension}
        onToggleOption={toggleOption}
      />
      <div className="sa-ml-g3d__stage">
        <SolidViewer
          ref={viewerRef}
          shape={data.shape}
          dimensions={data.dimensions}
          showAxes={data.showAxes}
          showGrid={data.showGrid}
          showMeasurements={data.showMeasurements}
          initialCamera={data.camera}
          selectedFace={selectedFace}
          onCameraChange={changeCamera}
          onInteract={markTouched}
          onSelectFace={setSelectedFace}
          formatLabel={formatLabel}
        />
        <div className="sa-ml-g3d__view" role="group" aria-label={t('tools.geometry3d.viewControls')}>
          <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={() => { markTouched(); viewerRef.current?.zoomIn(); }} aria-label={t('tools.geometry3d.zoomIn')} title={t('tools.geometry3d.zoomIn')} data-ml-g3d-zoom-in>
            <Plus size={18} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={() => { markTouched(); viewerRef.current?.zoomOut(); }} aria-label={t('tools.geometry3d.zoomOut')} title={t('tools.geometry3d.zoomOut')} data-ml-g3d-zoom-out>
            <Minus size={18} aria-hidden="true" />
          </button>
          <button type="button" className="sa-ml-btn sa-ml-btn--icon" onClick={() => { markTouched(); viewerRef.current?.resetCamera(); }} aria-label={t('tools.geometry3d.resetView')} title={t('tools.geometry3d.resetView')} data-ml-g3d-reset>
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
        {!touched && (
          <p className="sa-ml-g3d__draghint" role="status" data-ml-g3d-drag-hint>{t('tools.geometry3d.dragHint')}</p>
        )}
      </div>
    </div>
  );
}
