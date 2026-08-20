import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, CircleCheckBig, Flame, Zap, ArrowRight, Target } from 'lucide-react';
import { courseLevels } from '@smarter-academy/core';
import { getStudentActivity } from '../../lessons/common/utils/progress/getStudentActivity';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLearningProfile } from '../../lessons/common/hooks/useLearningProfile';
import { LearningPointCard, resolveMasteryState } from '../../lessons/common/components/LearningPointMastery';

/** Looks up a lesson's display title/path and its chapter's title from the
 * catalogue — the learning-profile API only returns codes (grade/lesson/
 * chapter), never display strings for the lesson/chapter themselves. */
function resolveLessonMeta(gradeId, lessonId) {
  for (const level of courseLevels) {
    const grade = level.grades.find((g) => g.id === gradeId);
    if (!grade) continue;
    for (const chapter of grade.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) return { lessonTitle: lesson.title, lessonPath: lesson.path, chapterTitle: chapter.title, gradeLabel: `${level.title} (${grade.name})` };
    }
  }
  return null;
}

const MASTERY_MESSAGE = {
  unassessed: 'Pas encore assez de réponses enregistrées.',
  gap: 'Une vraie difficulté à travailler.',
  reinforce: "Des bases, mais pas encore solide.",
  mastered: 'Compétence solidement acquise.',
};

function MesAcquisSection() {
  const { profile, status, reload } = useLearningProfile();

  if (status === 'loading') {
    return <div className="glass-card p-8 text-center text-sm text-slate-400">Chargement de tes acquis…</div>;
  }

  if (status === 'anonymous' || status === 'error') {
    return null; // Progression already lives behind an authenticated route.
  }

  const lessonGroups = (profile?.currentMastery || []).flatMap((g) => g.lessons.map((l) => ({ gradeId: g.grade, ...l })));

  if (lessonGroups.length === 0) {
    return (
      <div className="glass-card p-8 text-center space-y-1">
        <p className="font-inter text-slate-500 text-sm">Termine le bilan d'une leçon pour voir tes premiers acquis apparaître ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {lessonGroups.map((group) => {
        const meta = resolveLessonMeta(group.gradeId, group.lesson);
        return (
          <div key={`${group.gradeId}:${group.lesson}`}>
            <div className="mb-3">
              <p className="font-mono-jetbrains text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {meta?.gradeLabel || group.gradeId} · {meta?.chapterTitle || group.chapter}
              </p>
              <h3 className="font-space font-bold text-slate-800 text-sm">{meta?.lessonTitle || group.title}</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.learningPoints.map((lp) => {
                const state = resolveMasteryState(lp);
                return (
                  <LearningPointCard
                    key={lp.code}
                    title={lp.title}
                    state={state}
                    confidence={lp.confidence}
                    message={MASTERY_MESSAGE[state]}
                    action={
                      meta?.lessonPath ? (
                        <Link to={meta.lessonPath} className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 underline decoration-dotted">
                          → Revoir la leçon
                        </Link>
                      ) : null
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={reload}
        className="text-xs font-mono font-bold text-slate-400 hover:text-slate-600 underline decoration-dotted"
      >
        🔄 Rafraîchir
      </button>
    </div>
  );
}

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

export default function Progression() {
  useDocumentMeta('Ma progression', 'Suis ta progression sur toutes tes leçons commencées.');

  // Progress spans every grade a student has touched, not just their
  // current one — matches getResumeLesson's documented, considered
  // decision (ARCHITECTURE.md §10): progress is never grade-locked.
  const activity = useMemo(() => getStudentActivity(courseLevels), []);

  const byGrade = useMemo(() => {
    const map = new Map();
    activity.lessons.forEach((item) => {
      const key = `${item.level.title} ${item.grade.name}`;
      if (!map.has(key)) map.set(key, { label: key, lessons: [] });
      map.get(key).lessons.push(item);
    });
    return Array.from(map.values()).filter((g) => g.lessons.some((l) => l.lastVisitedAt > 0));
  }, [activity]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <TrendingUp size={13} /> Ma progression
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Ce que tu as accompli</h1>
        <p className="font-inter text-slate-500 text-sm mt-1 max-w-xl">
          Un aperçu de ta progression — combien de leçons terminées, en cours, et où tu en es. Pour la maîtrise
          réelle compétence par compétence, voir « Mes acquis » ci-dessous.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatTile icon={CircleCheckBig} value={activity.completedCount} label="Leçons terminées" accent="bg-emerald-50 text-emerald-600" />
        <StatTile icon={Flame} value={activity.inProgressCount} label="Leçons en cours" accent="bg-amber-50 text-amber-600" />
        <StatTile icon={TrendingUp} value={`${activity.averageProgress}%`} label="Progression moyenne" accent="bg-blue-50 text-blue-600" />
        <StatTile icon={Zap} value={activity.totalXp} label="XP total" accent="bg-purple-50 text-purple-600" />
      </div>

      {byGrade.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="font-inter text-slate-500 text-sm mb-5">Tu n'as pas encore commencé de leçon.</p>
          <Link to="/espace/cours" className="btn-primary text-sm inline-flex">Commencer une leçon</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {byGrade.map((group) => (
            <motion.div key={group.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-space font-bold text-slate-800 text-sm mb-3">{group.label}</h2>
              <div className="glass-card divide-y divide-slate-100">
                {group.lessons
                  .filter((l) => l.lastVisitedAt > 0)
                  .sort((a, b) => b.lastVisitedAt - a.lastVisitedAt)
                  .map((item) => (
                    <Link
                      key={item.lesson.id}
                      to={item.lesson.path}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50/70 transition-colors group first:rounded-t-[20px] last:rounded-b-[20px]"
                    >
                      <span className="text-2xl flex-shrink-0">{item.lesson.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-inter font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600">{item.lesson.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[160px]">
                            <div className={`h-full ${item.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${item.progressPercent}%` }} />
                          </div>
                          <span className="text-xs font-mono-jetbrains font-bold text-slate-500 tabular-nums">{item.progressPercent}%</span>
                        </div>
                      </div>
                      <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-12">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <Target size={13} /> Mes acquis
        </p>
        <h2 className="font-space font-bold text-xl text-slate-900 mb-1">Ce que je maîtrise, compétence par compétence</h2>
        <p className="font-inter text-slate-500 text-sm mb-6 max-w-xl">
          Le résultat de chaque compétence (Learning Point), basé sur tes vraies réponses aux bilans — jamais une
          moyenne générale de la leçon.
        </p>
        <MesAcquisSection />
      </div>
    </div>
  );
}
