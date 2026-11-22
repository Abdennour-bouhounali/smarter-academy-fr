import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';

/**
 * useDragInteraction — le GESTE « prendre un objet, le porter, le poser »,
 * pour toutes les manipulations. Héritier de l'ancien manip6e/useDragDrop, supprimé le 2026-09-30 (même
 * contrat d'accessibilité), avec ce que des laboratoires tactiles exigent :
 *
 *   SEUIL       un appui sans mouvement (< 6 px) est un TAP, pas un glisser :
 *               il prend/repose l'objet (chemin clavier, lecteur d'écran,
 *               souris hésitante). Au-delà, l'objet suit le pointeur.
 *   AIMANT      pendant le geste, la zone la plus proche dans un rayon
 *               (`magnetRadius`) QUI ACCEPTERAIT l'objet est « attirée » :
 *               elle s'allume (`data-drop-active`) et le relâchement y pose
 *               l'objet même s'il est à côté. Une zone qui refuserait n'est
 *               jamais attirée ; survolée directement, elle se marque
 *               `data-drop-invalid` (la vue la teinte en rose) et le
 *               relâchement y reçoit le refus EXPLIQUÉ — l'élève voit avant
 *               de lâcher que la mathématique va résister.
 *   REFUS       `accepts(sourceId, zoneId)` peut refuser ; l'objet revient
 *               doucement (`rejected` porte l'id une courte durée, la vue
 *               joue une secousse discrète) et `onReject` reçoit la raison,
 *               que la manipulation EXPLIQUE en arabe — jamais un rouge muet.
 *   DÉFILEMENT  `touch-action: none` sur la source + capture du pointeur :
 *               le doigt qui porte un objet ne fait pas défiler la page —
 *               c'est donc le HOOK qui la fait défiler quand le doigt
 *               approche du bord haut ou bas de l'écran (`EDGE`), sinon deux
 *               zones éloignées de plus d'un écran (le banc et l'équipe 1 sur
 *               un téléphone) ne pouvaient jamais être reliées d'un geste.
 *   RETOUR      un glisser qui finit hors zone ou sur un refus REND l'objet
 *               (il n'est plus en main) : on ne garde pas en main un objet
 *               que l'élève a lâché. Le chemin « toucher l'objet, puis la
 *               zone » garde, lui, l'objet en main après un refus : l'élève
 *               vient de le choisir et touche simplement une autre zone.
 *   ALTERNATIVE sélectionner (tap / Entrée) puis activer une zone (tap /
 *               Entrée) fait la même chose que glisser. Toujours disponible.
 *
 * Le hook ne dessine rien : `DraggableObject` et `DropZone` (primitives)
 * posent `sourceProps` / `zoneProps` ; un type peut aussi les poser lui-même.
 *
 * @param {(sourceId:string, zoneId:string) => void} onDrop
 * @param {(sourceId:string, zoneId:string) => (true|string)} [accepts]
 *        true = accepté ; une chaîne = refusé, avec la raison (clé/texte)
 * @param {(sourceId:string, zoneId:string, reason:string) => void} [onReject]
 * @param {number} [magnetRadius=56] rayon d'attraction (px) autour du pointeur
 */
/** Bande (px) près du bord haut/bas de l'écran où le glisser fait défiler la page. */
const EDGE = 64;
/** Vitesse maximale du défilement automatique (px par image). */
const EDGE_SPEED = 16;

