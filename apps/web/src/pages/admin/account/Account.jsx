import React, { useCallback, useContext, useState } from 'react';
import { ShieldCheck, KeyRound, Mail } from 'lucide-react';
import AdminPage from '../../../components/admin/AdminPage';
import { LoadingState, ErrorState } from '../../../components/admin/ui/states';
import { AuthContext } from '../../../context/AuthContext';
import { useAdminResource } from '../../../hooks/useAdminResource';
import { fetchAccount, updateProfile, updateEmail, updatePassword } from '../../../services/admin/accountService';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';

export function AdminProfile() {
  useDocumentMeta('Profil — Administration');

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
      setFeedback({ tone: 'ok', message: 'Profil enregistré.' });
    } catch (caught) {
      setFeedback({ tone: 'ko', message: caught.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage eyebrow="Compte" title="Profil" subtitle="Votre identité dans l’outil d’administration.">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {account && (
        <form onSubmit={submit} className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <Row label="Email">
            <p className="font-inter text-sm text-slate-800">{account.email}</p>
            <p className="font-inter text-xs text-slate-500">Se modifie depuis l’onglet Sécurité.</p>
          </Row>

          <Field label="Prénom" value={firstName ?? account.firstName ?? ''} onChange={setFirstName} />
          <Field label="Nom" value={lastName ?? account.lastName ?? ''} onChange={setLastName} />

          <Row label="Sessions actives">
            <p className="font-inter text-sm text-slate-800">{account.activeSessions}</p>
          </Row>

          {feedback && <Feedback {...feedback} />}

          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
      )}
    </AdminPage>
  );
}

export function AdminSecurity() {
  useDocumentMeta('Sécurité — Administration');

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
        message: `Email changé pour ${result.email}. ${result.revokedSessions} autre(s) session(s) fermée(s).`,
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
        message: `Mot de passe modifié. ${result.revokedSessions} autre(s) session(s) fermée(s).`,
      });
    } catch (caught) {
      setFeedback({ tone: 'ko', message: caught.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      eyebrow="Compte"
      title="Sécurité"
      subtitle="Changer vos identifiants ferme vos autres sessions — pas celle-ci."
    >
      <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
        {feedback && <div className="lg:col-span-2"><Feedback {...feedback} /></div>}

        <form onSubmit={submitEmail} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <Mail size={15} /> Changer l’email
          </h2>

          <Field
            label="Nouvel email" type="email" required
            value={emailForm.email}
            onChange={(value) => setEmailForm((f) => ({ ...f, email: value }))}
          />
          <Field
            label="Mot de passe actuel" type="password" required autoComplete="current-password"
            value={emailForm.currentPassword}
            onChange={(value) => setEmailForm((f) => ({ ...f, currentPassword: value }))}
          />

          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-50">
            Changer l’email
          </button>
        </form>

        <form onSubmit={submitPassword} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <KeyRound size={15} /> Changer le mot de passe
          </h2>

          <Field
            label="Mot de passe actuel" type="password" required autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={(value) => setPasswordForm((f) => ({ ...f, currentPassword: value }))}
          />
          <Field
            label="Nouveau mot de passe" type="password" required autoComplete="new-password"
            hint="Au moins 10 caractères, avec lettres, chiffres et symboles."
            value={passwordForm.password}
            onChange={(value) => setPasswordForm((f) => ({ ...f, password: value }))}
          />
          <Field
            label="Confirmer" type="password" required autoComplete="new-password"
            value={passwordForm.passwordConfirmation}
            onChange={(value) => setPasswordForm((f) => ({ ...f, passwordConfirmation: value }))}
          />

          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 font-inter text-sm font-semibold text-white disabled:opacity-50">
            Changer le mot de passe
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-space text-sm font-bold text-slate-900">
            <ShieldCheck size={15} /> Sessions
          </h2>
          <p className="mt-1 font-inter text-xs text-slate-600">
            Un changement d’email ou de mot de passe révoque automatiquement toutes vos autres sessions.
            Pour fermer aussi celle-ci, déconnectez-vous.
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 font-inter text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Me déconnecter
          </button>
        </div>
      </div>
    </AdminPage>
  );
}

function Field({ label, value, onChange, type = 'text', required, hint, autoComplete }) {
  return (
    <label className="block">
      <span className="font-inter text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-inter text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
