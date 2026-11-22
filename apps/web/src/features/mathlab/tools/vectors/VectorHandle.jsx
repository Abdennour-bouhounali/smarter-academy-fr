import { useCallback, useEffect, useRef, useState } from 'react';
import { useTransformContext, vec } from 'mafs';

/**
 * UNE POIGNÉE : le point qu'on attrape avec le doigt.
 *
 * §34 : « points must be easy to grab … Use invisible interaction padding
 * where necessary. Do not enlarge the visual point itself just to make touch
 * interaction possible. » C'est exactement la structure ici : un disque
 * VISIBLE de `radius` px, et par-dessus un disque TRANSPARENT de `hitRadius`
 * px (22 par défaut, soit 44 px de diamètre — la cible tactile recommandée).
 * Le dessin ne grossit pas, la cible oui.
 *
 * Le glissement se fait en événements natifs avec capture du pointeur :
 *   - la capture garde le doigt sur la poignée même s'il sort du disque ;
 *   - `stopPropagation` sur `pointerdown` empêche le plan de se déplacer en
 *     même temps (§34 : « dragging must not accidentally pan the entire page ») ;
 *   - `touch-action: none` (CSS) empêche le navigateur de faire défiler la page.
 *
 * La poignée est aussi accessible au CLAVIER : focalisable, les flèches la
 * déplacent d'un pas. Un élève sans souris doit pouvoir construire.
 */
export default function VectorHandle({
  position, color, radius = 6, hitRadius = 22, onDrag, onDragEnd, onSelect,
  selected = false, label = null, ariaLabel = null, disabled = false, kind = 'point',
}) {
  const { viewTransform } = useTransformContext();
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);

  const handlersRef = useRef({ onDrag, onDragEnd, onSelect });
  handlersRef.current = { onDrag, onDragEnd, onSelect };

  const stop = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return undefined;

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      // Le plan ne doit NI se déplacer NI recevoir ce tap.
      event.stopPropagation();
      event.preventDefault();
      element.setPointerCapture?.(event.pointerId);
      draggingRef.current = true;
      movedRef.current = false;
      setDragging(true);
      handlersRef.current.onSelect?.();
    };

    const onPointerMove = (event) => {
      if (!draggingRef.current) return;
      event.stopPropagation();
      event.preventDefault();
      movedRef.current = true;
      handlersRef.current.onDrag?.(event.clientX, event.clientY, { shift: event.shiftKey });
    };

    const onPointerUp = (event) => {
      if (!draggingRef.current) return;
      event.stopPropagation();
      element.releasePointerCapture?.(event.pointerId);
      stop();
      if (movedRef.current) handlersRef.current.onDragEnd?.();
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
    };
  }, [disabled, stop]);

  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return null;
  const [px, py] = vec.transform([position.x, position.y], viewTransform);

  return (
    <g
      ref={ref}
      className={`sa-ml-vec__handle${dragging ? ' sa-ml-vec__handle--dragging' : ''}${disabled ? ' sa-ml-vec__handle--fixed' : ''}`}
      data-ml-handle={kind}
      data-ml-handle-label={label ?? undefined}
      data-ml-selected={selected ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel ?? label ?? undefined}
      aria-pressed={selected}
    >
      {/* La cible TACTILE : invisible, large, et seule à écouter les gestes. */}
      {!disabled && <circle className="sa-ml-vec__hit" cx={px} cy={py} r={hitRadius} />}
      {selected && <circle className="sa-ml-vec__halo" cx={px} cy={py} r={radius + 6} stroke={color} />}
      <circle
        className="sa-ml-vec__dot"
        cx={px}
        cy={py}
        r={radius}
        fill={disabled ? '#ffffff' : color}
        stroke={color}
        strokeWidth={disabled ? 2.5 : 2}
      />
      {label && (
        <text className="sa-ml-vec__handlelabel" x={px + radius + 6} y={py - radius - 3} fill="#0f172a">{label}</text>
      )}
    </g>
  );
}
