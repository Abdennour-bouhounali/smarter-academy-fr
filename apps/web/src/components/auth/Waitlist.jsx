/**
 * THE WAITING LIST — what the sign-up page shows while registrations are closed (owner, 2026-11-20: « stop the
 * register and display a message that says the platform is under test »). One sentence, an e-mail address (required),
 * then — if the person wants — a name, who they are and a French phone number; one button; then the confirmation.
 * It goes to `POST /waitlist` (apps/api › WaitlistController, which is the authority: `email` required, `name` ≤ 100,
 * `role` student / teacher / parent, `phone` a French number); the admin reads it with the contact messages.
 *
 * The request is sent from here and not through `services/authService.js › joinWaitlist`, which still sends a phone
 * and no e-mail (the Foundation agent's file — reported): when it takes `{ email, name, role, phone }`, call it.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FlaskConical, Mail, Phone } from 'lucide-react';
import AuthShell, { AuthSubmit, authInputClass } from './AuthShell';
import { apiRequest } from '../../services/apiClient';
import { apiMessage } from '../../services/apiMessage';

// The server's rules, mirrored only so the person sees which field is wrong before the round trip.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// WaitlistController::FRENCH_PHONE, character for character.
export const FRENCH_PHONE = /^(?:0|\+33 ?|0033 ?)[1-9](?:[ .-]?[0-9]{2}){4}$/;
const ROLES = ['student', 'parent', 'teacher'];

/** The body the server reads: `email` always, the optional fields only when given. */
export function waitlistPayload({ email, name, role, phone }) {
  return {
    email: email.trim(),
    ...(name.trim() ? { name: name.trim() } : {}),
    ...(role ? { role } : {}),
    ...(phone.trim() ? { phone: phone.trim() } : {}),
  };
}

/** `null` when the form may be sent, otherwise `{ field, key }` (an `auth:waitlist.*` key). */
export function waitlistError({ email, phone }) {
  if (!email.trim()) return { field: 'email', key: 'waitlist.emailRequired' };
  if (!EMAIL.test(email.trim())) return { field: 'email', key: 'waitlist.badEmail' };
  if (phone.trim() && !FRENCH_PHONE.test(phone.trim())) return { field: 'phone', key: 'waitlist.badPhone' };
  return null;
}

async function sendWaitlist(payload) {
  const { ok, status, data } = await apiRequest('/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // The validation sentences are written in French for the person (WaitlistController); anything else follows apiMessage.
  if (!ok) throw new Error(data?.errors?.email?.[0] ?? data?.errors?.phone?.[0] ?? apiMessage('waitlist', data, status));
  return data;
}

export default function Waitlist() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(null);
  const [state, setState] = useState('form'); // 'form' | 'sending' | 'done'
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const invalid = waitlistError({ email, phone });
    if (invalid) {
      setError(t(invalid.key));
      return;
    }
    setError('');
    setState('sending');
    try {
      await sendWaitlist(waitlistPayload({ email, name, role, phone }));
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('form');
    }
  };

  return (
    <AuthShell
      plain
      title={t('waitlist.title')}
      subtitle={t('waitlist.subtitle')}
      footer={
        <>
          {t('waitlist.have')}{' '}
          <Link to="/login" className="font-semibold text-nav-accent">
            {t('waitlist.login')}
          </Link>
        </>
      }
    >
      {state === 'done' ? (
        <div className="space-y-4 text-center" data-waitlist="done" role="status">
          <CheckCircle2 size={56} className="mx-auto text-emerald-600" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-900">{t('waitlist.done')}</h2>
          <p className="text-lg font-semibold leading-8 text-slate-600">{t('waitlist.doneSay')}</p>
          <Link to="/" className="inline-block font-bold text-nav-accent">
            {t('waitlist.home')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" data-waitlist="form" noValidate>
          <p className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-lg font-bold leading-8 text-slate-800">
            <FlaskConical size={26} className="mt-1 shrink-0 text-nav-accent" aria-hidden="true" />
            {t('waitlist.ask')}
          </p>
          <div>
            <label htmlFor="waitlist-email" className="mb-1.5 block text-sm font-bold text-slate-700">
              {t('waitlist.email')}
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-required="true"
                placeholder={t('waitlist.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className={`${authInputClass()} ps-10`}
                data-waitlist-email
              />
            </div>
          </div>
          <div>
            <label htmlFor="waitlist-name" className="mb-1.5 block text-sm font-bold text-slate-700">
              {t('waitlist.name')}
            </label>
            <input
              id="waitlist-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={authInputClass()}
            />
          </div>
          <div role="group" aria-label={t('waitlist.who')} className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {ROLES.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={role === id}
                onClick={() => setRole(role === id ? null : id)}
                className={`h-11 flex-1 rounded-lg text-sm font-semibold transition ${role === id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t(`waitlist.roles.${id}`)}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="waitlist-phone" className="mb-1.5 block text-sm font-bold text-slate-700">
              {t('waitlist.phone')}
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="waitlist-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                className={`${authInputClass()} ps-10`}
                data-waitlist-phone
              />
            </div>
          </div>
          {error && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              role="alert"
              data-waitlist-error
            >
              {error}
            </p>
          )}
          <AuthSubmit loading={state === 'sending'}>
            {state === 'sending' ? t('waitlist.sending') : t('waitlist.send')}
          </AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}
