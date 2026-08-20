import { useContext, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Flame, CircleCheckBig, Zap, Compass, Crown, BookOpen } from 'lucide-react';
import { courseLevels, getAllGrades } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { getResumeLesson } from '../../lessons/common/utils/progress/getResumeLesson';
import { getStudentActivity } from '../../lessons/common/utils/progress/getStudentActivity';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getDisplayName } from '../../utils/userDisplay';
import DiagnosticInviteBanner from '../../components/diagnostic/DiagnosticInviteBanner';

function StatTile({ icon: Icon, value, label, accent }) {
  return (
    <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="font-space font-black text-xl text-slate-900 leading-none tabular-nums">{value}</p>
        <p className="font-inter text-slate-500 text-xs mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
}

export default function StudentHome() {
  useDocumentMeta('Mon espace', 'Ton tableau de bord Smarter Academy — reprends ta leçon, suis ta progression.');
  const { user } = useContext(AuthContext);

  const [lastFocus, setLastFocus] = useState(Date.now());
  useEffect(() => {
    const onFocus = () => setLastFocus(Date.now());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const grade = useMemo(() => getAllGrades().find((g) => g.id === user?.grade), [user?.grade]);
  const level = grade ? courseLevels.find((l) => l.id === grade.levelId) : null;

  // Deliberately searches across all grades, matching getResumeLesson's
  // documented, considered behavior (ARCHITECTURE.md §10) — not re-scoped
  // to the student's current grade.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const continueCourse = useMemo(() => getResumeLesson(courseLevels), [lastFocus]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gradeActivity = useMemo(() => getStudentActivity(courseLevels, { gradeId: user?.grade }), [user?.grade, lastFocus]);

  const premiumCount = gradeActivity.lessons.filter((l) => l.lesson.tier === 'premium').length;
  const firstLesson = gradeActivity.lessons[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2">
          Apprendre → Pratiquer → Progresser → Maîtriser
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">
          Bonjour {getDisplayName(user)} 👋
        </h1>
        <p className="font-inter text-slate-500 text-sm mt-1">
          {grade ? `${level?.title} ${grade.name}` : 'Choisis ta classe dans ton profil pour commencer.'}
        </p>
      </motion.div>

      <DiagnosticInviteBanner />

      {/* Continue / Start */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        {continueCourse ? (
          <Link
            to={`${continueCourse.course.path}/${continueCourse.resumeModule}`}
            className="group block glass-card p-6 sm:p-7 relative overflow-hidden hover:border-blue-300 transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Play size={12} /> Continue ton apprentissage
            </p>
            <div className="flex items-start gap-4">
              <div className="text-4xl bg-blue-50 p-3 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                {continueCourse.course.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-space font-bold text-slate-900 text-lg sm:text-xl group-hover:text-blue-600 transition-colors">
                  {continueCourse.course.title}
                </h2>
                <p className="font-inter text-slate-500 text-sm mt-0.5">
                  {continueCourse.chapter.title} · {continueCourse.grade.name} · Module {continueCourse.resumeModule} sur {continueCourse.totalModules}
                </p>
                <div className="mt-4 flex items-center gap-3 max-w-sm">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${continueCourse.progress}%` }} />
                  </div>
                  <span className="text-xs font-mono-jetbrains font-bold text-slate-600 tabular-nums">{continueCourse.progress}%</span>
                </div>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 font-bold text-sm text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
                Continuer <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ) : firstLesson ? (
          <Link
            to={firstLesson.lesson.path}
            className="group block glass-card p-6 sm:p-7 relative overflow-hidden hover:border-blue-300 transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <p className="font-mono-jetbrains text-emerald-600 text-xs font-semibold uppercase tracking-widest mb-3">
              Prêt à commencer
            </p>
            <div className="flex items-start gap-4">
              <div className="text-4xl bg-emerald-50 p-3 rounded-2xl group-hover:scale-105 transition-transform flex-shrink-0">
                {firstLesson.lesson.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-space font-bold text-slate-900 text-lg sm:text-xl group-hover:text-emerald-600 transition-colors">
                  {firstLesson.lesson.title}
                </h2>
                <p className="font-inter text-slate-500 text-sm mt-0.5 line-clamp-2">{firstLesson.lesson.description}</p>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 font-bold text-sm text-emerald-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
                Commencer <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ) : (
          <div className="glass-card p-7 text-center">
            <p className="font-inter text-slate-500 text-sm">
              Aucune leçon disponible pour ta classe pour l'instant. <Link to="/espace/explorer" className="text-blue-600 font-semibold hover:underline">Explore d'autres niveaux →</Link>
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatTile icon={BookOpen} value={gradeActivity.lessons.length} label="Leçons disponibles" accent="bg-blue-50 text-blue-600" />
        <StatTile icon={CircleCheckBig} value={gradeActivity.completedCount} label="Leçons terminées" accent="bg-emerald-50 text-emerald-600" />
        <StatTile icon={Flame} value={gradeActivity.inProgressCount} label="En cours" accent="bg-amber-50 text-amber-600" />
        <StatTile icon={Zap} value={gradeActivity.totalXp} label="XP gagné" accent="bg-purple-50 text-purple-600" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-space font-bold text-slate-800 text-sm mb-4">Repris récemment</h3>
          {gradeActivity.recentlyActive.length === 0 ? (
            <p className="font-inter text-slate-400 text-sm">Rien à afficher pour l'instant — commence une leçon !</p>
          ) : (
            <div className="space-y-3">
              {gradeActivity.recentlyActive.slice(0, 4).map((item) => (
                <Link
                  key={item.lesson.id}
                  to={item.lesson.path}
                  className="flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-xl flex-shrink-0">{item.lesson.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-medium text-slate-700 text-sm truncate group-hover:text-blue-600">{item.lesson.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                        <div className={`h-full ${item.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${item.progressPercent}%` }} />
                      </div>
                      <span className="text-[11px] font-mono-jetbrains text-slate-400 tabular-nums">{item.progressPercent}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick access */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <Link to="/espace/cours" className="group glass-card p-5 flex items-center gap-4 hover:border-blue-300 transition-colors block">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={19} />
            </div>
            <div className="flex-1">
              <p className="font-space font-bold text-slate-800 text-sm">Mes cours — {grade ? grade.name : 'ta classe'}</p>
              <p className="font-inter text-slate-500 text-xs mt-0.5">Voir toutes les leçons de ton niveau</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          <Link to="/espace/explorer" className="group glass-card p-5 flex items-center gap-4 hover:border-purple-300 transition-colors block">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Compass size={19} />
            </div>
            <div className="flex-1">
              <p className="font-space font-bold text-slate-800 text-sm">Explorer d'autres niveaux</p>
              <p className="font-inter text-slate-500 text-xs mt-0.5">De la 6e à la Terminale</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {premiumCount > 0 && (
            <Link to="/tarifs" className="group glass-card p-5 flex items-center gap-4 border-amber-200 hover:border-amber-300 transition-colors block bg-gradient-to-br from-amber-50/50 to-white">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Crown size={19} />
              </div>
              <div className="flex-1">
                <p className="font-space font-bold text-slate-800 text-sm">{premiumCount} leçon{premiumCount > 1 ? 's' : ''} Premium {premiumCount > 1 ? 'disponibles' : 'disponible'}</p>
                <p className="font-inter text-slate-500 text-xs mt-0.5">Débloque avec l'abonnement — 35€/an</p>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}
