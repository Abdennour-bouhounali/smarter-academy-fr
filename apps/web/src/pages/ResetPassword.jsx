import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { resetPassword } from '../services/authService';
import AuthShell, { AuthSubmit, authInputClass } from '../components/auth/AuthShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * « Choisissez un nouveau mot de passe » — la page où mène le lien du courriel
 * (`?token=…&email=…`, voir ResetPasswordNotification).
 *
 * Le jeton et l'adresse viennent de l'URL et ne servent qu'à être renvoyés au
 * serveur, qui seul décide s'ils sont valables. Une fois le mot de passe
 * changé, toutes les sessions sont fermées : on repart sur la connexion.
 */
export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [linkBroken, setLinkBroken] = useState(!token || !email);

  useDocumentMeta(t('resetMetaTitle'), t('resetMetaDescription'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password !== confirmation) {
      setErrorMsg(t('resetMismatch'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, email, password, passwordConfirmation: confirmation });
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err) {
      if (err.invalidLink) setLinkBroken(true);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, value, setValue, autoComplete) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        name={id}
        type="password"
        required
        minLength={8}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`mt-1.5 text-start ${authInputClass()}`}
      />
    </div>
  );

  return (
    <AuthShell
      title={t('resetTitle')}
      subtitle={t('resetSubtitle')}
      footer={(
        <Link to="/login" className="font-semibold text-nav-accent hover:text-nav-accent">
          {t('backToLogin')}
        </Link>
      )}
    >
      {linkBroken ? (
        <div role="alert" className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{errorMsg || t('resetMissingLink')}</p>
          </div>
          <Link to="/mot-de-passe-oublie" className="block text-center text-sm font-semibold text-nav-accent hover:text-nav-accent">
            {t('resetRequestNew')}
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          {field('new-password', t('resetNewPassword'), password, setPassword, 'new-password')}
          {field('confirm-password', t('resetConfirmPassword'), confirmation, setConfirmation, 'new-password')}
          <p className="text-xs text-slate-500">{t('passwordHint')}</p>
          <AuthSubmit loading={loading}>{loading ? t('resetButtonLoading') : t('resetButton')}</AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}
