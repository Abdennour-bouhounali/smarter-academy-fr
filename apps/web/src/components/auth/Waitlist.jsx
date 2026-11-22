/**
 * THE WAITING LIST — what the sign-up page shows while registrations are closed (owner, 2026-11-20: « stop the
 * register and display a message that says the platform is under test, enter your phone number to contact you when we
 * open it »). One sentence, one phone number (a name if he wants), one button; then the confirmation. The number goes
 * to `POST /waitlist` (apps/api › WaitlistController): the admin reads it in « رسائل التواصل ».
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FlaskConical, Phone } from 'lucide-react';
import AuthShell, { AuthSubmit, authInputClass } from './AuthShell';
import { joinWaitlist } from '../../services/authService';

const L = {
  title: 'المنصّة في مرحلة التجربة',
  subtitle: 'نجرّبها الآن مع عدد قليل من التلاميذ والأساتذة. التسجيل مغلق مؤقّتًا.',
  ask: 'اترك رقم هاتفك، ونتّصل بك حين نفتح المنصّة.',
  phone: 'رقم الهاتف',
  name: 'الاسم (اختياري)',
  who: 'من أنت؟',
  roles: { student: 'تلميذ', parent: 'وليّ', teacher: 'أستاذ' },
  send: 'أعلموني عند الفتح',
  sending: 'جارٍ الإرسال…',
  badPhone: 'اكتب رقم هاتف صحيحًا، مثل 0550123456.',
  done: 'سجّلنا رقمك',
  doneSay: 'سنتّصل بك على هذا الرقم حين نفتح المنصّة. شكرًا لصبرك.',
  have: 'لديك حساب؟',
  login: 'تسجيل الدخول',
  home: 'العودة إلى الرئيسية',
};
const PHONE = /^\+?[0-9][0-9 .-]{7,24}$/;

export default function Waitlist() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [state, setState] = useState('form'); // 'form' | 'sending' | 'done'
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!PHONE.test(phone.trim())) {
      setError(L.badPhone);
      return;
    }
    setError('');
    setState('sending');
    try {
      await joinWaitlist({ phone: phone.trim(), name: name.trim(), role });
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('form');
    }
  };

  return (
    <AuthShell
      plain
      title={L.title}
      subtitle={L.subtitle}
      footer={
        <>
          {L.have}{' '}
          <Link to="/login" className="font-semibold text-nav-accent">
            {L.login}
          </Link>
        </>
      }
    >
      {state === 'done' ? (
        <div className="space-y-4 text-center" data-waitlist="done" role="status">
          <CheckCircle2 size={56} className="mx-auto text-emerald-600" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-900">{L.done}</h2>
          <p className="text-lg font-semibold leading-8 text-slate-600">{L.doneSay}</p>
          <Link to="/" className="inline-block font-bold text-nav-accent">
            {L.home}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" data-waitlist="form" noValidate>
          <p className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-lg font-bold leading-8 text-slate-800">
            <FlaskConical size={26} className="mt-1 shrink-0 text-nav-accent" aria-hidden="true" />
            {L.ask}
          </p>
          <div>
            <label htmlFor="waitlist-phone" className="mb-1.5 block text-sm font-bold text-slate-700">
              {L.phone}
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
                dir="ltr"
                autoComplete="tel"
                placeholder="0550 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${authInputClass()} ps-10 text-start`}
                data-waitlist-phone
              />
            </div>
          </div>
          <div>
            <label htmlFor="waitlist-name" className="mb-1.5 block text-sm font-bold text-slate-700">
              {L.name}
            </label>
            <input
              id="waitlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={authInputClass()}
            />
          </div>
          <div role="group" aria-label={L.who} className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {Object.entries(L.roles).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={role === id}
                onClick={() => setRole(id)}
                className={`h-11 flex-1 rounded-lg text-sm font-semibold transition ${role === id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {label}
              </button>
            ))}
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
          <AuthSubmit loading={state === 'sending'}>{state === 'sending' ? L.sending : L.send}</AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}
