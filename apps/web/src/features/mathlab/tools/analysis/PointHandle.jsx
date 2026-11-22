import { useCallback, useEffect, useRef, useState } from 'react';
import { useTransformContext, vec } from 'mafs';

/**
 * LA POIGNÉE d'un point mobile du مختبر التحليل (§6, §38, §40).
 *
 * Même structure que celles du مختبر الأشعة, du مختبر التحويلات et du
 * مختبر المقاطع المخروطية, et pour la même raison : un disque VISIBLE de
 * `radius` px, et par-dessus un disque TRANSPARENT de `hitRadius` px (22 par
 * défaut, soit 44 px de diamètre — la cible tactile recommandée). Le dessin
 * ne grossit pas, la cible oui.
 *
 * Elle ne partage PAS le composant des coniques, pour une raison de contrat
 * et non de goût : celui-ci porte les classes `sa-ml-cn__*` de sa propre
 * feuille, et déplace un point LIBRE du plan. Ici le point est CONTRAINT sur
 * la courbe — il n'a qu'un degré de liberté — donc les flèches verticales
 * n'ont aucun sens et le composant ne doit pas faire semblant.
 *
 * Le glissement se fait en événements natifs avec capture du pointeur :
 *   - la capture garde le doigt sur la poignée même s'il sort du disque ;
 *   - `stopPropagation` sur `pointerdown` empêche le plan de se déplacer ;
 *   - `touch-action: none` (CSS) empêche le navigateur de faire défiler.
 *
 * Accessible au CLAVIER (§40) : focalisable, les flèches gauche/droite la
 * déplacent d'un pas, Shift le raffine dix fois.
 */
export default function PointHandle({
  x, y, color, label = null, ariaLabel = null, radius = 7, hitRadius = 22,
  onDrag, onDragEnd, onNudge,
}) {
  const { viewTransform } = useTransformContext();
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);

  const handlersRef = useRef({ onDrag, onDragEnd, onNudge });
  handlersRef.current = { onDrag, onDragEnd, onNudge };

  const stop = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      // Le plan ne doit NI se déplacer NI recevoir ce tap.
      event.stopPropagation();
      event.preventDefault();
      element.setPointerCapture?.(event.pointerId);
      draggingRef.current = true;
      setDragging(true);
    };

    const onPointerMove = (event) => {
      if (!draggingRef.current) return;
      event.stopPropagation();
      event.preventDefault();
      handlersRef.current.onDrag?.(event.clientX, event.clientY);
    };

    const onPointerUp = (event) => {
      if (!draggingRef.current) return;
      event.stopPropagation();
      element.releasePointerCapture?.(event.pointerId);
      stop();
      handlersRef.current.onDragEnd?.();
    };

    /**
     * Les flèches : le même geste, au clavier.
     *
     * HORIZONTALES seulement — le point est sur la courbe, son ordonnée est
     * imposée par f. Offrir haut/bas laisserait croire qu'on peut le
     * soulever, ce qui est faux.
     */
    const onKeyDown = (event) => {
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      if (direction === 0) return;
      event.preventDefault();
      event.stopPropagation();
      handlersRef.current.onNudge?.(direction, event.shiftKey);
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
  }, [stop]);

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const [px, py] = vec.transform([x, y], viewTransform);

  return (
    <g
      ref={ref}
      className={`sa-ml-an__handle${dragging ? ' sa-ml-an__handle--dragging' : ''}`}
      data-ml-an-handle={label ?? 'point'}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel ?? label ?? undefined}
    >
      {/* La cible TACTILE : invisible, large, et seule à écouter les gestes. */}
      <circle className="sa-ml-an__hit" cx={px} cy={py} r={hitRadius} />
      <circle
        className="sa-ml-an__dot"
        cx={px} cy={py} r={radius}
        fill={color} style={{ fill: color, stroke: '#ffffff' }}
        stroke="#ffffff" strokeWidth={2.5}
      />
      {label && (
        <text
          className="sa-ml-an__handlelabel"
          x={px + radius + 6} y={py - radius - 4}
          fill={color} style={{ fill: color }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
