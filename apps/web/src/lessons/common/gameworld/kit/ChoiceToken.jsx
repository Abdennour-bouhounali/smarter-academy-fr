/**
 * A CHOICE inside a written answer — pick one of a few written options (« agrandissement / réduction », a condition, a segment name
 * inside a fraction). It names no lesson. Two screens draw it: the last step of a forge (`RuleForge.jsx › UseLines`, a
 * token `{ choice, label, options: [{ id, text }] }` — `authoring/forgeBlocks.js › choiceBox`) and the trainer's exam form
 * (`Trainer.jsx › FormLines`, a token `{ choice, options: [{ value, text, id? }], buttons: true }`).
 *
 * It is a radio group of buttons, all visible at once (never a menu to open): a click picks one; the keyboard moves with
 * the arrows (in reading order: → goes forward on a left-to-right line, the default), Home / End, and Tab enters on the picked one.
 * Hooks a walk drives: `data-kit-choice=<name>` on the group (with `data-kit-chosen=<id>`, '' while none), and
 * `data-kit-option=<id>` on each button (`aria-checked`). Its look is `kit-choice` (styles/trainer.css), sized by each
 * screen; the text never goes under 12 px.
 */
import { useRef } from 'react';

/**
 * Where a key sends the focus (and the pick) from option i of `count`: the arrows in READING order (on a right-to-left
 * line ← is forward; a line is left to right unless told), round the ends; Home, End; null for any other key.
 */
export function choiceStep(key, i, count, dir = 'ltr') {
  const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  const step = { ArrowDown: 1, ArrowUp: -1, [forward]: 1, [back]: -1 }[key];
  if (step) return (i + step + count) % count;
  if (key === 'Home') return 0;
  return key === 'End' ? count - 1 : null;
}

export default function ChoiceToken({ name, label, options, value, onPick, disabled = false, dir = 'ltr' }) {
  const refs = useRef([]);
  const at = options.findIndex((o) => o.id === value);
  const move = (e, i) => {
    const to = choiceStep(e.key, i, options.length, dir);
    if (to == null) return;
    e.preventDefault();
    onPick(options[to].id);
    refs.current[to]?.focus();
  };
  return (
    <span
      className="kit-choice"
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      dir={dir}
      data-kit-choice={name}
      data-kit-chosen={value ?? ''}
    >
      {options.map((o, i) => (
        <button
          key={o.id}
          ref={(el) => (refs.current[i] = el)}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          tabIndex={i === (at < 0 ? 0 : at) ? 0 : -1}
          className={o.id === value ? 'is-on' : undefined}
          disabled={disabled}
          dir="auto"
          onClick={() => onPick(o.id)}
          onKeyDown={(e) => move(e, i)}
          data-kit-option={o.id}
        >
          {o.text}
        </button>
      ))}
    </span>
  );
}
