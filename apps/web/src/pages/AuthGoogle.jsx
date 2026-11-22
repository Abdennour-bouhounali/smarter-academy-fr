import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { completeGoogleSignup, fetchCurrentUser } from '../services/authService';
import { postAuthPath } from '../features/classJoin/pendingClassJoin';
import LegalConsentCheckbox from '../components/auth/LegalConsentCheckbox';
import PersonNameFields from '../components/auth/PersonNameFields';
import { authInputClass } from '../components/auth/AuthShell';
import { nameError, normalizeName, personNameErrors } from '../utils/personName';
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
/**
 * Où atterrit un compte Google authentifié : chaque rôle chez lui. L'élève
 * sans classe scolaire passe par l'accueil qui la lui fait choisir.
 */
function landingFor(user) {
  if (user?.role === 'teacher') return '/enseignant';
  if (user?.role === 'parent') return '/wali';
  if (user?.role === 'school_admin') return '/idara';
  if (user?.role === 'admin') return '/admin';
  if (user?.role === 'book_manager') return '/admin/livres/commandes';
  // Arrivé par le lien d'une classe (et consentant) : on y retourne, et la
  // page du lien rejoint seule. Voir features/classJoin/pendingClassJoin.js.
  return postAuthPath(user, user?.grade ? '/espace' : '/espace/bienvenue');
}

