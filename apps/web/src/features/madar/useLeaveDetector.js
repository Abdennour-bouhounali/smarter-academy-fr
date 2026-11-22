import { useEffect, useRef } from 'react';
import { countsAsLeft } from './madarModel';

/**
 * Détecte que l'élève quitte la page PENDANT une question : un autre onglet,
 * une autre application (`visibilitychange`), une autre fenêtre (`blur`). Au
 * retour, si l'absence a duré au moins LEAVE_MIN_MS, `onLeft(awayMs)` est
 * appelé — une notification qui s'affiche ou le clavier du téléphone ne
 * comptent pas. Inactif quand `active` est faux (question répondue).
 *
 * Un second téléphone échappe à toute page web : ce signal ne PROUVE rien,
 * il rend seulement la voie la plus facile (copier dans une IA sur le même
 * appareil) inutile — et le serveur garde le dernier mot.
 */
export function useLeaveDetector(active, onLeft) {
  const awaySince = useRef(null);
  const callback = useRef(onLeft);
  callback.current = onLeft;

  useEffect(() => {
    if (!active) return undefined;
    const away = () => {
      if (awaySince.current === null) awaySince.current = performance.now();
    };
    const back = () => {
      if (awaySince.current === null) return;
      const awayMs = Math.round(performance.now() - awaySince.current);
      awaySince.current = null;
      if (countsAsLeft(awayMs)) callback.current(awayMs);
    };
    const onVisibility = () => (document.hidden ? away() : back());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', away);
    window.addEventListener('focus', back);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', away);
      window.removeEventListener('focus', back);
      awaySince.current = null;
    };
  }, [active]);
}
