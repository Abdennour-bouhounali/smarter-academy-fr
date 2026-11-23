import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Target, Compass, Rocket, Route, MessageCircleQuestion, Lightbulb, TriangleAlert, Users,
  BookOpenCheck, Flag, GraduationCap, UserRound, Wrench, Clock, Puzzle,
} from 'lucide-react';
import MathText from '../../../lessons/common/components/MathText';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { CLASSROOM_START_STATE, canPresentPath } from './memoRoutes';
import MathLabel from '../../../lessons/common/components/MathLabel';
import { mathToPlain } from '../../../utils/mathPlain';

/**
 * Les SECTIONS de la fiche du professeur. Chacune reçoit sa part du modèle
 * (buildLessonMemo) et ne rend RIEN quand la leçon n'a rien à y mettre :
 * aucune section vide « pour la forme », aucun texte inventé.
 *
 * Couleurs sémantiques de la plateforme : indigo = interactif / projeter,
 * teal = enseignant, amber = vigilance, emerald = réussite / à retenir,
 * rose = erreur, violet = savoir.
 */

/** Texte du contenu : les `$…$` passent par KaTeX, en ltr isolé (MathText). */
const M = ({ children }) => (typeof children === 'string' ? <MathText>{children}</MathText> : children ?? null);

const STAGE_TONE = {
  prerequisite_check: { dot: 'bg-sky-600', ring: 'border-sky-200', soft: 'bg-sky-50', text: 'text-sky-800' },
  trigger: { dot: 'bg-nav-accent', ring: 'border-indigo-200', soft: 'bg-nav-accent-soft', text: 'text-nav-accent' },
  discovery: { dot: 'bg-violet-600', ring: 'border-violet-200', soft: 'bg-violet-50', text: 'text-violet-800' },
  manipulation: { dot: 'bg-fuchsia-600', ring: 'border-fuchsia-200', soft: 'bg-fuchsia-50', text: 'text-fuchsia-800' },
  formalization: { dot: 'bg-emerald-600', ring: 'border-emerald-200', soft: 'bg-emerald-50', text: 'text-emerald-800' },
  practice_lab: { dot: 'bg-amber-500', ring: 'border-amber-200', soft: 'bg-amber-50', text: 'text-amber-900' },
  evaluation: { dot: 'bg-slate-700', ring: 'border-slate-300', soft: 'bg-slate-50', text: 'text-slate-800' },
};
const toneOf = (stage) => STAGE_TONE[stage] ?? STAGE_TONE.discovery;

