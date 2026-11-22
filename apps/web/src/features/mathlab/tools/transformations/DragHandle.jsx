import { useCallback, useEffect, useRef, useState } from 'react';
import { useTransformContext, vec } from 'mafs';

/**
 * UNE POIGNÉE : le point qu'on attrape avec le doigt (§5, §53).
 *
 * Même structure que celle du مختبر الأشعة, et pour la même raison : un
 * disque VISIBLE de `radius` px, et par-dessus un disque TRANSPARENT de
 * `hitRadius` px (22 par défaut, soit 44 px de diamètre — la cible tactile
 * recommandée). Le dessin ne grossit pas, la cible oui.
 *
 * Le glissement se fait en événements natifs avec capture du pointeur :
 *   - la capture garde le doigt sur la poignée même s'il sort du disque ;
 *   - `stopPropagation` sur `pointerdown` empêche le plan de se déplacer en
 *     même temps ;
 *   - `touch-action: none` (CSS) empêche le navigateur de faire défiler la page.
 *
 * La poignée est aussi accessible au CLAVIER : focalisable, les flèches la
 * déplacent d'un pas (Shift : dix fois plus fin). Un élève sans souris doit
 * pouvoir construire et transformer.
 */
export default function DragHandle({
  position, color, radius = 6, hitRadius = 22, onDrag, onDragEnd, onSelect, onNudge,
  selected = false, label = null, ariaLabel = null, disabled = false, kind = 'vertex',
  shape = 'circle',
}) {
  const { viewTransform } = useTransformContext();
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);

  const handlersRef = useRef({ onDrag, onDragEnd, onSelect, onNudge });
  handlersRef.current = { onDrag, onDragEnd, onSelect, onNudge };

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

    /** Les flèches : le même geste, au clavier (§53). */
    const onKeyDown = (event) => {
      const deltas = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1],
      };
      const delta = deltas[event.key];
      if (!delta) return;
      event.preventDefault();
      event.stopPropagation();
      const factor = event.shiftKey ? 0.1 : 1;
      handlersRef.current.onNudge?.(delta[0] * factor, delta[1] * factor);
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    element.addEventListener('keydown', onKeyDown);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('keydown', onKeyDown);
    };
  }, [disabled, stop]);

  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return null;
  const [px, py] = vec.transform([position.x, position.y], viewTransform);

  return (
    <g
      ref={ref}
      className={`sa-ml-tr__handle${dragging ? ' sa-ml-tr__handle--dragging' : ''}${disabled ? ' sa-ml-tr__handle--fixed' : ''}`}
      data-ml-handle={kind}
      data-ml-handle-label={label ?? undefined}
      data-ml-selected={selected ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={ariaLabel ?? label ?? undefined}
      aria-pressed={selected}
    >
      {/* La cible TACTILE : invisible, large, et seule à écouter les gestes. */}
      {!disabled && <circle className="sa-ml-tr__hit" cx={px} cy={py} r={hitRadius} />}
      {selected && <circle className="sa-ml-tr__halo" cx={px} cy={py} r={radius + 6} stroke={color} />}
      {/* La FORME distingue le rôle sans dépendre de la couleur (§46, §53). */}
      {shape === 'square' ? (
        <rect
          className="sa-ml-tr__dot"
          x={px - radius} y={py - radius} width={radius * 2} height={radius * 2}
          fill={disabled ? '#ffffff' : color} stroke={color} strokeWidth={2}
        />
      ) : shape === 'cross' ? (
        <g className="sa-ml-tr__dot" stroke={color} strokeWidth={2.5} strokeLinecap="round">
          <line x1={px - radius} y1={py} x2={px + radius} y2={py} />
          <line x1={px} y1={py - radius} x2={px} y2={py + radius} />
          <circle cx={px} cy={py} r={radius} fill="none" strokeWidth={1.5} />
        </g>
      ) : (
        <circle
          className="sa-ml-tr__dot"
          cx={px} cy={py} r={radius}
          fill={disabled ? '#ffffff' : color} stroke={color} strokeWidth={disabled ? 2.5 : 2}
        />
      )}
      {label && (
        <text className="sa-ml-tr__handlelabel" x={px + radius + 6} y={py - radius - 3} fill="#0f172a">{label}</text>
      )}
    </g>
  );
}
