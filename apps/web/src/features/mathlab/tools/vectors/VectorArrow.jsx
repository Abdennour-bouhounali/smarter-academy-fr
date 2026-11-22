import { useEffect, useRef } from 'react';
import { useTransformContext, vec } from 'mafs';
import * as V from './vectorMath.js';
import VectorColumn from './VectorColumnSvg.jsx';

/** La pointe de la flèche, en PIXELS : elle ne grandit pas quand on zoome. */
const HEAD_LENGTH = 13;
const HEAD_WIDTH = 9;
/** En deçà, un شعاع est trop court pour porter une pointe : on ne dessine qu'un disque. */
const MIN_PIXELS = 6;

/**
 * UN شعاع DESSINÉ : un segment et une POINTE (§5 — « The vector must have a
 * visible arrowhead »).
 *
 * La pointe est calculée en pixels et non en unités du plan : sinon elle
 * doublerait de taille à chaque zoom, et un شعاع court n'aurait qu'un
 * moignon. C'est la même raison qui fait dessiner à la main plutôt que
 * d'utiliser un `marker` SVG : un marqueur hérite de l'échelle du groupe, et
 * mafs travaille dans un repère transformé.
 *
 * Le شعاع NUL (k = 0, §14) ne disparaît pas : il devient un petit disque à
 * son origine. « Ça ne s'affiche plus » et « le شعاع est nul » sont deux
 * choses différentes, et l'élève doit voir la seconde.
 */
export default function VectorArrow({
  from, to, color, name = null, width = 2.5, dashed = false, opacity = 1,
  showComponents = false, labelOffset = 0, faded = false, onSelect = null,
}) {
  const { viewTransform } = useTransformContext();
  if (!V.isVector(from) || !V.isVector(to)) return null;

  const [x1, y1] = vec.transform([from.x, from.y], viewTransform);
  const [x2, y2] = vec.transform([to.x, to.y], viewTransform);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const effectiveOpacity = faded ? opacity * 0.45 : opacity;

  if (!Number.isFinite(length)) return null;

  // Le شعاع nul : un disque, pas rien.
  if (length < MIN_PIXELS) {
    return (
      <g className="sa-ml-vec__arrow" opacity={effectiveOpacity} data-ml-vector-zero>
        <circle cx={x1} cy={y1} r={4} fill={color} />
        {name && (
          <text className="sa-ml-vec__arrowlabel" x={x1 + 10} y={y1 - 8} fill={color}>{name}</text>
        )}
      </g>
    );
  }

  const ux = dx / length;
  const uy = dy / length;
  const head = Math.min(HEAD_LENGTH, length * 0.55);
  const headWidth = (head / HEAD_LENGTH) * HEAD_WIDTH;
  // Le trait s'arrête à la BASE de la pointe : sinon il dépasse du triangle
  // et la flèche paraît émoussée.
  const baseX = x2 - ux * head;
  const baseY = y2 - uy * head;
  const points = [
    [x2, y2],
    [baseX - uy * headWidth, baseY + ux * headWidth],
    [baseX + uy * headWidth, baseY - ux * headWidth],
  ].map(([px, py]) => `${px},${py}`).join(' ');

  // L'étiquette se pose du côté « extérieur » du شعاع, au milieu. Quand elle
  // porte aussi les composantes, elle s'écarte davantage : sinon la seconde
  // ligne retombe sur la graduation des axes (vu en QA).
  const away = (showComponents ? 22 : 14) + labelOffset;
  const midX = (x1 + x2) / 2 - uy * away;
  const midY = (y1 + y2) / 2 + ux * away;

  return (
    <g
      className={`sa-ml-vec__arrow${onSelect ? ' sa-ml-vec__arrow--pickable' : ''}`}
      opacity={effectiveOpacity}
      data-ml-vector
      data-ml-vector-name={name ?? undefined}
    >
      {/* Le trait lui-même est cliquable : toucher la flèche la sélectionne.
          La bande transparente est LARGE (§34) — viser un trait de 2 px au
          doigt est impossible. */}
      {onSelect && (
        <PickLine x1={x1} y1={y1} x2={x2} y2={y2} onSelect={onSelect} />
      )}
      <line
        x1={x1}
        y1={y1}
        x2={baseX}
        y2={baseY}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '7 5' : undefined}
      />
      <polygon points={points} fill={color} />
      {name && (
        <g className="sa-ml-vec__arrowlabel-group">
          {/* La flèche du nom est DESSINÉE : U+20D7 se place mal dans les
              polices arabes, et l'élève doit lire ⃗u comme dans son manuel. */}
          <line
            x1={midX - 7}
            y1={midY - 13}
            x2={midX + 7}
            y2={midY - 13}
            stroke={color}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
          <polygon
            points={`${midX + 8},${midY - 13} ${midX + 4},${midY - 15.6} ${midX + 4},${midY - 10.4}`}
            fill={color}
          />
          <text className="sa-ml-vec__arrowlabel" x={midX} y={midY} fill={color} textAnchor="middle">{name}</text>
          {showComponents && (
            <VectorColumn
              className="sa-ml-vec__arrowcoords"
              vector={V.fromPoints(from, to)}
              x={midX}
              y={midY + 20}
              fontSize={12}
            />
          )}
        </g>
      )}
    </g>
  );
}

/**
 * La bande de PRISE d'un trait : un écouteur NATIF, pas un `onPointerDown`
 * React.
 *
 * `useViewportGestures.js` (le plan) écoute déjà `pointerdown` en NATIF sur
 * le conteneur hôte. Un `event.stopPropagation()` posé sur l'événement
 * SYNTHÉTIQUE de React n'arrête que les autres gestionnaires React — pas cet
 * écouteur natif, qui reçoit l'événement pendant sa PROPRE remontée DOM,
 * avant même que React ne le redistribue depuis la racine. Sans cela, le
 * plan voit un « tap dans le vide » et désélectionne aussitôt ce qu'on
 * venait de choisir. La poignée (VectorHandle.jsx) contourne déjà ce piège
 * de la même façon ; ce composant applique la même règle au trait.
 */
function PickLine({ x1, y1, x2, y2, onSelect }) {
  const ref = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const onPointerDown = (event) => {
      event.stopPropagation();
      onSelectRef.current?.();
    };
    element.addEventListener('pointerdown', onPointerDown);

    return () => element.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return <line ref={ref} className="sa-ml-vec__pick" x1={x1} y1={y1} x2={x2} y2={y2} />;
}
