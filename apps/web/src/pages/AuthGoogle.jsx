import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { completeGoogleSignup, fetchCurrentUser } from '../services/authService';
import LegalConsentCheckbox from '../components/auth/LegalConsentCheckbox';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/**
 * LE RETOUR DE GOOGLE — la page d'atterrissage.
 *
 * L'API redirige le navigateur ici avec, dans l'URL, l'un de trois états :
 *
 *   ?etape=connecte&token=…       le compte existait (ou vient d'être lié)
 *   ?etape=consentement&handoff=… compte NEUF : il faut le consentement
 *   ?erreur=…                     refus, panne, ou autorisation annulée
 *
 * ── Pourquoi le jeton passe par l'URL ────────────────────────────────────
 * Le retour de Google est une NAVIGATION : le frontend ne peut pas lire la
 * réponse d'une redirection comme il lirait un fetch. L'URL est donc le seul
 * canal disponible. On la nettoie immédiatement (`replace`) pour que le jeton
 * ne reste ni dans la barre d'adresse, ni dans l'historique, ni dans le
 * référent d'une éventuelle requête suivante.
 *
 * ── Le consentement ──────────────────────────────────────────────────────
 * Un compte neuf n'existe PAS encore à ce stade : le serveur n'a rien créé et
 * ne conserve rien. Tant que la case n'est pas cochée, il n'y a pas de compte
 * — et si l'élève referme l'onglet, il n'en restera aucun (§22).
 */
export default function AuthGoogle() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const etape = searchParams.get('etape');
  const handoff = searchParams.get('handoff');
  const email = searchParams.get('email');
  const erreur = searchParams.get('erreur');

  const [acceptLegal, setAcceptLegal] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Le jeton ne doit être consommé qu'UNE fois : sans ce garde, un nouveau
  // rendu rejouerait la connexion.
  const consumed = useRef(false);

  useDocumentMeta('Connexion avec Google — Smarter Academy', 'Connexion à Smarter Academy avec Google.');

  useEffect(() => {
    if (etape !== 'connecte' || consumed.current) return;

    const token = searchParams.get('token');
    if (!token) return;

    consumed.current = true;

    (async () => {
      try {
        const currentUser = await fetchCurrentUser(token);
        login(currentUser, token);
        navigate(currentUser.grade ? '/espace' : '/espace/bienvenue', { replace: true });
      } catch {
        setErrorMsg('La connexion n’a pas abouti. Réessayez.');
      }
    })();
  }, [etape, searchParams, login, navigate]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setConsentError('');
    setErrorMsg('');

    if (!acceptLegal) {
      setConsentError(
        'Vous devez accepter les Conditions Générales d’Utilisation et la Politique de confidentialité.',
      );
      return;
    }

    setLoading(true);
    try {
      const data = await completeGoogleSignup({ handoff, acceptLegal });
      login(data.user, data.token);
      // L'adresse est déjà prouvée par Google : pas d'écran de vérification.
      navigate('/espace/bienvenue', { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const messageErreur = {
    annule: 'Vous avez annulé la connexion avec Google.',
    indisponible: 'La connexion avec Google n’est pas disponible pour le moment.',
    email_not_verified:
      'Votre adresse n’est pas vérifiée chez Google. Vérifiez-la, puis réessayez.',
    already_linked:
      'Ce compte ne peut pas être lié à ce compte Google. Connectez-vous avec votre e-mail et votre mot de passe.',
    compte_inactif: 'Votre compte n’est plus actif. Contactez-nous.',
    provider_failure: 'La connexion avec Google n’a pas abouti. Réessayez.',
    orphan_identity: 'Connexion impossible pour le moment. Contactez-nous si le problème persiste.',
  }[erreur];

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
          {/* ── Refus ou panne ─────────────────────────────────────── */}
          {(erreur || errorMsg) && (
            <>
              <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 font-display">
                Connexion interrompue
              </h1>
              <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{errorMsg || messageErreur || 'La connexion avec Google n’a pas abouti.'}</p>
              </div>
              <div className="mt-6 space-y-3">
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Revenir à la connexion
                </Link>
              </div>
            </>
          )}

          {/* ── Consentement : le compte n'existe pas encore ────────── */}
          {!erreur && !errorMsg && etape === 'consentement' && handoff && (
            <>
              <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 font-display">
                Dernière étape
              </h1>
              <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                Google nous a confirmé votre identité
                {email ? (
                  <>
                    {' '}(<span className="font-medium text-slate-900">{email}</span>)
                  </>
                ) : null}
                . Acceptez nos documents pour créer votre compte.
              </p>

              <form className="mt-6 space-y-6" onSubmit={handleComplete}>
                <LegalConsentCheckbox
                  id="accept-legal-google"
                  checked={acceptLegal}
                  onChange={(next) => {
                    setAcceptLegal(next);
                    if (next) setConsentError('');
                  }}
                  error={consentError}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? 'Création du compte…' : 'Créer mon compte'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                Vous pouvez{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  revenir en arrière
                </Link>{' '}
                : aucun compte n’est créé tant que vous n’avez pas accepté.
              </p>
            </>
          )}

          {/* ── Connexion en cours ─────────────────────────────────── */}
          {!erreur && !errorMsg && etape === 'connecte' && (
            <div className="py-6 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="mt-4 text-sm text-slate-600">Connexion en cours…</p>
            </div>
          )}

          {/* ── URL sans état exploitable ──────────────────────────── */}
          {!erreur && !errorMsg && etape !== 'connecte' && etape !== 'consentement' && (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-600">Cette page n’est pas accessible directement.</p>
              <Link
                to="/login"
                className="mt-4 inline-flex justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Aller à la connexion
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
