import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/authService';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * « VÉRIFIEZ VOTRE ADRESSE E-MAIL ».
 *
 * L'écran d'attente entre l'inscription et l'espace élève. Il sert deux
 * publics à la fois :
 *
 *   - celui qui vient de s'inscrire et n'a encore rien cliqué ;
 *   - celui qui REVIENT du lien reçu par courriel, l'API l'ayant redirigé
 *     ici avec `?statut=…`.
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
  const { user, token, logout, refreshUser } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const statut = searchParams.get('statut');

  useDocumentMeta(
    'Vérifiez votre adresse e-mail — Smarter Academy',
    'Confirmez votre adresse e-mail pour accéder à votre espace Smarter Academy.',
  );

  // Retour depuis le lien du courriel : l'adresse vient d'être prouvée côté
  // serveur, mais la session chargée dans cet onglet l'ignore encore. On
  // relit le compte plutôt que de deviner — c'est le serveur qui sait.
  useEffect(() => {
    if (statut !== 'succes' && statut !== 'deja-verifie') return;
    if (!token) return;

    refreshUser?.();
  }, [statut, token, refreshUser]);

  // Vérifié : l'élève n'a plus rien à faire ici.
  useEffect(() => {
    if (user?.emailVerified) {
      navigate(user.grade ? '/espace' : '/espace/bienvenue', { replace: true });
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
          ? 'Votre adresse est déjà vérifiée.'
          : 'E-mail envoyé. Pensez à regarder dans vos indésirables.',
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
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MailCheck className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>

          <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900 font-display">
            Vérifiez votre adresse e-mail
          </h1>

          {statut === 'invalide' && (
            <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>
                Ce lien n’est plus valable — il a expiré, ou l’adresse du compte a changé depuis son
                envoi. Demandez-en un nouveau ci-dessous.
              </p>
            </div>
          )}

          {statut === 'deja-verifie' && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>Cette adresse était déjà vérifiée. Vous pouvez vous connecter.</p>
            </div>
          )}

          {statut === 'succes' && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <p>Adresse vérifiée. Bienvenue !</p>
            </div>
          )}

          <p className="mt-5 text-center text-sm leading-relaxed text-slate-600">
            Nous avons envoyé un lien de confirmation
            {user?.email ? (
              <>
                {' '}à <span className="font-medium text-slate-900">{user.email}</span>
              </>
            ) : null}
            . Ouvrez-le pour activer votre espace.
          </p>

          <p className="mt-2 text-center text-xs text-slate-500">
            Le lien est valable 24 heures. Rien reçu ? Regardez dans vos courriers indésirables.
          </p>

          {feedback && (
            <p role="status" className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-800">
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
                className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
              >
                {sending ? 'Envoi en cours…' : 'Renvoyer l’e-mail'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full justify-center rounded-xl border border-slate-300 bg-white py-3 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                to="/login"
                className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Se connecter
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Adresse erronée ? Écrivez-nous à{' '}
            <a href="mailto:contact@smarter-academy.fr" className="font-medium text-blue-600 hover:text-blue-700">
              contact@smarter-academy.fr
            </a>
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