export default function useDragInteraction({ onDrop, accepts, onReject, magnetRadius = 56 } = {}) {
  const [held, setHeld] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [hoverZone, setHoverZone] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [rejected, setRejected] = useState(null);
  const start = useRef(null);
  const moved = useRef(false);
  const justPointered = useRef(false);
  // L'objet dont le geste de pointeur vient de se terminer. Voir `bubbledFrom`.
  const lastGestureNode = useRef(null);
  const rejectTimer = useRef(null);
  const pointer = useRef(null);
  const scrollRaf = useRef(0);
  // Chaque instance ne voit QUE ses zones : deux manipulations sur une même
  // étape (khawass, cas 2 et 3) recevaient les dépôts l'une de l'autre, les
  // zones portant les mêmes ids ('table', 'pgcd'…).
  const owner = useId();

  useEffect(() => () => {
    if (rejectTimer.current) clearTimeout(rejectTimer.current);
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
  }, []);

  /**
   * Ce `click` de zone n'est-il que la PROPAGATION du geste qu'on vient de
   * terminer sur un objet situé à l'intérieur d'elle ?
   *
   * Un tap sur un objet posé DANS une zone produit : pointerup (l'objet est
   * pris) → click sur l'objet → click sur la zone, par propagation. Sans ce
   * garde-fou, la zone reposerait aussitôt l'objet qu'on vient de prendre.
   *
   * On ne peut pas trancher par un DÉLAI : deux taps rapides (prendre ici,
   * poser là) sont parfaitement légitimes. On regarde donc si la zone
   * CONTIENT l'objet dont le geste vient de finir — auquel cas c'est le même
   * geste, et il ne se repose pas sur place.
   */
  const bubbledFrom = (zoneEl) => {
    const node = lastGestureNode.current;
    lastGestureNode.current = null;
    return !!node && !!zoneEl && zoneEl.contains(node);
  };

  const willAccept = useCallback((sourceId, zoneId) => (accepts ? accepts(sourceId, zoneId) === true : true), [accepts]);

  /**
   * La zone visée : celle SOUS le pointeur (qu'elle accepte ou non — son refus
   * sera expliqué), sinon la plus proche qui ACCEPTERAIT, dans le rayon de
   * l'aimant. Retourne `{ id, valid }` ou `null`.
   */
  const zoneAt = useCallback((x, y, sourceId) => {
    if (typeof document === 'undefined') return null;
    const mine = `[data-drop-zone][data-drop-owner="${owner}"]`;
    const under = document.elementFromPoint(x, y)?.closest?.('[data-drop-zone]');
    if (under) {
      if (!under.matches(mine)) return null;
      const id = under.getAttribute('data-drop-zone');
      if (under.hasAttribute('data-drop-disabled')) return { id, valid: false };
      const verdict = accepts ? accepts(sourceId, id) : true;
      // Un refus MUET (`''`, geste sans effet : reposer sur place) ne se
      // marque pas en rose — ce n'est pas une résistance mathématique.
      return { id, valid: verdict === true, silent: verdict === '' };
    }
    let best = null; let bestD = magnetRadius;
    for (const el of document.querySelectorAll(mine)) {
      const id = el.getAttribute('data-drop-zone');
      if (el.hasAttribute('data-drop-disabled') || !willAccept(sourceId, id)) continue;
      const r = el.getBoundingClientRect();
      const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      const dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      const d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = { id, valid: true }; }
    }
    return best;
  }, [magnetRadius, owner, willAccept, accepts]);

  const sameZone = (a, b) => (a?.id === b?.id && a?.valid === b?.valid && a?.silent === b?.silent);

  /** Défilement au bord : tant que le doigt porte un objet près du bord, la page suit. */
  const stopEdgeScroll = useCallback(() => {
    if (scrollRaf.current) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = 0;
  }, []);
  const edgeScroll = useCallback(() => {
    scrollRaf.current = 0;
    const p = pointer.current;
    if (!p || typeof window === 'undefined') return;
    const h = window.innerHeight;
    const dir = p.y < EDGE ? -(EDGE - p.y) / EDGE : p.y > h - EDGE ? (p.y - (h - EDGE)) / EDGE : 0;
    if (!dir) return;
    const before = window.scrollY;
    // `instant` : la page déclare `scroll-behavior: smooth`, et un défilement
    // doux est asynchrone — scrollY n'aurait pas bougé à la ligne suivante, et
    // la boucle se serait arrêtée après une image.
    window.scrollBy({ top: Math.round(dir * EDGE_SPEED) || Math.sign(dir), behavior: 'instant' });
    if (window.scrollY === before) return;  // plus rien à faire défiler
    // La page a bougé sous un doigt immobile : la zone visée a changé.
    const z = zoneAt(p.x, p.y, p.id);
    setHoverZone((cur) => (sameZone(cur, z) ? cur : z));
    scrollRaf.current = requestAnimationFrame(edgeScroll);
  }, [zoneAt]);

  const tryDrop = useCallback((sourceId, zoneId) => {
    if (!sourceId || !zoneId) return false;
    const verdict = accepts ? accepts(sourceId, zoneId) : true;
    if (verdict !== true) {
      setRejected(sourceId);
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
      rejectTimer.current = setTimeout(() => setRejected(null), 500);
      onReject?.(sourceId, zoneId, typeof verdict === 'string' ? verdict : '');
      return false;
    }
    onDrop?.(sourceId, zoneId);
    return true;
  }, [accepts, onDrop, onReject]);

  const endGesture = useCallback(() => {
    start.current = null;
    pointer.current = null;
    stopEdgeScroll();
    setDragging(false);
    setGhost(null);
    setHoverZone(null);
  }, [stopEdgeScroll]);

  /** À poser sur l'objet SAISISSABLE. */
  const sourceProps = useCallback((id, { disabled = false } = {}) => ({
    'data-drag-source': id,
    'data-drag-held': held === id ? 'true' : undefined,
    'data-drag-rejected': rejected === id ? 'true' : undefined,
    'aria-pressed': held === id,
    'aria-disabled': disabled || undefined,
    onPointerDown: (e) => {
      if (disabled || e.button > 0) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY, id };
      moved.current = false;
    },
    onPointerMove: (e) => {
      if (!start.current || start.current.id !== id) return;
      const dx = e.clientX - start.current.x; const dy = e.clientY - start.current.y;
      if (!moved.current && Math.hypot(dx, dy) < 6) return;
      if (!moved.current) { moved.current = true; setHeld(id); setDragging(true); }
      setGhost({ x: e.clientX, y: e.clientY });
      const z = zoneAt(e.clientX, e.clientY, id);
      setHoverZone((cur) => (sameZone(cur, z) ? cur : z));
      pointer.current = { x: e.clientX, y: e.clientY, id };
      if (!scrollRaf.current && typeof requestAnimationFrame !== 'undefined') scrollRaf.current = requestAnimationFrame(edgeScroll);
    },
    onPointerUp: (e) => {
      if (!start.current || start.current.id !== id) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      justPointered.current = true;
      lastGestureNode.current = e.currentTarget;
      if (moved.current) {
        const zone = zoneAt(e.clientX, e.clientY, id);
        endGesture();
        // Un glisser REND l'objet dans tous les cas : posé s'il est accepté,
        // sinon revenu à sa place (avec le refus expliqué s'il y en a un).
        if (zone) tryDrop(id, zone.id);
        setHeld(null);
        return;
      }
      endGesture();
      // Tap : prendre / reposer.
      setHeld((cur) => (cur === id ? null : id));
    },
    onPointerCancel: () => { endGesture(); justPointered.current = true; },
    onKeyDown: (e) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHeld((cur) => (cur === id ? null : id)); }
      if (e.key === 'Escape') setHeld(null);
    },
    onClick: (e) => {
      // Le `click` synthétique qui suit un pointerup ne doit rien rebasculer.
      if (justPointered.current) { justPointered.current = false; e.preventDefault(); return; }
    },
    style: { touchAction: 'none', cursor: disabled ? 'default' : held === id ? 'grabbing' : 'grab', userSelect: 'none', WebkitUserSelect: 'none' },
  }), [held, rejected, zoneAt, tryDrop, endGesture, edgeScroll]);

  /** À poser sur la ZONE d'accueil. */
  const zoneProps = useCallback((id, { disabled = false } = {}) => ({
    'data-drop-zone': id,
    'data-drop-owner': owner,
    'data-drop-disabled': disabled ? '' : undefined,
    'data-drop-active': hoverZone?.id === id && hoverZone.valid ? 'true' : undefined,
    'data-drop-invalid': hoverZone?.id === id && !hoverZone.valid && !hoverZone.silent ? 'true' : undefined,
    'data-drop-ready': held && !dragging && !disabled ? 'true' : undefined,
    onClick: (e) => {
      // Le click qui remonte du geste terminé sur un objet DE CETTE ZONE est
      // le même geste : il ne repose pas ce qu'on vient de prendre.
      if (bubbledFrom(e.currentTarget)) return;
      if (!disabled && held) { if (tryDrop(held, id)) setHeld(null); }
    },
    onKeyDown: (e) => {
      if (disabled || !held) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (tryDrop(held, id)) setHeld(null); }
    },
  }), [hoverZone, held, dragging, tryDrop, owner]);

  const release = useCallback(() => setHeld(null), []);
  const dropHere = useCallback((zoneId) => { if (held && tryDrop(held, zoneId)) setHeld(null); }, [held, tryDrop]);

  return useMemo(() => ({ held, dragging, hoverZone, ghost, rejected, sourceProps, zoneProps, release, dropHere }),
    [held, dragging, hoverZone, ghost, rejected, sourceProps, zoneProps, release, dropHere]);
}