function Section({ id, icon: Icon, title, lead, children, className = '' }) {
  return (
    <section id={id} className={`sa-memo-section scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 ${className}`} aria-labelledby={`${id}-title`} data-memo-section={id.replace(/^memo-/, '')}>
      <header className="mb-4">
        <h2 id={`${id}-title`} className="flex items-center gap-2 font-space text-xl font-bold text-slate-900">
          {Icon && <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nav-page text-nav-accent"><Icon className="h-5 w-5" aria-hidden="true" /></span>}
          {title}
        </h2>
        {lead && <p className="mt-1 text-sm text-slate-500">{lead}</p>}
      </header>
      {children}
    </section>
  );
}

function Pill({ children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>{children}</span>;
}

function SourcePage({ source }) {
  const { t } = useTranslation('memo');
  if (!source?.page) return null;
  return (
    <span className="text-[11px] font-semibold text-slate-400">
      {source.section ? t('examples.sourceNumber', { page: source.page, section: source.section, number: source.number ?? '' }) : t('examples.source', { page: source.page })}
    </span>
  );
}

// ── En-tête ─────────────────────────────────────────────────────────────────
export function MemoOverview({ header }) {
  const { t } = useTranslation('memo');
  const facts = [
    header.grade && [t('overview.level'), header.grade],
    header.chapter && [t('overview.domain'), header.chapter],
    header.unit && [t('overview.unit'), `${header.unit.number} — ${mathToPlain(header.unit.title)}`],
    header.durationMinutes && [t('overview.duration'), t('overview.minutesLong', { count: header.durationMinutes })],
    header.plannedMinutes > 0 && [t('overview.planned'), t('overview.minutesLong', { count: header.plannedMinutes })],
    [t('overview.modules'), String(header.moduleCount)],
  ].filter(Boolean);
  return (
    <section id="memo-overview" className="scroll-mt-28 rounded-3xl border-2 border-nav-line bg-gradient-to-br from-teal-50 via-white to-indigo-50 p-5 sm:p-7" data-memo-section="overview">
      <div className="flex flex-wrap items-start gap-4">
        {header.icon && <span className="text-5xl leading-none" aria-hidden="true">{header.icon}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-nav-accent">{t('title')}{header.kind === 'synthesis' ? ` · ${t('overview.synthesis')}` : ''}</p>
          <h1 className="mt-1 font-space text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl" data-memo-title><MathLabel>{header.title}</MathLabel></h1>
          {header.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600"><M>{header.description}</M></p>}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white bg-white/80 px-3 py-2 shadow-xs">
            <dt className="text-[11px] font-bold text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-extrabold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ── Objectifs + prérequis ───────────────────────────────────────────────────
export function MemoObjectives({ objectives, prerequisites }) {
  const { t } = useTranslation('memo');
  const { skills, knowledge, scope, unitObjectives } = objectives;
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Section id="memo-objectives" icon={Target} title={t('objectives.title')} lead={t('objectives.lead')} className="lg:col-span-2">
        <div className="grid gap-5 md:grid-cols-2">
          {skills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-nav-accent">{t('objectives.skills')}</h3>
              <ul className="space-y-1.5">{skills.map((s) => <li key={s} className="flex gap-2 text-sm text-slate-800"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-nav-accent" aria-hidden="true" /><span><M>{s}</M></span></li>)}</ul>
            </div>
          )}
          {knowledge.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-violet-800">{t('objectives.knowledge')}</h3>
              <ul className="space-y-1.5">
                {knowledge.map((b) => (
                  <li key={b.id} className="text-sm text-slate-800">
                    {b.type && <Pill className="me-1.5 bg-violet-100 text-violet-800">{t(`objectives.brickType.${b.type}`, { defaultValue: b.type })}</Pill>}
                    <M>{b.title}</M>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {(scope.include.length > 0 || scope.exclude.length > 0) && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {scope.include.length > 0 && (
              <div className="rounded-2xl bg-emerald-50 p-3">
                <h3 className="mb-1 text-xs font-extrabold text-emerald-800">✓ {t('objectives.include')}</h3>
                <ul className="space-y-1 text-sm text-slate-700">{scope.include.map((s) => <li key={s}><M>{s}</M></li>)}</ul>
              </div>
            )}
            {scope.exclude.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-3">
                <h3 className="mb-1 text-xs font-extrabold text-slate-600">✕ {t('objectives.exclude')}</h3>
                <ul className="space-y-1 text-sm text-slate-600">{scope.exclude.map((s) => <li key={s}><M>{s}</M></li>)}</ul>
              </div>
            )}
          </div>
        )}
        {unitObjectives.length > 0 && (
          <details className="mt-4 rounded-2xl border border-slate-200 p-3 text-sm">
            <summary className="cursor-pointer font-bold text-slate-700">{t('objectives.unit')}</summary>
            <ul className="mt-2 space-y-1 text-slate-600">{unitObjectives.map((o) => <li key={o}>• {o}</li>)}</ul>
          </details>
        )}
      </Section>

      <Section id="memo-prerequisites" icon={Compass} title={t('prerequisites.title')}>
        {prerequisites.lessons.length === 0 && prerequisites.notions.length === 0 ? (
          <p className="text-sm text-slate-500">{t('prerequisites.none')}</p>
        ) : (
          <div className="space-y-3">
            {prerequisites.notions.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-extrabold text-slate-500">{t('prerequisites.notions')}</h3>
                <ul className="flex flex-wrap gap-1.5">{prerequisites.notions.map((n) => <li key={n}><Pill className="bg-slate-100 text-slate-700">{n}</Pill></li>)}</ul>
              </div>
            )}
            {prerequisites.lessons.length > 0 && (
              <div>
                <h3 className="mb-1 text-xs font-extrabold text-slate-500">{t('prerequisites.lessons')}</h3>
                <ul className="space-y-1">{prerequisites.lessons.map((l) => <li key={l.id}><Link to={l.path} className="text-sm font-bold text-nav-accent hover:underline"><MathLabel>{l.title}</MathLabel></Link></li>)}</ul>
              </div>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Activité de départ ──────────────────────────────────────────────────────
export function MemoStart({ start }) {
  const { t } = useTranslation('memo');
  if (!start) return null;
  const phase = start.phase;
  const manipulations = phase?.manipulations ?? [];
  return (
    <Section id="memo-start" icon={Rocket} title={t('start.title')} lead={start.title ? `${mathToPlain(start.title)}${start.subtitle ? ` — ${start.subtitle}` : ''}` : null}>
      {manipulations.length > 0 && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border-2 border-indigo-200 bg-nav-accent-soft p-4" data-memo-start-manipulation>
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-indigo-900"><Puzzle className="h-4 w-4" aria-hidden="true" /> {t('start.manipulation')}</h3>
            <p className="mt-1 text-sm text-indigo-900/80">{t('start.manipulationLead')}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {manipulations.map((m) => (
                <li key={m.title}><Pill className="bg-white text-nav-accent">🧪 {m.level ? `${t(`timeline.level.${m.level}`)} · ` : ''}<M>{m.title}</M></Pill></li>
              ))}
            </ul>
          </div>
          {canPresentPath(phase?.path) && (
            <Link to={phase.path} state={CLASSROOM_START_STATE} className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border-2 border-nav-accent bg-nav-accent px-4 text-sm font-extrabold text-white hover:bg-[#3350c4] sa-memo-no-print">
              <GraduationCap className="h-5 w-5" aria-hidden="true" /> {t('start.present')}
            </Link>
          )}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {start.situation && (
            <div>
              <h3 className="mb-1 text-xs font-extrabold text-slate-500">{t('start.situation')} {start.page && <span className="font-semibold text-slate-400">· {t('start.page', { page: start.page })}</span>}</h3>
              <p className="rounded-2xl bg-slate-50 p-3 text-[15px] leading-7 text-slate-800"><M>{start.situation}</M></p>
            </div>
          )}
          {start.questions.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-extrabold text-slate-500">{t('start.questions')}</h3>
              <ol className="space-y-1.5">{start.questions.map((q) => <li key={q} className="flex gap-2 text-sm text-slate-800"><MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" /><span><M>{q}</M></span></li>)}</ol>
            </div>
          )}
          {start.hint && <p className="text-xs text-slate-500">💡 {t('start.hint')}: <M>{start.hint}</M></p>}
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <h3 className="mb-1 text-xs font-extrabold text-amber-900">{t('start.expected')}</h3>
            <p className="text-sm text-slate-700">{t('start.expectedText')}</p>
          </div>
          {start.closing && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <h3 className="mb-1 text-xs font-extrabold text-emerald-800">{t('start.transition')}</h3>
              <p className="text-sm text-slate-800"><M>{start.closing}</M></p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ── La ligne du temps ──────────────────────────────────────────────────────
function RoleBlock({ icon: Icon, label, children, className = '' }) {
  if (!children) return null;
  return (
    <div className={`rounded-2xl p-3 ${className}`}>
      <h4 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</h4>
      <div className="text-sm leading-relaxed text-slate-800">{children}</div>
    </div>
  );
}

export function MemoTimeline({ phases }) {
  const { t } = useTranslation('memo');
  if (phases.length === 0) return null;
  return (
    <Section id="memo-timeline" icon={Route} title={t('timeline.title')} lead={t('timeline.lead')}>
      {/* La frise compacte : où en est-on, d'un coup d'œil. */}
      <ol className="mb-6 flex gap-1 overflow-x-auto pb-1" aria-hidden="true">
        {phases.map((p) => (
          <li key={p.number} style={{ flexGrow: Math.max(1, p.minutes ?? 1) }} className="min-w-[3.5rem]">
            <a href={`#memo-phase-${p.number}`} className={`block rounded-xl px-2 py-1.5 text-center text-[11px] font-extrabold text-white ${toneOf(p.stage).dot}`}>
              {p.index} · {p.minutes ?? '–'}′
            </a>
          </li>
        ))}
      </ol>

      <ol className="relative space-y-6 border-s-4 border-slate-100 ps-6 sm:ps-8" data-memo-timeline>
        {phases.map((p) => {
          const tone = toneOf(p.stage);
          const stageKey = p.stage ? `stage.${p.stage}` : null;
          const moves = stageKey ? t(`${stageKey}.questions`, { returnObjects: true }) : [];
          const end = p.minutes != null ? p.startsAt + p.minutes : null;
          return (
            <li key={p.number} id={`memo-phase-${p.number}`} className="sa-memo-phase relative scroll-mt-28" data-memo-phase={p.number} data-memo-stage={p.stage}>
              <span className={`absolute -start-[2.35rem] top-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-extrabold text-white shadow sm:-start-[2.85rem] ${tone.dot}`} aria-hidden="true">
                {String(p.index).padStart(2, '0')}
              </span>
              <article className={`rounded-3xl border-2 ${tone.ring} bg-white p-4 sm:p-5`}>
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`flex flex-wrap items-center gap-2 text-xs font-extrabold ${tone.text}`}>
                      <span>{stageKey ? `${t(`${stageKey}.emoji`)} ${t(`${stageKey}.label`)}` : t('timeline.phase', { n: p.index })}</span>
                      <span className="text-slate-400">·</span>
                      <span>{t('timeline.module', { n: p.number })}</span>
                    </p>
                    <h3 className="mt-1 font-space text-lg font-bold text-slate-900"><M>{p.title}</M></h3>
                    {p.desc && <p className="mt-0.5 text-sm text-slate-600"><M>{p.desc}</M></p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {p.minutes != null && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold ${tone.soft} ${tone.text}`}>
                        <Clock className="h-4 w-4" aria-hidden="true" /> {t('overview.minutes', { count: p.minutes })}
                      </span>
                    )}
                    {end != null && <span className="text-[11px] font-semibold text-slate-400">{t('timeline.at', { from: p.startsAt, to: end })}</span>}
                    {canPresentPath(p.path) && (
                      <Link to={p.path} state={CLASSROOM_START_STATE} aria-label={t('timeline.presentAria', { n: p.number })} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-indigo-200 bg-white px-3 text-xs font-extrabold text-nav-accent hover:border-indigo-400 hover:bg-nav-accent-soft sa-memo-no-print">
                        <GraduationCap className="h-4 w-4" aria-hidden="true" /> {t('timeline.present')}
                      </Link>
                    )}
                  </div>
                </header>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <RoleBlock icon={GraduationCap} label={t('timeline.teacher')} className="bg-nav-page text-nav-accent">{stageKey && t(`${stageKey}.teacher`)}</RoleBlock>
                  <RoleBlock icon={Users} label={t('timeline.students')} className="bg-sky-50 text-sky-900">{stageKey && t(`${stageKey}.students`)}</RoleBlock>
                  <RoleBlock icon={Wrench} label={t('timeline.support')} className="bg-nav-accent-soft text-indigo-900">
                    {p.manipulations.length > 0 || p.otherResources.length > 0 ? (
                      <ul className="space-y-1">
                        {p.manipulations.map((m) => <li key={m.title}>🧪 {m.level ? <b>{t(`timeline.level.${m.level}`)} : </b> : null}<M>{m.title}</M></li>)}
                        {p.otherResources.map((r) => <li key={r.title}>📄 <M>{r.title}</M></li>)}
                      </ul>
                    ) : (stageKey && t(`${stageKey}.support`))}
                  </RoleBlock>
                  <RoleBlock icon={Target} label={t('timeline.intention')} className="bg-slate-50 text-slate-700">{stageKey && t(`${stageKey}.intention`)}</RoleBlock>
                </div>

                {(p.learningPoints.length > 0 || p.bricks.length > 0) && (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <h4 className="mb-1 text-xs font-extrabold text-emerald-800">🎯 {t('timeline.outcome')}</h4>
                    <ul className="space-y-1 text-sm text-slate-800">
                      {p.learningPoints.map((lp) => <li key={lp}>• <M>{lp}</M></li>)}
                      {p.bricks.map((b) => <li key={b.id} className="text-slate-600">⭐ <b><M>{b.title}</M></b>{b.summary ? <> — <M>{b.summary}</M></> : null}</li>)}
                    </ul>
                  </div>
                )}

                {(p.questions.length > 0 || (Array.isArray(moves) && moves.length > 0)) && (
                  <div className="mt-3">
                    <h4 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-slate-600"><MessageCircleQuestion className="h-4 w-4" aria-hidden="true" /> {t('timeline.questions')}</h4>
                    <ul className="space-y-1 text-sm text-slate-800">
                      {p.questions.map((q) => <li key={q}>❓ <M>{q}</M> <Pill className="bg-nav-accent-soft text-nav-accent">{t('questions.textbook')}</Pill></li>)}
                      {Array.isArray(moves) && moves.map((q) => <li key={q} className="text-slate-600">💬 {q}</li>)}
                    </ul>
                  </div>
                )}

                {p.vigilance.length > 0 && (
                  <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3" data-memo-vigilance>
                    <h4 className="mb-1 flex items-center gap-1.5 text-xs font-extrabold text-amber-900"><TriangleAlert className="h-4 w-4" aria-hidden="true" /> {t('timeline.vigilance')}</h4>
                    <ul className="space-y-1 text-sm text-slate-800">{p.vigilance.map((v) => <li key={v}>⚠️ <M>{v}</M></li>)}</ul>
                  </div>
                )}

                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <ArrowForward className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('timeline.transition')}: {p.next ? t('timeline.transitionTo', { n: p.next.number, title: p.next.title }) : t('timeline.end')}
                </p>
              </article>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

// ── Exemples ────────────────────────────────────────────────────────────────
export function MemoExamples({ examples }) {
  const { t } = useTranslation('memo');
  if (examples.length === 0) return null;
  return (
    <Section id="memo-examples" icon={Lightbulb} title={t('examples.title')} lead={t('examples.lead')}>
      <div className="grid gap-4 lg:grid-cols-2">
        {examples.map((ex) => (
          <article key={ex.id} className="rounded-2xl border border-slate-200 p-4" data-memo-example={ex.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-slate-500">{t('examples.problem')}</h3>
              <SourcePage source={ex.source} />
            </div>
            <p className="text-[15px] leading-7 text-slate-900"><M>{ex.statement}</M></p>
            {ex.explain && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3">
                <h4 className="mb-0.5 text-xs font-extrabold text-emerald-800">{t('examples.reasoning')}</h4>
                <p className="text-sm text-slate-800"><M>{ex.explain}</M></p>
              </div>
            )}
            {ex.commonError && (
              <div className="mt-2 rounded-xl bg-rose-50 p-3">
                <h4 className="mb-0.5 text-xs font-extrabold text-rose-800">{t('examples.mistake')}</h4>
                <p className="text-sm text-slate-800"><M>{ex.commonError}</M></p>
              </div>
            )}
            <div className="mt-2 rounded-xl bg-nav-page p-3">
              <h4 className="mb-0.5 text-xs font-extrabold text-nav-accent">{t('examples.intervention')}</h4>
              <p className="text-sm text-slate-800">{t('examples.askFirst')}</p>
              {ex.hint?.summary && <p className="mt-1 text-sm text-slate-700">{t('examples.interventionText', { title: ex.hint.title, summary: ex.hint.summary })}</p>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ── Erreurs ─────────────────────────────────────────────────────────────────
export function MemoErrors({ errors }) {
  const { t } = useTranslation('memo');
  return (
    <Section id="memo-errors" icon={TriangleAlert} title={t('errors.title')} lead={errors.length ? t('errors.lead') : null}>
      {errors.length === 0 ? <p className="text-sm text-slate-500">{t('errors.none')}</p> : (
        <ul className="space-y-3">
          {errors.map((ex) => (
            <li key={ex.id} className="grid gap-2 rounded-2xl border border-rose-100 bg-rose-50/40 p-3 md:grid-cols-[1.2fr_1fr]" data-memo-error={ex.id}>
              <div>
                <p className="text-sm font-bold text-rose-900">⚠️ <M>{ex.commonError}</M></p>
                <p className="mt-1 text-xs text-slate-500">{t('errors.where')}: <M>{ex.statement ?? ''}</M> <SourcePage source={ex.source} /></p>
              </div>
              <div className="space-y-1 text-sm">
                {ex.hint?.summary && <p className="text-nav-accent"><b>{t('errors.nudge')}:</b> {t('errors.nudgeText', { title: ex.hint.title, summary: ex.hint.summary })}</p>}
                {ex.explain && <p className="text-slate-700"><b>{t('errors.fix')}:</b> <M>{ex.explain}</M></p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ── Différenciation ─────────────────────────────────────────────────────────
export function MemoDifferentiation({ differentiation }) {
  const { t } = useTranslation('memo');
  const tiers = [
    ['support', '🟢', 'border-emerald-200 bg-emerald-50/50'],
    ['core', '🔵', 'border-sky-200 bg-sky-50/50'],
    ['extension', '🟣', 'border-violet-200 bg-violet-50/50'],
  ];
  const total = tiers.reduce((n, [k]) => n + differentiation[k].exercises.length + differentiation[k].manipulations.length, 0);
  if (total === 0) return null;
  return (
    <Section id="memo-differentiation" icon={Users} title={t('differentiation.title')}>
      <div className="grid gap-3 md:grid-cols-3">
        {tiers.map(([key, dot, cls]) => {
          const tier = differentiation[key];
          const empty = tier.exercises.length + tier.manipulations.length === 0;
          return (
            <div key={key} className={`rounded-2xl border-2 p-3 ${cls}`} data-memo-tier={key}>
              <h3 className="text-sm font-extrabold text-slate-900">{dot} {t(`differentiation.${key}`)}</h3>
              <p className="mb-2 text-xs text-slate-500">{t(`differentiation.${key}Lead`)}</p>
              {empty ? <p className="text-xs text-slate-400">{t('differentiation.empty')}</p> : (
                <ul className="space-y-1.5 text-sm text-slate-800">
                  {tier.manipulations.map((m) => <li key={m.title}>🧪 <M>{m.title}</M></li>)}
                  {tier.exercises.map((ex) => <li key={ex.id} className="leading-6">✏️ <M>{ex.statement}</M> <SourcePage source={ex.source} /></li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ── Trace / synthèse ────────────────────────────────────────────────────────
export function MemoTrace({ trace }) {
  const { t } = useTranslation('memo');
  if (!trace.observation && trace.bricks.length === 0) return null;
  return (
    <Section id="memo-trace" icon={BookOpenCheck} title={t('trace.title')} lead={t('trace.lead')}>
      <ol className="space-y-3">
        {trace.observation && (
          <li className="rounded-2xl bg-slate-50 p-3"><h3 className="text-xs font-extrabold text-slate-500">1 · {t('trace.observation')}</h3><p className="mt-1 text-sm text-slate-800"><M>{trace.observation}</M></p></li>
        )}
        {trace.bricks.length > 0 && (
          <li className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3">
            <h3 className="text-xs font-extrabold text-emerald-800">2 · {t('trace.formulation')}</h3>
            <ul className="mt-1 space-y-1.5">{trace.bricks.map((b) => <li key={b.id} className="text-sm text-slate-900">⭐ <b><M>{b.title}</M></b>{b.summary ? <> — <M>{b.summary}</M></> : null}</li>)}</ul>
          </li>
        )}
        {trace.warnings.length > 0 && (
          <li className="rounded-2xl bg-amber-50 p-3"><h3 className="text-xs font-extrabold text-amber-900">3 · {t('trace.warning')}</h3><ul className="mt-1 space-y-1 text-sm text-slate-800">{trace.warnings.map((w) => <li key={w}>⚠️ <M>{w}</M></li>)}</ul></li>
        )}
      </ol>
    </Section>
  );
}

// ── Évaluation ─────────────────────────────────────────────────────────────
export function MemoEvaluation({ evaluation }) {
  const { t } = useTranslation('memo');
  const { phase, oral, indicators, exitTicket } = evaluation;
  if (!phase && oral.length === 0 && indicators.length === 0 && !exitTicket) return null;
  return (
    <Section id="memo-evaluation" icon={Flag} title={t('evaluation.title')}>
      <div className="grid gap-4 lg:grid-cols-2">
        {oral.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-extrabold text-slate-800">🗣️ {t('evaluation.oral')}</h3>
            <ul className="space-y-2">{oral.map((q) => (
              <li key={q.title} className="rounded-xl border border-slate-200 p-2.5 text-sm">
                <p className="font-bold text-slate-900">{t('evaluation.oralPrompt', { title: q.title })}</p>
                <p className="mt-0.5 text-slate-600"><span className="font-bold text-emerald-700">{t('evaluation.oralAnswer')}:</span> <M>{q.answer}</M></p>
              </li>
            ))}</ul>
          </div>
        )}
        <div className="space-y-3">
          {indicators.length > 0 && (
            <div className="rounded-2xl bg-emerald-50 p-3">
              <h3 className="text-sm font-extrabold text-emerald-800">✅ {t('evaluation.indicators')}</h3>
              <p className="text-xs text-slate-500">{t('evaluation.indicatorsLead')}</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-800">{indicators.map((i) => <li key={i}>☐ <M>{i}</M></li>)}</ul>
            </div>
          )}
          {phase && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-slate-300 p-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">🎯 {t('evaluation.test')}</h3>
                <p className="text-sm text-slate-600">{t('evaluation.testLead', { title: phase.title, minutes: phase.minutes ?? '–' })}{phase.desc ? ` — ${mathToPlain(phase.desc)}` : ''}</p>
              </div>
              {canPresentPath(phase.path) && (
                <Link to={phase.path} state={CLASSROOM_START_STATE} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 border-nav-accent bg-nav-accent px-3 text-xs font-extrabold text-white hover:bg-[#3350c4] sa-memo-no-print">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" /> {t('timeline.present')}
                </Link>
              )}
            </div>
          )}
          {exitTicket && (
            <div className="rounded-2xl border-2 border-dashed border-nav-line p-3" data-memo-exit-ticket>
              <h3 className="text-sm font-extrabold text-nav-accent">🎟️ {t('evaluation.exitTicket')}</h3>
              <p className="text-xs text-slate-500">{t('evaluation.exitTicketLead')}</p>
              <p className="mt-1 text-sm text-slate-900"><M>{exitTicket.statement}</M> <SourcePage source={exitTicket.source} /></p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ── La suite ──────────────────────────────────────────────────────────────
export function MemoNext({ next }) {
  const { t } = useTranslation('memo');
  const LessonLink = ({ l }) => <Link to={l.path} className="font-bold text-nav-accent hover:underline"><MathLabel>{l.title}</MathLabel></Link>;
  return (
    <Section id="memo-next" icon={UserRound} title={t('next.title')}>
      <dl className="grid gap-3 text-sm md:grid-cols-2">
        <div className="rounded-2xl bg-nav-accent-soft p-3">
          <dt className="text-xs font-extrabold text-nav-accent">{t('next.nextLesson')}</dt>
          <dd className="mt-1">{next.nextLesson ? <LessonLink l={next.nextLesson} /> : <span className="text-slate-500">{t('next.none')}</span>}</dd>
        </div>
        {next.remediation.length > 0 && (
          <div className="rounded-2xl bg-amber-50 p-3">
            <dt className="text-xs font-extrabold text-amber-900">{t('next.remediation')}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-3">{next.remediation.map((l) => <LessonLink key={l.id} l={l} />)}</dd>
          </div>
        )}
        {next.dependents.length > 0 && (
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-xs font-extrabold text-slate-600">{t('next.dependents')}</dt>
            <dd className="mt-1 flex flex-wrap gap-x-3">{next.dependents.map((l) => <LessonLink key={l.id} l={l} />)}</dd>
          </div>
        )}
        {next.assignable > 0 && (
          <div className="rounded-2xl bg-nav-page p-3">
            <dt className="text-xs font-extrabold text-nav-accent">{t('next.assignable')}</dt>
            <dd className="mt-1 text-slate-700">{t('next.assignableText', { count: next.assignable })}</dd>
          </div>
        )}
      </dl>
    </Section>
  );
}
