import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, CalendarDays, RotateCcw, Target, Check, BookOpen, Users } from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import { getLesson } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import MathLabel from '../../../lessons/common/components/MathLabel';
import MathText from '../../../lessons/common/components/MathText';
import { LOCALE } from '../../../locale.js';
import {
  yearFor, reportOf, weekV0, milestone, yearStrip, teachingWeekNumber, tickTasks,
} from '../../compass/compassModel';

/**
 * L'accueil de l'élève quand « Ma boussole » est ouverte pour sa classe (YEAR_COMPASS.md §6bis).
 * C'est TOUT l'accueil (l'ancien a été retiré le 2026-11-09). Quatre états, lus dans l'état du SERVEUR (`GET /compass`) :
 *   off    → la jauge pas encore ouverte pour la classe : la leçon et le défi, puis la bande de l'année ;
 *   new    → UNE carte « Sache d’où tu pars », un lien discret vers la leçon en cours ;
 *   active → « Continue ton tour de départ », puis la leçon et le défi ;
 *   done   → « Mission du jour » (la 1re tâche non faite de la semaine), la semaine et la carte
 *            des bandes, la leçon et le défi, la bande de l'année, la reprise de la jauge.
 * Lot PARESSEUX (réseau + calendrier) : l'accueil s'affiche sans l'attendre.
 * Rien n'est inventé ici : les bandes viennent du serveur, les tâches de weekV0, la coche
 * d'une tâche du passage de l'élève dans sa leçon APRÈS la jauge.
 */
export default function CompassHomeSections({ compass, gradeId, today, resume, visits, classroom, challenge }) {
  const { t } = useTranslation('student');
  const year = useMemo(() => yearFor(gradeId, today), [gradeId, today]);
  const m = milestone(year, gradeId, today);
  // `off` : la jauge n'est pas encore ouverte pour cette classe (1AM–3AM aujourd'hui) — même page, sans la jauge.
  const stateKey = !compass.enabled ? 'off' : compass.active ? 'active' : compass.last ? 'done' : 'new';
  const pointerCode = (compass.active ?? compass.last)?.pointerLesson ?? null;
  const pointerTitle = pointerCode ? getLesson(pointerCode)?.title : null;

  return (
    <div className="space-y-5" data-compass-home={stateKey}>
      <div className="flex flex-wrap gap-2" data-compass-chips>
        {classroom && (
          <Chip tone="class" icon={Users}>{t('compassHome.classChip', { name: classroom.name, teacher: classroom.teacherName ?? '' })}</Chip>
        )}
        {stateKey !== 'new' && pointerTitle && <Chip icon={Compass}>{t('compassHome.pointer', { title: pointerTitle })}</Chip>}
        {m && (
          <Chip tone="exam" icon={CalendarDays}>
            {m.daysLeft > 0 ? t('compassHome.milestone', { label: m.label, count: m.daysLeft }) : t('compassHome.milestoneNow', { label: m.label })}
          </Chip>
        )}
      </div>

      {stateKey === 'new' && <NewHero resume={resume} />}
      {stateKey === 'active' && <ActiveHero active={compass.active} />}
      {stateKey === 'done' && <DoneSections compass={compass} year={year} visits={visits} />}

      {stateKey !== 'new' && (
        <div className={`grid gap-4 ${challenge ? 'lg:grid-cols-2' : ''}`} data-compass-row-habits>
          <LessonCard resume={resume} />
          {challenge && <div className="min-w-0 [&>a]:mt-0 [&>a]:h-full">{challenge}</div>}
        </div>
      )}

      {(stateKey === 'done' || stateKey === 'off') && <YearStrip year={year} gradeId={gradeId} today={today} m={m} />}
      {stateKey === 'done' && <RetakeNotice nextRetakeAt={compass.nextRetakeAt} />}
    </div>
  );
}

