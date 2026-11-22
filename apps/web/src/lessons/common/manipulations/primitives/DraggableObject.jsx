
/**
 * Un objet que l'élève PREND et PORTE. Il pose les `sourceProps` du geste
 * (useDragInteraction) et rend trois états visibles sans texte :
 *   en main   — légèrement agrandi, ombre, anneau
 *   refusé    — une secousse courte (neutralisée par prefers-reduced-motion)
 *   au repos  — la pastille telle quelle
 *
 * PAS de framer-motion ici, et c'est un choix de FIABILITÉ : le geste repose
 * sur `setPointerCapture`, qui suppose que l'élément survit au geste. Une
 * animation de disposition (`layout`) démonte et remonte le nœud pendant le
 * glissement, la capture est perdue, et le `pointermove` n'arrive jamais —
 * le glisser cesse simplement de fonctionner. Les trois états passent donc
 * par des transitions CSS (transform/opacity uniquement), que
 * `prefers-reduced-motion` neutralise dans index.css.
 *
 * Toujours un <button> : l'objet est focusable, Entrée/Espace le prend, la
 * zone se choisit ensuite. `label` est l'énoncé lu par un lecteur d'écran
 * (« الرقم 28 », « زهرة حمراء »), pas le contenu visuel.
 */
export default function DraggableObject({
  drag, id, label, disabled = false, className = '', heldClassName = 'ring-2 ring-blue-500 shadow-lg', children, as: Tag = 'button', style,
}) {
  const props = drag.sourceProps(id, { disabled });
  const held = drag.held === id;
  const rejected = drag.rejected === id;
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      aria-label={label}
      disabled={disabled && Tag === 'button' ? true : undefined}
      {...props}
      style={{ ...props.style, ...style }}
      className={`sa-manip-object select-none touch-none transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${held ? `scale-105 ${heldClassName}` : ''} ${rejected ? 'sa-manip-reject ring-2 ring-rose-400' : ''} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
