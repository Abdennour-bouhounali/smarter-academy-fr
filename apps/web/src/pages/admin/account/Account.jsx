import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, KeyRound, Mail } from 'lucide-react';
import { AdminPage, Loading, ErrorBox, btnPrimary, btnSecondary, input as inputClass, Num } from '../adminUi';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchAccount, updateProfile, updateEmail, updatePassword } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

export function AdminProfile() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('account.profileMetaTitle'));

  const { token } = useContext(AuthContext);
  const { data: account, loading, error, reload, setData } = useAdminResource(fetchAccount);

  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const updated = await updateProfile(token, {
        firstName: firstName ?? account.firstName,
        lastName: lastName ?? account.lastName,
      });
      setData((current) => ({ ...current, ...updated }));
      setFeedback({ tone: 'ok', message: t('account.profileSaved') });
    } catch (caught) {
      setFeedback({ tone: 'ko', message: caught.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage eyebrow={t('account.eyebrow')} title={t('account.profileTitle')} subtitle={t('account.profileSubtitle')}>
      {loading && <Loading />}
      {error && <ErrorBox message={error} onRetry={reload} />}

      {account && (
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <Row label={t('common.email')}>
            {/* Une adresse se lit de gauche à droite (îlot `dir="ltr"`). */}
            <p dir="ltr" className="font-inter text-sm text-slate-800">{account.email}</p>
            <p className="font-inter text-xs text-slate-500">{t('account.emailChangesInSecurity')}</p>
          </Row>

          <Field label={t('account.firstName')} value={firstName ?? account.firstName ?? ''} onChange={setFirstName} />
          <Field label={t('account.lastName')} value={lastName ?? account.lastName ?? ''} onChange={setLastName} />

          <Row label={t('account.activeSessions')}>
            <p className="font-inter text-sm text-slate-800"><Num>{account.activeSessions}</Num></p>
          </Row>

          {feedback && <Feedback {...feedback} />}

          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? t('common.saving') : t('common.save')}
          </button>
        </form>
      )}
    </AdminPage>
  );
}

export function AdminSecurity() {
  const { t } = useTranslation('admin');
  useDocumentMeta(t('account.securityMetaTitle'));

  const { token, logout } = useContext(AuthContext);
  const [emailForm, setEmailForm] = useState({ currentPassword: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', password: '', passwordConfirmation: '' });
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const submitEmail = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const result = await updateEmail(token, emailForm);
      setEmailForm({ currentPassword: '', email: '' });
      setFeedback({
        tone: 'ok',
        // Deux phrases, deux clés : la seconde compte des sessions, et
        // l'arabe décline ce nombre en six catégories — c'est i18next qui
        // choisit, jamais une concaténation.
        message: `${t('account.emailChangedTo', { email: result.email })} ${t('account.sessionsRevoked', { count: result.revokedSessions })}`,
      });
    } catch (caught) {
      setFeedback({ tone: 'ko', message: caught.message });
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const result = await updatePassword(token, passwordForm);
      setPasswordForm({ currentPassword: '', password: '', passwordConfirmation: '' });
      setFeedback({
        tone: 'ok',
        message: `${t('account.passwordChanged')} ${t('account.sessionsRevoked', { count: result.revokedSessions })}`,
      });
    } catch (caught) {
      setFeedback({ tone: 'ko', message: caught.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow={t('account.eyebrow')}
      title={t('account.securityTitle')}
      subtitle={t('account.securitySubtitle')}
    >
      <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
        {feedback && <div className="lg:col-span-2"><Feedback {...feedback} /></div>}

        <form onSubmit={submitEmail} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <Mail size={15} /> {t('account.changeEmail')}
          </h2>

          <Field
            label={t('account.newEmail')} type="email" required dir="ltr"
            value={emailForm.email}
            onChange={(value) => setEmailForm((f) => ({ ...f, email: value }))}
          />
          <Field
            label={t('account.currentPassword')} type="password" required autoComplete="current-password"
            value={emailForm.currentPassword}
            onChange={(value) => setEmailForm((f) => ({ ...f, currentPassword: value }))}
          />

          <button type="submit" disabled={busy} className={btnPrimary}>
            {t('account.changeEmail')}
          </button>
        </form>

        <form onSubmit={submitPassword} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <KeyRound size={15} /> {t('account.changePassword')}
          </h2>

          <Field
            label={t('account.currentPassword')} type="password" required autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={(value) => setPasswordForm((f) => ({ ...f, currentPassword: value }))}
          />
          <Field
            label={t('account.newPassword')} type="password" required autoComplete="new-password"
            hint={t('account.passwordRule')}
            value={passwordForm.password}
            onChange={(value) => setPasswordForm((f) => ({ ...f, password: value }))}
          />
          <Field
            label={t('account.confirmPassword')} type="password" required autoComplete="new-password"
            value={passwordForm.passwordConfirmation}
            onChange={(value) => setPasswordForm((f) => ({ ...f, passwordConfirmation: value }))}
          />

          <button type="submit" disabled={busy} className={btnPrimary}>
            {t('account.changePassword')}
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <ShieldCheck size={15} /> {t('account.sessionsTitle')}
          </h2>
          <p className="mt-1 font-inter text-xs text-slate-600">
            {t('account.sessionsHint')}
          </p>
          <button type="button" onClick={logout} className={`${btnSecondary} mt-3`}>
            {t('account.logout')}
          </button>
        </div>
      </div>
    </AdminPage>
  );
}

function Field({ label, value, onChange, type = 'text', required, hint, autoComplete, dir }) {
  return (
    <label className="block">
      <span className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        // Une adresse ou un mot de passe se saisit en caractères latins :
        // le champ force alors LTR, même dans une page RTL.
        dir={dir ?? (type === 'email' || type === 'password' ? 'ltr' : undefined)}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-1`}
      />
      {hint && <span className="mt-1 block font-inter text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <p className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Feedback({ tone, message }) {
  return (
    <p
      role="status"
      className={`rounded-lg p-3 font-inter text-sm ${
        tone === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
      }`}
    >
      {message}
    </p>
  );
}
