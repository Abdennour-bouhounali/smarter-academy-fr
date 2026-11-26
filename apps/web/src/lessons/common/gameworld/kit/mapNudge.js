/**
 * The practice hub's mind map (PracticeHub.jsx) — PURE. A node is centred on its point; its name, wrapped to at most
 * the map's label width (styles/practice.css › .di-node), may still be wider than the room between its point and the
 * map's edge. The node is then moved INTO the map by `nodeNudge` pixels (its icon and pips moved back onto the point),
 * so no name leaves the map — and the map never scrolls to show it (2026-11-26, a walk of the unit « Multiples et diviseurs »: a long
 * name at 82 % of the map, focused, scrolled the map 92 px sideways).
 *
 *   center  the node's point, in px from the map's left edge
 *   width   the node's width (its name, wrapped)
 *   room    the map's width
 *   pad     the margin kept from each edge
 * Returns the shift in px: > 0 to the right, < 0 to the left, 0 when the node fits as it is.
 */
export function nodeNudge(center, width, room, pad = 6) {
  if (width + 2 * pad >= room) return room / 2 - center;
  const left = center - width / 2;
  if (left < pad) return pad - left;
  if (left + width > room - pad) return room - pad - (left + width);
  return 0;
}
