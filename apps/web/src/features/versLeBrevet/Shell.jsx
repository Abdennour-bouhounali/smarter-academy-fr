import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { T } from './text';
import './versLeBrevet.css';

/**
 * THE 2D GAME LOOK — the frame of every page of it: one fixed screen on the body itself (the layout around the address
 * would clip it), a top bar — the segments of the path, the title, what the page adds (`actions`), the sound, the
 * presentation switch (when the page has the two: `onMode`) and the dark/light switch — then the page's own middle.
 *
 * `home` (`{ to, label }`) is the way back to the page's home, first in the bar (owner, 2026-11-26).
 * `segs` is the path: one of '' | 'on' | 'done' per part; with `onSeg` a segment is a button that goes to its part.
 */
export function ArcadeShell({
  prefs,
  home,
  segs = [],
  segNames = [],
  onSeg,
  title,
  pill,
  actions,
  onMode,
  children,
  ...rest
}) {
  const { theme, setTheme, mode, sound, setSound } = prefs;
  const page = mode === 'page';
  return createPortal(
    <div className="vb" data-theme={theme} data-mode={onMode ? mode : undefined} {...rest}>
      <header className="vb-hud">
        {segs.length > 0 && (
          <div
            className="vb-segs"
            style={{ gridTemplateColumns: `repeat(${segs.length}, 1fr)` }}
            aria-hidden={onSeg ? undefined : 'true'}
          >
            {segs.map((state, i) =>
              onSeg ? (
                <button
                  type="button"
                  key={i}
                  className={state && `is-${state}`}
                  aria-label={segNames[i]}
                  title={segNames[i]}
                  onClick={() => onSeg(i)}
                />
              ) : (
                <i key={i} className={state && `is-${state}`} />
              ),
            )}
          </div>
        )}
        <div className="vb-hud__row">
          {home && (
            <Link to={home.to} className="vb-pill vb-home" data-arcade-home>
              ← {home.label}
            </Link>
          )}
          <span className="vb-hud__title">{title}</span>
          {pill && <span className="vb-pill vb-pill--name">{pill}</span>}
          <span className="vb-grow" />
          {actions}
          <button type="button" className="vb-pill vb-toggle" aria-pressed={sound} onClick={() => setSound((v) => !v)}>
            {sound ? T.soundOn : T.soundOff}
          </button>
          {onMode && (
            <div className="vb-switch" role="group" aria-label={T.mode} data-mode-switch>
              <button type="button" aria-pressed={!page} onClick={() => onMode('screens')}>
                {T.modeScreens}
              </button>
              <button type="button" aria-pressed={page} onClick={() => onMode('page')}>
                {T.modePage}
              </button>
            </div>
          )}
          <div className="vb-switch" role="group" aria-label={T.theme}>
            <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
              {T.dark}
            </button>
            <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
              {T.light}
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>,
    document.body,
  );
}
