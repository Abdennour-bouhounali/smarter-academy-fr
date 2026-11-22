import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { liveNameError, nameError } from '../../utils/personName';

const INPUT =
  'block h-12 w-full appearance-none rounded-xl border ps-4 pe-10 text-[15px] text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-4 bg-white text-start disabled:opacity-60';

/**
 * « الاسم و اللقب » — the ONE pair of name inputs, wherever a name is written:
 * the register form, the Google confirmation step, the onboarding step for an
 * account that has no name yet, and the student/teacher profile editors.
 *
 * Controlled: `value = { firstName, lastName }`, `onChange(next)` receives the
 * whole pair. Names are written in ARABIC letters (PersonName on the server).
 *
 * Validation is LIVE: a Latin letter, a digit or a symbol is flagged as it is
 * typed (`notArabic` / `invalid`); `required` / `tooShort` wait until the field
 * is left, so nobody is scolded after their first letter. A valid field shows
 * a check. `errors` (codes from a submit attempt) wins over the live code.
 * `lang="ar"` hints mobile keyboards toward Arabic.
 *
 * @param {{
 *   value: {firstName: string, lastName: string},
 *   onChange: (next: {firstName: string, lastName: string}) => void,
 *   errors?: {firstName?: string, lastName?: string},
 *   disabled?: boolean,
 *   idPrefix?: string,
 *   autoFocus?: boolean,
 *   tone?: 'blue'|'teal',
 *   hint?: string|null,
 * }} props
 */
export default function PersonNameFields({
  value,
  onChange,
  errors = {},
  disabled = false,
  idPrefix = 'person',
  autoFocus = false,
  tone = 'blue',
  hint,
}) {
  const { t } = useTranslation('auth');
  const [touched, setTouched] = useState({});
  const focus = tone === 'teal' ? 'focus:border-teal-600 focus:ring-teal-500/15' : 'focus:border-nav-accent focus:ring-nav-accent/15';

  const field = (key, autoComplete, label, placeholder, focusFirst) => {
    const id = `${idPrefix}-${key}`;
    const raw = value[key] ?? '';
    const error = errors[key] || liveNameError(raw, { touched: touched[key] });
    const valid = !error && raw.trim() !== '' && nameError(raw) === null;
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="relative mt-1.5">
        <input
          id={id}
          name={key}
          type="text"
          lang="ar"
          dir="rtl"
          // aria-required, not `required`: the browser's own bubble would
          // speak the browser's language; utils/personName.js answers in Arabic.
          aria-required="true"
          maxLength={60}
          autoComplete={autoComplete}
          autoFocus={focusFirst}
          placeholder={placeholder}
          value={raw}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, [key]: true }))}
          className={`${INPUT} ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-400/15' : valid ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/15' : `border-slate-300 ${focus}`}`}
        />
        {valid && (
          <Check size={16} aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-3 my-auto text-emerald-500" />
        )}
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
            {t(`name.errors.${error}`)}
          </p>
        )}
      </div>
    );
  };

  return (
    <fieldset>
      <legend className="sr-only">{t('name.sectionTitle')}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('firstName', 'given-name', t('name.firstLabel'), t('name.firstPlaceholder'), autoFocus)}
        {field('lastName', 'family-name', t('name.lastLabel'), t('name.lastPlaceholder'), false)}
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint === null ? t('name.hintArabic') : hint ?? t('name.hint')}</p>
    </fieldset>
  );
}
