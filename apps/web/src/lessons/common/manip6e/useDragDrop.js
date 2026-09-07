import { useCallback, useRef, useState } from 'react';

/**
 * useDragDrop — la mécanique « prendre un objet et le poser dans une zone »,
 * sans imposer aucun rendu.
 *
 * `DragTray` reste le composant clé-en-main quand la réserve et les zones
 * peuvent être de simples boutons. Ce hook expose la MÊME mécanique — et le
 * même contrat d'accessibilité — pour les manipulations qui ont besoin d'un
 * dessin propre (un plateau de numération dont les colonnes empilent des
 * formes, par exemple) : la leçon dessine, le hook gère le geste.
 *
 * Le geste couvert :
 *   - POINTEUR : on appuie sur l'objet, on le traîne, on relâche au-dessus
 *     d'une zone. La zone survolée est trouvée par `elementFromPoint` sur
 *     l'attribut `data-drop-zone`, donc au doigt comme à la souris, et sans
 *     câbler un événement par zone.
 *   - CLAVIER / CLIC : activer l'objet le PREND (`held`, `aria-pressed`),
 *     activer une zone l'y POSE. Un lecteur d'écran annonce donc la même
 *     séquence prendre → poser que le glisser.
 *
 * Aucune prop `disabled` : une manipulation ne se fige jamais après la
 * validation de l'étape (règle projet du 2026-09-06).
 *
 * @param {function} onDrop   (sourceId, zoneId) => void
 * @param {function} [accepts] (sourceId, zoneId) => bool — un refus ENSEIGNE
 */
export default function useDragDrop({ onDrop, accepts }) {
  const [held, setHeld] = useState(null);
  const [hoverZone, setHoverZone] = useState(null);
  // La position du pointeur, pour dessiner l'objet sous le doigt pendant le
  // glissement. `null` tant qu'aucun glissement n'est en cours.
  const [ghost, setGhost] = useState(null);
  const pointerDragging = useRef(false);
  // Un `pointerup` est TOUJOURS suivi d'un `click` synthétique. Sans ce
  // drapeau, le clic annulerait aussitôt la prise (un simple tap prendrait
  // puis reposerait l'objet) ou reprendrait un objet qu'on vient de poser.
  const justPointered = useRef(false);

  const zoneAt = (x, y) => {
    const el = document.elementFromPoint(x, y);
    return el?.closest?.('[data-drop-zone]')?.getAttribute('data-drop-zone') ?? null;
  };

  const drop = useCallback((zoneId, sourceId = held) => {
    if (!sourceId || !zoneId) return false;
    if (accepts && !accepts(sourceId, zoneId)) return false;
    onDrop(sourceId, zoneId);
    return true;
  }, [accepts, held, onDrop]);

  /** À poser sur l'objet SAISISSABLE de la réserve. */
  const sourceProps = useCallback((id) => ({
    'aria-pressed': held === id,
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      pointerDragging.current = true;
      setHeld(id);
      setGhost({ x: e.clientX, y: e.clientY });
    },
    onPointerMove: (e) => {
      if (!pointerDragging.current) return;
      setGhost({ x: e.clientX, y: e.clientY });
      setHoverZone(zoneAt(e.clientX, e.clientY));
    },
    onPointerUp: (e) => {
      if (!pointerDragging.current) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      pointerDragging.current = false;
      const zone = zoneAt(e.clientX, e.clientY);
      setGhost(null);
      setHoverZone(null);
      justPointered.current = true;
      if (zone) {
        // Un glissement réussi consomme l'objet ; un glissement qui finit
        // hors zone le laisse EN MAIN, pour que le chemin clavier prenne le
        // relais sans que l'élève ait à recommencer.
        if (drop(zone, id)) setHeld(null);
      }
    },
    onPointerCancel: () => {
      pointerDragging.current = false;
      justPointered.current = true;
      setGhost(null);
      setHoverZone(null);
    },
    // Le clic seul (souris sans mouvement, clavier via Entrée / Espace) prend
    // ou repose l'objet : c'est le chemin de secours, jamais retiré.
    onClick: () => {
      // Le `click` qui suit immédiatement un geste de pointeur ne doit rien
      // rebasculer : le pointeur a déjà décidé.
      if (justPointered.current) { justPointered.current = false; return; }
      setHeld((cur) => (cur === id ? null : id));
    },
    style: { touchAction: 'none', cursor: 'grab' },
  }), [drop, held]);

  /** À poser sur la ZONE d'accueil (elle porte `data-drop-zone`). */
  const zoneProps = useCallback((id) => ({
    'data-drop-zone': id,
    'data-drop-active': hoverZone === id ? 'true' : undefined,
  }), [hoverZone]);

  /** Le bouton « poser ici » de la zone — le chemin clavier / clic. */
  const dropHere = useCallback((zoneId) => {
    if (drop(zoneId)) setHeld(null);
  }, [drop]);

  return {
    held,
    hoverZone,
    ghost,
    sourceProps,
    zoneProps,
    dropHere,
    release: () => setHeld(null),
  };
}
