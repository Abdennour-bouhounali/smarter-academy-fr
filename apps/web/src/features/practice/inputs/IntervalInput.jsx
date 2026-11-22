import { useTranslation } from 'react-i18next';
import AnswerField from './AnswerField';

/**
 * Un intervalle : deux bornes et deux crochets.
 *
 * Les crochets se choisissent, ils ne se tapent pas — l'élève ne peut donc
 * pas écrire « ]3 ; +∞] », une notation impossible. Une borne laissée vide
 * vaut l'infini, et son crochet est alors forcément ouvert.
 */
function BracketToggle({ side, open, onToggle, disabled }) {
  const { t } = useTranslation('student');
  const label = side === 'lo' ? (open ? ']' : '[') : open ? '[' : ']';

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(!open)}
      disabled={disabled}
      aria-label={t('practice.field.bracket', {
        side: t(side === 'lo' ? 'practice.field.bracketLeft' : 'practice.field.bracketRight'),
        state: t(open ? 'practice.field.bracketOpen' : 'practice.field.bracketClosed'),
      })}
      className="w-11 h-11 rounded-lg border-2 border-slate-300 bg-white font-mono text-xl font-bold text-slate-700 hover:border-slate-500 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

export default function IntervalInput({ value, onChange, disabled }) {
  const { t } = useTranslation('student');
  const v = { lo: '', loOpen: true, hi: '', hiOpen: true, ...value };
  const set = (patch) => onChange({ ...v, ...patch });
  const loInfinite = String(v.lo).trim() === '';
  const hiInfinite = String(v.hi).trim() === '';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <BracketToggle side="lo" open={v.loOpen} onToggle={(o) => set({ loOpen: o })} disabled={disabled || loInfinite} />
        {loInfinite ? (
          <span className="font-mono text-lg text-slate-400 w-32 text-center">−∞</span>
        ) : null}
        <AnswerField
          value={v.lo} onChange={(x) => set({ lo: x, ...(String(x).trim() === '' ? { loOpen: true } : {}) })}
          ariaLabel={t('practice.field.lowerBound')} placeholder="−∞" width="min-w-[6rem]" disabled={disabled}
        />
        <span className="font-mono text-lg text-slate-500">;</span>
        <AnswerField
          value={v.hi} onChange={(x) => set({ hi: x, ...(String(x).trim() === '' ? { hiOpen: true } : {}) })}
          ariaLabel={t('practice.field.upperBound')} placeholder="+∞" width="min-w-[6rem]" disabled={disabled}
        />
        {hiInfinite ? (
          <span className="font-mono text-lg text-slate-400 w-32 text-center">+∞</span>
        ) : null}
        <BracketToggle side="hi" open={v.hiOpen} onToggle={(o) => set({ hiOpen: o })} disabled={disabled || hiInfinite} />
      </div>
      <p className="text-xs text-slate-500">
        {t('practice.field.intervalHint')}
      </p>
    </div>
  );
}
