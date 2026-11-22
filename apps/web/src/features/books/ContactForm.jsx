import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitBookMessage } from './bookService';
import { S } from './strings';

const field = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-inter text-base text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const lbl = 'mb-1.5 block font-inter text-sm font-semibold text-slate-700';

const EMPTY = {
  fullName: '', email: '', phone: '', country: '', role: 'student', school: '',
  bookOwner: false, subject: 'general', message: '', consent: false, website: '',
};

/** Le formulaire de contact d'une page livre (mêmes champs que l'ancien site du livre). */
export default function ContactForm({ bookSlug }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitBookMessage({ ...form, bookSlug, phone: form.phone || null, country: form.country || null, school: form.school || null });
      setSent(true);
      setForm(EMPTY);
    } catch (caught) {
      setError(caught.message || S.contact.failed);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={40} />
        <p className="font-inter text-lg text-slate-800">{S.contact.sent}</p>
      </div>
    );
  }

  const C = S.contact;
  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div><label className={lbl} htmlFor="bc-name">{C.name}</label><input id="bc-name" required minLength={2} className={field} value={form.fullName} onChange={set('fullName')} /></div>
        <div><label className={lbl} htmlFor="bc-email">{C.email}</label><input id="bc-email" required type="email" dir="ltr" className={`${field} text-end`} value={form.email} onChange={set('email')} /></div>
        <div><label className={lbl} htmlFor="bc-phone">{C.phone}</label><input id="bc-phone" type="tel" dir="ltr" className={`${field} text-end`} value={form.phone} onChange={set('phone')} /></div>
        <div><label className={lbl} htmlFor="bc-country">{C.country}</label><input id="bc-country" className={field} value={form.country} onChange={set('country')} /></div>
        <div>
          <label className={lbl} htmlFor="bc-role">{C.role}</label>
          <select id="bc-role" className={field} value={form.role} onChange={set('role')}>
            {Object.entries(C.roles).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label className={lbl} htmlFor="bc-school">{C.school}</label><input id="bc-school" className={field} value={form.school} onChange={set('school')} /></div>
        <div className="md:col-span-2">
          <label className={lbl} htmlFor="bc-subject">{C.subject}</label>
          <select id="bc-subject" className={field} value={form.subject} onChange={set('subject')}>
            {Object.entries(C.subjects).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={lbl} htmlFor="bc-message">{C.message}</label>
          <textarea id="bc-message" required minLength={10} rows={5} className={field} value={form.message} onChange={set('message')} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-inter text-sm text-slate-700">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.bookOwner} onChange={set('bookOwner')} className="h-4 w-4" />{C.bookOwner}</label>
      </div>
      <label className="mt-3 flex items-start gap-2 font-inter text-sm text-slate-600">
        <input required type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-1 h-4 w-4" />{C.consent}
      </label>

      <div aria-hidden="true" style={{ position: 'absolute', insetInlineStart: '-9999px', height: 0, overflow: 'hidden' }}>
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} name="website" />
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-inter text-sm text-rose-700">{error}</p>}

      <button type="submit" disabled={busy} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-3.5 font-space text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
        {busy && <Loader2 size={16} className="animate-spin" />}
        {busy ? C.sending : C.submit}
      </button>
    </form>
  );
}
