import { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createClock, drain, step, surfaceFor } from './studyClock';
import { isDeadTokenError, registerStudyTimeFlusher, sendStudyTime } from '../../services/studyTimeService';

const TICK_MS = 5_000;
const FLUSH_MS = 60_000;
const INPUT_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'];

/** La page a-t-elle la main ? Un <iframe> de la page qui a le focus compte comme elle. */
function pageFocused() {
  return document.hasFocus() || document.activeElement?.tagName === 'IFRAME';
}

/**
 * Le TEMPS RÉEL d'étude de l'élève (docs/architecture/PARENT_SPACE.md §3) —
 * un composant nul, monté UNE fois sous le routeur (App.jsx), pour les comptes
 * élève vérifiés seulement.
 *
 * Il fait avancer l'horloge pure (studyClock.js) toutes les 5 s et à chaque
 * changement de visibilité / focus / page, et envoie les secondes au serveur
 * toutes les minutes et quand la page se cache (`keepalive` : le battement
 * survit à la fermeture de l'onglet). Un envoi raté est remis dans l'horloge.
 * Ce que l'élève voit dans « ما يراه وليّك » est ce que ces battements ont écrit.
 */
export default function StudyTimeTracker() {
  const { user, token } = useContext(AuthContext);
  const { pathname } = useLocation();
  const enabled = user?.role === 'student' && user?.emailVerified !== false && !!token;

  const surface = useRef(surfaceFor(pathname));
  const clock = useRef(null);
  const lastInputAt = useRef(Date.now());
  const advance = useRef(() => {});

  // Le temps écoulé appartient à la page QUITTÉE : on avance, puis on change.
  useEffect(() => {
    advance.current();
    surface.current = surfaceFor(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return undefined;
    clock.current = createClock(Date.now());
    lastInputAt.current = Date.now();
    let dead = false;

    const tick = () => {
      clock.current = step(clock.current, {
        now: Date.now(),
        visible: document.visibilityState === 'visible',
        focused: pageFocused(),
        lastInputAt: lastInputAt.current,
        surface: surface.current,
      });
    };
    advance.current = tick;

    const flush = () => {
      tick();
      const { clock: rest, segments } = drain(clock.current);
      clock.current = rest;
      if (segments.length === 0 || dead) return Promise.resolve();
      return sendStudyTime(token, segments).catch((error) => {
        // Jeton refusé : on n'insiste pas (la session sera nettoyée par `/me`).
        if (isDeadTokenError(error)) { dead = true; return; }
        // Remis dans l'horloge : le prochain battement les reportera.
        const buckets = { ...clock.current.buckets };
        for (const s of segments) {
          const b = { active: 0, idle: 0, away: 0, leaves: 0, ...buckets[s.surface] };
          buckets[s.surface] = {
            active: b.active + s.active * 1000,
            idle: b.idle + s.idle * 1000,
            away: b.away + s.away * 1000,
            leaves: b.leaves + s.leaves,
          };
        }
        clock.current = { ...clock.current, buckets };
      });
    };

    const onInput = () => { lastInputAt.current = Date.now(); };
    const onVisibility = () => (document.visibilityState === 'hidden' ? flush() : tick());
    const onFocusChange = () => { onInput(); tick(); };

    for (const e of INPUT_EVENTS) window.addEventListener(e, onInput, { passive: true, capture: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', tick);
    window.addEventListener('focus', onFocusChange);
    window.addEventListener('pagehide', flush);
    const tickTimer = window.setInterval(tick, TICK_MS);
    const flushTimer = window.setInterval(flush, FLUSH_MS);
    registerStudyTimeFlusher(flush);

    return () => {
      registerStudyTimeFlusher(null);
      flush();
      advance.current = () => {};
      for (const e of INPUT_EVENTS) window.removeEventListener(e, onInput, { capture: true });
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', tick);
      window.removeEventListener('focus', onFocusChange);
      window.removeEventListener('pagehide', flush);
      window.clearInterval(tickTimer);
      window.clearInterval(flushTimer);
    };
  }, [enabled, token]);

  return null;
}
