import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '../services/authService';
import AuthShell, { AuthSubmit, authInputClass } from '../components/auth/AuthShell';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * « Mot de passe oublié » — demande du lien par courriel.
 *
 * Après l'envoi, le message est le même que l'adresse existe ou non : le
 * serveur ne le révèle pas, l'écran non plus.
 */
export default function ForgotPassword() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useDocumentMeta(t('forgotMetaTitle'), t('forgotMetaDescription'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('forgotTitle')}
      subtitle={t('forgotSubtitle')}
      footer={(
        <Link to="/login" className="font-semibold text-nav-accent hover:text-nav-accent">
          {t('backToLogin')}
        </Link>
      )}
    >
      {sent ? (
        <div role="status" className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{t('forgotSent')}</p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMsg && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {t('emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1.5 text-start ${authInputClass()}`}
            />
          </div>
          <AuthSubmit loading={loading}>{loading ? t('forgotButtonLoading') : t('forgotButton')}</AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}
