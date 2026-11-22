/**
 * A PHONE HELD SIDEWAYS is a short screen (about 360–430 px high): the game's panels were drawn for 720 px. Every size of
 * the game is in `rem`, so the whole game is scaled by ONE number — the root font size — while the game is mounted
 * (owner, 2026-11-16: the pilot opens on phones). Upright, the game asks the student to turn the phone (`TurnPhone`).
 */
import { useEffect, useSyncExternalStore } from 'react';

export const SHORT_SCREEN = '(max-height: 500px)';
export const UPRIGHT_PHONE = '(max-width: 767px) and (orientation: portrait)';
/**
 * The root font size on a short screen: 13 px of 16. Tried at 11 first: the owner's real phone showed text too small
 * (2026-11-16, « font size must be always readable »). At 13 the smallest label of the game (.82rem) is still 10.7 px;
 * what no longer fits scrolls inside its box (Fit.jsx) — it is never shrunk further.
 */
const COMPACT_ROOT_PX = 13;
/** The colour behind the game: a phone shows the page's background beside its camera cut-out. */
const NIGHT = '#0b1a3a';

/** Is this a phone held sideways? For the pages that zoom themselves to the window (launch kit, « مختبري »). */
export const isShortScreen = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.(SHORT_SCREEN).matches);

function useMedia(query) {
  const subscribe = (onChange) => {
    const list = window.matchMedia?.(query);
    list?.addEventListener?.('change', onChange);
    return () => list?.removeEventListener?.('change', onChange);
  };
  return useSyncExternalStore(
    subscribe,
    () => Boolean(window.matchMedia?.(query).matches),
    () => false,
  );
}

/** Scales the game on a short screen for as long as the calling component is mounted. Returns { short, upright }. */
export function usePhoneScreen() {
  const short = useMedia(SHORT_SCREEN);
  const upright = useMedia(UPRIGHT_PHONE);
  useEffect(() => {
    if (!short) return undefined;
    const root = document.documentElement;
    const before = { size: root.style.fontSize, back: document.body.style.background, rootBack: root.style.background };
    root.style.fontSize = `${COMPACT_ROOT_PX}px`;
    root.dataset.gameCompact = '1';
    document.body.style.background = NIGHT;
    root.style.background = NIGHT;
    return () => {
      root.style.fontSize = before.size;
      document.body.style.background = before.back;
      root.style.background = before.rootBack;
      delete root.dataset.gameCompact;
    };
  }, [short]);
  return { short, upright };
}
