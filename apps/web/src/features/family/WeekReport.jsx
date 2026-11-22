import { useTranslation } from 'react-i18next';
import { BookOpen, CalendarCheck, CheckCircle2, Clock, Gamepad2, LogOut, Sparkles, Target } from 'lucide-react';
import MathLabel from '../../lessons/common/components/MathLabel';
import { barPercent, formatDuration, shortDate, weekdayOf } from './format';

function Tile({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <p className="font-inter text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-space text-lg font-bold text-slate-900 sm:text-xl">{value}</p>
      {hint && <p className="mt-0.5 font-inter text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
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

/**
 * Le RAPPORT DE LA SEMAINE (docs/architecture/PARENT_SPACE.md §4) — un seul
 * composant pour le parent (/wali/abnaa/:id) et pour l'élève (« Ce que voit ton parent »,
 * /espace/profil/wali) : ce que l'élève voit est exactement ce que voit son parent.
 *
 * `report` est la forme de ParentReportService::week(). `audience` ne change
 * que la phrase d'encouragement d'une semaine vide, adressée au parent.
 */
export default function WeekReport({ report, audience = 'parent' }) {
  const { t } = useTranslation('family');
  const time = report.time;
  const days = t('days', { returnObjects: true });
  const daysShort = t('daysShort', { returnObjects: true });
  const max = Math.max(...time.days.map((d) => d.studySeconds + d.gameSeconds), 0);

  return (
    <div className="space-y-5" data-week-report>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile icon={Clock} tone="bg-nav-accent-soft text-nav-accent" label={t('report.studyTime')} value={formatDuration(t, time.studySeconds)} />
        <Tile icon={CalendarCheck} tone="bg-emerald-50 text-emerald-600" label={t('report.activeDays')} value={t('report.activeDaysValue', { count: time.activeDays })} />
        <Tile
          icon={LogOut}
          tone="bg-rose-50 text-rose-600"
          label={t('report.away')}
          value={formatDuration(t, time.awaySeconds)}
          hint={t('report.awayHint', { count: time.leaves })}
        />
        <Tile icon={Gamepad2} tone="bg-amber-50 text-amber-600" label={t('report.games')} value={formatDuration(t, time.gameSeconds)} />
      </div>

      {audience === 'parent' && time.studySeconds < 60 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4" role="status">
          <p className="font-space font-bold text-amber-900">{t('report.nothingTitle')}</p>
          <p className="mt-1 font-inter text-sm text-amber-800">{t('report.nothingText')}</p>
        </div>
      )}

      <Section icon={CalendarCheck} title={t('report.chartTitle')}>
        <div className="flex items-end gap-1 sm:gap-2" style={{ height: 150 }} role="list">
          {time.days.map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1" role="listitem"
              aria-label={`${days[weekdayOf(d.date)]}\u00A0: ${formatDuration(t, d.studySeconds)}`}>
              {/* La durée au-dessus de la barre : à partir de `sm` seulement — à
                  390 px une colonne fait ~44 px ; l'aria-label la porte toujours. */}
              <span className="hidden font-inter text-[11px] font-semibold text-slate-600 sm:inline">
                {d.studySeconds >= 60 ? formatDuration(t, d.studySeconds) : ''}
              </span>
              <div className="flex w-full max-w-[44px] flex-col-reverse overflow-hidden rounded-lg bg-slate-100" style={{ height: '100%' }}>
                <div className="bg-indigo-500" style={{ height: `${barPercent(d.studySeconds, max)}%` }} />
                <div className="bg-amber-400" style={{ height: `${barPercent(d.gameSeconds, max)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1 sm:gap-2">
          {time.days.map((d) => (
            <div key={d.date} className="flex-1 text-center">
              <p className="font-inter text-[11px] font-semibold text-slate-700 sm:text-xs">
                <span className="sm:hidden">{daysShort[weekdayOf(d.date)]}</span>
                <span className="hidden sm:inline">{days[weekdayOf(d.date)]}</span>
              </p>
              <p className="font-inter text-[11px] font-semibold text-nav-accent sm:hidden">{d.studySeconds >= 60 ? Math.floor(d.studySeconds / 60) : ''}</p>
              <p className="font-inter text-[11px] text-slate-400">{shortDate(d.date)}</p>
              {d.awaySeconds >= 60 && (
                <p className="mt-0.5 font-inter text-[10px] font-semibold text-rose-600 sm:text-[11px]">↗ {formatDuration(t, d.awaySeconds)}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 font-inter text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-indigo-500" />{t('report.legendStudy')}</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400" />{t('report.legendGame')}</span>
          <span className="flex items-center gap-1.5"><span className="font-semibold text-rose-600">↗</span>{t('report.legendAway')}</span>
        </div>
        <details className="mt-4 rounded-xl bg-slate-50 p-3">
          <summary className="cursor-pointer font-space text-sm font-semibold text-slate-800">{t('report.howTitle')}</summary>
          <ul className="mt-2 space-y-1.5 font-inter text-sm leading-relaxed text-slate-600">
            <li>{t('report.howActive')}</li>
            <li>{t('report.howAway')}</li>
            <li>{t('report.howLimit')}</li>
          </ul>
        </details>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={Target} title={t('report.practiceTitle')}>
          <p className="font-inter text-sm text-slate-700">
            {report.practice.answered > 0
              ? t('report.practiceValue', { correct: report.practice.correct, answered: report.practice.answered })
              : t('report.practiceNone')}
          </p>
          {report.practice.answered > 0 && (
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${barPercent(report.practice.correct, report.practice.answered)}%` }} />
            </div>
          )}
        </Section>

        <Section icon={BookOpen} title={t('report.lessonsTitle')}>
          {report.lessons.worked === 0 ? (
            <p className="font-inter text-sm text-slate-500">{t('report.lessonsNone')}</p>
          ) : (
            <>
              <p className="mb-2 font-inter text-sm text-slate-700">
                {t('report.lessonsValue', { worked: report.lessons.worked, completed: report.lessons.completed })}
              </p>
              <ul className="space-y-1.5">
                {report.lessons.items.map((l) => (
                  <li key={l.code} className="flex items-center justify-between gap-2 font-inter text-sm text-slate-700">
                    <span className="truncate"><MathLabel>{l.title}</MathLabel></span>
                    {l.completedThisWeek && (
                      <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={12} aria-hidden="true" />
                        {t('report.completedBadge')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      </div>

      <Section icon={Sparkles} title={`${t('report.masteredTitle')} (${report.mastered.count})`}>
        {report.mastered.count === 0 ? (
          <p className="font-inter text-sm text-slate-500">{t('report.masteredNone')}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {report.mastered.items.map((m) => (
              <li key={m.code} className="rounded-xl bg-indigo-50/60 px-3 py-2">
                <p className="font-inter text-sm font-semibold text-slate-800"><MathLabel>{m.title}</MathLabel></p>
                {m.lessonTitle && <p className="font-inter text-xs text-slate-500"><MathLabel>{m.lessonTitle}</MathLabel></p>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