export default function AuthGoogle() {
  const { t } = useTranslation('auth');
  const { t: tm } = useTranslation('marketing');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const etape = searchParams.get('etape');
  const handoff = searchParams.get('handoff');
  const email = searchParams.get('email');
  const erreur = searchParams.get('erreur');
  // Le type de compte choisi AVANT le départ chez Google, revenu avec le
  // jeton d'attente ; confirmable ici, dans la même liste blanche (élève ou
  // enseignant) que l'inscription classique. Jamais admin.
  const [accountType, setAccountType] = useState(searchParams.get('type') === 'teacher' ? 'teacher' : 'student');

  // « الاسم و اللقب » : PRÉ-REMPLIS avec ce que Google suggère (`prenom`,
  // `nom`), mais confirmés ici — c'est la première connexion, et le nom
  // enregistré est celui que la personne valide, pas celui de Google.
  // Seuls des noms déjà ARABES sont suggérés (le serveur filtre, et on
  // revérifie ici) : un « Léa » latin ouvrirait l'écran sur une erreur.
  const suggested = (param) => {
    const v = searchParams.get(param) || '';
    return nameError(v) === null ? v : '';
  };
  const [names, setNames] = useState({ firstName: suggested('prenom'), lastName: suggested('nom') });
  const [nameErrors, setNameErrors] = useState({});
  const prefilledByGoogle = Boolean(names.firstName || names.lastName);
  // Le mot de passe, obligatoire depuis le 2026-10-22 : le compte s'ouvre
  // aussi par courriel + mot de passe (GoogleAuthController::complete).
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Le jeton ne doit être consommé qu'UNE fois : sans ce garde, un nouveau
  // rendu rejouerait la connexion.
  const consumed = useRef(false);

  useDocumentMeta(t('googleMetaTitle'), t('googleMetaDescription'));

  useEffect(() => {
    if (etape !== 'connecte' || consumed.current) return;

    const token = searchParams.get('token');
    if (!token) return;

    consumed.current = true;

    (async () => {
      try {
        const currentUser = await fetchCurrentUser(token);
        login(currentUser, token);
        navigate(landingFor(currentUser), { replace: true });
      } catch {
        setErrorMsg(t('googleRetry'));
      }
    })();
  }, [etape, searchParams, login, navigate]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setConsentError('');
    setErrorMsg('');

    const errors = personNameErrors(names);
    setNameErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Mêmes règles que le serveur : 8 caractères, une lettre, un chiffre.
    if (password.length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password)) {
      setPasswordError(true);
      return;
    }

    if (!acceptLegal) {
      setConsentError(
        tm('consent.required'),
      );
      return;
    }

    setLoading(true);
    try {
      const data = await completeGoogleSignup({
        handoff,
        firstName: normalizeName(names.firstName),
        lastName: normalizeName(names.lastName),
        password,
        acceptLegal,
        accountType,
      });
      login(data.user, data.token);
      // L'adresse est déjà prouvée par Google : pas d'écran de vérification.
      navigate(landingFor(data.user), { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Les codes d'erreur viennent du SERVEUR et restent des identifiants
  // techniques ; seul leur rendu est traduit. `errors.<code>` n'existant pas
  // pour un code inconnu, on retombe sur le message générique plus bas.
  const messageErreur = erreur ? t(`errors.${erreur}`, { defaultValue: '' }) : '';

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
                {t('googleInterrupted')}
              </h1>
              <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{errorMsg || messageErreur || t('googleGenericFail')}</p>
              </div>
              <div className="mt-6 space-y-3">
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-xl border border-transparent bg-nav-accent py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#3350c4]"
                >
                  {t('backToLogin')}
                </Link>
              </div>
            </>
          )}

          {/* ── Consentement : le compte n'existe pas encore ────────── */}
          {!erreur && !errorMsg && etape === 'consentement' && handoff && (
            <>
              <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 font-display">
                {t('googleLastStep')}
              </h1>
              <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                {t('googleConfirmed', { email: email || '—' })}
              </p>

              <form className="mt-6 space-y-6" onSubmit={handleComplete}>
                {/* Le type de compte, à confirmer : un professeur venu par la
                    porte élève ne doit pas se retrouver élève. */}
                <div role="group" aria-label={t('accountTypeLabel')} className="flex justify-center">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setAccountType('student')}
                      aria-pressed={accountType === 'student'}
                      disabled={loading}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${accountType === 'student' ? 'bg-nav-accent text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t('accountTypeStudent')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('teacher')}
                      aria-pressed={accountType === 'teacher'}
                      disabled={loading}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${accountType === 'teacher' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {t('accountTypeTeacher')}
                    </button>
                  </div>
                </div>

                <PersonNameFields
                  idPrefix="google"
                  value={names}
                  onChange={(next) => {
                    setNames(next);
                    setNameErrors({});
                  }}
                  errors={nameErrors}
                  disabled={loading}
                  autoFocus={!prefilledByGoogle}
                  tone={accountType === 'teacher' ? 'teal' : 'blue'}
                  hint={prefilledByGoogle ? t('name.googlePrefilled') : undefined}
                />

                <div>
                  <label htmlFor="google-password" className="block text-sm font-medium text-slate-700">
                    {t('googlePasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="google-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      disabled={loading}
                      aria-invalid={passwordError ? 'true' : undefined}
                      aria-describedby="google-password-hint"
                      className={`pr-12 text-start ${authInputClass(accountType)}`}
                    />
                    {/* Toggle at the FIELD's own (LTR) end — see Register.jsx. */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                  <p id="google-password-hint" role={passwordError ? 'alert' : undefined} className={`mt-1.5 text-xs ${passwordError ? 'font-medium text-rose-700' : 'text-slate-500'}`}>
                    {t('googlePasswordHint')}
                  </p>
                </div>

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
                  className="flex w-full justify-center rounded-xl border border-transparent bg-nav-accent py-3 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3350c4] focus:outline-none focus:ring-2 focus:ring-nav-accent focus:ring-offset-2 disabled:opacity-70"
                >
                  {loading ? t('creatingAccount') : t('createMyAccount')}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                {t('googleNoAccountYet')}
              </p>
            </>
          )}

          {/* ── Connexion en cours ─────────────────────────────────── */}
          {!erreur && !errorMsg && etape === 'connecte' && (
            <div className="py-6 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-nav-accent" />
              <p className="mt-4 text-sm text-slate-600">{t('connecting')}</p>
            </div>
          )}

          {/* ── URL sans état exploitable ──────────────────────────── */}
          {!erreur && !errorMsg && etape !== 'connecte' && etape !== 'consentement' && (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-600">{t('pageNotDirect')}</p>
              <Link
                to="/login"
                className="mt-4 inline-flex justify-center rounded-xl border border-transparent bg-nav-accent py-3 px-5 text-sm font-medium text-white shadow-sm hover:bg-[#3350c4]"
              >
                {t('goToLogin')}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
