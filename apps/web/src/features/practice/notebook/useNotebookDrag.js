import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Déplacer le cahier à la main — et RIEN d'autre.
 *
 * La position est un DÉCALAGE `{x, y}` en pixels par rapport à l'endroit où
 * la feuille de style pose la fenêtre, appliqué en `transform: translate`.
 * Pourquoi un décalage plutôt que left/top : la largeur et la hauteur restent
 * entièrement à la CSS (les deux tailles, les bornes responsives, la version
 * téléphone) — le geste ne touche pas à une seule dimension, il ne peut donc
 * pas les casser.
 *
 * Pointer Events, un seul chemin pour souris, pavé tactile, doigt et stylet.
 * `setPointerCapture` garde le geste même quand le pointeur sort de la
 * poignée ; `touch-action: none` sur la poignée (CSS) empêche la page de
 * défiler sous le doigt pendant qu'on déplace.
 *
 * Le cahier reste TOUJOURS entièrement dans la fenêtre (marge de 8px) : la
 * borne se calcule sur ses dimensions réelles et celles de l'écran, à chaque
 * mouvement et à chaque redimensionnement — jamais de coordonnée en dur.
 *
 * @param {React.RefObject<HTMLElement>} panelRef  la fenêtre déplacée
 * @param {{ enabled?: boolean }} [options]
 */
const MARGIN = 8;

export function useNotebookDrag(panelRef, { enabled = true } = {}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const gesture = useRef(null);

  const clampTo = useCallback((next) => {
    const el = panelRef.current;
    if (!el) return next;
    const rect = el.getBoundingClientRect();
    const cur = offsetRef.current;
    // Où la CSS pose la fenêtre, sans notre translation.
    const natural = {
      left: rect.left - cur.x, right: rect.right - cur.x, top: rect.top - cur.y, bottom: rect.bottom - cur.y,
    };
    const minX = MARGIN - natural.left;
    const maxX = window.innerWidth - MARGIN - natural.right;
    const minY = MARGIN - natural.top;
    const maxY = window.innerHeight - MARGIN - natural.bottom;

    return {
      // Une fenêtre plus large que l'écran (cas théorique) reste à sa place.
      x: minX > maxX ? 0 : Math.min(maxX, Math.max(minX, next.x)),
      y: minY > maxY ? 0 : Math.min(maxY, Math.max(minY, next.y)),
    };
  }, [panelRef]);

  /** Ramène la fenêtre dans l'écran si celui-ci a changé (rotation, redimensionnement, autre taille). */
  const reclamp = useCallback(() => {
    setOffset((o) => {
      const c = clampTo(o);
      return c.x === o.x && c.y === o.y ? o : c;
    });
  }, [clampTo]);

  useEffect(() => {
    if (!enabled) return undefined;
    window.addEventListener('resize', reclamp);

    return () => window.removeEventListener('resize', reclamp);
  }, [enabled, reclamp]);

  const onPointerDown = useCallback((e) => {
    if (!enabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    // Les boutons de l'en-tête restent des boutons : on ne saisit que le vide
    // et le titre.
    if (e.target.closest('button, a, input, select, textarea')) return;
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      // Le point saisi reste sous le pointeur : on part du décalage courant,
      // pas de zéro — sinon la fenêtre sauterait au premier mouvement.
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    e.preventDefault();
  }, [enabled]);

  const onPointerMove = useCallback((e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    setOffset(clampTo({ x: g.originX + (e.clientX - g.startX), y: g.originY + (e.clientY - g.startY) }));
  }, [clampTo]);

  const endGesture = useCallback((e) => {
    const g = gesture.current;
    if (!g || e.pointerId !== g.pointerId) return;
    gesture.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* déjà relâché */ }
    setDragging(false);
  }, []);

  return {
    offset,
    dragging,
    reclamp,
    handleProps: {
      onPointerDown, onPointerMove, onPointerUp: endGesture, onPointerCancel: endGesture,
    },
  };
}
