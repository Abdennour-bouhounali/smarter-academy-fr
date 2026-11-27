import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSound } from './parts';

/**
 * THE 2D GAME LOOK — what a reader chose, kept in his browser and shared by every page of the look (« Vers le brevet »,
 * the lesson's home, the revision page): the dark or the light look, the sound, and the presentation — « Par écrans »
 * (one fixed screen at a time) or « En une page » (one page that scrolls). `?mode=page|ecrans` opens one directly.
 */
const KEYS = { theme: 'vb-theme', mode: 'vb-mode', sound: 'vb-sound' };

const read = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // a private window: the choice lasts the visit
  }
};
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* the same */
  }
};
export const query = (name) => new URLSearchParams(window.location.search).get(name);
const firstMode = () => {
  const asked = query('mode');
  return (asked ? asked === 'page' : read(KEYS.mode) === 'page') ? 'page' : 'screens';
};

export function useArcadePrefs() {
  const [theme, setTheme] = useState(() => (read(KEYS.theme) === 'light' ? 'light' : 'dark'));
  const [mode, setMode] = useState(firstMode);
  // the sound is ON unless the reader turned it off (owner, 2026-11-26: he expected to hear it)
  const [sound, setSound] = useState(() => read(KEYS.sound) !== 'off');
  const play = useSound(sound);
  const heard = useRef(sound);

  useEffect(() => write(KEYS.theme, theme), [theme]);
  useEffect(() => write(KEYS.mode, mode), [mode]);
  useEffect(() => {
    write(KEYS.sound, sound ? 'on' : 'off');
    if (sound && !heard.current) play('good'); // turning it on is heard at once
    heard.current = sound;
  }, [sound, play]);

  return { theme, setTheme, mode, setMode, sound, setSound, play };
}

/**
 * A page that scrolls, made of parts (`[data-sec="<id>"]`): it opens on `start` with no travel, says which part is under
 * the eyes (`onWhere(id)`: the last one whose top has passed the upper third of the window), and `jump(id)` goes to one.
 */
export function useScrollParts({ start, onWhere }) {
  const box = useRef(null);
  const at = useRef(null);

  useLayoutEffect(() => {
    const el = box.current;
    const sec = el?.querySelector(`[data-sec="${start}"]`);
    if (!sec || sec === el.querySelector('[data-sec]')) return;
    el.style.scrollBehavior = 'auto';
    el.scrollTop = sec.offsetTop;
    el.style.scrollBehavior = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  const watch = () => {
    const el = box.current;
    const secs = [...el.querySelectorAll('[data-sec]')];
    let now = secs[0];
    for (const sec of secs) if (sec.offsetTop <= el.scrollTop + el.clientHeight / 3) now = sec;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) now = secs.at(-1);
    if (now && now.dataset.sec !== at.current) {
      at.current = now.dataset.sec;
      onWhere(now.dataset.sec);
    }
  };
  const jump = useCallback((id) => {
    box.current?.querySelector(`[data-sec="${id}"]`)?.scrollIntoView({ block: 'start' });
  }, []);

  return { box, watch, jump };
}
