import { Check, Play, Lock, EyeOff } from 'lucide-react';

/**
 * What the lesson CARD, the lesson ROW and the unit page's lesson line share: ONE reading of a lesson's state, in the
 * nine `nav-*` colours — amber = now, green = done — and never colour alone (✓ ▶ always go with it).
 */

/** « 64 min » of the catalogue → 64. `null` when the catalogue gives no number. */
export function minutesOf(duration) {
  const n = Number.parseInt(duration, 10);
  return Number.isFinite(n) ? n : null;
}

/** done · now · start · locked · hidden · soon — from the tile state and the progress. */
export function tileKind(state, progressPercent) {
  if (state !== 'open') return state;
  if (progressPercent >= 100) return 'done';
  return progressPercent > 0 ? 'now' : 'start';
}

const DOT = {
  done: { className: 'bg-nav-done-soft text-nav-done', Icon: Check },
  now: { className: 'bg-nav-now text-[#2a1c02]', Icon: Play },
  start: { className: 'border-2 border-nav-accent text-nav-accent', Icon: Play },
  idle: { className: 'border-2 border-nav-line text-nav-ink', Icon: null },
  locked: { className: 'bg-nav-page text-nav-muted', Icon: Lock },
  hidden: { className: 'bg-nav-page text-nav-muted', Icon: EyeOff },
  soon: { className: 'border-2 border-dashed border-nav-line text-transparent', Icon: null },
};

export function StatusDot({ kind, children = null, size = 'h-7 w-7' }) {
  const { className, Icon } = DOT[kind] ?? DOT.soon;
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${size} ${className}`}
      data-tile-kind={kind}
      aria-hidden="true"
    >
      {children ?? (Icon && <Icon size={13} strokeWidth={3} />)}
    </span>
  );
}

/** The thin line at the bottom of a tile: how far the lesson is. Nothing at 0. */
export function ProgressLine({ percent }) {
  if (!percent) return null;
  return (
    <span className="absolute inset-x-0 bottom-0 h-1 bg-nav-line" aria-hidden="true">
      <span
        className={`block h-full ${percent >= 100 ? 'bg-nav-done' : 'bg-nav-now'}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </span>
  );
}
