/**
 * THE LOADING SCREEN OF A GAME WORLD — ONE screen from the student's click to the world's title (owner, 2026-11-21:
 * « the user never feels: is there a problem with my laptop or my internet »).
 *
 * It is mounted by EVERY boundary a lesson crosses, one after the other (`lessons/LessonWaiting`, the lesson home,
 * `LessonGameWorld`, `kit/LessonWorld` while the scene is built). So that the student sees one screen and not five:
 *   - the look is the same everywhere, and it covers the WHOLE window like the world will (a portal on the body: the
 *     student's side bar never shows beside it);
 *   - ONE CLOCK per lesson, kept outside React: a new instance goes on where the last one was — the bar never goes
 *     back, and the drawing's animations start at the phase they had (`--gw-t`, a negative `animation-delay`);
 *   - the bar NEVER STANDS STILL: each stage that really ended (`stage`) lifts its floor, and between two stages it
 *     creeps toward the next one, slower and slower — it says « working », it does not invent an end;
 *   - everything that moves is `transform` / `opacity`: the browser keeps animating it while the page is busy building
 *     the 3D scene.
 * A wait that lasts is NAMED, calmly: a slow network after a few seconds, a lost connection at once (and the load goes
 * on by itself when it is back — `LessonGameWorld`), a way to try again when it lasts very long or has failed.
 * Light on purpose — React and a style sheet: the route boundary shows it, so it is in the entry bundle.
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { mathToPlain } from '../../../utils/mathPlain';
import './worldLoading.css';

const T = {
  stages: ['نفتح الدرس…', 'نجهّز عالمك…', 'نجهّز عالمك…', 'نجهّز عالمك…', 'نبني العالم…'],
  slow: 'الاتصال بطيء قليلًا. كلّ شيء يسير جيّدًا، لا تغلق الصفحة.',
  offline: 'انقطع الاتصال بالأنترنت. سنواصل وحدنا حالما يعود.',
  failed: 'تعذّر تحميل العالم. تحقّق من الاتصال بالأنترنت ثمّ حاول من جديد.',
  retry: 'حاول من جديد',
};

/** Where the bar stands when stage n has begun; the last entry is the end, reached only by the world itself. */
const FLOORS = [0.03, 0.14, 0.24, 0.74, 0.9, 1];
const CREEP_MS = 6000;
const SLOW_AFTER_MS = 8000;
const RETRY_AFTER_MS = 30000;
/** A clock nobody has looked at for this long belonged to an earlier visit: the next one starts from nothing. */
const STALE_MS = 3000;

const clock = { lessonId: null, startedAt: 0, stage: 0, stageAt: 0, shown: 0, seenAt: 0 };
const now = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

/** Reads the lesson's clock (starting it when it is new) and moves it to `stage` — a stage never goes back. */
export function readWorldClock(lessonId, stage, at = now()) {
  if (clock.lessonId !== lessonId || at - clock.seenAt > STALE_MS) {
    Object.assign(clock, { lessonId, startedAt: at, stage: 0, stageAt: at, shown: 0 });
  }
  clock.seenAt = at;
  if (stage > clock.stage) Object.assign(clock, { stage, stageAt: at });
  const floor = FLOORS[clock.stage];
  const cap = FLOORS[clock.stage + 1] - 0.02;
  const crept = floor + (cap - floor) * (1 - Math.exp(-(at - clock.stageAt) / CREEP_MS));
  clock.shown = Math.max(clock.shown, crept);
  return { stage: clock.stage, shown: clock.shown, elapsed: at - clock.startedAt };
}

/** An empty line keeps its height: nothing jumps when the title or a note arrives. */
const NBSP = '\u00a0';
const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

/**
 * @param {string} lessonId  whose clock this screen reads
 * @param {string} [title]   the lesson's name — unknown until its config has arrived (its line keeps its height)
 * @param {number} [stage]   0 the lesson opens · 1 the world is asked for · 2 its light parts are here, its code (the
 *                           heavy part) still travels · 3 its code is here · 4 the scene is built
 * @param {boolean} [failed] the load gave up: a sentence and « حاول من جديد »
 * @param {boolean} [leaving] the world is ready beneath: the screen fades and lets every click through
 * @param {boolean} [over]   inside the world's own root (above its canvas)
 */
export default function WorldLoading({ lessonId, title, stage = 0, failed = false, leaving = false, over = false }) {
  const [view, setView] = useState(() => readWorldClock(lessonId, stage));
  const [phase] = useState(() => view.elapsed / 1000);
  const [offline, setOffline] = useState(isOffline);

  useEffect(() => {
    if (failed || leaving) return undefined;
    setView(readWorldClock(lessonId, stage));
    const id = setInterval(() => setView(readWorldClock(lessonId, stage)), 250);
    return () => clearInterval(id);
  }, [lessonId, stage, failed, leaving]);

  useEffect(() => {
    const sync = () => setOffline(isOffline());
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  const note = failed ? null : offline ? T.offline : view.elapsed > SLOW_AFTER_MS ? T.slow : null;
  const canRetry = failed || view.elapsed > RETRY_AFTER_MS;
  const mark = leaving ? {} : { 'data-gw-loading': failed ? 'failed' : view.stage };

  const screen = (
    <div
      className={`gw-loading${over ? ' gw-loading--over' : ''}${leaving ? ' gw-loading--leaving' : ''}`}
      dir="rtl"
      role={leaving ? undefined : 'status'}
      aria-live={leaving ? undefined : 'polite'}
      aria-hidden={leaving || undefined}
      style={{ '--gw-t': `${-phase}s` }}
      {...mark}
    >
      <div className="gw-loading__sky" aria-hidden="true" />
      <div className="gw-loading__box">
        <svg className="gw-loading__art" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="gw-loading__halo" cx="100" cy="100" r="62" />
          <g className="gw-loading__orbit">
            <circle cx="100" cy="22" r="5" />
            <circle cx="167.5" cy="139" r="4" />
            <circle cx="32.5" cy="139" r="3.2" />
          </g>
          <g className="gw-loading__gem">
            <path className="gw-loading__gem-top" d="M100 58 L132 92 L100 104 L68 92 Z" />
            <path className="gw-loading__gem-left" d="M68 92 L100 104 L100 146 Z" />
            <path className="gw-loading__gem-right" d="M132 92 L100 104 L100 146 Z" />
            <path className="gw-loading__gem-shine" d="M100 58 L112 92 L100 104 L88 92 Z" />
          </g>
        </svg>
        <p className="gw-loading__lesson">{title ? mathToPlain(title) : NBSP}</p>
        {failed ? (
          <p className="gw-loading__text">{T.failed}</p>
        ) : (
          <>
            <div className="gw-loading__bar" aria-hidden="true">
              <i style={{ width: `${Math.round(view.shown * 1000) / 10}%` }} />
            </div>
            <p className="gw-loading__text">{T.stages[view.stage]}</p>
          </>
        )}
        <p className="gw-loading__note" data-gw-note={note ? (offline ? 'offline' : 'slow') : undefined}>
          {note || NBSP}
        </p>
        {canRetry && !leaving && (
          <button type="button" className="gw-loading__retry" onClick={() => window.location.reload()} data-gw-retry>
            {T.retry}
          </button>
        )}
      </div>
    </div>
  );
  // inside the world's root it covers the canvas; anywhere else it covers the window (no document: a server render)
  return over || typeof document === 'undefined' ? screen : createPortal(screen, document.body);
}
