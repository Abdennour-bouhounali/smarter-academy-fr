import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Presentation } from 'lucide-react';
import { register as registerRequest, registrationStatus } from '../services/authService';
import Waitlist from '../components/auth/Waitlist';
import { postAuthPath, readPendingClassJoin } from '../features/classJoin/pendingClassJoin';
import ClassJoinNotice from '../components/auth/ClassJoinNotice';
import LegalConsentCheckbox from '../components/auth/LegalConsentCheckbox';
import GoogleButton from '../components/auth/GoogleButton';
import PersonNameFields from '../components/auth/PersonNameFields';
import AuthShell, { AuthDivider, AuthSubmit, authInputClass } from '../components/auth/AuthShell';
import { normalizeName, personNameErrors } from '../utils/personName';

export default function Register() {
  const { t } = useTranslation('auth');
  const { t: tm } = useTranslation('marketing');
  const [names, setNames] = useState({ firstName: '', lastName: '' });
  const [nameErrors, setNameErrors] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Venu du LIEN d'une classe, après le bouton d'accord qui crée le compte : le compte
  // est un compte élève, et l'intention part avec l'inscription pour que le
  // serveur rejoigne à la vérification, même dans un autre navigateur.
  const [pendingJoin] = useState(() => readPendingClassJoin());
  // Le TYPE de compte se choisit ici : élève (défaut) ou enseignant
  // (`?type=enseignant`). Un seul formulaire, une seule vérification
  // d'adresse ; le serveur tient la liste blanche. Le parent n'a PAS de compte
  // à créer : il lit par le « lien parent » (PARENT_SPACE.md §2, 2026-10-23).
  const [registration, setRegistration] = useState(null);
  useEffect(() => {
    let alive = true;
    registrationStatus().then((s) => alive && setRegistration(s));
    return () => {
      alive = false;
    };
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const isTeacher = searchParams.get('type') === 'enseignant';
  const accountType = isTeacher ? 'teacher' : 'student';
  const switchType = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'teacher') params.set('type', 'enseignant');
    else params.delete('type');
    setSearchParams(params, { replace: true });
  };

  // Déjà connecté : on ne montre pas un formulaire d'inscription à quelqu'un
  // qui a un compte.
  //
  // L'élève dont l'adresse n'est pas encore prouvée est renvoyé vers l'écran
  // de vérification, et NON vers /espace : le serveur y refuserait tout, et
  // il verrait un espace vide sans comprendre pourquoi. Sans ce cas, cette
  // redirection entrerait aussi en conflit avec celle qui suit une
  // inscription réussie — l'une annulant l'autre.
  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'book_manager') {
      navigate('/admin/livres/commandes');
    } else if (user.role === 'student') {
      navigate(postAuthPath(user, user.emailVerified === false ? '/verification-email' : '/espace'));
    } else if (user.role === 'teacher') {
      navigate(user.emailVerified === false ? '/verification-email' : '/enseignant');
    } else if (user.role === 'parent') {
      navigate(user.emailVerified === false ? '/verification-email' : '/parent');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setConsentError('');

    // « Prénom et nom » : le message du champ fautif, en français, avant tout
    // aller-retour (le serveur applique la même règle, PersonName).
    const errors = personNameErrors(names);
    setNameErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Contrôle côté navigateur : il évite un aller-retour inutile, et rien
    // de plus. Le serveur refuse de toute façon une inscription sans
    // consentement — c'est lui qui fait foi (voir AuthController::register).
    if (!acceptLegal) {
      setConsentError(
        tm('consent.required'),
      );
      return;
    }

    setLoading(true);
    try {
      const data = await registerRequest({
        firstName: normalizeName(names.firstName),
        lastName: normalizeName(names.lastName),
        email,
        password,
        acceptLegal,
        accountType,
        ...(pendingJoin && accountType === 'student' ? { classJoinLink: pendingJoin.token, classJoinConsent: true } : {}),
      });
      login(data.user, data.token);
      // Le compte existe, mais l'adresse n'est pas encore prouvée : l'espace
      // élève reste fermé côté serveur. On envoie donc l'élève vers l'écran
      // de vérification, et non vers l'accueil de son espace — où il se
      // heurterait à un refus qu'il ne saurait pas interpréter.
      //
      // `verificationEmailSent: false` : le compte est créé mais le serveur
      // de courriel a refusé le premier envoi. L'écran le dit, au lieu
      // d'affirmer « Nous avons envoyé un lien » pour un courriel qui n'existe pas.
      navigate(data.verificationEmailSent === false
        ? '/verification-email?statut=envoi-echoue'
        : '/verification-email');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REGISTRATIONS CLOSED (owner, 2026-11-20): the platform is under test — this page shows the waiting list instead of
  // the form. A student who comes from the link of his teacher's class still signs up (the server checks the link).
  if (registration === null) return null;
  if (!registration.open && !(registration.classLinks && pendingJoin)) return <Waitlist />;

  const tone = isTeacher ? 'teacher' : 'student';
  const typeButton = (type, Icon, label) => {
    const active = accountType === type;
    return (
      <button
        type="button"
        onClick={() => switchType(type)}
        aria-pressed={active}
        className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
          active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Icon size={17} className={active ? (type === 'teacher' ? 'text-teal-600' : 'text-nav-accent') : ''} aria-hidden="true" />
        {label}
      </button>
    );
  };

  return (
    <AuthShell
      tone={tone}
      title={isTeacher ? t('registerTeacherHeading') : t('registerHeading')}
      subtitle={isTeacher ? t('registerTeacherSubtitle') : t('registerSubtitle')}
      footer={(
        <>
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className={`font-semibold ${isTeacher ? 'text-teal-700 hover:text-teal-800' : 'text-nav-accent hover:text-nav-accent'}`}>
            {t('loginLink')}
          </Link>
        </>
      )}
    >
      {/* Deux portes, un formulaire : la bascule dit QUI s'inscrit. */}
      <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label={t('accountTypeLabel')}>
        {typeButton('student', GraduationCap, t('accountTypeStudent'))}
        {typeButton('teacher', Presentation, t('accountTypeTeacher'))}
      </div>

      {/* Google, pour l'élève COMME pour l'enseignant : le type de compte
          choisi ici part avec la navigation et revient sur l'écran de
          consentement, où il peut encore être confirmé. */}
      {pendingJoin && accountType === 'student' && <ClassJoinNotice text={t('classJoinPendingRegister', { name: pendingJoin.classroomName || '—' })} />}
      <GoogleButton label={t('continueWithGoogleRegister')} accountType={accountType} />
      <AuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        {errorMsg && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <PersonNameFields
          idPrefix="register"
          value={names}
          onChange={(next) => {
            setNames(next);
            setNameErrors({});
          }}
          errors={nameErrors}
          disabled={loading}
          autoFocus
          tone={isTeacher ? 'teal' : 'blue'}
          hint={isTeacher ? null : undefined}
        />

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
            className={`mt-1.5 text-start ${authInputClass(tone)}`}
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pe-12 text-start ${authInputClass(tone)}`}
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
          <p className="mt-1.5 text-xs text-slate-500">{t('passwordHint')}</p>
        </div>

        <LegalConsentCheckbox
          checked={acceptLegal}
          onChange={(next) => {
            setAcceptLegal(next);
            if (next) setConsentError('');
          }}
          error={consentError}
          disabled={loading}
        />

        <div className="pt-1">
          <AuthSubmit tone={tone} loading={loading}>
            {loading ? t('registerButtonLoading') : t('registerButton')}
          </AuthSubmit>
        </div>
      </form>
    </AuthShell>
  );
}
