import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { login as loginRequest } from '../services/authService';
import { postAuthPath, readPendingClassJoin } from '../features/classJoin/pendingClassJoin';
import GoogleButton from '../components/auth/GoogleButton';
import AuthShell, { AuthDivider, AuthSubmit, authInputClass } from '../components/auth/AuthShell';
import ClassJoinNotice from '../components/auth/ClassJoinNotice';

/**
 * Où va un utilisateur qui vient de s'authentifier.
 *
 * L'élève dont l'adresse n'est pas prouvée part vers l'écran de vérification :
 * le serveur ferme l'espace d'apprentissage tant qu'elle ne l'est pas, et
 * l'envoyer à /espace lui montrerait une suite de refus sans explication.
 * La décision reste au serveur — ceci ne fait que conduire l'élève là où il
 * peut agir.
 */
function postLoginPath(user) {
  if (user.role === 'admin') return '/admin';
  // Le gestionnaire de la librairie (BOOKS_STORE.md §6ter) : le panneau, réduit à la librairie.
  if (user.role === 'book_manager') return '/admin/livres/commandes';
  if (user.role === 'student') {
    // Venu du lien d'une classe : retour sur le lien, qui rejoint seul
    // (pendingClassJoin.js — jamais une URL lue dans la requête).
    return postAuthPath(user, user.emailVerified === false ? '/verification-email' : '/espace');
  }
  // Le professeur vérifie son adresse comme l'élève, puis entre dans SON espace.
  if (user.role === 'teacher') {
    return user.emailVerified === false ? '/verification-email' : '/enseignant';
  }
  // Le parent (PARENT_SPACE.md) : même vérification, puis l'espace parent.
  if (user.role === 'parent') {
    return user.emailVerified === false ? '/verification-email' : '/parent';
  }
  // Le directeur (SCHOOL_ADMIN_SPACE.md) : adresse vérifiée à sa nomination.
  if (user.role === 'school_admin') return '/etablissement';
  return '/';
}

export default function Login() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordReset = useLocation().state?.passwordReset === true;
  const [pendingJoin] = useState(() => readPendingClassJoin());

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(postLoginPath(user));
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await loginRequest(email, password);
      login(data.user, data.token);
      navigate(postLoginPath(data.user));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={t('loginHeading')}
      subtitle={t('loginSubtitle')}
      footer={(
        <>
          {t('noAccountYet')}{' '}
          <Link to="/register" className="font-semibold text-nav-accent hover:text-nav-accent">
            {t('registerLink')}
          </Link>
        </>
      )}
    >
      {passwordReset && (
        <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {t('resetDone')}
        </div>
      )}
      {pendingJoin && <ClassJoinNotice text={t('classJoinPendingLogin', { name: pendingJoin.classroomName || '—' })} />}
      <GoogleButton label={t('continueWithGoogle')} />
      <AuthDivider />

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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            {t('passwordLabel')}
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pe-12 text-start ${authInputClass()}`}
            />
            {/* The reveal toggle sits at the field's end. */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="text-end">
          <Link to="/mot-de-passe-oublie" className="text-sm font-medium text-nav-accent hover:text-nav-accent">
            {t('forgotPasswordLink')}
          </Link>
        </div>

        <div className="pt-2">
          <AuthSubmit loading={loading}>{loading ? t('loginButtonLoading') : t('loginButton')}</AuthSubmit>
        </div>
      </form>
    </AuthShell>
  );
}
