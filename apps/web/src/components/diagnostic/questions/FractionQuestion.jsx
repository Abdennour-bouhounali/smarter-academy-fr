import { useEffect, useState } from 'react';

function Stepper({ label, value, onChange, min, max, disabled }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] font-mono-jetbrains font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => onChange(value - 1)}
          className="w-11 h-11 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xl hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Diminuer ${label}`}
        >
          −
        </button>
        <span className="w-12 text-center font-mono-jetbrains font-extrabold text-2xl text-slate-800 tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
          className="w-11 h-11 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-xl hover:border-blue-400 hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`Augmenter ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Numerator/denominator steppers rather than free-text or LaTeX input — no
 * generic shared fraction-input widget exists yet (each lesson that needs
 * one currently builds its own local picker), and a stepper keeps this
 * touch-friendly with no keyboard, matching §6/§19 of the brief. Reports a
 * value immediately on mount since a fraction always has *some* value —
 * there's no "empty" state to wait for like a text field.
 */
export default function FractionQuestion({ question, onChange, disabled }) {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(2);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onChange({ numerator, denominator });
  }, []); // once per mount — this component remounts fresh each question via `key={question.id}`

  const update = (nextNumerator, nextDenominator) => {
    setNumerator(nextNumerator);
    setDenominator(nextDenominator);
    onChange({ numerator: nextNumerator, denominator: nextDenominator });
  };

  return (
    <div className="flex items-center justify-center gap-6 py-4" aria-label={question.prompt}>
      <Stepper label="Numérateur" value={numerator} onChange={(v) => update(v, denominator)} min={0} max={20} disabled={disabled} />
      <span className="text-3xl font-bold text-slate-300" aria-hidden="true">/</span>
      <Stepper label="Dénominateur" value={denominator} onChange={(v) => update(numerator, v)} min={1} max={20} disabled={disabled} />
    </div>
  );
}
