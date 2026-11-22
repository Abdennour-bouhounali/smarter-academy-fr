import { useTranslation } from 'react-i18next';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronDown, GraduationCap, History, Sparkles, Target } from 'lucide-react';
import { MASTERY_STATE_KEYS, stateLabel } from '../../lessons/common/components/masteryLabels';
import MathLabel from '../../lessons/common/components/MathLabel';
import { LOCALE } from '../../locale.js';
import { barPercent } from './format';

/** Les couleurs des quatre états — le libellé, lui, vient de `student:mastery.*`. */
const STATE_TONE = {
  mastered: { bar: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  reinforce: { bar: 'bg-amber-400', pill: 'bg-amber-50 text-amber-800 ring-amber-200' },
  gap: { bar: 'bg-rose-500', pill: 'bg-rose-50 text-rose-800 ring-rose-200' },
  unassessed: { bar: 'bg-slate-300', pill: 'bg-slate-50 text-slate-600 ring-slate-200' },
};

const LESSON_TONE = {
  completed: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-nav-accent-soft text-nav-accent',
  not_started: 'bg-slate-100 text-slate-600',
};

const when = (iso) => (iso ? new Date(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', numberingSystem: 'latn' }) : '');

function StatePill({ state, tStudent }) {
  const tone = STATE_TONE[state] ?? STATE_TONE.unassessed;
  return (
    <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone.pill}`}>
      {stateLabel(state, tStudent)}
    </span>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 font-space text-base font-bold text-slate-900">
        <Icon size={18} className="text-nav-accent" aria-hidden="true" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function eventText(t, e) {
  const values = {
    lesson: e.lesson ?? '',
    modules: e.modulesCompleted ?? 0,
    level: e.level ?? '',
    correct: e.correct ?? 0,
    answered: e.answered ?? 0,
    score: e.score ?? 0,
    total: e.total ?? 0,
  };
  return t(`progress.event.${e.type}`, { ...values, defaultValue: e.lesson ?? '' });
}

/**
 * « La progression en détail » (docs/architecture/PARENT_SPACE.md §4bis) — l'année
 * entière, pour le parent ET pour l'élève (même forme serveur,
 * ParentProgressService). Conçu d'abord pour le TÉLÉPHONE : une colonne, des
 * cartes repliables par leçon, puis deux colonnes à partir de `md`.
 *
 * Les états des savoir-faire portent les libellés UNIQUES `student:mastery.*`
 * (« la maîtrise et l'avancement ne partagent aucun mot »).
 */
export default function ProgressDetail({ progress, audience = 'parent' }) {
  const { t } = useTranslation('family');
  const { t: tStudent } = useTranslation('student');
  const s = progress.summary;
  const counts = s.masteryCounts ?? {};
  const assessed = MASTERY_STATE_KEYS.reduce((n, k) => n + (counts[k] ?? 0), 0);

  return (
    <div className="space-y-4 sm:space-y-5" data-progress-detail>
      <Card icon={GraduationCap} title={t('progress.yearTitle')}>
        {s.gradeLessons > 0 ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-inter text-sm text-slate-700">{t('progress.yearValue', { done: s.gradeLessonsCompleted, total: s.gradeLessons })}</p>
              <p className="font-space text-2xl font-bold text-nav-accent">{s.progressPercent}{'\u00A0%'}</p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${barPercent(s.gradeLessonsCompleted, s.gradeLessons)}%` }} />
            </div>
          </>
        ) : (
          <p className="font-inter text-sm text-slate-500">{t('progress.yearNone')}</p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-inter text-xs text-slate-500">{t('progress.lessonsStarted')}</p>
          <p className="mt-1 font-space text-xl font-bold text-slate-900">{s.lessonsStarted}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="font-inter text-xs text-slate-500">{t('progress.successRate')}</p>
          <p className="mt-1 font-space text-xl font-bold text-slate-900">
            {/* OutcomeStats::rate — déjà en pourcentage (0–100). */}
            {s.successRate == null ? t('progress.successRateNone') : `${Math.round(s.successRate)}\u00A0%`}
          </p>
          {s.questionsAnswered > 0 && (
            <p className="font-inter text-xs text-slate-500">{t('progress.answersHint', { correct: s.correctAnswers, answered: s.questionsAnswered })}</p>
          )}
        </div>
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 md:col-span-1">
          <p className="font-inter text-xs text-slate-500">{t('progress.mastered')}</p>
          <p className="mt-1 font-space text-xl font-bold text-emerald-700">{counts.mastered ?? 0}</p>
          <p className="font-inter text-xs text-slate-500">{t('progress.masteryOf', { total: assessed })}</p>
        </div>
      </div>

      {assessed > 0 && (
        <Card icon={Target} title={t('progress.distributionTitle')}>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img"
            aria-label={MASTERY_STATE_KEYS.map((k) => `${stateLabel(k, tStudent)}\u00A0: ${counts[k] ?? 0}`).join(' · ')}>
            {['mastered', 'reinforce', 'gap', 'unassessed'].map((k) => (
              <div key={k} className={STATE_TONE[k].bar} style={{ width: `${((counts[k] ?? 0) / assessed) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {['mastered', 'reinforce', 'gap', 'unassessed'].map((k) => (
              <li key={k} className="flex items-center gap-2 font-inter text-xs text-slate-700">
                <span className={`h-3 w-3 flex-shrink-0 rounded ${STATE_TONE[k].bar}`} />
                <span className="truncate">{stateLabel(k, tStudent)}</span>
                <span className="ms-auto font-semibold">{counts[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card icon={AlertTriangle} title={t('progress.supportTitle')}>
        {progress.needsSupport.length === 0 ? (
          <p className="font-inter text-sm text-slate-500">{t('progress.supportNone')}</p>
        ) : (
          <>
            <p className="mb-3 font-inter text-sm text-slate-600">{t({ parent: 'progress.supportIntro', school: 'progress.supportIntroSchool' }[audience] ?? 'progress.supportIntroStudent')}</p>
            <ul className="space-y-2">
              {progress.needsSupport.map((lp) => (
                <li key={lp.code} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="font-inter text-sm font-semibold text-slate-800"><MathLabel>{lp.title}</MathLabel></p>
                    {lp.lessonTitle && <p className="font-inter text-xs text-slate-500"><MathLabel>{lp.lessonTitle}</MathLabel></p>}
                  </div>
                  <StatePill state={lp.status} tStudent={tStudent} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card icon={BookOpen} title={t('progress.lessonsTitle')}>
        {progress.lessons.length === 0 ? (
          <p className="font-inter text-sm text-slate-500">{t('progress.lessonsNone')}</p>
        ) : (
          <ul className="space-y-2">
            {progress.lessons.map((l) => (
              <li key={l.code}>
                <details className="group rounded-xl border border-slate-200 bg-white open:bg-slate-50/60" data-lesson-row>
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-3 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      {l.unitTitle && <p className="truncate font-inter text-[11px] text-slate-400">{l.unitTitle}</p>}
                      <p className="font-inter text-sm font-semibold text-slate-900"><MathLabel>{l.title}</MathLabel></p>
                      {l.modulesTotal > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${barPercent(l.modulesCompleted, l.modulesTotal)}%` }} />
                          </div>
                          <span className="font-inter text-[11px] text-slate-500">{l.modulesCompleted}/{l.modulesTotal}</span>
                        </div>
                      )}
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${LESSON_TONE[l.status] ?? LESSON_TONE.not_started}`}>
                      {l.status === 'completed' && <CheckCircle2 size={11} className="me-1 inline" aria-hidden="true" />}
                      {t(`progress.status.${l.status}`, { defaultValue: l.status })}
                    </span>
                    <ChevronDown size={16} className="mt-0.5 flex-shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="space-y-3 border-t border-slate-100 p-3 font-inter text-sm text-slate-700">
                    {l.modulesTotal > 0 && <p>{t('progress.modules', { done: l.modulesCompleted, total: l.modulesTotal })}</p>}
                    <p>{l.practice ? t('progress.practice', { correct: l.practice.correct, answered: l.practice.answered }) : t('progress.practiceNone')}</p>
                    {l.practice?.bestLevel != null && <p>{t('progress.bestLevel', { level: l.practice.bestLevel })}</p>}
                    {l.finalTest && <p>{t('progress.finalTest', { score: l.finalTest.score, total: l.finalTest.total })}</p>}
                    {l.learningPoints.length > 0 && (
                      <div>
                        <p className="mb-2 font-semibold text-slate-800">{t('progress.learningPoints', { count: l.learningPoints.length })}</p>
                        <ul className="space-y-1.5">
                          {l.learningPoints.map((lp) => (
                            <li key={lp.code} className="flex items-start justify-between gap-3">
                              <span className="text-[13px] leading-snug"><MathLabel>{lp.title}</MathLabel></span>
                              <StatePill state={lp.status} tStudent={tStudent} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {l.lastActivityAt && <p className="text-xs text-slate-500">{t('progress.lastActivity', { date: when(l.lastActivityAt) })}</p>}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card icon={History} title={t('progress.timelineTitle')}>
        {progress.timeline.length === 0 ? (
          <p className="font-inter text-sm text-slate-500">{t('progress.timelineNone')}</p>
        ) : (
          <ol className="space-y-2.5 border-s-2 border-indigo-100 ps-4">
            {progress.timeline.map((e, i) => (
              <li key={`${e.type}-${e.at}-${i}`} className="relative">
                <span className="absolute -start-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-400" aria-hidden="true" />
                <p className="font-inter text-sm text-slate-800">
                  {e.type === 'lesson_completed' && <Sparkles size={13} className="me-1 inline text-emerald-600" aria-hidden="true" />}
                  {eventText(t, e)}
                </p>
                <p className="font-inter text-xs text-slate-400">{when(e.at)}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
