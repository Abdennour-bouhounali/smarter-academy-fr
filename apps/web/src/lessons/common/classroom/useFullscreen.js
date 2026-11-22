import { useCallback, useEffect, useState } from 'react';

/**
 * L'API Fullscreen du navigateur, avec l'orthographe WebKit, ou `null` quand
 * le navigateur n'en a aucune (Safari iOS sur autre chose qu'une vidéo).
 * Calculée à la demande : `document` n'existe pas au rendu serveur.
 */
function fullscreenApi() {
  if (typeof document === 'undefined') return null;
  if (document.fullscreenEnabled && typeof document.exitFullscreen === 'function') {
    return {
      request: (el) => el.requestFullscreen({ navigationUI: 'hide' }),
      exit: () => document.exitFullscreen(),
      current: () => document.fullscreenElement,
      events: ['fullscreenchange', 'fullscreenerror'],
    };
  }
  if (document.webkitFullscreenEnabled && typeof document.webkitExitFullscreen === 'function') {
    return {
      request: (el) => Promise.resolve(el.webkitRequestFullscreen()),
      exit: () => Promise.resolve(document.webkitExitFullscreen()),
      current: () => document.webkitFullscreenElement,
      events: ['webkitfullscreenchange', 'webkitfullscreenerror'],
    };
  }
  return null;
}

/**
 * Le VRAI plein écran du navigateur sur un élément (brief §5).
 *
 * `isFullscreen` suit l'état RÉEL du document — l'événement `fullscreenchange`
 * est la seule source de vérité : Échap, la touche F11, le geste système ou
 * le retrait de l'onglet sortent du plein écran sans passer par nous, et
 * l'état doit le refléter.
 *
 *   request()  demande le plein écran sur `targetRef.current` ; résout `true`
 *              si le navigateur l'a ACCEPTÉ (pas d'exception), `false` sinon
 *              — refus (politique d'iframe, pas de geste utilisateur), API
 *              absente, élément absent. Ne jette jamais.
 *   exit()     quitte le plein écran si un élément y est ; ne jette jamais.
 *
 * Aucun style, aucun verrou de défilement : c'est ClassroomPresentation qui
 * décide de ce qu'on fait de l'état.
 */
export function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported] = useState(() => fullscreenApi() !== null);

  useEffect(() => {
    const api = fullscreenApi();
    if (!api) return undefined;
    const sync = () => {
      const el = targetRef.current;
      setIsFullscreen(Boolean(el) && api.current() === el);
    };
    for (const ev of api.events) document.addEventListener(ev, sync);
    return () => { for (const ev of api.events) document.removeEventListener(ev, sync); };
  }, [targetRef]);

  const request = useCallback(async () => {
    const api = fullscreenApi();
    const el = targetRef.current;
    if (!api || !el) return false;
    try {
      await api.request(el);
      return true;
    } catch {
      return false;
    }
  }, [targetRef]);

  const exit = useCallback(async () => {
    const api = fullscreenApi();
    if (!api || !api.current()) return;
    try {
      await api.exit();
    } catch {
      // L'événement de changement (ou l'absence de plein écran) règle l'état.
    }
  }, []);

  return { supported, isFullscreen, request, exit };
}
