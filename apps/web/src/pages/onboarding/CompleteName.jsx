import { useContext, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UserRound } from 'lucide-react';
import { ArrowForward } from '../../components/common/DirectionalIcons';
import PersonNameFields from '../../components/auth/PersonNameFields';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { needsName, normalizeName, personNameErrors } from '../../utils/personName';

/**
 * Where an account goes once it has a name: a student without a grade picks
 * one next (ChooseGrade); everyone else returns to the page the gate
 * interrupted (`location.state.from`), or to their space's home.
 */
function nextPathFor(user, from) {
  if (user?.role === 'teacher') return from || '/enseignant';
  if (user?.role === 'parent') return from || '/wali';
  if (user?.role === 'school_admin') return from || '/idara';
  if (user?.role === 'book_manager') return from || '/admin/livres/commandes';
  if (!user?.grade) return '/espace/bienvenue';
  return from || '/espace';
}

/**
 * « عرّفنا بنفسك » — the onboarding step that asks « الاسم و اللقب » of any
 * student or teacher account that has none yet (`user.nameComplete === false`).
 *
 * New accounts give their name at registration (email form or Google
 * confirmation), so this step mostly serves accounts created before names
 * were collected. StudentLayout and TeacherLayout redirect here; for a
 * student it comes BEFORE the grade choice. Mounted at /espace/bienvenue/nom
 * and /enseignant/bienvenue, outside the space shells (like ChooseGrade).
 */
export default function CompleteName() {
  const { t } = useTranslation('auth');
  useDocumentMeta(t('name.stepMetaTitle'));
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;
  const isTeacher = user?.role === 'teacher';

  const [names, setNames] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Reached directly (bookmark, back button) with a name already set.
  if (user && !needsName(user) && !saving) {
    return <Navigate to={nextPathFor(user, from)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const nextErrors = personNameErrors(names);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        firstName: normalizeName(names.firstName),
        lastName: normalizeName(names.lastName),
      });
      navigate(nextPathFor(updated, from), { replace: true });
    } catch (err) {
      setErrorMsg(err.message);
      setSaving(false);
    }
  };

  const gradient = isTeacher ? 'linear-gradient(135deg, #0F766E, #14B8A6)' : '#3B5BDB';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative, direction-neutral (see Login.jsx). */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg z-10 text-center mb-8"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-4" style={{ background: gradient }}>
          <UserRound size={26} />
        </div>
        <p className={`text-xs font-semibold tracking-wide mb-2 ${isTeacher ? 'text-teal-700' : 'text-nav-accent'}`}>
          {t('name.stepEyebrow')}
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('name.stepTitle')}</h1>
        <p className="mt-2 font-inter text-sm text-slate-500 max-w-md mx-auto">
          {isTeacher ? t('name.stepSubtitleTeacher') : t('name.stepSubtitleStudent')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg z-10"
      >
        <form className="glass-card p-6 sm:p-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {errorMsg && (
            <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          <PersonNameFields
            idPrefix="onboarding"
            value={names}
            onChange={(next) => {
              setNames(next);
              setErrors({});
            }}
            errors={errors}
            disabled={saving}
            autoFocus
            tone={isTeacher ? 'teal' : 'blue'}
            hint={isTeacher ? null : undefined}
          />

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            style={{ background: gradient }}
          >
            {saving ? t('name.saving') : t('name.continue')}
            {!saving && <ArrowForward size={15} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
