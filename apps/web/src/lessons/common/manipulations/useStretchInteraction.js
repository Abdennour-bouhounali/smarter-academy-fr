import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * useStretchInteraction — le GESTE « étirer une grandeur » : tirer un
 * serre-livres, allonger un ruban, ouvrir un compas. Le second geste du kit,
 * à côté de `useDragInteraction` (« prendre un objet, le porter, le poser ») :
 * ici rien ne change de place, c'est une GRANDEUR qui suit le doigt.
 *
 *   DIRECT      la valeur est lue sous le pointeur (`toValue`), pas déduite
 *               d'un déplacement relatif : la poignée reste sous le doigt.
 *   CONTINU     `onChange` à chaque valeur entière traversée (la conséquence
 *               se voit PENDANT le geste) ; `onCommit` au relâchement
 *               seulement — un passage du doigt n'est pas un essai.
 *   PISTE       toucher la piste y pose la poignée (et commence le geste) :
 *               une cible de toute la largeur, pas de 44 px seulement.
 *   DÉFILEMENT  `touch-action: none` + capture : la page ne défile pas.
 *   CLAVIER     la poignée est un `role="slider"` : flèches ±1 (en RTL, ←
 *               agrandit, puisque la grandeur pousse vers la gauche), Page
 *               ±5, Début / Fin.
 *   BOUTONS     `nudge(±1)` pour les boutons −/+ : le chemin sans glisser.
 *   PAUSE       au clavier et aux boutons, la valeur suit à chaque appui,
 *               mais l'ESSAI n'est validé qu'après une pause (`settleMs`) ou
 *               quand la poignée perd le focus — comme le relâchement du
 *               doigt. Sinon balayer 10 → 26 à la flèche comptait seize
 *               essais, et la découverte s'ouvrait sans avoir rien regardé.
 *
 * Le hook ne dessine rien et ne connaît aucune mathématique : le type fournit
 * la géométrie (`toValue`) et décide de ce que la valeur veut dire.
 *
 * @param value      la valeur courante (null : pas encore posée)
 * @param range      { min, max } entiers
 * @param toValue    (clientX, clientY, trackRect) => nombre (non arrondi)
 * @param onChange   (v) => void — pendant le geste
 * @param onCommit   (v) => void — relâchement, touche, bouton
 * @param direction  'rtl' | 'ltr' — sens dans lequel la grandeur pousse
 */
export default function useStretchInteraction({ value, range, toValue, onChange, onCommit, direction = 'rtl', pageStep = 5, settleMs = 700 }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const live = useRef(value);
  live.current = value;
  const pending = useRef(null);
  const settleTimer = useRef(null);
  useEffect(() => () => { if (settleTimer.current) clearTimeout(settleTimer.current); }, []);

  const clamp = useCallback((v) => Math.min(range.max, Math.max(range.min, Math.round(v))), [range.min, range.max]);

  const readPointer = useCallback((e) => {
    const el = trackRef.current;
    const rect = el?.getBoundingClientRect();
    if (!rect) return null;
    // L'ÉCHELLE (2026-11-09) : le lecteur de mission ajuste son contenu par `zoom` CSS (FitToArea) ; le pointeur et le rectangle sont en
    // pixels d'ÉCRAN, la géométrie du type (`toValue`) en pixels de la PISTE. On ramène le pointeur et le rectangle à l'échelle de la piste,
    // sinon la poignée ne restait pas sous le doigt dès que le zoom n'était pas 1.
    const z = el.offsetWidth > 0 && rect.width > 0 ? rect.width / el.offsetWidth : 1;
    if (!Number.isFinite(z) || Math.abs(z - 1) < 0.001) return clamp(toValue(e.clientX, e.clientY, rect));
    const local = { left: rect.left, top: rect.top, right: rect.left + rect.width / z, bottom: rect.top + rect.height / z, width: rect.width / z, height: rect.height / z, x: rect.left, y: rect.top };
    return clamp(toValue(rect.left + (e.clientX - rect.left) / z, rect.top + (e.clientY - rect.top) / z, local));
  }, [clamp, toValue]);

  const move = useCallback((v) => {
    if (v == null || v === live.current) return;
    live.current = v;
    onChange?.(v);
  }, [onChange]);

  const flush = useCallback(() => {
    if (settleTimer.current) { clearTimeout(settleTimer.current); settleTimer.current = null; }
    if (pending.current == null) return;
    const v = pending.current;
    pending.current = null;
    onCommit?.(v);
  }, [onCommit]);

  /** Poser une valeur hors glisser : suivie tout de suite, validée après une pause. */
  const set = useCallback((v) => {
    const c = clamp(v);
    move(c);
    pending.current = c;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(flush, settleMs);
  }, [clamp, move, flush, settleMs]);

  const pointerHandlers = useMemo(() => ({
    onPointerDown: (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      // Un essai au clavier en attente est validé avant que le doigt prenne la main.
      flush();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDragging(true);
      move(readPointer(e));
    },
    onPointerMove: (e) => {
      if (!dragging) return;
      move(readPointer(e));
    },
    onPointerUp: (e) => {
      if (!dragging) return;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      setDragging(false);
      const v = readPointer(e) ?? live.current;
      move(v);
      if (v != null) onCommit?.(v);
    },
    onPointerCancel: () => {
      setDragging(false);
      if (live.current != null) onCommit?.(live.current);
    },
  }), [dragging, move, readPointer, onCommit, flush]);

  const onKeyDown = useCallback((e) => {
    const cur = live.current ?? range.min;
    const grow = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const shrink = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const next = {
      [grow]: cur + 1, ArrowUp: cur + 1, [shrink]: cur - 1, ArrowDown: cur - 1,
      PageUp: cur + pageStep, PageDown: cur - pageStep, Home: range.min, End: range.max,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    // La première touche POSE la grandeur à sa valeur de départ.
    set(live.current == null ? range.min : next);
  }, [direction, pageStep, range.min, range.max, set]);

  const nudge = useCallback((delta) => set((live.current ?? range.min - (delta > 0 ? 1 : 0)) + delta), [range.min, set]);

  const trackProps = {
    ref: trackRef,
    ...pointerHandlers,
    'data-stretch-track': '',
    'data-stretch-dragging': dragging ? 'true' : undefined,
    style: { touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: dragging ? 'grabbing' : 'pointer' },
  };

  const handleProps = ({ label, valueText } = {}) => ({
    role: 'slider',
    tabIndex: 0,
    'aria-label': label,
    'aria-valuemin': range.min,
    'aria-valuemax': range.max,
    'aria-valuenow': value ?? undefined,
    'aria-valuetext': valueText,
    'aria-orientation': 'horizontal',
    'data-stretch-handle': '',
    onKeyDown,
    onBlur: flush,
  });

  return { trackProps, handleProps, dragging, nudge, set, flush };
}
