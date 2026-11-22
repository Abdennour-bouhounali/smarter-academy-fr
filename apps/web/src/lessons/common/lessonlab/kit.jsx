/**
 * « Mon labo » — what every instrument shares: the size of the drawing, the pointer → drawing coordinates (true under the
 * page zoom and the letter-boxing of the svg), a drag hook with pointer capture, the reading line and the maths text.
 */
import { useEffect, useRef } from 'react';
import MathText from '../components/MathText';

export const VW = 940;
export const VH = 370;

/** The pointer in the coordinates of the viewBox (the svg is drawn « meet », centred). */
export function svgPoint(svg, e, vw = VW, vh = VH) {
  const r = svg.getBoundingClientRect();
  const k = Math.min(r.width / vw, r.height / vh);
  return { x: (e.clientX - r.left - (r.width - vw * k) / 2) / k, y: (e.clientY - r.top - (r.height - vh * k) / 2) / k };
}

/**
 * A sound that ANSWERS a change: plays `name` when `deps` change and `when` holds — never when the instrument first appears
 * (an instrument is silent until the student moves something). `p` is the number of the sound, `delay` lets the sound of the
 * gesture itself go first.
 */
export function useChime(play, name, when, deps, { delay = 0, p } = {}) {
  const sig = JSON.stringify(deps);
  const prev = useRef(null);
  const ref = useRef(null);
  ref.current = { play, name, p };
  useEffect(() => {
    if (prev.current === null || prev.current === sig) {
      prev.current = sig;
      return undefined;
    }
    prev.current = sig;
    if (!when) return undefined;
    const go = () => ref.current.play(ref.current.name, ref.current.p);
    if (!delay) {
      go();
      return undefined;
    }
    const t = setTimeout(go, delay);
    return () => clearTimeout(t);
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Drag on an svg handle: `onMove(point, start)` while the pointer is down (captured), `onStart` / `onEnd` around it;
 * `point` maps the pointer into the drawing (default `svgPoint`, the 940 × 370 viewBox: a drawing of another size passes its own). */
export function useDrag(svgRef, { onStart, onMove, onEnd, point = svgPoint }) {
  const live = useRef(null);
  return {
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      live.current = { start: point(svgRef.current, e), data: onStart?.(point(svgRef.current, e)) };
    },
    onPointerMove: (e) => {
      if (live.current) onMove(point(svgRef.current, e), live.current);
    },
    onPointerUp: (e) => {
      if (!live.current) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      live.current = null;
      onEnd?.();
    },
    onPointerCancel: () => {
      live.current = null;
      onEnd?.();
    },
  };
}

export const M = ({ children }) => (
  <span dir="ltr" className="ll-math">
    <MathText>{`$${children}$`}</MathText>
  </span>
);
export const Txt = ({ children }) => <MathText>{children}</MathText>;

/** The frame of an instrument: the drawing fills the stage, the reading line sits under it. */
export const Tool = ({ children, reading, tone = 'plain', actions = null, id }) => (
  <div className="ll-tool" data-ll-view={id}>
    <div className="ll-draw">{children}</div>
    <div className={`ll-reading ll-reading--${tone}`} data-ll-reading={tone}>
      {actions && <div className="ll-actions">{actions}</div>}
      <div className="ll-reading__text">{reading}</div>
    </div>
  </div>
);
