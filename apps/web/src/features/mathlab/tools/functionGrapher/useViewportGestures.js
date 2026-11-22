import { useEffect, useRef } from 'react';
import { panViewport, zoomViewport, pixelToMath } from './viewport.js';

/** Sous ce déplacement (en px), un geste est un CLIC/TAP, pas un glissement. */
const TAP_THRESHOLD_PX = 5;
/** Le zoom d'un cran de clavier ou de bouton. */
export const ZOOM_STEP = 0.8;
/** Le déplacement d'une flèche du clavier : un dixième de la fenêtre. */
const KEY_PAN_FRACTION = 0.1;

/**
 * Les GESTES du plan, sur l'élément conteneur, en événements natifs :
 *   - un doigt / la souris : glisser le plan ; relâcher sans bouger = un tap ;
 *   - deux doigts : pincer pour zoomer (le point pincé reste fixe) et glisser ;
 *   - la molette / le pavé tactile : zoomer autour du curseur ;
 *   - le clavier (le plan a le focus) : flèches, + et −, 0 pour revenir.
 *
 * Aucun état React pendant le geste : la fenêtre est modifiée par
 * `setView(fn)` (une mise à jour fonctionnelle), les pointeurs vivent dans
 * des références. Les points déplaçables de mafs gèrent leur propre glisser :
 * un geste qui commence sur l'un d'eux est ignoré ici.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {{
 *   getView: () => object, getSize: () => {width: number, height: number},
 *   setView: (updater: (view: object) => object) => void,
 *   onTap?: (mathPoint: [number, number], pixel: [number, number]) => void,
 *   onReset?: () => void, enabled?: boolean,
 * }} handlers
 */
export function useViewportGestures(ref, handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const pointers = new Map();
    let mode = null; // 'pan' | 'pinch'
    let last = null; // le dernier point du glisser
    let travelled = 0;
    let pinch = null; // { distance, mid, view }

    const size = () => handlersRef.current.getSize();
    const toMath = (px, py) => {
      const { width, height } = size();

      return pixelToMath(handlersRef.current.getView(), width, height, px, py);
    };
    const local = (event) => {
      const rect = element.getBoundingClientRect();

      return [event.clientX - rect.left, event.clientY - rect.top];
    };
    const unitsPerPixel = () => {
      const view = handlersRef.current.getView();
      const { width, height } = size();

      return [(view.xMax - view.xMin) / width, (view.yMax - view.yMin) / height];
    };

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      // Un bouton du plan, ou un point mobile de mafs : ce geste n'est pas
      // pour nous — et CAPTURER le pointeur volerait le clic au bouton.
      if (event.target instanceof Element && event.target.closest('button, input, .mafs-movable-point')) return;
      element.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, local(event));
      if (pointers.size === 1) {
        mode = 'pan';
        last = local(event);
        travelled = 0;
      } else if (pointers.size === 2) {
        mode = 'pinch';
        const [a, b] = [...pointers.values()];
        pinch = {
          distance: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1,
          mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
          view: handlersRef.current.getView(),
        };
      }
    };

    const onPointerMove = (event) => {
      if (!pointers.has(event.pointerId)) return;
      const point = local(event);
      pointers.set(event.pointerId, point);
      if (mode === 'pan' && last) {
        const dx = point[0] - last[0];
        const dy = point[1] - last[1];
        travelled += Math.abs(dx) + Math.abs(dy);
        last = point;
        if (travelled > TAP_THRESHOLD_PX) {
          const [ux, uy] = unitsPerPixel();
          handlersRef.current.setView((view) => panViewport(view, -dx * ux, dy * uy));
        }
      } else if (mode === 'pinch' && pinch && pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const { width, height } = size();
        const start = pinch.view;
        const anchor = pixelToMath(start, width, height, pinch.mid[0], pinch.mid[1]);
        let view = zoomViewport(start, pinch.distance / distance, anchor);
        const ux = (view.xMax - view.xMin) / width;
        const uy = (view.yMax - view.yMin) / height;
        view = panViewport(view, -(mid[0] - pinch.mid[0]) * ux, (mid[1] - pinch.mid[1]) * uy);
        handlersRef.current.setView(() => view);
      }
    };

    const onPointerUp = (event) => {
      if (!pointers.has(event.pointerId)) return;
      const point = pointers.get(event.pointerId);
      pointers.delete(event.pointerId);
      element.releasePointerCapture?.(event.pointerId);
      if (mode === 'pan' && travelled <= TAP_THRESHOLD_PX && event.type === 'pointerup') {
        handlersRef.current.onTap?.(toMath(point[0], point[1]), point);
      }
      if (pointers.size === 1) {
        mode = 'pan';
        last = [...pointers.values()][0];
        travelled = TAP_THRESHOLD_PX + 1; // la fin d'un pincement n'est pas un tap
        pinch = null;
      } else if (pointers.size === 0) {
        mode = null;
        last = null;
        pinch = null;
      }
    };

    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * 100 : event.deltaY;
      const factor = Math.exp(Math.max(-60, Math.min(60, delta)) * 0.0015);
      const [px, py] = local(event);
      const anchor = toMath(px, py);
      handlersRef.current.setView((view) => zoomViewport(view, factor, anchor));
    };

    const onKeyDown = (event) => {
      if (event.target !== element) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const view = handlersRef.current.getView();
      const dx = (view.xMax - view.xMin) * KEY_PAN_FRACTION;
      const dy = (view.yMax - view.yMin) * KEY_PAN_FRACTION;
      let handled = true;
      switch (event.key) {
        case 'ArrowLeft': handlersRef.current.setView((v) => panViewport(v, -dx, 0)); break;
        case 'ArrowRight': handlersRef.current.setView((v) => panViewport(v, dx, 0)); break;
        case 'ArrowUp': handlersRef.current.setView((v) => panViewport(v, 0, dy)); break;
        case 'ArrowDown': handlersRef.current.setView((v) => panViewport(v, 0, -dy)); break;
        case '+': case '=': handlersRef.current.setView((v) => zoomViewport(v, ZOOM_STEP)); break;
        case '-': case '_': handlersRef.current.setView((v) => zoomViewport(v, 1 / ZOOM_STEP)); break;
        case '0': case 'Home': handlersRef.current.onReset?.(); break;
        default: handled = false;
      }
      if (handled) event.preventDefault();
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('keydown', onKeyDown);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('keydown', onKeyDown);
    };
  }, [ref]);
}
