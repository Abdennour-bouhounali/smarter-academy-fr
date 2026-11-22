import { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Loader2, BookOpen, Clock } from 'lucide-react';
import { ArrowForward } from '../../components/common/DirectionalIcons';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { isDiagnosticAvailableForGrade } from '../../services/diagnosticService';
import { needsName } from '../../utils/personName';
import { postAuthPath } from '../../features/classJoin/pendingClassJoin';
import { getDisplayName } from '../../utils/userDisplay';
import { isFeatureOn } from '../../config/features';

const GRADES_BY_LEVEL = getAllGrades().reduce((groups, grade) => {
  (groups[grade.levelTitle] ??= []).push(grade);
  return groups;
}, {});

// La pastille d'une classe : son nom court tel que le catalogue l'écrit (« 6e »). Une classe sans nom court retombe
// sur l'icône.
const GRADE_BADGE = Object.fromEntries(courseLevels.flatMap((level) => level.grades).map((g) => [g.id, g.shortName]));

// Un dégradé par cycle : l'accent élève pour le collège.
const LEVEL_GRADIENT = {
  college: '#3B5BDB',
};

/**
 * Where a student goes once his grade is chosen: the diagnostic where one exists AND is shown (config/features.js —
 * the 6e diagnostic recommends lessons that do not exist yet), otherwise his space.
 */
export function pathAfterGrade(gradeId) {
  return isFeatureOn('diagnostic') && isDiagnosticAvailableForGrade(gradeId) ? '/espace/diagnostic' : '/espace';
}

/**
 * The onboarding step between account creation and the student space:
 * picking a grade. It comes AFTER « الاسم و اللقب » — an account without a
 * name is sent to /espace/bienvenue/nom first (CompleteName.jsx). Registration
 * collects the name but not the grade, so a freshly-created account always
 * lands here with `user.grade === null`
 * (StudentLayout redirects here for any student in that state, not just
 * right after signup). Grade stays editable anytime from the profile page —
 * this screen just picks the starting value.
 */
export default function ChooseGrade() {
  const { t } = useTranslation('common');
  const { t: ts } = useTranslation('student');
  useDocumentMeta(ts('chooseGrade.metaTitle'), ts('chooseGrade.metaDescription'));
  const { user, updateGrade } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState(null);
  const [error, setError] = useState('');
  const hasGrades = Object.keys(GRADES_BY_LEVEL).length > 0;

  if (needsName(user)) {
    return <Navigate to="/espace/bienvenue/nom" replace />;
  }

  // Venu par le lien de classe de son enseignant (propriétaire, 2026-10-22) :
  // l'année est celle du قسم, pas un choix. Une adhésion encore en attente
  // dans ce navigateur (inscription Google, ordre des redirections) renvoie
  // à la page du lien, qui rejoint — et le serveur donne alors la classe
  // scolaire du قسم (ClassroomMembershipService::join).
  const pendingJoinPath = postAuthPath(user, null);
  if (pendingJoinPath) {
    return <Navigate to={pendingJoinPath} replace />;
  }

  const handleSelect = async (gradeId) => {
    setSelecting(gradeId);
    setError('');
    try {
      await updateGrade(gradeId);
      navigate(pathAfterGrade(gradeId));
    } catch (err) {
      setError(err.message);
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative, direction-neutral (see Login.jsx). */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-lg z-10 text-center mb-8"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-500/25" style={{ background: LEVEL_GRADIENT.college }}>
          <GraduationCap size={26} />
        </div>
        {hasGrades && (
          <p className="inline-flex items-center rounded-full bg-nav-accent-soft px-3 py-1 text-xs font-semibold text-nav-accent mb-3">
            {ts('chooseGrade.step')}
          </p>
        )}
        <h1 className="font-arabic font-bold text-2xl sm:text-3xl text-slate-900">
          {t('chooseGradeWelcome')} {getDisplayName(user)} 👋
        </h1>
        {hasGrades && (
          <p className="mt-3 font-arabic text-base text-slate-500 text-balance">
            {t('chooseGradeSubtitle')}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto w-full max-w-lg z-10"
      >
        {error && (
          <div role="alert" className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {hasGrades ? (
          <div className="space-y-7">
            {Object.entries(GRADES_BY_LEVEL).map(([levelTitle, grades]) => (
              <section key={levelTitle} aria-label={levelTitle}>
                {/* Le cycle : un intitulé arabe ordinaire — pas de chasse
                    monospace ni d'espacement des lettres, qui disloquent
                    l'écriture liée. */}
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="font-arabic text-sm font-bold text-slate-500 whitespace-nowrap">{levelTitle}</h2>
                  <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  {grades.map((g) => {
                    const badge = GRADE_BADGE[g.id];
                    const soon = g.curriculumStatus === 'not_supplied' || g.lessonCount === 0;
                    const busy = selecting === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelect(g.id)}
                        disabled={selecting !== null}
                        aria-busy={busy}
                        className="group w-full flex items-center gap-3 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                      >
                        <span
                          className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex-col items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-md"
                          style={{ background: LEVEL_GRADIENT[g.levelId] ?? LEVEL_GRADIENT.college }}
                          aria-hidden="true"
                        >
                          {badge ? (
                            <span className="font-arabic text-xl sm:text-2xl font-bold leading-none">{badge}</span>
                          ) : (
                            <GraduationCap size={24} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-arabic text-[17px] sm:text-lg font-bold text-slate-900 whitespace-nowrap">
                            {g.name}
                          </span>
                          <span className="mt-1 flex items-center gap-1.5 font-arabic text-[13px] sm:text-sm whitespace-nowrap">
                            {soon ? (
                              <>
                                <Clock size={14} className="shrink-0 text-amber-500" aria-hidden="true" />
                                <span className="text-amber-600 font-semibold">{ts('chooseGrade.comingSoon')}</span>
                                <span className="text-slate-400">· {ts('chooseGrade.comingSoonHint')}</span>
                              </>
                            ) : (
                              <>
                                <BookOpen size={14} className="shrink-0 text-emerald-500" aria-hidden="true" />
                                <span className="text-emerald-600 font-semibold">{ts('chooseGrade.available')}</span>
                                <span className="text-slate-400">· {ts('chooseGrade.lessons', { count: g.lessonCount })}</span>
                              </>
                            )}
                          </span>
                        </span>

                        <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-nav-accent group-hover:text-white">
                          {busy ? (
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                          ) : (
                            <ArrowForward size={18} aria-hidden="true" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <p className="text-center font-arabic text-sm text-slate-400">
              {ts('chooseGrade.changeLater')}
            </p>
          </div>
        ) : (
          // No grade is active (activeGrades.js). Rather than show an empty grid, say so plainly and
          // let the student continue: StudentLayout's gate already stops
          // redirecting here once there is nothing to choose (see its
          // getAllGrades().length check), so this button is the one path
          // back in for a student who lands here directly (e.g. a stale
          // bookmark/tab) while grade is still null.
          <div className="glass-card p-6 sm:p-8 text-center">
            <p className="font-arabic font-bold text-lg text-slate-800 mb-2">
              {t('chooseGradeComingSoonTitle')}
            </p>
            <p className="font-arabic text-sm text-slate-500 mb-6 max-w-md mx-auto">
              {t('chooseGradeComingSoonBody')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/espace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-arabic font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
              style={{ background: LEVEL_GRADIENT.college }}
            >
              {t('chooseGradeContinue')}
              <ArrowForward size={14} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
