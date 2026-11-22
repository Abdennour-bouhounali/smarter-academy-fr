import { useRef, useState } from 'react';

/**
 * useHand — le GESTE « prendre un carreau, le porter, le poser » de tile-yard, sur UN <svg> (un seul repère pour les carreaux, les cellules et
 * le tas : on sait toujours quelle cellule est sous le doigt, sans lire le DOM).
 *
 *   - `data-ty-src="<source>"` sur un élément du SVG le rend prenable ; `onGrab(source, pt, event)` peut REFUSER (retourne `false`) : le geste ne
 *     commence pas (le carreau ne peut pas être soulevé), la vue joue la secousse et dit pourquoi ;
 *   - un appui qui bouge de moins de 7 px est un TAP (chemin « toucher, puis toucher la destination ») ; au-delà c'est un glissé : `onMove`
 *     reçoit chaque point (on y pose en rafale les carreaux d'un sol), `onRelease(source, pt, 'drag' | 'tap' | 'cancel')` conclut ;
 *   - `pt` est dans le repère du viewBox (x, y), indépendant de la taille affichée.
 *
 * Retourne `{ drag, handlers, toPt }` : `drag` = null | { source, x, y, moved } (la position du carreau porté), `handlers` à étaler sur le <svg>.
 */
export default function useHand({ svgRef, viewW, viewH, onGrab, onMove, onRelease }) {
  const st = useRef(null);
  const [drag, setDrag] = useState(null);
  const toPt = (e) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * viewW) / (r.width || viewW), y: ((e.clientY - r.top) * viewH) / (r.height || viewH) };
  };
  const handlers = {
    onPointerDown: (e) => {
      if (e.button != null && e.button > 0) return;
      const el = e.target.closest?.('[data-ty-src]');
      if (!el || !svgRef.current?.contains(el)) return;
      const source = el.getAttribute('data-ty-src');
      const pt = toPt(e);
      if (onGrab?.(source, pt, e) === false) return;
      svgRef.current.setPointerCapture?.(e.pointerId);
      st.current = { source, x0: e.clientX, y0: e.clientY, moved: false };
      setDrag({ source, ...pt, moved: false });
    },
    onPointerMove: (e) => {
      const s = st.current;
      if (!s) return;
      if (!s.moved && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) > 7) s.moved = true;
      const pt = toPt(e);
      setDrag({ source: s.source, ...pt, moved: s.moved });
      onMove?.(s.source, pt, s.moved);
    },
    onPointerUp: (e) => {
      const s = st.current;
      if (!s) return;
      st.current = null;
      setDrag(null);
      svgRef.current?.releasePointerCapture?.(e.pointerId);
      onRelease?.(s.source, toPt(e), s.moved ? 'drag' : 'tap');
    },
    onPointerCancel: () => {
      const s = st.current;
      if (!s) return;
      st.current = null;
      setDrag(null);
      onRelease?.(s.source, null, 'cancel');
    },
  };
  return { drag, handlers, toPt };
}
