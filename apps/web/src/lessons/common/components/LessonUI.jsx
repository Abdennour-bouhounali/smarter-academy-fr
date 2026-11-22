import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Volume2, VolumeX } from 'lucide-react';
import MathLabel from './MathLabel';

/**
 * Shared interface bricks still used by the diagnostic, the thinking lab and their questions. Every Tailwind class is
 * written out in full (no interpolation) so the build detects it.
 *
 * Validation convention (any screen that uses ValidateButton to fire onSolved): the success condition is recomputed at
 * each render from the current state — never kept in a « reached once » flag that would stay true after the student
 * moves away from the target.
 */

/* ── Choix multiples ──────────────────────────────────────────────── */
export function ChoiceGrid({
  options,
  selected,
  onSelect,
  revealed = false,
  correctIndex,
  cols = 2,
  disabled = false,
  renderOption,
  order,          // optionnel : ordre d'AFFICHAGE (indices d'options) ; `selected`,
                  // `correctIndex` et `onSelect` restent dans l'indexation de l'auteur
}) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const shown = order && order.length === options.length ? order : options.map((_, i) => i);

  return (
    <div className={`grid ${grid} gap-2`} role="group">
      {shown.map((i) => {
        const opt = options[i];
        const isSel = selected === i;
        const isRight = revealed && i === correctIndex;
        const isWrongPick = revealed && isSel && i !== correctIndex;

        const tone = isRight
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
          : isWrongPick
          ? 'bg-rose-50 border-rose-400 text-rose-800'
          : revealed
          ? 'bg-slate-50 border-slate-200 text-slate-400'
          : isSel
          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-300'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50';

        return (
          <button
            key={i}
            type="button"
            onClick={() => !revealed && !disabled && onSelect(i)}
            disabled={revealed || disabled}
            aria-pressed={isSel}
            className={`text-start px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${tone}`}
          >
            <span className="flex items-center gap-2">
              {isRight && <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />}
              {isWrongPick && <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{renderOption ? renderOption(opt) : (typeof opt === 'string' ? <MathLabel>{opt}</MathLabel> : opt)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Bouton de validation ─────────────────────────────────────────── */
export function ValidateButton({ onClick, disabled, children, tone = 'blue' }) {
  const { t } = useTranslation('lesson');
  const tones = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    slate: 'bg-slate-800 hover:bg-slate-900',
    cyan: 'bg-cyan-600 hover:bg-cyan-700',
    teal: 'bg-teal-600 hover:bg-teal-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white transition-all shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
        disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : tones[tone]
      }`}
    >
      {children ?? t('question.validate')}
    </button>
  );
}

/* ── Saisie d'un entier ───────────────────────────────────────────── */
export function NumberField({ value, onChange, onEnter, placeholder = '?', ariaLabel, width = 'w-full', size = 'lg' }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter) onEnter();
      }}
      className={`${width} border-2 border-slate-300 rounded-xl px-3 py-2.5 font-mono tabular-nums text-center text-slate-800 transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
        size === 'lg' ? 'text-xl min-h-[52px]' : 'text-base min-h-[44px]'
      }`}
    />
  );
}

/* ── Interrupteur son + vibrations (préférence appareil) ──────────── */
export function EffectsToggle({ enabled, onToggle }) {
  const { t } = useTranslation('lesson');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? t('effects.disable') : t('effects.enable')}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-colors text-xs font-mono font-bold min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {enabled ? <Volume2 className="w-3.5 h-3.5" aria-hidden="true" /> : <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />}
      <span className="inline">{enabled ? t('effects.on') : t('effects.off')}</span>
    </button>
  );
}
