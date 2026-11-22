import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarRange } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchTerms, saveTerms } from '../../services/schoolService';
import { btnPrimary, card, errorText, field, fieldLabel } from '../../features/school/ui';

const EMPTY = [1, 2, 3].map((term) => ({ term, startsOn: '', endsOn: '' }));

/** « Réglages » : les trois trimestres de l'année (SCHOOL_ADMIN_SPACE.md §7). */
export default function SchoolSettings() {
  const { t } = useTranslation('idara');
  useDocumentMeta(t('meta.settings'));
  const { token } = useContext(AuthContext);
  const [year, setYear] = useState('');
  const [terms, setTerms] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTerms(token)
      .then((d) => {
        setYear(d.academicYear ?? '');
        if (d.terms?.length === 3) setTerms(d.terms);
      })
      .catch((e) => setMessage({ ok: false, text: errorText(t, e) }));
  }, [token, t]);

  const set = (index, key, value) => setTerms((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const d = await saveTerms(token, year, terms);
      setTerms(d.terms);
      setMessage({ ok: true, text: t('settings.saved') });
    } catch (e) {
      setMessage({ ok: false, text: errorText(t, e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-space text-2xl font-bold text-slate-900">{t('settings.title')}</h1>
      <form onSubmit={save} className={`${card} max-w-3xl space-y-4`} data-school-terms>
        <div>
          <h2 className="flex items-center gap-2 font-space font-bold text-slate-900"><CalendarRange size={18} className="text-nav-accent" aria-hidden="true" />{t('settings.termsTitle')}</h2>
          <p className="mt-1 font-inter text-sm text-slate-600">{t('settings.termsHint')}</p>
        </div>
        <div className="max-w-xs">
          <label htmlFor="terms-year" className={fieldLabel}>{t('settings.year')}</label>
          <input id="terms-year" required dir="ltr" pattern="\d{4}-\d{4}" placeholder="2026-2027" className={field} value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        {terms.map((row, i) => (
          <fieldset key={row.term} className="grid items-end gap-3 md:grid-cols-[8rem_1fr_1fr]">
            <legend className="sr-only">{t('settings.term', { n: row.term })}</legend>
            <p className="font-space font-bold text-slate-800">{t('settings.term', { n: row.term })}</p>
            <div>
              <label htmlFor={`term-${row.term}-start`} className={fieldLabel}>{t('settings.startsOn')}</label>
              <input id={`term-${row.term}-start`} type="date" required dir="ltr" className={field} value={row.startsOn} onChange={(e) => set(i, 'startsOn', e.target.value)} />
            </div>
            <div>
              <label htmlFor={`term-${row.term}-end`} className={fieldLabel}>{t('settings.endsOn')}</label>
              <input id={`term-${row.term}-end`} type="date" required dir="ltr" className={field} value={row.endsOn} onChange={(e) => set(i, 'endsOn', e.target.value)} />
            </div>
          </fieldset>
        ))}
        {message && (
          <p role={message.ok ? 'status' : 'alert'} className={`rounded-xl p-3 font-inter text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{message.text}</p>
        )}
        <button type="submit" className={btnPrimary} disabled={busy}>{busy ? t('common.saving') : t('common.save')}</button>
      </form>
    </div>
  );
}