function Chip({ tone, icon: Icon, children }) {
  const cls = tone === 'exam' ? 'bg-rose-50 text-rose-800' : tone === 'class' ? 'bg-nav-accent-soft text-indigo-900' : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${cls}`}>
      <Icon size={16} aria-hidden="true" />{children}
    </span>
  );
}

const HERO = 'flex flex-wrap items-center gap-6 rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100 ring-2 ring-nav-accent sm:p-8';
const BIG_BTN = 'inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-nav-accent px-8 text-xl font-black text-white shadow-[0_4px_0_#3730a3] hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

/* ── A · jamais fait : une carte, un bouton ─────────────────────────── */
function NewHero({ resume }) {
  const { t } = useTranslation('student');
  return (
    <>
      <section className={HERO} data-compass-hero="new">
        <div className="min-w-0 flex-[1_1_380px] space-y-3">
          <p className="text-sm font-black text-nav-accent">{t('compassHome.eyebrow')}</p>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">{t('compassHome.new.title')}</h2>
          <p className="max-w-xl text-lg leading-relaxed text-slate-700">{t('compassHome.new.body')}</p>
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('compassHome.new.minutes')}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('compassHome.new.saved')}</span>
          </div>
          <Link to="/espace/bawsala" className={BIG_BTN} data-compass-start>
            {t('compassHome.new.start')} <ArrowForward size={20} aria-hidden="true" />
          </Link>
        </div>
        <Compass aria-hidden="true" className="hidden h-44 w-44 shrink-0 text-indigo-300 md:block" strokeWidth={1.2} />
      </section>
      {resume && (
        <Link to={resume.resumePath} className="inline-block font-bold text-nav-accent hover:underline" data-compass-or-lesson>
          {t('compassHome.new.orLesson', { title: resume.course.title })}
        </Link>
      )}
    </>
  );
}

/* ── B · jauge en cours ─────────────────────────────────────────────── */
function ActiveHero({ active }) {
  const { t } = useTranslation('student');
  const answers = active.answers ?? [];
  const round = Math.floor(answers.length / 12) + 1;
  const inRound = answers.slice((round - 1) * 12);
  return (
    <section className={HERO} data-compass-hero="active">
      <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-nav-accent-soft text-nav-accent"><Compass size={44} aria-hidden="true" /></span>
      <div className="min-w-0 flex-[1_1_320px] space-y-2">
        <p className="text-sm font-black text-nav-accent">{t('compassHome.active.eyebrow', { round })}</p>
        <h2 className="text-3xl font-black text-slate-900">{t('compassHome.active.title')}</h2>
        <p className="text-lg text-slate-700">{t('compassHome.active.body', { count: answers.length })}</p>
        <div className="flex flex-wrap gap-1.5" role="img" aria-label={t('compassHome.active.progressAria', { count: answers.length })}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = inRound[i];
            const tone = !a ? (i === inRound.length ? 'bg-nav-accent' : 'bg-slate-200') : a.correct ? 'bg-emerald-500' : 'bg-slate-400';
            return <span key={i} className={`h-[18px] w-[18px] rounded-full ${tone}`} />;
          })}
        </div>
      </div>
      <Link to="/espace/bawsala" className={BIG_BTN} data-compass-resume>
        {t('compassHome.active.resume')} <ArrowForward size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}

/* ── C · après la jauge ─────────────────────────────────────────────── */
function DoneSections({ compass, year, visits }) {
  const { t } = useTranslation('student');
  const last = compass.last;
  const report = useMemo(() => reportOf(last, compass.availability), [last, compass.availability]);
  const week = useMemo(
    () => tickTasks(weekV0(report, year, last.pointerLesson), visits, last.finishedAt),
    [report, year, last.pointerLesson, last.finishedAt, visits],
  );
  const total = week.tasks.length;

  return (
    <>
      <TodayHero task={week.today} done={week.doneCount} total={total} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="compass-week-h" data-compass-week>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="compass-week-h" className="text-lg font-black text-slate-900">{t('compassHome.week.title')}</h2>
            <Link to="/espace/bawsala" className="text-sm font-black text-nav-accent">{t('compassHome.week.full')}</Link>
          </div>
          <div className="flex items-center gap-3 text-sm font-black text-slate-900">
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full bg-teal-600" style={{ width: `${total ? (week.doneCount / total) * 100 : 0}%` }} />
            </span>
            <span className="tabular-nums">{t('compassHome.week.progress', { done: week.doneCount, total })}</span>
          </div>
          <ul className="space-y-2">
            {week.tasks.map((task) => <WeekRow key={`${task.kind}-${task.code}`} task={task} isToday={task === week.today} />)}
          </ul>
          <p className="text-xs text-slate-600">{t('compassHome.week.note')}</p>
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="compass-map-h" data-compass-map>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="compass-map-h" className="text-lg font-black text-slate-900">{t('compassHome.map.title')}</h2>
            {last.finishedAt && (
              <span className="text-xs text-slate-600">
                {t('compassHome.map.date', { date: new Date(last.finishedAt).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' }) })}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Band tone="bg-emerald-100 text-emerald-900" label={t('compassHome.bands.solid')} n={report.counts.solid} />
            <Band tone="bg-amber-100 text-amber-900" label={t('compassHome.bands.consolidate')} n={report.counts.consolidate} />
            <Band tone="bg-blue-100 text-blue-900" label={t('compassHome.bands.start')} n={report.counts.start} />
            <Band tone="bg-white text-slate-600 ring-1 ring-slate-300" label={t('compassHome.bands.unseen')} n={report.counts.unseen} />
          </div>
          {report.priority ? (
            <div className="rounded-2xl bg-teal-50 px-4 py-2.5 text-teal-900">
              <p className="text-xs font-black">{t('compassHome.map.startHere')}</p>
              <p className="font-black"><MathText>{report.priority.text}</MathText></p>
              <p className="text-xs">{t(`compassHome.grades.${report.priority.grade}`)}</p>
            </div>
          ) : <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 font-bold text-emerald-900">{t('compassHome.map.none')}</p>}
          <Link to="/espace/bawsala" className="text-sm font-black text-nav-accent">{t('compassHome.map.open')}</Link>
        </section>
      </div>
    </>
  );
}

function taskTitle(t, task) {
  if (task.kind === 'prepare') return t('compassHome.today.prepare', { title: task.lesson.title });
  return t('compassHome.today.revise', { title: task.item.homeLesson?.title ?? task.item.text });
}

function TodayHero({ task, done, total }) {
  const { t } = useTranslation('student');
  if (!task) {
    return (
      <section className={HERO} data-compass-hero="all-done">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-emerald-100 text-emerald-800"><Check size={44} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-black text-slate-900">{t('compassHome.today.allDone')}</h2>
          <p className="text-lg text-slate-700">{t('compassHome.today.allDoneBody')}</p>
        </div>
      </section>
    );
  }
  const prepare = task.kind === 'prepare';
  const path = task.code ? getLessonPath(task.code) : null;
  return (
    <section className={HERO} data-compass-hero="today">
      <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl ${prepare ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'}`}>
        {prepare ? <Target size={44} aria-hidden="true" /> : <RotateCcw size={44} aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-[1_1_320px] space-y-1">
        <p className="text-sm font-black text-nav-accent">{t('compassHome.today.eyebrow', { done, total })}</p>
        <h2 className="text-3xl font-black text-slate-900"><MathLabel>{taskTitle(t, task)}</MathLabel></h2>
        <p className="text-lg text-slate-700">
          {prepare ? t('compassHome.today.prepareMeta') : t('compassHome.today.reviseMeta', { grade: t(`compassHome.grades.${task.item.grade}`) })}
        </p>
      </div>
      {path
        ? <Link to={path} className={BIG_BTN} data-compass-today>{t('compassHome.today.start')} <ArrowForward size={20} aria-hidden="true" /></Link>
        : <span className="text-sm font-bold text-slate-600">{t('compassHome.today.soon')}</span>}
    </section>
  );
}

