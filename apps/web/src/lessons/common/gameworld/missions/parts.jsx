/**
 * The pieces every mission screen shares: a number box, and the « on your sheet » gate (plan §9: the paper first).
 */
import { useEffect, useState } from 'react';
import { Check, PenLine } from 'lucide-react';
import { T } from './text';

export function Box({ value, onChange, label, name, w = 4, onEnter }) {
  return (
    <input
      className="ms-in ms-target"
      inputMode="numeric"
      dir="ltr"
      style={{ width: `${w + 1.6}ch` }}
      value={value ?? ''}
      aria-label={label}
      data-ms-in={name}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
      onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
    />
  );
}

/** ✍️ what to write on the REAL sheet; its boxes open only after « J’ai écrit sur ma feuille » (a few seconds must pass). */
export function Sheet({ id, text, written, onWritten, children }) {
  const [wait, setWait] = useState(3);
  useEffect(() => {
    setWait(3);
    const t = setInterval(() => setWait((w) => Math.max(0, w - 1)), 1000);
    return () => clearInterval(t);
  }, [id]);
  if (written) return children;
  return (
    <div className="ms-sheet" data-ms-sheet={id}>
      <p>
        <PenLine size={22} aria-hidden="true" />
        <b>{T.onSheet}</b> {text}
      </p>
      <button type="button" className="ms-btn ms-target" data-ms-written disabled={wait > 0} onClick={onWritten}>
        <Check size={18} aria-hidden="true" />
        {T.written(wait)}
      </button>
    </div>
  );
}

/**
 * « relie »: the question and the lines of his copy; a line he taps is tied to the question. The chips are laid from the
 * LEFT (the first one on the left), and each line starts under its chip: `chipX(i, n)`.
 */
/** Where the line of chip i of n starts, in the 0–100 width of the drawing: the middle of its chip, from the left. */
export const chipX = (i, n) => ((i + 0.5) * 100) / n;

export function Connect({ goal, items, picked, onPick }) {
  const n = items.length;
  return (
    <div className="ms-connect" data-ms-connect={goal.id}>
      <p className="ms-connect__goal">
        {goal.label} {goal.text}
      </p>
      <svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true">
        {items.map((it, i) =>
          picked.includes(it.id) ? <line key={it.id} x1={chipX(i, n)} y1="26" x2="50" y2="0" /> : null,
        )}
      </svg>
      <div className="ms-connect__items">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`ms-chip ms-target ${picked.includes(it.id) ? 'is-on' : ''}`}
            data-ms-need={it.id}
            aria-pressed={picked.includes(it.id)}
            onClick={() => onPick(it.id)}
          >
            {it.text}
          </button>
        ))}
      </div>
    </div>
  );
}
