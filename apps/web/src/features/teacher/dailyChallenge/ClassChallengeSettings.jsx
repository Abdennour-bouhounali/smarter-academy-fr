import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { updateClassChallengeSettings } from '../../../services/teacher/dailyChallengeService';
import { btnPrimary, input } from '../../../pages/teacher/teacherUi';
import MathLabel from '../../../lessons/common/components/MathLabel';

/**
 * Un interrupteur accessible (role="switch") : l'état se lit sans la couleur
 * (« ON / OFF »). Partagé avec les réglages de l'« Espace jeux » (features/teacher/madar).
 */
export function Toggle({ checked, onChange, label, hint, disabled, name }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        data-setting={name}
        className={`relative mt-0.5 flex h-7 w-12 shrink-0 items-center rounded-full px-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2 disabled:opacity-50 ${checked ? 'justify-end bg-nav-accent' : 'justify-start bg-slate-300'}`}
      >
        <span className="inline-block h-5 w-5 rounded-full bg-white shadow" />
        <span className="sr-only">{checked ? 'ON' : 'OFF'}</span>
      </button>
      <div className="min-w-0">
        <p className="font-inter text-sm font-semibold text-slate-900">{label} <span className={`ms-1 rounded px-1.5 py-0.5 font-mono-jetbrains text-[10px] font-bold ${checked ? 'bg-nav-page text-nav-accent' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">{checked ? 'ON' : 'OFF'}</span></p>
        {hint && <p className="mt-0.5 font-inter text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

/**
 * Les réglages du défi pour CETTE classe. « la compétition de la classe » et « le
 * top 3 » sont INDÉPENDANTS : compétition active et Top 3 masqué = le
 * classement pour l'enseignant seul.
 */
export default function ClassChallengeSettings({ classGroupId, initial, options, onSaved }) {
  const { t } = useTranslation('challenge');
  const { token } = useContext(AuthContext);
  const [s, setS] = useState(initial);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (v) => { setSaved(false); setS((cur) => ({ ...cur, [key]: v })); };

  const save = async (event) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const data = await updateClassChallengeSettings(token, classGroupId, {
        enabled: s.enabled,
        competitionEnabled: s.competitionEnabled,
        showTop3: s.showTop3,
        showResultsToClass: s.showResultsToClass,
        questionCount: Number(s.questionCount),
        difficulty: s.difficulty || null,
        lessonCodes: s.lessonCodes,
        availableFrom: s.availableFrom,
        availableUntil: s.availableUntil,
      });
      setS(data.settings);
      setSaved(true);
      onSaved?.(data.settings);
    } catch (e) {
      setError(t(`teacher.settings.errors.${e?.reason ?? 'generic'}`, { defaultValue: t('teacher.settings.errors.generic') }));
    } finally {
      setPending(false);
    }
  };

  const toggleLesson = (code) => set('lessonCodes')(s.lessonCodes.includes(code) ? s.lessonCodes.filter((c) => c !== code) : [...s.lessonCodes, code]);

  return (
    <form onSubmit={save} className="max-w-3xl" data-challenge-settings>
      {!options.globallyEnabled && <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-900">{t('teacher.settings.globallyDisabled')}</p>}

      <div className="mt-2 divide-y divide-slate-100">
        <Toggle name="enabled" checked={s.enabled} onChange={set('enabled')} label={t('teacher.settings.enabled')} hint={t('teacher.settings.enabledHint')} />
        <Toggle name="competitionEnabled" checked={s.competitionEnabled} onChange={set('competitionEnabled')} label={t('teacher.settings.competition')} hint={t('teacher.settings.competitionHint')} disabled={!s.enabled} />
        <Toggle name="showTop3" checked={s.showTop3} onChange={set('showTop3')} label={t('teacher.settings.top3')} hint={t('teacher.settings.top3Hint')} disabled={!s.enabled || !s.competitionEnabled} />
        <Toggle name="showResultsToClass" checked={s.showResultsToClass} onChange={set('showResultsToClass')} label={t('teacher.settings.showResults')} disabled={!s.enabled} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-800">{t('teacher.settings.questionCount')}</span>
          <select value={s.questionCount} onChange={(e) => set('questionCount')(Number(e.target.value))} className={input} data-question-count>
            {options.questionCounts.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-800">{t('teacher.settings.difficulty')}</span>
          <select value={s.difficulty ?? ''} onChange={(e) => set('difficulty')(e.target.value || null)} className={input}>
            <option value="">{t('teacher.settings.difficulties.adaptive')}</option>
            {options.difficulties.map((d) => <option key={d} value={d}>{t(`teacher.settings.difficulties.${d}`)}</option>)}
          </select>
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-slate-800">{t('teacher.settings.window')}</legend>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{t('teacher.settings.from')}</span>
            <input type="time" dir="ltr" value={s.availableFrom} onChange={(e) => set('availableFrom')(e.target.value)} className={`${input} max-w-[9rem]`} />
            <span className="text-xs text-slate-500">{t('teacher.settings.until')}</span>
            <input type="time" dir="ltr" value={s.availableUntil} onChange={(e) => set('availableUntil')(e.target.value)} className={`${input} max-w-[9rem]`} />
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold text-slate-800">{t('teacher.settings.scope')}</legend>
          {/* 74 lessons as chips made the form 4,000 px tall: the choice is a short box that scrolls, closed while « all lessons ». */}
          <details className="rounded-xl border border-nav-line" open={s.lessonCodes.length > 0} data-challenge-scope>
            <summary className="flex min-h-[44px] cursor-pointer items-center px-3 text-sm font-bold text-nav-accent">
              {s.lessonCodes.length === 0 ? t('teacher.settings.scopeAll') : <span dir="ltr">{s.lessonCodes.length}{'\u00A0/\u00A0'}{options.lessons.length}</span>}
            </summary>
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto border-t border-nav-line p-3">
            {options.lessons.map((l) => {
              const on = s.lessonCodes.includes(l.code);
              return (
                <button key={l.code} type="button" aria-pressed={on} onClick={() => toggleLesson(l.code)}
                  className={`min-h-[36px] rounded-full border px-3 text-xs font-semibold ${on ? 'border-nav-accent bg-nav-page text-nav-accent' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
                  {on ? '✓ ' : ''}<MathLabel>{l.title}</MathLabel>
                </button>
              );
            })}
          </div>
          </details>
        </fieldset>
      </div>

      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      {saved && <p role="status" className="mt-3 text-sm text-emerald-700">✓ {t('teacher.settings.saved')}</p>}
      <button type="submit" disabled={pending} className={`${btnPrimary} mt-4`} data-save-settings>{pending ? t('teacher.settings.saving') : t('teacher.settings.save')}</button>
    </form>
  );
}
