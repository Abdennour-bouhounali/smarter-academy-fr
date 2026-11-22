import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SolidScene } from './solidScene.js';

/** Un pas de clavier : 12° d'orbite, ×1,25 de zoom — comme les boutons. */
const KEY_ROTATE = (12 * Math.PI) / 180;
const KEY_ZOOM = 1.25;

/**
 * La FENÊTRE 3D : un bloc qui accueille la scène three.js (SolidScene) et la
 * pilote depuis les props. La scène est créée une fois au montage et
 * détruite au démontage ; chaque prop qui change appelle la méthode
 * correspondante — jamais de nouvelle scène pour une nouvelle dimension.
 *
 * Le bloc est focusable (`role="application"`) : les flèches font tourner
 * la vue, + et − zooment, 0 et Début la réinitialisent. Sans WebGL, la scène
 * ne se crée pas et un message le dit ; le panneau reste la représentation
 * complète du solide.
 *
 * `ref` expose { resetCamera, zoomIn, zoomOut, exportPng, focus }.
 */
const SolidViewer = forwardRef(function SolidViewer({
  shape, dimensions, showAxes, showGrid, showMeasurements, initialCamera, selectedFace,
  onCameraChange, onInteract, onSelectFace, formatLabel,
}, ref) {
  const { t } = useTranslation('mathlab');
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const [unsupported, setUnsupported] = useState(false);
  // Les rappels les plus récents, sans recréer la scène quand ils changent.
  const callbacksRef = useRef({});
  callbacksRef.current = { onCameraChange, onInteract, onSelectFace, formatLabel };
  const initialRef = useRef({ shape, dimensions, showAxes, showGrid, showMeasurements, initialCamera, selectedFace });

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let scene;
    try {
      scene = new SolidScene(host, {
        onCameraChange: (camera) => callbacksRef.current.onCameraChange?.(camera),
        onInteract: () => callbacksRef.current.onInteract?.(),
        onSelectFace: (index) => callbacksRef.current.onSelectFace?.(index),
        formatLabel: (param, value) => callbacksRef.current.formatLabel(param, value),
      });
    } catch {
      setUnsupported(true);

      return undefined;
    }
    const first = initialRef.current;
    scene.setSolid(first.shape, first.dimensions);
    scene.setOptions({ axes: first.showAxes, grid: first.showGrid, measurements: first.showMeasurements });
    scene.setCamera(first.initialCamera);
    scene.highlightFace(first.selectedFace);
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => { sceneRef.current?.setSolid(shape, dimensions); }, [shape, dimensions]);
  useEffect(() => { sceneRef.current?.setOptions({ axes: showAxes, grid: showGrid, measurements: showMeasurements }); }, [showAxes, showGrid, showMeasurements]);
  useEffect(() => { sceneRef.current?.highlightFace(selectedFace); }, [selectedFace]);

  useImperativeHandle(ref, () => ({
    resetCamera: () => sceneRef.current?.resetCamera(),
    zoomIn: () => sceneRef.current?.zoomBy(1 / KEY_ZOOM),
    zoomOut: () => sceneRef.current?.zoomBy(KEY_ZOOM),
    exportPng: () => (sceneRef.current ? sceneRef.current.exportPng() : Promise.reject(new Error('export'))),
    focus: () => hostRef.current?.focus(),
  }), []);

  const handleKeyDown = useCallback((event) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const actions = {
      ArrowLeft: () => scene.rotateBy(KEY_ROTATE, 0),
      ArrowRight: () => scene.rotateBy(-KEY_ROTATE, 0),
      ArrowUp: () => scene.rotateBy(0, -KEY_ROTATE),
      ArrowDown: () => scene.rotateBy(0, KEY_ROTATE),
      '+': () => scene.zoomBy(1 / KEY_ZOOM),
      '=': () => scene.zoomBy(1 / KEY_ZOOM),
      '-': () => scene.zoomBy(KEY_ZOOM),
      '−': () => scene.zoomBy(KEY_ZOOM),
      '0': () => scene.resetCamera(),
      Home: () => scene.resetCamera(),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    callbacksRef.current.onInteract?.();
    action();
  }, []);

  return (
    <div
      ref={hostRef}
      className="sa-ml-g3d__host"
      role="application"
      tabIndex={0}
      aria-label={t('tools.geometry3d.canvasLabel')}
      onKeyDown={handleKeyDown}
      data-ml-g3d-host
      data-ml-g3d-shape={shape}
    >
      {unsupported && (
        <p className="sa-ml-g3d__unsupported" role="status" data-ml-g3d-unsupported>{t('tools.geometry3d.unsupported')}</p>
      )}
    </div>
  );
});

export default SolidViewer;
