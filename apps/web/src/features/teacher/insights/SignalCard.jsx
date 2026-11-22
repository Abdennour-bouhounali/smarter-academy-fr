import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TrendingDown, Repeat, Hourglass, MoonStar, HandHelping, Target } from 'lucide-react';
import { formatDate } from '../../../pages/teacher/teacherUi';
import MasteryPill from '../learningPoints/MasteryPill';
import { signalWhyParams, studentName } from './insights';

const ICON = {
  class_difficulty: AlertTriangle,
  repeated_difficulty: Repeat,
  declined: TrendingDown,
  stalled: Hourglass,
  no_recent_activity: MoonStar,
};

const TONE = {
  class_difficulty: 'border-s-rose-400',
  repeated_difficulty: 'border-s-rose-300',
  declined: 'border-s-amber-400',
  stalled: 'border-s-amber-300',
  no_recent_activity: 'border-s-slate-300',
};

/**
 * UN signal de « تستحقّ نظرة » — QUOI (le titre), POURQUOI (les nombres du
 * serveur), QUI (les élèves, chacun vers son dossier), QUAND (le dernier
 * indice), une PISTE (les prérequis faibles), et QUE FAIRE (ouvrir le
 * point, intervenir).
 *
 * La carte ne décide rien : elle met en mots `signal.type`,
 * `signal.indicator` et la preuve de chaque élève, tels que le serveur les a
 * calculés (App\Domain\Classroom\Insights\AttentionSignals).
 */
export default function SignalCard({ signal, classGroupId, onOpenPoint, onAct, compact = false }) {
  const { t } = useTranslation('teacher');
  const Icon = ICON[signal.type] ?? AlertTriangle;
  const why = signalWhyParams(signal);
  const status = (code) => (code ? t(`students.masteryStatus.${code}`) : '—');
  const point = signal.learningPoint;
  const unnamed = t('common.unnamedStudent');

  return (
    <article className={`rounded-2xl border border-nav-line bg-white border-s-4 ${TONE[signal.type] ?? 'border-s-slate-300'} p-4`} data-signal={signal.key} data-signal-type={signal.type}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600" aria-hidden="true"><Icon size={16} /></span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-space text-sm font-bold text-slate-900">
            {t(`attention.types.${signal.type}.title`, { point: point?.title ?? '' })}
          </h3>
          {point?.lessonTitle && <p className="text-[11px] text-nav-accent">{point.lessonTitle}</p>}
          <p className="text-xs text-slate-600" data-signal-why>
            {t(`attention.types.${signal.type}.why`, { ...why, from: status(why.from), to: status(why.to) })}
            {signal.type === 'no_recent_activity' && why.neverStarted > 0 && ` ${t('attention.neverStartedCount', { count: why.neverStarted })}`}
            {signal.indicator?.scope && signal.indicator.scope !== 'none' && (
              <span className="ms-2 inline-block whitespace-nowrap rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">{t(`attention.scope.${signal.indicator.scope}`)}</span>
            )}
          </p>

          <ul className="flex flex-wrap gap-1.5 pt-1" aria-label={t('students.title')}>
            {(compact ? signal.students.slice(0, 8) : signal.students).map((s) => (
              <li key={s.id}>
                <Link
                  to={`/enseignant/classes/${classGroupId}/eleves/${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:border-nav-accent"
                  title={s.recent ? t('attention.studentFacts', { failures: s.recent.failures ?? 0, answered: s.recent.answered ?? 0 }) : undefined}
                  data-signal-student={s.id}
                >
                  <span className="font-semibold">{studentName(s, unnamed)}</span>
                  {s.status && signal.category === 'learning' && <MasteryPill status={s.status} className="!px-1.5 !py-0 !text-[9px]" />}
                  {signal.category === 'engagement' && (
                    <span className="text-slate-400">{s.lastActivityAt ? formatDate(s.lastActivityAt) : t('attention.neverStarted')}</span>
                  )}
                </Link>
              </li>
            ))}
            {compact && signal.students.length > 8 && <li className="px-1 text-[11px] text-slate-400">+{signal.students.length - 8}</li>}
          </ul>

          {signal.prerequisites?.length > 0 && (
            <p className="text-[11px] text-slate-600" data-signal-prerequisites>
              {t('attention.prerequisites')}{' '}
              {signal.prerequisites.map((p, i) => (
                <span key={p.code}>{i > 0 && '، '}<span className="font-semibold">{t('attention.prerequisiteInGap', { title: p.title, count: p.studentsInGap })}</span></span>
              ))}
            </p>
          )}
          {signal.lastEvidenceAt && <p className="text-[10px] text-slate-400">{t('attention.lastEvidence', { date: formatDate(signal.lastEvidenceAt) })}</p>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {point && onOpenPoint && (
          <button type="button" onClick={() => onOpenPoint(point.code)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-nav-accent hover:bg-nav-page" data-signal-open-point>
            <Target size={13} /> {t('attention.openPoint')}
          </button>
        )}
        {onAct && (
          <button type="button" onClick={() => onAct(signal)} className="inline-flex items-center gap-1 rounded-lg bg-nav-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3350c4]" data-signal-act>
            <HandHelping size={13} /> {t('attention.act')}
          </button>
        )}
      </div>
    </article>
  );
}