function WeekRow({ task, isToday }) {
  const { t } = useTranslation('student');
  const prepare = task.kind === 'prepare';
  const path = task.code ? getLessonPath(task.code) : null;
  const icon = task.done ? <Check size={20} aria-hidden="true" /> : prepare ? <Target size={20} aria-hidden="true" /> : <RotateCcw size={20} aria-hidden="true" />;
  const tile = task.done ? 'bg-emerald-100 text-emerald-800' : prepare ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900';
  const body = (
    <>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tile}`}>{icon}</span>
      <span className={`min-w-0 flex-1 font-bold text-slate-900 ${task.done ? 'line-through' : ''}`}><MathLabel>{taskTitle(t, task)}</MathLabel></span>
      <span className={`shrink-0 text-xs font-black ${isToday ? 'text-nav-accent' : 'text-slate-500'}`}>
        {task.done ? t('compassHome.week.done') : isToday ? t('compassHome.week.today') : t('compassHome.week.next')}
      </span>
    </>
  );
  const cls = `flex items-center gap-3 rounded-2xl px-3 py-2 ${isToday ? 'ring-2 ring-nav-accent' : 'ring-1 ring-slate-200'} ${task.done ? 'opacity-60' : ''}`;
  return (
    <li data-week-task={task.done ? 'done' : isToday ? 'today' : 'next'}>
      {path ? <Link to={path} className={`${cls} hover:bg-slate-50`}>{body}</Link> : <div className={cls}>{body}</div>}
    </li>
  );
}

function Band({ tone, label, n }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-2 font-black ${tone}`}>
      <span>{label}</span><span className="text-2xl tabular-nums">{n}</span>
    </div>
  );
}

