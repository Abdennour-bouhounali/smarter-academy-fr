/**
 * NO SCROLLING ANYWHERE (owner rule; again on 2026-11-15: « the student must never scroll »).
 * `Fit` is the box every panel of the game world puts its content in: it never scrolls and never cuts — when the content is
 * taller than the room it has, the content is scaled down just enough to fit (and grows back when there is room again).
 * It is the last resort: a panel first shows less (compact head, one step at a time); Fit guarantees the rest.
 * ONE EXCEPTION — a phone held sideways (engine/phoneScreen.js › SHORT_SCREEN): shrinking a page made for 720 px into
 * 390 px gives text nobody can read, so there the content is never scaled below PHONE_FLOOR and the box scrolls instead
 * (`data-di-fit-scroll`). Readable beats unscrolled on a phone; nothing changes on a tablet or a laptop.
 *   room: by default the height of the box itself (a flex child with a fixed share); `avail(box)` gives it otherwise
 *         (`cardRoom` for a pop-up card whose height follows its content).
 *   floor: the 12 px floor KEPT while the box shrinks (GAME_WORLD.md « 12 px floor »): the box sets `--di-min-font` on its
 *         content to `floor` px in the units of EVERY zoom above the text (its own × the frames around it), so a size written
 *         `max(var(--di-min-font, 12px), …)` is still drawn at `floor` px or more. The floored text then no longer shrinks
 *         with the box: only the rest does (paddings, gaps, widgets) — when that is not enough the box reaches `min` and
 *         its end is cut, which the walks report. Off by default: the panels of the world are laid out not to need it.
 *   onShort: called when the box is at `min` and its content is STILL taller than the room (it would be cut): its owner then
 *         shows less at once — the exam sitting turns its answer sheet into leaves (ExamSittingLeaves.jsx). `version`: a
 *         change of what is shown that keeps the same DOM (a leaf hidden, another shown), so the box may grow back.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { SHORT_SCREEN } from '../engine/phoneScreen';

const PHONE_FLOOR = 0.9;

export default function Fit({
  className = '',
  innerClass = '',
  avail = null,
  min = 0.5,
  floor = 0,
  onShort = null,
  version = '',
  children,
  ...rest
}) {
  const outer = useRef(null);
  const inner = useRef(null);
  const zr = useRef(1);
  const [z, setZ] = useState(1);
  const [around, setAround] = useState(1); // the zoom of the frames above the box (a sheet zoomed to the window)
  const [scrolls, setScrolls] = useState(false);
  const room = useRef(avail);
  room.current = avail;
  const floorOn = useRef(floor > 0);
  floorOn.current = floor > 0;
  const short = useRef(onShort);
  short.current = onShort;
  const ver = useRef(version);
  ver.current = version;
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || typeof ResizeObserver === 'undefined') return undefined;
    let raf = 0;
    // The scale that last overflowed, for the content it overflowed with: growing back never reaches it again. Without this a
    // text in columns loops for ever (a smaller scale re-wraps the lines, the box looks roomy, it grows, it overflows…).
    let cap = { z: 1.001, sig: '' };
    const fit = () => {
      const have = room.current ? room.current(o) : o.getBoundingClientRect().height;
      const need = i.getBoundingClientRect().height;
      if (!(have > 0) || !(need > 0)) return;
      if (floorOn.current) {
        let a = 1;
        for (let x = o; x && x.nodeType === 1; x = x.parentElement) a *= parseFloat(getComputedStyle(x).zoom) || 1;
        setAround((old) => (Math.abs(old - a) > 0.001 ? a : old));
      }
      const sig = `${Math.round(have / 8)}|${i.textContent.length}|${i.querySelectorAll('*').length}|${ver.current}`;
      if (sig !== cap.sig) cap = { z: 1.001, sig };
      const cur = zr.current;
      const ratio = have / need;
      let next = cur;
      const floor = window.matchMedia?.(SHORT_SCREEN).matches ? PHONE_FLOOR : min;
      setScrolls(floor === PHONE_FLOOR && cur * ratio * 0.985 < floor);
      // too tall by more than a pixel (a 0.5 % dead band alone let a 685 px sheet stand cut in a 682 px box)
      if (ratio < 0.995 || need > have + 1) {
        cap = { z: cur, sig };
        next = Math.max(floor, cur * ratio * 0.985);
      } // too tall: shrink just enough
      else if (cur < 1 && ratio > 1.08) next = Math.min(1, cap.z - 0.03, cur * ratio * 0.97); // room again: grow back, below what overflowed
      if (next > cur + 0.004 || next < cur - 0.004) {
        zr.current = next;
        setZ(next);
      } else if (short.current && floor === min && cur <= min + 0.004 && need > have + 1) {
        // at the smallest scale and still too tall: the box would be cut — its owner shows less at once (onShort)
        short.current({ have, need, box: o, inner: i });
      }
    };
    const later = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    const ro = new ResizeObserver(later);
    ro.observe(o);
    ro.observe(i);
    window.addEventListener('resize', later);
    fit();
    // a card that has just opened may still be growing when it is first measured (an icon that arrives, a line that
    // appears with its animation) and, held to the card's height, its box no longer changes size with it: look twice more
    const again = [setTimeout(later, 250), setTimeout(later, 900)];
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      again.forEach(clearTimeout);
      window.removeEventListener('resize', later);
    };
  }, [min]);
  return (
    <div
      ref={outer}
      className={`di-fitbox ${className}`}
      data-di-fitbox
      data-di-fitz={z.toFixed(2)}
      data-di-fit-scroll={scrolls ? '' : undefined}
      {...rest}
    >
      <div ref={inner} className={`di-fitbox__in ${innerClass}`} style={styleOf(z, floor, around)}>
        {children}
      </div>
    </div>
  );
}

/** The inner box's style: its zoom when below 1; with a floor, the floor in the units of every zoom above the text. */
function styleOf(z, floor, around) {
  const s = z < 1 ? { zoom: z } : {};
  if (floor > 0) s['--di-min-font'] = `${Math.ceil((floor * 100) / (Math.min(z, 1) * around)) / 100}px`;
  return Object.keys(s).length ? s : undefined;
}

const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;
/** The room of a pop-up card: the height of its veil, less the paddings of the veil and of the card. */
export function cardRoom(box) {
  const card = box.parentElement;
  const veil = card.parentElement;
  return (
    veil.clientHeight -
    px(veil, 'paddingTop') -
    px(veil, 'paddingBottom') -
    px(card, 'paddingTop') -
    px(card, 'paddingBottom') -
    6
  );
}
/** The room of the bottom panel of a case: the screen, less the order card above it. */
export function stepRoom(box) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const panel = box.parentElement;
  return window.innerHeight - 20 * rem - px(panel, 'paddingTop') - px(panel, 'paddingBottom');
}
