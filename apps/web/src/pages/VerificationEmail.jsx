import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MailCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/authService';
import { postAuthPath } from '../features/classJoin/pendingClassJoin';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * « VÉRIFIEZ VOTRE ADRESSE E-MAIL ».
 *
 * L'écran d'attente entre l'inscription et l'espace élève. Il sert deux
 * publics à la fois :
 *
 *   - celui qui vient de s'inscrire et n'a encore rien cliqué ;
 *   - celui qui REVIENT du lien reçu par courriel, l'API l'ayant redirigé
 *     ici avec `?statut=succes|deja-verifie|invalide` (`invalide` couvre
 *     aussi le lien expiré ou altéré) ;
 *   - celui dont le PREMIER envoi a échoué à l'inscription
 *     (`?statut=envoi-echoue`, posé par Register.jsx) : on ne lui dit pas
 *     « أرسلنا », on lui propose le renvoi.
 *
 * ── Ce que cette page n'est PAS ──────────────────────────────────────────
 * Elle ne garde aucune porte. La fermeture de l'espace élève est le fait du
 * serveur (middleware `email.verified`), pas de cet écran : quelqu'un qui
 * taperait /espace directement se heurterait au refus de l'API, pas à
 * l'absence de cette page.
 *
 * ── « Modifier mon adresse » ─────────────────────────────────────────────
 * Volontairement ABSENT. Changer l'adresse d'un compte demande un point
 * d'entrée qui n'existe pas côté serveur, et l'inventer ici ouvrirait une
 * question de sécurité entière (que faire des liens déjà émis, comment
 * empêcher de revendiquer l'adresse d'un autre). Tant que ce point d'entrée
 * n'existe pas, la page propose la seule issue honnête : recommencer avec
 * une autre adresse, ou nous écrire.
 */
export default function VerificationEmail() {
  const { t } = useTranslation('auth');
  const { user, token, logout, refreshUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const statut = searchParams.get('statut');

  useDocumentMeta(t('verifyMetaTitle'), t('verifyMetaDescription'));

  // On relit le compte à CHAQUE arrivée, pas seulement au retour du lien :
  // l'élève a pu cliquer le lien sur son téléphone, et cet onglet — renvoyé
  // ici par ProtectedRoute en tentant d'ouvrir فضائي — croirait encore
  // l'adresse non vérifiée. C'est le serveur qui sait ; s'il dit « vérifiée »,
  // l'effet suivant ouvre l'espace.
  useEffect(() => {
    if (!token) return;

    refreshUser?.();
  }, [statut, token, refreshUser]);

  // Vérifié : l'élève n'a plus rien à faire ici. Venu du lien d'une classe,
  // il y retourne — la page du lien rejoint seule (ou constate que la
  // vérification l'a déjà fait côté serveur : alreadyMember).
  useEffect(() => {
    if (user?.emailVerified) {
      navigate(postAuthPath(user, user.grade ? '/espace' : '/espace/bienvenue'), { replace: true });
    }
  }, [user, navigate]);

  const handleResend = async () => {
    setSending(true);
    setFeedback('');
    setErrorMsg('');
    try {
      const data = await resendVerificationEmail(token);
      setFeedback(
        data.alreadyVerified
          ? t('verifyAlreadyShort')
          : t('verifyResent'),
      );
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const clearStatut = () => {
    searchParams.delete('statut');
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 pt-24 pb-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-white/50">
          <div className="flex justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-nav-accent-soft text-nav-accent">
              <MailCheck className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>

          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900 font-display">
            {t('verifyTitle')}
          </h1>

          {statut === 'invalide' && (
            <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{t('verifyLinkExpired')}</p>
            </div>
          )}

          {statut === 'envoi-echoue' && (
            <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{t('verifySendFailed')}</p>
            </div>
          )}

          {statut === 'deja-verifie' && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{t('verifyAlready')}</p>
            </div>
          )}

          {statut === 'succes' && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>{t('verifyDone')}</p>
            </div>
          )}

          {statut !== 'envoi-echoue' && (
            <p className="mt-5 text-center text-sm leading-relaxed text-slate-600">
              {t('verifySent', { email: user?.email || '—' })}
            </p>
          )}

          <p className="mt-2 text-center text-xs text-slate-500">
            {t('verifyValidity')}
          </p>

          {feedback && (
            <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-nav-accent-soft p-3 text-center text-sm text-nav-accent">
              {feedback}
            </p>
          )}

          {errorMsg && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
              {errorMsg}
            </p>
          )}

          {token ? (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  clearStatut();
                  handleResend();
                }}
                disabled={sending}
                className="flex w-full justify-center rounded-xl border border-transparent bg-nav-accent py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3350c4] focus:outline-none focus:ring-2 focus:ring-nav-accent focus:ring-offset-2 disabled:opacity-70"
              >
                {sending ? t('sending') : t('resendEmail')}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full justify-center rounded-xl border border-slate-300 bg-white py-3 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-nav-accent focus:ring-offset-2"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-xl border border-transparent bg-nav-accent py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3350c4]"
              >
                {t('login')}
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            {t('wrongAddress')}{' '}
            <a href="mailto:abdennour.bouhounali@gmail.com" className="font-medium text-nav-accent hover:text-nav-accent">
              abdennour.bouhounali@gmail.com
            </a>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