function LessonCard({ resume }) {
  const { t } = useTranslation('student');
  if (!resume) return <div />;
  const percent = Math.round(resume.progress ?? 0);
  return (
    <Link to={resume.resumePath} className="flex h-full min-w-0 items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 sm:p-5" data-compass-lesson>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-nav-accent-soft text-nav-accent"><BookOpen size={24} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-black text-slate-900">
          <MathLabel>{percent > 0 ? t('compassHome.lesson.continue', { title: resume.course.title }) : t('compassHome.lesson.next', { title: resume.course.title })}</MathLabel>
        </span>
        <span className="block text-sm text-slate-600">{t('compassHome.lesson.progress', { percent })}</span>
        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full bg-nav-accent" style={{ width: `${percent}%` }} /></span>
      </span>
      <span className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-nav-accent">{t('compassHome.lesson.cta')}</span>
    </Link>
  );
}

const STRIP_TONE = {
  taught: 'bg-nav-accent', now: 'bg-nav-accent outline outline-[3px] outline-offset-1 outline-amber-500', coming: 'bg-indigo-100',
  devoir: 'bg-orange-300', exam: 'bg-red-400', break: 'bg-slate-200', eval: 'bg-sky-200', bem: 'bg-violet-300',
};

function YearStrip({ year, gradeId, today, m }) {
  const { t } = useTranslation('student');
  const weeks = useMemo(() => yearStrip(year, gradeId, today), [year, gradeId, today]);
  const wk = teachingWeekNumber(year, today);
  if (!weeks.length || !wk) return null;
  const months = [];
  weeks.forEach((w, i) => {
    const prev = months[months.length - 1];
    if (prev && prev.month === w.month) prev.span += 1;
    else months.push({ month: w.month, start: i + 1, span: 1 });
  });
  const cols = { gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` };
  const legend = ['taught', 'coming', 'devoir', 'exam', 'break', ...(weeks.some((w) => w.kind === 'bem') ? ['bem'] : [])];
  return (
    <section className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="compass-year-h" data-compass-year>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="compass-year-h" className="text-lg font-black text-slate-900">{t('compassHome.year.title', { n: wk.n, total: wk.total })}</h2>
        {m && <Chip tone="exam" icon={CalendarDays}>{m.label}</Chip>}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px] space-y-1">
          <div className="grid gap-[3px] text-xs font-bold text-slate-500" style={cols}>
            {months.map((mo) => (
              <span key={`${mo.month}-${mo.start}`} className="truncate" style={{ gridColumn: `${mo.start} / span ${mo.span}` }}>
                {mo.span >= 2 ? t(`compassHome.year.months.${mo.month}`) : ''}
              </span>
            ))}
          </div>
          <div className="grid gap-[3px]" style={cols} role="img" aria-label={t('compassHome.year.aria')}>
            {weeks.map((w) => <span key={w.from} className={`h-7 rounded ${STRIP_TONE[w.kind]}`} />)}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {legend.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded ${STRIP_TONE[k]}`} />{t(`compassHome.year.legend.${k}`)}</span>
        ))}
      </div>
    </section>
  );
}

function RetakeNotice({ nextRetakeAt }) {
  const { t } = useTranslation('student');
  if (nextRetakeAt) {
    const date = new Date(nextRetakeAt).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });
    return <p className="rounded-2xl bg-nav-accent-soft px-4 py-3 font-bold text-indigo-950" data-compass-retake="later">{t('compassHome.retake.later', { date })}</p>;
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-nav-accent-soft px-4 py-3 font-bold text-indigo-950" data-compass-retake="now">
      <span>{t('compassHome.retake.now')}</span>
      <Link to="/espace/bawsala" className="font-black text-nav-accent">{t('compassHome.retake.cta')}</Link>
    </div>
  );
}
